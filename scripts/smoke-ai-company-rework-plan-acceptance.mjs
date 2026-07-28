import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import acceptanceModule from '../src/runtime/rework-plan-acceptances.js';
import workOrderAttemptModule from '../src/runtime/work-order-attempts.js';
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
  tempRoot,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const {
  REWORK_PLAN_ACCEPTANCE_RECORD_KEYS,
  assertReworkPlanAcceptanceRecord,
  computeReworkPlanAcceptanceDigest,
} = acceptanceModule;
const { computeWorkOrderAttemptRecordDigest } = workOrderAttemptModule;
const { computeWorkOrderRecordDigest } = workOrderPreviewModule;
const MODE = 'ai-company-rework-plan-acceptance-smoke';
const port = 10450 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState(root = runtimeRoot) {
  return JSON.parse(fs.readFileSync(path.join(root, 'state.json'), 'utf8'));
}

function writeState(root, state) {
  fs.writeFileSync(path.join(root, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);
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

function withoutAcceptanceDomain(state) {
  const copy = structuredClone(state);
  delete copy.schemaVersion;
  delete copy.sequences.reworkPlanAcceptance;
  delete copy.reworkPlanAcceptances;
  return copy;
}

function buildAcceptanceRequest(reworkPlan, rationale, reviewedAt) {
  return {
    reworkPlanRecordDigest: reworkPlan.recordDigest,
    previewId: reworkPlan.previewId,
    previewDigest: reworkPlan.previewDigest,
    sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
    sourceProgressDigest: reworkPlan.sourceProgressDigest,
    decision: 'accept',
    acknowledgement: 'accept-exact-rework-plan-without-execution',
    rationale,
    reviewedAt,
  };
}

function downgradeToV22(state) {
  const copy = structuredClone(state);
  copy.schemaVersion = 22;
  delete copy.sequences.reworkPlanAcceptance;
  delete copy.reworkPlanAcceptances;
  return copy;
}

function assertMutatedSourceRefusal(name, reworkPlanId, request, mutate, pattern) {
  const targetRoot = copyRuntime(name);
  const state = readState(targetRoot);
  mutate({ root: targetRoot, state });
  writeState(targetRoot, state);
  const stateBytes = fs.readFileSync(path.join(targetRoot, 'state.json'));
  assert.throws(
    () =>
      createRuntime(targetRoot).acceptReworkPlan({
        reworkPlanId,
        ...request,
      }),
    pattern,
  );
  assert.deepEqual(
    fs.readFileSync(path.join(targetRoot, 'state.json')),
    stateBytes,
    `${name} refusal must not write state`,
  );
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  for (let index = 0; index < 200; index += 1) {
    if (output.includes(`http://127.0.0.1:${port}`)) return;
    if (child.exitCode !== null) throw new Error(`UI server exited before readiness: ${output}`);
    await delay(20);
  }
  throw new Error(`Timed out waiting for UI server: ${output}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  return { response, payload: contentType.includes('application/json') ? await response.json() : await response.text() };
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  let server = null;
  try {
    const fixture = await createChangesRequestedFixture();
    const previewRequest = buildPreviewRequest(fixture.bundle);
    const preview = fixture.runtime.getReviewerReworkPlanPreview(previewRequest);
    const recordResult = fixture.runtime.persistReviewerReworkPlan({
      ...previewRequest,
      previewId: preview.id,
      previewDigest: preview.previewDigest,
      recordApproval: {
        decision: 'record-rework-plan',
        acknowledgement: 'record-exact-reviewer-rework-plan-without-execution',
        rationale: 'Retain the exact Reviewer rework scope for acceptance review.',
        reviewedAt: new Date(Math.max(Date.now(), Date.parse(preview.evaluatedAt))).toISOString(),
      },
    });
    const v22State = downgradeToV22(readState());
    writeState(runtimeRoot, v22State);
    const v22Bytes = fs.readFileSync(statePath);
    const runtime = createRuntime();
    assert.equal(runtime.getSnapshot().schemaVersion, 23);
    assert.deepEqual(fs.readFileSync(statePath), v22Bytes, 'readonly load must not migrate on disk');

    const reviewedAt = new Date(Math.max(Date.now(), Date.parse(recordResult.reworkPlan.createdAt))).toISOString();
    const request = buildAcceptanceRequest(
      recordResult.reworkPlan,
      'Accept the exact retained rework scope as evidence only.',
      reviewedAt,
    );
    const staleReviewRoot = copyRuntime('stale-review', runtimeRoot);
    const staleReviewState = readState(staleReviewRoot);
    fs.appendFileSync(
      staleReviewState.artifacts[recordResult.reworkPlan.reviewArtifactId].path,
      '\nchanged review evidence\n',
    );
    const staleReviewBytes = fs.readFileSync(
      path.join(staleReviewRoot, 'state.json'),
    );
    assert.throws(
      () =>
        createRuntime(staleReviewRoot).acceptReworkPlan({
          reworkPlanId: recordResult.reworkPlan.id,
          ...request,
        }),
      /stale|lineage|source/i,
    );
    assert.deepEqual(
      fs.readFileSync(path.join(staleReviewRoot, 'state.json')),
      staleReviewBytes,
    );

    const missing = { ...request };
    delete missing.previewId;
    for (const invalid of [
      { ...request, previewDigest: '0'.repeat(64) },
      { ...request, unexpected: true },
      missing,
      { ...request, rationale: 'password=not-allowed' },
      { ...request, rationale: 'raw artifact body must not be stored' },
      {
        ...request,
        reviewedAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
      },
    ]) {
      assert.throws(() => runtime.acceptReworkPlan({ reworkPlanId: recordResult.reworkPlan.id, ...invalid }));
      assert.deepEqual(fs.readFileSync(statePath), v22Bytes);
    }
    assert.throws(
      () =>
        runtime.acceptReworkPlan({
          reworkPlanId: 'rework-plan-9999',
          ...request,
        }),
      /not found/i,
    );
    assert.deepEqual(fs.readFileSync(statePath), v22Bytes);

    assertMutatedSourceRefusal(
      'missing-finding',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        const artifact = state.artifacts[recordResult.reworkPlan.reviewArtifactId];
        fs.writeFileSync(
          artifact.path,
          fs
            .readFileSync(artifact.path, 'utf8')
            .replace(/## Findings\n(?:- .+\n)+\n/, '## Findings\n\n'),
        );
      },
      /stale|lineage|finding/i,
    );
    assertMutatedSourceRefusal(
      'widened-scope',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        state.workOrders[recordResult.reworkPlan.reviewerWorkOrderId]
          .targetPathAllowlist.push('src/runtime/contracts.js');
      },
      /scope|stale|digest/i,
    );
    assertMutatedSourceRefusal(
      'qa-already-run',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        const qa = Object.values(state.workOrders).find(
          (workOrder) =>
            workOrder.executionPlanId === recordResult.reworkPlan.executionPlanId &&
            workOrder.role === 'qa',
        );
        const sourceAttempt =
          state.workOrderAttempts[recordResult.reworkPlan.reviewerAttemptId];
        const qaAttempt = {
          ...sourceAttempt,
          id: 'work-order-attempt-0004',
          workOrderId: qa.id,
          role: 'qa',
          position: qa.position,
          attemptNumber: 1,
          action: 'run-qa',
          status: 'completed',
          workOrderDigest: computeWorkOrderRecordDigest(qa),
          stopReason: null,
          recordDigest: '',
        };
        qaAttempt.recordDigest = computeWorkOrderAttemptRecordDigest(qaAttempt);
        state.workOrderAttempts[qaAttempt.id] = qaAttempt;
        state.sequences.workOrderAttempt = 4;
        qa.status = 'completed';
        qa.attemptRefs = [qaAttempt.id];
        qa.runRefs = [...qaAttempt.runRefs];
        qa.artifactRefs = [...qaAttempt.artifactRefs];
      },
      /changes-requested|source|progress|stale/i,
    );
    assertMutatedSourceRefusal(
      'provider-backed',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        state.projects[recordResult.reworkPlan.projectId].provider = {
          mode: 'live',
          adapter: 'openai-responses',
          model: 'gpt-test',
          env: { apiKeyVar: 'OPENAI_API_KEY' },
        };
      },
      /local-stub|provider|source|stale/i,
    );
    assertMutatedSourceRefusal(
      'legacy-unbound',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        state.councilSessions[
          recordResult.reworkPlan.councilSessionId
        ].staffingEntryRef = null;
      },
      /StaffingEntry|planning lineage|supported state/i,
    );
    assertMutatedSourceRefusal(
      'lineage-conflict',
      recordResult.reworkPlan.id,
      request,
      ({ state }) => {
        state.runs[
          recordResult.reworkPlan.reviewerRunId
        ].summary.sourceRunId = 'run-unknown';
      },
      /lineage|stale|source/i,
    );

    const created = runtime.acceptReworkPlan({ reworkPlanId: recordResult.reworkPlan.id, ...request });
    assert.equal(created.idempotent, false);
    const acceptance = created.reworkPlanAcceptance;
    assert.deepEqual(Object.keys(acceptance), REWORK_PLAN_ACCEPTANCE_RECORD_KEYS);
    assert.equal(acceptance.id, 'rework-plan-acceptance-0001');
    assert.equal(acceptance.decision, 'accepted');
    assert.equal(acceptance.createdAt, reviewedAt);
    assert.equal(acceptance.authoritySummary.reworkAcceptanceEvidenceAllowed, true);
    assert.equal(Object.keys(acceptance.authoritySummary).length, 21);
    assert.equal(Object.values(acceptance.authoritySummary).filter(Boolean).length, 1);
    assert.equal(Object.isFrozen(acceptance), true);
    assert.equal(Object.isFrozen(acceptance.authoritySummary), true);
    assertReworkPlanAcceptanceRecord(acceptance);

    const persistedState = readState();
    const persistedBytes = fs.readFileSync(statePath);
    assert.equal(persistedState.schemaVersion, 23);
    assert.equal(Object.keys(persistedState.reworkPlanAcceptances).length, 1);
    assert.deepEqual(persistedState.reworkPlans, v22State.reworkPlans);
    assert.deepEqual(
      withoutAcceptanceDomain(persistedState),
      withoutAcceptanceDomain(v22State),
    );
    fs.appendFileSync(path.join(projectPath, targetPath), '\n// source drift after acceptance\n');
    const replay = runtime.acceptReworkPlan({ reworkPlanId: recordResult.reworkPlan.id, ...request });
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.reworkPlanAcceptance, acceptance);
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes, 'exact replay must not save after source drift');
    assert.throws(() => runtime.acceptReworkPlan({
      reworkPlanId: recordResult.reworkPlan.id,
      ...request,
      rationale: 'A divergent acceptance must fail.',
    }), /different acceptance/);
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);
    assert.deepEqual(runtime.getReworkPlanAcceptance(recordResult.reworkPlan.id).reworkPlanAcceptance, acceptance);
    assert.deepEqual(
      createRuntime().getReworkPlanAcceptance(recordResult.reworkPlan.id)
        .reworkPlanAcceptance,
      acceptance,
    );
    const rollbackRoot = copyRuntime('rollback-retention');
    assert.deepEqual(
      createRuntime(rollbackRoot).getReworkPlanAcceptance(recordResult.reworkPlan.id)
        .reworkPlanAcceptance,
      acceptance,
    );
    assert.throws(
      () => runtime.getReworkPlanAcceptance('rework-plan-9999'),
      /not found/i,
    );
    assert.equal(Object.hasOwn(runtime.getSnapshot(), 'reworkPlanAcceptances'), false);

    const sequenceDriftRoot = copyRuntime('sequence-drift');
    const sequenceDriftState = readState(sequenceDriftRoot);
    sequenceDriftState.sequences.reworkPlanAcceptance = 0;
    writeState(sequenceDriftRoot, sequenceDriftState);
    assert.throws(
      () => createRuntime(sequenceDriftRoot).getSnapshot(),
      /sequence does not match retained records/,
    );

    const timestampDriftRoot = copyRuntime('timestamp-drift');
    const timestampDriftState = readState(timestampDriftRoot);
    const timestampAcceptance =
      timestampDriftState.reworkPlanAcceptances[acceptance.id];
    const sourceReworkPlan =
      timestampDriftState.reworkPlans[recordResult.reworkPlan.id];
    timestampAcceptance.reviewedAt = new Date(
      Date.parse(sourceReworkPlan.createdAt) - 1,
    ).toISOString();
    timestampAcceptance.createdAt = timestampAcceptance.reviewedAt;
    timestampAcceptance.acceptanceDigest =
      computeReworkPlanAcceptanceDigest(timestampAcceptance);
    writeState(timestampDriftRoot, timestampDriftState);
    assert.throws(
      () => createRuntime(timestampDriftRoot).getSnapshot(),
      /invalid source ReworkPlan bindings/,
    );

    const partialRoot = copyRuntime('partial-v23');
    const partialState = readState(partialRoot);
    delete partialState.reworkPlanAcceptances;
    writeState(partialRoot, partialState);
    assert.throws(
      () => createRuntime(partialRoot).getSnapshot(),
      /missing ReworkPlanAcceptance fields/,
    );

    const futureRoot = copyRuntime('future-schema');
    const futureState = readState(futureRoot);
    futureState.schemaVersion = 24;
    writeState(futureRoot, futureState);
    assert.throws(
      () => createRuntime(futureRoot).getSnapshot(),
      /Unsupported runtime state schemaVersion: 24/,
    );

    server = spawn(process.execPath, [
      'scripts/serve-ui-slice-01.mjs', '--host', '127.0.0.1', '--port', String(port), '--runtime-root', runtimeRoot,
    ], { cwd: path.resolve('.'), env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    await waitForServer(server);
    const endpoint = `${baseUrl}/api/rework-plans/${encodeURIComponent(recordResult.reworkPlan.id)}/accept`;
    const replayApi = await fetchJson(endpoint, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(request),
    });
    assert.equal(replayApi.response.status, 200);
    assert.deepEqual(Object.keys(replayApi.payload), ['generatedAt', 'idempotent', 'reworkPlanAcceptance']);
    assert.equal(replayApi.payload.idempotent, true);
    const malformedGet = await fetchJson(
      `${baseUrl}/api/rework-plans/%E0%A4%A/acceptance`,
    );
    assert.equal(malformedGet.response.status, 400);
    assert.deepEqual(Object.keys(malformedGet.payload), ['error']);
    const getApi = await fetchJson(`${baseUrl}/api/rework-plans/${encodeURIComponent(recordResult.reworkPlan.id)}/acceptance`);
    assert.equal(getApi.response.status, 200);
    assert.deepEqual(Object.keys(getApi.payload), ['generatedAt', 'reworkPlanAcceptance']);
    const unknownGet = await fetchJson(
      `${baseUrl}/api/rework-plans/rework-plan-9999/acceptance`,
    );
    assert.equal(unknownGet.response.status, 404);
    assert.deepEqual(Object.keys(unknownGet.payload), ['error']);
    assert.equal((await fetchJson(`${baseUrl}/api/snapshot`)).payload.snapshot.reworkPlanAcceptances, undefined);
    assert.equal((await fetchJson(endpoint, { method: 'GET' })).response.status, 405);
    assert.equal(
      (
        await fetchJson(
          `${baseUrl}/api/rework-plans/${encodeURIComponent(recordResult.reworkPlan.id)}/acceptance`,
          { method: 'POST' },
        )
      ).response.status,
      405,
    );
    const missingApiRequest = { ...request };
    delete missingApiRequest.previewId;
    for (const invalidBody of [
      missingApiRequest,
      { ...request, unexpected: true },
      { ...request, rationale: 'provider payload must not be stored' },
    ]) {
      const invalidApi = await fetchJson(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidBody),
      });
      assert.equal(invalidApi.response.status, 400);
      assert.deepEqual(Object.keys(invalidApi.payload), ['error']);
    }
    assert.equal(
      (
        await fetchJson(endpoint, {
          method: 'POST',
          body: '{}',
        })
      ).response.status,
      415,
    );
    assert.equal(
      (
        await fetchJson(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rationale: 'x'.repeat(9 * 1024) }),
        })
      ).response.status,
      413,
    );
    assert.deepEqual(fs.readFileSync(statePath), persistedBytes);

    process.stdout.write(`${JSON.stringify({ ok: true, mode: MODE, schemaVersion: 23, records: 1, idempotentReplay: true, sourceDriftRetained: true, snapshotExcluded: true, malformedGetBounded: true, sequenceAndTimestampValidated: true, sourceRefusalsCovered: ['missing-finding', 'widened-scope', 'qa-already-run', 'provider-backed', 'legacy-unbound', 'lineage-conflict'], rollbackEvidenceRetained: true }, null, 2)}\n`);
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(1000)]);
      if (server.exitCode === null) server.kill('SIGKILL');
    }
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

await main();
