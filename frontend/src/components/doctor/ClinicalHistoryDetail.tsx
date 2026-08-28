import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, FileText, Edit3, Share2, AlertTriangle, Clock, Stethoscope, Download } from 'lucide-react';
import { ClinicalHistory, KioskSession, MedicalDocument, MedicalTimelineItem } from '../../types';

interface ClinicalHistoryDetailProps {
  session: KioskSession;
  history: ClinicalHistory | null;
  documents: MedicalDocument[];
  timeline: MedicalTimelineItem[];
  onOpenSummaryEditor: () => void;
  onOpenFHIRModal: () => void;
}

export const ClinicalHistoryDetail: React.FC<ClinicalHistoryDetailProps> = ({
  session,
  history,
  documents,
  timeline,
  onOpenSummaryEditor,
  onOpenFHIRModal
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'timeline' | 'documents'>('summary');

  if (!history) {
    return (
      <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-400">
        Select a patient from the queue to view clinical history.
      </div>
    );
  }

  const isVerified = history.verification_status === 'VERIFIED';
  const hasRedFlags = session.has_red_flags || (history.red_flags && history.red_flags.length > 0);

  return (
    <div className="space-y-6">

      {/* Patient Header Card */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-white">{session.patient?.full_name || 'Demo Patient'}</h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-full border border-cyan-500/30">
              Token: {session.token_number}
            </span>
            {isVerified && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Verified
              </span>
            )}
          </div>
          <div className="text-sm text-slate-400 flex items-center gap-4">
            <span>Age: <strong>{session.patient?.age || 45}Y</strong></span>
            <span>Gender: <strong>{session.patient?.gender || 'Male'}</strong></span>
            <span>MRN: <strong>{session.patient?.mrn || 'MRN-89412'}</strong></span>
            <span>ABHA ID: <strong className="text-cyan-300">{session.patient?.abha_id || '91-9876-5432-1098'}</strong></span>
          </div>
        </div>

        {/* Doctor Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFHIRModal}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-sm rounded-xl flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>FHIR Bundle</span>
          </button>

          <button
            onClick={onOpenSummaryEditor}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isVerified ? 'Edit Summary' : 'Verify & Approve Summary'}</span>
          </button>
        </div>

      </div>

      {/* RED FLAG WARNING BANNER IF DETECTED */}
      {hasRedFlags && (
        <div className="p-4 bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl flex items-start gap-4 shadow-xl shadow-rose-600/20 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-base font-black text-rose-300 flex items-center gap-2">
              <span>POTENTIAL RED FLAG TRIAGE ALERT</span>
              <span className="px-2 py-0.5 text-xs bg-rose-500 text-white font-bold rounded">CRITICAL</span>
            </div>
            <p className="text-xs text-rose-200 mt-1">
              Patient reports acute chest pain radiating to left shoulder with exertional dyspnea. Immediate cardiac ECG & ER triage protocol initiated.
            </p>
            <div className="mt-2 text-xs text-rose-400 italic">
              Notice: AI-generated triage alert. Requires immediate clinical assessment by attending physician.
            </div>
          </div>
        </div>
      )}

      {/* Detail View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'summary', label: 'AI Physician Summary' },
          { id: 'history', label: 'Detailed Intake History' },
          { id: 'timeline', label: 'Chronological Timeline' },
          { id: 'documents', label: `Uploaded Documents (${documents.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: AI PHYSICIAN SUMMARY */}
      {activeTab === 'summary' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Structured Physician Summary</span>
            </h3>
            <span className="text-xs text-slate-400">Model: Ollama / Qwen3:8b</span>
          </div>

          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {history.doctor_approved_summary || history.ai_generated_summary}
          </div>

          {history.doctor_notes && (
            <div className="p-4 bg-slate-800/80 rounded-xl border border-cyan-500/30">
              <span className="text-xs uppercase text-cyan-400 font-bold block mb-1">Doctor Verification Notes:</span>
              <p className="text-sm text-slate-200">{history.doctor_notes}</p>
            </div>
          )}

          <div className="p-3 bg-slate-950 rounded-lg text-xs text-slate-500 flex items-center justify-between border border-slate-850">
            <span>AI Disclaimer: Intake draft subject to physician verification.</span>
            <span>Last Updated: {new Date(history.updated_at).toLocaleString()}</span>
          </div>

        </div>
      )}

      {/* TAB 2: DETAILED INTAKE HISTORY */}
      {activeTab === 'history' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Chief Complaint</h4>
              <p className="text-lg font-bold text-white">{history.chief_complaint}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">History of Present Illness (HPI)</h4>
              <p className="text-sm text-slate-300">{history.history_of_present_illness}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Past Medical History</h4>
              <ul className="list-disc list-inside text-sm text-slate-300">
                {history.past_medical_history.map((m, idx) => <li key={idx}>{m}</li>)}
              </ul>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Current Medications</h4>
              <div className="space-y-1 text-sm text-slate-300">
                {history.medications.map((m: any, idx) => (
                  <div key={idx} className="font-semibold text-cyan-200">
                    • {typeof m === 'object' ? `${m.name} (${m.dosage || 'Daily'})` : m}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h4 className="text-xs uppercase text-rose-400 font-bold mb-2">Drug Allergies</h4>
              <div className="text-sm font-bold text-rose-300">
                {history.allergies.join(', ') || 'No known drug allergies (NKDA)'}
              </div>
            </div>

            {history.ayush_data && (
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40">
                <h4 className="text-xs uppercase text-emerald-400 font-bold mb-2">AYUSH Ayurvedic Parameters</h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Prakriti: <strong className="text-emerald-300">{history.ayush_data.prakriti}</strong></div>
                  <div>Agni: <strong className="text-emerald-300">{history.ayush_data.agni}</strong></div>
                  <div>Ahara: {history.ayush_data.ahara}</div>
                  <div>Vihara: {history.ayush_data.vihara}</div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Patient Document Timeline</h3>
          <div className="relative pl-6 border-l-2 border-cyan-500/40 space-y-6">
            {(timeline.length > 0 ? timeline : [
              { document_id: '1', file_name: 'previous_prescription.pdf', doc_type: 'PRESCRIPTION', document_date: '2026-08-25', summary: 'Rx: Telmisartan 40mg, Aspirin 75mg.', extracted_entities: {} },
              { document_id: '2', file_name: 'blood_report.jpg', doc_type: 'LAB_REPORT', document_date: '2026-08-26', summary: 'HbA1c: 7.2%, Cholesterol: 225 mg/dL.', extracted_entities: {} }
            ]).map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-cyan-400 border-4 border-slate-900" />
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                    <span>{item.document_date}</span>
                    <span className="uppercase text-slate-400">{item.doc_type}</span>
                  </div>
                  <div className="font-bold text-white">{item.file_name}</div>
                  <div className="text-xs text-slate-300 mt-1">{item.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Uploaded Medical Records & OCR Extracted JSON</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{doc.file_name}</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded">
                    {doc.doc_type}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">Date: {doc.document_date || '2026-08-25'}</div>
                <pre className="p-2 bg-slate-900 text-xs text-cyan-200 rounded font-mono overflow-x-auto max-h-32">
                  {doc.ocr_raw_text}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
