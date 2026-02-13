from typing import Dict, Any
from app.tools.base import BaseTool, ToolConfig

import sys
import io
import contextlib
from typing import Dict, Any

class NotebookTool(BaseTool):
    async def initialize(self, project_id: str) -> Dict[str, Any]:
        return {
            "status": "ready",
            "kernel_id": "python-3-exec",
            "url": f"/notebooks/{project_id}"
        }

    async def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if action == "run_cell":
            code = payload.get("code", "")
            
            # Safe-ish execution environment
            # In production, this MUST be in a container
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            result_output = ""
            error_output = ""
            
            try:
                with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
                    # SECURITY WARNING: exec() is inherently dangerous.
                    # In production, this MUST be executed in a sandboxed container (e.g., Docker).
                    # We use a restricted global scope to minimize risks in dev.
                    safe_globals = {"__builtins__": {}} # Extreme restriction for demo
                    exec(code, safe_globals, {})
                
                result_output = stdout_capture.getvalue()
                error_output = stderr_capture.getvalue()
                
            except Exception as e:
                error_output = str(e)
            
            return {
                "result": "success" if not error_output else "error",
                "output": result_output + ("\nError:\n" + error_output if error_output else "")
            }
        return {"error": "Unknown action"}

    async def terminate(self, project_id: str) -> bool:
        return True

    async def get_status(self, project_id: str) -> Dict[str, Any]:
        return {
            "status": "idle",
            "resource_usage": {
                "cpu": "5%",
                "memory": "256MB"
            }
        }
