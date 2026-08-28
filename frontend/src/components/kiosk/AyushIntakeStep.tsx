import React, { useState } from 'react';
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../../types';

interface AyushIntakeStepProps {
  language: Language;
  onNext: (ayushData: Record<string, any>) => void;
  onSkip: () => void;
}

export const AyushIntakeStep: React.FC<AyushIntakeStepProps> = ({ language, onNext, onSkip }) => {
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [agni, setAgni] = useState('Mandagni');
  const [ahara, setAhara] = useState('Vegetarian, irregular timing');
  const [vihara, setVihara] = useState('Sedentary, late night sleep');

  const handleSubmit = () => {
    onNext({
      prakriti,
      agni,
      ahara,
      vihara,
      ayush_mode_enabled: true
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">AYUSH / Ayurvedic History Intake</h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">Optional</span>
            </div>
            <p className="text-sm text-slate-400">Collect Prakriti, Agni, Ahara & Vihara constitutional parameters</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Prakriti */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              1. Constitutional Body Type (Prakriti / பிரகிருதி)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Vata (வாதம்)', 'Pitta (பித்தம்)', 'Kapha (கபம்)', 'Vata-Pitta', 'Pitta-Kapha', 'Tridosha'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPrakriti(opt)}
                  className={`p-3 rounded-xl border text-sm font-bold kiosk-btn transition-all ${
                    prakriti === opt
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Agni */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              2. Digestive Fire Capacity (Agni / அக்னி)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Samagni (Balanced)', val: 'Samagni' },
                { label: 'Mandagni (Slow / Heavy)', val: 'Mandagni' },
                { label: 'Tikshnagni (Sharp / Intense)', val: 'Tikshnagni' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAgni(opt.val)}
                  className={`p-3 rounded-xl border text-sm font-bold kiosk-btn transition-all ${
                    agni === opt.val
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ahara & Vihara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Dietary Habits (Ahara)
              </label>
              <input
                type="text"
                value={ahara}
                onChange={(e) => setAhara(e.target.value)}
                placeholder="e.g. Vegetarian, spicy food..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Lifestyle / Sleep Habits (Vihara)
              </label>
              <input
                type="text"
                value={vihara}
                onChange={(e) => setVihara(e.target.value)}
                placeholder="e.g. Sedentary, late night sleep..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold kiosk-btn hover:bg-slate-800"
          >
            Skip AYUSH Step
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-emerald-500/20 flex items-center gap-3"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
