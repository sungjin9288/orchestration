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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-harness-context="true"\] \.detail-copy-compact code\s*\{[^}]*font-family:\s*"IBM Plex Mono",\s*"SFMono-Regular",\s*Consolas,\s*monospace;[^}]*font-size:\s*0\.75rem;[^}]*line-height:\s*1\.3;[^}]*letter-spacing:\s*-0\.01em;[^}]*color:\s*rgba\(30,\s*42,\s*52,\s*0\.93\);[^}]*font-weight:\s*600;[^}]*\}/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenHarnessContextCodeLineHeightFollowup: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenHarnessContextGroup->monoValueRhythm',
        marker: 'hidden harness-context code uses tighter mono rhythm',
      },
    },
    null,
    2,
  ),
);
