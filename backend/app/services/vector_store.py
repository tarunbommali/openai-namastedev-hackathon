"""FAISS-backed vector index for candidate / job semantic search."""

from __future__ import annotations

import json
import logging
import os
import threading
from pathlib import Path
from typing import Any, Optional

import numpy as np

from app.config import get_settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._index = None
        self._meta: list[dict[str, Any]] = []
        self._dim: Optional[int] = None

    def _path(self) -> Path:
        return Path(get_settings().faiss_index_path)

    def _lazy_faiss(self):
        import faiss

        return faiss

    def build(self, documents: list[dict[str, Any]]) -> int:
        """documents: [{id, name, text, kind}]"""
        if not documents:
            return 0

        texts = [d["text"] for d in documents]
        vectors = embedding_service.embed(texts)
        if not vectors:
            return 0

        matrix = np.asarray(vectors, dtype=np.float32)
        dim = matrix.shape[1]
        faiss = self._lazy_faiss()
        index = faiss.IndexFlatIP(dim)
        # vectors may already be normalized; normalize again for IP ~= cosine
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        matrix = matrix / norms
        index.add(matrix)

        with self._lock:
            self._index = index
            self._meta = [
                {"id": d["id"], "name": d.get("name", ""), "kind": d.get("kind", "candidate")}
                for d in documents
            ]
            self._dim = dim
            self._persist()
        return len(documents)

    def _persist(self) -> None:
        try:
            path = self._path()
            path.parent.mkdir(parents=True, exist_ok=True)
            if self._index is not None:
                faiss = self._lazy_faiss()
                faiss.write_index(self._index, str(path.with_suffix(".index")))
            path.with_suffix(".meta.json").write_text(json.dumps(self._meta), encoding="utf-8")
        except Exception as exc:  # noqa: BLE001
            logger.debug("FAISS persist skipped: %s", exc)

    def load(self) -> bool:
        path = self._path()
        index_file = path.with_suffix(".index")
        meta_file = path.with_suffix(".meta.json")
        if not index_file.exists() or not meta_file.exists():
            return False
        try:
            faiss = self._lazy_faiss()
            with self._lock:
                self._index = faiss.read_index(str(index_file))
                self._meta = json.loads(meta_file.read_text(encoding="utf-8"))
                self._dim = self._index.d
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to load FAISS index: %s", exc)
            return False

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        with self._lock:
            if self._index is None or not self._meta:
                return []
            vector = np.asarray([embedding_service.embed_one(query)], dtype=np.float32)
            norms = np.linalg.norm(vector, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            vector = vector / norms
            scores, indices = self._index.search(vector, min(top_k, len(self._meta)))
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self._meta):
                    continue
                meta = self._meta[idx]
                results.append(
                    {
                        "id": meta["id"],
                        "name": meta["name"],
                        "similarity": round(float(score), 2),
                        "kind": meta.get("kind", "candidate"),
                    }
                )
            return results


vector_store = VectorStore()
