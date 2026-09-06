/**
 * ProfileNest Browser - Comprehensive Profile Manager Hub
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pin,
  Clock,
  Calendar,
  Play,
  Square,
  Copy,
  Trash2,
  Settings,
  Download,
  Upload,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Package,
  MoreHorizontal,
  FolderArchive,
  Star,
  CheckCircle2,
  Database,
  Radio,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { Profile, ProxySettings } from '../types';

interface ProfileManagerProps {
  profiles: Profile[];
  runningProfileIds: string[];
  proxies: ProxySettings[];
  onLaunchProfile: (profileId: string) => void;
  onCloseProfile: (profileId: string) => void;
  onNewProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onDuplicateProfile: (profile: Profile) => void;
  onDeleteProfile: (profile: Profile) => void;
  onTogglePin: (profile: Profile) => void;
  onExportProfile: (profileId: string) => void;
  onImportBackup: () => void;
  onOpenBuildGuide: () => void;
  onOpenGlobalSettings: () => void;
  onOpenProxyManager: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  runningProfileIds,
  proxies,
  onLaunchProfile,
  onCloseProfile,
  onNewProfile,
  onEditProfile,
  onDuplicateProfile,
  onDeleteProfile,
  onTogglePin,
  onExportProfile,
  onImportBackup,
  onOpenBuildGuide,
  onOpenGlobalSettings,
  onOpenProxyManager,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'last_used' | 'created' | 'name'>('last_used');

  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        // Tab filter
        if (selectedFilter === 'favorites' && !p.pinned) return false;
        if (selectedFilter === 'archived' && !p.archived) return false;
        if (selectedFilter !== 'archived' && p.archived) return false;

        // Search text
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Pinned always on top unless sorting specifically by name
        if (sortBy !== 'name' && a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'created') {
          return b.created_at - a.created_at;
        }
        return b.last_used_at - a.last_used_at;
      });
  }, [profiles, searchQuery, selectedFilter, sortBy]);

  const runningCount = runningProfileIds.length;
  const pinnedCount = profiles.filter((p) => p.pinned).length;

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div id="profile-manager-view" className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Header & Stat Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Layers className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Profile Manager
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {profiles.length} Profiles
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Windows personal multi-profile management with strict Chromium session isolation. Each profile runs in its own dedicated partition with zero cross-session data leakage.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-new-profile-main"
              onClick={onNewProfile}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>

            <button
              id="btn-import-backup-main"
              onClick={onImportBackup}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Import and restore profile from ZIP backup"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import ZIP</span>
            </button>

            <button
              id="btn-proxy-manager-main"
              onClick={onOpenProxyManager}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Configure HTTP/HTTPS/SOCKS5 Proxies"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proxies ({proxies.length})</span>
            </button>

            <button
              id="btn-global-settings-main"
              onClick={onOpenGlobalSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Global Windows Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Isolation Metrics Overview Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Total Profiles</div>
              <div className="text-xl font-bold text-white mt-0.5">{profiles.length}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Active Windows</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{runningCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Favorites / Pinned</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{pinnedCount}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Partition Engine</div>
              <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Chromium</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Database className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-profile-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles by name or notes..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['all', 'favorites', 'recent', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                id={`filter-tab-${tab}`}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                  selectedFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab === 'all' ? 'All Profiles' : tab}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="last_used">Last Used</option>
              <option value="created">Created Date</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Profile Cards Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-300">No profiles found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search query or filters, or create a new profile.
            </p>
            <button
              onClick={onNewProfile}
              className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => {
              const isRunning = runningProfileIds.includes(profile.id);
              const assignedProxy = profile.proxy_id
                ? proxies.find((p) => p.id === profile.proxy_id)
                : null;

              return (
                <div
                  key={profile.id}
                  id={`profile-card-${profile.id}`}
                  className={`group relative flex flex-col bg-slate-900/80 rounded-2xl border transition-all hover:shadow-xl ${
                    isRunning
                      ? 'border-emerald-500/50 shadow-emerald-500/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="h-1 rounded-t-2xl w-full"
                    style={{ backgroundColor: profile.color || '#2563eb' }}
                  />

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    {/* Card Top: Avatar, Name & Pin Button */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                            style={{ backgroundColor: profile.color || '#2563eb' }}
                          >
                            {profile.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-sm text-white truncate max-w-[180px]">
                                {profile.name}
                              </h3>
                              {isRunning && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Running
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              id: {profile.id}
                            </div>
                          </div>
                        </div>

                        {/* Favorite Pin Button */}
                        <button
                          id={`btn-pin-${profile.id}`}
                          onClick={() => onTogglePin(profile)}
                          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                            profile.pinned
                              ? 'text-amber-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={profile.pinned ? 'Unpin profile' : 'Pin to favorites'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${profile.pinned ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Profile Notes */}
                      {profile.notes ? (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                          {profile.notes}
                        </p>
                      ) : (
                        <div className="h-4 mb-3" />
                      )}

                      {/* Metadata Chips: Proxy & Timestamps */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mb-4">
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Used: {formatRelativeTime(profile.last_used_at)}
                        </span>

                        {assignedProxy ? (
                          <span className="flex items-center gap-1 bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800/50">
                            <Radio className="w-3 h-3" />
                            {assignedProxy.type.toUpperCase()}: {assignedProxy.host}:{assignedProxy.port}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-slate-950 text-slate-500 px-2 py-0.5 rounded-md border border-slate-800">
                            Direct Network
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {/* Launch / Close Button */}
                      {isRunning ? (
                        <button
                          id={`btn-close-${profile.id}`}
                          onClick={() => onCloseProfile(profile.id)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <Square className="w-3.5 h-3.5 fill-red-400" />
                          <span>Close Window</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-launch-${profile.id}`}
                          onClick={() => onLaunchProfile(profile.id)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Launch Browser</span>
                        </button>
                      )}

                      {/* Secondary Actions: Duplicate, Export, Edit, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          id={`btn-duplicate-${profile.id}`}
                          onClick={() => onDuplicateProfile(profile)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Duplicate profile (isolated copy)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-export-${profile.id}`}
                          onClick={() => onExportProfile(profile.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Export profile backup (.zip)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-edit-${profile.id}`}
                          onClick={() => onEditProfile(profile)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Configure profile settings & proxy"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-delete-${profile.id}`}
                          onClick={() => onDeleteProfile(profile)}
                          disabled={isRunning}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isRunning
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'hover:bg-slate-800 text-slate-400 hover:text-red-400'
                          }`}
                          title={
                            isRunning
                              ? 'Close active profile before deleting'
                              : 'Delete profile and data'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
