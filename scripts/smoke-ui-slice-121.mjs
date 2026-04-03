import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /mission:\s*\{\s*copy: '현재 안건 판단과 바로 이동을 시작합니다\.'/);
assert.match(appJs, /execution:\s*\{\s*copy: '현재 작전 판단과 다음 행동을 조정합니다\.'/);
assert.match(appJs, /deliverables:\s*\{\s*copy: '현재 보고 판단과 다음 행동을 확인합니다\.'/);
assert.match(appJs, /선택된 안건의 현재 판단과 바로 이동이 아래에 이어집니다\./);
assert.match(appJs, /선택된 실행 셀의 현재 판단과 다음 행동이 아래에 이어집니다\./);
assert.match(appJs, /선택된 보고 흐름의 현재 판단과 다음 행동, 연결 근거가 아래에 이어집니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeSurfaceCopySync: {
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
