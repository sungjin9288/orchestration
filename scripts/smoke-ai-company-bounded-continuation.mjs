import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-bounded-continuation-smoke');
const runtimeRoot = path.join(tempRoot, 'runtime');
const statePath = path.join(runtimeRoot, 'state.json');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const MODE = 'ai-company-bounded-continuation-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function seedFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const result = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-acceptance-criterion-proof.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_ACCEPTANCE_PROOF_KEEP_FIXTURE: '1',
        ORCHESTRATION_ACCEPTANCE_PROOF_SEED_STAGE: 'reviewer-ready-proven',
        ORCHESTRATION_ACCEPTANCE_PROOF_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Failed to seed continuation fixture');
  }
}

function buildRequest(runtime, executionPlanId, overrides = {}) {
  const recovery = runtime.getExecutionPlanRecovery(executionPlanId);
  const checkpoint = recovery.checkpoint;
  const evaluatedAt = '2030-01-01T00:00:00.000Z';
  return {
    executionPlanId,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    action: recovery.nextAllowedActions[0],
    evaluatedAt,
    continuationSpec: {
      cancellationRequested: false,
      deadlineAt: '2030-01-01T00:05:00.000Z',
      maxSteps: 1,
      previousProgressDigest: null,
    },
    ...overrides,
  };
}

function main() {
  seedFixture();
  try {
    const runtime = createRuntimeService({
      runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    const snapshot = runtime.getSnapshot();
    const executionPlan = Object.values(snapshot.executionPlans)[0];
    const request = buildRequest(runtime, executionPlan.id);
    const before = fs.readFileSync(statePath);

    const ready = runtime.previewExecutionPlanContinuation(request);
    assert.equal(ready.status, 'continuation-ready');
    assert.equal(ready.persisted, false);
    assert.equal(ready.nextStep.action, 'resume-reviewer');
    assert.equal(ready.nextStep.stepCount, 1);
    assert.equal(ready.authority.checkpointResumeAuthorized, false);
    assert.equal(ready.authority.backgroundSchedulingAllowed, false);
    assert.ok(Object.isFrozen(ready));
    assert.ok(Object.isFrozen(ready.progressEvidence));
    assert.deepEqual(runtime.previewExecutionPlanContinuation(request), ready);

    const noProgress = runtime.previewExecutionPlanContinuation({
      ...request,
      continuationSpec: {
        ...request.continuationSpec,
        previousProgressDigest: ready.progressDigest,
      },
    });
    assert.equal(noProgress.status, 'no-progress');
    assert.equal(noProgress.nextStep, null);
    assert.equal(noProgress.stopReason, 'progress-digest-unchanged');

    const cancelled = runtime.previewExecutionPlanContinuation({
      ...request,
      continuationSpec: {
        ...request.continuationSpec,
        cancellationRequested: true,
      },
    });
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(cancelled.nextStep, null);

    const deadlineExceeded = runtime.previewExecutionPlanContinuation({
      ...request,
      continuationSpec: {
        ...request.continuationSpec,
        deadlineAt: request.evaluatedAt,
      },
    });
    assert.equal(deadlineExceeded.status, 'deadline-exceeded');

    assert.throws(
      () => runtime.previewExecutionPlanContinuation({
        ...request,
        continuationSpec: { ...request.continuationSpec, maxSteps: 2 },
      }),
      /maxSteps must be exactly 1/,
    );
    assert.throws(
      () => runtime.previewExecutionPlanContinuation({ ...request, checkpointDigest: '0'.repeat(64) }),
      /checkpointDigest does not match/,
    );
    assert.throws(
      () => runtime.previewExecutionPlanContinuation({ ...request, action: 'resume-qa' }),
      /does not allow action/,
    );
    assert.deepEqual(fs.readFileSync(statePath), before);

    const resumed = runtime.resumeExecutionPlanFromCheckpoint(request);
    assert.equal(resumed.resumeStage, 'reviewer');
    assert.equal(resumed.idempotent, false);
    assert.equal(
      resumed.workOrders.find((workOrder) => workOrder.role === 'reviewer').status,
      'active',
    );

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: snapshot.schemaVersion,
      statuses: ['continuation-ready', 'no-progress', 'cancelled', 'deadline-exceeded'],
      progressDigestBoundTo: [
        'checkpointDigest',
        'sourceDigest',
        'completedUnitRefs',
        'artifactRefs',
      ],
      responseOnlyBytesStable: true,
      boundedStepCount: 1,
      existingResumeAuthorityRechecked: true,
      blocked: ['background-scheduling', 'automatic-retry', 'active-mutation-replay'],
    }, null, 2));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main();
