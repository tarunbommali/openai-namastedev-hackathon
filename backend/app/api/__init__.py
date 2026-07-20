from fastapi import APIRouter

from app.api import resume, candidate, interview, feedback, decision, crew, health


def build_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health.router, tags=["health"])
    router.include_router(resume.router, tags=["resume"])
    router.include_router(candidate.router, tags=["candidate"])
    router.include_router(interview.router, tags=["interview"])
    router.include_router(feedback.router, tags=["feedback"])
    router.include_router(decision.router, tags=["decision"])
    router.include_router(crew.router, tags=["crew"])
    return router
