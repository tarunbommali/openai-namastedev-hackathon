"""Simple JSON memory for candidate/job/interview context between agent runs."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent / ".memory"
ROOT.mkdir(exist_ok=True)


def _path(kind: str) -> Path:
    return ROOT / f"{kind}.json"


def save(kind: str, key: str, value: Any) -> None:
    data = load_all(kind)
    data[key] = value
    _path(kind).write_text(json.dumps(data, indent=2), encoding="utf-8")


def get(kind: str, key: str, default: Any = None) -> Any:
    return load_all(kind).get(key, default)


def load_all(kind: str) -> dict[str, Any]:
    p = _path(kind)
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}
