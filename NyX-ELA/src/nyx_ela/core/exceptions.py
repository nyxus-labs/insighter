class NyxError(Exception):
    """Base exception for NyX-ELA."""


class AuthorizationError(NyxError):
    """Raised when an action requires explicit authorized engagement context."""


class ModuleExecutionError(NyxError):
    """Raised when a module fails to execute a task."""
