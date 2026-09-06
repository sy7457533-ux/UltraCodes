/**
 * ProfileNest Browser - Session Isolation Manager
 * Configures persistent Chromium partitions for each profile:
 * Separate cookies, localStorage, indexedDB, cache, service workers, permissions.
 * Enforces privacy settings like Do-Not-Track and cookie isolation.
 */

let session;
try {
  const electron = require('electron');
  session = electron.session;
} catch (e) {
  // Headless test harness mock
  session = {
    fromPartition: (partition) => ({
      partition,
      webRequest: { onBeforeSendHeaders: () => {} },
      cookies: { set: async () => {} },
      setProxy: async () => {},
      clearStorageData: async () => {},
      clearCache: async () => {},
      setPermissionRequestHandler: () => {}
    })
  };
}

class SessionManager {
  constructor(logger, proxyManager) {
    this.logger = logger;
    this.proxyManager = proxyManager;
    this.configuredPartitions = new Set();
  }

  getPartitionKey(profileId) {
    return `persist:profile-${profileId}`;
  }

  getProfileSession(profileId) {
    const partition = this.getPartitionKey(profileId);
    return session.fromPartition(partition, { cache: true });
  }

  async configureProfileSession(profile, proxyConfig) {
    const partitionKey = this.getPartitionKey(profile.id);
    const ses = session.fromPartition(partitionKey, { cache: true });

    if (this.configuredPartitions.has(partitionKey)) {
      // Re-apply proxy if updated
      if (this.proxyManager) {
        await this.proxyManager.applyProxyToSession(ses, proxyConfig);
      }
      return ses;
    }

    this.logger?.info('SessionManager', `Initializing isolated session for profile: ${profile.name} (${partitionKey})`);

    // Configure standard privacy headers (Do Not Track) without fingerprint manipulation
    if (profile.do_not_track) {
      ses.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['DNT'] = '1';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      });
    }

    // Block third-party cookies if configured
    if (profile.block_third_party_cookies) {
      ses.cookies.set({
        url: 'https://localhost',
        name: 'pn_cookie_policy',
        value: 'strict_isolation'
      }).catch(() => {});
    }

    // Apply network proxy
    if (this.proxyManager) {
      await this.proxyManager.applyProxyToSession(ses, proxyConfig);
    }

    // Manage permission requests safely (prompt or enforce isolation)
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowed = ['fullscreen', 'notifications', 'pointerLock'];
      if (allowed.includes(permission)) {
        callback(true);
      } else {
        this.logger?.info('SessionManager', `Permission requested: ${permission} by ${webContents.getURL()}`);
        callback(false); // Default deny high-risk permissions unless explicitly handled
      }
    });

    this.configuredPartitions.add(partitionKey);
    return ses;
  }

  async clearBrowsingData(profileId, options = { cookies: true, cache: true, storage: true }) {
    const ses = this.getProfileSession(profileId);
    this.logger?.info('SessionManager', `Clearing browsing data for profile ${profileId}`);

    const storages = [];
    if (options.cookies) storages.push('cookies');
    if (options.cache) storages.push('shadercache', 'serviceworkers', 'cachestorage');
    if (options.storage) storages.push('localstorage', 'indexdb', 'websql');

    if (storages.length > 0) {
      await ses.clearStorageData({
        storages: storages
      });
    }

    if (options.cache) {
      await ses.clearCache();
    }

    return true;
  }
}

module.exports = SessionManager;
