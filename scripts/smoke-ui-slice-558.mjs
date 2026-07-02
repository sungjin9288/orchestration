import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfigJs = fs.readFileSync(surfaceConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(surfaceConfigJs, /export const SURFACE_NAV_GUIDANCE = \{/);
assert.match(surfaceConfigJs, /mission:\s*'목표와 제약을 입력하고 첫 안건을 확인'/);
assert.match(surfaceConfigJs, /execution:\s*'진행 중 작업, 막힘, 다음 실행을 확인'/);
assert.match(surfaceConfigJs, /deliverables:\s*'완료 결과와 인계 패킷을 확인'/);
assert.match(surfaceConfigJs, /artifacts:\s*'작업 증적, 파일, 패킷 근거를 확인'/);
assert.match(surfaceConfigJs, /logs:\s*'실행 run 기록과 오류 흐름을 추적'/);
assert.match(surfaceConfigJs, /'decision-inbox':\s*'승인·보류가 필요한 사람 판단을 처리'/);
assert.match(surfaceConfigJs, /작업 결과는 산출물, 근거는 아티팩트, 실행 흐름은 로그에서 확인합니다\./);
assert.match(surfaceConfigJs, /승인이 필요하면 결정함, 실제 작업 근거는 아티팩트, 실행 중 무슨 일이 있었는지는 로그에서 봅니다\./);
assert.match(surfaceConfigJs, /작업판은 세부 실행 셀의 관제 위치입니다\./);
assert.match(appJs, /class="workspace-playbook-summary"/);
assert.match(appJs, /class="workspace-playbook-where"/);
assert.match(appJs, /class="nav-button-help">\$\{escapeHtml\(guidance\)\}<\/span>/);
assert.match(appJs, /button\.setAttribute\('aria-label', `\$\{label\} \$\{count\}건\. \$\{guidance\}`\);/);

assert.match(styles, /\.workspace-playbook-summary \{/);
assert.match(styles, /\.workspace-playbook-where \{/);
assert.match(styles, /\.nav-button-copy \{/);
assert.match(styles, /\.nav-button-help \{/);
assert.match(styles, /\.nav-button\.is-active \.nav-button-help \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      operatorOrientation: {
        navGuidance: ['mission', 'execution', 'deliverables', 'artifacts', 'logs', 'decision-inbox'],
        workResultLocations: ['산출물', '아티팩트', '로그', '결정함', '작업판'],
        cssMarkers: ['workspace-playbook-summary', 'workspace-playbook-where', 'nav-button-help'],
      },
    },
    null,
    2,
  ),
);
