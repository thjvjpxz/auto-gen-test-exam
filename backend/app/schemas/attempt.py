"""Pydantic schemas for exam attempt API requests and responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.attempt import AttemptStatus
from app.schemas.exam import ExamDataOut


class TestCaseItem(BaseModel):
    """Single test case in the testing part answer."""

    input: str = Field(description="Input values for the test case")
    expected_output: str = Field(description="Expected output/result")
    actual_result: str | None = Field(default=None, description="Actual result if executed")


class SQLPartAnswers(BaseModel):
    """Student answers for SQL part questions."""

    question_1_answer: str | None = Field(default=None, description="Answer for SQL question 1")
    question_2_answer: str | None = Field(default=None, description="Answer for SQL question 2")


class TestingPartAnswers(BaseModel):
    """Student answers for the testing part."""

    technique: str | None = Field(
        default=None,
        description="Selected testing technique (EP, BVA, Decision Table, State Transition)",
    )
    explanation: str | None = Field(
        default=None,
        description="Explanation for why this technique was chosen",
    )
    test_cases: list[TestCaseItem] = Field(
        default_factory=list,
        description="List of designed test cases",
    )


class AnswersPayload(BaseModel):
    """Complete answers payload for an exam attempt."""

    sql_part: SQLPartAnswers | None = Field(default=None, description="SQL part answers")
    testing_part: TestingPartAnswers | None = Field(default=None, description="Testing part answers")


class AttemptStartRequest(BaseModel):
    """Request schema for starting an exam attempt.

    Currently empty as exam_id comes from path parameter.
    Can be extended for future features (e.g., preferred language).
    """

    pass


class AttemptSaveRequest(BaseModel):
    """Request schema for auto-saving answers (partial update)."""

    answers: AnswersPayload = Field(description="Partial or complete answers to save")


class AttemptSubmitRequest(BaseModel):
    """Request schema for submitting an exam attempt."""

    answers: AnswersPayload = Field(description="Final answers to submit")


class ViolationLogRequest(BaseModel):
    """Request schema for logging a violation event."""

    violation_type: str = Field(
        description="Type of violation: tab_switch, fullscreen_exit, copy, paste, devtools_open",
    )
    timestamp: str = Field(description="ISO timestamp when violation occurred")
    details: str = Field(default="", description="Additional details about the violation")


class AttemptStartResponse(BaseModel):
    """Response schema when starting an exam attempt."""

    attempt_id: int = Field(description="ID of the created attempt")
    exam_id: int = Field(description="ID of the exam")
    started_at: datetime = Field(description="When the attempt started")
    duration: int = Field(description="Exam duration in minutes")
    exam_data: ExamDataOut = Field(description="Exam content for taking")


class AttemptOut(BaseModel):
    """Response schema for attempt details."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    user_id: int
    status: AttemptStatus
    answers: AnswersPayload | None = Field(default=None)
    score: float
    max_score: float
    percentage: float | None
    tab_switch_count: int
    fullscreen_exit_count: int
    copy_paste_count: int
    trust_score: int
    started_at: datetime
    submitted_at: datetime | None
    time_taken: int | None
    created_at: datetime

    @classmethod
    def from_orm_attempt(cls, attempt: Any) -> "AttemptOut":
        """Create AttemptOut from ORM ExamAttempt model.

        Args:
            attempt: SQLAlchemy ExamAttempt model instance.

        Returns:
            AttemptOut instance with properly mapped fields.
        """
        answers = None
        if attempt.answers_json:
            answers = AnswersPayload(**attempt.answers_json)

        return cls(
            id=attempt.id,
            exam_id=attempt.exam_id,
            user_id=attempt.user_id,
            status=attempt.status,
            answers=answers,
            score=attempt.score,
            max_score=attempt.max_score,
            percentage=attempt.percentage,
            tab_switch_count=attempt.tab_switch_count,
            fullscreen_exit_count=attempt.fullscreen_exit_count,
            copy_paste_count=attempt.copy_paste_count,
            trust_score=attempt.trust_score,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            time_taken=attempt.time_taken,
            created_at=attempt.created_at,
        )


class AttemptListOut(BaseModel):
    """Response schema for attempt list item (summary)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    user_id: int
    user_name: str | None = None
    user_email: str | None = None
    status: AttemptStatus
    score: float
    max_score: float
    percentage: float | None
    trust_score: int
    started_at: datetime
    submitted_at: datetime | None
    time_taken: int | None


class AttemptListResponse(BaseModel):
    """Response schema for paginated attempt list."""

    items: list[AttemptListOut]
    total: int
    skip: int
    limit: int


class ViolationLogResponse(BaseModel):
    """Response schema after logging a violation."""

    success: bool = True
    trust_score: int = Field(description="Updated trust score after violation")
    tab_switch_count: int
    fullscreen_exit_count: int
    copy_paste_count: int
    warning_level: str = Field(
        description="Warning level: none, low, medium, high, critical",
    )
    message: str | None = Field(default=None, description="Warning message to display")
