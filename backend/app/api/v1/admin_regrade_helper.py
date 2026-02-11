"""Admin re-grade endpoints implementation."""

import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attempt import AttemptStatus, ExamAttempt
from app.models.exam import Exam
from app.schemas.admin import AdminRegradeResponse
from app.schemas.attempt import AnswersPayload
from app.services.coin_reward_service import CoinRewardService
from app.services.grading_service import GradingService

logger = logging.getLogger(__name__)


async def regrade_single_attempt(
    db: AsyncSession,
    attempt_id: int,
) -> AdminRegradeResponse:
    """Re-grade a single attempt.

    Args:
        db: Database session.
        attempt_id: ID of attempt to re-grade.

    Returns:
        AdminRegradeResponse with result.

    Raises:
        HTTPException: If attempt not found or cannot be re-graded.
    """
    attempt = await db.get(ExamAttempt, attempt_id)
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attempt {attempt_id} not found",
        )

    if attempt.status not in [AttemptStatus.SUBMITTED, AttemptStatus.GRADED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot re-grade attempt with status {attempt.status}",
        )

    if not attempt.answers_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No answers found for this attempt",
        )

    exam = await db.get(Exam, attempt.exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam {attempt.exam_id} not found",
        )

    try:
        grading_service = GradingService()
        answers = AnswersPayload(**attempt.answers_json)
        
        grading_result = await grading_service.grade_attempt(
            exam_data=exam.exam_data_json,
            answers=answers,
            passing_score=exam.passing_score,
        )

        attempt.score = grading_result.total_score
        attempt.max_score = grading_result.max_score
        attempt.percentage = grading_result.percentage
        attempt.ai_grading_json = grading_result.model_dump()
        attempt.status = AttemptStatus.GRADED

        if not attempt.coin_rewarded:
            coin_reward_service = CoinRewardService(db)
            await coin_reward_service.grant_reward(attempt.id)

        await db.commit()
        await db.refresh(attempt)

        return AdminRegradeResponse(
            attempt_id=attempt.id,
            status=attempt.status,
            score=attempt.score,
            message="Re-grading successful",
        )

    except Exception as e:
        logger.error(f"Re-grading failed for attempt {attempt_id}: {e}")
        await db.rollback()
        
        return AdminRegradeResponse(
            attempt_id=attempt.id,
            status=attempt.status,
            score=None,
            message=f"Re-grading failed: {str(e)}",
        )
