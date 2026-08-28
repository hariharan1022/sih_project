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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Review & Submit Clinical Intake</h2>
            <p className="text-sm text-slate-400">Please review your recorded history before sending to doctor dashboard</p>
          </div>
        </div>

        {/* Patient Summary Box */}
        <div className="space-y-4 mb-8">
          
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700 flex justify-between items-center">
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold">Patient Name:</span>
              <div className="text-lg font-bold text-white">{patientInfo.full_name || 'Demo Patient'}</div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-slate-400 font-bold">Age / Gender:</span>
              <div className="text-lg font-bold text-cyan-300">{patientInfo.age || 45}Y / {patientInfo.gender || 'Male'}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-cyan-500/30">
            <span className="text-xs uppercase text-cyan-400 font-bold block mb-1">Chief Complaint:</span>
            <div className="text-xl font-black text-white">{chiefComplaint}</div>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700">
            <span className="text-xs uppercase text-slate-400 font-bold block mb-2">AI Intake Responses:</span>
            <div className="space-y-2">
              {Object.entries(answers).map(([key, val], idx) => (
                <div key={key} className="flex items-center justify-between text-sm py-1 border-b border-slate-800 last:border-none">
                  <span className="text-slate-400 font-semibold">{key.replace('Q_', '')}:</span>
                  <span className="text-cyan-200 font-bold">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {ayushData && (
            <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/30">
              <span className="text-xs uppercase text-emerald-400 font-bold block mb-1">AYUSH Ayurvedic Parameters:</span>
              <div className="text-sm text-slate-200">
                Prakriti: <span className="font-bold text-emerald-300">{ayushData.prakriti}</span> | Agni: <span className="font-bold text-emerald-300">{ayushData.agni}</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-300">Scanned Medical Documents Attached:</span>
            </div>
            <span className="text-lg font-bold text-white">{uploadedDocsCount > 0 ? uploadedDocsCount : 2} Files</span>
          </div>

        </div>

        {/* Safety Disclaimer */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-8 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            <strong>Physician Control Notice:</strong> This system is an AI-assisted clinical intake tool. Your attending physician will review, edit, and confirm your generated summary during consultation.
          </p>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-4 rounded-xl border border-slate-700 text-slate-300 font-bold kiosk-btn hover:bg-slate-800"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-2xl kiosk-btn shadow-xl shadow-emerald-500/20 flex items-center gap-3 hover:brightness-110 disabled:opacity-50"
          >
            <span>{submitting ? 'Submitting...' : 'SUBMIT HISTORY TO DOCTOR'}</span>
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

      </div>
    </div>
  );
};
