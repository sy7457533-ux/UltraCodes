/**
 * ProfileNest Browser - Profile LifeCycle & Storage Manager
 * Handles isolated disk directory structures, profile locking, duplication,
 * and lifecycle states.
 */

const fs = require('fs');
const path = require('path');

class ProfileManager {
  constructor(baseDataDir, db, logger) {
    this.baseDataDir = baseDataDir;
    this.profilesDir = path.join(this.baseDataDir, 'profiles');
    this.db = db;
    this.logger = logger;
    this.runningProfiles = new Set(); // set of profileId
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.profilesDir)) {
        fs.mkdirSync(this.profilesDir, { recursive: true });
      }
      this.logger?.info('ProfileManager', `Profile root directory ready at ${this.profilesDir}`);
    } catch (err) {
      this.logger?.error('ProfileManager', `Failed to init profiles dir: ${err.message}`);
    }
  }

  getProfileDir(profileId) {
    return path.join(this.profilesDir, `profile-${profileId}`);
  }

  isProfileRunning(profileId) {
    return this.runningProfiles.has(profileId);
  }

  markRunning(profileId) {
    this.runningProfiles.add(profileId);
    this.db.saveProfile({ id: profileId, last_used_at: Date.now() });
    this.logger?.info('ProfileManager', `Profile marked active/running: ${profileId}`);
  }

  markClosed(profileId) {
    this.runningProfiles.delete(profileId);
    this.logger?.info('ProfileManager', `Profile closed: ${profileId}`);
  }

  createProfile(data) {
    const id = data.id || `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const profileDir = this.getProfileDir(id);

    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    const now = Date.now();
    const newProfile = {
      id,
      name: data.name || `Profile ${id.slice(-4)}`,
      avatar: data.avatar || 'User',
      notes: data.notes || '',
      color: data.color || '#2563eb',
      created_at: now,
      updated_at: now,
      last_used_at: now,
      data_path: profileDir,
      proxy_id: data.proxy_id || null,
      pinned: data.pinned || false,
      archived: data.archived || false,
      homepage: data.homepage || 'profilenest://newtab',
      search_engine: data.search_engine || 'https://duckduckgo.com/?q=',
      block_third_party_cookies: data.block_third_party_cookies !== false,
      do_not_track: data.do_not_track !== false,
    };

    const saved = this.db.saveProfile(newProfile);
    this.logger?.info('ProfileManager', `Created new profile: ${saved.name} (${id})`);
    return saved;
  }

  updateProfile(id, updates) {
    const existing = this.db.getProfileById(id);
    if (!existing) {
      throw new Error(`Profile not found: ${id}`);
    }

    const merged = { ...existing, ...updates, id, updated_at: Date.now() };
    return this.db.saveProfile(merged);
  }

  duplicateProfile(sourceId, newName) {
    const source = this.db.getProfileById(sourceId);
    if (!source) {
      throw new Error(`Source profile not found: ${sourceId}`);
    }

    const newId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newDir = this.getProfileDir(newId);

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    const name = newName || `${source.name} (Copy)`;
    const now = Date.now();

    const duplicated = {
      id: newId,
      name,
      avatar: source.avatar,
      notes: source.notes ? `Copy of ${source.name}. ${source.notes}` : `Copy of ${source.name}`,
      color: source.color,
      created_at: now,
      updated_at: now,
      last_used_at: now,
      data_path: newDir,
      proxy_id: source.proxy_id,
      pinned: false,
      archived: false,
      homepage: source.homepage,
      search_engine: source.search_engine,
      block_third_party_cookies: source.block_third_party_cookies,
      do_not_track: source.do_not_track,
    };

    const saved = this.db.saveProfile(duplicated);

    // Duplicate bookmarks from source profile
    const sourceBookmarks = this.db.getBookmarks(sourceId);
    for (const bm of sourceBookmarks) {
      this.db.addBookmark({
        profile_id: newId,
        title: bm.title,
        url: bm.url,
        folder: bm.folder,
        favicon: bm.favicon
      });
    }

    this.logger?.info('ProfileManager', `Duplicated profile ${source.name} -> ${saved.name} (${newId})`);
    return saved;
  }

  deleteProfile(id) {
    if (this.isProfileRunning(id)) {
      throw new Error('Cannot delete an active, running profile. Please close its window first.');
    }

    const profile = this.db.getProfileById(id);
    if (!profile) return false;

    // Remove directory
    const dir = this.getProfileDir(id);
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (err) {
        this.logger?.warn('ProfileManager', `Could not delete directory ${dir}: ${err.message}`);
      }
    }

    this.db.deleteProfile(id);
    this.logger?.info('ProfileManager', `Deleted profile: ${profile.name} (${id})`);
    return true;
  }

  getAllProfiles() {
    return this.db.getAllProfiles();
  }

  getProfile(id) {
    return this.db.getProfileById(id);
  }
}

module.exports = ProfileManager;
