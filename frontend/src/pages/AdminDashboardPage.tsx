import React, { useState, useEffect } from 'react';
import { AdminStatsOverview } from '../components/admin/AdminStatsOverview';
import { AISettingsForm } from '../components/admin/AISettingsForm';
import { AuditLogsTable } from '../components/admin/AuditLogsTable';
import { getAdminStatsApi } from '../services/api';
import { DashboardStats } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAdminStatsApi();
        setStats(res);
      } catch (err) {
        console.warn('Load admin stats note:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-850">Hospital Administration & System Portal</h2>
          <p className="text-sm text-slate-500 font-semibold">Manage local Ollama model parameters, AYUSH history mode, and audit logs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsOverview stats={stats} />

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === 'settings'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-605 hover:text-slate-800 hover:bg-slate-100'
            }`}
        >
          AI & System Settings
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeTab === 'audit'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-605 hover:text-slate-800 hover:bg-slate-100'
            }`}
        >
          System Audit Logs
        </button>
      </div>

      {activeTab === 'settings' && <AISettingsForm />}
      {activeTab === 'audit' && <AuditLogsTable />}

    </div>
  );
};
