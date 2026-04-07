import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<strong>운영 신호<\/strong>/);
assert.match(app, /<strong>운영 흐름<\/strong>/);
assert.match(app, /<p class="eyebrow">회의 브리핑실<\/p>/);
assert.match(app, /createToken\('회의 준비', 'accent'\)/);
assert.match(app, /<strong>협의 흐름<\/strong>/);
assert.match(app, /role: '협의 흐름'/);
assert.match(app, /role: '실행 흐름'/);
assert.match(app, /안건을 올리면 네 역할이 바로 같은 안건을 함께 읽기 시작합니다\./);
assert.match(app, /회의 결론이 정리되면 첫 실행 셀이 이 흐름을 이어받습니다\./);
assert.match(app, /같은 네 역할이 안건 아래에서 계속 읽고, 정렬과 인계 상태가 하나의 흐름으로 이어집니다\./);
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
          '회의 브리핑실',
          '회의 준비',
          '협의 흐름',
          '실행 흐름',
        ],
      },
    },
    null,
    2,
  ),
);
