import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /council-approval-copy/);
assert.match(app, /이 결론을 승인하면 사전 점검까지만 넘기고, 다음 게이트에서 멈춥니다\./);
assert.doesNotMatch(app, /planner부터 사전 점검까지 자동으로 넘기고, 다음 승인 또는 결정 게이트에서 멈춥니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilApprovalCopy: 'tightened',
    },
    null,
    2,
  ),
);
