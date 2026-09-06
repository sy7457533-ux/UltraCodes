/**
 * ProfileNest Browser - Session Isolation Unit Tests
 */

const assert = require('assert');
const SessionManager = require('../src/main/sessions.cjs');

function runIsolationTests() {
  console.log('Testing Profile Session Isolation Guarantees...');

  const sm = new SessionManager();

  const partitionA = sm.getPartitionKey('profile-alpha');
  const partitionB = sm.getPartitionKey('profile-beta');

  assert.strictEqual(partitionA, 'persist:profile-profile-alpha');
  assert.strictEqual(partitionB, 'persist:profile-profile-beta');
  assert.notStrictEqual(partitionA, partitionB, 'Partition keys must never collide');

  // Verify persistent partition prefix (Electron requires persist: prefix for disk storage)
  assert.ok(partitionA.startsWith('persist:'), 'Partition must be persistent, not in-memory');
  assert.ok(partitionB.startsWith('persist:'), 'Partition must be persistent, not in-memory');

  console.log('Session Isolation Tests: PASSED');
}

module.exports = runIsolationTests;
if (require.main === module) runIsolationTests();
