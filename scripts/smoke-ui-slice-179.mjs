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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-179');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

function extractFunction(source, name) {
  const signature = `function ${name}(`;
  const start = source.indexOf(signature);

  if (start === -1) {
    throw new Error(`Function ${name} was not found in ui/app.js`);
  }

  const braceStart = source.indexOf('{', start);

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

function loadRailHelper() {
  const context = vm.createContext({
    console,
    state: {
      loading: false,
      mutating: false,
    },
  });
  const functionNames = [
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
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
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
  const missions = Object.values(snapshot.missions || {})
    .filter((mission) => mission.projectId === projectId)
    .sort(sortRecordsDesc);
  const councilSessions = Object.values(snapshot.councilSessions || {})
    .filter((session) => {
      const mission = snapshot.missions?.[session.missionId];
      return mission && mission.projectId === projectId;
    })
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
    councilSessionMap: new Map(councilSessions.map((session) => [session.id, session])),
    councilSessions,
    derived: {
      executionEntrySummaries: coordinator.listExecutionEntryReadinessSummaries(),
      reviewerReadinessSummaries: coordinator.listReviewerReadinessSummaries(),
      taskGuardSummaries: runtime.listTaskGuardSummaries(),
    },
    inboxItems,
    missionMap: new Map(missions.map((mission) => [mission.id, mission])),
    missions,
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
      'Keep Council-to-Execution evidence derived from the current task, artifact, and readiness chain.',
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
    '# Plan\n\n- Council evidence rail',
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
    '# Breakdown\n\n- derive one rail',
    {
      architectureArtifactId: architecture.artifact.id,
      architectureRunId: architecture.run.id,
      inputArtifactIds: [plan.artifact.id, architecture.artifact.id],
      inputRunIds: [plan.run.id, architecture.run.id],
      nextStage: 'builder',
    },
  );
}

fs.rmSync(runtimeRoot, { recursive: true, force: true });

const runtime = createRuntimeService({ runtimeRoot });
const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const { getExecutionEvidenceRail, getGuardReasonDisplay } = loadRailHelper();

assert.match(appJs, /function getExecutionEvidenceRail\(task, data\)/);
assert.match(appJs, /const councilEvidenceRail = renderExecutionEvidenceRail\(/);
assert.match(appJs, /const executionEvidenceRail = renderExecutionEvidenceRail\(/);
assert.match(appJs, /\$\{councilEvidenceRail\}/);
assert.match(appJs, /\$\{executionEvidenceRail\}/);
assert.match(styles, /\.evidence-rail \{/);
assert.match(styles, /\.evidence-rail-grid \{/);
assert.match(styles, /\.evidence-rail-card-blocked \{/);

try {
  runtime.resetRuntime();

  const waitingProject = runtime.createProject({
    name: 'evidence-rail-critic-waiting',
    projectPath: repoRoot,
  });
  const waitingTask = runtime.createTask({
    projectId: waitingProject.id,
    title: 'Critic waiting evidence rail',
    intent: 'Show Critic as waiting while review evidence does not exist yet.',
  });
  await createPlanningChain(coordinator, waitingTask.id);

  const waitingData = buildUiData(runtime, coordinator, waitingProject.id);
  const waitingRail = getExecutionEvidenceRail(waitingData.taskMap.get(waitingTask.id), waitingData);

  assert.equal(waitingRail.currentOwnerLabel, 'Maker');
  assert.equal(waitingRail.checkpoints[3].status, 'current');
  assert.equal(waitingRail.checkpoints[4].status, 'waiting');
  assert.equal(waitingRail.checkpoints[4].artifactId, null);
  assert.equal(waitingRail.checkpoints[4].evidenceLabel, 'review 대기');
  assert.equal(waitingRail.blockedReason, null);

  runtime.resetRuntime();

  const reviewedProject = runtime.createProject({
    name: 'evidence-rail-review-complete',
    projectPath: repoRoot,
  });
  const reviewedTask = runtime.createTask({
    projectId: reviewedProject.id,
    title: 'Critic review evidence rail',
    intent: 'Show the latest review artifact as the Critic evidence source.',
  });
  const reviewedChain = await createPlanningChain(coordinator, reviewedTask.id);

  buildBuilderMutationBundle(runtime, reviewedTask.id, reviewedChain.preflight);
  const reviewEvidence = await buildReviewEvidence(runtime, reviewedTask.id);

  const reviewedData = buildUiData(runtime, coordinator, reviewedProject.id);
  const reviewedRail = getExecutionEvidenceRail(reviewedData.taskMap.get(reviewedTask.id), reviewedData);

  assert.equal(reviewedRail.currentOwnerLabel, 'Critic');
  assert.equal(reviewedRail.nextHandoffLabel, '사람 게이트');
  assert.equal(reviewedRail.checkpoints[4].status, 'complete');
  assert.equal(reviewedRail.checkpoints[4].artifactId, reviewEvidence.artifact.id);
  assert.match(reviewedRail.checkpoints[4].evidenceLabel, new RegExp(reviewEvidence.artifact.id));
  assert.match(reviewedRail.checkpoints[4].evidenceMeta, /상태 통과/);

  runtime.resetRuntime();

  const blockedProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-179-provider-'),
  );
  const blockedProject = runtime.createProject({
    name: 'evidence-rail-maker-blocked',
    projectPath: blockedProjectPath,
    provider: {
      mode: 'live',
    },
  });
  const blockedTask = runtime.createTask({
    projectId: blockedProject.id,
    title: 'Maker blocked evidence rail',
    intent: 'Show the existing first blocked reason when Maker cannot reach preflight.',
  });

  createProviderBlockedChain(runtime, blockedTask.id);

  const blockedData = buildUiData(runtime, coordinator, blockedProject.id);
  const blockedRail = getExecutionEvidenceRail(blockedData.taskMap.get(blockedTask.id), blockedData);
  const blockedFirstReason =
    blockedData.derived.executionEntrySummaries[blockedTask.id].builderPreflight.reasons[0];

  assert.equal(blockedRail.currentOwnerLabel, 'Maker');
  assert.equal(blockedRail.checkpoints[3].status, 'blocked');
  assert.equal(blockedRail.checkpoints[4].status, 'waiting');
  assert.equal(blockedRail.blockedReason, getGuardReasonDisplay(blockedFirstReason));
  assert.equal(blockedRail.checkpoints[3].blockedReason, getGuardReasonDisplay(blockedFirstReason));

  console.log(
    JSON.stringify(
      {
        ok: true,
        councilExecutionEvidenceRail: {
          fullReviewArtifactId: reviewEvidence.artifact.id,
          makerBlockedReason: blockedRail.blockedReason,
          verifiedCases: [
            'approved mission full handoff chain',
            'maker blocked with existing first blocked reason',
            'critic waiting',
            'critic has latest review evidence',
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
