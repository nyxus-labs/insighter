"""Conversation engine with NyX persona flavor."""

from __future__ import annotations


class ConversationEngine:
    def respond(self, text: str) -> str:
        text = text.strip()
        if not text:
            return "Speak, and I will listen between the signals."
        return f"NyX acknowledges: {text}"
