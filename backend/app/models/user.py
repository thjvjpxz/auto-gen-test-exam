import enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.attempt import ExamAttempt
    from app.models.coin_transaction import CoinTransaction
    from app.models.exam import Exam
    from app.models.hint_usage import AttemptHintUsage
    from app.models.wallet import UserWallet


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    """Model user ứng với bảng users."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False,
    )
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    exams: Mapped[list["Exam"]] = relationship(
        "Exam",
        back_populates="creator",
        cascade="all, delete-orphan",
    )
    attempts: Mapped[list["ExamAttempt"]] = relationship(
        "ExamAttempt",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    wallet: Mapped["UserWallet"] = relationship(
        "UserWallet",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    coin_transactions: Mapped[list["CoinTransaction"]] = relationship(
        "CoinTransaction",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    hint_usages: Mapped[list["AttemptHintUsage"]] = relationship(
        "AttemptHintUsage",
        back_populates="user",
        cascade="all, delete-orphan",
    )

