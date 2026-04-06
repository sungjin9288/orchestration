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

assert.match(app, /const logsOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(logsOpsEntrySignals\);/);
assert.match(
  app,
  /const logsDetailSignalRow = `\s*<div class="logs-detail-signal-row">\s*\$\{logsOpsEntrySignalRow\}\s*<\/div>\s*`;/s,
);
assert.match(
  app,
  /<div class="detail-block detail-block-compact">\s*<p class="detail-key">실행 기본 정보<\/p>[\s\S]*?\$\{logsDetailSignalRow\}[\s\S]*?<div class="kv-grid kv-grid-compact">/s,
);

assert.match(styles, /\.logs-detail-signal-row \{/);
assert.match(
  styles,
  /\.surface\[data-surface="logs"\] \.logs-detail-signal-row \.advanced-ops-entry-signal-row \{/,
);
assert.match(
  styles,
  /\.surface\[data-surface="logs"\] \.logs-detail-signal-row \.advanced-ops-entry-signal-status \{/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      logsDetailSignalBridge: {
        surface: 'logs',
        target: 'first-detail-block',
      },
    },
    null,
    2,
  ),
);
