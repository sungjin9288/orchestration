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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-03');
const sentinelSecret = 'provider-slice-03-secret-sentinel';
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
Verify provider-slice-03 planner and architect live execution.

## Intended Outcome
Keep planner live stable while adding architect live on the same openai-responses adapter boundary.

## Acceptance Target
- planner live invocation remains stable
- architect live invocation succeeds with explicit anchor validation
- downstream live roles remain blocked

## Verification Approach
- synthetic provider smoke

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture

## Worktree Need
No.

## Non-Goals
- task-breaker live execution
- builder live execution
- reviewer live execution
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
        : ['The slice stays inside the current development-pack boundary.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : ['Architect input is anchored to the latest plan artifact only.'],
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

async function runPlannerForTask({ coordinator, projectId, runtime, label, intent, scopeStatement }) {
  const task = runtime.createTask({
    projectId,
    title: `provider-slice-03 ${label}`,
    intent,
  });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);

  return {
    planArtifact,
    plannerResult,
    task,
  };
}

async function assertArchitectFailure({
  errorPattern,
  projectId,
  runtime,
  label,
  plannerResponse,
  architectResponse,
}) {
  const queuedFetch = createQueuedFetch([plannerResponse]);
  const failingCoordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);
  const context = await runPlannerForTask({
    coordinator: failingCoordinator,
    projectId,
    runtime,
    label,
    intent: `Exercise architect failure handling for ${label}.`,
    scopeStatement: `Verify architect fail-closed behavior for ${label}.`,
  });
  const anchor = createArchitectAnchor(
    projectId,
    context.task.id,
    context.planArtifact.id,
    context.plannerResult.run.id,
  );
  queuedFetch.push(
    typeof architectResponse === 'function' ? architectResponse(anchor) : architectResponse,
  );

  const runCountBefore = countRuns(runtime.getSnapshot(), context.task.id);
  const artifactCountBefore = countArtifacts(runtime.getSnapshot(), context.task.id, 'architecture');
  const decisionCountBefore = countPendingDecisionItems(runtime.getSnapshot(), context.task.id);

  await assert.rejects(() => failingCoordinator.runArchitect({ taskId: context.task.id }), errorPattern);

  const snapshot = runtime.getSnapshot();
  const taskRuns = collectTaskRunErrors(runtime, context.task.id);

  assert.equal(countRuns(snapshot, context.task.id), runCountBefore + 1);
  assert.equal(countArtifacts(snapshot, context.task.id, 'architecture'), artifactCountBefore);
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

const localStubCoordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
  sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
  architectCodeContextPaths: CODE_CONTEXT_PATHS,
});

const defaultProject = runtime.createProject({
  name: 'provider-slice-03-default',
  projectPath: createFixtureProject('provider-slice-03-default'),
});
const defaultTask = runtime.createTask({
  projectId: defaultProject.id,
  title: 'provider-slice-03 local default smoke',
  intent: 'Keep local-stub as the shipped default while extending architect live execution.',
});
const defaultReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: defaultProject.id,
});
const defaultPlannerResult = await localStubCoordinator.runPlanner({
  taskId: defaultTask.id,
  routingOutcome: createRoutingOutcome('Verify local-stub remains the shipped default provider.'),
});

assert.equal(defaultReadiness.mode, 'local-stub');
assert.equal(defaultReadiness.adapter, 'local-stub');
assert.equal(defaultReadiness.readiness, 'ready');
assert.equal(defaultReadiness.allowed, true);
assert.equal(defaultPlannerResult.run.summary.adapter, 'local-stub');

const liveProject = runtime.createProject({
  name: 'provider-slice-03-live',
  projectPath: createFixtureProject('provider-slice-03-live'),
});

runtime.setProjectProviderConfig({
  projectId: liveProject.id,
  provider: {
    adapter: 'openai-responses',
    mode: 'live',
    model: 'operator-pinned-model',
    env: {
      apiKeyVar: liveProviderEnvVar,
    },
  },
});

