"""Admin API endpoints for user management, stats, and attempts overview."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy import func, select

from app.api.deps import DbSessionDep, get_current_user
from app.models.attempt import AttemptStatus, ExamAttempt
from app.models.exam import Exam
from app.models.user import User, UserRole
from app.schemas.admin import (
    AdminAttemptListOut,
    AdminAttemptListResponse,
    AdminCoinAdjustmentRequest,
    AdminCoinAdjustmentResponse,
    AdminStatsOut,
    UserDetailOut,
    UserExamHistoryItem,
    UserListOut,
    UserListResponse,
    UserUpdateRequest,
)

router = APIRouter(prefix="/v1/admin", tags=["admin"])

CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(current_user: CurrentUser) -> User:
    """Dependency to ensure user is an admin.

    Args:
        current_user: The authenticated user.

    Returns:
        User if admin, raises HTTPException otherwise.

    Raises:
        HTTPException: If user is not an admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


AdminUser = Annotated[User, Depends(require_admin)]


@router.get("/stats", response_model=AdminStatsOut)
async def get_admin_stats(
    db: DbSessionDep,
    current_user: AdminUser,
) -> AdminStatsOut:
    """Get dashboard aggregate stats."""
    total_users = (await db.execute(
        select(func.count(User.id)).where(User.is_deleted == False)  # noqa: E712
    )).scalar_one()

    total_exams = (await db.execute(select(func.count(Exam.id)))).scalar_one()

    published_exams = (await db.execute(
        select(func.count(Exam.id)).where(Exam.is_published == True)  # noqa: E712
    )).scalar_one()

    total_attempts = (await db.execute(
        select(func.count(ExamAttempt.id)).where(
            ExamAttempt.status == AttemptStatus.GRADED
        )
    )).scalar_one()

    avg_score_result = (await db.execute(
        select(func.avg(ExamAttempt.percentage)).where(
            ExamAttempt.status == AttemptStatus.GRADED,
            ExamAttempt.percentage.isnot(None),
        )
    )).scalar_one()
    average_score = round(avg_score_result, 1) if avg_score_result else None

    if total_attempts > 0:
        passed_count = (await db.execute(
            select(func.count(ExamAttempt.id))
            .join(Exam, ExamAttempt.exam_id == Exam.id)
            .where(
                ExamAttempt.status == AttemptStatus.GRADED,
                ExamAttempt.percentage >= Exam.passing_score,
            )
        )).scalar_one()
        pass_rate = round((passed_count / total_attempts) * 100, 1)
    else:
        pass_rate = None

    return AdminStatsOut(
        total_users=total_users,
        total_exams=total_exams,
        total_attempts=total_attempts,
        published_exams=published_exams,
        average_score=average_score,
        pass_rate=pass_rate,
    )


@router.get("/users", response_model=UserListResponse)
async def list_users(
    db: DbSessionDep,
    current_user: AdminUser,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query()] = None,
    role: Annotated[UserRole | None, Query()] = None,
) -> UserListResponse:
    """List active users with pagination and filters."""
    base_query = select(User).where(User.is_deleted == False)  # noqa: E712

    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.where(
            (User.name.ilike(search_pattern)) | (User.email.ilike(search_pattern))
        )

    if role:
        base_query = base_query.where(User.role == role)

    count_query = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    users_query = (
        base_query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    users = (await db.execute(users_query)).scalars().all()

    items = []
    for user in users:
        exam_count = (await db.execute(
            select(func.count(ExamAttempt.id))
            .where(ExamAttempt.user_id == user.id)
            .where(ExamAttempt.status == AttemptStatus.GRADED)
        )).scalar_one()

        items.append(
            UserListOut(
                id=user.id,
                email=user.email,
                name=user.name,
                role=user.role,
                avatar_url=user.avatar_url,
                created_at=user.created_at,
                exam_count=exam_count,
            )
        )

    return UserListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=UserDetailOut)
async def get_user_detail(
    user_id: Annotated[int, Path(gt=0)],
    db: DbSessionDep,
    current_user: AdminUser,
) -> UserDetailOut:
    """Get user detail with exam stats and recent attempts."""
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    graded_attempts = (await db.execute(
        select(ExamAttempt)
        .where(ExamAttempt.user_id == user_id)
        .where(ExamAttempt.status == AttemptStatus.GRADED)
    )).scalars().all()

    total_exams_taken = len(graded_attempts)

    if total_exams_taken > 0:
        scores = [a.percentage for a in graded_attempts if a.percentage is not None]
        average_score = round(sum(scores) / len(scores), 1) if scores else None
        passed = sum(1 for a in graded_attempts if a.percentage and a.percentage >= 60)
        pass_rate = round((passed / total_exams_taken) * 100, 1)
    else:
        average_score = None
        pass_rate = None

    recent_query = (
        select(ExamAttempt, Exam)
        .join(Exam, ExamAttempt.exam_id == Exam.id)
        .where(ExamAttempt.user_id == user_id)
        .where(ExamAttempt.status == AttemptStatus.GRADED)
        .order_by(ExamAttempt.submitted_at.desc())
        .limit(10)
    )
    recent_results = (await db.execute(recent_query)).all()

    recent_attempts = []
    for attempt, exam in recent_results:
        passed_exam = (
            attempt.percentage >= exam.passing_score
            if attempt.percentage is not None
            else False
        )
        recent_attempts.append(
            UserExamHistoryItem(
                attempt_id=attempt.id,
                exam_id=exam.id,
                exam_title=exam.title,
                exam_type=exam.exam_type.value,
                status=attempt.status,
                score=attempt.score,
                max_score=attempt.max_score,
                percentage=attempt.percentage,
                passed=passed_exam,
                submitted_at=attempt.submitted_at,
            )
        )

    from app.services.wallet_service import WalletService
    wallet_service = WalletService(db)
    coin_balance = await wallet_service.get_balance(user_id)

    return UserDetailOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar_url=user.avatar_url,
        is_deleted=user.is_deleted,
        created_at=user.created_at,
        updated_at=user.updated_at,
        total_exams_taken=total_exams_taken,
        average_score=average_score,
        pass_rate=pass_rate,
        coin_balance=coin_balance,
        recent_attempts=recent_attempts,
    )


