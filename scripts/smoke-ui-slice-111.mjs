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

assert.match(appJs, /detail-block detail-block-action decision-action-block/);
assert.match(appJs, /class="form-actions form-actions-inline decision-action-row"/);
assert.match(appJs, /<p class="decision-action-copy">이 안건은 여기서 승인 또는 반려만 결정합니다\.<\/p>/);
assert.match(appJs, /<p class="decision-action-copy">이 안건은 여기서 해결만 기록하고 다음 실행 판단으로 넘깁니다\.<\/p>/);

assert.match(styles, /\.detail-block-action \{/);
assert.match(styles, /\.decision-action-head \{/);
assert.match(styles, /\.surface\[data-surface="decision-inbox"\] \.decision-action-block \{/);
assert.match(styles, /\.surface\[data-surface="decision-inbox"\] \.decision-action-row \.danger-button \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionInboxActionShelf: {
        markers: ['decision-action-block', 'decision-action-row', 'decision-action-copy'],
      },
    },
    null,
    2,
  ),
);
