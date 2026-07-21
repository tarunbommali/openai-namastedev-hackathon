from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent
BACKEND_ENV = ROOT.parent / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=[str(BACKEND_ENV), ".env"], extra="ignore")
    openai_api_key: str = ""
    openai_fast_model: str = "gpt-4o-mini"
    openai_reasoning_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-large"
    port: int = 8001
    crew_verbose: bool = False
    allow_mock_fallback: bool = True

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
