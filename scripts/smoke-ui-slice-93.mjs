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

assert.match(appJs, /function renderSurfaceLeadStrip\(options = \{\}\)/);
assert.doesNotMatch(appJs, /function renderAdvancedOpsNotice\(copy\)/);

assert.match(appJs, /title: '작업판'/);
assert.match(appJs, /copy: '현재 실행 셀과 다음 지시만 먼저 봅니다\.'/);
assert.match(appJs, /title: '관제실 로그실'/);
assert.match(appJs, /copy: '선택한 run의 원문과 연결선만 먼저 봅니다\.'/);
assert.match(appJs, /title: '증적 보관실'/);
assert.match(appJs, /copy: '최신 증적 묶음과 저장 원문만 먼저 봅니다\.'/);
assert.match(appJs, /title: '관제실 결재함'/);
assert.match(appJs, /copy: '대기 결재와 최근 처리만 먼저 봅니다\.'/);
assert.match(appJs, /현재 셀 중심/);
assert.match(appJs, /고급 점검/);
assert.match(appJs, /고급 provenance/);
assert.match(appJs, /사람 결재/);

assert.match(styles, /\.surface-lead-strip \{/);
assert.match(styles, /\.surface-lead-head \{/);
assert.match(styles, /\.surface-lead-note \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoSurfaceLeadStrip: {
        helper: 'renderSurfaceLeadStrip',
        surfaces: ['작업판', '관제실 로그실', '증적 보관실', '관제실 결재함'],
        classes: ['surface-lead-strip', 'surface-lead-head', 'surface-lead-note'],
      },
    },
    null,
    2,
  ),
);
