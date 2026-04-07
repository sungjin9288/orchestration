import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /function getCouncilControlSnapshot\(mission, councilSession, linkedTask\)/);
assert.match(appJs, /function getExecutionControlSnapshot\(task, latestRun, approvalBridge, gateCopy, summaries = \{\}\)/);
assert.match(appJs, /function getDeliverablesControlSnapshot\(/);

assert.match(appJs, /eyebrow: '회의 판단판'/);
assert.match(appJs, /heading: '회의 결론과 다음 이동만 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 긴 회의록 대신 현재 결론과 다음 표면만 먼저 보여 줍니다\./);

assert.match(appJs, /eyebrow: '실행 판단판'/);
assert.match(appJs, /heading: '현재 실행 판단과 다음 후속만 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 긴 근거 대신 현재 게이트와 바로 할 후속만 먼저 보여 줍니다\./);

assert.match(appJs, /eyebrow: '보고 판단판'/);
assert.match(appJs, /heading: '현재 보고 상태와 다음 후속만 먼저 봅니다'/);
assert.match(appJs, /결과 보고 오른쪽 패널은 현재 보고 묶음, 결재선, 다음 후속을 먼저 보여 주고 깊은 점검은 아래로 미룹니다\./);

assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '바로 이동'/);
assert.match(appJs, /label: '이유'/);

assert.match(appJs, /selectedCouncilSession[\s\S]*회의 요약/);
assert.match(appJs, /실행 메모[\s\S]*지휘 승인선/);
assert.match(appJs, /최신 보고 현황[\s\S]*리뷰 보고/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoRightPanelControlDecks: {
        decks: ['회의 판단판', '실행 판단판', '보고 판단판'],
        cards: ['현재 판단', '바로 이동', '이유'],
        preservedBlocks: ['회의 요약', '지휘 승인선', '리뷰 보고'],
      },
    },
    null,
    2,
  ),
);
