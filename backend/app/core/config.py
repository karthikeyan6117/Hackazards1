from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Hackazards API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./hackazards.db"

    SCHEDULER_INTERVAL_SECONDS: int = 60
    REQUEST_TIMEOUT_SECONDS: int = 10
    UPTIME_WINDOW_HOURS: int = 24

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # AI Configuration
    GROQ_API_KEY: str
    MODEL_NAME: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()