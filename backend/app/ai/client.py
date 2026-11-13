"""Client stub for an OpenAI-compatible or Ollama local model endpoint."""
import os
import httpx

MODEL_BASE_URL = os.getenv("MODEL_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma")

async def generate(prompt: str) -> str:
    # Adapt this request to the selected local runner's API.
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{MODEL_BASE_URL.rstrip('/')}/api/generate",
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        data = response.json()
        return str(data.get("response", "")).strip()
