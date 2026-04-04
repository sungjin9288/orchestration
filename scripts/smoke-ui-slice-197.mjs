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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-197');

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
    'formatDate',
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
    'getInboxKindDisplay',
    'getInboxStatusDisplay',
    'getInboxTone',
    'getTaskLifecycleDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailHandoffDisplay',
    'getExecutionStageDisplay',
    'getRunStatusDisplay',
    'createToken',
    'getInboxListSnapshot',
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getInboxListSnapshot: context.getInboxListSnapshot,
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
      'Keep the Decision Inbox list-row summary copy aligned to the current evidence rail handoff truth.',
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

function getCurrentCheckpoint(rail) {
  return rail.checkpoints.find((checkpoint) => checkpoint.currentOwner) || null;
}

fs.rmSync(runtimeRoot, { recursive: true, force: true });

const runtime = createRuntimeService({ runtimeRoot });
const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const { getExecutionEvidenceRail, getInboxListSnapshot } = loadHelpers();

assert.match(
  appJs,
  /function getInboxListSnapshot\(item, task, approval, evidenceRail = null\)/,
);
assert.match(
  appJs,
  /if \(evidenceRail\) \{[\s\S]*currentCheckpoint\?\.blockedReason[\s\S]*currentCopy = currentCheckpoint\.blockedReason;[\s\S]*currentCopy = \[currentCheckpoint\.title, currentCheckpoint\.evidenceLabel, currentCheckpoint\.evidenceMeta\][\s\S]*nextCopy = `다음 인계: \$\{evidenceRail\.nextHandoffLabel \|\| '없음'\}`;/,
);
assert.match(
  appJs,
  /const inboxSnapshot = getInboxListSnapshot\(\s*item,\s*inboxTask,\s*inboxApproval,\s*inboxEvidenceState,\s*\);/,
);

try {
  runtime.resetRuntime();

  const pendingProject = runtime.createProject({
    name: 'decision-list-copy-pending-approval',
    projectPath: repoRoot,
  });
  const pendingTask = runtime.createTask({
    projectId: pendingProject.id,
    title: 'Decision list copy pending approval',
    intent: 'Keep the Decision Inbox list summary copy aligned while builder approval is pending.',
  });
  await createPlanningChain(coordinator, pendingTask.id);
  const pendingApproval = createPendingBuilderApproval(runtime, pendingTask.id);

  const pendingData = buildUiData(runtime, coordinator, pendingProject.id);
  const pendingTaskRecord = pendingData.taskMap.get(pendingTask.id);
  const pendingItem = pendingData.inboxItemMap.get(pendingApproval.inboxItemId);
  const pendingApprovalRecord = pendingData.approvals.find((approval) => approval.id === pendingApproval.id);
  const pendingRail = getExecutionEvidenceRail(pendingTaskRecord, pendingData);
  const pendingSnapshot = getInboxListSnapshot(
    pendingItem,
    pendingTaskRecord,
    pendingApprovalRecord,
    pendingRail,
  );

  assert.equal(pendingSnapshot.currentCopy, pendingRail.blockedReason);
  assert.equal(pendingSnapshot.nextCopy, `다음 인계: ${pendingRail.nextHandoffLabel}`);

  runtime.resetRuntime();

  const reviewedProject = runtime.createProject({
    name: 'decision-list-copy-reviewed-follow-up',
    projectPath: repoRoot,
  });
  const reviewedTask = runtime.createTask({
    projectId: reviewedProject.id,
    title: 'Decision list copy reviewed follow-up',
    intent: 'Keep the Decision Inbox list summary copy aligned after review evidence exists.',
  });
  const reviewedChain = await createPlanningChain(coordinator, reviewedTask.id);

  buildBuilderMutationBundle(runtime, reviewedTask.id, reviewedChain.preflight);
  buildReviewEvidence(runtime, reviewedTask.id);
  const reviewedDecision = runtime.createDecisionInboxItem({
    taskId: reviewedTask.id,
    title: 'Reviewed follow-up decision',
    prompt: 'Review evidence exists and a human decision remains.',
    blocksTask: false,
  });

  const reviewedData = buildUiData(runtime, coordinator, reviewedProject.id);
  const reviewedTaskRecord = reviewedData.taskMap.get(reviewedTask.id);
  const reviewedItem = reviewedData.inboxItemMap.get(reviewedDecision.id);
  const reviewedRail = getExecutionEvidenceRail(reviewedTaskRecord, reviewedData);
  const reviewedCheckpoint = getCurrentCheckpoint(reviewedRail);
  const reviewedSnapshot = getInboxListSnapshot(
    reviewedItem,
    reviewedTaskRecord,
    null,
    reviewedRail,
  );

  assert.ok(reviewedCheckpoint);
  assert.equal(
    reviewedSnapshot.currentCopy,
    [reviewedCheckpoint.title, reviewedCheckpoint.evidenceLabel, reviewedCheckpoint.evidenceMeta]
      .filter(Boolean)
      .join(' · '),
  );
  assert.equal(reviewedSnapshot.nextCopy, `다음 인계: ${reviewedRail.nextHandoffLabel}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        decisionInboxListSummaryCopy: {
          pendingApprovalId: pendingApproval.id,
          pendingCurrentCopy: pendingSnapshot.currentCopy,
          pendingNextCopy: pendingSnapshot.nextCopy,
          reviewedDecisionId: reviewedDecision.id,
          reviewedCurrentCopy: reviewedSnapshot.currentCopy,
          reviewedNextCopy: reviewedSnapshot.nextCopy,
          verifiedCases: [
            'decision inbox list rows reuse the active checkpoint blocked reason when maker is blocked',
            'decision inbox list rows expose the active checkpoint evidence label and meta when review evidence exists',
            'decision inbox list rows derive the next-check copy from the shared handoff truth instead of inbox-kind copy',
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
