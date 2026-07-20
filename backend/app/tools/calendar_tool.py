"""Calendar / slot discovery tool for the Scheduler Agent."""

from __future__ import annotations

import json
import re
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field


DEFAULT_SLOTS = [
    "Tuesday 11:00 AM",
    "Wednesday 2:30 PM",
    "Thursday 10:00 AM",
    "Friday 4:00 PM",
]


class CalendarInput(BaseModel):
    command: str = Field(..., description="Natural language scheduling command")
    interviewer: str = Field(default="Rahul Sharma", description="Preferred interviewer")


class CalendarTool(BaseTool):
    name: str = "calendar_tool"
    description: str = (
        "Find available interview slots from a natural-language scheduling command "
        "and return interviewer + recommended slot."
    )
    args_schema: Type[BaseModel] = CalendarInput

    def _run(self, command: str, interviewer: str = "Rahul Sharma") -> str:
        normalized = command.lower()
        duration_match = re.search(r"(\d+)\s*(?:minute|min)", normalized)
        duration = int(duration_match.group(1)) if duration_match else 45
        explicit = re.search(
            r"(tomorrow|monday|tuesday|wednesday|thursday|friday)\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)",
            normalized,
            re.I,
        )
        if explicit:
            recommended = (
                f"{explicit.group(1).capitalize()} {explicit.group(2)}:"
                f"{explicit.group(3) or '00'} {explicit.group(4).upper()}"
            )
            slots = [recommended, *DEFAULT_SLOTS]
        else:
            recommended = DEFAULT_SLOTS[1]
            slots = DEFAULT_SLOTS

        return json.dumps(
            {
                "interviewer": interviewer,
                "durationMinutes": duration,
                "foundSlots": slots,
                "recommendedSlot": recommended,
                "timezone": "Asia/Kolkata",
            }
        )
