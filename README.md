# 🛡️ The Insighter Enterprise

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The Insighter Enterprise** is a unified, project-centric Data Science Operations (DSOps) platform. It consolidates data ingestion, interactive exploration, model training, and production deployment into a single, high-performance interface.

---

## ✨ Key Features

-   **Unified Studio**: A project-centric workspace with plug-and-play tools for Notebooks, Experiments, and Data Management.
-   **System Bus Architecture**: Real-time communication between independent tools using a Publish/Subscribe pattern with strict Zod validation.
-   **Enterprise Auth**: Secure, JWT-based authentication powered by Supabase with granular Row-Level Security (RLS).
-   **ML Lifecycle Management**: Integrated experiment tracking, model registry, and one-click REST API deployments.
-   **Collaborative Data Hub**: Centralized dataset management supporting CSV, JSON, and Parquet with automated schema inference.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/The-Insighter-Enterprise.git
cd The-Insighter-Enterprise
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Set up .env with your Supabase credentials
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Set up .env with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start your first project!

---

## 🏗️ Architecture

The platform follows the **Unified Tool Architecture (UTA)** pattern:
-   **Frontend**: Next.js 14 App Router with specialized `ToolContext` for inter-tool orchestration.
-   **Backend**: FastAPI serving as a secure gateway to ML services and the data layer.
-   **Data Layer**: PostgreSQL (Supabase) for relational metadata and S3-compatible storage for artifacts.
-   **Security**: RLS-protected database access ensuring data isolation between users and teams.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**The Insighter Team** - [support@the-insighter.enterprise](mailto:support@the-insighter.enterprise)  
Project Link: [https://github.com/nyxus-dev-labs/Insighter](https://github.com/nyxus-dev-labs/Insighter)

---
*Built with ❤️ for the Data Science Community.*
