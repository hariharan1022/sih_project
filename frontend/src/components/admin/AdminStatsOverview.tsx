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
      iconBg: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      title: 'Pending Doctor Reviews',
      value: stats?.pending_reviews || 3,
      icon: FileText,
      iconBg: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      title: 'Verified Clinical Histories',
      value: stats?.completed_histories || 9,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Critical Red Flag Triage Alerts',
      value: stats?.red_flag_alerts || 1,
      icon: ShieldAlert,
      iconBg: 'bg-rose-50',
      textColor: 'text-rose-600'
    },
    {
      title: 'Medical Documents OCR Processed',
      value: stats?.documents_processed || 15,
      icon: Cpu,
      iconBg: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{c.title}</span>
              <div className={`p-2.5 rounded-xl ${c.iconBg} ${c.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
};
