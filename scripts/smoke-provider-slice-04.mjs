import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import openaiResponsesAdapterModule from '../src/execution/providers/openai-responses-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createOpenAIResponsesProviderAdapter } = openaiResponsesAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-04');
const sentinelSecret = 'provider-slice-04-secret-sentinel';
const liveProviderEnvVar = 'OPENAI_API_KEY';
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];

function createFixtureProject(label) {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-provider-${label}-`));
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  return projectPath;
}

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

function countRuns(snapshot, taskId) {
  return Object.values(snapshot.runs).filter((run) => run.taskId === taskId).length;
}

function countArtifacts(snapshot, taskId, type = null) {
  return Object.values(snapshot.artifacts).filter(
    (artifact) => artifact.taskId === taskId && (!type || artifact.type === type),
  ).length;
}

function countPendingDecisionItems(snapshot, taskId) {
  return Object.values(snapshot.decisionInboxItems).filter(
    (item) => item.taskId === taskId && item.status === 'pending',
  ).length;
}

function scanFilesForSecret(rootPath, secret) {
  const matches = [];

  function visit(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const stat = fs.statSync(currentPath);

    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath)) {
        visit(path.join(currentPath, entry));
      }
      return;
    }

    const content = fs.readFileSync(currentPath, 'utf8');

    if (content.includes(secret)) {
      matches.push(currentPath);
    }
  }

  visit(rootPath);
  return matches;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSecretAbsent(value, secret, label) {
  assert.doesNotMatch(String(value || ''), new RegExp(escapeRegExp(secret)), label);
}

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify provider-slice-04 planner, architect, and task-breaker live execution.

## Intended Outcome
Keep planner plus architect live stable while extending the same openai-responses adapter boundary to task-breaker.

## Acceptance Target
- planner live invocation remains stable
- architect live invocation remains stable
- task-breaker live invocation succeeds with provenance-chain validation
- builder and reviewer live remain blocked

## Verification Approach
- synthetic provider smoke

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
- breakdown

## Worktree Need
No.

## Non-Goals
- builder live execution
- reviewer live execution
- release or close-out changes
`;
}

function createPlannerStructuredText({ artifactMarkdown, normalizedResult = {} }) {
  return JSON.stringify({
    artifactMarkdown,
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'architect',
      summary: normalizedResult.summary || 'Planner output is ready for architect handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createArchitectStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      boundaryFit: artifact.boundaryFit || 'fit',
      affectedComponentsOrContracts: Array.isArray(artifact.affectedComponentsOrContracts)
        ? artifact.affectedComponentsOrContracts
        : ['src/execution/execution-coordinator.js'],
      policyImpact: Array.isArray(artifact.policyImpact)
        ? artifact.policyImpact
        : ['The slice stays inside the existing provider boundary.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : ['Task-breaker input must preserve the current plan-plus-architecture provenance chain.'],
      noArchitectureChangeStatement:
        artifact.noArchitectureChangeStatement ||
        'No architecture change is approved by this note. Downstream work must stay inside the current boundary.',
      blockingArchitectureIssues: Array.isArray(artifact.blockingArchitectureIssues)
        ? artifact.blockingArchitectureIssues
        : [],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'task-breaker',
      summary:
        normalizedResult.summary || 'Architect output is ready for task-breaker handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createTaskBreakerStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      orderedSubTasks: Array.isArray(artifact.orderedSubTasks)
        ? artifact.orderedSubTasks
        : [
            'Validate the current plan-plus-architecture provenance chain before builder handoff.',
            'Prepare the minimum implementation sequence without widening scope.',
            'Stop after the bounded implementation slice is builder-ready.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the current boundary and non-goals',
            'checkpoint 2: define the smallest builder-ready sequence',
            'checkpoint 3: capture verification and review handoff points',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : ['checkpoint 1: breakdown', 'checkpoint 2: diff', 'checkpoint 3: review'],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Run the smallest practical verification tied to the approved slice.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review after the bounded builder sequence and verification evidence are ready.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if execution would widen scope beyond the approved boundary.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['Builder handoff stays bounded to the current approved slice only.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'builder',
      summary:
        normalizedResult.summary || 'Task-breaker output is ready for builder handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

function createQueuedFetch(initialResponses = []) {
  const queue = [...initialResponses];
  const calls = [];

  async function fetchImpl(url, init = {}) {
    calls.push({
      body: init.body || '',
      headers: init.headers || {},
      method: init.method || 'GET',
      url,
    });

    if (queue.length === 0) {
      throw new Error('No queued response for openai-responses fetch stub');
    }

    const next = queue.shift();

    if (next && Object.prototype.hasOwnProperty.call(next, 'throwError')) {
      throw next.throwError;
    }

    return createResponse(next.status ?? 200, next.payload ?? {});
  }

  return {
    calls,
    fetchImpl,
    push(response) {
      queue.push(response);
    },
  };
}

function createPlannerApiPayload(label, options = {}) {
  const outputText = createPlannerStructuredText({
    artifactMarkdown: createPlannerArtifactMarkdown(label),
    normalizedResult: options.normalizedResult || {},
  });
  const payload = {
    id: options.providerRunId || `resp-planner-${label}`,
    model: options.model || 'gpt-4.1-mini',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30,
    },
  };

  if (options.useAggregatedOutput === true) {
    payload.output = [
      {
        type: 'reasoning',
        content: [],
      },
      {
        type: 'message',
        content: [{ type: 'output_text', text: outputText }],
      },
    ];
  } else {
    payload.output_text = outputText;
  }

  return {
    payload,
    status: options.status ?? 200,
  };
}

function createArchitectApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createArchitectStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-architect',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 12,
        output_tokens: 24,
        total_tokens: 36,
      },
    },
    status: options.status ?? 200,
  };
}

function createTaskBreakerApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createTaskBreakerStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-task-breaker',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 14,
        output_tokens: 28,
        total_tokens: 42,
      },
    },
    status: options.status ?? 200,
  };
}

