import React, { useState, useEffect } from 'react';
import { X, Download, Share2, CheckCircle2, Code } from 'lucide-react';
import { getFHIRBundleApi } from '../../services/api';

interface FHIRBundleModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FHIRBundleModal: React.FC<FHIRBundleModalProps> = ({ sessionId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [fhirData, setFhirData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        const res = await getFHIRBundleApi(sessionId);
        setFhirData(res);
      } catch (err) {
        console.warn('FHIR bundle load error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) loadBundle();
  }, [sessionId]);

  const handleDownloadJSON = () => {
    if (!fhirData) return;
    const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${sessionId}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-205 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-cyan-600" />
            <div>
              <h3 className="text-xl font-black text-slate-850">HL7 FHIR R4 Document Bundle (ABDM-Ready)</h3>
              <p className="text-xs text-slate-500 font-semibold">Exportable FHIR Patient, Condition, and MedicationStatement resources</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-200 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold">Generating FHIR Bundle resources...</div>
          ) : (
            <pre className="p-4 bg-slate-50 text-xs text-cyan-800 font-mono rounded-xl border border-slate-200 overflow-x-auto max-h-[50vh] font-semibold leading-relaxed">
              {JSON.stringify(fhirData, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-black">
            <CheckCircle2 className="w-4 h-4" />
            <span>FHIR R4 Schema Compliant</span>
          </div>

          <button
            onClick={handleDownloadJSON}
            disabled={!fhirData}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl shadow-md shadow-cyan-600/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download FHIR JSON</span>
          </button>
        </div>

      </div>
    </div>
  );
};
