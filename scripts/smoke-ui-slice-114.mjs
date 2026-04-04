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

assert.match(appJs, /실행으로 이동해 리뷰어 실행/);
assert.match(appJs, /실행으로 이동해 커밋 패키지 준비/);
assert.match(appJs, /실행으로 이동해 종료 정리 실행/);
assert.match(appJs, /미션으로 이동해 다음 사이클 시작/);
assert.match(appJs, /관제실 직행/);

assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions \{/);
assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions \.form-help \{/);
assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions \.danger-button \{/);
assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions \.primary-button:hover:not\(:disabled\),/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesActionShelf: {
        selectors: [
          'relation-strip > .form-actions',
          'deliverables action hover accent',
          '실행으로 이동해 리뷰어 실행',
          '미션으로 이동해 다음 사이클 시작',
        ],
      },
    },
    null,
    2,
  ),
);
