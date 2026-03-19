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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-02');
const sentinelSecret = 'provider-slice-02-secret-sentinel';
const liveProviderEnvVar = 'OPENAI_API_KEY';

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

function createStructuredPlannerText({ artifactMarkdown, normalizedResult = {} }) {
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

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify provider-slice-02 planner live execution.

## Intended Outcome
Run planner through openai-responses and persist a plan artifact.

## Acceptance Target
- planner live invocation works
- outputText parsing is stable
- downstream live roles beyond planner and architect stay disabled

## Verification Approach
- synthetic smoke only

## Dependencies and Blockers
- none

## Expected Artifacts
- plan

## Worktree Need
No.

## Non-Goals
- task-breaker live execution
- builder live execution
- reviewer live execution
`;
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

function createQueuedFetch(responses) {
  const queue = [...responses];
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

    if (next.throwError) {
      throw next.throwError;
    }

    return createResponse(next.status ?? 200, next.payload ?? {});
  }

  return {
    calls,
    fetchImpl,
  };
}

function assertSecretAbsent(value, secret, label) {
  assert.doesNotMatch(String(value || ''), new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
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

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const localStubCoordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const defaultProject = runtime.createProject({
  name: 'provider-slice-02-default',
  projectPath: createFixtureProject('default'),
});
const defaultTask = runtime.createTask({
  projectId: defaultProject.id,
  title: 'provider-slice-02 local default smoke',
  intent: 'Keep local-stub as the shipped default while retaining planner live regression coverage.',
});

assert.equal(runtime.getProject(defaultProject.id).provider.mode, 'local-stub');
assert.equal(runtime.getProject(defaultProject.id).provider.adapter, 'local-stub');

const defaultReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: defaultProject.id,
});

assert.equal(defaultReadiness.mode, 'local-stub');
assert.equal(defaultReadiness.adapter, 'local-stub');
assert.equal(defaultReadiness.readiness, 'ready');
assert.equal(defaultReadiness.allowed, true);
assert.deepEqual(defaultReadiness.reasons, []);

const localPlannerResult = await localStubCoordinator.runPlanner({
  taskId: defaultTask.id,
  routingOutcome: createRoutingOutcome('Verify local-stub stays the default execution adapter.'),
});

assert.equal(localPlannerResult.run.summary.adapter, 'local-stub');
assert.equal(countArtifacts(runtime.getSnapshot(), defaultTask.id, 'plan'), 1);

const liveProject = runtime.createProject({
  name: 'provider-slice-02-live',
  projectPath: createFixtureProject('live'),
});
const invalidTask = runtime.createTask({
  projectId: liveProject.id,
  title: 'provider-slice-02 invalid config smoke',
  intent: 'Fail closed when live config is incomplete.',
});

runtime.setProjectProviderConfig({
  projectId: liveProject.id,
  provider: {
    adapter: 'live-provider',
    mode: 'live',
  },
});

const invalidProjectConfig = runtime.getProject(liveProject.id).provider;
const invalidReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
});
const invalidRunCountBefore = countRuns(runtime.getSnapshot(), invalidTask.id);

assert.equal(invalidProjectConfig.adapter, 'openai-responses');
assert.equal(invalidReadiness.adapter, 'openai-responses');
assert.equal(invalidReadiness.readiness, 'not-configured');
assert.equal(invalidReadiness.allowed, false);
assert.match(invalidReadiness.reasons.join('; '), /model is required/i);
assert.match(invalidReadiness.reasons.join('; '), /apiKey env var is required/i);

await assert.rejects(
  () =>
    localStubCoordinator.runPlanner({
      taskId: invalidTask.id,
      routingOutcome: createRoutingOutcome('Fail closed when live mode is missing config.'),
    }),
  /model is required/i,
);

assert.equal(countRuns(runtime.getSnapshot(), invalidTask.id), invalidRunCountBefore);

process.env[liveProviderEnvVar] = sentinelSecret;

const topLevelPlannerText = createStructuredPlannerText({
  artifactMarkdown: createPlannerArtifactMarkdown('top-level-output-text'),
});
const aggregatePlannerText = createStructuredPlannerText({
  artifactMarkdown: createPlannerArtifactMarkdown('aggregated-output-text'),
});
const malformedOutputText = JSON.stringify({
  normalizedResult: {
    blockers: [],
    needsDecision: false,
    nextStage: 'architect',
    summary: 'missing artifact markdown',
    decisionTitle: '',
    decisionPrompt: '',
  },
});
const queuedFetch = createQueuedFetch([
  {
    payload: {
      id: 'resp-top-level',
      model: 'gpt-4.1',
      output_text: topLevelPlannerText,
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: '{"artifactMarkdown":"wrong"}' }],
        },
      ],
      usage: {
        input_tokens: 12,
        output_tokens: 34,
        total_tokens: 46,
      },
    },
  },
  {
    payload: {
      id: 'resp-aggregate',
      model: 'gpt-4.1-mini',
      output: [
        {
          type: 'reasoning',
          content: [],
        },
        {
          type: 'message',
          content: [{ type: 'output_text', text: aggregatePlannerText }],
        },
      ],
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
      },
    },
  },
  {
    payload: {
      id: 'resp-malformed',
      model: 'gpt-4.1-mini',
      output_text: malformedOutputText,
      usage: {
        input_tokens: 5,
        output_tokens: 6,
        total_tokens: 11,
      },
    },
  },
]);
const liveCoordinator = createExecutionCoordinator({
  liveProviderAdapter: createOpenAIResponsesProviderAdapter({
    fetchImpl: queuedFetch.fetchImpl,
  }),
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
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

const topLevelTask = runtime.createTask({
  projectId: liveProject.id,
  title: 'provider-slice-02 top-level output_text smoke',
  intent: 'Prefer response.output_text when it exists.',
});
const topLevelPlannerResult = await liveCoordinator.runPlanner({
  taskId: topLevelTask.id,
  routingOutcome: createRoutingOutcome('Run planner through openai-responses with top-level output_text.'),
});
const topLevelArtifact = runtime.getArtifact(topLevelPlannerResult.artifact.id);
const topLevelRequestBody = JSON.parse(queuedFetch.calls[0].body);

assert.equal(topLevelPlannerResult.run.summary.adapter, 'openai-responses');
assert.equal(topLevelPlannerResult.run.summary.providerRunId, 'resp-top-level');
assert.equal(
  topLevelArtifact.content.trim(),
  createPlannerArtifactMarkdown('top-level-output-text').trim(),
);
assert.equal(topLevelRequestBody.text.format.type, 'json_schema');
assert.equal(topLevelRequestBody.text.format.name, 'planner_artifact_response');
assert.equal(topLevelRequestBody.text.format.schema.type, 'object');
assert.equal(topLevelRequestBody.text.format.schema.properties.artifactMarkdown.type, 'string');
assert.equal(topLevelRequestBody.text.format.schema.properties.normalizedResult.type, 'object');
assert.match(String(topLevelRequestBody.instructions || ''), /Return JSON only/i);
assert.equal(
  queuedFetch.calls[0].headers.Authorization,
  `Bearer ${sentinelSecret}`,
);

const aggregateTask = runtime.createTask({
  projectId: liveProject.id,
  title: 'provider-slice-02 aggregate output_text smoke',
  intent: 'Aggregate output_text content from the output array when top-level output_text is absent.',
});
const aggregatePlannerResult = await liveCoordinator.runPlanner({
  taskId: aggregateTask.id,
  routingOutcome: createRoutingOutcome('Run planner through aggregated output content.'),
});
const aggregateArtifact = runtime.getArtifact(aggregatePlannerResult.artifact.id);

assert.equal(aggregatePlannerResult.run.summary.adapter, 'openai-responses');
assert.equal(aggregatePlannerResult.run.summary.providerRunId, 'resp-aggregate');
assert.equal(
  aggregateArtifact.content.trim(),
  createPlannerArtifactMarkdown('aggregated-output-text').trim(),
);

const architectReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'architect',
});
const taskBreakerReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'task-breaker',
});
const builderPreflightReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-preflight',
});
const builderLiveMutationReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-live-mutation',
});
const reviewerReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'reviewer',
});

assert.equal(architectReadiness.readiness, 'ready');
assert.equal(taskBreakerReadiness.readiness, 'ready');
assert.equal(builderPreflightReadiness.readiness, 'ready');
assert.equal(builderLiveMutationReadiness.readiness, 'degraded');
assert.equal(reviewerReadiness.readiness, 'degraded');
assert.equal(architectReadiness.allowed, true);
assert.equal(taskBreakerReadiness.allowed, true);
assert.equal(builderPreflightReadiness.allowed, true);
assert.equal(builderLiveMutationReadiness.allowed, false);
assert.equal(reviewerReadiness.allowed, false);
assert.deepEqual(architectReadiness.reasons, []);
assert.equal(taskBreakerReadiness.reasons.length, 0);
assert.equal(builderPreflightReadiness.reasons.length, 0);
assert.match(
  reviewerReadiness.reasons.join('; '),
  /planner, architect, task-breaker, and builder-preflight/i,
);

const malformedTask = runtime.createTask({
  projectId: liveProject.id,
  title: 'provider-slice-02 malformed response smoke',
  intent: 'Fail closed without creating artifacts when the live provider response is malformed.',
});
const malformedRunCountBefore = countRuns(runtime.getSnapshot(), malformedTask.id);
const malformedArtifactCountBefore = countArtifacts(runtime.getSnapshot(), malformedTask.id, 'plan');

await assert.rejects(
  () =>
    liveCoordinator.runPlanner({
      taskId: malformedTask.id,
      routingOutcome: createRoutingOutcome('Reject malformed structured output without artifacts.'),
    }),
  /artifactMarkdown is required/i,
);

const malformedSnapshot = runtime.getSnapshot();
const malformedTaskRuns = collectTaskRunErrors(runtime, malformedTask.id);

assert.equal(countRuns(malformedSnapshot, malformedTask.id), malformedRunCountBefore + 1);
assert.equal(countArtifacts(malformedSnapshot, malformedTask.id, 'plan'), malformedArtifactCountBefore);
assert.equal(
  malformedTaskRuns[0]?.error,
  'OpenAI Responses structured output artifactMarkdown is required',
);
assert.match(
  malformedTaskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
  /invoking provider adapter openai-responses/i,
);
assert.doesNotMatch(
  malformedTaskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
  /local-stub/i,
);

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
      localStubDefault: defaultReadiness.readiness,
      livePlannerAdapter: topLevelPlannerResult.run.summary.adapter,
      invalidReadiness: invalidReadiness.readiness,
      malformedRunId: malformedTaskRuns[0]?.id || null,
      liveRoleReadiness: [
        architectReadiness.readiness,
        taskBreakerReadiness.readiness,
        builderPreflightReadiness.readiness,
        builderLiveMutationReadiness.readiness,
        reviewerReadiness.readiness,
      ],
    },
    null,
    2,
  ),
);
