from fastapi import APIRouter


router = APIRouter(tags=["health"])


@router.get("/health", summary="Healthcheck cho deployment")
async def healthcheck() -> dict[str, str]:
    """Endpoint đơn giản để Railway/monitoring kiểm tra trạng thái."""

    return {"status": "ok"}

