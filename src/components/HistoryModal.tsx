/**
 * ProfileNest Browser - History Manager Modal
 */

import React, { useState } from 'react';
import { X, History, Trash2, Search, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { HistoryEntry, Profile } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  profile: Profile;
  history: HistoryEntry[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onClearHistory: (range: 'all' | 'hour' | 'day' | 'week') => Promise<void>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  profile,
  history,
  onClose,
  onNavigate,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<'all' | 'hour' | 'day' | 'week'>('all');
  const [clearing, setClearing] = useState(false);

  if (!isOpen) return null;

  const filtered = history.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = async () => {
    try {
      setClearing(true);
      await onClearHistory(range);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      id="history-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="history-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Browsing History</h2>
              <div className="text-[11px] text-slate-400">
                Isolated visit logs for: <span className="text-slate-200">{profile.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action & Filter Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="hour">Past Hour</option>
              <option value="day">Past 24 Hours</option>
              <option value="week">Past 7 Days</option>
            </select>

            <button
              onClick={handleClear}
              disabled={clearing || history.length === 0}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
              <span>{clearing ? 'Clearing...' : 'Clear Range'}</span>
            </button>
          </div>
        </div>

        {/* History Records List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No history records found for this profile.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 flex items-center justify-between group transition-colors"
              >
                <div
                  onClick={() => {
                    onNavigate(item.url);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-200 group-hover:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.last_visit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => {
                      onNavigate(item.url);
                      onClose();
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                    title="Visit page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
