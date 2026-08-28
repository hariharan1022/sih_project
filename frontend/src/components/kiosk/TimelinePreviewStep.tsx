import React from 'react';
import { Calendar, FileText, ArrowRight, Activity, Clock } from 'lucide-react';
import { MedicalDocument, Language } from '../../types';

interface TimelinePreviewStepProps {
  documents: MedicalDocument[];
  language: Language;
  onNext: () => void;
  onBack: () => void;
}

export const TimelinePreviewStep: React.FC<TimelinePreviewStepProps> = ({
  documents,
  language,
  onNext,
  onBack
}) => {
  // Demo timeline fallback items if no doc uploaded yet
  const displayDocs = documents.length > 0 ? documents : [
    {
      id: 'doc-1',
      file_name: 'previous_prescription.pdf',
      doc_type: 'PRESCRIPTION',
      document_date: '2026-08-25',
      ocr_raw_text: 'Rx: Telmisartan 40mg, Aspirin 75mg.',
      extracted_entities: { doctor: 'Dr. R. Sundaram', diagnoses: ['Essential Hypertension'] }
    },
    {
      id: 'doc-2',
      file_name: 'blood_report.jpg',
      doc_type: 'LAB_REPORT',
      document_date: '2026-08-26',
      ocr_raw_text: 'HbA1c: 7.2%, Cholesterol: 225 mg/dL.',
      extracted_entities: { lab: 'Metropolis Diagnostics' }
    },
    {
      id: 'doc-3',
      file_name: 'discharge_summary.pdf',
      doc_type: 'DISCHARGE_SUMMARY',
      document_date: '2025-01-12',
      ocr_raw_text: 'Admitted for Gastritis.',
      extracted_entities: { hospital: 'St. Jude Medical Center' }
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Chronological Medical Timeline</h2>
            <p className="text-sm text-slate-400">Automated chronological organization of past prescriptions, lab tests & hospitalizations</p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative pl-6 border-l-2 border-cyan-500/40 space-y-8 my-8">
          {displayDocs.map((doc, idx) => (
            <div key={doc.id || idx} className="relative group">
              
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-cyan-400 border-4 border-slate-900 shadow-md shadow-cyan-500/50" />

              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
                    {doc.document_date || '2026-08-25'}
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    {doc.doc_type}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>{doc.file_name}</span>
                </h4>

                <p className="text-xs text-cyan-200 bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono">
                  "{doc.ocr_raw_text.substring(0, 120)}..."
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Actions */}
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
            onClick={onNext}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/20 flex items-center gap-3"
          >
            <span>Review Final History</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
