"""Email drafting / send simulation tool for Offer Agent."""

from __future__ import annotations

import json
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field


class EmailInput(BaseModel):
    to_name: str = Field(..., description="Candidate name")
    role: str = Field(..., description="Job title")
    interviewer: str = Field(..., description="Interviewer name")
    slot: str = Field(..., description="Recommended interview slot")
    round_name: str = Field(default="Technical Round 1", description="Interview round")


class EmailTool(BaseTool):
    name: str = "email_tool"
    description: str = (
        "Draft a professional interview / offer outreach email. "
        "Does not send external mail in demo mode; returns subject + body JSON."
    )
    args_schema: Type[BaseModel] = EmailInput

    def _run(
        self,
        to_name: str,
        role: str,
        interviewer: str,
        slot: str,
        round_name: str = "Technical Round 1",
    ) -> str:
        subject = f"Technical interview invitation for {role}"
        body = (
            f"Hi {to_name},\n\n"
            f"{interviewer} would like to meet you for {round_name} on {slot}. "
            f"Please reply with confirmation or an alternate time that works for you.\n\n"
            f"Best regards,\nHireFlow Recruiting"
        )
        return json.dumps({"subject": subject, "body": body, "status": "drafted"})
