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

assert.match(app, /function renderDeliverablesOpsEntryRow\(entries = \[\]\)/);
assert.match(app, /const latestRunForOps = linkedTask\.latestRunId \? data\.runMap\.get\(linkedTask\.latestRunId\) \|\| null : null;/);
assert.match(app, /const deliverablesOpsEntrySignals = \[/);
assert.match(app, /surface: 'taskboard'/);
assert.match(app, /surface: 'logs'/);
assert.match(app, /surface: 'artifacts'/);
assert.match(app, /surface: 'decision-inbox'/);
assert.match(app, /const opsEntrySignalRow = renderDeliverablesOpsEntryRow\(deliverablesOpsEntrySignals\);/);
assert.match(app, /\$\{opsEntrySignalRow\}/);
assert.match(app, /class="deliverables-ops-entry-row"/);
assert.match(app, /class="deliverables-ops-entry deliverables-ops-entry-\$\{escapeHtml\(entry\.surface\)\}"/);
assert.match(app, /class="deliverables-ops-entry-dot deliverables-ops-entry-dot-\$\{escapeHtml\(entry\.tone\)\}"/);
assert.match(app, /class="deliverables-ops-entry-label"/);
assert.match(app, /class="deliverables-ops-entry-status"/);

assert.match(styles, /\.deliverables-ops-entry-row \{/);
assert.match(styles, /\.deliverables-ops-entry \{/);
assert.match(styles, /\.deliverables-ops-entry-taskboard \{/);
assert.match(styles, /\.deliverables-ops-entry-logs \{/);
assert.match(styles, /\.deliverables-ops-entry-artifacts \{/);
assert.match(styles, /\.deliverables-ops-entry-decision-inbox \{/);
assert.match(styles, /\.deliverables-ops-entry-dot-success \{/);
assert.match(styles, /\.deliverables-ops-entry-dot-accent \{/);
assert.match(styles, /\.deliverables-ops-entry-dot-warning \{/);
assert.match(styles, /\.deliverables-ops-entry-dot-danger \{/);
assert.match(styles, /\.deliverables-ops-entry-dot-neutral \{/);
assert.match(styles, /\.deliverables-ops-entry-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesOpsEntrySignalBridge: {
        markers: ['taskboard', 'logs', 'artifacts', 'decision-inbox'],
        source: 'open-advanced-ops',
      },
    },
    null,
    2,
  ),
);
