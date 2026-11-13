from fastapi import APIRouter
from pydantic import BaseModel
router = APIRouter()
class ChatRequest(BaseModel):
    message: str
    level: int = 1
@router.post("/")
def chat(payload: ChatRequest):
    return {"reply": "The local model is not connected yet.", "level": payload.level}
