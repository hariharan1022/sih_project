from typing import List, Dict, Any

class RedFlagEngine:
    """Dedicated Red Flag Emergency Clinical Intake Rules Engine."""

    RED_FLAG_RULES = [
        {
            "code": "RF_CARDIAC_ACUTE",
            "keywords": ["chest pain", "மார்பு வலி", "சீனா வலி", "pain in chest", "left arm pain", "radiating pain"],
            "qualifiers": ["breath", "shortness", "sweating", "diaphoresis", "nausea", "tightness", "pressure"],
            "severity": "CRITICAL",
            "category": "CARDIOLOGY",
            "title": "Potential Acute Coronary Syndrome Alert",
            "description": "Patient reports chest pain with associated dyspnea/diaphoresis. Risk of acute myocardial ischemia.",
            "action": "Immediate ECG & Triage Assessment by ER Doctor"
        },
        {
            "code": "RF_STROKE_FAST",
            "keywords": ["slurred speech", "numbness", "face weakness", "paralysis", "arm weakness", "sudden dizziness"],
            "qualifiers": ["sudden", "one side", "left side", "right side", "vision loss"],
            "severity": "CRITICAL",
            "category": "NEUROLOGY",
            "title": "Potential Acute Stroke Alert (FAST)",
            "description": "Patient exhibits focal neurological symptoms (facial drooping / arm weakness / speech disturbance).",
            "action": "Urgent Neurological Triage & STAT CT Brain protocol"
        },
        {
            "code": "RF_RESPIRATORY_DISTRESS",
            "keywords": ["cannot breathe", "gasping", "severe shortness of breath", "மூச்சு திணறல்", "blue lips", "wheezing"],
            "qualifiers": ["severe", "resting", "gasping", "unable to talk"],
            "severity": "CRITICAL",
            "category": "PULMONOLOGY",
            "title": "Severe Respiratory Failure Risk",
            "description": "Patient reports severe dyspnea at rest or gasping for air.",
            "action": "STAT SpO2 pulse oximetry & oxygen therapy readiness"
        },
        {
            "code": "RF_SYNCOPE",
            "keywords": ["fainted", "passed out", "loss of consciousness", "blackout", "unconscious"],
            "qualifiers": [],
            "severity": "HIGH",
            "category": "GENERAL_EMERGENCY",
            "title": "Transient Loss of Consciousness / Syncope",
            "description": "Recent episode of fainting or collapse reported.",
            "action": "Vital signs check, posture Blood Pressure, ECG"
        },
        {
            "code": "RF_SEVERE_BLEEDING",
            "keywords": ["heavy bleeding", "vomiting blood", "blood in stool", "black stool", "hemorrhage"],
            "qualifiers": [],
            "severity": "HIGH",
            "category": "EMERGENCY",
            "title": "Acute Hemorrhage Risk",
            "description": "Signs of upper/lower GI bleeding or active external hemorrhage.",
            "action": "Immediate Hemodynamic Stabilization & IV line access"
        }
    ]

    def evaluate_clinical_data(
        self,
        chief_complaint: str,
        hpi: str = "",
        answers: Dict[str, Any] = None,
        extracted_entities: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Evaluates patient input against critical red flag triage rules."""
        detected_flags = []
        combined_text = (f"{chief_complaint} {hpi} " + " ".join([str(v) for v in (answers or {}).values()])).lower()

        for rule in self.RED_FLAG_RULES:
            match_keyword = any(kw in combined_text for kw in rule["keywords"])
            if match_keyword:
                # If qualifiers exist, check if at least one is present
                if rule["qualifiers"]:
                    match_qualifier = any(q in combined_text for q in rule["qualifiers"])
                    if not match_qualifier and len(chief_complaint) < 15:
                        # Give benefit of alert if complaint is very short & chest pain is mentioned
                        match_qualifier = True
                else:
                    match_qualifier = True

                if match_keyword and match_qualifier:
                    detected_flags.append({
                        "flag_code": rule["code"],
                        "severity": rule["severity"],
                        "category": rule["category"],
                        "title": rule["title"],
                        "description": rule["description"],
                        "action_required": rule["action"],
                        "disclaimer": "This is an AI-generated triage alert and requires immediate clinical assessment by hospital staff."
                    })

        return detected_flags

red_flag_engine = RedFlagEngine()
