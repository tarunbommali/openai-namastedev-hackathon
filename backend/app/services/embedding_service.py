"""Embedding generation — OpenAI, local sentence-transformers, or hash fallback."""

from __future__ import annotations

import hashlib
import logging
import math
import re
from typing import Optional

import numpy as np

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self) -> None:
        self._local_model = None
        self._openai = None

    def _ensure_openai(self):
        settings = get_settings()
        if not settings.has_openai:
            return None
        if self._openai is None:
            from openai import OpenAI

            self._openai = OpenAI(api_key=settings.openai_api_key)
        return self._openai

    def _ensure_local(self):
        settings = get_settings()
        if not settings.use_local_embeddings:
            return None
        if self._local_model is None:
            from sentence_transformers import SentenceTransformer

            self._local_model = SentenceTransformer(settings.local_embedding_model)
        return self._local_model

    def _hash_embed(self, text: str, dim: int) -> list[float]:
        tokens = re.findall(r"[a-z0-9+.]+", text.lower())
        vec = np.zeros(dim, dtype=np.float32)
        for token in tokens:
            digest = hashlib.sha256(token.encode()).digest()
            idx = int.from_bytes(digest[:4], "big") % dim
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vec[idx] += sign
        norm = np.linalg.norm(vec) or 1.0
        return (vec / norm).tolist()

    def embed(self, texts: list[str]) -> list[list[float]]:
        settings = get_settings()
        if not texts:
            return []

        client = self._ensure_openai()
        if client is not None:
            try:
                response = client.embeddings.create(
                    model=settings.openai_embedding_model,
                    input=texts,
                )
                return [item.embedding for item in response.data]
            except Exception as exc:  # noqa: BLE001
                logger.warning("OpenAI embeddings failed: %s", exc)

        local = self._ensure_local()
        if local is not None:
            try:
                vectors = local.encode(texts, normalize_embeddings=True)
                return [v.tolist() for v in vectors]
            except Exception as exc:  # noqa: BLE001
                logger.warning("Local embeddings failed: %s", exc)

        dim = 384 if settings.use_local_embeddings else settings.embedding_dim
        return [self._hash_embed(text, dim) for text in texts]

    def embed_one(self, text: str) -> list[float]:
        return self.embed([text])[0]

    @staticmethod
    def cosine(left: list[float], right: list[float]) -> float:
        a = np.asarray(left, dtype=np.float32)
        b = np.asarray(right, dtype=np.float32)
        denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1.0
        return float(np.dot(a, b) / denom)


embedding_service = EmbeddingService()
