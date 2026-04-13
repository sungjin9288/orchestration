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

assert.match(appJs, /function renderOpsCreatePreview\(\)/);
assert.match(appJs, /<span class="control-overview-register-label">역할<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">desk<\/span>/);
assert.match(appJs, /<strong class="ops-form-section-title">이름 → 역할 → desk<\/strong>/);
assert.match(appJs, /<strong class="ops-form-section-title">현재 배정<\/strong>/);
assert.match(appJs, /roster와 회사 구조에 추가합니다\./);
assert.match(appJs, /roster와 회사 구조에 반영합니다\./);
assert.match(appJs, /class="field-grid company-member-field-grid ops-form-order-grid"/);
assert.match(appJs, /class="company-member-admin-grid ops-form-order-grid"/);
assert.match(appJs, /class="ops-form-section ops-assignment-fields ops-form-section-muted"/);

assert.match(styles, /\.ops-form-order-grid \{/);
assert.match(styles, /\.ops-form-section-muted \{/);
assert.match(styles, /\.ops-form-section-muted \.ops-form-section-title \{/);
assert.match(styles, /\.ops-form-section-muted \.ops-staffing-current-cell \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsFieldOrderShortening: {
        app: [
          'renderOpsCreatePreview()',
          '역할',
          'desk',
          '이름 → 역할 → desk',
          '현재 배정',
          'roster와 회사 구조에 추가합니다.',
          'roster와 회사 구조에 반영합니다.',
        ],
        styles: [
          'ops-form-order-grid',
          'ops-form-section-muted',
          'ops-form-section-muted .ops-form-section-title',
          'ops-form-section-muted .ops-staffing-current-cell',
        ],
      },
    },
    null,
    2,
  ),
);
