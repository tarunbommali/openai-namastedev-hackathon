from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import fast_llm
from app.config import get_settings
from app.tools.memory_tool import MemoryTool
from app.tools.resume_parser_tool import ResumeParserTool


def build_resume_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Resume Intelligence Specialist",
        goal=(
            "Extract structured candidate information including skills, projects, "
            "experience, education, achievements, technologies, and leadership signals."
        ),
        backstory=(
            "You are a senior technical recruiter who has screened thousands of engineering "
            "resumes. You never invent credentials. You extract only what the text supports "
            "and return strict JSON for downstream hiring agents."
        ),
        tools=[ResumeParserTool(), MemoryTool()],
        llm=fast_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
