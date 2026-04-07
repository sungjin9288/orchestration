import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /owner: '선임 실행관 · 실행 흐름'/);
assert.match(appJs, /summary: '현재 실행 판단과 다음 행동을 정리합니다\.'/);
assert.match(appJs, /copy: '현재 실행 판단과 다음 행동을 정리합니다\.',\s*kicker: '작전'/);
assert.match(appJs, /const gateCopy = String\(options\.gateCopy \|\| '아직 확정된 실행 지시가 없습니다\.'\)\.trim\(\);/);
assert.match(appJs, /회의 결론이 실행 셀로 내려오면 첫 실행 보고가 이곳에 나타납니다\./);
assert.match(appJs, /<p class="eyebrow">실행 브리핑<\/p>/);
assert.match(appJs, /<h2>회의 결론이 실행 셀로 이어지는 흐름<\/h2>/);
assert.match(appJs, /회의에서 정한 방향이 여기서 현재 지시, 승인선, 최신 실행 보고로 이어집니다\./);
assert.match(appJs, /eyebrow: '실행 개요판'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 판단, 다음 행동, 연결 근거부터 먼저 보여 줍니다\.'/);
assert.match(appJs, /<h2>실행 메모<\/h2>/);
assert.match(appJs, /eyebrow: '실행 판단판'/);
assert.match(appJs, /heading: '현재 실행 판단과 다음 후속만 먼저 봅니다'/);
assert.match(appJs, /연결 실행 셀이 생기면 현재 실행 판단판이 이곳에 나타납니다\./);
assert.doesNotMatch(appJs, /작전 지휘실/);
assert.doesNotMatch(appJs, /회의에서 정한 방향을 실행 셀에 내리는 작전실/);
assert.doesNotMatch(appJs, /작전 지휘 메모/);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionHandoffReadability: {
        markers: [
          '선임 실행관 · 실행 흐름',
          '현재 실행 판단과 다음 행동을 정리합니다.',
          '실행 브리핑',
          '회의 결론이 실행 셀로 이어지는 흐름',
          '실행 개요판',
          '실행 판단판',
          '실행 메모',
        ],
      },
    },
    null,
    2,
  ),
);
