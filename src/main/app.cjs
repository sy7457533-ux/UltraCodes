/**
 * ProfileNest Browser - Main Application Entry Point
 * Orchestrates Electron lifecycle, secure IPC routing, database, and sessions.
 */

let app, ipcMain, dialog;
try {
  const electron = require('electron');
  app = electron.app;
  ipcMain = electron.ipcMain;
  dialog = electron.dialog;
} catch (e) {
  app = {
    getPath: () => path.join(process.cwd(), 'data'),
    requestSingleInstanceLock: () => true,
    whenReady: async () => {},
    on: () => {},
    quit: () => {}
  };
  ipcMain = { handle: () => {}, on: () => {} };
  dialog = { showSaveDialog: async () => ({ canceled: true }), showOpenDialog: async () => ({ canceled: true, filePaths: [] }) };
}
const path = require('path');
const Logger = require('./logger.cjs');
const DatabaseManager = require('./database.cjs');
const SessionManager = require('./sessions.cjs');
const ProxyManager = require('./proxy.cjs');
const DownloadsManager = require('./downloads.cjs');
const ProfileManager = require('./profiles.cjs');
const BackupManager = require('./backup.cjs');
const WindowManager = require('./windows.cjs');

class ProfileNestApp {
  constructor() {
    this.userDataDir = app ? app.getPath('userData') : path.join(process.cwd(), 'data');
    this.logger = new Logger(path.join(this.userDataDir, 'logs'));
    this.db = new DatabaseManager(path.join(this.userDataDir, 'profilenest.sqlite'), this.logger);
    this.proxyManager = new ProxyManager(this.logger);
    this.sessionManager = new SessionManager(this.logger, this.proxyManager);
    this.downloadsManager = new DownloadsManager(this.db, this.logger);
    this.profileManager = new ProfileManager(this.userDataDir, this.db, this.logger);
    this.backupManager = new BackupManager(this.profileManager, this.db, this.logger);
    this.windowManager = new WindowManager(
      this.profileManager,
      this.sessionManager,
      this.downloadsManager,
      this.logger
    );
  }

