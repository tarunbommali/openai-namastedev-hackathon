from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import reasoning_llm
from app.config import get_settings
from app.tools.memory_tool import MemoryTool
from app.tools.db_tool import MongoTool


def build_question_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Interview Question Designer",
        goal=(
            "Generate a balanced interview plan covering Easy, Medium, Hard, Behavioral, "
            "System Design, and Coding questions tied to hiring signals."
        ),
        backstory=(
            "You design interviews that surface real production judgment. Every question "
            "must map to a concrete hiring signal for the target role."
        ),
        tools=[MongoTool(), MemoryTool()],
        llm=reasoning_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
