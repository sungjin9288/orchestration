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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-05');
const sentinelSecret = 'provider-slice-05-secret-sentinel';
const liveProviderEnvVar = 'OPENAI_API_KEY';
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/runtime-service.js',
  'src/execution/provider-adapter.js',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/openai-responses-adapter.js',
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
Verify provider-slice-05 builder-preflight live execution.

## Intended Outcome
Keep planner plus architect plus task-breaker live stable while extending the same openai-responses adapter boundary to builder-preflight.

## Acceptance Target
- planner live invocation remains stable
- architect live invocation remains stable
- task-breaker live invocation remains stable
- builder-preflight live invocation succeeds with provenance-chain validation
- builder live mutation and reviewer live remain blocked

## Verification Approach
- synthetic provider smoke

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
- breakdown
- preflight

## Worktree Need
No.

## Non-Goals
- builder live mutation execution
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
        : [...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS],
      policyImpact: Array.isArray(artifact.policyImpact)
        ? artifact.policyImpact
        : ['The slice stays inside the existing provider boundary.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : [
            'Builder-preflight input must preserve the current plan-plus-architecture-plus-breakdown provenance chain.',
          ],
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
            'Validate the current plan-plus-architecture provenance chain before builder-preflight handoff.',
            'Prepare the minimum implementation sequence without widening scope.',
            'Stop after the bounded implementation slice is builder-preflight-ready.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the current boundary and non-goals',
            'checkpoint 2: define the smallest builder-preflight-ready sequence',
            'checkpoint 3: capture verification and approval handoff points',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : [
            'checkpoint 1: breakdown',
            'checkpoint 2: preflight',
            'checkpoint 3: approval request',
          ],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Run the smallest practical verification tied to the approved slice.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review only after approved live mutation plus verification evidence are ready.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if execution would widen scope beyond the approved boundary.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['Builder-preflight handoff stays bounded to the current approved slice only.'],
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

function createBuilderPreflightStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      targetFiles: Array.isArray(artifact.targetFiles)
        ? artifact.targetFiles
        : ['src/execution/execution-coordinator.js', 'src/runtime/runtime-service.js'],
      intendedChanges: Array.isArray(artifact.intendedChanges)
        ? artifact.intendedChanges
        : [
            'Extend builder-preflight live execution without widening builder live mutation or reviewer live.',
            'Preserve the current provenance chain and approval-request-only clean handoff.',
          ],
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when upstream provenance or structured output validation does not match.'],
      verificationPlan: Array.isArray(artifact.verificationPlan)
        ? artifact.verificationPlan
        : [
            'Run synthetic provider smoke for happy-path, escalation-path, and fail-closed cases.',
            'Run optional real live smoke only through builder-preflight.',
          ],
      reviewEvidenceExpectations: Array.isArray(artifact.reviewEvidenceExpectations)
        ? artifact.reviewEvidenceExpectations
        : [
            'The preflight artifact should remain parser-compatible and capture explicit target files.',
          ],
      escalationTriggers: Array.isArray(artifact.escalationTriggers)
        ? artifact.escalationTriggers
        : ['Escalate if target files would leave the approved architecture boundary.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage:
        normalizedResult.nextStage || 'request-builder-live-mutation-approval',
      summary:
        normalizedResult.summary ||
        'Builder-preflight output is ready for explicit live-mutation approval request.',
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

function createBuilderPreflightApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createBuilderPreflightStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-builder-preflight',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 16,
        output_tokens: 32,
        total_tokens: 48,
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
    builderPreflightCodeContextPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
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
    codeContextPaths: [
      'src/runtime/contracts.js',
      'src/runtime/file-store.js',
      'src/runtime/runtime-service.js',
      'src/execution/execution-coordinator.js',
      'ui/app.js',
    ],
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

function createBuilderPreflightAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
  breakdownArtifactId,
  breakdownRunId,
  architectureAllowlistPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  codeContextPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    breakdownArtifactId,
    breakdownRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectureAllowlistPaths,
    codeContextPaths,
  };
}

