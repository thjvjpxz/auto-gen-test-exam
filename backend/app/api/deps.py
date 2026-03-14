"""Shared FastAPI dependencies for authentication and authorization."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole


DbSessionDep = Annotated[AsyncSession, Depends(get_db)]
AuthorizationHeader = Annotated[str | None, Header(alias="Authorization")]


def _extract_token(authorization: str | None) -> tuple[str, dict]:
    """Extract and validate Bearer token from Authorization header.

    Args:
        authorization: Raw Authorization header value.

    Returns:
        Tuple of (raw_token, decoded_payload).

    Raises:
        HTTPException: If header is missing/malformed or token is invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thiếu hoặc sai định dạng Authorization header",
        )

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
        )

    return token, payload


def get_current_user_token(
    authorization: AuthorizationHeader = None,
) -> str:
    """Extract validated token string from Authorization header."""
    token, _ = _extract_token(authorization)
    return token


async def get_current_user(
    db: DbSessionDep,
    authorization: AuthorizationHeader = None,
) -> User:
    """Resolve current authenticated user from Authorization header.

    Args:
        db: Database session.
        authorization: Raw Authorization header value.

    Returns:
        Authenticated User instance.

    Raises:
        HTTPException: If token invalid, user not found, or account disabled.
    """
    _, payload = _extract_token(authorization)
    user_id = payload["sub"]

    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại hoặc đã bị khóa",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản đã bị vô hiệu hóa",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_admin(current_user: CurrentUser) -> User:
    """Dependency to ensure user is an admin.

    Args:
        current_user: The authenticated user.

    Returns:
        User if admin, raises HTTPException otherwise.

    Raises:
        HTTPException: If user is not an admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có quyền thực hiện thao tác này",
        )
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]

