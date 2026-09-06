/**
 * ProfileNest Browser - Privacy & Browsing Data Sanitizer Modal
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Trash2, CheckCircle2, AlertTriangle, Key, HardDrive, Database, Globe } from 'lucide-react';
import { Profile } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onPurgeData: (options: { cookies: boolean; cache: boolean; history: boolean; storage: boolean }) => Promise<void>;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  profile,
  onClose,
  onPurgeData,
}) => {
  const [cookies, setCookies] = useState(true);
  const [cache, setCache] = useState(true);
  const [history, setHistory] = useState(true);
  const [storage, setStorage] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurge = async () => {
    try {
      setClearing(true);
      await onPurgeData({ cookies, cache, history, storage });
      setSuccessMessage('Browsing data purged successfully for this profile.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      id="privacy-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="privacy-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Clear Browsing Data</h2>
              <div className="text-[11px] text-slate-400">
                Purge isolated partition data for: <span className="text-white font-medium">{profile.name}</span>
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {successMessage ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-400 text-[11px]">
                  ProfileNest guarantees strict isolation. Clearing data here will <strong>only</strong> affect this profile&apos;s isolated partition. Other profiles will remain completely intact.
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Cookies and other site data</div>
                      <div className="text-[10px] text-slate-500">Signs you out of sites in this profile only</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookies}
                    onChange={(e) => setCookies(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Cached images and web files</div>
                      <div className="text-[10px] text-slate-500">Frees space in profile partition directory</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cache}
                    onChange={(e) => setCache(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Browsing history & omnibox logs</div>
                      <div className="text-[10px] text-slate-500">Clears page visit timestamps and URLs</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={history}
                    onChange={(e) => setHistory(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">LocalStorage & IndexedDB store</div>
                      <div className="text-[10px] text-slate-500">Clears offline web application databases</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={storage}
                    onChange={(e) => setStorage(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePurge}
            disabled={clearing || (!cookies && !cache && !history && !storage)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{clearing ? 'Sanitizing...' : 'Clear Data Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
