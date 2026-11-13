from fastapi import APIRouter
router = APIRouter()
@router.get("/health")
def photo_health():
    return {"status": "placeholder", "message": "Photo analysis is not implemented."}