  async start() {
    this.logger.info('App', 'Starting ProfileNest Browser desktop application');

    // Single instance lock
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      this.logger.warn('App', 'Another instance is already running. Exiting.');
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.windowManager.managerWindow) {
        if (this.windowManager.managerWindow.isMinimized()) this.windowManager.managerWindow.restore();
        this.windowManager.managerWindow.focus();
      }
    });

    await app.whenReady();
    this.registerIpcHandlers();
    this.ensureDefaultProfiles();
    this.windowManager.createManagerWindow();

    app.on('window-all-closed', () => {
      // Keep running or quit based on platform conventions
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.windowManager.managerWindow === null) {
        this.windowManager.createManagerWindow();
      }
    });
  }

  ensureDefaultProfiles() {
    const profiles = this.db.getAllProfiles();
    if (profiles.length === 0) {
      this.logger.info('App', 'First run detected. Creating default personal profile.');
      const p1 = this.profileManager.createProfile({
        name: 'Personal Space',
        avatar: 'User',
        color: '#2563eb',
        notes: 'Primary personal profile for browsing, reading, and personal tasks.',
        pinned: true
      });

      // Add default bookmarks
      this.db.addBookmark({
        profile_id: p1.id,
        title: 'DuckDuckGo',
        url: 'https://duckduckgo.com',
        folder: 'Bookmarks Bar'
      });
      this.db.addBookmark({
        profile_id: p1.id,
        title: 'Wikipedia',
        url: 'https://en.wikipedia.org',
        folder: 'Bookmarks Bar'
      });
    }
  }

  registerIpcHandlers() {
    // --- Profiles ---
    ipcMain.handle('profilenest:get-profiles', () => {
      return this.profileManager.getAllProfiles();
    });

    ipcMain.handle('profilenest:get-profile-by-id', (_, id) => {
      if (!id || typeof id !== 'string') return null;
      return this.profileManager.getProfile(id);
    });

    ipcMain.handle('profilenest:create-profile', (_, data) => {
      try {
        return this.profileManager.createProfile(data || {});
      } catch (err) {
        this.logger.error('IPC', `Error creating profile: ${err.message}`);
        throw err;
      }
    });

    ipcMain.handle('profilenest:update-profile', (_, { id, updates }) => {
      if (!id) throw new Error('Missing profile id');
      return this.profileManager.updateProfile(id, updates);
    });

    ipcMain.handle('profilenest:delete-profile', (_, id) => {
      if (!id) throw new Error('Missing profile id');
      return this.profileManager.deleteProfile(id);
    });

    ipcMain.handle('profilenest:duplicate-profile', (_, { id, newName }) => {
      if (!id) throw new Error('Missing profile id');
      return this.profileManager.duplicateProfile(id, newName);
    });

    ipcMain.handle('profilenest:launch-profile', async (_, id) => {
      const profile = this.profileManager.getProfile(id);
      if (!profile) throw new Error(`Profile not found: ${id}`);

      let proxy = null;
      if (profile.proxy_id) {
        proxy = this.db.getProxies().find(p => p.id === profile.proxy_id) || null;
      }

      const win = await this.windowManager.createProfileBrowserWindow(profile, proxy);
      return { success: true, windowId: win.id.toString() };
    });

    ipcMain.handle('profilenest:close-profile', (_, id) => {
      return this.windowManager.closeProfileWindow(id);
    });

    ipcMain.handle('profilenest:get-running-profiles', () => {
      return this.windowManager.getRunningProfileIds();
    });

    // --- Bookmarks ---
    ipcMain.handle('profilenest:get-bookmarks', (_, profileId) => {
      return this.db.getBookmarks(profileId);
    });

    ipcMain.handle('profilenest:add-bookmark', (_, item) => {
      return this.db.addBookmark(item);
    });

    ipcMain.handle('profilenest:delete-bookmark', (_, id) => {
      return this.db.deleteBookmark(id);
    });

    // --- History ---
    ipcMain.handle('profilenest:get-history', (_, profileId) => {
      return this.db.getHistory(profileId);
    });

    ipcMain.handle('profilenest:add-history-entry', (_, entry) => {
      return this.db.addHistoryEntry(entry);
    });

    ipcMain.handle('profilenest:clear-history', (_, { profileId, timeRange }) => {
      return this.db.clearHistory(profileId, timeRange);
    });

    // --- Downloads ---
    ipcMain.handle('profilenest:get-downloads', (_, profileId) => {
      return this.downloadsManager.getDownloads(profileId);
    });

    ipcMain.handle('profilenest:cancel-download', (_, id) => {
      return this.downloadsManager.cancelDownload(id);
    });

    ipcMain.handle('profilenest:open-download-file', (_, filePath) => {
      return this.downloadsManager.openFile(filePath);
    });

    ipcMain.handle('profilenest:open-download-folder', (_, filePath) => {
      return this.downloadsManager.openFolder(filePath);
    });

    // --- Proxies ---
    ipcMain.handle('profilenest:get-proxies', () => {
      return this.db.getProxies();
    });

    ipcMain.handle('profilenest:save-proxy', (_, proxy) => {
      return this.db.saveProxy(proxy);
    });

    ipcMain.handle('profilenest:delete-proxy', (_, id) => {
      return this.db.deleteProxy(id);
    });

    // --- Settings & Privacy ---
    ipcMain.handle('profilenest:get-settings', () => {
      return this.db.getSettings();
    });

    ipcMain.handle('profilenest:save-settings', (_, settings) => {
      return this.db.saveSettings(settings);
    });

    ipcMain.handle('profilenest:clear-browsing-data', async (_, { profileId, options }) => {
      if (options.history) {
        this.db.clearHistory(profileId, 'all');
      }
      return this.sessionManager.clearBrowsingData(profileId, options);
    });

    // --- Backup & Restore ---
    ipcMain.handle('profilenest:export-profile', async (event, profileId) => {
      const win = this.windowManager.managerWindow;
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Export ProfileNest Profile',
        defaultPath: `profile-backup-${profileId}-${Date.now()}.zip`,
        filters: [{ name: 'Zip Archive', extensions: ['zip'] }]
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Export canceled' };
      }

      return this.backupManager.exportProfileToZip(profileId, filePath);
    });

    ipcMain.handle('profilenest:import-profile', async () => {
      const win = this.windowManager.managerWindow;
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Select ProfileNest Backup Archive',
        filters: [{ name: 'Zip Archive', extensions: ['zip'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) {
        return null;
      }

      return this.backupManager.importProfileFromZip(filePaths[0]);
    });

    // --- Window Controls (Windows Frameless Titlebar) ---
    ipcMain.handle('profilenest:minimize-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.minimize();
    });

    ipcMain.handle('profilenest:maximize-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
      }
    });

    ipcMain.handle('profilenest:close-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.close();
    });

    // --- Logs & Updates ---
    ipcMain.handle('profilenest:get-logs', () => {
      return this.logger.getRecentLogs();
    });

    ipcMain.handle('profilenest:log-message', (_, { severity, module: mod, message }) => {
      this.logger.log(severity || 'info', mod || 'Renderer', message || '');
    });

    ipcMain.handle('profilenest:check-for-updates', () => {
      // Clean update abstraction ready for GitHub releases or Squirrel/AppImage
      return {
        hasUpdate: false,
        currentVersion: '1.0.0',
        latestVersion: '1.0.0'
      };
    });
  }
}

module.exports = ProfileNestApp;
