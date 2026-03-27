import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const {
  ARTIFACT_TYPE,
  RETENTION_CONSUMER_ACTION,
  RETENTION_CONSUMER_STATUS,
} = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const serveUiSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

assert.match(serveUiSource, /\/api\/retention-consumer\/apply/);
assert.match(serveUiSource, /apply-retention-consumer/);
assert.match(serveUiSource, /applyRetentionConsumer/);

const runtimeRoot = path.join(repoRoot, 'var', 'runtime-retention-slice-02');
const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-retention-apply-'));
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

function assertPathContains(artifactPath, segment) {
  assert.match(artifactPath, new RegExp(`[\\\\/]${segment}[\\\\/]`));
}

try {
  runtime.resetRuntime();

  const project = runtime.createProject({
    name: 'retention-apply',
    projectPath: projectRoot,
  });
  const task = runtime.createTask({
    intent: 'Apply explicit retention actions without weakening provenance protection.',
    projectId: project.id,
    title: 'retention apply task',
  });

  const planArtifact = createArtifact(runtime, task.id, 'planner', ARTIFACT_TYPE.PLAN, '# plan\n');
  const preflightArtifact = createArtifact(
    runtime,
    task.id,
    'builder',
    ARTIFACT_TYPE.PREFLIGHT,
    '# preflight\n',
  );
  const outputArtifact = createArtifact(
    runtime,
    task.id,
    'system',
    ARTIFACT_TYPE.OUTPUT,
    'tier-c output\n',
  );
  const outputArtifactTwo = createArtifact(
    runtime,
    task.id,
    'system',
    ARTIFACT_TYPE.OUTPUT,
    'tier-c output two\n',
  );

  const initialPreview = runtime.previewRetentionConsumer({ taskId: task.id });
  const initialOutputEntry = initialPreview.artifacts.find((artifact) => artifact.id === outputArtifact.id);

  assert.deepEqual(initialOutputEntry.availableActions, [
    RETENTION_CONSUMER_ACTION.ARCHIVE,
    RETENTION_CONSUMER_ACTION.DELETE,
  ]);

  const archiveResult = runtime.applyRetentionConsumer({
    action: RETENTION_CONSUMER_ACTION.ARCHIVE,
    artifactIds: [planArtifact.id, outputArtifact.id],
    projectId: project.id,
    taskId: task.id,
  });

  assert.equal(archiveResult.action, RETENTION_CONSUMER_ACTION.ARCHIVE);
  assert.equal(archiveResult.applyActionsImplemented, true);
  assert.deepEqual(archiveResult.affectedArtifactIds, [planArtifact.id, outputArtifact.id]);

  const archivedPlan = archiveResult.artifacts.find((artifact) => artifact.id === planArtifact.id);
  const archivedOutput = archiveResult.artifacts.find((artifact) => artifact.id === outputArtifact.id);

  assert.equal(archivedPlan.retentionStatus, RETENTION_CONSUMER_STATUS.ARCHIVED);
  assert.equal(archivedOutput.retentionStatus, RETENTION_CONSUMER_STATUS.ARCHIVED);
  assert.equal(archivedPlan.contentAvailable, true);
  assert.equal(archivedOutput.contentAvailable, true);
  assertPathContains(archivedPlan.path, 'archive');
  assertPathContains(archivedOutput.path, 'archive');
  assert.deepEqual(archivedPlan.availableActions, []);
  assert.deepEqual(archivedOutput.availableActions, [RETENTION_CONSUMER_ACTION.DELETE]);

  assert.throws(
    () =>
      runtime.applyRetentionConsumer({
        action: RETENTION_CONSUMER_ACTION.DELETE,
        artifactIds: [preflightArtifact.id],
        projectId: project.id,
        taskId: task.id,
      }),
    /does not allow retention action delete/i,
  );

  assert.throws(
    () =>
      runtime.applyRetentionConsumer({
        action: RETENTION_CONSUMER_ACTION.GC,
        artifactIds: [outputArtifactTwo.id],
        projectId: project.id,
        taskId: task.id,
      }),
    /does not allow retention action gc/i,
  );

  const deleteResult = runtime.applyRetentionConsumer({
    action: RETENTION_CONSUMER_ACTION.DELETE,
    artifactIds: [outputArtifact.id],
    projectId: project.id,
    taskId: task.id,
  });
  const deletedOutput = deleteResult.artifacts.find((artifact) => artifact.id === outputArtifact.id);

  assert.equal(deletedOutput.retentionStatus, RETENTION_CONSUMER_STATUS.DELETED);
  assert.equal(deletedOutput.contentAvailable, true);
  assertPathContains(deletedOutput.path, 'deleted');
  assert.deepEqual(deletedOutput.availableActions, [RETENTION_CONSUMER_ACTION.GC]);

  const deletedArtifactDetail = runtime.getArtifact(outputArtifact.id);
  assert.equal(deletedArtifactDetail.contentAvailable, true);
  assert.equal(deletedArtifactDetail.content, 'tier-c output\n');

  const gcResult = runtime.applyRetentionConsumer({
    action: RETENTION_CONSUMER_ACTION.GC,
    artifactIds: [outputArtifact.id],
    projectId: project.id,
    taskId: task.id,
  });
  const gcOutput = gcResult.artifacts.find((artifact) => artifact.id === outputArtifact.id);

  assert.equal(gcOutput.retentionStatus, RETENTION_CONSUMER_STATUS.GC);
  assert.equal(gcOutput.contentAvailable, false);
  assert.equal(gcOutput.pathExists, false);
  assert.deepEqual(gcOutput.availableActions, []);

  const gcArtifactDetail = runtime.getArtifact(outputArtifact.id);
  assert.equal(gcArtifactDetail.contentAvailable, false);
  assert.equal(gcArtifactDetail.content, null);
  assert.match(
    gcArtifactDetail.contentUnavailableReason,
    /garbage-collected by the explicit retention consumer/i,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        retention: {
          archivedArtifacts: gcResult.summary.archivedArtifacts,
          deletedArtifacts: gcResult.summary.deletedArtifacts,
          gcArtifacts: gcResult.summary.gcArtifacts,
          protectedArtifacts: gcResult.summary.protectedArtifacts,
          totalArtifacts: gcResult.summary.totalArtifacts,
        },
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(runtimeRoot, { force: true, recursive: true });
  fs.rmSync(projectRoot, { force: true, recursive: true });
}
