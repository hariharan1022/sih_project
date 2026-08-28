from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs")
async def get_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    return res.scalars().all()
