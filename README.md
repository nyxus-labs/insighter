# The Insighter Enterprise

The Insighter is a comprehensive Data Science Platform integrating various tools into a unified workflow.

## Architecture

The platform follows a **Tool Orchestrator** pattern, ensuring tools are modular, isolated, and dynamically loadable.

### Frontend (Next.js)
- **Tool Registry**: Defined in `frontend/lib/constants/tools.ts`. Maps tool IDs to environment types.
- **Dynamic Environments**: Located in `frontend/components/studio/environments/`.
- **Tool Hook**: `useTool` (`frontend/hooks/useTool.ts`) handles secure communication with the backend.

### Backend (FastAPI)
- **Modular Services**: Each tool category has its own service in `backend/app/tools/`.
- **BaseTool ABC**: All tools inherit from `BaseTool` (`backend/app/tools/base.py`) ensuring a consistent API (`initialize`, `execute`, `terminate`, `get_status`).
- **Routers**: Each tool exposes a standard set of endpoints via FastAPI routers.
- **Data Persistence**: Uses SQLite (via SQLAlchemy) for local data persistence. Real client libraries (Docker, MLflow) are integrated.

## Data Seeding

The project uses a local SQLite database populated with realistic fake data.

1. **Initialize Database**:
   ```bash
   cd backend
   python seed.py
   ```
   This command creates the database schema and populates it with:
   - Sample Datasets (metadata)
   - Experiment Runs (simulating MLflow)
   - Labeling Tasks (simulating images)
   - Deployments (simulating K8s services)

## integrated Tools

| Category | Environment Type | Real Data Source |
|----------|------------------|------------------|
| **Data Science** | `notebook` | Jupyter Kernel (simulated) |
| **Data Analytics** | `data` | SQLite (`datasets` table) |
| **Machine Learning** | `experiments` | MLflow Client / SQLite Fallback |
| **Labeling** | `labeling` | SQLite (`labeling_tasks` table) |
| **Deployment** | `deployment` | Docker Client / SQLite Fallback |

## How to Add a New Tool

1. **Backend**:
   - Create a new directory in `backend/app/tools/<new_tool>/`.
   - Implement `Service` inheriting from `BaseTool`.
   - Create `router.py` to expose the service.
   - Register the router in `backend/app/main.py`.

2. **Frontend**:
   - Add the tool entry to `TOOLS` in `frontend/lib/constants/tools.ts`.
   - Create or reuse an environment component in `frontend/components/studio/environments/`.
   - The `useTool` hook will automatically route requests based on the `environmentType`.

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py  # Initialize data
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
