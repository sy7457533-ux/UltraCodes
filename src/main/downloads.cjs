/**
 * ProfileNest Browser - Downloads Manager
 * Manages per-profile Chromium downloads, tracks progress, and saves records to DB
 */

let shell;
try {
  const electron = require('electron');
  shell = electron.shell;
} catch (e) {
  shell = {
    openPath: () => {},
    showItemInFolder: () => {}
  };
}
const path = require('path');
const fs = require('fs');

class DownloadsManager {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.activeDownloads = new Map(); // downloadItemId -> DownloadItem
  }

  attachToSession(sessionInstance, profileId, defaultDownloadFolder) {
    sessionInstance.on('will-download', (event, item) => {
      const fileName = item.getFilename();
      const saveDir = defaultDownloadFolder || path.join(process.env.USERPROFILE || process.cwd(), 'Downloads');
      
      if (!fs.existsSync(saveDir)) {
        try {
          fs.mkdirSync(saveDir, { recursive: true });
        } catch {}
      }

      const savePath = path.join(saveDir, fileName);
      item.setSavePath(savePath);

      const downloadId = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      this.activeDownloads.set(downloadId, item);

      const meta = {
        id: downloadId,
        profile_id: profileId,
        file_name: fileName,
        file_path: savePath,
        file_size: item.getTotalBytes(),
        mime_type: item.getMimeType(),
        url: item.getURL(),
        status: 'in_progress',
        progress: 0,
        start_time: Date.now()
      };

      this.saveDownloadMeta(meta);

      item.on('updated', (e, state) => {
        if (state === 'interrupted') {
          meta.status = 'paused';
          this.logger?.warn('Downloads', `Download interrupted: ${fileName}`);
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            meta.status = 'paused';
          } else {
            meta.status = 'in_progress';
            const total = item.getTotalBytes();
            meta.progress = total > 0 ? Math.round((item.getReceivedBytes() / total) * 100) : 0;
          }
        }
        this.saveDownloadMeta(meta);
      });

      item.once('done', (e, state) => {
        this.activeDownloads.delete(downloadId);
        meta.end_time = Date.now();
        if (state === 'completed') {
          meta.status = 'completed';
          meta.progress = 100;
          this.logger?.info('Downloads', `Download completed: ${fileName}`);
        } else if (state === 'cancelled') {
          meta.status = 'cancelled';
        } else {
          meta.status = 'failed';
        }
        this.saveDownloadMeta(meta);
      });
    });
  }

  saveDownloadMeta(meta) {
    if (this.db) {
      if (this.db.db) {
        this.db.db.prepare(`
          INSERT INTO downloads_metadata (
            id, profile_id, file_name, file_path, file_size, mime_type, url,
            status, progress, start_time, end_time
          ) VALUES (
            @id, @profile_id, @file_name, @file_path, @file_size, @mime_type, @url,
            @status, @progress, @start_time, @end_time
          )
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            progress = excluded.progress,
            end_time = excluded.end_time
        `).run(meta);
      } else if (this.db.fallbackData) {
        const idx = this.db.fallbackData.downloads_metadata.findIndex(d => d.id === meta.id);
        if (idx >= 0) this.db.fallbackData.downloads_metadata[idx] = meta;
        else this.db.fallbackData.downloads_metadata.push(meta);
        this.db.persistFallback();
      }
    }
  }

  getDownloads(profileId) {
    if (this.db) {
      if (this.db.db) {
        return this.db.db.prepare('SELECT * FROM downloads_metadata WHERE profile_id = ? ORDER BY start_time DESC').all(profileId);
      }
      return this.db.fallbackData.downloads_metadata.filter(d => d.profile_id === profileId);
    }
    return [];
  }

  cancelDownload(id) {
    const item = this.activeDownloads.get(id);
    if (item) {
      item.cancel();
      this.activeDownloads.delete(id);
      return true;
    }
    return false;
  }

  openFile(filePath) {
    if (fs.existsSync(filePath)) {
      shell.openPath(filePath);
      return true;
    }
    return false;
  }

  openFolder(filePath) {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    } else {
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        shell.openPath(dir);
        return true;
      }
    }
    return false;
  }
}

module.exports = DownloadsManager;