function createAbortError() {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

function createLiveCoordinator(runtime, fetchImpl) {
  return createExecutionCoordinator({
    liveProviderAdapter: createOpenAIResponsesProviderAdapter({
      fetchImpl,
    }),
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: CODE_CONTEXT_PATHS,
  });
}

function collectTaskRunErrors(runtime, taskId) {
  const snapshot = runtime.getSnapshot();
  const runs = Object.values(snapshot.runs)
    .filter((run) => run.taskId === taskId)
    .sort((left, right) => (right.startedAt || '').localeCompare(left.startedAt || ''));

  return runs.map((run) => ({
    id: run.id,
    error: run.summary?.error || null,
    logs: runtime.getLogs(run.id),
  }));
}

function createArchitectAnchor(projectId, taskId, planArtifactId, planRunId) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    codeContextPaths: CODE_CONTEXT_PATHS,
  };
}

function createTaskBreakerAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
  };
}

async function runPlannerAndArchitectForTask({
  architectResponse = null,
  coordinator,
  projectId,
  queuedFetch = null,
  runtime,
  label,
  intent,
  scopeStatement,
}) {
  const task = runtime.createTask({
    projectId,
    title: `provider-slice-04 ${label}`,
    intent,
  });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);
  if (queuedFetch && architectResponse) {
    const architectAnchor = createArchitectAnchor(
      projectId,
      task.id,
      planArtifact.id,
      plannerResult.run.id,
    );
    queuedFetch.push(
      typeof architectResponse === 'function'
        ? architectResponse(architectAnchor)
        : architectResponse,
    );
  }
  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const architectureArtifact = runtime.getArtifact(architectResult.artifact.id);

  return {
    architectResult,
    architectureArtifact,
    planArtifact,
    plannerResult,
    task,
  };
}

