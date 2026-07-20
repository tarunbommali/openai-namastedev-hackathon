from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import AgentTrace


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
    technologies: list[str] = Field(default_factory=list)
    leadership: list[str] = Field(default_factory=list)


class ResumeParseRequest(BaseModel):
    resumeText: Optional[str] = None


class ResumeParseResponse(BaseModel):
    parsedResume: ParsedResume
    rankings: list[dict] = Field(default_factory=list)
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
    message: str = "Resume parsed and candidates ranked"
