from celery import Celery

from app.core.config import get_settings


settings = get_settings()

celery_app = Celery(
    "exam_ai_backend",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.task_routes = {
    # "app.workers.tasks.generate_exam": {"queue": "exam_generation"},
}

