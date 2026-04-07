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
assert.match(appJs, /<h2>안건 접수<\/h2>/);
assert.match(appJs, /안건 접수 데스크/);
assert.match(appJs, /빠른 접수/);
assert.match(appJs, /즉시 착석/);
assert.match(appJs, /<span class="field-label">안건<\/span>/);
assert.match(appJs, /<span class="field-label">목표<\/span>/);
assert.match(appJs, /<span class="field-label">경계 \(선택\)<\/span>/);
assert.match(appJs, /placeholder="무엇을 논의할지 한 줄로 적으세요"/);
assert.match(appJs, /placeholder="이번 회의가 끝날 때 무엇이 정리돼 있어야 하는지 적으세요"/);
assert.match(appJs, /placeholder="이번 안건에서 넘지 않을 범위나 꼭 지킬 제약을 적으세요"/);
assert.match(appJs, /접수 즉시 참모 회의 초안이 열리고, 승인 전까지는 실행으로 넘어가지 않습니다\./);

assert.match(styles, /\.mission-order-desk \{/);
assert.match(styles, /\.mission-order-head \{/);
assert.match(styles, /\.mission-order-main \{/);
assert.match(styles, /\.mission-order-foot \{/);
assert.match(styles, /\.mission-order-actions \{/);

assert.doesNotMatch(appJs, /회의 안건 등록/);
assert.doesNotMatch(appJs, /참모진:즉시착석/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqOrderDeskDensity: {
        labels: ['안건 접수', '안건 접수 데스크', '안건', '목표', '경계 (선택)'],
        tokens: ['빠른 접수', '즉시 착석'],
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
