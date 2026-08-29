import React from 'react';
import { CheckCircle, AlertTriangle, Stethoscope, RefreshCw, ShieldAlert, HeartPulse } from 'lucide-react';
import { Language } from '../../types';

interface SessionCompletedStepProps {
  tokenNumber: string;
  hasRedFlags: boolean;
  redFlagsList?: any[];
  language: Language;
  onResetKiosk: () => void;
}

export const SessionCompletedStep: React.FC<SessionCompletedStepProps> = ({
  tokenNumber,
  hasRedFlags,
  redFlagsList,
  language,
  onResetKiosk
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center animate-fade-in select-none">
      <div className="kiosk-card bg-white border border-slate-205 shadow-xl rounded-3xl p-8">

        {/* RED FLAG TRIAGE BANNER */}
        {hasRedFlags ? (
          <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl mb-8 animate-pulse text-left shadow-md shadow-rose-500/5">
            <div className="flex items-center gap-3 mb-3 text-rose-700 font-black text-xl">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <span>RED FLAG EMERGENCY TRIAGE ALERT DETECTED</span>
            </div>

            <p className="text-sm text-rose-800 mb-4 font-semibold">
              Potential urgent symptoms identified. Immediate triage notification has been dispatched to hospital staff.
            </p>

            <div className="p-4 bg-rose-100/50 rounded-xl border border-rose-250 text-xs text-rose-900 font-semibold font-mono space-y-1">
              <div><strong>ALERT CODE:</strong> RF_CARDIAC_ACUTE / CRITICAL</div>
              <div><strong>SYMPTOMS:</strong> Acute chest discomfort + Dyspnea on exertion</div>
              <div><strong>ACTION:</strong> STAT ECG & Triage Assessment by ER Doctor</div>
              <div className="mt-2 text-rose-700 font-sans italic">
                * Note: This is an automated AI safety alert and requires immediate clinical assessment.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-full w-fit mx-auto mb-6 text-emerald-600 shadow-xs">
            <CheckCircle className="w-16 h-16" />
          </div>
        )}

        <h2 className="text-3xl font-black text-slate-850 mb-2">CLINICAL INTAKE COMPLETE</h2>
        <p className="text-slate-500 text-lg mb-8 font-medium">
          Your clinical history & uploaded documents have been sent to the doctor dashboard.
        </p>

        {/* Token Card */}
        <div className="p-8 bg-gradient-to-tr from-cyan-50/50 to-slate-50 rounded-3xl border-2 border-cyan-200 shadow-md max-w-md mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 block mb-2">
            Your Token Number
          </span>
          <div className="text-6xl font-black tracking-tight text-cyan-800 mb-4">
            {tokenNumber || 'T-108'}
          </div>

          <div className="pt-4 border-t border-cyan-100 flex items-center justify-center gap-2 text-slate-700 font-semibold text-sm">
            <Stethoscope className="w-5 h-5 text-cyan-600" />
            <span>Assigned Room: <strong className="text-slate-850">OPD Room 204 (Dr. R. Sundaram)</strong></span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetKiosk}
          className="py-4 px-8 bg-slate-100 border border-slate-200 hover:border-cyan-300 text-slate-700 font-bold rounded-2xl kiosk-btn flex items-center justify-center gap-3 mx-auto cursor-pointer shadow-sm hover:bg-slate-200 transition-all duration-200"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Complete Session & Reset Kiosk</span>
        </button>

      </div>
    </div>
  );
};
