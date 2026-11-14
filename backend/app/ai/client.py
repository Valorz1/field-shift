"""Talks to the local Gemma model through Ollama (http://localhost:11434 by default)."""
import os

import httpx

MODEL_BASE_URL = os.getenv("MODEL_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma4:e4b")


def chat(messages: list[dict], max_tokens: int = 160, timeout: float = 120) -> str:
    """Send a chat to the local model and return its reply text (never its hidden thinking)."""
    body = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        # Thinking is off: short answers don't need it, and it can use up the whole
        # token budget before any answer is written.
        "think": False,
        # Low temperature: steady, factual answers. num_predict caps the length.
        "options": {"temperature": 0.3, "num_predict": max_tokens},
    }
    data = _post(body, timeout)
    content = _content(data)
    if not content and data.get("done_reason") == "length":
        # Ran out of room before answering: try once more with more room.
        body["options"]["num_predict"] = max_tokens * 4
        content = _content(_post(body, timeout))
    return content


def _post(body: dict, timeout: float) -> dict:
    url = f"{MODEL_BASE_URL.rstrip('/')}/api/chat"
    response = httpx.post(url, json=body, timeout=timeout)
    if response.status_code == 400 and "think" in response.text.lower():
        # Models without a thinking mode reject the "think" option.
        body = {k: v for k, v in body.items() if k != "think"}
        response = httpx.post(url, json=body, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _content(data: dict) -> str:
    return str(data.get("message", {}).get("content", "")).strip()
