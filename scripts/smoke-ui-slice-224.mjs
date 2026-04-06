import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /기존 대기 중인 커밋 승인 기록을 그대로 처리합니다\./);
assert.match(appJs, /최신 리뷰어 번들이 준비됐습니다\. 이 CTA는 커밋 패키지 경로를 따라 현재 커밋 승인을 엽니다\./);
assert.match(appJs, /현재 커밋 번들이 준비됐습니다\. 이 CTA는 로컬 커밋 경로를 따라 커밋 결과 번들로 이어집니다\./);
assert.match(appJs, /최신 리뷰어 번들 .*를 바탕으로 커밋 패키지 아티팩트를 만들고 커밋 승인 안건을 엽니다\. 외부 전달은 계속 막아 둡니다\./);
assert.match(appJs, /승인된 커밋 패키지 .*에서 로컬 커밋을 실행하고 커밋 결과 아티팩트로 이어집니다\. 외부 전달은 계속 비활성입니다\./);
assert.match(appJs, /리뷰어는 새 코드 변경 없이 최신 빌더 라이브 변경 번들을 점검할 수 있습니다\./);
assert.match(appJs, /리뷰어 실행은 빌더 실행 기록 .*을 읽고 커밋이나 릴리스 없이 최종 리뷰 아티팩트를 기록합니다\./);

assert.doesNotMatch(appJs, /기존 pending commit 승인 기록을 그대로 처리합니다\./);
assert.doesNotMatch(appJs, /현재 commit 승인을 엽니다\./);
assert.doesNotMatch(appJs, /현재 commit 번들이 준비됐습니다\./);
assert.doesNotMatch(appJs, /최신 reviewer 번들 .*기준 reviewer 결과/);
assert.doesNotMatch(appJs, /commit-package 아티팩트를 만들고 commit 승인 안건을 엽니다\./);
assert.doesNotMatch(appJs, /commit-result 아티팩트로 이어집니다\./);
assert.doesNotMatch(appJs, /최신 builder 라이브 변경 번들을 점검할 수 있습니다\./);
assert.doesNotMatch(appJs, /builder run .*commit이나 release 없이 최종 review 아티팩트를 기록합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      commitReviewerHelperCopyBatch: {
        markers: [
          '대기 중인 커밋 승인 기록',
          '현재 커밋 승인을 엽니다.',
          '현재 커밋 번들이 준비됐습니다.',
          '커밋 패키지 아티팩트',
          '커밋 결과 아티팩트',
          '빌더 실행 기록',
          '최종 리뷰 아티팩트',
        ],
      },
    },
    null,
    2,
  ),
);
