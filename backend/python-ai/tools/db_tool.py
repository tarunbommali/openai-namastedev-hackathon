from __future__ import annotations
import json
from typing import Type
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except Exception:  # noqa: BLE001
    class BaseTool:  # type: ignore
        name = ""
        description = ""
        args_schema = None
        def __init__(self, **kwargs): self.__dict__.update(kwargs)

# Request-scoped context injected by API layer
_CONTEXT: dict = {"job": {}, "candidates": []}


def set_context(job: dict | None = None, candidates: list | None = None) -> None:
    if job is not None:
        _CONTEXT["job"] = job
    if candidates is not None:
        _CONTEXT["candidates"] = candidates


class Input(BaseModel):
    collection: str = Field(..., description="job | candidates")


class DatabaseTool(BaseTool):
    name: str = "database_tool"
    description: str = "Read job or candidate records from request context."
    args_schema: Type[BaseModel] = Input

    def _run(self, collection: str) -> str:
        if collection == "job":
            return json.dumps(_CONTEXT.get("job") or {})
        return json.dumps(_CONTEXT.get("candidates") or [])
