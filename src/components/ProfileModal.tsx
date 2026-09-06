/**
 * ProfileNest Browser - Profile Creation & Editing Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Palette, Globe, Radio, Check, Info } from 'lucide-react';
import { Profile, ProxySettings } from '../types';
import { PROFILE_COLORS, DEFAULT_SEARCH_ENGINES } from '../shared/constants';
import { validateProfileName } from '../shared/validation';

interface ProfileModalProps {
  isOpen: boolean;
  profile: Profile | null; // null if creating, Profile if editing
  proxies: ProxySettings[];
  onClose: () => void;
  onSave: (data: Partial<Profile>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  proxies,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [proxyId, setProxyId] = useState<string | null>(null);
  const [homepage, setHomepage] = useState('profilenest://newtab');
  const [searchEngine, setSearchEngine] = useState(DEFAULT_SEARCH_ENGINES[0].url);
  const [blockThirdPartyCookies, setBlockThirdPartyCookies] = useState(true);
  const [doNotTrack, setDoNotTrack] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setNotes(profile.notes || '');
      setColor(profile.color || PROFILE_COLORS[0]);
      setProxyId(profile.proxy_id);
      setHomepage(profile.homepage || 'profilenest://newtab');
      setSearchEngine(profile.search_engine || DEFAULT_SEARCH_ENGINES[0].url);
      setBlockThirdPartyCookies(profile.block_third_party_cookies !== false);
      setDoNotTrack(profile.do_not_track !== false);
    } else {
      setName('');
      setNotes('');
      setColor(PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)]);
      setProxyId(null);
      setHomepage('profilenest://newtab');
      setSearchEngine(DEFAULT_SEARCH_ENGINES[0].url);
      setBlockThirdPartyCookies(true);
      setDoNotTrack(true);
    }
    setError(null);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateProfileName(name);
    if (!val.valid) {
      setError(val.error || 'Invalid profile name');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        name: name.trim(),
        notes: notes.trim(),
        color,
        proxy_id: proxyId || null,
        homepage: homepage.trim() || 'profilenest://newtab',
        search_engine: searchEngine,
        block_third_party_cookies: blockThirdPartyCookies,
        do_not_track: doNotTrack,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="profile-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {profile ? 'Configure Profile' : 'Create Isolated Profile'}
              </h2>
              <div className="text-[11px] text-slate-400">
                Chromium isolated partition & personal workspace
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Profile Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Profile Name <span className="text-red-400">*</span>
            </label>
            <input
              id="input-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work SaaS, Crypto, Personal, Research"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>Profile Theme Color</span>
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Profile Description / Notes
            </label>
            <textarea
              id="input-profile-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes to organize your accounts or tasks..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          {/* Network Proxy Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assigned Proxy (Optional)</span>
            </label>
            <select
              id="select-profile-proxy"
              value={proxyId || ''}
              onChange={(e) => setProxyId(e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="">Direct Network (No Proxy)</option>
              {proxies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type.toUpperCase()} - {p.host}:{p.port})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Traffic for this profile will route through this standard proxy server.
            </p>
          </div>

          {/* Search Engine & Homepage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Default Search Engine</span>
              </label>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-hidden cursor-pointer"
              >
                {DEFAULT_SEARCH_ENGINES.map((e) => (
                  <option key={e.name} value={e.url}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Custom Homepage
              </label>
              <input
                type="text"
                value={homepage}
                onChange={(e) => setHomepage(e.target.value)}
                placeholder="profilenest://newtab"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Privacy Protections */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chromium Privacy Flags</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blockThirdPartyCookies}
                onChange={(e) => setBlockThirdPartyCookies(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
              />
              <span className="text-slate-300">Block cross-site tracking cookies</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doNotTrack}
                onChange={(e) => setDoNotTrack(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
              />
              <span className="text-slate-300">Send Do-Not-Track (DNT: 1) request header</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
