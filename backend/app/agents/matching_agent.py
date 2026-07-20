from __future__ import annotations

from app.crew_compat import Agent

from app.agents._llm import reasoning_llm
from app.config import get_settings
from app.tools.db_tool import MongoTool
from app.tools.embedding_tool import EmbeddingTool, SimilarityTool, VectorSearchTool
from app.tools.memory_tool import MemoryTool
from app.tools.ranking_tool import RankingTool


def build_matching_agent() -> Agent:
    settings = get_settings()
    return Agent(
        role="Semantic Matching Specialist",
        goal=(
            "Rank candidates against the job using embedding search, skill-gap analysis, "
            "explainable strengths, and confidence scores."
        ),
        backstory=(
            "You are a talent intelligence analyst. You prefer evidence over keyword "
            "matching and always explain why a candidate ranks where they do."
        ),
        tools=[
            EmbeddingTool(),
            SimilarityTool(),
            VectorSearchTool(),
            RankingTool(),
            MongoTool(),
            MemoryTool(),
        ],
        llm=reasoning_llm(),
        verbose=settings.crew_verbose,
        allow_delegation=False,
        max_rpm=settings.agent_max_rpm,
        memory=settings.crew_memory,
    )
