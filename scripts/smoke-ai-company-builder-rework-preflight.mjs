import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import dispatchModule from '../src/runtime/builder-rework-dispatches.js';
import fileStoreModule from '../src/runtime/file-store.js';
import workOrderPreviewModule from '../src/runtime/workorder-verification-plan-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildPreviewRequest,
  createChangesRequestedFixture,
  createRuntime,
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const { createExecutionCoordinator } = coordinatorModule;
const { createLocalStubProviderAdapter } = localStubModule;
const { assertBuilderReworkDispatchRecord } = dispatchModule;
const { createFileStore } = fileStoreModule;
const { computeWorkOrderRecordDigest } = workOrderPreviewModule;
const port = 10700 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), {
  mode: 'ai-company-builder-rework-preflight-smoke',
});

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function assertExistingRecordsPreserved(before, after) {
  for (const [collection, records] of Object.entries(before)) {
    if (
      collection === 'sequences' ||
      collection === 'builderReworkDispatches' ||
      !records ||
      typeof records !== 'object' ||
      Array.isArray(records)
    ) {
      continue;
    }
    for (const [id, record] of Object.entries(records)) {
      assert.deepEqual(
        after[collection]?.[id],
        record,
        `${collection}.${id} must remain byte-equivalent`,
      );
    }
  }
}

function buildAcceptance(runtime, bundle) {
  const previewRequest = buildPreviewRequest(bundle);
  const preview = runtime.getReviewerReworkPlanPreview(previewRequest);
  const reworkPlan = runtime.persistReviewerReworkPlan({
    ...previewRequest,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    recordApproval: {
      decision: 'record-rework-plan',
      acknowledgement: 'record-exact-reviewer-rework-plan-without-execution',
      rationale: 'Retain exact Reviewer findings before one bounded Builder preflight.',
      reviewedAt: new Date(Math.max(Date.now(), Date.parse(preview.evaluatedAt))).toISOString(),
    },
  }).reworkPlan;
  return runtime.acceptReworkPlan({
    reworkPlanId: reworkPlan.id,
    reworkPlanRecordDigest: reworkPlan.recordDigest,
    previewId: reworkPlan.previewId,
    previewDigest: reworkPlan.previewDigest,
    sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
    sourceProgressDigest: reworkPlan.sourceProgressDigest,
    decision: 'accept',
    acknowledgement: 'accept-exact-rework-plan-without-execution',
    rationale: 'Accept this exact rework scope for one bounded no-write preflight.',
    reviewedAt: new Date(Math.max(Date.now(), Date.parse(reworkPlan.createdAt))).toISOString(),
  });
}

function buildRequest(reworkPlan, acceptance, builder) {
  const reviewedAt = new Date(Math.max(Date.now(), Date.parse(acceptance.createdAt))).toISOString();
  return {
    reworkPlanAcceptanceId: acceptance.id,
    reworkPlanRecordDigest: reworkPlan.recordDigest,
    acceptanceDigest: acceptance.acceptanceDigest,
    sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
    sourceProgressDigest: reworkPlan.sourceProgressDigest,
    builderWorkOrderId: builder.id,
    builderWorkOrderDigest: computeWorkOrderRecordDigest(builder),
    reworkAttemptNumber: 2,
    workOrderAttemptNumber: 3,
    evaluatedAt: reviewedAt,
    dispatchApproval: {
      decision: 'dispatch-builder-rework-preflight',
      acknowledgement:
        'dispatch-one-local-no-write-rework-preflight-without-mutation-approval',
      rationale: 'Run the one accepted local no-write Builder rework preflight.',
      reviewedAt,
    },
  };
}

