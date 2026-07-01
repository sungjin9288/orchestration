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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-186');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const formatters = fs.readFileSync(formattersPath, 'utf8');
const helperSourceByName = new Map([
  ['escapeHtml', formatters],
  ['formatDate', formatters],
  ['getExecutionStageDisplay', executionLabels],
  ['getEvidenceRailHandoffDisplay', executionLabels],
  ['getEvidenceRailStatusDisplay', executionLabels],
  ['getEvidenceRailStatusTone', executionLabels],
  ['getApprovalStatusDisplay', executionLabels],
  ['getReviewStatusDisplay', executionLabels],
  ['getRunStatusDisplay', executionLabels],
  ['getMissionStatusDisplay', executionLabels],
  ['getMissionStatusTone', executionLabels],
  ['getTaskLifecycleDisplay', executionLabels],
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
    'getRunStatusDisplay',
    'getExecutionStageDisplay',
    'getGuardReasonDisplay',
    'getEvidenceRailStatusDisplay',
    'getEvidenceRailStatusTone',
    'getEvidenceRailHandoffDisplay',
    'getMissionStatusTone',
    'getMissionStatusDisplay',
    'getTaskLifecycleDisplay',
    'createToken',
    'getExecutionEvidenceRail',
  ];

  for (const name of functionNames) {
    const source = extractFunction(helperSourceByName.get(name) || appJs, name);
    vm.runInContext(`${source}\nglobalThis.${name} = ${name};`, context);
  }

  return {
    createToken: context.createToken,
    getExecutionEvidenceRail: context.getExecutionEvidenceRail,
    getGuardReasonDisplay: context.getGuardReasonDisplay,
    getMissionStatusDisplay: context.getMissionStatusDisplay,
    getMissionStatusTone: context.getMissionStatusTone,
    getTaskLifecycleDisplay: context.getTaskLifecycleDisplay,
  };
}

