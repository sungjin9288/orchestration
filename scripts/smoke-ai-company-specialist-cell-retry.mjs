import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeModule from '../src/runtime/runtime-service.js';
import retryCoordinatorModule from '../src/execution/specialist-cell-retry-coordinator.js';
import specialistCellAttemptModule from '../src/runtime/specialist-cell-attempts.js';
import {
  blueprintPath,
  buildPreviewRequest,
  buildStartRequest,
  completedQaOutcome,
  completedResearcherOutcome,
  projectPath,
  repoRoot,
  seedBoundCouncil,
  tempRoot,
  writeFixtureSources,
} from './smoke-ai-company-durable-specialist-batch.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const { assertCoordinatorInput } = retryCoordinatorModule;
const {
  computeInputDigest,
  computeSpecialistCellAttemptRecordDigest,
} = specialistCellAttemptModule;
const MODE = 'ai-company-specialist-cell-retry-smoke';
const keepFixture =
  process.env.ORCHESTRATION_SPECIALIST_CELL_RETRY_KEEP_FIXTURE === '1';
const port = 10020 + (process.pid % 20);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function setupFixture() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(projectPath, { recursive: true });
  fs.cpSync(path.join(repoRoot, 'company'), path.join(tempRoot, 'company'), {
    recursive: true,
  });
  for (const sourceRef of [
    'docs/48_ai-company-master-plan.md',
    'docs/49_agent-runtime-contract.md',
    'docs/52_ai-company-runtime-blueprint-implementation-plan.md',
  ]) {
    const targetPath = path.join(tempRoot, sourceRef);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, sourceRef), targetPath);
  }
  writeFixtureSources();
}

function downgradeStateToV20(statePath) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.schemaVersion = 20;
  delete state.sequences.specialistCellRetry;
  delete state.sequences.reworkPlan;
  delete state.specialistCellRetries;
  delete state.reworkPlans;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function buildRetryRequest(context, batch, sourceCellAttempt, options = {}) {
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const {
    councilSessionId: _councilSessionId,
    ...sourceRequest
  } = previewRequest;
  return {
    specialistBatchId: batch.id,
    request: {
      ...sourceRequest,
      expectedBatchRecordDigest: batch.recordDigest,
      expectedSourceCellAttemptRecordDigest: sourceCellAttempt.recordDigest,
      previewDigest: preview.previewDigest,
      previewId: preview.id,
      retryApproval: {
        decision: 'retry-failed-cell-once',
        acknowledgement:
          'retain-original-evidence-and-retry-exact-failed-cell-once',
        rationale:
          options.rationale ||
          'Retry the exact failed read-only specialist cell once.',
        reviewedAt: preview.evaluatedAt,
      },
      retryDeadlineMs:
        options.retryDeadlineMs ||
        Math.min(30000, sourceCellAttempt.cellDeadlineMs),
      sourceCellAttemptId: sourceCellAttempt.id,
      sourceDigest: preview.sourceDigest,
    },
    preview,
  };
}

async function createFailedBatch(name, runtimeOptions = {}) {
  writeFixtureSources();
  let qaCalls = 0;
  const runtimeRoot = path.join(tempRoot, name);
  const context = seedBoundCouncil({
    runtimeRoot,
    specialistResearcherRunner: async ({ cellAttempt }) =>
      completedResearcherOutcome(cellAttempt),
    specialistQaRunner: async (input) => {
      qaCalls += 1;
      if (qaCalls === 1) throw new Error('first-attempt-qa-failure');
      if (runtimeOptions.onRetryQa) {
        await runtimeOptions.onRetryQa(input);
      }
      return completedQaOutcome(input.inputDigest, input.inputPathDigests);
    },
    ...runtimeOptions.runtimeOptions,
  });
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const created = await context.runtime.startCouncilSpecialistBatch(
    buildStartRequest(previewRequest, preview),
  );
  assert.equal(created.specialistBatch.status, 'partial-failed');
  const sourceCellAttempt = created.specialistCellAttempts.find(
    (attempt) => attempt.status === 'failed',
  );
  const completedCellAttempt = created.specialistCellAttempts.find(
    (attempt) => attempt.status === 'completed',
  );
  return {
    batch: created.specialistBatch,
    completedCellAttempt,
    context,
    getQaCalls: () => qaCalls,
    runtimeRoot,
    sourceCellAttempt,
    statePath: path.join(runtimeRoot, 'state.json'),
  };
}

