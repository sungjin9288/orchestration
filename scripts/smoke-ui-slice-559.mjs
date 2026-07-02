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

assert.match(surfaceConfigJs, /export const SURFACE_LOCATION_GUIDANCE = \{/);
assert.match(surfaceConfigJs, /check:\s*'완료 결과·인계 패킷'/);
assert.match(surfaceConfigJs, /next:\s*'아티팩트'/);
assert.match(surfaceConfigJs, /check:\s*'run 기록·오류 흐름'/);
assert.match(surfaceConfigJs, /check:\s*'승인·보류·해결 대기'/);
assert.match(surfaceConfigJs, /surfaces:\s*\['mission'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['council', 'execution'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['deliverables', 'artifacts', 'logs'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['artifacts'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['logs'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['decision-inbox'\]/);
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
