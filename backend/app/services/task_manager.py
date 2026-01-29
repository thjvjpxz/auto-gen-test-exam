"""Task manager for handling background exam generation tasks.

This module provides a simple in-memory task management system for
tracking the status of async exam generation operations.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exam import Exam, ExamType
from app.schemas.exam import ExamGenerateRequest
from app.services.ai_service import ExamGeneratorService

logger = logging.getLogger(__name__)

# Constants for progress tracking
PROGRESS_INIT = 10
PROGRESS_AI_READY = 20
PROGRESS_AI_COMPLETE = 70
PROGRESS_DONE = 100


class TaskStatus(str, Enum):
    """Status of a background task."""

    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskManager:
    """Manages background tasks for exam generation.
    
    This is a simple in-memory implementation suitable for single-server
    deployments. For production multi-server setups, consider using Redis
    or a similar distributed cache.
    """

    _tasks: dict[str, dict[str, Any]] = {}
    _running_tasks: dict[str, asyncio.Task] = {}
    _cleanup_interval: int = 3600  # 1 hour in seconds

    @classmethod
    def generate_task_id(cls) -> str:
        """Generate a unique task ID.
        
        Returns:
            UUID string as task identifier.
        """
        return str(uuid4())

    @classmethod
    def create_task(
        cls,
        task_id: str,
        user_id: int,
        request: ExamGenerateRequest,
        db_session_factory: Any,
    ) -> None:
        """Create and start a new exam generation background task.
        
        Args:
            task_id: Unique task identifier.
            user_id: ID of the user creating the exam.
            request: Exam generation request parameters.
            db_session_factory: Database session factory for creating new sessions.
        """
        # Initialize task status
        cls._tasks[task_id] = {
            "status": TaskStatus.PENDING,
            "created_at": datetime.utcnow(),
            "exam_id": None,
            "error": None,
            "progress": 0,
        }

        # Create and store the background task
        task = asyncio.create_task(
            cls._run_generation_task(
                task_id=task_id,
                user_id=user_id,
                request=request,
                db_session_factory=db_session_factory,
            )
        )
        cls._running_tasks[task_id] = task

    @classmethod
    async def _run_generation_task(
        cls,
        task_id: str,
        user_id: int,
        request: ExamGenerateRequest,
        db_session_factory: Any,
    ) -> None:
        """Run the exam generation task in the background.
        
        Args:
            task_id: Unique task identifier.
            user_id: ID of the user creating the exam.
            request: Exam generation request parameters.
            db_session_factory: Database session factory.
        """
        try:
            logger.info(f"Starting exam generation task {task_id}")
            cls._update_progress(task_id, PROGRESS_INIT)

            # Initialize AI service
            generator = ExamGeneratorService()
            cls._update_progress(task_id, PROGRESS_AI_READY)

            # Generate exam content with AI
            logger.info(f"Calling Gemini API for task {task_id}")
            exam_data = await generator.generate_exam()
            cls._update_progress(task_id, PROGRESS_AI_COMPLETE)

            # Save to database
            logger.info(f"Saving exam to database for task {task_id}")
            async with db_session_factory() as db:
                exam = Exam(
                    title=exam_data["exam_title"],
                    exam_type=request.exam_type,
                    subject=request.subject,
                    created_by=user_id,
                    duration=request.duration,
                    passing_score=request.passing_score,
                    exam_data_json={
                        "sql_part": exam_data["sql_part"],
                        "testing_part": exam_data["testing_part"],
                    },
                    ai_generated=True,
                    gemini_model=generator.model_name,
                    settings_json={
                        "allow_review": True,
                        "show_sample_solution": False,
                        "max_attempts": 3,
                    },
                    is_published=False,
                )

                db.add(exam)
                await db.commit()
                await db.refresh(exam)

                exam_id = exam.id
                cls._update_progress(task_id, PROGRESS_DONE)

            # Mark task as completed
            cls._tasks[task_id].update({
                "status": TaskStatus.COMPLETED,
                "exam_id": exam_id,
                "completed_at": datetime.utcnow(),
                "progress": PROGRESS_DONE,
            })

            logger.info(f"Task {task_id} completed successfully. Exam ID: {exam_id}")

        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}", exc_info=True)
            
            # Mark task as failed
            cls._tasks[task_id].update({
                "status": TaskStatus.FAILED,
                "error": str(e),
                "failed_at": datetime.utcnow(),
            })

        finally:
            # Clean up running task reference
            if task_id in cls._running_tasks:
                del cls._running_tasks[task_id]

    @classmethod
    def _update_progress(cls, task_id: str, progress: int) -> None:
        """Update task progress percentage.
        
        Args:
            task_id: Task identifier.
            progress: Progress percentage (0-100).
        """
        if task_id in cls._tasks:
            cls._tasks[task_id]["progress"] = progress

    @classmethod
    def get_task_status(cls, task_id: str) -> dict[str, Any] | None:
        """Get the current status of a task.
        
        Args:
            task_id: Task identifier.
            
        Returns:
            Task status dictionary or None if task not found.
        """
        return cls._tasks.get(task_id)

    @classmethod
    async def cleanup_old_tasks(cls, max_age_seconds: int | None = None) -> int:
        """Remove old completed/failed tasks from memory.
        
        Args:
            max_age_seconds: Maximum age in seconds. Defaults to cleanup_interval.
            
        Returns:
            Number of tasks cleaned up.
        """
        if max_age_seconds is None:
            max_age_seconds = cls._cleanup_interval

        cutoff_time = datetime.utcnow() - timedelta(seconds=max_age_seconds)
        tasks_to_remove = []

        for task_id, task_data in cls._tasks.items():
            created_at = task_data.get("created_at")
            if created_at and created_at < cutoff_time:
                # Only remove completed or failed tasks
                if task_data["status"] in (TaskStatus.COMPLETED, TaskStatus.FAILED):
                    tasks_to_remove.append(task_id)

        for task_id in tasks_to_remove:
            del cls._tasks[task_id]
            logger.info(f"Cleaned up old task {task_id}")

        return len(tasks_to_remove)
