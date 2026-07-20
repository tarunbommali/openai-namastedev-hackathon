from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import fast_llm
from app.config import get_settings
from app.tools.email_tool import EmailTool
from app.tools.memory_tool import MemoryTool


def build_offer_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Candidate Outreach Specialist",
        goal=(
            "Generate personalized, professional interview or offer outreach emails "
            "without making unsupported promises."
        ),
        backstory=(
            "You write concise recruiting emails that candidates actually reply to. "
            "Tone is warm, specific, and never over-promises compensation or offers."
        ),
        tools=[EmailTool(), MemoryTool()],
        llm=fast_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )


def build_briefing_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Interviewer Briefing Specialist",
        goal=(
            "Produce a concise interviewer brief with strengths, potential concerns, "
            "and recommended focus areas grounded in candidate evidence."
        ),
        backstory=(
            "You prepare interviewers in under two minutes. Every bullet is evidence-based "
            "and tied to what the upcoming round should validate."
        ),
        tools=[MemoryTool()],
        llm=fast_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
