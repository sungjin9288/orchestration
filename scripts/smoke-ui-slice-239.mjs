import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');

const appJs = fs.readFileSync(appPath, 'utf8') + fs.readFileSync(councilConfigPath, 'utf8');

assert.match(appJs, /회의 리드/);
assert.match(appJs, /전략 역할/);
assert.match(appJs, /설계 역할/);
assert.match(appJs, /실행 역할/);

assert.match(appJs, /avatarLabel: '리드 아바타'/);
assert.match(appJs, /displayName: '리드'/);
assert.match(appJs, /displayName: '전략'/);
assert.match(appJs, /displayName: '설계'/);
assert.match(appJs, /displayName: '실행'/);
assert.match(appJs, /rank: '회의 리드'/);
assert.match(appJs, /rank: '전략 역할'/);
assert.match(appJs, /rank: '설계 역할'/);
assert.match(appJs, /rank: '실행 역할'/);
assert.match(appJs, /orderLabel: '역할 순서 1'/);
assert.match(appJs, /orderLabel: '역할 순서 2'/);
assert.match(appJs, /orderLabel: '역할 순서 3'/);
assert.match(appJs, /orderLabel: '역할 순서 4'/);
assert.match(appJs, /deskLabel: '전략 판단 데스크'/);
assert.match(appJs, /deskProp: '최종 판단판 · 승인 묶음'/);
assert.match(appJs, /deskProp: '우선순위 표 · 전략 메모'/);
assert.match(appJs, /deskProp: '경계 도면 · 구조 메모'/);
assert.match(appJs, /deskProp: '체크포인트 표 · 실행 큐'/);
assert.match(appJs, /현재 결론과 다음 인계 판단을 한 지점에서 정리합니다\./);
assert.match(appJs, /정렬 상태와 다음 인계 판단을 한 지점에서 확인합니다\./);
assert.match(appJs, /목표 해석과 범위 조정을 맡는 전략 역할입니다\./);
assert.match(appJs, /설계 파급을 줄이고 시스템 경계를 지키는 역할입니다\./);
assert.match(appJs, /첫 실행 단위를 정리하고 바로 인계 가능한 수준으로 나눕니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilRankStationReadability: {
        markers: [
          '회의 리드',
          '전략 역할',
          '설계 역할',
          '실행 역할',
          '역할 순서 1',
          '전략 판단 데스크',
          '최종 판단판 · 승인 묶음',
          '우선순위 표 · 전략 메모',
        ],
      },
    },
    null,
    2,
  ),
);
