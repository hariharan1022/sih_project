from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import ClinicalHistory, KioskSession, Patient, SessionStatus, AuditLog
from app.schemas.schemas import ClinicalHistoryInput, ClinicalHistoryOut
from app.services.ai_service import ai_service
from app.services.red_flag_engine import red_flag_engine

router = APIRouter(prefix="/history", tags=["Clinical History"])

@router.post("/submit", response_model=ClinicalHistoryOut)
async def submit_clinical_history(history_in: ClinicalHistoryInput, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KioskSession).where(KioskSession.id == history_in.session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Kiosk session not found")

    # Evaluate red flags
    detected_red_flags = red_flag_engine.evaluate_clinical_data(
        chief_complaint=history_in.chief_complaint,
        hpi=history_in.history_of_present_illness,
        answers={"past_medical": history_in.past_medical_history, "meds": history_in.medications}
    )

    if detected_red_flags:
        session.has_red_flags = True
        session.status = SessionStatus.TRIAGED_RED_FLAG.value
        
        # Add red flag audit log
        db.add(AuditLog(
            actor_role="SYSTEM",
            action="RED_FLAG_TRIGGERED",
            resource="CLINICAL_HISTORY",
            details=f"Red Flag(s) detected for session {session.id}: {detected_red_flags[0]['title']}"
        ))

    # Generate initial AI Summary
    summary_data = await ai_service.generate_physician_summary({
        "chief_complaint": history_in.chief_complaint,
        "history_of_present_illness": history_in.history_of_present_illness,
        "past_medical_history": history_in.past_medical_history,
        "past_surgical_history": history_in.past_surgical_history,
        "medications": history_in.medications,
        "allergies": history_in.allergies,
        "family_history": history_in.family_history,
        "personal_history": history_in.personal_history,
        "review_of_systems": history_in.review_of_systems,
        "investigations": history_in.investigations,
        "red_flags": detected_red_flags
    })

    formatted_summary = summary_data.get("formatted_physician_summary", "")

    # Check existing history record for this session
    h_res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == history_in.session_id))
    existing_h = h_res.scalars().first()

    if existing_h:
        existing_h.chief_complaint = history_in.chief_complaint
        existing_h.history_of_present_illness = history_in.history_of_present_illness
        existing_h.past_medical_history = history_in.past_medical_history
        existing_h.past_surgical_history = history_in.past_surgical_history
        existing_h.medications = history_in.medications
        existing_h.allergies = history_in.allergies
        existing_h.family_history = history_in.family_history
        existing_h.personal_history = history_in.personal_history
        existing_h.review_of_systems = history_in.review_of_systems
        existing_h.investigations = history_in.investigations
        existing_h.ayush_data = history_in.ayush_data or {}
        existing_h.red_flags = detected_red_flags
        existing_h.ai_generated_summary = formatted_summary
        record = existing_h
    else:
        record = ClinicalHistory(
            session_id=history_in.session_id,
            patient_id=session.patient_id,
            chief_complaint=history_in.chief_complaint,
            history_of_present_illness=history_in.history_of_present_illness,
            past_medical_history=history_in.past_medical_history,
            past_surgical_history=history_in.past_surgical_history,
            medications=history_in.medications,
            allergies=history_in.allergies,
            family_history=history_in.family_history,
            personal_history=history_in.personal_history,
            review_of_systems=history_in.review_of_systems,
            investigations=history_in.investigations,
            ayush_data=history_in.ayush_data or {},
            red_flags=detected_red_flags,
            ai_generated_summary=formatted_summary,
            verification_status="PENDING"
        )
        db.add(record)

    session.current_step = "COMPLETED"
    if session.status != SessionStatus.TRIAGED_RED_FLAG.value:
        session.status = SessionStatus.COMPLETED.value
    session.completed_at = datetime.now(timezone.utc)

    # Audit log completion
    db.add(AuditLog(
        actor_role="PATIENT",
        action="CLINICAL_INTAKE_SUBMITTED",
        resource="SESSION",
        details=f"Clinical intake submitted for token {session.token_number}"
    ))

    await db.commit()
    await db.refresh(record)
    return record

@router.get("/session/{session_id}", response_model=ClinicalHistoryOut)
async def get_history_by_session(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == session_id))
    history = res.scalars().first()
    if not history:
        raise HTTPException(status_code=404, detail="Clinical history not found for this session")
    return history
