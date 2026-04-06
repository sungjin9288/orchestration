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

assert.match(appJs, /copy: '현재 실행 셀과 다음 실행을 조정합니다\.'/);
assert.match(appJs, /copy: '현재 실행 기록과 다음 확인을 빠르게 훑습니다\.'/);
assert.match(appJs, /copy: '현재 증적과 연결 근거를 확인합니다\.'/);
assert.match(appJs, /copy: '현재 안건과 다음 처리를 판단합니다\.'/);
assert.match(appJs, /kicker: '실행셀'/);
assert.match(appJs, /kicker: '실행기록'/);
assert.match(appJs, /kicker: '증적'/);
assert.match(appJs, /kicker: '결재'/);
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
