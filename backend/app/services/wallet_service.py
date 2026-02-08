"""Service for managing user wallets and coin transactions."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coin_transaction import CoinTransaction, TransactionType
from app.models.wallet import UserWallet

logger = logging.getLogger(__name__)


class InsufficientCoinsError(Exception):
    """Raised when user doesn't have enough coins for a transaction."""

    pass


class WalletService:
    """Service for wallet operations with idempotency support."""

    def __init__(self, db: AsyncSession):
        """Initialize WalletService with database session.
        
        Args:
            db: SQLAlchemy asynchronous database session.
        """
        self.db = db

    async def get_or_create_wallet(self, user_id: int) -> UserWallet:
        """Get existing wallet or create new one for user.
        
        Args:
            user_id: User ID to get/create wallet for.
            
        Returns:
            UserWallet instance.
        """
        stmt = select(UserWallet).filter_by(user_id=user_id)
        result = await self.db.execute(stmt)
        wallet = result.scalar_one_or_none()
        
        if not wallet:
            wallet = UserWallet(user_id=user_id)
            self.db.add(wallet)
            await self.db.flush()
            logger.info(f"Created new wallet for user {user_id}")
        
        return wallet

    async def add_transaction(
        self,
        user_id: int,
        amount: int,
        transaction_type: TransactionType,
        idempotency_key: str | None = None,
        meta: dict[str, Any] | None = None,
        attempt_id: int | None = None,
    ) -> CoinTransaction:
        """Add coins to user wallet with idempotency support.
        
        Args:
            user_id: User ID.
            amount: Coin amount (positive for add, negative for deduct).
            transaction_type: Type of transaction.
            idempotency_key: Unique key to prevent duplicate transactions.
            meta: Additional metadata as JSON.
            attempt_id: Related attempt ID if applicable.
            
        Returns:
            CoinTransaction record.
            
        Raises:
            InsufficientCoinsError: If deducting more coins than available.
        """
        if idempotency_key:
            stmt = select(CoinTransaction).filter_by(idempotency_key=idempotency_key)
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()
            if existing:
                logger.info(f"Idempotent transaction found: {idempotency_key}")
                return existing

        wallet = await self.get_or_create_wallet(user_id)
        
        balance_before = wallet.coin_balance
        balance_after = balance_before + amount
        
        if balance_after < 0:
            raise InsufficientCoinsError(
                f"Insufficient coins. Required: {abs(amount)}, "
                f"Available: {balance_before}"
            )

        transaction = CoinTransaction(
            user_id=user_id,
            attempt_id=attempt_id,
            type=transaction_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            idempotency_key=idempotency_key,
            meta_json=meta,
        )
        
        wallet.coin_balance = balance_after
        
        if amount > 0:
            wallet.lifetime_earned += amount
        else:
            wallet.lifetime_spent += abs(amount)
        
        self.db.add(transaction)
        
        try:
            await self.db.flush()
            logger.info(
                f"Transaction created: user={user_id}, amount={amount}, "
                f"type={transaction_type}, balance={balance_after}"
            )
        except IntegrityError as e:
            if idempotency_key and "idempotency_key" in str(e):
                await self.db.rollback()
                stmt = select(CoinTransaction).filter_by(idempotency_key=idempotency_key)
                result = await self.db.execute(stmt)
                existing = result.scalar_one_or_none()
                if existing:
                    return existing
            raise
        
        return transaction

    async def deduct_coins(
        self,
        user_id: int,
        amount: int,
        transaction_type: TransactionType,
        meta: dict[str, Any] | None = None,
        attempt_id: int | None = None,
    ) -> CoinTransaction:
        """Deduct coins from user wallet.
        
        Args:
            user_id: User ID.
            amount: Positive amount to deduct.
            transaction_type: Type of transaction.
            meta: Additional metadata.
            attempt_id: Related attempt ID if applicable.
            
        Returns:
            CoinTransaction record.
            
        Raises:
            InsufficientCoinsError: If user doesn't have enough coins.
        """
        return await self.add_transaction(
            user_id=user_id,
            amount=-abs(amount),
            transaction_type=transaction_type,
            meta=meta,
            attempt_id=attempt_id,
        )

    async def get_balance(self, user_id: int) -> int:
        """Get current coin balance for user.
        
        Args:
            user_id: User ID.
            
        Returns:
            Current coin balance.
        """
        wallet = await self.get_or_create_wallet(user_id)
        return wallet.coin_balance

    async def get_transactions(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[CoinTransaction], int]:
        """Get transaction history for user.
        
        Args:
            user_id: User ID.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            Tuple of (transactions list, total count).
        """
        from sqlalchemy import func
        
        count_stmt = select(func.count(CoinTransaction.id)).filter_by(user_id=user_id)
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        stmt = (
            select(CoinTransaction)
            .filter_by(user_id=user_id)
            .order_by(CoinTransaction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        transactions = list(result.scalars().all())
        
        return transactions, total
