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
    <div className="max-w-3xl mx-auto px-4 py-8 text-center animate-fade-in">
      <div className="kiosk-card">

        {/* RED FLAG TRIAGE BANNER */}
        {hasRedFlags ? (
          <div className="p-6 bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl mb-8 animate-pulse text-left shadow-2xl shadow-rose-600/30">
            <div className="flex items-center gap-3 mb-3 text-rose-400 font-black text-xl">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <span>RED FLAG EMERGENCY TRIAGE ALERT DETECTED</span>
            </div>
            
            <p className="text-sm text-rose-200 mb-4 font-semibold">
              Potential urgent symptoms identified. Immediate triage notification has been dispatched to hospital staff.
            </p>

            <div className="p-4 bg-slate-950/90 rounded-xl border border-rose-500/40 text-xs text-rose-300 font-mono space-y-1">
              <div><strong>ALERT CODE:</strong> RF_CARDIAC_ACUTE / CRITICAL</div>
              <div><strong>SYMPTOMS:</strong> Acute chest discomfort + Dyspnea on exertion</div>
              <div><strong>ACTION:</strong> STAT ECG & Triage Assessment by ER Doctor</div>
              <div className="mt-2 text-rose-400 font-sans italic">
                * Note: This is an automated AI safety alert and requires immediate clinical assessment.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-fit mx-auto mb-6 text-emerald-400">
            <CheckCircle className="w-16 h-16" />
          </div>
        )}

        <h2 className="text-4xl font-black text-white mb-2">CLINICAL INTAKE COMPLETE</h2>
        <p className="text-slate-300 text-lg mb-8">
          Your clinical history & uploaded documents have been sent to the doctor dashboard.
        </p>

        {/* Token Card */}
        <div className="p-8 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-3xl border-2 border-cyan-500/50 shadow-2xl max-w-md mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2">
            Your Token Number
          </span>
          <div className="text-6xl font-black tracking-tight text-white mb-4 text-cyan-300">
            {tokenNumber || 'T-108'}
          </div>

          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-center gap-2 text-slate-300 font-medium">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            <span>Assigned Room: <strong>OPD Room 204 (Dr. R. Sundaram)</strong></span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetKiosk}
          className="py-4 px-8 bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold rounded-2xl kiosk-btn flex items-center justify-center gap-3 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Complete Session & Reset Kiosk</span>
        </button>

      </div>
    </div>
  );
};
