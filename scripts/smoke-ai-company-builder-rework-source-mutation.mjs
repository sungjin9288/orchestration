import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildApprovalRequest,
  prepareWaitingGate,
} from './smoke-ai-company-builder-rework-mutation-approval.mjs';
import {
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
  tempRoot,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const { createExecutionCoordinator } = coordinatorModule;
const { createLocalStubProviderAdapter } = localStubModule;
const { createFileStore } = fileStoreModule;
const MODE = 'ai-company-builder-rework-source-mutation-smoke';
const port = 10850 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function digestContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

async function prepareApprovedMutation() {
  const fixture = await prepareWaitingGate({ withReviewerDecision: true });
  const readiness = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const created = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildApprovalRequest(
      readiness,
      'Approve one exact local Builder rework source mutation.',
    ),
  });
  fixture.runtime.resolveDecisionInboxItem({
    itemId: created.decisionInboxItem.id,
    action: 'approved',
  });
  const approved = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  assert.equal(approved.approval.status, 'approved');
  return { ...fixture, approved };
}

function buildMutationRequest(approved, rationale = 'Apply the exact approved rework target once.') {
  const reviewedAt = new Date(
    Math.max(Date.now(), Date.parse(approved.approval.resolvedAt)),
  ).toISOString();
  return {
    ...approved.readiness.requestSource,
    mutationApprovalId: approved.approval.id,
    mutationApprovalBindingDigest: approved.approval.metadata.bindingDigest,
    evaluatedAt: reviewedAt,
    mutationRequest: {
      decision: 'run-builder-rework-live-mutation',
      acknowledgement:
        'mutate-only-approved-rework-targets-and-stop-before-reviewer',
      rationale,
      reviewedAt,
    },
  };
}

function createCountingAdapter(executeOverride = null) {
  const delegate = createLocalStubProviderAdapter();
  let calls = 0;
  return {
    adapter: {
      name: delegate.name,
      async execute(request, context) {
        calls += 1;
        if (executeOverride) return executeOverride(request, context, delegate);
        return delegate.execute(request, context);
      },
    },
    get calls() {
      return calls;
    },
  };
}

function createCoordinator(runtime, countingAdapter) {
  return createExecutionCoordinator({
    runtimeService: runtime,
    repoRoot: path.resolve('.'),
    providerAdapter: countingAdapter.adapter,
  });
}

async function runSuccessAndReplaySmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBefore = fs.readFileSync(sourcePath, 'utf8');
  const stateBefore = readState();
  const approvalBefore = structuredClone(
    stateBefore.approvals[fixture.approved.approval.id],
  );
  const inboxBefore = structuredClone(
    stateBefore.decisionInboxItems[fixture.approved.approval.inboxItemId],
  );
  const planBefore = structuredClone(stateBefore.executionPlans);
  const workOrdersBefore = structuredClone(stateBefore.workOrders);
  const counting = createCountingAdapter();
  const coordinator = createCoordinator(fixture.runtime, counting);
  const result = await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  const mutation = result.builderReworkSourceMutation;
  assert.equal(result.idempotent, false);
  assert.equal(counting.calls, 1);
  assert.equal(mutation.status, 'completed');
  assert.equal(mutation.persisted, true);
  assert.equal(
    mutation.nextGate,
    'separate-reviewer-reexecution-decision-required',
  );
  assert.equal(mutation.workOrderAttempt.attemptNumber, 3);
  assert.equal(mutation.workOrderAttempt.status, 'completed');
  assert.equal(mutation.workOrderAttempt.runRefs.length, 2);
  assert.equal(mutation.workOrderAttempt.artifactRefs.length, 4);
  assert.deepEqual(
    mutation.artifacts.map((artifact) => artifact.type),
    ['change-summary', 'patch', 'diff'],
  );
  assert.deepEqual(mutation.changedFiles, [targetPath]);
  assert.match(
    fs.readFileSync(sourcePath, 'utf8'),
    new RegExp(`builder-rework-live-mutation ${fixture.approved.approval.id}`),
  );
  const stateAfter = readState();
  assert.equal(stateAfter.schemaVersion, 29);
  assert.deepEqual(
    stateAfter.approvals[fixture.approved.approval.id],
    approvalBefore,
  );
  assert.deepEqual(
    stateAfter.decisionInboxItems[fixture.approved.approval.inboxItemId],
    inboxBefore,
  );
  assert.deepEqual(stateAfter.executionPlans, planBefore);
  assert.deepEqual(stateAfter.workOrders, workOrdersBefore);
  const reviewer = Object.values(stateAfter.workOrders).find(
    (workOrder) => workOrder.role === 'reviewer',
  );
  const qa = Object.values(stateAfter.workOrders).find(
    (workOrder) => workOrder.role === 'qa',
  );
  assert.equal(reviewer.status, 'changes-requested');
  assert.equal(qa.status, 'blocked-dependency');
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
  const getBytes = fs.readFileSync(statePath);
  const inspected = fixture.runtime.getBuilderReworkSourceMutation(
    fixture.reworkPlan.id,
  );
  assert.equal(inspected.status, 'completed');
  assert.deepEqual(fs.readFileSync(statePath), getBytes);
  assert.equal(
    fixture.runtime.getBuilderReworkMutationApproval(fixture.reworkPlan.id)
      .approval.status,
    'approved',
  );
  const sourceAfter = fs.readFileSync(sourcePath);
  const stateAfterBytes = fs.readFileSync(statePath);
  const replay = await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  assert.equal(replay.idempotent, true);
  assert.equal(replay.builderReworkSourceMutation.status, 'completed');
  assert.equal(counting.calls, 1);
  assert.deepEqual(fs.readFileSync(sourcePath), sourceAfter);
  assert.deepEqual(fs.readFileSync(statePath), stateAfterBytes);
  await assert.rejects(
    () =>
      coordinator.runBuilderReworkSourceMutation({
        reworkPlanId: fixture.reworkPlan.id,
        ...request,
        mutationRequest: {
          ...request.mutationRequest,
          rationale: 'A divergent replay must not execute.',
        },
      }),
    /different source mutation request/,
  );
  assert.equal(counting.calls, 1);
  assert.notEqual(fs.readFileSync(sourcePath, 'utf8'), sourceBefore);
}

