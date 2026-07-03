import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');

assert.match(controlSnapshots, /export function getCouncilControlSnapshot\(mission, councilSession, linkedTask\)/);
assert.match(controlSnapshots, /export function getExecutionControlSnapshot\(task, latestRun, approvalBridge, gateCopy, summaries = \{\}\)/);
assert.match(controlSnapshots, /export function getDeliverablesControlSnapshot\(/);

assert.match(appJs, /eyebrow: '회의 권고 선반'/);
assert.match(appJs, /heading: '권고안, 이견, 승인 선반을 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 회의록 전체보다 현재 권고안, 열린 이견, 승인 상태를 먼저 보여 줍니다\./);

assert.match(appJs, /eyebrow: '게이트 판단판'/);
assert.match(appJs, /heading: '현재 게이트와 바로 처리할 후속을 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 작업 지시보다 승인선, 차단 근거, 다음 처리 경로를 우선 보여 줍니다\./);

assert.match(appJs, /eyebrow: '인계 판단판'/);
assert.match(appJs, /heading: '현재 패킷 상태와 다음 인계선을 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 결과 패킷보다 리뷰 라인, 승인선, 종료 보고 경로를 우선 보여 줍니다\./);

assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '다음'/);
assert.match(appJs, /label: '이유'/);

assert.match(appJs, /selectedCouncilSession[\s\S]*회의 요약/);
assert.match(appJs, /상류 승인 패킷[\s\S]*승인선/);
assert.match(appJs, /승인 및 종료 데스크[\s\S]*리뷰 라인/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoRightPanelControlDecks: {
        decks: ['회의 권고 선반', '게이트 판단판', '인계 판단판'],
        cards: ['현재 판단', '다음', '이유'],
        preservedBlocks: ['회의 요약', '승인선', '리뷰 라인'],
      },
    },
    null,
    2,
  ),
);
