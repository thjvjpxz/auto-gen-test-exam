import json
from functools import lru_cache
from typing import Any, List, Optional, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings


def _normalize_urls(urls: List[Any]) -> List[str]:
    """Normalize danh sách URLs thành list string đã trim và loại bỏ empty.

    Args:
        urls: List các URL có thể là string hoặc bất kỳ type nào.

    Returns:
        List các URL string đã được normalize.
    """
    return [str(url).strip() for url in urls if url]


def _parse_json_array(value: str) -> Optional[List[str]]:
    """Parse JSON array string thành list URLs.

    Args:
        value: String có thể là JSON array format.

    Returns:
        List URLs nếu parse thành công, None nếu không phải JSON array hợp lệ.
    """
    if not (value.startswith("[") and value.endswith("]")):
        return None

    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return _normalize_urls(parsed)
    except (json.JSONDecodeError, TypeError):
        pass

    return None


def _parse_comma_separated(value: str) -> List[str]:
    """Parse comma-separated string thành list URLs.

    Args:
        value: String chứa URLs phân cách bởi dấu phẩy.

    Returns:
        List các URL string đã được normalize.
    """
    return [url.strip() for url in value.split(",") if url.strip()]


def parse_cors_origins(value: Union[str, List[str], None]) -> List[str]:
    """Parse CORS origins từ nhiều format khác nhau thành list.

    Hỗ trợ format:
    - JSON array: '["http://localhost:3000"]' hoặc '["http://localhost:3000","http://localhost:3001"]'
    - Comma-separated: "http://localhost:3000,http://localhost:3001"
    - Single value: "http://localhost:3000"
    - Empty string: "" -> []
    - Already a list: giữ nguyên và normalize

    Args:
        value: Giá trị từ biến môi trường, có thể là str, list hoặc None.

    Returns:
        List các URL string đã được normalize (trim whitespace, loại bỏ empty).
    """
    if isinstance(value, list):
        return _normalize_urls(value)

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []

        json_result = _parse_json_array(stripped)
        if json_result is not None:
            return json_result

        return _parse_comma_separated(stripped)

    return []


class Settings(BaseSettings):
    """Cấu hình ứng dụng đọc từ biến môi trường."""

    app_name: str = "Exam AI Backend"
    debug: bool = False

    database_url: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 7

    gemini_api_key: str

    cors_origins: List[str] = []

    admin_email: str = "admin@123.com"
    admin_password: str = "123"
    admin_name: str = "thjvjpxz"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def validate_cors_origins(cls, value: Union[str, List[str], None]) -> List[str]:
        """Validate và parse CORS origins từ biến môi trường.

        Hỗ trợ cả JSON array format và comma-separated format.

        Args:
            value: Giá trị từ biến môi trường, có thể là string (JSON hoặc comma-separated) hoặc list.

        Returns:
            List các URL string đã được parse và trim whitespace.
        """
        return parse_cors_origins(value)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Trả về instance Settings được cache để tránh tạo lại nhiều lần."""

    return Settings()

