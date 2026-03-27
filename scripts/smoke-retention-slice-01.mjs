import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const {
  ARTIFACT_RETENTION_TIER,
  ARTIFACT_TYPE,
  RETENTION_CONSUMER_ACTION,
  RETENTION_CONSUMER_DISPOSITION,
} = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const serveUiSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

assert.match(serveUiSource, /\/api\/retention-consumer\/preview/);
assert.match(serveUiSource, /preview-retention-consumer/);
assert.match(serveUiSource, /previewRetentionConsumer/);

const runtimeRoot = path.join(repoRoot, 'var', 'runtime-retention-slice-01');
const projectRootOne = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-retention-project-a-'));
const projectRootTwo = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-retention-project-b-'));
const runtime = createRuntimeService({ runtimeRoot });

function createArtifact(runtimeService, taskId, role, type, content) {
  const run = runtimeService.startRun({
    taskId,
    kind: 'role',
    lifecycleState: 'In Progress',
    role,
  });
  const artifact = runtimeService.recordArtifact({
    content,
    runId: run.id,
    taskId,
    type,
  });

  runtimeService.completeRun({
    runId: run.id,
    summary: {
      artifactId: artifact.id,
      type,
    },
  });

  return artifact;
}

try {
  runtime.resetRuntime();

  const projectOne = runtime.createProject({
    name: 'retention-a',
    projectPath: projectRootOne,
  });
  const projectTwo = runtime.createProject({
    name: 'retention-b',
    projectPath: projectRootTwo,
  });

  const taskOne = runtime.createTask({
    intent: 'Inspect retention preview for one task with all three tiers present.',
    projectId: projectOne.id,
    title: 'retention task one',
  });
  const taskTwo = runtime.createTask({
    intent: 'Provide an extra Tier C artifact outside the scoped task.',
    projectId: projectTwo.id,
    title: 'retention task two',
  });

  const planArtifact = createArtifact(runtime, taskOne.id, 'planner', ARTIFACT_TYPE.PLAN, '# plan\n');
  const preflightArtifact = createArtifact(
    runtime,
    taskOne.id,
    'builder',
    ARTIFACT_TYPE.PREFLIGHT,
    '# preflight\n',
  );
  const outputArtifact = createArtifact(runtime, taskOne.id, 'system', ARTIFACT_TYPE.OUTPUT, 'plain output\n');
  const extraOutputArtifact = createArtifact(
    runtime,
    taskTwo.id,
    'system',
    ARTIFACT_TYPE.OUTPUT,
    'second output\n',
  );

  const preview = runtime.previewRetentionConsumer();

  assert.equal(preview.action, RETENTION_CONSUMER_ACTION.PREVIEW);
  assert.equal(preview.applyActionsImplemented, false);
  assert.equal(preview.explicitOperatorInvocationRequired, true);
  assert.equal(preview.hiddenCleanupAllowed, false);
  assert.equal(preview.summary.totalArtifacts, 4);
  assert.equal(preview.summary.protectedArtifacts, 1);
  assert.equal(preview.summary.inspectBeforeActionArtifacts, 1);
  assert.equal(preview.summary.cleanupCandidateArtifacts, 2);

  const planEntry = preview.artifacts.find((artifact) => artifact.id === planArtifact.id);
  const preflightEntry = preview.artifacts.find((artifact) => artifact.id === preflightArtifact.id);
  const outputEntry = preview.artifacts.find((artifact) => artifact.id === outputArtifact.id);
  const extraOutputEntry = preview.artifacts.find((artifact) => artifact.id === extraOutputArtifact.id);

  assert.ok(planEntry);
  assert.ok(preflightEntry);
  assert.ok(outputEntry);
  assert.ok(extraOutputEntry);

  assert.equal(planEntry.retentionTier, ARTIFACT_RETENTION_TIER.TIER_B);
  assert.equal(planEntry.consumerDisposition, RETENTION_CONSUMER_DISPOSITION.INSPECT_BEFORE_ACTION);
  assert.deepEqual(planEntry.futureEligibleActions, [RETENTION_CONSUMER_ACTION.ARCHIVE]);
  assert.equal(planEntry.pathExists, true);

  assert.equal(preflightEntry.retentionTier, ARTIFACT_RETENTION_TIER.TIER_A);
  assert.equal(preflightEntry.consumerDisposition, RETENTION_CONSUMER_DISPOSITION.PROTECTED);
  assert.deepEqual(preflightEntry.futureEligibleActions, []);
  assert.equal(preflightEntry.pathExists, true);

  assert.equal(outputEntry.retentionTier, ARTIFACT_RETENTION_TIER.TIER_C);
  assert.equal(outputEntry.consumerDisposition, RETENTION_CONSUMER_DISPOSITION.CLEANUP_CANDIDATE);
  assert.deepEqual(outputEntry.futureEligibleActions, [
    RETENTION_CONSUMER_ACTION.ARCHIVE,
    RETENTION_CONSUMER_ACTION.DELETE,
    RETENTION_CONSUMER_ACTION.GC,
  ]);

  const projectScopedPreview = runtime.previewRetentionConsumer({
    projectId: projectOne.id,
  });
  assert.equal(projectScopedPreview.summary.totalArtifacts, 3);
  assert.equal(
    projectScopedPreview.artifacts.some((artifact) => artifact.id === extraOutputArtifact.id),
    false,
  );

  const taskScopedPreview = runtime.previewRetentionConsumer({
    taskId: taskOne.id,
  });
  assert.equal(taskScopedPreview.summary.totalArtifacts, 3);
  assert.equal(
    taskScopedPreview.artifacts.some((artifact) => artifact.id === extraOutputArtifact.id),
    false,
  );

  assert.throws(
    () =>
      runtime.previewRetentionConsumer({
        projectId: projectTwo.id,
        taskId: taskOne.id,
      }),
    /does not belong to project/i,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        preview: {
          protectedArtifacts: preview.summary.protectedArtifacts,
          inspectBeforeActionArtifacts: preview.summary.inspectBeforeActionArtifacts,
          cleanupCandidateArtifacts: preview.summary.cleanupCandidateArtifacts,
          totalArtifacts: preview.summary.totalArtifacts,
        },
        scoped: {
          projectArtifacts: projectScopedPreview.summary.totalArtifacts,
          taskArtifacts: taskScopedPreview.summary.totalArtifacts,
        },
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(runtimeRoot, { force: true, recursive: true });
  fs.rmSync(projectRootOne, { force: true, recursive: true });
  fs.rmSync(projectRootTwo, { force: true, recursive: true });
}
