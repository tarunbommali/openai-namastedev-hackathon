from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.orchestrator import orchestrator
from app.services.logger import agent_logger

router = APIRouter()


class DecisionBody(BaseModel):
    feedbackText: str | None = None
    candidateId: str | None = None
    interviewId: str | None = None


class OfferBody(BaseModel):
    candidateId: str | None = None
    command: str | None = None
    intent: str | None = None


@router.post("/decision")
async def hiring_decision(body: DecisionBody | None = None):
    feedback_text = (body.feedbackText if body else None) or (
        "Strong backend fundamentals and clear communication. Ready for next round."
    )
    analysis = await orchestrator.analyze_feedback(feedback_text)
    decision = await orchestrator.recommend_next_step(feedback_text, analysis)
    return {"decision": decision, "analysis": analysis, "agentExecutionLog": agent_logger.get_logs()}


@router.post("/offer")
async def generate_offer(body: OfferBody | None = None):
    from app.services.database import db
    from app.services.interview_service import fallback_schedule

    candidates = await db.get_candidates()
    candidate_id = body.candidateId if body else None
    candidate = next((c for c in candidates if c["id"] == candidate_id), None) or candidates[0]
    command = (body.command if body else None) or f"Schedule {candidate['name']} tomorrow at 2 PM"
    scheduling = await orchestrator.extract_schedule(command) if command else fallback_schedule(command)
    outreach = await orchestrator.create_outreach(candidate, scheduling)
    return {"outreachDraft": outreach, "agentExecutionLog": agent_logger.get_logs()}
