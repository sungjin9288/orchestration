import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeModule from '../src/runtime/runtime-service.js';
import dispositionsModule from '../src/runtime/ops-attempt-dispositions.js';
import workOrderPreviewModule from '../src/runtime/workorder-verification-plan-preview.js';
import {
  blueprintPath,
  buildPreviewRequest,
  buildStartRequest,
  completedQaOutcome,
  completedResearcherOutcome,
  createResolvedCouncilAdapter,
  projectPath,
  repoRoot,
  seedBoundCouncil,
  tempRoot,
  writeFixtureSources,
} from './smoke-ai-company-durable-specialist-batch.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const {
  OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY,
  OPS_ATTEMPT_DISPOSITION_DECISION,
  OPS_ATTEMPT_DISPOSITION_REASON_CODE,
  OPS_ATTEMPT_DISPOSITION_RECORD_KEYS,
  computeOpsAttemptDispositionRecordDigest,
} = dispositionsModule;
const { computeExecutionPlanRecordDigest } = workOrderPreviewModule;
const MODE = 'ai-company-ops-attempt-quarantine-smoke';
const port = 10240 + (process.pid % 20);
const baseUrl = `http://127.0.0.1:${port}`;
const keepFixture =
  process.env.ORCHESTRATION_OPS_QUARANTINE_KEEP_FIXTURE === '1';
const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['Exact quarantine settlement-denial evidence'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before recovery, provider, Git, or release'],
};

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

function createStaffingSpec() {
  return {
    mode: 'council',
    selectedAgentIds: [
      'agent-conductor',
      'agent-strategist',
      'agent-architect',
      'agent-decomposer',
    ],
    selectionRationale: 'Bind one exact local Council before quarantine proof.',
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

function createWorkOrderFixture(
  runtimeName = 'ops-quarantine-workorder-runtime',
  runtimeOptions = {},
) {
  const runtimeRoot = path.join(tempRoot, runtimeName);
  const workProjectPath = path.join(tempRoot, `${runtimeName}-project`);
  const targetPath = path.join(
    workProjectPath,
    'src/runtime/runtime-service.js',
  );
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(
    targetPath,
    "'use strict';\n\nmodule.exports = { opsQuarantineFixture: true };\n",
  );
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
    councilAdapter: createResolvedCouncilAdapter(),
    ...runtimeOptions,
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'Ops quarantine WorkOrder',
    projectPath: workProjectPath,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Quarantine one active WorkOrder attempt',
    goal: 'Retain exact evidence and deny late settlement.',
    constraints: 'No inferred result, recovery, provider, Git, or release.',
  });
  const staffingSpec = createStaffingSpec();
  const evaluatedAt = new Date().toISOString();
  const staffingPreview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const staffingPlan = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: staffingPreview.id,
    previewDigest: staffingPreview.previewDigest,
    sourceDigest: staffingPreview.sourceDigest,
    missionDigest: staffingPreview.missionDigest,
    blueprintDigest: staffingPreview.blueprintDigest,
    staffingSpecDigest: staffingPreview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept the exact local Council staffing evidence.',
      reviewedAt: evaluatedAt,
    },
  }).staffingPlan;
  const entered = runtime.enterStaffingPlanCouncil({
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Bind the accepted plan to one local Council.',
      requestedAt: new Date().toISOString(),
    },
  });
  runtime.decideRealCouncilSession({
    councilSessionId: entered.councilSession.id,
    action: 'approve',
  });
  const preview = runtime.previewMissionWorkOrders({
    councilSessionId: entered.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: entered.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  const started = runtime.beginSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    approvalId: persisted.approval.id,
  });
  assert.equal(started.workOrderAttempt.status, 'active');
  return {
    attempt: started.workOrderAttempt,
    executionPlan: started.executionPlan,
    runtime,
    runtimeRoot,
    statePath: path.join(runtimeRoot, 'state.json'),
    targetPath,
  };
}

function buildOpsPreviewRequest(targetType, target, parent, evaluatedAt) {
  return {
    targetType,
    targetId: target.id,
    parentId: parent.id,
    expectedTargetRecordDigest: target.recordDigest,
    expectedParentDigest:
      targetType === 'work-order-attempt'
        ? computeExecutionPlanRecordDigest(parent)
        : parent.recordDigest,
    evaluatedAt,
  };
}

function buildQuarantineRequest(preview) {
  return {
    targetType: preview.targetType,
    targetId: preview.targetId,
    parentId: preview.parentId,
    expectedTargetRecordDigest: preview.targetRecordDigest,
    expectedParentDigest: preview.parentDigest,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    decision: OPS_ATTEMPT_DISPOSITION_DECISION,
    reasonCode: OPS_ATTEMPT_DISPOSITION_REASON_CODE,
    acknowledgement: OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  };
}

