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

from services.fallbacks import schedule


class Input(BaseModel):
    command: str


class CalendarTool(BaseTool):
    name: str = "calendar_tool"
    description: str = "Find interview slots from a natural-language command."
    args_schema: Type[BaseModel] = Input

    def _run(self, command: str) -> str:
        return schedule(command).model_dump_json()
