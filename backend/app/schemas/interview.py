from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace


class Interviewer(BaseModel):
    id: str
    name: str
    role: str
    focus: str = ""


class Interview(BaseModel):
    id: str
    candidateId: str = ""
    candidate: str
    interviewer: str
    round: str
    time: str
    status: str = "Created"


class InterviewQuestion(BaseModel):
    difficulty: str
    question: str
    signal: str


class InterviewPlan(BaseModel):
    candidate: str
    role: str
    questions: list[InterviewQuestion] = Field(default_factory=list)


class ScheduleEntities(BaseModel):
    candidate: str
    interviewer: str
    round: str
    durationMinutes: int = 45
    foundSlots: list[str] = Field(default_factory=list)
    candidatePreference: str = ""
    recommendedSlot: str
    scheduledAt: str = ""
    time: str = ""


class ScheduleRequest(BaseModel):
    command: Optional[str] = None


class SchedulePreviewResponse(BaseModel):
    command: str
    extractedEntities: ScheduleEntities
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
    message: str = "Scheduling entities extracted"


class ScheduleConfirmResponse(BaseModel):
    command: str
    extractedEntities: ScheduleEntities
    interview: Interview
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
    message: str = "Interview created automatically"


class QuestionRequest(BaseModel):
    candidateId: Optional[str] = None
