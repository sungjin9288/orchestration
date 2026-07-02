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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-01');
const sentinelSecret = 'provider-slice-01-secret-sentinel';
const liveProviderEnvVar = 'LIVE_PROVIDER_API_KEY';

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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSecretAbsent(value, secret, label) {
  assert.doesNotMatch(String(value || ''), new RegExp(escapeRegExp(secret)), label);
}

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify provider-slice-01 planner provider boundary behavior on the current contract.

## Intended Outcome
Keep local-stub as the shipped default while planner live execution flows through openai-responses.

## Acceptance Target
- local-stub remains the default adapter
- live mode fails closed without complete config
- planner is a supported live role on openai-responses
- non-allowlisted roles stay degraded and blocked

## Verification Approach
- synthetic provider smoke

## Dependencies and Blockers
- none

## Expected Artifacts
- plan

## Worktree Need
No.

## Non-Goals
- commit-package live execution
- release or close-out changes
`;
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
  };
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

function createMalformedLiveProviderAdapter() {
  return {
    name: 'openai-responses',
    getReadiness() {
      return {
        readiness: 'ready',
        allowed: true,
        reasons: [],
      };
    },
    async execute() {
      return {
        model: 'malformed-live-provider-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'architect',
          summary: 'malformed response',
        },
        providerRunId: 'malformed-live-provider-run',
      };
    },
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const serveUiSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);
const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');

assert.match(serveUiSource, /providerExecutionSummaries/);
assert.match(serveUiSource, /provider-config/);
assert.match(appJsSource, /update-project-provider/);
assert.match(appJsSource, /providerExecutionSummaries/);
assert.match(appJsSource, /providerSummary\.readiness/);
assert.match(appJsSource, /projectProviderMode/);

const localStubCoordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const project = runtime.createProject({
  name: 'provider-slice-01',
  projectPath: createFixtureProject('default'),
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'provider-slice-01 local default smoke',
  intent: 'Keep local-stub as the shipped default while validating explicit live opt-in plumbing.',
});

assert.equal(runtime.getProject(project.id).provider.mode, 'local-stub');
assert.equal(runtime.getProject(project.id).provider.adapter, 'local-stub');

const defaultReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: project.id,
});

assert.equal(defaultReadiness.mode, 'local-stub');
assert.equal(defaultReadiness.adapter, 'local-stub');
assert.equal(defaultReadiness.readiness, 'ready');
assert.equal(defaultReadiness.allowed, true);
assert.deepEqual(defaultReadiness.reasons, []);

const plannerResult = await localStubCoordinator.runPlanner({
  taskId: task.id,
  routingOutcome: createRoutingOutcome(
    'Verify that local-stub stays the default execution adapter.',
  ),
});

assert.equal(plannerResult.run.summary.adapter, 'local-stub');
assert.equal(countArtifacts(runtime.getSnapshot(), task.id, 'plan'), 1);

runtime.setProjectProviderConfig({
  projectId: project.id,
  provider: {
    mode: 'live',
  },
});

const invalidReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: project.id,
});
const invalidRunCountBefore = countRuns(runtime.getSnapshot(), task.id);
const invalidArtifactCountBefore = countArtifacts(runtime.getSnapshot(), task.id);

assert.equal(invalidReadiness.mode, 'live');
assert.equal(invalidReadiness.adapter, 'openai-responses');
assert.equal(invalidReadiness.readiness, 'not-configured');
assert.equal(invalidReadiness.allowed, false);
assert.match(invalidReadiness.reasons.join('; '), /model is required/i);
assert.match(invalidReadiness.reasons.join('; '), /apiKey env var is required/i);

await assert.rejects(
  () =>
    localStubCoordinator.runPlanner({
      taskId: task.id,
      routingOutcome: createRoutingOutcome(
        'Fail closed when live mode is missing the required config.',
      ),
    }),
  /model is required/i,
);

assert.equal(countRuns(runtime.getSnapshot(), task.id), invalidRunCountBefore);
assert.equal(countArtifacts(runtime.getSnapshot(), task.id), invalidArtifactCountBefore);

process.env[liveProviderEnvVar] = sentinelSecret;

runtime.setProjectProviderConfig({
  projectId: project.id,
  provider: {
    mode: 'live',
    model: 'operator-chosen-model',
    env: {
      apiKeyVar: liveProviderEnvVar,
    },
  },
});

assert.equal(runtime.getProject(project.id).provider.adapter, 'openai-responses');

const livePlannerArtifactMarkdown = createPlannerArtifactMarkdown('live-planner-boundary');
const queuedFetch = createQueuedFetch([
  {
    payload: {
      id: 'resp-provider-slice-01-planner',
      model: 'gpt-4.1-mini',
      output_text: createStructuredPlannerText({
        artifactMarkdown: livePlannerArtifactMarkdown,
      }),
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
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

const plannerLiveReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'planner',
});

assert.equal(plannerLiveReadiness.mode, 'live');
assert.equal(plannerLiveReadiness.adapter, 'openai-responses');
assert.equal(plannerLiveReadiness.readiness, 'ready');
assert.equal(plannerLiveReadiness.allowed, true);
assert.deepEqual(plannerLiveReadiness.reasons, []);

const blockedRoleReadiness = liveCoordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'commit-package',
});

assert.equal(blockedRoleReadiness.adapter, 'openai-responses');
assert.equal(blockedRoleReadiness.readiness, 'degraded');
assert.equal(blockedRoleReadiness.allowed, false);
assert.match(
  blockedRoleReadiness.reasons.join('; '),
  /limited to planner, architect, task-breaker, builder-preflight, builder-live-mutation, and reviewer/i,
);
assert.match(blockedRoleReadiness.reasons.join('; '), /commit-package remains blocked/i);

const liveTask = runtime.createTask({
  projectId: project.id,
  title: 'provider-slice-01 live planner boundary smoke',
  intent: 'Run planner live through openai-responses on the current role allowlist.',
});
const livePlannerResult = await liveCoordinator.runPlanner({
  taskId: liveTask.id,
  routingOutcome: createRoutingOutcome(
    'Run planner through openai-responses as a supported live role.',
  ),
});
const livePlanArtifact = runtime.getArtifact(livePlannerResult.artifact.id);
const livePlannerRequestBody = JSON.parse(queuedFetch.calls[0].body);

assert.equal(queuedFetch.calls.length, 1);
assert.equal(livePlannerResult.run.summary.adapter, 'openai-responses');
assert.equal(livePlannerResult.run.summary.providerRunId, 'resp-provider-slice-01-planner');
assert.equal(livePlanArtifact.content.trim(), livePlannerArtifactMarkdown.trim());
assert.equal(livePlannerRequestBody.model, 'operator-chosen-model');
assert.equal(livePlannerRequestBody.text.format.type, 'json_schema');
assert.equal(livePlannerRequestBody.text.format.name, 'planner_artifact_response');
assert.equal(queuedFetch.calls[0].headers.Authorization, `Bearer ${sentinelSecret}`);

const malformedCoordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  liveProviderAdapter: createMalformedLiveProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});
const malformedRunCountBefore = countRuns(runtime.getSnapshot(), task.id);
const malformedPlanArtifactCountBefore = countArtifacts(runtime.getSnapshot(), task.id, 'plan');

await assert.rejects(
  () =>
    malformedCoordinator.runPlanner({
      taskId: task.id,
      routingOutcome: createRoutingOutcome(
        'Reject malformed openai-responses adapter responses after readiness passes.',
      ),
    }),
  /outputText is required/i,
);

const malformedSnapshot = runtime.getSnapshot();
const malformedTaskRuns = collectTaskRunErrors(runtime, task.id);
const malformedRun = malformedTaskRuns[0] || null;

assert.equal(countRuns(malformedSnapshot, task.id), malformedRunCountBefore + 1);
assert.equal(countArtifacts(malformedSnapshot, task.id, 'plan'), malformedPlanArtifactCountBefore);
assert.equal(malformedRun?.error, 'Provider adapter response outputText is required');
assert.match(
  (malformedRun?.logs || []).map((entry) => entry.message).join('\n'),
  /invoking provider adapter openai-responses/i,
);
assert.doesNotMatch(
  (malformedRun?.logs || []).map((entry) => entry.message).join('\n'),
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

const secretMatches = scanFilesForSecret(runtimeRoot, sentinelSecret);

assert.deepEqual(secretMatches, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      projectId: project.id,
      taskId: task.id,
      defaultReadiness: defaultReadiness.readiness,
      invalidReadiness: invalidReadiness.readiness,
      plannerLiveReadiness: plannerLiveReadiness.readiness,
      blockedRoleReadiness: blockedRoleReadiness.readiness,
      livePlannerAdapter: livePlannerResult.run.summary.adapter,
      livePlannerRunId: livePlannerResult.run.summary.providerRunId,
      malformedRunId: malformedRun?.id || null,
    },
    null,
    2,
  ),
);
