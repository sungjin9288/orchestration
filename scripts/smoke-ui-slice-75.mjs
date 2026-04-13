import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /compact:\s*true,/);
assert.match(appJs, /<h2>안건 등록대장<\/h2>/);
assert.match(appJs, /신규 안건 등록/);
assert.match(appJs, /등록 대기/);
assert.match(appJs, /회의 자동 호출/);
assert.match(appJs, /<span class="field-label">안건<\/span>/);
assert.match(appJs, /<span class="field-label">목표<\/span>/);
assert.match(appJs, /<span class="field-label">경계 \(선택\)<\/span>/);
assert.match(appJs, /placeholder="오늘 등록할 안건 제목을 적으세요"/);
assert.match(appJs, /placeholder="이번 안건으로 무엇을 정리해야 하는지 적으세요"/);
assert.match(appJs, /placeholder="이번 안건에서 넘지 않을 범위나 제약을 적으세요"/);
assert.match(appJs, /등록 즉시 회의 초안이 열리고, 승인 전까지는 실행 셀로 넘어가지 않습니다\./);

assert.match(styles, /\.mission-order-desk \{/);
assert.match(styles, /\.mission-order-head \{/);
assert.match(styles, /\.mission-order-main \{/);
assert.match(styles, /\.mission-order-foot \{/);
assert.match(styles, /\.mission-order-actions \{/);

assert.doesNotMatch(appJs, /회의 안건 등록/);
assert.doesNotMatch(appJs, /참모진:즉시착석/);
assert.doesNotMatch(appJs, /빠른 접수/);
assert.doesNotMatch(appJs, /즉시 착석/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRegisterDeskDensity: {
        labels: ['안건 등록대장', '신규 안건 등록', '안건', '목표', '경계 (선택)'],
        tokens: ['등록 대기', '회의 자동 호출'],
        classes: [
          'mission-order-desk',
          'mission-order-head',
          'mission-order-main',
          'mission-order-foot',
          'mission-order-actions',
        ],
      },
    },
    null,
    2,
  ),
);
