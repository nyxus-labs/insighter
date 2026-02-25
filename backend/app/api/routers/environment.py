from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
import subprocess
import os
import sys
import platform
from pydantic import BaseModel

router = APIRouter()

class ToolStatus(BaseModel):
    name: str
    installed: bool
    version: str = None
    error: str = None

class InstallResponse(BaseModel):
    success: bool
    message: str
    details: str = None

def get_venv_python():
    if platform.system() == "Windows":
        return os.path.join(os.getcwd(), ".venv", "Scripts", "python.exe")
    return os.path.join(os.getcwd(), ".venv", "bin", "python")

@router.get("/status", response_model=List[ToolStatus])
async def get_environment_status():
    venv_python = get_venv_python()
    if not os.path.exists(venv_python):
        return [ToolStatus(name="Virtual Environment", installed=False, error="VENV not found")]

    try:
        # Get list of installed packages in venv
        result = subprocess.run(
            [venv_python, "-m", "pip", "list", "--format=json"],
            capture_output=True, text=True, check=True
        )
        import json
        installed_packages = json.loads(result.stdout)
        
        # Cross reference with requirements.txt
        req_path = os.path.join(os.getcwd(), "requirements.txt")
        if not os.path.exists(req_path):
            return [ToolStatus(name="requirements.txt", installed=False, error="Not found")]
            
        with open(req_path, "r") as f:
            required = [line.split("==")[0].split(">=")[0].strip() for line in f if line.strip() and not line.startswith("#")]
            
        status = []
        installed_names = {pkg["name"].lower(): pkg["version"] for pkg in installed_packages}
        
        for req in required:
            is_installed = req.lower() in installed_names
            status.append(ToolStatus(
                name=req,
                installed=is_installed,
                version=installed_names.get(req.lower()) if is_installed else None
            ))
            
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/install", response_model=InstallResponse)
async def install_dependencies():
    venv_python = get_venv_python()
    if not os.path.exists(venv_python):
        # Try to create venv if it doesn't exist
        try:
            subprocess.run([sys.executable, "-m", "venv", ".venv"], check=True)
        except Exception as e:
            return InstallResponse(success=False, message="Failed to create VENV", details=str(e))

    try:
        req_path = os.path.join(os.getcwd(), "requirements.txt")
        # Run pip install in a non-blocking way or return early? 
        # For simplicity in this demo, we'll run it and wait, but ideally this would be a background task.
        process = subprocess.run(
            [venv_python, "-m", "pip", "install", "-r", req_path],
            capture_output=True, text=True
        )
        
        if process.returncode == 0:
            return InstallResponse(success=True, message="All dependencies installed successfully", details=process.stdout)
        else:
            return InstallResponse(success=False, message="Installation failed", details=process.stderr)
    except Exception as e:
        return InstallResponse(success=False, message="An error occurred", details=str(e))

@router.get("/check-venv")
async def check_venv_active():
    """Checks if the current process is running from the .venv"""
    executable = sys.executable
    is_venv = ".venv" in executable
    return {"is_venv": is_venv, "executable": executable}
