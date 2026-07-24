import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import staffingEntryModule from '../src/runtime/staffing-entries.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const {
  STAFFING_ENTRY_BLOCKED_ACTIONS,
  computeStaffingEntryApprovalDigest,
  computeStaffingEntryRecordDigest,
  computeStaffingEntrySourceDigest,
} = staffingEntryModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot =
  process.env.ORCHESTRATION_STAFFING_ENTRY_BINDING_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-staffing-entry-binding-smoke');
const keepFixture =
  process.env.ORCHESTRATION_STAFFING_ENTRY_BINDING_KEEP_FIXTURE === '1';
const MODE = 'ai-company-staffing-entry-binding-smoke';
const COUNCIL_AGENT_IDS = [
  'agent-conductor',
  'agent-strategist',
  'agent-architect',
  'agent-decomposer',
];

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createRuntime(runtimeRoot, options = {}) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: path.join(repoRoot, 'company', 'blueprint.json'),
    companyRepoRoot: repoRoot,
    ...options,
  });
}

function readState(runtimeRoot) {
  return JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'));
}

function readStateBytes(runtimeRoot) {
  return fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8');
}

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function copyState(sourceRoot, targetRoot, mutate = (state) => state) {
  const state = mutate(structuredClone(readState(sourceRoot)));
  writeState(targetRoot, state);
  return state;
}

function toSchemaV17(state) {
  state.schemaVersion = 17;
  delete state.sequences.staffingEntry;
  delete state.staffingEntries;
  for (const mission of Object.values(state.missions)) {
    delete mission.staffingEntryId;
  }
  delete state.companyRuntime;
  return state;
}

function createStaffingSpec() {
  return {
    mode: 'council',
    selectedAgentIds: [...COUNCIL_AGENT_IDS],
    selectionRationale:
      'Bind the exact current local Council roster to one human-alignment attempt.',
    parallelGroups: [],
    providerMode: 'local-stub',
    terminationPolicy: {
      maxProviderCalls: 0,
      maxTurnsPerAgent: 4,
      deadlineMs: 120000,
      stopOnRequiredRoleFailure: true,
    },
  };
}

