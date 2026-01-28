from typing import Dict, Any, List
from app.tools.base import BaseTool
from app.db.session import SessionLocal
from app.models.tool_data import LabelingTask
from sqlalchemy import func

class LabelingTool(BaseTool):
    async def initialize(self, project_id: str) -> Dict[str, Any]:
        db = SessionLocal()
        count = db.query(LabelingTask).filter(LabelingTask.status == "pending").count()
        db.close()
        return {
            "status": "ready",
            "queue_size": count,
            "classes": ["Cat", "Dog", "Bird", "Car", "Person"]
        }

    async def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = SessionLocal()
        try:
            if action == "get_task":
                task = db.query(LabelingTask).filter(LabelingTask.status == "pending").first()
                if task:
                    return {
                        "task_id": task.id,
                        "image_url": task.image_url,
                        "predicted_label": task.predicted_label,
                        "confidence": task.confidence
                    }
                return {"message": "No pending tasks"}
                
            elif action == "submit_annotation":
                task_id = payload.get("task_id")
                label = payload.get("label")
                task = db.query(LabelingTask).filter(LabelingTask.id == task_id).first()
                if task:
                    task.manual_label = label
                    task.status = "completed"
                    db.commit()
                    return {"status": "success", "message": "Annotation saved"}
                return {"error": "Task not found"}
                
            return {"error": "Unknown action"}
        finally:
            db.close()

    async def terminate(self, project_id: str) -> bool:
        return True

    async def get_status(self, project_id: str) -> Dict[str, Any]:
        db = SessionLocal()
        count = db.query(LabelingTask).filter(LabelingTask.status == "pending").count()
        db.close()
        return {"status": "ready", "queue_size": count}
