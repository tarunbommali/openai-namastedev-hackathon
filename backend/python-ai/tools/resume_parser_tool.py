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

from services.fallbacks import parse_resume


class Input(BaseModel):
    resume_text: str = Field(...)


class ResumeParserTool(BaseTool):
    name: str = "resume_parser_tool"
    description: str = "Parse resume text into structured recruiting JSON."
    args_schema: Type[BaseModel] = Input

    def _run(self, resume_text: str) -> str:
        return parse_resume(resume_text).model_dump_json()
