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

assert.match(surfaceConfigJs, /resultSurface:\s*'deliverables'/);
assert.match(surfaceConfigJs, /resultSurface:\s*'artifacts'/);
assert.match(appJs, /결과 확인/);
assert.match(appJs, /workspace-location-action workspace-location-action-secondary/);
assert.match(appJs, /const resultSurface = location\.resultSurface \|\| 'deliverables';/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /\$\{escapeHtml\(resultSurfaceLabel\)\}에서 결과 보기/);
assert.match(appJs, /data-action="open-surface"/);

assert.match(styles, /\.workspace-location-strip \{[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/);
assert.match(styles, /\.workspace-location-action-secondary \{/);
assert.match(styles, /\.workspace-location-action-secondary:hover,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceResultShortcut: {
        resultCell: '결과 확인',
        resultTargets: ['deliverables', 'artifacts'],
        actionContract: 'result shortcut reuses data-action=open-surface',
      },
    },
    null,
    2,
  ),
);
