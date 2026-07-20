from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import reasoning_llm
from app.config import get_settings
from app.tools.memory_tool import MemoryTool


def build_decision_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Hiring Decision Strategist",
        goal=(
            "Produce a final hiring recommendation: Hire, Reject, or Hold — with "
            "confidence and clear reasoning grounded in feedback and role fit."
        ),
        backstory=(
            "You are the hiring committee chair. You balance technical evidence, "
            "communication, and role urgency. Ambiguity means Hold, not Hire."
        ),
        tools=[MemoryTool()],
        llm=reasoning_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
