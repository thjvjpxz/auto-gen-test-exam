from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from sqlalchemy import select

from app.api.deps import DbSessionDep, get_current_user
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import User, UserRole


router = APIRouter(prefix="/auth", tags=["auth"])


class UserOut(BaseModel):
    """Thông tin user trả về cho client."""

    id: int
    email: EmailStr
    name: str
    role: UserRole
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    name: str = Field(min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """Ràng buộc đơn giản để tránh mật khẩu quá yếu."""

        if value.isdigit() or value.isalpha():
            msg = "Mật khẩu cần bao gồm cả chữ và số"
            raise ValueError(msg)
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


async def _get_user_by_email(db: DbSessionDep, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserOut,
    summary="Đăng ký tài khoản mới",
)
async def register_user(
    data: RegisterRequest,
    db: DbSessionDep,
) -> Any:
    existing = await _get_user_by_email(db=db, email=data.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng",
        )

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        role=UserRole.USER,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập, trả về access_token và set refresh_token cookie",
)
async def login(
    data: LoginRequest,
    response: Response,
    db: DbSessionDep,
) -> Any:
    """
    Đăng nhập bằng email/password.

    - Trả về access_token (JWT) trong body
    - Set refresh_token trong HttpOnly, Secure cookie
    """

    user = await _get_user_by_email(db=db, email=data.email)
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    subject = str(user.id)
    access_token = create_access_token(subject=subject)
    refresh_token = create_refresh_token(subject=subject)

    # Set refresh token cookie: HttpOnly + Secure + SameSite=Strict
    # Frontend chỉ dùng access_token cho Authorization header.
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
    )

    return TokenResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Lấy thông tin user hiện tại",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Trả về thông tin user hiện tại dựa trên access token."""

    return UserOut.model_validate(current_user)
