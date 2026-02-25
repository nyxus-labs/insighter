# Backend Installation Guide

## Quick Start (Recommended)

Install core dependencies only:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## What Changed

The original `requirements.txt` included 75+ packages with conflicting dependencies (Apache Airflow, Prefect, Dagster, Doccano, Label Studio, Roboflow, etc.), which caused pip dependency resolution to fail after hours of backtracking.

**Solution**: Split requirements into two files:

- **requirements.txt** - Core dependencies only (30 packages)
- **requirements-optional.txt** - Advanced features (clearly labeled, non-required)

## Installing Optional Features

If you need specific advanced functionality, install only what you need:

### For Image/Text Labeling (choose one):

```bash
# Label Studio (recommended, more features)
pip install label-studio>=1.11.0

# OR Doccano (lighter weight)
pip install doccano>=1.12.0
```

### For Orchestration (choose at most one):

```bash
# Apache Airflow (production, heavy dependencies)
pip install apache-airflow>=2.7.0

# OR Prefect (modern, cloud-native)
pip install prefect>=3.0.0

# OR Dagster (declarative, advanced)
pip install dagster>=1.5.0
```

### For Computer Vision:

```bash
pip install roboflow>=1.0.0 opencv-python>=4.8.0
```

## Why This Matters

**Before**: `pip install -r requirements.txt` could take 30+ minutes and still fail  
**After**: `pip install -r requirements.txt` completes in 2-5 minutes

## Production Deployment

For production, specify exact versions in `requirements.txt`:

```bash
# Generate lock file
pip freeze > requirements.lock

# Deploy with pinned versions
pip install -r requirements.lock
```

## Troubleshooting

If you still get dependency resolution issues:

1. **Clear pip cache**: `pip cache purge`
2. **Upgrade pip**: `pip install --upgrade pip`
3. **Use constraint file**: 
   ```bash
   pip install -r requirements.txt -c constraints.txt
   ```
4. **Install one package at a time** if specific packages fail

## Environment Variables

Create a `.env` file in the backend directory:

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Use local PostgreSQL instead of Supabase
DATABASE_URL=postgresql://user:password@localhost:5432/insighter_db

# Server
API_V1_STR=/api/v1
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here

# MLflow (optional)
MLFLOW_TRACKING_URI=http://localhost:5000
```

## Running the Server

```bash
# Development (with auto-reload)
uvicorn main:app --reload --port 8000

# Production (from root of backend dir)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Visit: http://localhost:8000/docs for API documentation
