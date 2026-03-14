"""SQLAlchemy model for exam attempts."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.exam import JSONText

if TYPE_CHECKING:
    from app.models.coin_transaction import CoinTransaction
    from app.models.exam import Exam
    from app.models.hint_usage import AttemptHintUsage
    from app.models.user import User


class AttemptStatus(str, enum.Enum):
    """Status of an exam attempt."""

    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class ExamAttempt(Base, TimestampMixin):
    """Model for exam_attempts table.

    Represents a student's attempt at taking an exam, including their answers,
    scores, AI grading feedback, and anti-cheating violation logs.
    """

    __tablename__ = "exam_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    exam_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[AttemptStatus] = mapped_column(
        Enum(AttemptStatus, name="attempt_status"),
        nullable=False,
        default=AttemptStatus.IN_PROGRESS,
    )

    answers_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSONText,
        nullable=True,
    )

    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    ai_grading_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSONText,
        nullable=True,
    )

    # Violation counters
    tab_switch_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fullscreen_exit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    copy_paste_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    window_blur_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    devtools_open_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    violation_logs: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONText,
        nullable=True,
    )

    trust_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        nullable=False,
    )
    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    time_taken: Mapped[int | None] = mapped_column(Integer, nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    coin_rewarded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    coin_reward_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hint_spent_total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    exam: Mapped["Exam"] = relationship("Exam", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="attempts")
    coin_transactions: Mapped[list["CoinTransaction"]] = relationship(
        "CoinTransaction",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )
    hint_usages: Mapped[list["AttemptHintUsage"]] = relationship(
        "AttemptHintUsage",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )

    def calculate_trust_score(self) -> int:
        """Calculate trust score based on violation counts.

        Weights per TECH_SPEC:
        - tab_switch: -10 points each
        - fullscreen_exit: -8 points each
        - copy_paste: -12 points each
        - window_blur: -5 points each
        - devtools_open: -15 points each

        Returns:
            Trust score between 0 and 100.
        """
        deductions = (
            self.tab_switch_count * 10
            + self.fullscreen_exit_count * 8
            + self.copy_paste_count * 12
            + self.window_blur_count * 5
            + self.devtools_open_count * 15
        )
        return max(0, 100 - deductions)

    def get_total_violation_count(self) -> int:
        """Get total number of violations across all types."""
        return (
            self.tab_switch_count
            + self.fullscreen_exit_count
            + self.copy_paste_count
            + self.window_blur_count
            + self.devtools_open_count
        )

    def add_violation(
        self,
        violation_type: str,
        timestamp: str,
        details: str = "",
    ) -> None:
        """Add a violation to the logs and update counters.

        Creates a new list reference so SQLAlchemy detects the JSON change.

        Args:
            violation_type: Type of violation.
            timestamp: ISO timestamp of the violation.
            details: Additional details about the violation.
        """
        current_logs = list(self.violation_logs or [])
        current_logs.append({
            "type": violation_type,
            "timestamp": timestamp,
            "details": details,
        })
        self.violation_logs = current_logs

        if violation_type == "tab_switch":
            self.tab_switch_count += 1
        elif violation_type == "fullscreen_exit":
            self.fullscreen_exit_count += 1
        elif violation_type in ("copy", "paste", "copy_paste"):
            self.copy_paste_count += 1
        elif violation_type == "window_blur":
            self.window_blur_count += 1
        elif violation_type == "devtools_open":
            self.devtools_open_count += 1

        self.trust_score = self.calculate_trust_score()

