"""Lightweight in-process event bus."""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Callable

EventHandler = Callable[[dict[str, Any]], None]


class EventBus:
    def __init__(self) -> None:
        self._subscribers: dict[str, list[EventHandler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: EventHandler) -> None:
        self._subscribers[event_name].append(handler)

    def publish(self, event_name: str, payload: dict[str, Any] | None = None) -> None:
        data = payload or {}
        for handler in self._subscribers.get(event_name, []):
            handler(data)