async function runValidationAndFailureSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBefore = fs.readFileSync(sourcePath);
  const stateBefore = fs.readFileSync(statePath);
  for (const invalid of [
    { ...request, unexpected: true },
    { ...request, mutationApprovalBindingDigest: '0'.repeat(64) },
    {
      ...request,
      mutationRequest: {
        ...request.mutationRequest,
        acknowledgement: 'widen-source',
      },
    },
    {
      ...request,
      mutationRequest: {
        ...request.mutationRequest,
        rationale: 'password=blocked',
      },
    },
  ]) {
    assert.throws(
      () =>
        fixture.runtime.prepareBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...invalid,
        }),
    );
    assert.deepEqual(fs.readFileSync(statePath), stateBefore);
    assert.deepEqual(fs.readFileSync(sourcePath), sourceBefore);
  }

  const retainedPath = `${sourcePath}.retained`;
  fs.renameSync(sourcePath, retainedPath);
  fs.symlinkSync(retainedPath, sourcePath);
  const symlinkCounting = createCountingAdapter();
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, symlinkCounting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /regular non-symlink file/,
  );
  assert.equal(symlinkCounting.calls, 0);
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  fs.unlinkSync(sourcePath);
  fs.renameSync(retainedPath, sourcePath);

  fs.renameSync(sourcePath, retainedPath);
  fs.linkSync(retainedPath, sourcePath);
  const hardLinkCounting = createCountingAdapter();
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, hardLinkCounting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /one hard link/,
  );
  assert.equal(hardLinkCounting.calls, 0);
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  fs.unlinkSync(sourcePath);
  fs.renameSync(retainedPath, sourcePath);

  fs.appendFileSync(
    sourcePath,
    '\n// synthetic credential sk-proj-1234567890abcdefghijklmnop\n',
  );
  const sensitiveCounting = createCountingAdapter();
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, sensitiveCounting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /credential-sensitive/,
  );
  assert.equal(sensitiveCounting.calls, 0);
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  fs.writeFileSync(sourcePath, sourceBefore);

  const widenedCounting = createCountingAdapter(async (providerRequest) => ({
    providerRunId: 'local-stub-widened-rework',
    model: 'local-stub-builder-rework-live-mutation-v1',
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'separate-reviewer-reexecution-decision-required',
    },
    outputText: `# Builder Rework Source Mutation\n\n## File Updates\n### outside.js\n\`\`\`base64\n${Buffer.from('outside', 'utf8').toString('base64')}\n\`\`\`\n`,
  }));
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, widenedCounting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /exceeds the target allowlist/,
  );
  assert.equal(widenedCounting.calls, 1);
  assert.deepEqual(fs.readFileSync(sourcePath), sourceBefore);
  const failed = fixture.runtime.getBuilderReworkSourceMutation(
    fixture.reworkPlan.id,
  );
  assert.equal(failed.status, 'failed');
  assert.equal(failed.artifacts.length, 0);
  assert.equal(failed.workOrderAttempt.runRefs.length, 2);
  assert.equal(failed.workOrderAttempt.artifactRefs.length, 1);
  const failedBytes = fs.readFileSync(statePath);
  const failedReplay = await createCoordinator(fixture.runtime, widenedCounting)
    .runBuilderReworkSourceMutation({
      reworkPlanId: fixture.reworkPlan.id,
      ...request,
    });
  assert.equal(failedReplay.idempotent, true);
  assert.equal(failedReplay.builderReworkSourceMutation.status, 'failed');
  assert.equal(widenedCounting.calls, 1);
  assert.deepEqual(fs.readFileSync(statePath), failedBytes);
}

