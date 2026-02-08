"""API endpoints for hint catalog and purchases."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.api.deps import DbSessionDep, get_current_user
from app.models.user import User
from app.schemas.hint import (
    HintCatalogResponse,
    HintPurchaseRequest,
    HintPurchaseResponse,
    PurchasedHintResponse,
    PurchasedHintsListResponse,
)
from app.services.hint_service import HintService
from app.services.wallet_service import InsufficientCoinsError

logger = logging.getLogger(__name__)

router = APIRouter(tags=["hints"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/exams/{exam_id}/hints/catalog", response_model=HintCatalogResponse)
async def get_hint_catalog(
    exam_id: Annotated[int, Path(gt=0, description="Exam ID")],
    db: DbSessionDep,
    current_user: CurrentUser,
):
    """Get hint catalog for an exam.
    
    Args:
        exam_id: Exam ID.
        
    Returns:
        HintCatalogResponse with available hints metadata.
        
    Raises:
        HTTPException: If exam not found.
    """
    hint_service = HintService(db)
    
    try:
        hints = await hint_service.get_hint_catalog(exam_id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    
    from app.schemas.hint import HintCatalogItem
    
    result = {}
    for question_key, hint_list in hints.items():
        result[question_key] = [
            HintCatalogItem(**hint) for hint in hint_list
        ]
    
    return HintCatalogResponse(hints=result)


@router.post(
    "/attempts/{attempt_id}/hints/purchase",
    response_model=HintPurchaseResponse,
    status_code=status.HTTP_200_OK,
)
async def purchase_hint(
    attempt_id: Annotated[int, Path(gt=0, description="Attempt ID")],
    request: HintPurchaseRequest,
    db: DbSessionDep,
    current_user: CurrentUser,
):
    """Purchase a hint for an attempt.
    
    Args:
        attempt_id: Attempt ID.
        request: Hint purchase request with question_key and hint_level.
        
    Returns:
        HintPurchaseResponse with hint content and updated balance.
        
    Raises:
        HTTPException: Various errors (403, 402, 400, 409).
    """
    hint_service = HintService(db)
    
    try:
        result = await hint_service.purchase_hint(
            attempt_id=attempt_id,
            user_id=current_user.id,
            question_key=request.question_key,
            hint_level=request.hint_level,
        )
        
        await db.commit()
        
        return HintPurchaseResponse(**result)
        
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except InsufficientCoinsError as e:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(e),
        )
    except ValueError as e:
        error_msg = str(e).lower()
        
        if "status" in error_msg or "after" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e),
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/attempts/{attempt_id}/hints",
    response_model=PurchasedHintsListResponse,
)
async def get_purchased_hints(
    attempt_id: Annotated[int, Path(gt=0, description="Attempt ID")],
    db: DbSessionDep,
    current_user: CurrentUser,
):
    """Get all purchased hints for an attempt.
    
    Args:
        attempt_id: Attempt ID.
        
    Returns:
        PurchasedHintsListResponse with all purchased hints.
    """
    hint_service = HintService(db)
    hints = await hint_service.get_purchased_hints(attempt_id)
    
    return PurchasedHintsListResponse(
        hints=[PurchasedHintResponse(**h) for h in hints]
    )

