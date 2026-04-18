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

assert.match(appJs, /data-harness-run-path-guidance="true"/);
assert.match(appJs, /class="form-help form-help-policy-note"/);
assert.match(appJs, /form-help-policy-kicker">경로 정책</);
assert.match(appJs, /<code>repo root<\/code>/);

assert.match(stylesCss, /\.form-help-policy-note\s*\{/);
assert.match(stylesCss, /\.form-help-policy-note::before\s*\{/);
assert.match(stylesCss, /\.form-help-policy-kicker\s*\{/);
assert.match(stylesCss, /\.form-help-policy-copy\s*\{/);
assert.match(stylesCss, /\.form-help-policy-note code\s*\{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunPolicyNoteDesign: {
        insertionPoint: 'harnessRunForm->policyNoteDesign->helperNote',
        marker: '경로 정책',
      },
    },
    null,
    2,
  ),
);
