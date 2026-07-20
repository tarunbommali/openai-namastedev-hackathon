from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.orchestrator import orchestrator
from app.services.database import db
from app.services.interview_service import find_candidate_by_name, make_interview_id
from app.services.logger import agent_logger

router = APIRouter()


class QuestionBody(BaseModel):
    candidateId: str | None = None


class ScheduleBody(BaseModel):
    command: str | None = None


@router.post("/questions")
@router.post("/api/questions")
async def generate_questions(body: QuestionBody | None = None):
    rankings = await db.get_candidates()
    candidate_id = body.candidateId if body else None
    candidate = next((c for c in rankings if c["id"] == candidate_id), None) or rankings[0]
    job = await db.get_job()
    question_set = await orchestrator.generate_questions(candidate, job)
    return {**question_set, "agentExecutionLog": agent_logger.get_logs()}


@router.post("/schedule")
@router.post("/api/interviews/preview")
async def preview_schedule(body: ScheduleBody | None = None):
    command = (body.command if body else None) or (
        "Schedule a 45-minute technical interview next week with available backend interviewers."
    )
    extracted = await orchestrator.extract_schedule(command)
    return {
        "command": command,
        "extractedEntities": extracted,
        "agentExecutionLog": agent_logger.get_logs(),
        "message": "Scheduling entities extracted",
    }


@router.post("/api/interviews/schedule")
async def confirm_schedule(body: ScheduleBody | None = None):
    command = (body.command if body else None) or (
        "Schedule a 45-minute technical interview next week with available backend interviewers."
    )
    entities = await orchestrator.extract_schedule(command)
    rankings = await db.get_candidates()
    candidate = find_candidate_by_name(entities.get("candidate", ""), rankings)
    interview = {
        "id": make_interview_id(),
        "candidateId": candidate["id"] if candidate else "cand-john",
        "candidate": entities.get("candidate") or "John Doe",
        "interviewer": entities.get("interviewer") or "Rahul Sharma",
        "round": entities.get("round") or "Technical Round 1",
        "time": entities.get("recommendedSlot") or entities.get("time") or "Wednesday, 2:30 PM",
        "status": "Created",
    }
    await db.add_interview(interview)
    return {
        "command": command,
        "extractedEntities": entities,
        "interview": interview,
        "agentExecutionLog": agent_logger.get_logs(),
        "message": "Interview created automatically",
    }


@router.get("/api/interviews")
async def list_interviews():
    return await db.get_interviews()
