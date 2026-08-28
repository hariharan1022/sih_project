import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import Patient, AuditLog
from app.schemas.schemas import PatientCreate, PatientOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("", response_model=PatientOut)
async def create_patient(patient_in: PatientCreate, db: AsyncSession = Depends(get_db)):
    mrn = f"MRN-{random.randint(10000, 99999)}"
    patient = Patient(
        mrn=mrn,
        full_name=patient_in.full_name,
        age=patient_in.age,
        gender=patient_in.gender,
        contact_phone=patient_in.contact_phone,
        emergency_contact=patient_in.emergency_contact,
        blood_group=patient_in.blood_group,
        preferred_language=patient_in.preferred_language,
        abha_id=patient_in.abha_id
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

@router.get("", response_model=List[PatientOut])
async def list_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
    return result.scalars().all()

@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
