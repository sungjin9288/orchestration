import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /class="form-help council-approval-help"/);
assert.match(app, /결론 승인이 끝나야 후속 실행이 열립니다\./);
assert.doesNotMatch(app, /결론 승인은 명시적 단일 단계로 유지됩니다\. 이 단계가 끝나야만 후속 작전이 시작됩니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilApprovalHelp: 'tightened',
    },
    null,
    2,
  ),
);
