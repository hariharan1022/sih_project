from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import ClinicalHistory, KioskSession, Patient
from app.services.red_flag_engine import red_flag_engine

router = APIRouter(prefix="/red-flags", tags=["Red Flag Detection & Triage"])

@router.post("/assess")
async def assess_red_flags(payload: Dict[str, Any]):
    chief_complaint = payload.get("chief_complaint", "")
    hpi = payload.get("history_of_present_illness", "")
    answers = payload.get("answers", {})

    detected = red_flag_engine.evaluate_clinical_data(
        chief_complaint=chief_complaint,
        hpi=hpi,
        answers=answers
    )
    return {
        "has_red_flags": len(detected) > 0,
        "count": len(detected),
        "red_flags": detected
    }

@router.get("/active")
async def get_active_red_flags(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(KioskSession)
        .where(KioskSession.has_red_flags == True)
        .order_by(KioskSession.started_at.desc())
    )
    sessions = res.scalars().all()
    
    active_alerts = []
    for s in sessions:
        p_res = await db.execute(select(Patient).where(Patient.id == s.patient_id))
        patient = p_res.scalars().first()
        
        h_res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == s.id))
        history = h_res.scalars().first()
        
        active_alerts.append({
            "session_id": s.id,
            "token_number": s.token_number,
            "patient_name": patient.full_name if patient else "Unknown",
            "age": patient.age if patient else 0,
            "gender": patient.gender if patient else "",
            "department": s.department,
            "chief_complaint": history.chief_complaint if history else "Unknown",
            "red_flags": history.red_flags if history else [],
            "started_at": s.started_at
        })
        
    return active_alerts
