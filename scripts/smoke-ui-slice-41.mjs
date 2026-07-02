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

const detailHeaderMatch = appJs.match(/eyebrow: '안건 배정 판단판'[\s\S]*?tokens:\s*\[([\s\S]*?)\],\s*cards:/);
const snapshotSectionMatch = appJs.match(/<strong>브리프 핵심 4줄<\/strong>[\s\S]*?<\/section>/);
const completionSectionMatch = appJs.match(/<strong>안건 종료 보고<\/strong>[\s\S]*?<\/section>/);
const councilSectionMatch = appJs.match(/<strong>참여 역할<\/strong>[\s\S]*?<\/section>/);

assert.ok(detailHeaderMatch, '안건 배정 판단판 token row should exist');
assert.ok(snapshotSectionMatch, '브리프 핵심 4줄 section should exist');
assert.ok(completionSectionMatch, '안건 종료 보고 section should exist');
assert.ok(councilSectionMatch, '참여 역할 section should exist');

assert.match(detailHeaderMatch[1], /연결태스크:/);
assert.doesNotMatch(detailHeaderMatch[1], /createToken\(`미션:/);

assert.match(snapshotSectionMatch[0], /createToken\([\s\S]*?`표면:/);
assert.match(snapshotSectionMatch[0], /createToken\([\s\S]*?`액션:/);
assert.doesNotMatch(snapshotSectionMatch[0], /createToken\([\s\S]*?`artifact:/);
assert.doesNotMatch(snapshotSectionMatch[0], /createToken\([\s\S]*?`review:/);

assert.match(completionSectionMatch[0], /createToken\([\s\S]*?`종료정리:/);
assert.doesNotMatch(completionSectionMatch[0], /createToken\([\s\S]*?`release-package:/);
assert.doesNotMatch(completionSectionMatch[0], /createToken\([\s\S]*?`delivery:/);

assert.match(councilSectionMatch[0], /createToken\([\s\S]*?`참여자:/);
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
