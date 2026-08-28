import React, { useState } from 'react';
import { Stethoscope, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { SpeechMic } from '../common/SpeechMic';
import { Language } from '../../types';

interface ChiefComplaintStepProps {
  language: Language;
  onNext: (chiefComplaint: string) => void;
  onBack: () => void;
}

export const ChiefComplaintStep: React.FC<ChiefComplaintStepProps> = ({ language, onNext, onBack }) => {
  const [complaintText, setComplaintText] = useState(
    language === 'ta' ? 'எனக்கு இரண்டு நாட்களாக மார்பில் வலி இருக்கிறது.' : 'I have chest pain and shortness of breath for 2 days.'
  );

  const quickSymptoms = [
    {
      en: 'Chest Pain / Pressure',
      ta: 'மார்பு வலி',
      hi: 'छाती में दर्द',
      val: language === 'ta' ? 'மார்பு வலி மற்றும் மூச்சு திணறல் இருக்கிறது' : 'Chest pain and breathing difficulty'
    },
    {
      en: 'High Fever & Chills',
      ta: 'கடும் காய்ச்சல்',
      hi: 'तेज बुखार',
      val: language === 'ta' ? 'கடும் காய்ச்சல் மற்றும் சளி இருக்கிறது' : 'High fever and shivering for 3 days'
    },
    {
      en: 'Shortness of Breath',
      ta: 'மூச்சு திணறல்',
      hi: 'सांस में तकलीफ',
      val: language === 'ta' ? 'மூச்சு திணறல் மற்றும் இருமல் உள்ளது' : 'Difficulty breathing and persistent cough'
    },
    {
      en: 'Severe Stomach Pain',
      ta: 'கடுமையான வயிற்று வலி',
      hi: 'गंभीर पेट दर्द',
      val: language === 'ta' ? 'கடுமையான வயிற்று வலி மற்றும் வாந்தி' : 'Severe stomach abdominal pain and nausea'
    }
  ];

  const promptTitle = language === 'ta'
    ? 'உங்கள் முதன்மை உடல்நல கோளாறு என்ன?'
    : language === 'hi'
    ? 'आपकी मुख्य स्वास्थ्य शिकायत क्या है?'
    : 'What is your primary chief complaint today?';

  const handleTranscript = (text: string) => {
    if (text) {
      setComplaintText(text);
    }
  };

  const handleSubmit = () => {
    if (!complaintText.trim()) {
      alert('Please describe your chief complaint or choose a symptom chip.');
      return;
    }
    onNext(complaintText);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="kiosk-card">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{promptTitle}</h2>
            <p className="text-sm text-slate-400">Speak into microphone 🎤 or select touch options below</p>
          </div>
        </div>

        {/* Voice SpeechMic */}
        <SpeechMic
          language={language}
          onTranscript={handleTranscript}
          promptText={promptTitle}
        />

        {/* Text Box Input Alternative */}
        <div className="my-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Described Complaint (Or Type / Edit)
          </label>
          <textarea
            rows={3}
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="e.g. Chest pain for 2 days radiating to left arm..."
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-cyan-200 text-lg focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Quick Symptom Chips */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
            Quick Touch Symptoms
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickSymptoms.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setComplaintText(s.val)}
                className="p-4 rounded-xl border border-slate-700 bg-slate-900/90 text-left font-bold text-white hover:border-cyan-400 hover:bg-slate-800 kiosk-btn flex items-center justify-between"
              >
                <span>{language === 'ta' ? s.ta : language === 'hi' ? s.hi : s.en}</span>
                <span className="text-xs text-cyan-400 font-normal">Tap →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nav Buttons */}
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
            onClick={handleSubmit}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/20 flex items-center gap-3"
          >
            <span>Start AI Interview</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
