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

assert.match(appJs, /const SURFACE_LOCATION_GUIDANCE = \{/);
assert.match(appJs, /check:\s*'완료 결과·인계 패킷'/);
assert.match(appJs, /next:\s*'아티팩트'/);
assert.match(appJs, /check:\s*'run 기록·오류 흐름'/);
assert.match(appJs, /check:\s*'승인·보류·해결 대기'/);
assert.match(appJs, /surfaces:\s*\['mission'\]/);
assert.match(appJs, /surfaces:\s*\['council', 'execution'\]/);
assert.match(appJs, /surfaces:\s*\['deliverables'\]/);
assert.match(appJs, /surfaces:\s*\['artifacts'\]/);
assert.match(appJs, /surfaces:\s*\['logs'\]/);
assert.match(appJs, /surfaces:\s*\['decision-inbox'\]/);
assert.match(appJs, /class="workspace-location-strip"/);
assert.match(appJs, /현재 위치/);
assert.match(appJs, /여기서 확인/);
assert.match(appJs, /다음 이동/);
assert.match(appJs, /data-step-state="\$\{isCurrentStep \? 'current' : 'idle'\}"/);
assert.match(appJs, /workspace-playbook-card \$\{isCurrentStep \? 'is-current-step' : ''\}/);

assert.match(styles, /\.workspace-location-strip \{/);
assert.match(styles, /\.workspace-location-cell \{/);
assert.match(styles, /\.workspace-location-cell-current \{/);
assert.match(styles, /\.workspace-location-label \{/);
assert.match(styles, /\.workspace-location-value \{/);
assert.match(styles, /\.workspace-playbook-card\.is-current-step \{/);
assert.match(styles, /\.workspace-playbook-card\.is-current-step \.workspace-playbook-step \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationOrientation: {
        currentLocationRegister: ['현재 위치', '여기서 확인', '다음 이동'],
        trackedSurfaces: ['mission', 'council', 'execution', 'deliverables', 'artifacts', 'logs', 'decision-inbox'],
        cssMarkers: ['workspace-location-strip', 'workspace-location-cell-current', 'is-current-step'],
      },
    },
    null,
    2,
  ),
);
