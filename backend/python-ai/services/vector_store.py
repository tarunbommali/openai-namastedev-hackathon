from __future__ import annotations
import hashlib
import math
import re
from typing import Any

import numpy as np

try:
    import faiss  # type: ignore
except Exception:  # noqa: BLE001
    faiss = None


def _embed(text: str, dim: int = 64) -> list[float]:
    tokens = re.findall(r"[a-z0-9+.]+", text.lower())
    vec = np.zeros(dim, dtype=np.float32)
    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        idx = int.from_bytes(digest[:4], "big") % dim
        vec[idx] += 1.0 if digest[4] % 2 == 0 else -1.0
    norm = np.linalg.norm(vec) or 1.0
    return (vec / norm).tolist()


class VectorStore:
    def __init__(self) -> None:
        self.meta: list[dict[str, Any]] = []
        self.index = None
        self.dim = 64
        self.scoped_stores: dict[str, dict[str, Any]] = {}

    def build(self, docs: list[dict[str, Any]], tenant_id: str = "default-tenant", job_id: str = "default-job") -> int:
        if not docs:
            return 0
        scope_key = f"{tenant_id}:{job_id}"
        matrix = np.asarray([_embed(d["text"], self.dim) for d in docs], dtype=np.float32)
        
        scoped_meta = docs
        scoped_index = matrix if faiss is None else faiss.IndexFlatIP(self.dim)
        if faiss is not None and scoped_index is not None:
            scoped_index.add(matrix)

        self.scoped_stores[scope_key] = {
            "meta": scoped_meta,
            "index": scoped_index
        }
        self.meta = docs
        self.index = scoped_index
        return len(docs)

    def search(self, query: str, top_k: int = 5, tenant_id: str = "default-tenant", job_id: str = "default-job") -> list[dict[str, Any]]:
        scope_key = f"{tenant_id}:{job_id}"
        scoped = self.scoped_stores.get(scope_key)
        
        meta = scoped["meta"] if scoped else self.meta
        index = scoped["index"] if scoped else self.index

        if not meta or index is None:
            return []
        q = np.asarray([_embed(query, self.dim)], dtype=np.float32)
        if faiss is None or not hasattr(index, "search"):
            scores = (np.asarray(index) @ q[0]).tolist()
            order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
            return [{**meta[i], "similarity": round(float(scores[i]), 2)} for i in order]
        scores, idxs = index.search(q, min(top_k, len(meta)))
        out = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx < 0:
                continue
            out.append({**meta[idx], "similarity": round(float(score), 2)})
        return out


vector_store = VectorStore()

