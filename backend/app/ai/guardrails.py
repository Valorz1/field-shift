"""Output limits for the AI helper. These back up the prompt; they do not replace testing."""
import re

MAX_SENTENCES = 2
MAX_CHARS = 320


def validate_level(level: int) -> int:
    if level not in (1, 2, 3):
        raise ValueError("AI level must be 1, 2, or 3")
    return level


def enforce_reply_length(reply: str, max_lines: int = 2) -> str:
    lines = [line.strip() for line in reply.splitlines() if line.strip()]
    return "\n".join(lines[:max_lines])


def clean_reply(reply: str) -> str:
    """Plain text, at most 2 sentences and MAX_CHARS characters."""
    text = re.sub(r"[*_#`>]+", "", reply)                 # markdown symbols
    text = re.sub(r"^\s*[-•\d.)]+\s+", "", text, flags=re.M)  # list markers
    text = " ".join(text.split())                           # one line, single spaces
    sentences = re.split(r"(?<=[.!?])\s+", text)
    text = " ".join(sentences[:MAX_SENTENCES]).strip()
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return text
