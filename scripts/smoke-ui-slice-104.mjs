import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(
  appJs,
  /copy: '아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다\.'/,
);
assert.match(appJs, /label: '현재 증적'/);
assert.match(appJs, /label: '다음 확인'/);
assert.match(appJs, /title: selectedArtifactMeta \? selectedArtifactMeta\.id : '증적 선택 대기'/);
assert.match(appJs, /title: selectedArtifactMeta \? artifactDetailSnapshot\.nextTitle : '증적 하나 고르기'/);
assert.match(appJs, /copy: selectedArtifactMeta\s*\?\s*artifactDetailSnapshot\.nextCopy/);
assert.match(appJs, /\$\{artifactsViewportStrip\}\s*\n\s*\$\{artifactsDeck\}/);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const artifacts = Object.values(executionGateState.artifacts);
const latestArtifact = artifacts[artifacts.length - 1];

assert.ok(mission);
assert.ok(task);
assert.ok(latestArtifact);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestArtifact.taskId, task.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactsDeckDensity: {
        stripFirst: true,
        deckCards: ['현재 증적', '다음 확인', '현재 맥락'],
        missionStatus: mission.status,
        artifactId: latestArtifact.id,
        waitingApproval: task.flags.waitingApproval,
      },
    },
    null,
    2,
  ),
);
