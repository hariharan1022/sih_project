from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: str = "DOCTOR"

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Patient & Doctor Schemas ---
class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    contact_phone: str
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    preferred_language: str = "en"
    abha_id: Optional[str] = None

class PatientOut(BaseModel):
    id: str
    mrn: str
    full_name: str
    age: int
    gender: str
    contact_phone: str
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    preferred_language: str
    abha_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DoctorOut(BaseModel):
    id: str
    full_name: str
    qualification: str
    specialty: str
    room_number: str
    is_available: bool
    
    class Config:
        from_attributes = True

# --- Kiosk Session & Consent ---
class SessionCreate(BaseModel):
    patient_id: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_phone: Optional[str] = None
    language: str = "en"
    department: str = "General Medicine"

class ConsentSubmit(BaseModel):
    session_id: str
    agreed: bool
    language: str = "en"

class SessionOut(BaseModel):
    id: str
    token_number: str
    patient_id: str
    department: str
    status: str
    current_step: str
    language: str
    consent_given: bool
    has_red_flags: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    patient: Optional[PatientOut] = None

    class Config:
        from_attributes = True

# --- Question & Voice Interaction ---
class QuestionOption(BaseModel):
    label_en: str
    label_ta: str
    label_hi: str
    value: str

class QuestionOut(BaseModel):
    id: str
    code: str
    category: str
    question_text_en: str
    question_text_ta: str
    question_text_hi: str
    options: List[QuestionOption] = []
    is_ayush: bool = False

class DynamicQuestionRequest(BaseModel):
    session_id: str
    chief_complaint: str
    previous_answers: Dict[str, Any] = {}
    language: str = "en"

class AIQuestionResponse(BaseModel):
    next_question_code: str
    category: str
    question_text: str
    suggested_options: List[str] = []
    is_complete: bool = False
    detected_red_flags: List[str] = []

class AudioTranscribeRequest(BaseModel):
    language: str = "en"

class AudioTranscribeResponse(BaseModel):
    text: str
    detected_language: str
    confidence: float

# --- Document & OCR Schemas ---
class DocumentOCRResponse(BaseModel):
    document_id: str
    file_name: str
    doc_type: str
    ocr_text: str
    document_date: Optional[str] = None
    extracted_entities: Dict[str, Any]

class MedicalTimelineItem(BaseModel):
    document_id: str
    file_name: str
    doc_type: str
    document_date: str
    summary: str
    extracted_entities: Dict[str, Any]

# --- Red Flag Alerts ---
class RedFlagAlert(BaseModel):
    flag_code: str
    severity: str # CRITICAL, HIGH, MEDIUM
    category: str
    title: str
    description: str
    action_required: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Clinical History & AI Physician Summary ---
class ClinicalHistoryInput(BaseModel):
    session_id: str
    chief_complaint: str
    history_of_present_illness: str
    past_medical_history: List[str] = []
    past_surgical_history: List[str] = []
    medications: List[Dict[str, str]] = [] # [{name, dosage, frequency}]
    allergies: List[str] = []
    family_history: List[str] = []
    personal_history: Dict[str, str] = {}
    review_of_systems: Dict[str, str] = {}
    investigations: List[str] = []
    ayush_data: Optional[Dict[str, Any]] = None

class AIClinicalSummaryResponse(BaseModel):
    chief_complaint: str
    history_of_present_illness: str
    past_medical_history: List[str]
    past_surgical_history: List[str]
    medications: List[Dict[str, str]]
    allergies: List[str]
    family_history: List[str]
    personal_history: Dict[str, str]
    review_of_systems: Dict[str, str]
    investigations: List[str]
    red_flags: List[RedFlagAlert]
    information_requiring_verification: List[str]
    formatted_physician_summary: str
    disclaimer: str = "AI-generated clinical summary. Must be reviewed and verified by a qualified healthcare professional."

class DoctorVerificationSubmit(BaseModel):
    session_id: str
    doctor_approved_summary: str
    doctor_notes: Optional[str] = ""
    status: str = "VERIFIED" # VERIFIED, EDITED, REJECTED

class ClinicalHistoryOut(BaseModel):
    id: str
    session_id: str
    patient_id: str
    chief_complaint: str
    history_of_present_illness: str
    past_medical_history: List[Any]
    past_surgical_history: List[Any]
    medications: List[Any]
    allergies: List[Any]
    family_history: List[Any]
    personal_history: Dict[str, Any]
    review_of_systems: Dict[str, Any]
    investigations: List[Any]
    ayush_data: Optional[Dict[str, Any]] = None
    red_flags: List[Any]
    ai_generated_summary: str
    doctor_approved_summary: Optional[str] = None
    doctor_notes: Optional[str] = None
    verification_status: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- ABDM / FHIR Schemas ---
class ABHAVerifyRequest(BaseModel):
    abha_id: str

class ABHAVerifyResponse(BaseModel):
    status: str
    abha_id: str
    name: str
    gender: str
    dob: str
    mobile: str
    verified: bool

class FHIRResource(BaseModel):
    resourceType: str
    id: str
    data: Dict[str, Any]

class FHIRBundleOut(BaseModel):
    resourceType: str = "Bundle"
    type: str = "document"
    timestamp: str
    entry: List[Dict[str, Any]]

# --- Admin & Stats ---
class AdminConfigUpdate(BaseModel):
    ollama_model: Optional[str] = None
    ayush_mode_enabled: Optional[bool] = None
    red_flag_triage_enabled: Optional[bool] = None
    session_timeout_minutes: Optional[int] = None

class DashboardStats(BaseModel):
    todays_patients: int
    pending_reviews: int
    completed_histories: int
    red_flag_alerts: int
    documents_processed: int
