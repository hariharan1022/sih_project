import React, { useState, useEffect } from 'react';
import { Shield, Clock, Search, RefreshCw } from 'lucide-react';
import { getAuditLogsApi } from '../../services/api';
import { AuditLog } from '../../types';

export const AuditLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogsApi();
      setLogs(data);
    } catch (err) {
      console.warn('Load audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(filter.toLowerCase()) ||
    l.resource.toLowerCase().includes(filter.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">

      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-black text-slate-850">Hospital Audit & Security Event Logs</h3>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search action or resource..."
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 shadow-xs"
          />
          <button
            onClick={loadLogs}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-605 hover:text-slate-850 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 font-black text-slate-600 uppercase tracking-wider">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono bg-white">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-sans font-semibold">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-500 font-semibold whitespace-nowrap font-sans">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded font-bold border border-cyan-100 text-[10px]">
                      {l.actor_role}
                    </span>
                  </td>
                  <td className="p-3 font-black text-slate-850">{l.action}</td>
                  <td className="p-3 text-slate-600 font-semibold">{l.resource}</td>
                  <td className="p-3 text-slate-600 font-semibold font-sans text-xs">{l.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
