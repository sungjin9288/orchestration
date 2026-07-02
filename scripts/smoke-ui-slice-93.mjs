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

assert.match(appJs, /eyebrow: '작업 인계선'/);
assert.match(appJs, /eyebrow: '로그 인계선'/);
assert.match(appJs, /eyebrow: '증적 인계선'/);
assert.match(appJs, /eyebrow: '결재 인계선'/);
assert.match(appJs, /desk: '실행 셀'/);
assert.match(appJs, /desk: '실행 로그'/);
assert.match(appJs, /desk: '증적 패킷'/);
assert.match(appJs, /desk: '승인선'/);
assert.doesNotMatch(appJs, /고급 provenance/);
assert.doesNotMatch(appJs, /선택한 run의 원문과 연결선만 먼저 봅니다\./);

assert.match(styles, /\.surface-lead-strip \{/);
assert.match(styles, /\.surface-lead-head \{/);
assert.match(styles, /\.surface-lead-note \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoSurfaceLeadStrip: {
        helper: 'renderSurfaceLeadStrip',
        surfaces: ['작업판', '로그', '아티팩트', '결정함'],
        classes: ['surface-lead-strip', 'surface-lead-head', 'surface-lead-note'],
      },
    },
    null,
    2,
  ),
);
