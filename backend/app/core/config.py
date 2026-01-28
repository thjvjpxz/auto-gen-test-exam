from functools import lru_cache
from typing import List

from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Cấu hình ứng dụng đọc từ biến môi trường."""

    app_name: str = "Exam AI Backend"
    debug: bool = False

    # Database & cache
    database_url: str
    redis_url: str

    # Bảo mật
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 7

    # AI
    gemini_api_key: str

    # CORS
    cors_origins: List[AnyUrl] = []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Trả về instance Settings được cache để tránh tạo lại nhiều lần."""

    return Settings()  # type: ignore[call-arg]