async function assertTaskBreakerFailure({
  errorPattern,
  projectId,
  runtime,
  label,
  plannerResponse,
  architectResponse,
  taskBreakerResponse,
}) {
  const queuedFetch = createQueuedFetch([plannerResponse]);
  const failingCoordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);
  const context = await runPlannerAndArchitectForTask({
    architectResponse,
    coordinator: failingCoordinator,
    projectId,
    queuedFetch,
    runtime,
    label,
    intent: `Exercise task-breaker failure handling for ${label}.`,
    scopeStatement: `Verify task-breaker fail-closed behavior for ${label}.`,
  });
  const anchor = createTaskBreakerAnchor(
    projectId,
    context.task.id,
    context.planArtifact.id,
    context.plannerResult.run.id,
    context.architectureArtifact.id,
    context.architectResult.run.id,
  );

  queuedFetch.push(
    typeof taskBreakerResponse === 'function'
      ? taskBreakerResponse(anchor)
      : taskBreakerResponse,
  );

  const runCountBefore = countRuns(runtime.getSnapshot(), context.task.id);
  const artifactCountBefore = countArtifacts(runtime.getSnapshot(), context.task.id, 'breakdown');
  const decisionCountBefore = countPendingDecisionItems(runtime.getSnapshot(), context.task.id);

  await assert.rejects(
    () => failingCoordinator.runTaskBreaker({ taskId: context.task.id }),
    errorPattern,
  );

  const snapshot = runtime.getSnapshot();
  const taskRuns = collectTaskRunErrors(runtime, context.task.id);

  assert.equal(countRuns(snapshot, context.task.id), runCountBefore + 1);
  assert.equal(countArtifacts(snapshot, context.task.id, 'breakdown'), artifactCountBefore);
  assert.equal(countPendingDecisionItems(snapshot, context.task.id), decisionCountBefore);
  assert.match(taskRuns[0]?.error || '', errorPattern);
  assert.match(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /invoking provider adapter openai-responses/i,
  );
  assert.doesNotMatch(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /local-stub/i,
  );
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();
process.env[liveProviderEnvVar] = sentinelSecret;

const defaultProject = runtime.createProject({
  name: 'provider-slice-04 default',
  projectPath: createFixtureProject('provider-slice-04-default'),
});

const liveProject = runtime.createProject({
  name: 'provider-slice-04 live',
  projectPath: createFixtureProject('provider-slice-04-live'),
  provider: {
    adapter: 'openai-responses',
    mode: 'live',
    model: 'provider-slice-04-operator-model',
    env: {
      apiKeyVar: liveProviderEnvVar,
    },
  },
});

const readinessFetch = createQueuedFetch();
const readinessCoordinator = createLiveCoordinator(runtime, readinessFetch.fetchImpl);
const defaultReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: defaultProject.id,
  role: 'planner',
});
const plannerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'planner',
});
const architectReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'architect',
});
const taskBreakerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'task-breaker',
});
const builderPreflightReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-preflight',
});
const builderLiveMutationReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-live-mutation',
});
const reviewerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'reviewer',
});

assert.equal(defaultReadiness.mode, 'local-stub');
assert.equal(defaultReadiness.allowed, true);
assert.equal(plannerReadiness.readiness, 'ready');
assert.equal(plannerReadiness.allowed, true);
assert.equal(architectReadiness.readiness, 'ready');
assert.equal(architectReadiness.allowed, true);
assert.equal(taskBreakerReadiness.readiness, 'ready');
assert.equal(taskBreakerReadiness.allowed, true);
assert.equal(builderPreflightReadiness.readiness, 'degraded');
assert.equal(builderPreflightReadiness.allowed, false);
assert.equal(builderLiveMutationReadiness.readiness, 'degraded');
assert.equal(builderLiveMutationReadiness.allowed, false);
assert.equal(reviewerReadiness.readiness, 'degraded');
assert.equal(reviewerReadiness.allowed, false);
assert.match(
  reviewerReadiness.reasons.join('; '),
  /planner, architect, and task-breaker/i,
);

const happyFetch = createQueuedFetch([
  createPlannerApiPayload('task-breaker-fit'),
]);
const happyCoordinator = createLiveCoordinator(runtime, happyFetch.fetchImpl);
const happyContext = await runPlannerAndArchitectForTask({
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      providerRunId: 'resp-architect-fit',
    }),
  coordinator: happyCoordinator,
  projectId: liveProject.id,
  queuedFetch: happyFetch,
  runtime,
  label: 'task-breaker fit path',
  intent: 'Run planner, architect, and task-breaker live with a clean builder handoff.',
  scopeStatement: 'Verify task-breaker live can render a canonical breakdown artifact.',
});
const happyAnchor = createTaskBreakerAnchor(
  liveProject.id,
  happyContext.task.id,
  happyContext.planArtifact.id,
  happyContext.plannerResult.run.id,
  happyContext.architectureArtifact.id,
  happyContext.architectResult.run.id,
);

