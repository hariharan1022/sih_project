import React, { useState } from 'react';
import { X, CheckCircle, Edit3, XCircle, Save, Stethoscope } from 'lucide-react';
import { doctorVerifySummaryApi } from '../../services/api';
import { ClinicalHistory } from '../../types';

interface SummaryEditorModalProps {
  history: ClinicalHistory;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedHistory: ClinicalHistory) => void;
}

export const SummaryEditorModal: React.FC<SummaryEditorModalProps> = ({
  history,
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen) return null;

  const [summaryText, setSummaryText] = useState(
    history.doctor_approved_summary || history.ai_generated_summary
  );
  const [doctorNotes, setDoctorNotes] = useState(history.doctor_notes || '');
  const [saving, setSaving] = useState(false);

  const handleAction = async (status: 'VERIFIED' | 'EDITED' | 'REJECTED') => {
    setSaving(true);
    try {
      const res = await doctorVerifySummaryApi({
        session_id: history.session_id,
        doctor_approved_summary: summaryText,
        doctor_notes: doctorNotes,
        status: status
      });
      onSaved(res);
      onClose();
    } catch (err) {
      alert('Error updating summary verification status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-cyan-600" />
            <div>
              <h3 className="text-xl font-black text-slate-850">Physician Verification & Summary Editor</h3>
              <p className="text-xs text-slate-500 font-semibold">Attending doctor has final edit & approval authority over AI intake draft</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-200 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-705 mb-2">
              Editable Physician Clinical Summary:
            </label>
            <textarea
              rows={12}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-800 font-semibold focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 focus:outline-none focus:bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-bold">
              Attending Physician Consultation Notes / Orders:
            </label>
            <input
              type="text"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. STAT ECG ordered. BP 145/90 mmHg. Troponin sent."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 focus:bg-white"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={saving}
            className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Reject Summary</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction('EDITED')}
              disabled={saving}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4 text-cyan-600" />
              <span>Save Draft Changes</span>
            </button>

            <button
              onClick={() => handleAction('VERIFIED')}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>APPROVE & VERIFY SUMMARY</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
