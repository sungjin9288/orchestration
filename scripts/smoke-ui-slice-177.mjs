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

assert.match(app, /const opsEntrySignalRow = renderDeliverablesOpsEntryRow\(deliverablesOpsEntrySignals\);/);
assert.match(app, /const taskboardOpsEntrySignalRow = renderTaskboardOpsEntrySignalRow\(taskboardOpsEntrySignals\);/);
assert.match(app, /const logsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(logsOpsEntrySignals\);/);
assert.match(app, /const artifactsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(artifactsOpsEntrySignals\);/);
assert.match(app, /const decisionOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(decisionOpsEntrySignals\);/);

assert.match(app, /const taskboardDetailSignalRow = renderTaskboardOpsEntrySignalRow\(\[/);
assert.match(app, /const logsDetailSignalRow = `\s*<div class="logs-detail-signal-row">\s*\$\{logsOpsEntrySignalRow\}\s*<\/div>\s*`;/s);
assert.match(
  app,
  /const hintSignalRow = options\.signalRow\s*\?\s*`\s*<div class="breakdown-inbox-signal-row">\s*\$\{options\.signalRow\}\s*<\/div>\s*`\s*:\s*'';/s,
);
assert.match(
  app,
  /const decisionActionSignalRow = `\s*<div class="decision-action-signal-row">\s*\$\{decisionOpsEntrySignalRow\}\s*<\/div>\s*`;/s,
);

assert.match(
  app,
  /<div class="detail-block">\s*<div class="kv-grid">[\s\S]*?<\/div>\s*<div class="taskboard-detail-signal-row">\$\{taskboardDetailSignalRow\}<\/div>\s*<div class="relation-strip">/s,
);
assert.match(
  app,
  /<div class="detail-block detail-block-compact">\s*<p class="detail-key">실행 기본 정보<\/p>[\s\S]*?\$\{logsDetailSignalRow\}/s,
);
assert.match(app, /signalRow: artifactsOpsEntrySignalRow,/);
assert.match(app, /\$\{decisionActionSignalRow\}/);

assert.match(styles, /\.deliverables-ops-entry-row \{/);
assert.match(styles, /\.taskboard-ops-entry-signal-row \{/);
assert.match(styles, /\.advanced-ops-entry-signal-row \{/);
assert.match(styles, /\.taskboard-detail-signal-row \{/);
assert.match(styles, /\.logs-detail-signal-row \{/);
assert.match(styles, /\.breakdown-inbox-signal-row \{/);
assert.match(styles, /\.decision-action-signal-row \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      advancedOpsContinuityFreeze: {
        entry: 'deliverables-open-advanced-ops',
        decks: ['taskboard', 'logs', 'artifacts', 'decision-inbox'],
        firstZones: ['taskboard-detail', 'logs-detail', 'artifacts-hint', 'decision-action'],
      },
    },
    null,
    2,
  ),
);
