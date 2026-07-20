from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace


class OfferDraft(BaseModel):
    subject: str
    body: str


class InterviewerBrief(BaseModel):
    candidate: str
    strengths: list[str] = Field(default_factory=list)
    potentialConcerns: list[str] = Field(default_factory=list)
    recommendedFocusAreas: list[str] = Field(default_factory=list)


class OfferRequest(BaseModel):
    candidateId: Optional[str] = None
    command: Optional[str] = None
    intent: Optional[str] = None


class OfferResponse(BaseModel):
    outreachDraft: OfferDraft
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
