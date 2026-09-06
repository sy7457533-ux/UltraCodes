/**
 * ProfileNest Browser - Downloads Manager Drawer
 */

import React from 'react';
import { X, Download, Folder, File, CheckCircle2, AlertCircle, Play, Pause, ExternalLink } from 'lucide-react';
import { DownloadItem, Profile } from '../types';

interface DownloadsDrawerProps {
  isOpen: boolean;
  profile: Profile;
  downloads: DownloadItem[];
  onClose: () => void;
  onOpenFolder: (item: DownloadItem) => void;
  onOpenFile: (item: DownloadItem) => void;
  onAddSampleDownload: () => void;
}

export const DownloadsDrawer: React.FC<DownloadsDrawerProps> = ({
  isOpen,
  profile,
  downloads,
  onClose,
  onOpenFolder,
  onOpenFile,
  onAddSampleDownload,
}) => {
  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      id="downloads-drawer-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="downloads-drawer"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Downloads Manager</h2>
              <div className="text-[11px] text-slate-400">
                Partition files for: <span className="text-slate-200">{profile.name}</span>
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
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Recent Files</span>
            <button
              onClick={onAddSampleDownload}
              className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-[11px] transition-colors"
            >
              + Download Demo File
            </button>
          </div>

          {downloads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
              <Download className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div>No downloads recorded in this profile session</div>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <File className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{item.file_name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{formatBytes(item.file_size)}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenFile(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Open File"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenFolder(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Show in Folder"
                  >
                    <Folder className="w-3.5 h-3.5" />
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
