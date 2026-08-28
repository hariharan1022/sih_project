import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"
    TRIAGE_STAFF = "TRIAGE_STAFF"

class SessionStatus(str, enum.Enum):
    STARTED = "STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    TRIAGED_RED_FLAG = "TRIAGED_RED_FLAG"
    COMPLETED = "COMPLETED"
    VERIFIED_BY_DOCTOR = "VERIFIED_BY_DOCTOR"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default=UserRole.PATIENT.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class Patient(Base):
    __tablename__ = "patients"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    abha_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    mrn: Mapped[str] = mapped_column(String(50), unique=True, index=True) # Medical Record Number
    full_name: Mapped[str] = mapped_column(String(255))
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str] = mapped_column(String(20)) # Male, Female, Other
    contact_phone: Mapped[str] = mapped_column(String(20))
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class Doctor(Base):
    __tablename__ = "doctors"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    full_name: Mapped[str] = mapped_column(String(255))
    qualification: Mapped[str] = mapped_column(String(255))
    specialty: Mapped[str] = mapped_column(String(100))
    department_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    room_number: Mapped[str] = mapped_column(String(20))
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

class Department(Base):
    __tablename__ = "departments"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class KioskSession(Base):
    __tablename__ = "kiosk_sessions"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    token_number: Mapped[str] = mapped_column(String(20), index=True) # e.g. T-101
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"))
    assigned_doctor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("doctors.id"), nullable=True)
    department: Mapped[str] = mapped_column(String(100), default="General Medicine")
    status: Mapped[str] = mapped_column(String(50), default=SessionStatus.STARTED.value)
    current_step: Mapped[str] = mapped_column(String(50), default="LANGUAGE_SELECT")
    language: Mapped[str] = mapped_column(String(10), default="en") # en, ta, hi
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    has_red_flags: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class ConsentRecord(Base):
    __tablename__ = "consent_records"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("kiosk_sessions.id"))
    consent_type: Mapped[str] = mapped_column(String(100), default="CLINICAL_INTAKE_AND_AI_PROCESSING")
    language: Mapped[str] = mapped_column(String(10), default="en")
    status: Mapped[str] = mapped_column(String(20), default="AGREED")
    version: Mapped[str] = mapped_column(String(10), default="v1.0")
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class ClinicalHistory(Base):
    __tablename__ = "clinical_histories"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("kiosk_sessions.id"), unique=True)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"))
    
    chief_complaint: Mapped[str] = mapped_column(Text, default="")
    history_of_present_illness: Mapped[str] = mapped_column(Text, default="")
    past_medical_history: Mapped[dict] = mapped_column(JSON, default=list) # list of items
    past_surgical_history: Mapped[dict] = mapped_column(JSON, default=list)
    medications: Mapped[dict] = mapped_column(JSON, default=list) # [{name, dosage, frequency}]
    allergies: Mapped[dict] = mapped_column(JSON, default=list)
    family_history: Mapped[dict] = mapped_column(JSON, default=list)
    personal_history: Mapped[dict] = mapped_column(JSON, default=dict) # smoking, alcohol, diet
    review_of_systems: Mapped[dict] = mapped_column(JSON, default=dict)
    investigations: Mapped[dict] = mapped_column(JSON, default=list)
    
    # AYUSH fields
    ayush_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    
    # Red Flags
    red_flags: Mapped[dict] = mapped_column(JSON, default=list)
    
    # AI generated physician summary
    ai_generated_summary: Mapped[Text] = mapped_column(Text, default="")
    
    # Doctor approval state
    doctor_approved_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    doctor_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_by_doctor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("doctors.id"), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, VERIFIED, EDITED, REJECTED
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class MedicalDocument(Base):
    __tablename__ = "medical_documents"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("kiosk_sessions.id"))
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"))
    file_name: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[str] = mapped_column(String(50)) # PDF, JPG, PNG
    file_url: Mapped[str] = mapped_column(String(500))
    doc_type: Mapped[str] = mapped_column(String(100), default="GENERAL_REPORT") # PRESCRIPTION, LAB_REPORT, DISCHARGE_SUMMARY
    document_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # YYYY-MM-DD
    ocr_raw_text: Mapped[Text] = mapped_column(Text, default="")
    extracted_entities: Mapped[dict] = mapped_column(JSON, default=dict)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class ClinicalQuestion(Base):
    __tablename__ = "clinical_questions"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    code: Mapped[str] = mapped_column(String(50), unique=True)
    category: Mapped[str] = mapped_column(String(50)) # HPI, PMH, DRUG, ALLERGY, AYUSH, SYSTEM_REVIEW
    question_text_en: Mapped[str] = mapped_column(Text)
    question_text_ta: Mapped[str] = mapped_column(Text)
    question_text_hi: Mapped[str] = mapped_column(Text)
    options: Mapped[dict] = mapped_column(JSON, default=list) # [{label_en, label_ta, label_hi, value}]
    is_ayush: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    actor_role: Mapped[str] = mapped_column(String(50), default="PATIENT")
    action: Mapped[str] = mapped_column(String(100)) # LOGIN, CONSENT_ACCEPTED, OCR_PROCESSED, RED_FLAG_TRIGGERED, DOCTOR_APPROVED
    resource: Mapped[str] = mapped_column(String(100))
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    config_key: Mapped[str] = mapped_column(String(100), unique=True)
    value_json: Mapped[dict] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
