import axios from 'axios';
import type { Language } from '../types';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set Auth Header
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth APIs ---
export const loginApi = async (username: string, password: string) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const registerApi = async (data: any) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// --- Session & Kiosk APIs ---
export const createSessionApi = async (payload: {
  full_name?: string;
  age?: number;
  gender?: string;
  contact_phone?: string;
  language: Language;
  department?: string;
}) => {
  const res = await api.post('/sessions', payload);
  return res.data;
};

export const recordConsentApi = async (session_id: string, agreed: boolean, language: Language) => {
  const res = await api.post('/sessions/consent', { session_id, agreed, language });
  return res.data;
};

export const updateSessionStepApi = async (session_id: string, step: string) => {
  const res = await api.patch(`/sessions/${session_id}/step?step=${step}`);
  return res.data;
};

export const getSessionApi = async (session_id: string) => {
  const res = await api.get(`/sessions/${session_id}`);
  return res.data;
};

// --- AI & Questioning APIs ---
export const getNextAIQuestionApi = async (payload: {
  session_id: string;
  chief_complaint: string;
  previous_answers: Record<string, any>;
  language: Language;
}) => {
  const res = await api.post('/ai/question', payload);
  return res.data;
};

export const transcribeAudioApi = async (formData: FormData) => {
  const res = await api.post('/ai/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// --- Clinical History & Document APIs ---
export const submitClinicalHistoryApi = async (payload: any) => {
  const res = await api.post('/history/submit', payload);
  return res.data;
};

export const getClinicalHistoryApi = async (session_id: string) => {
  const res = await api.get(`/history/session/${session_id}`);
  return res.data;
};

export const uploadDocumentApi = async (formData: FormData) => {
  const res = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getSessionDocumentsApi = async (session_id: string) => {
  const res = await api.get(`/documents/session/${session_id}`);
  return res.data;
};

export const getPatientTimelineApi = async (patient_id: string) => {
  const res = await api.get(`/documents/patient/${patient_id}/timeline`);
  return res.data;
};

// --- Doctor Verification & Queue APIs ---
export const getDoctorQueueApi = async (red_flags_only: boolean = false) => {
  const res = await api.get(`/doctors/queue?red_flags_only=${red_flags_only}`);
  return res.data;
};

export const doctorVerifySummaryApi = async (payload: {
  session_id: string;
  doctor_approved_summary: string;
  doctor_notes?: string;
  status: 'VERIFIED' | 'EDITED' | 'REJECTED';
}) => {
  const res = await api.post('/summary/verify', payload);
  return res.data;
};

// --- ABDM & FHIR APIs ---
export const verifyAbhaApi = async (abha_id: string) => {
  const res = await api.post('/abdm/verify-abha', { abha_id });
  return res.data;
};

export const getFHIRBundleApi = async (session_id: string) => {
  const res = await api.get(`/abdm/fhir-bundle/${session_id}`);
  return res.data;
};

// --- Admin APIs ---
export const getAdminStatsApi = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getAdminConfigApi = async () => {
  const res = await api.get('/admin/config');
  return res.data;
};

export const updateAdminConfigApi = async (payload: any) => {
  const res = await api.post('/admin/config', payload);
  return res.data;
};

export const getAuditLogsApi = async () => {
  const res = await api.get('/audit/logs');
  return res.data;
};
