import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const resetDocPath = path.join(repoRoot, 'docs', '10_company-shell-design-reset.md');

const resetDoc = fs.readFileSync(resetDocPath, 'utf8');

assert.match(resetDoc, /## Current Freeze Candidate/);
assert.match(resetDoc, /one control header \+ grouped workspace/);
assert.match(resetDoc, /회사 디렉터리/);
assert.match(resetDoc, /workflow map -> selected work order -> execution handoff/);
assert.match(resetDoc, /queue -> selected packet -> inspector/);
assert.match(resetDoc, /scope tabs -> read-only roster -> mutation editor/);
assert.match(resetDoc, /## Bundle Boundary For Commit Candidate/);
assert.match(resetDoc, /ui\/index\.html/);
assert.match(resetDoc, /ui\/app\.js/);
assert.match(resetDoc, /ui\/styles\.css/);
assert.match(resetDoc, /src\/execution\/\*/);
assert.match(resetDoc, /## Freeze Gate For This Bundle/);
assert.match(resetDoc, /node --check ui\/app\.js/);
assert.match(resetDoc, /node scripts\/smoke-ui-slice-293\.mjs/);
assert.match(resetDoc, /node scripts\/smoke-qa-slice-06\.mjs/);
assert.match(resetDoc, /node scripts\/smoke-qa-slice-07\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      freezeCandidate: {
        viewport: 'one control header + grouped workspace',
        sidebar: '회사 디렉터리',
        workspaces: [
          'workflow map -> selected work order -> execution handoff',
          'queue -> selected packet -> inspector',
          'scope tabs -> read-only roster -> mutation editor',
        ],
        gate: [
          'node --check ui/app.js',
          'node scripts/smoke-ui-slice-293.mjs',
          'node scripts/smoke-qa-slice-06.mjs',
          'node scripts/smoke-qa-slice-07.mjs',
        ],
      },
    },
    null,
    2,
  ),
);
