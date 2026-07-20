from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class ParsedResume(BaseModel):
    name: str
    skills: list[str] = Field(default_factory=list)
    experienceYears: float = 0
    seniority: str = "Mid"
    domain: str = "General"
    education: str = ""
    achievements: list[str] = Field(default_factory=list)
    roleSignals: list[str] = Field(default_factory=list)
    relevantProjects: list[str] = Field(default_factory=list)
    hallucinationFlag: bool = False
    unverifiedSkills: list[str] = Field(default_factory=list)
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class CandidateRanking(BaseModel):
    id: str
    name: str
    matchScore: float
    confidence: float
    strengths: list[str] = Field(default_factory=list)
    explanation: str = ""
    explainability: str = Field(default="", description="Human-understandable score justification for compliance audit")
    gaps: list[str] = Field(default_factory=list)
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class RankingResult(BaseModel):
    rankings: list[CandidateRanking] = Field(default_factory=list)


class InterviewQuestion(BaseModel):
    difficulty: str
    question: str
    signal: str = ""


class InterviewPlan(BaseModel):
    candidate: str
    role: str
    questions: list[InterviewQuestion] = Field(default_factory=list)
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


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
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class FeedbackAnalysis(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    cultureFit: str = ""
    technicalScore: float = 0
    communicationScore: float = 0
    summary: str = ""
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class HiringDecision(BaseModel):
    recommendation: str
    reason: str
    confidence: float
    decision: Optional[Literal["Hire", "Reject", "Hold"]] = None
    explainability: str = Field(default="", description="Compliance explainability verdict")
    requiresHumanApproval: bool = True
    approvedByRecruiter: bool = False
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class OfferDraft(BaseModel):
    subject: str
    body: str
    inputEvidence: dict[str, Any] = Field(default_factory=dict)


class InterviewerBrief(BaseModel):
    candidate: str
    strengths: list[str] = Field(default_factory=list)
    potentialConcerns: list[str] = Field(default_factory=list)
    recommendedFocusAreas: list[str] = Field(default_factory=list)


class AgentTrace(BaseModel):
    id: str
    agent: str
    model: str
    status: str = "completed"
    mode: str = "live"
    startedAt: str
    completedAt: str
    durationMs: int
    inputPreview: str = ""
    outputSummary: str = ""
    task: Optional[str] = None
    tokens: Optional[int] = None
    error: Optional[str] = None
    inputEvidence: dict[str, Any] = Field(default_factory=dict)
    explainability: Optional[str] = None


class ParseResumeRequest(BaseModel):
    resumeText: str
    job: Optional[dict[str, Any]] = None
    candidates: Optional[list[dict[str, Any]]] = None
    scoringWeights: Optional[dict[str, float]] = None


class CommandRequest(BaseModel):
    intent: str
    job: Optional[dict[str, Any]] = None
    candidates: Optional[list[dict[str, Any]]] = None
    scoringWeights: Optional[dict[str, float]] = None

