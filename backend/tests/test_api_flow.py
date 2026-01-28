import requests
import time

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health Check...")
    resp = requests.get(f"{BASE_URL}/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}
    print("Health Check Passed!")

def test_deployment_flow():
    print("\nTesting Deployment Flow...")
    
    # 1. List existing deployments
    resp = requests.get(f"{BASE_URL}/api/deployment/")
    assert resp.status_code == 200
    initial_count = len(resp.json())
    print(f"Initial deployments: {initial_count}")

    # 2. Create new deployment
    new_deploy = {
        "model_id": "test-model-v1",
        "cpu": "2",
        "memory": "4Gi"
    }
    resp = requests.post(f"{BASE_URL}/api/deployment/deploy", json=new_deploy)
    assert resp.status_code == 200
    created_deploy = resp.json()
    assert created_deploy["model_id"] == "test-model-v1"
    assert created_deploy["status"] == "provisioning"
    print("Deployment created successfully.")

    # 3. Verify it appears in the list
    resp = requests.get(f"{BASE_URL}/api/deployment/")
    assert resp.status_code == 200
    deployments = resp.json()
    assert len(deployments) == initial_count + 1
    found = False
    for d in deployments:
        if d["id"] == created_deploy["id"]:
            found = True
            assert d["cpu"] == "2"
            break
    assert found
    print("Deployment verified in list.")

def test_labeling_flow():
    print("\nTesting Labeling Task Flow...")
    
    # 1. List existing tasks
    resp = requests.get(f"{BASE_URL}/api/labeling/")
    assert resp.status_code == 200
    initial_count = len(resp.json())
    print(f"Initial tasks: {initial_count}")

    # 2. Create new task
    # Note: labeling create endpoint uses query params
    params = {
        "name": "Test Labeling Task",
        "type": "text"
    }
    resp = requests.post(f"{BASE_URL}/api/labeling/create", params=params)
    assert resp.status_code == 200
    created_task = resp.json()
    assert created_task["name"] == "Test Labeling Task"
    print("Labeling task created successfully.")

    # 3. Verify it appears in the list
    resp = requests.get(f"{BASE_URL}/api/labeling/")
    assert resp.status_code == 200
    tasks = resp.json()
    assert len(tasks) == initial_count + 1
    found = False
    for t in tasks:
        if t["id"] == created_task["id"]:
            found = True
            assert t["name"] == "Test Labeling Task"
            break
    assert found
    print("Labeling task verified in list.")

if __name__ == "__main__":
    try:
        test_health()
        test_deployment_flow()
        test_labeling_flow()
        print("\nAll integration tests passed successfully!")
    except Exception as e:
        print(f"\nTest Failed: {e}")
        exit(1)
