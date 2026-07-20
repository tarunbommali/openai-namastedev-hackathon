from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace


class HiringDecision(BaseModel):
    recommendation: str
    reason: str
    confidence: float
    # Extended CrewAI fields (frontend ignores extras)
    decision: Optional[Literal["Hire", "Reject", "Hold"]] = None
    reasoning: Optional[str] = None


class DecisionRequest(BaseModel):
    feedbackText: Optional[str] = None
    candidateId: Optional[str] = None
    interviewId: Optional[str] = None


class DecisionResponse(BaseModel):
    decision: HiringDecision
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
