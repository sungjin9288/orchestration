import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(
  stylesCss,
  /\.harness-execution-result-packet \.form-actions-compact \[data-harness-result-rerun="true"\]\s*\{[\s\S]*border-color:\s*rgba\(55,\s*93,\s*120,\s*0\.(?:2|22)\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(238,\s*247,\s*255,\s*0\.96\),\s*rgba\(223,\s*238,\s*249,\s*0\.98\)\);[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--execution\)\s*78%,\s*#20313d\s*22%\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultRerunCtaEmphasis: {
        insertionPoint: 'visibleExecutionResultRegister->actionRow->rerunControlEmphasis',
        marker: 'visible result action row rerun button uses execution emphasis',
      },
    },
    null,
    2,
  ),
);
