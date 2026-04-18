import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-harness-run-template-note="true"/);
assert.match(appJs, /class="control-overview-copy harness-run-template-note"/);
assert.match(appJs, /class="harness-run-template-command"/);

assert.match(stylesCss, /\.harness-run-template-note\s*\{/);
assert.match(stylesCss, /\.harness-run-template-note::before\s*\{/);
assert.match(stylesCss, /\.harness-run-template-kicker\s*\{/);
assert.match(stylesCss, /\.harness-run-template-command\s*\{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunTemplateNoteDesign: {
        insertionPoint: 'harnessRunDesk->templateNoteDesign->commandTemplate',
        marker: 'data-harness-run-template-note',
      },
    },
    null,
    2,
  ),
);