const readinessCoordinator = createLiveCoordinator(runtime, async () => {
  throw new Error('Fetch should not be called for readiness checks');
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

assert.equal(plannerReadiness.readiness, 'ready');
assert.equal(plannerReadiness.allowed, true);
assert.equal(architectReadiness.readiness, 'ready');
assert.equal(architectReadiness.allowed, true);
assert.equal(taskBreakerReadiness.readiness, 'ready');
assert.equal(builderPreflightReadiness.readiness, 'ready');
assert.equal(builderLiveMutationReadiness.readiness, 'degraded');
assert.equal(reviewerReadiness.readiness, 'degraded');
assert.equal(taskBreakerReadiness.allowed, true);
assert.equal(builderPreflightReadiness.allowed, true);
assert.equal(builderLiveMutationReadiness.allowed, false);
assert.equal(reviewerReadiness.allowed, false);
assert.equal(taskBreakerReadiness.reasons.length, 0);
assert.equal(builderPreflightReadiness.reasons.length, 0);
assert.match(
  reviewerReadiness.reasons.join('; '),
  /planner, architect, task-breaker, and builder-preflight/i,
);

const happyFetch = createQueuedFetch([
  createPlannerApiPayload('architect-happy-path'),
]);
const happyCoordinator = createLiveCoordinator(runtime, happyFetch.fetchImpl);
const happyContext = await runPlannerForTask({
  coordinator: happyCoordinator,
  projectId: liveProject.id,
  runtime,
  label: 'architect happy path',
  intent: 'Run planner and architect live with a fit boundary response.',
  scopeStatement: 'Verify architect live invocation persists an architecture artifact.',
});
const happyAnchor = createArchitectAnchor(
  liveProject.id,
  happyContext.task.id,
  happyContext.planArtifact.id,
  happyContext.plannerResult.run.id,
);

happyFetch.push(
  createArchitectApiPayload(happyAnchor, {
    providerRunId: 'resp-architect-fit',
  }),
);

const happyArchitectResult = await happyCoordinator.runArchitect({
  taskId: happyContext.task.id,
});
const happyArchitectureArtifact = runtime.getArtifact(happyArchitectResult.artifact.id);
const plannerRequestBody = JSON.parse(happyFetch.calls[0].body);
const architectRequestBody = JSON.parse(happyFetch.calls[1].body);

assert.equal(happyContext.plannerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyArchitectResult.run.summary.adapter, 'openai-responses');
assert.equal(happyArchitectResult.run.summary.providerRunId, 'resp-architect-fit');
assert.equal(happyArchitectResult.run.summary.inputArtifactId, happyContext.planArtifact.id);
assert.equal(happyArchitectResult.run.summary.inputRunId, happyContext.plannerResult.run.id);
assert.equal(happyArchitectResult.run.summary.nextStage, 'task-breaker');
assert.equal(happyArchitectResult.decisionInboxItem, null);
assert.equal(plannerRequestBody.text.format.type, 'json_schema');
assert.equal(plannerRequestBody.text.format.name, 'planner_artifact_response');
assert.equal(architectRequestBody.text.format.type, 'json_schema');
assert.equal(architectRequestBody.text.format.name, 'architect_artifact_response');
assert.match(String(architectRequestBody.instructions || ''), /anchor must echo the request anchor exactly/i);
assert.match(String(architectRequestBody.input || ''), new RegExp(escapeRegExp(happyContext.planArtifact.id)));
assert.match(String(architectRequestBody.input || ''), new RegExp(escapeRegExp(happyContext.plannerResult.run.id)));
assert.match(happyArchitectureArtifact.content, /## Affected Components or Contracts/);
assert.match(
  happyArchitectureArtifact.content,
  /src\/execution\/execution-coordinator\.js/,
);

const blockedFetch = createQueuedFetch([
  createPlannerApiPayload('architect-human-gate'),
]);
const blockedCoordinator = createLiveCoordinator(runtime, blockedFetch.fetchImpl);
const blockedContext = await runPlannerForTask({
  coordinator: blockedCoordinator,
  projectId: liveProject.id,
  runtime,
  label: 'architect human gate path',
  intent: 'Run planner and architect live with a blocked architecture response.',
  scopeStatement: 'Verify architect live can raise one blocking decision item.',
});
const blockedAnchor = createArchitectAnchor(
  liveProject.id,
  blockedContext.task.id,
  blockedContext.planArtifact.id,
  blockedContext.plannerResult.run.id,
);

blockedFetch.push(
  createArchitectApiPayload(blockedAnchor, {
    providerRunId: 'resp-architect-human-gate',
    artifact: {
      boundaryFit: 'human-gate-required',
      affectedComponentsOrContracts: ['src/execution/execution-coordinator.js'],
      policyImpact: ['The plan needs a human architecture decision before proceeding.'],
      decisionLogImpact: ['A follow-up decision may need an explicit decision-log update.'],
      approvedAssumptions: ['No downstream live role opens in this slice.'],
      noArchitectureChangeStatement:
        'No architecture change is approved by this note. Human resolution is required first.',
      blockingArchitectureIssues: ['The plan would widen live execution beyond the approved scope.'],
    },
    normalizedResult: {
      blockers: ['The plan would widen live execution beyond the approved scope.'],
      needsDecision: true,
      nextStage: 'human gate',
      summary: 'Architect found a blocking issue that must route through the human gate.',
      decisionTitle: 'Architecture decision required',
      decisionPrompt: 'Resolve the blocked live-scope expansion before downstream work may proceed.',
    },
  }),
);

const blockedArchitectResult = await blockedCoordinator.runArchitect({
  taskId: blockedContext.task.id,
});

assert.equal(blockedArchitectResult.run.summary.nextStage, 'human gate');
assert.equal(Boolean(blockedArchitectResult.decisionInboxItem), true);
assert.equal(countPendingDecisionItems(runtime.getSnapshot(), blockedContext.task.id), 1);

await assertArchitectFailure({
  errorPattern: /structured output JSON is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect malformed json',
  plannerResponse: createPlannerApiPayload('architect-malformed-json'),
  architectResponse: () =>
    createArchitectApiPayload(null, {
      rawOutputText: '{not-json',
    }),
});

await assertArchitectFailure({
  errorPattern: /artifact\.policyImpact is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect missing required field',
  plannerResponse: createPlannerApiPayload('architect-missing-field'),
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      rawOutputText: JSON.stringify({
        anchor,
        artifact: {
          boundaryFit: 'fit',
          affectedComponentsOrContracts: ['src/execution/execution-coordinator.js'],
          decisionLogImpact: ['None.'],
          approvedAssumptions: ['Architect input is anchored to the latest plan artifact only.'],
          noArchitectureChangeStatement:
            'No architecture change is approved by this note. Downstream work must stay inside the current boundary.',
          blockingArchitectureIssues: [],
        },
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'task-breaker',
          summary: 'Architect output is ready for task-breaker handoff.',
          decisionTitle: '',
          decisionPrompt: '',
        },
      }),
    }),
});

