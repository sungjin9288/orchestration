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

assert.match(
  appJs,
  /<section class="relation-strip relation-strip-compact">[\s\S]*?<div class="card-title-row card-title-row-tight">[\s\S]*?<strong>\$\{escapeHtml\(selectedMission\.title\)\}<\/strong>[\s\S]*?<p class="detail-copy detail-copy-compact">\$\{escapeHtml\(selectedMission\.goal \|\| '기록된 미션 목표가 없습니다\.'\)\}<\/p>/,
);

assert.match(styles, /\.relation-strip-compact\s*\{/);
assert.match(styles, /\.card-title-row-tight\s*\{/);
assert.match(styles, /\.detail-copy-compact\s*\{/);

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
      missionTitleStripDensity: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        compactStripSignals: 3,
      },
    },
    null,
    2,
  ),
);
