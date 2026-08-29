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
  ShieldAlert
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'kiosk' | 'doctor-login' | 'admin-login' | 'doctor' | 'admin'>('landing');
  const [language, setLanguage] = useState<Language>('ta');
  const [user, setUser] = useState<User | null>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">

      {/* Dynamic Role-Based Top Nav (Only visible for Doctor & Admin Dashboards) */}
      {(currentTab === 'doctor' || currentTab === 'admin') && (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">
                    Medi<span className="text-cyan-400">Kiosk</span> Portal
                  </h1>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${currentTab === 'doctor'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}>
                    {currentTab === 'doctor' ? 'Clinical Workspace' : 'System Administration'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Authenticated Session</p>
              </div>
            </div>

            {/* User Session status & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{user?.full_name || 'Medical Professional'}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{user?.role} Portal</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

          </div>
        </header>
      )}

      {/* Main Flow Router */}
      <main className="flex-1 flex flex-col">

        {/* 1. Portal Landing Screen (Launcher) */}
        {currentTab === 'landing' && (
          <div className="flex-1 flex flex-col justify-center items-center max-w-6xl mx-auto px-6 py-12 w-full animate-fade-in">
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-3xl text-cyan-400 shadow-xl shadow-cyan-500/5 mb-2 hover:scale-105 transition-transform">
                <Activity className="w-16 h-16 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                Medi<span className="text-cyan-400">Kiosk</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                AI-Powered Multilingual Clinical History & Medical Document Digitization Platform
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
            </div>

            {/* Launchers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

              {/* Patient Card */}
              <div
                onClick={() => setCurrentTab('kiosk')}
                className="bg-slate-900/80 border-2 border-slate-800 hover:border-cyan-500/70 p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl glass-panel group flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">Patient Kiosk</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Complete your medical history before consulting the doctor. Supports Tamil voice conversation, touch buttons, and document scanning.
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Open Terminal</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-cyan-500 transition-colors font-bold">→</div>
                </div>
              </div>

              {/* Doctor Card */}
              <div
                onClick={() => {
                  setErrorMsg(null);
                  setCurrentTab('doctor-login');
                }}
                className="bg-slate-900/80 border-2 border-slate-800 hover:border-blue-500/70 p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl glass-panel group flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">Doctor Portal</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      View waiting list, review AI-generated structured histories, investigate clinical timelines, write notes, and approve intake files.
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Sign In</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-blue-500 transition-colors font-bold">→</div>
                </div>
              </div>

              {/* Admin Card */}
              <div
                onClick={() => {
                  setErrorMsg(null);
                  setCurrentTab('admin-login');
                }}
                className="bg-slate-900/80 border-2 border-slate-800 hover:border-purple-500/70 p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-xl glass-panel group flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <Settings className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">Admin Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Configure system properties, toggle Ayurvedic intake mode, audit clinical records, and verify kiosk status parameters.
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">System Control</span>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-purple-500 transition-colors font-bold">→</div>
                </div>
              </div>

            </div>

            <div className="mt-12 text-slate-500 text-xs flex flex-wrap items-center justify-center gap-4 text-center max-w-lg">
              <span className="font-semibold text-slate-400">Demo Credentials:</span>
              <span>Doctor: <code className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-cyan-300">dr_sundaram</code> / <code className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-cyan-300">doctor123</code></span>
              <span>Admin: <code className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-cyan-300">admin</code> / <code className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-cyan-300">admin123</code></span>
            </div>
          </div>
        )}

        {/* 2. Doctor Login Screen */}
        {currentTab === 'doctor-login' && (
          <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto px-6 py-12 w-full animate-fade-in">
            <button
              onClick={() => setCurrentTab('landing')}
              className="self-start flex items-center gap-2 text-sm text-slate-400 hover:text-slate-205 mb-6 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Landing
            </button>

            <div className="w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Stethoscope className="w-32 h-32 text-blue-500" />
              </div>

              <h2 className="text-3xl font-black text-white">Doctor Portal Login</h2>
              <p className="text-sm text-slate-400 mt-1 mb-6">Enter details to access outpatient intake dashboard</p>

              {errorMsg && (
                <div className="p-4 bg-red-950/60 border border-red-800/80 text-red-300 rounded-2xl flex items-start gap-2 text-xs font-semibold mb-6 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLoginSubmit(e, 'DOCTOR')} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Doctor ID / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. dr_sundaram"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-505 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-blue-505 rounded border-slate-800 bg-slate-950 h-4 w-4"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-sm font-black transition-all kiosk-btn shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
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
              className="self-start flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Landing
            </button>

            <div className="w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Settings className="w-32 h-32 text-purple-500" />
              </div>

              <h2 className="text-3xl font-black text-white">System Admin Login</h2>
              <p className="text-sm text-slate-400 mt-1 mb-6">Enter credentials to access configuration engine</p>

              {errorMsg && (
                <div className="p-4 bg-red-950/60 border border-red-800/80 text-red-300 rounded-2xl flex items-start gap-2 text-xs font-semibold mb-6 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={(e) => handleLoginSubmit(e, 'ADMIN')} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Admin Username / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-purple-505 rounded border-slate-800 bg-slate-950 h-4 w-4"
                    />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-sm font-black transition-all kiosk-btn shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Verifying Admin...' : 'LOGIN'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Patient Kiosk Experience */}
        {currentTab === 'kiosk' && (
          <div className="relative flex-1 flex flex-col">
            <button
              onClick={() => setCurrentTab('landing')}
              className="absolute left-6 top-6 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer shadow-md inline-flex items-center gap-1.5 z-40"
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
          <DoctorDashboardPage />
        )}

        {/* 6. Admin Panel Experience (Role Protected) */}
        {currentTab === 'admin' && user?.role === 'ADMIN' && (
          <AdminDashboardPage />
        )}

      </main>

      {/* Hospital Safety Footer */}
      <footer className="bg-slate-905 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          MediKiosk Clinical Intake & Medical Document Intelligence System v1.0
        </div>
        <div className="text-amber-400 font-medium flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Notice: AI-generated clinical findings are mock summaries that require validation by the attending doctor.
        </div>
      </footer>

      {/* Forgot Password Demo Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-white">Reset Password</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              MediKiosk utilizes hospital-managed credential systems. For password recovery or account troubleshooting, please reach out directly to the <span className="font-bold text-purple-400">Hospital IT Department</span>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
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
