"""Phiên bản v1 của REST API."""

from app.api.v1.attempts import router as attempts_router
from app.api.v1.auth import router as auth_router
from app.api.v1.exams import router as exams_router
from app.api.v1.health import router as health_router

__all__ = [
    "attempts_router",
    "auth_router",
    "exams_router",
    "health_router",
]
