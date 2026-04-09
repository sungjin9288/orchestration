import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const resetDocPath = path.join(repoRoot, 'docs', '10_company-shell-design-reset.md');

const resetDoc = fs.readFileSync(resetDocPath, 'utf8');

assert.match(resetDoc, /### Exact File Inventory For Current Snapshot/);
assert.match(resetDoc, /scripts\/qa-slice-06-runner\.mjs/);
assert.match(resetDoc, /scripts\/qa-slice-07-runner\.mjs/);
assert.match(resetDoc, /scripts\/smoke-ui-slice-\{17,20,36,40,45,49,53,59,71,72,73,74,75,82,84,85,90,91,93,94,95,96,97,98,99,100,106,107,108,116,121,122,128,138,140,157,158,159,160,161,181,183,199,200,203,233,234,235,236,237,244,245\}\.mjs/);
assert.match(resetDoc, /scripts\/smoke-ui-slice-\{246\.\.293\}\.mjs/);
assert.match(resetDoc, /### Staging Rule For This Bundle/);
assert.match(resetDoc, /do not use repo-wide staging like `git add \.`/);
assert.match(resetDoc, /scripts\/qa-slice-05-runner\.mjs/);
assert.match(resetDoc, /docs\/00_master-brief\.md/);
assert.match(resetDoc, /docs\/06_ai-orchestration-pivot\.md/);
assert.match(resetDoc, /src\/execution\/\*/);
assert.match(resetDoc, /scripts\/smoke-provider-\*/);

console.log(
  JSON.stringify(
    {
      ok: true,
      freezeInventory: {
        qaRunners: ['scripts/qa-slice-06-runner.mjs', 'scripts/qa-slice-07-runner.mjs'],
        legacyBackfill: 'scripts/smoke-ui-slice-{17,20,36,40,45,49,53,59,71,72,73,74,75,82,84,85,90,91,93,94,95,96,97,98,99,100,106,107,108,116,121,122,128,138,140,157,158,159,160,161,181,183,199,200,203,233,234,235,236,237,244,245}.mjs',
        resetRange: 'scripts/smoke-ui-slice-{246..293}.mjs',
        excluded: ['scripts/qa-slice-05-runner.mjs', 'docs/00_master-brief.md', 'docs/06_ai-orchestration-pivot.md', 'src/execution/*', 'scripts/smoke-provider-*'],
      },
    },
    null,
    2,
  ),
);
