import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import builderReworkMutationApprovalModule from '../src/runtime/builder-rework-mutation-approvals.js';
import fileStoreModule from '../src/runtime/file-store.js';
import workOrderAttemptModule from '../src/runtime/work-order-attempts.js';
import workOrderPreviewModule from '../src/runtime/workorder-verification-plan-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildPreviewRequest,
  createChangesRequestedFixture,
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const { createExecutionCoordinator } = coordinatorModule;
const { createLocalStubProviderAdapter } = localStubModule;
const { digestCanonical: digestBuilderReworkMutationCanonical } =
  builderReworkMutationApprovalModule;
const { createFileStore } = fileStoreModule;
const { computeWorkOrderAttemptRecordDigest } = workOrderAttemptModule;
const { computeWorkOrderRecordDigest } = workOrderPreviewModule;
const port = 10800 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), {
  mode: 'ai-company-builder-rework-mutation-approval-smoke',
});

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function buildAcceptance(runtime, bundle) {
  const previewRequest = buildPreviewRequest(bundle);
  const preview = runtime.getReviewerReworkPlanPreview(previewRequest);
  const reviewedAt = new Date(
    Math.max(Date.now(), Date.parse(preview.evaluatedAt)),
  ).toISOString();
  const reworkPlan = runtime.persistReviewerReworkPlan({
    ...previewRequest,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    recordApproval: {
      decision: 'record-rework-plan',
      acknowledgement: 'record-exact-reviewer-rework-plan-without-execution',
      rationale: 'Retain the exact Reviewer evidence for bounded rework.',
      reviewedAt,
    },
  }).reworkPlan;
  const acceptedAt = new Date(
    Math.max(Date.now(), Date.parse(reworkPlan.createdAt)),
  ).toISOString();
  const acceptance = runtime.acceptReworkPlan({
    reworkPlanId: reworkPlan.id,
    reworkPlanRecordDigest: reworkPlan.recordDigest,
    previewId: reworkPlan.previewId,
    previewDigest: reworkPlan.previewDigest,
    sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
    sourceProgressDigest: reworkPlan.sourceProgressDigest,
    decision: 'accept',
    acknowledgement: 'accept-exact-rework-plan-without-execution',
    rationale: 'Accept one local no-write Builder rework preflight.',
    reviewedAt: acceptedAt,
  }).reworkPlanAcceptance;
  return { acceptance, reworkPlan };
}

function buildDispatchRequest(reworkPlan, acceptance, builder) {
  const reviewedAt = new Date(
    Math.max(Date.now(), Date.parse(acceptance.createdAt)),
  ).toISOString();
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
      rationale: 'Run the accepted bounded Builder rework preflight.',
      reviewedAt,
    },
  };
}

