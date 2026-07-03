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
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const formattersPath = path.join(repoRoot, 'ui', 'formatters.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-185');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const formatters = fs.readFileSync(formattersPath, 'utf8');
const taskSummariesPath = path.join(repoRoot, 'ui', 'task-summaries.js');
const taskSummaries = fs.readFileSync(taskSummariesPath, 'utf8');
const helperSourceByName = new Map([
  ['createToken', formatters],
  ['getTaskApprovalSummary', taskSummaries],
  ['getTaskInboxItems', taskSummaries],
  ['getTaskApprovals', taskSummaries],
  ['sortByCreatedDesc', taskSummaries],
  ['getLatestTaskArtifact', taskSummaries],
  ['escapeHtml', formatters],
  ['getApprovalActionLabel', executionLabels],
  ['getApprovalTone', executionLabels],
  ['getExecutionStageDisplay', executionLabels],
  ['getEvidenceRailHandoffDisplay', executionLabels],
  ['getEvidenceRailStatusDisplay', executionLabels],
  ['getEvidenceRailStatusTone', executionLabels],
  ['getGuardReasonDisplay', executionLabels],
  ['getApprovalStatusDisplay', executionLabels],
  ['getReviewStatusDisplay', executionLabels],
  ['getRunStatusDisplay', executionLabels],
]);

