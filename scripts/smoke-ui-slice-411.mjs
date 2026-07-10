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

assert.match(
  appJs,
  /const hiddenHarnessResultPacketMarkup = `\s+<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"\s+>\s+\$\{hiddenHarnessHeaderMarkup\}\s+\$\{hiddenHarnessContextSectionsMarkup\}\s+\$\{hiddenHarnessActionShelfFrameMarkup\}\s+\$\{hiddenHarnessPreviewMarkup\}/,
);
assert.match(
  appJs,
  /data-harness-execution-result-hidden="true"[\s\S]*\$\{hiddenHarnessResultPacketMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-hidden="true"[\s\S]{0,220}<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"/,
);
assert.match(
  appJs,
  /const hiddenHarnessHeaderMarkup = `\s+\$\{hiddenHarnessTitleRowMarkup\}\s+\$\{hiddenHarnessRestoreHintMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessContextSectionsMarkup = `\s+\$\{hiddenHarnessRunContextSectionMarkup\}\s+\$\{hiddenHarnessHarnessContextSectionMarkup\}\s+\$\{hiddenHarnessOperatorContextSectionMarkup\}/,
);

assert.match(stylesCss, /\.harness-execution-result-hidden-packet\s*\{/);
assert.match(stylesCss, /\.harness-execution-result-hidden-packet::before\s*\{/);
assert.match(stylesCss, /\.harness-execution-result-hidden-packet \.relation-strip-hidden-compact-block,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenPacketDesign: {
        insertionPoint: 'harnessRunDesk->hiddenResultPacketDesign->hiddenResultSurface',
        marker: 'data-harness-execution-result-hidden-packet',
        namedValues: [
          'hiddenHarnessResultPacketMarkup',
          'hiddenHarnessHeaderMarkup',
          'hiddenHarnessContextSectionsMarkup',
          'hiddenHarnessActionShelfFrameMarkup',
          'hiddenHarnessPreviewMarkup',
        ],
      },
    },
    null,
    2,
  ),
);
