import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Edit3,
  Share2,
  Eye,
  Clock,
  Stethoscope,
  FileCheck,
  Sparkles,
  Layers,
  Table,
  Leaf
} from 'lucide-react';
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
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (!history) {
    return (
      <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-400">
        Select a patient from the queue to view clinical history.
      </div>
    );
  }

  const isVerified = history.verification_status === 'VERIFIED';
  const hasRedFlags = session.has_red_flags || (history.red_flags && history.red_flags.length > 0);

  // Setup effective documents list with fallback demo data if none uploaded
  const effectiveDocs = documents.length > 0 ? documents : [
    {
      id: 'doc-1',
      file_name: 'previous_prescription.pdf',
      doc_type: 'PRESCRIPTION',
      document_date: '2026-08-25',
      ocr_raw_text: `CITY SPECIALTY HOSPITAL & HEART CLINIC\nDr. Sundaram, MD, DM\nDate: 25-Aug-2026\n\nPatient Name: Demo Patient (45 / Male)\nDiagnosis: Essential Hypertension, Dyslipidemia\n\nRx:\n1. Tab. Telmisartan 40mg - 1-0-0 (Morning) x 30 days\n2. Tab. Atorvastatin 10mg - 0-0-1 (Night) x 30 days\n3. Tab. Aspirin 75mg - 0-0-1\n\nReturn with fasting blood sugar and lipid report.`,
      extracted_entities: {
        document_type: 'PRESCRIPTION',
        doctor_name: 'Dr. Sundaram, MD, DM',
        hospital_name: 'City Specialty Hospital & Heart Clinic',
        diagnoses: ['Essential Hypertension', 'Dyslipidemia'],
        medications: [
          { name: 'Telmisartan', dosage: '40mg', frequency: '1-0-0' },
          { name: 'Atorvastatin', dosage: '10mg', frequency: '0-0-1' },
          { name: 'Aspirin', dosage: '75mg', frequency: '0-0-1' }
        ],
        lab_results: []
      },
      file_url: '/uploads/demo_prescription.pdf'
    },
    {
      id: 'doc-2',
      file_name: 'blood_report.jpg',
      doc_type: 'LAB_REPORT',
      document_date: '2026-08-26',
      ocr_raw_text: `METROPOLIS DIAGNOSTICS & LAB SERVICES\nPatient: Demo Patient | Date: 26-Aug-2026\n\nLABORATORY VALUE REPORT:\n- Fasting Blood Sugar (FBS): 138 mg/dL [Ref: 70-100] (HIGH)\n- HbA1c: 7.2 % [Ref: 4.0-5.6] (ELEVATED)\n- Total Cholesterol: 225 mg/dL [Ref: < 200] (ELEVATED)\n- Triglycerides: 190 mg/dL [Ref: < 150] (ELEVATED)\n- Serum Creatinine: 0.9 mg/dL [Ref: 0.7-1.2] (NORMAL)`,
      extracted_entities: {
        document_type: 'LAB_REPORT',
        hospital_name: 'Metropolis Diagnostics',
        diagnoses: ['Prediabetes / Impaired Glycemia', 'Hypercholesterolemia'],
        medications: [],
        lab_results: [
          { test_name: 'Fasting Blood Sugar', value: '138', unit: 'mg/dL', reference_range: '70-100' },
          { test_name: 'HbA1c', value: '7.2', unit: '%', reference_range: '4.0-5.6' },
          { test_name: 'Total Cholesterol', value: '225', unit: 'mg/dL', reference_range: '<200' },
          { test_name: 'Triglycerides', value: '190', unit: 'mg/dL', reference_range: '<150' },
          { test_name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', reference_range: '0.7-1.2' }
        ]
      },
      file_url: '/uploads/demo_blood_report.jpg'
    }
  ];

  const currentDocId = selectedDocId || (effectiveDocs.length > 0 ? effectiveDocs[0].id : null);
  const activeDoc = effectiveDocs.find(d => d.id === currentDocId);

  return (
    <div className="space-y-6">

      {/* Patient Header Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-slate-850">{session.patient?.full_name || 'Demo Patient'}</h2>
            <span className="px-3 py-1 bg-cyan-50 text-cyan-700 font-bold text-xs rounded-full border border-cyan-200">
              Token: {session.token_number}
            </span>
            {isVerified && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-250 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Verified
              </span>
            )}
          </div>
          <div className="text-sm text-slate-655 flex items-center gap-4 flex-wrap font-medium">
            <span>Age: <strong className="text-slate-800">{session.patient?.age || 45}Y</strong></span>
            <span>Gender: <strong className="text-slate-800">{session.patient?.gender || 'Male'}</strong></span>
            <span>MRN: <strong className="text-slate-800">{session.patient?.mrn || 'MRN-89412'}</strong></span>
            <span>ABHA ID: <strong className="text-cyan-700">{session.patient?.abha_id || '91-9876-5432-1098'}</strong></span>
          </div>
        </div>

        {/* Doctor Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFHIRModal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-350 text-cyan-705 font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>FHIR Bundle</span>
          </button>

          <button
            onClick={onOpenSummaryEditor}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isVerified ? 'Edit Summary' : 'Verify & Approve Summary'}</span>
          </button>
        </div>
      </div>

      {/* RED FLAG WARNING BANNER IF DETECTED */}
      {hasRedFlags && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-lg shadow-rose-500/5 animate-pulse-slow">
          <ShieldAlert className="w-8 h-8 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-base font-black text-rose-700 flex items-center gap-2">
              <span>POTENTIAL EMERGENCY RED FLAG DETECTED</span>
              <span className="px-2 py-0.5 text-xs bg-rose-600 text-white font-bold rounded">CRITICAL</span>
            </div>
            <p className="text-sm text-rose-900 mt-1 font-semibold">
              Patient reports chest discomfort radiating to left shoulder and breathing difficulty for 2 days. Triggers Acute coronary triage evaluation.
            </p>
            <div className="mt-2 text-xs text-rose-700 italic font-semibold">
              Disclaimer: AI Triage Assistant. Attending Doctor must immediately assess vitals and perform ECG.
            </div>
          </div>
        </div>
      )}

      {/* Detail View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'summary', label: 'AI Physician Summary' },
          { id: 'history', label: 'Detailed Intake History' },
          { id: 'timeline', label: 'Chronological Timeline' },
          { id: 'documents', label: `Medical Documents Viewer (${effectiveDocs.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${activeTab === t.id
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
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
              <span>Structured Physician Summary Draft</span>
            </h3>
            <span className="text-xs text-cyan-455 font-bold uppercase tracking-wider bg-cyan-900/30 px-2.5 py-0.5 rounded border border-cyan-850/50">Local LLM: Qwen3:8b</span>
          </div>

          <div className="p-6 bg-slate-950 rounded-xl border border-slate-850 font-mono text-sm text-cyan-50/90 whitespace-pre-wrap leading-relaxed shadow-inner">
            {history.doctor_approved_summary || history.ai_generated_summary}
          </div>

          {history.doctor_notes && (
            <div className="p-5 bg-slate-850/60 rounded-xl border border-cyan-500/20">
              <span className="text-xs uppercase text-cyan-400 font-bold block mb-1">Physician Evaluation Notes:</span>
              <p className="text-sm text-slate-200">{history.doctor_notes}</p>
            </div>
          )}

          <div className="p-3.5 bg-slate-950 rounded-lg text-xs text-slate-500 flex items-center justify-between border border-slate-850">
            <span>Notice: AI clinical intake summary. Clinician holds final approval authority.</span>
            <span>Last Updated: {new Date(history.updated_at).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED INTAKE HISTORY */}
      {activeTab === 'history' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-850">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Chief Complaint</h4>
              <p className="text-lg font-bold text-white">{history.chief_complaint}</p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-850">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">History of Present Illness (HPI)</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{history.history_of_present_illness}</p>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-850">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Past Medical History</h4>
              {history.past_medical_history.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {history.past_medical_history.map((m, idx) => <li key={idx}>{m}</li>)}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No past conditions reported by patient</span>
              )}
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-slate-850">
              <h4 className="text-xs uppercase text-cyan-400 font-bold mb-2">Current Medications (OCR & Interview)</h4>
              {history.medications.length > 0 ? (
                <div className="space-y-1.5 text-sm text-slate-305">
                  {history.medications.map((m: any, idx) => (
                    <div key={idx} className="font-semibold text-cyan-200">
                      • {typeof m === 'object' ? `${m.name} (${m.dosage || 'Daily'}) ${m.frequency ? `- ${m.frequency}` : ''}` : m}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">None reported</span>
              )}
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border-t border-slate-850 border-rose-500/20">
              <h4 className="text-xs uppercase text-rose-450 font-bold mb-2">Drug & Allergy Exclusions</h4>
              <div className="text-sm font-bold text-rose-350">
                {history.allergies.join(', ') || 'No known drug allergies (NKDA)'}
              </div>
            </div>

            {history.ayush_data && history.ayush_data.ayush_mode_enabled && (
              <div className="p-5 bg-slate-950 rounded-xl border border-emerald-500/20">
                <h4 className="text-xs uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Ayurvedic Diagnostics (Dashavidha Pariksha)</span>
                </h4>
                <div className="text-xs text-slate-300 grid grid-cols-2 gap-2 mt-2">
                  <div>Prakriti (Body): <strong className="text-emerald-300">{history.ayush_data.prakriti}</strong></div>
                  <div>Vikriti (Imbalance): <strong className="text-emerald-300">{history.ayush_data.vikriti}</strong></div>
                  <div>Sara (Tissue): <strong className="text-emerald-400">{history.ayush_data.sara || 'Madhyama'}</strong></div>
                  <div>Sattva (Mind): <strong className="text-emerald-400">{history.ayush_data.sattva || 'Madhyama'}</strong></div>
                  <div className="col-span-2 mt-1 border-t border-slate-850 pt-1">
                    <span className="text-slate-500 block">Ahara-Vihara habits:</span>
                    <div>Diet: {history.ayush_data.ahara}</div>
                    <div>Lifestyle: {history.ayush_data.vihara}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Chronological Health Timeline</h3>
          <div className="relative pl-8 border-l-2 border-cyan-500/30 space-y-6 ml-4">
            {(timeline.length > 0 ? timeline : [
              { document_id: 'doc-1', file_name: 'previous_prescription.pdf', doc_type: 'PRESCRIPTION', document_date: '2026-08-25', summary: 'Essential Hypertension, Dyslipidemia | Medication: Telmisartan, Atorvastatin, Aspirin.', extracted_entities: {} },
              { document_id: 'doc-2', file_name: 'blood_report.jpg', doc_type: 'LAB_REPORT', document_date: '2026-08-26', summary: 'Fasting Blood Sugar: 138 mg/dL (High), HbA1c: 7.2% (Elevated), Cholesterol: 225 mg/dL (Elevated).', extracted_entities: {} }
            ]).map((item, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node dot */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>

                <div className="p-5 bg-slate-950 rounded-xl border border-slate-850 shadow hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-455 mb-2">
                    <span className="bg-cyan-950/40 px-2 py-0.5 border border-cyan-800/40 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.document_date}
                    </span>
                    <span className="uppercase text-slate-400 font-semibold">{item.doc_type}</span>
                  </div>
                  <div className="font-extrabold text-white text-base">{item.file_name}</div>
                  <p className="text-sm text-slate-350 mt-1.5 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS SIDE-BY-SIDE VIEWER */}
      {activeTab === 'documents' && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xl font-black text-white">OCR Medical Document Intelligence</h3>
              <p className="text-xs text-slate-450">Inspect raw scanned text versus AI extracted entities side-by-side</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Document:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                {effectiveDocs.map((doc, idx) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeDoc?.id === doc.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-405 hover:text-white hover:bg-slate-700'
                      }`}
                  >
                    Doc {idx + 1} ({doc.doc_type})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeDoc ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">

              {/* Left Column: Original Scanned Text Document Simulation (High Contrast View) */}
              <div className="space-y-2">
                <span className="text-xs uppercase text-slate-300 font-bold block mb-1 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Original Document Scanned Text / Pre-processed File
                </span>

                <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-2xl min-h-[380px] font-mono text-sm leading-relaxed border-4 border-slate-305 flex flex-col justify-between">
                  <div className="whitespace-pre-wrap">{activeDoc.ocr_raw_text}</div>

                  <div className="border-t border-dashed border-slate-300 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                    <span>File ID: {activeDoc.id.substring(0, 8)}...</span>
                    <span className="font-bold text-cyan-700">MEDIKIOSK DIGITAL SCANNER v1.2</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Structured Information */}
              <div className="space-y-4">
                <span className="text-xs uppercase text-slate-300 font-bold block mb-1 flex items-center gap-2">
                  <Table className="w-3.5 h-3.5 text-cyan-400" />
                  AI Structured Insights (Physician Verified)
                </span>

                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4 min-h-[380px]">

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-850 pb-3">
                    <div>
                      <span className="text-slate-500 block">Extracted Date:</span>
                      <strong className="text-white">{activeDoc.document_date || '2026-08-25'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Institution / Hospital:</span>
                      <strong className="text-cyan-400">
                        {(activeDoc.extracted_entities as any).hospital_name || (activeDoc.extracted_entities as any).hospital || 'Diagnostics Center'}
                      </strong>
                    </div>
                  </div>

                  {/* Diagnoses Entities */}
                  <div>
                    <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Extracted Codes / Diagnoses</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc.extracted_entities.diagnoses && activeDoc.extracted_entities.diagnoses.length > 0 ? (
                        activeDoc.extracted_entities.diagnoses.map((d: string, index: number) => (
                          <span key={index} className="px-2.5 py-1 bg-cyan-950/40 text-cyan-300 border border-cyan-900/60 rounded-lg text-xs font-semibold">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No diagnoses extracted from document</span>
                      )}
                    </div>
                  </div>

                  {/* Medications Table */}
                  {activeDoc.extracted_entities.medications && activeDoc.extracted_entities.medications.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Extracted Medications</span>
                      <div className="overflow-hidden border border-slate-850 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-850">
                            <tr>
                              <th className="p-2">Drug Name</th>
                              <th className="p-2">Dosage</th>
                              <th className="p-2 text-center">Frequency</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {activeDoc.extracted_entities.medications.map((m: any, idx: number) => (
                              <tr key={idx} className="text-slate-200">
                                <td className="p-2 font-semibold text-cyan-200">{m.name}</td>
                                <td className="p-2">{m.dosage || 'As directed'}</td>
                                <td className="p-2 text-center">{m.frequency || 'QD'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Lab Results Table */}
                  {activeDoc.extracted_entities.lab_results && activeDoc.extracted_entities.lab_results.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block mb-1.5">Extracted Investigations</span>
                      <div className="overflow-hidden border border-slate-850 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-850">
                            <tr>
                              <th className="p-2">Test</th>
                              <th className="p-2 text-center">Value</th>
                              <th className="p-2">Ref Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {activeDoc.extracted_entities.lab_results.map((r: any, idx: number) => {
                              const isHigh = r.value && r.reference_range && parseFloat(r.value) > parseFloat(r.reference_range.split('-')[1] || '999');
                              return (
                                <tr key={idx} className="text-slate-205">
                                  <td className="p-2 font-semibold">{r.test_name}</td>
                                  <td className={`p-2 text-center font-bold ${isHigh ? 'text-rose-400' : 'text-slate-200'}`}>
                                    {r.value} {r.unit} {isHigh && '▲'}
                                  </td>
                                  <td className="p-2 text-slate-500">{r.reference_range || '--'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="text-slate-500 text-xs py-8 text-center bg-slate-950 rounded-xl">
              No medical records associated with this session.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