function extractFunction(source, name) {
  const signatures = [`function ${name}(`, `export function ${name}(`];
  const start = signatures
    .map((signature) => source.indexOf(signature))
    .find((index) => index !== -1) ?? -1;

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
        return source.slice(start, index + 1).replace(/^export\s+/, '');
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
    'getTaskApprovalSummary',
    'getTaskInboxItems',
    'getLatestTaskArtifact',
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
    'getRunStatusDisplay',
    'getExecutionStageDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailStatusDisplay',
    'getEvidenceRailStatusTone',
    'getEvidenceRailHandoffDisplay',
    'createToken',
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(helperSourceByName.get(name) || appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    createToken: context.createToken,
    getApprovalActionLabel: context.getApprovalActionLabel,
    getApprovalStatusDisplay: context.getApprovalStatusDisplay,
    getApprovalTone: context.getApprovalTone,
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
    getTaskApprovalSummary: context.getTaskApprovalSummary,
    getTaskApprovals: context.getTaskApprovals,
    sortByCreatedDesc: context.sortByCreatedDesc,
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
      'Keep the Deliverables approval summary row aligned to the current evidence rail handoff truth.',
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

function renderApprovalSummaryRow({
  approvalSummary,
  createToken,
  evidenceRail,
  getApprovalActionLabel,
  getApprovalStatusDisplay,
  getApprovalTone,
  latestApproval,
}) {
  return `
    <div class="token-row">
      ${createToken(
        `현재:${evidenceRail.currentOwnerLabel}`,
        evidenceRail.blockedReason ? 'danger' : 'accent',
      )}
      ${createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral')}
      ${createToken(`대기:${approvalSummary.pending}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')}
      ${createToken(`승인:${approvalSummary.approved}`, approvalSummary.approved > 0 ? 'success' : 'neutral')}
      ${createToken(`반려:${approvalSummary.rejected}`, approvalSummary.rejected > 0 ? 'danger' : 'neutral')}
      ${
        latestApproval?.allowedNextAction
          ? createToken(`액션:${getApprovalActionLabel(latestApproval.allowedNextAction)}`, 'neutral')
          : ''
      }
      ${
        latestApproval
          ? createToken(`최신:${getApprovalStatusDisplay(latestApproval.status)}`, getApprovalTone(latestApproval.status))
          : createToken('최신:없음', 'neutral')
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
  getApprovalActionLabel,
  getApprovalStatusDisplay,
  getApprovalTone,
  getExecutionEvidenceRail,
  getGuardReasonDisplay,
  getTaskApprovalSummary,
  getTaskApprovals,
  sortByCreatedDesc,
} = loadHelpers();

assert.match(
  appJs,
  /createToken\(\s*`현재:\$\{deliverablesEvidenceState\.currentOwnerLabel\}`,\s*deliverablesEvidenceState\.blockedReason \? 'danger' : 'accent',\s*\)/,
);
assert.match(appJs, /createToken\(`다음:\$\{deliverablesEvidenceState\.nextHandoffLabel\}`,\s*'neutral'\)/);
assert.match(appJs, /createToken\(`대기:\$\{approvalSummary\.pending\}`/);

try {
  runtime.resetRuntime();

  const pendingProject = runtime.createProject({
    name: 'deliverables-approval-summary-handoff-pending',
    projectPath: repoRoot,
  });
  const pendingTask = runtime.createTask({
    projectId: pendingProject.id,
    title: 'Deliverables approval summary pending handoff',
    intent: 'Show the same current and next handoff labels in the approval summary row.',
  });
  await createPlanningChain(coordinator, pendingTask.id);
  const pendingApproval = createPendingBuilderApproval(runtime, pendingTask.id);

  const pendingData = buildUiData(runtime, coordinator, pendingProject.id);
  const pendingTaskRecord = pendingData.taskMap.get(pendingTask.id);
  const pendingRail = getExecutionEvidenceRail(pendingTaskRecord, pendingData);
  const pendingApprovalSummary = getTaskApprovalSummary(pendingTaskRecord, pendingData.approvals);
  const pendingLatestApproval = getTaskApprovals(pendingTask.id, pendingData.approvals).sort(
    sortByCreatedDesc,
  )[0];
  const pendingMarkup = renderApprovalSummaryRow({
    approvalSummary: pendingApprovalSummary,
    createToken,
    evidenceRail: pendingRail,
    getApprovalActionLabel,
    getApprovalStatusDisplay,
    getApprovalTone,
    latestApproval: pendingLatestApproval,
  });

  assert.equal(pendingApprovalSummary.pending, 1);
  assert.equal(pendingLatestApproval.id, pendingApproval.id);
  assert.match(pendingMarkup, new RegExp(`현재:${pendingRail.currentOwnerLabel}`));
  assert.match(pendingMarkup, new RegExp(`다음:${pendingRail.nextHandoffLabel}`));
  assert.match(pendingMarkup, /대기:1/);
  assert.match(
    pendingMarkup,
    new RegExp(`액션:${getApprovalActionLabel(pendingLatestApproval.allowedNextAction)}`),
  );
  assert.match(
    pendingMarkup,
    new RegExp(`최신:${getApprovalStatusDisplay(pendingLatestApproval.status)}`),
  );

  runtime.resetRuntime();

  const blockedProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-185-provider-'),
  );
  const blockedProject = runtime.createProject({
    name: 'deliverables-approval-summary-maker-blocked',
    projectPath: blockedProjectPath,
    provider: { mode: 'live' },
  });
  const blockedTask = runtime.createTask({
    projectId: blockedProject.id,
    title: 'Deliverables approval summary maker blocked',
    intent: 'Keep approval summary handoff tokens grounded when maker is blocked.',
  });

  createProviderBlockedChain(runtime, blockedTask.id);

  const blockedData = buildUiData(runtime, coordinator, blockedProject.id);
  const blockedTaskRecord = blockedData.taskMap.get(blockedTask.id);
  const blockedRail = getExecutionEvidenceRail(blockedTaskRecord, blockedData);
  const blockedApprovalSummary = getTaskApprovalSummary(blockedTaskRecord, blockedData.approvals);
  const blockedLatestApproval = getTaskApprovals(blockedTask.id, blockedData.approvals).sort(
    sortByCreatedDesc,
  )[0] || null;
  const blockedFirstReason =
    blockedData.derived.executionEntrySummaries[blockedTask.id].builderPreflight.reasons[0];
  const blockedMarkup = renderApprovalSummaryRow({
    approvalSummary: blockedApprovalSummary,
    createToken,
    evidenceRail: blockedRail,
    getApprovalActionLabel,
    getApprovalStatusDisplay,
    getApprovalTone,
    latestApproval: blockedLatestApproval,
  });

  assert.equal(blockedRail.currentOwnerLabel, 'Maker');
  assert.equal(blockedRail.blockedReason, getGuardReasonDisplay(blockedFirstReason));
  assert.equal(blockedApprovalSummary.pending, 0);
  assert.equal(blockedLatestApproval, null);
  assert.match(blockedMarkup, /현재:Maker/);
  assert.match(blockedMarkup, new RegExp(`다음:${blockedRail.nextHandoffLabel}`));
  assert.match(blockedMarkup, /대기:0/);
  assert.match(blockedMarkup, /최신:없음/);

  console.log(
    JSON.stringify(
      {
        ok: true,
        deliverablesApprovalSummaryHandoffTokens: {
          blockedCurrentOwner: blockedRail.currentOwnerLabel,
          pendingApprovalId: pendingApproval.id,
          pendingCurrentOwner: pendingRail.currentOwnerLabel,
          pendingNextHandoff: pendingRail.nextHandoffLabel,
          verifiedCases: [
            'approval summary row shows current and next handoff tokens from the shared rail truth',
            'pending builder approval path keeps approval counts and latest approval status aligned',
            'maker-blocked path keeps the approval summary row grounded in the existing blocked reason flow',
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