function assertDisposition(record, preview) {
  assert.deepEqual(Object.keys(record), OPS_ATTEMPT_DISPOSITION_RECORD_KEYS);
  assert.equal(record.targetType, preview.targetType);
  assert.equal(record.targetId, preview.targetId);
  assert.equal(record.parentId, preview.parentId);
  assert.equal(record.targetRecordDigest, preview.targetRecordDigest);
  assert.equal(record.parentDigest, preview.parentDigest);
  assert.equal(record.previewId, preview.id);
  assert.equal(record.previewDigest, preview.previewDigest);
  assert.equal(record.decision, OPS_ATTEMPT_DISPOSITION_DECISION);
  assert.equal(record.reasonCode, OPS_ATTEMPT_DISPOSITION_REASON_CODE);
  assert.deepEqual(
    record.authoritySummary,
    OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY,
  );
  assert.equal(record.authoritySummary.quarantineEvidenceAllowed, true);
  assert.equal(record.authoritySummary.lateSettlementAllowed, false);
  assert.equal(
    computeOpsAttemptDispositionRecordDigest(record),
    record.recordDigest,
  );
  assert.doesNotMatch(
    JSON.stringify(record),
    /PRIVATE KEY|sk-proj-|authorization|password|stdout|stderr|provider payload/i,
  );
}

function downgradeToV26(statePath) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.schemaVersion = 26;
  delete state.sequences.opsAttemptDisposition;
  delete state.opsAttemptDispositions;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

async function waitFor(predicate, label) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function createActiveSpecialistFirstAttempt() {
  const runtimeRoot = path.join(tempRoot, 'ops-quarantine-specialist-first');
  let releaseWorkers;
  const workerGate = new Promise((resolve) => {
    releaseWorkers = resolve;
  });
  const context = seedBoundCouncil({
    runtimeRoot,
    specialistResearcherRunner: async ({ cellAttempt }) => {
      await workerGate;
      return completedResearcherOutcome(cellAttempt);
    },
    specialistQaRunner: async (input) => {
      await workerGate;
      return completedQaOutcome(input.inputDigest, input.inputPathDigests);
    },
  });
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const startPromise = context.runtime.startCouncilSpecialistBatch(
    buildStartRequest(previewRequest, preview),
  );
  const statePath = path.join(runtimeRoot, 'state.json');
  await waitFor(() => {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return Object.values(state.specialistCellAttempts || {}).some(
      (attempt) => attempt.status === 'active',
    );
  }, 'active specialist first attempt');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const batch = Object.values(state.specialistBatches)[0];
  const attempt = state.specialistCellAttempts[batch.cellAttemptIds[0]];
  return {
    attempt,
    attempts: batch.cellAttemptIds.map(
      (cellAttemptId) => state.specialistCellAttempts[cellAttemptId],
    ),
    batch,
    context,
    releaseWorkers,
    startPromise,
    statePath,
  };
}

