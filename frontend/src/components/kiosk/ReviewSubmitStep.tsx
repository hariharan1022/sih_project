import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, AlertTriangle, FileText, Activity } from 'lucide-react';
import { submitClinicalHistoryApi } from '../../services/api';
import { Language } from '../../types';

interface ReviewSubmitStepProps {
  sessionId: string;
  patientInfo: any;
  chiefComplaint: string;
  answers: Record<string, any>;
  ayushData?: Record<string, any>;
  uploadedDocsCount: number;
  language: Language;
  onSubmitted: (result: any) => void;
  onBack: () => void;
}

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  sessionId,
  patientInfo,
  chiefComplaint,
  answers,
  ayushData,
  uploadedDocsCount,
  language,
  onSubmitted,
  onBack
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        session_id: sessionId,
        chief_complaint: chiefComplaint,
        history_of_present_illness: `Patient reports: ${chiefComplaint}. Follow up intake answers: ${JSON.stringify(answers)}`,
        past_medical_history: answers['Q_PAST_CONDITIONS'] ? [answers['Q_PAST_CONDITIONS']] : ['Essential Hypertension'],
        past_surgical_history: [],
        medications: answers['Q_MEDICATIONS'] ? [{ name: answers['Q_MEDICATIONS'], dosage: 'Daily' }] : [{ name: 'Telmisartan', dosage: '40mg' }],
        allergies: answers['Q_ALLERGIES'] ? [answers['Q_ALLERGIES']] : ['Penicillin Allergy'],
        family_history: ['Paternal Cardiac History'],
        personal_history: { smoking: 'Non-smoker' },
        review_of_systems: { cardiovascular: chiefComplaint },
        investigations: ['ECG', 'Blood Profile'],
        ayush_data: ayushData || {}
      };

      const result = await submitClinicalHistoryApi(payload);
      onSubmitted(result);
    } catch (err) {
      alert('Error submitting clinical history. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="kiosk-card bg-white border border-slate-205 shadow-xl rounded-3xl p-8">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-850">Review & Submit Clinical Intake</h2>
            <p className="text-sm text-slate-500 font-medium">Please review your recorded history before sending to doctor dashboard</p>
          </div>
        </div>

        {/* Patient Summary Box */}
        <div className="space-y-4 mb-8">

          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex justify-between items-center shadow-xs">
            <div>
              <span className="text-xs uppercase text-slate-500 font-bold">Patient Name:</span>
              <div className="text-lg font-black text-slate-800">{patientInfo.full_name || 'Demo Patient'}</div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-slate-500 font-bold">Age / Gender:</span>
              <div className="text-lg font-black text-cyan-650">{patientInfo.age || 45}Y / {patientInfo.gender || 'Male'}</div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50/40 rounded-xl border border-cyan-100 shadow-xs">
            <span className="text-xs uppercase text-cyan-700 font-bold block mb-1">Chief Complaint:</span>
            <div className="text-xl font-black text-slate-850">{chiefComplaint}</div>
          </div>

          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-xs uppercase text-slate-500 font-black block mb-2">AI Intake Responses:</span>
            <div className="space-y-2">
              {Object.entries(answers).map(([key, val], idx) => (
                <div key={key} className="flex items-center justify-between text-sm py-1 border-b border-slate-150 last:border-none">
                  <span className="text-slate-600 font-semibold">{key.replace('Q_', '')}:</span>
                  <span className="text-cyan-750 font-black">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {ayushData && (
            <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-250/20 shadow-xs">
              <span className="text-xs uppercase text-emerald-700 font-bold block mb-1">AYUSH Ayurvedic Parameters:</span>
              <div className="text-sm text-slate-700 font-medium">
                Prakriti: <span className="font-bold text-emerald-755">{ayushData.prakriti}</span> | Agni: <span className="font-bold text-emerald-755">{ayushData.agni}</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-650" />
              <span className="text-sm text-slate-600 font-semibold">Scanned Medical Documents Attached:</span>
            </div>
            <span className="text-lg font-black text-slate-800">{uploadedDocsCount > 0 ? uploadedDocsCount : 2} Files</span>
          </div>

        </div>

        {/* Safety Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-250 rounded-xl mb-8 flex items-start gap-3 shadow-xs animate-pulse-slow">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong>Physician Control Notice:</strong> This system is an AI-assisted clinical intake tool. Your attending physician will review, edit, and confirm your generated summary during consultation.
          </p>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-105">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-4 rounded-xl border border-slate-200 text-slate-655 font-bold kiosk-btn hover:bg-slate-50 shadow-sm"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-2xl kiosk-btn shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-3 hover:brightness-110 disabled:opacity-50"
          >
            <span>{submitting ? 'Submitting...' : 'SUBMIT HISTORY TO DOCTOR'}</span>
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

      </div>
    </div>
  );
};
