import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeModule from '../src/runtime/runtime-service.js';
import opsModule from '../src/runtime/ops-supervision-preview.js';
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
  OPS_SUPERVISION_BLOCKED_ACTIONS,
  OPS_SUPERVISION_EVIDENCE_KEYS,
  RESPONSE_KEYS,
  computeOpsSupervisionPreviewDigest,
} = opsModule;
const { computeExecutionPlanRecordDigest } = workOrderPreviewModule;
const MODE = 'ai-company-ops-supervision-preview-smoke';
const port = 10220 + (process.pid % 20);
const baseUrl = `http://127.0.0.1:${port}`;
const keepFixture =
  process.env.ORCHESTRATION_OPS_SUPERVISION_KEEP_FIXTURE === '1';
const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['Exact read-only Ops supervision evidence'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before mutation, recovery, provider, Git, or release'],
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
    selectionRationale:
      'Bind one exact local Council before the active WorkOrder attempt.',
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

function createWorkOrderFixture() {
  const runtimeRoot = path.join(tempRoot, 'ops-workorder-runtime');
  const workProjectPath = path.join(tempRoot, 'ops-workorder-project');
  const targetPath = path.join(
    workProjectPath,
    'src/runtime/runtime-service.js',
  );
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(
    targetPath,
    "'use strict';\n\nmodule.exports = { opsSupervisionFixture: true };\n",
  );
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'Ops supervision WorkOrder',
    projectPath: workProjectPath,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Inspect one active WorkOrder attempt',
    goal: 'Classify exact active durable evidence without recovery.',
    constraints: 'No mutation, settlement, provider, Git, release, or memory.',
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

function buildOpsRequest(targetType, target, parent, evaluatedAt) {
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

function assertDeepFrozen(value) {
  assert.equal(Object.isFrozen(value), true);
  if (!value || typeof value !== 'object') return;
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function assertPreview(preview, expected) {
  assert.deepEqual(Object.keys(preview), RESPONSE_KEYS);
  assert.equal(preview.schemaVersion, 21);
  assert.equal(preview.persisted, false);
  assert.equal(preview.status, 'supervision-required');
  assert.equal(preview.targetType, expected.targetType);
  assert.equal(preview.targetId, expected.targetId);
  assert.equal(preview.parentId, expected.parentId);
  assert.equal(preview.timeClassification, expected.timeClassification);
  assert.equal(preview.lineageClassification, 'source-bound');
  assert.deepEqual(Object.keys(preview.evidenceRefs), OPS_SUPERVISION_EVIDENCE_KEYS);
  assert.deepEqual(preview.allowedActions, []);
  assert.deepEqual(preview.blockedActions, OPS_SUPERVISION_BLOCKED_ACTIONS);
  assert.equal(
    computeOpsSupervisionPreviewDigest(preview),
    preview.previewDigest,
  );
  assert.equal(
    preview.id,
    `ops-supervision-preview-${preview.previewDigest.slice(0, 16)}`,
  );
  assertDeepFrozen(preview);
  assert.doesNotMatch(
    JSON.stringify(preview),
    /PRIVATE KEY|sk-proj-|authorization|password|provider payload|stdout|stderr/i,
  );
}

async function waitFor(predicate, label) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function createActiveSpecialistFirstAttempt() {
  const runtimeRoot = path.join(tempRoot, 'ops-specialist-first-runtime');
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
    return (
      Object.values(state.specialistBatches || {}).some(
        (batch) => batch.status === 'active',
      ) &&
      Object.values(state.specialistCellAttempts || {}).filter(
        (attempt) => attempt.status === 'active',
      ).length === 2
    );
  }, 'active specialist first attempts');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const batch = Object.values(state.specialistBatches)[0];
  const attempt = state.specialistCellAttempts[batch.cellAttemptIds[0]];
  return {
    attempt,
    batch,
    context,
    releaseWorkers,
    runtimeRoot,
    startPromise,
    statePath,
  };
}

async function createActiveSpecialistRetry() {
  const runtimeRoot = path.join(tempRoot, 'ops-specialist-retry-runtime');
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
  const {
    councilSessionId: _councilSessionId,
    ...sourceRequest
  } = previewRequest;
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
  const attempt = state.specialistCellAttempts[retry.retryCellAttemptId];
  return {
    attempt,
    context,
    releaseRetry,
    retry,
    retryPromise,
    sourceAttempt,
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
  const body = await response.text();
  let payload = body;
  try {
    payload = JSON.parse(body);
  } catch {
    // Non-JSON method errors remain text.
  }
  return { payload, response };
}

function opsPath(request) {
  return `/api/ops/supervision-preview?${new URLSearchParams(request)}`;
}

async function main() {
  setupFixture();
  const immutableSources = new Map(
    [
      'src/runtime/contracts.js',
      'src/runtime/file-store.js',
      'src/execution/specialist-batch-coordinator.js',
      'src/execution/specialist-cell-retry-coordinator.js',
    ].map((relativePath) => [
      relativePath,
      fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'),
    ]),
  );
  let first;
  let retry;
  let server;
  try {
    const workOrder = createWorkOrderFixture();
    immutableSources.set(
      workOrder.targetPath,
      fs.readFileSync(workOrder.targetPath, 'utf8'),
    );
    const workRequest = buildOpsRequest(
      'work-order-attempt',
      workOrder.attempt,
      workOrder.executionPlan,
      workOrder.attempt.startedAt,
    );
    const beforeWorkPreview = fs.readFileSync(workOrder.statePath, 'utf8');
    const workPreview = workOrder.runtime.getOpsSupervisionPreview(workRequest);
    assert.equal(fs.readFileSync(workOrder.statePath, 'utf8'), beforeWorkPreview);
    assertPreview(workPreview, {
      targetType: 'work-order-attempt',
      targetId: workOrder.attempt.id,
      parentId: workOrder.executionPlan.id,
      timeClassification: 'active-without-deadline',
    });
    assert.equal(workPreview.deadlineAt, null);
    assert.equal(workPreview.evidenceRefs.executionPlanRef, workOrder.executionPlan.id);
    assert.equal(workPreview.evidenceRefs.workOrderRef, workOrder.attempt.workOrderId);
    assert.deepEqual(
      workOrder.runtime.getOpsSupervisionPreview(workRequest),
      workPreview,
    );
    assert.equal(
      workOrder.runtime.getWorkOrderAttempt(workOrder.attempt.id)
        .workOrderAttempt.recordDigest,
      workOrder.attempt.recordDigest,
    );

    first = await createActiveSpecialistFirstAttempt();
    const firstRequest = buildOpsRequest(
      'specialist-first-attempt',
      first.attempt,
      first.batch,
      first.attempt.deadlineAt,
    );
    const beforeFirstPreview = fs.readFileSync(first.statePath, 'utf8');
    const firstPreview =
      first.context.runtime.getOpsSupervisionPreview(firstRequest);
    assert.equal(fs.readFileSync(first.statePath, 'utf8'), beforeFirstPreview);
    assertPreview(firstPreview, {
      targetType: 'specialist-first-attempt',
      targetId: first.attempt.id,
      parentId: first.batch.id,
      timeClassification: 'active-deadline-exceeded',
    });
    assert.equal(firstPreview.evidenceRefs.sourceBatchRef, first.batch.id);
    assert.equal(firstPreview.evidenceRefs.sourceAttemptRef, null);
    const withinPreview = first.context.runtime.getOpsSupervisionPreview({
      ...firstRequest,
      evaluatedAt: first.attempt.startedAt,
    });
    assert.equal(withinPreview.timeClassification, 'active-within-deadline');
    assert.throws(
      () =>
        first.context.runtime.getOpsSupervisionPreview({
          ...firstRequest,
          evaluatedAt: new Date(
            Date.parse(first.attempt.startedAt) - 1,
          ).toISOString(),
        }),
      (error) => error.statusCode === 409,
    );
    assert.throws(
      () =>
        first.context.runtime.getOpsSupervisionPreview({
          ...firstRequest,
          expectedParentDigest: '0'.repeat(64),
        }),
      (error) => error.statusCode === 409,
    );
    first.releaseWorkers();
    await first.startPromise;
    assert.throws(
      () => first.context.runtime.getOpsSupervisionPreview(firstRequest),
      (error) => error.statusCode === 409,
    );

    retry = await createActiveSpecialistRetry();
    const retryRequest = buildOpsRequest(
      'specialist-retry-attempt',
      retry.attempt,
      retry.retry,
      retry.attempt.deadlineAt,
    );
    const beforeRetryPreview = fs.readFileSync(retry.statePath, 'utf8');
    const retryPreview =
      retry.context.runtime.getOpsSupervisionPreview(retryRequest);
    assert.equal(fs.readFileSync(retry.statePath, 'utf8'), beforeRetryPreview);
    assertPreview(retryPreview, {
      targetType: 'specialist-retry-attempt',
      targetId: retry.attempt.id,
      parentId: retry.retry.id,
      timeClassification: 'active-deadline-exceeded',
    });
    assert.equal(
      retryPreview.evidenceRefs.sourceAttemptRef,
      retry.sourceAttempt.id,
    );
    assert.equal(
      retry.context.runtime.getSpecialistCellRetry(retry.retry.id)
        .specialistCellAttempt.id,
      retry.attempt.id,
    );
    retry.releaseRetry();
    await retry.retryPromise;

    const fixedNow = createRuntimeService({
      runtimeRoot: workOrder.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: tempRoot,
      councilAdapter: createResolvedCouncilAdapter(),
      opsSupervisionNow: () => workOrder.attempt.startedAt,
    });
    assert.throws(
      () =>
        fixedNow.getOpsSupervisionPreview({
          ...workRequest,
          evaluatedAt: new Date(
            Date.parse(workOrder.attempt.startedAt) + 5 * 60 * 1000 + 1,
          ).toISOString(),
        }),
      (error) => error.statusCode === 400,
    );

    server = spawn(
      process.execPath,
      [
        path.join(repoRoot, 'scripts/serve-ui-slice-01.mjs'),
        '--port',
        String(port),
        '--runtime-root',
        workOrder.runtimeRoot,
      ],
      {
        cwd: repoRoot,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    await waitForServer(server);
    const apiStateBefore = fs.readFileSync(workOrder.statePath, 'utf8');
    const valid = await requestApi(opsPath(workRequest));
    assert.equal(valid.response.status, 200);
    assert.deepEqual(valid.payload, workPreview);
    const replay = await requestApi(opsPath(workRequest));
    assert.deepEqual(replay.payload, valid.payload);
    assert.equal(fs.readFileSync(workOrder.statePath, 'utf8'), apiStateBefore);

    const malformedCases = [
      '/api/ops/supervision-preview',
      `${opsPath(workRequest)}&extra=true`,
      `${opsPath(workRequest)}&targetId=${workOrder.attempt.id}`,
      opsPath({ ...workRequest, targetId: '' }),
      opsPath({ ...workRequest, targetId: 'x'.repeat(1800) }),
    ];
    for (const pathname of malformedCases) {
      const result = await requestApi(pathname);
      assert.equal(result.response.status, 400);
      assert.equal(fs.readFileSync(workOrder.statePath, 'utf8'), apiStateBefore);
    }
    const missingTarget = await requestApi(
      opsPath({
        ...workRequest,
        targetId: 'work-order-attempt-missing',
      }),
    );
    assert.equal(missingTarget.response.status, 404);
    const missingParent = await requestApi(
      opsPath({
        ...workRequest,
        parentId: 'execution-plan-missing',
      }),
    );
    assert.equal(missingParent.response.status, 404);
    const stale = await requestApi(
      opsPath({
        ...workRequest,
        expectedTargetRecordDigest: '0'.repeat(64),
      }),
    );
    assert.equal(stale.response.status, 409);
    const beforeStart = await requestApi(
      opsPath({
        ...workRequest,
        evaluatedAt: new Date(
          Date.parse(workOrder.attempt.startedAt) - 1,
        ).toISOString(),
      }),
    );
    assert.equal(beforeStart.response.status, 409);
    const secretMarker = 'sk-proj-this-must-not-be-reflected';
    const redacted = await requestApi(
      opsPath({ ...workRequest, targetId: secretMarker }),
    );
    assert.equal(redacted.response.status, 404);
    assert.doesNotMatch(JSON.stringify(redacted.payload), new RegExp(secretMarker));
    const wrongMethod = await requestApi(opsPath(workRequest), {
      method: 'POST',
    });
    assert.equal(wrongMethod.response.status, 405);

    for (const [sourcePath, content] of immutableSources) {
      assert.equal(fs.readFileSync(sourcePath, 'utf8'), content);
    }
    assert.equal(fs.readFileSync(workOrder.statePath, 'utf8'), apiStateBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: 21,
          targets: [
            workPreview.targetType,
            firstPreview.targetType,
            retryPreview.targetType,
          ],
          transport: {
            valid: 200,
            malformed: 400,
            missing: 404,
            conflict: 409,
            exactSixKeys: true,
            boundedRedaction: true,
          },
          contract: {
            responseKeys: RESPONSE_KEYS.length,
            evidenceKeys: OPS_SUPERVISION_EVIDENCE_KEYS.length,
            allowedActions: 0,
            blockedActions: OPS_SUPERVISION_BLOCKED_ACTIONS.length,
            deepFrozen: true,
            canonicalReplay: true,
          },
          boundaries: {
            stateWrites: 0,
            schemaMigration: false,
            recoveryMutation: false,
            providerCalls: 0,
            sourceMutation: false,
            gitOrRelease: false,
            memoryOrPolicy: false,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    if (first && !Object.isFrozen(first)) first.releaseWorkers?.();
    if (retry && !Object.isFrozen(retry)) retry.releaseRetry?.();
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
      {
        ok: false,
        mode: MODE,
        error: error.message,
        stack: error.stack,
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode = 1;
});