async function prepareWaitingGate(options = {}) {
  const fixture = await createChangesRequestedFixture();
  if (options.withReviewerDecision) {
    const state = readState();
    const reviewerSource = fixture.bundle.workOrders.find(
      (workOrder) => workOrder.role === 'reviewer',
    );
    const reviewer = state.workOrders[reviewerSource.id];
    const reviewerAttempt = Object.values(state.workOrderAttempts).find(
      (attempt) =>
        attempt.workOrderId === reviewer.id &&
        attempt.status === 'changes-requested',
    );
    const reviewArtifactId = reviewer.reviewArtifactId;
    state.sequences.decisionInboxItem += 1;
    const itemId = `decisionInboxItem-${String(
      state.sequences.decisionInboxItem,
    ).padStart(4, '0')}`;
    const now = new Date().toISOString();
    state.decisionInboxItems[itemId] = {
      id: itemId,
      projectId: reviewer.projectId,
      taskId: state.executionPlans[reviewer.executionPlanId].controlTaskId,
      kind: 'decision',
      status: 'pending',
      title: 'Reviewer blocking decision',
      prompt: 'Resolve the retained Reviewer finding before downstream work.',
      blocksTask: true,
      sourceType: 'review',
      sourceId: reviewArtifactId,
      resolution: null,
      createdAt: now,
      updatedAt: now,
    };
    reviewer.inboxItemRefs = [...reviewer.inboxItemRefs, itemId];
    reviewerAttempt.decisionInboxItemRefs = [
      ...reviewerAttempt.decisionInboxItemRefs,
      itemId,
    ];
    reviewerAttempt.recordDigest =
      computeWorkOrderAttemptRecordDigest(reviewerAttempt);
    const task = state.tasks[state.executionPlans[reviewer.executionPlanId].controlTaskId];
    task.flags.blocked = true;
    task.flags.waitingDecision = true;
    task.updatedAt = now;
    writeState(state);
    fixture.bundle = fixture.runtime.getExecutionPlan(
      fixture.bundle.executionPlan.id,
    );
  }
  const { acceptance, reworkPlan } = buildAcceptance(
    fixture.runtime,
    fixture.bundle,
  );
  const builder = fixture.bundle.workOrders.find(
    (workOrder) => workOrder.role === 'builder',
  );
  const started = fixture.runtime.beginBuilderReworkPreflight({
    reworkPlanId: reworkPlan.id,
    ...buildDispatchRequest(reworkPlan, acceptance, builder),
  });
  const coordinator = createExecutionCoordinator({
    runtimeService: fixture.runtime,
    repoRoot: path.resolve('.'),
    providerAdapter: createLocalStubProviderAdapter(),
  });
  const workerResult = await coordinator.runBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    workOrderAttemptId: started.workOrderAttempt.id,
  });
  assert.equal(workerResult.failed, false);
  const settled = fixture.runtime.settleBuilderReworkPreflight({
    builderReworkDispatchId: started.builderReworkDispatch.id,
    runId: workerResult.run.id,
    artifactId: workerResult.artifact.id,
    failed: false,
  });
  assert.equal(
    settled.workOrderAttempt.workerState,
    'preflight-ready-for-separate-mutation-approval',
  );
  return { ...fixture, acceptance, reworkPlan, settled };
}

function buildApprovalRequest(envelope, rationale = 'Review this exact source-bound rework mutation gate.') {
  const reviewedAt = new Date(
    Math.max(Date.now(), Date.parse(envelope.workOrderAttempt.completedAt)),
  ).toISOString();
  return {
    ...envelope.readiness.requestSource,
    evaluatedAt: reviewedAt,
    approvalRequest: {
      decision: 'request-builder-rework-mutation-approval',
      acknowledgement:
        'create-one-reviewable-rework-approval-without-source-mutation',
      rationale,
      reviewedAt,
    },
  };
}

function assertExecutionEvidenceUnchanged(before, after) {
  for (const collection of [
    'executionPlans',
    'workOrders',
    'workOrderAttempts',
    'builderReworkDispatches',
    'runs',
    'artifacts',
    'workflowCheckpoints',
  ]) {
    assert.deepEqual(after[collection], before[collection], `${collection} changed`);
  }
}

