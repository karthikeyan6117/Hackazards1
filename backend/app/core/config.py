from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Hackazards API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./hackazards.db"

    SCHEDULER_INTERVAL_SECONDS: int = 60
    REQUEST_TIMEOUT_SECONDS: int = 10
    UPTIME_WINDOW_HOURS: int = 24

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
