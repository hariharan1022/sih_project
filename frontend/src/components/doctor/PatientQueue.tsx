import React from 'react';
import { UserCheck, ShieldAlert, Clock, Stethoscope, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { KioskSession } from '../../types';

interface PatientQueueProps {
  queue: KioskSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  redFlagsOnly: boolean;
  onToggleRedFlagsOnly: (flag: boolean) => void;
}

export const PatientQueue: React.FC<PatientQueueProps> = ({
  queue,
  selectedSessionId,
  onSelectSession,
  redFlagsOnly,
  onToggleRedFlagsOnly
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      
      {/* Header & Filters */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Outpatient Clinical Intake Queue</h3>
          <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30">
            {queue.length} Patients
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleRedFlagsOnly(!redFlagsOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              redFlagsOnly
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 border border-slate-700 text-rose-300 hover:border-rose-500'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Red Flags Only</span>
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5">Token</th>
              <th className="p-3.5">Patient Details</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Triage Alert</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No patient sessions in queue matching filter.
                </td>
              </tr>
            ) : (
              queue.map((s) => {
                const isSelected = s.id === selectedSessionId;
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="p-3.5 font-black text-cyan-300 text-base">{s.token_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{s.patient?.full_name || 'Demo Patient'}</div>
                      <div className="text-xs text-slate-400">
                        {s.patient?.age || 45}Y / {s.patient?.gender || 'Male'} | MRN: {s.patient?.mrn || 'MRN-89412'}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300 text-xs font-medium">{s.department}</td>
                    <td className="p-3.5">
                      {s.has_red_flags ? (
                        <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-500/50 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>CRITICAL RED FLAG</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        s.status === 'VERIFIED_BY_DOCTOR'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : s.status === 'TRIAGED_RED_FLAG'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(s.id);
                        }}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 ml-auto"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