async function createActiveSpecialistRetry() {
  const runtimeRoot = path.join(tempRoot, 'ops-quarantine-specialist-retry');
  let qaCalls = 0;
  let releaseRetry;
  const retryGate = new Promise((resolve) => {
    releaseRetry = resolve;
  });
  const context = seedBoundCouncil({
    runtimeRoot,
    specialistResearcherRunner: async ({ cellAttempt }) =>
      completedResearcherOutcome(cellAttempt),
    specialistQaRunner: async (input) => {
      qaCalls += 1;
      if (qaCalls === 1) throw new Error('synthetic-first-attempt-failure');
      await retryGate;
      return completedQaOutcome(input.inputDigest, input.inputPathDigests);
    },
  });
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const created = await context.runtime.startCouncilSpecialistBatch(
    buildStartRequest(previewRequest, preview),
  );
  const sourceAttempt = created.specialistCellAttempts.find(
    (attempt) => attempt.status === 'failed',
  );
  const { councilSessionId: _councilSessionId, ...sourceRequest } =
    previewRequest;
  const retryPromise = context.runtime.retrySpecialistBatchCell({
    specialistBatchId: created.specialistBatch.id,
    ...sourceRequest,
    expectedBatchRecordDigest: created.specialistBatch.recordDigest,
    expectedSourceCellAttemptRecordDigest: sourceAttempt.recordDigest,
    previewDigest: preview.previewDigest,
    previewId: preview.id,
    retryApproval: {
      decision: 'retry-failed-cell-once',
      acknowledgement:
        'retain-original-evidence-and-retry-exact-failed-cell-once',
      rationale: 'Retry the exact failed read-only QA cell once.',
      reviewedAt: new Date().toISOString(),
    },
    retryDeadlineMs: Math.min(30000, sourceAttempt.cellDeadlineMs),
    sourceCellAttemptId: sourceAttempt.id,
    sourceDigest: preview.sourceDigest,
  });
  const statePath = path.join(runtimeRoot, 'state.json');
  await waitFor(() => {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    return Object.values(state.specialistCellRetries || {}).some(
      (retry) => retry.status === 'active',
    );
  }, 'active specialist retry attempt');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const retry = Object.values(state.specialistCellRetries)[0];
  return {
    attempt: state.specialistCellAttempts[retry.retryCellAttemptId],
    context,
    releaseRetry,
    retry,
    retryPromise,
    statePath,
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
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`UI server exited early: ${output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch {
      // The bounded loopback server is still starting.
    }
    await delay(50);
  }
  throw new Error(`UI server did not start: ${output}`);
}

async function requestApi(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const body = await response.json();
  return { body, response };
}

async function main() {
  setupFixture();
  let first;
  let retry;
  let server;
  try {
    let opsNow = new Date();
    const work = createWorkOrderFixture('ops-quarantine-workorder-runtime', {
      opsSupervisionNow: () => opsNow,
    });
    const workPreviewRequest = buildOpsPreviewRequest(
      'work-order-attempt',
      work.attempt,
      work.executionPlan,
      work.attempt.startedAt,
    );
    const workPreview = work.runtime.getOpsSupervisionPreview(workPreviewRequest);
    const workRequest = buildQuarantineRequest(workPreview);

    downgradeToV26(work.statePath);
    const v26Bytes = fs.readFileSync(work.statePath, 'utf8');
    const passiveSnapshot = work.runtime.getSnapshot();
    assert.equal(passiveSnapshot.schemaVersion, 28);
    assert.equal('opsAttemptDispositions' in passiveSnapshot, false);
    assert.equal(fs.readFileSync(work.statePath, 'utf8'), v26Bytes);
    assert.throws(
      () =>
        work.runtime.quarantineOpsAttempt({
          ...workRequest,
          previewDigest: '0'.repeat(64),
        }),
      (error) => error.statusCode === 409,
    );
    assert.equal(fs.readFileSync(work.statePath, 'utf8'), v26Bytes);

    const created = work.runtime.quarantineOpsAttempt(workRequest);
    assert.equal(created.idempotent, false);
    assertDisposition(created.opsAttemptDisposition, workPreview);
    const v27State = JSON.parse(fs.readFileSync(work.statePath, 'utf8'));
    assert.equal(v27State.schemaVersion, 28);
    assert.equal(v27State.sequences.opsAttemptDisposition, 1);
    assert.equal(Object.keys(v27State.opsAttemptDispositions).length, 1);
    const replayBytes = fs.readFileSync(work.statePath, 'utf8');
    opsNow = new Date('2000-01-01T00:00:00.000Z');
    const replay = work.runtime.quarantineOpsAttempt(workRequest);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.opsAttemptDisposition, created.opsAttemptDisposition);
    assert.equal(fs.readFileSync(work.statePath, 'utf8'), replayBytes);
    assert.deepEqual(
      work.runtime.getOpsAttemptDisposition(created.opsAttemptDisposition.id)
        .opsAttemptDisposition,
      created.opsAttemptDisposition,
    );
    assert.throws(
      () =>
        work.runtime.quarantineOpsAttempt({
          ...workRequest,
          reasonCode: 'different-reason',
        }),
      (error) => error.statusCode === 400,
    );
    assert.throws(
      () =>
        work.runtime.failSequentialWorkOrderExecution({
          executionPlanId: work.executionPlan.id,
          reason: 'synthetic-late-settlement',
        }),
      (error) => error.statusCode === 409 && /blocks settlement/.test(error.message),
    );
    assert.equal(fs.readFileSync(work.statePath, 'utf8'), replayBytes);
    assert.equal(fs.readFileSync(work.targetPath, 'utf8').includes('true'), true);

    first = await createActiveSpecialistFirstAttempt();
    const firstPreview = first.context.runtime.getOpsSupervisionPreview(
      buildOpsPreviewRequest(
        'specialist-first-attempt',
        first.attempt,
        first.batch,
        first.attempt.startedAt,
      ),
    );
    const firstDisposition = first.context.runtime.quarantineOpsAttempt(
      buildQuarantineRequest(firstPreview),
    ).opsAttemptDisposition;
    assertDisposition(firstDisposition, firstPreview);
    for (const sibling of first.attempts.filter(
      (attempt) => attempt.id !== first.attempt.id,
    )) {
      const siblingPreview = first.context.runtime.getOpsSupervisionPreview(
        buildOpsPreviewRequest(
          'specialist-first-attempt',
          sibling,
          first.batch,
          sibling.startedAt,
        ),
      );
      first.context.runtime.quarantineOpsAttempt(
        buildQuarantineRequest(siblingPreview),
      );
    }
    const firstQuarantinedBytes = fs.readFileSync(first.statePath, 'utf8');
    first.releaseWorkers();
    await assert.rejects(first.startPromise, /settlement conflicted/i);
    assert.equal(fs.readFileSync(first.statePath, 'utf8'), firstQuarantinedBytes);

    retry = await createActiveSpecialistRetry();
    const retryPreview = retry.context.runtime.getOpsSupervisionPreview(
      buildOpsPreviewRequest(
        'specialist-retry-attempt',
        retry.attempt,
        retry.retry,
        retry.attempt.startedAt,
      ),
    );
    const retryDisposition = retry.context.runtime.quarantineOpsAttempt(
      buildQuarantineRequest(retryPreview),
    ).opsAttemptDisposition;
    assertDisposition(retryDisposition, retryPreview);
    const retryQuarantinedBytes = fs.readFileSync(retry.statePath, 'utf8');
    retry.releaseRetry();
    await assert.rejects(retry.retryPromise, /settlement conflicted/i);
    assert.equal(fs.readFileSync(retry.statePath, 'utf8'), retryQuarantinedBytes);

    const compatibility = createWorkOrderFixture('ops-quarantine-compatible');
    compatibility.runtime.failSequentialWorkOrderExecution({
      executionPlanId: compatibility.executionPlan.id,
      reason: 'synthetic-non-quarantined-settlement',
    });
    assert.equal(
      compatibility.runtime.getWorkOrderAttempt(compatibility.attempt.id)
        .workOrderAttempt.status,
      'failed',
    );

    for (const [schemaVersion, mutate, expected] of [
      [27, (state) => delete state.opsAttemptDispositions, /missing OpsAttemptDisposition/],
      [28, (state) => delete state.opsAttemptResumes, /missing OpsAttemptResume/],
      [29, () => {}, /Unsupported runtime state schemaVersion/],
    ]) {
      const invalidRoot = path.join(tempRoot, `invalid-v${schemaVersion}`);
      fs.mkdirSync(invalidRoot, { recursive: true });
      const state = JSON.parse(replayBytes);
      state.schemaVersion = schemaVersion;
      mutate(state);
      fs.writeFileSync(
        path.join(invalidRoot, 'state.json'),
        `${JSON.stringify(state, null, 2)}\n`,
      );
      const invalidRuntime = createRuntimeService({ runtimeRoot: invalidRoot });
      assert.throws(() => invalidRuntime.getSnapshot(), expected);
    }

    server = spawn(
      process.execPath,
      [
        path.join(repoRoot, 'scripts/serve-ui-slice-01.mjs'),
        '--port',
        String(port),
        '--runtime-root',
        work.runtimeRoot,
      ],
      { cwd: repoRoot, env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    await waitForServer(server);
    const apiReplay = await requestApi(
      '/api/ops/attempt-dispositions/quarantine',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(workRequest),
      },
    );
    assert.equal(apiReplay.response.status, 200);
    assert.equal(apiReplay.body.idempotent, true);
    const apiExact = await requestApi(
      `/api/ops/attempt-dispositions/${created.opsAttemptDisposition.id}`,
    );
    assert.equal(apiExact.response.status, 200);
    assert.deepEqual(
      apiExact.body.opsAttemptDisposition,
      created.opsAttemptDisposition,
    );
    const malformed = await requestApi(
      '/api/ops/attempt-dispositions/quarantine',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...workRequest, extra: true }),
      },
    );
    assert.equal(malformed.response.status, 400);
    const missing = await requestApi(
      '/api/ops/attempt-dispositions/ops-attempt-disposition-9999',
    );
    assert.equal(missing.response.status, 404);
    assert.equal(fs.readFileSync(work.statePath, 'utf8'), replayBytes);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: 28,
          targetTypes: [
            workPreview.targetType,
            firstPreview.targetType,
            retryPreview.targetType,
          ],
          contract: {
            requestKeys: 11,
            recordKeys: OPS_ATTEMPT_DISPOSITION_RECORD_KEYS.length,
            canonicalDigest: true,
            exactReplay: true,
            exactInspection: true,
          },
          guards: {
            workOrderAttempt: 'denied',
            specialistFirstAttempt: 'denied',
            specialistRetryAttempt: 'denied',
            unchangedBytes: true,
          },
          boundaries: {
            sourceAttemptMutation: false,
            parentMutation: false,
            inferredResult: false,
            recoveryOrRetry: false,
            providerCalls: 0,
            sourceMutation: false,
            gitOrRelease: false,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    first?.releaseWorkers?.();
    retry?.releaseRetry?.();
    if (server) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(1000),
      ]);
    }
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
  process.stderr.write(
    `${JSON.stringify(
      { ok: false, mode: MODE, error: error.message, stack: error.stack },
      null,
      2,
    )}\n`,
  );
  process.exitCode = 1;
});
