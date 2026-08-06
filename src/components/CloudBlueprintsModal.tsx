import React from 'react';
import { SavedSongDoc } from '../lib/firestoreService';
import { User } from '../lib/firebase';
import { Cloud, X, Play, Trash2, Calendar, Music, Sparkles, LogIn } from 'lucide-react';

interface CloudBlueprintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  savedSongs: SavedSongDoc[];
  onLoadBlueprint: (song: SavedSongDoc) => void;
  onDeleteBlueprint: (songId: string) => void;
}

export const CloudBlueprintsModal: React.FC<CloudBlueprintsModalProps> = ({
  isOpen,
  onClose,
  user,
  savedSongs,
  onLoadBlueprint,
  onDeleteBlueprint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Cloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Firebase Cloud Blueprints</h2>
              <p className="text-xs text-slate-400">
                {user
                  ? `Saved blueprints for ${user.displayName || user.email || 'Guest User'}`
                  : 'Please sign in to access your cloud blueprints.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!user ? (
            <div className="text-center py-12 space-y-3">
              <LogIn className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Sign In Required</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sign in with Google or start a guest session in the top header bar to persist and sync your Suno AI song blueprints in Firebase Firestore.
              </p>
            </div>
          ) : savedSongs.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Saved Blueprints Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customize your 4-pillar prompts and click "Save to Firebase" on the top action bar to store your song architecture in Firestore.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedSongs.map((song) => (
                <div
                  key={song.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
                      <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-2 py-0.5 rounded">
                        {song.bpm} BPM
                      </span>
                      <span className="text-[10px] bg-slate-800 text-purple-300 font-mono px-2 py-0.5 rounded">
                        {song.musicalKey}
                      </span>
                    </div>

                    {song.concept && (
                      <p className="text-xs text-slate-400 line-clamp-1">{song.concept}</p>
                    )}

                    {song.stylePrompt && (
                      <p className="text-[11px] font-mono text-cyan-300/80 bg-slate-950 p-2 rounded-lg line-clamp-2 border border-slate-800">
                        {song.stylePrompt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {song.createdAt ? new Date(song.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <span>•</span>
                      <span>ID: {song.id.slice(0, 10)}...</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onLoadBlueprint(song)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Load Blueprint</span>
                    </button>

                    <button
                      onClick={() => onDeleteBlueprint(song.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl transition-all"
                      title="Delete Blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>{savedSongs.length} Blueprints Stored in Firebase</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
