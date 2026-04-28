import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  indexHtml,
  /<p id="workspace-live-status" class="sr-only" aria-live="polite" aria-atomic="true">현재 workspace: 미션<\/p>/,
);
assert.match(
  indexHtml,
  /<main id="workspace-main" class="surface-stack" aria-labelledby="shell-dashboard-title" aria-describedby="workspace-live-status" tabindex="-1">/,
);
assert.match(styles, /\.sr-only \{[\s\S]*position:\s*absolute;[\s\S]*clip:\s*rect\(0, 0, 0, 0\);/);
assert.match(appJs, /workspaceLiveStatus: document\.querySelector\('#workspace-live-status'\)/);
assert.match(
  appJs,
  /elements\.workspaceLiveStatus\.textContent = `현재 workspace: \$\{getSurfaceDisplayName\(state\.surface\)\}\. 메뉴 그룹: \$\{getNavGroupLabel\(activeGroupId\)\}`;/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLiveStatus: {
        relationship: ['main aria-labelledby shell title', 'main aria-describedby live status'],
        behavior: ['polite live update', 'screen-reader only', 'preserve visible layout'],
      },
    },
    null,
    2,
  ),
);
