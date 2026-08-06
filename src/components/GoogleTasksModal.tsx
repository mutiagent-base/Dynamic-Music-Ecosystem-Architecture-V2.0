import React, { useState, useEffect } from 'react';
import {
  getGoogleAccessToken,
  signInWithGoogleTasks,
  getTaskLists,
  createTaskList,
  getTasksInList,
  addTaskToList,
  toggleTaskStatus,
  deleteTaskFromList,
  GoogleTaskList,
  GoogleTask,
} from '../lib/googleTasksService';
import { SongMetadata, PillarState } from '../types';
import { User } from '../lib/firebase';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  ListTodo,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Send,
  Music,
  ShieldAlert,
} from 'lucide-react';

interface GoogleTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  metadata: SongMetadata;
  pillarState: PillarState;
}

export const GoogleTasksModal: React.FC<GoogleTasksModalProps> = ({
  isOpen,
  onClose,
  user,
  metadata,
  pillarState,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getGoogleAccessToken());
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);

  // Loading & State flags
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New List / New Task Inputs
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Delete Confirmation Dialog state
  const [taskToDelete, setTaskToDelete] = useState<GoogleTask | null>(null);

  // Keep access token synced
  useEffect(() => {
    const token = getGoogleAccessToken();
    setAccessToken(token);
    if (token && isOpen) {
      loadTaskLists(token);
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    try {
      setErrorMsg(null);
      const token = await signInWithGoogleTasks();
      if (token) {
        setAccessToken(token);
        await loadTaskLists(token);
      }
    } catch (err: any) {
      console.error('Sign in for Google Tasks failed:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google Tasks');
    }
  };

  const loadTaskLists = async (token: string) => {
    try {
      setIsLoadingLists(true);
      setErrorMsg(null);
      const lists = await getTaskLists(token);
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
        await loadTasks(token, lists[0].id);
      } else if (selectedListId) {
        await loadTasks(token, selectedListId);
      }
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        setAccessToken(null);
        setErrorMsg('Google Tasks authorization required. Please sign in with Google below.');
      } else {
        setErrorMsg(err.message || 'Error fetching Google Task lists.');
      }
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadTasks = async (token: string, listId: string) => {
    try {
      setIsLoadingTasks(true);
      setErrorMsg(null);
      const fetchedTasks = await getTasksInList(token, listId);
      setTasks(fetchedTasks);
    } catch (err: any) {
      if (err.message === 'AUTH_REQUIRED') {
        setAccessToken(null);
      } else {
        setErrorMsg(err.message || 'Error fetching tasks');
      }
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleSelectList = async (listId: string) => {
    setSelectedListId(listId);
    if (accessToken) {
      await loadTasks(accessToken, listId);
    }
  };

  const handleCreateList = async () => {
    if (!accessToken || !newListName.trim()) return;
    try {
      setIsLoadingLists(true);
      const newList = await createTaskList(accessToken, newListName.trim());
      setTaskLists((prev) => [newList, ...prev]);
      setSelectedListId(newList.id);
      setNewListName('');
      setIsCreatingList(false);
      await loadTasks(accessToken, newList.id);
      setSuccessMsg(`Created new Google Task list: "${newList.title}"`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create list');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleAddTask = async () => {
    if (!accessToken || !selectedListId || !newTaskTitle.trim()) return;
    try {
      const addedTask = await addTaskToList(accessToken, selectedListId, {
        title: newTaskTitle.trim(),
        notes: `Associated with song blueprint: ${metadata.title}`,
      });
      setTasks((prev) => [addedTask, ...prev]);
      setNewTaskTitle('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add task');
    }
  };

  const handleToggleTask = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId) return;
    const nextStatus = task.status === 'completed' ? false : true;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: nextStatus ? 'completed' : 'needsAction' } : t
      )
    );

    try {
      await toggleTaskStatus(accessToken, selectedListId, task.id, nextStatus);
    } catch (err: any) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setErrorMsg(err.message || 'Failed to update task');
    }
  };

  // Confirm and delete task (Destructive operation safety dialog)
  const confirmDeleteTask = async () => {
    if (!accessToken || !selectedListId || !taskToDelete) return;
    const targetId = taskToDelete.id;
    setTaskToDelete(null);

    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== targetId));

    try {
      await deleteTaskFromList(accessToken, selectedListId, targetId);
      setSuccessMsg('Task deleted from Google Tasks');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete task');
      if (accessToken) {
        await loadTasks(accessToken, selectedListId);
      }
    }
  };

  // Export full song blueprint production checklist to Google Tasks
  const handleExportBlueprintChecklist = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }

    try {
      setIsExporting(true);
      setErrorMsg(null);

      // 1. Ensure target list exists or create a dedicated list
      let targetListId = selectedListId;
      if (!targetListId) {
        const listName = `🎵 Sonic Blueprint: ${metadata.title || 'Untitled'}`;
        const newList = await createTaskList(accessToken, listName);
        setTaskLists((prev) => [newList, ...prev]);
        targetListId = newList.id;
        setSelectedListId(targetListId);
      }

      // 2. Generate production checklist items
      const checklist = [
        {
          title: `🎛️ Suno AI Prompt: ${metadata.title || 'Untitled'}`,
          notes: `Genre Vibe: ${pillarState.genre.join(', ')}\nBPM: ${pillarState.bpm} | Key: ${pillarState.musicalKey}\nStyle Prompt:\n${metadata.stylePrompt || 'Custom Prompt Matrix'}`,
        },
        {
          title: `🎤 Vocal Production & Voice Layering`,
          notes: metadata.vocalDesc || `Style: ${pillarState.vocalStyle.join(', ')}`,
        },
        {
          title: `🎸 Instrumentation & Synth Arrangement`,
          notes: metadata.instrumentsDesc || `Instruments: ${pillarState.instrumentation.join(', ')}`,
        },
        {
          title: `📜 Finalize Lyrics & Structure Tags`,
          notes: `Check lyric tags like [Intro], [Verse], [Chorus], [Outro].\nBPM: ${pillarState.bpm}`,
        },
        {
          title: `🎚️ Master Polish & 24-bit Export`,
          notes: metadata.productionDesc || `Polish: ${pillarState.productionPolish.join(', ')}`,
        },
      ];

      for (const item of checklist) {
        await addTaskToList(accessToken, targetListId, item);
      }

      await loadTasks(accessToken, targetListId);
      setSuccessMsg(`Successfully exported ${checklist.length} production tasks to Google Tasks!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Failed to export checklist to Google Tasks');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ListTodo className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Google Tasks Integration</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sync music production tasklists directly to your personal Google Tasks account.
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Not Authorized Banner */}
          {!accessToken ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">Connect Your Google Tasks Account</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Authorizing Google Tasks allows PromptCraft Sonic Blueprint to create song production tasklists, manage deadlines, and sync music workflow tasks directly with permission.
                </p>
              </div>

              {/* Official Google Material Sign-In Button */}
              <button
                onClick={handleSignIn}
                className="mx-auto flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-xs shadow-lg transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span>Sign in with Google (Tasks Scope)</span>
              </button>
            </div>
          ) : (
            <>
              {/* Top Controls: Export Action + List Selector */}
              <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        Export Blueprint: "{metadata.title || 'Untitled'}"
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Automatically generate 5 music production checklist items into Google Tasks.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleExportBlueprintChecklist}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Exporting...' : 'Export Checklist to Google Tasks'}</span>
                  </button>
                </div>

                {/* Task List Dropdown & New List Creator */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Target List:</span>

                  <select
                    value={selectedListId}
                    onChange={(e) => handleSelectList(e.target.value)}
                    disabled={isLoadingLists}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 max-w-[240px] truncate"
                  >
                    {taskLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsCreatingList(!isCreatingList)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Create New List"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px]">New List</span>
                  </button>

                  <button
                    onClick={() => accessToken && loadTaskLists(accessToken)}
                    disabled={isLoadingLists || isLoadingTasks}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors ml-auto"
                    title="Refresh Tasks"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Inline New List Form */}
                {isCreatingList && (
                  <div className="flex items-center gap-2 pt-2 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="e.g. 🎵 Cyberpunk Synth Project"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleCreateList}
                      disabled={!newListName.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      Create List
                    </button>
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Tasks in Google Tasks ({tasks.length})
                  </h3>
                  <a
                    href="https://tasks.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Google Tasks Web App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Add Custom Task Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a task to this Google Task List..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Task Items */}
                {isLoadingTasks ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Loading tasks from Google Tasks API...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-1">
                    <p className="text-xs text-slate-400">No tasks in this Google Task list yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Click "Export Checklist to Google Tasks" above to populate song production tasks!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {tasks.map((task) => {
                      const isDone = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                            isDone
                              ? 'bg-slate-950/60 border-slate-900 opacity-60'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <button
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs font-medium truncate ${
                                  isDone ? 'line-through text-slate-500' : 'text-slate-200'
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.notes && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 whitespace-pre-wrap mt-0.5">
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Delete Action Trigger */}
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Tasks Scope Active</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Explicit User Confirmation Dialog for Destructive Delete (Mandatory Policy) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#111728] border border-rose-500/30 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Delete Task Confirmation</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete the task <span className="font-semibold text-white">"{taskToDelete.title}"</span> from your Google Tasks list? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
