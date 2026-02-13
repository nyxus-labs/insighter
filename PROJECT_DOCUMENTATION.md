# The Insighter Enterprise - Project Documentation

## 1. Application Overview

**The Insighter Enterprise** is an all-in-one Data Science & MLOps platform designed to streamline the journey from raw data to production-ready models. It integrates Jupyter-like notebooks, experiment tracking, automated labeling, and one-click deployments into a single, cohesive workspace.

### Core Value Proposition
-   **Unified Workflow**: No more switching between browser tabs; data cleaning, model training, and deployment live in one place.
-   **Project-Centric**: Every asset (dataset, model, notebook, deployment) is tied to a project, ensuring complete auditability and governance.
-   **Enterprise-Grade Security**: Built on Supabase with Row-Level Security (RLS) and JWT-based authentication.
-   **Extensible Architecture**: A plug-and-play "Tool Registry" allows teams to add custom environments easily.

## 2. Key Features

### 📁 Project Management
-   Create and manage workspaces with granular visibility controls.
-   Collaborate with team members via shared project access.
-   Real-time activity tracking and achievements.

### 💾 Data Hub
-   Support for multiple formats: CSV, JSON, Parquet.
-   Automated schema inference and metadata extraction.
-   Integration with Supabase Storage for secure, scalable artifact management.

### 📝 Interactive Notebooks
-   Python and R support out of the box.
-   Real-time execution logs and cell-based interaction.
-   Direct integration with the platform's System Bus for cross-tool data sharing.

### 📊 Model Registry & Experiments
-   Integrated experiment tracking (MLflow compatible).
-   Versioned model registry with performance metrics (Accuracy, AUC, etc.).
-   Support for major frameworks: Scikit-learn, PyTorch, TensorFlow, XGBoost.

### 🔄 Workflow Orchestration
-   Visual tool orchestration hub.
-   Automated pipeline execution and monitoring.

### 🏷️ Labeling & Annotation
-   Built-in image and text labeling tools.
-   Workflow integration: send labeled data directly to training environments.

### 🚀 One-Click Deployment
-   Deploy models as REST API endpoints.
-   Monitoring and health checks for production models.

## 3. Installation & Setup

### Prerequisites
-   **Node.js**: 18.x or later.
-   **Python**: 3.11 or later.
-   **Next.js**: 16.1.6 (Turbopack).
-   **Supabase Account**: Required for database and auth.
-   **MLflow**: (Optional) For advanced experiment tracking.

### Frontend Setup
```bash
cd frontend
npm install
# Configure .env with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_METADATA_BASE
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
# Configure .env with SUPABASE_URL, SUPABASE_KEY, and SUPABASE_JWT_SECRET
python main.py
```

## 4. Configuration Details

### Environment Variables (Frontend)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | (Required) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | (Required) |
| `NEXT_PUBLIC_METADATA_BASE` | Base URL for metadata | `http://localhost:3000` |

### Environment Variables (Backend)
| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase Project URL | (Required) |
| `SUPABASE_KEY` | Supabase Service Role Key | (Required) |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret | (Required) |

## 5. Deployment Procedures

### Production Build
1.  **Frontend**: `npm run build` generates an optimized Next.js 16 production build.
2.  **Backend**: Use a production-grade server like Gunicorn with Uvicorn workers:
    ```bash
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
    ```

### Infrastructure Requirements
-   **Database**: PostgreSQL (provided by Supabase).
-   **Storage**: S3-compatible (provided by Supabase Storage).
-   **Proxy**: Uses `proxy.ts` (Next.js 16) instead of deprecated `middleware.ts`.
-   **Server**: Minimum 2 vCPUs, 4GB RAM recommended for standard workloads.

## 6. Troubleshooting Guide

### Common Issues
-   **500 Internal Server Error (Projects)**: Ensure the user's profile exists in the `profiles` table. The backend attempts automatic creation, but check Supabase logs for RLS policy violations.
-   **AuthApiError (Email Not Confirmed)**: Confirm that email confirmation is either completed by the user or disabled in Supabase Auth settings.
-   **Slow Navigation**: Usually caused by heavy image assets or unoptimized API calls. Ensure `Next/Image` is used and API endpoints are paginated.
-   **Module Not Found (date-fns)**: Run `npm install date-fns` in the frontend directory and clear the `.next` cache.

---
*Single Source of Truth for The Insighter Enterprise | Version: 2.0.0*
