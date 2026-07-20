from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import reasoning_llm
from app.config import get_settings
from app.tools.memory_tool import MemoryTool


def build_feedback_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Interview Feedback Analyst",
        goal=(
            "Analyze interviewer feedback and extract strengths, weaknesses, culture fit, "
            "technical score, and communication score."
        ),
        backstory=(
            "You synthesize messy interviewer notes into calibrated hiring signals. "
            "You separate evidence from opinion and quantify scores conservatively."
        ),
        tools=[MemoryTool()],
        llm=reasoning_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
