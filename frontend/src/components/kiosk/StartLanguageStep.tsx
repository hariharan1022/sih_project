import React from 'react';
import { Globe, ArrowRight, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface StartLanguageStepProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onNext: () => void;
}

export const StartLanguageStep: React.FC<StartLanguageStepProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onNext
}) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 text-center animate-fade-in">
      
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
        <HeartPulse className="w-16 h-16 text-cyan-400 animate-pulse" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
        WELCOME TO MEDIKIOSK
      </h1>
      
      <p className="text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
        AI-Powered Self-Service Clinical Intake System. Speak or tap to share your medical history before seeing your doctor.
      </p>

      {/* Language Selection Big Touch Cards */}
      <div className="w-full max-w-2xl mb-10">
        <label className="block text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center justify-center gap-2">
          <Globe className="w-4 h-4" /> Select Your Language / மொழியை தேர்ந்தெடுக்கவும்
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectLanguage('ta')}
            className={`p-6 rounded-2xl border-2 kiosk-btn text-center flex flex-col items-center justify-center transition-all ${
              selectedLanguage === 'ta'
                ? 'bg-gradient-to-b from-cyan-600 to-blue-700 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 ring-4 ring-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            <span className="text-3xl font-black mb-1">தமிழ்</span>
            <span className="text-xs font-semibold text-cyan-200">Tamil</span>
          </button>

          <button
            onClick={() => onSelectLanguage('en')}
            className={`p-6 rounded-2xl border-2 kiosk-btn text-center flex flex-col items-center justify-center transition-all ${
              selectedLanguage === 'en'
                ? 'bg-gradient-to-b from-cyan-600 to-blue-700 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 ring-4 ring-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            <span className="text-3xl font-black mb-1">English</span>
            <span className="text-xs font-semibold text-cyan-200">English</span>
          </button>

          <button
            onClick={() => onSelectLanguage('hi')}
            className={`p-6 rounded-2xl border-2 kiosk-btn text-center flex flex-col items-center justify-center transition-all ${
              selectedLanguage === 'hi'
                ? 'bg-gradient-to-b from-cyan-600 to-blue-700 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 ring-4 ring-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            <span className="text-3xl font-black mb-1">हिंदी</span>
            <span className="text-xs font-semibold text-cyan-200">Hindi</span>
          </button>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onNext}
        className="w-full max-w-md py-5 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl text-2xl font-black tracking-wide shadow-2xl shadow-cyan-500/30 kiosk-btn flex items-center justify-center gap-4 hover:brightness-110"
      >
        <span>
          {selectedLanguage === 'ta' ? 'தொடங்கவும்' : selectedLanguage === 'hi' ? 'शुरू करें' : 'START CLINICAL INTAKE'}
        </span>
        <ArrowRight className="w-8 h-8" />
      </button>

      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Secure & Safe Intake. Information will be reviewed by your attending physician.</span>
      </div>

    </div>
  );
};
