import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.api.routers.auth import get_current_user

client = TestClient(app)

# Mock user data
mock_user = MagicMock()
mock_user.user_id = "test-user-id"
mock_user.email = "test@example.com"
mock_user.username = "testuser"

# Dependency override
def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

@patch("app.api.routers.projects.service_supabase")
@patch("app.api.routers.projects.authenticated_supabase")
def test_create_project_with_profile_creation(mock_auth_supabase, mock_service_supabase):
    # Setup mocks
    # 1. Profile check returns empty (profile doesn't exist)
    mock_service_supabase.table().select().eq().execute.return_value = MagicMock(data=[])
    
    # 2. Profile insertion success
    mock_service_supabase.table().insert().execute.return_value = MagicMock(data=[{"id": "test-user-id"}])
    
    # 3. Project insertion success
    mock_auth_supabase.table().insert().execute.return_value = MagicMock(data=[{
        "id": "new-project-id",
        "name": "Test Project",
        "owner_id": "test-user-id",
        "type": "data-analyst",
        "visibility": "private",
        "tags": ["data-analyst", "workspace-init"],
        "created_at": "2023-01-01T00:00:00Z"
    }])

    # Execute request
    response = client.post("/api/projects/", json={
        "name": "Test Project",
        "type": "data-analyst",
        "visibility": "private",
        "tags": ["data-analyst", "workspace-init"]
    })

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "new-project-id"
    assert data["name"] == "Test Project"
    
    # Verify profile creation was called with normalized role
    mock_service_supabase.table.assert_any_call('profiles')
    # Check that insert was called with role='data_analyst' (normalized from data-analyst)
    insertion_args = mock_service_supabase.table('profiles').insert.call_args[0][0]
    assert insertion_args["role"] == "data_analyst"

@patch("app.api.routers.projects.service_supabase")
@patch("app.api.routers.projects.authenticated_supabase")
def test_create_project_existing_profile(mock_auth_supabase, mock_service_supabase):
    # Setup mocks
    # 1. Profile check returns existing profile
    mock_service_supabase.table().select().eq().execute.return_value = MagicMock(data=[{"id": "test-user-id"}])
    
    # 2. Project insertion success
    mock_auth_supabase.table().insert().execute.return_value = MagicMock(data=[{
        "id": "new-project-id",
        "name": "Existing Profile Project",
        "owner_id": "test-user-id",
        "type": "General",
        "visibility": "private",
        "tags": [],
        "created_at": "2023-01-01T00:00:00Z"
    }])

    # Execute request
    response = client.post("/api/projects/", json={
        "name": "Existing Profile Project"
    })

    # Assertions
    assert response.status_code == 200
    # Verify profile insertion was NOT called
    assert mock_service_supabase.table('profiles').insert.called is False

def test_create_project_invalid_payload():
    # Execute request with missing required field 'name'
    response = client.post("/api/projects/", json={
        "type": "General"
    })

    # Assertions
    assert response.status_code == 422 # Validation Error
