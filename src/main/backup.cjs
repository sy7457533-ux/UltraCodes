/**
 * ProfileNest Browser - Profile Backup & Restore Manager
 * Secure ZIP export and import with integrity checks and collision prevention.
 */

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

class BackupManager {
  constructor(profileManager, db, logger) {
    this.profileManager = profileManager;
    this.db = db;
    this.logger = logger;
  }

  async exportProfileToZip(profileId, destZipPath) {
    const profile = this.db.getProfileById(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    this.logger?.info('BackupManager', `Starting backup for profile ${profile.name} (${profileId})`);

    const zip = new JSZip();

    // 1. Export metadata payload
    const bookmarks = this.db.getBookmarks(profileId);
    const history = this.db.getHistory(profileId);
    const proxy = profile.proxy_id ? (this.db.getProxies().find(p => p.id === profile.proxy_id) || null) : null;

    const manifest = {
      app: 'ProfileNest Browser',
      version: '1.0.0',
      exported_at: Date.now(),
      profile: {
        ...profile,
        // Do not include active locks
        pinned: false,
        archived: false,
      },
      proxy,
      bookmarks,
      history
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // 2. Export profile directory files if any exist
    const profileDir = this.profileManager.getProfileDir(profileId);
    if (fs.existsSync(profileDir)) {
      const addDirectoryToZip = (currentDir, zipFolder) => {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
          const fullPath = path.join(currentDir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            // Skip locks or transient cache files
            if (['Cache', 'GPUCache', 'Code Cache'].includes(file)) continue;
            const subFolder = zipFolder.folder(file);
            addDirectoryToZip(fullPath, subFolder);
          } else {
            // Avoid large lock files
            if (file.endsWith('.lock') || file === 'SingletonLock') continue;
            const content = fs.readFileSync(fullPath);
            zipFolder.file(file, content);
          }
        }
      };

      const dataFolder = zip.folder('data');
      try {
        addDirectoryToZip(profileDir, dataFolder);
      } catch (err) {
        this.logger?.warn('BackupManager', `Non-fatal warning while archiving data files: ${err.message}`);
      }
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    if (destZipPath) {
      const destDir = path.dirname(destZipPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.writeFileSync(destZipPath, buffer);
      this.logger?.info('BackupManager', `Backup written to ${destZipPath}`);
      return { success: true, filePath: destZipPath, size: buffer.length };
    }

    return { success: true, buffer, size: buffer.length };
  }

  async importProfileFromZip(zipBufferOrPath, customName) {
    this.logger?.info('BackupManager', 'Starting profile import from backup ZIP');

    let zipData;
    if (typeof zipBufferOrPath === 'string') {
      if (!fs.existsSync(zipBufferOrPath)) {
        throw new Error('Backup file does not exist');
      }
      zipData = fs.readFileSync(zipBufferOrPath);
    } else {
      zipData = zipBufferOrPath;
    }

    const zip = await JSZip.loadAsync(zipData);

    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid ProfileNest backup: missing manifest.json');
    }

    const manifestStr = await manifestFile.async('string');
    let manifest;
    try {
      manifest = JSON.parse(manifestStr);
    } catch {
      throw new Error('Malformed manifest.json in backup archive');
    }

    if (manifest.app !== 'ProfileNest Browser') {
      throw new Error('Incompatible backup format. App signature mismatch.');
    }

    // Generate brand new unique profile ID to prevent collisions
    const newId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const importedName = customName || `${manifest.profile.name} (Restored)`;
    const newDir = this.profileManager.getProfileDir(newId);

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    // Unpack data directory files
    const dataFolder = zip.folder('data');
    if (dataFolder) {
      const promises = [];
      dataFolder.forEach((relativePath, file) => {
        if (file.dir) {
          const dirPath = path.join(newDir, relativePath);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        } else {
          const p = file.async('nodebuffer').then(content => {
            const filePath = path.join(newDir, relativePath);
            const parent = path.dirname(filePath);
            if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
            fs.writeFileSync(filePath, content);
          });
          promises.push(p);
        }
      });
      await Promise.all(promises);
    }

    const now = Date.now();
    const importedProfile = {
      id: newId,
      name: importedName,
      avatar: manifest.profile.avatar || 'User',
      notes: manifest.profile.notes || 'Imported from backup',
      color: manifest.profile.color || '#2563eb',
      created_at: now,
      updated_at: now,
      last_used_at: now,
      data_path: newDir,
      proxy_id: null,
      pinned: false,
      archived: false,
      homepage: manifest.profile.homepage || 'profilenest://newtab',
      search_engine: manifest.profile.search_engine || 'https://duckduckgo.com/?q=',
      block_third_party_cookies: manifest.profile.block_third_party_cookies !== false,
      do_not_track: manifest.profile.do_not_track !== false,
    };

    const saved = this.db.saveProfile(importedProfile);

    // Restore bookmarks
    if (Array.isArray(manifest.bookmarks)) {
      for (const bm of manifest.bookmarks) {
        this.db.addBookmark({
          profile_id: newId,
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
        this.db.addHistoryEntry({
          profile_id: newId,
          title: h.title,
          url: h.url
        });
      }
    }

    this.logger?.info('BackupManager', `Successfully restored profile: ${saved.name} (${newId})`);
    return saved;
  }
}

module.exports = BackupManager;