@router.patch("/users/{user_id}", response_model=UserDetailOut)
async def update_user(
    user_id: Annotated[int, Path(gt=0)],
    request: UserUpdateRequest,
    db: DbSessionDep,
    current_user: AdminUser,
) -> UserDetailOut:
    """Update user (name, role)."""
    user = (await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)  # noqa: E712
    )).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == current_user.id and request.role == UserRole.USER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote yourself")

    if request.name is not None:
        user.name = request.name
    if request.role is not None:
        user.role = request.role

    await db.commit()
    await db.refresh(user)

    return await get_user_detail(user_id, db, current_user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: Annotated[int, Path(gt=0)],
    db: DbSessionDep,
    current_user: AdminUser,
) -> None:
    """Soft delete a user."""
    user = (await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)  # noqa: E712
    )).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")

    user.is_deleted = True
    await db.commit()


@router.get("/attempts", response_model=AdminAttemptListResponse)
async def list_all_attempts(
    db: DbSessionDep,
    current_user: AdminUser,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    user_id: Annotated[int | None, Query()] = None,
    exam_id: Annotated[int | None, Query()] = None,
    status_filter: Annotated[AttemptStatus | None, Query(alias="status")] = None,
) -> AdminAttemptListResponse:
    """List all exam attempts with filters."""
    base_query = (
        select(ExamAttempt, User, Exam)
        .join(User, ExamAttempt.user_id == User.id)
        .join(Exam, ExamAttempt.exam_id == Exam.id)
    )

    if user_id:
        base_query = base_query.where(ExamAttempt.user_id == user_id)
    if exam_id:
        base_query = base_query.where(ExamAttempt.exam_id == exam_id)
    if status_filter:
        base_query = base_query.where(ExamAttempt.status == status_filter)

    count_subquery = (
        select(ExamAttempt.id)
        .join(User, ExamAttempt.user_id == User.id)
        .join(Exam, ExamAttempt.exam_id == Exam.id)
    )
    if user_id:
        count_subquery = count_subquery.where(ExamAttempt.user_id == user_id)
    if exam_id:
        count_subquery = count_subquery.where(ExamAttempt.exam_id == exam_id)
    if status_filter:
        count_subquery = count_subquery.where(ExamAttempt.status == status_filter)

    total = (await db.execute(
        select(func.count()).select_from(count_subquery.subquery())
    )).scalar_one()

    attempts_query = (
        base_query.order_by(ExamAttempt.started_at.desc()).offset(skip).limit(limit)
    )
    results = (await db.execute(attempts_query)).all()

    items = []
    for attempt, user, exam in results:
        passed = (
            attempt.percentage >= exam.passing_score
            if attempt.percentage is not None
            else False
        )
        items.append(
            AdminAttemptListOut(
                id=attempt.id,
                exam_id=exam.id,
                exam_title=exam.title,
                exam_type=exam.exam_type.value,
                user_id=user.id,
                user_name=user.name,
                user_email=user.email,
                status=attempt.status,
                score=attempt.score,
                max_score=attempt.max_score,
                percentage=attempt.percentage,
                trust_score=attempt.trust_score,
                passed=passed,
                started_at=attempt.started_at,
                submitted_at=attempt.submitted_at,
                time_taken=attempt.time_taken,
            )
        )

    return AdminAttemptListResponse(items=items, total=total, skip=skip, limit=limit)


@router.patch("/users/{user_id}/coins", response_model=AdminCoinAdjustmentResponse)
async def adjust_user_coins(
    user_id: Annotated[int, Path(gt=0)],
    request: AdminCoinAdjustmentRequest,
    db: DbSessionDep,
    current_user: AdminUser,
) -> AdminCoinAdjustmentResponse:
    """Adjust user coin balance (admin only).
    
    Args:
        user_id: User ID to adjust coins for.
        request: Adjustment details (amount and reason).
        
    Returns:
        AdminCoinAdjustmentResponse with adjustment details.
        
    Raises:
        HTTPException: If user not found.
    """
    user = (await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)  # noqa: E712
    )).scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    from app.models.coin_transaction import TransactionType
    from app.services.wallet_service import WalletService
    from datetime import datetime, timezone
    
    wallet_service = WalletService(db)
    
    balance_before = await wallet_service.get_balance(user_id)
    
    meta = {
        "reason": request.reason,
        "admin_id": current_user.id,
        "admin_name": current_user.name,
        "admin_email": current_user.email,
    }
    
    transaction = await wallet_service.add_transaction(
        user_id=user_id,
        amount=request.amount,
        transaction_type=TransactionType.ADJUSTMENT,
        meta=meta,
    )
    
    await db.commit()
    
    return AdminCoinAdjustmentResponse(
        user_id=user_id,
        balance_before=balance_before,
        balance_after=transaction.balance_after,
        adjustment_amount=request.amount,
        reason=request.reason,
        adjusted_by_admin_id=current_user.id,
        adjusted_by_admin_name=current_user.name,
        adjusted_at=datetime.now(timezone.utc),
    )

