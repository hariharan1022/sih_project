from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import Patient, ClinicalHistory, AuditLog
from app.schemas.schemas import ABHAVerifyRequest, ABHAVerifyResponse, FHIRBundleOut
from app.services.abdm_service import abdm_service

router = APIRouter(prefix="/abdm", tags=["ABDM Sandbox & FHIR API"])

@router.post("/verify-abha", response_model=ABHAVerifyResponse)
async def verify_abha_identity(req: ABHAVerifyRequest, db: AsyncSession = Depends(get_db)):
    res = abdm_service.verify_abha_id(req.abha_id)
    
    # Audit log
    db.add(AuditLog(
        actor_role="PATIENT",
        action="ABHA_VERIFICATION_ATTEMPT",
        resource="ABDM_SANDBOX",
        details=f"Verification attempted for ABHA ID {req.abha_id}"
    ))
    await db.commit()
    
    return res

@router.get("/fhir-bundle/{session_id}")
async def get_fhir_bundle(session_id: str, db: AsyncSession = Depends(get_db)):
    h_res = await db.execute(select(ClinicalHistory).where(ClinicalHistory.session_id == session_id))
    history = h_res.scalars().first()
    if not history:
        raise HTTPException(status_code=404, detail="Clinical history not found for FHIR conversion")

    p_res = await db.execute(select(Patient).where(Patient.id == history.patient_id))
    patient = p_res.scalars().first()

    patient_dict = {
        "id": patient.id if patient else "P-1001",
        "full_name": patient.full_name if patient else "Demo Patient",
        "mrn": patient.mrn if patient else "MRN-1001",
        "abha_id": patient.abha_id if patient else "91-9876-5432-1098",
        "gender": patient.gender if patient else "male",
        "contact_phone": patient.contact_phone if patient else "+919876543210"
    }

    history_dict = {
        "chief_complaint": history.chief_complaint,
        "medications": history.medications
    }

    bundle = abdm_service.generate_fhir_bundle(patient_dict, history_dict)
    return bundle
