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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-run-context="true"\] \.detail-copy-compact\s*\{[^}]*color:\s*rgba\(71,\s*84,\s*96,\s*0\.82\);[^}]*(?:font-size:\s*0\.84rem;)?[^}]*(?:line-height:\s*1\.42;)?[^}]*letter-spacing:\s*0\.01em;[^}]*\}/s,
);
assert.match(
  stylesCss,
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-run-context="true"\] \.detail-copy-compact code\s*\{[^}]*font-family:\s*"IBM Plex Mono",\s*"SFMono-Regular",\s*Consolas,\s*monospace;[^}]*(?:font-size:\s*0\.(?:74|75)rem;)?[^}]*(?:line-height:\s*1\.3;)?[^}]*color:\s*rgba\(29,\s*41,\s*52,\s*0\.94\);[^}]*font-weight:\s*600;[^}]*\}/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenRunContextValueEmphasis: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenRunContextGroup->valueEmphasis',
        marker: 'hidden run-context values use mono emphasis',
      },
    },
    null,
    2,
  ),
);
