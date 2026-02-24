from nyx_ela.core.assistant import NyxAssistant


def test_assistant_routes_conversation_and_orchestration():
    assistant = NyxAssistant()

    chat = assistant.handle("hello")
    plan = assistant.handle("run recon for asset inventory")

    assert "NyX acknowledges" in chat
    assert "Orchestration plan" in plan
    assert len(assistant.memory.episodic) >= 3
