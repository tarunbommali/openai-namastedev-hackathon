"""Embedding + similarity + FAISS search tools."""

from __future__ import annotations

import json
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field

from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store


class EmbeddingInput(BaseModel):
    text: str = Field(..., description="Text to embed")


class EmbeddingTool(BaseTool):
    name: str = "embedding_tool"
    description: str = "Generate an embedding vector for a piece of text."
    args_schema: Type[BaseModel] = EmbeddingInput

    def _run(self, text: str) -> str:
        vector = embedding_service.embed_one(text)
        return json.dumps({"dimensions": len(vector), "preview": vector[:8]})


class SimilarityInput(BaseModel):
    left: str = Field(..., description="First text")
    right: str = Field(..., description="Second text")


class SimilarityTool(BaseTool):
    name: str = "similarity_tool"
    description: str = "Compute cosine similarity between two texts via embeddings."
    args_schema: Type[BaseModel] = SimilarityInput

    def _run(self, left: str, right: str) -> str:
        a, b = embedding_service.embed([left, right])
        score = embedding_service.cosine(a, b)
        return json.dumps({"similarity": round(score, 4)})


class VectorSearchInput(BaseModel):
    query: str = Field(..., description="Semantic search query")
    top_k: int = Field(default=5, description="Number of results")


class VectorSearchTool(BaseTool):
    name: str = "vector_search_tool"
    description: str = "Search the FAISS candidate/job index with a natural language query."
    args_schema: Type[BaseModel] = VectorSearchInput

    def _run(self, query: str, top_k: int = 5) -> str:
        results = vector_store.search(query, top_k=top_k)
        return json.dumps({"results": results})
