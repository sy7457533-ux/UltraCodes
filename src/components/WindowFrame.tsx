/**
 * ProfileNest Browser - Windows 11 Title Bar & Frame
 */

import React from 'react';
import { Minus, Square, X, Shield, Moon, Sun, Monitor, Package, Globe } from 'lucide-react';
import { Profile } from '../types';

interface WindowFrameProps {
  activeProfile: Profile | null;
  activeView: 'manager' | 'browser';
  onToggleView: () => void;
  theme: 'system' | 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenBuildGuide: () => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  activeProfile,
  activeView,
  onToggleView,
  theme,
  onToggleTheme,
  onOpenBuildGuide,
}) => {
  const isElectron = typeof window !== 'undefined' && Boolean(window.profileNestApi);

  const handleMinimize = () => {
    if (isElectron && window.profileNestApi?.minimizeWindow) {
      window.profileNestApi.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (isElectron && window.profileNestApi?.maximizeWindow) {
      window.profileNestApi.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (isElectron && window.profileNestApi?.closeWindow) {
      window.profileNestApi.closeWindow();
    }
  };

  return (
    <header
      id="profilenest-titlebar"
      className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 select-none text-xs text-slate-300 z-50 sticky top-0"
    >
      {/* Left: Brand Identity & View Switcher */}
      <div className="flex items-center gap-3">
        <button
          id="btn-nav-brand"
          onClick={onToggleView}
          className="flex items-center gap-2 font-semibold tracking-wide text-slate-100 hover:text-blue-400 transition-colors"
          title="Switch between Profiles Manager and Browser"
        >
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-100">ProfileNest</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
            v1.0
          </span>
        </button>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-md border border-slate-700/50">
          <button
            id="btn-tab-manager"
            onClick={onToggleView}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'manager'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profiles Hub
          </button>
          <button
            id="btn-tab-browser"
            onClick={onToggleView}
            disabled={!activeProfile}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'browser'
                ? 'bg-blue-600 text-white shadow-xs'
                : activeProfile
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Browser View</span>
            {activeProfile && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* Active Profile Status Pill */}
        {activeProfile && (
          <div
            id="active-profile-pill"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeProfile.color || '#2563eb' }}
            />
            <span className="text-slate-200 font-medium truncate max-w-[120px]">
              {activeProfile.name}
            </span>
            <span className="text-emerald-400 font-mono text-[9px] px-1 bg-emerald-500/10 rounded">
              ISOLATED
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions & Windows Controls */}
      <div className="flex items-center gap-1">
        {/* Windows Package / Build Guide */}
        <button
          id="btn-open-build-guide"
          onClick={onOpenBuildGuide}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors mr-1 border border-slate-700/60"
          title="Windows Desktop Executable & Installer Packaging (.exe)"
        >
          <Package className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium">Windows Build (.exe)</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={`Current theme: ${theme}. Click to change.`}
        >
          {theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5" />
          ) : theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Standard Windows Frameless Controls */}
        <div className="flex items-center ml-2 border-l border-slate-800 pl-1">
          <button
            id="btn-win-minimize"
            onClick={handleMinimize}
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-win-maximize"
            onClick={handleMaximize}
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            id="btn-win-close"
            onClick={handleClose}
            className="w-8 h-7 flex items-center justify-center hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
