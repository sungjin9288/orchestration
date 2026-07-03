import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');
const conceptReviewPath = path.join(repoRoot, 'docs', '20_loop-engineering-concept-review.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const conceptReview = fs.readFileSync(conceptReviewPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(controlSnapshots, /export function getMissionLoopStatus\(mission, previews = \{\}\)/);
assert.match(controlSnapshots, /stageLabel: 'Discover'/);
assert.match(controlSnapshots, /stageLabel: 'Plan'/);
assert.match(controlSnapshots, /stageLabel: 'Execute'/);
assert.match(controlSnapshots, /stageLabel: 'Verify'/);
assert.match(controlSnapshots, /stageLabel: 'Iterate'/);
assert.match(controlSnapshots, /stopCondition: '회의 초안 필요'/);
assert.match(controlSnapshots, /stopCondition: '결론 승인 필요'/);
assert.match(controlSnapshots, /stopCondition: '사람 승인 대기'/);
assert.match(controlSnapshots, /stopCondition: '루프 종료됨'/);
assert.match(appJs, /<strong>루프 상태<\/strong>/);
assert.match(appJs, /<strong>루프 스테이지<\/strong>/);
assert.match(appJs, /Loop:\$\{missionLoopStatus\.stageLabel\}/);
assert.match(appJs, /Stop:\$\{missionLoopStatus\.stopCondition\}/);
assert.match(appJs, /루프:\$\{loopStatus\.stageLabel\}/);
assert.match(appJs, /중지:\$\{loopStatus\.stopCondition\}/);
assert.match(appJs, /Loop stop condition은 같은 선반에서 함께 봅니다\./);

assert.match(conceptReview, /Implemented UI Copy Slice: `mission-council-loop-stage-stop-condition-copy`/);
assert.match(conceptReview, /Mission과 Council 표면은 현재 loop stage와 stop condition을 source-derived copy로 표시한다/);
assert.match(conceptReview, /runtime route나 state schema를 만들지 않고/);
assert.match(verificationStatus, /smoke-ui-slice-646\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCouncilLoopCopy: {
        helper: 'getMissionLoopStatus',
        stages: ['Discover', 'Plan', 'Execute', 'Verify', 'Iterate'],
        runtimeScope: 'ui-copy-only',
      },
    },
    null,
    2,
  ),
);
