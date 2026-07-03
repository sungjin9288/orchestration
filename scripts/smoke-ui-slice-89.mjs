import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(controlSnapshots, /export function getMissionSurfaceRailEntries\(mission, previews\)/);
assert.match(controlSnapshots, /label: '안건'/);
assert.match(controlSnapshots, /label: '회의'/);
assert.match(controlSnapshots, /label: '실행'/);
assert.match(controlSnapshots, /label: '보고'/);
assert.match(appJs, /class="card mission-row-card/);
assert.match(appJs, /class="list-button mission-row-button"/);
assert.match(appJs, /class="mission-row-rail"/);
assert.match(appJs, /class="mission-row-rail-button \$\{entry\.isNext \? 'mission-row-rail-button-next' : ''\}"/);
assert.match(appJs, /data-action="open-surface-for-mission"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(entry\.surface\)\}"/);
assert.match(appJs, /<strong class="mission-row-rail-label">\$\{escapeHtml\(entry\.label\)\}<\/strong>/);
assert.match(appJs, /<span class="mission-row-rail-status">\$\{escapeHtml\(entry\.status\)\}<\/span>/);

assert.match(styles, /\.mission-row-card \{/);
assert.match(styles, /\.mission-row-rail \{/);
assert.match(styles, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
assert.match(styles, /\.mission-row-rail-button \{/);
assert.match(styles, /\.mission-row-rail-button-next \{/);
assert.match(styles, /\.mission-row-rail-label \{/);
assert.match(styles, /\.mission-row-rail-status \{/);
assert.match(styles, /\.mission-row-rail-button:hover:not\(:disabled\),\s*\.mission-row-rail-button:focus-visible:not\(:disabled\) \{/);
assert.match(styles, /@media \(max-width: 1180px\) \{[\s\S]*\.mission-row-rail \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(styles, /@media \(max-width: 720px\) \{[\s\S]*\.mission-row-rail \{\s*grid-template-columns: 1fr;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoMissionRowControlRail: {
        labels: ['안건', '회의', '실행', '보고'],
        classes: ['mission-row-card', 'mission-row-rail', 'mission-row-rail-button'],
        action: 'open-surface-for-mission',
        responsive: ['4-col', '2-col', '1-col'],
      },
    },
    null,
    2,
  ),
);
