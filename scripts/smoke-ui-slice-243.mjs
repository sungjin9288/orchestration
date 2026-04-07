import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /reasonTitle: '실행 근거 없음'/);
assert.match(appJs, /currentCopy: '사람 승인이 남아 있어 현재 실행은 승인선 처리 전까지 멈춰 있습니다\.'/);
assert.match(appJs, /currentCopy: '결정 항목이 남아 있어 현재 실행은 그 판단이 끝나기 전까지 이어지지 않습니다\.'/);
assert.match(appJs, /currentTitle: '실행 차단 상태'/);
assert.match(appJs, /currentCopy: '현재 실행 경로는 종료 정리까지 바로 이어갈 수 있는 상태입니다\.'/);
assert.match(appJs, /currentCopy: '현재 실행 경로는 릴리스 패키지 준비까지 이어갈 수 있는 상태입니다\.'/);
assert.match(appJs, /currentCopy: '현재 실행 경로는 커밋 패키지 또는 로컬 커밋 단계까지 이어질 수 있습니다\.'/);
assert.match(appJs, /currentCopy: '현재 실행 셀은 실행 경로 안에서 계속 이어갈 수 있는 상태입니다\.'/);
assert.match(appJs, /nextTitle: '현재 실행 이어가기'/);
assert.match(appJs, /아직 최신 보고가 없어 기본 실행 경로를 따릅니다\./);
assert.match(appJs, /현재 실행 준비가 어느 단계까지 왔는지 바로 확인할 수 있습니다\./);
assert.match(appJs, /아직 최신 보고가 없어 기본 실행 경로와 현재 승인 게이트를 기준으로만 판단합니다\./);
assert.match(appJs, /reasonTitle: '기본 실행 경로'/);

assert.doesNotMatch(appJs, /reasonTitle: '작전 근거 없음'/);
assert.doesNotMatch(appJs, /현재 작전은 승인선 처리 전까지 멈춰 있습니다\./);
assert.doesNotMatch(appJs, /현재 작전은 그 판단이 끝나기 전까지 전진하지 않습니다\./);
assert.doesNotMatch(appJs, /currentTitle: '작전 차단 상태'/);
assert.doesNotMatch(appJs, /현재 작전 경로는 종료 정리까지 바로 이어갈 수 있는 상태입니다\./);
assert.doesNotMatch(appJs, /현재 작전 경로는 릴리스 패키지 준비까지 전진할 수 있는 상태입니다\./);
assert.doesNotMatch(appJs, /현재 실행 셀은 작전 경로 안에서 계속 전진할 수 있는 상태입니다\./);
assert.doesNotMatch(appJs, /nextTitle: '현재 작전 계속'/);
assert.doesNotMatch(appJs, /기본 작전 경로/);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestExecutionGateDetailReadability: {
        markers: [
          '실행 근거 없음',
          '사람 승인이 남아 있어 현재 실행은 승인선 처리 전까지 멈춰 있습니다.',
          '결정 항목이 남아 있어 현재 실행은 그 판단이 끝나기 전까지 이어지지 않습니다.',
          '실행 차단 상태',
          '현재 실행 경로는 종료 정리까지 바로 이어갈 수 있는 상태입니다.',
          '현재 실행 셀은 실행 경로 안에서 계속 이어갈 수 있는 상태입니다.',
          '현재 실행 이어가기',
          '기본 실행 경로',
        ],
      },
    },
    null,
    2,
  ),
);
