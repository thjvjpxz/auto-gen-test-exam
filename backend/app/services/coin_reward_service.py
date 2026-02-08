"""Service for calculating and granting coin rewards after exam completion."""

import logging
from math import floor

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attempt import AttemptStatus, ExamAttempt
from app.models.coin_transaction import TransactionType
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)

BASE_REWARD = 10
MIN_REWARD = 3
MAX_REWARD = 30
HINT_PENALTY_MULTIPLIER = 0.4


class CoinRewardService:
    """Service for calculating and granting coin rewards."""

    def __init__(self, db: AsyncSession):
        """Initialize CoinRewardService with database session.
        
        Args:
            db: SQLAlchemy asynchronous database session.
        """
        self.db = db
        self.wallet_service = WalletService(db)

    def calculate_reward(self, attempt: ExamAttempt) -> dict:
        """Calculate coin reward based on attempt performance.
        
        Formula:
            coin_reward = base + score_bonus + trust_bonus + streak_bonus - hint_penalty
            Clamped to [MIN_REWARD, MAX_REWARD]
        
        Args:
            attempt: ExamAttempt instance.
            
        Returns:
            Dictionary with 'total' and 'breakdown' keys.
        """
        percentage = attempt.percentage or 0
        
        if percentage == 0:
            return {
                "total": 0,
                "breakdown": {
                    "base": 0,
                    "score_bonus": 0,
                    "trust_bonus": 0,
                    "streak_bonus": 0,
                    "hint_penalty": 0,
                },
            }
        
        base = BASE_REWARD
        
        score_bonus = floor(percentage / 10)
        
        if attempt.trust_score >= 90:
            trust_bonus = 5
        elif attempt.trust_score >= 70:
            trust_bonus = 2
        else:
            trust_bonus = 0
        
        streak_bonus = 0
        
        hint_penalty = floor(attempt.hint_spent_total * HINT_PENALTY_MULTIPLIER)
        
        total = base + score_bonus + trust_bonus + streak_bonus - hint_penalty
        total = max(MIN_REWARD, min(MAX_REWARD, total))
        
        breakdown = {
            "base": base,
            "score_bonus": score_bonus,
            "trust_bonus": trust_bonus,
            "streak_bonus": streak_bonus,
            "hint_penalty": hint_penalty,
        }
        
        logger.info(
            f"Calculated reward for attempt {attempt.id}: "
            f"total={total}, breakdown={breakdown}"
        )
        
        return {"total": total, "breakdown": breakdown}

    async def grant_reward(self, attempt_id: int) -> dict:
        """Grant coin reward for completed attempt with idempotency.
        
        Args:
            attempt_id: ExamAttempt ID.
            
        Returns:
            Dictionary with reward details and updated balance.
            
        Raises:
            ValueError: If attempt is not graded or invalid.
        """
        stmt = select(ExamAttempt).filter_by(id=attempt_id)
        result = await self.db.execute(stmt)
        attempt = result.scalar_one_or_none()
        
        if not attempt:
            raise ValueError(f"Attempt {attempt_id} not found")
        
        if attempt.status != AttemptStatus.GRADED:
            raise ValueError(
                f"Cannot grant reward: attempt {attempt_id} status is {attempt.status}"
            )
        
        if attempt.coin_rewarded:
            logger.info(f"Attempt {attempt_id} already rewarded")
            return {
                "already_rewarded": True,
                "coin_reward": attempt.coin_reward_amount,
                "coin_balance_after": await self.wallet_service.get_balance(attempt.user_id),
                "reward_breakdown": {},
            }
        
        reward_data = self.calculate_reward(attempt)
        
        idempotency_key = f"reward_attempt_{attempt_id}"
        
        transaction = await self.wallet_service.add_transaction(
            user_id=attempt.user_id,
            amount=reward_data["total"],
            transaction_type=TransactionType.REWARD,
            idempotency_key=idempotency_key,
            meta=reward_data["breakdown"],
            attempt_id=attempt_id,
        )
        
        attempt.coin_rewarded = True
        attempt.coin_reward_amount = reward_data["total"]
        await self.db.flush()
        
        logger.info(
            f"Granted {reward_data['total']} coins to user {attempt.user_id} "
            f"for attempt {attempt_id}"
        )
        
        return {
            "coin_reward": reward_data["total"],
            "coin_balance_after": transaction.balance_after,
            "reward_breakdown": reward_data["breakdown"],
        }

