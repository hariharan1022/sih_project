from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import Doctor, KioskSession, Patient, ClinicalHistory, SessionStatus
from app.schemas.schemas import DoctorOut, SessionOut

router = APIRouter(prefix="/doctors", tags=["Doctors & Patient Queue"])

@router.get("", response_model=List[DoctorOut])
async def list_doctors(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Doctor))
    return res.scalars().all()

@router.get("/queue", response_model=List[SessionOut])
async def get_patient_queue(status_filter: Optional[str] = None, red_flags_only: bool = False, db: AsyncSession = Depends(get_db)):
    stmt = select(KioskSession)
    
    if red_flags_only:
        stmt = stmt.where(KioskSession.has_red_flags == True)
    elif status_filter:
        stmt = stmt.where(KioskSession.status == status_filter)
    else:
        # Default queue shows active/completed/red-flagged sessions needing review
        stmt = stmt.where(KioskSession.status.in_([
            SessionStatus.COMPLETED.value,
            SessionStatus.TRIAGED_RED_FLAG.value,
            SessionStatus.IN_PROGRESS.value,
            SessionStatus.VERIFIED_BY_DOCTOR.value
        ]))
        
    stmt = stmt.order_by(KioskSession.has_red_flags.desc(), KioskSession.started_at.desc())
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    # Attach patient details
    out = []
    for s in sessions:
        p_res = await db.execute(select(Patient).where(Patient.id == s.patient_id))
        s.patient = p_res.scalars().first()
        out.append(s)

    return out
