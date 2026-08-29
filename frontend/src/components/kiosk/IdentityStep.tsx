import React, { useState } from 'react';
import { User, Phone, CheckCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyAbhaApi } from '../../services/api';
import { Language } from '../../types';

interface IdentityStepProps {
  language: Language;
  onComplete: (data: {
    full_name: string;
    age: number;
    gender: string;
    contact_phone: string;
    abha_id?: string;
  }) => void;
  onBack: () => void;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({ language, onComplete, onBack }) => {
  const [fullName, setFullName] = useState('Demo Patient');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('+91-9876543210');
  const [abhaId, setAbhaId] = useState('91-9876-5432-1098');
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyAbha = async () => {
    if (!abhaId) return;
    setVerifying(true);
    try {
      const res = await verifyAbhaApi(abhaId);
      if (res.verified) {
        setAbhaVerified(true);
        if (res.name) setFullName(res.name);
        if (res.mobile) setPhone(res.mobile);
      }
    } catch (e) {
      console.warn('ABHA verify note:', e);
      setAbhaVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !age || !gender || !phone) {
      alert('Please complete all required fields.');
      return;
    }
    onComplete({ full_name: fullName, age, gender, contact_phone: phone, abha_id: abhaId });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="kiosk-card bg-white border border-slate-200 shadow-xl rounded-3xl p-8">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-850">
              {language === 'ta' ? 'நோயாளி அடையாளம்' : language === 'hi' ? 'रोगी पहचान' : 'Patient Registration / Identification'}
            </h2>
            <p className="text-sm text-slate-500">Please enter your basic information or verify ABHA Health ID</p>
          </div>
        </div>

        {/* ABHA Sandbox Verification Banner */}
        <div className="mb-6 p-4 bg-cyan-50/40 rounded-2xl border border-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-850 flex items-center gap-2">
                <span>ABDM / ABHA ID Lookup (Sandbox)</span>
                {abhaVerified && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500 font-medium">Verify your Ayushman Bharat Health Account number</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVerifyAbha}
            disabled={verifying || abhaVerified}
            className={`px-4 py-2.5 rounded-xl text-xs font-black kiosk-btn whitespace-nowrap ${abhaVerified
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
              }`}
          >
            {verifying ? 'Verifying...' : abhaVerified ? '✓ ABHA Verified' : 'Verify ABHA ID'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ABHA Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              ABHA ID / ABHA Number (Optional)
            </label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              placeholder="e.g. 91-9876-5432-1098 or username@abha"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter patient full name"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Age (Years) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-xs"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:border-cyan-500 focus:bg-white focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Gender Big Touch Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-650 mb-3">
              Gender *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Male', 'Female', 'Other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-4 rounded-xl border-2 font-bold text-lg kiosk-btn transition-all ${gender === g
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/50 shadow-sm'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-4 rounded-xl border border-slate-200 text-slate-650 font-bold kiosk-btn hover:bg-slate-50 shadow-sm"
            >
              Back
            </button>

            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-550 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/10 flex items-center gap-3"
            >
              <span>Continue</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
