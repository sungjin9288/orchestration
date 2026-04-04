import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /const missionSignalBySurface = Object\.fromEntries\(/);
assert.match(app, /getCompanySignalEntries\(\{\s*mission,/);
assert.match(app, /class="mission-row-rail-signal mission-row-rail-signal-\$\{escapeHtml\(railSignal\.tone \|\| 'neutral'\)\}"/);
assert.match(app, /class="mission-row-rail-signal-dot"/);
assert.match(app, /class="mission-row-rail-signal-label"/);
assert.match(app, /class="mission-row-rail-signal-status"/);

assert.match(styles, /\.mission-row-rail-signal \{/);
assert.match(styles, /\.mission-row-rail-signal-success \{/);
assert.match(styles, /\.mission-row-rail-signal-accent \{/);
assert.match(styles, /\.mission-row-rail-signal-warning \{/);
assert.match(styles, /\.mission-row-rail-signal-dot \{/);
assert.match(styles, /\.mission-row-rail-button-next \.mission-row-rail-signal \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionQuickRailSignal: {
        source: 'getCompanySignalEntries',
        marker: 'mission-row-rail-signal',
      },
    },
    null,
    2,
  ),
);
