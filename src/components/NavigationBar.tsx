/**
 * ProfileNest Browser - Navigation & Omnibox Bar
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Star,
  Download,
  History,
  ShieldCheck,
  MoreVertical,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Tab, Profile, Bookmark } from '../types';

interface NavigationBarProps {
  activeTab: Tab | null;
  activeProfile: Profile;
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onOpenBookmarks: () => void;
  onOpenHistory: () => void;
  onOpenDownloads: () => void;
  onOpenPrivacy: () => void;
  onOpenProfileSettings: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  activeProfile,
  bookmarks,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onHome,
  onToggleBookmark,
  onOpenBookmarks,
  onOpenHistory,
  onOpenDownloads,
  onOpenPrivacy,
  onOpenProfileSettings,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.url === 'profilenest://newtab' ? '' : activeTab.url);
    }
  }, [activeTab?.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onNavigate(inputUrl);
  };

  const isCurrentUrlBookmarked = Boolean(
    activeTab && bookmarks.some((b) => b.url === activeTab.url)
  );

  return (
    <div
      id="browser-nav-bar"
      className="bg-slate-850 bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 select-none"
    >
      {/* Back / Forward / Reload / Home Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          id="btn-nav-back"
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
          title="Back (Alt+Left)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          id="btn-nav-forward"
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:text-slate-600 disabled:hover:bg-transparent transition-colors"
          title="Forward (Alt+Right)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          id="btn-nav-reload"
          onClick={onReload}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Reload this page (Ctrl+R)"
        >
          <RotateCw className={`w-4 h-4 ${activeTab?.loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
        <button
          id="btn-nav-home"
          onClick={onHome}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Open New Tab / Homepage"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibox / URL Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-4xl flex items-center">
        <div className="w-full relative flex items-center bg-slate-950/80 border border-slate-700/70 hover:border-slate-600 focus-within:border-blue-500 rounded-full px-3 py-1 transition-all shadow-inner">
          {/* Isolation & Security Badge */}
          <div className="flex items-center gap-1 mr-2 shrink-0">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono font-medium text-emerald-400/90 hidden sm:inline">
              Isolated
            </span>
          </div>

          {/* URL Input */}
          <input
            id="omnibox-input"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search with DuckDuckGo or enter URL (e.g. wikipedia.org)"
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden font-mono"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Bookmark Star Button */}
          {activeTab && activeTab.url !== 'profilenest://newtab' && (
            <button
              type="button"
              id="btn-star-bookmark"
              onClick={onToggleBookmark}
              className={`p-1 rounded-full hover:bg-slate-800 transition-colors ml-1 shrink-0 ${
                isCurrentUrlBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isCurrentUrlBookmarked ? 'Bookmarked in this profile' : 'Bookmark this page (Ctrl+D)'}
            >
              <Star className={`w-3.5 h-3.5 ${isCurrentUrlBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </form>

      {/* Right Side Quick Actions & Profile Menu */}
      <div className="flex items-center gap-1 shrink-0 relative">
        {/* Bookmarks Manager */}
        <button
          id="btn-nav-bookmarks"
          onClick={onOpenBookmarks}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Bookmarks (Ctrl+B)"
        >
          <Star className="w-4 h-4" />
        </button>

        {/* History Manager */}
        <button
          id="btn-nav-history"
          onClick={onOpenHistory}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="History (Ctrl+H)"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Downloads Manager */}
        <button
          id="btn-nav-downloads"
          onClick={onOpenDownloads}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Downloads (Ctrl+J)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Privacy & Purge Tool */}
        <button
          id="btn-nav-privacy"
          onClick={onOpenPrivacy}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
          title="Profile Privacy & Data Sanitizer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Profile Settings Quick Button */}
        <button
          id="btn-nav-profile-settings"
          onClick={onOpenProfileSettings}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 border border-slate-700/60 transition-colors"
          title="Configure active profile"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeProfile.color || '#2563eb' }}
          />
          <span className="text-xs text-slate-200 font-medium max-w-[100px] truncate">
            {activeProfile.name}
          </span>
        </button>

        {/* Browser Options Menu */}
        <div className="relative">
          <button
            id="btn-nav-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Browser Menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              id="browser-overflow-menu"
              className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800 font-medium text-slate-400">
                Profile: <span className="text-white">{activeProfile.name}</span>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenBookmarks();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" /> Bookmarks Manager
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHistory();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <History className="w-3.5 h-3.5 text-blue-400" /> Browsing History
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenDownloads();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" /> Downloads Manager
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPrivacy();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Clear Browsing Data
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfileSettings();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" /> Profile Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
