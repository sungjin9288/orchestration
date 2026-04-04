import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /label: '안건 접수'/);
assert.match(appJs, /summary: '현재 안건 판단과 바로 이동을 시작합니다\.'/);
assert.match(appJs, /label: '실행 방향'/);
assert.match(appJs, /summary: '현재 작전 판단과 다음 행동을 조정합니다\.'/);
assert.match(appJs, /label: '결과 보고'/);
assert.match(appJs, /summary: '현재 보고 판단과 다음 행동을 확인합니다\.'/);
assert.match(appJs, /<p class="charter-label">진행 흐름<\/p>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      charterFlowCopySync: {
        markers: [
          '현재 안건 판단과 바로 이동을 시작합니다.',
          '현재 작전 판단과 다음 행동을 조정합니다.',
          '현재 보고 판단과 다음 행동을 확인합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
