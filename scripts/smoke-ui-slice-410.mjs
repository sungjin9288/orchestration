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

assert.match(appJs, /data-harness-execution-result-packet="true"/);
assert.match(
  appJs,
  /const visibleHarnessResultPacketMarkup = `\s+<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">\s+\$\{visibleHarnessHeaderMarkup\}\s+\$\{visibleHarnessSummaryRackMarkup\}\s+\$\{visibleHarnessActionShelfFrameMarkup\}\s+\$\{visibleHarnessPreviewMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessResultPacketMarkup\}/);
assert.match(
  appJs,
  /const visibleHarnessHeaderMarkup = `\s+\$\{visibleHarnessTitleRowMarkup\}\s+\$\{visibleHarnessTokenRowFrameMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true"[\s\S]{0,180}<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">[\s\S]{0,260}\$\{visibleHarnessHeaderMarkup\}/,
);

assert.match(stylesCss, /\.harness-execution-result-packet\s*\{/);
assert.match(stylesCss, /\.harness-execution-result-packet::before\s*\{/);
assert.match(stylesCss, /\.harness-execution-result-packet \.form-actions-compact,/);
assert.match(stylesCss, /\.harness-execution-result-packet \[data-harness-execution-preview="true"\]\s*\{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionResultPacketDesign: {
        insertionPoint: 'harnessRunDesk->latestResultPacketDesign->visibleResultSurface',
        marker: 'data-harness-execution-result-packet',
        namedValues: [
          'visibleHarnessResultPacketMarkup',
          'visibleHarnessHeaderMarkup',
          'visibleHarnessSummaryRackMarkup',
          'visibleHarnessActionShelfFrameMarkup',
          'visibleHarnessPreviewMarkup',
        ],
      },
    },
    null,
    2,
  ),
);
