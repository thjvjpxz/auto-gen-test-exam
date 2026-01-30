"""AI grading service for exam attempts using Google Gemini."""

import asyncio
import json
import logging
from typing import Any

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.schemas.attempt import AnswersPayload
from app.schemas.grading import (
    GradingResult,
    SQLPartGrading,
    SQLQuestionGrading,
    TestingPartGrading,
)
from app.services.grading_prompts import (
    build_overall_feedback_prompt,
    build_sql_grading_prompt,
    build_testing_grading_prompt,
)

logger = logging.getLogger(__name__)

GRADING_MODEL = "gemini-2.5-flash-lite"
GRADING_TEMPERATURE = 0.3


class GradingService:
    """Async service for grading exam attempts using Google Gemini AI.

    This service evaluates student answers for both SQL and Testing parts,
    providing detailed feedback and scores based on predefined rubrics.
    """

    def __init__(self, model_name: str = GRADING_MODEL):
        """Initialize the GradingService with Google GenAI client.

        Args:
            model_name: The Gemini model identifier to use for grading.
                       Defaults to "gemini-2.5-flash-lite" for better reasoning.

        Raises:
            ValueError: If GEMINI_API_KEY is not configured.
        """
        settings = get_settings()

        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY must be set in environment variables")

        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model_name = model_name

    async def _call_gemini_api(self, prompt: str) -> dict[str, Any]:
        """Call Gemini API and parse JSON response.

        Args:
            prompt: The formatted prompt to send to the model.

        Returns:
            Parsed JSON response as dictionary.

        Raises:
            json.JSONDecodeError: If response is not valid JSON.
            RuntimeError: If API call fails.
        """
        try:
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=GRADING_TEMPERATURE,
                ),
            )
            return json.loads(response.text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse grading response: {e}")
            raise
        except Exception as e:
            logger.error(f"Gemini API error during grading: {e}")
            raise RuntimeError(f"Grading API error: {str(e)}") from e

    async def grade_sql_question(
        self,
        mermaid_code: str,
        question: str,
        answer: str | None,
    ) -> SQLQuestionGrading:
        """Grade a single SQL question.

        Args:
            mermaid_code: ERD diagram in Mermaid syntax.
            question: The SQL question text.
            answer: Student's SQL query answer.

        Returns:
            SQLQuestionGrading with score and feedback.
        """
        if not answer or not answer.strip():
            return SQLQuestionGrading(
                score=0,
                correct_syntax=False,
                logic_correct=False,
                optimal_query=False,
                feedback="Không có câu trả lời được cung cấp.",
                issues=["Sinh viên không trả lời câu hỏi này"],
                suggestions=["Hãy viết câu truy vấn SQL theo yêu cầu đề bài"],
            )

        prompt = build_sql_grading_prompt(mermaid_code, question, answer)

        try:
            result = await self._call_gemini_api(prompt)
            return SQLQuestionGrading(**result)
        except Exception as e:
            logger.error(f"Error grading SQL question: {e}")
            # Return minimal grading on error
            return SQLQuestionGrading(
                score=0,
                correct_syntax=False,
                logic_correct=False,
                optimal_query=False,
                feedback=f"Lỗi hệ thống khi chấm điểm: {str(e)}",
                issues=["Không thể chấm điểm do lỗi hệ thống"],
                suggestions=[],
            )

    async def grade_testing_part(
        self,
        scenario: str,
        rules_table: list[dict],
        question: str,
        technique: str | None,
        explanation: str | None,
        test_cases: list[dict] | None,
    ) -> TestingPartGrading:
        """Grade the testing part of an exam.

        Args:
            scenario: Testing scenario description.
            rules_table: List of rule conditions and results.
            question: The testing question text.
            technique: Student's selected testing technique.
            explanation: Student's explanation for technique choice.
            test_cases: List of student's test cases.

        Returns:
            TestingPartGrading with scores and feedback.
        """
        if not technique and not test_cases:
            return TestingPartGrading(
                technique_score=0,
                technique_correct=False,
                explanation_score=0,
                test_cases_score=0,
                coverage_score=0,
                total_score=0,
                feedback="Không có câu trả lời được cung cấp cho phần Testing.",
                missing_scenarios=["Sinh viên không trả lời câu hỏi Testing"],
                suggestions=["Hãy chọn kỹ thuật kiểm thử và thiết kế test cases"],
            )

        prompt = build_testing_grading_prompt(
            scenario=scenario,
            rules_table=rules_table,
            testing_question=question,
            technique=technique or "",
            explanation=explanation or "",
            test_cases=test_cases or [],
        )

        try:
            result = await self._call_gemini_api(prompt)
            return TestingPartGrading(**result)
        except Exception as e:
            logger.error(f"Error grading testing part: {e}")
            return TestingPartGrading(
                technique_score=0,
                technique_correct=False,
                explanation_score=0,
                test_cases_score=0,
                coverage_score=0,
                total_score=0,
                feedback=f"Lỗi hệ thống khi chấm điểm: {str(e)}",
                missing_scenarios=["Không thể chấm điểm do lỗi hệ thống"],
                suggestions=[],
            )

    async def generate_overall_feedback(
        self,
        sql_grading: SQLPartGrading | None,
        testing_grading: TestingPartGrading | None,
        total_score: float,
        passing_score: int,
    ) -> tuple[str, list[str], list[str]]:
        """Generate overall feedback based on grading results.

        Args:
            sql_grading: SQL part grading result.
            testing_grading: Testing part grading result.
            total_score: Total exam score.
            passing_score: Passing threshold percentage.

        Returns:
            Tuple of (overall_feedback, strengths, improvements).
        """
        percentage = (total_score / 100) * 100
        passed = percentage >= passing_score

        sql_details = "Không có phần SQL"
        if sql_grading:
            sql_details = f"Điểm: {sql_grading.total_score}/50"

        testing_details = "Không có phần Testing"
        if testing_grading:
            testing_details = f"Điểm: {testing_grading.total_score}/50"

        prompt = build_overall_feedback_prompt(
            sql_score=sql_grading.total_score if sql_grading else 0,
            sql_details=sql_details,
            testing_score=testing_grading.total_score if testing_grading else 0,
            testing_details=testing_details,
            total_score=total_score,
            percentage=percentage,
            passed=passed,
        )

        try:
            result = await self._call_gemini_api(prompt)
            return (
                result.get("overall_feedback", ""),
                result.get("strengths", []),
                result.get("improvements", []),
            )
        except Exception as e:
            logger.error(f"Error generating overall feedback: {e}")
            default_feedback = (
                f"Tổng điểm: {total_score}/100 ({percentage:.1f}%). "
                f"{'Chúc mừng bạn đã đạt!' if passed else 'Hãy cố gắng hơn lần sau.'}"
            )
            return default_feedback, [], []

    async def grade_attempt(
        self,
        exam_data: dict[str, Any],
        answers: AnswersPayload,
        passing_score: int = 60,
    ) -> GradingResult:
        """Grade a complete exam attempt.

        Args:
            exam_data: Exam content (sql_part, testing_part).
            answers: Student's answers for the exam.
            passing_score: Passing threshold percentage.

        Returns:
            Complete GradingResult with all scores and feedback.
        """
        sql_grading: SQLPartGrading | None = None
        testing_grading: TestingPartGrading | None = None

        # Grade SQL part
        sql_part = exam_data.get("sql_part")
        if sql_part and answers.sql_part:
            mermaid_code = sql_part.get("mermaid_code", "")
            questions = sql_part.get("questions", [])

            q1_grading = None
            q2_grading = None

            if len(questions) > 0:
                q1_grading = await self.grade_sql_question(
                    mermaid_code=mermaid_code,
                    question=questions[0],
                    answer=answers.sql_part.question_1_answer,
                )

            if len(questions) > 1:
                q2_grading = await self.grade_sql_question(
                    mermaid_code=mermaid_code,
                    question=questions[1],
                    answer=answers.sql_part.question_2_answer,
                )

            sql_total = (
                (q1_grading.score if q1_grading else 0)
                + (q2_grading.score if q2_grading else 0)
            )

            sql_grading = SQLPartGrading(
                question_1=q1_grading,
                question_2=q2_grading,
                total_score=sql_total,
            )

        # Grade Testing part
        testing_part = exam_data.get("testing_part")
        if testing_part and answers.testing_part:
            test_cases_dict = [
                {"input": tc.input, "expected_output": tc.expected_output}
                for tc in (answers.testing_part.test_cases or [])
            ]

            testing_grading = await self.grade_testing_part(
                scenario=testing_part.get("scenario", ""),
                rules_table=testing_part.get("rules_table", []),
                question=testing_part.get("question", ""),
                technique=answers.testing_part.technique,
                explanation=answers.testing_part.explanation,
                test_cases=test_cases_dict,
            )

        # Calculate total score
        sql_score = sql_grading.total_score if sql_grading else 0
        testing_score = testing_grading.total_score if testing_grading else 0
        total_score = sql_score + testing_score
        percentage = (total_score / 100) * 100
        passed = percentage >= passing_score

        # Generate overall feedback
        overall_feedback, strengths, improvements = await self.generate_overall_feedback(
            sql_grading=sql_grading,
            testing_grading=testing_grading,
            total_score=total_score,
            passing_score=passing_score,
        )

        return GradingResult(
            sql_part=sql_grading,
            testing_part=testing_grading,
            total_score=total_score,
            max_score=100,
            percentage=percentage,
            passed=passed,
            overall_feedback=overall_feedback,
            strengths=strengths,
            improvements=improvements,
        )
