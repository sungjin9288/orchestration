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
assert.match(app, /이제 작전실과 관제실에서 다음 지시를 확인합니다\./);
assert.doesNotMatch(app, /이제 작전실과 관제실에서 연결 태스크와 다음 지시를 이어서 확인합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilApprovalApprovedHelp: 'tightened',
    },
    null,
    2,
  ),
);
