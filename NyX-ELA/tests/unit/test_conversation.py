from nyx_ela.conversation.engine import ConversationEngine


def test_conversation_response():
    engine = ConversationEngine()
    assert "NyX acknowledges" in engine.respond("status")
