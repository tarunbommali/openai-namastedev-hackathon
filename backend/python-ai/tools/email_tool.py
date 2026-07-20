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


class Input(BaseModel):
    to_name: str
    role: str
    interviewer: str
    slot: str
    round_name: str = "Technical Round 1"


class EmailTool(BaseTool):
    name: str = "email_tool"
    description: str = "Draft interview / offer outreach email JSON."
    args_schema: Type[BaseModel] = Input

    def _run(self, to_name: str, role: str, interviewer: str, slot: str, round_name: str = "Technical Round 1") -> str:
        return json.dumps({
            "subject": f"Technical interview invitation for {role}",
            "body": f"Hi {to_name}, {interviewer} would like to meet for {round_name} on {slot}.",
        })
