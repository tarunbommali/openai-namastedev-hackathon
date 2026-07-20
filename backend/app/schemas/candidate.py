from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace
from app.schemas.resume import ParsedResume


class Candidate(BaseModel):
    id: str
    name: str
    email: str = ""
    status: str = "Ranked"
    resumeText: str = ""
    parsedResume: Optional[ParsedResume] = None
    matchScore: float = 0
    confidence: float = 0
    explanation: str = ""
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)


class CandidateRanking(BaseModel):
    id: str
    name: str
    matchScore: float
    confidence: float
    strengths: list[str] = Field(default_factory=list)
    explanation: str = ""
    gaps: list[str] = Field(default_factory=list)


class RankingResult(BaseModel):
    rankings: list[CandidateRanking] = Field(default_factory=list)


class SemanticMatch(BaseModel):
    id: str
    name: str
    similarity: float
    strongOverlap: list[str] = Field(default_factory=list)


class MatchRequest(BaseModel):
    intent: Optional[str] = None
    resumeText: Optional[str] = None
    candidateId: Optional[str] = None


class MatchResponse(BaseModel):
    matches: list[SemanticMatch] = Field(default_factory=list)
    rankings: list[CandidateRanking] = Field(default_factory=list)
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
