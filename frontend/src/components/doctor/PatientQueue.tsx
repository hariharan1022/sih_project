import React from 'react';
import { UserCheck, ShieldAlert, Clock, Stethoscope, CheckCircle2, ArrowRight, FileText, RefreshCw, Radio } from 'lucide-react';
import { KioskSession } from '../../types';

interface PatientQueueProps {
  queue: KioskSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  redFlagsOnly: boolean;
  onToggleRedFlagsOnly: (flag: boolean) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const PatientQueue: React.FC<PatientQueueProps> = ({
  queue,
  selectedSessionId,
  onSelectSession,
  redFlagsOnly,
  onToggleRedFlagsOnly,
  isRefreshing = false,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-205 overflow-hidden shadow-xl select-none">

      {/* Header & Filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-black text-slate-850">Outpatient Clinical Intake Queue</h3>
          <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-705 text-xs font-black rounded-full border border-cyan-200">
            {queue.length} Patients
          </span>
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE QUEUE</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh queue data in real-time"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
            </button>
          )}

          <button
            onClick={() => onToggleRedFlagsOnly(!redFlagsOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${redFlagsOnly
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50/50 hover:border-rose-300 shadow-xs'
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
            <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
              <th className="p-3.5">Token</th>
              <th className="p-3.5">Patient Details</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Triage Alert</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
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
                    className={`cursor-pointer transition-colors ${isSelected
                        ? 'bg-cyan-50/30 border-l-4 border-cyan-600'
                        : 'hover:bg-slate-50/40'
                      }`}
                  >
                    <td className="p-3.5 font-black text-cyan-800 text-base">{s.token_number}</td>
                    <td className="p-3.5">
                      <div className="font-black text-slate-850">{s.patient?.full_name || 'Demo Patient'}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">
                        {s.patient?.age || 45}Y / {s.patient?.gender || 'Male'} | MRN: {s.patient?.mrn || 'MRN-89412'}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 text-xs font-semibold">{s.department}</td>
                    <td className="p-3.5">
                      {s.has_red_flags ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit animate-pulse-slow">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>CRITICAL RED FLAG</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold">Normal</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${s.status === 'VERIFIED_BY_DOCTOR'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : s.status === 'TRIAGED_RED_FLAG'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                            : 'bg-amber-50 text-amber-700 border-amber-200/60'
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
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-705 text-white font-black text-xs rounded-lg flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
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
