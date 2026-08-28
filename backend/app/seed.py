import asyncio
import json
import logging
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.core.security import get_password_hash
from app.models.domain import (
    User, UserRole, Patient, Doctor, Department, KioskSession, ClinicalHistory,
    MedicalDocument, ClinicalQuestion, AuditLog, SystemConfig, SessionStatus
)

logger = logging.getLogger(__name__)

async def seed_initial_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(User).where(User.username == "admin"))
        if res.scalars().first():
            return  # Already seeded

        print("Seeding MediKiosk initial demo dataset...")

        # 1. Admin User
        admin_user = User(
            username="admin",
            email="admin@medikiosk.ai",
            full_name="Hospital Administrator",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN.value
        )
        db.add(admin_user)

        # 2. Doctor User & Profile
        doctor_user = User(
            username="dr_sundaram",
            email="dr.sundaram@medikiosk.ai",
            full_name="Dr. R. Sundaram",
            hashed_password=get_password_hash("doctor123"),
            role=UserRole.DOCTOR.value
        )
        db.add(doctor_user)
        await db.flush()

        dept_cardio = Department(
            name="Cardiology & Chest Medicine",
            code="CARD",
            description="Cardiovascular disease evaluation & urgent cardiac triage"
        )
        dept_gen = Department(
            name="General Internal Medicine",
            code="GEN",
            description="General outpatient intake & preventive medical care"
        )
        db.add_all([dept_cardio, dept_gen])
        await db.flush()

        doctor_profile = Doctor(
            user_id=doctor_user.id,
            full_name="Dr. R. Sundaram, MD, DM",
            qualification="MD (Gen Med), DM (Cardiology)",
            specialty="Cardiology",
            department_id=dept_cardio.id,
            room_number="OPD Room 204",
            is_available=True
        )
        db.add(doctor_profile)

        # 3. Demo Patient
        demo_patient = Patient(
            mrn="MRN-89412",
            full_name="Demo Patient",
            age=45,
            gender="Male",
            contact_phone="+91-9876543210",
            emergency_contact="+91-9876543211",
            blood_group="O+",
            preferred_language="ta",
            abha_id="91-9876-5432-1098"
        )
        db.add(demo_patient)
        await db.flush()

        # 4. Kiosk Session
        kiosk_session = KioskSession(
            token_number="T-108",
            patient_id=demo_patient.id,
            assigned_doctor_id=doctor_profile.id,
            department="Cardiology & Chest Medicine",
            status=SessionStatus.TRIAGED_RED_FLAG.value,
            current_step="COMPLETED",
            language="ta",
            consent_given=True,
            has_red_flags=True
        )
        db.add(kiosk_session)
        await db.flush()

        # 5. Clinical History with Red Flag Alert (Section 33 Demo Scenario)
        red_flags_demo = [
            {
                "flag_code": "RF_CARDIAC_ACUTE",
                "severity": "CRITICAL",
                "category": "CARDIOLOGY",
                "title": "Potential Acute Coronary Syndrome Alert",
                "description": "Patient reports chest pain lasting 2 days radiating to left arm with shortness of breath.",
                "action_required": "Immediate ECG & ER Cardiac Triage Assessment",
                "disclaimer": "This is an AI-generated alert and requires immediate clinical assessment."
            }
        ]

        ayush_demo_data = {
            "prakriti": "Vata-Pitta dominant",
            "vikriti": "Vata Imbalance (Ruksha / Chala)",
            "agni": "Mandagni (Slow digestion)",
            "ahara": "Vegetarian, irregular meal timing",
            "vihara": "Sedentary work, late night sleeping"
        }

        history_summary_text = """PATIENT CLINICAL INTAKE SUMMARY (AI-ASSISTED)

1. CHIEF COMPLAINT:
   எனக்கு இரண்டு நாட்களாக மார்பில் வலி இருக்கிறது மற்றும் மூச்சு திணறல் உள்ளது. (Chest pain and breathing difficulty for 2 days).

2. HISTORY OF PRESENT ILLNESS (HPI):
   Patient reports sudden onset of retrosternal chest pain 48 hours ago, aggravated by exertion and walking up stairs. Pain radiates occasionally to left shoulder. Accompanied by mild diaphoresis and shortness of breath.

3. PAST MEDICAL HISTORY:
   - Essential Hypertension (Diagnosed 2024)
   - Dyslipidemia (Elevated LDL cholesterol)

4. PAST SURGICAL HISTORY:
   - None reported

5. CURRENT MEDICATIONS:
   - Tab. Telmisartan 40mg (OD - Morning)
   - Tab. Atorvastatin 10mg (OD - Night)

6. ALLERGIES:
   - Penicillin Allergy (Causes mild skin rash)

7. FAMILY HISTORY:
   - Father had Myocardial Infarction at age 52.

8. REVIEW OF SYSTEMS:
   - Cardiovascular: Chest tightness positive
   - Respiratory: Shortness of breath on exertion positive
   - Gastrointestinal: Mild acidity, no hematemesis

9. PREVIOUS DOCUMENTS UPLOADED:
   - previous_prescription.pdf (CITY SPECIALTY HOSPITAL - 2026-08-25)
   - blood_report.jpg (METROPOLIS DIAGNOSTICS - HbA1c: 7.2%, Cholesterol: 225 mg/dL)

10. AI-DETECTED RED FLAGS:
   - [CRITICAL] Potential Acute Coronary Syndrome Alert (Chest pain + dyspnea)

NOTICE: AI-generated clinical intake draft. Must be reviewed, edited, and approved by attending physician.
"""

        clinical_history = ClinicalHistory(
            session_id=kiosk_session.id,
            patient_id=demo_patient.id,
            chief_complaint="எனக்கு இரண்டு நாட்களாக மார்பில் வலி இருக்கிறது மற்றும் மூச்சு திணறல் உள்ளது.",
            history_of_present_illness="Sudden onset retrosternal chest pain 48h ago, radiating to left shoulder with shortness of breath on walking.",
            past_medical_history=["Essential Hypertension", "Dyslipidemia"],
            past_surgical_history=[],
            medications=[
                {"name": "Telmisartan", "dosage": "40mg", "frequency": "1-0-0"},
                {"name": "Atorvastatin", "dosage": "10mg", "frequency": "0-0-1"}
            ],
            allergies=["Penicillin (Skin Rash)"],
            family_history=["Paternal MI at age 52"],
            personal_history={"smoking": "Non-smoker", "alcohol": "Occasional", "diet": "Vegetarian"},
            review_of_systems={"cardiovascular": "Chest tightness", "respiratory": "Dyspnea on exertion"},
            investigations=["ECG Needed", "Fasting Lipid Profile", "HbA1c"],
            ayush_data=ayush_demo_data,
            red_flags=red_flags_demo,
            ai_generated_summary=history_summary_text,
            doctor_approved_summary=history_summary_text,
            doctor_notes="Patient prioritized for STAT ECG. BP on arrival 145/90 mmHg. Troponin-I sent.",
            verified_by_doctor_id=doctor_profile.id,
            verification_status="VERIFIED"
        )
        db.add(clinical_history)

        # 6. Sample Uploaded Documents
        doc_rx = MedicalDocument(
            session_id=kiosk_session.id,
            patient_id=demo_patient.id,
            file_name="previous_prescription.pdf",
            file_type="PDF",
            file_url="/uploads/demo_prescription.pdf",
            doc_type="PRESCRIPTION",
            document_date="2026-08-25",
            ocr_raw_text="CITY SPECIALTY HOSPITAL - Dr. R. Sundaram. Rx: Tab Telmisartan 40mg, Tab Aspirin 75mg.",
            extracted_entities={
                "hospital": "City Specialty Hospital",
                "doctor": "Dr. R. Sundaram",
                "medications": [
                    {"name": "Telmisartan", "dosage": "40mg", "frequency": "1-0-0"},
                    {"name": "Aspirin", "dosage": "75mg", "frequency": "0-0-1"}
                ]
            }
        )
        doc_lab = MedicalDocument(
            session_id=kiosk_session.id,
            patient_id=demo_patient.id,
            file_name="blood_report.jpg",
            file_type="JPG",
            file_url="/uploads/demo_blood_report.jpg",
            doc_type="LAB_REPORT",
            document_date="2026-08-26",
            ocr_raw_text="METROPOLIS LABS: Fasting Blood Sugar: 138 mg/dL. HbA1c: 7.2%. Total Cholesterol: 225 mg/dL.",
            extracted_entities={
                "lab": "Metropolis Diagnostics",
                "lab_results": [
                    {"test_name": "HbA1c", "value": "7.2", "unit": "%", "reference_range": "4.0-5.6"},
                    {"test_name": "Total Cholesterol", "value": "225", "unit": "mg/dL", "reference_range": "<200"}
                ]
            }
        )
        db.add_all([doc_rx, doc_lab])

        # 7. Seed Clinical Questions Library
        questions = [
            ClinicalQuestion(
                code="Q_CHIEF_COMPLAINT",
                category="HPI",
                question_text_en="What is your primary medical concern today?",
                question_text_ta="இன்று உங்கள் பிரதான மருத்துவ பிரச்சனை என்ன?",
                question_text_hi="आज आपकी प्राथमिक चिकित्सा चिंता क्या है?",
                options=[
                    {"label_en": "Chest Pain / Discomfort", "label_ta": "மார்பு வலி", "label_hi": "छाती में दर्द", "value": "chest_pain"},
                    {"label_en": "Fever & Chills", "label_ta": "காய்ச்சல் & குளுர்", "label_hi": "बुखार", "value": "fever"},
                    {"label_en": "Shortness of Breath", "label_ta": "மூச்சு திணறல்", "label_hi": "सांस लेने में तकलीफ", "value": "dyspnea"},
                    {"label_en": "Stomach Pain / Acidity", "label_ta": "வயிறு வலி", "label_hi": "पेट दर्द", "value": "stomach_pain"}
                ]
            ),
            ClinicalQuestion(
                code="Q_PAIN_SEVERITY",
                category="HPI",
                question_text_en="How severe is your pain on a scale of 1 to 10?",
                question_text_ta="1 முதல் 10 வரையிலான அளவில் உங்கள் வலி எவ்வளவு கடுமையாக உள்ளது?",
                question_text_hi="1 से 10 के पैमाने पर आपका दर्द कितना गंभीर है?",
                options=[
                    {"label_en": "Mild (1 - 3)", "label_ta": "மிதமான வலி (1 - 3)", "label_hi": "हल्का दर्द (1 - 3)", "value": "1-3"},
                    {"label_en": "Moderate (4 - 6)", "label_ta": "மிதமான வலி (4 - 6)", "label_hi": "मध्यम दर्द (4 - 6)", "value": "4-6"},
                    {"label_en": "Severe (7 - 10)", "label_ta": "கடுமையான வலி (7 - 10)", "label_hi": "तीव्र दर्द (7 - 10)", "value": "7-10"}
                ]
            ),
            ClinicalQuestion(
                code="Q_AYUSH_PRAKRITI",
                category="AYUSH",
                question_text_en="[AYUSH] Select your constitutional body type tendency (Prakriti):",
                question_text_ta="[ஆயுஷ்] உங்கள் பிரகிருதி உடலமைப்பு தன்மையை தேர்ந்தெடுக்கவும்:",
                question_text_hi="[आयुष] अपनी प्रकृति शारीरिक प्रवृत्ति चुनें:",
                options=[
                    {"label_en": "Vata (Light, Cold, Dry, Fast movement)", "label_ta": "வாதம் (வறட்சி, குளிர்ச்சி)", "label_hi": "वात", "value": "Vata"},
                    {"label_en": "Pitta (Warm, Intense, Sharp digestion)", "label_ta": "பித்தம் (வெப்பம், கூர்மை)", "label_hi": "पित्त", "value": "Pitta"},
                    {"label_en": "Kapha (Heavy, Cool, Calm, Steady)", "label_ta": "கபம் (குளிர்ச்சி, நிதானம்)", "label_hi": "कफ", "value": "Kapha"}
                ],
                is_ayush=True
            ),
            ClinicalQuestion(
                code="Q_AYUSH_AGNI",
                category="AYUSH",
                question_text_en="[AYUSH] How is your digestive power (Agni)?",
                question_text_ta="[ஆயுஷ்] உங்கள் ஜீரண சக்தி (அக்னி) எவ்வாறு உள்ளது?",
                question_text_hi="[आयुष] आपकी पाचन अग्नि कैसी है?",
                options=[
                    {"label_en": "Samagni (Normal & Healthy)", "label_ta": "சமக்னி (இயல்பானது)", "label_hi": "समग्नि", "value": "Samagni"},
                    {"label_en": "Mandagni (Slow & Heavy)", "label_ta": "மந்தாங்கி (மெதுவான ஜீரணம்)", "label_hi": "मंदाग्नि", "value": "Mandagni"},
                    {"label_en": "Vishamagni (Irregular)", "label_ta": "விஷமாக்னி (சீற்றமற்ற ஜீரணம்)", "label_hi": "विषमाग्नि", "value": "Vishamagni"}
                ],
                is_ayush=True
            )
        ]
        db.add_all(questions)

        # 8. System Config Initial Entries
        configs = [
            SystemConfig(config_key="ollama_model", value_json="qwen3:8b"),
            SystemConfig(config_key="ayush_mode_enabled", value_json=True),
            SystemConfig(config_key="red_flag_triage_enabled", value_json=True)
        ]
        db.add_all(configs)

        await db.commit()
        print("MediKiosk initial demo dataset seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_initial_data())
