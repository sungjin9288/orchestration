import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /이 슬라이스에서는 결정 처리를 결정함 표면에 남깁니다\./);
assert.match(appJs, /기존 대기 중인 빌더 승인 기록을 그대로 재사용하며, 세부 태스크\/로그\/아티팩트\/결정함 제어는 관제실에 남깁니다\./);
assert.match(appJs, /현재 빌더 승인은 이미 승인됐습니다\./);
assert.match(appJs, /현재 지시가 아직 대기 상태이면 관제실에서 결정함을 처리한 뒤, 다음 한정된 작전 액션으로 돌아옵니다\./);
assert.match(appJs, /커밋 승인은 현재 커밋 패키지가 대기 승인을 열면 실행 표면에 열립니다\./);
assert.match(appJs, /로컬 커밋은 현재 승인된 커밋 번들이 준비되면 실행 표면에 열립니다\./);
assert.match(appJs, /릴리스 승인은 현재 릴리스 패키지가 대기 승인을 열면 실행 표면에 열립니다\./);

assert.doesNotMatch(appJs, /이 slice에서는 결정 처리를 결정함 표면에 남깁니다\./);
assert.doesNotMatch(appJs, /기존 pending builder 승인 기록을 그대로 재사용하며/);
assert.doesNotMatch(appJs, /현재 builder 승인은 이미 승인됐습니다\./);
assert.doesNotMatch(appJs, /현재 지시가 아직 pending이면/);
assert.doesNotMatch(appJs, /커밋 패키지가 pending 승인을 열면/);
assert.doesNotMatch(appJs, /현재 승인된 commit 번들이 준비되면/);
assert.doesNotMatch(appJs, /릴리스 패키지가 pending 승인을 열면/);

console.log(
  JSON.stringify(
    {
      ok: true,
      pendingSliceHelperBatch: {
        markers: [
          '이 슬라이스에서는',
          '대기 중인 빌더 승인 기록',
          '현재 빌더 승인',
          '대기 상태',
          '대기 승인',
          '커밋 번들',
        ],
      },
    },
    null,
    2,
  ),
);
