/**
 * ProfileNest Browser - Database Unit Tests
 */

const assert = require('assert');
const DatabaseManager = require('../src/main/database.cjs');
const fs = require('fs');
const path = require('path');

function runDatabaseTests() {
  console.log('Testing Database Operations & Cascades...');

  const tempDir = path.join(process.cwd(), 'tests', 'temp-db-test');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const db = new DatabaseManager(path.join(tempDir, 'test.sqlite'));

  // 1. Profile Insertion
  const p = db.saveProfile({
    id: 'test-p-1',
    name: 'Secure Vault',
    avatar: 'Shield',
    notes: 'Secure session',
    color: '#16a34a',
    data_path: '/path/to/data'
  });
  assert.strictEqual(p.name, 'Secure Vault');

  // 2. Bookmarks Insertion
  const bm = db.addBookmark({
    profile_id: 'test-p-1',
    title: 'DuckDuckGo',
    url: 'https://duckduckgo.com'
  });
  assert.strictEqual(bm.title, 'DuckDuckGo');

  const bookmarks = db.getBookmarks('test-p-1');
  assert.strictEqual(bookmarks.length, 1);

  // 3. History Insertion & Accumulation
  db.addHistoryEntry({
    profile_id: 'test-p-1',
    title: 'DuckDuckGo',
    url: 'https://duckduckgo.com'
  });
  db.addHistoryEntry({
    profile_id: 'test-p-1',
    title: 'DuckDuckGo',
    url: 'https://duckduckgo.com'
  });

  const history = db.getHistory('test-p-1');
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].visit_count, 2);

  // 4. Cascade deletion on profile delete
  db.deleteProfile('test-p-1');
  assert.strictEqual(db.getBookmarks('test-p-1').length, 0);
  assert.strictEqual(db.getHistory('test-p-1').length, 0);

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Database Operations Tests: PASSED');
}

module.exports = runDatabaseTests;
if (require.main === module) runDatabaseTests();
