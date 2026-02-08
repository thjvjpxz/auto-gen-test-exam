"""Pydantic schemas for user progression and coin system."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserProgressionResponse(BaseModel):
    """User progression data including coin balance and stats."""

    coin_balance: int = Field(ge=0, description="Current coin balance")
    lifetime_earned: int = Field(ge=0, description="Total coins earned")
    lifetime_spent: int = Field(ge=0, description="Total coins spent")


class CoinTransactionResponse(BaseModel):
    """Single coin transaction record."""

    id: int
    type: str = Field(description="Transaction type: reward, hint_purchase, adjustment")
    amount: int = Field(description="Coin amount (positive or negative)")
    balance_after: int = Field(ge=0, description="Balance after transaction")
    meta: dict | None = Field(default=None, description="Additional metadata")
    created_at: datetime


class CoinTransactionListResponse(BaseModel):
    """Paginated list of coin transactions."""

    transactions: list[CoinTransactionResponse]
    total: int = Field(ge=0, description="Total number of transactions")
