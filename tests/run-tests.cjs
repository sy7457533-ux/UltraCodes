/**
 * ProfileNest Browser - Unified Test Runner
 */

const runProfileTests = require('./profiles.test.cjs');
const runIsolationTests = require('./isolation.test.cjs');
const runDatabaseTests = require('./database.test.cjs');
const runBackupTests = require('./backup.test.cjs');
const runProxyTests = require('./proxy.test.cjs');

async function main() {
  console.log('====================================================');
  console.log(' ProfileNest Browser Test Suite - Execution Started');
  console.log('====================================================\n');

  try {
    runProfileTests();
    runIsolationTests();
    runDatabaseTests();
    await runBackupTests();
    runProxyTests();

    console.log('\n====================================================');
    console.log(' ALL 5 TEST SUITES COMPLETED SUCCESSFULLY (100% PASS)');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failed with Error:');
    console.error(err);
    process.exit(1);
  }
}

main();
