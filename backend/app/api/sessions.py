import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import KioskSession, Patient, ConsentRecord, SessionStatus, AuditLog
from app.schemas.schemas import SessionCreate, SessionOut, ConsentSubmit

router = APIRouter(prefix="/sessions", tags=["Kiosk Sessions"])

@router.post("", response_model=SessionOut)
async def create_kiosk_session(data: SessionCreate, db: AsyncSession = Depends(get_db)):
    patient_id = data.patient_id
    
    # Auto-register patient if demographic details are provided without patient_id
    if not patient_id and data.full_name:
        mrn = f"MRN-{random.randint(10000, 99999)}"
        new_patient = Patient(
            mrn=mrn,
            full_name=data.full_name,
            age=data.age or 40,
            gender=data.gender or "Male",
            contact_phone=data.contact_phone or "+919876543210",
            preferred_language=data.language
        )
        db.add(new_patient)
        await db.commit()
        await db.refresh(new_patient)
        patient_id = new_patient.id

    if not patient_id:
        # Fallback to demo patient
        res = await db.execute(select(Patient).limit(1))
        p = res.scalars().first()
        if p:
            patient_id = p.id
        else:
            mrn = f"MRN-{random.randint(10000, 99999)}"
            new_patient = Patient(mrn=mrn, full_name="Demo Patient", age=45, gender="Male", contact_phone="+919876543210")
            db.add(new_patient)
            await db.commit()
            await db.refresh(new_patient)
            patient_id = new_patient.id

    token_number = f"T-{random.randint(100, 999)}"
    session = KioskSession(
        token_number=token_number,
        patient_id=patient_id,
        department=data.department,
        status=SessionStatus.STARTED.value,
        current_step="LANGUAGE_SELECT",
        language=data.language
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    # Audit log
    audit = AuditLog(actor_role="PATIENT", action="KIOSK_SESSION_STARTED", resource="SESSION", details=f"Token {token_number} generated for session {session.id}")
    db.add(audit)
    await db.commit()

    # Load patient
    p_res = await db.execute(select(Patient).where(Patient.id == patient_id))
    session.patient = p_res.scalars().first()
    return session

@router.get("/{session_id}", response_model=SessionOut)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KioskSession).where(KioskSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    p_res = await db.execute(select(Patient).where(Patient.id == session.patient_id))
    session.patient = p_res.scalars().first()
    return session

@router.post("/consent")
async def record_consent(consent: ConsentSubmit, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KioskSession).where(KioskSession.id == consent.session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.consent_given = consent.agreed
    session.current_step = "CHIEF_COMPLAINT" if consent.agreed else "CONSENT_DECLINED"
    
    record = ConsentRecord(
        patient_id=session.patient_id,
        session_id=session.id,
        language=consent.language,
        status="AGREED" if consent.agreed else "DECLINED"
    )
    db.add(record)
    
    audit = AuditLog(
        actor_role="PATIENT",
        action="CONSENT_RECORDED",
        resource="CONSENT",
        details=f"Patient consent {'AGREED' if consent.agreed else 'DECLINED'} in language {consent.language}"
    )
    db.add(audit)
    await db.commit()

    return {"status": "SUCCESS", "consent_given": consent.agreed, "next_step": session.current_step}

@router.patch("/{session_id}/step")
async def update_session_step(session_id: str, step: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KioskSession).where(KioskSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.current_step = step
    if step == "COMPLETED":
        session.status = SessionStatus.COMPLETED.value
        session.completed_at = datetime.now(timezone.utc)
        
    await db.commit()
    return {"session_id": session_id, "current_step": session.current_step, "status": session.status}
