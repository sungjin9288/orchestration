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
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-180');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

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

function loadMissionEvidenceHelpers() {
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
    'getRunStatusDisplay',
    'getExecutionStageDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailStatusDisplay',
    'getEvidenceRailStatusTone',
    'getEvidenceRailHandoffDisplay',
    'createToken',
    'getExecutionEvidenceRail',
    'renderExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
    renderExecutionEvidenceRail: context.renderExecutionEvidenceRail,
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
  const activeProject = snapshot.projects[projectId] || null;
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
    activeProject,
    approvals,
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
      'Keep the Mission evidence preview derived from the current task, artifact, and readiness chain.',
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
        content: '# Change Summary\n\n- mission evidence preview',
      },
      {
        type: 'patch',
        content: 'diff --git a/ui/app.js b/ui/app.js',
      },
      {
        type: 'diff',
        content: '@@ -0,0 +1 @@\n+preview',
      },
    ],
    summary: {
      approvalId: approval.id,
      approvalTargetArtifactId: preflight.artifact.id,
      approvalTargetRunId: preflight.run.id,
      changedFiles: ['ui/app.js'],
      executionMode: 'live-mutation',
      inputArtifactIds: [...inputArtifactIds, preflight.artifact.id],
      nextStage: 'reviewer',
      preflightArtifactId: preflight.artifact.id,
      preflightRunId: preflight.run.id,
      targetPreflightArtifactId: preflight.artifact.id,
      targetPreflightRunId: preflight.run.id,
    },
  });

  return {
    approval: finalized.approval,
    artifacts: finalized.artifacts,
    run: finalized.run,
  };
}