async function waitForServer(server) {
  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (output.includes(baseUrl)) return;
    if (server.exitCode !== null) {
      throw new Error(`Approval API server exited before readiness: ${output}`);
    }
    await delay(20);
  }
  throw new Error(`Timed out waiting for approval API server: ${output}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();
  return { response, payload };
}

async function runApiSmoke() {
  const fixture = await prepareWaitingGate();
  const endpoint = `${baseUrl}/api/rework-plans/${encodeURIComponent(fixture.reworkPlan.id)}/builder-rework-mutation-approval`;
  let server = null;
  try {
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
    const inspected = await fetchJson(endpoint);
    assert.equal(inspected.response.status, 200);
    assert.deepEqual(Object.keys(inspected.payload), [
      'generatedAt',
      'reworkPlanId',
      'readiness',
      'approval',
      'decisionInboxItem',
      'builderReworkDispatch',
      'workOrderAttempt',
    ]);
    assert.equal(inspected.payload.readiness.status, 'request-ready');
    const request = buildApprovalRequest(inspected.payload);
    const malformed = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, unexpected: true }),
    });
    assert.equal(malformed.response.status, 400);
    const created = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.approval.status, 'pending');
    assert.equal(
      created.payload.approval.allowedNextAction,
      'builder-rework-live-mutation',
    );
    const replay = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.idempotent, true);
    const approved = await fetchJson(
      `${baseUrl}/api/decision-inbox/${encodeURIComponent(created.payload.decisionInboxItem.id)}/actions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verb: 'approve' }),
      },
    );
    assert.equal(approved.response.status, 200);
    const terminalReplay = await fetchJson(
      `${baseUrl}/api/decision-inbox/${encodeURIComponent(created.payload.decisionInboxItem.id)}/actions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verb: 'reject' }),
      },
    );
    assert.equal(terminalReplay.response.status, 409);
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(1000),
      ]);
      if (server.exitCode === null) server.kill('SIGKILL');
    }
  }
}

async function runRejectionSmoke() {
  const fixture = await prepareWaitingGate();
  const envelope = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const created = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildApprovalRequest(envelope, 'Reject path must remain evidence-only.'),
  });
  fixture.runtime.resolveDecisionInboxItem({
    itemId: created.decisionInboxItem.id,
    action: 'rejected',
  });
  const terminal = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  assert.equal(terminal.approval.status, 'rejected');
  assert.equal(terminal.decisionInboxItem.resolution.action, 'rejected');
  assert.throws(
    () =>
      fixture.runtime.resolveDecisionInboxItem({
        itemId: created.decisionInboxItem.id,
        action: 'approved',
      }),
    /already terminal/,
  );
}

async function runReviewerDecisionPrioritySmoke() {
  const fixture = await prepareWaitingGate({ withReviewerDecision: true });
  const envelope = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  assert.equal(envelope.readiness.reviewerDecisionPriority, true);
  assert.equal(envelope.readiness.reviewDecisionInboxItemRefs.length, 1);
  const reviewerDecisionId =
    envelope.readiness.reviewDecisionInboxItemRefs[0];
  const created = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildApprovalRequest(
      envelope,
      'Keep the blocking Reviewer Decision visible during this review.',
    ),
  });
  const beforeReviewerRefDrift = readState();
  const reviewerRefDrift = structuredClone(beforeReviewerRefDrift);
  const reviewerRefMetadata =
    reviewerRefDrift.approvals[created.approval.id].metadata;
  reviewerRefMetadata.reviewDecisionInboxItemRefs = [];
  const { bindingDigest: _bindingDigest, ...reviewerMetadataWithoutBinding } =
    reviewerRefMetadata;
  reviewerRefMetadata.bindingDigest =
    digestBuilderReworkMutationCanonical(reviewerMetadataWithoutBinding);
  writeState(reviewerRefDrift);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /stale Reviewer Decision references/,
  );
  writeState(beforeReviewerRefDrift);
  fixture.runtime.resolveDecisionInboxItem({
    itemId: created.decisionInboxItem.id,
    action: 'approved',
  });
  const state = readState();
  assert.equal(state.decisionInboxItems[reviewerDecisionId].status, 'pending');
  assert.equal(state.tasks[created.approval.taskId].flags.blocked, true);
  assert.equal(state.tasks[created.approval.taskId].flags.waitingDecision, true);
}

async function main() {
  const fixture = await prepareWaitingGate();
  const sourceBytes = fs.readFileSync(path.join(projectPath, targetPath));
  const beforeInspection = fs.readFileSync(statePath);
  const envelope = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  assert.equal(envelope.readiness.status, 'request-ready');
  assert.equal(envelope.approval, null);
  assert.deepEqual(
    fs.readFileSync(statePath),
    beforeInspection,
    'GET inspection must not save',
  );
  const request = buildApprovalRequest(envelope);

  for (const invalid of [
    { ...request, unexpected: true },
    { ...request, builderReworkDispatchDigest: '0'.repeat(64) },
    { ...request, preflightRunRecordDigest: '0'.repeat(64) },
    { ...request, preflightArtifactRecordDigest: '0'.repeat(64) },
    { ...request, preflightArtifactContentDigest: '0'.repeat(64) },
    {
      ...request,
      approvalRequest: {
        ...request.approvalRequest,
        rationale: 'password=do-not-store-this',
      },
    },
  ]) {
    assert.throws(() =>
      fixture.runtime.requestBuilderReworkMutationApproval({
        reworkPlanId: fixture.reworkPlan.id,
        ...invalid,
      }),
    );
    assert.deepEqual(fs.readFileSync(statePath), beforeInspection);
  }

  assert.throws(
    () =>
      fixture.runtime.createApprovalPlaceholder({
        taskId:
          readState().executionPlans[
            envelope.builderReworkDispatch.executionPlanId
          ].controlTaskId,
        allowedNextAction: 'builder-rework-live-mutation',
      }),
    /dedicated builder-rework-live-mutation approval path/,
  );
  assert.deepEqual(fs.readFileSync(statePath), beforeInspection);

  const collisionState = readState();
  const prospectiveApprovalId = `approval-${String(
    collisionState.sequences.approval + 1,
  ).padStart(4, '0')}`;
  collisionState.approvals[prospectiveApprovalId] = {
    id: prospectiveApprovalId,
    projectId: envelope.builderReworkDispatch.projectId,
    taskId:
      collisionState.executionPlans[
        envelope.builderReworkDispatch.executionPlanId
      ].controlTaskId,
    scope: 'unrelated-collision-proof',
    status: 'rejected',
    placeholder: true,
    allowedNextAction: 'unrelated-action',
    metadata: null,
    inboxItemId: null,
    title: 'Unrelated collision proof',
    prompt: 'Retained only to prove sequence collision refusal.',
    targetArtifactId: null,
    targetRunId: null,
    createdAt: request.evaluatedAt,
    updatedAt: request.evaluatedAt,
    resolvedAt: request.evaluatedAt,
  };
  writeState(collisionState);
  assert.throws(
    () =>
      fixture.runtime.requestBuilderReworkMutationApproval({
        reworkPlanId: fixture.reworkPlan.id,
        ...request,
      }),
    /Approval id collision/,
  );
  assert.deepEqual(readState().approvals[prospectiveApprovalId], collisionState.approvals[prospectiveApprovalId]);
  writeState(JSON.parse(beforeInspection.toString('utf8')));

  const inboxCollisionState = readState();
  const prospectiveInboxId = `decisionInboxItem-${String(
    inboxCollisionState.sequences.decisionInboxItem + 1,
  ).padStart(4, '0')}`;
  inboxCollisionState.decisionInboxItems[prospectiveInboxId] = {
    id: prospectiveInboxId,
    projectId: envelope.builderReworkDispatch.projectId,
    taskId:
      inboxCollisionState.executionPlans[
        envelope.builderReworkDispatch.executionPlanId
      ].controlTaskId,
    kind: 'decision',
    status: 'resolved',
    title: 'Unrelated inbox collision proof',
    prompt: 'Retained only to prove sequence collision refusal.',
    blocksTask: false,
    sourceType: 'decision',
    sourceId: null,
    resolution: {
      action: 'resolved',
      note: '',
      resolvedAt: request.evaluatedAt,
    },
    createdAt: request.evaluatedAt,
    updatedAt: request.evaluatedAt,
  };
  writeState(inboxCollisionState);
  assert.throws(
    () =>
      fixture.runtime.requestBuilderReworkMutationApproval({
        reworkPlanId: fixture.reworkPlan.id,
        ...request,
      }),
    /Decision Inbox id collision/,
  );
  assert.deepEqual(
    readState().decisionInboxItems[prospectiveInboxId],
    inboxCollisionState.decisionInboxItems[prospectiveInboxId],
  );
  writeState(JSON.parse(beforeInspection.toString('utf8')));

  const beforeCreation = readState();
  const created = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  assert.equal(created.idempotent, false);
  assert.equal(created.approval.scope, 'builder-rework');
  assert.equal(created.approval.status, 'pending');
  assert.equal(created.decisionInboxItem.status, 'pending');
  assert.equal(created.decisionInboxItem.blocksTask, false);
  assert.equal(created.approval.metadata.reviewDecisionInboxItemRefs.length, 0);
  const afterCreation = readState();
  assertExecutionEvidenceUnchanged(beforeCreation, afterCreation);
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBytes);
  assert.equal(
    afterCreation.tasks[created.approval.taskId].flags.waitingApproval,
    true,
  );
  assert.equal(
    afterCreation.tasks[created.approval.taskId].flags.blocked,
    beforeCreation.tasks[created.approval.taskId].flags.blocked,
  );
  assert.equal(
    afterCreation.tasks[created.approval.taskId].flags.waitingDecision,
    beforeCreation.tasks[created.approval.taskId].flags.waitingDecision,
  );

  const replayBytes = fs.readFileSync(statePath);
  const replay = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  assert.equal(replay.idempotent, true);
  assert.deepEqual(fs.readFileSync(statePath), replayBytes);
  assert.throws(
    () =>
      fixture.runtime.requestBuilderReworkMutationApproval({
        reworkPlanId: fixture.reworkPlan.id,
        ...buildApprovalRequest(
          envelope,
          'A divergent rationale must not reuse the same source binding.',
        ),
      }),
    /different mutation Approval/,
  );

  const staleReviewerRefs = readState();
  staleReviewerRefs.approvals[
    created.approval.id
  ].metadata.reviewDecisionInboxItemRefs = ['decisionInboxItem-unbound'];
  const staleMetadata =
    staleReviewerRefs.approvals[created.approval.id].metadata;
  const { bindingDigest: _bindingDigest, ...metadataWithoutBinding } =
    staleMetadata;
  staleMetadata.bindingDigest =
    digestBuilderReworkMutationCanonical(metadataWithoutBinding);
  writeState(staleReviewerRefs);
  assert.throws(
    () =>
      fixture.runtime.getBuilderReworkMutationApproval(
        fixture.reworkPlan.id,
      ),
    /stale Reviewer Decision references/,
  );
  writeState(JSON.parse(replayBytes.toString('utf8')));

  const stalePrompt = readState();
  stalePrompt.approvals[created.approval.id].prompt =
    'A changed rationale must not remain source-current.';
  writeState(stalePrompt);
  assert.throws(
    () =>
      fixture.runtime.getBuilderReworkMutationApproval(
        fixture.reworkPlan.id,
      ),
    /invalid Decision Inbox lifecycle/,
  );
  writeState(JSON.parse(replayBytes.toString('utf8')));

  assert.throws(
    () =>
      fixture.runtime.requestBuilderLiveMutationApproval({
        taskId: created.approval.taskId,
      }),
    /dedicated builder-rework-live-mutation approval path/,
  );

  const beforeResolution = readState();
  fixture.runtime.resolveDecisionInboxItem({
    itemId: created.decisionInboxItem.id,
    action: 'approved',
  });
  const afterResolution = readState();
  assertExecutionEvidenceUnchanged(beforeResolution, afterResolution);
  assert.equal(afterResolution.approvals[created.approval.id].status, 'approved');
  assert.equal(
    afterResolution.decisionInboxItems[created.decisionInboxItem.id].resolution
      .action,
    'approved',
  );
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBytes);
  assert.throws(
    () =>
      fixture.runtime.resolveDecisionInboxItem({
        itemId: created.decisionInboxItem.id,
        action: 'rejected',
      }),
    /already terminal/,
  );
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const tampered = readState();
  tampered.approvals[created.approval.id].metadata.bindingDigest = '0'.repeat(64);
  writeState(tampered);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /metadata binding is invalid/,
  );
  writeState(afterResolution);
  const artifactPath =
    afterResolution.artifacts[created.approval.targetArtifactId].path;
  const artifactBytes = fs.readFileSync(artifactPath);
  fs.appendFileSync(artifactPath, '\nraw-byte-drift');
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /stale or invalid source bindings/,
  );
  fs.writeFileSync(artifactPath, artifactBytes);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const outsideArtifactPath = path.join(
    runtimeRoot,
    'outside-builder-rework-preflight.json',
  );
  const retainedArtifactPath = `${artifactPath}.retained`;
  fs.writeFileSync(outsideArtifactPath, artifactBytes);
  fs.renameSync(artifactPath, retainedArtifactPath);
  fs.symlinkSync(outsideArtifactPath, artifactPath);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /not a bounded regular file|escapes the runtime Artifact root/,
  );
  fs.unlinkSync(artifactPath);
  fs.renameSync(retainedArtifactPath, artifactPath);
  fs.unlinkSync(outsideArtifactPath);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  fs.writeFileSync(artifactPath, Buffer.alloc(1024 * 1024 + 1));
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /not a bounded regular file/,
  );
  fs.writeFileSync(artifactPath, artifactBytes);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  await runRejectionSmoke();
  await runReviewerDecisionPrioritySmoke();
  await runApiSmoke();
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: 'ai-company-builder-rework-mutation-approval-smoke',
        schemaVersion: 25,
        approval: 'source-bound-one-way',
        sourceMutation: 'blocked',
      },
      null,
      2,
    )}\n`,
  );
}

export {
  buildApprovalRequest,
  prepareWaitingGate,
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
