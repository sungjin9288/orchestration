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

assert.match(app, /function renderDeliverablesShelfSignalRow\(entries = \[\], surfaces = \[\]\)/);
assert.match(app, /const deliverablesActionSignals = getCompanySignalEntries\(/);
assert.match(
  app,
  /const reviewActionSignalRow = renderDeliverablesShelfSignalRow\(deliverablesActionSignals, \[\s*'execution',\s*'deliverables',\s*'decision-inbox',\s*\]\);/,
);
assert.match(
  app,
  /const approvalActionSignalRow = renderDeliverablesShelfSignalRow\(deliverablesActionSignals, \[\s*'decision-inbox',\s*'execution',\s*'deliverables',\s*\]\);/,
);
assert.match(
  app,
  /const closeOutActionSignalRow = renderDeliverablesShelfSignalRow\(\s*deliverablesActionSignals,\s*missionCompletionReady \? \['deliverables', 'mission'\] : \['execution', 'deliverables'\],\s*\);/,
);
assert.match(
  app,
  /const opsActionSignalRow = renderDeliverablesShelfSignalRow\(deliverablesActionSignals, \[\s*'deliverables',\s*'decision-inbox',\s*\]\);/,
);
assert.match(app, /\$\{reviewActionSignalRow\}/);
assert.match(app, /\$\{approvalActionSignalRow\}/);
assert.match(app, /\$\{closeOutActionSignalRow\}/);
assert.match(app, /\$\{opsActionSignalRow\}/);
assert.match(app, /class="deliverables-shelf-signal-row"/);
assert.match(
  app,
  /class="deliverables-shelf-signal deliverables-shelf-signal-\$\{escapeHtml\(entry\.surface\)\}"/,
);
assert.match(
  app,
  /class="deliverables-shelf-signal-dot deliverables-shelf-signal-dot-\$\{escapeHtml\(entry\.tone\)\}"/,
);
assert.match(app, /class="deliverables-shelf-signal-label"/);
assert.match(app, /class="deliverables-shelf-signal-status"/);

assert.match(styles, /\.deliverables-shelf-signal-row \{/);
assert.match(styles, /\.deliverables-shelf-signal \{/);
assert.match(styles, /\.deliverables-shelf-signal-execution \{/);
assert.match(styles, /\.deliverables-shelf-signal-deliverables \{/);
assert.match(styles, /\.deliverables-shelf-signal-decision-inbox \{/);
assert.match(styles, /\.deliverables-shelf-signal-mission \{/);
assert.match(styles, /\.deliverables-shelf-signal-dot-success \{/);
assert.match(styles, /\.deliverables-shelf-signal-dot-accent \{/);
assert.match(styles, /\.deliverables-shelf-signal-dot-warning \{/);
assert.match(styles, /\.deliverables-shelf-signal-dot-danger \{/);
assert.match(styles, /\.deliverables-shelf-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesActionShelfSignalBridge: {
        markers: ['execution', 'deliverables', 'decision-inbox', 'mission'],
        sections: ['review', 'approval', 'close-out', 'ops'],
      },
    },
    null,
    2,
  ),
);
