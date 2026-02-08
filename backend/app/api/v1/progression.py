"""API endpoints for user progression and coin transactions."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DbSessionDep, get_current_user
from app.models.user import User
from app.schemas.progression import (
    CoinTransactionListResponse,
    CoinTransactionResponse,
    UserProgressionResponse,
)
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["progression"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/me/progression", response_model=UserProgressionResponse)
async def get_my_progression(
    db: DbSessionDep,
    current_user: CurrentUser,
):
    """Get current user's progression data including coin balance.
    
    Returns:
        UserProgressionResponse with coin balance and lifetime stats.
    """
    wallet_service = WalletService(db)
    wallet = await wallet_service.get_or_create_wallet(current_user.id)
    
    return UserProgressionResponse(
        coin_balance=wallet.coin_balance,
        lifetime_earned=wallet.lifetime_earned,
        lifetime_spent=wallet.lifetime_spent,
    )



@router.get("/me/coin-transactions", response_model=CoinTransactionListResponse)
async def get_my_coin_transactions(
    db: DbSessionDep,
    current_user: CurrentUser,
    skip: Annotated[int, Query(ge=0, description="Number of records to skip")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Maximum records to return")] = 20,
):
    """Get transaction history for current user.
    
    Args:
        skip: Number of records to skip for pagination.
        limit: Maximum number of records to return.
        
    Returns:
        CoinTransactionListResponse with paginated transactions.
    """
    wallet_service = WalletService(db)
    transactions, total = await wallet_service.get_transactions(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    
    return CoinTransactionListResponse(
        transactions=[
            CoinTransactionResponse(
                id=t.id,
                type=t.type.value,
                amount=t.amount,
                balance_after=t.balance_after,
                meta=t.meta_json,
                created_at=t.created_at,
            )
            for t in transactions
        ],
        total=total,
    )

