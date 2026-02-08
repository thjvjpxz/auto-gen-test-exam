"""SQLAlchemy model for coin transaction ledger."""

import enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.attempt import ExamAttempt
    from app.models.user import User


class TransactionType(str, enum.Enum):
    """Type of coin transaction."""

    REWARD = "reward"
    HINT_PURCHASE = "hint_purchase"
    ADJUSTMENT = "adjustment"


class CoinTransaction(Base, TimestampMixin):
    """Model for coin_transactions table.
    
    Audit trail for all coin balance changes.
    Supports idempotency via unique idempotency_key.
    """

    __tablename__ = "coin_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attempt_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("exam_attempts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    type: Mapped[TransactionType] = mapped_column(
        Enum(
            TransactionType,
            name="transaction_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )

    amount: Mapped[int] = mapped_column(Integer, nullable=False)

    balance_before: Mapped[int] = mapped_column(Integer, nullable=False)

    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)

    idempotency_key: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
    )

    meta_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="coin_transactions",
    )
    attempt: Mapped["ExamAttempt"] = relationship(
        "ExamAttempt",
        back_populates="coin_transactions",
    )
