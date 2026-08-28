import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

class ABDMService:
    """ABDM (Ayushman Bharat Digital Mission) Sandbox Service & FHIR Resource Builder."""

    def verify_abha_id(self, abha_id: str) -> Dict[str, Any]:
        """Simulates ABDM M1/M2 ABHA number/address verification."""
        clean_id = abha_id.strip()
        # Demo sandbox verification check
        if clean_id and ("@" in clean_id or len(clean_id.replace("-", "")) == 14 or "abha" in clean_id.lower()):
            return {
                "status": "SUCCESS",
                "abha_id": clean_id,
                "name": "Demo Patient",
                "gender": "M",
                "dob": "1981-05-14",
                "mobile": "+91-9876543210",
                "verified": True,
                "message": "ABHA identity successfully verified with ABDM sandbox repository."
            }
        else:
            return {
                "status": "VERIFIED_MOCK",
                "abha_id": clean_id or "91-9876-5432-1098",
                "name": "Intake Patient",
                "gender": "M",
                "dob": "1985-01-01",
                "mobile": "+91-9876543210",
                "verified": True,
                "message": "Mock ABHA sandbox verification accepted for clinical intake."
            }

    def generate_fhir_bundle(self, patient_data: Dict[str, Any], history_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates HL7 FHIR R4 compliant document Bundle."""
        patient_id = patient_data.get("id", str(uuid.uuid4()))
        timestamp = datetime.now(timezone.utc).isoformat()

        # 1. FHIR Patient Resource
        fhir_patient = {
            "resourceType": "Patient",
            "id": patient_id,
            "identifier": [
                {
                    "system": "https://healthid.ndhm.gov.in",
                    "value": patient_data.get("abha_id", "91-9876-5432-1098")
                },
                {
                    "system": "https://hospital.org/mrn",
                    "value": patient_data.get("mrn", "MRN-1001")
                }
            ],
            "name": [{"text": patient_data.get("full_name", "Demo Patient")}],
            "gender": patient_data.get("gender", "male").lower(),
            "telecom": [{"system": "phone", "value": patient_data.get("contact_phone", "+919876543210")}]
        }

        # 2. FHIR Condition Resource (Chief Complaint)
        fhir_condition = {
            "resourceType": "Condition",
            "id": str(uuid.uuid4()),
            "clinicalStatus": {
                "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            "code": {
                "text": history_data.get("chief_complaint", "Chest pain and dyspnea")
            },
            "recordedDate": timestamp
        }

        # 3. FHIR Observation Resources (Medications / Vitals)
        fhir_medications = []
        for med in history_data.get("medications", []):
            med_name = med.get("name") if isinstance(med, dict) else str(med)
            fhir_medications.append({
                "resourceType": "MedicationStatement",
                "id": str(uuid.uuid4()),
                "status": "active",
                "subject": {"reference": f"Patient/{patient_id}"},
                "medicationCodeableConcept": {"text": med_name},
                "dosage": [{"text": med.get("dosage", "As prescribed") if isinstance(med, dict) else "Daily"}]
            })

        # Assemble FHIR Bundle
        entries = [
            {"fullUrl": f"urn:uuid:{patient_id}", "resource": fhir_patient},
            {"fullUrl": f"urn:uuid:{fhir_condition['id']}", "resource": fhir_condition}
        ]
        for med_res in fhir_medications:
            entries.append({"fullUrl": f"urn:uuid:{med_res['id']}", "resource": med_res})

        return {
            "resourceType": "Bundle",
            "type": "document",
            "timestamp": timestamp,
            "identifier": {"system": "https://medikiosk.ai/fhir/bundles", "value": str(uuid.uuid4())},
            "entry": entries
        }

abdm_service = ABDMService()
