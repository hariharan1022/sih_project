from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.domain import User, Patient, Doctor, Department, KioskSession, ClinicalHistory, MedicalDocument, AuditLog, SystemConfig
from app.schemas.schemas import DashboardStats, AdminConfigUpdate
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Portal & System Config"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    tot_patients = await db.scalar(select(func.count(Patient.id))) or 0
    tot_sessions = await db.scalar(select(func.count(KioskSession.id))) or 0
    pending_reviews = await db.scalar(select(func.count(ClinicalHistory.id)).where(ClinicalHistory.verification_status == "PENDING")) or 0
    completed_histories = await db.scalar(select(func.count(ClinicalHistory.id)).where(ClinicalHistory.verification_status == "VERIFIED")) or 0
    red_flag_alerts = await db.scalar(select(func.count(KioskSession.id)).where(KioskSession.has_red_flags == True)) or 0
    documents_processed = await db.scalar(select(func.count(MedicalDocument.id))) or 0

    return DashboardStats(
        todays_patients=tot_patients,
        pending_reviews=pending_reviews,
        completed_histories=completed_histories,
        red_flag_alerts=red_flag_alerts,
        documents_processed=documents_processed
    )

@router.get("/config")
async def get_admin_config(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(SystemConfig))
    configs = {c.config_key: c.value_json for c in res.scalars().all()}
    
    return {
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": configs.get("ollama_model", settings.OLLAMA_MODEL),
        "ayush_mode_enabled": configs.get("ayush_mode_enabled", True),
        "red_flag_triage_enabled": configs.get("red_flag_triage_enabled", True),
        "session_timeout_minutes": configs.get("session_timeout_minutes", settings.SESSION_TIMEOUT_MINUTES)
    }

@router.post("/config")
async def update_admin_config(config_in: AdminConfigUpdate, db: AsyncSession = Depends(get_db)):
    if config_in.ollama_model is not None:
        settings.OLLAMA_MODEL = config_in.ollama_model
        await _upsert_config(db, "ollama_model", config_in.ollama_model)

    if config_in.ayush_mode_enabled is not None:
        await _upsert_config(db, "ayush_mode_enabled", config_in.ayush_mode_enabled)

    if config_in.red_flag_triage_enabled is not None:
        await _upsert_config(db, "red_flag_triage_enabled", config_in.red_flag_triage_enabled)

    if config_in.session_timeout_minutes is not None:
        await _upsert_config(db, "session_timeout_minutes", config_in.session_timeout_minutes)

    await db.commit()
    return {"status": "SUCCESS", "message": "System configuration updated."}

async def _upsert_config(db: AsyncSession, key: str, val: Any):
    res = await db.execute(select(SystemConfig).where(SystemConfig.config_key == key))
    item = res.scalars().first()
    if item:
        item.value_json = val
    else:
        db.add(SystemConfig(config_key=key, value_json=val))
