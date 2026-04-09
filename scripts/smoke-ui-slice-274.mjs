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

assert.match(appJs, /renderOpsEditorSteps\(\)/);
assert.match(appJs, /AI 에이전트 추가/);
assert.match(appJs, /현재 배정 현황/);
assert.match(appJs, /역할\/데스크 편집/);
assert.match(appJs, /역할/);
assert.match(appJs, /desk/);
assert.match(appJs, /새 AI agent를 등록하고 회사 구조에 올립니다\./);
assert.match(appJs, /reviewer, builder, ops 역할을 먼저 정합니다\./);
assert.match(appJs, /어느 desk에서 일할지 저장합니다\./);

assert.match(styles, /\.ops-editor-sequence \{/);
assert.match(styles, /\.ops-editor-step \{/);
assert.match(styles, /\.ops-admin-grid \{/);
assert.match(styles, /\.ops-editor-scope \{/);
assert.match(styles, /\.ops-staffing-shell \{/);
assert.match(styles, /\.ops-current-lineup \{/);
assert.match(styles, /\.ops-assignment-editor \{/);
assert.match(styles, /\.ops-staffing-current \{/);
assert.match(styles, /\.ops-staffing-current-cell \{/);
assert.match(styles, /\.ops-form-footer \{/);
assert.match(styles, /\.ops-form-footer-row \{/);
assert.match(styles, /\.ops-form-footer-actions \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsOrgEditorPolish: {
        app: [
          'renderOpsEditorSteps()',
          'AI 에이전트 추가',
          '현재 배정 현황',
          '역할/데스크 편집',
          '역할',
          'desk',
        ],
        styles: [
          'ops-editor-sequence',
          'ops-editor-step',
          'ops-admin-grid',
          'ops-editor-scope',
          'ops-staffing-shell',
          'ops-current-lineup',
          'ops-assignment-editor',
          'ops-form-footer',
          'ops-form-footer-row',
          'ops-form-footer-actions',
        ],
      },
    },
    null,
    2,
  ),
);
