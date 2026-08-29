import React, { useState, useEffect } from 'react';
import { PatientKioskPage } from './pages/PatientKioskPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Language, User } from './types';
import { setAuthToken, loginApi, getMeApi } from './services/api';
import {
  Activity,
  UserCheck,
  Stethoscope,
  Settings,
  Lock,
  Mail,
  ArrowLeft,
  LogOut,
  AlertCircle,
  ShieldAlert,
  Shield,
  Sun,
  Moon,
  Info,
  Check,
  ArrowRight,
  Cpu,
  Users,
  Server,
  Globe
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'kiosk' | 'doctor-login' | 'admin-login' | 'doctor' | 'admin'>('landing');
  const [language, setLanguage] = useState<Language>('ta');
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('medikiosk_theme') === 'dark');

  // Sync dark class on raw document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('medikiosk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('medikiosk_theme', 'light');
    }
  }, [darkMode]);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('medikiosk_token');
      if (savedToken) {
        setAuthToken(savedToken);
        try {
          const userData = await getMeApi();
          setUser(userData);
          if (userData.role === 'DOCTOR') {
            setCurrentTab('doctor');
          } else if (userData.role === 'ADMIN') {
            setCurrentTab('admin');
          }
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          handleLogout();
        }
      }
    };
    initAuth();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent, roleTarget: 'DOCTOR' | 'ADMIN') => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi(username, password);
      // Validate role
      if (res.user.role !== roleTarget && !(roleTarget === 'DOCTOR' && res.user.role === 'TRIAGE_STAFF')) {
        setErrorMsg(`Unauthorized: Logged-in user is not configured as an ${roleTarget.toLowerCase()}.`);
        setLoading(false);
        return;
      }

      setUser(res.user);
      setAuthToken(res.access_token);

      if (rememberMe) {
        localStorage.setItem('medikiosk_token', res.access_token);
      }

      setCurrentTab(roleTarget === 'DOCTOR' ? 'doctor' : 'admin');

      // Reset form
      setUsername('');
      setPassword('');
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('medikiosk_token');
    setCurrentTab('landing');
    setUsername('');
    setPassword('');
    setErrorMsg(null);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} flex flex-col font-sans selection:bg-cyan-600 selection:text-white transition-colors duration-300`}>

      {/* 1. Global Header Navigation (Dynamic depending on state) */}
      {currentTab === 'landing' ? (
        <header className="bg-white/80 dark:bg-slate-900/80 sticky top-0 z-50 backdrop-blur-md px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-950 dark:text-white tracking-tight">Medi<span className="text-cyan-600">Kiosk</span></span>
                  <span className="bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 border border-cyan-200/50 dark:border-cyan-800/40 rounded-full">
                    SIH Edition v1.1
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                How It Works
              </a>
              <button
                onClick={() => setCurrentTab('kiosk')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Open Kiosk
              </button>
              <button
                onClick={() => setCurrentTab('doctor-login')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Doctor Portal
              </button>
              <button
                onClick={() => setCurrentTab('admin-login')}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Admin Panel
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
                title="Toggle color theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCurrentTab('kiosk')}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                OPEN PATIENT KIOSK
              </button>
            </div>
          </div>
        </header>
      ) : (
        (currentTab === 'doctor' || currentTab === 'admin') && (
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-6 py-4 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-950 dark:text-white">
                      Medi<span className="text-cyan-600">Kiosk</span> Portal
                    </h1>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${currentTab === 'doctor'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 border-purple-200 dark:border-purple-900/60'
                      }`}>
                      {currentTab === 'doctor' ? 'Clinical Workspace' : 'System Administration'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Authenticated Session</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
                  title="Toggle color theme"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="text-right hidden md:block">
                  <p className="text-sm font-black text-slate-850 dark:text-slate-205">{user?.full_name || 'Medical Professional'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">{user?.role} Access</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-655 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </header>
        )
      )}

      {/* Main Flow Router */}
      <main className="flex-1 flex flex-col">

        {/* 1. Portal Landing Screen (Launcher) */}
        {currentTab === 'landing' && (
          <div className="flex-1 flex flex-col w-full animate-fade-in animate-duration-300">

            {/* HERO SECTION */}
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Column: Taglines & Details */}
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 dark:bg-cyan-950 text-cyan-650 dark:text-cyan-400 rounded-full border border-cyan-200/50 dark:border-cyan-800 text-[11px] font-bold">
                  <Cpu className="w-3.5 h-3.5" /> SIH 26 AWARD WINNING DESIGN
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  “Tell Your Story.<br />
                  <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-605 bg-clip-text text-transparent">Let AI Structure It.</span><br />
                  Help Doctors Decide.”
                </h1>

                <p className="text-base md:text-lg text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                  MediKiosk helps patients provide their medical history through voice, touch and multilingual interaction while AI converts the information into a structured clinical history for doctor review.
                </p>

                {/* Primary Actions panel */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setCurrentTab('kiosk')}
                    className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
                  >
                    OPEN PATIENT KIOSK
                  </button>

                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setCurrentTab('doctor-login');
                    }}
                    className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-2xl text-sm font-black transition-all shadow-sm cursor-pointer"
                  >
                    DOCTOR LOGIN
                  </button>

                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setCurrentTab('admin-login');
                    }}
                    className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-2xl text-sm font-black transition-all shadow-sm cursor-pointer"
                  >
                    ADMIN LOGIN
                  </button>

                  <a
                    href="#how-it-works"
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black transition-all inline-flex items-center gap-1.5 shadow-xs"
                  >
                    HOW IT WORKS
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-3">Enterprise Trust Indicators</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      'Multilingual (Tamil/Hindi)',
                      'Voice Enabled',
                      'AI Assisted',
                      'OCR Powered',
                      'Doctor Verified',
                      'Secure Clinical Records'
                    ].map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-655 dark:text-slate-300 font-bold">
                        <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Premium Interactive Panel */}
              <div className="relative p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"></div>

                {/* Simulated Header block */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-650 dark:text-cyan-400 text-[10px] font-bold border border-cyan-100 dark:border-cyan-900 rounded font-mono">
                    LIVE_INTEGRATION_ONLINE
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500">Current Session Token</div>
                      <div className="text-sm font-black text-slate-800 dark:text-white">T-108 <span className="text-xs font-normal text-slate-400 dark:text-slate-550">(Cardiology Dept)</span></div>
                    </div>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>

                  {/* Audio Transcription Simulator */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                        Voice Audio Capture (Tamil/English/Hindi)
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">00:08</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-655 dark:text-slate-300 italic">
                      "I have had high fever since yesterday and chest pains when breathing..."
                    </p>
                    {/* Simulated Voice wave lines */}
                    <div className="flex items-center gap-1 pt-1 justify-start">
                      <div className="bg-cyan-500 h-3 w-1 rounded-full animate-pulse"></div>
                      <div className="bg-cyan-600 h-6 w-1 rounded-full animate-pulse text-[0px]">.</div>
                      <div className="bg-blue-500 h-4 w-1 rounded-full animate-pulse text-[0px]">.</div>
                      <div className="bg-blue-600 h-8 w-1 rounded-full animate-pulse text-[0px]">.</div>
                      <div className="bg-cyan-500 h-5 w-1 rounded-full animate-pulse text-[0px]">.</div>
                      <div className="bg-indigo-650 h-7 w-1 rounded-full animate-pulse text-[0px]">.</div>
                      <div className="bg-indigo-500 h-3 w-1 rounded-full animate-pulse text-[0px]">.</div>
                    </div>
                  </div>

                  {/* AI Structured Outputs Simulator */}
                  <div className="p-4 bg-cyan-50/20 dark:bg-cyan-950/40 rounded-xl border border-cyan-100 dark:border-cyan-900/60 space-y-2">
                    <div className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> AI Real-time Structuring Engine
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                      <div className="p-2 bg-white/70 dark:bg-slate-900/80 rounded border border-cyan-200/50 dark:border-cyan-800">
                        <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase">Complaint</span>
                        <span className="text-slate-800 dark:text-slate-200">Chest Pain & Pyrexia</span>
                      </div>
                      <div className="p-2 bg-white/70 dark:bg-slate-900/80 rounded border border-cyan-200/50 dark:border-cyan-800">
                        <span className="text-slate-450 dark:text-slate-505 block text-[9px] uppercase">Triage Red Flag</span>
                        <span className="text-rose-650 font-extrabold flex items-center gap-1">Yes (Chest Pain)</span>
                      </div>
                    </div>
                  </div>

                  {/* OCR Extraction Preview Simulator */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500">Document Digitization Extraction (OCR)</div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-800 pt-2 text-slate-655 dark:text-slate-355 font-mono">
                      <span>lab_report.pdf</span>
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        HbA1c: 7.2%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FEATURES SECTION */}
            <div className="w-full bg-slate-100/50 dark:bg-slate-900/40 border-t border-b border-slate-200/50 dark:border-slate-800/80 py-16">
              <div className="max-w-7xl mx-auto px-6 w-full space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Multi-portal Professional Suite</h2>
                  <p className="text-slate-550 dark:text-slate-400 text-sm max-w-lg mx-auto font-semibold">
                    Each portal is engineered precisely with hospital workflows and security controls in mind.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Patient Card */}
                  <div
                    onClick={() => setCurrentTab('kiosk')}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                        <UserCheck className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-850 dark:text-white">Patient Intake Kiosk</h3>
                      <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                        A dedicated full-screen self-service medical questionnaire terminal. Fits large-scale hospital touchscreens. Supports multilingual voice dialog prompts, identity check, and HIPAA compliance data collection pathways.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600">
                      <span>OPEN PATIENT KIOSK</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Doctor Card */}
                  <div
                    onClick={() => {
                      setErrorMsg(null);
                      setCurrentTab('doctor-login');
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-850 dark:text-white">Attending Doctor Portal</h3>
                      <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                        Outpatient triaging list with real-time severity tag markers. View structured summaries side-by-side with original scanned medical reports and parsed database details. Write, edit, and approve records under ABDM compliance.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>PROCEED TO SIGN-IN</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Admin Card */}
                  <div
                    onClick={() => {
                      setErrorMsg(null);
                      setCurrentTab('admin-login');
                    }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-purple-500/50 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 text-purple-650 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                        <Settings className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-850 dark:text-white">System Administrator Console</h3>
                      <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                        A power desk for medical informatics staff. Monitor kiosk system health indexes, select active LLM models, toggles AYUSH metrics collection parameters, and investigate secure, immutable administrative audit log tables.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600">
                      <span>ADMIN CONSOLE</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 w-full space-y-12">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-600">Dynamic Workflow Pipeline</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">How MediKiosk Works</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto font-semibold">
                  A high-contrast chronological demonstration of the ingestion, AI extraction, and verification stack.
                </p>
              </div>

              {/* Step Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {[
                  { num: '01', title: 'Patient Registration', desc: 'Patient enters name, age, mobile, or authenticates using local credentials/ABHA.' },
                  { num: '02', title: 'Language Selector', desc: 'Attunes prompt dialog translation and speech-to-text models instantly.' },
                  { num: '03', title: 'Voice & Touch Intake', desc: 'Patient speaks complaints in native vernacular; system prints transcripts.' },
                  { num: '04', title: 'AI Structuring Engine', desc: 'Clinical LLMs parse transcripts into HPI, past history, and red-flags.' },
                  { num: '05', title: 'Clinical History Form', desc: 'Review organized segments details: Chief complaints, allergies, medications.' },
                  { num: '06', title: 'Document Digitization', desc: 'Upload previous files which undergo OCR key-value data point extraction.' },
                  { num: '07', title: 'Attending Doctor Review', desc: 'Clincian inspects clinical timeline and reviews prefilled structured history.' },
                  { num: '08', title: 'Approved Record', desc: 'Doctor clicks verify, saving the clinical bundle into standard FHIR compliance format.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative shadow-xs hover:shadow transition-shadow">
                    <span className="text-3xl font-black text-cyan-600/20 dark:text-cyan-400/10 block mb-2">{item.num}</span>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo credentials banner */}
            <div className="max-w-lg mx-auto px-6 pb-20 text-slate-500 dark:text-slate-400 text-xs flex flex-wrap items-center justify-center gap-4 text-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">Default Demo accounts:</span>
              <span>Attending Doctor: <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-cyan-600 font-mono font-bold">dr_sundaram</code> / <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-cyan-600 font-mono font-bold">doctor123</code></span>
              <span>Systems Admin: <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-purple-600 font-mono font-bold">admin</code> / <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-purple-600 font-mono font-bold">admin123</code></span>
            </div>

          </div>
        )}

        {/* 2. Doctor Login Screen */}
        {currentTab === 'doctor-login' && (
          <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto px-6 py-12 w-full animate-fade-in">
            <button
              onClick={() => setCurrentTab('landing')}
              className="self-start flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 mb-6 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Landing
            </button>

            <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Stethoscope className="w-32 h-32 text-blue-500" />
              </div>

              <h2 className="text-3xl font-black text-slate-850 dark:text-white">Doctor Portal Login</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Enter details to access outpatient intake dashboard</p>

              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-2 text-xs font-semibold mb-6 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLoginSubmit(e, 'DOCTOR')} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Doctor ID / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="dr_sundaram"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-600 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-500 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-blue-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 h-4 w-4"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-blue-600 dark:text-blue-450 hover:text-blue-500 font-bold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-sm font-black transition-all kiosk-btn shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Authenticating Clinician...' : 'LOGIN'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. Admin Login Screen */}
        {currentTab === 'admin-login' && (
          <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto px-6 py-12 w-full animate-fade-in">
            <button
              onClick={() => setCurrentTab('landing')}
              className="self-start flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 mb-6 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Landing
            </button>

            <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Settings className="w-32 h-32 text-purple-500" />
              </div>

              <h2 className="text-3xl font-black text-slate-850 dark:text-white">System Admin Login</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Enter credentials to access configuration engine</p>

              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 rounded-2xl flex items-start gap-2 text-xs font-semibold mb-6 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLoginSubmit(e, 'ADMIN')} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Admin Username / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-650 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-650 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-550 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-purple-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 h-4 w-4"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-sm font-black transition-all kiosk-btn shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Verifying Admin...' : 'LOGIN'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Patient Kiosk Experience */}
        {currentTab === 'kiosk' && (
          <div className="relative flex-1 flex flex-col animate-fade-in animate-duration-300">
            <button
              onClick={() => setCurrentTab('landing')}
              className="absolute left-6 top-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm inline-flex items-center gap-1.5 z-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Launch
            </button>
            <PatientKioskPage
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        )}

        {/* 5. Doctor Dashboard Experience (Role Protected) */}
        {currentTab === 'doctor' && user?.role === 'DOCTOR' && (
          <div className="animate-fade-in animate-duration-300 flex-1">
            <DoctorDashboardPage />
          </div>
        )}

        {/* 6. Admin Panel Experience (Role Protected) */}
        {currentTab === 'admin' && user?.role === 'ADMIN' && (
          <div className="animate-fade-in animate-duration-300 flex-1">
            <AdminDashboardPage />
          </div>
        )}

      </main>

      {/* Hospital Safety Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs transition-colors">
        <div>
          MediKiosk Clinical Intake & Medical Document Intelligence System v1.1
        </div>
        <div className="text-amber-700 dark:text-amber-500 font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
          Notice: AI-generated clinical findings are summaries that require validation by the attending doctor.
        </div>
      </footer>

      {/* Forgot Password Demo Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-8 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-slate-850 dark:text-white">Reset Password</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              MediKiosk utilizes hospital-managed credential systems. For password recovery or account troubleshooting, please reach out directly to the <span className="font-bold text-purple-650">Hospital IT Department</span>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
