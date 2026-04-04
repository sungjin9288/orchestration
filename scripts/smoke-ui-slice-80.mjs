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

assert.match(appJs, /run 기본 정보/);
assert.match(appJs, /증적 기본 정보/);
assert.match(appJs, /결재 기본 정보/);
assert.match(appJs, /detail-block detail-block-compact/);
assert.match(appJs, /token-row token-row-compact/);
assert.match(appJs, /kv-grid kv-grid-compact/);
assert.match(appJs, /kv-item kv-item-compact/);
assert.match(appJs, /연결 실행 셀/);
assert.match(appJs, /저장 시각/);
assert.match(appJs, /최근 갱신/);
assert.match(appJs, /detail-copy detail-copy-compact mono/);

assert.match(styles, /\.detail-block-compact \{/);
assert.match(styles, /\.kv-grid-compact \{/);
assert.match(styles, /\.kv-item-compact \{/);

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
      hqOpsMetaDensity: {
        sections: ['run 기본 정보', '증적 기본 정보', '결재 기본 정보'],
        compactClasses: ['detail-block-compact', 'kv-grid-compact', 'kv-item-compact'],
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
