import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const source = fs.readFileSync(
  path.join(repoRoot, 'docs/12_provider-runtime-followup-boundary.md'),
  'utf8',
);

assert.match(source, /# Provider Runtime Follow-Up Boundary/);
assert.match(source, /codex\/company-shell-design-reset-20260408-main/);
assert.match(source, /draft PR `#59`/);
assert.match(source, /src\/execution\/providers\/openai-responses-retry-policy\.js/);
assert.match(source, /scripts\/smoke-provider-slice-13\.mjs/);
assert.match(source, /scripts\/qa-slice-05-runner\.mjs/);
assert.match(source, /scripts\/smoke-ui-slice-10\.mjs/);
assert.match(source, /scripts\/smoke-ui-slice-37\.mjs/);
assert.match(source, /do not use repo-wide staging like `git add \.`/);
assert.match(source, /do not reopen PR `#59`/);
assert.match(
  source,
  /node --check src\/execution\/providers\/openai-responses-retry-policy\.js/,
);
assert.match(source, /node scripts\/smoke-provider-slice-07\.mjs/);
assert.match(source, /node scripts\/smoke-provider-slice-13\.mjs/);
assert.match(source, /Current Verification Note/);
assert.match(source, /smoke-provider-slice-07\.mjs` now passes again/);
assert.match(source, /terminal `429` failure cases in provider smoke were made retry-aware/);

console.log(
  JSON.stringify(
    {
      ok: true,
      smoke: 'provider-runtime-followup-boundary-doc',
    },
    null,
    2,
  ),
);
