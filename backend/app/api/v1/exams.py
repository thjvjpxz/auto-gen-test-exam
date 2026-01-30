"""Exam API endpoints for generation, retrieval, and management."""

from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy import func, select

from app.api.deps import DbSessionDep, get_current_user
from app.db.session import SessionLocal
from app.models.exam import Exam, ExamType
from app.models.user import User, UserRole
from app.schemas.exam import (
    ExamGenerateRequest,
    ExamListOut,
    ExamListResponse,
    ExamOut,
    ExamUpdateRequest,
    GenerationStatusResponse,
    GenerationTaskResponse,
)
from app.services.task_manager import TaskManager, TaskStatus

router = APIRouter(prefix="/v1/exams", tags=["exams"])

# Type aliases for dependencies
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


@router.post(
    "/generate",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=GenerationTaskResponse,
    summary="Tạo đề thi mới bằng AI (Admin only)",
)
async def generate_exam(
    request: ExamGenerateRequest,
    db: DbSessionDep,
    current_user: Annotated[User, Depends(require_admin)],
) -> GenerationTaskResponse:
    """Bắt đầu quá trình sinh đề thi tự động bằng AI.
    
    Endpoint này tạo một background task và trả về task_id ngay lập tức
    để client có thể polling status thay vì đợi AI sinh xong.
    
    Args:
        request: Cấu hình sinh đề (exam_type, duration, passing_score, subject).
        db: Database session.
        current_user: Admin user đã xác thực.
        
    Returns:
        GenerationTaskResponse với task_id và status "pending".
    """
    # Generate unique task ID
    task_id = TaskManager.generate_task_id()
    
    # Create background task
    TaskManager.create_task(
        task_id=task_id,
        user_id=current_user.id,
        request=request,
        db_session_factory=SessionLocal,
    )
    
    return GenerationTaskResponse(
        task_id=task_id,
        status=TaskStatus.PENDING,
    )


@router.get(
    "/generation-status/{task_id}",
    response_model=GenerationStatusResponse,
    summary="Kiểm tra trạng thái sinh đề",
)
async def get_generation_status(
    task_id: Annotated[str, Path(description="Task ID để kiểm tra trạng thái")],
    db: DbSessionDep,
    current_user: CurrentUser,
) -> GenerationStatusResponse:
    """Lấy trạng thái hiện tại của task sinh đề.
    
    Client gọi endpoint này để polling status sau khi nhận task_id
    từ endpoint /generate.
    
    Args:
        task_id: ID của task sinh đề.
        db: Database session.
        current_user: User đã xác thực.
        
    Returns:
        GenerationStatusResponse với status, exam_id (nếu completed), hoặc error.
        
    Raises:
        HTTPException: Nếu task_id không tồn tại hoặc user không có quyền.
    """
    task_status = TaskManager.get_task_status(task_id)
    
    if task_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task không tồn tại hoặc đã bị xóa",
        )
    
    if current_user.role != UserRole.ADMIN:
        if not TaskManager.verify_task_ownership(task_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem task này",
            )
    
    response_data: dict[str, Any] = {
        "status": task_status["status"],
        "progress": task_status.get("progress", 0),
    }
    
    # If completed, fetch exam data
    if task_status["status"] == TaskStatus.COMPLETED:
        exam_id = task_status.get("exam_id")
        if exam_id:
            stmt = select(Exam).where(Exam.id == exam_id)
            result = await db.execute(stmt)
            exam = result.scalar_one_or_none()
            
            if exam:
                response_data["exam_id"] = exam_id
                response_data["exam"] = ExamOut.from_orm_exam(exam)
    
    # If failed, include error message
    elif task_status["status"] == TaskStatus.FAILED:
        response_data["error"] = task_status.get("error", "Unknown error")
    
    return GenerationStatusResponse(**response_data)


@router.get(
    "/{exam_id}",
    response_model=ExamOut,
    summary="Lấy chi tiết một đề thi",
)
async def get_exam(
    exam_id: Annotated[int, Path(gt=0, description="ID của đề thi")],
    db: DbSessionDep,
    current_user: CurrentUser,
) -> ExamOut:
    """Lấy thông tin chi tiết của một đề thi theo ID.
    
    Args:
        exam_id: ID của đề thi.
        db: Database session.
        current_user: User đã xác thực.
        
    Returns:
        ExamOut với đầy đủ thông tin đề thi.
        
    Raises:
        HTTPException: Nếu đề thi không tồn tại hoặc user không có quyền xem.
    """
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()
    
    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đề thi không tồn tại",
        )
    
    if current_user.role != UserRole.ADMIN and not exam.is_published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Đề thi chưa được xuất bản",
        )
    
    return ExamOut.from_orm_exam(exam)


