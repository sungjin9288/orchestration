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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-194');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const formatters = fs.readFileSync(formattersPath, 'utf8');
const taskSummariesPath = path.join(repoRoot, 'ui', 'task-summaries.js');
const taskSummaries = fs.readFileSync(taskSummariesPath, 'utf8');
const helperSourceByName = new Map([
  ['createToken', formatters],
  ['getTaskInboxItems', taskSummaries],
  ['getTaskApprovals', taskSummaries],
  ['sortByCreatedDesc', taskSummaries],
  ['getLatestTaskArtifact', taskSummaries],
  ['escapeHtml', formatters],
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
    'getGuardReasonDisplay',
    'getEvidenceRailHandoffDisplay',
    'getExecutionStageDisplay',
    'getRunStatusDisplay',
    'createToken',
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(helperSourceByName.get(name) || appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    createToken: context.createToken,
    getApprovalStatusDisplay: context.getApprovalStatusDisplay,
    getApprovalTone: context.getApprovalTone,
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
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
    inboxItemMap: new Map(inboxItems.map((item) => [item.id, item])),
    runMap: new Map(runs.map((run) => [run.id, run])),
    runs,
    taskMap: new Map(tasks.map((task) => [task.id, task])),
    tasks,
  };
}

async function createPlanningChain(coordinator, taskId) {
  const routingOutcome = {
    classification: 'new task',
    decisionNote: '',
    missingContext: [],
    scopeStatement:
      'Keep the Decision Inbox approval record aligned to the current evidence rail handoff truth.',
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

function buildBuilderMutationBundle(runtime, taskId, preflight) {
  const approval = runtime.requestBuilderLiveMutationApproval({ taskId });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
  });

  const builderRun = runtime.startRun({
    taskId,
    kind: 'role',
    role: 'builder',
  });
  const inputArtifactIds = Array.isArray(preflight.inputArtifacts)
    ? preflight.inputArtifacts.map((artifact) => artifact.id)
    : [];

  const finalized = runtime.finalizeBuilderLiveMutationSuccess({
    runId: builderRun.id,
    approvalId: approval.id,
    artifacts: [
      {
        type: 'change-summary',
        content: '# Change Summary\n\n- scoped.txt',
      },
      {
        type: 'patch',
        content: 'diff --git a/scoped.txt b/scoped.txt',
      },
      {
        type: 'diff',
        content: '@@ -0,0 +1 @@\n+updated',
      },
    ],
    summary: {
      approvalId: approval.id,
      approvalTargetArtifactId: preflight.artifact.id,
      approvalTargetRunId: preflight.run.id,
      changedFiles: ['scoped.txt'],
      executionMode: 'live-mutation',
      inputArtifactIds: [...inputArtifactIds, preflight.artifact.id],
      nextStage: 'reviewer',
      preflightArtifactId: preflight.artifact.id,
      preflightRunId: preflight.run.id,
    },
  });

  return {
    approval,
    artifacts: finalized.artifacts,
    run: finalized.run,
  };
}

function buildReviewEvidence(runtime, taskId) {
  return createRoleArtifact(
    runtime,
    taskId,
    'reviewer',
    'review',
    '# Review\n\n- pass',
    {
      reviewStatus: 'passed',
      verificationArtifactIds: [],
    },
  );
}

function renderApprovalRecordTokens({
  approval,
  createToken,
  evidenceRail,
  getApprovalStatusDisplay,
  getApprovalTone,
}) {
  return `
    <div class="token-row">
      ${createToken(
        `현재:${evidenceRail.currentOwnerLabel}`,
        evidenceRail.blockedReason ? 'danger' : 'accent',
      )}
      ${createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral')}
      ${createToken(getApprovalStatusDisplay(approval.status), getApprovalTone(approval.status))}
      ${createToken(`범위:${approval.scope}`, 'neutral')}
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
  getApprovalStatusDisplay,
  getApprovalTone,
  getExecutionEvidenceRail,
} = loadHelpers();

assert.match(
  appJs,
  /<p class="detail-key">결재 기록<\/p>[\s\S]*createToken\(\s*`현재:\$\{decisionDetailEvidenceState\.currentOwnerLabel\}`,\s*decisionDetailEvidenceState\.blockedReason \? 'danger' : 'accent',\s*\)[\s\S]*createToken\(`다음:\$\{decisionDetailEvidenceState\.nextHandoffLabel\}`,\s*'neutral'\)[\s\S]*createToken\(getApprovalStatusDisplay\(selectedApproval\.status\), getApprovalTone\(selectedApproval\.status\)\)[\s\S]*createToken\(`범위:\$\{selectedApproval\.scope\}`,\s*'neutral'\)/,
);

try {
  runtime.resetRuntime();

  const pendingProject = runtime.createProject({
    name: 'decision-approval-record-pending',
    projectPath: repoRoot,
  });
  const pendingTask = runtime.createTask({
    projectId: pendingProject.id,
    title: 'Decision approval record pending',
    intent: 'Keep the Decision Inbox approval record aligned while builder approval is pending.',
  });
  await createPlanningChain(coordinator, pendingTask.id);
  const pendingApproval = createPendingBuilderApproval(runtime, pendingTask.id);

  const pendingData = buildUiData(runtime, coordinator, pendingProject.id);
  const pendingTaskRecord = pendingData.taskMap.get(pendingTask.id);
  const pendingApprovalRecord = pendingData.approvals.find((approval) => approval.id === pendingApproval.id);
  const pendingRail = getExecutionEvidenceRail(pendingTaskRecord, pendingData);
  const pendingMarkup = renderApprovalRecordTokens({
    approval: pendingApprovalRecord,
    createToken,
    evidenceRail: pendingRail,
    getApprovalStatusDisplay,
    getApprovalTone,
  });

  assert.equal(pendingRail.currentOwnerLabel, 'Maker');
  assert.match(pendingMarkup, /현재:Maker/);
  assert.match(pendingMarkup, new RegExp(`다음:${pendingRail.nextHandoffLabel}`));
  assert.match(
    pendingMarkup,
    new RegExp(getApprovalStatusDisplay(pendingApprovalRecord.status)),
  );

  runtime.resetRuntime();

  const reviewedProject = runtime.createProject({
    name: 'decision-approval-record-reviewed',
    projectPath: repoRoot,
  });
  const reviewedTask = runtime.createTask({
    projectId: reviewedProject.id,
    title: 'Decision approval record reviewed',
    intent: 'Keep the Decision Inbox approval record aligned after review evidence exists.',
  });
  const reviewedChain = await createPlanningChain(coordinator, reviewedTask.id);
  const reviewedBundle = buildBuilderMutationBundle(runtime, reviewedTask.id, reviewedChain.preflight);
  buildReviewEvidence(runtime, reviewedTask.id);

  const reviewedData = buildUiData(runtime, coordinator, reviewedProject.id);
  const reviewedTaskRecord = reviewedData.taskMap.get(reviewedTask.id);
  const reviewedApprovalRecord = reviewedData.approvals.find(
    (approval) => approval.id === reviewedBundle.approval.id,
  );
  const reviewedRail = getExecutionEvidenceRail(reviewedTaskRecord, reviewedData);
  const reviewedMarkup = renderApprovalRecordTokens({
    approval: reviewedApprovalRecord,
    createToken,
    evidenceRail: reviewedRail,
    getApprovalStatusDisplay,
    getApprovalTone,
  });

  assert.equal(reviewedRail.currentOwnerLabel, 'Critic');
  assert.equal(reviewedRail.nextHandoffLabel, '사람 게이트');
  assert.match(reviewedMarkup, /현재:Critic/);
  assert.match(reviewedMarkup, /다음:사람 게이트/);
  assert.match(
    reviewedMarkup,
    new RegExp(getApprovalStatusDisplay(reviewedApprovalRecord.status)),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        decisionInboxApprovalRecordHandoffTokens: {
          pendingApprovalId: pendingApproval.id,
          pendingCurrentOwner: pendingRail.currentOwnerLabel,
          pendingNextHandoff: pendingRail.nextHandoffLabel,
          reviewedApprovalId: reviewedApprovalRecord.id,
          reviewedCurrentOwner: reviewedRail.currentOwnerLabel,
          reviewedNextHandoff: reviewedRail.nextHandoffLabel,
          verifiedCases: [
            'decision approval record shows current and next handoff tokens from the shared rail truth',
            'pending builder approval path keeps the approval record aligned with the existing approval status row',
            'reviewed path keeps the approval record aligned after the task reaches the critic-to-human-gate handoff',
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
