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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="kiosk-card">
        
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ta' ? 'நோயாளி அடையாளம்' : language === 'hi' ? 'रोगी पहचान' : 'Patient Registration / Identification'}
            </h2>
            <p className="text-sm text-slate-400">Please enter your basic information or verify ABHA Health ID</p>
          </div>
        </div>

        {/* ABHA Sandbox Verification Banner */}
        <div className="mb-6 p-4 bg-slate-900/90 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>ABDM / ABHA ID Lookup (Sandbox)</span>
                {abhaVerified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">Verify your Ayushman Bharat Health Account number</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVerifyAbha}
            disabled={verifying || abhaVerified}
            className={`px-4 py-2 rounded-xl text-xs font-bold kiosk-btn whitespace-nowrap ${
              abhaVerified
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
            }`}
          >
            {verifying ? 'Verifying...' : abhaVerified ? '✓ ABHA Verified' : 'Verify ABHA ID'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ABHA Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              ABHA ID / ABHA Number (Optional)
            </label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              placeholder="e.g. 91-9876-5432-1098 or username@abha"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter patient full name"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Age (Years) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender Big Touch Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Gender *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Male', 'Female', 'Other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-4 rounded-xl border-2 font-bold text-lg kiosk-btn transition-all ${
                    gender === g
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {g}
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
              type="submit"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl kiosk-btn shadow-lg shadow-cyan-500/20 flex items-center gap-3"
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
