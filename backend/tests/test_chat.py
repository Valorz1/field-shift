import httpx
from fastapi.testclient import TestClient

from app.ai import guardrails
from app.main import app
from app.routers import chat, strategies

client = TestClient(app)


def _use_csv(make_csv, monkeypatch):
    path = make_csv(name="power_norfolk_monthly.csv", temp_recent=11.0, rain_recent=40.0)
    monkeypatch.setattr(strategies, "DATA_DIR", path.parent)


def test_chat_sends_farm_data_and_level_rules(make_csv, monkeypatch):
    _use_csv(make_csv, monkeypatch)
    seen = {}

    def fake_chat(messages, **_):
        seen["messages"] = messages
        return "Your farm got warmer. Summers were drier."

    monkeypatch.setattr(chat.client, "chat", fake_chat)
    body = client.post("/chat/", json={"message": "Is it getting drier?", "level": 1,
                                       "farm": {"demo": "norfolk"}}).json()
    assert body["reply"] == "Your farm got warmer. Summers were drier."
    assert body["label"] == "ai" and body["level"] == 1
    system, user = seen["messages"][0]["content"], seen["messages"][1]["content"]
    assert "advice only" in system and "never make" in system
    assert "Is it getting drier?" in user and '"plans"' in user and "wheat" in user


def test_long_answers_are_cut_to_two_sentences(make_csv, monkeypatch):
    _use_csv(make_csv, monkeypatch)
    monkeypatch.setattr(chat.client, "chat", lambda m, **_: "**One.** Two.\n- Three. Four.")
    body = client.post("/chat/", json={"message": "hi", "farm": {"demo": "norfolk"}}).json()
    assert body["reply"] == "One. Two."


def test_model_not_running_gives_friendly_503(make_csv, monkeypatch):
    _use_csv(make_csv, monkeypatch)

    def down(*_, **__):
        raise httpx.ConnectError("refused")

    monkeypatch.setattr(chat.client, "chat", down)
    response = client.post("/chat/", json={"message": "hi", "farm": {"demo": "norfolk"}})
    assert response.status_code == 503 and "Ollama" in response.json()["detail"]


def test_farm_must_be_demo_or_full_location():
    response = client.post("/chat/", json={"message": "hi", "farm": {"latitude": 52.6}})
    assert response.status_code == 422


def test_level_must_be_1_to_3():
    response = client.post("/chat/", json={"message": "hi", "level": 4, "farm": {"demo": "norfolk"}})
    assert response.status_code == 422


def test_clean_reply_limits_length():
    assert guardrails.clean_reply("A. B. C.") == "A. B."
    assert len(guardrails.clean_reply("word " * 200)) <= guardrails.MAX_CHARS + 1


def test_client_turns_off_thinking_and_retries_when_out_of_room(monkeypatch):
    from app.ai import client as ai_client

    calls = []

    class Resp:
        def __init__(self, data, status=200, text=""):
            self._data, self.status_code, self.text = data, status, text

        def raise_for_status(self):
            pass

        def json(self):
            return self._data

    def fake_post(url, json, timeout):
        calls.append(json)
        if len(calls) == 1:  # all tokens spent thinking, no answer
            return Resp({"message": {"content": "", "thinking": "..."}, "done_reason": "length"})
        return Resp({"message": {"content": "Summers were drier."}, "done_reason": "stop"})

    monkeypatch.setattr(ai_client.httpx, "post", fake_post)
    assert ai_client.chat([{"role": "user", "content": "hi"}]) == "Summers were drier."
    assert calls[0]["think"] is False
    assert calls[1]["options"]["num_predict"] > calls[0]["options"]["num_predict"]


def test_client_drops_think_for_models_without_it(monkeypatch):
    from app.ai import client as ai_client

    calls = []

    class Resp:
        def __init__(self, status, data=None, text=""):
            self.status_code, self._data, self.text = status, data or {}, text

        def raise_for_status(self):
            pass

        def json(self):
            return self._data

    def fake_post(url, json, timeout):
        calls.append(json)
        if "think" in json:
            return Resp(400, text='{"error":"model does not support thinking"}')
        return Resp(200, {"message": {"content": "Answer."}, "done_reason": "stop"})

    monkeypatch.setattr(ai_client.httpx, "post", fake_post)
    assert ai_client.chat([{"role": "user", "content": "hi"}]) == "Answer."
    assert "think" not in calls[-1]


def test_numbers_are_rounded_for_farmers(make_csv, monkeypatch):
    _use_csv(make_csv, monkeypatch)
    seen = {}
    monkeypatch.setattr(chat.client, "chat", lambda m, **_: seen.setdefault("user", m[1]["content"]) and "Ok.")
    client.post("/chat/", json={"message": "hi", "farm": {"demo": "norfolk"}})
    assert '"change_pct": "-20 %"' in seen["user"]  # whole percent, no decimals
