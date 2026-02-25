from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class ToolInput(BaseModel):
    name: str
    type: str
    required: bool = True
    description: Optional[str] = None

class ToolOutput(BaseModel):
    name: str
    type: str
    description: Optional[str] = None

class ToolConfig(BaseModel):
    id: str
    name: str
    version: str
    inputs: List[ToolInput] = []
    outputs: List[ToolOutput] = []
    settings: Dict[str, Any] = {}

class BaseTool(ABC):
    def __init__(self, config: ToolConfig):
        self.config = config

    @abstractmethod
    async def initialize(self, project_id: str) -> Dict[str, Any]:
        """Initialize the tool environment for a specific project."""
        pass

    @abstractmethod
    async def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific action within the tool."""
        pass

    @abstractmethod
    async def terminate(self, project_id: str) -> bool:
        """Clean up resources."""
        pass

    @abstractmethod
    async def get_status(self, project_id: str) -> Dict[str, Any]:
        """Get the current status of the tool environment."""
        pass
