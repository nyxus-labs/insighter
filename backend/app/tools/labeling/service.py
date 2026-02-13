from typing import Dict, Any, List
from app.tools.base import BaseTool
from supabase import create_client
from app.core.config import settings

class LabelingTool(BaseTool):
    def __init__(self, config):
        super().__init__(config)
        self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    async def initialize(self, project_id: str) -> Dict[str, Any]:
        try:
            # project_id here refers to labeling_project_id
            # Fetch project details for labels
            project_res = self.supabase.table('labeling_projects')\
                .select("labels")\
                .eq('id', project_id)\
                .execute()
            
            labels = ["Cat", "Dog", "Bird", "Car", "Person"] # Default
            if project_res.data and project_res.data[0].get('labels'):
                labels = project_res.data[0]['labels']

            response = self.supabase.table('labeling_items')\
                .select("id, status", count='exact')\
                .eq('labeling_project_id', project_id)\
                .execute()
            
            total_count = response.count if response.count is not None else 0
            pending_count = len([i for i in response.data if i['status'] == 'pending']) if response.data else 0
            completed_count = len([i for i in response.data if i['status'] == 'completed']) if response.data else 0
            
            return {
                "status": "ready",
                "queue_size": pending_count,
                "total_count": total_count,
                "completed_count": completed_count,
                "classes": labels
            }
        except Exception as e:
            print(f"Error initializing LabelingTool: {e}")
            return {"status": "error", "message": str(e)}

    async def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if action == "get_task":
                # project_id is labeling_project_id
                lp_id = payload.get("project_id")
                response = self.supabase.table('labeling_items')\
                    .select("*")\
                    .eq('labeling_project_id', lp_id)\
                    .eq('status', 'pending')\
                    .limit(1)\
                    .execute()
                
                if response.data:
                    task = response.data[0]
                    return {
                        "task_id": str(task['id']),
                        "image_url": task.get('data_url'),
                        "content": task.get('content'),
                        "predicted_label": task.get('predicted_label'),
                        "confidence": task.get('confidence')
                    }
                return {"message": "No pending tasks"}
                
            elif action == "submit_annotation":
                task_id = payload.get("task_id")
                label = payload.get("label")
                
                response = self.supabase.table('labeling_items')\
                    .update({"manual_label": label, "status": "completed"})\
                    .eq('id', task_id)\
                    .execute()
                
                if response.data:
                    return {"status": "success", "message": "Annotation saved"}
                return {"error": "Task not found"}

            elif action == "save_progress":
                task_id = payload.get("task_id")
                label = payload.get("label")
                
                response = self.supabase.table('labeling_items')\
                    .update({"manual_label": label, "status": "in_progress"})\
                    .eq('id', task_id)\
                    .execute()
                
                if response.data:
                    return {"status": "success", "message": "Progress saved"}
                return {"error": "Task not found"}
                
            return {"error": "Unknown action"}
        except Exception as e:
            print(f"Error executing LabelingTool action {action}: {e}")
            return {"error": str(e)}

    async def terminate(self, project_id: str) -> bool:
        return True

    async def get_status(self, project_id: str) -> Dict[str, Any]:
        try:
            response = self.supabase.table('labeling_items')\
                .select("id", count='exact')\
                .eq('labeling_project_id', project_id)\
                .eq('status', 'pending')\
                .execute()
            
            count = response.count if response.count is not None else 0
            return {"status": "ready", "queue_size": count}
        except Exception as e:
            print(f"Error getting status for LabelingTool: {e}")
            return {"status": "error", "message": str(e)}
