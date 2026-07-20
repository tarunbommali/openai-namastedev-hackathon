from __future__ import annotations
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
os.environ.setdefault("CREWAI_STORAGE_DIR", str(ROOT / ".crewai_storage"))
(ROOT / ".crewai_storage").mkdir(exist_ok=True)

from api.v1 import router as v1_router
from config import get_settings

settings = get_settings()
app = FastAPI(title="HireFlow Python AI", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(v1_router)


@app.get("/")
def root():
    return {"service": "hireflow-python-ai", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
