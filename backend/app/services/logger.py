"""Structured agent execution logging — contract matches the React timeline."""

from __future__ import annotations

import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.config import get_settings
from app.schemas.common import AgentTrace


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def summarize_output(output: Any) -> str:
    if output is None:
        return "no output"
    if isinstance(output, dict):
        if output.get("rankings"):
            return f"{len(output['rankings'])} candidates ranked"
        if output.get("questions"):
            return f"{len(output['questions'])} interview questions generated"
        if output.get("recommendedSlot"):
            return f"recommended {output['recommendedSlot']}"
        if output.get("recommendation"):
            return f"{output['recommendation']} ({output.get('confidence', '?')}% confidence)"
        if output.get("skills"):
            return f"{len(output['skills'])} skills extracted"
        if output.get("subject"):
            return f"drafted outreach: {output['subject'][:60]}"
        if output.get("strengths") and output.get("weaknesses") is not None:
            return "feedback analyzed into hiring signals"
    return "structured JSON produced"


class AgentLogger:
    """Thread-safe ring buffer of agent traces."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._logs: list[AgentTrace] = []

    def append(
        self,
        *,
        agent: str,
        model: str,
        input_data: Any,
        output: Any = None,
        status: str = "completed",
        mode: str = "live",
        started_at: Optional[datetime] = None,
        error: Optional[Exception | str] = None,
        task: Optional[str] = None,
        tokens: Optional[int] = None,
        duration_ms: Optional[int] = None,
    ) -> AgentTrace:
        settings = get_settings()
        completed = _utcnow()
        started = started_at or completed
        if duration_ms is None:
            duration_ms = max(0, int((completed - started).total_seconds() * 1000))

        if isinstance(input_data, str):
            preview = input_data[:180]
        else:
            preview = str(input_data)[:180]

        err_msg = None
        if error is not None:
            err_msg = error if isinstance(error, str) else str(error)

        trace = AgentTrace(
            id=f"trace-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
            agent=agent,
            model=model,
            status=status,  # type: ignore[arg-type]
            mode=mode,  # type: ignore[arg-type]
            startedAt=_iso(started),
            completedAt=_iso(completed),
            durationMs=duration_ms,
            inputPreview=preview,
            outputSummary=summarize_output(output),
            error=err_msg,
            task=task,
            tokens=tokens,
        )

        with self._lock:
            self._logs.insert(0, trace)
            if len(self._logs) > settings.agent_log_max:
                self._logs = self._logs[: settings.agent_log_max]
        return trace

    def append_synthetic(
        self,
        agent_name: str,
        model: str,
        input_text: str,
        output_summary: str,
        duration_ms: int = 650,
        mode: str = "orchestrated",
    ) -> AgentTrace:
        completed = _utcnow()
        started = datetime.fromtimestamp(completed.timestamp() - duration_ms / 1000, tz=timezone.utc)
        trace = AgentTrace(
            id=f"trace-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
            agent=agent_name,
            model=model,
            status="completed",
            mode=mode,  # type: ignore[arg-type]
            startedAt=_iso(started),
            completedAt=_iso(completed),
            durationMs=duration_ms,
            inputPreview=input_text[:180],
            outputSummary=output_summary,
        )
        with self._lock:
            self._logs.insert(0, trace)
            settings = get_settings()
            if len(self._logs) > settings.agent_log_max:
                self._logs = self._logs[: settings.agent_log_max]
        return trace

    def get_logs(self) -> list[dict]:
        with self._lock:
            return [t.model_dump() for t in self._logs]

    def clear(self) -> None:
        with self._lock:
            self._logs.clear()


agent_logger = AgentLogger()
