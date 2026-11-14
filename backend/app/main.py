from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import climate, soil, strategies, chat, photo

app = FastAPI(title="Field Shift API", version="0.1.0")

# Let the Next.js frontend (port 3000) call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(climate.router, prefix="/climate", tags=["climate"])
app.include_router(soil.router, prefix="/soil", tags=["soil"])
app.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(photo.router, prefix="/photo", tags=["photo"])


@app.get("/health")
def health():
    return {"status": "ok"}