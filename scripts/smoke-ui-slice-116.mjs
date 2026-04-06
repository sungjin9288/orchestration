import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /선택한 결재만 여기서 처리하고, 실행 흐름은 아래 연결 맥락을 따릅니다\./);
assert.match(appJs, /해결 뒤 흐름은 영향 셀과 현재 게이트를 따라 이어집니다\./);
assert.match(appJs, /리뷰어 실행은 한정된 라이브 변경 번들이 준비되면 실행 표면에 열립니다\./);
assert.match(appJs, /승인은 실행 표면에서 처리하고, 산출물은 요약 전용으로 남습니다\./);
assert.match(appJs, /다음 사이클은 미션에서 시작합니다\. 실행을 다시 열지 않고 다음 초안을 준비합니다\./);
assert.match(appJs, /커밋 패키지 아티팩트를 만들고 커밋 승인 안건을 엽니다\. 외부 전달은 계속 막아 둡니다\./);
assert.match(appJs, /로컬 커밋을 실행하고 커밋 결과 아티팩트로 이어집니다\. 외부 전달은 계속 비활성입니다\./);
assert.match(appJs, /릴리스 패키지를 만들고 릴리스 승인 안건을 엽니다\. 외부 전달은 계속 비활성입니다\./);
assert.match(appJs, /종료 정리를 실행하고 종료정리 아티팩트를 남깁니다\. 외부 전달은 계속 비활성입니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      actionShelfCopyTightening: {
        markers: [
          '선택한 결재만 여기서 처리하고, 실행 흐름은 아래 연결 맥락을 따릅니다.',
          '리뷰어 실행은 한정된 라이브 변경 번들이 준비되면 실행 표면에 열립니다.',
          '다음 사이클은 미션에서 시작합니다. 실행을 다시 열지 않고 다음 초안을 준비합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
