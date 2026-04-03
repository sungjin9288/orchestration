import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /artifacts:\s*\{\s*copy: '현재 증적과 연결 근거를 확인합니다\.'/);
assert.match(appJs, /'decision-inbox':\s*\{\s*copy: '현재 안건과 다음 처리를 판단합니다\.'/);
assert.match(appJs, /logs:\s*\{\s*copy: '현재 run과 다음 확인을 빠르게 훑습니다\.'/);
assert.match(appJs, /현재 run은 \$\{getRunStatusDisplay\(selectedRun\.status\)\}이고 다음 확인은 \$\{getExecutionStageDisplay\(selectedRun\.summary\.nextStage\)\}입니다\./);
assert.match(appJs, /선택된 증적의 현재 상태와 다음 확인, 연결 근거가 아래에 이어집니다\./);
assert.match(appJs, /선택된 안건의 현재 상태와 다음 처리가 아래에 이어집니다\./);
assert.match(appJs, /원문 로그보다 먼저 현재 run과 다음 확인 토큰을 읽으면 판단 속도가 훨씬 빨라집니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeSurfaceCopySync: {
        markers: [
          '현재 run과 다음 확인을 빠르게 훑습니다.',
          '현재 증적과 연결 근거를 확인합니다.',
          '현재 안건과 다음 처리를 판단합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