async function runPlannerArchitectTaskBreakerForTask({
  coordinator,
  projectId,
  queuedFetch,
  runtime,
  label,
  intent,
  scopeStatement,
  architectPayloadFactory = null,
  taskBreakerPayloadFactory = null,
}) {
  const task = runtime.createTask({
    projectId,
    title: `provider-slice-05 ${label}`,
    intent,
  });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);
  const architectAnchor = createArchitectAnchor(
    projectId,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
  );

  queuedFetch.push(
    architectPayloadFactory
      ? architectPayloadFactory(architectAnchor)
      : createArchitectApiPayload(architectAnchor),
  );

  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const architectureArtifact = runtime.getArtifact(architectResult.artifact.id);
  const taskBreakerAnchor = createTaskBreakerAnchor(
    projectId,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
    architectureArtifact.id,
    architectResult.run.id,
  );

  queuedFetch.push(
    taskBreakerPayloadFactory
      ? taskBreakerPayloadFactory(taskBreakerAnchor)
      : createTaskBreakerApiPayload(taskBreakerAnchor),
  );

  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });
  const breakdownArtifact = runtime.getArtifact(taskBreakerResult.artifact.id);

  return {
    architectResult,
    architectureArtifact,
    breakdownArtifact,
    planArtifact,
    plannerResult,
    task,
    taskBreakerResult,
  };
}

async function assertBuilderPreflightFailure({
  errorPattern,
  projectId,
  runtime,
  label,
  plannerResponse,
  architectResponse,
  taskBreakerResponse,
  builderPreflightResponse,
  beforeRun = null,
  expectProviderInvocation = true,
}) {
  const queuedFetch = createQueuedFetch([plannerResponse]);
  const coordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);
  const context = await runPlannerArchitectTaskBreakerForTask({
    architectPayloadFactory: architectResponse,
    coordinator,
    projectId,
    queuedFetch,
    runtime,
    label,
    intent: `Exercise builder-preflight failure handling for ${label}.`,
    scopeStatement: `Verify builder-preflight fail-closed behavior for ${label}.`,
    taskBreakerPayloadFactory: taskBreakerResponse,
  });

  if (typeof beforeRun === 'function') {
    await beforeRun({ context, coordinator, queuedFetch, runtime });
  }

  const builderPreflightAnchor = createBuilderPreflightAnchor(
    projectId,
    context.task.id,
    context.planArtifact.id,
    context.plannerResult.run.id,
    context.architectureArtifact.id,
    context.architectResult.run.id,
    context.breakdownArtifact.id,
    context.taskBreakerResult.run.id,
  );

  if (expectProviderInvocation) {
    queuedFetch.push(
      typeof builderPreflightResponse === 'function'
        ? builderPreflightResponse(builderPreflightAnchor)
        : builderPreflightResponse,
    );
  }

  const snapshotBefore = runtime.getSnapshot();
  const runCountBefore = countRuns(snapshotBefore, context.task.id);
  const artifactCountBefore = countArtifacts(snapshotBefore, context.task.id, 'preflight');
  const decisionCountBefore = countPendingDecisionItems(snapshotBefore, context.task.id);
  const fetchCallCountBefore = queuedFetch.calls.length;

  await assert.rejects(
    () => coordinator.runBuilderPreflight({ taskId: context.task.id }),
    errorPattern,
  );

  const snapshot = runtime.getSnapshot();

  if (expectProviderInvocation) {
    const taskRuns = collectTaskRunErrors(runtime, context.task.id);

    assert.equal(countRuns(snapshot, context.task.id), runCountBefore + 1);
    assert.equal(countArtifacts(snapshot, context.task.id, 'preflight'), artifactCountBefore);
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
  } else {
    assert.equal(countRuns(snapshot, context.task.id), runCountBefore);
    assert.equal(countArtifacts(snapshot, context.task.id, 'preflight'), artifactCountBefore);
    assert.equal(countPendingDecisionItems(snapshot, context.task.id), decisionCountBefore);
    assert.equal(queuedFetch.calls.length, fetchCallCountBefore);
  }
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();
process.env[liveProviderEnvVar] = sentinelSecret;

const defaultProject = runtime.createProject({
  name: 'provider-slice-05 default',
  projectPath: createFixtureProject('provider-slice-05-default'),
});