async function createResearcherFailedBatch(name, { retryFails = false } = {}) {
  writeFixtureSources();
  let researcherCalls = 0;
  const runtimeRoot = path.join(tempRoot, name);
  const context = seedBoundCouncil({
    runtimeRoot,
    specialistResearcherRunner: async ({ cellAttempt }) => {
      researcherCalls += 1;
      if (researcherCalls === 1 || retryFails) {
        return {
          status: 'failed',
          observedInputDigest: null,
          failureReason: 'runner-contract-failed',
        };
      }
      return completedResearcherOutcome(cellAttempt);
    },
    specialistQaRunner: async (input) =>
      completedQaOutcome(input.inputDigest, input.inputPathDigests),
  });
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const created = await context.runtime.startCouncilSpecialistBatch(
    buildStartRequest(previewRequest, preview),
  );
  const sourceCellAttempt = created.specialistCellAttempts.find(
    (attempt) => attempt.role === 'researcher',
  );
  assert.equal(sourceCellAttempt.status, 'failed');
  return {
    batch: created.specialistBatch,
    context,
    getResearcherCalls: () => researcherCalls,
    runtimeRoot,
    sourceCellAttempt,
    statePath: path.join(runtimeRoot, 'state.json'),
  };
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`UI server exited early: ${output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch {
      // The bounded local server is still starting.
    }
    await delay(50);
  }
  throw new Error(`UI server did not start: ${output}`);
}

async function requestApi(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

async function main() {
  setupFixture();

  let activeSaveObserved = false;
  let originalBatch;
  let originalAttempts;
  const primary = await createFailedBatch('retry-primary', {
    onRetryQa() {
      const state = JSON.parse(fs.readFileSync(primary.statePath, 'utf8'));
      const retry = Object.values(state.specialistCellRetries)[0];
      const retryAttempt = state.specialistCellAttempts[retry.retryCellAttemptId];
      assert.equal(state.schemaVersion, 25);
      assert.equal(retry.status, 'active');
      assert.equal(retryAttempt.status, 'active');
      assert.equal(retryAttempt.attemptNumber, 2);
      assert.deepEqual(state.specialistBatches[originalBatch.id], originalBatch);
      for (const attempt of originalAttempts) {
        assert.deepEqual(state.specialistCellAttempts[attempt.id], attempt);
      }
      const coordinatorInput = {
        retry,
        sourceCellAttempt:
          state.specialistCellAttempts[retry.sourceCellAttemptId],
        retryCellAttempt: retryAttempt,
        settle() {},
      };
      assert.doesNotThrow(() => assertCoordinatorInput(coordinatorInput));
      const mismatchedRetryAttempt = {
        ...retryAttempt,
        sourceDigest: '0'.repeat(64),
      };
      mismatchedRetryAttempt.recordDigest =
        computeSpecialistCellAttemptRecordDigest(mismatchedRetryAttempt);
      assert.throws(
        () =>
          assertCoordinatorInput({
            ...coordinatorInput,
            retryCellAttempt: mismatchedRetryAttempt,
          }),
        /lineage is invalid/,
      );
      activeSaveObserved = true;
    },
  });
  originalBatch = structuredClone(primary.batch);
  originalAttempts = primary.batch.cellAttemptIds.map((id) =>
    structuredClone(
      JSON.parse(fs.readFileSync(primary.statePath, 'utf8'))
        .specialistCellAttempts[id],
    ));
  downgradeStateToV20(primary.statePath);
  const v20Bytes = fs.readFileSync(primary.statePath);
  const retryInput = buildRetryRequest(
    primary.context,
    primary.batch,
    primary.sourceCellAttempt,
  );
  assert.deepEqual(fs.readFileSync(primary.statePath), v20Bytes);

  const created = await primary.context.runtime.retrySpecialistBatchCell({
    specialistBatchId: primary.batch.id,
    ...retryInput.request,
  });
  assert.equal(created.idempotent, false);
  assert.equal(created.specialistCellRetry.status, 'completed');
  assert.equal(created.specialistCellAttempt.status, 'completed');
  assert.equal(created.specialistCellAttempt.attemptNumber, 2);
  assert.equal(activeSaveObserved, true);
  assert.equal(primary.getQaCalls(), 2);

  const primaryState = JSON.parse(fs.readFileSync(primary.statePath, 'utf8'));
  assert.equal(primaryState.schemaVersion, 25);
  assert.equal(Object.keys(primaryState.specialistCellRetries).length, 1);
  assert.equal(Object.keys(primaryState.specialistCellAttempts).length, 3);
  assert.deepEqual(
    primaryState.specialistBatches[originalBatch.id],
    originalBatch,
  );
  for (const attempt of originalAttempts) {
    assert.deepEqual(primaryState.specialistCellAttempts[attempt.id], attempt);
  }
  const exact = primary.context.runtime.getSpecialistCellRetry(
    created.specialistCellRetry.id,
  );
  assert.deepEqual(exact.specialistCellRetry, created.specialistCellRetry);
  const located = primary.context.runtime.getSpecialistBatchCellRetry({
    specialistBatchId: primary.batch.id,
    sourceCellAttemptId: primary.sourceCellAttempt.id,
  });
  assert.equal(
    located.specialistCellRetry.id,
    created.specialistCellRetry.id,
  );
  const snapshot = primary.context.runtime.getSnapshot();
  assert.equal(Object.hasOwn(snapshot, 'specialistBatches'), false);
  assert.equal(Object.hasOwn(snapshot, 'specialistCellAttempts'), false);
  assert.equal(Object.hasOwn(snapshot, 'specialistCellRetries'), false);

  fs.writeFileSync(
    path.join(projectPath, 'src/runtime/runtime-service.js'),
    "'use strict';\nmodule.exports = { driftedAfterRetry: true };\n",
  );
  const replay = await primary.context.runtime.retrySpecialistBatchCell({
    specialistBatchId: primary.batch.id,
    ...retryInput.request,
  });
  assert.equal(replay.idempotent, true);
  assert.equal(replay.specialistCellRetry.id, created.specialistCellRetry.id);
  assert.equal(primary.getQaCalls(), 2);
  await assert.rejects(
    primary.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: primary.batch.id,
      ...retryInput.request,
      retryApproval: {
        ...retryInput.request.retryApproval,
        rationale: 'Divergent replay must fail closed.',
      },
    }),
    /different retry/,
  );
  const retryOfRetryInput = buildRetryRequest(
    primary.context,
    primary.batch,
    created.specialistCellAttempt,
  );
  await assert.rejects(
    primary.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: primary.batch.id,
      ...retryOfRetryInput.request,
    }),
    /failed first-attempt/,
  );

  const researcherPass = await createResearcherFailedBatch(
    'retry-researcher-pass',
  );
  const researcherPassInput = buildRetryRequest(
    researcherPass.context,
    researcherPass.batch,
    researcherPass.sourceCellAttempt,
  );
  const researcherPassed =
    await researcherPass.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: researcherPass.batch.id,
      ...researcherPassInput.request,
    });
  assert.equal(researcherPassed.specialistCellRetry.status, 'completed');
  assert.equal(
    researcherPassed.specialistCellAttempt.resultSummary.kind,
    'source-evidence-manifest',
  );
  assert.equal(researcherPass.getResearcherCalls(), 2);

  const researcherFail = await createResearcherFailedBatch(
    'retry-researcher-fail',
    { retryFails: true },
  );
  const researcherFailInput = buildRetryRequest(
    researcherFail.context,
    researcherFail.batch,
    researcherFail.sourceCellAttempt,
  );
  const researcherFailed =
    await researcherFail.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: researcherFail.batch.id,
      ...researcherFailInput.request,
    });
  assert.equal(researcherFailed.specialistCellRetry.status, 'failed');
  assert.equal(
    researcherFailed.specialistCellAttempt.failureReason,
    'runner-contract-failed',
  );
  assert.equal(researcherFail.getResearcherCalls(), 2);

  const qaFail = await createFailedBatch('retry-qa-fail', {
    onRetryQa() {
      throw new Error('retry-qa-failure');
    },
  });
  const qaFailInput = buildRetryRequest(
    qaFail.context,
    qaFail.batch,
    qaFail.sourceCellAttempt,
  );
  const qaFailed = await qaFail.context.runtime.retrySpecialistBatchCell({
    specialistBatchId: qaFail.batch.id,
    ...qaFailInput.request,
  });
  assert.equal(qaFailed.specialistCellRetry.status, 'failed');
  assert.equal(
    qaFailed.specialistCellAttempt.failureReason,
    'runner-contract-failed',
  );
  assert.equal(qaFail.getQaCalls(), 2);

  const eligibility = await createFailedBatch('retry-eligibility');
  const completedInput = buildRetryRequest(
    eligibility.context,
    eligibility.batch,
    eligibility.completedCellAttempt,
  );
  await assert.rejects(
    eligibility.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: eligibility.batch.id,
      ...completedInput.request,
    }),
    /failed first-attempt/,
  );
  const invalidDeadlineInput = buildRetryRequest(
    eligibility.context,
    eligibility.batch,
    eligibility.sourceCellAttempt,
    {
      retryDeadlineMs: eligibility.sourceCellAttempt.cellDeadlineMs + 1,
    },
  );
  await assert.rejects(
    eligibility.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: eligibility.batch.id,
      ...invalidDeadlineInput.request,
    }),
    /must not exceed/,
  );
  await assert.rejects(
    eligibility.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: eligibility.batch.id,
      ...buildRetryRequest(
        eligibility.context,
        eligibility.batch,
        eligibility.sourceCellAttempt,
      ).request,
      expectedBatchRecordDigest: '0'.repeat(64),
    }),
    /record digest is stale/,
  );
  await assert.rejects(
    eligibility.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: eligibility.batch.id,
      ...invalidDeadlineInput.request,
      retryApproval: {
        ...invalidDeadlineInput.request.retryApproval,
        acknowledgement: 'unsafe-shortcut',
      },
    }),
    /acknowledgement/,
  );
  await assert.rejects(
    eligibility.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: eligibility.batch.id,
      ...invalidDeadlineInput.request,
      extra: true,
    }),
    /unexpected or missing fields/,
  );
  assert.equal(
    Object.keys(
      JSON.parse(fs.readFileSync(eligibility.statePath, 'utf8'))
        .specialistCellRetries,
    ).length,
    0,
  );

  const drift = await createFailedBatch('retry-source-drift');
  const driftInput = buildRetryRequest(
    drift.context,
    drift.batch,
    drift.sourceCellAttempt,
  );
  fs.writeFileSync(
    path.join(projectPath, 'src/runtime/runtime-service.js'),
    "'use strict';\nmodule.exports = { sourceDrift: true };\n",
  );
  await assert.rejects(
    drift.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: drift.batch.id,
      ...driftInput.request,
    }),
    /stale|source-drifted/,
  );
  assert.equal(
    Object.keys(
      JSON.parse(fs.readFileSync(drift.statePath, 'utf8'))
        .specialistCellRetries,
    ).length,
    0,
  );

  const unrelatedDrift = await createFailedBatch(
    'retry-unrelated-source-drift',
  );
  fs.appendFileSync(
    path.join(projectPath, 'README.md'),
    '\nUnrelated source drift after the immutable batch.\n',
  );
  const unrelatedDriftInput = buildRetryRequest(
    unrelatedDrift.context,
    unrelatedDrift.batch,
    unrelatedDrift.sourceCellAttempt,
  );
  assert.equal(
    computeInputDigest(
      unrelatedDriftInput.preview.cells.find(
        (cell) => cell.cellId === unrelatedDrift.sourceCellAttempt.cellId,
      ).inputPathDigests,
    ),
    unrelatedDrift.sourceCellAttempt.inputDigest,
  );
  assert.notEqual(
    unrelatedDriftInput.preview.sourceDigest,
    unrelatedDrift.sourceCellAttempt.sourceDigest,
  );
  await assert.rejects(
    unrelatedDrift.context.runtime.retrySpecialistBatchCell({
      specialistBatchId: unrelatedDrift.batch.id,
      ...unrelatedDriftInput.request,
    }),
    /source-drifted/,
  );
  assert.equal(
    Object.keys(
      JSON.parse(fs.readFileSync(unrelatedDrift.statePath, 'utf8'))
        .specialistCellRetries,
    ).length,
    0,
  );

  const conflicted = await createFailedBatch('retry-settlement-conflict');
  const conflictInput = buildRetryRequest(
    conflicted.context,
    conflicted.batch,
    conflicted.sourceCellAttempt,
  );
  let clockCalls = 0;
  let conflictWorkerCalls = 0;
  const clockBase = Date.now();
  const conflictRuntime = createRuntimeService({
    runtimeRoot: conflicted.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
    specialistQaRunner: async (input) => {
      conflictWorkerCalls += 1;
      return completedQaOutcome(input.inputDigest, input.inputPathDigests);
    },
    specialistNow() {
      clockCalls += 1;
      if (clockCalls === 3) {
        const state = JSON.parse(fs.readFileSync(conflicted.statePath, 'utf8'));
        state.sequences.proposalRecord += 1;
        fs.writeFileSync(
          conflicted.statePath,
          `${JSON.stringify(state, null, 2)}\n`,
        );
      }
      return new Date(clockBase + clockCalls * 10);
    },
  });
  let settlementConflict;
  try {
    await conflictRuntime.retrySpecialistBatchCell({
      specialistBatchId: conflicted.batch.id,
      ...conflictInput.request,
    });
  } catch (error) {
    settlementConflict = error;
  }
  assert.equal(settlementConflict?.statusCode, 409);
  assert.match(settlementConflict?.specialistCellRetryId || '', /^specialist-cell-retry-/);
  assert.match(settlementConflict?.retryCellAttemptId || '', /^specialist-cell-attempt-/);
  assert.equal(conflictWorkerCalls, 1);
  const conflictState = JSON.parse(fs.readFileSync(conflicted.statePath, 'utf8'));
  assert.equal(
    conflictState.specialistCellRetries[
      settlementConflict.specialistCellRetryId
    ].status,
    'active',
  );
  assert.equal(
    conflictState.specialistCellAttempts[
      settlementConflict.retryCellAttemptId
    ].status,
    'active',
  );

  const api = await createFailedBatch('retry-api');
  const apiInput = buildRetryRequest(
    api.context,
    api.batch,
    api.sourceCellAttempt,
  );
  const child = spawn(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      '--port',
      String(port),
      '--runtime-root',
      api.runtimeRoot,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  try {
    await waitForServer(child);
    const endpoint = `/api/specialist-batches/${encodeURIComponent(api.batch.id)}/cell-retries`;
    const unsupported = await requestApi(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify(apiInput.request),
    });
    assert.equal(unsupported.response.status, 415);
    assert.deepEqual(Object.keys(unsupported.payload), ['error']);
    const malformed = await requestApi(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...apiInput.request, extra: true }),
    });
    assert.equal(malformed.response.status, 400);
    assert.deepEqual(Object.keys(malformed.payload), ['error']);
    const oversized = await requestApi(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ oversized: 'x'.repeat(70 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.deepEqual(Object.keys(oversized.payload), ['error']);

    const createdResponse = await requestApi(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(apiInput.request),
    });
    assert.equal(createdResponse.response.status, 201);
    assert.deepEqual(Object.keys(createdResponse.payload).sort(), [
      'generatedAt',
      'idempotent',
      'specialistCellAttempt',
      'specialistCellRetry',
    ]);
    const replayResponse = await requestApi(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(apiInput.request),
    });
    assert.equal(replayResponse.response.status, 200);
    assert.equal(replayResponse.payload.idempotent, true);
    const retryId = createdResponse.payload.specialistCellRetry.id;
    const exactResponse = await requestApi(
      `/api/specialist-cell-retries/${encodeURIComponent(retryId)}`,
    );
    assert.equal(exactResponse.response.status, 200);
    assert.deepEqual(Object.keys(exactResponse.payload).sort(), [
      'generatedAt',
      'specialistCellAttempt',
      'specialistCellRetry',
    ]);
    const locator = new URLSearchParams({
      sourceCellAttemptId: api.sourceCellAttempt.id,
    });
    const locatorResponse = await requestApi(
      `/api/specialist-batches/${encodeURIComponent(api.batch.id)}/cell-retry?${locator}`,
    );
    assert.equal(locatorResponse.response.status, 200);
    assert.equal(locatorResponse.payload.specialistCellRetry.id, retryId);
    const publicResponse = await requestApi('/api/snapshot');
    for (const field of [
      'specialistBatches',
      'specialistCellAttempts',
      'specialistCellRetries',
    ]) {
      assert.equal(Object.hasOwn(publicResponse.payload.snapshot, field), false);
    }
  } finally {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      delay(1000),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }

  const invalidRuntimeRoot = path.join(tempRoot, 'retry-invalid-v21');
  fs.cpSync(api.runtimeRoot, invalidRuntimeRoot, { recursive: true });
  const invalidStatePath = path.join(invalidRuntimeRoot, 'state.json');
  const invalidState = JSON.parse(fs.readFileSync(invalidStatePath, 'utf8'));
  delete invalidState.specialistCellRetries;
  fs.writeFileSync(
    invalidStatePath,
    `${JSON.stringify(invalidState, null, 2)}\n`,
  );
  const invalidRuntime = createRuntimeService({
    runtimeRoot: invalidRuntimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
  });
  assert.throws(
    () => invalidRuntime.getSnapshot(),
    /missing SpecialistCellRetry fields/,
  );

  const finalState = JSON.parse(fs.readFileSync(primary.statePath, 'utf8'));
  assert.equal(Object.keys(finalState.executionPlans).length, 0);
  assert.equal(Object.keys(finalState.workOrders).length, 0);
  assert.equal(Object.keys(finalState.runs).length, 0);
  assert.equal(Object.keys(finalState.artifacts).length, 0);
  assert.equal(Object.keys(finalState.approvals).length, 0);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: MODE,
        schemaVersion: finalState.schemaVersion,
        migration: 'v20-to-v21-atomic-with-active-retry',
        immutableSourceRecords: true,
        exactReplayWithoutWorker: true,
        sourceDriftRejectedBeforeWrite: true,
        settlementConflictLeavesActiveEvidence: true,
        exactInspection: true,
        genericSnapshotMaps: false,
        downstreamRecords: 0,
      },
      null,
      2,
    )}\n`,
  );
}

main().finally(() => {
  if (!keepFixture) {
    fs.rmSync(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 50,
    });
  }
});
