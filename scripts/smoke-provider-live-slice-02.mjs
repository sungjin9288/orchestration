import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-live-slice-02');
const apiKeyVar = 'OPENAI_API_KEY';
const apiKey = process.env[apiKeyVar] || '';
const model = process.env.OPENAI_RESPONSES_MODEL || '';

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-provider-live-slice-02-'));
  fs.writeFileSync(path.join(projectPath, 'README.md'), '# provider-live-slice-02\n', 'utf8');
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
  name: 'provider-live-slice-02',
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
  title: 'provider live slice 02 planner smoke',
  intent: 'Run one explicit planner-only live invocation through openai-responses.',
});
const coordinator = createExecutionCoordinator({
  repoRoot,
  runtimeService: runtime,
});

const readiness = coordinator.getProviderExecutionReadiness({
  projectId: project.id,
});
assert.equal(readiness.allowed, true);
assert.equal(readiness.readiness, 'ready');
assert.equal(readiness.adapter, 'openai-responses');

const plannerResult = await coordinator.runPlanner({
  taskId: task.id,
  routingOutcome: createRoutingOutcome('Validate the optional real planner-only live path.'),
});
const snapshot = runtime.getSnapshot();

assert.equal(plannerResult.run.summary.adapter, 'openai-responses');
assert.ok(plannerResult.run.summary.providerRunId);
assert.equal(runtime.getProject(project.id).provider.model, model);
assert.equal(plannerResult.artifact.type, 'plan');
assert.doesNotMatch(JSON.stringify(snapshot), new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

for (const run of Object.values(snapshot.runs)) {
  const logs = runtime.getLogs(run.id);
  assert.doesNotMatch(
    JSON.stringify(logs),
    new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
}

for (const artifact of Object.values(snapshot.artifacts)) {
  const payload = runtime.getArtifact(artifact.id);
  assert.doesNotMatch(
    JSON.stringify(payload),
    new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
}

const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, apiKey);
assert.deepEqual(runtimeSecretMatches, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      projectId: project.id,
      runId: plannerResult.run.id,
      artifactId: plannerResult.artifact.id,
      providerRunId: plannerResult.run.summary.providerRunId,
      readiness: readiness.readiness,
    },
    null,
    2,
  ),
);
