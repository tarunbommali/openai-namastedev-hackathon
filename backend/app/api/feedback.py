from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.orchestrator import orchestrator
from app.services.database import db
from app.services.interview_service import make_feedback_id
from app.services.logger import agent_logger

router = APIRouter()


class FeedbackBody(BaseModel):
    feedbackText: str | None = None
    interviewId: str | None = None


@router.post("/feedback")
@router.post("/api/feedback")
async def submit_feedback(body: FeedbackBody | None = None):
    feedback_text = (body.feedbackText if body else None) or (
        "Strong backend fundamentals, excellent system design understanding, "
        "strong communication, and relevant distributed systems experience."
    )
    interview_id = body.interviewId if body else None
    analysis = await orchestrator.analyze_feedback(feedback_text)
    recommendation = await orchestrator.recommend_next_step(feedback_text, analysis)
    interviews = await db.get_interviews()
    latest = interviews[0] if interviews else None

    record = {
        "id": make_feedback_id(),
        "interviewId": interview_id or (latest["id"] if latest else None),
        "candidate": (latest["candidate"] if latest else "John Doe"),
        "interviewer": (latest["interviewer"] if latest else "Rahul Sharma"),
        "feedbackText": feedback_text,
        "recommendation": recommendation,
        "analysis": analysis,
        "agentExecutionLog": agent_logger.get_logs(),
    }
    await db.add_feedback(record)
    return record
