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
assert.match(appJs, /이름 → 역할 → desk/);
assert.match(appJs, /현재 배정/);
assert.match(appJs, /배정 저장/);
assert.match(appJs, /class="ops-create-preview"/);
assert.match(appJs, /class="ops-form-stack"/);
assert.match(appJs, /class="field-grid company-member-field-grid ops-form-order-grid"/);
assert.match(appJs, /class="company-member-admin-grid ops-form-order-grid"/);
assert.match(appJs, /class="ops-form-section ops-assignment-fields(?: ops-form-section-muted| ops-form-order-section)?"/);
assert.match(appJs, /class="ops-assignment-row-grid"/);

assert.match(styles, /\.ops-create-preview \{/);
assert.match(styles, /\.ops-create-preview-cell \{/);
assert.match(styles, /\.ops-form-stack \{/);
assert.match(styles, /\.ops-form-order-grid \{/);
assert.match(styles, /\.ops-form-section \{/);
assert.match(styles, /\.ops-form-section-muted \{/);
assert.match(styles, /\.ops-form-section-head \{/);
assert.match(styles, /\.ops-assignment-row-grid \{/);
assert.match(styles, /\.ops-assignment-fields \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsFormDensity: {
        app: [
          'renderOpsCreatePreview()',
          '역할',
          'desk',
          '이름 → 역할 → desk',
          '현재 배정',
          '배정 저장',
        ],
        styles: [
          'ops-create-preview',
          'ops-create-preview-cell',
          'ops-form-stack',
          'ops-form-order-grid',
          'ops-form-section',
          'ops-form-section-muted',
          'ops-form-section-head',
          'ops-assignment-row-grid',
          'ops-assignment-fields',
        ],
      },
    },
    null,
    2,
  ),
);
