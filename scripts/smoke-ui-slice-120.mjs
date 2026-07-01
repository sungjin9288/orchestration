import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const surfaceConfig = fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(appJs, /from '\.\/surface-config\.js'/);
assert.match(surfaceConfig, /artifacts:\s*\{\s*copy: '현재 증적과 연결 근거를 검토합니다\.'/);
assert.match(surfaceConfig, /'decision-inbox':\s*\{\s*copy: '현재 승인 안건과 다음 처리를 판단합니다\.'/);
assert.match(surfaceConfig, /logs:\s*\{\s*copy: '현재 실행 로그와 다음 확인 대상을 빠르게 훑습니다\.'/);
assert.match(appJs, /selectedRun \? getRunStatusDisplay\(selectedRun\.status\) : '기록 대기'/);
assert.match(appJs, /selectedRun\?\.summary\?\.nextStage \? getExecutionStageDisplay\(selectedRun\.summary\.nextStage\) : '로그 추적 유지'/);
assert.match(appJs, /왼쪽은 증적 목록을 보고, 오른쪽은 선택된 증적의 현재 상태와 다음 확인만 먼저 봅니다\./);
assert.match(appJs, /아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다\./);
assert.match(appJs, /왼쪽은 실행 기록 목록을 보고, 오른쪽은 선택된 실행 기록의 현재 상태와 다음 확인만 먼저 봅니다\./);
assert.doesNotMatch(surfaceConfig, /현재 증적과 연결 근거를 확인합니다\./);
assert.doesNotMatch(surfaceConfig, /현재 run과 다음 확인을 빠르게 훑습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeSurfaceCopySync: {
        markers: [
          '현재 실행 로그와 다음 확인 대상을 빠르게 훑습니다.',
          '현재 증적과 연결 근거를 검토합니다.',
          '현재 승인 안건과 다음 처리를 판단합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
