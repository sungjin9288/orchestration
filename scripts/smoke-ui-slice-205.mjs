import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  appJs,
  /왼쪽은 신규 안건 등록과 현재 안건 대장을 다루고, 오른쪽은 현재 판단과 가장 먼저 열어야 할 처리선을 보여 줍니다\./,
);
assert.match(appJs, /런타임 연결이 복구돼야 현재 데스크와 evidence rail이 다시 열립니다\./);
assert.match(appJs, /세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다\./);
assert.match(
  appJs,
  /오른쪽 패널은 긴 설명보다 현재 배정 상태, 가장 먼저 열어야 할 처리선, 필요한 연결 상태를 먼저 보여 줍니다\./,
);
assert.match(appJs, /선택된 셀의 보류 이유, 다음 실행, 근거는 오른쪽 상세에서 이어 봅니다\./);
assert.match(appJs, /아래 상세 블록에서 현재 단계 제어와 근거를 이어서 확인합니다\./);
assert.match(appJs, /승인 동작은 현재 화면에서 처리하고, 서버 상태 요약을 그대로 따릅니다\./);

assert.doesNotMatch(appJs, /아래 surface에서 판단과 provenance를 이어서 읽습니다\./);
assert.doesNotMatch(appJs, /아래 surface가 다시 열립니다\./);
assert.doesNotMatch(appJs, /긴 provenance 대신/);
assert.doesNotMatch(appJs, /Approval actions stay on the current surface/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceProvenanceHelperCopy: {
        markers: ['현재 판단', '근거', '현재 데스크', '서버 상태 요약'],
      },
    },
    null,
    2,
  ),
);
