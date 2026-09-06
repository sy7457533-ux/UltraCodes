/**
 * ProfileNest Browser - Backup & Restore Unit Tests
 */

const assert = require('assert');
const ProfileManager = require('../src/main/profiles.cjs');
const DatabaseManager = require('../src/main/database.cjs');
const BackupManager = require('../src/main/backup.cjs');
const fs = require('fs');
const path = require('path');

async function runBackupTests() {
  console.log('Testing Profile Backup & Restore...');

  const tempDir = path.join(process.cwd(), 'tests', 'temp-backup-test');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const db = new DatabaseManager(path.join(tempDir, 'test.sqlite'));
  const pm = new ProfileManager(tempDir, db);
  const bm = new BackupManager(pm, db);

  // 1. Create a profile with some sample data
  const p = pm.createProfile({
    name: 'Backup Subject',
    avatar: 'Laptop',
    notes: 'Important notes'
  });

  db.addBookmark({
    profile_id: p.id,
    title: 'Example',
    url: 'https://example.com'
  });

  // 2. Export to ZIP
  const zipPath = path.join(tempDir, 'export.zip');
  const exportResult = await bm.exportProfileToZip(p.id, zipPath);
  assert.strictEqual(exportResult.success, true);
  assert.ok(fs.existsSync(zipPath), 'Exported ZIP file must exist');

  // 3. Restore to a new profile
  const restored = await bm.importProfileFromZip(zipPath, 'Restored Subject');
  assert.strictEqual(restored.name, 'Restored Subject');
  assert.notStrictEqual(restored.id, p.id, 'Restored profile must have a fresh unique ID');

  const restoredBookmarks = db.getBookmarks(restored.id);
  assert.strictEqual(restoredBookmarks.length, 1);
  assert.strictEqual(restoredBookmarks[0].title, 'Example');

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Backup & Restore Tests: PASSED');
}

module.exports = runBackupTests;
if (require.main === module) runBackupTests();
