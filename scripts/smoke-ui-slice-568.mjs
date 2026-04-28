import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /<a class="skip-link" href="#workspace-main">현재 workspace로 바로가기<\/a>/);
assert.match(
  indexHtml,
  /<main id="workspace-main" class="surface-stack" aria-labelledby="shell-dashboard-title" aria-describedby="workspace-live-status" tabindex="-1">/,
);
assert.match(styles, /\.skip-link \{[\s\S]*position:\s*fixed;[\s\S]*transform:\s*translateY\(-140%\);/);
assert.match(styles, /\.skip-link:focus-visible \{[\s\S]*transform:\s*translateY\(0\);/);
assert.match(styles, /\.surface-stack:focus-visible \{[\s\S]*outline:\s*2px solid rgba\(37, 99, 235, 0\.16\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceSkipLink: {
        target: 'workspace-main',
        behavior: ['focus-only visible', 'skip sidebar', 'preserve surface routing'],
      },
    },
    null,
    2,
  ),
);
