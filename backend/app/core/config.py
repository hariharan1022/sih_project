import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediKiosk AI Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "medikiosk-secret-key-2026-production-sih")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database (SQLite default for simple demo, configurable to PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./medikiosk.db")
    
    # Local Ollama AI Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3:8b")
    OLLAMA_TIMEOUT: int = int(os.getenv("OLLAMA_TIMEOUT", "3"))
    
    # Hospital / Clinical Config
    AYUSH_MODE_DEFAULT: bool = os.getenv("AYUSH_MODE_DEFAULT", "True").lower() in ("true", "1", "yes")
    RED_FLAG_TRIAGE_ENABLED: bool = True
    MAX_DOCUMENT_SIZE_MB: int = 15
    SESSION_TIMEOUT_MINUTES: int = 30

    class Config:
        case_sensitive = True

settings = Settings()
