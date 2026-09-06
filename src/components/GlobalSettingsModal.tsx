/**
 * ProfileNest Browser - Global Application Settings Modal
 */

import React, { useState } from 'react';
import { X, Settings, Monitor, Folder, Cpu, Bell, CheckCircle2 } from 'lucide-react';
import { GlobalSettings } from '../types';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  settings: GlobalSettings;
  onClose: () => void;
  onSaveSettings: (settings: Partial<GlobalSettings>) => Promise<void>;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
}) => {
  const [theme, setTheme] = useState(settings.theme);
  const [startWithWindows, setStartWithWindows] = useState(settings.start_with_windows);
  const [minimizeToTray, setMinimizeToTray] = useState(settings.minimize_to_tray);
  const [defaultFolder, setDefaultFolder] = useState(settings.default_download_folder);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(settings.hardware_acceleration);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      theme,
      start_with_windows: startWithWindows,
      minimize_to_tray: minimizeToTray,
      default_download_folder: defaultFolder,
      hardware_acceleration: hardwareAcceleration,
      notifications,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="global-settings-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="global-settings-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Application Settings</h2>
              <div className="text-[11px] text-slate-400">Windows desktop integration & system preferences</div>
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
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {saved && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {/* Windows System Preferences */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Start with Windows</div>
                <div className="text-[10px] text-slate-500">Launch ProfileNest automatically on Windows boot</div>
              </div>
              <input
                type="checkbox"
                checked={startWithWindows}
                onChange={(e) => setStartWithWindows(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Minimize to System Tray</div>
                <div className="text-[10px] text-slate-500">Keep profiles running in Windows notification area</div>
              </div>
              <input
                type="checkbox"
                checked={minimizeToTray}
                onChange={(e) => setMinimizeToTray(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Hardware Acceleration</div>
                <div className="text-[10px] text-slate-500">Use GPU acceleration when available</div>
              </div>
              <input
                type="checkbox"
                checked={hardwareAcceleration}
                onChange={(e) => setHardwareAcceleration(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-600 bg-slate-900"
              />
            </label>
          </div>

          {/* Downloads Path */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>Default Downloads Directory</span>
            </label>
            <input
              type="text"
              value={defaultFolder}
              onChange={(e) => setDefaultFolder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-md shadow-blue-600/20"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
