import assert from 'node:assert/strict';
import fs from 'node:fs';

import acceptanceModule from '../src/runtime/rework-delivery-package-acceptances.js';
import fileStoreModule from '../src/runtime/file-store.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildPersistRequest,
  readState,
  runDurableRuntimeSmoke,
  runRuntimeSmoke,
  withLocalApiServer,
  writeState,
} from './smoke-ai-company-durable-rework-delivery-package.mjs';
import {
  statePath,
  targetPath,
  projectPath,
  runtimeRoot,
  tempRoot,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const {
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_REQUEST_KEYS,
  assertReworkDeliveryPackageAcceptanceRecord,
  computeReworkDeliveryPackageAcceptanceDigest,
} = acceptanceModule;
const { createFileStore } = fileStoreModule;
const MODE = 'ai-company-rework-delivery-package-acceptance-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function buildAcceptanceRequest(persistRequest, record) {
  return {
    reworkPlanId: record.reworkPlanId,
    qaWorkOrderAttemptId: record.qaWorkOrderAttemptId,
    qaWorkOrderAttemptRecordDigest:
      persistRequest.qaWorkOrderAttemptRecordDigest,
    qaRunId: record.qaRunId,
    qaEvidenceArtifactId: record.qaEvidenceArtifactId,
    deliveryReadyCheckpointId: record.terminalCheckpointId,
    checkpointDigest: record.terminalCheckpointDigest,
    sourceDigest: record.sourceDigest,
    qaInputDigest: record.qaInputDigest,
    evaluatedAt: record.previewEvaluatedAt,
    previewId: record.previewId,
    previewDigest: record.previewDigest,
    reworkDeliveryEvidenceDigest: record.reworkDeliveryEvidenceDigest,
    reworkDeliveryPackageRecordDigest: record.recordDigest,
    decision: 'accept',
  };
}

function downgradeToSchemaV25() {
  const state = readState();
  state.schemaVersion = 25;
  delete state.sequences.reworkDeliveryPackageAcceptance;
  delete state.reworkDeliveryPackageAcceptances;
  writeState(state);
}

function comparableSourceState(state) {
  const copy = structuredClone(state);
  delete copy.schemaVersion;
  delete copy.sequences.reworkDeliveryPackageAcceptance;
  delete copy.reworkDeliveryPackageAcceptances;
  delete copy.sequences.opsAttemptDisposition;
  delete copy.opsAttemptDispositions;
  return copy;
}

async function expectRejected(run, pattern) {
  await assert.rejects(run, pattern);
}