function createRoleArtifact(runtime, taskId, role, type, content, summary = {}, runOptions = {}) {
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role,
    ...runOptions,
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
      'Keep the Deliverables close-out summary row aligned to the current evidence rail handoff truth.',
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

function buildCloseOutEvidence(runtime, taskId) {
  const releasePackage = createRoleArtifact(
    runtime,
    taskId,
    'release-manager',
    'release-package',
    '# Release Package\n\n- sealed bundle',
  );
  const closeOut = createRoleArtifact(
    runtime,
    taskId,
    'close-out',
    'close-out',
    '# Close Out\n\n- sealed close-out bundle',
    {
      executionMode: 'close-out',
      lifecycleTransition: 'Review -> Done',
      sourceReleasePackageArtifactId: releasePackage.artifact.id,
    },
    {
      lifecycleState: 'Done',
    },
  );

  return {
    closeOut,
    releasePackage,
  };
}

function renderCloseOutTokenRow({
  closeOutState,
  createToken,
  evidenceRail,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getTaskLifecycleDisplay,
  mission,
  missionCompletionArtifactId,
  missionCompletionReady,
  task,
}) {
  return `
    <div class="token-row">
      ${createToken(
        `현재:${evidenceRail.currentOwnerLabel}`,
        evidenceRail.blockedReason ? 'danger' : 'accent',
      )}
      ${createToken(`다음:${evidenceRail.nextHandoffLabel}`, 'neutral')}
      ${createToken(`미션:${getMissionStatusDisplay(mission.status)}`, getMissionStatusTone(mission.status))}
      ${
        task
          ? createToken(
              `태스크:${getTaskLifecycleDisplay(task.lifecycleState)}`,
              task.lifecycleState === 'Done' ? 'success' : 'neutral',
            )
          : createToken('태스크:없음', 'warning')
      }
      ${
        missionCompletionReady
          ? createToken('완료:봉인', 'success')
          : createToken('완료:열림', 'warning')
      }
      ${
        missionCompletionArtifactId
          ? createToken(`종료정리:${missionCompletionArtifactId}`, 'neutral')
          : ''
      }
      ${
        closeOutState.summary.currentReleasePackageArtifactId
          ? createToken(`릴리스패키지:${closeOutState.summary.currentReleasePackageArtifactId}`, 'neutral')
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
  getExecutionEvidenceRail,
  getGuardReasonDisplay,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getTaskLifecycleDisplay,
} = loadHelpers();

assert.match(appJs, /<strong>안건 종료 보고<\/strong>/);
assert.match(
  appJs,
  /createToken\(\s*`현재:\$\{deliverablesEvidenceState\.currentOwnerLabel\}`,\s*deliverablesEvidenceState\.blockedReason \? 'danger' : 'accent',\s*\)/,
);
assert.match(appJs, /createToken\(`다음:\$\{deliverablesEvidenceState\.nextHandoffLabel\}`,\s*'neutral'\)/);
assert.match(appJs, /createToken\('완료:봉인', 'success'\)/);
assert.match(appJs, /createToken\('완료:열림', 'warning'\)/);

try {
  runtime.resetRuntime();

  const openProjectPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'orchestration-ui-slice-186-provider-'),
  );
  const openProject = runtime.createProject({
    name: 'deliverables-close-out-open-maker-blocked',
    projectPath: openProjectPath,
    provider: { mode: 'live' },
  });
  const openTask = runtime.createTask({
    projectId: openProject.id,
    title: 'Deliverables close-out row open handoff',
    intent: 'Keep close-out summary aligned even when maker is blocked.',
  });

  createProviderBlockedChain(runtime, openTask.id);

  const openData = buildUiData(runtime, coordinator, openProject.id);
  const openTaskRecord = openData.taskMap.get(openTask.id);
  const openRail = getExecutionEvidenceRail(openTaskRecord, openData);
  const openFirstReason =
    openData.derived.executionEntrySummaries[openTask.id].builderPreflight.reasons[0];
  const openMarkup = renderCloseOutTokenRow({
    closeOutState: { summary: { currentReleasePackageArtifactId: null } },
    createToken,
    evidenceRail: openRail,
    getMissionStatusDisplay,
    getMissionStatusTone,
    getTaskLifecycleDisplay,
    mission: { status: 'executing' },
    missionCompletionArtifactId: null,
    missionCompletionReady: false,
    task: openTaskRecord,
  });

  assert.equal(openRail.currentOwnerLabel, 'Maker');
  assert.equal(openRail.blockedReason, getGuardReasonDisplay(openFirstReason));
  assert.match(openMarkup, /현재:Maker/);
  assert.match(openMarkup, new RegExp(`다음:${openRail.nextHandoffLabel}`));
  assert.match(openMarkup, /완료:열림/);

  runtime.resetRuntime();

  const sealedProject = runtime.createProject({
    name: 'deliverables-close-out-sealed-handoff',
    projectPath: repoRoot,
  });
  const sealedTask = runtime.createTask({
    projectId: sealedProject.id,
    title: 'Deliverables close-out row sealed handoff',
    intent: 'Keep close-out summary aligned after the close-out bundle is sealed.',
  });
  const sealedChain = await createPlanningChain(coordinator, sealedTask.id);

  buildBuilderMutationBundle(runtime, sealedTask.id, sealedChain.preflight);
  buildReviewEvidence(runtime, sealedTask.id);
  const sealedBundles = buildCloseOutEvidence(runtime, sealedTask.id);

  const sealedData = buildUiData(runtime, coordinator, sealedProject.id);
  const sealedTaskRecord = sealedData.taskMap.get(sealedTask.id);
  const sealedRail = getExecutionEvidenceRail(sealedTaskRecord, sealedData);
  const sealedMarkup = renderCloseOutTokenRow({
    closeOutState: {
      summary: {
        currentReleasePackageArtifactId: sealedBundles.releasePackage.artifact.id,
      },
    },
    createToken,
    evidenceRail: sealedRail,
    getMissionStatusDisplay,
    getMissionStatusTone,
    getTaskLifecycleDisplay,
    mission: { status: 'completed' },
    missionCompletionArtifactId: sealedBundles.closeOut.artifact.id,
    missionCompletionReady: true,
    task: sealedTaskRecord,
  });

  assert.equal(sealedTaskRecord.lifecycleState, 'Done');
  assert.match(sealedMarkup, new RegExp(`현재:${sealedRail.currentOwnerLabel}`));
  assert.match(sealedMarkup, new RegExp(`다음:${sealedRail.nextHandoffLabel}`));
  assert.match(sealedMarkup, /완료:봉인/);
  assert.match(sealedMarkup, new RegExp(`종료정리:${sealedBundles.closeOut.artifact.id}`));
  assert.match(
    sealedMarkup,
    new RegExp(`릴리스패키지:${sealedBundles.releasePackage.artifact.id}`),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        deliverablesCloseOutHandoffTokens: {
          openCurrentOwner: openRail.currentOwnerLabel,
          openNextHandoff: openRail.nextHandoffLabel,
          sealedCloseOutArtifactId: sealedBundles.closeOut.artifact.id,
          sealedCurrentOwner: sealedRail.currentOwnerLabel,
          verifiedCases: [
            'close-out row shows current and next handoff tokens from the shared rail truth',
            'open delivery path keeps maker-blocked handoff plus completion-open status aligned',
            'sealed close-out path keeps completion, close-out artifact, and release package tokens alongside the shared handoff truth',
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
