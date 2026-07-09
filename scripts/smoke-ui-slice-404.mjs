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

assert.match(appJs, /data-harness-run-action-shelf="true"/);
assert.match(appJs, /class="form-actions form-actions-inline harness-run-action-shelf"/);
assert.match(
  appJs,
  /const harnessRunActionShelfMarkup = `\s+\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}\s+\$\{harnessRunPolicyReportPreviewActionMarkup\}\s+\$\{harnessRunSubmitActionMarkup\}/,
);
assert.match(appJs, /\$\{harnessRunActionShelfMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-run-action-shelf="true"[\s\S]{0,260}\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}/,
);
assert.doesNotMatch(appJs, /data-harness-run-action-shelf="true"[\s\S]{0,1800}<button/);

assert.match(stylesCss, /\.harness-run-action-shelf\s*\{/);
assert.match(stylesCss, /\.harness-run-action-shelf::before\s*\{/);
assert.match(stylesCss, /\.harness-run-action-shelf \.primary-button,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunActionShelfDesign: {
        insertionPoint: 'harnessRunForm->actionShelfDesign->commandRow',
        marker: 'data-harness-run-action-shelf',
        namedValues: [
          'harnessRunCommandCopyMarkup',
          'harnessRunClearHistoryActionMarkup',
          'harnessRunPolicyReportPreviewActionMarkup',
          'harnessRunSubmitActionMarkup',
          'harnessRunActionShelfMarkup',
        ],
      },
    },
    null,
    2,
  ),
);
