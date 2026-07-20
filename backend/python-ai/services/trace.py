from __future__ import annotations
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from schemas.contracts import AgentTrace

_store: list[dict[str, Any]] = []
_by_execution: dict[str, list[dict[str, Any]]] = {}
_current_execution: str | None = None


def _iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def summarize(output: Any) -> str:
    if isinstance(output, dict):
        if output.get("skills"):
            return f"{len(output['skills'])} skills extracted"
        if output.get("rankings"):
            return f"{len(output['rankings'])} candidates ranked"
        if output.get("questions"):
            return f"{len(output['questions'])} questions generated"
        if output.get("recommendedSlot"):
            return f"recommended {output['recommendedSlot']}"
        if output.get("recommendation"):
            return f"{output['recommendation']} ({output.get('confidence')}%)"
        if output.get("subject"):
            return f"drafted: {output['subject'][:60]}"
    return "structured JSON produced"


def start_execution() -> str:
    global _current_execution
    execution_id = f"exec-{uuid.uuid4().hex[:12]}"
    _current_execution = execution_id
    _by_execution[execution_id] = []
    return execution_id


def append_trace(
    *,
    agent: str,
    model: str,
    task: str,
    input_data: Any,
    output: Any = None,
    status: str = "completed",
    mode: str = "live",
    started: Optional[float] = None,
    tokens: Optional[int] = None,
    error: Optional[str] = None,
    execution_id: Optional[str] = None,
) -> AgentTrace:
    end = time.perf_counter()
    start = started or end
    duration_ms = int((end - start) * 1000)
    now = datetime.now(timezone.utc)
    started_at = datetime.fromtimestamp(now.timestamp() - duration_ms / 1000, tz=timezone.utc)
    preview = input_data if isinstance(input_data, str) else str(input_data)
    exec_id = execution_id or _current_execution
    trace = AgentTrace(
        id=f"trace-{int(time.time()*1000)}-{uuid.uuid4().hex[:6]}",
        agent=agent,
        model=model,
        status=status,
        mode=mode,
        startedAt=started_at.isoformat().replace("+00:00", "Z"),
        completedAt=_iso(),
        durationMs=max(duration_ms, 0),
        inputPreview=preview[:180],
        outputSummary=summarize(output),
        task=task,
        tokens=tokens,
        error=error,
    )
    payload = trace.model_dump()
    if exec_id:
        payload["executionId"] = exec_id
        bucket = _by_execution.setdefault(exec_id, [])
        bucket.insert(0, payload)
        _by_execution[exec_id] = bucket[:100]
    _store.insert(0, payload)
    _store[:] = _store[:200]
    return trace


def get_traces(limit: int = 50, execution_id: Optional[str] = None) -> list[dict]:
    if execution_id:
        return list(_by_execution.get(execution_id, [])[:limit])
    if _current_execution and _current_execution in _by_execution:
        return list(_by_execution[_current_execution][:limit])
    return list(_store[:limit])


def get_execution_bundle(execution_id: str) -> dict:
    return {"executionId": execution_id, "traces": get_traces(100, execution_id)}
