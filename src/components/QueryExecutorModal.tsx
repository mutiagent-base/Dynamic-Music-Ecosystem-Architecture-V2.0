import React, { useState, useEffect } from 'react';
import { User } from '../lib/firebase';
import {
  executeCollectionQuery,
  updateItemInResultSet,
  deleteItemInResultSet,
  QueryExecutionResult,
} from '../lib/firestoreService';
import {
  Database,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Trash2,
  Save,
  Download,
  Terminal,
  Clock,
  Zap,
  Code,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface QueryExecutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const QueryExecutorModal: React.FC<QueryExecutorModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Query parameters
  const [collectionName, setCollectionName] = useState<'songs' | 'enrollments' | 'presets'>('songs');
  const [filterField, setFilterField] = useState<string>('');
  const [operator, setOperator] = useState<string>('==');
  const [filterValue, setFilterValue] = useState<string>('');
  const [limitCount, setLimitCount] = useState<number>(25);

  // Execution State & Result Set
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [resultSet, setResultSet] = useState<QueryExecutionResult | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Edit Mode state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPayload, setEditPayload] = useState<Record<string, any>>({});
  const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  // Quick Preset Query Templates
  const handleApplyPresetQuery = (type: 'all-songs' | 'active-enrollments' | 'all-presets') => {
    if (type === 'all-songs') {
      setCollectionName('songs');
      setFilterField('');
      setFilterValue('');
    } else if (type === 'active-enrollments') {
      setCollectionName('enrollments');
      setFilterField('status');
      setOperator('==');
      setFilterValue('active');
    } else if (type === 'all-presets') {
      setCollectionName('presets');
      setFilterField('');
      setFilterValue('');
    }
  };

  // Execute Query
  const handleExecuteQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setStatusMsg({
        type: 'error',
        text: 'Please sign in or start a guest session to execute Firestore queries.',
      });
      return;
    }

    try {
      setIsExecuting(true);
      setStatusMsg(null);
      setEditingItemId(null);

      const result = await executeCollectionQuery(
        user.uid,
        collectionName,
        filterField.trim() || undefined,
        operator,
        filterValue.trim() || undefined,
        limitCount
      );

      setResultSet(result);
      setStatusMsg({
        type: 'success',
        text: `Query executed successfully! Matched ${result.totalResults} record(s) in ${result.executionTimeMs}ms.`,
      });
    } catch (err: any) {
      console.error('Execute query error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to execute query on Firestore dataset.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Run initial query when modal opens
  useEffect(() => {
    if (isOpen && user && !resultSet) {
      handleExecuteQuery();
    }
  }, [isOpen, user]);

  // Start Inline Edit
  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    const clone = { ...item };
    delete clone.id;
    setEditPayload(clone);
  };

  // Save Item Update
  const handleSaveUpdate = async (itemId: string) => {
    try {
      setStatusMsg(null);
      await updateItemInResultSet(collectionName, itemId, editPayload);

      // Refresh Result Set locally
      if (resultSet) {
        const updatedItems = resultSet.items.map((item) =>
          item.id === itemId ? { id: itemId, ...editPayload } : item
        );
        setResultSet({
          ...resultSet,
          items: updatedItems,
        });
      }

      setEditingItemId(null);
      setStatusMsg({
        type: 'success',
        text: `Record "${itemId.slice(0, 8)}..." updated successfully in Firestore!`,
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error('Update item error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to update document record.',
      });
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm(`Are you sure you want to delete record ${itemId}?`)) return;

    try {
      await deleteItemInResultSet(collectionName, itemId);

      if (resultSet) {
        const updatedItems = resultSet.items.filter((i) => i.id !== itemId);
        setResultSet({
          ...resultSet,
          totalResults: updatedItems.length,
          items: updatedItems,
        });
      }

      setStatusMsg({
        type: 'success',
        text: `Record "${itemId.slice(0, 8)}..." deleted from dataset.`,
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error('Delete item error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to delete document.',
      });
    }
  };

  // Export Result Set to JSON File
  const handleExportResultSetJSON = () => {
    if (!resultSet) return;
    const blob = new Blob([JSON.stringify(resultSet, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_set_${collectionName}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 border border-amber-400/30 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20">
              <Terminal className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Execute Query & Result Set Workbench</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-mono">
                  Firestore Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute filter queries on cloud datasets, view execution result sets, and update document fields in real-time.
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Query Formulation Console */}
          <form
            onSubmit={handleExecuteQuery}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Query Builder Parameters</span>
              </div>

              {/* Quick Query Templates */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Quick Queries:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetQuery('all-songs')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                >
                  Songs
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetQuery('active-enrollments')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                >
                  Enrollments
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetQuery('all-presets')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                >
                  Presets
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Target Collection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Collection</label>
                <select
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="songs">songs (Blueprints)</option>
                  <option value="enrollments">enrollments (Classes)</option>
                  <option value="presets">presets (Presets)</option>
                </select>
              </div>

              {/* Filter Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Filter Field (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. status, musicalKey"
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Operator */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="==">== (Equals)</option>
                  <option value=">=">&gt;= (Greater or Equal)</option>
                  <option value="<=">&lt;= (Less or Equal)</option>
                </select>
              </div>

              {/* Filter Value */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Filter Value</label>
                <input
                  type="text"
                  placeholder="e.g. active, C Major"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Limit */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Limit Records</label>
                <select
                  value={limitCount}
                  onChange={(e) => setLimitCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value={10}>10 items</option>
                  <option value={25}>25 items</option>
                  <option value={50}>50 items</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Queries execute directly against Cloud Firestore for your user session.
              </span>

              <button
                type="submit"
                disabled={isExecuting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isExecuting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                )}
                <span>{isExecuting ? 'Executing Query...' : 'Execute Query'}</span>
              </button>
            </div>
          </form>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{statusMsg.text}</span>
              </div>
              <button
                onClick={() => setStatusMsg(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Result Set Header Metrics & Controls */}
          {resultSet && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>Result Set:</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md font-mono">
                      {resultSet.totalResults} record(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Latency: {resultSet.executionTimeMs}ms</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Executed @ {resultSet.executedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                        viewMode === 'table'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TableIcon className="w-3 h-3" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setViewMode('json')}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                        viewMode === 'json'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>JSON Set</span>
                    </button>
                  </div>

                  {/* Export Result Set */}
                  <button
                    onClick={handleExportResultSetJSON}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* View Mode: JSON Full Result Set */}
              {viewMode === 'json' ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 max-h-96 overflow-y-auto">
                  <pre>{JSON.stringify(resultSet, null, 2)}</pre>
                </div>
              ) : (
                /* View Mode: Interactive Table & Inline Update Editor */
                <div className="space-y-3">
                  {resultSet.items.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                      No matching records found in collection "{resultSet.collectionName}".
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resultSet.items.map((item) => {
                        const isEditing = editingItemId === item.id;
                        const isJsonExpanded = expandedJsonId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() =>
                                    setExpandedJsonId(isJsonExpanded ? null : item.id)
                                  }
                                  className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                                  title="Toggle raw JSON record"
                                >
                                  {isJsonExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>

                                <span className="text-xs font-bold text-white font-mono truncate">
                                  ID: {item.id}
                                </span>

                                {item.title && (
                                  <span className="text-xs text-amber-300 font-semibold truncate">
                                    "{item.title}"
                                  </span>
                                )}

                                {item.classTitle && (
                                  <span className="text-xs text-cyan-300 font-semibold truncate">
                                    "{item.classTitle}"
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <button
                                    onClick={() => handleSaveUpdate(item.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Update</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Fields</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-all"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Edit Form */}
                            {isEditing ? (
                              <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/30 space-y-3 animate-fadeIn">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                  Update Fields for Document ({item.id})
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {Object.keys(editPayload).map((key) => {
                                    if (typeof editPayload[key] === 'object') return null;

                                    return (
                                      <div key={key} className="space-y-0.5">
                                        <label className="text-[10px] text-slate-400 font-mono">
                                          {key}
                                        </label>
                                        <input
                                          type="text"
                                          value={editPayload[key] ?? ''}
                                          onChange={(e) =>
                                            setEditPayload({
                                              ...editPayload,
                                              [key]: e.target.value,
                                            })
                                          }
                                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              /* Summary Field Chips */
                              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                                {Object.keys(item)
                                  .filter(
                                    (k) =>
                                      k !== 'id' &&
                                      typeof item[k] !== 'object' &&
                                      item[k] !== ''
                                  )
                                  .slice(0, 6)
                                  .map((key) => (
                                    <span key={key} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                      <strong className="text-slate-500">{key}:</strong>{' '}
                                      {String(item[key])}
                                    </span>
                                  ))}
                              </div>
                            )}

                            {/* Expanded JSON Inspector */}
                            {isJsonExpanded && (
                              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>PromptCraft Query Result Set Executor V2.0</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Workbench
          </button>
        </div>

      </div>
    </div>
  );
};
