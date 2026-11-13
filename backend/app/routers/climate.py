from fastapi import APIRouter
from app.schemas import LocationRequest
router = APIRouter()
@router.post("/")
def climate(payload: LocationRequest):
    return {"status": "not_configured", "message": "Connect NASA POWER / GPM IMERG services.", "location": payload.model_dump()}
