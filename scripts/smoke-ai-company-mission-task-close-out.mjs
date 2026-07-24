import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import missionCloseOutModule from '../src/runtime/mission-close-outs.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const { computeMissionCloseOutDigest } = missionCloseOutModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = process.env.ORCHESTRATION_MISSION_CLOSE_OUT_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-mission-task-close-out-smoke');
const keepFixture = process.env.ORCHESTRATION_MISSION_CLOSE_OUT_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_MISSION_CLOSE_OUT_SEED_ONLY === '1';
const MODE = 'ai-company-mission-task-close-out-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);
}

function seedAcceptedPackage() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-delivery-package-acceptance.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DELIVERY_ACCEPTANCE_KEEP_FIXTURE: '1',
        ORCHESTRATION_DELIVERY_ACCEPTANCE_SEED_ONLY: '1',
        ORCHESTRATION_DELIVERY_ACCEPTANCE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed accepted package fixture');
  }
  const seed = JSON.parse(seeded.stdout);
  const runtime = createRuntimeService({
    runtimeRoot: seed.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  const accepted = runtime.acceptDeliveryPackage(seed.acceptanceRequest);
  const state = runtime.getSnapshot();
  const plan = state.executionPlans[seed.executionPlanId];
  const task = state.tasks[plan.controlTaskId];
  const request = {
    missionId: seed.deliveryPackage.missionId,
    linkedTaskId: task.id,
    executionPlanId: plan.id,
    deliveryPackageId: seed.deliveryPackage.id,
    deliveryPackageAcceptanceId: accepted.deliveryPackageAcceptance.id,
    previewId: seed.deliveryPackage.previewId,
    sourceDigest: seed.deliveryPackage.sourceDigest,
    packageDigest: seed.deliveryPackage.packageDigest,
    acceptanceDigest: accepted.deliveryPackageAcceptance.acceptanceDigest,
    checkpointId: seed.deliveryPackage.terminalCheckpointId,
    checkpointDigest: seed.deliveryPackage.terminalCheckpointDigest,
    decision: 'close-out',
  };
  return { ...seed, accepted, plan, request, runtime, task };
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
      'handoffPackets',
      'workflowCheckpoints',
      'deliveryPackages',
      'deliveryPackageAcceptances',
      'missionCloseOuts',
    ].map((key) => [key, Object.keys(state[key]).length]),
  );
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seeded = seedAcceptedPackage();
    const { runtime, request } = seeded;
    const statePath = path.join(seeded.runtimeRoot, 'state.json');
    const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
    const stateBefore = runtime.getSnapshot();
    const missionBefore = structuredClone(stateBefore.missions[request.missionId]);
    const taskBefore = structuredClone(stateBefore.tasks[request.linkedTaskId]);
    const packageBefore = structuredClone(stateBefore.deliveryPackages[request.deliveryPackageId]);
    const acceptanceBefore = structuredClone(
      stateBefore.deliveryPackageAcceptances[request.deliveryPackageAcceptanceId],
    );
    const sourceBefore = fs.readFileSync(sourcePath, 'utf8');
    assert.equal(stateBefore.schemaVersion, 18);
    assert.equal(missionBefore.status, 'executing');
    assert.equal(taskBefore.lifecycleState, 'Review');
    assert.equal(taskBefore.review.status, 'passed');
    assert.deepEqual(taskBefore.flags, {
      blocked: false,
      waitingApproval: false,
      waitingDecision: false,
    });
    assert.equal(stateBefore.executionPlans[request.executionPlanId].status, 'delivery-ready');
    assert.equal(
      stateBefore.executionPlans[request.executionPlanId].workOrderIds.every(
        (id) => stateBefore.workOrders[id].status === 'completed',
      ),
      true,
    );
    assert.deepEqual(stateBefore.missionCloseOuts, {});

    const schema10 = structuredClone(stateBefore);
    schema10.schemaVersion = 10;
    delete schema10.sequences.missionCloseOut;
    delete schema10.sequences.staffingPlan;
    delete schema10.missionCloseOuts;
    delete schema10.staffingPlans;
    const migrationRoot = path.join(tempRoot, 'migration-v10');
    writeState(migrationRoot, schema10);
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 18);
    assert.equal(migrated.sequences.missionCloseOut, 0);
    assert.deepEqual(migrated.missionCloseOuts, {});
    assert.deepEqual(migrated.missions[request.missionId], missionBefore);
    assert.deepEqual(migrated.tasks[request.linkedTaskId], taskBefore);
    assert.deepEqual(migrated.deliveryPackages[request.deliveryPackageId], packageBefore);
    assert.deepEqual(
      migrated.deliveryPackageAcceptances[request.deliveryPackageAcceptanceId],
      acceptanceBefore,
    );

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    const readEnvelope = runtime.getMissionCloseOut(request.missionId);
    assert.equal(readEnvelope.closeOutStatus, 'ready-for-close-out-review');
    assert.equal(readEnvelope.missionCloseOut, null);
    assert.equal(
      runtime.previewExecutionPlanDelivery({ executionPlanId: request.executionPlanId }).packageDigest,
      request.packageDigest,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);

    if (seedOnly) {
      process.stdout.write(`${JSON.stringify({
        ok: true,
        mode: MODE,
        seedOnly: true,
        runtimeRoot: seeded.runtimeRoot,
        projectPath: seeded.projectPath,
        missionId: request.missionId,
        executionPlanId: request.executionPlanId,
        deliveryPackage: packageBefore,
        deliveryPackageAcceptance: acceptanceBefore,
        closeOutRequest: request,
      }, null, 2)}\n`);
      return;
    }

    for (const field of [
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'checkpointId',
      'checkpointDigest',
    ]) {
      assertNoWrite(
        seeded.runtimeRoot,
        () => runtime.closeOutMissionAndTask({ ...request, [field]: `${request[field]}-stale` }),
        new RegExp(field),
      );
    }
    for (const invalidRequest of [
      { ...request, decision: 'complete' },
      { ...request, unexpected: true },
      Object.fromEntries(Object.entries(request).filter(([field]) => field !== 'packageDigest')),
    ]) {
      assertNoWrite(seeded.runtimeRoot, () => runtime.closeOutMissionAndTask(invalidRequest));
    }
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.transitionTaskLifecycle({ taskId: request.linkedTaskId, to: 'Done' }),
      /requires MissionCloseOut evidence/,
    );

    const syncBypassRoot = path.join(tempRoot, 'sync-bypass');
    const syncBypassState = structuredClone(stateBefore);
    syncBypassState.tasks[request.linkedTaskId].lifecycleState = 'Done';
    writeState(syncBypassRoot, syncBypassState);
    const syncBypassRuntime = createRuntimeService({ runtimeRoot: syncBypassRoot });
    assertNoWrite(
      syncBypassRoot,
      () => syncBypassRuntime.syncMissionExecutionStateFromTask({
        missionId: request.missionId,
        taskId: request.linkedTaskId,
      }),
      /requires MissionCloseOut evidence/,
    );

    const activeGateRoot = path.join(tempRoot, 'active-gate');
    const activeGateState = structuredClone(stateBefore);
    activeGateState.approvals[seeded.plan.approvalId].status = 'pending';
    writeState(activeGateRoot, activeGateState);
    const activeGateRuntime = createRuntimeService({ runtimeRoot: activeGateRoot });
    assertNoWrite(
      activeGateRoot,
      () => activeGateRuntime.closeOutMissionAndTask(request),
      /gates remain active/,
    );

    const countsBefore = snapshotCounts(stateBefore);
    let stateSaveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) stateSaveCount += 1;
      return originalRenameSync(source, target);
    };
    let result;
    try {
      result = runtime.closeOutMissionAndTask(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }
    assert.equal(stateSaveCount, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.closeOutStatus, 'closed-out');
    assert.equal(result.mission.status, 'completed');
    assert.equal(result.linkedTask.lifecycleState, 'Done');
    assert.equal(result.mission.updatedAt, result.missionCloseOut.createdAt);
    assert.equal(result.linkedTask.updatedAt, result.missionCloseOut.createdAt);
    assert.equal(result.missionCloseOut.decision, 'closed-out');
    assert.equal(
      result.missionCloseOut.closeOutDigest,
      computeMissionCloseOutDigest(result.missionCloseOut),
    );

    const stateAfter = runtime.getSnapshot();
    assert.equal(stateAfter.sequences.missionCloseOut, 1);
    assert.equal(Object.keys(stateAfter.missionCloseOuts).length, 1);
    assert.deepEqual(stateAfter.deliveryPackages[request.deliveryPackageId], packageBefore);
    assert.deepEqual(
      stateAfter.deliveryPackageAcceptances[request.deliveryPackageAcceptanceId],
      acceptanceBefore,
    );
    assert.deepEqual(snapshotCounts(stateAfter), { ...countsBefore, missionCloseOuts: 1 });
    for (const key of [
      'runs',
      'artifacts',
      'approvals',
      'decisionInboxItems',
      'executionPlans',
      'workOrders',
      'handoffPackets',
      'workflowCheckpoints',
      'deliveryPackages',
      'deliveryPackageAcceptances',
    ]) {
      assert.deepEqual(stateAfter[key], stateBefore[key]);
    }
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBefore);
    assert.ok(
      Object.values(stateAfter.artifacts).every(
        (artifact) => !['commit-package', 'commit-result', 'release-package', 'close-out'].includes(artifact.type),
      ),
    );

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.closeOutMissionAndTask(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.missionCloseOut, result.missionCloseOut);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.closeOutMissionAndTask({ ...request, packageDigest: '0'.repeat(64) }),
      /does not match terminal evidence/,
    );
    assert.equal(runtime.transitionTaskLifecycle({ taskId: request.linkedTaskId, to: 'Done' }).id, request.linkedTaskId);
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.transitionTaskLifecycle({ taskId: request.linkedTaskId, to: 'Review' }),
      /cannot reopen/,
    );
    assert.equal(
      runtime.syncMissionExecutionStateFromTask({
        missionId: request.missionId,
        taskId: request.linkedTaskId,
      }).status,
      'completed',
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);

    const reloaded = createRuntimeService({
      runtimeRoot: seeded.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    const terminalEnvelope = reloaded.getMissionCloseOut(request.missionId);
    assert.deepEqual(terminalEnvelope.missionCloseOut, result.missionCloseOut);
    assert.equal(terminalEnvelope.mission.status, 'completed');
    assert.equal(terminalEnvelope.linkedTask.lifecycleState, 'Done');

    const invalidCases = [
      ['extra-field', (state) => {
        state.missionCloseOuts[result.missionCloseOut.id].rawOutput = 'forbidden';
      }, /unexpected or missing fields/],
      ['digest', (state) => {
        state.missionCloseOuts[result.missionCloseOut.id].closeOutDigest = '0'.repeat(64);
      }, /closeOutDigest/],
      ['duplicate', (state) => {
        const duplicate = structuredClone(result.missionCloseOut);
        duplicate.id = 'mission-close-out-0002';
        state.sequences.missionCloseOut = 2;
        state.missionCloseOuts[duplicate.id] = duplicate;
      }, /duplicates Mission close-out/],
      ['transition', (state) => {
        state.missionCloseOuts[result.missionCloseOut.id].taskLifecycleTransition = 'Done';
      }, /invalid terminal transition/],
      ['mission-status', (state) => {
        state.missions[request.missionId].status = 'executing';
      }, /invalid Mission terminal binding/],
      ['review-required', (state) => {
        state.tasks[request.linkedTaskId].review.required = false;
      }, /invalid linked task terminal binding/],
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
    const partialRoot = path.join(tempRoot, 'partial-v11');
    const partial = structuredClone(stateAfter);
    delete partial.missionCloseOuts;
    writeState(partialRoot, partial);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadState(),
      /missing MissionCloseOut fields/,
    );
    const futureRoot = path.join(tempRoot, 'future');
    writeState(futureRoot, { ...stateAfter, schemaVersion: 19 });
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadState(),
      /Unsupported runtime state/,
    );

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      migration: {
        from: 10,
        to: 11,
        closeOutBootstrap: false,
        lifecycleTransitionOnMigration: false,
      },
      closeOut: {
        missionCloseOutId: result.missionCloseOut.id,
        exactTupleBound: true,
        stateSaveCount,
        idempotent: true,
        concurrentExactRequestsConverge: 'covered by API smoke',
        reloadVerified: true,
      },
      unchanged: {
        packageImmutable: true,
        acceptanceImmutable: true,
        standaloneCloseOutInvoked: false,
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
