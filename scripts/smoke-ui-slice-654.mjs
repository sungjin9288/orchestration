import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { getMissionExecutionPlanBundle } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-654');
const port = 6000 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-654-workorder-persistence-execution-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['Builder preflight evidence'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before builder live mutation'],
};

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'ui-slice-654-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function hashSource() {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(repoRoot, 'src', 'runtime', 'runtime-service.js')))
    .digest('hex');
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const payload = await response.json();
  return { response, payload };
}

function postJson(pathname, body = {}) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-654 server');
}

async function main() {
  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  const seedRuntime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
  });
  seedRuntime.resetRuntime();
  const project = seedRuntime.createProject({ name: 'ui-slice-654', projectPath: repoRoot });
  const mission = seedRuntime.createMission({
    projectId: project.id,
    title: 'Durable WorkOrder operator flow',
    goal: 'Persist one approved plan and stop Builder at the existing mutation gate.',
    constraints: 'Do not dispatch Reviewer or QA and do not mutate source.',
  });
  const started = seedRuntime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  seedRuntime.decideRealCouncilSession({
    councilSessionId: started.councilSession.id,
    action: 'approve',
  });
  const preview = seedRuntime.previewMissionWorkOrders({
    councilSessionId: started.councilSession.id,
    compileSpec,
  });

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const appSource = await (await fetch(`${baseUrl}/app.js`)).text();
    const signalSource = await (await fetch(`${baseUrl}/council-signals.js`)).text();
    const stylesSource = await (await fetch(`${baseUrl}/styles.css`)).text();
    const serverSource = fs.readFileSync(
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      'utf8',
    );

    assert.match(appSource, /검토 대기 계획으로 저장/);
    assert.match(appSource, /Builder 순차 시작/);
    assert.match(appSource, /Decision Inbox에서 digest-bound 계획 승인이 필요합니다/);
    assert.match(appSource, /builder mutation gate/);
    assert.doesNotMatch(appSource, /start-reviewer-workorder/);
    assert.doesNotMatch(appSource, /start-qa-workorder/);
    assert.doesNotMatch(appSource, /apply-workorder-source-mutation/);
    assert.match(signalSource, /getMissionExecutionPlanBundle/);
    assert.match(stylesSource, /\.mission-workorder-plan/);
    assert.match(stylesSource, /\.mission-workorder-actions/);
    assert.match(stylesSource, /@media \(max-width: 720px\)[\s\S]*\.mission-workorder-compile-grid/);
    assert.match(serverSource, /work-order-plans/);
    assert.match(serverSource, /start-sequential/);
    assert.match(serverSource, /finalizeSequentialWorkOrderExecution/);

    const beforeInvalid = fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8');
    const invalid = await postJson(
      `/api/council-sessions/${encodeURIComponent(started.councilSession.id)}/work-order-plans`,
      {
        compileSpec,
        previewId: `${preview.previewId}-stale`,
        sourceDigest: preview.sourceDigest,
      },
    );
    assert.equal(invalid.response.status, 409);
    assert.match(invalid.payload.error, /previewId does not match/);
    assert.equal(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'), beforeInvalid);

    const persisted = await postJson(
      `/api/council-sessions/${encodeURIComponent(started.councilSession.id)}/work-order-plans`,
      {
        compileSpec,
        previewId: preview.previewId,
        sourceDigest: preview.sourceDigest,
      },
    );
    assert.equal(persisted.response.status, 201);
    assert.equal(persisted.payload.snapshot.schemaVersion, 10);
    assert.equal(persisted.payload.executionPlanBundle.executionPlan.status, 'pending-approval');
    assert.equal(persisted.payload.executionPlanBundle.workOrders.length, 3);
    assert.equal(persisted.payload.executionPlanBundle.handoffPackets.length, 3);
    assert.deepEqual(
      persisted.payload.executionPlanBundle.workOrders.map((entry) => entry.status),
      ['pending-approval', 'blocked-dependency', 'blocked-dependency'],
    );

    const executionPlan = persisted.payload.executionPlanBundle.executionPlan;
    const approval = persisted.payload.executionPlanBundle.approval;
    const derivedBundle = getMissionExecutionPlanBundle(
      persisted.payload.snapshot,
      started.councilSession.id,
    );
    assert.equal(derivedBundle.executionPlan.id, executionPlan.id);
    assert.equal(derivedBundle.controlTask.id, executionPlan.controlTaskId);

    const idempotent = await postJson(
      `/api/council-sessions/${encodeURIComponent(started.councilSession.id)}/work-order-plans`,
      {
        compileSpec,
        previewId: preview.previewId,
        sourceDigest: preview.sourceDigest,
      },
    );
    assert.equal(idempotent.response.status, 200);
    assert.equal(idempotent.payload.mutation.idempotent, true);

    const blockedStart = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/start-sequential`,
      { approvalId: approval.id },
    );
    assert.equal(blockedStart.response.status, 409);
    assert.match(blockedStart.payload.error, /not approved/);

    const approved = await postJson(
      `/api/decision-inbox/${encodeURIComponent(approval.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    assert.equal(approved.response.status, 200);
    assert.equal(approved.payload.snapshot.executionPlans[executionPlan.id].status, 'approved');
    assert.equal(
      approved.payload.snapshot.workOrders[executionPlan.workOrderIds[0]].status,
      'queued',
    );

    const sourceBeforeStart = hashSource();
    const dispatched = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/start-sequential`,
      { approvalId: approval.id },
    );
    assert.equal(dispatched.response.status, 200);
    assert.equal(
      dispatched.payload.mutation.autoChain.stoppedAt,
      'request-builder-live-mutation-approval',
    );
    assert.ok(dispatched.payload.mutation.terminalGateApprovalId);
    assert.equal(dispatched.payload.executionPlanBundle.executionPlan.status, 'active');
    assert.equal(dispatched.payload.executionPlanBundle.workOrders[0].status, 'waiting-gate');
    assert.ok(
      dispatched.payload.executionPlanBundle.workOrders
        .slice(1)
        .every((entry) => entry.status === 'blocked-dependency'),
    );
    assert.equal(hashSource(), sourceBeforeStart);

    const reloaded = await fetchJson(`/api/execution-plans/${encodeURIComponent(executionPlan.id)}`);
    assert.equal(reloaded.response.status, 200);
    assert.equal(reloaded.payload.executionPlanBundle.workOrders[0].status, 'waiting-gate');
    assert.deepEqual(
      reloaded.payload.executionPlanBundle.executionPlan,
      dispatched.payload.executionPlanBundle.executionPlan,
    );

    const repeatedStart = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/start-sequential`,
      { approvalId: approval.id },
    );
    assert.equal(repeatedStart.response.status, 409);
    assert.match(repeatedStart.payload.error, /not approved/);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      ui: {
        explicitPersistApproveStart: true,
        reloadEvidence: true,
        downstreamControlsBlocked: true,
        desktopMobileRulesPresent: true,
      },
      api: {
        invalidDigestStatus: 409,
        idempotentPersistence: true,
        decisionInboxApprovalBound: true,
        stoppedAt: 'request-builder-live-mutation-approval',
        sourceMutation: false,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000).then(() => server.kill('SIGKILL')),
    ]);
    fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  }

  if (stderr.trim()) throw new Error(stderr.trim());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
