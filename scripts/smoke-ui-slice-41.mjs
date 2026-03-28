import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const activeStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');
const completedStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-29', 'state.json');

function countTokens(section) {
  return (section.match(/createToken\(/g) || []).length;
}

assert.equal(fs.existsSync(activeStatePath), true, 'runtime-ui-slice-20 state.json is required');
assert.equal(fs.existsSync(completedStatePath), true, 'runtime-ui-slice-29 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const activeState = JSON.parse(fs.readFileSync(activeStatePath, 'utf8'));
const completedState = JSON.parse(fs.readFileSync(completedStatePath, 'utf8'));

const detailHeaderMatch = appJs.match(/<h2>Mission Detail<\/h2>[\s\S]*?<div class="token-row token-row-compact">([\s\S]*?)<\/div>/);
const snapshotSectionMatch = appJs.match(/<strong>Mission Snapshot<\/strong>[\s\S]*?<\/section>/);
const completionSectionMatch = appJs.match(/<strong>Mission Completion<\/strong>[\s\S]*?<\/section>/);
const councilSectionMatch = appJs.match(/<strong>Council<\/strong>[\s\S]*?<\/section>/);

assert.ok(detailHeaderMatch, 'Mission detail header token row should exist');
assert.ok(snapshotSectionMatch, 'Mission Snapshot section should exist');
assert.ok(completionSectionMatch, 'Mission Completion section should exist');
assert.ok(councilSectionMatch, 'Council section should exist');

assert.match(detailHeaderMatch[1], /linked-task:/);
assert.doesNotMatch(detailHeaderMatch[1], /createToken\(`mission:/);

assert.match(snapshotSectionMatch[0], /createToken\([\s\S]*?`surface:/);
assert.match(snapshotSectionMatch[0], /createToken\([\s\S]*?`action:/);
assert.doesNotMatch(snapshotSectionMatch[0], /createToken\([\s\S]*?`artifact:/);
assert.doesNotMatch(snapshotSectionMatch[0], /createToken\([\s\S]*?`review:/);

assert.match(completionSectionMatch[0], /createToken\([\s\S]*?`close-out:/);
assert.doesNotMatch(completionSectionMatch[0], /createToken\([\s\S]*?`release-package:/);
assert.doesNotMatch(completionSectionMatch[0], /createToken\([\s\S]*?`delivery:/);

assert.match(councilSectionMatch[0], /createToken\([\s\S]*?`participants:/);
assert.doesNotMatch(councilSectionMatch[0], /createToken\(selectedCouncilSession\.id/);

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];
const completedMission = Object.values(completedState.missions)[0];
const completedTask = completedState.tasks[completedMission.linkedTaskId];

assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(completedTask.lifecycleState, 'Done');

console.log(
  JSON.stringify(
    {
      ok: true,
      detailTokenDensity: {
        detailHeaderTokenCount: countTokens(detailHeaderMatch[1]),
        snapshotTokenCount: countTokens(snapshotSectionMatch[0]),
        completionTokenCount: countTokens(completionSectionMatch[0]),
        councilTokenCount: countTokens(councilSectionMatch[0]),
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        completedMissionId: completedMission.id,
        completedTaskId: completedTask.id,
      },
    },
    null,
    2,
  ),
);
