"""Pydantic schemas for AI grading results."""

from enum import Enum

from pydantic import BaseModel, Field


class GradingStatus(str, Enum):
    """Status of the grading process."""

    COMPLETED = "completed"
    GRADING_FAILED = "grading_failed"
    PARTIAL = "partial"


class SQLQuestionGrading(BaseModel):
    """Grading result for a single SQL question.

    Scoring breakdown (25 points per question):
    - Syntax correctness: 5 points
    - Logic accuracy: 10 points
    - Performance/optimization: 5 points
    - Best practices: 5 points
    """

    score: float = Field(ge=0, le=25, description="Score for this question (0-25)")
    max_score: float = Field(default=25, description="Maximum possible score")
    feedback: str = Field(description="Detailed feedback for the student")
    correct_syntax: bool = Field(description="Whether SQL syntax is correct")
    logic_correct: bool = Field(description="Whether query logic is correct")
    optimal_query: bool = Field(description="Whether query is optimized")
    issues: list[str] = Field(default_factory=list, description="List of issues found")
    suggestions: list[str] = Field(default_factory=list, description="Improvement suggestions")
    grading_error: str | None = Field(default=None, description="Error message if grading failed")


class SQLPartGrading(BaseModel):
    """Complete grading result for the SQL part."""

    question_1: SQLQuestionGrading | None = Field(default=None, description="Grading for question 1")
    question_2: SQLQuestionGrading | None = Field(default=None, description="Grading for question 2")
    total_score: float = Field(ge=0, le=50, description="Total SQL part score (0-50)")
    max_score: float = Field(default=50, description="Maximum possible score")


class TestingPartGrading(BaseModel):
    """Grading result for the testing part.

    Scoring breakdown (50 points total):
    - Technique selection: 10 points
    - Explanation quality: 10 points
    - Test cases coverage: 20 points
    - Edge cases identification: 10 points
    """

    technique_score: float = Field(ge=0, le=10, description="Score for technique selection (0-10)")
    technique_correct: bool = Field(description="Whether selected technique is appropriate")
    explanation_score: float = Field(ge=0, le=10, description="Score for explanation (0-10)")
    test_cases_score: float = Field(ge=0, le=20, description="Score for test cases (0-20)")
    coverage_score: float = Field(ge=0, le=10, description="Score for edge case coverage (0-10)")

    total_score: float = Field(ge=0, le=50, description="Total testing part score (0-50)")
    max_score: float = Field(default=50, description="Maximum possible score")

    feedback: str = Field(description="Detailed feedback for the student")
    missing_scenarios: list[str] = Field(
        default_factory=list,
        description="Test scenarios that were missed",
    )
    suggestions: list[str] = Field(default_factory=list, description="Improvement suggestions")
    grading_error: str | None = Field(default=None, description="Error message if grading failed")


class GradingResult(BaseModel):
    """Complete grading result for an exam attempt."""

    sql_part: SQLPartGrading | None = Field(default=None, description="SQL part grading")
    testing_part: TestingPartGrading | None = Field(default=None, description="Testing part grading")

    total_score: float = Field(ge=0, le=100, description="Total exam score (0-100)")
    max_score: float = Field(default=100, description="Maximum possible score")
    percentage: float = Field(ge=0, le=100, description="Percentage score")
    passed: bool = Field(description="Whether the student passed the exam")

    overall_feedback: str = Field(description="Overall feedback and summary")
    strengths: list[str] = Field(default_factory=list, description="Areas of strength")
    improvements: list[str] = Field(default_factory=list, description="Areas to improve")

    status: GradingStatus = Field(
        default=GradingStatus.COMPLETED,
        description="Grading status: completed, grading_failed, or partial",
    )
    grading_errors: list[str] = Field(
        default_factory=list,
        description="List of errors encountered during grading",
    )


class SubmittedAnswers(BaseModel):
    """User's submitted answers for result display."""

    sql_part: dict | None = Field(default=None, description="SQL part answers")
    testing_part: dict | None = Field(default=None, description="Testing part answers")


class AttemptResultOut(BaseModel):
    """Response schema for viewing graded attempt result."""

    attempt_id: int
    exam_id: int
    exam_title: str
    user_id: int

    started_at: str
    submitted_at: str | None
    time_taken: int | None

    score: float
    max_score: float
    percentage: float
    passed: bool

    trust_score: int
    violation_count: int
    flagged_for_review: bool = Field(
        description="True if trust_score < 50, needs teacher review",
    )

    grading: GradingResult | None = Field(default=None, description="Detailed AI grading result")
    submitted_answers: SubmittedAnswers | None = Field(
        default=None,
        description="User's submitted answers for review",
    )
