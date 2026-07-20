from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings
from app.services.logger import agent_logger

router = APIRouter()


@router.get("/health")
@router.get("/api/health")
async def health():
    settings = get_settings()
    return {
        "ok": True,
        "app": "HireFlow AI",
        "version": "2.0.0",
        "mode": "live" if settings.has_openai else "demo",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


@router.get("/agents/logs")
@router.get("/api/agents/logs")
async def agent_logs():
    return agent_logger.get_logs()
