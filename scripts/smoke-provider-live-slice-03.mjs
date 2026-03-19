import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-live-slice-03');
const apiKeyVar = 'OPENAI_API_KEY';
const apiKey = process.env[apiKeyVar] || '';
const model = process.env.OPENAI_RESPONSES_MODEL || '';
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

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-provider-live-slice-03-'));
  fs.writeFileSync(path.join(projectPath, 'README.md'), '# provider-live-slice-03\n', 'utf8');
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

if (!apiKey || !model) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        skipped: true,
        reason: 'OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'provider-live-slice-03',
  projectPath: createFixtureProject(),
  provider: {
    adapter: 'openai-responses',
    mode: 'live',
    model,
    env: {
      apiKeyVar,
    },
  },
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'provider live slice 03 planner + architect smoke',
  intent: 'Run explicit planner and architect live invocations through openai-responses.',
});
const coordinator = createExecutionCoordinator({
  repoRoot,
  runtimeService: runtime,
  sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
  architectCodeContextPaths: CODE_CONTEXT_PATHS,
});

const readiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
});
const architectReadiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'architect',
});
const taskBreakerReadiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'task-breaker',
});
const builderPreflightReadiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'builder-preflight',
});
const reviewerReadiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
  role: 'reviewer',
});

assert.equal(readiness.allowed, true);
assert.equal(readiness.readiness, 'ready');
assert.equal(readiness.adapter, 'openai-responses');
assert.equal(architectReadiness.readiness, 'ready');
assert.equal(architectReadiness.allowed, true);
assert.equal(taskBreakerReadiness.readiness, 'ready');
assert.equal(builderPreflightReadiness.readiness, 'ready');
assert.equal(reviewerReadiness.readiness, 'degraded');
assert.equal(taskBreakerReadiness.allowed, true);
assert.equal(builderPreflightReadiness.allowed, true);
assert.equal(reviewerReadiness.allowed, false);

const plannerResult = await coordinator.runPlanner({
  taskId: task.id,
  routingOutcome: createRoutingOutcome(
    'Validate the optional real planner plus architect live path without widening downstream live execution.',
  ),
});
const architectResult = await coordinator.runArchitect({
  taskId: task.id,
});
const snapshot = runtime.getSnapshot();

assert.equal(plannerResult.run.summary.adapter, 'openai-responses');
assert.ok(plannerResult.run.summary.providerRunId);
assert.equal(architectResult.run.summary.adapter, 'openai-responses');
assert.ok(architectResult.run.summary.providerRunId);
assert.equal(architectResult.run.summary.inputArtifactId, plannerResult.artifact.id);
assert.equal(architectResult.run.summary.inputRunId, plannerResult.run.id);
assert.ok(['task-breaker', 'human gate'].includes(architectResult.run.summary.nextStage));
assert.equal(plannerResult.artifact.type, 'plan');
assert.equal(architectResult.artifact.type, 'architecture');
assert.equal(runtime.getProject(project.id).provider.model, model);

if (architectResult.run.summary.nextStage === 'human gate') {
  assert.ok(architectResult.decisionInboxItem);
} else {
  assert.equal(architectResult.decisionInboxItem, null);
}

assertSecretAbsent(JSON.stringify(snapshot), apiKey, 'snapshot payload');

for (const run of Object.values(snapshot.runs)) {
  const logs = runtime.getLogs(run.id);
  assertSecretAbsent(JSON.stringify(logs), apiKey, `logs ${run.id}`);
}

for (const artifact of Object.values(snapshot.artifacts)) {
  const payload = runtime.getArtifact(artifact.id);
  assertSecretAbsent(JSON.stringify(payload), apiKey, `artifact ${artifact.id}`);
}

const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, apiKey);
assert.deepEqual(runtimeSecretMatches, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      projectId: project.id,
      plannerRunId: plannerResult.run.id,
      planArtifactId: plannerResult.artifact.id,
      architectRunId: architectResult.run.id,
      architectureArtifactId: architectResult.artifact.id,
      architectNextStage: architectResult.run.summary.nextStage,
      decisionInboxItemId: architectResult.decisionInboxItem?.id || null,
      readiness: {
        architect: architectReadiness.readiness,
        planner: readiness.readiness,
        reviewer: reviewerReadiness.readiness,
        taskBreaker: taskBreakerReadiness.readiness,
      },
    },
    null,
    2,
  ),
);
