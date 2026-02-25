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
            
            # SECURITY WARNING: This uses exec() for code execution.
            # THIS IS NOT SAFE FOR UNTRUSTED CODE IN PRODUCTION.
            # Deploy with Docker container isolation or use Jupyter kernel isolation.
            # See: https://jupyter.org/governance/
            
            if not code or not isinstance(code, str):
                return {"result": "error", "output": "Error:\nNo code provided or invalid code format"}
            
            # Validate code size to prevent abuse
            MAX_CODE_SIZE = 1_000_000  # 1MB
            if len(code) > MAX_CODE_SIZE:
                return {"result": "error", "output": f"Error:\nCode size {len(code)} exceeds limit of {MAX_CODE_SIZE} bytes"}
            
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            result_output = ""
            error_output = ""
            
            try:
                with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
<<<<<<< HEAD
                    # Restricted execution scope - prevents direct access to dangerous builtins
                    # WARNING: Still vulnerable to sophisticated attacks (e.g., via imports)
                    restricted_globals = {
                        "__builtins__": {
                            "print": print,
                            "len": len,
                            "range": range,
                            "sum": sum,
                            "max": max,
                            "min": min,
                            "str": str,
                            "int": int,
                            "float": float,
                            "list": list,
                            "dict": dict,
                            "tuple": tuple,
                            "set": set,
                        }
                    }
                    exec(code, restricted_globals, {})
=======
                    # SECURITY WARNING: exec() is inherently dangerous.
                    # In production, this MUST be executed in a sandboxed container (e.g., Docker).
                    # We use a restricted global scope to minimize risks in dev.
                    safe_globals = {"__builtins__": {}} # Extreme restriction for demo
                    exec(code, safe_globals, {})
>>>>>>> 6ed0e1967af29b666b40c0ee002df73ca8b9888f
                
                result_output = stdout_capture.getvalue()
                error_output = stderr_capture.getvalue()
                
            except SyntaxError as e:
                error_output = f"Syntax Error: {e.msg} (line {e.lineno})"
            except Exception as e:
                error_output = f"{type(e).__name__}: {str(e)}"
            
            return {
                "result": "success" if not error_output else "error",
                "output": result_output + ("\nError:\n" + error_output if error_output else "")
            }
        return {"error": "Unknown action. Supported actions: run_cell"}

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
