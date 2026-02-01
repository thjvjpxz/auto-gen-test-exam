from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select

from app.api.v1.attempts import router as attempts_router
from app.api.v1.auth import router as auth_router
from app.api.v1.exams import router as exams_router
from app.api.v1.health import router as health_router
from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User, UserRole


async def seed_admin_user() -> None:
    """Tạo admin user mặc định nếu chưa tồn tại."""
    settings = get_settings()

    async with SessionLocal() as session:
        stmt = select(User).where(User.email == settings.admin_email)
        result = await session.execute(stmt)
        existing_admin = result.scalar_one_or_none()

        if existing_admin is None:
            admin = User(
                email=settings.admin_email,
                name=settings.admin_name,
                password_hash=hash_password(settings.admin_password),
                role=UserRole.ADMIN,
            )
            session.add(admin)
            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_admin_user()

    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        for error in errors:
            msg = error.get("msg", "")
            if isinstance(msg, str) and msg.startswith("Value error, "):
                error["msg"] = msg.replace("Value error, ", "", 1)
            
            ctx = error.get("ctx")
            if ctx and isinstance(ctx, dict):
                cleaned_ctx = {}
                for key, value in ctx.items():
                    if isinstance(value, Exception):
                        cleaned_ctx[key] = str(value)
                    else:
                        cleaned_ctx[key] = value
                error["ctx"] = cleaned_ctx
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": errors},
        )

    origins = settings.cors_origins
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(exams_router, prefix="/api")
    app.include_router(attempts_router, prefix="/api/v1")

    return app


app = create_app()

