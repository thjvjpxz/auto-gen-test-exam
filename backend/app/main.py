from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    """Khởi tạo instance FastAPI chính của hệ thống."""

    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
    )

    # CORS cho frontend Next.js
    origins = [str(origin) for origin in settings.cors_origins]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Đăng ký routers
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")

    return app


app = create_app()

