import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import reworkPlanModule from '../src/runtime/rework-plans.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildPreviewRequest,
  createChangesRequestedFixture,
  createRuntime,
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
  tempRoot,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const {
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  REWORK_PLAN_RECORD_KEYS,
  assertReworkPlanRecord,
  computeRecordApprovalDigest,
  computeReworkPlanRecordDigest,
} = reworkPlanModule;

const MODE = 'ai-company-durable-reviewer-rework-plan-smoke';
const port = 10400 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState(root = runtimeRoot) {
  return JSON.parse(fs.readFileSync(path.join(root, 'state.json'), 'utf8'));
}

function writeState(root, state) {
  fs.writeFileSync(
    path.join(root, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function copyRuntime(name, sourceRoot = runtimeRoot) {
  const targetRoot = path.join(tempRoot, name);
  fs.cpSync(sourceRoot, targetRoot, { recursive: true });
  const state = readState(targetRoot);
  for (const artifact of Object.values(state.artifacts || {})) {
    artifact.path = path.join(
      targetRoot,
      'artifacts',
      path.basename(artifact.path),
    );
  }
  writeState(targetRoot, state);
  return targetRoot;
}

function buildPersistRequest(previewRequest, preview, rationale, reviewedAt) {
  return {
    ...previewRequest,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    recordApproval: {
      decision: RECORD_APPROVAL_DECISION,
      acknowledgement: RECORD_APPROVAL_ACKNOWLEDGEMENT,
      rationale,
      reviewedAt,
    },
  };
}

function withoutV22Fields(state) {
  const copy = structuredClone(state);
  copy.schemaVersion = 21;
  delete copy.sequences.reworkPlan;
  delete copy.reworkPlans;
  return copy;
}

function withoutReworkDomain(state) {
  const copy = structuredClone(state);
  delete copy.schemaVersion;
  delete copy.sequences.reworkPlan;
  delete copy.sequences.reworkPlanAcceptance;
  delete copy.reworkPlans;
  delete copy.reworkPlanAcceptances;
  return copy;
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  for (let index = 0; index < 200; index += 1) {
    if (output.includes(`http://127.0.0.1:${port}`)) return;
    if (child.exitCode !== null) {
      throw new Error(`UI server exited before readiness: ${output}`);
    }
    await delay(20);
  }
  throw new Error(`Timed out waiting for UI server: ${output}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  return {
    response,
    payload: contentType.includes('application/json')
      ? await response.json()
      : await response.text(),
  };
}

function assertNoExecutionExpansion(before, after) {
  for (const field of [
    'missions',
    'councilSessions',
    'tasks',
    'runs',
    'artifacts',
    'decisionInboxItems',
    'approvals',
    'executionPlans',
    'workOrders',
    'handoffPackets',
    'workflowCheckpoints',
    'deliveryPackages',
    'workOrderAttempts',
    'specialistBatches',
    'specialistCellAttempts',
    'specialistCellRetries',
    'memoryItems',
    'memoryRecalls',
  ]) {
    assert.deepEqual(after[field], before[field], `${field} changed during append`);
  }
}

async function main() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(tempRoot, { recursive: true });
  let server = null;

  try {
    const fixture = await createChangesRequestedFixture();
    const previewRequest = buildPreviewRequest(fixture.bundle);
    const preview = fixture.runtime.getReviewerReworkPlanPreview(previewRequest);
    const v22FixtureState = readState();
    const v21State = withoutV22Fields(v22FixtureState);
    writeState(runtimeRoot, v21State);
    const v21Bytes = fs.readFileSync(statePath);
    const sourceBytes = fs.readFileSync(path.join(projectPath, targetPath));
    const runtime = createRuntime();
    assert.equal(runtime.getSnapshot().schemaVersion, 29);
    assert.deepEqual(fs.readFileSync(statePath), v21Bytes);

    const reviewedAt = new Date(
      Math.max(Date.now(), Date.parse(preview.evaluatedAt)),
    ).toISOString();
    const request = buildPersistRequest(
      previewRequest,
      preview,
      'Retain the exact Reviewer rework scope for operator review.',
      reviewedAt,
    );
    const invalidRequests = [
      { ...request, previewDigest: '0'.repeat(64) },
      { ...request, unexpected: true },
      {
        ...request,
        recordApproval: {
          ...request.recordApproval,
          rationale: 'password=do-not-store',
        },
      },
      {
        ...request,
        recordApproval: {
          ...request.recordApproval,
          reviewedAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
        },
      },
    ];
    const missing = structuredClone(request);
    delete missing.previewId;
    invalidRequests.push(missing);
    for (const invalid of invalidRequests) {
      assert.throws(() => runtime.persistReviewerReworkPlan(invalid));
      assert.deepEqual(fs.readFileSync(statePath), v21Bytes);
    }

    const result = runtime.persistReviewerReworkPlan(request);
    assert.equal(result.idempotent, false);
    const record = result.reworkPlan;
    assert.deepEqual(Object.keys(record), REWORK_PLAN_RECORD_KEYS);
    assert.equal(record.id, 'rework-plan-0001');
    assert.equal(record.persisted, true);
    assert.equal(record.status, 'review-required');
    assert.equal(record.previewId, preview.id);
    assert.equal(record.previewDigest, preview.previewDigest);
    assert.equal(record.sourceExecutionPlanDigest, preview.executionPlanDigest);
    assert.equal(record.sourceAttemptRecordDigest, preview.attemptRecordDigest);
    assert.equal(record.reviewEvidenceDigest, preview.reviewEvidenceDigest);
    assert.equal(record.sourceProgressDigest, preview.sourceProgressDigest);
    assert.equal(record.nextAttemptNumber, 2);
    assert.equal(record.maxAdditionalBuilderAttempts, 1);
    assert.deepEqual(record.targetPathAllowlist, preview.targetPathAllowlist);
    assert.deepEqual(record.verificationCommands, preview.verificationCommands);
    assert.deepEqual(record.findings, preview.findings);
    assert.deepEqual(record.evidenceRefs, preview.evidenceRefs);
    assert.deepEqual(record.allowedActions, []);
    assert.deepEqual(record.blockedActions, preview.blockedActions);
    assert.equal(record.createdAt, reviewedAt);
    assert.equal(
      record.recordApprovalDigest,
      computeRecordApprovalDigest(record.recordApproval),
    );
    assert.equal(record.recordDigest, computeReworkPlanRecordDigest(record));
    assertReworkPlanRecord(record);

    const persistedState = readState();
    assert.equal(persistedState.schemaVersion, 29);
    assert.equal(persistedState.sequences.reworkPlan, 1);
    assert.equal(persistedState.sequences.reworkPlanAcceptance, 0);
    assert.deepEqual(Object.keys(persistedState.reworkPlans), [record.id]);
    assert.deepEqual(persistedState.reworkPlanAcceptances, {});
    assert.deepEqual(withoutReworkDomain(persistedState), withoutReworkDomain(v21State));
    assertNoExecutionExpansion(v21State, persistedState);
    assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBytes);
    assert.equal(Object.hasOwn(runtime.getSnapshot(), 'reworkPlans'), false);

    const persistedBytes = fs.readFileSync(statePath);
    const replay = runtime.persistReviewerReworkPlan(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.reworkPlan, record);
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);
    assert.throws(
      () =>
        runtime.persistReviewerReworkPlan({
          ...request,
          recordApproval: {
            ...request.recordApproval,
            rationale: 'A divergent rationale must not replace the record.',
          },
        }),
      /different ReworkPlan/,
    );
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);

    assert.deepEqual(runtime.getReworkPlan(record.id).reworkPlan, record);
    assert.deepEqual(
      runtime.getExecutionPlanReworkPlan(record.executionPlanId).reworkPlan,
      record,
    );
    assert.throws(() => runtime.getReworkPlan('rework-plan-9999'), /not found/i);

    const artifactPath =
      persistedState.artifacts[record.reviewArtifactId].path;
    fs.appendFileSync(artifactPath, '\nsource drift after immutable record\n');
    assert.equal(runtime.persistReviewerReworkPlan(request).idempotent, true);
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);
    assert.deepEqual(createRuntime().getReworkPlan(record.id).reworkPlan, record);

    const partialRoot = copyRuntime('partial-v23');
    const partialState = readState(partialRoot);
    delete partialState.reworkPlans;
    writeState(partialRoot, partialState);
    assert.throws(() => createRuntime(partialRoot).getSnapshot(), /missing ReworkPlan fields/);

    const futureRoot = copyRuntime('future-schema');
    const futureState = readState(futureRoot);
    futureState.schemaVersion = 30;
    writeState(futureRoot, futureState);
    assert.throws(() => createRuntime(futureRoot).getSnapshot(), /Unsupported runtime state/);

    server = spawn(
      process.execPath,
      [
        'scripts/serve-ui-slice-01.mjs',
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--runtime-root',
        runtimeRoot,
      ],
      {
        cwd: path.resolve('.'),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    await waitForServer(server);
    const endpoint = `${baseUrl}/api/execution-plans/${encodeURIComponent(record.executionPlanId)}/rework-plans`;
    const replayApi = await fetchJson(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries(request).filter(([key]) => key !== 'executionPlanId'),
        ),
      ),
    });
    assert.equal(replayApi.response.status, 200);
    assert.deepEqual(Object.keys(replayApi.payload), [
      'generatedAt',
      'idempotent',
      'reworkPlan',
    ]);
    assert.equal(replayApi.payload.idempotent, true);
    assert.deepEqual(replayApi.payload.reworkPlan, record);

    const exactApi = await fetchJson(
      `${baseUrl}/api/rework-plans/${encodeURIComponent(record.id)}`,
    );
    assert.equal(exactApi.response.status, 200);
    assert.deepEqual(Object.keys(exactApi.payload), ['generatedAt', 'reworkPlan']);
    assert.deepEqual(exactApi.payload.reworkPlan, record);
    const currentApi = await fetchJson(
      `${baseUrl}/api/execution-plans/${encodeURIComponent(record.executionPlanId)}/rework-plan`,
    );
    assert.equal(currentApi.response.status, 200);
    assert.deepEqual(currentApi.payload.reworkPlan, record);
    const snapshotApi = await fetchJson(`${baseUrl}/api/snapshot`);
    assert.equal(snapshotApi.response.status, 200);
    assert.equal(Object.hasOwn(snapshotApi.payload.snapshot, 'reworkPlans'), false);
    const unknownApi = await fetchJson(
      `${baseUrl}/api/rework-plans/rework-plan-9999`,
    );
    assert.equal(unknownApi.response.status, 404);
    const wrongMethod = await fetchJson(
      `${baseUrl}/api/rework-plans/${encodeURIComponent(record.id)}`,
      { method: 'POST' },
    );
    assert.equal(wrongMethod.response.status, 405);
    const unsupportedType = await fetchJson(endpoint, {
      method: 'POST',
      body: '{}',
    });
    assert.equal(unsupportedType.response.status, 415);
    const pathOverride = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...Object.fromEntries(
          Object.entries(request).filter(([key]) => key !== 'executionPlanId'),
        ),
        executionPlanId: 'execution-plan-unknown',
      }),
    });
    assert.equal(pathOverride.response.status, 400);
    const oversized = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rationale: 'x'.repeat(17 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: persistedState.schemaVersion,
          migratedFrom: 21,
          records: Object.keys(persistedState.reworkPlans).length,
          idempotentReplay: true,
          exactInspection: true,
          snapshotExcluded: true,
          downstreamActions: record.allowedActions.length,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(1000),
      ]);
      if (server.exitCode === null) server.kill('SIGKILL');
    }
    fs.rmSync(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 50,
    });
  }
}

await main();
