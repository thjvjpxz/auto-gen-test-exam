"""Pydantic schemas for admin API endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.attempt import AttemptStatus
from app.models.user import UserRole


class UserListOut(BaseModel):
    """User summary for list view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: UserRole
    avatar_url: str | None = None
    created_at: datetime
    exam_count: int = Field(default=0, description="Number of exams taken")


class UserListResponse(BaseModel):
    """Paginated user list response."""

    items: list[UserListOut]
    total: int
    skip: int
    limit: int


class UserExamHistoryItem(BaseModel):
    """Single exam attempt in user's history."""

    model_config = ConfigDict(from_attributes=True)

    attempt_id: int
    exam_id: int
    exam_title: str
    exam_type: str
    status: AttemptStatus
    score: float
    max_score: float
    percentage: float | None
    passed: bool
    submitted_at: datetime | None


class UserDetailOut(BaseModel):
    """User detail with exam stats."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: UserRole
    avatar_url: str | None = None
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime | None = None

    total_exams_taken: int = 0
    average_score: float | None = None
    pass_rate: float | None = None

    recent_attempts: list[UserExamHistoryItem] = Field(default_factory=list)


class UserUpdateRequest(BaseModel):
    """Request schema for updating a user."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    role: UserRole | None = None


class AdminStatsOut(BaseModel):
    """Dashboard aggregate stats."""

    total_users: int = Field(description="Total active users")
    total_exams: int = Field(description="Total exams created")
    total_attempts: int = Field(description="Total exam attempts")
    published_exams: int = Field(description="Published exams count")
    average_score: float | None = Field(description="Average score across all attempts")
    pass_rate: float | None = Field(description="Overall pass rate percentage")


class AdminAttemptListOut(BaseModel):
    """Attempt with user and exam info for admin view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    exam_title: str
    exam_type: str
    user_id: int
    user_name: str
    user_email: str
    status: AttemptStatus
    score: float
    max_score: float
    percentage: float | None
    trust_score: int
    passed: bool
    started_at: datetime
    submitted_at: datetime | None
    time_taken: int | None = Field(description="Time taken in seconds")


class AdminAttemptListResponse(BaseModel):
    """Paginated attempts list for admin."""

    items: list[AdminAttemptListOut]
    total: int
    skip: int
    limit: int
