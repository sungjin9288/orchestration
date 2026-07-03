import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const councilSignalsPath = path.join(repoRoot, 'ui', 'council-signals.js');

const app = fs.readFileSync(appPath, 'utf8');
const councilSignals = fs.readFileSync(councilSignalsPath, 'utf8');

assert.match(app, /<strong>운영 신호<\/strong>/);
assert.match(councilSignals, /운영 흐름/);
assert.match(app, /<p class="eyebrow">회의 운영 데스크<\/p>/);
assert.match(app, /createToken\('참석 등록부', 'accent'\)/);
assert.match(app, /<strong>회의 흐름<\/strong>/);
assert.match(app, /\? '실행 흐름'\s*:\s*'인계선 대기'\s*:\s*'회의 흐름'/);
assert.match(councilSignals, /네 역할이 같은 안건 아래에서 방향을 맞춥니다\./);
assert.match(councilSignals, /회의 정렬 뒤에 첫 실행 셀이 이 줄을 이어받습니다\./);
assert.match(app, /참석 역할, 정렬 상태, 인계 상태를 같은 회의 흐름에서 이어서 확인합니다\./);
assert.doesNotMatch(app, /<strong>회사 신호<\/strong>/);
assert.doesNotMatch(app, /<strong>회사 흐름<\/strong>/);
assert.doesNotMatch(app, /본부 브리핑실/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqHelperReadability: {
        markers: [
          '운영 신호',
          '운영 흐름',
          '회의 운영 데스크',
          '참석 등록부',
          '회의 흐름',
          '실행 흐름',
        ],
      },
    },
    null,
    2,
  ),
);
