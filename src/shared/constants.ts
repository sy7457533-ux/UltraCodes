/**
 * ProfileNest Browser - Shared Constants & Enums
 * Architecture compliant for Windows 10/11 Desktop & Secure Electron IPC
 */

export const APP_NAME = 'ProfileNest Browser';
export const APP_VERSION = '1.0.0';

export const IPC_CHANNELS = {
  // Profiles
  GET_PROFILES: 'profilenest:get-profiles',
  GET_PROFILE_BY_ID: 'profilenest:get-profile-by-id',
  CREATE_PROFILE: 'profilenest:create-profile',
  UPDATE_PROFILE: 'profilenest:update-profile',
  DELETE_PROFILE: 'profilenest:delete-profile',
  DUPLICATE_PROFILE: 'profilenest:duplicate-profile',
  LAUNCH_PROFILE: 'profilenest:launch-profile',
  CLOSE_PROFILE: 'profilenest:close-profile',
  GET_RUNNING_PROFILES: 'profilenest:get-running-profiles',

  // Tabs & Navigation
  CREATE_TAB: 'profilenest:create-tab',
  CLOSE_TAB: 'profilenest:close-tab',
  SWITCH_TAB: 'profilenest:switch-tab',
  NAVIGATE_TAB: 'profilenest:navigate-tab',
  RELOAD_TAB: 'profilenest:reload-tab',
  GO_BACK_TAB: 'profilenest:go-back-tab',
  GO_FORWARD_TAB: 'profilenest:go-forward-tab',

  // Bookmarks
  GET_BOOKMARKS: 'profilenest:get-bookmarks',
  ADD_BOOKMARK: 'profilenest:add-bookmark',
  UPDATE_BOOKMARK: 'profilenest:update-bookmark',
  DELETE_BOOKMARK: 'profilenest:delete-bookmark',

  // History
  GET_HISTORY: 'profilenest:get-history',
  ADD_HISTORY_ENTRY: 'profilenest:add-history-entry',
  CLEAR_HISTORY: 'profilenest:clear-history',
  DELETE_HISTORY_ENTRY: 'profilenest:delete-history-entry',

  // Downloads
  GET_DOWNLOADS: 'profilenest:get-downloads',
  START_DOWNLOAD: 'profilenest:start-download',
  CANCEL_DOWNLOAD: 'profilenest:cancel-download',
  OPEN_DOWNLOAD_FILE: 'profilenest:open-download-file',
  OPEN_DOWNLOAD_FOLDER: 'profilenest:open-download-folder',
  DELETE_DOWNLOAD_ENTRY: 'profilenest:delete-download-entry',

  // Proxies
  GET_PROXIES: 'profilenest:get-proxies',
  SAVE_PROXY: 'profilenest:save-proxy',
  DELETE_PROXY: 'profilenest:delete-proxy',

  // Settings & Privacy
  GET_SETTINGS: 'profilenest:get-settings',
  SAVE_SETTINGS: 'profilenest:save-settings',
  CLEAR_BROWSING_DATA: 'profilenest:clear-browsing-data',

  // Backup & Import
  EXPORT_PROFILE: 'profilenest:export-profile',
  IMPORT_PROFILE: 'profilenest:import-profile',

  // System & Window
  MINIMIZE_WINDOW: 'profilenest:minimize-window',
  MAXIMIZE_WINDOW: 'profilenest:maximize-window',
  CLOSE_WINDOW: 'profilenest:close-window',
  LOG_MESSAGE: 'profilenest:log-message',
  CHECK_FOR_UPDATES: 'profilenest:check-for-updates',
  GET_SYSTEM_INFO: 'profilenest:get-system-info',
} as const;

export const DEFAULT_SEARCH_ENGINES = [
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { name: 'Brave', url: 'https://search.brave.com/search?q=' },
  { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=' },
];

export const PROFILE_AVATARS = [
  'User', 'Briefcase', 'Shield', 'Globe', 'Compass', 'Lock',
  'Laptop', 'Bookmark', 'Feather', 'Cpu', 'Layers', 'EyeOff'
];

export const PROFILE_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#16a34a', // Green
  '#ca8a04', // Amber
  '#ea580c', // Orange
  '#dc2626', // Red
  '#9333ea', // Purple
  '#475569', // Slate
];

export const DEFAULT_NEW_TAB_SHORTCUTS = [
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'Search' },
  { title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'Globe' },
  { title: 'GitHub', url: 'https://github.com', icon: 'Code' },
  { title: 'Reddit', url: 'https://reddit.com', icon: 'MessageSquare' },
  { title: 'ArXiv', url: 'https://arxiv.org', icon: 'FileText' },
  { title: 'MDN Docs', url: 'https://developer.mozilla.org', icon: 'BookOpen' },
];
