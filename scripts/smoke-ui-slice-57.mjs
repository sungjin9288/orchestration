import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const activeStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(activeStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const activeState = JSON.parse(fs.readFileSync(activeStatePath, 'utf8'));

assert.match(appJs, /<div class="panel-header panel-header-tight">[\s\S]*?<h2>Mission Detail<\/h2>/);
assert.match(
  appJs,
  /<p class="panel-copy panel-copy-tight">Mission stays primary\. Advanced Ops stays secondary\.<\/p>/,
);
assert.match(appJs, /<h2>Mission Detail<\/h2>[\s\S]*?<div class="token-row token-row-compact">/);

assert.match(styles, /\.panel-header-tight\s*\{/);
assert.match(styles, /\.panel-copy-tight\s*\{/);
assert.match(styles, /\.token-row-compact\s*\{/);

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];
const activeApproval = Object.values(activeState.approvals).find((approval) => approval.status === 'pending');

assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(activeApproval?.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      missionDetailHeaderDensity: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        compactHeaderSignals: 3,
      },
    },
    null,
    2,
  ),
);
