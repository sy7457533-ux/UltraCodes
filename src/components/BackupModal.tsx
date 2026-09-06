/**
 * ProfileNest Browser - Profile Backup & Restore (.ZIP) Modal
 */

import React, { useState } from 'react';
import { X, Upload, Download, FileArchive, CheckCircle2, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { Profile } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  profiles: Profile[];
  onClose: () => void;
  onExport: (profileId: string) => Promise<void>;
  onImport: (file: File) => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  profiles,
  onClose,
  onExport,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!selectedProfileId) return;
    try {
      setIsProcessing(true);
      setError(null);
      await onExport(selectedProfileId);
      setSuccess('Profile backup archive exported successfully (.zip)');
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      await onImport(file);
      setSuccess(`Imported profile successfully from ${file.name}`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Import failed. Verify archive integrity.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="backup-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="backup-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <FileArchive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Profile Backup & Portability</h2>
              <div className="text-[11px] text-slate-400">
                Export and import complete profile packages (.zip)
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-4 text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('export');
              setError(null);
              setSuccess(null);
            }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setError(null);
              setSuccess(null);
            }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import & Restore</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Select Profile to Export
                </label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-slate-400 text-[11px]">
                <div className="font-semibold text-slate-200">Archive Manifest Contents:</div>
                <div>• Profile identity: name, notes, theme color, search engine</div>
                <div>• Network configuration: assigned proxy settings</div>
                <div>• Bookmarks: titles, URLs, favicons, folders</div>
                <div>• Browsing history: visit entries & timestamps</div>
                <div>• Session partition metadata: manifest.json</div>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={isProcessing || !selectedProfileId}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Generating ZIP Archive...' : 'Download Backup (.zip)'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="font-semibold text-white mb-1">Select ProfileNest ZIP Backup</div>
                <p className="text-slate-400 text-[11px] max-w-xs mx-auto mb-3">
                  Upload a previously exported .zip file. The archive will be validated and restored as an independent isolated profile.
                </p>
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                  <span>Browse File...</span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                Strict isolation: Restored profiles receive brand-new directory paths to prevent collisions.
              </div>
            </div>
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
