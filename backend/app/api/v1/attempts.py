"""Exam attempt API endpoints for starting, saving, submitting, and viewing results."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request, status
from sqlalchemy import func, select

from app.api.deps import DbSessionDep, get_current_user
from app.models.attempt import AttemptStatus, ExamAttempt
from app.models.exam import Exam
from app.models.user import User, UserRole
from app.schemas.attempt import (
    AnswersPayload,
    AttemptListOut,
    AttemptListResponse,
    AttemptOut,
    AttemptSaveRequest,
    AttemptStartResponse,
    AttemptSubmitRequest,
    UserAttemptHistoryItem,
    UserAttemptHistoryResponse,
    ViolationLogRequest,
    ViolationLogResponse,
)
from app.schemas.exam import ExamDataOut
from app.schemas.grading import AttemptResultOut, GradingResult, SubmittedAnswers
from app.services.coin_reward_service import CoinRewardService
from app.services.grading_service import GradingService

router = APIRouter(tags=["attempts"])

# Type aliases
CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_admin(current_user: CurrentUser) -> User:
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
            detail="Chỉ admin mới có quyền thực hiện thao tác này",
        )
    return current_user


# =============================================================================
# User Attempt History
# =============================================================================


@router.get(
    "/attempts/my",
    response_model=UserAttemptHistoryResponse,
    summary="Lịch sử làm bài của user",
)
async def get_my_attempts(
    db: DbSessionDep,
    current_user: CurrentUser,
) -> UserAttemptHistoryResponse:
    """Lấy danh sách các lượt làm bài của user hiện tại.

    Chỉ lấy các bài đã nộp (status = GRADED).

    Args:
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        UserAttemptHistoryResponse với danh sách attempts.
    """
    stmt = (
        select(ExamAttempt, Exam)
        .join(Exam, ExamAttempt.exam_id == Exam.id)
        .where(ExamAttempt.user_id == current_user.id)
        .where(ExamAttempt.status == AttemptStatus.GRADED)
        .order_by(ExamAttempt.submitted_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = [
        UserAttemptHistoryItem(
            id=attempt.id,
            exam_id=attempt.exam_id,
            exam_title=exam.title,
            exam_type=exam.exam_type.value,
            status=attempt.status,
            score=attempt.score,
            max_score=attempt.max_score,
            percentage=attempt.percentage,
            passed=(attempt.percentage or 0) >= exam.passing_score,
            passing_score=exam.passing_score,
            trust_score=attempt.trust_score,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            time_taken=attempt.time_taken,
        )
        for attempt, exam in rows
    ]

    return UserAttemptHistoryResponse(items=items, total=len(items))


@router.post(
    "/exams/{exam_id}/start",
    status_code=status.HTTP_201_CREATED,
    response_model=AttemptStartResponse,
    summary="Bắt đầu làm bài thi",
)
async def start_exam_attempt(
    exam_id: Annotated[int, Path(gt=0, description="ID của đề thi")],
    request: Request,
    db: DbSessionDep,
    current_user: CurrentUser,
) -> AttemptStartResponse:
    """Bắt đầu một lượt làm bài thi mới.

    - Kiểm tra đề thi tồn tại và đã published
    - Kiểm tra số lần làm bài nếu có giới hạn
    - Tạo exam_attempt với status IN_PROGRESS
    - Trả về attempt_id và exam_data để làm bài

    Args:
        exam_id: ID của đề thi.
        request: FastAPI request object (để lấy IP, user-agent).
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        AttemptStartResponse với attempt_id và exam_data.

    Raises:
        HTTPException: Nếu đề thi không tồn tại, chưa published, hoặc hết lượt.
    """
    # Get exam
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()

    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đề thi không tồn tại",
        )

    if not exam.is_published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Đề thi chưa được xuất bản",
        )

    # Check max_attempts limit
    settings = exam.settings_json or {}
    max_attempts = settings.get("max_attempts")

    if max_attempts is not None:
        count_stmt = (
            select(func.count())
            .select_from(ExamAttempt)
            .where(ExamAttempt.exam_id == exam_id)
            .where(ExamAttempt.user_id == current_user.id)
        )
        count_result = await db.execute(count_stmt)
        attempt_count = count_result.scalar_one()

        if attempt_count >= max_attempts:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn đã sử dụng hết {max_attempts} lượt làm bài cho đề thi này",
            )

    # Check for existing in-progress attempt
    existing_stmt = (
        select(ExamAttempt)
        .where(ExamAttempt.exam_id == exam_id)
        .where(ExamAttempt.user_id == current_user.id)
        .where(ExamAttempt.status == AttemptStatus.IN_PROGRESS)
        .order_by(ExamAttempt.started_at.desc())
    )
    existing_result = await db.execute(existing_stmt)
    existing_attempt = existing_result.scalars().first()

    if existing_attempt:
        started_at = existing_attempt.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        elapsed_seconds = (now - started_at).total_seconds()
        duration_seconds = exam.duration * 60
        
        if elapsed_seconds >= duration_seconds:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Thời gian làm bài đã hết. Vui lòng bắt đầu lượt thi mới.",
            )
        total_violations = existing_attempt.get_total_violation_count()
        if total_violations >= 5:
            existing_attempt.submitted_at = datetime.now(timezone.utc)
            existing_attempt.time_taken = int(elapsed_seconds)
            
            current_answers = existing_attempt.answers_json or {}
            answers_payload = AnswersPayload(**current_answers)
            
            try:
                grading_service = GradingService()
                grading_result = await grading_service.grade_attempt(
                    exam_data=exam.exam_data_json,
                    answers=answers_payload,
                    passing_score=exam.passing_score,
                )
                
                existing_attempt.score = grading_result.total_score
                existing_attempt.max_score = grading_result.max_score
                existing_attempt.percentage = grading_result.percentage
                existing_attempt.ai_grading_json = grading_result.model_dump()
            except Exception:
                existing_attempt.score = 0
                existing_attempt.percentage = 0
            
            existing_attempt.status = AttemptStatus.GRADED
            
            await db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn đã vi phạm quá nhiều lần ({total_violations} lần). Bài thi đã được tự động nộp. Xem kết quả tại trang kết quả.",
            )
        
        return AttemptStartResponse(
            attempt_id=existing_attempt.id,
            exam_id=exam.id,
            started_at=existing_attempt.started_at,
            duration=exam.duration,
            exam_data=ExamDataOut(**exam.exam_data_json),
        )

    # Create new attempt
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]

    attempt = ExamAttempt(
        exam_id=exam_id,
        user_id=current_user.id,
        status=AttemptStatus.IN_PROGRESS,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    db.add(attempt)
    await db.flush()
    await db.refresh(attempt)

    return AttemptStartResponse(
        attempt_id=attempt.id,
        exam_id=exam.id,
        started_at=attempt.started_at,
        duration=exam.duration,
        exam_data=ExamDataOut(**exam.exam_data_json),
    )


@router.patch(
    "/attempts/{attempt_id}/save",
    response_model=AttemptOut,
    summary="Lưu tạm câu trả lời (autosave)",
)
async def save_attempt_answers(
    attempt_id: Annotated[int, Path(gt=0, description="ID của lượt làm bài")],
    request: AttemptSaveRequest,
    db: DbSessionDep,
    current_user: CurrentUser,
) -> AttemptOut:
    """Lưu tạm câu trả lời (autosave mỗi 30s).

    - Chỉ cho phép cập nhật attempt của chính mình
    - Chỉ cập nhật khi status là IN_PROGRESS
    - Partial update: merge với answers hiện tại

    Args:
        attempt_id: ID của lượt làm bài.
        request: Answers payload để lưu.
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        AttemptOut với thông tin attempt đã cập nhật.

    Raises:
        HTTPException: Nếu attempt không tồn tại, không phải của user, hoặc đã submit.
    """
    # Get attempt
    stmt = select(ExamAttempt).where(ExamAttempt.id == attempt_id)
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if attempt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lượt làm bài không tồn tại",
        )

    if attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật lượt làm bài này",
        )

    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể cập nhật bài đã nộp",
        )

    # Merge answers
    current_answers = attempt.answers_json or {}
    new_answers = request.answers.model_dump(exclude_unset=True)

    # Deep merge for nested structures
    if "sql_part" in new_answers and new_answers["sql_part"]:
        if "sql_part" not in current_answers:
            current_answers["sql_part"] = {}
        for key, value in new_answers["sql_part"].items():
            if value is not None:
                current_answers["sql_part"][key] = value

    if "testing_part" in new_answers and new_answers["testing_part"]:
        if "testing_part" not in current_answers:
            current_answers["testing_part"] = {}
        for key, value in new_answers["testing_part"].items():
            if value is not None:
                current_answers["testing_part"][key] = value

    attempt.answers_json = current_answers

    await db.commit()
    await db.refresh(attempt)

    return AttemptOut.from_orm_attempt(attempt)


# =============================================================================
# Submit Exam
# =============================================================================


@router.post(
    "/attempts/{attempt_id}/submit",
    response_model=AttemptResultOut,
    summary="Nộp bài thi",
)
async def submit_exam_attempt(
    attempt_id: Annotated[int, Path(gt=0, description="ID của lượt làm bài")],
    request: AttemptSubmitRequest,
    db: DbSessionDep,
    current_user: CurrentUser,
) -> AttemptResultOut:
    """Nộp bài thi và trigger AI chấm điểm.

    - Validate attempt thuộc về user và đang IN_PROGRESS
    - Lưu final answers
    - Gọi GradingService để chấm điểm
    - Cập nhật score, ai_grading_json, status = GRADED

    Args:
        attempt_id: ID của lượt làm bài.
        request: Final answers payload.
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        AttemptResultOut với điểm số và feedback chi tiết.

    Raises:
        HTTPException: Nếu attempt không hợp lệ hoặc đã submit.
    """
    # Get attempt with exam
    stmt = select(ExamAttempt).where(ExamAttempt.id == attempt_id)
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if attempt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lượt làm bài không tồn tại",
        )

    if attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền nộp bài này",
        )

    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bài thi này đã được nộp trước đó",
        )

    # Get exam data
    exam_stmt = select(Exam).where(Exam.id == attempt.exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one()

    # Save final answers
    attempt.answers_json = request.answers.model_dump()
    attempt.submitted_at = datetime.now(timezone.utc)

    # Handle both naive and timezone-aware started_at for backward compatibility
    started_at = attempt.started_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    attempt.time_taken = int(
        (attempt.submitted_at - started_at).total_seconds()
    )

    # Grade the attempt
    try:
        grading_service = GradingService()
        grading_result = await grading_service.grade_attempt(
            exam_data=exam.exam_data_json,
            answers=request.answers,
            passing_score=exam.passing_score,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi chấm điểm: {str(e)}",
        ) from e

    # Update attempt with grading results
    attempt.score = grading_result.total_score
    attempt.max_score = grading_result.max_score
    attempt.percentage = grading_result.percentage
    attempt.ai_grading_json = grading_result.model_dump()
    attempt.status = AttemptStatus.GRADED

    await db.commit()
    await db.refresh(attempt)

    coin_reward_service = CoinRewardService(db)
    reward_data = await coin_reward_service.grant_reward(attempt.id)
    
    await db.commit()

    violation_count = attempt.get_total_violation_count()

    return AttemptResultOut(
        attempt_id=attempt.id,
        exam_id=exam.id,
        exam_title=exam.title,
        user_id=attempt.user_id,
        started_at=attempt.started_at.isoformat(),
        submitted_at=attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        time_taken=attempt.time_taken,
        score=attempt.score,
        max_score=attempt.max_score,
        percentage=attempt.percentage or 0,
        passed=grading_result.passed,
        trust_score=attempt.trust_score,
        violation_count=violation_count,
        flagged_for_review=attempt.trust_score < 50,
        grading=grading_result,
        submitted_answers=SubmittedAnswers(
            sql_part=attempt.answers_json.get("sql_part") if attempt.answers_json else None,
            testing_part=attempt.answers_json.get("testing_part") if attempt.answers_json else None,
        ),
        coin_reward=reward_data.get("coin_reward"),
        coin_balance_after=reward_data.get("coin_balance_after"),
        reward_breakdown=reward_data.get("reward_breakdown"),
    )


# =============================================================================
# Get Attempt Result
# =============================================================================


@router.get(
    "/attempts/{attempt_id}/result",
    response_model=AttemptResultOut,
    summary="Xem kết quả bài thi",
)
async def get_attempt_result(
    attempt_id: Annotated[int, Path(gt=0, description="ID của lượt làm bài")],
    db: DbSessionDep,
    current_user: CurrentUser,
) -> AttemptResultOut:
    """Lấy kết quả chi tiết của một lượt làm bài.

    - User thường chỉ xem được kết quả của mình
    - Admin có thể xem kết quả của tất cả

    Args:
        attempt_id: ID của lượt làm bài.
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        AttemptResultOut với điểm số và feedback chi tiết.

    Raises:
        HTTPException: Nếu attempt không tồn tại, chưa chấm, hoặc không có quyền xem.
    """
    # Get attempt
    stmt = select(ExamAttempt).where(ExamAttempt.id == attempt_id)
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if attempt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lượt làm bài không tồn tại",
        )

    # Check permission
    if current_user.role != UserRole.ADMIN and attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem kết quả này",
        )

    if attempt.status == AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bài thi chưa được nộp",
        )

    # Get exam for title
    exam_stmt = select(Exam).where(Exam.id == attempt.exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one()

    # Parse grading result
    grading: GradingResult | None = None
    if attempt.ai_grading_json:
        grading = GradingResult(**attempt.ai_grading_json)

    violation_count = attempt.get_total_violation_count()


    coin_reward = None
    coin_balance_after = None
    reward_breakdown = None
    
    if attempt.status == AttemptStatus.GRADED:
        from app.models.coin_transaction import CoinTransaction, TransactionType
        from app.models.wallet import UserWallet
        
        coin_tx_stmt = (
            select(CoinTransaction)
            .filter_by(
                user_id=attempt.user_id,
                attempt_id=attempt.id,
                type=TransactionType.REWARD,
            )
            .order_by(CoinTransaction.created_at.desc())
            .limit(1)
        )
        coin_tx_result = await db.execute(coin_tx_stmt)
        coin_transaction = coin_tx_result.scalar_one_or_none()
        
        if coin_transaction:
            coin_reward = coin_transaction.amount
            reward_breakdown = coin_transaction.meta_json.get("breakdown")
            
            wallet_stmt = select(UserWallet).filter_by(user_id=attempt.user_id)
            wallet_result = await db.execute(wallet_stmt)
            wallet = wallet_result.scalar_one_or_none()
            if wallet:
                coin_balance_after = wallet.coin_balance

    return AttemptResultOut(
        attempt_id=attempt.id,
        exam_id=exam.id,
        exam_title=exam.title,
        user_id=attempt.user_id,
        started_at=attempt.started_at.isoformat(),
        submitted_at=attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        time_taken=attempt.time_taken,
        score=attempt.score,
        max_score=attempt.max_score,
        percentage=attempt.percentage or 0,
        passed=(attempt.percentage or 0) >= exam.passing_score,
        trust_score=attempt.trust_score,
        violation_count=violation_count,
        flagged_for_review=attempt.trust_score < 50,
        grading=grading,
        submitted_answers=SubmittedAnswers(
            sql_part=attempt.answers_json.get("sql_part") if attempt.answers_json else None,
            testing_part=attempt.answers_json.get("testing_part") if attempt.answers_json else None,
        ),
        coin_reward=coin_reward,
        coin_balance_after=coin_balance_after,
        reward_breakdown=reward_breakdown,
    )


# =============================================================================
# List Attempts for Exam (Admin)
# =============================================================================


@router.get(
    "/exams/{exam_id}/attempts",
    response_model=AttemptListResponse,
    summary="Danh sách lượt làm bài của đề thi (Admin)",
)
async def list_exam_attempts(
    exam_id: Annotated[int, Path(gt=0, description="ID của đề thi")],
    db: DbSessionDep,
    current_user: Annotated[User, Depends(require_admin)],
    skip: Annotated[int, Query(ge=0, description="Số lượng bỏ qua")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Số lượng tối đa")] = 20,
    status_filter: Annotated[AttemptStatus | None, Query(alias="status")] = None,
) -> AttemptListResponse:
    """Lấy danh sách tất cả lượt làm bài của một đề thi.

    Chỉ admin có quyền truy cập endpoint này.

    Args:
        exam_id: ID của đề thi.
        db: Database session.
        current_user: Admin user.
        skip: Offset cho phân trang.
        limit: Limit cho phân trang.
        status_filter: Lọc theo trạng thái (optional).

    Returns:
        AttemptListResponse với danh sách attempts và pagination info.

    Raises:
        HTTPException: Nếu đề thi không tồn tại hoặc user không phải admin.
    """
    # Verify exam exists
    exam_stmt = select(Exam).where(Exam.id == exam_id)
    exam_result = await db.execute(exam_stmt)
    exam = exam_result.scalar_one_or_none()

    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đề thi không tồn tại",
        )

    # Build query with user join
    stmt = (
        select(ExamAttempt, User)
        .join(User, ExamAttempt.user_id == User.id)
        .where(ExamAttempt.exam_id == exam_id)
        .order_by(ExamAttempt.started_at.desc())
    )
    count_stmt = (
        select(func.count())
        .select_from(ExamAttempt)
        .where(ExamAttempt.exam_id == exam_id)
    )

    if status_filter:
        stmt = stmt.where(ExamAttempt.status == status_filter)
        count_stmt = count_stmt.where(ExamAttempt.status == status_filter)

    # Get total count
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    # Get items with pagination
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    items = [
        AttemptListOut(
            id=attempt.id,
            exam_id=attempt.exam_id,
            user_id=attempt.user_id,
            user_name=user.name,
            user_email=user.email,
            status=attempt.status,
            score=attempt.score,
            max_score=attempt.max_score,
            percentage=attempt.percentage,
            trust_score=attempt.trust_score,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            time_taken=attempt.time_taken,
        )
        for attempt, user in rows
    ]

    return AttemptListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


# =============================================================================
# Log Violation
# =============================================================================


@router.post(
    "/attempts/{attempt_id}/violations",
    response_model=ViolationLogResponse,
    summary="Ghi nhận vi phạm",
)
async def log_violation(
    attempt_id: Annotated[int, Path(gt=0, description="ID của lượt làm bài")],
    request: ViolationLogRequest,
    db: DbSessionDep,
    current_user: CurrentUser,
) -> ViolationLogResponse:
    """Ghi nhận một vi phạm trong quá trình làm bài.

    Frontend gọi endpoint này khi phát hiện:
    - Tab switch / visibility change
    - Fullscreen exit
    - Copy/paste attempt
    - DevTools open
    - Mouse leave / window blur

    Args:
        attempt_id: ID của lượt làm bài.
        request: Thông tin vi phạm.
        db: Database session.
        current_user: User đã xác thực.

    Returns:
        ViolationLogResponse với trust score mới và warning level.

    Raises:
        HTTPException: Nếu attempt không hợp lệ.
    """
    # Get attempt
    stmt = select(ExamAttempt).where(ExamAttempt.id == attempt_id)
    result = await db.execute(stmt)
    attempt = result.scalar_one_or_none()

    if attempt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lượt làm bài không tồn tại",
        )

    if attempt.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật lượt làm bài này",
        )

    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể ghi nhận vi phạm cho bài đã nộp",
        )

    # Add violation
    attempt.add_violation(
        violation_type=request.violation_type,
        timestamp=request.timestamp,
        details=request.details,
    )

    await db.commit()
    await db.refresh(attempt)

    # Determine warning level
    total_violations = attempt.get_total_violation_count()

    warning_level = "none"
    message = None

    if total_violations >= 5:
        warning_level = "critical"
        message = "Bạn đã vi phạm quá nhiều lần. Bài thi có thể bị đánh dấu xem xét."
    elif total_violations >= 3:
        warning_level = "high"
        message = "Cảnh báo nghiêm trọng! Hãy tập trung làm bài."
    elif total_violations >= 2:
        warning_level = "medium"
        message = "Vui lòng không chuyển tab hoặc thoát fullscreen."
    elif total_violations >= 1:
        warning_level = "low"
        message = "Đã ghi nhận vi phạm. Hãy tuân thủ quy định thi."

    return ViolationLogResponse(
        success=True,
        trust_score=attempt.trust_score,
        tab_switch_count=attempt.tab_switch_count,
        fullscreen_exit_count=attempt.fullscreen_exit_count,
        copy_paste_count=attempt.copy_paste_count,
        window_blur_count=attempt.window_blur_count,
        devtools_open_count=attempt.devtools_open_count,
        warning_level=warning_level,
        message=message,
    )
