from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import select

from app.api.v1.admin import router as admin_router
from app.api.v1.attempts import router as attempts_router
from app.api.v1.auth import router as auth_router
from app.api.v1.exams import router as exams_router
from app.api.v1.health import router as health_router
from app.api.v1.hints import router as hints_router
from app.api.v1.progression import router as progression_router
from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User, UserRole


async def seed_admin_user() -> None:
    """Tạo hoặc update admin user mặc định, giữ nguyên data liên quan."""
    settings = get_settings()

    async with SessionLocal() as session:
        stmt = select(User).where(User.email == settings.admin_email)
        result = await session.execute(stmt)
        existing_admin = result.scalar_one_or_none()

        if existing_admin is not None:
            existing_admin.password_hash = hash_password(settings.admin_password)
            existing_admin.name = settings.admin_name
            existing_admin.role = UserRole.ADMIN
            existing_admin.is_deleted = False
        else:
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

    limiter = Limiter(key_func=get_remote_address)
    
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )
    
    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."},
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
    app.include_router(admin_router, prefix="/api")
    app.include_router(progression_router, prefix="/api/v1")
    app.include_router(hints_router, prefix="/api/v1")

    return app


app = create_app()

