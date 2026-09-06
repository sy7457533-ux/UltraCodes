/**
 * ProfileNest Browser - Window Management
 * Handles Profile Manager window and dedicated isolated Profile Browser windows.
 */

let BrowserWindow, shell, ipcMain;
try {
  const electron = require('electron');
  BrowserWindow = electron.BrowserWindow;
  shell = electron.shell;
  ipcMain = electron.ipcMain;
} catch (e) {
  BrowserWindow = class {};
  shell = {};
  ipcMain = { handle: () => {}, on: () => {} };
}
const path = require('path');

class WindowManager {
  constructor(profileManager, sessionManager, downloadsManager, logger) {
    this.profileManager = profileManager;
    this.sessionManager = sessionManager;
    this.downloadsManager = downloadsManager;
    this.logger = logger;
    this.managerWindow = null;
    this.browserWindows = new Map(); // profileId -> BrowserWindow
  }

  getPreloadPath() {
    return path.join(__dirname, '..', 'preload', 'index.cjs');
  }

  createManagerWindow() {
    if (this.managerWindow && !this.managerWindow.isDestroyed()) {
      this.managerWindow.focus();
      return this.managerWindow;
    }

    this.managerWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 960,
      minHeight: 650,
      frame: false, // Custom Windows modern titlebar
      title: 'ProfileNest Browser - Profiles',
      backgroundColor: '#0f172a',
      webPreferences: {
        preload: this.getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
      },
    });

    const isDev = process.env.NODE_ENV !== 'production' && !process.env.ELECTRON_PROD;
    const url = isDev && process.env.VITE_DEV_SERVER_URL
      ? process.env.VITE_DEV_SERVER_URL
      : `file://${path.join(__dirname, '..', '..', 'dist', 'index.html')}`;

    this.managerWindow.loadURL(url);

    this.managerWindow.on('closed', () => {
      this.managerWindow = null;
    });

    this.logger?.info('WindowManager', 'Profile Manager window created');
    return this.managerWindow;
  }

  async createProfileBrowserWindow(profile, proxyConfig) {
    const existing = this.browserWindows.get(profile.id);
    if (existing && !existing.isDestroyed()) {
      existing.focus();
      return existing;
    }

    // 1. Initialize isolated Chromium session
    const ses = await this.sessionManager.configureProfileSession(profile, proxyConfig);
    this.downloadsManager.attachToSession(ses, profile.id);

    // 2. Mark profile as running (locking against deletion)
    this.profileManager.markRunning(profile.id);

    // 3. Create dedicated profile window
    const browserWin = new BrowserWindow({
      width: 1300,
      height: 850,
      minWidth: 800,
      minHeight: 600,
      frame: false,
      title: `${profile.name} - ProfileNest Browser`,
      backgroundColor: '#0f172a',
      webPreferences: {
        preload: this.getPreloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        partition: this.sessionManager.getPartitionKey(profile.id),
      },
    });

    const isDev = process.env.NODE_ENV !== 'production' && !process.env.ELECTRON_PROD;
    const baseTarget = isDev && process.env.VITE_DEV_SERVER_URL
      ? `${process.env.VITE_DEV_SERVER_URL}?profileId=${profile.id}`
      : `file://${path.join(__dirname, '..', '..', 'dist', 'index.html')}?profileId=${profile.id}`;

    browserWin.loadURL(baseTarget);

    browserWin.on('closed', () => {
      this.browserWindows.delete(profile.id);
      this.profileManager.markClosed(profile.id);
      if (this.managerWindow && !this.managerWindow.isDestroyed()) {
        this.managerWindow.webContents.send('profilenest:profile-closed', profile.id);
      }
    });

    this.browserWindows.set(profile.id, browserWin);
    this.logger?.info('WindowManager', `Browser window launched for profile: ${profile.name} (${profile.id})`);
    return browserWin;
  }

  closeProfileWindow(profileId) {
    const win = this.browserWindows.get(profileId);
    if (win && !win.isDestroyed()) {
      win.close();
      return true;
    }
    return false;
  }

  getRunningProfileIds() {
    return Array.from(this.browserWindows.keys());
  }
}

module.exports = WindowManager;
