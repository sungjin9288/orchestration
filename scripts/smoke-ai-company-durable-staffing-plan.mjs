import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import staffingPlanModule from '../src/runtime/staffing-plans.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const {
  STAFFING_PLAN_BLOCKED_ACTIONS,
  computeStaffingPlanRecordDigest,
} = staffingPlanModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot =
  process.env.ORCHESTRATION_DURABLE_STAFFING_PLAN_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-durable-staffing-plan-smoke');
const keepFixture = process.env.ORCHESTRATION_DURABLE_STAFFING_PLAN_KEEP_FIXTURE === '1';
const MODE = 'ai-company-durable-staffing-plan-smoke';
const COUNCIL_AGENT_IDS = [
  'agent-conductor',
  'agent-strategist',
  'agent-architect',
  'agent-decomposer',
];

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function copyCompany(targetRoot) {
  fs.mkdirSync(targetRoot, { recursive: true });
  fs.cpSync(path.join(repoRoot, 'company'), path.join(targetRoot, 'company'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(targetRoot, 'docs'), { recursive: true });
  for (const filename of [
    '48_ai-company-master-plan.md',
    '49_agent-runtime-contract.md',
    '52_ai-company-runtime-blueprint-implementation-plan.md',
  ]) {
    fs.copyFileSync(
      path.join(repoRoot, 'docs', filename),
      path.join(targetRoot, 'docs', filename),
    );
  }
}

function createRuntime(runtimeRoot, companyRoot, providerCalls) {
  const providerAdapter = {
    executePosition() {
      providerCalls.count += 1;
      throw new Error('StaffingPlan must not execute provider positions');
    },
    executeSynthesis() {
      providerCalls.count += 1;
      throw new Error('StaffingPlan must not execute provider synthesis');
    },
  };
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: path.join(companyRoot, 'company', 'blueprint.json'),
    companyRepoRoot: companyRoot,
    councilLiveAdapter: providerAdapter,
  });
}

