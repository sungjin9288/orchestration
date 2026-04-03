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

assert.match(app, /const councilHeartbeatSignals = getCompanySignalEntries\(/);
assert.match(app, /filter\(\(entry\) => \['mission', 'council', 'execution', 'decision-inbox'\]\.includes\(entry\.surface\)\)/);
assert.match(app, /class="council-heartbeat-signal-row"/);
assert.match(app, /class="council-heartbeat-signal council-heartbeat-signal-\$\{escapeHtml\(entry\.tone\)\}"/);
assert.match(app, /class="council-heartbeat-signal-dot"/);
assert.match(app, /class="council-heartbeat-signal-label"/);
assert.match(app, /class="council-heartbeat-signal-status"/);

assert.match(styles, /\.council-heartbeat-signal-row \{/);
assert.match(styles, /\.council-heartbeat-signal \{/);
assert.match(styles, /\.council-heartbeat-signal-success \{/);
assert.match(styles, /\.council-heartbeat-signal-accent \{/);
assert.match(styles, /\.council-heartbeat-signal-warning \{/);
assert.match(styles, /\.council-heartbeat-signal-danger \{/);
assert.match(styles, /\.council-heartbeat-signal-dot \{/);
assert.match(styles, /\.council-heartbeat-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilHeartbeatSignalBridge: {
        source: 'getCompanySignalEntries',
        markers: ['mission', 'council', 'execution', 'decision-inbox'],
      },
    },
    null,
    2,
  ),
);
