# Entry point for the backend application
# Redirects to the main app implementation in app/main.py

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
