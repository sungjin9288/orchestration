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

assert.match(app, /const executionCommandSignals = getCompanySignalEntries\(/);
assert.match(
  app,
  /filter\(\(entry\) => \['council', 'execution', 'deliverables', 'decision-inbox'\]\.includes\(entry\.surface\)\)/,
);
assert.match(app, /class="execution-command-signal-row"/);
assert.match(app, /class="execution-command-signal execution-command-signal-\$\{escapeHtml\(entry\.surface\)\}"/);
assert.match(
  app,
  /class="execution-command-signal-dot execution-command-signal-dot-\$\{escapeHtml\(entry\.tone\)\}"/,
);
assert.match(app, /class="execution-command-signal-label"/);
assert.match(app, /class="execution-command-signal-status"/);

assert.match(styles, /\.execution-command-signal-row \{/);
assert.match(styles, /\.execution-command-signal \{/);
assert.match(styles, /\.execution-command-signal-council \{/);
assert.match(styles, /\.execution-command-signal-execution \{/);
assert.match(styles, /\.execution-command-signal-deliverables \{/);
assert.match(styles, /\.execution-command-signal-decision-inbox \{/);
assert.match(styles, /\.execution-command-signal-dot-success \{/);
assert.match(styles, /\.execution-command-signal-dot-accent \{/);
assert.match(styles, /\.execution-command-signal-dot-warning \{/);
assert.match(styles, /\.execution-command-signal-dot-danger \{/);
assert.match(styles, /\.execution-command-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionCommandSignalBridge: {
        source: 'getCompanySignalEntries',
        markers: ['council', 'execution', 'deliverables', 'decision-inbox'],
      },
    },
    null,
    2,
  ),
);