async function runWriteRollbackSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBefore = fs.readFileSync(sourcePath);
  const originalFinalize =
    fixture.runtime.finalizeBuilderReworkSourceMutation;
  fixture.runtime.finalizeBuilderReworkSourceMutation = () => {
    throw new Error('synthetic settlement refusal after source write');
  };
  const counting = createCountingAdapter();
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, counting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /synthetic settlement refusal/,
  );
  fixture.runtime.finalizeBuilderReworkSourceMutation = originalFinalize;
  assert.equal(counting.calls, 1);
  assert.deepEqual(
    fs.readFileSync(sourcePath),
    sourceBefore,
    'failed settlement must restore every touched target',
  );
  const failed = fixture.runtime.getBuilderReworkSourceMutation(
    fixture.reworkPlan.id,
  );
  assert.equal(failed.status, 'failed');
  assert.equal(failed.artifacts.length, 0);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
}

async function runBaselineDriftSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const counting = createCountingAdapter(
    async (providerRequest, context, delegate) => {
      const response = await delegate.execute(providerRequest, context);
      fs.appendFileSync(sourcePath, '\n// external-baseline-drift\n');
      return response;
    },
  );
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, counting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /baseline drift detected/,
  );
  assert.equal(counting.calls, 1);
  const failed = fixture.runtime.getBuilderReworkSourceMutation(
    fixture.reworkPlan.id,
  );
  assert.equal(failed.status, 'failed');
  assert.equal(failed.changedFiles.length, 0);
  assert.equal(failed.artifacts.length, 0);
}

async function runWriteRaceSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBefore = fs.readFileSync(sourcePath);
  const replacement = Buffer.from(sourceBefore);
  replacement[0] = replacement[0] === 0x2f ? 0x20 : 0x2f;
  const originalOpenSync = fs.openSync;
  let injected = false;
  fs.openSync = function patchedOpenSync(filePath, flags, ...rest) {
    if (
      !injected &&
      typeof flags === 'number' &&
      (flags & fs.constants.O_RDWR) === fs.constants.O_RDWR &&
      path.resolve(filePath) === fs.realpathSync(sourcePath)
    ) {
      injected = true;
      const descriptor = originalOpenSync(
        filePath,
        fs.constants.O_RDWR | (fs.constants.O_NOFOLLOW || 0),
      );
      try {
        fs.writeSync(descriptor, replacement, 0, replacement.length, 0);
        fs.fsyncSync(descriptor);
      } finally {
        fs.closeSync(descriptor);
      }
    }
    return originalOpenSync(filePath, flags, ...rest);
  };
  const counting = createCountingAdapter();
  try {
    await assert.rejects(
      () =>
        createCoordinator(fixture.runtime, counting)
          .runBuilderReworkSourceMutation({
            reworkPlanId: fixture.reworkPlan.id,
            ...request,
          }),
      /changed before write/,
    );
  } finally {
    fs.openSync = originalOpenSync;
  }
  assert.equal(injected, true);
  assert.equal(counting.calls, 1);
  assert.deepEqual(fs.readFileSync(sourcePath), replacement);
  assert.equal(
    fixture.runtime.getBuilderReworkSourceMutation(fixture.reworkPlan.id)
      .status,
    'failed',
  );
}

async function runNonClobberingRollbackSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  fixture.runtime.finalizeBuilderReworkSourceMutation = () => {
    fs.appendFileSync(sourcePath, '\n// external-after-mutation-write\n');
    throw new Error('synthetic settlement refusal after external drift');
  };
  const counting = createCountingAdapter();
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, counting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /restoration failed; active evidence retained/,
  );
  const currentSource = fs.readFileSync(sourcePath, 'utf8');
  assert.match(currentSource, /builder-rework-live-mutation/);
  assert.match(currentSource, /external-after-mutation-write/);
  const active = fixture.runtime.getBuilderReworkSourceMutation(
    fixture.reworkPlan.id,
  );
  assert.equal(active.status, 'running');
  assert.equal(active.mutationRun.status, 'running');
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
}

async function runCommittedProjectionSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  fixture.runtime.getBuilderReworkSourceMutation = () => {
    throw new Error('post-commit projection must not call GET');
  };
  const result = await createCoordinator(
    fixture.runtime,
    createCountingAdapter(),
  ).runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  assert.equal(result.builderReworkSourceMutation.status, 'completed');
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
}

