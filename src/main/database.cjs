/**
 * ProfileNest Browser - SQLite Database Management
 * Manages persistent relational application metadata:
 * profiles, settings, proxy_settings, bookmarks, downloads_metadata, history
 */

const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor(dbPath, logger) {
    this.dbPath = dbPath;
    this.logger = logger;
    this.db = null;
    this.isReady = false;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Try better-sqlite3 first if installed in native environment
      let Database;
      try {
        Database = require('better-sqlite3');
        this.db = new Database(this.dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.logger?.info('Database', `Connected to SQLite via better-sqlite3 at ${this.dbPath}`);
      } catch (e) {
        // Fallback or sql.js / pure JS adapter
        this.logger?.info('Database', 'better-sqlite3 not found, using pure-JS SQLite / JSON fallback adapter');
        this.initFallback();
      }

      this.runMigrations();
      this.isReady = true;
    } catch (err) {
      this.logger?.error('Database', `Failed to initialize database: ${err.message}`);
      this.initFallback();
    }
  }

  initFallback() {
    // Pure resilient file-backed JSON/SQL-compatible store when native driver isn't present
    this.fallbackData = {
      profiles: [],
      settings: {},
      proxy_settings: [],
      bookmarks: [],
      downloads_metadata: [],
      history: []
    };

    const fallbackFile = this.dbPath.endsWith('.sqlite') 
      ? this.dbPath.replace('.sqlite', '-fallback.json')
      : `${this.dbPath}-fallback.json`;

    this.fallbackFile = fallbackFile;

    if (fs.existsSync(fallbackFile)) {
      try {
        const raw = fs.readFileSync(fallbackFile, 'utf8');
        this.fallbackData = { ...this.fallbackData, ...JSON.parse(raw) };
      } catch (e) {
        this.logger?.warn('Database', `Could not parse fallback DB file: ${e.message}`);
      }
    }
    this.isReady = true;
  }

  persistFallback() {
    if (!this.fallbackFile) return;
    try {
      fs.writeFileSync(this.fallbackFile, JSON.stringify(this.fallbackData, null, 2), 'utf8');
    } catch (e) {
      this.logger?.error('Database', `Error saving fallback DB: ${e.message}`);
    }
  }

  runMigrations() {
    if (this.db) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          avatar TEXT DEFAULT 'User',
          notes TEXT DEFAULT '',
          color TEXT DEFAULT '#2563eb',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          last_used_at INTEGER NOT NULL,
          data_path TEXT NOT NULL,
          proxy_id TEXT,
          pinned INTEGER DEFAULT 0,
          archived INTEGER DEFAULT 0,
          homepage TEXT DEFAULT 'profilenest://newtab',
          search_engine TEXT DEFAULT 'https://duckduckgo.com/?q=',
          block_third_party_cookies INTEGER DEFAULT 1,
          do_not_track INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS proxy_settings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          host TEXT NOT NULL,
          port INTEGER NOT NULL,
          username TEXT,
          password TEXT,
          bypass_list TEXT,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          folder TEXT DEFAULT 'Bookmarks Bar',
          favicon TEXT,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS downloads_metadata (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER DEFAULT 0,
          mime_type TEXT,
          url TEXT,
          status TEXT NOT NULL,
          progress INTEGER DEFAULT 0,
          start_time INTEGER NOT NULL,
          end_time INTEGER,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS history (
          id TEXT PRIMARY KEY,
          profile_id TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          visit_count INTEGER DEFAULT 1,
          last_visit_time INTEGER NOT NULL,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_bookmarks_profile ON bookmarks(profile_id);
        CREATE INDEX IF NOT EXISTS idx_history_profile ON history(profile_id);
        CREATE INDEX IF NOT EXISTS idx_downloads_profile ON downloads_metadata(profile_id);
      `);
      this.logger?.info('Database', 'Database schema migrations applied successfully.');
    }
  }

  // --- PROFILES CRUD ---
  getAllProfiles() {
    if (this.db) {
      const stmt = this.db.prepare(`
        SELECT id, name, avatar, notes, color, created_at, updated_at, last_used_at,
               data_path, proxy_id, pinned, archived, homepage, search_engine,
               block_third_party_cookies, do_not_track
        FROM profiles
        ORDER BY pinned DESC, last_used_at DESC
      `);
      const rows = stmt.all();
      return rows.map(r => ({
        ...r,
        pinned: Boolean(r.pinned),
        archived: Boolean(r.archived),
        block_third_party_cookies: Boolean(r.block_third_party_cookies),
        do_not_track: Boolean(r.do_not_track),
      }));
    } else {
      return [...this.fallbackData.profiles].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.last_used_at - a.last_used_at);
    }
  }

  getProfileById(id) {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
      const r = stmt.get(id);
      if (!r) return null;
      return {
        ...r,
        pinned: Boolean(r.pinned),
        archived: Boolean(r.archived),
        block_third_party_cookies: Boolean(r.block_third_party_cookies),
        do_not_track: Boolean(r.do_not_track),
      };
    } else {
      return this.fallbackData.profiles.find(p => p.id === id) || null;
    }
  }

  saveProfile(profile) {
    const now = Date.now();
    const clean = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || 'User',
      notes: profile.notes || '',
      color: profile.color || '#2563eb',
      created_at: profile.created_at || now,
      updated_at: now,
      last_used_at: profile.last_used_at || now,
      data_path: profile.data_path,
      proxy_id: profile.proxy_id || null,
      pinned: profile.pinned ? 1 : 0,
      archived: profile.archived ? 1 : 0,
      homepage: profile.homepage || 'profilenest://newtab',
      search_engine: profile.search_engine || 'https://duckduckgo.com/?q=',
      block_third_party_cookies: profile.block_third_party_cookies !== false ? 1 : 0,
      do_not_track: profile.do_not_track !== false ? 1 : 0
    };

    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO profiles (
          id, name, avatar, notes, color, created_at, updated_at, last_used_at,
          data_path, proxy_id, pinned, archived, homepage, search_engine,
          block_third_party_cookies, do_not_track
        ) VALUES (
          @id, @name, @avatar, @notes, @color, @created_at, @updated_at, @last_used_at,
          @data_path, @proxy_id, @pinned, @archived, @homepage, @search_engine,
          @block_third_party_cookies, @do_not_track
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          avatar = excluded.avatar,
          notes = excluded.notes,
          color = excluded.color,
          updated_at = excluded.updated_at,
          last_used_at = excluded.last_used_at,
          proxy_id = excluded.proxy_id,
          pinned = excluded.pinned,
          archived = excluded.archived,
          homepage = excluded.homepage,
          search_engine = excluded.search_engine,
          block_third_party_cookies = excluded.block_third_party_cookies,
          do_not_track = excluded.do_not_track
      `);
      stmt.run(clean);
    } else {
      const idx = this.fallbackData.profiles.findIndex(p => p.id === clean.id);
      const obj = {
        ...clean,
        pinned: Boolean(clean.pinned),
        archived: Boolean(clean.archived),
        block_third_party_cookies: Boolean(clean.block_third_party_cookies),
        do_not_track: Boolean(clean.do_not_track),
      };
      if (idx >= 0) {
        this.fallbackData.profiles[idx] = obj;
      } else {
        this.fallbackData.profiles.push(obj);
      }
      this.persistFallback();
    }

    return this.getProfileById(clean.id);
  }

  deleteProfile(id) {
    if (this.db) {
      const tx = this.db.transaction(() => {
        this.db.prepare('DELETE FROM bookmarks WHERE profile_id = ?').run(id);
        this.db.prepare('DELETE FROM history WHERE profile_id = ?').run(id);
        this.db.prepare('DELETE FROM downloads_metadata WHERE profile_id = ?').run(id);
        this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
      });
      tx();
    } else {
      this.fallbackData.profiles = this.fallbackData.profiles.filter(p => p.id !== id);
      this.fallbackData.bookmarks = this.fallbackData.bookmarks.filter(b => b.profile_id !== id);
      this.fallbackData.history = this.fallbackData.history.filter(h => h.profile_id !== id);
      this.fallbackData.downloads_metadata = this.fallbackData.downloads_metadata.filter(d => d.profile_id !== id);
      this.persistFallback();
    }
    return true;
  }

  // --- BOOKMARKS ---
  getBookmarks(profileId) {
    if (this.db) {
      return this.db.prepare('SELECT * FROM bookmarks WHERE profile_id = ? ORDER BY created_at DESC').all(profileId);
    }
    return this.fallbackData.bookmarks.filter(b => b.profile_id === profileId);
  }

  addBookmark(item) {
    const record = {
      id: item.id || `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      profile_id: item.profile_id,
      title: item.title,
      url: item.url,
      folder: item.folder || 'Bookmarks Bar',
      favicon: item.favicon || '',
      created_at: item.created_at || Date.now()
    };
    if (this.db) {
      this.db.prepare(`
        INSERT INTO bookmarks (id, profile_id, title, url, folder, favicon, created_at)
        VALUES (@id, @profile_id, @title, @url, @folder, @favicon, @created_at)
      `).run(record);
    } else {
      this.fallbackData.bookmarks.push(record);
      this.persistFallback();
    }
    return record;
  }

  deleteBookmark(id) {
    if (this.db) {
      this.db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
    } else {
      this.fallbackData.bookmarks = this.fallbackData.bookmarks.filter(b => b.id !== id);
      this.persistFallback();
    }
    return true;
  }

  // --- HISTORY ---
  getHistory(profileId) {
    if (this.db) {
      return this.db.prepare('SELECT * FROM history WHERE profile_id = ? ORDER BY last_visit_time DESC LIMIT 500').all(profileId);
    }
    return this.fallbackData.history.filter(h => h.profile_id === profileId).sort((a, b) => b.last_visit_time - a.last_visit_time);
  }

  addHistoryEntry(entry) {
    const now = Date.now();
    if (this.db) {
      const existing = this.db.prepare('SELECT id, visit_count FROM history WHERE profile_id = ? AND url = ?').get(entry.profile_id, entry.url);
      if (existing) {
        this.db.prepare('UPDATE history SET title = ?, visit_count = visit_count + 1, last_visit_time = ? WHERE id = ?')
          .run(entry.title, now, existing.id);
        return { ...entry, id: existing.id, visit_count: existing.visit_count + 1, last_visit_time: now };
      } else {
        const id = `hist_${now}_${Math.random().toString(36).slice(2, 6)}`;
        this.db.prepare('INSERT INTO history (id, profile_id, title, url, visit_count, last_visit_time) VALUES (?, ?, ?, ?, 1, ?)')
          .run(id, entry.profile_id, entry.title, entry.url, now);
        return { ...entry, id, visit_count: 1, last_visit_time: now };
      }
    } else {
      const existing = this.fallbackData.history.find(h => h.profile_id === entry.profile_id && h.url === entry.url);
      if (existing) {
        existing.title = entry.title;
        existing.visit_count += 1;
        existing.last_visit_time = now;
        this.persistFallback();
        return existing;
      }
      const record = {
        id: `hist_${now}_${Math.random().toString(36).slice(2, 6)}`,
        profile_id: entry.profile_id,
        title: entry.title,
        url: entry.url,
        visit_count: 1,
        last_visit_time: now
      };
      this.fallbackData.history.push(record);
      this.persistFallback();
      return record;
    }
  }

  clearHistory(profileId, timeRange = 'all') {
    let cutoff = 0;
    const now = Date.now();
    if (timeRange === 'hour') cutoff = now - 3600 * 1000;
    else if (timeRange === 'day') cutoff = now - 86400 * 1000;
    else if (timeRange === 'week') cutoff = now - 7 * 86400 * 1000;

    if (this.db) {
      if (cutoff > 0) {
        this.db.prepare('DELETE FROM history WHERE profile_id = ? AND last_visit_time >= ?').run(profileId, cutoff);
      } else {
        this.db.prepare('DELETE FROM history WHERE profile_id = ?').run(profileId);
      }
    } else {
      this.fallbackData.history = this.fallbackData.history.filter(h => {
        if (h.profile_id !== profileId) return true;
        return cutoff > 0 ? h.last_visit_time < cutoff : false;
      });
      this.persistFallback();
    }
    return true;
  }

  // --- PROXIES ---
  getProxies() {
    if (this.db) {
      return this.db.prepare('SELECT * FROM proxy_settings ORDER BY created_at DESC').all();
    }
    return this.fallbackData.proxy_settings;
  }

  saveProxy(proxy) {
    const item = {
      id: proxy.id || `proxy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: proxy.name || 'Unnamed Proxy',
      type: proxy.type || 'none',
      host: proxy.host || '',
      port: Number(proxy.port) || 8080,
      username: proxy.username || '',
      password: proxy.password || '',
      bypass_list: proxy.bypass_list || '<local>',
      created_at: proxy.created_at || Date.now()
    };
    if (this.db) {
      this.db.prepare(`
        INSERT INTO proxy_settings (id, name, type, host, port, username, password, bypass_list, created_at)
        VALUES (@id, @name, @type, @host, @port, @username, @password, @bypass_list, @created_at)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          type = excluded.type,
          host = excluded.host,
          port = excluded.port,
          username = excluded.username,
          password = excluded.password,
          bypass_list = excluded.bypass_list
      `).run(item);
    } else {
      const idx = this.fallbackData.proxy_settings.findIndex(p => p.id === item.id);
      if (idx >= 0) this.fallbackData.proxy_settings[idx] = item;
      else this.fallbackData.proxy_settings.push(item);
      this.persistFallback();
    }
    return item;
  }

  deleteProxy(id) {
    if (this.db) {
      this.db.prepare('DELETE FROM proxy_settings WHERE id = ?').run(id);
      this.db.prepare('UPDATE profiles SET proxy_id = NULL WHERE proxy_id = ?').run(id);
    } else {
      this.fallbackData.proxy_settings = this.fallbackData.proxy_settings.filter(p => p.id !== id);
      this.fallbackData.profiles.forEach(p => {
        if (p.proxy_id === id) p.proxy_id = null;
      });
      this.persistFallback();
    }
    return true;
  }

  // --- SETTINGS ---
  getSettings() {
    const defaults = {
      theme: 'system',
      start_with_windows: false,
      minimize_to_tray: true,
      default_download_folder: '',
      hardware_acceleration: true,
      notifications: true,
      default_search_engine: 'https://duckduckgo.com/?q=',
      first_run_completed: false
    };

    if (this.db) {
      const rows = this.db.prepare('SELECT key, value FROM settings').all();
      const loaded = {};
      for (const row of rows) {
        try {
          loaded[row.key] = JSON.parse(row.value);
        } catch {
          loaded[row.key] = row.value;
        }
      }
      return { ...defaults, ...loaded };
    }
    return { ...defaults, ...this.fallbackData.settings };
  }

  saveSettings(settings) {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      const tx = this.db.transaction(() => {
        for (const [k, v] of Object.entries(settings)) {
          stmt.run(k, JSON.stringify(v));
        }
      });
      tx();
    } else {
      this.fallbackData.settings = { ...this.fallbackData.settings, ...settings };
      this.persistFallback();
    }
    return this.getSettings();
  }
}

module.exports = DatabaseManager;
