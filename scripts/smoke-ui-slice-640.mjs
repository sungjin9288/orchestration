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

assert.match(appJs, /function renderOperatorRunway\(data, context, activeGroupId, focus, check\)/);
assert.match(appJs, /data-operator-runway="true"/);
assert.match(appJs, /aria-label="operator home: 현재 안건, 담당, 막힘, 다음 이동, 결과 확인 위치"/);
assert.match(appJs, /<h3 class="operator-runway-title">지금 할 일<\/h3>/);
assert.match(appJs, /Active mission/);
assert.match(appJs, /Owner/);
assert.match(appJs, /Gate \/ blocker/);
assert.match(appJs, /Next action/);
assert.match(appJs, /결과 위치: \$\{escapeHtml\(resultSurfaceLabel\)\}/);
assert.match(appJs, /아티팩트에서 근거 보기/);
assert.match(appJs, /로그에서 실행 흐름 보기/);
assert.match(appJs, /renderOperatorRunway\(data, context, activeGroupId, focus, check\)[\s\S]*renderControlOverviewSignalStrip/);
assert.match(appJs, /const resultSurface = SURFACE_LOCATION_GUIDANCE\[state\.surface\]\?\.resultSurface \|\| 'deliverables';/);
assert.match(appJs, /context\.pendingGateCount > 0[\s\S]*사람 게이트/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(nextTargetSurface\)\}"/);

assert.match(styles, /\.operator-runway \{/);
assert.match(styles, /\.operator-runway-grid \{/);
assert.match(styles, /\.operator-runway-cell-mission \{/);
assert.match(styles, /\.operator-runway-cell-next \{/);
assert.match(styles, /\.operator-runway-action-primary \{/);
assert.match(styles, /@media \(max-width: 1180px\)[\s\S]*\.operator-runway-grid \{[\s\S]*grid-template-columns: 1fr;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      operatorHomeRunway: {
        firstViewportAnswers: ['active mission', 'owner', 'gate/blocker', 'next action', 'result location'],
        shortcuts: ['next target', 'deliverables/result', 'artifacts/evidence', 'logs/execution-flow'],
        boundary: 'display-only UI orientation; runtime, API, provider, approval, and artifact semantics unchanged',
      },
    },
    null,
    2,
  ),
);
