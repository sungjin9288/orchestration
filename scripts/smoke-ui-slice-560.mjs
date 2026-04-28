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

assert.match(appJs, /targetSurface:\s*'council'/);
assert.match(appJs, /targetSurface:\s*'execution'/);
assert.match(appJs, /targetSurface:\s*'deliverables'/);
assert.match(appJs, /targetSurface:\s*'artifacts'/);
assert.match(appJs, /targetSurface:\s*'decision-inbox'/);
assert.match(appJs, /class="workspace-location-action"/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(location\.targetSurface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(location\.targetSurface\)\}"/);
assert.match(appJs, /const targetSurfaceLabel = location\.targetSurface/);
assert.match(appJs, /\$\{escapeHtml\(targetSurfaceLabel\)\} 열기/);
assert.match(appJs, /class="workspace-location-static"/);
assert.match(appJs, /결정 후 원래 desk로 돌아갑니다/);

assert.match(styles, /\.workspace-location-action \{/);
assert.match(styles, /\.workspace-location-action:hover,/);
assert.match(styles, /\.workspace-location-action:disabled \{/);
assert.match(styles, /\.workspace-location-static \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceNextMovement: {
        actionTargets: ['council', 'execution', 'deliverables', 'artifacts', 'decision-inbox'],
        actionContract: 'workspace-location-action reuses data-action=open-surface',
        staticFallback: 'decision-inbox returns after decision',
      },
    },
    null,
    2,
  ),
);
