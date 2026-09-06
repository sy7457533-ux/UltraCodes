/**
 * ProfileNest Browser - Universal Store & API Bridge
 * Connects directly to window.profileNestApi in Electron desktop,
 * and provides persistent client-side fallbacks in browser preview.
 */

import { Profile, Bookmark, HistoryEntry, DownloadItem, ProxySettings, GlobalSettings, AppLog } from '../types';
import JSZip from 'jszip';
import { DEFAULT_SEARCH_ENGINES } from '../shared/constants';

const STORAGE_KEYS = {
  PROFILES: 'profilenest_profiles',
  BOOKMARKS: 'profilenest_bookmarks',
  HISTORY: 'profilenest_history',
  DOWNLOADS: 'profilenest_downloads',
  PROXIES: 'profilenest_proxies',
  SETTINGS: 'profilenest_settings',
  LOGS: 'profilenest_logs',
  SESSION_STORAGE_PREFIX: 'profilenest_session_',
};

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'p_personal_1',
    name: 'Personal Space',
    avatar: 'User',
    notes: 'Personal browsing, personal email, media, and casual reading.',
    color: '#2563eb',
    created_at: Date.now() - 86400000 * 7,
    updated_at: Date.now() - 3600000,
    last_used_at: Date.now() - 1000 * 60 * 12,
    data_path: 'C:\\Users\\Desktop\\AppData\\Roaming\\ProfileNest\\profiles\\profile-personal_1',
    proxy_id: null,
    pinned: true,
    archived: false,
    homepage: 'profilenest://newtab',
    search_engine: 'https://duckduckgo.com/?q=',
    block_third_party_cookies: true,
    do_not_track: true,
  },
  {
    id: 'p_work_2',
    name: 'Work & Enterprise',
    avatar: 'Briefcase',
    notes: 'Corporate SaaS, Google Workspace, GitHub repositories, client meetings.',
    color: '#0d9488',
    created_at: Date.now() - 86400000 * 5,
    updated_at: Date.now() - 7200000,
    last_used_at: Date.now() - 1000 * 60 * 45,
    data_path: 'C:\\Users\\Desktop\\AppData\\Roaming\\ProfileNest\\profiles\\profile-work_2',
    proxy_id: 'proxy_corp',
    pinned: true,
    archived: false,
    homepage: 'profilenest://newtab',
    search_engine: 'https://duckduckgo.com/?q=',
    block_third_party_cookies: true,
    do_not_track: true,
  },
  {
    id: 'p_research_3',
    name: 'Academic Research',
    avatar: 'Compass',
    notes: 'Papers, ArXiv, Wikipedia, data science benchmarks, documentation.',
    color: '#9333ea',
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 86400000,
    last_used_at: Date.now() - 1000 * 60 * 180,
    data_path: 'C:\\Users\\Desktop\\AppData\\Roaming\\ProfileNest\\profiles\\profile-research_3',
    proxy_id: null,
    pinned: false,
    archived: false,
    homepage: 'profilenest://newtab',
    search_engine: 'https://duckduckgo.com/?q=',
    block_third_party_cookies: true,
    do_not_track: true,
  }
];

const DEFAULT_PROXIES: ProxySettings[] = [
  {
    id: 'proxy_corp',
    name: 'Corporate WireGuard / SOCKS5',
    type: 'socks5',
    host: '10.0.0.1',
    port: 1080,
    username: 'corp_user',
    password: '••••••••',
    bypass_list: '127.0.0.1;*.internal.local',
    created_at: Date.now() - 86400000 * 5,
  }
];

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm_1',
    profile_id: 'p_personal_1',
    title: 'DuckDuckGo Privacy Search',
    url: 'https://duckduckgo.com',
    folder: 'Bookmarks Bar',
    favicon: 'https://duckduckgo.com/favicon.ico',
    created_at: Date.now() - 86400000,
  },
  {
    id: 'bm_2',
    profile_id: 'p_personal_1',
    title: 'Wikipedia, The Free Encyclopedia',
    url: 'https://en.wikipedia.org',
    folder: 'Bookmarks Bar',
    favicon: 'https://en.wikipedia.org/favicon.ico',
    created_at: Date.now() - 86400000,
  },
  {
    id: 'bm_3',
    profile_id: 'p_work_2',
    title: 'GitHub Repositories',
    url: 'https://github.com',
    folder: 'Bookmarks Bar',
    favicon: 'https://github.githubassets.com/favicons/favicon.png',
    created_at: Date.now() - 86400000,
  }
];

