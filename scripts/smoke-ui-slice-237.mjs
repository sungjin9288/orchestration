import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(indexHtml, /현재 역할 라인업/);
assert.match(indexHtml, /기본 운영 표면/);
assert.match(appJs, /중앙 판단판을 보며 최종 방향을 고정합니다\./);
assert.match(appJs, /중앙 판단 데스크/);
assert.match(appJs, /목표 해석과 범위 제한을 맡는 핵심 전략 역할입니다\./);
assert.match(appJs, /설계 파급을 막고 시스템 경계를 봉인하는 역할입니다\./);
assert.match(appJs, /회의 준비 전이라 회의 흐름이 아직 열리지 않았습니다\./);
assert.match(appJs, /역할 구성/);
assert.match(appJs, /createToken\('참여 역할', 'neutral'\)/);
assert.match(appJs, /<strong>참여 역할<\/strong>/);
assert.match(appJs, /역할:\$\{castEntries.length\}석/);
assert.match(appJs, /회의 세션 없음/);
assert.doesNotMatch(indexHtml, /현재 참모 라인업/);
assert.doesNotMatch(indexHtml, /본부 운영 표면/);
assert.doesNotMatch(appJs, /본부 중앙 데스크/);
assert.doesNotMatch(appJs, /수석 참모입니다\./);
assert.doesNotMatch(appJs, /착석 참모진/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastReadability: {
        markers: [
          '현재 역할 라인업',
          '기본 운영 표면',
          '중앙 판단 데스크',
          '핵심 전략 역할',
          '역할 구성',
          '참여 역할',
        ],
      },
    },
    null,
    2,
  ),
);
