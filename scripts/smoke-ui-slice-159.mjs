import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /<h2>게이트 제어 데스크<\/h2>/);
assert.match(appJs, /여기서는 승인선, 차단 사유, 실행 준비 상태를 먼저 봅니다\./);
assert.doesNotMatch(appJs, /회의에서 넘긴 안건은 여기서 승인선, 보류 사유, 사전 점검 상태로 압축됩니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionPanelCopy: 'tightened',
    },
    null,
    2,
  ),
);