happyFetch.push(
  createTaskBreakerApiPayload(happyAnchor, {
    providerRunId: 'resp-task-breaker-fit',
  }),
);

const happyTaskBreakerResult = await happyCoordinator.runTaskBreaker({
  taskId: happyContext.task.id,
});
const happyBreakdownArtifact = runtime.getArtifact(happyTaskBreakerResult.artifact.id);
const plannerRequestBody = JSON.parse(happyFetch.calls[0].body);
const architectRequestBody = JSON.parse(happyFetch.calls[1].body);
const taskBreakerRequestBody = JSON.parse(happyFetch.calls[2].body);

assert.equal(happyContext.plannerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyContext.architectResult.run.summary.adapter, 'openai-responses');
assert.equal(happyTaskBreakerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyTaskBreakerResult.run.summary.providerRunId, 'resp-task-breaker-fit');
assert.equal(
  happyTaskBreakerResult.run.summary.architectureArtifactId,
  happyContext.architectureArtifact.id,
);
assert.equal(
  happyTaskBreakerResult.run.summary.architectureRunId,
  happyContext.architectResult.run.id,
);
assert.equal(happyTaskBreakerResult.run.summary.nextStage, 'builder');
assert.equal(happyTaskBreakerResult.decisionInboxItem, null);
assert.equal(plannerRequestBody.text.format.type, 'json_schema');
assert.equal(architectRequestBody.text.format.type, 'json_schema');
assert.equal(taskBreakerRequestBody.text.format.type, 'json_schema');
assert.equal(taskBreakerRequestBody.text.format.name, 'task_breaker_artifact_response');
assert.match(
  String(taskBreakerRequestBody.instructions || ''),
  /builder output is valid only when needsDecision=false, blockers=\[\], and artifact\.orderedSubTasks is non-empty/i,
);
assert.match(
  String(taskBreakerRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.planArtifact.id)),
);
assert.match(
  String(taskBreakerRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.architectureArtifact.id)),
);
assert.match(happyBreakdownArtifact.content, /^# Task Breakdown:/m);
assert.match(happyBreakdownArtifact.content, /^## Ordered Sub-Tasks$/m);
assert.match(happyBreakdownArtifact.content, /^## Execution Boundary Summary$/m);

const blockedFetch = createQueuedFetch([
  createPlannerApiPayload('task-breaker-human-gate'),
]);
const blockedCoordinator = createLiveCoordinator(runtime, blockedFetch.fetchImpl);
const blockedContext = await runPlannerAndArchitectForTask({
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      providerRunId: 'resp-architect-task-breaker-fit',
    }),
  coordinator: blockedCoordinator,
  projectId: liveProject.id,
  queuedFetch: blockedFetch,
  runtime,
  label: 'task-breaker human gate path',
  intent: 'Run planner, architect, and task-breaker live with a blocked builder handoff.',
  scopeStatement: 'Verify task-breaker live can raise one blocking decision item.',
});
const blockedAnchor = createTaskBreakerAnchor(
  liveProject.id,
  blockedContext.task.id,
  blockedContext.planArtifact.id,
  blockedContext.plannerResult.run.id,
  blockedContext.architectureArtifact.id,
  blockedContext.architectResult.run.id,
);

blockedFetch.push(
  createTaskBreakerApiPayload(blockedAnchor, {
    providerRunId: 'resp-task-breaker-human-gate',
    artifact: {
      stopAndEscalateConditions: [
        'Stop because an operator decision is still required before builder handoff.',
      ],
      executionBoundarySummary: [
        'Builder must remain blocked until the current human gate is resolved.',
      ],
    },
    normalizedResult: {
      blockers: ['An operator decision is required before builder handoff may proceed.'],
      needsDecision: true,
      nextStage: 'human gate',
      summary: 'Task-breaker found a blocking issue that must route through the human gate.',
      decisionTitle: 'Task-breaker decision required',
      decisionPrompt: 'Resolve the blocked implementation choice before builder work may continue.',
    },
  }),
);

const blockedTaskBreakerResult = await blockedCoordinator.runTaskBreaker({
  taskId: blockedContext.task.id,
});

assert.equal(blockedTaskBreakerResult.run.summary.nextStage, 'human gate');
assert.equal(Boolean(blockedTaskBreakerResult.decisionInboxItem), true);
assert.equal(countPendingDecisionItems(runtime.getSnapshot(), blockedContext.task.id), 1);
assert.equal(blockedTaskBreakerResult.decisionInboxItem.kind, 'decision');
assert.equal(blockedTaskBreakerResult.decisionInboxItem.sourceType, 'decision');
assert.equal(blockedTaskBreakerResult.decisionInboxItem.blocksTask, true);

const mismatchFetch = createQueuedFetch([
  createPlannerApiPayload('task-breaker-provenance-fit'),
]);
const mismatchCoordinator = createLiveCoordinator(runtime, mismatchFetch.fetchImpl);
const mismatchContext = await runPlannerAndArchitectForTask({
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      providerRunId: 'resp-architect-provenance-fit',
    }),
  coordinator: mismatchCoordinator,
  projectId: liveProject.id,
  queuedFetch: mismatchFetch,
  runtime,
  label: 'task-breaker provenance mismatch',
  intent: 'Verify task-breaker rejects a stale plan-plus-architecture provenance chain.',
  scopeStatement: 'Verify provenance-chain enforcement blocks task-breaker before provider invocation.',
});
mismatchFetch.push(
  createPlannerApiPayload('task-breaker-provenance-plan-refresh', {
    providerRunId: 'resp-planner-plan-refresh',
  }),
);
const mismatchPlanRefresh = await mismatchCoordinator.runPlanner({
  taskId: mismatchContext.task.id,
  routingOutcome: createRoutingOutcome(
    'Refresh the latest plan so the previously generated architecture provenance becomes stale.',
  ),
});
const mismatchRunCountBefore = countRuns(runtime.getSnapshot(), mismatchContext.task.id);
const mismatchArtifactCountBefore = countArtifacts(
  runtime.getSnapshot(),
  mismatchContext.task.id,
  'breakdown',
);
const mismatchFetchCallCountBefore = mismatchFetch.calls.length;

