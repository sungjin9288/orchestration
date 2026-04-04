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

assert.match(app, /const deliverablesSignalEntries = getCompanySignalEntries\(/);
assert.match(
  app,
  /\['execution', 'deliverables', 'decision-inbox', 'mission'\]\s*\.map\(\(surface\) => deliverablesSignalEntries\.find\(\(entry\) => entry\.surface === surface\)\)/,
);
assert.match(app, /class="deliverables-report-signal-row"/);
assert.match(
  app,
  /class="deliverables-report-signal deliverables-report-signal-\$\{escapeHtml\(entry\.surface\)\}"/,
);
assert.match(
  app,
  /class="deliverables-report-signal-dot deliverables-report-signal-dot-\$\{escapeHtml\(entry\.tone\)\}"/,
);
assert.match(app, /class="deliverables-report-signal-label"/);
assert.match(app, /class="deliverables-report-signal-status"/);
assert.match(app, /\$\{options\.signalRow \|\| ''\}/);

assert.match(styles, /\.deliverables-report-signal-row \{/);
assert.match(styles, /\.deliverables-report-signal \{/);
assert.match(styles, /\.deliverables-report-signal-execution \{/);
assert.match(styles, /\.deliverables-report-signal-deliverables \{/);
assert.match(styles, /\.deliverables-report-signal-decision-inbox \{/);
assert.match(styles, /\.deliverables-report-signal-mission \{/);
assert.match(styles, /\.deliverables-report-signal-dot-success \{/);
assert.match(styles, /\.deliverables-report-signal-dot-accent \{/);
assert.match(styles, /\.deliverables-report-signal-dot-warning \{/);
assert.match(styles, /\.deliverables-report-signal-dot-danger \{/);
assert.match(styles, /\.deliverables-report-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesReportSignalBridge: {
        source: 'getCompanySignalEntries',
        markers: ['execution', 'deliverables', 'decision-inbox', 'mission'],
      },
    },
    null,
    2,
  ),
);
