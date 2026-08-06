import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Database,
  Youtube,
  Music,
  Github,
  Layers,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from '../lib/firebase';
import { setGoogleAccessToken } from '../lib/googleTasksService';

interface HeaderProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onOpenTasksModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, setUser, onOpenTasksModal }) => {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Fallback to anonymous sign-in if popup blocked or configured differently
      try {
        await signInAnonymously(auth);
      } catch (anonErr) {
        console.error('Anonymous Auth error:', anonErr);
      }
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Anonymous sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Layers className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                PromptCraft Sonic Blueprint
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                V2.0 Core
              </span>
            </div>
            <p className="text-xs text-slate-400">
              4-Pillar Suno AI Music Prompt Engine & Song Metadata Generator
            </p>
          </div>
        </div>

        {/* System Health & Firebase Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>4-Pillar Engine</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-cyan-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guardrails Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 font-medium">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Firestore Sync</span>
          </div>

          <button
            onClick={onOpenTasksModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-300 font-medium transition-all"
            title="Manage Google Tasks"
          >
            <ListTodo className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Tasks</span>
          </button>
        </div>

        {/* Authentication & Social Links */}
        <div className="flex items-center gap-3">
          {/* Firebase User Bar */}
          {authLoading ? (
            <div className="h-8 w-24 bg-slate-800/60 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-[10px] text-indigo-200 font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'A'}
                  </div>
                )}
                <span className="text-slate-200 font-medium max-w-[120px] truncate">
                  {user.displayName || user.email || 'Guest User'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Synced
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-1 text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-medium shadow-md transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (Sync)</span>
              </button>
              <button
                onClick={handleAnonymousSignIn}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                title="Guest Mode"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Guest</span>
              </button>
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <a
              href="https://youtube.com/@PRODROCK99"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
              title="YouTube @PRODROCK99"
            >
              <Youtube className="w-4 h-4" />
            </a>

            <a
              href="https://suno.com/@arcprompt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors"
              title="Suno @arcprompt"
            >
              <Music className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/mutiagent-base/promptcraft-sonic-blueprint"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