const liveProject = runtime.createProject({
  name: 'provider-slice-05 live',
  projectPath: createFixtureProject('provider-slice-05-live'),
  provider: {
    adapter: 'openai-responses',
    mode: 'live',
    model: 'provider-slice-05-operator-model',
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
assert.equal(builderPreflightReadiness.readiness, 'ready');
assert.equal(builderPreflightReadiness.allowed, true);
assert.equal(builderLiveMutationReadiness.readiness, 'ready');
assert.equal(builderLiveMutationReadiness.allowed, true);
assert.equal(reviewerReadiness.readiness, 'ready');
assert.equal(reviewerReadiness.allowed, true);
assert.match(
  reviewerReadiness.reasons.join('; '),
  /^$|reviewer|builder-live-mutation|planner|architect|task-breaker|builder-preflight/i,
);

const happyFetch = createQueuedFetch([
  createPlannerApiPayload('builder-preflight-fit'),
]);
const happyCoordinator = createLiveCoordinator(runtime, happyFetch.fetchImpl);
const happyContext = await runPlannerArchitectTaskBreakerForTask({
  coordinator: happyCoordinator,
  projectId: liveProject.id,
  queuedFetch: happyFetch,
  runtime,
  label: 'builder-preflight fit path',
  intent: 'Run planner, architect, task-breaker, and builder-preflight live with a clean approval-request handoff.',
  scopeStatement: 'Verify builder-preflight live can render a canonical preflight artifact.',
});
const happyBuilderPreflightAnchor = createBuilderPreflightAnchor(
  liveProject.id,
  happyContext.task.id,
  happyContext.planArtifact.id,
  happyContext.plannerResult.run.id,
  happyContext.architectureArtifact.id,
  happyContext.architectResult.run.id,
  happyContext.breakdownArtifact.id,
  happyContext.taskBreakerResult.run.id,
);

happyFetch.push(
  createBuilderPreflightApiPayload(happyBuilderPreflightAnchor, {
    providerRunId: 'resp-builder-preflight-fit',
  }),
);

const happyBuilderPreflightResult = await happyCoordinator.runBuilderPreflight({
  taskId: happyContext.task.id,
});
const happyPreflightArtifact = runtime.getArtifact(happyBuilderPreflightResult.artifact.id);
const happyRequestBody = JSON.parse(happyFetch.calls[3].body);

assert.equal(happyContext.plannerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyContext.architectResult.run.summary.adapter, 'openai-responses');
assert.equal(happyContext.taskBreakerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyBuilderPreflightResult.run.summary.adapter, 'openai-responses');
assert.equal(happyBuilderPreflightResult.run.summary.providerRunId, 'resp-builder-preflight-fit');
assert.equal(
  happyBuilderPreflightResult.run.summary.nextStage,
  'request-builder-live-mutation-approval',
);
assert.equal(happyBuilderPreflightResult.decisionInboxItem, null);
assert.equal(happyRequestBody.text.format.type, 'json_schema');
assert.equal(happyRequestBody.text.format.name, 'builder_preflight_artifact_response');
assert.match(
  String(happyRequestBody.instructions || ''),
  /request-builder-live-mutation-approval is valid only when needsDecision=false, blockers=\[\], and artifact\.targetFiles is non-empty/i,
);
assert.match(
  String(happyRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.planArtifact.id)),
);
assert.match(
  String(happyRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.architectureArtifact.id)),
);
assert.match(
  String(happyRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.breakdownArtifact.id)),
);
assert.match(happyPreflightArtifact.content, /^# Builder Preflight:/m);
assert.match(happyPreflightArtifact.content, /^## Target Files$/m);
assert.match(happyPreflightArtifact.content, /^## Intended Changes$/m);
assert.match(happyPreflightArtifact.content, /^## Review Evidence Expectations$/m);
assert.match(happyPreflightArtifact.content, /^## Escalation Triggers$/m);
assert.match(happyPreflightArtifact.content, /^## Input Summary$/m);

const happyApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: happyContext.task.id,
});

assert.equal(happyApproval.allowedNextAction, 'builder-live-mutation');
assert.equal(happyApproval.targetArtifactId, happyBuilderPreflightResult.artifact.id);
assert.equal(happyApproval.targetRunId, happyBuilderPreflightResult.run.id);

const architectEscalationFetch = createQueuedFetch([
  createPlannerApiPayload('builder-preflight-architect-escalation'),
]);
const architectEscalationCoordinator = createLiveCoordinator(runtime, architectEscalationFetch.fetchImpl);
const architectEscalationContext = await runPlannerArchitectTaskBreakerForTask({
  coordinator: architectEscalationCoordinator,
  projectId: liveProject.id,
  queuedFetch: architectEscalationFetch,
  runtime,
  label: 'builder-preflight architect escalation',
  intent: 'Run builder-preflight live with a non-decision escalation back to architect.',
  scopeStatement: 'Verify builder-preflight can escalate to architect without creating a decision item.',
});
const architectEscalationAnchor = createBuilderPreflightAnchor(
  liveProject.id,
  architectEscalationContext.task.id,
  architectEscalationContext.planArtifact.id,
  architectEscalationContext.plannerResult.run.id,
  architectEscalationContext.architectureArtifact.id,
  architectEscalationContext.architectResult.run.id,
  architectEscalationContext.breakdownArtifact.id,
  architectEscalationContext.taskBreakerResult.run.id,
);

architectEscalationFetch.push(
  createBuilderPreflightApiPayload(architectEscalationAnchor, {
    providerRunId: 'resp-builder-preflight-architect-escalation',
    artifact: {
      targetFiles: ['src/execution/execution-coordinator.js'],
      escalationTriggers: ['Escalate because the architecture boundary must be revisited.'],
    },
    normalizedResult: {
      blockers: ['The approved architecture boundary must be revisited before mutation planning.'],
      needsDecision: false,
      nextStage: 'architect',
      summary: 'Builder-preflight requires architect follow-up before approval request may proceed.',
      decisionTitle: '',
      decisionPrompt: '',
    },
  }),
);

const architectEscalationResult = await architectEscalationCoordinator.runBuilderPreflight({
  taskId: architectEscalationContext.task.id,
});

assert.equal(architectEscalationResult.run.summary.nextStage, 'architect');
assert.equal(architectEscalationResult.decisionInboxItem, null);

const blockedFetch = createQueuedFetch([
  createPlannerApiPayload('builder-preflight-human-gate'),
]);
const blockedCoordinator = createLiveCoordinator(runtime, blockedFetch.fetchImpl);
const blockedContext = await runPlannerArchitectTaskBreakerForTask({
  coordinator: blockedCoordinator,
  projectId: liveProject.id,
  queuedFetch: blockedFetch,
  runtime,
  label: 'builder-preflight human gate path',
  intent: 'Run builder-preflight live with a blocked approval-request handoff.',
  scopeStatement: 'Verify builder-preflight live can raise one blocking decision item.',
});
const blockedAnchor = createBuilderPreflightAnchor(
  liveProject.id,
  blockedContext.task.id,
  blockedContext.planArtifact.id,
  blockedContext.plannerResult.run.id,
  blockedContext.architectureArtifact.id,
  blockedContext.architectResult.run.id,
  blockedContext.breakdownArtifact.id,
  blockedContext.taskBreakerResult.run.id,
);

blockedFetch.push(
  createBuilderPreflightApiPayload(blockedAnchor, {
    providerRunId: 'resp-builder-preflight-human-gate',
    artifact: {
      targetFiles: ['src/execution/execution-coordinator.js'],
      escalationTriggers: ['Resolve the blocking implementation choice before approval request.'],
    },
    normalizedResult: {
      blockers: ['An operator decision is required before builder live mutation approval may be requested.'],
      needsDecision: true,
      nextStage: 'human gate',
      summary: 'Builder-preflight found a blocking issue that must route through the human gate.',
      decisionTitle: 'Builder-preflight decision required',
      decisionPrompt: 'Resolve the blocked implementation choice before builder live mutation approval may continue.',
    },
  }),
);

const blockedBuilderPreflightResult = await blockedCoordinator.runBuilderPreflight({
  taskId: blockedContext.task.id,
});

assert.equal(blockedBuilderPreflightResult.run.summary.nextStage, 'human gate');
assert.equal(Boolean(blockedBuilderPreflightResult.decisionInboxItem), true);
assert.equal(countPendingDecisionItems(runtime.getSnapshot(), blockedContext.task.id), 1);
assert.equal(blockedBuilderPreflightResult.decisionInboxItem.kind, 'decision');
assert.equal(blockedBuilderPreflightResult.decisionInboxItem.sourceType, 'decision');
assert.equal(blockedBuilderPreflightResult.decisionInboxItem.blocksTask, true);

await assertBuilderPreflightFailure({
  errorPattern: /does not match current latest plan artifact/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight provenance mismatch',
  plannerResponse: createPlannerApiPayload('builder-preflight-provenance-fit'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: null,
  beforeRun: async ({ context, coordinator, queuedFetch }) => {
    queuedFetch.push(
      createPlannerApiPayload('builder-preflight-provenance-plan-refresh', {
        providerRunId: 'resp-planner-preflight-refresh',
      }),
    );
    await coordinator.runPlanner({
      taskId: context.task.id,
      routingOutcome: createRoutingOutcome(
        'Refresh the latest plan so the previously generated architecture and breakdown provenance become stale.',
      ),
    });
  },
  expectProviderInvocation: false,
});

await assertBuilderPreflightFailure({
  errorPattern: /structured output JSON is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight malformed json',
  plannerResponse: createPlannerApiPayload('builder-preflight-malformed-json'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: () =>
    createBuilderPreflightApiPayload(null, {
      rawOutputText: '{not-json',
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /artifact\.verificationPlan is required/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight missing required field',
  plannerResponse: createPlannerApiPayload('builder-preflight-missing-field'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: (anchor) =>
    createBuilderPreflightApiPayload(anchor, {
      rawOutputText: JSON.stringify({
        anchor,
        artifact: {
          targetFiles: ['src/execution/execution-coordinator.js'],
          intendedChanges: ['Keep the slice bounded.'],
          risks: ['Fail closed on stale provenance.'],
          reviewEvidenceExpectations: ['Capture a canonical preflight artifact.'],
          escalationTriggers: ['Escalate if the boundary changes.'],
        },
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'request-builder-live-mutation-approval',
          summary: 'Builder-preflight output is ready for approval request.',
          decisionTitle: '',
          decisionPrompt: '',
        },
      }),
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /anchor must exactly match/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight anchor mismatch',
  plannerResponse: createPlannerApiPayload('builder-preflight-anchor-mismatch'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: (anchor) =>
    createBuilderPreflightApiPayload(anchor, {
      anchor: {
        ...anchor,
        breakdownRunId: 'run-9999',
      },
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /repo-relative paths only/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight invalid path',
  plannerResponse: createPlannerApiPayload('builder-preflight-invalid-path'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: (anchor) =>
    createBuilderPreflightApiPayload(anchor, {
      artifact: {
        targetFiles: ['../outside.js'],
      },
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /nextStage is invalid for builder-preflight output/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight unsupported next action',
  plannerResponse: createPlannerApiPayload('builder-preflight-unsupported-next-action'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: (anchor) =>
    createBuilderPreflightApiPayload(anchor, {
      normalizedResult: {
        nextStage: 'reviewer',
      },
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /approved architecture allowlist/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight target outside architecture',
  plannerResponse: createPlannerApiPayload('builder-preflight-outside-allowlist'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: (anchor) =>
    createBuilderPreflightApiPayload(anchor, {
      artifact: {
        targetFiles: ['src/execution/providers/local-stub-adapter.js'],
      },
    }),
});

await assertBuilderPreflightFailure({
  errorPattern: /status 401/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight auth failure',
  plannerResponse: createPlannerApiPayload('builder-preflight-auth-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: () => ({
    status: 401,
    payload: {
      error: {
        message: 'Unauthorized',
      },
    },
  }),
});

await assertBuilderPreflightFailure({
  errorPattern: /status 429/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight quota failure',
  plannerResponse: createPlannerApiPayload('builder-preflight-quota-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: () => ({
    status: 429,
    payload: {
      error: {
        message: 'Rate limited',
      },
    },
  }),
});

await assertBuilderPreflightFailure({
  errorPattern: /timed out/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight timeout failure',
  plannerResponse: createPlannerApiPayload('builder-preflight-timeout-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: () => ({
    throwError: createAbortError(),
  }),
});

await assertBuilderPreflightFailure({
  errorPattern: /failed before a response was received/i,
  projectId: liveProject.id,
  runtime,
  label: 'builder-preflight network failure',
  plannerResponse: createPlannerApiPayload('builder-preflight-network-failure'),
  architectResponse: (anchor) => createArchitectApiPayload(anchor),
  taskBreakerResponse: (anchor) => createTaskBreakerApiPayload(anchor),
  builderPreflightResponse: () => ({
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
        approvalId: happyApproval.id,
        nextStage: happyBuilderPreflightResult.run.summary.nextStage,
        preflightArtifactId: happyBuilderPreflightResult.artifact.id,
      },
      architectEscalation: {
        nextStage: architectEscalationResult.run.summary.nextStage,
        preflightArtifactId: architectEscalationResult.artifact.id,
      },
      humanGate: {
        decisionInboxItemId: blockedBuilderPreflightResult.decisionInboxItem?.id || null,
        nextStage: blockedBuilderPreflightResult.run.summary.nextStage,
        preflightArtifactId: blockedBuilderPreflightResult.artifact.id,
      },
    },
    null,
    2,
  ),
);
