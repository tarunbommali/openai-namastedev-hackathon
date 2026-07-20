from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.orchestrator import orchestrator
from app.services.candidate_service import semantic_candidate_search
from app.services.database import db
from app.services.logger import agent_logger
from app.data.seed import seed_interviewers

router = APIRouter()


class IntentBody(BaseModel):
    intent: str | None = None


@router.post("/match")
@router.post("/api/candidates/search")
async def match_candidates(body: IntentBody | None = None):
    intent = (body.intent if body else None) or (
        "Senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience."
    )
    matches = await semantic_candidate_search(intent)
    # Also produce explainable rankings for the dedicated /match contract
    candidates = await db.get_candidates()
    parsed = candidates[0].get("parsedResume") or {}
    ranked = await orchestrator.rank_candidates(parsed)
    return {
        "matches": matches,
        "rankings": ranked.get("rankings", []),
        "agentExecutionLog": agent_logger.get_logs(),
    }


@router.get("/api/jobs")
async def list_jobs():
    return [await db.get_job()]


@router.get("/api/applications")
async def list_applications():
    return await db.get_candidates()


@router.get("/api/applications/{candidate_id}")
async def get_application(candidate_id: str):
    candidates = await db.get_candidates()
    candidate = next((c for c in candidates if c["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"candidate": candidate, "job": await db.get_job()}


@router.get("/api/demo")
async def demo_payload():
    from app.config import get_settings

    settings = get_settings()
    return {
        "job": await db.get_job(),
        "candidates": await db.get_candidates(),
        "interviewers": seed_interviewers(),
        "interviews": await db.get_interviews(),
        "feedback": await db.get_feedback(),
        "parsedResume": db.get_parsed_resume(),
        "agentModelPlan": settings.agent_model_plan,
        "agentExecutionLog": agent_logger.get_logs(),
    }