async function main() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const { context, preview, request } = await runRuntimeSmoke();
    const { persistRequest, record } = await runDurableRuntimeSmoke(
      context,
      request,
      preview,
    );
    const acceptanceRequest = buildAcceptanceRequest(persistRequest, record);
    assert.deepEqual(
      Object.keys(acceptanceRequest).sort(),
      [...REWORK_DELIVERY_PACKAGE_ACCEPTANCE_REQUEST_KEYS].sort(),
    );

    downgradeToSchemaV25();
    const schemaV25State = readState();
    const targetFilePath = `${projectPath}/${targetPath}`;
    const targetBefore = fs.readFileSync(targetFilePath);
    fs.appendFileSync(targetFilePath, '\n// stale before acceptance\n');
    const staleBytes = fs.readFileSync(statePath);
    await expectRejected(
      async () =>
        context.runtime.acceptReworkDeliveryPackage(record.id, acceptanceRequest),
      /source-current|digest|source|targets/i,
    );
    assert.deepEqual(fs.readFileSync(statePath), staleBytes);
    fs.writeFileSync(targetFilePath, targetBefore);

    const accepted = context.runtime.acceptReworkDeliveryPackage(
      record.id,
      acceptanceRequest,
    );
    assert.equal(accepted.idempotent, false);
    assert.equal(accepted.reviewStatus, 'accepted');
    assert.deepEqual(accepted.reworkDeliveryPackage, record);
    const acceptance = accepted.reworkDeliveryPackageAcceptance;
    assertReworkDeliveryPackageAcceptanceRecord(acceptance);
    assert.equal(
      acceptance.acceptanceDigest,
      computeReworkDeliveryPackageAcceptanceDigest(acceptance),
    );
    assert.equal(acceptance.decision, 'accepted');
    assert.equal(
      acceptance.authoritySummary.packageAcceptanceEvidenceAllowed,
      true,
    );
    assert.equal(
      Object.entries(acceptance.authoritySummary).every(
        ([key, value]) =>
          key === 'packageAcceptanceEvidenceAllowed'
            ? value === true
            : value === false,
      ),
      true,
    );

    const schemaV26State = readState();
    assert.equal(schemaV26State.schemaVersion, 27);
    assert.equal(schemaV26State.sequences.reworkDeliveryPackageAcceptance, 1);
    assert.equal(
      Object.keys(schemaV26State.reworkDeliveryPackageAcceptances).length,
      1,
    );
    assert.deepEqual(
      comparableSourceState(schemaV26State),
      comparableSourceState(schemaV25State),
    );
    assert.deepEqual(schemaV26State.reworkDeliveryPackages[record.id], record);

    const inspection =
      context.runtime.getReworkDeliveryPackageAcceptance(record.id);
    assert.equal(inspection.reviewStatus, 'accepted');
    assert.deepEqual(inspection.reworkDeliveryPackage, record);
    assert.deepEqual(
      inspection.reworkDeliveryPackageAcceptance,
      acceptance,
    );
    const snapshot = context.runtime.getSnapshot();
    assert.equal('reworkDeliveryPackageAcceptances' in snapshot, false);

    fs.appendFileSync(targetFilePath, '\n// drift after acceptance\n');
    const acceptedBytes = fs.readFileSync(statePath);
    const replay = context.runtime.acceptReworkDeliveryPackage(
      record.id,
      acceptanceRequest,
    );
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.reworkDeliveryPackageAcceptance, acceptance);
    assert.deepEqual(fs.readFileSync(statePath), acceptedBytes);

    const divergent = {
      ...acceptanceRequest,
      previewDigest: 'f'.repeat(64),
    };
    await expectRejected(
      async () => context.runtime.acceptReworkDeliveryPackage(record.id, divergent),
      /exact immutable package|different acceptance/i,
    );
    assert.deepEqual(fs.readFileSync(statePath), acceptedBytes);
    fs.writeFileSync(targetFilePath, targetBefore);

    for (const malformed of [
      { ...acceptanceRequest, decision: 'reject' },
      { ...acceptanceRequest, rawBody: 'forbidden' },
      Object.fromEntries(
        Object.entries(acceptanceRequest).filter(([key]) => key !== 'decision'),
      ),
    ]) {
      await expectRejected(
        async () => context.runtime.acceptReworkDeliveryPackage(record.id, malformed),
        /decision|unexpected|missing/i,
      );
      assert.deepEqual(fs.readFileSync(statePath), acceptedBytes);
    }

    await withLocalApiServer(async (baseUrl) => {
      const replayResponse = await fetch(
        `${baseUrl}/api/rework-delivery-packages/${encodeURIComponent(record.id)}/accept`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(acceptanceRequest),
        },
      );
      assert.equal(replayResponse.status, 200);
      assert.equal((await replayResponse.json()).idempotent, true);

      const inspectionResponse = await fetch(
        `${baseUrl}/api/rework-delivery-packages/${encodeURIComponent(record.id)}/acceptance`,
      );
      assert.equal(inspectionResponse.status, 200);
      const payload = await inspectionResponse.json();
      assert.equal(payload.reviewStatus, 'accepted');
      assert.equal(
        payload.reworkDeliveryPackageAcceptance.acceptanceDigest,
        acceptance.acceptanceDigest,
      );

      const invalidResponse = await fetch(
        `${baseUrl}/api/rework-delivery-packages/${encodeURIComponent(record.id)}/accept`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...acceptanceRequest, extra: true }),
        },
      );
      assert.equal(invalidResponse.status, 400);
    });

    const validBytes = fs.readFileSync(statePath);
    const partial = readState();
    delete partial.reworkDeliveryPackageAcceptances;
    writeState(partial);
    assert.throws(
      () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
      /missing ReworkDeliveryPackageAcceptance fields/,
    );
    fs.writeFileSync(statePath, validBytes);
    const future = readState();
    future.schemaVersion = 28;
    writeState(future);
    assert.throws(
      () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion: 28/,
    );
    fs.writeFileSync(statePath, validBytes);
    assert.equal(
      context.runtime.getReworkDeliveryPackageAcceptance(record.id)
        .reviewStatus,
      'accepted',
    );

    process.stdout.write(
      `${JSON.stringify({
        ok: true,
        mode: MODE,
        schemaVersion: 26,
        requestFieldCount: 15,
        reworkDeliveryPackageId: record.id,
        acceptanceId: acceptance.id,
        proofs: {
          additiveMigration: true,
          noPassiveCreation: true,
          freshSourceRecompute: true,
          immutablePackageAndSources: true,
          canonicalDigestAndUniqueness: true,
          exactReplayBeforeSourceRecompute: true,
          sourceDriftRetention: true,
          exactInspectionAndSnapshotExclusion: true,
          malformedPartialAndFutureRefused: true,
          apiTransport: true,
          downstreamAuthorityClosed: true,
        },
      }, null, 2)}\n`,
    );
  } finally {
    fs.rmSync(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 50,
    });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
