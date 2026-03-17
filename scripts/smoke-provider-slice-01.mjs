import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
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

function createMalformedLiveProviderAdapter() {
  return {
    name: 'live-provider',
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
assert.match(appJsSource, /provider readiness:/);
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
  intent: 'Keep local-stub as the shipped default while adding explicit live opt-in plumbing.',
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
assert.equal(invalidReadiness.adapter, 'live-provider');
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

const degradedReadiness = localStubCoordinator.getProviderExecutionReadiness({
  projectId: project.id,
});
const degradedRunCountBefore = countRuns(runtime.getSnapshot(), task.id);
const degradedArtifactCountBefore = countArtifacts(runtime.getSnapshot(), task.id);

assert.equal(degradedReadiness.readiness, 'degraded');
assert.equal(degradedReadiness.allowed, false);
assert.match(degradedReadiness.reasons.join('; '), /disabled in provider-slice-01/i);

await assert.rejects(
  () =>
    localStubCoordinator.runPlanner({
      taskId: task.id,
      routingOutcome: createRoutingOutcome(
        'Fail closed without silently falling back to local-stub when live mode is disabled.',
      ),
    }),
  /disabled in provider-slice-01/i,
);

assert.equal(countRuns(runtime.getSnapshot(), task.id), degradedRunCountBefore);
assert.equal(countArtifacts(runtime.getSnapshot(), task.id), degradedArtifactCountBefore);

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
        'Reject malformed live-provider adapter responses after readiness passes.',
      ),
    }),
  /outputText is required/i,
);

const malformedSnapshot = runtime.getSnapshot();
const malformedRun =
  Object.values(malformedSnapshot.runs)
    .filter((run) => run.taskId === task.id)
    .sort((left, right) => (right.startedAt || '').localeCompare(left.startedAt || ''))[0] || null;
const malformedLogs = malformedRun ? runtime.getLogs(malformedRun.id) : [];

assert.equal(countRuns(malformedSnapshot, task.id), malformedRunCountBefore + 1);
assert.equal(countArtifacts(malformedSnapshot, task.id, 'plan'), malformedPlanArtifactCountBefore);
assert.equal(malformedRun?.summary?.error, 'Provider adapter response outputText is required');
assert.match(
  malformedLogs.map((entry) => entry.message).join('\n'),
  /invoking provider adapter live-provider/i,
);
assert.doesNotMatch(
  malformedLogs.map((entry) => entry.message).join('\n'),
  /local-stub/i,
);

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
      degradedReadiness: degradedReadiness.readiness,
      malformedRunId: malformedRun?.id || null,
    },
    null,
    2,
  ),
);
