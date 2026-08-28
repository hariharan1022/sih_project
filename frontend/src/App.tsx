import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { PatientKioskPage } from './pages/PatientKioskPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Language } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'kiosk' | 'doctor' | 'admin'>('kiosk');
  const [language, setLanguage] = useState<Language>('ta');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Universal Top Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'kiosk' && (
          <PatientKioskPage
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {currentTab === 'doctor' && (
          <DoctorDashboardPage />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* Hospital Safety Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          MediKiosk Clinical Intake & Medical Document Intelligence System v1.0
        </div>
        <div className="text-amber-400/90 font-medium">
          Notice: AI-generated information must be reviewed and verified by a qualified healthcare professional.
        </div>
      </footer>

    </div>
  );
}

export default App;
