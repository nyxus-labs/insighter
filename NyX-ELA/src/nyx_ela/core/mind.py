"""Decision engine routing intents to response vs orchestrated actions."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Decision:
    intent: str
    mode: str
    reason: str


class MindEngine:
    ACTION_KEYWORDS = {
        "scan", "enumerate", "recon", "run", "execute", "audit", "test", "analyze", "check", "script"
    }

    def decide(self, user_input: str) -> Decision:
        lowered = user_input.lower()
        if any(word in lowered for word in self.ACTION_KEYWORDS):
            return Decision(intent="orchestration", mode="multi_stage", reason="contains action-oriented request")
        return Decision(intent="conversation", mode="single_response", reason="informational or conversational query")
