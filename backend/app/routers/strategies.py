from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def strategies():
    return {"items": [], "status": "no_strategy_catalog_loaded"}
