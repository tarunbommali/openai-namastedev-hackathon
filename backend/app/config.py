"""Application settings loaded from environment."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "HireFlow AI"
    app_env: Literal["development", "staging", "production"] = "development"
    port: int = 4000
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    openai_api_key: str = ""
    openai_fast_model: str = "gpt-5-mini"
    openai_reasoning_model: str = "gpt-5"
    openai_embedding_model: str = "text-embedding-3-large"

    crew_process: Literal["sequential", "hierarchical"] = "sequential"
    crew_verbose: bool = True
    crew_memory: bool = True
    crew_max_retries: int = 2
    agent_max_rpm: int = 30

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "hireflow"

    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"
    use_celery: bool = False

    faiss_index_path: str = "./data/faiss_index"
    embedding_dim: int = 1536
    use_local_embeddings: bool = False
    local_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    log_level: str = "INFO"
    agent_log_max: int = 200
    allow_demo_fallback: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key.strip())

    @property
    def agent_model_plan(self) -> dict[str, str]:
        return {
            "resumeAgent": self.openai_fast_model,
            "matchAgent": self.openai_reasoning_model,
            "questionAgent": self.openai_reasoning_model,
            "schedulerAgent": self.openai_fast_model,
            "decisionAgent": self.openai_reasoning_model,
            "feedbackAgent": self.openai_reasoning_model,
            "briefingAgent": self.openai_reasoning_model,
            "offerAgent": self.openai_fast_model,
            "embeddingSearch": self.openai_embedding_model,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
