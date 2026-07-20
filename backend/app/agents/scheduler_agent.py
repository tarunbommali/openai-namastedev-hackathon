from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import fast_llm
from app.config import get_settings
from app.tools.calendar_tool import CalendarTool
from app.tools.db_tool import MongoTool
from app.tools.memory_tool import MemoryTool


def build_scheduler_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Interview Scheduling Coordinator",
        goal=(
            "Parse natural-language scheduling commands, find an interviewer, propose "
            "available slots, and produce a confirmation-ready schedule payload."
        ),
        backstory=(
            "You coordinate calendars for busy engineering interviewers. You extract "
            "entities carefully and never invent unavailable people."
        ),
        tools=[CalendarTool(), MongoTool(), MemoryTool()],
        llm=fast_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
