"""Service for managing hint catalog and purchases."""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attempt import AttemptStatus, ExamAttempt
from app.models.coin_transaction import TransactionType
from app.models.hint_usage import AttemptHintUsage
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)


class HintService:
    """Service for hint catalog and purchase operations."""

    def __init__(self, db: AsyncSession):
        """Initialize HintService with database session.
        
        Args:
            db: SQLAlchemy asynchronous database session.
        """
        self.db = db
        self.wallet_service = WalletService(db)

    async def get_hint_catalog(
        self, exam_id: int, user_id: int | None = None
    ) -> dict[str, list[dict]]:
        """Get hint catalog from exam content with purchased status.
        
        Args:
            exam_id: Exam ID.
            user_id: Optional user ID to check purchased hints.
            
        Returns:
            Dictionary mapping question keys to hint metadata with purchase status.
            
        Raises:
            ValueError: If exam not found or has no hints.
        """
        from app.models.exam import Exam

        stmt = select(Exam).filter_by(id=exam_id)
        result = await self.db.execute(stmt)
        exam = result.scalar_one_or_none()

        if not exam:
            raise ValueError(f"Exam {exam_id} not found")

        hints_catalog = exam.exam_data_json.get("hints_catalog", {})

        purchased_hints_set = set()
        if user_id:
            stmt = (
                select(AttemptHintUsage)
                .join(ExamAttempt)
                .filter(
                    AttemptHintUsage.user_id == user_id,
                    ExamAttempt.exam_id == exam_id,
                )
            )
            result = await self.db.execute(stmt)
            purchased_hints = result.scalars().all()
            purchased_hints_set = {
                (ph.question_key, ph.hint_level) for ph in purchased_hints
            }

        result = {}
        for question_key, hints in hints_catalog.items():
            hint_list = []
            for hint in hints:
                is_purchased = (question_key, hint["level"]) in purchased_hints_set
                
                previous_level = hint["level"] - 1
                is_locked = False
                if previous_level > 0:
                    is_locked = (question_key, previous_level) not in purchased_hints_set
                
                hint_list.append(
                    {
                        "level": hint["level"],
                        "cost": hint["cost"],
                        "preview": hint.get("preview"),
                        "is_locked": is_locked,
                        "is_purchased": is_purchased,
                    }
                )
            result[question_key] = hint_list

        return result

    async def purchase_hint(
        self,
        attempt_id: int,
        user_id: int,
        question_key: str,
        hint_level: int,
    ) -> dict:
        """Purchase a hint for an attempt.
        
        Args:
            attempt_id: ExamAttempt ID.
            user_id: User ID (for authorization).
            question_key: Question identifier (e.g., "sql.question_1").
            hint_level: Hint level to purchase (1, 2, or 3).
            
        Returns:
            Dictionary with hint content and updated balance.
            
        Raises:
            PermissionError: If attempt doesn't belong to user.
            ValueError: If attempt status invalid or hint already purchased.
            InsufficientCoinsError: If user doesn't have enough coins.
        """
        stmt = select(ExamAttempt).filter_by(id=attempt_id)
        result = await self.db.execute(stmt)
        attempt = result.scalar_one_or_none()
        
        if not attempt:
            raise ValueError(f"Attempt {attempt_id} not found")
        
        if attempt.user_id != user_id:
            raise PermissionError("Attempt does not belong to this user")
        
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise ValueError(
                f"Cannot purchase hint: attempt status is {attempt.status}"
            )
        
        stmt = select(AttemptHintUsage).filter_by(
            attempt_id=attempt_id,
            question_key=question_key,
            hint_level=hint_level,
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise ValueError("Hint already purchased")
        
        if hint_level > 1:
            stmt = select(AttemptHintUsage).filter_by(
                attempt_id=attempt_id,
                question_key=question_key,
                hint_level=hint_level - 1,
            )
            result = await self.db.execute(stmt)
            prev_level = result.scalar_one_or_none()
            
            if not prev_level:
                raise ValueError(
                    f"Must purchase hint level {hint_level - 1} "
                    f"before level {hint_level}"
                )
        
        from app.models.exam import Exam
        stmt = select(Exam).filter_by(id=attempt.exam_id)
        result = await self.db.execute(stmt)
        exam = result.scalar_one_or_none()
        
        hints_catalog = exam.exam_data_json.get("hints_catalog", {})
        
        if question_key not in hints_catalog:
            raise ValueError(f"No hints available for {question_key}")
        
        hints = hints_catalog[question_key]
        hint_data = next(
            (h for h in hints if h["level"] == hint_level),
            None,
        )
        
        if not hint_data:
            raise ValueError(f"Hint level {hint_level} not found for {question_key}")
        
        transaction = await self.wallet_service.deduct_coins(
            user_id=user_id,
            amount=hint_data["cost"],
            transaction_type=TransactionType.HINT_PURCHASE,
            meta={
                "attempt_id": attempt_id,
                "question_key": question_key,
                "hint_level": hint_level,
            },
            attempt_id=attempt_id,
        )
        
        usage = AttemptHintUsage(
            attempt_id=attempt_id,
            user_id=user_id,
            question_key=question_key,
            hint_level=hint_level,
            coin_cost=hint_data["cost"],
            hint_content=hint_data["content"],
        )
        self.db.add(usage)
        
        attempt.hint_spent_total += hint_data["cost"]
        
        await self.db.flush()
        
        logger.info(
            f"User {user_id} purchased hint: attempt={attempt_id}, "
            f"question={question_key}, level={hint_level}, cost={hint_data['cost']}"
        )
        
        return {
            "hint_content": hint_data["content"],
            "coin_balance_after": transaction.balance_after,
        }


    async def get_purchased_hints(self, attempt_id: int) -> list[dict]:
        """Get all purchased hints for an attempt.
        
        Args:
            attempt_id: ExamAttempt ID.
            
        Returns:
            List of purchased hint dictionaries.
        """
        stmt = (
            select(AttemptHintUsage)
            .filter_by(attempt_id=attempt_id)
            .order_by(AttemptHintUsage.created_at)
        )
        result = await self.db.execute(stmt)
        usages = list(result.scalars().all())
        
        return [
            {
                "question_key": usage.question_key,
                "hint_level": usage.hint_level,
                "hint_content": usage.hint_content,
                "coin_cost": usage.coin_cost,
                "purchased_at": usage.created_at.isoformat(),
            }
            for usage in usages
        ]