async function buildReviewEvidence(runtime, taskId) {
  runtime.openReviewGate({ taskId });

  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role: 'reviewer',
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type: 'review',
    content: '# Review\n\n- pass',
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary: {
      mappedReviewStatus: 'passed',
      nextStage: 'human gate',
      reviewArtifactId: artifact.id,
    },
  });

  runtime.resolveReview({
    taskId,
    action: 'passed',
    note: `리뷰 통과. 증적은 ${artifact.id}를 확인하세요.`,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function createProviderBlockedChain(runtime, taskId) {
  const plan = createRoleArtifact(
    runtime,
    taskId,
    'planner',
    'plan',
    '# Plan\n\n- Mission evidence preview',
    {
      nextStage: 'architect',
    },
  );
  const architecture = createRoleArtifact(
    runtime,
    taskId,
    'architect',
    'architecture',
    '# Architecture\n\n- ui/app.js',
    {
      inputArtifactId: plan.artifact.id,
      inputRunId: plan.run.id,
      nextStage: 'task-breaker',
    },
  );

  return createRoleArtifact(
    runtime,
    taskId,
    'task-breaker',
    'breakdown',
    '# Breakdown\n\n- reuse the existing evidence rail',
    {
      architectureArtifactId: architecture.artifact.id,
      architectureRunId: architecture.run.id,
      inputArtifactIds: [plan.artifact.id, architecture.artifact.id],
      inputRunIds: [plan.run.id, architecture.run.id],
      nextStage: 'builder',
    },
  );
}

function renderMissionPreviewRail(renderExecutionEvidenceRail, rail) {
  return renderExecutionEvidenceRail(rail, {
    eyebrow: '역할 인계 미리보기',
    heading: '회의에서 실행으로 넘어갈 증적만 먼저 봅니다',
    copy: 'Mission은 linked task의 artifact, run, readiness, review truth만 compact preview로 읽습니다.',
    compact: true,
  });
}

fs.rmSync(runtimeRoot, { recursive: true, force: true });

const runtime = createRuntimeService({ runtimeRoot });
const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const { getExecutionEvidenceRail, getGuardReasonDisplay, renderExecutionEvidenceRail } =
  loadMissionEvidenceHelpers();

assert.match(
  appJs,
  /const missionEvidenceRail = renderExecutionEvidenceRail\(getExecutionEvidenceRail\(linkedTask, data\), \{/,
);
assert.match(appJs, /eyebrow: '역할 인계 미리보기'/);
assert.match(appJs, /compact: true/);
assert.match(appJs, /\$\{missionEvidenceRail\}/);
assert.match(styles, /\.evidence-rail-compact \{/);
assert.match(styles, /\.evidence-rail-compact \.evidence-rail-grid \{/);
assert.match(styles, /\.evidence-rail-compact \.evidence-rail-card \{/);

try {
  const noTaskMarkup = renderMissionPreviewRail(
    renderExecutionEvidenceRail,
    getExecutionEvidenceRail(null, {}),
  );

  assert.match(noTaskMarkup, /evidence-rail-compact/);
  assert.match(noTaskMarkup, /연결된 태스크가 아직 없습니다\./);
  assert.match(noTaskMarkup, /Strategist/);

  runtime.resetRuntime();

  const reviewedProject = runtime.createProject({
    name: 'mission-evidence-preview-review-complete',
    projectPath: repoRoot,
  });
  const reviewedTask = runtime.createTask({
    projectId: reviewedProject.id,
    title: 'Mission evidence preview review complete',
    intent: 'Show the compact Mission preview with a full handoff chain.',
  });
  const reviewedChain = await createPlanningChain(coordinator, reviewedTask.id);

  buildBuilderMutationBundle(runtime, reviewedTask.id, reviewedChain.preflight);
  const reviewEvidence = await buildReviewEvidence(runtime, reviewedTask.id);

  const reviewedData = buildUiData(runtime, coordinator, reviewedProject.id);
  const reviewedRail = getExecutionEvidenceRail(reviewedData.taskMap.get(reviewedTask.id), reviewedData);
  const reviewedMarkup = renderMissionPreviewRail(renderExecutionEvidenceRail, reviewedRail);

  assert.equal(reviewedRail.currentOwnerLabel, 'Critic');
  assert.match(reviewedMarkup, /현재:Critic/);
  assert.match(reviewedMarkup, /다음:사람 게이트/);
  assert.match(reviewedMarkup, new RegExp(`review ${reviewEvidence.artifact.id}`));
  assert.match(reviewedMarkup, /evidence-rail-compact/);

  runtime.resetRuntime();

  const blockedProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-180-provider-'),
  );
  const blockedProject = runtime.createProject({
    name: 'mission-evidence-preview-maker-blocked',
    projectPath: blockedProjectPath,
    provider: {
      mode: 'live',
    },
  });
  const blockedTask = runtime.createTask({
    projectId: blockedProject.id,
    title: 'Mission evidence preview maker blocked',
    intent: 'Keep the existing first blocked reason inside the compact Mission preview.',
  });

  createProviderBlockedChain(runtime, blockedTask.id);

  const blockedData = buildUiData(runtime, coordinator, blockedProject.id);
  const blockedRail = getExecutionEvidenceRail(blockedData.taskMap.get(blockedTask.id), blockedData);
  const blockedFirstReason =
    blockedData.derived.executionEntrySummaries[blockedTask.id].builderPreflight.reasons[0];
  const blockedMarkup = renderMissionPreviewRail(renderExecutionEvidenceRail, blockedRail);

  assert.equal(blockedRail.currentOwnerLabel, 'Maker');
  assert.equal(blockedRail.blockedReason, getGuardReasonDisplay(blockedFirstReason));
  assert.match(blockedMarkup, /현재:Maker/);
  assert.match(blockedMarkup, new RegExp(getGuardReasonDisplay(blockedFirstReason)));

  console.log(
    JSON.stringify(
      {
        ok: true,
        missionEvidencePreview: {
          fullReviewArtifactId: reviewEvidence.artifact.id,
          makerBlockedReason: blockedRail.blockedReason,
          verifiedCases: [
            'mission detail wires the compact rail preview',
            'mission preview without linked task stays waiting-only',
            'mission preview shows the full handoff chain',
            'mission preview reuses maker first blocked reason',
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
