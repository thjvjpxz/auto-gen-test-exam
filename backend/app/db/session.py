from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings


settings = get_settings()


def _build_engine() -> AsyncEngine:
    """Tạo SQLAlchemy AsyncEngine từ DATABASE_URL."""

    return create_async_engine(
        settings.database_url,
        echo=settings.debug,
        pool_pre_ping=True,
    )


engine: AsyncEngine = _build_engine()
SessionLocal = async_sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    """Dependency FastAPI trả về session async."""

    async with SessionLocal() as session:
        yield session

