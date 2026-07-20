"""Celery worker for long-running hiring crew jobs."""

from __future__ import annotations

import asyncio

from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "hireflow",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)


@celery_app.task(name="hireflow.run_hiring_command", bind=True, max_retries=2)
def run_hiring_command(self, intent: str) -> dict:
    from app.agents.orchestrator import orchestrator

    try:
        return asyncio.run(orchestrator.run_hiring_os(intent))
    except Exception as exc:  # noqa: BLE001
        raise self.retry(exc=exc, countdown=2) from exc
