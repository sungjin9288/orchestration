import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs =
  fs.readFileSync(appJsPath, 'utf8') +
  fs.readFileSync(councilConfigPath, 'utf8') +
  fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(appJs, /owner: '실행 역할 · 실행 흐름'/);
assert.match(appJs, /summary: '현재 작업 지시와 다음 실행을 정리합니다\.'/);
assert.match(appJs, /copy: '현재 작업 지시와 다음 실행을 정리합니다\.',\s*kicker: '실행'/);
assert.match(appJs, /const gateCopy = String\(options\.gateCopy \|\| '아직 확정된 실행 지시가 없습니다\.'\)\.trim\(\);/);
assert.match(appJs, /회의 결론이 실행 셀로 내려오면 첫 실행 로그가 이곳에 나타납니다\./);
assert.match(appJs, /<p class="eyebrow">작업 지시 보드<\/p>/);
assert.match(appJs, /<h2>현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다<\/h2>/);
assert.match(appJs, /Execution은 회의 결론, 현재 작업 지시, 승인선, 최근 실행 로그를 같은 work-order 보드로 묶어 제어합니다\./);
assert.match(appJs, /eyebrow: '작업 지시 개요'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다\.'/);
assert.match(appJs, /<h2>게이트 제어 데스크<\/h2>/);
assert.match(appJs, /eyebrow: '게이트 판단판'/);
assert.match(appJs, /heading: '현재 게이트와 바로 처리할 후속을 먼저 봅니다'/);
assert.match(appJs, /연결 실행 셀이 생기면 현재 게이트 판단이 이곳에 나타납니다\./);
assert.doesNotMatch(appJs, /작전 지휘실/);
assert.doesNotMatch(appJs, /회의에서 정한 방향을 실행 셀에 내리는 작전실/);
assert.doesNotMatch(appJs, /작전 지휘 메모/);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionHandoffReadability: {
        markers: [
          '실행 역할 · 실행 흐름',
          '현재 작업 지시와 다음 실행을 정리합니다.',
          '작업 지시 보드',
          '현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다',
          '작업 지시 개요',
          '게이트 판단판',
          '게이트 제어 데스크',
        ],
      },
    },
    null,
    2,
  ),
);
