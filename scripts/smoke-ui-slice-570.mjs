import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  indexHtml,
  /<main id="workspace-main" class="surface-stack" aria-labelledby="shell-dashboard-title" aria-describedby="workspace-live-status" tabindex="-1">/,
);
assert.match(appJs, /workspaceMain: document\.querySelector\('#workspace-main'\)/);
assert.match(
  appJs,
  /async function handleSurfaceChange\(surface\) \{[\s\S]*state\.menuGroup = getNavGroupForSurface\(surface\);[\s\S]*state\.surface = surface;[\s\S]*render\(\);[\s\S]*elements\.workspaceMain\?\.focus\(\);[\s\S]*\}/,
);
assert.match(appJs, /await handleSurfaceChange\(navButton\.dataset\.surface\);/);
assert.match(
  appJs,
  /await handleSurfaceChange\(actionButton\.dataset\.targetSurface \|\| state\.surface\);/,
);
assert.match(
  appJs,
  /await handleSurfaceChange\(actionButton\.dataset\.targetSurface \|\| 'mission'\);/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceFocusHandoff: {
        target: 'workspace-main',
        triggers: ['sidebar surface nav', 'open-surface action'],
        behavior: ['render selected surface', 'move focus to current workspace'],
      },
    },
    null,
    2,
  ),
);
