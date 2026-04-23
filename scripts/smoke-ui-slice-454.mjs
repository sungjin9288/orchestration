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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-operator-context="true"\] \.detail-copy-compact\s*\{[^}]*color:\s*rgba\(96,\s*86,\s*70,\s*0\.8\);[^}]*(?:font-size:\s*0\.84rem;)?[^}]*(?:line-height:\s*1\.42;)?[^}]*letter-spacing:\s*0\.01em;[^}]*\}/s,
);
assert.match(
  stylesCss,
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-operator-context="true"\] \.detail-copy-compact code\s*\{[^}]*font-family:\s*"IBM Plex Mono",\s*"SFMono-Regular",\s*Consolas,\s*monospace;[^}]*font-size:\s*0\.75rem;[^}]*(?:line-height:\s*1\.3;)?[^}]*color:\s*rgba\(76,\s*59,\s*28,\s*0\.92\);[^}]*font-weight:\s*600;[^}]*\}/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenOperatorContextValueEmphasis: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenOperatorContextGroup->valueEmphasis',
        marker: 'hidden operator-context values use mono emphasis',
      },
    },
    null,
    2,
  ),
);
