export type Language = 'en' | 'ta' | 'hi';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'TRIAGE_STAFF';
  is_active: boolean;
}

export interface Patient {
  id: string;
  mrn: string;
  full_name: string;
  age: number;
  gender: string;
  contact_phone: string;
  emergency_contact?: string;
  blood_group?: string;
  preferred_language: Language;
  abha_id?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  qualification: string;
  specialty: string;
  room_number: string;
  is_available: boolean;
}

export interface KioskSession {
  id: string;
  token_number: string;
  patient_id: string;
  department: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'TRIAGED_RED_FLAG' | 'COMPLETED' | 'VERIFIED_BY_DOCTOR' | 'CANCELLED';
  current_step: string;
  language: Language;
  consent_given: boolean;
  has_red_flags: boolean;
  started_at: string;
  completed_at?: string;
  patient?: Patient;
}

export interface RedFlagAlert {
  flag_code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: string;
  title: string;
  description: string;
  action_required: string;
  disclaimer: string;
  timestamp?: string;
}

export interface MedicalDocument {
  id: string;
  session_id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  doc_type: string;
  document_date?: string;
  ocr_raw_text: string;
  extracted_entities: Record<string, any>;
  uploaded_at: string;
}

export interface MedicalTimelineItem {
  document_id: string;
  file_name: string;
  doc_type: string;
  document_date: string;
  summary: string;
  extracted_entities: Record<string, any>;
}

export interface ClinicalHistory {
  id: string;
  session_id: string;
  patient_id: string;
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string[];
  past_surgical_history: string[];
  medications: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies: string[];
  family_history: string[];
  personal_history: Record<string, any>;
  review_of_systems: Record<string, any>;
  investigations: string[];
  ayush_data?: Record<string, any>;
  red_flags: RedFlagAlert[];
  ai_generated_summary: string;
  doctor_approved_summary?: string;
  doctor_notes?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'EDITED' | 'REJECTED';
  updated_at: string;
}

export interface QuestionOption {
  label_en: string;
  label_ta: string;
  label_hi: string;
  value: string;
}

export interface ClinicalQuestion {
  id: string;
  code: string;
  category: string;
  question_text_en: string;
  question_text_ta: string;
  question_text_hi: string;
  options: QuestionOption[];
  is_ayush: boolean;
}

export interface DashboardStats {
  todays_patients: number;
  pending_reviews: number;
  completed_histories: number;
  red_flag_alerts: number;
  documents_processed: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  actor_role: string;
  action: string;
  resource: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}
