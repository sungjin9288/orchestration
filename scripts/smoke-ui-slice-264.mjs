import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /--accent:\s*#8b5a2b;/);
assert.match(styles, /\.office-sidebar-section:not\(\.office-sidebar-section-status\)\s*\{[\s\S]*display:\s*none;/s);
assert.match(styles, /\.shell-window-meta\s*\{[\s\S]*?display:\s*flex;/s);
assert.match(
  styles,
  /\.refresh-button\s*\{[\s\S]*background:\s*rgba\(255, 255, 255, 0\.99\);[\s\S]*color:\s*#16202a;/s,
);
assert.match(styles, /\.refresh-status\s*\{[\s\S]*color:\s*#556371;/s);
assert.match(
  styles,
  /\.surface\[data-surface="council"\] \.surface-panel,[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.surface-entry-frame \.charter-card:hover,[\s\S]*\.surface-entry-frame \.boardroom-seat:focus-within \{[\s\S]*transform:\s*none;/s,
);
assert.match(
  styles,
  /\.ops-list-button:hover,[\s\S]*transform:\s*none;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      chromeReadabilityReset: {
        palette: ['accent blue', 'cool neutral shell'],
        sidebar: ['secondary sidebar sections hidden', 'queue-first rail preserved'],
        header: ['extra window badges hidden', 'refresh card contrast fixed'],
        flattening: ['surface panels flatter', 'entry hover lift removed', 'ops rows no lift'],
      },
    },
    null,
    2,
  ),
);
