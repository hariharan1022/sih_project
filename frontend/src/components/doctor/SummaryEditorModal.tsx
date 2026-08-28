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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="p-5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Physician Verification & Summary Editor</h3>
              <p className="text-xs text-slate-400">Attending doctor has final edit & approval authority over AI intake draft</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Editable Physician Clinical Summary:
            </label>
            <textarea
              rows={12}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm text-cyan-200 focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Attending Physician Consultation Notes / Orders:
            </label>
            <input
              type="text"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. STAT ECG ordered. BP 145/90 mmHg. Troponin sent."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={saving}
            className="px-4 py-2.5 bg-rose-950 border border-rose-500/50 hover:bg-rose-900 text-rose-300 font-bold text-sm rounded-xl flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Reject Summary</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction('EDITED')}
              disabled={saving}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>Save Draft Changes</span>
            </button>

            <button
              onClick={() => handleAction('VERIFIED')}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
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
