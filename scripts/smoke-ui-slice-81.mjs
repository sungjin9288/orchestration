import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /실행과 증적 연결만 짧게 봅니다\./);
assert.match(appJs, /연결 요약만 먼저 봅니다\./);
assert.match(appJs, /구조 요약이 없으면 원문으로 확인합니다\./);
assert.match(appJs, /이 증적은 원문만 확인합니다\./);
assert.match(appJs, /저장 원문이 최종 기준입니다\./);
assert.match(appJs, /기록된 처리 메모가 없습니다\./);
assert.match(appJs, /log-viewer log-viewer-compact/);
assert.match(appJs, /artifact-preview artifact-preview-compact/);
assert.match(appJs, /token-row token-row-compact/);

assert.match(styles, /\.log-viewer-compact,/);
assert.match(styles, /\.artifact-preview-compact \{/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      hqOpsRawCopyDensity: {
        compactCopy: [
          '실행과 증적 연결만 짧게 봅니다.',
          '연결 요약만 먼저 봅니다.',
          '구조 요약이 없으면 원문으로 확인합니다.',
          '이 증적은 원문만 확인합니다.',
          '저장 원문이 최종 기준입니다.',
          '기록된 처리 메모가 없습니다.',
        ],
        compactViewers: ['log-viewer-compact', 'artifact-preview-compact'],
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          allowedNextAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
