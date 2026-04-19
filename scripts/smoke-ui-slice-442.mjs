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

assert.match(appJs, /data-harness-execution-input-summary="true"/);
assert.match(appJs, /data-harness-execution-output-summary="true"/);

assert.match(
  stylesCss,
  /\.harness-execution-result-packet \[data-harness-execution-input-summary="true"\],\s*\.harness-execution-result-packet \[data-harness-execution-output-summary="true"\]\s*\{[\s\S]*color:\s*rgba\(74,\s*91,\s*102,\s*0\.78\);[\s\S]*letter-spacing:\s*0\.01em;/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-result-packet \[data-harness-execution-input-summary="true"\] code,\s*\.harness-execution-result-packet \[data-harness-execution-output-summary="true"\] code\s*\{[\s\S]*color:\s*rgba\(29,\s*41,\s*52,\s*0\.94\);[\s\S]*font-weight:\s*600;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPathLabelValueHierarchy: {
        insertionPoint: 'visibleExecutionResultRegister->pathDetailRows->labelValueHierarchy',
        marker: 'visible result path rows use label/value hierarchy',
      },
    },
    null,
    2,
  ),
);
