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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Hospital Audit & Security Event Logs</h3>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search action or resource..."
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
          />
          <button
            onClick={loadLogs}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                      {l.actor_role}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{l.action}</td>
                  <td className="p-3 text-slate-300">{l.resource}</td>
                  <td className="p-3 text-slate-300 font-sans text-xs">{l.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
