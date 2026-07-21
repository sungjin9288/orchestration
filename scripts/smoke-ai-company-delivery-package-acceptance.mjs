import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import acceptanceModule from '../src/runtime/delivery-package-acceptances.js';
import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { computeDeliveryPackageAcceptanceDigest } = acceptanceModule;
const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = process.env.ORCHESTRATION_DELIVERY_ACCEPTANCE_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-delivery-package-acceptance-smoke');
const keepFixture = process.env.ORCHESTRATION_DELIVERY_ACCEPTANCE_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_DELIVERY_ACCEPTANCE_SEED_ONLY === '1';
const MODE = 'ai-company-delivery-package-acceptance-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);
}

function seedReviewRequiredPackage() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-durable-delivery-package.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DURABLE_DELIVERY_KEEP_FIXTURE: '1',
        ORCHESTRATION_DURABLE_DELIVERY_SEED_ONLY: '1',
        ORCHESTRATION_DURABLE_DELIVERY_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed reviewed delivery fixture');
  }
  const seed = JSON.parse(seeded.stdout);
  const runtime = createRuntimeService({
    runtimeRoot: seed.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  const tuple = {
    executionPlanId: seed.executionPlanId,
    previewId: seed.preview.id,
    sourceDigest: seed.preview.sourceDigest,
    packageDigest: seed.preview.packageDigest,
    checkpointId: seed.preview.terminalCheckpointId,
    checkpointDigest: seed.preview.terminalCheckpointDigest,
  };
  const persisted = runtime.persistExecutionPlanDeliveryPackage(tuple);
  return { ...seed, runtime, tuple, deliveryPackage: persisted.deliveryPackage };
}

function withoutAcceptanceState(state) {
  const clone = structuredClone(state);
  clone.sequences.deliveryPackageAcceptance = 0;
  clone.deliveryPackageAcceptances = {};
  return clone;
}

function snapshotCounts(state) {
  return Object.fromEntries(
    [
      'missions',
      'tasks',
      'runs',
      'artifacts',
      'approvals',
      'decisionInboxItems',
      'executionPlans',
      'workOrders',
      'workflowCheckpoints',
      'deliveryPackages',
    ].map((key) => [key, Object.keys(state[key]).length]),
  );
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seeded = seedReviewRequiredPackage();
    const { runtime, deliveryPackage } = seeded;
    const statePath = path.join(seeded.runtimeRoot, 'state.json');
    const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
    const stateBefore = runtime.getSnapshot();
    const packageBefore = structuredClone(stateBefore.deliveryPackages[deliveryPackage.id]);
    const sourceBefore = fs.readFileSync(sourcePath, 'utf8');
    assert.equal(stateBefore.schemaVersion, 14);
    assert.equal(stateBefore.sequences.deliveryPackageAcceptance, 0);
    assert.deepEqual(stateBefore.deliveryPackageAcceptances, {});

    const schema9 = structuredClone(stateBefore);
    schema9.schemaVersion = 9;
    delete schema9.sequences.deliveryPackageAcceptance;
    delete schema9.deliveryPackageAcceptances;
    const migrationRoot = path.join(tempRoot, 'migration-v9');
    writeState(migrationRoot, schema9);
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 14);
    assert.equal(migrated.sequences.deliveryPackageAcceptance, 0);
    assert.deepEqual(migrated.deliveryPackageAcceptances, {});
    assert.equal(migrated.sequences.missionCloseOut, 0);
    assert.deepEqual(migrated.missionCloseOuts, {});
    assert.deepEqual(migrated.deliveryPackages[deliveryPackage.id], packageBefore);
    assert.deepEqual(migrated.workflowCheckpoints, schema9.workflowCheckpoints);

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    assert.equal(runtime.getDeliveryPackageAcceptance(deliveryPackage.id).acceptance, null);
    assert.deepEqual(
      runtime.previewExecutionPlanDelivery({ executionPlanId: deliveryPackage.executionPlanId }),
      seeded.preview,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);

    const exactRequest = {
      deliveryPackageId: deliveryPackage.id,
      previewId: deliveryPackage.previewId,
      sourceDigest: deliveryPackage.sourceDigest,
      packageDigest: deliveryPackage.packageDigest,
      checkpointId: deliveryPackage.terminalCheckpointId,
      checkpointDigest: deliveryPackage.terminalCheckpointDigest,
      decision: 'accept',
    };
    if (seedOnly) {
      process.stdout.write(`${JSON.stringify({
        ok: true,
        mode: MODE,
        seedOnly: true,
        runtimeRoot: seeded.runtimeRoot,
        projectPath: seeded.projectPath,
        executionPlanId: deliveryPackage.executionPlanId,
        preview: seeded.preview,
        deliveryPackage,
        acceptanceRequest: exactRequest,
      }, null, 2)}\n`);
      return;
    }

    for (const field of [
      'previewId',
      'sourceDigest',
      'packageDigest',
      'checkpointId',
      'checkpointDigest',
    ]) {
      const beforeInvalid = fs.readFileSync(statePath, 'utf8');
      assert.throws(
        () => runtime.acceptDeliveryPackage({
          ...exactRequest,
          [field]: `${exactRequest[field]}-stale`,
        }),
        new RegExp(field),
      );
      assert.equal(fs.readFileSync(statePath, 'utf8'), beforeInvalid);
    }
    for (const invalidRequest of [
      { ...exactRequest, decision: 'reject' },
      { ...exactRequest, unexpected: true },
      Object.fromEntries(Object.entries(exactRequest).filter(([field]) => field !== 'packageDigest')),
    ]) {
      const beforeInvalid = fs.readFileSync(statePath, 'utf8');
      assert.throws(() => runtime.acceptDeliveryPackage(invalidRequest));
      assert.equal(fs.readFileSync(statePath, 'utf8'), beforeInvalid);
    }

    const countsBefore = snapshotCounts(stateBefore);
    const result = runtime.acceptDeliveryPackage(exactRequest);
    assert.equal(result.idempotent, false);
    assert.equal(result.reviewStatus, 'accepted');
    assert.equal(result.deliveryPackageAcceptance.decision, 'accepted');
    assert.equal(
      result.deliveryPackageAcceptance.acceptanceDigest,
      computeDeliveryPackageAcceptanceDigest(result.deliveryPackageAcceptance),
    );
    assert.deepEqual(result.deliveryPackage, packageBefore);
    assert.equal(result.executionPlan.status, 'delivery-ready');
    assert.equal(result.mission.status, 'executing');
    assert.notEqual(result.controlTask.lifecycleState, 'Done');

    const stateAfter = runtime.getSnapshot();
    assert.equal(stateAfter.sequences.deliveryPackageAcceptance, 1);
    assert.equal(Object.keys(stateAfter.deliveryPackageAcceptances).length, 1);
    assert.deepEqual(stateAfter.deliveryPackages[deliveryPackage.id], packageBefore);
    assert.deepEqual(snapshotCounts(stateAfter), countsBefore);
    assert.deepEqual(withoutAcceptanceState(stateAfter), withoutAcceptanceState(stateBefore));
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBefore);
    assert.ok(
      Object.values(stateAfter.artifacts).every(
        (artifact) => !['commit-package', 'commit-result', 'release-package', 'close-out'].includes(artifact.type),
      ),
    );

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.acceptDeliveryPackage(exactRequest);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.deliveryPackageAcceptance, result.deliveryPackageAcceptance);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);

    const reloaded = createRuntimeService({
      runtimeRoot: seeded.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    const envelope = reloaded.getDeliveryPackageAcceptance(deliveryPackage.id);
    assert.equal(envelope.reviewStatus, 'accepted');
    assert.deepEqual(envelope.acceptance, result.deliveryPackageAcceptance);
    assert.deepEqual(envelope.deliveryPackage, packageBefore);

    const invalidCases = [
      ['extra-field', (state) => {
        state.deliveryPackageAcceptances[result.deliveryPackageAcceptance.id].rawOutput = 'forbidden';
      }, /unexpected or missing fields/],
      ['digest', (state) => {
        state.deliveryPackageAcceptances[result.deliveryPackageAcceptance.id].acceptanceDigest = '0'.repeat(64);
      }, /acceptanceDigest/],
      ['duplicate', (state) => {
        const duplicate = structuredClone(result.deliveryPackageAcceptance);
        duplicate.id = 'delivery-package-acceptance-0002';
        state.sequences.deliveryPackageAcceptance = 2;
        state.deliveryPackageAcceptances[duplicate.id] = duplicate;
      }, /duplicates DeliveryPackage acceptance/],
    ];
    for (const [name, mutate, pattern] of invalidCases) {
      const invalidRoot = path.join(tempRoot, `invalid-${name}`);
      const invalidState = structuredClone(stateAfter);
      mutate(invalidState);
      writeState(invalidRoot, invalidState);
      const beforeInvalid = fs.readFileSync(path.join(invalidRoot, 'state.json'), 'utf8');
      assert.throws(() => createFileStore({ runtimeRoot: invalidRoot }).loadState(), pattern);
      assert.equal(fs.readFileSync(path.join(invalidRoot, 'state.json'), 'utf8'), beforeInvalid);
    }
    const partialRoot = path.join(tempRoot, 'partial-v10');
    const partial = structuredClone(stateAfter);
    delete partial.deliveryPackageAcceptances;
    writeState(partialRoot, partial);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadState(),
      /missing DeliveryPackageAcceptance fields/,
    );
    const futureRoot = path.join(tempRoot, 'future');
    writeState(futureRoot, { ...stateAfter, schemaVersion: 15 });
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadState(),
      /Unsupported runtime state/,
    );

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      migration: {
        from: 9,
        to: 12,
        acceptanceBootstrap: false,
        packagePreserved: true,
      },
      acceptance: {
        acceptanceId: result.deliveryPackageAcceptance.id,
        decision: result.deliveryPackageAcceptance.decision,
        exactTupleBound: true,
        idempotent: true,
        reloadVerified: true,
      },
      unchanged: {
        packageDigestStable: true,
        missionStatus: reloaded.getMission(deliveryPackage.missionId).status,
        executionPlanStatus: reloaded.getExecutionPlan(deliveryPackage.executionPlanId).executionPlan.status,
        taskDone: false,
        sourceMutation: false,
        downstreamAuthority: false,
      },
    }, null, 2)}\n`);
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
