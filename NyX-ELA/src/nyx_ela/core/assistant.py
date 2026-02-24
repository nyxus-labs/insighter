"""Top-level assistant orchestrator."""

from __future__ import annotations

from nyx_ela.conversation.engine import ConversationEngine
from nyx_ela.core.event_bus import EventBus
from nyx_ela.core.learning import LearningEngine
from nyx_ela.core.memory import MemoryStore
from nyx_ela.core.mind import MindEngine
from nyx_ela.modules.terminal import TerminalModule
from nyx_ela.pentest.pentest_engine import PentestEngine


class NyxAssistant:
    def __init__(self) -> None:
        self.memory = MemoryStore()
        self.events = EventBus()
        self.mind = MindEngine()
        self.learning = LearningEngine(self.memory)
        self.conversation = ConversationEngine()
        self.terminal = TerminalModule(dry_run=True)
        self.pentest = PentestEngine(self.terminal)

    def handle(self, user_input: str) -> str:
        decision = self.mind.decide(user_input)
        self.memory.add_episode("user_input", {"text": user_input, "mode": decision.mode})
        self.events.publish("request.received", {"text": user_input, "intent": decision.intent})

        if decision.intent == "conversation":
            response = self.conversation.respond(user_input)
            self.memory.add_episode("assistant_response", {"text": response})
            return response

        plan = self.pentest.build_plan(user_input)
        self.learning.absorb_successful_chain(user_input, plan)
        return "Orchestration plan:\n- " + "\n- ".join(plan)
