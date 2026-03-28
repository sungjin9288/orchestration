import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-19');
const statePath = path.join(runtimeRoot, 'state.json');

const smoke19Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-19.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke19 = JSON.parse(smoke19Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke19.mission.id];
const councilSession = runtimeState.councilSessions[mission.councilSessionId];

assert.equal(smoke19.ok, true);
assert.match(appJs, /function getMissionCouncilPreview/);
assert.match(appJs, /Council preview:/);
assert.match(appJs, /Recommendation Preview:/);
assert.match(appJs, /Alignment State:/);
assert.match(appJs, /alignment:none/);
assert.match(appJs, /open-questions:0/);
assert.equal(mission.status, 'aligning');
assert.equal(councilSession.status, 'pending-alignment');
assert.equal(councilSession.alignment.status, 'pending');
assert.ok(councilSession.recommendation);
assert.ok(councilSession.selectedPlan?.title);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      councilPreview: {
        missionId: mission.id,
        missionStatus: mission.status,
        councilSessionId: councilSession.id,
        councilStatus: councilSession.status,
        alignmentStatus: councilSession.alignment.status,
        selectedPlanTitle: councilSession.selectedPlan.title,
      },
    },
    null,
    2,
  ),
);
