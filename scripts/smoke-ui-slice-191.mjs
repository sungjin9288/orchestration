import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeContractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { ARTIFACT_CATALOG } = runtimeContractsModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-191');

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
      selectedArtifact: null,
    },
  });
  const functionNames = [
    'escapeHtml',
    'formatDate',
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
    'getRunStatusDisplay',
    'getExecutionStageDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailHandoffDisplay',
    'getTaskLifecycleDisplay',
    'getReviewTone',
    'getArtifactTypeDisplay',
    'createToken',
    'getArtifactCatalogEntry',
    'getArtifactMeaningBadge',
    'getArtifactPreviewBadge',
    'renderArtifactPolicyTokens',
    'getArtifactPolicySummary',
    'getExecutionEvidenceRail',
    'getArtifactDetailSnapshot',
  ];

  for (const name of functionNames) {
    const source = extractFunction(appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    createToken: context.createToken,
    getArtifactDetailSnapshot: context.getArtifactDetailSnapshot,
    getArtifactPolicySummary: context.getArtifactPolicySummary,
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
    getTaskLifecycleDisplay: context.getTaskLifecycleDisplay,
    getArtifactTypeDisplay: context.getArtifactTypeDisplay,
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
    artifactCatalog: ARTIFACT_CATALOG,
    artifacts,
    artifactMap: new Map(artifacts.map((artifact) => [artifact.id, artifact])),
    derived: {
      executionEntrySummaries: coordinator.listExecutionEntryReadinessSummaries(),
      reviewerReadinessSummaries: coordinator.listReviewerReadinessSummaries(),
      taskGuardSummaries: runtime.listTaskGuardSummaries(),
    },
    inboxItems,
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
      'Keep the Artifacts detail summary aligned to the current evidence rail handoff truth.',
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

function buildBuilderMutationBundle(runtime, taskId, preflight) {
  const approval = runtime.requestBuilderLiveMutationApproval({ taskId });
  const inputArtifactIds = Array.isArray(preflight.inputArtifacts)
    ? preflight.inputArtifacts.map((artifact) => artifact.id)
    : [];

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
  });

  const builderRun = runtime.startRun({
    taskId,
    kind: 'role',
    role: 'builder',
  });

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

function renderArtifactsDetailSummaryTokens({ createToken, evidenceRail, snapshotTokens }) {
  return `
    <div class="token-row token-row-compact">
      ${createToken(
        `현재:${evidenceRail.currentOwnerLabel}`,
        evidenceRail.blockedReason ? 'danger' : 'accent',
      )}
      ${createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral')}
      ${snapshotTokens.join('')}
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
  getArtifactDetailSnapshot,
  getArtifactPolicySummary,
  getExecutionEvidenceRail,
  getGuardReasonDisplay,
  getTaskLifecycleDisplay,
  getArtifactTypeDisplay,
} = loadHelpers();

assert.match(appJs, /const artifactsDetailEvidenceState = getExecutionEvidenceRail\(selectedArtifactTask, data\);/);
assert.match(
  appJs,
  /renderNarrativeDeck\(\{[\s\S]*eyebrow: '관제실 판단 요약'[\s\S]*heading: '현재 증적과 다음 확인을 먼저 보는 증적 상세'[\s\S]*createToken\(\s*`현재:\$\{artifactsDetailEvidenceState\.currentOwnerLabel\}`,\s*artifactsDetailEvidenceState\.blockedReason \? 'danger' : 'accent',\s*\)[\s\S]*createToken\(`다음:\$\{artifactsDetailEvidenceState\.nextHandoffLabel\}`,\s*'neutral'\)[\s\S]*\.\.\.artifactDetailSnapshot\.tokens/s,
);

try {
  runtime.resetRuntime();

  const blockedProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-191-provider-'),
  );
  const blockedProject = runtime.createProject({
    name: 'artifacts-detail-maker-blocked',
    projectPath: blockedProjectPath,
    provider: { mode: 'live' },
  });
  const blockedTask = runtime.createTask({
    projectId: blockedProject.id,
    title: 'Artifacts detail maker blocked handoff',
    intent: 'Keep the artifacts detail summary grounded when maker is blocked.',
  });

  createProviderBlockedChain(runtime, blockedTask.id);

  const blockedData = buildUiData(runtime, coordinator, blockedProject.id);
  const blockedTaskRecord = blockedData.taskMap.get(blockedTask.id);
  const blockedArtifactMeta = blockedData.artifacts[0];
  const blockedRail = getExecutionEvidenceRail(blockedTaskRecord, blockedData);
  const blockedPolicySummary = getArtifactPolicySummary(blockedArtifactMeta, blockedData);
  const blockedSnapshot = getArtifactDetailSnapshot(
    blockedArtifactMeta,
    blockedTaskRecord,
    blockedData,
    blockedPolicySummary,
  );
  const blockedFirstReason =
    blockedData.derived.executionEntrySummaries[blockedTask.id].builderPreflight.reasons[0];
  const blockedMarkup = renderArtifactsDetailSummaryTokens({
    createToken,
    evidenceRail: blockedRail,
    snapshotTokens: blockedSnapshot.tokens,
  });

  assert.equal(blockedRail.currentOwnerLabel, 'Maker');
  assert.equal(blockedRail.blockedReason, getGuardReasonDisplay(blockedFirstReason));
  assert.equal(blockedArtifactMeta.type, 'breakdown');
  assert.match(blockedMarkup, /현재:Maker/);
  assert.match(blockedMarkup, new RegExp(`다음:${blockedRail.nextHandoffLabel}`));
  assert.match(blockedMarkup, new RegExp(getArtifactTypeDisplay(blockedArtifactMeta.type)));
  assert.match(blockedMarkup, new RegExp(getTaskLifecycleDisplay(blockedTaskRecord.lifecycleState)));
  assert.match(blockedMarkup, /최신 우선 탐색/);

  runtime.resetRuntime();

  const reviewedProject = runtime.createProject({
    name: 'artifacts-detail-reviewed-handoff',
    projectPath: repoRoot,
  });
  const reviewedTask = runtime.createTask({
    projectId: reviewedProject.id,
    title: 'Artifacts detail reviewed handoff',
    intent: 'Keep the artifacts detail summary aligned after review evidence exists.',
  });
  const reviewedChain = await createPlanningChain(coordinator, reviewedTask.id);

  buildBuilderMutationBundle(runtime, reviewedTask.id, reviewedChain.preflight);
  buildReviewEvidence(runtime, reviewedTask.id);

  const reviewedData = buildUiData(runtime, coordinator, reviewedProject.id);
  const reviewedTaskRecord = reviewedData.taskMap.get(reviewedTask.id);
  const reviewedArtifactMeta = reviewedData.artifacts[0];
  const reviewedRail = getExecutionEvidenceRail(reviewedTaskRecord, reviewedData);
  const reviewedPolicySummary = getArtifactPolicySummary(reviewedArtifactMeta, reviewedData);
  const reviewedSnapshot = getArtifactDetailSnapshot(
    reviewedArtifactMeta,
    reviewedTaskRecord,
    reviewedData,
    reviewedPolicySummary,
  );
  const reviewedMarkup = renderArtifactsDetailSummaryTokens({
    createToken,
    evidenceRail: reviewedRail,
    snapshotTokens: reviewedSnapshot.tokens,
  });

  assert.equal(reviewedRail.currentOwnerLabel, 'Critic');
  assert.equal(reviewedRail.nextHandoffLabel, '사람 게이트');
  assert.equal(reviewedArtifactMeta.type, 'review');
  assert.match(reviewedMarkup, /현재:Critic/);
  assert.match(reviewedMarkup, /다음:사람 게이트/);
  assert.match(reviewedMarkup, new RegExp(getArtifactTypeDisplay(reviewedArtifactMeta.type)));
  assert.match(reviewedMarkup, new RegExp(getTaskLifecycleDisplay(reviewedTaskRecord.lifecycleState)));
  assert.match(reviewedMarkup, /증적 핵심/);

  console.log(
    JSON.stringify(
      {
        ok: true,
        artifactsDetailHandoffTokens: {
          blockedCurrentOwner: blockedRail.currentOwnerLabel,
          blockedNextHandoff: blockedRail.nextHandoffLabel,
          reviewedCurrentOwner: reviewedRail.currentOwnerLabel,
          reviewedNextHandoff: reviewedRail.nextHandoffLabel,
          verifiedCases: [
            'artifacts detail summary shows current and next handoff tokens from the shared rail truth',
            'maker-blocked path keeps the artifacts detail summary grounded in the existing first blocked reason flow',
            'reviewed path keeps the artifacts detail summary aligned with the current critic-to-human-gate handoff',
            'existing artifact detail policy and lifecycle tokens remain visible in the same summary row',
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