function toSchemaV16(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 16;
  delete previous.sequences.staffingPlan;
  delete previous.staffingPlans;
  delete previous.companyRuntime;
  return previous;
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

function createStaffingSpec(overrides = {}) {
  return {
    mode: 'council',
    selectedAgentIds: [...COUNCIL_AGENT_IDS],
    selectionRationale:
      'Bind the exact draft Mission to the current local source-backed Council roster.',
    parallelGroups: [],
    providerMode: 'local-stub',
    terminationPolicy: {
      maxProviderCalls: 0,
      maxTurnsPerAgent: 4,
      deadlineMs: 120000,
      stopOnRequiredRoleFailure: true,
    },
    ...overrides,
  };
}

function createAcceptance(reviewedAt, rationale = 'Accept this exact source-current plan as immutable local audit evidence.') {
  return {
    decision: 'accept',
    acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
    rationale,
    reviewedAt,
  };
}

function createAcceptanceRequest(missionId, staffingSpec, preview, acceptance) {
  return {
    missionId,
    staffingSpec,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    sourceDigest: preview.sourceDigest,
    missionDigest: preview.missionDigest,
    blueprintDigest: preview.blueprintDigest,
    staffingSpecDigest: preview.staffingSpecDigest,
    acceptance,
  };
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const runtimeRoot = path.join(tempRoot, 'runtime');
  const companyRoot = path.join(tempRoot, 'company-source');
  const providerCalls = { count: 0 };
  copyCompany(companyRoot);

  try {
    const seedRuntime = createRuntime(runtimeRoot, companyRoot, providerCalls);
    const project = seedRuntime.createProject({
      name: 'Durable StaffingPlan Smoke',
      projectPath: repoRoot,
    });
    const mission = seedRuntime.createMission({
      projectId: project.id,
      title: 'Record one exact StaffingPlan',
      goal: 'Persist source-bound staffing evidence without starting downstream work.',
      constraints: 'No Council, WorkOrder, provider, source, Git, or scheduling side effects.',
    });
    const schemaV16 = toSchemaV16(seedRuntime.getSnapshot());
    writeState(runtimeRoot, schemaV16);
    const statePath = path.join(runtimeRoot, 'state.json');
    const schemaV16Bytes = fs.readFileSync(statePath, 'utf8');
    const runtime = createRuntime(runtimeRoot, companyRoot, providerCalls);
    const evaluatedAt = new Date().toISOString();
    const staffingSpec = createStaffingSpec();
    const previewRequest = {
      missionId: mission.id,
      staffingSpec,
      evaluatedAt,
    };

    assertNoWrite(
      runtimeRoot,
      () => runtime.getStaffingPlan('staffing-plan-0001'),
      /current state|schema v17/,
    );
    const preview = runtime.previewMissionStaffingPlan(previewRequest);
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV16Bytes);
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'review-ready');
    assert.equal(preview.mode, 'council');
    assert.deepEqual(preview.selectedAgentIds, [...COUNCIL_AGENT_IDS].sort());
    assert.deepEqual(preview.selectedRoles, ['architect', 'conductor', 'decomposer', 'strategist']);
    assert.equal(preview.providerMode, 'local-stub');
    assert.equal(preview.terminationPolicy.maxProviderCalls, 0);
    assert.equal(preview.blueprintSourceRefs.length, 10);
    assert.equal(preview.roleSourceDigests.length, 9);
    assert.ok(preview.roleSourceDigests.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)));
    assert.deepEqual(preview.blockedActions, STAFFING_PLAN_BLOCKED_ACTIONS);
    assert.equal(providerCalls.count, 0);

    const soloPreview = runtime.previewMissionStaffingPlan({
      ...previewRequest,
      staffingSpec: createStaffingSpec({
        mode: 'solo',
        selectedAgentIds: ['agent-researcher'],
        selectionRationale: 'Select one local read-only Researcher without downstream execution.',
      }),
    });
    assert.equal(soloPreview.mode, 'solo');
    assert.deepEqual(soloPreview.selectedRoles, ['researcher']);
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.previewMissionStaffingPlan({
          ...previewRequest,
          staffingSpec: createStaffingSpec({
            mode: 'parallel-specialists',
            selectedAgentIds: ['agent-researcher', 'agent-qa'],
            parallelGroups: [['agent-researcher'], ['agent-qa']],
          }),
        }),
      /disabled by CompanyBlueprint/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.previewMissionStaffingPlan({
          ...previewRequest,
          staffingSpec: createStaffingSpec({
            providerMode: 'openai-responses',
          }),
        }),
      /providerMode must be local-stub/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.previewMissionStaffingPlan({
          ...previewRequest,
          evaluatedAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
        }),
      /too far in the future/,
    );

    const acceptance = createAcceptance(evaluatedAt);
    const acceptanceRequest = createAcceptanceRequest(
      mission.id,
      staffingSpec,
      preview,
      acceptance,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.acceptMissionStaffingPlan({
          ...acceptanceRequest,
          previewDigest: '0'.repeat(64),
        }),
      /previewDigest does not match current recomputation/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.acceptMissionStaffingPlan({
          ...acceptanceRequest,
          providerMode: 'forbidden-extra-field',
        }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.acceptMissionStaffingPlan({
          ...acceptanceRequest,
          acceptance: {
            ...acceptance,
            decision: 'start',
          },
        }),
      /acceptance.decision must be accept/,
    );

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = runtime.acceptMissionStaffingPlan(acceptanceRequest);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.staffingPlan.id, 'staffing-plan-0001');
    assert.equal(created.staffingPlan.persisted, true);
    assert.equal(created.staffingPlan.status, 'accepted');
    assert.equal(created.staffingPlan.sourcePreviewId, preview.id);
    assert.equal(created.staffingPlan.sourcePreviewDigest, preview.previewDigest);
    assert.deepEqual(created.staffingPlan.acceptance, acceptance);
    assert.equal(created.staffingPlan.acceptedAt, evaluatedAt);
    assert.equal(created.staffingPlan.createdAt, evaluatedAt);
    assert.equal(created.staffingPlan.updatedAt, evaluatedAt);
    assert.ok(Object.isFrozen(created.staffingPlan));
    assert.ok(Object.isFrozen(created.staffingPlan.acceptance));
    assert.equal(
      computeStaffingPlanRecordDigest(created.staffingPlan),
      created.staffingPlan.recordDigest,
    );

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 18);
    assert.equal(persisted.sequences.staffingPlan, 1);
    assert.equal(Object.keys(persisted.staffingPlans).length, 1);
    assert.deepEqual(toSchemaV16(persisted), schemaV16);
    assert.equal(Object.keys(persisted.councilSessions).length, 0);
    assert.equal(Object.keys(persisted.executionPlans).length, 0);
    assert.equal(Object.keys(persisted.workOrders).length, 0);
    assert.equal(Object.keys(persisted.handoffPackets).length, 0);
    assert.equal(Object.keys(persisted.approvals).length, 0);
    assert.equal(Object.keys(persisted.decisionInboxItems).length, 0);
    assert.equal(Object.keys(persisted.runs).length, 0);
    assert.equal(Object.keys(persisted.artifacts).length, 0);
    assert.equal(providerCalls.count, 0);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.acceptMissionStaffingPlan(acceptanceRequest);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.staffingPlan, created.staffingPlan);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    const inspected = runtime.getStaffingPlan(created.staffingPlan.id);
    assert.equal(inspected.persisted, true);
    assert.deepEqual(inspected.staffingPlan, created.staffingPlan);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    assertNoWrite(
      runtimeRoot,
      () =>
        runtime.acceptMissionStaffingPlan({
          ...acceptanceRequest,
          acceptance: createAcceptance(
            evaluatedAt,
            'Attempt to replace the immutable accepted record with divergent evidence.',
          ),
        }),
      /already has a different StaffingPlan/,
    );

    const rolePath = path.join(companyRoot, 'company', 'roles', 'strategist.md');
    const roleBytes = fs.readFileSync(rolePath);
    fs.appendFileSync(rolePath, '\n');
    assertNoWrite(
      runtimeRoot,
      () => runtime.acceptMissionStaffingPlan(acceptanceRequest),
      /does not match current recomputation/,
    );
    fs.writeFileSync(rolePath, roleBytes);

    const authorityCompanyRoot = path.join(tempRoot, 'authority-company-source');
    copyCompany(authorityCompanyRoot);
    const authorityBlueprintPath = path.join(
      authorityCompanyRoot,
      'company',
      'blueprint.json',
    );
    const authorityBlueprint = JSON.parse(fs.readFileSync(authorityBlueprintPath, 'utf8'));
    authorityBlueprint.agentProfiles.find(
      (profile) => profile.id === 'agent-strategist',
    ).authority.canMutateSource = true;
    fs.writeFileSync(
      authorityBlueprintPath,
      `${JSON.stringify(authorityBlueprint, null, 2)}\n`,
    );
    assertNoWrite(
      runtimeRoot,
      () =>
        createRuntime(runtimeRoot, authorityCompanyRoot, providerCalls)
          .previewMissionStaffingPlan(previewRequest),
      /BLUEPRINT_FORBIDDEN_AUTHORITY|forbidden StaffingPlan authority/,
    );

    const migrationOnlyRoot = path.join(tempRoot, 'migration-only');
    writeState(migrationOnlyRoot, schemaV16);
    const migratedOnly = createFileStore({ runtimeRoot: migrationOnlyRoot }).loadState();
    assert.equal(migratedOnly.schemaVersion, 18);
    assert.equal(migratedOnly.sequences.staffingPlan, 0);
    assert.deepEqual(migratedOnly.staffingPlans, {});

    const partialRoot = path.join(tempRoot, 'partial-schema');
    const partial = structuredClone(persisted);
    delete partial.staffingPlans;
    writeState(partialRoot, partial);
    assertNoWrite(
      partialRoot,
      () => createFileStore({ runtimeRoot: partialRoot }).loadStateReadonly(),
      /missing StaffingPlan fields/,
    );

    const corruptRoot = path.join(tempRoot, 'corrupt-schema');
    const corrupt = structuredClone(persisted);
    corrupt.staffingPlans[created.staffingPlan.id].blockedActions = [];
    writeState(corruptRoot, corrupt);
    assertNoWrite(
      corruptRoot,
      () => createFileStore({ runtimeRoot: corruptRoot }).loadStateReadonly(),
      /invalid blockedActions|invalid source or blocked-action evidence/,
    );

    const futureRoot = path.join(tempRoot, 'future-schema');
    writeState(futureRoot, { ...persisted, schemaVersion: 19 });
    assertNoWrite(
      futureRoot,
      () => createFileStore({ runtimeRoot: futureRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion/,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          migration: {
            fromSchemaVersion: 16,
            toSchemaVersion: persisted.schemaVersion,
            atomicSaveCount: saveCount,
            migrationOnlyCreatedNoPlan: true,
          },
          staffingPlan: {
            id: created.staffingPlan.id,
            previewId: preview.id,
            recordDigest: created.staffingPlan.recordDigest,
            status: created.staffingPlan.status,
            exactReplayIdempotent: true,
          },
          safety: {
            staleMalformedTimestampModeAuthorityNoWrite: true,
            freshBlueprintAndNineRoleDigestsBound: true,
            councilWorkOrderProviderSourceGitSchedulingBlocked: true,
            futurePartialAndCorruptStateRejected: true,
            providerCalls: providerCalls.count,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
