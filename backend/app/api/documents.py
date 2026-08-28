import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.domain import MedicalDocument, KioskSession, AuditLog
from app.schemas.schemas import DocumentOCRResponse, MedicalTimelineItem
from app.services.ocr_service import ocr_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/documents", tags=["Medical Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    session_id: str = Form(...),
    doc_type: str = Form("GENERAL_REPORT"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    s_res = await db.execute(select(KioskSession).where(KioskSession.id == session_id))
    session = s_res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, JPG, or PNG.")

    file_id = str(uuid.uuid4())
    saved_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Perform OCR
    raw_ocr_text, ocr_engine = await ocr_service.extract_text_from_file(file_path)

    # Perform AI entity extraction
    entities = await ai_service.parse_document_text(raw_ocr_text, file.filename)

    doc_type_extracted = entities.get("document_type", doc_type)
    doc_date = entities.get("document_date", "2026-08-25")

    doc_record = MedicalDocument(
        id=file_id,
        session_id=session.id,
        patient_id=session.patient_id,
        file_name=file.filename,
        file_type=ext.replace(".", "").upper(),
        file_url=f"/uploads/{saved_filename}",
        doc_type=doc_type_extracted,
        document_date=doc_date,
        ocr_raw_text=raw_ocr_text,
        extracted_entities=entities
    )

    db.add(doc_record)
    
    # Audit log
    db.add(AuditLog(
        actor_role="PATIENT",
        action="DOCUMENT_UPLOADED",
        resource="MEDICAL_DOCUMENT",
        details=f"Uploaded {file.filename} (OCR Engine: {ocr_engine})"
    ))

    await db.commit()
    await db.refresh(doc_record)

    return {
        "document_id": doc_record.id,
        "file_name": doc_record.file_name,
        "file_url": doc_record.file_url,
        "doc_type": doc_record.doc_type,
        "document_date": doc_record.document_date,
        "ocr_raw_text": doc_record.ocr_raw_text,
        "extracted_entities": doc_record.extracted_entities
    }

@router.get("/session/{session_id}")
async def get_session_documents(session_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MedicalDocument).where(MedicalDocument.session_id == session_id).order_by(MedicalDocument.uploaded_at.desc()))
    return res.scalars().all()

@router.get("/patient/{patient_id}/timeline", response_model=List[MedicalTimelineItem])
async def get_patient_document_timeline(patient_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MedicalDocument).where(MedicalDocument.patient_id == patient_id))
    docs = res.scalars().all()

    timeline = []
    for d in docs:
        diag = ", ".join(d.extracted_entities.get("diagnoses", []))
        meds = ", ".join([m.get("name", "") if isinstance(m, dict) else str(m) for m in d.extracted_entities.get("medications", [])])
        summary_text = f"Diagnoses: {diag or 'None'} | Meds: {meds or 'None'}"

        timeline.append(MedicalTimelineItem(
            document_id=d.id,
            file_name=d.file_name,
            doc_type=d.doc_type,
            document_date=d.document_date or "2026-08-01",
            summary=summary_text,
            extracted_entities=d.extracted_entities
        ))

    # Sort chronologically descending
    timeline.sort(key=lambda x: x.document_date, reverse=True)
    return timeline
