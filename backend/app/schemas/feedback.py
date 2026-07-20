from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace
from app.schemas.decision import HiringDecision


class FeedbackAnalysis(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    cultureFit: str = ""
    technicalScore: float = 0
    communicationScore: float = 0
    summary: str = ""


class FeedbackRecord(BaseModel):
    id: str
    interviewId: Optional[str] = None
    candidate: str
    interviewer: str
    feedbackText: str
    recommendation: HiringDecision
    analysis: Optional[FeedbackAnalysis] = None
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)


class FeedbackRequest(BaseModel):
    feedbackText: Optional[str] = None
    interviewId: Optional[str] = None
