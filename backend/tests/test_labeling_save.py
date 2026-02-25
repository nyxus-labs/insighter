import requests
import sys

BASE_URL = "http://localhost:8000"

def test_save_progress():
    print("\nTesting Labeling Save Progress...")
    
    # 1. First ensure we have a task to save to
    try:
        resp = requests.get(f"{BASE_URL}/api/labeling/")
        if resp.status_code != 200:
            print(f"Error fetching tasks: {resp.text}")
            return False
            
        tasks = resp.json()
        if not tasks:
            print("No tasks found, creating a test task...")
            params = {"name": "Test Save Task", "type": "image"}
            resp = requests.post(f"{BASE_URL}/api/labeling/create", params=params)
            if resp.status_code != 200:
                print(f"Error creating task: {resp.text}")
                return False
            task = resp.json()
        else:
            task = tasks[0]
        
        task_id = task["id"]
        print(f"Using task ID: {task_id}")

        # 2. Execute save_progress action
        payload = {
            "task_id": task_id,
            "label": "test_label_saved",
            "annotations": [{"type": "rect", "x": 10, "y": 20}]
        }
        
        # The endpoint is /api/tools/labeling/execute/save_progress
        # Note: In some environments it might be /api/v1/... check main.py
        # Based on main.py: app.include_router(labeling_tool_router.router, prefix="/api/tools/labeling", tags=["Tools: Labeling"])
        url = f"{BASE_URL}/api/tools/labeling/execute/save_progress"
        print(f"Posting to: {url}")
        resp = requests.post(url, json=payload)
        
        if resp.status_code != 200:
            print(f"Error executing action: {resp.text}")
            return False
            
        result = resp.json()
        assert result["status"] == "success"
        assert result["message"] == "Progress saved"
        print("Save progress action executed successfully.")

        # 3. Verify task status in database
        resp = requests.get(f"{BASE_URL}/api/labeling/")
        assert resp.status_code == 200
        tasks = resp.json()
        updated_task = next((t for t in tasks if str(t["id"]) == str(task_id)), None)
        assert updated_task is not None
        assert updated_task["status"] == "in_progress"
        assert updated_task["manual_label"] == "test_label_saved"
        print("Task status and label verified in database.")
        return True

    except Exception as e:
        print(f"Test Exception: {e}")
        return False

if __name__ == "__main__":
    success = test_save_progress()
    if success:
        print("\nLabeling save progress test passed!")
        sys.exit(0)
    else:
        print("\nLabeling save progress test failed!")
        sys.exit(1)