@router.get(
    "",
    response_model=ExamListResponse,
    summary="Lấy danh sách đề thi (có phân trang)",
)
async def list_exams(
    db: DbSessionDep,
    current_user: CurrentUser,
    skip: Annotated[int, Query(ge=0, description="Số lượng bỏ qua")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Số lượng tối đa trả về")] = 20,
    exam_type: Annotated[ExamType | None, Query(description="Lọc theo loại đề")] = None,
    is_published: Annotated[bool | None, Query(description="Lọc theo trạng thái xuất bản")] = None,
) -> ExamListResponse:
    """Lấy danh sách đề thi với phân trang và filter.
    
    Args:
        db: Database session.
        current_user: User đã xác thực.
        skip: Số lượng bản ghi bỏ qua (offset).
        limit: Số lượng bản ghi tối đa trả về.
        exam_type: Lọc theo loại đề thi (optional).
        is_published: Lọc theo trạng thái xuất bản (optional).
        
    Returns:
        ExamListResponse với items, total, skip, limit.
    """
    # Build base query
    stmt = select(Exam).order_by(Exam.created_at.desc())
    count_stmt = select(func.count()).select_from(Exam)
    
    # Apply filters
    if exam_type is not None:
        stmt = stmt.where(Exam.exam_type == exam_type)
        count_stmt = count_stmt.where(Exam.exam_type == exam_type)
    
    if is_published is not None:
        stmt = stmt.where(Exam.is_published == is_published)
        count_stmt = count_stmt.where(Exam.is_published == is_published)
    
    # Non-admin users only see published exams
    if current_user.role != UserRole.ADMIN:
        stmt = stmt.where(Exam.is_published == True)
        count_stmt = count_stmt.where(Exam.is_published == True)
    
    # Get total count
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()
    
    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(stmt)
    exams = result.scalars().all()
    
    # Convert to response schema
    items = [ExamListOut.model_validate(exam) for exam in exams]
    
    return ExamListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.patch(
    "/{exam_id}",
    response_model=ExamOut,
    status_code=status.HTTP_200_OK,
    summary="Cập nhật đề thi (Admin only)",
)
async def update_exam(
    exam_id: Annotated[int, Path(gt=0, description="ID của đề thi cần cập nhật")],
    request: ExamUpdateRequest,
    db: DbSessionDep,
    current_user: Annotated[User, Depends(require_admin)],
) -> ExamOut:
    """Cập nhật thông tin đề thi (partial update).
    
    Chỉ admin mới có quyền cập nhật đề thi. Có thể cập nhật một hoặc nhiều
    trường: title, subject, duration, passing_score, is_published.
    
    Args:
        exam_id: ID của đề thi cần cập nhật.
        request: Dữ liệu cập nhật (chỉ gửi các trường muốn thay đổi).
        db: Database session.
        current_user: Admin user đã xác thực.
        
    Returns:
        ExamOut với thông tin đề thi đã được cập nhật.
        
    Raises:
        HTTPException: Nếu đề thi không tồn tại.
    """
    # Check if exam exists
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()
    
    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đề thi không tồn tại",
        )
    
    # Track if any changes were made
    has_changes = False
    
    # Update exam fields if provided
    if request.title is not None:
        exam.title = request.title
        has_changes = True
    if request.subject is not None:
        exam.subject = request.subject
        has_changes = True
    if request.duration is not None:
        exam.duration = request.duration
        has_changes = True
    if request.passing_score is not None:
        exam.passing_score = request.passing_score
        has_changes = True
    if request.is_published is not None:
        exam.is_published = request.is_published
        has_changes = True
    
    # Update updated_at timestamp if there were changes
    if has_changes:
        exam.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(exam)
    
    return ExamOut.from_orm_exam(exam)


@router.delete(
    "/{exam_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa đề thi (Admin only)",
)
async def delete_exam(
    exam_id: Annotated[int, Path(gt=0, description="ID của đề thi cần xóa")],
    db: DbSessionDep,
    current_user: Annotated[User, Depends(require_admin)],
) -> None:
    """Xóa một đề thi khỏi hệ thống.
    
    Chỉ admin mới có quyền xóa đề thi.
    
    Args:
        exam_id: ID của đề thi cần xóa.
        db: Database session.
        current_user: Admin user đã xác thực.
        
    Raises:
        HTTPException: Nếu đề thi không tồn tại.
    """
    stmt = select(Exam).where(Exam.id == exam_id)
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()
    
    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đề thi không tồn tại",
        )
    
    await db.delete(exam)
    await db.commit()
