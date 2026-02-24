"""Terminal executor abstraction with dry-run safety by default."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class CommandResult:
    command: str
    dry_run: bool
    output: str


class TerminalModule:
    def __init__(self, dry_run: bool = True) -> None:
        self.dry_run = dry_run

    def execute(self, command: str) -> CommandResult:
        if self.dry_run:
            return CommandResult(command=command, dry_run=True, output=f"[dry-run] {command}")
        import subprocess

        completed = subprocess.run(command, shell=True, text=True, capture_output=True, check=False)
        output = completed.stdout if completed.stdout else completed.stderr
        return CommandResult(command=command, dry_run=False, output=output.strip())
