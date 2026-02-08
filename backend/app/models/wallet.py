"""SQLAlchemy model for user wallet and coin balance."""

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserWallet(Base, TimestampMixin):
    """Model for user_wallets table.
    
    Manages coin balance and lifetime statistics for each user.
    One-to-one relationship with User model.
    """

    __tablename__ = "user_wallets"

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    coin_balance: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    lifetime_earned: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    lifetime_spent: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    user: Mapped["User"] = relationship("User", back_populates="wallet")

    __table_args__ = (
        CheckConstraint("coin_balance >= 0", name="check_coin_balance_non_negative"),
    )
