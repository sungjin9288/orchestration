import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /열린 승인 라인 없음/);
assert.match(appJs, /현재 결과 패킷에는 사람이 처리할 승인 안건이 없습니다\./);
assert.match(appJs, /결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다/);
assert.match(appJs, /승인 라인/);
assert.match(appJs, /연결 태스크가 생기면 결과 패킷 판단판이 이곳에 나타납니다\./);
assert.match(appJs, /사람 승인이 남아 있어 현재 결과 패킷은 승인 라인 판단이 먼저입니다\./);
assert.match(appJs, /currentTitle: '승인 라인 대기'/);
assert.match(appJs, /nextTitle: '승인 안건 확인'/);
assert.match(appJs, /현재 결과 패킷은 최신 결과를 보여 주며 다음 승인이나 종료 보고를 기다리는 상태입니다\./);
assert.match(appJs, /nextTitle: '승인 라인 확인'/);
assert.match(appJs, /상류 준비 패킷/);
assert.match(appJs, /전달 패킷 선반/);
assert.match(appJs, /여기서는 리뷰 라인, 승인선, 종료 보고 경로를 먼저 봅니다\./);
assert.match(appJs, /현재 승인 안건/);
assert.match(appJs, /승인 라인 현황/);

assert.doesNotMatch(appJs, /열린 결재 없음/);
assert.doesNotMatch(appJs, /현재 보고에는 사람이 처리할 결재 안건이 없습니다\./);
assert.doesNotMatch(appJs, /어떤 보고 묶음과 결재선으로 이어졌는지 이 방에서 빠르게 읽습니다\./);
assert.doesNotMatch(appJs, /label: '결재선'/);
assert.doesNotMatch(appJs, /결과 보고실 판단판/);
assert.doesNotMatch(appJs, /사람 결재가 남아 있어 현재 보고 묶음은 결재선 판단이 먼저입니다\./);
assert.doesNotMatch(appJs, /currentTitle: '결재선 대기'/);
assert.doesNotMatch(appJs, /nextTitle: '결재 안건 확인'/);
assert.doesNotMatch(appJs, /현재 보고 묶음은 최신 결과를 보여 주며 다음 결재나 종료 보고를 기다리는 상태입니다\./);
assert.doesNotMatch(appJs, /nextTitle: '결재선 확인'/);
assert.doesNotMatch(appJs, /상류 준비 보고/);
assert.doesNotMatch(appJs, /후속 전달 보고/);
assert.doesNotMatch(appJs, /보고는 결재선과 다음 이동을 요약하고, 깊은 점검은 관제실로 넘깁니다\./);
assert.doesNotMatch(appJs, /현재 결재 안건/);
assert.doesNotMatch(appJs, /결재선 현황/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesFollowupReadability: {
        markers: [
          '열린 승인 라인 없음',
          '승인 라인',
          '결과 패킷 판단판',
          '승인 라인 대기',
          '상류 준비 패킷',
          '전달 패킷 선반',
          '현재 승인 안건',
        ],
      },
    },
    null,
    2,
  ),
);
