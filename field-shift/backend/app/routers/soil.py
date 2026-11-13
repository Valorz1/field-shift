from fastapi import APIRouter
from app.schemas import LocationRequest
router = APIRouter()
@router.post("/")
def soil(payload: LocationRequest):
    return {"status": "not_configured", "message": "Connect NASA SMAP service.", "location": payload.model_dump()}
