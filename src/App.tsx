import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { DailyEntryForm } from './components/vitals/DailyEntryForm';
import { TrendsDashboard } from './components/trends/TrendsDashboard';
import { HistoryList } from './components/history/HistoryList';
import { SettingsView } from './components/settings/SettingsView';
import { VitalRecord } from './types/vital';
import { subscribeToVitals } from './services/vitalService';
import { Activity, LogIn, Sparkles, HeartPulse, ShieldCheck, Database } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, loading, signInWithGoogle, signInWithGoogleRedirect } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('log');
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [demoMode, setDemoMode] = useState(false);

  // Subscribe to Firestore records when user is authenticated
  useEffect(() => {
    if (!user) {
      if (demoMode) {
        // Load demo sample records if in demo preview mode
        const savedDemo = localStorage.getItem('demo_vital_records');
        if (savedDemo) {
          try {
            setRecords(JSON.parse(savedDemo));
          } catch (e) {
            console.error("Failed to parse demo records:", e);
          }
        }
      } else {
        setRecords([]);
      }
      return;
    }

    const unsubscribe = subscribeToVitals(
      user.uid,
      (updatedRecords) => {
        setRecords(updatedRecords);
      },
      (err) => {
        console.error("Firestore subscription error:", err);
      }
    );

    return () => unsubscribe();
  }, [user, demoMode]);

  // Loading initial auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <p className="mt-4 text-xs font-medium text-slate-400">Loading Vital Signs...</p>
      </div>
    );
  }

  // Not signed in & Not in demo mode: Show clean mobile onboarding / Sign In screen
  if (!user && !demoMode) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-6 max-w-md mx-auto safe-top safe-bottom">
        <div className="space-y-6 pt-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <HeartPulse className="w-9 h-9 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Vital Signs Monitor
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Your personal morning health log for Weight, Blood Pressure, Pulse Oximeter, and Temperature.
            </p>
          </div>

          {/* Key Features highlights */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fast 30-second morning routine on your phone</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Full offline support with auto-cloud sync to Firebase</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Private & secure Google Sign-In with Firestore rules</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-6 pb-4">
          <button
            onClick={signInWithGoogle}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>

          <button
            onClick={signInWithGoogleRedirect}
            className="w-full text-slate-400 hover:text-emerald-300 text-xs py-1 transition-colors flex items-center justify-center gap-1"
            title="Alternative sign-in method that bypasses browser popups"
          >
            <span>Having popup trouble? Sign In with Redirect</span>
          </button>

          <button
            onClick={() => setDemoMode(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            Explore App in Local Preview Mode
          </button>
        </div>
      </div>
    );
  }

  const effectiveUserId = user ? user.uid : 'demo-local-user';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header />

      {demoMode && !user && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <span>Preview Mode (Stored locally in browser).</span>
          <button 
            onClick={signInWithGoogle}
            className="underline font-bold text-amber-200 hover:text-white"
          >
            Sign In with Google
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-md mx-auto pt-2">
        {activeTab === 'log' && (
          <DailyEntryForm 
            userId={effectiveUserId} 
            allRecords={records} 
            onSaved={() => {}} 
          />
        )}

        {activeTab === 'trends' && (
          <TrendsDashboard records={records} />
        )}

        {activeTab === 'history' && (
          <HistoryList userId={effectiveUserId} records={records} />
        )}

        {activeTab === 'settings' && (
          <SettingsView records={records} onRefreshRecords={() => {}} />
        )}
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
