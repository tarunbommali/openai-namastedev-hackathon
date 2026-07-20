"""HireFlow AI — FastAPI entrypoint backed by CrewAI."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.api import build_api_router
from app.config import get_settings
from app.services.candidate_service import rebuild_vector_index
from app.services.database import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hireflow")


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    logging.getLogger().setLevel(settings.log_level.upper())
    await db.connect()
    try:
        count = await rebuild_vector_index()
        logger.info("FAISS index ready (%s documents)", count)
    except Exception as exc:  # noqa: BLE001
        logger.warning("FAISS index build skipped: %s", exc)
    mode = "live" if settings.has_openai else "demo"
    logger.info("HireFlow AI v%s starting in %s mode on port %s", __version__, mode, settings.port)
    yield
    await db.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        description="CrewAI multi-agent autonomous hiring platform",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(build_api_router())

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        logger.exception("Unhandled API error: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "Unable to complete the hiring workflow. Please try again."},
        )

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=settings.app_env == "development")
