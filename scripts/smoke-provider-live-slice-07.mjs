import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import openaiResponsesAdapterModule from '../src/execution/providers/openai-responses-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS } = openaiResponsesAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-live-slice-07');
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
const ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/execution/provider-adapter.js',
];
const BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/execution/provider-adapter.js',
];
const failureContext = {
  approvalId: null,
  preflightArtifactId: null,
  projectId: null,
  runtimeRoot,
  taskId: null,
};

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFixtureFile(projectPath, relativePath) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(projectPath, relativePath);
  ensureParentDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
}

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-provider-live-slice-07-'));
  const fixtureFiles = [...new Set([...ARCHITECT_CODE_CONTEXT_PATHS, ...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS])];

  for (const relativePath of fixtureFiles) {
    copyFixtureFile(projectPath, relativePath);
  }

  fs.writeFileSync(path.join(projectPath, 'README.md'), '# provider-live-slice-07\n', 'utf8');
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

const stageTimings = [];

async function runStage(stage, fn) {
  const startedAt = Date.now();

  try {
    const result = await fn();

    stageTimings.push({
      durationMs: Date.now() - startedAt,
      stage,
      status: 'ok',
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const contextSuffix = Object.entries(failureContext)
      .filter(([, value]) => value)
      .map(([key, value]) => `[${key}=${value}]`)
      .join(' ');

    stageTimings.push({
      durationMs,
      stage,
      status: 'error',
    });
    error.message =
      `${error.message} [stage=${stage}] [durationMs=${durationMs}] [stageTimings=${JSON.stringify(stageTimings)}]` +
      (contextSuffix ? ` ${contextSuffix}` : '');
    throw error;
  }
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

try {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const project = runtime.createProject({
    name: 'provider-live-slice-07',
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
  failureContext.projectId = project.id;
  const task = runtime.createTask({
    projectId: project.id,
    title: 'provider live slice 07 builder live mutation smoke',
    intent:
      'Run planner, architect, task-breaker, builder-preflight, approval, builder-live-mutation, and reviewer live for provider-slice-07. Make one bounded non-behavioral smoke annotation update inside src/runtime/contracts.js only, keep src/execution/provider-adapter.js unchanged unless strictly required for contract alignment, preserve exact preflight plus approval provenance, save one atomic change-summary plus patch plus diff bundle, and keep commit-package, local commit, release-package, and close-out as explicit downstream local steps.',
  });
  failureContext.taskId = task.id;
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
    builderPreflightCodeContextPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  });

  const plannerReadiness = coordinator.getProviderExecutionReadiness({
    projectId: project.id,
    role: 'planner',
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
  const builderLiveMutationReadiness = coordinator.getProviderExecutionReadiness({
    projectId: project.id,
    role: 'builder-live-mutation',
  });
  const reviewerReadiness = coordinator.getProviderExecutionReadiness({
    projectId: project.id,
    role: 'reviewer',
  });

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

  const plannerResult = await runStage('planner', () =>
    coordinator.runPlanner({
      taskId: task.id,
      routingOutcome: createRoutingOutcome(
        'Verify the optional real live builder-live-mutation plus reviewer path for provider-slice-07 by applying one bounded non-behavioral smoke annotation update inside src/runtime/contracts.js while keeping commit, release, and close-out semantics unchanged.',
      ),
    }),
  );
  const architectResult = await runStage('architect', () =>
    coordinator.runArchitect({
      taskId: task.id,
    }),
  );
  const taskBreakerResult = await runStage('task-breaker', () =>
    coordinator.runTaskBreaker({
      taskId: task.id,
    }),
  );
  const builderPreflightResult = await runStage('builder-preflight', () =>
    coordinator.runBuilderPreflight({
      taskId: task.id,
    }),
  );
  failureContext.preflightArtifactId = builderPreflightResult.artifact.id;

  assert.equal(plannerResult.run.summary.adapter, 'openai-responses');
  assert.equal(architectResult.run.summary.adapter, 'openai-responses');
  assert.equal(taskBreakerResult.run.summary.adapter, 'openai-responses');
  assert.equal(builderPreflightResult.run.summary.adapter, 'openai-responses');
  assert.equal(builderPreflightResult.run.summary.nextStage, 'request-builder-live-mutation-approval');

  const approval = runtime.requestBuilderLiveMutationApproval({
    taskId: task.id,
  });
  failureContext.approvalId = approval.id;

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: 'Approve optional real live builder mutation smoke.',
  });

  const builderLiveMutationResult = await runStage('builder-live-mutation', () =>
    coordinator.runBuilderLiveMutation({
      taskId: task.id,
    }),
  );
  const reviewerResult = await runStage('reviewer', () =>
    coordinator.runReviewer({
      taskId: task.id,
    }),
  );
  const consumedApproval = runtime.getApproval(approval.id);
  const snapshot = runtime.getSnapshot();

  assert.equal(builderLiveMutationResult.run.summary.adapter, 'openai-responses');
  assert.ok(builderLiveMutationResult.run.summary.providerRunId);
  assert.equal(builderLiveMutationResult.run.summary.preflightArtifactId, builderPreflightResult.artifact.id);
  assert.equal(builderLiveMutationResult.run.summary.preflightRunId, builderPreflightResult.run.id);
  assert.equal(builderLiveMutationResult.run.summary.approvalId, approval.id);
  assert.ok(builderLiveMutationResult.artifacts.changeSummary.id);
  assert.ok(builderLiveMutationResult.artifacts.patch.id);
  assert.ok(builderLiveMutationResult.artifacts.diff.id);
  assert.ok(Array.isArray(builderLiveMutationResult.changedFiles));
  assert.ok(builderLiveMutationResult.changedFiles.length > 0);
  assert.equal(consumedApproval.metadata.consumedByRunId, builderLiveMutationResult.run.id);
  assert.ok(consumedApproval.metadata.consumedAt);
  assert.equal(
    runtime.getTaskGuardSummary(task.id).builderLiveMutation.latestApprovalDisplayStatus,
    'consumed',
  );
  assert.equal(reviewerResult.run.summary.adapter, 'openai-responses');
  assert.ok(reviewerResult.run.summary.providerRunId);
  assert.ok(reviewerResult.artifact.id);
  assert.ok(['pass', 'fail', 'changes_requested'].includes(reviewerResult.run.summary.rawVerdict));
  assert.ok(['passed', 'changes_requested'].includes(reviewerResult.run.summary.mappedReviewStatus));
  assert.ok(['builder', 'architect', 'human gate'].includes(reviewerResult.run.summary.nextStage));
  assert.equal(reviewerResult.run.summary.sourceRunId, builderLiveMutationResult.run.id);
  assert.equal(countArtifacts(snapshot, task.id, 'review'), 1);
  assert.equal(countArtifacts(snapshot, task.id, 'commit-package'), 0);
  await assert.rejects(
    () => coordinator.runReviewer({ taskId: task.id }),
    (error) =>
      error.statusCode === 409 &&
      /Terminal reviewer run .* already exists for builder live mutation run/i.test(error.message),
  );

  assertSecretAbsent(JSON.stringify(snapshot), apiKey, 'snapshot payload');

  for (const run of Object.values(snapshot.runs)) {
    const logs = runtime.getLogs(run.id);
    assertSecretAbsent(JSON.stringify(logs), apiKey, `logs ${run.id}`);
  }

  for (const artifact of Object.values(snapshot.artifacts)) {
    const artifactPayload = runtime.getArtifact(artifact.id);
    assertSecretAbsent(JSON.stringify(artifactPayload), apiKey, `artifact ${artifact.id}`);
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
        architectRunId: architectResult.run.id,
        taskBreakerRunId: taskBreakerResult.run.id,
        builderPreflightRunId: builderPreflightResult.run.id,
        builderLiveMutationRunId: builderLiveMutationResult.run.id,
        reviewerRunId: reviewerResult.run.id,
        reviewArtifactId: reviewerResult.artifact.id,
        reviewerRawVerdict: reviewerResult.run.summary.rawVerdict,
        reviewerMappedStatus: reviewerResult.run.summary.mappedReviewStatus,
        stageTimings,
        timeoutBudgetMs: {
          providerRequest: DEFAULT_OPENAI_RESPONSES_TIMEOUT_MS,
        },
        changedFiles: builderLiveMutationResult.changedFiles,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (!String(error.message || '').includes('[stageTimings=')) {
    error.message = `${error.message} [stageTimings=${JSON.stringify(stageTimings)}]`;
  }
  throw error;
}