await assert.rejects(
  () => mismatchCoordinator.runTaskBreaker({ taskId: mismatchContext.task.id }),
  /does not match current latest plan artifact/i,
);

const mismatchSnapshot = runtime.getSnapshot();
assert.equal(countRuns(mismatchSnapshot, mismatchContext.task.id), mismatchRunCountBefore);
assert.equal(
  countArtifacts(mismatchSnapshot, mismatchContext.task.id, 'breakdown'),
  mismatchArtifactCountBefore,
);
assert.equal(mismatchFetch.calls.length, mismatchFetchCallCountBefore);
assert.equal(mismatchPlanRefresh.run.summary.adapter, 'openai-responses');

await assertTaskBreakerFailure({
  errorPattern: /structured output JSON is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker malformed json',
  plannerResponse: createPlannerApiPayload('task-breaker-malformed-json'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: () =>
    createTaskBreakerApiPayload(null, {
      rawOutputText: '{not-json',
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /artifact\.checkpoints is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker missing required field',
  plannerResponse: createPlannerApiPayload('task-breaker-missing-field'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      rawOutputText: JSON.stringify({
        anchor,
        artifact: {
          orderedSubTasks: ['Keep the slice bounded.'],
          expectedArtifactsPerCheckpoint: ['checkpoint 1: breakdown'],
          verificationCheckpoints: ['Run the smallest practical verification.'],
          reviewTriggerPoints: ['Trigger review after verification.'],
          stopAndEscalateConditions: ['Stop if the implementation widens scope.'],
          executionBoundarySummary: ['Builder handoff stays bounded to the current slice.'],
        },
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'builder',
          summary: 'Task-breaker output is ready for builder handoff.',
          decisionTitle: '',
          decisionPrompt: '',
        },
      }),
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /anchor must exactly match/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker anchor mismatch',
  plannerResponse: createPlannerApiPayload('task-breaker-anchor-mismatch'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      anchor: {
        ...anchor,
        architectureRunId: 'run-9999',
      },
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /repo-relative paths only/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker invalid repo-relative path',
  plannerResponse: createPlannerApiPayload('task-breaker-invalid-path'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      anchor: {
        ...anchor,
        sourceOfTruthPaths: ['../outside.md'],
      },
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /nextStage is invalid for task-breaker output/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker unsupported next stage',
  plannerResponse: createPlannerApiPayload('task-breaker-unsupported-next-stage'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      normalizedResult: {
        nextStage: 'reviewer',
      },
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /orderedSubTasks.*at least one item/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker empty ordered sub-tasks',
  plannerResponse: createPlannerApiPayload('task-breaker-empty-subtasks'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      artifact: {
        orderedSubTasks: [],
      },
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /needsDecision=true and blockers non-empty/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker invalid human gate output',
  plannerResponse: createPlannerApiPayload('task-breaker-invalid-human-gate'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) =>
    createTaskBreakerApiPayload(anchor, {
      normalizedResult: {
        blockers: [],
        needsDecision: false,
        nextStage: 'human gate',
        summary: 'This output is invalid and must fail closed.',
        decisionTitle: '',
        decisionPrompt: '',
      },
    }),
});

await assertTaskBreakerFailure({
  errorPattern: /status 401/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker auth failure',
  plannerResponse: createPlannerApiPayload('task-breaker-auth-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: () => ({
    status: 401,
    payload: {
      error: {
        message: 'Unauthorized',
      },
    },
  }),
});

await assertTaskBreakerFailure({
  errorPattern: /status 429/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker quota failure',
  plannerResponse: createPlannerApiPayload('task-breaker-quota-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: () => ({
    status: 429,
    payload: {
      error: {
        message: 'Rate limited',
      },
    },
  }),
});

await assertTaskBreakerFailure({
  errorPattern: /timed out/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker timeout failure',
  plannerResponse: createPlannerApiPayload('task-breaker-timeout-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: () => ({
    throwError: createAbortError(),
  }),
});

await assertTaskBreakerFailure({
  errorPattern: /failed before a response was received/i,
  projectId: liveProject.id,
  runtime,
  label: 'task-breaker network failure',
  plannerResponse: createPlannerApiPayload('task-breaker-network-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: () => ({
    throwError: new Error('socket hang up'),
  }),
});

const snapshotPayload = runtime.getSnapshot();
assertSecretAbsent(JSON.stringify(snapshotPayload), sentinelSecret, 'snapshot payload');

for (const run of Object.values(snapshotPayload.runs)) {
  const logs = runtime.getLogs(run.id);
  assertSecretAbsent(JSON.stringify(logs), sentinelSecret, `logs ${run.id}`);
}

for (const artifact of Object.values(snapshotPayload.artifacts)) {
  const artifactPayload = runtime.getArtifact(artifact.id);
  assertSecretAbsent(JSON.stringify(artifactPayload), sentinelSecret, `artifact ${artifact.id}`);
}

const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, sentinelSecret);
assert.deepEqual(runtimeSecretMatches, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      defaultProvider: defaultReadiness.readiness,
      liveRoleReadiness: {
        architect: architectReadiness.readiness,
        builderLiveMutation: builderLiveMutationReadiness.readiness,
        builderPreflight: builderPreflightReadiness.readiness,
        planner: plannerReadiness.readiness,
        reviewer: reviewerReadiness.readiness,
        taskBreaker: taskBreakerReadiness.readiness,
      },
      happyPath: {
        breakdownArtifactId: happyTaskBreakerResult.artifact.id,
        nextStage: happyTaskBreakerResult.run.summary.nextStage,
        planArtifactId: happyContext.planArtifact.id,
      },
      humanGate: {
        breakdownArtifactId: blockedTaskBreakerResult.artifact.id,
        decisionInboxItemId: blockedTaskBreakerResult.decisionInboxItem?.id || null,
        nextStage: blockedTaskBreakerResult.run.summary.nextStage,
      },
      provenanceMismatch: {
        latestPlanArtifactId: mismatchPlanRefresh.artifact.id,
        staleArchitectureArtifactId: mismatchContext.architectureArtifact.id,
      },
    },
    null,
    2,
  ),
);
