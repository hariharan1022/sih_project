import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Leaf, Clock, Save, CheckCircle2 } from 'lucide-react';
import { getAdminConfigApi, updateAdminConfigApi } from '../../services/api';

export const AISettingsForm: React.FC = () => {
  const [model, setModel] = useState('qwen3:8b');
  const [ayushEnabled, setAyushEnabled] = useState(true);
  const [redFlagEnabled, setRedFlagEnabled] = useState(true);
  const [timeoutMinutes, setTimeoutMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getAdminConfigApi();
        if (data.ollama_model) setModel(data.ollama_model);
        if (data.ayush_mode_enabled !== undefined) setAyushEnabled(data.ayush_mode_enabled);
        if (data.red_flag_triage_enabled !== undefined) setRedFlagEnabled(data.red_flag_triage_enabled);
        if (data.session_timeout_minutes) setTimeoutMinutes(data.session_timeout_minutes);
      } catch (err) {
        console.warn('Load config note:', err);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminConfigApi({
        ollama_model: model,
        ayush_mode_enabled: ayushEnabled,
        red_flag_triage_enabled: redFlagEnabled,
        session_timeout_minutes: timeoutMinutes
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl max-w-3xl">
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Engine & Clinical Intake Configuration</h3>
          <p className="text-xs text-slate-400">Configure local Ollama LLM, AYUSH Ayurvedic mode, and red-flag rules</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Ollama Model Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
            Local Ollama LLM Model Selection:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'qwen3:8b', label: 'Qwen3 8B (Default / Fast)', desc: 'Optimal intake speed & clinical entity extraction' },
              { id: 'qwen3:14b', label: 'Qwen3 14B', desc: 'Enhanced medical entity resolution' },
              { id: 'gemma3:12b', label: 'Gemma3 12B', desc: 'High accuracy clinical summarization' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-xl border text-left font-bold kiosk-btn transition-all ${
                  model === m.id
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-sm">{m.label}</div>
                <div className="text-[11px] font-normal text-slate-400 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AYUSH Mode Toggle */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-white">AYUSH Ayurvedic History Mode</div>
              <div className="text-xs text-slate-400">Enable Prakriti, Vikriti, Agni, Ahara & Vihara clinical intake module</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAyushEnabled(!ayushEnabled)}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
              ayushEnabled ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
              ayushEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Red Flag Engine Toggle */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <div>
              <div className="text-sm font-bold text-white">Red Flag Emergency Triage Engine</div>
              <div className="text-xs text-slate-400">Automated triage safety checks for chest pain, stroke, dyspnea & hemorrhage</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRedFlagEnabled(!redFlagEnabled)}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 ${
              redFlagEnabled ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
              redFlagEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Session Timeout */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Kiosk Session Auto-Reset Timeout (Minutes)
          </label>
          <input
            type="number"
            value={timeoutMinutes}
            onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 30)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>

          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Configuration saved successfully!
            </span>
          )}
        </div>

      </form>
    </div>
  );
};
