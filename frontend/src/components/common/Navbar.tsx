import React from 'react';
import { Activity, ShieldAlert, UserCheck, Settings, Stethoscope } from 'lucide-react';
import { Language } from '../../types';

interface NavbarProps {
  currentTab: 'kiosk' | 'doctor' | 'admin';
  onSelectTab: (tab: 'kiosk' | 'doctor' | 'admin') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('kiosk')}>
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Medi<span className="text-cyan-400">Kiosk</span></h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">AI Clinical Intake</span>
            </div>
            <p className="text-xs text-slate-400">AI-Powered Hospital Self-Service Intake & Document Intelligence</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => onSelectTab('kiosk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              currentTab === 'kiosk'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Patient Kiosk
          </button>
          
          <button
            onClick={() => onSelectTab('doctor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              currentTab === 'doctor'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Doctor Dashboard
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              currentTab === 'admin'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin Portal
          </button>
        </nav>

        {/* Language Selection Quick Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline">Language:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                language === 'ta' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                language === 'hi' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
