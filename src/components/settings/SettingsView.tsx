import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { VitalRecord } from '../../types/vital';
import { CsvImporter } from '../migration/CsvImporter';
import { downloadVitalsCsv } from '../../services/vitalService';
import { 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Database, 
  Smartphone, 
  FileSpreadsheet, 
  Key, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  records: VitalRecord[];
  onRefreshRecords?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ records, onRefreshRecords }) => {
  const { user, signInWithGoogle, signOut, saveCustomApiKey } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    saveCustomApiKey(apiKeyInput.trim(), appIdInput.trim() || undefined);
    setKeySaved(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Account Profile Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
          Account & Authentication
        </h3>

        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-11 h-11 rounded-full object-cover border border-emerald-500/40"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-100">{user.displayName || 'Signed In'}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Secure Google Sign-In
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="bg-slate-900 hover:bg-slate-700 text-rose-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Sign in with your Google Account to automatically sync your vital signs to Firebase Cloud across your phone and desktop.
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* CSV Migration Tool */}
      {user && (
        <CsvImporter
          userId={user.uid}
          onImportComplete={() => {
            if (onRefreshRecords) onRefreshRecords();
          }}
        />
      )}

      {/* Export & Data Backup */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          Data Backup & Doctor Export
        </h3>
        <p className="text-xs text-slate-400">
          Download your complete history as a standard CSV file anytime for your records or to email your physician.
        </p>
        <button
          onClick={() => downloadVitalsCsv(records)}
          disabled={records.length === 0}
          className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export All {records.length} Records to CSV</span>
        </button>
      </div>

      {/* Firebase Cloud Connection Status */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            Firebase Connection
          </h3>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Connected
          </span>
        </div>

        <div className="space-y-1.5 text-slate-400 bg-slate-900/60 p-2.5 rounded-xl font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Project:</span>
            <span className="text-slate-200">vital-signs-33d2e</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database:</span>
            <span className="text-slate-200">Cloud Firestore</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Offline Cache:</span>
            <span className="text-emerald-400">IndexedDB Persistence Active</span>
          </div>
        </div>

        {!showKeyForm ? (
          <button
            onClick={() => setShowKeyForm(true)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 pt-1"
          >
            <Key className="w-3 h-3" /> Update Firebase Web API Key manually
          </button>
        ) : (
          <form onSubmit={handleSaveKeys} className="space-y-2 pt-2 border-t border-slate-700/60">
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">Firebase API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-0.5">App ID (optional)</label>
              <input
                type="text"
                placeholder="1:123456789:web:abcdef..."
                value={appIdInput}
                onChange={e => setAppIdInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowKeyForm(false)}
                className="flex-1 py-1.5 rounded-xl border border-slate-700 text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
              >
                Save & Reload
              </button>
            </div>
          </form>
        )}

        {keySaved && (
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> API Key saved locally!
          </div>
        )}
      </div>

      {/* PWA Smartphone Installation Guide */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm space-y-2.5 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          Install on Smartphone
        </h3>
        <p className="text-slate-400">
          This app is a Progressive Web App (PWA) designed to run full-screen without browser address bars:
        </p>

        <div className="grid grid-cols-1 gap-2 text-[11px]">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
            <div className="font-semibold text-slate-200 mb-0.5">📱 Apple iPhone (Safari):</div>
            <div className="text-slate-400">
              Tap the <strong className="text-slate-300">Share icon</strong> at the bottom of Safari, then scroll down and tap <strong className="text-emerald-400">Add to Home Screen</strong>.
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
            <div className="font-semibold text-slate-200 mb-0.5">🤖 Android Phone (Chrome):</div>
            <div className="text-slate-400">
              Tap the <strong className="text-slate-300">Three Dots Menu (⋮)</strong> in Chrome, then tap <strong className="text-emerald-400">Install app</strong> or <strong className="text-emerald-400">Add to Home Screen</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