async function runCompletedSourceDriftSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const counting = createCountingAdapter();
  const coordinator = createCoordinator(fixture.runtime, counting);
  await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  fs.appendFileSync(
    path.join(projectPath, targetPath),
    '\n// post-completion-drift\n',
  );
  assert.throws(
    () =>
      fixture.runtime.getBuilderReworkSourceMutation(fixture.reworkPlan.id),
    /do not match durable evidence/,
  );
  await assert.rejects(
    () =>
      coordinator.runBuilderReworkSourceMutation({
        reworkPlanId: fixture.reworkPlan.id,
        ...request,
      }),
    /do not match durable evidence/,
  );
  assert.equal(counting.calls, 1);
}

async function runTerminalEvidenceTamperSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const result = await createCoordinator(
    fixture.runtime,
    createCountingAdapter(),
  ).runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  const state = readState();
  const mutationRunId =
    result.builderReworkSourceMutation.workOrderAttempt.runRefs[1];
  state.runs[mutationRunId].summary.changedFiles = ['outside.js'];
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /invalid completed rework mutation evidence/,
  );
}

async function runEncodedOutputCapSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBefore = fs.readFileSync(sourcePath);
  const encoded = 'A'.repeat(4 * Math.ceil((1024 * 1024) / 3) + 4);
  const counting = createCountingAdapter(async () => ({
    providerRunId: 'local-stub-oversized-encoded-rework',
    model: 'local-stub-builder-rework-live-mutation-v1',
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'separate-reviewer-reexecution-decision-required',
    },
    outputText:
      `# Builder Rework Source Mutation\n\n## File Updates\n### ${targetPath}\n` +
      `\`\`\`base64\n${encoded}\n\`\`\`\n`,
  }));
  await assert.rejects(
    () =>
      createCoordinator(fixture.runtime, counting)
        .runBuilderReworkSourceMutation({
          reworkPlanId: fixture.reworkPlan.id,
          ...request,
        }),
    /invalid base64/,
  );
  assert.equal(counting.calls, 1);
  assert.deepEqual(fs.readFileSync(sourcePath), sourceBefore);
  assert.equal(
    fixture.runtime.getBuilderReworkSourceMutation(fixture.reworkPlan.id)
      .status,
    'failed',
  );
}

async function runInterruptionSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const prepared = fixture.runtime.prepareBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  const baselineTargetDigests = prepared.source.reworkPlan.targetPathAllowlist.map(
    (relativePath) => ({
      path: relativePath,
      digest: digestContent(
        fs.readFileSync(path.join(projectPath, relativePath), 'utf8'),
      ),
    }),
  );
  const started = fixture.runtime.beginBuilderReworkSourceMutation({
    baselineTargetDigests,
    request,
    reworkPlanId: fixture.reworkPlan.id,
  });
  assert.equal(started.idempotent, false);
  assert.equal(started.builderReworkSourceMutation.status, 'running');
  assert.equal(
    started.builderReworkSourceMutation.mutationRun.status,
    'running',
  );
  const stateBytes = fs.readFileSync(statePath);
  const replay = fixture.runtime.prepareBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...request,
  });
  assert.equal(replay.idempotent, true);
  assert.equal(replay.projection.status, 'running');
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
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
      throw new Error(`Source mutation API server exited: ${output}`);
    }
    await delay(20);
  }
  throw new Error(`Timed out waiting for source mutation API: ${output}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  return { response, payload: await response.json() };
}

async function runApiSmoke() {
  const fixture = await prepareApprovedMutation();
  const request = buildMutationRequest(fixture.approved);
  const endpoint =
    `${baseUrl}/api/rework-plans/${encodeURIComponent(fixture.reworkPlan.id)}` +
    '/builder-rework-source-mutation';
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
    assert.equal(inspected.payload.builderReworkSourceMutation.status, 'ready');
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
    assert.equal(
      created.payload.builderReworkSourceMutation.status,
      'completed',
    );
    const replay = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.idempotent, true);
    const divergent = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        mutationRequest: {
          ...request.mutationRequest,
          rationale: 'Divergent API replay must conflict.',
        },
      }),
    });
    assert.equal(divergent.response.status, 409);
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

async function main() {
  try {
    await runSuccessAndReplaySmoke();
    await runValidationAndFailureSmoke();
    await runWriteRollbackSmoke();
    await runBaselineDriftSmoke();
    await runWriteRaceSmoke();
    await runNonClobberingRollbackSmoke();
    await runCommittedProjectionSmoke();
    await runCompletedSourceDriftSmoke();
    await runTerminalEvidenceTamperSmoke();
    await runEncodedOutputCapSmoke();
    await runInterruptionSmoke();
    await runApiSmoke();
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: 25,
          workerCalls: 'one-per-new-request',
          sourceMutation: 'bounded-local-stub',
          nextGate: 'separate-reviewer-reexecution-decision-required',
        },
        null,
        2,
      )}\n`,
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
