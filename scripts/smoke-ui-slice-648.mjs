import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const uiQaStatus = fs.readFileSync(uiQaStatusPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(controlSnapshots, /export function getDeliverablesCompletionSummary\(options = \{\}\)/);
assert.match(controlSnapshots, /export function renderDeliverablesCompletionSummary\(summary\)/);
assert.match(appJs, /const deliverablesCompletionSummary = getDeliverablesCompletionSummary\(\{/);
assert.match(appJs, /\$\{renderDeliverablesCompletionSummary\(deliverablesCompletionSummary\)\}/);

assert.match(controlSnapshots, /whatChangedLabel: currentArtifact \? getArtifactTypeDisplay\(currentArtifact\.type\) : '패킷 없음'/);
assert.match(controlSnapshots, /whatPassedLabel: missionCompletionReady[\s\S]*'종료 정리 봉인'[\s\S]*'리뷰 통과'/);
assert.match(controlSnapshots, /blockedLabel: missionCompletionReady \|\| !blockedReason \? '차단 없음' : '차단 있음'/);
assert.match(controlSnapshots, /safeNextLabel = '다음 미션 준비'/);
assert.match(controlSnapshots, /safeNextLabel = '승인선 처리'/);
assert.match(controlSnapshots, /safeNextLabel = '종료 정리 실행'/);
assert.match(controlSnapshots, /safeNextLabel = '릴리스 패키지 준비'/);
assert.match(controlSnapshots, /safeNextLabel = '로컬 커밋 실행'/);
assert.match(controlSnapshots, /safeNextLabel = '커밋 패키지 준비'/);
assert.match(controlSnapshots, /safeNextLabel = '리뷰 보고 생성'/);

assert.match(controlSnapshots, /<strong>완성 판단 요약<\/strong>/);
assert.match(controlSnapshots, /변경 내용/);
assert.match(controlSnapshots, /통과 근거/);
assert.match(controlSnapshots, /차단 사유/);
assert.match(controlSnapshots, /안전한 다음 행동/);
assert.match(controlSnapshots, /class="control-overview-register deliverables-completion-register"/);
assert.match(controlSnapshots, /createToken\(`변경:\$\{summary\.whatChangedLabel\}`,\s*summary\.whatChangedTone\)/);
assert.match(controlSnapshots, /createToken\(`통과:\$\{summary\.whatPassedLabel\}`,\s*summary\.whatPassedTone\)/);
assert.match(controlSnapshots, /createToken\(summary\.blockedLabel,\s*summary\.blockedTone\)/);
assert.match(controlSnapshots, /createToken\(`다음:\$\{summary\.safeNextLabel\}`,\s*summary\.safeNextTone\)/);

assert.match(appJs, /data-action="run-release-package"/);
assert.match(appJs, /data-action="run-close-out"/);
assert.match(appJs, /data-action="open-execution"/);
assert.doesNotMatch(appJs, /data-action="run-deliverables-completion-summary"/);
assert.doesNotMatch(appJs, /data-action="auto-close-out"/);
assert.match(uiQaStatus, /smoke-ui-slice-648\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-648\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesCompletionSummary: {
        answers: ['what changed', 'what passed', 'what is blocked', 'safe next'],
        visibleLabels: ['변경 내용', '통과 근거', '차단 사유', '안전한 다음 행동'],
        routeScope: 'existing execution and approval routes only',
      },
    },
    null,
    2,
  ),
);
