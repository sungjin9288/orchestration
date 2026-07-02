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

assert.match(appJs, /현재 결론과 다음 인계 판단을 한 지점에서 정리합니다\./);
assert.match(appJs, /정렬 상태와 다음 인계 판단을 한 지점에서 확인합니다\./);
assert.match(appJs, /목표 해석과 범위 조정을 맡는 전략 역할입니다\./);
assert.match(appJs, /원하는 결과와 범위를 더 분명하게 정리합니다\./);
assert.match(appJs, /설계 파급을 줄이고 시스템 경계를 지키는 역할입니다\./);
assert.match(appJs, /첫 실행 단위를 정리하고 바로 인계 가능한 수준으로 나눕니다\./);
assert.match(appJs, /의도를 바로 넘길 수 있는 첫 실행 단위로 나눕니다\./);

assert.doesNotMatch(appJs, /최종 추천안과 인계 승인 흐름을 한 지점에서 총괄합니다\./);
assert.doesNotMatch(appJs, /정렬 승인과 다음 인계를 한 지점으로 모읍니다\./);
assert.doesNotMatch(appJs, /목표 해석과 범위 제한을 맡는 핵심 전략 역할입니다\./);
assert.doesNotMatch(appJs, /설계 파급을 막고 시스템 경계를 봉인하는 역할입니다\./);
assert.doesNotMatch(appJs, /첫 실행 단위를 편성하고 바로 인계 가능한 수준으로 자릅니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestCouncilRecommendationDetailReadability: {
        markers: [
          '현재 결론과 다음 인계 판단을 한 지점에서 정리합니다.',
          '정렬 상태와 다음 인계 판단을 한 지점에서 확인합니다.',
          '목표 해석과 범위 조정을 맡는 전략 역할입니다.',
          '원하는 결과와 범위를 더 분명하게 정리합니다.',
          '설계 파급을 줄이고 시스템 경계를 지키는 역할입니다.',
          '첫 실행 단위를 정리하고 바로 인계 가능한 수준으로 나눕니다.',
          '의도를 바로 넘길 수 있는 첫 실행 단위로 나눕니다.',
        ],
      },
    },
    null,
    2,
  ),
);
