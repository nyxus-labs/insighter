"""Memory model for episodic, semantic, and procedural knowledge."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class MemoryStore:
    episodic: list[dict[str, Any]] = field(default_factory=list)
    semantic: dict[str, Any] = field(default_factory=dict)
    procedural: dict[str, list[str]] = field(default_factory=dict)

    def add_episode(self, event: str, context: dict[str, Any] | None = None) -> None:
        self.episodic.append({"event": event, "context": context or {}, "ts": utc_now()})

    def remember_fact(self, key: str, value: Any) -> None:
        self.semantic[key] = value

    def get_fact(self, key: str, default: Any = None) -> Any:
        return self.semantic.get(key, default)

    def record_procedure(self, name: str, steps: list[str]) -> None:
        self.procedural[name] = steps

    def recall_procedure(self, name: str) -> list[str]:
        return self.procedural.get(name, [])
