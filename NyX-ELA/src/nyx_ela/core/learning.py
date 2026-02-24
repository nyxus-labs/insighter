"""Learning routines that turn successful runs into procedures."""

from __future__ import annotations

from .memory import MemoryStore


class LearningEngine:
    def __init__(self, memory: MemoryStore) -> None:
        self.memory = memory

    def absorb_successful_chain(self, objective: str, commands: list[str]) -> None:
        if commands:
            self.memory.record_procedure(objective, commands)
            self.memory.add_episode("learned_procedure", {"objective": objective, "steps": len(commands)})
