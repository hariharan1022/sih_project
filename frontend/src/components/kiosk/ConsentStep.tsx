import React from 'react';
import { ShieldCheck, Volume2, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { speakText } from '../../services/tts';
import { Language } from '../../types';

interface ConsentStepProps {
  language: Language;
  onConsent: (agreed: boolean) => void;
  onBack: () => void;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({ language, onConsent, onBack }) => {
  const consentTitle = language === 'ta'
    ? 'சம்மத ஒப்புதல் (Patient Consent)'
    : language === 'hi'
      ? 'रोगी सहमति (Consent)'
      : 'Patient Informed Consent';

  const consentBody = language === 'ta'
    ? 'உங்கள் மருத்துவ வரலாற்றுத் தகவல்கள் உங்கள் மருத்துவ சிகிச்சை மற்றும் AI பகுப்பாய்விற்கு பயன்படுத்தப்படும். தகவல்கள் பாதுகாப்பாக வைக்கப்படும் மற்றும் உங்கள் மருத்துவரால் மட்டுமே சரிபார்க்கப்படும்.'
    : language === 'hi'
      ? 'आपकी नैदानिक जानकारी डॉक्टर की समीक्षा और सुरक्षित एआई प्रसंस्करण के लिए एकत्र की जाती है। आपकी गोपनीयता सुरक्षित है।'
      : 'We collect your clinical symptoms and medical history solely to generate an intake draft for your attending physician. Your data is encrypted, confidential, and will be reviewed and verified by your doctor before any medical decision.';

  const handleReadAloud = () => {
    speakText(`${consentTitle}. ${consentBody}`, language);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="kiosk-card bg-white border border-slate-200 shadow-xl rounded-3xl p-8 text-center">

        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl w-fit mx-auto mb-6 text-emerald-600 shadow-sm">
          <ShieldCheck className="w-12 h-12 animate-bounce" />
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-2">{consentTitle}</h2>

        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={handleReadAloud}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200 text-sm font-semibold hover:bg-cyan-100/50 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-cyan-600" />
            <span>Listen Audio Explanation 🔊</span>
          </button>
        </div>

        {/* Consent Details Card */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left text-slate-700 text-base leading-relaxed mb-8 shadow-sm">
          <p className="mb-4 text-lg font-bold text-slate-800">{consentBody}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Used exclusively for clinical intake draft generation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Strictly physician-controlled & verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Encrypted database & temporal kiosk retention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>ABDM / ABHA standards compatible</span>
            </div>
          </div>
        </div>

        {/* Big Touch Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <button
            onClick={() => onConsent(false)}
            className="py-5 px-6 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-700 font-bold text-xl kiosk-btn flex items-center justify-center gap-3 hover:bg-rose-100/50 shadow-sm"
          >
            <XCircle className="w-7 h-7 text-rose-600" />
            <span>
              {language === 'ta' ? 'நான் ஒப்புக்கொள்ளவில்லை' : language === 'hi' ? 'अस्वीकार करें' : 'I Do Not Agree'}
            </span>
          </button>

          <button
            onClick={() => onConsent(true)}
            className="py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-2xl kiosk-btn shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-3 hover:brightness-110"
          >
            <CheckCircle2 className="w-8 h-8" />
            <span>
              {language === 'ta' ? 'நான் ஒப்புக்கொள்கிறேன்' : language === 'hi' ? 'सहमति देता हूँ' : 'I Agree & Continue'}
            </span>
          </button>

        </div>

        <div className="mt-6">
          <button onClick={onBack} className="text-sm text-slate-500 font-semibold underline hover:text-slate-700 cursor-pointer">
            Back to Registration
          </button>
        </div>

      </div>
    </div>
  );
};
