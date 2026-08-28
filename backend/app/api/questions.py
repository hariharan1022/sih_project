from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import ClinicalQuestion
from app.schemas.schemas import QuestionOut

router = APIRouter(prefix="/questions", tags=["Clinical Questions"])

@router.get("", response_model=List[QuestionOut])
async def list_questions(category: Optional[str] = None, ayush_only: bool = False, db: AsyncSession = Depends(get_db)):
    stmt = select(ClinicalQuestion).where(ClinicalQuestion.is_active == True)
    if category:
        stmt = stmt.where(ClinicalQuestion.category == category)
    if ayush_only:
        stmt = stmt.where(ClinicalQuestion.is_ayush == True)
        
    result = await db.execute(stmt)
    return result.scalars().all()
