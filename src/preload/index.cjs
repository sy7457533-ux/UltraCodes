/**
 * ProfileNest Browser - Secure Preload Script
 * Follows Electron security best practices:
 * contextIsolation: true
 * nodeIntegration: false
 * Exposes strict, validated IPC wrappers without leaking raw ipcRenderer or Node modules.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('profileNestApi', {
  // Profiles
  getProfiles: () => ipcRenderer.invoke('profilenest:get-profiles'),
  getProfileById: (id) => ipcRenderer.invoke('profilenest:get-profile-by-id', id),
  createProfile: (data) => ipcRenderer.invoke('profilenest:create-profile', data),
  updateProfile: (id, updates) => ipcRenderer.invoke('profilenest:update-profile', { id, updates }),
  deleteProfile: (id) => ipcRenderer.invoke('profilenest:delete-profile', id),
  duplicateProfile: (id, newName) => ipcRenderer.invoke('profilenest:duplicate-profile', { id, newName }),
  launchProfile: (id) => ipcRenderer.invoke('profilenest:launch-profile', id),
  closeProfile: (id) => ipcRenderer.invoke('profilenest:close-profile', id),
  getRunningProfiles: () => ipcRenderer.invoke('profilenest:get-running-profiles'),

  // Bookmarks
  getBookmarks: (profileId) => ipcRenderer.invoke('profilenest:get-bookmarks', profileId),
  addBookmark: (item) => ipcRenderer.invoke('profilenest:add-bookmark', item),
  deleteBookmark: (id) => ipcRenderer.invoke('profilenest:delete-bookmark', id),

  // History
  getHistory: (profileId) => ipcRenderer.invoke('profilenest:get-history', profileId),
  addHistoryEntry: (entry) => ipcRenderer.invoke('profilenest:add-history-entry', entry),
  clearHistory: (profileId, timeRange) => ipcRenderer.invoke('profilenest:clear-history', { profileId, timeRange }),

  // Downloads
  getDownloads: (profileId) => ipcRenderer.invoke('profilenest:get-downloads', profileId),
  cancelDownload: (id) => ipcRenderer.invoke('profilenest:cancel-download', id),
  openDownloadFile: (filePath) => ipcRenderer.invoke('profilenest:open-download-file', filePath),
  openDownloadFolder: (filePath) => ipcRenderer.invoke('profilenest:open-download-folder', filePath),

  // Proxies
  getProxies: () => ipcRenderer.invoke('profilenest:get-proxies'),
  saveProxy: (proxy) => ipcRenderer.invoke('profilenest:save-proxy', proxy),
  deleteProxy: (id) => ipcRenderer.invoke('profilenest:delete-proxy', id),

  // Settings & Privacy
  getSettings: () => ipcRenderer.invoke('profilenest:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('profilenest:save-settings', settings),
  clearBrowsingData: (profileId, options) => ipcRenderer.invoke('profilenest:clear-browsing-data', { profileId, options }),

  // Backup & Import
  exportProfileZip: (profileId) => ipcRenderer.invoke('profilenest:export-profile', profileId),
  importProfileZip: () => ipcRenderer.invoke('profilenest:import-profile'),

  // Windows Controls
  minimizeWindow: () => ipcRenderer.invoke('profilenest:minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('profilenest:maximize-window'),
  closeWindow: () => ipcRenderer.invoke('profilenest:close-window'),

  // Logging & Updates
  log: (severity, moduleName, message) => ipcRenderer.invoke('profilenest:log-message', { severity, module: moduleName, message }),
  getLogs: () => ipcRenderer.invoke('profilenest:get-logs'),
  checkForUpdates: () => ipcRenderer.invoke('profilenest:check-for-updates'),
});
