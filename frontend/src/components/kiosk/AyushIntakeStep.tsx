import React, { useState } from 'react';
import { Leaf, ArrowRight, Activity, Calendar, Compass, Shield } from 'lucide-react';
import { Language } from '../../types';

interface AyushIntakeStepProps {
  language: Language;
  onNext: (ayushData: Record<string, any>) => void;
  onSkip: () => void;
}

export const AyushIntakeStep: React.FC<AyushIntakeStepProps> = ({ language, onNext, onSkip }) => {
  // Subsection tabs
  const [activeSubTab, setActiveSubTab] = useState<'physiology' | 'capacity' | 'lifestyle'>('physiology');

  // ATURA PARIKSHA / PHYSIOLOGY
  const [prakriti, setPrakriti] = useState('Vata-Pitta');
  const [vikriti, setVikriti] = useState('Vata Imbalance');
  const [sara, setSara] = useState('Madhyama (Medium Tissue Excellence)');
  const [samhanana, setSamhanana] = useState('Madhyama (Medium Compactness)');
  const [pramana, setPramana] = useState('Sama (Proportionate)');

  // CAPACITY & PSYCHE
  const [satmya, setSatmya] = useState('Madhyama (Medium Adaptability)');
  const [sattva, setSattva] = useState('Madhyama (Medium Mental Strength)');
  const [aharaShakti, setAharaShakti] = useState('Madhyama (Moderate Digestion');
  const [vyayamaShakti, setVyayamaShakti] = useState('Madhyama (Moderate Exercise Capacity)');
  const [vaya, setVaya] = useState('Madhyama (Middle Age)');

  // DIET & LIFESTYLE
  const [ahara, setAhara] = useState('Vegetarian, irregular timing');
  const [vihara, setVihara] = useState('Sedentary, late night sleep');

  const handleSubmit = () => {
    onNext({
      prakriti,
      vikriti,
      sara,
      samhanana,
      pramana,
      satmya,
      sattva,
      ahara_shakti: aharaShakti,
      vyayama_shakti: vyayamaShakti,
      vaya,
      ahara,
      vihara,
      ayush_mode_enabled: true
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 select-none">
      <div className="kiosk-card border-emerald-500/25 bg-slate-900/90 relative overflow-hidden">

        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>

        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-505/20 rounded-2xl shadow-md">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">AYUSH Intake Engine</h2>
              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-550/10 text-emerald-450 border border-emerald-500/30 rounded-full tracking-wider uppercase">Dashavidha Pariksha</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Collect ten-fold clinical attributes for customized Ayurvedic health timelines</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveSubTab('physiology')}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeSubTab === 'physiology'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
          >
            <Compass className="w-3.5 h-3.5" />
            1. Physiology & Tissues (Pariksha)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('capacity')}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeSubTab === 'capacity'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
          >
            <Shield className="w-3.5 h-3.5" />
            2. Mind & Strength Capacity
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('lifestyle')}
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeSubTab === 'lifestyle'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
          >
            <Activity className="w-3.5 h-3.5" />
            3. Ahara-Vihara (Lifestyle)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[280px]">

          {/* Subsection 1: Physiology */}
          {activeSubTab === 'physiology' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  Constitutional Body Type (Prakriti / பிரகிருதி)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Vata dominant', 'Pitta dominant', 'Kapha dominant', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPrakriti(opt)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold kiosk-btn transition-colors ${prakriti === opt
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  State of Tridosha Humors (Vikriti / விக்ருதி)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Vata Imbalance', 'Pitta Imbalance', 'Kapha Imbalance', 'Tridosha Imbalance', 'Sama (Balanced)'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setVikriti(opt)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold kiosk-btn transition-colors ${vikriti === opt
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tissue Excellence (Sara / சாரம்)</label>
                  <select
                    value={sara}
                    onChange={(e) => setSara(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Pravara (Superior/Strong tissues)">Pravara (Superior)</option>
                    <option value="Madhyama (Medium Tissue Excellence)">Madhyama (Medium)</option>
                    <option value="Avara (Inferior/Weak tissues)">Avara (Inferior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Body Compactness (Samhanana)</label>
                  <select
                    value={samhanana}
                    onChange={(e) => setSamhanana(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Susamhata (Strong/Well-built)">Susamhata (Strong)</option>
                    <option value="Madhyama (Medium Compactness)">Madhyama (Medium)</option>
                    <option value="Visamhata (Weak/Frail compactness)">Visamhata (Weak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Body Proportions (Pramana)</label>
                  <select
                    value={pramana}
                    onChange={(e) => setPramana(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-805 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Sama (Proportionate/Athletic)">Sama (Proportionate)</option>
                    <option value="Hina (Under-proportioned)">Hina (Under-proportioned)</option>
                    <option value="Ati (Over-proportioned)">Ati (Over-proportioned)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Subsection 2: Mind & Capacity */}
          {activeSubTab === 'capacity' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Adaptability Class (Satmya / சாத்மியம்)</label>
                  <select
                    value={satmya}
                    onChange={(e) => setSatmya(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Pravara (Excellent adaptability to multiple tastes/climates)">Pravara (Excellent)</option>
                    <option value="Madhyama (Medium Adaptability)">Madhyama (Medium)</option>
                    <option value="Avara (Poor / Hypersensitive adaptability)">Avara (Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mind/Will Strength (Sattva / சத்துவம்)</label>
                  <select
                    value={sattva}
                    onChange={(e) => setSattva(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Pravara Satva (Strong mind / Pain-tolerant)">Pravara (Strong Will)</option>
                    <option value="Madhyama (Medium Mental Strength)">Madhyama (Medium)</option>
                    <option value="Avara Satva (Weak mind / High anxiety tender)">Avara (Anxious/Weak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Digestive Power (Ahara Shakti)</label>
                  <select
                    value={aharaShakti}
                    onChange={(e) => setAharaShakti(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Jarana-Abhyavarana (High food intake & digestion)">Pravara (Excellent digestion)</option>
                    <option value="Madhyama (Moderate Digestion)">Madhyama (Moderate)</option>
                    <option value="Manda / Avara (Weak digestive capacity)">Avara (Slow digestion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exercise Capacity (Vyayama Shakti)</label>
                  <select
                    value={vyayamaShakti}
                    onChange={(e) => setVyayamaShakti(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Pravara (High physical stamina)">Pravara (High Stamina)</option>
                    <option value="Madhyama (Moderate Exercise Capacity)">Madhyama (Moderate)</option>
                    <option value="Avara (Poor physical tolerance)">Avara (Tires easily)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Age Group Categorization (Vaya / வயது)</label>
                  <select
                    value={vaya}
                    onChange={(e) => setVaya(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Bala (Young/Growth - up to 16Y)">Bala (Childhood)</option>
                    <option value="Madhyama (Middle Age - 16-60Y)">Madhyama (Adult)</option>
                    <option value="Vriddha (Geriatric / Aging - 60Y+)">Vriddha (Geriatric)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Subsection 3: Lifestyle (Ahara-Vihara) */}
          {activeSubTab === 'lifestyle' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Dietary Habits & Preferences (Ahara / ஆகாரம்)
                </label>
                <input
                  type="text"
                  value={ahara}
                  onChange={(e) => setAhara(e.target.value)}
                  placeholder="e.g. Vegetarian, irregular timing, prefers hot spicy liquids..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Daily Conduct & Sleep Habits (Vihara / விஹாரம்)
                </label>
                <input
                  type="text"
                  value={vihara}
                  onChange={(e) => setVihara(e.target.value)}
                  placeholder="e.g. Sedentary computer task, stays awake post midnight, irregular walks..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl text-xs text-slate-400 flex items-start gap-2.5">
                <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  AYUSH Dashavidha Pariksha helps determine the patient's biological constitution (Prakriti) and root imbalances (Vikriti) to advise doctors on matching lifestyle regimens and therapeutic remedies.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Tab progression helpers */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onSkip}
            className="px-5 py-3 rounded-xl border border-slate-800 text-slate-450 hover:bg-slate-850 hover:text-white font-bold kiosk-btn text-xs transition-colors"
          >
            Skip AYUSH Profile
          </button>

          <div className="flex gap-2">
            {activeSubTab !== 'lifestyle' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeSubTab === 'physiology') setActiveSubTab('capacity');
                  else if (activeSubTab === 'capacity') setActiveSubTab('lifestyle');
                }}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs kiosk-btn hover:bg-slate-700 transition-all"
              >
                Next Section
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm kiosk-btn shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:brightness-110"
              >
                <span>Save AYUSH Intake</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
