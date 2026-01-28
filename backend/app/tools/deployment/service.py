from typing import Dict, Any, List
from app.tools.base import BaseTool
from app.db.session import SessionLocal
from app.models.tool_data import Deployment, DeploymentLog
import docker

class DeploymentTool(BaseTool):
    def __init__(self, config: Any = None):
        super().__init__(config)
        try:
            self.docker_client = docker.from_env()
        except:
            self.docker_client = None

    async def initialize(self, project_id: str) -> Dict[str, Any]:
        db = SessionLocal()
        count = db.query(Deployment).count()
        db.close()
        return {
            "status": "ready",
            "active_deployments": count,
            "docker_connected": self.docker_client is not None
        }

    async def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = SessionLocal()
        try:
            if action == "get_deployments":
                # Try to get real docker containers first
                real_deployments = []
                if self.docker_client:
                    try:
                        containers = self.docker_client.containers.list()
                        for c in containers:
                            real_deployments.append({
                                "id": c.short_id,
                                "name": c.name,
                                "model": c.image.tags[0] if c.image.tags else "unknown",
                                "status": "healthy" if c.status == "running" else "error",
                                "uptime": c.status, # Simplified
                                "requests_per_min": 0, # Cannot get easily from docker API
                                "latency_ms": 0,
                                "endpoint": "local"
                            })
                    except:
                        pass
                
                # Get DB deployments (simulated "cloud" deployments)
                db_deployments = db.query(Deployment).all()
                formatted_db_deps = [
                    {
                        "id": d.id,
                        "name": d.name,
                        "model": d.model_name,
                        "status": d.status,
                        "uptime": d.uptime,
                        "requests_per_min": d.requests_per_min,
                        "latency_ms": d.latency_ms,
                        "endpoint": d.endpoint_url
                    } for d in db_deployments
                ]
                
                return {"deployments": real_deployments + formatted_db_deps}

            elif action == "get_logs":
                logs = db.query(DeploymentLog).order_by(DeploymentLog.timestamp.desc()).limit(50).all()
                return {"logs": [f"[{l.timestamp}] [{l.level}] {l.message}" for l in logs]}
                
            return {"error": "Unknown action"}
        finally:
            db.close()

    async def terminate(self, project_id: str) -> bool:
        return True

    async def get_status(self, project_id: str) -> Dict[str, Any]:
        db = SessionLocal()
        count = db.query(Deployment).count()
        db.close()
        return {"status": "ready", "active_deployments": count}
