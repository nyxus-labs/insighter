from nyx_ela.modules.terminal import TerminalModule


def test_terminal_dry_run():
    module = TerminalModule(dry_run=True)
    result = module.execute("echo hello")
    assert result.dry_run is True
    assert "[dry-run]" in result.output
