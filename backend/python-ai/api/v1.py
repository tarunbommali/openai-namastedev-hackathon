from __future__ import annotations
from typing import Any, Optional
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from crews.hiring_crew import hiring_crew
from services.trace import get_execution_bundle, get_traces

router = APIRouter(prefix="/v1")


def verify_role(x_user_role: Optional[str] = Header(default=None), allowed_roles: tuple[str, ...] = ("recruiter", "interviewer", "candidate", "admin")):
    if x_user_role and x_user_role.lower() not in allowed_roles:
        raise HTTPException(status_code=403, detail=f"Role '{x_user_role}' is not authorized for this AI operation")
    return x_user_role


class ParseBody(BaseModel):
    resumeText: str
    job: Optional[dict[str, Any]] = None
    candidates: Optional[list[dict[str, Any]]] = None


class MatchBody(BaseModel):
    intent: Optional[str] = None
    resume: Optional[dict[str, Any]] = None
    job: Optional[dict[str, Any]] = None
    candidates: Optional[list[dict[str, Any]]] = None


class QuestionsBody(BaseModel):
    candidate: dict[str, Any]
    job: dict[str, Any]


class ScheduleBody(BaseModel):
    command: str
    candidates: Optional[list[dict[str, Any]]] = None


class FeedbackBody(BaseModel):
    feedbackText: str


class OfferBody(BaseModel):
    candidate: dict[str, Any]
    scheduling: Optional[dict[str, Any]] = None
    job: Optional[dict[str, Any]] = None


class CommandBody(BaseModel):
    intent: str
    job: Optional[dict[str, Any]] = None
    candidates: Optional[list[dict[str, Any]]] = None


@router.get("/health")
def health():
    return {"ok": True, "service": "hireflow-python-ai"}


@router.post("/parse-resume")
def parse_resume(body: ParseBody):
    return hiring_crew.parse_resume(body.resumeText, body.job, body.candidates)


@router.post("/match")
def match(body: MatchBody):
    intent = body.intent or "Senior backend engineer Node.js Kafka Redis Docker"
    return hiring_crew.match(intent, body.job, body.candidates)


@router.post("/questions")
def questions(body: QuestionsBody):
    return hiring_crew.questions(body.candidate, body.job)


@router.post("/schedule")
def schedule(body: ScheduleBody):
    return hiring_crew.schedule(body.command, body.candidates)


@router.post("/feedback")
def feedback(body: FeedbackBody):
    return hiring_crew.feedback(body.feedbackText)


@router.post("/decision")
def decision(body: FeedbackBody):
    return hiring_crew.decision(body.feedbackText)


@router.post("/offer")
def offer(body: OfferBody):
    return hiring_crew.offer(body.candidate, body.scheduling, body.job)


@router.post("/command")
def command(body: CommandBody):
    return hiring_crew.command(body.intent, body.job, body.candidates)


@router.get("/executions/{execution_id}")
def execution(execution_id: str):
    return get_execution_bundle(execution_id)


@router.get("/traces")
def traces(limit: int = 50):
    return get_traces(limit)
