/**
 * ProfileNest Browser - Modern New Tab Page
 */

import React, { useState } from 'react';
import {
  Search,
  Shield,
  Lock,
  Globe,
  Star,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';
import { Profile, Bookmark } from '../types';
import { DEFAULT_SEARCH_ENGINES, DEFAULT_NEW_TAB_SHORTCUTS } from '../shared/constants';

interface NewTabPageProps {
  profile: Profile;
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  profile,
  bookmarks,
  onNavigate,
  onOpenSettings,
  onOpenPrivacy,
}) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(
    profile.search_engine || DEFAULT_SEARCH_ENGINES[0].url
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onNavigate(query.trim());
  };

  return (
    <div
      id="new-tab-page"
      className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-12 selection:bg-blue-600 selection:text-white"
    >
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Profile Identity Banner */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/10 border border-slate-700/80 relative"
            style={{ backgroundColor: profile.color || '#2563eb' }}
          >
            <Shield className="w-8 h-8" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{profile.name}</span>
          </h1>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3 text-blue-400" />
              Partition: persist:profile-{profile.id}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% Isolated Session
            </span>
          </div>

          {profile.notes && (
            <p className="text-xs text-slate-400 max-w-md mt-1">
              {profile.notes}
            </p>
          )}
        </div>

        {/* Central Search Form */}
        <form onSubmit={handleSearch} className="w-full mb-8">
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700 hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-2xl px-4 py-3 transition-all shadow-2xl">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              id="newtab-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or enter web address..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
              autoFocus
            />

            {/* Search Engine Selector */}
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-hidden cursor-pointer shrink-0 ml-2"
              title="Change default search engine"
            >
              {DEFAULT_SEARCH_ENGINES.map((engine) => (
                <option key={engine.name} value={engine.url}>
                  {engine.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white ml-2 transition-colors shrink-0 shadow-xs"
              title="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Frequently Visited Shortcuts */}
        <div className="w-full mb-8">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Top Shortcuts
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {DEFAULT_NEW_TAB_SHORTCUTS.map((item) => (
              <button
                key={item.title}
                onClick={() => onNavigate(item.url)}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 hover:border-slate-700 border border-slate-800/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-400 flex items-center justify-center text-slate-300 mb-2 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate w-full text-center">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks Section */}
        {bookmarks.length > 0 && (
          <div className="w-full mb-8">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Profile Bookmarks ({bookmarks.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {bookmarks.slice(0, 6).map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => onNavigate(bm.url)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-850 border border-slate-800/60 hover:border-slate-700 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {bm.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {bm.url.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Privacy & Session Protection Overview Card */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Chromium Session Isolation Guarantees</span>
            </div>
            <button
              onClick={onOpenPrivacy}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manage Privacy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">Partitioned Storage</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cookies & LocalStorage
              </span>
              <span className="text-[10px] text-slate-500">
                Zero shared credentials with other profiles
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">Network & Header Policy</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Do-Not-Track (DNT)
              </span>
              <span className="text-[10px] text-slate-500">
                Active DNT request header enabled
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-400 text-[11px]">Directory Structure</span>
              <span className="font-semibold text-slate-200 truncate font-mono text-[11px]">
                profile-{profile.id}
              </span>
              <span className="text-[10px] text-slate-500">
                Separate Windows AppData directory
              </span>
            </div>
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <button onClick={onOpenSettings} className="hover:text-slate-300 transition-colors">
            Profile Settings
          </button>
          <span>•</span>
          <button onClick={onOpenPrivacy} className="hover:text-slate-300 transition-colors">
            Clear Browsing Data
          </button>
          <span>•</span>
          <span>ProfileNest Desktop Engine</span>
        </div>
      </div>
    </div>
  );
};
