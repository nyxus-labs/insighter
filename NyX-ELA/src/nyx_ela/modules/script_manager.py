"""Script manager for generating and scheduling automation snippets."""

from __future__ import annotations

from pathlib import Path


class ScriptManager:
    def __init__(self, base_dir: str = "scripts/generated") -> None:
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def write_script(self, name: str, body: str) -> Path:
        target = self.base_dir / name
        target.write_text(body)
        return target
