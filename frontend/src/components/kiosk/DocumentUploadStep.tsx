import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { uploadDocumentApi } from '../../services/api';
import { MedicalDocument, Language } from '../../types';

interface DocumentUploadStepProps {
  sessionId: string;
  language: Language;
  uploadedDocs: MedicalDocument[];
  onDocumentUploaded: (doc: MedicalDocument) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  sessionId,
  language,
  uploadedDocs,
  onDocumentUploaded,
  onNext,
  onBack
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('PRESCRIPTION');
  const [previewText, setPreviewText] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('doc_type', selectedType);
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await uploadDocumentApi(formData);
      onDocumentUploaded(res);
      setPreviewText(res.ocr_raw_text);
    } catch (err) {
      alert('Error processing document OCR. Please try again or continue.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ta' ? 'மருத்துவ ஆவணங்கள் பதிவேற்றம்' : 'Upload Past Medical Documents & Reports'}
            </h2>
            <p className="text-sm text-slate-400">Scan or upload prescriptions, lab reports, discharge summaries (PDF, JPG, PNG)</p>
          </div>
        </div>

        {/* Document Type Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Document Category:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'PRESCRIPTION', label: 'Prescription' },
              { type: 'LAB_REPORT', label: 'Lab Blood Report' },
              { type: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' }
            ].map((d) => (
              <button
                key={d.type}
                type="button"
                onClick={() => setSelectedType(d.type)}
                className={`p-3 rounded-xl border font-bold text-sm kiosk-btn transition-all ${
                  selectedType === d.type
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Zone Box */}
        <div className="relative border-2 border-dashed border-cyan-500/40 bg-slate-900/80 rounded-2xl p-8 text-center mb-6 hover:border-cyan-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          {uploading ? (
            <div className="py-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-lg font-bold text-white">Running PaddleOCR & Local Medical AI Extractor...</p>
              <p className="text-xs text-slate-400">Extracting diagnoses, medications, lab values, doctor name</p>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <p className="text-xl font-bold text-white mb-1">Tap Here to Scan or Upload File</p>
              <p className="text-xs text-slate-400">Supports PDF documents and high-resolution camera photos</p>
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        {uploadedDocs.length > 0 && (
          <div className="mb-6 p-4 bg-slate-900/90 rounded-xl border border-slate-700">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Processed Documents ({uploadedDocs.length})</span>
            </h4>

            <div className="space-y-3">
              {uploadedDocs.map((doc, idx) => (
                <div key={doc.id || idx} className="p-3 bg-slate-800 rounded-lg flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-sm font-bold text-white">{doc.file_name}</div>
                      <div className="text-xs text-slate-400">
                        Type: {doc.doc_type} | Date: {doc.document_date || '2026-08-25'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewText(doc.ocr_raw_text)}
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View OCR Text
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live OCR Text Preview Modal */}
        {previewText && (
          <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-cyan-400">OCR Extracted Medical Text Preview</span>
              <button onClick={() => setPreviewText(null)} className="text-xs text-slate-400 hover:text-white">Close [X]</button>
            </div>
            <pre className="p-3 bg-slate-900 text-xs text-cyan-200 rounded font-mono overflow-x-auto whitespace-pre-wrap max-h-40">
              {previewText}
            </pre>
          </div>
        )}

        {/* Navigation Buttons */}
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
            <span>Proceed to Timeline & Review</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
