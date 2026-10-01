from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Terminal Labs Lead Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database: Supports SQLite (out-of-box async) or PostgreSQL
    DATABASE_URL: str = "sqlite+aiosqlite:///./terminal_labs.db"
    
    # Security / Auth
    SECRET_KEY: str = "terminal-labs-super-secret-production-key-change-in-prod-2025"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # AI - Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    DEMO_MODE: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Lead Gen Default Settings
    RATE_LIMIT_DELAY_SECONDS: float = 1.0
    MAX_DISCOVERY_RESULTS: int = 50
    REQUIRE_APPROVAL_BEFORE_SEND: bool = True

    # Google OAuth 2.0 & Mail Integration
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/settings/email/callback"
    DEFAULT_SENDER_EMAIL: str = "partnerships@terminallabs.com"
    DEFAULT_SENDER_NAME: str = "Terminal Labs Partnerships"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

settings = Settings()

