import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'agent-product-pattern-audit.md');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');

assert.match(audit, /mission-control rail/);
assert.match(audit, /Mission \/ Council \/ Execution \/ Deliverables/);

assert.match(appJs, /id: 'intake'[\s\S]*surface: 'mission'/);
assert.match(appJs, /id: 'council'[\s\S]*surface: 'council'/);
assert.match(appJs, /id: 'execution'[\s\S]*surface: 'execution'/);
assert.match(appJs, /id: 'deliverables'[\s\S]*surface: 'deliverables'/);
assert.match(appJs, /const missionId = mission\?\.id \|\| '';/);
assert.match(appJs, /data-action="open-surface-for-mission"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(step\.surface\)\}"/);
assert.match(appJs, /missionId \? '' : 'disabled'/);
assert.match(appJs, /if \(actionButton\?\.dataset\.action === 'open-surface-for-mission'\)/);
assert.match(appJs, /syncSelectionsFromMission\(actionButton\.dataset\.id\);/);
assert.match(appJs, /state\.surface = actionButton\.dataset\.targetSurface \|\| 'mission';/);
assert.match(appJs, /render\(\);\s*return;/);

assert.match(styles, /\.charter-flow-step \{/);
assert.match(styles, /appearance:\s*none;/);
assert.match(styles, /width:\s*100%;/);
assert.match(styles, /cursor:\s*pointer;/);
assert.match(styles, /text-align:\s*left;/);
assert.match(styles, /\.charter-flow-step:hover:not\(:disabled\),\s*\.charter-flow-step:focus-visible:not\(:disabled\) \{/);
assert.match(styles, /\.charter-flow-step:disabled \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoMissionControlRail: {
        surfaces: ['mission', 'council', 'execution', 'deliverables'],
        action: 'open-surface-for-mission',
        targetSurfaceAttribute: 'data-target-surface',
        states: ['현재 단계', '완료됨', '다음 단계'],
      },
    },
    null,
    2,
  ),
);
