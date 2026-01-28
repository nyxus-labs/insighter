# The Insighter Enterprise - Project Documentation

## 1. Application Overview

**The Insighter Enterprise** is a comprehensive Data Science Platform designed to unify the entire machine learning lifecycle into a single, cohesive workflow. It bridges the gap between data engineering, model development, and deployment, providing a seamless experience for data scientists, ML engineers, and analysts.

### Value Proposition
- **Unified Ecosystem:** Integrates disparate tools (Jupyter, MLflow, Docker, Labeling) into one interface.
- **Project-Centric Workflow:** Organizes all assets (data, code, models) under specific projects for better governance.
- **Modular Architecture:** Extensible "Tool Registry" allows for easy addition of new capabilities.
- **Collaboration First:** Built-in sharing, visibility controls, and team management features.

### Key Technical Components
- **Frontend:** Next.js 14 (App Router) with React Server Components, Tailwind CSS, and Framer Motion for a high-performance, responsive UI.
- **Backend:** FastAPI (Python) for robust API services, integrating directly with ML libraries (PyTorch, Scikit-learn).
- **Database & Auth:** Supabase (PostgreSQL) for secure user data, authentication, and real-time capabilities.
- **Storage:** Supabase Storage (S3-compatible) for managing datasets, model artifacts, and logs.

---

## 2. User Journey: Niki (The Data Scientist)

This section details the complete workflow for a new user, "Niki", from her first interaction to performing complex ML tasks.

### Phase 1: Registration & Authentication

**Goal:** Securely access the platform.

1.  **Registration (`/signup`)**
    *   **Action:** Niki visits the Signup page.
    *   **Input Fields:**
        *   `Email Address` (Valid email format required)
        *   `Password` (Min 8 chars, mix of letters/numbers)
        *   `Full Name` (First and Last)
    *   **Process:**
        *   Frontend validates inputs.
        *   Supabase Auth creates a new user record.
        *   A confirmation email is sent to Niki's inbox.
    *   **Outcome:** Account created; Niki is redirected to Login with a "Please verify your email" notice.

2.  **Login (`/login`)**
    *   **Action:** Niki enters her credentials.
    *   **Validation:** System checks email/password against Supabase Auth.
    *   **Session:** On success, a secure JWT session is established. The global `UserContext` is updated with her profile.
    *   **Recovery:** "Forgot Password?" link triggers a reset email flow if needed.

### Phase 2: Post-Login Onboarding & Dashboard

**Goal:** Orient Niki and guide her to her first action.

1.  **First Impression (`/dashboard`)**
    *   **Header:** "Welcome back, Niki" (Personalized Greeting).
    *   **System Status:** A "System Status: OPTIMAL" indicator confirms platform health.
    *   **Empty State:** Since it's her first time, the Project Grid is empty, displaying a prominent "Create Your First Project" call-to-action.

2.  **Navigation Layout**
    *   **Sidebar (Left):** Persistent navigation to core modules:
        *   📁 **Projects:** Main workspace hub.
        *   💾 **Data:** Global dataset catalog.
        *   📝 **Notebooks:** Jupyter-compatible environments.
        *   📊 **Models:** Model registry and experiment tracking.
        *   🔄 **Workflow:** Tool orchestration hub.
        *   ⚙️ **Settings:** Profile and preference management.

### Phase 3: Core Functionality & User Actions

Niki proceeds to build a Credit Risk Model. Here is her workflow:

#### A. Project Creation
*   **Goal:** Create a workspace for the credit risk analysis.
*   **Steps:**
    1.  Click **"+ New Project"** on the Dashboard.
    2.  **Modal:** Enter Name ("Credit Risk Alpha"), Description, and Visibility (Private/Team).
    3.  **Submit:** Backend creates the project entry in PostgreSQL.
*   **Outcome:** Niki is redirected to the **Studio Interface** (`/studio/[id]`) for her new project.

#### B. Data Ingestion
*   **Goal:** Upload the raw transaction data.
*   **Steps:**
    1.  Navigate to **Data** tab (`/dashboard/data`) or Project Data view.
    2.  Click **"Upload Dataset"**.
    3.  **Upload Modal:** Drag & drop `transactions.csv`.
    4.  **Processing:** System validates file type (CSV/Parquet), uploads to Supabase Storage (`uploads/niki_id/transactions.csv`), and creates a metadata record.
*   **Outcome:** The dataset appears in the catalog with status "Ready" and size statistics.

#### C. Exploratory Analysis (Notebooks)
*   **Goal:** Clean and analyze the data.
*   **Steps:**
    1.  In the Project Studio, select **"Notebooks"**.
    2.  Launch a new Jupyter environment.
    3.  **Code Editor:** Write Python code to import pandas, load the dataset, and visualize distributions.
*   **Outcome:** Interactive plots and data insights are generated within the browser.

#### D. Model Training & Tracking
*   **Goal:** Train an XGBoost classifier.
*   **Steps:**
    1.  Navigate to **Models** (`/dashboard/models`) or use the **Experiments** tool in Studio.
    2.  **Configuration:** Define algorithm (XGBoost), hyperparameters, and input dataset.
    3.  **Execution:** Click "Train". The backend initiates a training job.
    4.  **Monitoring:** Watch real-time logs and metrics (Accuracy, AUC) in the **Tool Monitor**.
*   **Outcome:** A new model version (`v1.0`) is registered in the Model Registry with associated artifacts.

#### E. Deployment
*   **Goal:** Serve the model for predictions.
*   **Steps:**
    1.  Select the trained model in the **Deployment** tool.
    2.  Click **"Deploy"**.
    3.  **Backend:** Containers are spun up (simulated or via Docker).
    4.  **Result:** An API Endpoint URL is generated (`/api/v1/predict/credit-risk-alpha`).

---

## 3. Architecture Summary

### Frontend Application (`/frontend`)
*   **Next.js App Router:** Handles routing, server-side rendering, and layout composition.
*   **Tool Registry (`lib/constants/tools.ts`):** The central configuration file defining all available tools (ID, Name, Icon, Environment Type).
*   **Studio Layout:** A dynamic shell that loads specific "Tool Environments" (React Components) based on the user's selection.
*   **State Management:**
    *   `UserContext`: Global user profile and auth state.
    *   `ToolContext`: Pub/Sub system for inter-tool communication (e.g., Notebook sending data to Experiment Tracker).

### Backend Services (`/backend`)
*   **FastAPI Main Application:** Serves REST endpoints for the frontend.
*   **Routers (`app/api/routers/`):** dedicated endpoints for `auth`, `projects`, `datasets`, `ml`, etc.
*   **Security:** JWT-based authentication via Supabase. RLS (Row Level Security) policies enforced at the database level.
*   **Tool Services:** specialized logic for handling tool-specific actions (e.g., `app/tools/ml.py` for training logic).

### Data Layer
*   **PostgreSQL (Supabase):** Relational data for Users, Projects, Datasets, and Model Metadata.
*   **Object Storage (Supabase Storage):** Flat file storage for large datasets and binary model artifacts.

---

*This document serves as the single source of truth for The Insighter Enterprise functionality.*
