import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /기존 대기 중인 릴리스 승인 기록을 그대로 처리합니다\./);
assert.match(app, /최신 로컬 커밋 번들이 준비됐습니다\. 이 CTA는 릴리스 패키지 경로를 따라 현재 릴리스 승인을 엽니다\./);
assert.match(app, /현재 승인된 릴리스 번들이 준비됐습니다\. 이 CTA는 종료 정리 경로를 따라 종료 정리 번들로 이어집니다\./);
assert.match(app, /푸시, 게시, 외부 릴리스는 계속 비활성 상태로 둡니다\./);
assert.match(app, /푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다\./);
assert.match(app, /종료 정리 결과는 소스 릴리스 번들/);
assert.match(app, /저장된 워크트리 경로만 바꿉니다\. 릴리스 패키지와 종료 정리는 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다\./);

assert.doesNotMatch(app, /기존 pending release 승인 기록을 그대로 처리합니다\./);
assert.doesNotMatch(app, /현재 release 승인을 엽니다\./);
assert.doesNotMatch(app, /현재 승인된 release 번들이 준비됐습니다\./);
assert.doesNotMatch(app, /push, publish, external release는 계속 비활성 상태/);
assert.doesNotMatch(app, /push, publish, 외부 릴리스는 범위 밖입니다\./);
assert.doesNotMatch(app, /close-out 결과는 소스 릴리스 번들/);
assert.doesNotMatch(app, /release-package와 close-out은 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      releaseCloseOutHelperCopyBatch: {
        markers: [
          '기존 대기 중인 릴리스 승인 기록',
          '현재 릴리스 승인을 엽니다.',
          '현재 승인된 릴리스 번들이 준비됐습니다.',
          '푸시, 게시, 외부 릴리스',
          '종료 정리 결과는 소스 릴리스 번들',
          '릴리스 패키지와 종료 정리는 여전히 현재 프로젝트 경로와 같은 연결 워크트리 루트로 풀려야 합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
