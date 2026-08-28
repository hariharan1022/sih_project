# MediKiosk — AI Clinical History & Medical Document Intelligence Platform

**MediKiosk** is an AI-powered, patient-facing self-service clinical history intake and medical document intelligence platform built for modern hospitals.

It empowers patients to complete their clinical history before meeting the doctor using **voice conversation (Whisper AI) + high-contrast touchscreen interaction**, scan/upload medical records (prescriptions, lab reports, discharge summaries via PaddleOCR), detect potential emergency red flags, and generate structured, physician-ready clinical summaries.

---

## 🌟 Key Features & Principles

### 1. Physician Control Principle (Safety Guarantee)
MediKiosk is strictly an **AI-assisted clinical intake system, NOT an autonomous diagnosis system**. The physician always retains final edit, approval, and verification authority over AI-generated intake summaries.

### 2. Local AI Engine — Ollama & Qwen3
- **Local Model**: Runs locally via **Ollama** using `qwen3:8b` (configurable to `qwen3:14b` or `gemma3:12b`).
- **Structured JSON Output**: All LLM responses are enforced against strict JSON schemas with automatic retry and local fallback heuristics.

### 3. Voice AI & Multilingual Support
- **Speech-to-Text**: Powered by **Whisper** / Web Speech API.
- **Languages**: Native support for **Tamil (தமிழ்), English, and Hindi (हिंदी)**.
- **Text-to-Speech Guidance**: Speech synthesis reads clinical questions aloud for low-literacy or visually impaired users.

### 4. OCR Medical Document Intelligence & Chronological Timeline
- Scans uploaded PDFs, JPGs, and PNGs using **PaddleOCR / PyTesseract**.
- Extracts medical entities: Diagnoses, current medications, lab results (with reference ranges), procedures, and doctor notes.
- Automatically organizes documents into an interactive, filterable **Chronological Medical Timeline**.

### 5. Red Flag Emergency Triage Engine
- Automatically flags acute conditions (e.g. Acute Coronary Syndrome, FAST stroke symptoms, severe dyspnea, acute hemorrhage).
- Triggers immediate **Red Flag Alert banners** on both kiosk and doctor queue with ER triage protocols.

### 6. AYUSH / Ayurvedic History Engine
- Optional Ayurvedic intake module collecting **Prakriti** (Vata/Pitta/Kapha), **Vikriti**, **Agni** (digestive fire), **Ahara** (dietary habits), and **Vihara** (lifestyle/sleep).
- Configurable/toggleable per hospital setting from Admin Portal.

### 7. ABDM & FHIR-Ready Architecture
- **ABHA Identity**: Sandbox verification for Ayushman Bharat Health Account numbers.
- **HL7 FHIR R4 Bundles**: Converts intake data into FHIR `Patient`, `Condition`, `Observation`, and `MedicationStatement` resources downloadable as JSON.

---

## 🚀 Quick Start Guide

### Option 1: Running Locally (Fastest Zero-Config Demo)

#### Backend Setup (Python 3.10+)
```bash
cd backend
py -m pip install -r requirements.txt
py -m app.seed
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API interactive documentation will be available at: `http://127.0.0.1:8000/docs`

#### Frontend Setup (Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```
Patient Kiosk & Doctor Dashboard will be accessible at: `http://localhost:3000` (or `http://localhost:3001`)

---

### Option 2: Running via Docker Compose

```bash
docker compose up --build
```
Then configure Ollama model:
```bash
docker exec -it medikiosk-ollama-1 ollama pull qwen3:8b
```

---

## 🏥 Platform User Workflows

### 1. Patient Kiosk (`/kiosk`)
- **Language Selector**: Tamil, English, Hindi.
- **Patient Identification**: Demographics & ABHA ID sandbox lookup.
- **Consent**: Informed consent recording with audio explanation.
- **Chief Complaint**: Touch quick-symptom chips or speak into microphone 🎤.
- **AI Interview**: Dynamic SOCRATES adaptive questions (Onset, Location, Radiation, Severity).
- **AYUSH Intake**: Prakriti & Agni parameters (if enabled).
- **Document Upload**: Scan prescriptions / lab reports with live OCR text preview.
- **Timeline Preview**: Chronological visualization of past health records.
- **Token Output**: Session token generated (e.g., `T-108`) with OPD room routing and Red Flag warnings.

### 2. Doctor Dashboard (`/doctor`)
- **Outpatient Queue**: Patient list sorted by priority and Red Flag triage state.
- **Clinical History Workspace**: Patient profile, chief complaint, HPI, PMH, current medications, allergies, and AYUSH data.
- **AI Summary Editor**: Attending doctor can Edit, Approve & Verify, or Reject summaries with clinical notes.
- **FHIR Bundle Viewer**: Download HL7 FHIR R4 JSON document bundles.

### 3. Admin Portal (`/admin`)
- **System Metrics**: Total patient sessions, pending reviews, verified histories, red flag alerts, processed OCR docs.
- **AI Model Config**: Switch between `qwen3:8b`, `qwen3:14b`, `gemma3:12b`.
- **AYUSH & Red Flag Toggles**: Enable/disable Ayurvedic history and emergency triage rules.
- **Audit Logs**: Real-time compliance logging of user login, consent, OCR parsing, and doctor approvals.

---

## 📑 Demo Credentials (Pre-seeded Data)

- **Demo Doctor**: `dr_sundaram` / `doctor123` (Dr. R. Sundaram, MD, DM Cardiology)
- **Demo Admin**: `admin` / `admin123` (Hospital Administrator)
- **Demo Patient**: `Demo Patient`, Age 45, Male (Token `T-108` with Tamil chest pain complaint & Red Flag alert)
