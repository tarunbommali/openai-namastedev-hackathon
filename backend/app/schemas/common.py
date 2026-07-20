"""Shared API contracts kept compatible with the HireFlow React client."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class Job(BaseModel):
    id: str
    title: str
    location: str
    team: str
    summary: str
    requirements: list[str] = Field(default_factory=list)


class AgentTrace(BaseModel):
    id: str
    agent: str
    model: str
    status: Literal["completed", "fallback", "running", "queued", "failed"] = "completed"
    mode: Literal["live", "demo", "error", "orchestrated"] = "live"
    startedAt: str
    completedAt: str
    durationMs: int
    inputPreview: str = ""
    outputSummary: str = ""
    error: Optional[str] = None
    task: Optional[str] = None
    tokens: Optional[int] = None


class GraphNode(BaseModel):
    id: str
    label: str
    status: Literal["idle", "running", "completed", "fallback", "failed"] = "idle"


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str


class AgentExecutionGraph(BaseModel):
    """Optional server-side React Flow payload. Frontend still builds its own DAG."""

    nodes: list[GraphNode]
    edges: list[GraphEdge]


class HealthResponse(BaseModel):
    ok: bool = True
    app: str = "HireFlow AI"
    version: str = "2.0.0"
    mode: Literal["live", "demo"] = "demo"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class CommandRequest(BaseModel):
    intent: Optional[str] = None
    resumeText: Optional[str] = None
    command: Optional[str] = None
    feedbackText: Optional[str] = None
    candidateId: Optional[str] = None
    interviewId: Optional[str] = None


class CommandResponse(BaseModel):
    intent: str
    completedActions: list[str]
    semanticMatches: list[dict[str, Any]]
    rankings: list[dict[str, Any]]
    interviewPlan: dict[str, Any]
    scheduling: dict[str, Any]
    interviewerBrief: dict[str, Any]
    outreachDraft: dict[str, Any]
    decision: dict[str, Any]
    agentExecutionLog: list[AgentTrace] = Field(default_factory=list)
    executionGraph: Optional[AgentExecutionGraph] = None
