"""Lightweight output constraints; not a substitute for model evaluation."""
def enforce_reply_length(reply: str, max_lines: int = 2) -> str:
    lines = [line.strip() for line in reply.splitlines() if line.strip()]
    return "\n".join(lines[:max_lines])

def validate_level(level: int) -> int:
    if level not in (1, 2, 3):
        raise ValueError("AI level must be 1, 2, or 3")
    return level
