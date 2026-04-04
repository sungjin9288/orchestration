import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-184');

const appJs = fs.readFileSync(appJsPath, 'utf8');

function extractFunction(source, name) {
  const signature = `function ${name}(`;
  const start = source.indexOf(signature);

  if (start === -1) {
    throw new Error(`Function ${name} was not found in ui/app.js`);
  }

  const paramsStart = source.indexOf('(', start);

  if (paramsStart === -1) {
    throw new Error(`Function ${name} has no opening parenthesis`);
  }

  let paramsDepth = 0;
  let paramsEnd = -1;

  for (let index = paramsStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === '(') {
      paramsDepth += 1;
      continue;
    }

    if (character === ')') {
      paramsDepth -= 1;

      if (paramsDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }

  if (paramsEnd === -1) {
    throw new Error(`Function ${name} has no closing parenthesis`);
  }

  const braceStart = source.indexOf('{', paramsEnd);

  if (braceStart === -1) {
    throw new Error(`Function ${name} has no opening brace`);
  }

  let depth = 0;

  for (let index = braceStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
      continue;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Function ${name} did not terminate cleanly`);
}

function loadHelpers() {
  const context = vm.createContext({
    console,
    state: {
      loading: false,
      mutating: false,
    },
  });
  const functionNames = [
    'escapeHtml',
    'sortByCreatedDesc',
    'getTaskApprovals',
    'getTaskInboxItems',
    'getLatestTaskArtifact',
    'getPreferredTaskInboxItem',
    'getPlannerAvailability',
    'getPrimaryBlockedReason',
    'getArchitectAvailability',
    'getTaskBreakerAvailability',
    'getBuilderPreflightAvailability',
    'getDevelopmentPackExecutionGateReason',
    'getBuilderLiveMutationSummaries',
    'getReviewStatusDisplay',
    'getApprovalStatusDisplay',
    'getApprovalTone',
    'getApprovalActionLabel',
    'describeApprovalTarget',
    'getRunStatusDisplay',
    'getExecutionStageDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailStatusDisplay',
    'getEvidenceRailStatusTone',
    'getEvidenceRailHandoffDisplay',
    'getInboxTone',
    'createToken',
    'getTaskApprovalBridge',
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    createToken: context.createToken,
    getApprovalTone: context.getApprovalTone,
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
    getInboxTone: context.getInboxTone,
    getTaskApprovalBridge: context.getTaskApprovalBridge,
  };
}

function createRoleArtifact(runtime, taskId, role, type, content, summary = {}) {
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type,
    content,
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function sortRecordsDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

function buildUiData(runtime, coordinator, projectId) {
  const snapshot = runtime.getSnapshot();
  const tasks = Object.values(snapshot.tasks)
    .filter((task) => task.projectId === projectId)
    .sort(sortRecordsDesc);
  const runs = Object.values(snapshot.runs)
    .filter((run) => {
      const task = snapshot.tasks[run.taskId];
      return task && task.projectId === projectId;
    })
    .sort(sortRecordsDesc);
  const artifacts = Object.values(snapshot.artifacts)
    .filter((artifact) => {
      const task = snapshot.tasks[artifact.taskId];
      return task && task.projectId === projectId;
    })
    .sort(sortRecordsDesc);
  const inboxItems = Object.values(snapshot.decisionInboxItems)
    .filter((item) => item.projectId === projectId)
    .sort(sortRecordsDesc);
  const approvals = Object.values(snapshot.approvals)
    .filter((approval) => approval.projectId === projectId)
    .sort(sortRecordsDesc);

  return {
    approvals,
    artifacts,
    artifactMap: new Map(artifacts.map((artifact) => [artifact.id, artifact])),
    derived: {
      executionEntrySummaries: coordinator.listExecutionEntryReadinessSummaries(),
      reviewerReadinessSummaries: coordinator.listReviewerReadinessSummaries(),
      taskGuardSummaries: runtime.listTaskGuardSummaries(),
    },
    inboxItems,
    runs,
    runMap: new Map(runs.map((run) => [run.id, run])),
    taskMap: new Map(tasks.map((task) => [task.id, task])),
  };
}

async function createPlanningChain(coordinator, taskId) {
  const routingOutcome = {
    classification: 'new task',
    decisionNote: '',
    missingContext: [],
    scopeStatement:
      'Keep the Deliverables approval bridge token row aligned to the current evidence rail handoff truth.',
  };

  const planner = await coordinator.runPlanner({
    taskId,
    routingOutcome,
  });
  const architect = await coordinator.runArchitect({ taskId });
  const taskBreaker = await coordinator.runTaskBreaker({ taskId });
  const preflight = await coordinator.runBuilderPreflight({ taskId });

  return {
    architect,
    planner,
    preflight,
    taskBreaker,
  };
}

function createPendingBuilderApproval(runtime, taskId) {
  return runtime.requestBuilderLiveMutationApproval({ taskId });
}

function createProviderBlockedChain(runtime, taskId) {
  const plan = createRoleArtifact(runtime, taskId, 'planner', 'plan', '# Plan', {
    nextStage: 'architect',
  });
  const architecture = createRoleArtifact(runtime, taskId, 'architect', 'architecture', '# Architecture', {
    inputArtifactId: plan.artifact.id,
    inputRunId: plan.run.id,
    nextStage: 'task-breaker',
  });

  return createRoleArtifact(runtime, taskId, 'task-breaker', 'breakdown', '# Breakdown', {
    architectureArtifactId: architecture.artifact.id,
    architectureRunId: architecture.run.id,
    inputArtifactIds: [plan.artifact.id, architecture.artifact.id],
    inputRunIds: [plan.run.id, architecture.run.id],
    nextStage: 'builder',
  });
}

function renderApprovalBridgeTokenRow({
  approvalBridge,
  createToken,
  evidenceRail,
  getApprovalTone,
  getInboxTone,
}) {
  return `
    <div class="token-row">
      ${createToken(
        `현재:${evidenceRail.currentOwnerLabel}`,
        evidenceRail.blockedReason ? 'danger' : 'accent',
      )}
      ${createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral')}
      ${
        approvalBridge.currentApproval
          ? createToken(
              `승인:${approvalBridge.currentApproval.id}`,
              getApprovalTone(approvalBridge.currentApproval.status),
            )
          : createToken('승인:없음', 'neutral')
      }
      ${
        approvalBridge.targetArtifact
          ? createToken(`대상:${approvalBridge.targetArtifact.type}`, 'neutral')
          : ''
      }
      ${
        approvalBridge.targetArtifact
          ? createToken(`아티팩트:${approvalBridge.targetArtifact.id}`, 'neutral')
          : ''
      }
      ${
        approvalBridge.pendingInboxItem
          ? createToken(
              `결정함:${approvalBridge.pendingInboxItem.id}`,
              getInboxTone(approvalBridge.pendingInboxItem),
            )
          : ''
      }
    </div>
  `;
}

fs.rmSync(runtimeRoot, { recursive: true, force: true });

const runtime = createRuntimeService({ runtimeRoot });
const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const {
  createToken,
  getApprovalTone,
  getExecutionEvidenceRail,
  getGuardReasonDisplay,
  getInboxTone,
  getTaskApprovalBridge,
} = loadHelpers();

assert.match(appJs, /<strong>현재 결재 안건<\/strong>/);
assert.match(
  appJs,
  /createToken\(\s*`현재:\$\{deliverablesEvidenceState\.currentOwnerLabel\}`,\s*deliverablesEvidenceState\.blockedReason \? 'danger' : 'accent',\s*\)/,
);
assert.match(appJs, /createToken\(`다음:\$\{deliverablesEvidenceState\.nextHandoffLabel\}`,\s*'neutral'\)/);

try {
  runtime.resetRuntime();

  const pendingProject = runtime.createProject({
    name: 'deliverables-approval-bridge-handoff-pending',
    projectPath: repoRoot,
  });
  const pendingTask = runtime.createTask({
    projectId: pendingProject.id,
    title: 'Deliverables approval bridge pending handoff',
    intent: 'Show the same current and next handoff labels in the current approval bridge row.',
  });
  const pendingChain = await createPlanningChain(coordinator, pendingTask.id);
  const pendingApproval = createPendingBuilderApproval(runtime, pendingTask.id, pendingChain.preflight);

  const pendingData = buildUiData(runtime, coordinator, pendingProject.id);
  const pendingRail = getExecutionEvidenceRail(pendingData.taskMap.get(pendingTask.id), pendingData);
  const pendingBridge = getTaskApprovalBridge(pendingData.taskMap.get(pendingTask.id), pendingData);
  const pendingMarkup = renderApprovalBridgeTokenRow({
    approvalBridge: pendingBridge,
    createToken,
    evidenceRail: pendingRail,
    getApprovalTone,
    getInboxTone,
  });

  assert.equal(pendingBridge.currentApproval.id, pendingApproval.id);
  assert.match(pendingMarkup, new RegExp(`현재:${pendingRail.currentOwnerLabel}`));
  assert.match(pendingMarkup, new RegExp(`다음:${pendingRail.nextHandoffLabel}`));
  assert.match(pendingMarkup, new RegExp(`승인:${pendingApproval.id}`));
  assert.match(pendingMarkup, new RegExp(`결정함:${pendingApproval.inboxItemId}`));

  runtime.resetRuntime();

  const blockedProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-184-provider-'),
  );
  const blockedProject = runtime.createProject({
    name: 'deliverables-approval-bridge-maker-blocked',
    projectPath: blockedProjectPath,
    provider: { mode: 'live' },
  });
  const blockedTask = runtime.createTask({
    projectId: blockedProject.id,
    title: 'Deliverables approval bridge maker blocked',
    intent: 'Keep current approval row handoff tokens grounded when maker is blocked.',
  });

  createProviderBlockedChain(runtime, blockedTask.id);

  const blockedData = buildUiData(runtime, coordinator, blockedProject.id);
  const blockedRail = getExecutionEvidenceRail(blockedData.taskMap.get(blockedTask.id), blockedData);
  const blockedBridge = getTaskApprovalBridge(blockedData.taskMap.get(blockedTask.id), blockedData);
  const blockedFirstReason =
    blockedData.derived.executionEntrySummaries[blockedTask.id].builderPreflight.reasons[0];
  const blockedMarkup = renderApprovalBridgeTokenRow({
    approvalBridge: blockedBridge,
    createToken,
    evidenceRail: blockedRail,
    getApprovalTone,
    getInboxTone,
  });

  assert.equal(blockedRail.currentOwnerLabel, 'Maker');
  assert.equal(blockedRail.blockedReason, getGuardReasonDisplay(blockedFirstReason));
  assert.equal(blockedBridge.currentApproval, null);
  assert.match(blockedMarkup, /승인:없음/);
  assert.match(blockedMarkup, /현재:Maker/);
  assert.match(blockedMarkup, new RegExp(`다음:${blockedRail.nextHandoffLabel}`));

  console.log(
    JSON.stringify(
      {
        ok: true,
        deliverablesApprovalBridgeHandoffTokens: {
          blockedCurrentOwner: blockedRail.currentOwnerLabel,
          pendingApprovalId: pendingApproval.id,
          pendingCurrentOwner: pendingRail.currentOwnerLabel,
          pendingNextHandoff: pendingRail.nextHandoffLabel,
          verifiedCases: [
            'current approval row shows current and next handoff tokens from the shared rail truth',
            'pending builder approval path keeps approval and inbox tokens alongside the handoff tokens',
            'maker-blocked path keeps current approval row grounded in the existing blocked reason flow',
          ],
        },
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(runtimeRoot, { recursive: true, force: true });
}
