"""Pydantic schemas for hint system."""

from datetime import datetime

from pydantic import BaseModel, Field


class HintCatalogItem(BaseModel):
    """Metadata for a single hint level."""

    level: int = Field(ge=1, le=3, description="Hint level (1-3)")
    cost: int = Field(gt=0, description="Coin cost to purchase")
    preview: str | None = Field(default=None, description="Preview text")
    is_locked: bool = Field(default=False, description="Whether hint is locked")
    is_purchased: bool = Field(default=False, description="Whether hint is purchased")


class HintCatalogResponse(BaseModel):
    """Hint catalog for an exam."""

    hints: dict[str, list[HintCatalogItem]] = Field(
        description="Map of question keys to hint items"
    )


class HintPurchaseRequest(BaseModel):
    """Request to purchase a hint."""

    question_key: str = Field(
        description="Question identifier (e.g., 'sql.question_1')"
    )
    hint_level: int = Field(ge=1, le=3, description="Hint level to purchase")


class HintPurchaseResponse(BaseModel):
    """Response after purchasing a hint."""

    hint_content: str = Field(description="Full hint content")
    coin_balance_after: int = Field(ge=0, description="Updated coin balance")


class PurchasedHintResponse(BaseModel):
    """A hint that has been purchased."""

    question_key: str
    hint_level: int = Field(ge=1, le=3)
    hint_content: str
    coin_cost: int = Field(gt=0)
    purchased_at: datetime


class PurchasedHintsListResponse(BaseModel):
    """List of all purchased hints for an attempt."""

    hints: list[PurchasedHintResponse]
