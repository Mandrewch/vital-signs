import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, signInWithGoogle, signOut, isConfigured } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 safe-top">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Vital Signs
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA
              </span>
            </h1>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              {isOnline ? (
                <span className="flex items-center text-emerald-400">
                  <Wifi className="w-3 h-3 mr-0.5" /> Synced
                </span>
              ) : (
                <span className="flex items-center text-amber-400">
                  <WifiOff className="w-3 h-3 mr-0.5" /> Offline Mode
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-800/80 rounded-full pl-1.5 pr-2.5 py-1 border border-slate-700/60">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
              <span className="text-xs font-medium text-slate-200 max-w-[80px] truncate">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
              <button 
                onClick={signOut}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isConfigured ? (
            <button
              onClick={signInWithGoogle}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
