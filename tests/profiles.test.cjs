/**
 * ProfileNest Browser - Profile Unit Tests
 */

const assert = require('assert');
const ProfileManager = require('../src/main/profiles.cjs');
const DatabaseManager = require('../src/main/database.cjs');
const fs = require('fs');
const path = require('path');

function runProfileTests() {
  console.log('Testing Profile Lifecycle & Management...');

  const tempDir = path.join(process.cwd(), 'tests', 'temp-profile-test');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const db = new DatabaseManager(path.join(tempDir, 'test.sqlite'));
  const pm = new ProfileManager(tempDir, db);

  // 1. Create Profile
  const p1 = pm.createProfile({
    name: 'Work Profile',
    avatar: 'Briefcase',
    color: '#0d9488',
    notes: 'Work tasks only'
  });

  assert.strictEqual(p1.name, 'Work Profile');
  assert.ok(fs.existsSync(p1.data_path), 'Profile directory must exist on disk');

  // 2. Duplicate Profile
  const p2 = pm.duplicateProfile(p1.id, 'Work Profile Clone');
  assert.notStrictEqual(p1.id, p2.id, 'Duplicated profile must have unique ID');
  assert.notStrictEqual(p1.data_path, p2.data_path, 'Duplicated profile must have unique data directory');
  assert.strictEqual(p2.name, 'Work Profile Clone');

  // 3. Profile Locking
  pm.markRunning(p1.id);
  assert.strictEqual(pm.isProfileRunning(p1.id), true);

  assert.throws(() => {
    pm.deleteProfile(p1.id);
  }, /Cannot delete an active, running profile/, 'Active running profile must not be deleted');

  // 4. Release Lock & Delete
  pm.markClosed(p1.id);
  const deleted = pm.deleteProfile(p1.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(pm.getProfile(p1.id), null);
  assert.strictEqual(fs.existsSync(p1.data_path), false, 'Profile directory must be removed on delete');

  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Profile Lifecycle Tests: PASSED');
}

module.exports = runProfileTests;
if (require.main === module) runProfileTests();