await assertArchitectFailure({
  errorPattern: /at least one repo-relative path/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect empty affected list',
  plannerResponse: createPlannerApiPayload('architect-empty-affected-list'),
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      artifact: {
        affectedComponentsOrContracts: [],
      },
    }),
});

await assertArchitectFailure({
  errorPattern: /anchor must exactly match/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect anchor mismatch',
  plannerResponse: createPlannerApiPayload('architect-anchor-mismatch'),
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      anchor: {
        ...anchor,
        planRunId: 'run-9999',
      },
    }),
});

await assertArchitectFailure({
  errorPattern: /repo-relative paths only/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect invalid path',
  plannerResponse: createPlannerApiPayload('architect-invalid-path'),
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      artifact: {
        affectedComponentsOrContracts: ['../outside.txt'],
      },
    }),
});

await assertArchitectFailure({
  errorPattern: /nextStage is invalid for architect output/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect unsupported next stage',
  plannerResponse: createPlannerApiPayload('architect-unsupported-next-stage'),
  architectResponse: (anchor) =>
    createArchitectApiPayload(anchor, {
      normalizedResult: {
        nextStage: 'builder',
      },
    }),
});

await assertArchitectFailure({
  errorPattern: /status 401/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect auth failure',
  plannerResponse: createPlannerApiPayload('architect-auth-failure'),
  architectResponse: () => ({
    status: 401,
    payload: {
      error: {
        message: 'Unauthorized',
      },
    },
  }),
});

await assertArchitectFailure({
  errorPattern: /status 429/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect quota failure',
  plannerResponse: createPlannerApiPayload('architect-quota-failure'),
  architectResponse: () => ({
    status: 429,
    payload: {
      error: {
        message: 'Rate limited',
      },
    },
  }),
});

await assertArchitectFailure({
  errorPattern: /timed out/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect timeout failure',
  plannerResponse: createPlannerApiPayload('architect-timeout-failure'),
  architectResponse: () => ({
    throwError: createAbortError(),
  }),
});

await assertArchitectFailure({
  errorPattern: /failed before a response was received/i,
  projectId: liveProject.id,
  runtime,
  label: 'architect network failure',
  plannerResponse: createPlannerApiPayload('architect-network-failure'),
  architectResponse: () => ({
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
        architectureArtifactId: happyArchitectResult.artifact.id,
        nextStage: happyArchitectResult.run.summary.nextStage,
        planArtifactId: happyContext.planArtifact.id,
      },
      humanGate: {
        decisionInboxItemId: blockedArchitectResult.decisionInboxItem?.id || null,
        nextStage: blockedArchitectResult.run.summary.nextStage,
      },
    },
    null,
    2,
  ),
);
