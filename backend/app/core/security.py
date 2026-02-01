from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Băm mật khẩu bằng bcrypt_sha256"""
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """So sánh mật khẩu plain text với hash đã lưu."""
    return pwd_context.verify(password, password_hash)


def _build_payload(subject: str, expires_at: datetime) -> Dict[str, Any]:
    return {"sub": subject, "exp": expires_at}


def create_access_token(subject: str, expires_delta_minutes: int | None = None) -> str:
    """Tạo JWT access token cho user id/email."""

    settings = get_settings()
    expires_in = expires_delta_minutes or settings.access_token_expire_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_in)
    payload = _build_payload(subject=subject, expires_at=expire)
    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(subject: str) -> str:
    """Tạo refresh token với thời hạn dài hơn, dùng cho cookie HttpOnly."""

    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    payload = _build_payload(subject=subject, expires_at=expire)
    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> Dict[str, Any] | None:
    """Giải mã JWT, trả về payload hoặc None nếu không hợp lệ."""

    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        return None
