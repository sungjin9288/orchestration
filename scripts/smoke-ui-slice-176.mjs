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

assert.match(app, /const pendingTaskApprovals = taskApprovals\.filter\(\(approval\) => approval\.status === 'pending'\);/);
assert.match(app, /const pendingTaskInboxItems = taskInboxItems\.filter\(\(item\) => item\.status === 'pending'\);/);
assert.match(app, /const preferredTaskInboxItem = getPreferredTaskInboxItem\(task\.id, data\);/);
assert.match(app, /const latestTaskArtifact = taskArtifacts\[0\] \|\| null;/);
assert.match(app, /const taskboardDetailSignalRow = renderTaskboardOpsEntrySignalRow\(\[/);
assert.match(
  app,
  /<div class="detail-block">\s*<div class="kv-grid">[\s\S]*?<\/div>\s*<div class="taskboard-detail-signal-row">\$\{taskboardDetailSignalRow\}<\/div>\s*<div class="relation-strip">/s,
);

assert.match(styles, /\.taskboard-detail-signal-row \{/);
assert.match(
  styles,
  /\.surface\[data-surface="taskboard"\] \.taskboard-detail-signal-row \.taskboard-ops-entry-signal-row \{/,
);
assert.match(
  styles,
  /\.surface\[data-surface="taskboard"\] \.taskboard-detail-signal-row \.taskboard-ops-entry-signal-status \{/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardDetailSignalBridge: {
        surface: 'taskboard',
        target: 'first-detail-block',
      },
    },
    null,
    2,
  ),
);
