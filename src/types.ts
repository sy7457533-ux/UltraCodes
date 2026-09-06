/**
 * ProfileNest Browser - Global Type Definitions
 */

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  notes: string;
  color: string;
  created_at: number;
  updated_at: number;
  last_used_at: number;
  data_path: string;
  proxy_id: string | null;
  pinned: boolean;
  archived: boolean;
  homepage: string;
  search_engine: string;
  block_third_party_cookies: boolean;
  do_not_track: boolean;
}

export interface Tab {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  favicon?: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  historyStack?: string[];
  historyIndex?: number;
}

export interface ProxySettings {
  id: string;
  name: string;
  type: 'none' | 'http' | 'https' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  bypass_list?: string;
  created_at: number;
}

export interface Bookmark {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  folder: string;
  favicon?: string;
  created_at: number;
}

export interface HistoryEntry {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  visit_count: number;
  last_visit_time: number;
}

export interface DownloadItem {
  id: string;
  profile_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  url: string;
  status: 'completed' | 'in_progress' | 'paused' | 'cancelled' | 'failed';
  progress: number; // 0 to 100
  start_time: number;
  end_time?: number;
}

export interface GlobalSettings {
  theme: 'system' | 'light' | 'dark';
  start_with_windows: boolean;
  minimize_to_tray: boolean;
  default_download_folder: string;
  hardware_acceleration: boolean;
  notifications: boolean;
  default_search_engine: string;
  first_run_completed: boolean;
}

export interface AppLog {
  id: string;
  timestamp: string;
  severity: 'info' | 'warn' | 'error';
  module: string;
  message: string;
}

export interface ProfileNestApi {
  // Profiles
  getProfiles: () => Promise<Profile[]>;
  getProfileById: (id: string) => Promise<Profile | null>;
  createProfile: (data: Partial<Profile>) => Promise<Profile>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<boolean>;
  duplicateProfile: (id: string, newName?: string) => Promise<Profile>;
  launchProfile: (id: string) => Promise<{ success: boolean; windowId: string }>;
  closeProfile: (id: string) => Promise<boolean>;
  getRunningProfiles: () => Promise<string[]>;

  // Bookmarks
  getBookmarks: (profileId: string) => Promise<Bookmark[]>;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'created_at'>) => Promise<Bookmark>;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<Bookmark>;
  deleteBookmark: (id: string) => Promise<boolean>;

  // History
  getHistory: (profileId: string) => Promise<HistoryEntry[]>;
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'visit_count' | 'last_visit_time'>) => Promise<HistoryEntry>;
  clearHistory: (profileId: string, timeRange?: 'all' | 'hour' | 'day' | 'week') => Promise<boolean>;
  deleteHistoryEntry: (id: string) => Promise<boolean>;

  // Downloads
  getDownloads: (profileId: string) => Promise<DownloadItem[]>;
  cancelDownload: (id: string) => Promise<boolean>;
  openDownloadFile: (filePath: string) => Promise<boolean>;
  openDownloadFolder: (filePath: string) => Promise<boolean>;
  deleteDownloadEntry: (id: string) => Promise<boolean>;

  // Proxies
  getProxies: () => Promise<ProxySettings[]>;
  saveProxy: (proxy: Partial<ProxySettings>) => Promise<ProxySettings>;
  deleteProxy: (id: string) => Promise<boolean>;

  // Settings
  getSettings: () => Promise<GlobalSettings>;
  saveSettings: (settings: Partial<GlobalSettings>) => Promise<GlobalSettings>;
  clearBrowsingData: (profileId: string, options: { cookies: boolean; cache: boolean; history: boolean; storage: boolean }) => Promise<boolean>;

  // Backup
  exportProfileZip: (profileId: string) => Promise<{ success: boolean; fileName: string; data?: Blob | Uint8Array }>;
  importProfileZip: (fileData: ArrayBuffer | Uint8Array, profileName?: string) => Promise<Profile>;

  // Logging & System
  log: (severity: 'info' | 'warn' | 'error', module: string, message: string) => void;
  getLogs: () => Promise<AppLog[]>;
  checkForUpdates: () => Promise<{ hasUpdate: boolean; currentVersion: string; latestVersion: string }>;
  minimizeWindow?: () => void;
  maximizeWindow?: () => void;
  closeWindow?: () => void;
}

declare global {
  interface Window {
    profileNestApi?: ProfileNestApi;
  }
}
