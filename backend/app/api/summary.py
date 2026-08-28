from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import ClinicalHistory, KioskSession, Doctor, SessionStatus, AuditLog
from app.schemas.schemas import AIClinicalSummaryResponse, DoctorVerificationSubmit, ClinicalHistoryOut
from app.services.ai_service import ai_service

router = APIRouter(prefix="/summary", tags=["Clinical Summary & Doctor Verification"])

@router.get("/generate/{session_id}")
async def generate_summary_for_session(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == session_id))
    history = res.scalars().first()
    if not history:
        raise HTTPException(status_code=404, detail="No clinical history record for session")

    summary_json = await ai_service.generate_physician_summary({
        "chief_complaint": history.chief_complaint,
        "history_of_present_illness": history.history_of_present_illness,
        "past_medical_history": history.past_medical_history,
        "past_surgical_history": history.past_surgical_history,
        "medications": history.medications,
        "allergies": history.allergies,
        "family_history": history.family_history,
        "personal_history": history.personal_history,
        "review_of_systems": history.review_of_systems,
        "investigations": history.investigations,
        "red_flags": history.red_flags
    })
    return summary_json

@router.post("/verify", response_model=ClinicalHistoryOut)
async def doctor_verify_summary(verify_in: DoctorVerificationSubmit, db: AsyncSession = Depends(get_db)):
    """Allows doctor to edit, verify, approve, or reject the AI-generated clinical summary."""
    res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == verify_in.session_id))
    history = res.scalars().first()
    if not history:
        raise HTTPException(status_code=404, detail="Clinical history record not found")

    # Update doctor verified fields (Physician Control Principle)
    history.doctor_approved_summary = verify_in.doctor_approved_summary
    history.doctor_notes = verify_in.doctor_notes or ""
    history.verification_status = verify_in.status
    history.updated_at = datetime.now(timezone.utc)

    # Update session status
    s_res = await db.execute(select(KioskSession).where(KioskSession.id == verify_in.session_id))
    session = s_res.scalars().first()
    if session:
        session.status = SessionStatus.VERIFIED_BY_DOCTOR.value
        session.current_step = "DOCTOR_VERIFIED"

    # Audit log doctor verification
    db.add(AuditLog(
        actor_role="DOCTOR",
        action=f"DOCTOR_{verify_in.status.upper()}_SUMMARY",
        resource="CLINICAL_SUMMARY",
        details=f"Doctor updated verification status to {verify_in.status} for session {verify_in.session_id}"
    ))

    await db.commit()
    await db.refresh(history)
    return history
