import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const opsEntrySignalsPath = path.join(repoRoot, 'ui', 'ops-entry-signals.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const opsEntrySignals = fs.readFileSync(opsEntrySignalsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(opsEntrySignals, /export function renderTaskboardOpsEntrySignalRow\(entries = \[\]\)/);
assert.match(app, /const focusedTaskArtifacts = focusedTask \? getTaskArtifacts\(focusedTask\.id, data\.artifacts\)\.sort\(sortByCreatedDesc\) : \[\];/);
assert.match(app, /const focusedTaskLatestArtifact = focusedTaskArtifacts\[0\] \|\| null;/);
assert.match(app, /const focusedTaskLatestRun = focusedTask\?\.latestRunId \? data\.runMap\.get\(focusedTask\.latestRunId\) \|\| null : null;/);
assert.match(app, /const focusedTaskPreferredInboxItem = focusedTask \? getPreferredTaskInboxItem\(focusedTask\.id, data\) : null;/);
assert.match(app, /const taskboardOpsEntrySignals = \[/);
assert.match(app, /surface: 'taskboard'/);
assert.match(app, /surface: 'logs'/);
assert.match(app, /surface: 'artifacts'/);
assert.match(app, /surface: 'decision-inbox'/);
assert.match(app, /const taskboardOpsEntrySignalRow = renderTaskboardOpsEntrySignalRow\(taskboardOpsEntrySignals\);/);
assert.match(app, /signalRow: taskboardOpsEntrySignalRow,/);
assert.match(opsEntrySignals, /class="taskboard-ops-entry-signal-row"/);
assert.match(opsEntrySignals, /class="taskboard-ops-entry-signal taskboard-ops-entry-signal-\$\{escapeHtml\(entry\.surface\)\}"/);
assert.match(opsEntrySignals, /class="taskboard-ops-entry-signal-dot taskboard-ops-entry-signal-dot-\$\{escapeHtml\(entry\.tone\)\}"/);
assert.match(opsEntrySignals, /class="taskboard-ops-entry-signal-label"/);
assert.match(opsEntrySignals, /class="taskboard-ops-entry-signal-status"/);

assert.match(styles, /\.taskboard-ops-entry-signal-row \{/);
assert.match(styles, /\.taskboard-ops-entry-signal \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-taskboard \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-logs \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-artifacts \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-decision-inbox \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-dot-success \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-dot-accent \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-dot-warning \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-dot-danger \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-dot-neutral \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardOpsEntrySignalBridge: {
        markers: ['taskboard', 'logs', 'artifacts', 'decision-inbox'],
        target: 'taskboardDeck',
      },
    },
    null,
    2,
  ),
);
