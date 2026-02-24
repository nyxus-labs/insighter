"""CLI entrypoint for NyX-ELA."""

from __future__ import annotations

from nyx_ela.core.assistant import NyxAssistant


def run_cli() -> None:
    assistant = NyxAssistant()
    print("NyX-ELA ready. Type 'exit' to quit.")
    while True:
        user_input = input("nyx> ").strip()
        if user_input.lower() in {"exit", "quit"}:
            print("NyX-ELA: Until the next cycle.")
            return
        print(assistant.handle(user_input))


if __name__ == "__main__":
    run_cli()
