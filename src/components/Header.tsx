import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
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
  GraduationCap,
  Terminal,
  Headphones,
  Save,
  FolderOpen,
  Zap,
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

interface HeaderProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  currentBlueprintId?: string | null;
  savedSongsCount?: number;
  isSaving?: boolean;
  saveMessage?: string | null;
  onSaveToFirestore?: () => void;
  onOpenCloudModal?: () => void;
  onOpenTasksModal?: () => void;
  onOpenClassesModal?: () => void;
  onOpenQueryModal?: () => void;
  onOpenSupportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  setUser,
  currentBlueprintId,
  savedSongsCount = 0,
  isSaving = false,
  saveMessage,
  onSaveToFirestore,
  onOpenCloudModal,
  onOpenTasksModal,
  onOpenClassesModal,
  onOpenQueryModal,
  onOpenSupportModal,
}) => {
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
    <header className="border-b border-slate-800/90 bg-[#0c101d]/95 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
        
        {/* Row 1: Brand, Merged Action Toolbar, Auth & Social */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Active Blueprint ID Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="h-full w-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  PromptCraft Sonic Blueprint
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full uppercase tracking-wider">
                  V2.0 Core
                </span>
                {currentBlueprintId && (
                  <span className="hidden sm:inline-block text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
                    ID: {currentBlueprintId.slice(0, 8)}...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                4-Pillar Suno AI Music Prompt Engine & Song Metadata Studio
              </p>
            </div>
          </div>

          {/* Merged Header Action Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 py-1 px-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
            {/* Primary Save Action Button */}
            {onSaveToFirestore && (
              <button
                onClick={onSaveToFirestore}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/40 transition-all disabled:opacity-50"
                title="Save current blueprint & capture version snapshot in Firebase"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Blueprint'}</span>
              </button>
            )}

            {/* Cloud Blueprints Drawer */}
            {onOpenCloudModal && (
              <button
                onClick={onOpenCloudModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700/80 transition-all"
                title="Open Saved Blueprints Library"
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Blueprints</span>
                {savedSongsCount > 0 && (
                  <span className="bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                    {savedSongsCount}
                  </span>
                )}
              </button>
            )}

            {/* Query Executor */}
            {onOpenQueryModal && (
              <button
                onClick={onOpenQueryModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold transition-all"
                title="Query Execution & Result Sets"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Query Workbench</span>
              </button>
            )}

            {/* Google Tasks Export */}
            {onOpenTasksModal && (
              <button
                onClick={onOpenTasksModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl text-xs font-semibold transition-all"
                title="Manage Google Tasks Production Checklist"
              >
                <ListTodo className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Google Tasks</span>
              </button>
            )}

            {/* Masterclass Enrollment */}
            {onOpenClassesModal && (
              <button
                onClick={onOpenClassesModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-semibold transition-all"
                title="Public Music Masterclasses"
              >
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Masterclasses</span>
              </button>
            )}

            {/* 24/7 Live Support Concierge */}
            {onOpenSupportModal && (
              <button
                onClick={onOpenSupportModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold text-xs transition-all shadow-sm"
                title="24/7 Live Support Concierge"
              >
                <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Support</span>
              </button>
            )}
          </div>

          {/* User Auth & Social Channel Badges */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* User Account Capsule */}
            {authLoading ? (
              <div className="h-8 w-24 bg-slate-800/60 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
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
                  <span className="text-slate-200 font-medium max-w-[100px] truncate">
                    {user.displayName || user.email || 'Guest Creator'}
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleAnonymousSignIn}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                  title="Guest Mode Session"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guest</span>
                </button>
              </div>
            )}

            {/* Social Channel Icons */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2.5">
              <a
                href="https://youtube.com/@PRODROCK99"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                title="YouTube @PRODROCK99"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://suno.com/@arcprompt"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors"
                title="Suno Profile @arcprompt"
              >
                <Music className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://github.com/mutiagent-base/promptcraft-sonic-blueprint"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Row 2: Merged Engine Status & Real-time Notification Banner Strip */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-emerald-400 font-mono">
              <Zap className="w-3 h-3 text-emerald-400" />
              4-Pillar Matrix Active
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-cyan-400 font-mono">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Guardrails Engaged
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-300 font-mono">
              <Cloud className="w-3 h-3 text-amber-400" />
              Firestore Live Sync
            </span>
          </div>

          {/* Feedback Toast / Toast Message Notification */}
          {saveMessage ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{saveMessage}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 text-slate-500 text-[10px] font-mono">
              <span>Suno V3.5/V4 Optimizing • Instant Cloud Version Snapshots</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
