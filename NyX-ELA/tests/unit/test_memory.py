from nyx_ela.core.memory import MemoryStore


def test_memory_store_layers():
    store = MemoryStore()
    store.add_episode("login", {"user": "alice"})
    store.remember_fact("os", "parrot")
    store.record_procedure("host_discovery", ["discover", "classify"])

    assert len(store.episodic) == 1
    assert store.get_fact("os") == "parrot"
    assert store.recall_procedure("host_discovery") == ["discover", "classify"]
