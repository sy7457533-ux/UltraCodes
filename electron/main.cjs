/**
 * ProfileNest Browser - Electron Main Process Bootstrap
 */

const ProfileNestApp = require('../src/main/app.cjs');

const browserApp = new ProfileNestApp();
browserApp.start().catch((err) => {
  console.error('[Fatal] Failed to launch ProfileNest Browser:', err);
  process.exit(1);
});
