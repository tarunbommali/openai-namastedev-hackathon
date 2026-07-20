from fastapi import APIRouter, File, Request, UploadFile

from app.agents.orchestrator import orchestrator
from app.data.seed import seed_candidates
from app.services.candidate_service import merge_rankings
from app.services.database import db
from app.services.logger import agent_logger

router = APIRouter()


async def _parse_and_rank(resume_text: str) -> dict:
    parsed = await orchestrator.parse_resume(resume_text)
    ranked = await orchestrator.rank_candidates(parsed)
    base = await db.get_candidates()
    rankings = merge_rankings(base, ranked.get("rankings", []))
    await db.save_candidates(rankings)
    await db.set_parsed_resume(parsed)
    return {
        "parsedResume": parsed,
        "rankings": rankings,
        "agentExecutionLog": agent_logger.get_logs(),
        "message": "Resume parsed and candidates ranked",
    }


@router.post("/resume")
@router.post("/api/resumes")
async def parse_resume(request: Request, resume: UploadFile | None = File(default=None)):
    content_type = request.headers.get("content-type", "")
    resume_text = None

    if "application/json" in content_type:
        body = await request.json()
        resume_text = (body or {}).get("resumeText")
    elif "multipart/form-data" in content_type:
        form = await request.form()
        resume_text = form.get("resumeText")
        upload = form.get("resume")
        if upload is not None and hasattr(upload, "read"):
            resume_text = resume_text or (await upload.read()).decode("utf-8", errors="ignore")

    if resume is not None and not resume_text:
        resume_text = (await resume.read()).decode("utf-8", errors="ignore")

    resume_text = resume_text or seed_candidates()[0]["resumeText"]
    return await _parse_and_rank(resume_text)
