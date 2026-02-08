"""SQLAlchemy model for hint usage tracking."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.attempt import ExamAttempt
    from app.models.user import User


class AttemptHintUsage(Base, TimestampMixin):
    """Model for attempt_hint_usages table.
    
    Tracks which hints have been purchased for each attempt.
    Prevents duplicate purchases via unique constraint.
    """

    __tablename__ = "attempt_hint_usages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    attempt_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("exam_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_key: Mapped[str] = mapped_column(String(100), nullable=False)

    hint_level: Mapped[int] = mapped_column(Integer, nullable=False)

    coin_cost: Mapped[int] = mapped_column(Integer, nullable=False)

    hint_content: Mapped[str] = mapped_column(Text, nullable=False)

    attempt: Mapped["ExamAttempt"] = relationship(
        "ExamAttempt",
        back_populates="hint_usages",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="hint_usages",
    )

    __table_args__ = (
        UniqueConstraint(
            "attempt_id",
            "question_key",
            "hint_level",
            name="uq_attempt_question_hint_level",
        ),
    )
