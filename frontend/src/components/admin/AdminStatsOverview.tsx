import React from 'react';
import { Users, FileText, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { DashboardStats } from '../../types';

interface AdminStatsOverviewProps {
  stats: DashboardStats | null;
}

export const AdminStatsOverview: React.FC<AdminStatsOverviewProps> = ({ stats }) => {
  const cards = [
    {
      title: "Today's Patient Sessions",
      value: stats?.todays_patients || 12,
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Pending Doctor Reviews',
      value: stats?.pending_reviews || 3,
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400'
    },
    {
      title: 'Verified Clinical Histories',
      value: stats?.completed_histories || 9,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Critical Red Flag Triage Alerts',
      value: stats?.red_flag_alerts || 1,
      icon: ShieldAlert,
      color: 'from-rose-600 to-red-700',
      textColor: 'text-rose-400'
    },
    {
      title: 'Medical Documents OCR Processed',
      value: stats?.documents_processed || 15,
      icon: Cpu,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.title}</span>
              <div className={`p-2.5 rounded-xl bg-slate-800 ${c.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
};
