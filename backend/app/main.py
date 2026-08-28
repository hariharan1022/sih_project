import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, patients, sessions, history, questions, documents, ocr, ai, summary, red_flags, doctors, admin, audit, abdm

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    await init_db()
    # Import and run seed data setup automatically on start if DB empty
    from app.seed import seed_initial_data
    await seed_initial_data()
    yield
    # Shutdown actions
    print("Shutting down MediKiosk server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory static mount
upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(patients.router, prefix=api_v1)
app.include_router(sessions.router, prefix=api_v1)
app.include_router(history.router, prefix=api_v1)
app.include_router(questions.router, prefix=api_v1)
app.include_router(documents.router, prefix=api_v1)
app.include_router(ai.router, prefix=api_v1)
app.include_router(summary.router, prefix=api_v1)
app.include_router(red_flags.router, prefix=api_v1)
app.include_router(doctors.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)
app.include_router(audit.router, prefix=api_v1)
app.include_router(abdm.router, prefix=api_v1)

@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs",
        "ollama_config": {
            "url": settings.OLLAMA_BASE_URL,
            "model": settings.OLLAMA_MODEL
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "HEALTHY", "ai_engine": "Ollama / Qwen3 Fallback", "ayush_mode": settings.AYUSH_MODE_DEFAULT}
