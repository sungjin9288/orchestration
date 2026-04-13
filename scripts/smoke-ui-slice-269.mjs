import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function registerQaHooks\(\)/);
assert.match(appJs, /window\.__orchestrationQa = \{/);
assert.match(appJs, /getState\(\)/);
assert.match(appJs, /openSurface\(surface, options = \{\}\)/);
assert.match(appJs, /state\.menuGroup = getNavGroupForSurface\(surface\);/);
assert.match(appJs, /state\.surface = surface;/);
assert.match(appJs, /syncSelectionsFromTask\(options\.taskId\);/);
assert.match(appJs, /render\(\);/);
assert.match(appJs, /registerQaHooks\(\);\s*void bootstrap\(\);/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      qaSurfaceHook: {
        markers: [
          'registerQaHooks()',
          'window.__orchestrationQa',
          'getState()',
          'openSurface(surface, options = {})',
          'state.menuGroup = getNavGroupForSurface(surface);',
          'state.surface = surface;',
          'syncSelectionsFromTask(options.taskId);',
          'registerQaHooks(); void bootstrap();',
        ],
      },
    },
    null,
    2,
  ),
);
