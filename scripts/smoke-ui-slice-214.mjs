import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /현재 실행 기록이 연결된 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다\./);
assert.match(appJs, /지금은 오른쪽 상세에서 이 실행 기록의 상태와 원문 로그를 먼저 읽으면 됩니다\./);
assert.match(appJs, /기준으로 기록된 실행 보고입니다\./);
assert.match(appJs, /왼쪽 목록에서 실행 기록을 고르면 현재 실행 상태를 먼저 판단할 수 있습니다\./);
assert.match(appJs, /실행 기록을 고르면 기록 시각, 연결선, 원문 로그가 아래에 열립니다\./);
assert.match(appJs, /왼쪽에서 실행 기록을 고르고, 상태와 다음 확인만 짧게 비교합니다\./);
assert.match(appJs, /실행 기록 하나 고르기/);
assert.match(appJs, /왼쪽 실행 기록 목록에서 한 건을 고르면 오른쪽 판단과 원문 로그가 바로 채워집니다\./);
assert.match(appJs, /로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다/);
assert.match(appJs, /왼쪽은 실행 기록 목록을 보고, 오른쪽은 선택된 실행 기록의 현재 상태와 다음 확인만 먼저 봅니다\./);
assert.match(appJs, /바로:\$\{selectedTask \? '영향 셀' : selectedRun \? '현재 실행 기록' : '기록 선택'\}/);
assert.match(appJs, /현재 실행 기록보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다\./);
assert.match(appJs, /현재 실행 기록보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다\./);
assert.match(appJs, /실행 기록 목록 \+ 현재 상태/);
assert.match(appJs, /현재 실행 기록 \+ 원문 확인/);
assert.match(appJs, /선택된 실행 기록만 세 칸으로 요약하는 로그실/);
assert.match(appJs, /아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다\./);
assert.match(appJs, /현재 실행 기록/);
assert.match(appJs, /기록 선택 대기/);
assert.match(appJs, /왼쪽 목록에서 실행 기록을 고르면 현재 실행 기록 판단이 바로 채워집니다\./);
assert.match(appJs, /오른쪽 상세에서 현재 실행 기록, 다음 확인, 연결선, 원문 로그를 순서대로 확인합니다\./);
assert.match(appJs, /실행 기록을 하나 고르면 오른쪽 판단과 원문 로그가 함께 열립니다\./);
assert.match(appJs, /현재 실행 기록과 다음 확인을 먼저 보는 로그 상세/);
assert.match(appJs, /실행 기록을 고르면 현재 실행 기록과 다음 확인만 먼저 판단합니다\./);
assert.match(appJs, /선택된 실행 기록 없음/);
assert.match(appJs, /왼쪽 목록에서 실행 기록을 골라 출력 내용을 확인합니다\./);
assert.match(appJs, /이 실행 기록에 직접 연결된 아티팩트 기록이 없습니다\./);

assert.doesNotMatch(appJs, /현재 run이 걸린 실행 셀로 돌아가면 승인선과 다음 액션을 바로 이어서 볼 수 있습니다\./);
assert.doesNotMatch(appJs, /지금은 오른쪽 상세에서 이 run의 상태와 원문 로그를 먼저 읽으면 됩니다\./);
assert.doesNotMatch(appJs, /현재 run과 다음 확인을 빠르게 훑습니다\./);
assert.doesNotMatch(appJs, /현재 run은 .*이고 다음 확인은 .*입니다\./);
assert.doesNotMatch(appJs, /선택된 run의 현재 상태와 다음 확인이 아래에 이어집니다\./);
assert.doesNotMatch(appJs, /원문 로그보다 먼저 현재 run과 다음 확인 토큰을 읽으면 판단 속도가 훨씬 빨라집니다\./);
assert.doesNotMatch(appJs, /run 하나 고르기/);
assert.doesNotMatch(appJs, /왼쪽 run 목록에서 한 건을 고르면 오른쪽 판단과 원문 로그가 바로 채워집니다\./);
assert.doesNotMatch(appJs, /현재 run보다 먼저 사람이 승인해야 할 게이트가 있어 지금은 결재함을 먼저 여는 편이 빠릅니다\./);
assert.doesNotMatch(appJs, /현재 run보다 먼저 사람이 정리해야 할 결정이 남아 있어 결재함으로 먼저 이동하는 편이 빠릅니다\./);
assert.doesNotMatch(appJs, /선택된 run만 세 칸으로 요약하는 로그실/);
assert.doesNotMatch(appJs, /아래 deck은 현재 run과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다\./);
assert.doesNotMatch(appJs, /현재 run과 다음 확인을 먼저 보는 로그 상세/);
assert.doesNotMatch(appJs, /run을 고르면 현재 run과 다음 확인만 먼저 판단합니다\./);
assert.doesNotMatch(appJs, /선택된 run 없음/);
assert.doesNotMatch(appJs, /왼쪽 목록에서 run을 골라 출력 내용을 확인합니다\./);
assert.doesNotMatch(appJs, /이 run에 직접 연결된 아티팩트 기록이 없습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      logsRunHelperCopy: {
        markers: ['실행 기록 하나 고르기', '현재 실행 기록', '실행 기록 목록', '선택된 실행 기록만 세 칸으로 요약하는 로그실'],
      },
    },
    null,
    2,
  ),
);
