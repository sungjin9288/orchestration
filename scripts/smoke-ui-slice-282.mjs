import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /class="ops-form-stack"/);
assert.match(appJs, /class="field-grid company-member-field-grid ops-form-order-grid"/);
assert.match(appJs, /class="company-member-admin-grid ops-form-order-grid"/);
assert.match(appJs, /class="ops-form-footer"/);
assert.match(appJs, /class="ops-form-footer ops-form-footer-row"/);
assert.match(appJs, /class="ops-form-footer-actions ops-form-footer-actions-inline"/);
assert.match(appJs, /반영/);
assert.match(appJs, /roster와 회사 구조에 추가합니다\./);
assert.match(appJs, /roster와 회사 구조에 반영합니다\./);
assert.match(appJs, /class="primary-button" type="submit" [\s\S]*agent 추가/);
assert.match(appJs, /class="primary-button" type="submit" [\s\S]*배정 저장/);

assert.match(styles, /\.ops-form-order-grid \{/);
assert.match(styles, /\.ops-form-footer \{/);
assert.match(styles, /\.ops-form-footer-row \{/);
assert.match(styles, /\.ops-form-footer-copy \{/);
assert.match(styles, /\.ops-form-footer-title \{/);
assert.match(styles, /\.ops-form-footer-actions \{/);
assert.match(styles, /\.ops-form-footer-actions-inline \{/);
assert.match(styles, /\.company-member-admin-grid \{\n  display: grid;\n  grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsFormAlignmentAndActionPlacement: {
        app: [
          'ops-form-stack',
          'ops-form-order-grid',
          'ops-form-footer',
          'ops-form-footer-row',
          'ops-form-footer-actions ops-form-footer-actions-inline',
          '반영',
          'agent 추가',
          '배정 저장',
        ],
        styles: [
          'ops-form-order-grid',
          'ops-form-footer',
          'ops-form-footer-row',
          'ops-form-footer-copy',
          'ops-form-footer-title',
          'ops-form-footer-actions',
          'ops-form-footer-actions-inline',
          'company-member-admin-grid(2col)',
        ],
      },
    },
    null,
    2,
  ),
);