const DEFAULT_SETTINGS: GlobalSettings = {
  theme: 'dark',
  start_with_windows: false,
  minimize_to_tray: true,
  default_download_folder: 'C:\\Users\\Default\\Downloads',
  hardware_acceleration: true,
  notifications: true,
  default_search_engine: 'https://duckduckgo.com/?q=',
  first_run_completed: true,
};

class UniversalProfileStore {
  private isElectron = typeof window !== 'undefined' && Boolean(window.profileNestApi);

  // --- PROFILES ---
  async getProfiles(): Promise<Profile[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getProfiles();
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILES;
    }
  }

  async getProfileById(id: string): Promise<Profile | null> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getProfileById(id);
    }
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.createProfile(data);
    }

    const profiles = await this.getProfiles();
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const newProfile: Profile = {
      id,
      name: data.name || `Profile ${id.slice(-4)}`,
      avatar: data.avatar || 'User',
      notes: data.notes || '',
      color: data.color || '#2563eb',
      created_at: now,
      updated_at: now,
      last_used_at: now,
      data_path: `C:\\Users\\Desktop\\AppData\\Roaming\\ProfileNest\\profiles\\profile-${id}`,
      proxy_id: data.proxy_id || null,
      pinned: data.pinned || false,
      archived: data.archived || false,
      homepage: data.homepage || 'profilenest://newtab',
      search_engine: data.search_engine || DEFAULT_SEARCH_ENGINES[0].url,
      block_third_party_cookies: data.block_third_party_cookies !== false,
      do_not_track: data.do_not_track !== false,
    };

    profiles.unshift(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Initialize isolated local storage for this profile
    localStorage.setItem(`${STORAGE_KEYS.SESSION_STORAGE_PREFIX}${id}`, JSON.stringify({
      cookies: [{ name: 'pn_session_id', value: id, domain: 'isolated.local' }],
      storage: { welcome: 'Welcome to ProfileNest isolated partition' }
    }));

    this.log('info', 'ProfileManager', `Created profile ${newProfile.name} (${id})`);
    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.updateProfile(id, updates);
    }

    const profiles = await this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Profile ${id} not found`);

    profiles[index] = {
      ...profiles[index],
      ...updates,
      id,
      updated_at: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    this.log('info', 'ProfileManager', `Updated profile ${profiles[index].name}`);
    return profiles[index];
  }

  async duplicateProfile(id: string, newName?: string): Promise<Profile> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.duplicateProfile(id, newName);
    }

    const source = await this.getProfileById(id);
    if (!source) throw new Error(`Source profile not found`);

    const newId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const name = newName || `${source.name} (Copy)`;

    const duplicated: Profile = {
      ...source,
      id: newId,
      name,
      notes: source.notes ? `Duplicated from ${source.name}. ${source.notes}` : `Duplicated from ${source.name}`,
      created_at: now,
      updated_at: now,
      last_used_at: now,
      data_path: `C:\\Users\\Desktop\\AppData\\Roaming\\ProfileNest\\profiles\\profile-${newId}`,
      pinned: false,
    };

    const profiles = await this.getProfiles();
    profiles.unshift(duplicated);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Copy bookmarks
    const bookmarks = await this.getBookmarks(id);
    for (const b of bookmarks) {
      await this.addBookmark({
        profile_id: newId,
        title: b.title,
        url: b.url,
        folder: b.folder,
        favicon: b.favicon
      });
    }

    this.log('info', 'ProfileManager', `Duplicated profile ${source.name} -> ${duplicated.name}`);
    return duplicated;
  }

  async deleteProfile(id: string, isRunning: boolean): Promise<boolean> {
    if (isRunning) {
      throw new Error('Cannot delete an active running profile. Please close its window first.');
    }

    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.deleteProfile(id);
    }

    let profiles = await this.getProfiles();
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Clean up bookmarks and history
    let bookmarks = await this.getAllBookmarks();
    bookmarks = bookmarks.filter(b => b.profile_id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));

    let history = await this.getAllHistory();
    history = history.filter(h => h.profile_id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    localStorage.removeItem(`${STORAGE_KEYS.SESSION_STORAGE_PREFIX}${id}`);
    this.log('info', 'ProfileManager', `Deleted profile ${id}`);
    return true;
  }

  // --- BOOKMARKS ---
  private async getAllBookmarks(): Promise<Bookmark[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(DEFAULT_BOOKMARKS));
      return DEFAULT_BOOKMARKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  }

  async getBookmarks(profileId: string): Promise<Bookmark[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getBookmarks(profileId);
    }
    const all = await this.getAllBookmarks();
    return all.filter(b => b.profile_id === profileId);
  }

  async addBookmark(item: Omit<Bookmark, 'id' | 'created_at'>): Promise<Bookmark> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.addBookmark(item);
    }
    const all = await this.getAllBookmarks();
    const newBm: Bookmark = {
      ...item,
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      created_at: Date.now()
    };
    all.unshift(newBm);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(all));
    return newBm;
  }

  async deleteBookmark(id: string): Promise<boolean> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.deleteBookmark(id);
    }
    let all = await this.getAllBookmarks();
    all = all.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(all));
    return true;
  }

  // --- HISTORY ---
  private async getAllHistory(): Promise<HistoryEntry[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async getHistory(profileId: string): Promise<HistoryEntry[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getHistory(profileId);
    }
    const all = await this.getAllHistory();
    return all.filter(h => h.profile_id === profileId).sort((a, b) => b.last_visit_time - a.last_visit_time);
  }

  async addHistoryEntry(profileId: string, url: string, title: string): Promise<HistoryEntry> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.addHistoryEntry({ profile_id: profileId, url, title });
    }
    const all = await this.getAllHistory();
    const existing = all.find(h => h.profile_id === profileId && h.url === url);
    const now = Date.now();

    if (existing) {
      existing.visit_count += 1;
      existing.last_visit_time = now;
      existing.title = title;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(all));
      return existing;
    }

    const newEntry: HistoryEntry = {
      id: `h_${now}_${Math.random().toString(36).slice(2, 6)}`,
      profile_id: profileId,
      url,
      title,
      visit_count: 1,
      last_visit_time: now
    };
    all.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(all));
    return newEntry;
  }

  async clearHistory(profileId: string, timeRange: 'all' | 'hour' | 'day' | 'week' = 'all'): Promise<boolean> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.clearHistory(profileId, timeRange);
    }
    let all = await this.getAllHistory();
    const now = Date.now();
    let cutoff = 0;
    if (timeRange === 'hour') cutoff = now - 3600 * 1000;
    else if (timeRange === 'day') cutoff = now - 86400 * 1000;
    else if (timeRange === 'week') cutoff = now - 7 * 86400 * 1000;

    all = all.filter(h => {
      if (h.profile_id !== profileId) return true;
      return cutoff > 0 ? h.last_visit_time < cutoff : false;
    });

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(all));
    this.log('info', 'Privacy', `Cleared history for profile ${profileId} (${timeRange})`);
    return true;
  }

  // --- DOWNLOADS ---
  async getDownloads(profileId: string): Promise<DownloadItem[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getDownloads(profileId);
    }
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    const all: DownloadItem[] = raw ? JSON.parse(raw) : [];
    return all.filter(d => d.profile_id === profileId);
  }

  async addDownload(item: Omit<DownloadItem, 'id' | 'start_time'>): Promise<DownloadItem> {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
    const all: DownloadItem[] = raw ? JSON.parse(raw) : [];
    const newDl: DownloadItem = {
      ...item,
      id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      start_time: Date.now()
    };
    all.unshift(newDl);
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(all));
    return newDl;
  }

  // --- PROXIES ---
  async getProxies(): Promise<ProxySettings[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getProxies();
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROXIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROXIES, JSON.stringify(DEFAULT_PROXIES));
      return DEFAULT_PROXIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROXIES;
    }
  }

  async saveProxy(proxy: Partial<ProxySettings>): Promise<ProxySettings> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.saveProxy(proxy);
    }
    const list = await this.getProxies();
    const id = proxy.id || `proxy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const item: ProxySettings = {
      id,
      name: proxy.name || 'Unnamed Proxy',
      type: proxy.type || 'none',
      host: proxy.host || '',
      port: Number(proxy.port) || 8080,
      username: proxy.username || '',
      password: proxy.password || '',
      bypass_list: proxy.bypass_list || '<local>',
      created_at: proxy.created_at || Date.now(),
    };

    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);

    localStorage.setItem(STORAGE_KEYS.PROXIES, JSON.stringify(list));
    this.log('info', 'Proxy', `Saved proxy config: ${item.name} (${item.type}://${item.host}:${item.port})`);
    return item;
  }

  async deleteProxy(id: string): Promise<boolean> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.deleteProxy(id);
    }
    let list = await this.getProxies();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROXIES, JSON.stringify(list));
    return true;
  }

  // --- SETTINGS ---
  async getSettings(): Promise<GlobalSettings> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getSettings();
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<GlobalSettings>): Promise<GlobalSettings> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.saveSettings(settings);
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // --- PRIVACY DATA PURGE ---
  async clearBrowsingData(profileId: string, options: { cookies: boolean; cache: boolean; history: boolean; storage: boolean }): Promise<boolean> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.clearBrowsingData(profileId, options);
    }

    if (options.history) {
      await this.clearHistory(profileId, 'all');
    }

    if (options.cookies || options.storage) {
      const key = `${STORAGE_KEYS.SESSION_STORAGE_PREFIX}${profileId}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (options.cookies) parsed.cookies = [];
        if (options.storage) parsed.storage = {};
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }

    this.log('info', 'Privacy', `Purged isolated browsing data for profile ${profileId}`);
    return true;
  }

  // --- EXPORT & IMPORT ZIP ---
  async exportProfileZip(profileId: string): Promise<Blob> {
    const profile = await this.getProfileById(profileId);
    if (!profile) throw new Error('Profile not found');

    const bookmarks = await this.getBookmarks(profileId);
    const history = await this.getHistory(profileId);
    const proxies = await this.getProxies();
    const proxy = profile.proxy_id ? proxies.find(p => p.id === profile.proxy_id) : null;

    const zip = new JSZip();
    const manifest = {
      app: 'ProfileNest Browser',
      version: '1.0.0',
      exported_at: Date.now(),
      profile,
      proxy,
      bookmarks,
      history
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Add sample isolated Chromium session tree placeholder files for demonstration
    const dataFolder = zip.folder('data');
    dataFolder?.file('Preferences', JSON.stringify({ profile_name: profile.name, isolation: 'strict' }, null, 2));
    dataFolder?.file('Network Persistent State', JSON.stringify({ dnt: profile.do_not_track }, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }

  async importProfileZip(file: File | Blob): Promise<Profile> {
    const zip = await JSZip.loadAsync(file);
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid ProfileNest backup archive: missing manifest.json');
    }

    const manifestStr = await manifestFile.async('string');
    const manifest = JSON.parse(manifestStr);

    if (manifest.app !== 'ProfileNest Browser') {
      throw new Error('Incompatible backup format. Application signature mismatch.');
    }

    // Create fresh restored profile record with unique ID
    const newProfile = await this.createProfile({
      name: `${manifest.profile.name} (Restored)`,
      avatar: manifest.profile.avatar,
      notes: manifest.profile.notes || 'Restored from ZIP backup',
      color: manifest.profile.color,
      homepage: manifest.profile.homepage,
      search_engine: manifest.profile.search_engine,
      block_third_party_cookies: manifest.profile.block_third_party_cookies,
      do_not_track: manifest.profile.do_not_track
    });

    // Restore bookmarks
    if (Array.isArray(manifest.bookmarks)) {
      for (const bm of manifest.bookmarks) {
        await this.addBookmark({
          profile_id: newProfile.id,
          title: bm.title,
          url: bm.url,
          folder: bm.folder || 'Bookmarks Bar',
          favicon: bm.favicon
        });
      }
    }

    // Restore history
    if (Array.isArray(manifest.history)) {
      for (const h of manifest.history) {
        await this.addHistoryEntry(newProfile.id, h.url, h.title);
      }
    }

    this.log('info', 'Backup', `Restored profile archive to ${newProfile.name} (${newProfile.id})`);
    return newProfile;
  }

  // --- LOGGING ---
  log(severity: 'info' | 'warn' | 'error', moduleName: string, message: string) {
    if (this.isElectron && window.profileNestApi) {
      window.profileNestApi.log(severity, moduleName, message);
      return;
    }

    const entry: AppLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      severity,
      module: moduleName,
      message
    };

    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    const list: AppLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    if (list.length > 200) list.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list));
  }

  async getLogs(): Promise<AppLog[]> {
    if (this.isElectron && window.profileNestApi) {
      return window.profileNestApi.getLogs();
    }
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  }
}

export const profileStore = new UniversalProfileStore();