function prepareAcceptedPlan(runtime, label) {
  const project =
    runtime.getSnapshot().activeProjectId === null
      ? runtime.createProject({
          name: `StaffingEntry ${label}`,
          projectPath: repoRoot,
        })
      : runtime.getProject(runtime.getSnapshot().activeProjectId);
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Bind ${label} Council entry`,
    goal: 'Run one deterministic local Council attempt and stop at human alignment.',
    constraints: 'No WorkOrder, scheduling, provider, source, Git, or release authority.',
  });
  const evaluatedAt = new Date().toISOString();
  const staffingSpec = createStaffingSpec();
  const preview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const accepted = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    sourceDigest: preview.sourceDigest,
    missionDigest: preview.missionDigest,
    blueprintDigest: preview.blueprintDigest,
    staffingSpecDigest: preview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept this exact source-current plan as immutable local evidence.',
      reviewedAt: evaluatedAt,
    },
  });
  return {
    mission,
    project,
    staffingPlan: accepted.staffingPlan,
  };
}

function createEntryRequest(staffingPlan, requestedAt = new Date().toISOString()) {
  return {
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Enter one exact deterministic local Council attempt.',
      requestedAt,
    },
  };
}

function countAtomicSaves(statePath, operation) {
  const originalRenameSync = fs.renameSync;
  let saves = 0;
  fs.renameSync = (source, target) => {
    if (path.resolve(target) === path.resolve(statePath)) saves += 1;
    return originalRenameSync(source, target);
  };
  try {
    return { result: operation(), saves };
  } finally {
    fs.renameSync = originalRenameSync;
  }
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const before = readStateBytes(runtimeRoot);
  assert.throws(operation, pattern);
  assert.equal(readStateBytes(runtimeRoot), before);
}

function assertNoDownstreamRecords(state) {
  for (const field of [
    'tasks',
    'runs',
    'artifacts',
    'approvals',
    'executionPlans',
    'workOrders',
    'handoffPackets',
    'workflowCheckpoints',
  ]) {
    assert.deepEqual(state[field], {}, `${field} must remain empty`);
  }
}

async function main() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  const runtimeRoot = path.join(tempRoot, 'runtime');

  try {
    const seedRuntime = createRuntime(runtimeRoot);
    const prepared = prepareAcceptedPlan(seedRuntime, 'primary');
    const immutablePlan = structuredClone(prepared.staffingPlan);
    writeState(runtimeRoot, toSchemaV17(readState(runtimeRoot)));
    const schemaV17Bytes = readStateBytes(runtimeRoot);
    const runtime = createRuntime(runtimeRoot);
    const entryRequest = createEntryRequest(prepared.staffingPlan);

    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.enterStaffingPlanCouncil({
          ...entryRequest,
          sourceDigest: '0'.repeat(64),
        }),
      /sourceDigest does not match/,
    );
    assert.equal(readStateBytes(runtimeRoot), schemaV17Bytes);
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.startRealCouncilForMission({
          missionId: prepared.mission.id,
          mode: 'real-local-stub',
        }),
      /accepted StaffingPlan Council entry/,
    );

    const statePath = path.join(runtimeRoot, 'state.json');
    const createdSave = countAtomicSaves(statePath, () =>
      runtime.enterStaffingPlanCouncil(entryRequest),
    );
    const created = createdSave.result;
    assert.equal(createdSave.saves, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.staffingEntry.id, 'staffing-entry-0001');
    assert.equal(created.staffingEntry.status, 'bound');
    assert.equal(created.staffingEntry.entryKind, 'real-council');
    assert.deepEqual(created.staffingEntry.selectedAgentIds, [...COUNCIL_AGENT_IDS].sort());
    assert.deepEqual(created.staffingEntry.selectedRoles, [
      'architect',
      'conductor',
      'decomposer',
      'strategist',
    ]);
    assert.equal(created.staffingEntry.providerMode, 'local-stub');
    assert.equal(created.staffingEntry.terminationPolicy.maxProviderCalls, 0);
    assert.deepEqual(created.staffingEntry.blockedActions, STAFFING_ENTRY_BLOCKED_ACTIONS);
    assert.equal(created.councilSession.phase, 'awaiting-alignment');
    assert.equal(created.councilSession.status, 'pending-alignment');
    assert.equal(created.councilSession.attempts.length, 1);
    assert.equal(created.councilSession.attempts[0].status, 'awaiting-alignment');
    assert.deepEqual(created.councilSession.staffingEntryRef, {
      staffingEntryId: created.staffingEntry.id,
      entrySourceDigest: created.staffingEntry.entrySourceDigest,
      staffingPlanId: prepared.staffingPlan.id,
      staffingPlanRecordDigest: prepared.staffingPlan.recordDigest,
    });
    assert.equal(
      created.staffingEntry.entryApprovalDigest,
      computeStaffingEntryApprovalDigest(created.staffingEntry.entryApproval),
    );
    assert.equal(
      created.staffingEntry.entrySourceDigest,
      computeStaffingEntrySourceDigest(
        prepared.staffingPlan,
        created.staffingEntry.entryApprovalDigest,
      ),
    );
    assert.equal(
      created.staffingEntry.recordDigest,
      computeStaffingEntryRecordDigest(created.staffingEntry),
    );

    const persisted = readState(runtimeRoot);
    assert.equal(persisted.schemaVersion, 19);
    assert.equal(persisted.sequences.staffingEntry, 1);
    assert.equal(persisted.sequences.councilSession, 1);
    assert.equal(
      persisted.missions[prepared.mission.id].staffingEntryId,
      created.staffingEntry.id,
    );
    assert.equal(
      persisted.missions[prepared.mission.id].councilSessionId,
      created.councilSession.id,
    );
    assert.equal(persisted.missions[prepared.mission.id].status, 'aligning');
    assert.deepEqual(persisted.staffingPlans[prepared.staffingPlan.id], immutablePlan);
    assertNoDownstreamRecords(persisted);

    const replaySave = countAtomicSaves(statePath, () =>
      runtime.enterStaffingPlanCouncil(entryRequest),
    );
    assert.equal(replaySave.result.idempotent, true);
    assert.equal(replaySave.saves, 0);
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.enterStaffingPlanCouncil({
          ...entryRequest,
          entryApproval: {
            ...entryRequest.entryApproval,
            rationale: 'Divergent replay must fail.',
          },
        }),
      /entryApproval does not match/,
    );

    const inspected = runtime.getStaffingEntry(created.staffingEntry.id);
    assert.equal(inspected.persisted, true);
    assert.equal(inspected.staffingEntry.recordDigest, created.staffingEntry.recordDigest);
    assert.equal(inspected.councilSession.id, created.councilSession.id);
    const reloaded = createRuntime(runtimeRoot).getStaffingEntry(created.staffingEntry.id);
    assert.equal(reloaded.staffingEntry.recordDigest, created.staffingEntry.recordDigest);

    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.resumeRealCouncilSession({
          councilSessionId: created.councilSession.id,
        }),
      /cannot resume/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.decideRealCouncilSession({
          councilSessionId: created.councilSession.id,
          action: 'request-revision',
          note: 'No revision authority.',
          targetAgentIds: ['agent-strategist'],
        }),
      /cannot request revision/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.previewMissionWorkOrders({
          councilSessionId: created.councilSession.id,
          compileSpec: {},
        }),
      /requires one approved source-bound Council synthesis/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.persistMissionWorkOrderPlan({
          councilSessionId: created.councilSession.id,
          compileSpec: {},
          previewId: 'blocked',
          sourceDigest: 'blocked',
        }),
      /requires one approved source-bound Council synthesis/,
    );

    const approved = runtime.decideRealCouncilSession({
      councilSessionId: created.councilSession.id,
      action: 'approve',
    });
    assert.equal(approved.councilSession.status, 'approved');
    assert.equal(approved.mission.status, 'aligned');
    assert.equal(approved.mission.linkedTaskId, null);
    assertNoDownstreamRecords(readState(runtimeRoot));

    const stopPrepared = prepareAcceptedPlan(runtime, 'stop');
    const stoppedEntry = runtime.enterStaffingPlanCouncil(
      createEntryRequest(stopPrepared.staffingPlan),
    );
    const stopped = runtime.decideRealCouncilSession({
      councilSessionId: stoppedEntry.councilSession.id,
      action: 'stop',
    });
    assert.equal(stopped.councilSession.status, 'stopped');
    assert.equal(stopped.mission.status, 'blocked');
    assertNoDownstreamRecords(readState(runtimeRoot));

    const legacyMission = runtime.createMission({
      projectId: prepared.project.id,
      title: 'Historical deterministic compatibility',
      goal: 'Keep the legacy deterministic Council path available.',
      constraints: 'No Real Council entry.',
    });
    const legacy = runtime.createCouncilSessionForMission({
      missionId: legacyMission.id,
    });
    assert.equal(legacy.councilSession.mode, undefined);
    assert.equal(
      runtime.getCouncilProviderReadiness({ projectId: prepared.project.id }).mode,
      'real-openai-responses',
    );

    const failedRoot = path.join(tempRoot, 'failed-attempt');
    const failedSeed = createRuntime(failedRoot);
    const failedPrepared = prepareAcceptedPlan(failedSeed, 'failed');
    writeState(failedRoot, toSchemaV17(readState(failedRoot)));
    const failedRuntime = createRuntime(failedRoot, {
      councilAdapter: {
        id: 'failing-local-stub',
        mode: 'local-stub',
        executePosition() {
          throw new Error('synthetic position failure');
        },
        executeSynthesis() {
          throw new Error('synthesis must not run');
        },
      },
    });
    assertNoWrite(
      failedRoot,
      () =>
        failedRuntime.enterStaffingPlanCouncil(
          createEntryRequest(failedPrepared.staffingPlan),
        ),
      /did not reach human alignment/,
    );
    assert.equal(readState(failedRoot).schemaVersion, 17);

    const nonLocalRoot = path.join(tempRoot, 'non-local-adapter');
    const nonLocalSeed = createRuntime(nonLocalRoot);
    const nonLocalPrepared = prepareAcceptedPlan(nonLocalSeed, 'non-local');
    writeState(nonLocalRoot, toSchemaV17(readState(nonLocalRoot)));
    const nonLocalRuntime = createRuntime(nonLocalRoot, {
      councilAdapter: {
        id: 'synthetic-provider-adapter',
        mode: 'openai-responses',
        executePosition() {
          throw new Error('non-local adapter must not execute');
        },
        executeSynthesis() {
          throw new Error('non-local adapter must not execute');
        },
      },
    });
    assertNoWrite(
      nonLocalRoot,
      () =>
        nonLocalRuntime.enterStaffingPlanCouncil(
          createEntryRequest(nonLocalPrepared.staffingPlan),
        ),
      /requires the local-stub adapter/,
    );
    assert.equal(readState(nonLocalRoot).schemaVersion, 17);

    const futureRoot = path.join(tempRoot, 'future-schema');
    copyState(runtimeRoot, futureRoot, (state) => {
      state.schemaVersion = 20;
      return state;
    });
    const futureBytes = readStateBytes(futureRoot);
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion: 20/,
    );
    assert.equal(readStateBytes(futureRoot), futureBytes);

    const partialRoot = path.join(tempRoot, 'partial-schema');
    copyState(runtimeRoot, partialRoot, (state) => {
      delete state.staffingEntries;
      return state;
    });
    const partialBytes = readStateBytes(partialRoot);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadStateSupportedReadonly(),
      /missing StaffingEntry fields/,
    );
    assert.equal(readStateBytes(partialRoot), partialBytes);

    const orphanRoot = path.join(tempRoot, 'orphan-entry');
    copyState(runtimeRoot, orphanRoot, (state) => {
      const session = Object.values(state.councilSessions).find(
        (entry) => entry.staffingEntryRef,
      );
      session.staffingEntryRef.staffingEntryId = 'staffing-entry-9999';
      return state;
    });
    const orphanBytes = readStateBytes(orphanRoot);
    assert.throws(
      () => createFileStore({ runtimeRoot: orphanRoot }).loadStateSupportedReadonly(),
      /StaffingEntryRef|staffingEntryRef|StaffingEntry reference/,
    );
    assert.equal(readStateBytes(orphanRoot), orphanBytes);

    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: 19,
          staffingEntryId: created.staffingEntry.id,
          councilSessionId: created.councilSession.id,
          exactReplay: 'no-write',
          atomicMigrationSaveCount: createdSave.saves,
          stoppedAt: 'human-alignment',
          blocked: [
            'unbound-local-start',
            'revision',
            'resume',
            'auto-chain',
            'workorder-preview',
            'workorder-persistence',
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 50,
      });
    }
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: MODE,
        error: error.message,
        stack: error.stack,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
