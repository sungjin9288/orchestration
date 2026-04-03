import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeServicePath = path.join(repoRoot, 'src', 'runtime', 'runtime-service.js');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeService = fs.readFileSync(runtimeServicePath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /탐지된 연결 워크트리/);
assert.match(appJs, /연결 워크트리 선택 항목이 없습니다\./);
assert.match(appJs, /적용할 연결 워크트리를 먼저 선택하세요\./);
assert.match(appJs, /프로젝트를 등록하는 중…/);
assert.match(appJs, /planner 실행을 시작하기 전에 태스크를 먼저 선택하세요\./);
assert.match(appJs, /연결 워크트리 \${slug} 생성 중…/);
assert.match(appJs, /연결 워크트리 \${worktreePath}를 활성 프로젝트로 등록하는 중…/);
assert.match(appJs, /task\.worktreeRef와 현재 project_path/);
assert.match(appJs, /현재 활성 project 기준으로 탐지된 연결 루트만 보여줍니다/);
assert.match(appJs, /실행차단/);
assert.match(appJs, /플래너는 .* 전까지 비활성입니다\./);
assert.match(appJs, /설계 실행은 .* 전까지 비활성입니다\./);
assert.match(appJs, /현재 실행은 .* 전까지 진행할 수 없습니다\./);

assert.match(runtimeService, /프로젝트 이름이 필요합니다\./);
assert.match(runtimeService, /project_path가 필요합니다\./);
assert.match(runtimeService, /project_path가 존재하지 않습니다:/);
assert.match(runtimeService, /미션 제목이 필요합니다\./);
assert.match(runtimeService, /미션 목표가 필요합니다\./);
assert.match(runtimeService, /태스크 제목이 필요합니다\./);
assert.match(serveUi, /executionEntrySummaries:/);

assert.doesNotMatch(appJs, /탐지된 linked worktree/);
assert.doesNotMatch(appJs, /Active project is required before creating a linked worktree/);
assert.doesNotMatch(appJs, /Select a task before starting planner run/);
assert.doesNotMatch(runtimeService, /Project name is required/);
assert.doesNotMatch(runtimeService, /Mission title is required/);
assert.doesNotMatch(runtimeService, /Task title is required/);

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
      koreanLinkedWorktreeAndErrors: {
        linkedWorktreeCopy: [
          '탐지된 연결 워크트리',
          'task.worktreeRef와 현재 project_path',
          '연결 워크트리 선택 항목이 없습니다.',
        ],
        operatorErrors: [
          '프로젝트 이름이 필요합니다.',
          '미션 제목이 필요합니다.',
          '태스크 제목이 필요합니다.',
        ],
        runtimeTruth: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          approvalAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
