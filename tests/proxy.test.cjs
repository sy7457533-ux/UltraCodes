/**
 * ProfileNest Browser - Proxy Configuration Unit Tests
 */

const assert = require('assert');
const { validateProxyConfig } = require('../src/shared/validation.cjs');

function runProxyTests() {
  console.log('Testing Proxy Configuration Validation...');

  // 1. Valid Direct / None
  const r1 = validateProxyConfig({ type: 'none', host: '', port: 0 });
  assert.strictEqual(r1.valid, true);

  // 2. Valid HTTP
  const r2 = validateProxyConfig({ type: 'http', host: '127.0.0.1', port: 8080 });
  assert.strictEqual(r2.valid, true);

  // 3. Valid SOCKS5
  const r3 = validateProxyConfig({ type: 'socks5', host: 'proxy.internal.net', port: 1080 });
  assert.strictEqual(r3.valid, true);

  // 4. Invalid Port
  const r4 = validateProxyConfig({ type: 'http', host: '127.0.0.1', port: 70000 });
  assert.strictEqual(r4.valid, false);

  // 5. Empty Host
  const r5 = validateProxyConfig({ type: 'http', host: '', port: 8080 });
  assert.strictEqual(r5.valid, false);

  // 6. Unknown Type
  const r6 = validateProxyConfig({ type: 'tor-custom', host: '127.0.0.1', port: 9050 });
  assert.strictEqual(r6.valid, false);

  console.log('Proxy Configuration Tests: PASSED');
}

module.exports = runProxyTests;
if (require.main === module) runProxyTests();