async function waitForServer(server) {
  let output = '';
  server.stdout.on('data', (chunk) => { output += chunk.toString(); });
  server.stderr.on('data', (chunk) => { output += chunk.toString(); });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (output.includes(baseUrl)) return;
    if (server.exitCode !== null) {
      throw new Error(`Builder rework API server exited before readiness: ${output}`);
    }
    await delay(20);
  }
  throw new Error(`Timed out waiting for Builder rework API server: ${output}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  return {
    response,
    payload: contentType.includes('application/json') ? await response.json() : await response.text(),
  };
}

async function runApiSmoke() {
  const fixture = await createChangesRequestedFixture();
  const accepted = buildAcceptance(fixture.runtime, fixture.bundle);
  const state = readState();
  state.schemaVersion = 23;
  delete state.sequences.builderReworkDispatch;
  delete state.builderReworkDispatches;
  writeState(state);

  const reworkPlan = fixture.runtime.getReworkPlan(
    accepted.reworkPlanAcceptance.reworkPlanId,
  ).reworkPlan;
  const builder = fixture.bundle.workOrders.find((workOrder) => workOrder.role === 'builder');
  const request = buildRequest(reworkPlan, accepted.reworkPlanAcceptance, builder);
  const endpoint = `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlan.id)}/builder-rework-preflight`;
  const inspectEndpoint = `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlan.id)}/builder-rework-dispatch`;
  let server = null;
  try {
    server = spawn(process.execPath, [
      'scripts/serve-ui-slice-01.mjs',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--runtime-root',
      runtimeRoot,
    ], {
      cwd: path.resolve('.'),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await waitForServer(server);

    const absent = await fetchJson(inspectEndpoint);
    assert.equal(absent.response.status, 404);
    assert.deepEqual(
      readState(),
      state,
      'schema-v23 dispatch inspection must not migrate or mutate state',
    );

    const malformed = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, unexpected: true }),
    });
    assert.equal(malformed.response.status, 400);
    assert.deepEqual(Object.keys(malformed.payload), ['error']);

    const missingField = { ...request };
    delete missingField.evaluatedAt;
    const missing = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(missingField),
    });
    assert.equal(missing.response.status, 400);

    const sourceBefore = fs.readFileSync(path.join(projectPath, targetPath));
    const stateBefore = readState();
    const runIdsBefore = new Set(Object.keys(stateBefore.runs));
    const artifactIdsBefore = new Set(Object.keys(stateBefore.artifacts));
    const checkpointIdsBefore = Object.keys(stateBefore.workflowCheckpoints);

    const started = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(started.response.status, 201);
    assert.equal(started.payload.idempotent, false);
    assert.equal(started.payload.workOrderAttempt.status, 'waiting-gate');
    assert.deepEqual(started.payload.workOrderAttempt.decisionInboxItemRefs, []);
    assert.deepEqual(started.payload.workOrderAttempt.approvalRefs, []);
    assert.equal(started.payload.workOrderAttempt.checkpointRef, null);
    assert.equal(started.payload.workOrderAttempt.runRefs.length, 1);
    assert.equal(started.payload.workOrderAttempt.artifactRefs.length, 1);
    assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBefore);

    const stateAfter = readState();
    const addedRuns = Object.keys(stateAfter.runs).filter((id) => !runIdsBefore.has(id));
    const addedArtifacts = Object.keys(stateAfter.artifacts).filter((id) => !artifactIdsBefore.has(id));
    assert.equal(addedRuns.length, 1, 'rework preflight must not rerun upstream roles');
    assert.equal(addedArtifacts.length, 1, 'rework preflight must record one bounded artifact');
    assert.deepEqual(Object.keys(stateAfter.workflowCheckpoints), checkpointIdsBefore);
    assert.deepEqual(stateAfter.executionPlans, stateBefore.executionPlans);
    assert.deepEqual(stateAfter.workOrders, stateBefore.workOrders);

    const replayBytes = fs.readFileSync(statePath);
    const replay = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.idempotent, true);
    assert.deepEqual(fs.readFileSync(statePath), replayBytes, 'exact API replay must not save or invoke a worker');

    const divergent = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        dispatchApproval: { ...request.dispatchApproval, rationale: 'A divergent dispatch must conflict.' },
      }),
    });
    assert.equal(divergent.response.status, 409);

    const inspected = await fetchJson(inspectEndpoint);
    assert.equal(inspected.response.status, 200);
    assert.deepEqual(Object.keys(inspected.payload), [
      'generatedAt',
      'builderReworkDispatch',
      'workOrderAttempt',
    ]);
    assert.equal(inspected.payload.builderReworkDispatch.id, started.payload.builderReworkDispatch.id);
    assert.equal((await fetchJson(`${baseUrl}/api/snapshot`)).payload.snapshot.builderReworkDispatches, undefined);
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(1000)]);
      if (server.exitCode === null) server.kill('SIGKILL');
    }
  }
}

async function runFailureSmoke() {
  const fixture = await createChangesRequestedFixture();
  const accepted = buildAcceptance(fixture.runtime, fixture.bundle);
  const reworkPlan = fixture.runtime.getReworkPlan(
    accepted.reworkPlanAcceptance.reworkPlanId,
  ).reworkPlan;
  const builder = fixture.bundle.workOrders.find((workOrder) => workOrder.role === 'builder');
  const request = buildRequest(reworkPlan, accepted.reworkPlanAcceptance, builder);
  const sourceBefore = fs.readFileSync(path.join(projectPath, targetPath));
  const stateBefore = readState();
  const started = fixture.runtime.beginBuilderReworkPreflight({
    reworkPlanId: reworkPlan.id,
    ...request,
  });
  assert.equal(
    fixture.runtime.getBuilderReworkDispatch(reworkPlan.id).workOrderAttempt.workerState,
    'running',
  );

  const coordinator = createExecutionCoordinator({
    runtimeService: fixture.runtime,
    repoRoot: path.resolve('.'),
    providerAdapter: {
      name: 'local-stub',
      async execute(executionRequest) {
        return {
          providerRunId: 'widened-rework-local-stub-run',
          outputText: '# Builder Rework Preflight\n\nInvalid widened scope.',
          normalizedResult: {
            blockers: [],
            needsDecision: false,
            nextStage: 'separate-mutation-approval',
            rework: {
              findings: executionRequest.rework.findings,
              targetPathAllowlist: [...executionRequest.rework.targetPathAllowlist, 'unexpected.js'],
              verificationCommands: executionRequest.rework.verificationCommands,
            },
          },
        };
      },
    },
  });
  const failedResult = await coordinator.runBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    workOrderAttemptId: started.workOrderAttempt.id,
  });
  assert.equal(failedResult.failed, true);
  const settled = fixture.runtime.settleBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    runId: failedResult.run?.id || null,
    artifactId: failedResult.artifact?.id || null,
    failed: true,
  });
  assert.equal(settled.workOrderAttempt.status, 'failed');
  assert.equal(settled.workOrderAttempt.workerState, 'failed-terminal-no-retry');
  assert.deepEqual(settled.workOrderAttempt.decisionInboxItemRefs, []);
  assert.deepEqual(settled.workOrderAttempt.approvalRefs, []);
  assert.equal(settled.workOrderAttempt.checkpointRef, null);
  assert.equal(settled.workOrderAttempt.runRefs.length, 1);
  assert.equal(settled.workOrderAttempt.artifactRefs.length, 0);
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBefore);

  const stateAfter = readState();
  assert.deepEqual(stateAfter.executionPlans, stateBefore.executionPlans);
  assert.deepEqual(stateAfter.workOrders, stateBefore.workOrders);
  assert.deepEqual(
    Object.keys(stateAfter.workflowCheckpoints),
    Object.keys(stateBefore.workflowCheckpoints),
  );
  assert.equal(Object.keys(stateAfter.approvals).length, Object.keys(stateBefore.approvals).length);
  assert.equal(
    Object.keys(stateAfter.decisionInboxItems).length,
    Object.keys(stateBefore.decisionInboxItems).length,
  );
  const replayBytes = fs.readFileSync(statePath);
  const replay = fixture.runtime.beginBuilderReworkPreflight({ reworkPlanId: reworkPlan.id, ...request });
  assert.equal(replay.idempotent, true);
  assert.deepEqual(fs.readFileSync(statePath), replayBytes, 'failed dispatch replay must not retry or save');
}

async function main() {
  const fixture = await createChangesRequestedFixture();
  const initialState = readState();
  const initialBytes = fs.readFileSync(statePath);
  const accepted = buildAcceptance(fixture.runtime, fixture.bundle);
  const acceptedState = readState();
  acceptedState.schemaVersion = 23;
  delete acceptedState.sequences.builderReworkDispatch;
  delete acceptedState.builderReworkDispatches;
  writeState(acceptedState);
  const v23Bytes = fs.readFileSync(statePath);

  const runtime = createRuntime(runtimeRoot);
  assert.equal(runtime.getSnapshot().schemaVersion, 26);
  assert.deepEqual(fs.readFileSync(statePath), v23Bytes, 'readonly snapshot must not migrate v23');
  const store = createFileStore({ runtimeRoot });
  const genericLoadedState = store.loadState();
  assert.equal(genericLoadedState.schemaVersion, 26);
  assert.deepEqual(
    fs.readFileSync(statePath),
    v23Bytes,
    'generic loadState must not persist the command-only v24 migration',
  );
  assert.throws(
    () => store.saveState(genericLoadedState),
    /migration requires one BuilderReworkDispatch command/,
  );
  assert.deepEqual(
    fs.readFileSync(statePath),
    v23Bytes,
    'generic save must not persist an empty v24 migration',
  );
  const reworkPlan = runtime.getReworkPlan(accepted.reworkPlanAcceptance.reworkPlanId).reworkPlan;
  const builder = fixture.bundle.workOrders.find((workOrder) => workOrder.role === 'builder');
  const request = buildRequest(reworkPlan, accepted.reworkPlanAcceptance, builder);

  for (const invalid of [
    { ...request, unexpected: true },
    { ...request, reworkAttemptNumber: 3 },
    { ...request, builderWorkOrderDigest: '0'.repeat(64) },
    { ...request, sourceExecutionPlanDigest: '0'.repeat(64) },
    { ...request, sourceAttemptRecordDigest: '0'.repeat(64) },
    { ...request, sourceProgressDigest: '0'.repeat(64) },
    {
      ...request,
      dispatchApproval: {
        ...request.dispatchApproval,
        rationale: 'sk-proj-sensitive-value',
      },
    },
    { ...request, dispatchApproval: { ...request.dispatchApproval, rationale: 'password=blocked' } },
  ]) {
    assert.throws(
      () => runtime.beginBuilderReworkPreflight({ reworkPlanId: reworkPlan.id, ...invalid }),
    );
    assert.deepEqual(fs.readFileSync(statePath), v23Bytes, 'invalid request must not write');
  }

  const partialState = structuredClone(acceptedState);
  partialState.schemaVersion = 24;
  partialState.sequences.builderReworkDispatch = 0;
  delete partialState.builderReworkDispatches;
  writeState(partialState);
  assert.throws(
    () => createRuntime(runtimeRoot).getSnapshot(),
    /missing BuilderReworkDispatch fields/,
  );

  const futureState = structuredClone(acceptedState);
  futureState.schemaVersion = 27;
  writeState(futureState);
  assert.throws(
    () => createRuntime(runtimeRoot).getSnapshot(),
    /Unsupported runtime state schemaVersion: 27/,
  );
  writeState(acceptedState);

  const staleAttemptSequenceState = structuredClone(acceptedState);
  staleAttemptSequenceState.sequences.workOrderAttempt += 1;
  writeState(staleAttemptSequenceState);
  assert.throws(
    () => createRuntime(runtimeRoot).getSnapshot(),
    /WorkOrderAttempt sequence does not match retained records/,
  );
  writeState(acceptedState);

  const providerDriftState = readState();
  const project = providerDriftState.projects[reworkPlan.projectId];
  project.provider = {
    adapter: 'openai-responses',
    env: { apiKeyVar: 'OPENAI_API_KEY' },
    mode: 'live',
    model: 'gpt-test',
  };
  writeState(providerDriftState);
  assert.throws(
    () =>
      runtime.beginBuilderReworkPreflight({
        reworkPlanId: reworkPlan.id,
        ...request,
      }),
    /local-stub/,
  );
  writeState(acceptedState);

  const started = runtime.beginBuilderReworkPreflight({ reworkPlanId: reworkPlan.id, ...request });
  assert.equal(started.idempotent, false);
  assert.equal(started.builderReworkDispatch.persisted, true);
  assert.equal(started.workOrderAttempt.status, 'active');
  assert.equal(started.workOrderAttempt.action, 'start-builder-rework-preflight');
  assert.equal(started.workOrderAttempt.decisionInboxItemRefs.length, 0);
  assert.equal(runtime.getBuilderReworkDispatch(reworkPlan.id).workOrderAttempt.workerState, 'running');
  assertBuilderReworkDispatchRecord(started.builderReworkDispatch);

  const persistedState = readState();
  assert.equal(persistedState.schemaVersion, 26);
  assert.equal(Object.keys(persistedState.builderReworkDispatches).length, 1);
  assert.equal(Object.keys(persistedState.workOrders).length, 3);
  assert.deepEqual(persistedState.executionPlans, acceptedState.executionPlans);
  assert.deepEqual(persistedState.workOrders, acceptedState.workOrders);
  assert.equal(runtime.getSnapshot().builderReworkDispatches, undefined);

  const replayBytes = fs.readFileSync(statePath);
  const replay = runtime.beginBuilderReworkPreflight({ reworkPlanId: reworkPlan.id, ...request });
  assert.equal(replay.idempotent, true);
  assert.deepEqual(fs.readFileSync(statePath), replayBytes, 'exact replay must not save');
  assert.throws(
    () => runtime.beginBuilderReworkPreflight({
      reworkPlanId: reworkPlan.id,
      ...request,
      dispatchApproval: { ...request.dispatchApproval, rationale: 'Different request must conflict.' },
    }),
    /different BuilderReworkDispatch/i,
  );

  const activeBytes = fs.readFileSync(statePath);
  assert.throws(
    () =>
      runtime.settleBuilderReworkPreflight({
        builderReworkDispatchId: started.builderReworkDispatch.id,
        runId: null,
        artifactId: null,
        failed: false,
      }),
    /requires one Run and one Artifact/,
  );
  assert.deepEqual(
    fs.readFileSync(statePath),
    activeBytes,
    'invalid settlement must not write',
  );

  const localStub = createLocalStubProviderAdapter();
  let workerCalls = 0;
  const coordinator = createExecutionCoordinator({
    runtimeService: runtime,
    repoRoot: path.resolve('.'),
    providerAdapter: {
      name: 'local-stub',
      async execute(executionRequest, options) {
        workerCalls += 1;
        const workerState = readState();
        assert.equal(
          workerState.builderReworkDispatches[started.builderReworkDispatch.id]
            .workOrderAttemptId,
          started.workOrderAttempt.id,
          'dispatch must exist before worker invocation',
        );
        assert.equal(
          workerState.workOrderAttempts[started.workOrderAttempt.id].status,
          'active',
          'active attempt must exist before worker invocation',
        );
        return localStub.execute(executionRequest, options);
      },
    },
  });
  const workerResult = await coordinator.runBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    workOrderAttemptId: started.workOrderAttempt.id,
  });
  assert.equal(workerResult.failed, false);
  assert.equal(workerCalls, 1);
  const settled = runtime.settleBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    runId: workerResult.run.id,
    artifactId: workerResult.artifact.id,
    failed: false,
  });
  assert.equal(settled.workOrderAttempt.status, 'waiting-gate');
  assert.equal(settled.workOrderAttempt.workerState, 'preflight-ready-for-separate-mutation-approval');
  assert.deepEqual(settled.workOrderAttempt.decisionInboxItemRefs, []);
  assert.deepEqual(settled.workOrderAttempt.approvalRefs, []);
  assert.equal(settled.workOrderAttempt.checkpointRef, null);
  assert.deepEqual(settled.workOrderAttempt.runRefs, [workerResult.run.id]);
  assert.deepEqual(settled.workOrderAttempt.artifactRefs, [workerResult.artifact.id]);
  assert.deepEqual(runtime.getBuilderReworkDispatch(reworkPlan.id), settled);

  const finalState = readState();
  assertExistingRecordsPreserved(acceptedState, finalState);
  assert.equal(finalState.approvals && Object.keys(finalState.approvals).length, Object.keys(acceptedState.approvals).length);
  assert.equal(finalState.decisionInboxItems && Object.keys(finalState.decisionInboxItems).length, Object.keys(acceptedState.decisionInboxItems).length);
  const sequenceDriftState = structuredClone(finalState);
  sequenceDriftState.sequences.builderReworkDispatch += 1;
  writeState(sequenceDriftState);
  assert.throws(
    () => createRuntime(runtimeRoot).getSnapshot(),
    /sequence does not match retained records/,
  );
  writeState(finalState);

  await assert.rejects(
    () =>
      localStub.execute({
        executionMode: 'unknown-builder-mode',
        role: 'builder',
      }),
    /Unsupported local stub builder mode/,
  );
  assert.notDeepEqual(initialBytes, fs.readFileSync(statePath));
  await runFailureSmoke();
  await runApiSmoke();
  process.stdout.write(`${JSON.stringify({ ok: true, mode: 'ai-company-builder-rework-preflight-smoke', schemaVersion: 25, dispatch: 'one', attempt: 'waiting-gate', graph: 'unchanged' }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
