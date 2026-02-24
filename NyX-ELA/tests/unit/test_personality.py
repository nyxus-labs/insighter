from nyx_ela.core.mind import MindEngine


def test_mind_engine_decision_modes():
    mind = MindEngine()
    assert mind.decide("what is your status").intent == "conversation"
    assert mind.decide("scan the approved range").intent == "orchestration"
