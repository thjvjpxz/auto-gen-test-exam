"""Pydantic schemas for exam-related API requests and responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.exam import ExamType


class RuleTableItem(BaseModel):
    """Single rule in the testing part rules table."""

    condition: str
    result: str


class ExamSQLPart(BaseModel):
    """SQL part of the exam with ERD and questions."""

    mermaid_code: str = Field(description="Mermaid ERD diagram code")
    questions: list[str] = Field(description="List of SQL questions")


class ExamTestingPart(BaseModel):
    """Testing part of the exam with scenario and rules."""

    scenario: str = Field(description="Testing scenario description")
    rules_table: list[RuleTableItem] = Field(description="Rules table for testing")
    question: str = Field(description="Testing question/requirement")


class ExamDataOut(BaseModel):
    """Complete exam data structure (exam_data_json field)."""

    sql_part: ExamSQLPart | None = None
    testing_part: ExamTestingPart | None = None


class ExamGenerateRequest(BaseModel):
    """Request schema for generating a new exam with AI."""

    exam_type: ExamType = Field(
        default=ExamType.SQL_TESTING,
        description="Type of exam to generate",
    )
    duration: int = Field(
        default=90,
        ge=30,
        le=240,
        description="Exam duration in minutes (30-240)",
    )
    passing_score: int = Field(
        default=60,
        ge=0,
        le=100,
        description="Passing score percentage (0-100)",
    )
    subject: str | None = Field(
        default=None,
        description="Optional subject/topic for the exam",
    )


class ExamOut(BaseModel):
    """Response schema for exam details."""

    id: int
    title: str
    exam_type: ExamType
    subject: str | None
    created_by: int
    duration: int
    passing_score: int
    exam_data: ExamDataOut
    ai_generated: bool
    gemini_model: str
    settings: dict[str, Any] | None
    is_published: bool
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_exam(cls, exam: Any) -> "ExamOut":
        """Create ExamOut from ORM Exam model.
        
        Args:
            exam: SQLAlchemy Exam model instance.
            
        Returns:
            ExamOut instance with properly mapped fields.
        """
        return cls(
            id=exam.id,
            title=exam.title,
            exam_type=exam.exam_type,
            subject=exam.subject,
            created_by=exam.created_by,
            duration=exam.duration,
            passing_score=exam.passing_score,
            exam_data=ExamDataOut(**exam.exam_data_json),
            ai_generated=exam.ai_generated,
            gemini_model=exam.gemini_model,
            settings=exam.settings_json,
            is_published=exam.is_published,
            created_at=exam.created_at,
            updated_at=exam.updated_at,
        )


class ExamListOut(BaseModel):
    """Response schema for exam list item (without full exam_data)."""

    id: int
    title: str
    exam_type: ExamType
    subject: str | None
    created_by: int
    duration: int
    passing_score: int
    ai_generated: bool
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerationTaskResponse(BaseModel):
    """Response schema when starting exam generation task."""

    task_id: str = Field(description="Unique task ID for polling status")
    status: str = Field(default="pending", description="Initial task status")


class GenerationStatusResponse(BaseModel):
    """Response schema for checking generation task status."""

    status: str = Field(description="Task status: pending, completed, or failed")
    exam_id: int | None = Field(default=None, description="Exam ID if completed")
    exam: ExamOut | None = Field(default=None, description="Full exam data if completed")
    error: str | None = Field(default=None, description="Error message if failed")
    progress: int | None = Field(default=None, description="Progress percentage (0-100)")


class ExamListResponse(BaseModel):
    """Response schema for paginated exam list."""

    items: list[ExamListOut]
    total: int
    skip: int
    limit: int


class ExamSettingsUpdate(BaseModel):
    """Schema for updating exam settings (partial update).
    
    All fields are optional to support partial update.
    """
    
    allow_review: bool | None = Field(
        default=None,
        description="Cho phép xem lại kết quả sau khi nộp bài",
    )
    show_sample_solution: bool | None = Field(
        default=None,
        description="Hiển thị đáp án mẫu sau khi nộp bài",
    )
    max_attempts: int | None = Field(
        default=None,
        ge=1,
        le=100,
        description="Số lần làm bài tối đa (1-100, null = không giới hạn)",
    )


class ExamUpdateRequest(BaseModel):
    """Request schema for updating an exam (partial update).
    
    Tất cả các trường đều optional để hỗ trợ partial update.
    Chỉ gửi các trường muốn cập nhật.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "is_published": True,
                "title": "Đề thi SQL và Testing cơ bản",
                "settings": {"allow_review": True, "max_attempts": 3},
            }
        }
    )

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Tiêu đề đề thi",
    )
    subject: str | None = Field(
        default=None,
        max_length=100,
        description="Chủ đề/môn học của đề thi",
    )
    duration: int | None = Field(
        default=None,
        ge=30,
        le=240,
        description="Thời gian làm bài (phút), từ 30 đến 240 phút",
    )
    passing_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
        description="Điểm đạt (%), từ 0 đến 100",
    )
    is_published: bool | None = Field(
        default=None,
        description="Trạng thái xuất bản (true = đã xuất bản, false = chưa xuất bản)",
    )
    settings: ExamSettingsUpdate | None = Field(
        default=None,
        description="Cài đặt đề thi (partial update)",
    )

