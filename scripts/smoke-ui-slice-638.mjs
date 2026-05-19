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
  /previews\.deliverables\?\.latestReviewStatus === 'passed'[\s\S]*previews\.deliverables\?\.currentDeliverableArtifact[\s\S]*actionLabel: '결과 확인'[\s\S]*surface: 'deliverables'[\s\S]*tone: 'success'/,
);
assert.match(
  appJs,
  /previews\.deliverables\?\.latestReviewStatus === 'passed'[\s\S]*currentTitle: '리뷰 통과'[\s\S]*nextCopy: `\$\{nextSurfaceLabel\}에서 \$\{previews\.nextActionPreview\.actionLabel\}를 먼저 확인합니다\.`[\s\S]*reasonTitle: '결과 패킷 근거'/,
);
assert.match(appJs, /if \(latestReviewStatus !== 'passed'\) \{/);
assert.doesNotMatch(appJs, /if \(latestReviewStatus !== 'approved'\) \{/);
assert.match(appJs, /latestReviewStatus === 'passed'[\s\S]*'승인 완료 · 리뷰 라인'/);
assert.match(appJs, /if \(task\.review\?\.status === 'passed'\) \{[\s\S]*return '결과 패킷 전달';/);
assert.match(appJs, /if \(task\?\.review\?\.status === 'passed' \|\| artifact\) \{[\s\S]*return '종료 보고 확인';/);
assert.doesNotMatch(appJs, /latestReviewStatus === 'approved'/);
assert.doesNotMatch(appJs, /review\?\.status === 'approved'/);
assert.doesNotMatch(appJs, /review\.status === 'approved'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesReviewPassedResultRouting: {
        missionNextAction: 'review-passed result bundle routes to Deliverables',
        missionBrief: 'review-passed mission detail tells operators to inspect the result packet first',
        deliverablesReviewGate: 'all workflow and deliverables review routing compares against runtime review.status=passed, not approval.status=approved',
      },
    },
    null,
    2,
  ),
);
