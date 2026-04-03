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

assert.match(app, /function getAdvancedOpsEntrySignals\(options = \{\}\)/);
assert.match(app, /function renderAdvancedOpsEntrySignalRow\(entries = \[\]\)/);
assert.match(app, /surface: 'taskboard'/);
assert.match(app, /surface: 'logs'/);
assert.match(app, /surface: 'artifacts'/);
assert.match(app, /surface: 'decision-inbox'/);

assert.match(app, /const logsOpsEntrySignals = getAdvancedOpsEntrySignals\(\{/);
assert.match(app, /const logsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(logsOpsEntrySignals\);/);
assert.match(app, /signalRow: logsOpsEntrySignalRow,/);

assert.match(app, /const artifactsOpsEntrySignals = getAdvancedOpsEntrySignals\(\{/);
assert.match(app, /const artifactsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(artifactsOpsEntrySignals\);/);
assert.match(app, /signalRow: artifactsOpsEntrySignalRow,/);

assert.match(app, /const decisionOpsEntrySignals = getAdvancedOpsEntrySignals\(\{/);
assert.match(app, /const decisionOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(decisionOpsEntrySignals\);/);
assert.match(app, /signalRow: decisionOpsEntrySignalRow,/);

assert.match(app, /class="advanced-ops-entry-signal-row"/);
assert.match(
  app,
  /class="advanced-ops-entry-signal advanced-ops-entry-signal-\$\{escapeHtml\(entry\.surface\)\}"/,
);
assert.match(
  app,
  /class="advanced-ops-entry-signal-dot advanced-ops-entry-signal-dot-\$\{escapeHtml\(entry\.tone\)\}"/,
);
assert.match(app, /class="advanced-ops-entry-signal-label"/);
assert.match(app, /class="advanced-ops-entry-signal-status"/);

assert.match(styles, /\.advanced-ops-entry-signal-row \{/);
assert.match(styles, /\.advanced-ops-entry-signal \{/);
assert.match(styles, /\.advanced-ops-entry-signal-taskboard \{/);
assert.match(styles, /\.advanced-ops-entry-signal-logs \{/);
assert.match(styles, /\.advanced-ops-entry-signal-artifacts \{/);
assert.match(styles, /\.advanced-ops-entry-signal-decision-inbox \{/);
assert.match(styles, /\.advanced-ops-entry-signal-dot-success \{/);
assert.match(styles, /\.advanced-ops-entry-signal-dot-accent \{/);
assert.match(styles, /\.advanced-ops-entry-signal-dot-warning \{/);
assert.match(styles, /\.advanced-ops-entry-signal-dot-danger \{/);
assert.match(styles, /\.advanced-ops-entry-signal-dot-neutral \{/);
assert.match(styles, /\.advanced-ops-entry-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      advancedOpsSignalBridge: {
        surfaces: ['logs', 'artifacts', 'decision-inbox'],
        target: 'first-deck',
      },
    },
    null,
    2,
  ),
);
