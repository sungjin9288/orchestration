import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import {
  getMissionExecutionPlanBundle,
  getMissionOperatorSteppedSchedulerSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-698');
const runtimeRoot = path.join(tempRoot, 'runtime');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const port = 9900 + (process.pid % 80);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-698-operator-stepped-workorder-scheduler-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_698_KEEP_FIXTURE === '1';
const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['One bounded Builder, Reviewer, and QA evidence chain'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before Mission done, retry, rework, commit, push, or release'],
};

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'ui-slice-698-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function seedApprovedBoundPlan() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'UI operator-stepped scheduler',
    projectPath: repoRoot,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Operator-stepped UI contract',
    goal: 'Expose exactly one dependency-ready role command at a time.',
    constraints: 'No run-all, retry, rework, provider, Git, release, or background controls.',
  });
  const evaluatedAt = new Date().toISOString();
  const staffingSpec = {
    mode: 'council',
    selectedAgentIds: [
      'agent-conductor',
      'agent-strategist',
      'agent-architect',
      'agent-decomposer',
    ],
    selectionRationale: 'Bind one exact Council to explicit operator steps.',
    parallelGroups: [],
    providerMode: 'local-stub',
    terminationPolicy: {
      maxProviderCalls: 0,
      maxTurnsPerAgent: 4,
      deadlineMs: 120000,
      stopOnRequiredRoleFailure: true,
    },
  };
  const staffingPreview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const accepted = runtime.acceptMissionStaffingPlan({
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
      rationale: 'Accept the exact local StaffingPlan for UI verification.',
      reviewedAt: evaluatedAt,
    },
  });
  const staffingPlan = accepted.staffingPlan;
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
      rationale: 'Bind the exact plan to one local Council.',
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
  return { mission, persisted };
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

function postJson(pathname, body) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(120);
  }
  throw new Error('Timed out waiting for ui-slice-698 server');
}

async function main() {
  const seeded = seedApprovedBoundPlan();
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
    const [appSource, signalSource, stylesSource] = await Promise.all([
      fetch(`${baseUrl}/app.js`).then((response) => response.text()),
      fetch(`${baseUrl}/council-signals.js`).then((response) => response.text()),
      fetch(`${baseUrl}/styles.css`).then((response) => response.text()),
    ]);
    const planRenderer = appSource.slice(
      appSource.indexOf('function renderMissionExecutionPlan'),
      appSource.indexOf('function renderWorkOrderVerificationPlanPreview'),
    );
    assert.match(planRenderer, /Operator Steps/);
    assert.match(planRenderer, /data-action="operator-step-workorder"/);
    assert.match(planRenderer, /Builder Step/);
    assert.match(planRenderer, /Reviewer Step/);
    assert.match(planRenderer, /QA Step/);
    assert.match(planRenderer, /schedulerSummary[\s\S]*continue-reviewed-delivery/);
    assert.doesNotMatch(planRenderer, /run-all|auto-run|retry WorkOrder|parallel WorkOrder/i);
    assert.match(appSource, /async function submitOperatorWorkOrderStep/);
    assert.match(appSource, /checkpointDigest: checkpoint\.checkpointDigest/);
    assert.match(appSource, /authorityDigest: checkpoint\.authorityDigest/);
    assert.match(signalSource, /getMissionOperatorSteppedSchedulerSummary/);
    assert.match(signalSource, /active 상태는 별도 recovery 승인 전까지/);
    assert.match(stylesSource, /\.workorder-attempt-ledger/);
    assert.match(stylesSource, /\.workorder-attempt-row/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);

    const initial = await fetchJson('/api/snapshot');
    assert.equal(initial.response.status, 200);
    assert.equal(initial.payload.snapshot.schemaVersion, 19);
    let bundle = getMissionExecutionPlanBundle(
      initial.payload.snapshot,
      initial.payload.snapshot.missions[seeded.mission.id].councilSessionId,
    );
    let summary = getMissionOperatorSteppedSchedulerSummary(bundle);
    assert.equal(summary.startAllowed, true);
    assert.equal(summary.stepAllowed, false);

    const malformedStart = await postJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/start-sequential`,
      { approvalId: seeded.persisted.approval.id, unexpected: true },
    );
    assert.equal(malformedStart.response.status, 400);
    const afterMalformedStart = await fetchJson('/api/snapshot');
    assert.equal(Object.keys(afterMalformedStart.payload.snapshot.workOrderAttempts).length, 0);

    const start = await postJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/start-sequential`,
      { approvalId: seeded.persisted.approval.id },
    );
    assert.equal(start.response.status, 200, JSON.stringify(start.payload));
    assert.equal(start.payload.mutation.kind, 'start-sequential-workorder-plan');
    assert.ok(start.payload.mutation.workOrderAttemptId);
    assert.equal(start.payload.executionPlanBundle.workOrderAttempts.length, 1);
    assert.equal(start.payload.executionPlanBundle.latestWorkOrderAttempt.status, 'waiting-gate');
    assert.equal(start.payload.executionPlanBundle.workOrders[1].status, 'blocked-dependency');
    assert.equal(start.payload.executionPlanBundle.workOrders[2].status, 'blocked-dependency');

    const inspection = await fetchJson(
      `/api/work-order-attempts/${encodeURIComponent(start.payload.mutation.workOrderAttemptId)}`,
    );
    assert.equal(inspection.response.status, 200);
    assert.equal(inspection.payload.persisted, true);
    assert.equal(inspection.payload.workOrderAttempt.status, 'waiting-gate');

    const afterStart = await fetchJson('/api/snapshot');
    bundle = getMissionExecutionPlanBundle(
      afterStart.payload.snapshot,
      afterStart.payload.snapshot.missions[seeded.mission.id].councilSessionId,
    );
    summary = getMissionOperatorSteppedSchedulerSummary(bundle);
    assert.equal(summary.stepAllowed, false);
    assert.match(summary.blockedReason, /live-mutation 승인/);
    const attemptCountBeforeFailures = bundle.workOrderAttempts.length;

    const malformed = await postJson(
      `/api/execution-plans/${encodeURIComponent(bundle.executionPlan.id)}/step`,
      { action: 'run-all' },
    );
    assert.equal(malformed.response.status, 400);
    const stale = await postJson(
      `/api/execution-plans/${encodeURIComponent(bundle.executionPlan.id)}/step`,
      {
        action: 'continue-builder',
        expectedWorkOrderId: bundle.workOrders[0].id,
        sourceDigest: '0'.repeat(64),
        checkpointId: bundle.latestCheckpoint.id,
        checkpointDigest: bundle.latestCheckpoint.checkpointDigest,
        inputDigest: bundle.latestCheckpoint.inputDigest,
        authorityDigest: bundle.latestCheckpoint.authorityDigest,
        terminalGateApprovalId: bundle.terminalGateApproval.id,
        evaluatedAt: new Date().toISOString(),
      },
    );
    assert.equal(stale.response.status, 409);
    const afterFailures = await fetchJson('/api/snapshot');
    assert.equal(
      Object.keys(afterFailures.payload.snapshot.workOrderAttempts).length,
      attemptCountBeforeFailures,
    );

    const oldContinuation = await postJson(
      `/api/execution-plans/${encodeURIComponent(bundle.executionPlan.id)}/continue-reviewed-delivery`,
      {
        terminalGateApprovalId: bundle.terminalGateApproval.id,
        sourceDigest: bundle.executionPlan.sourceDigest,
      },
    );
    assert.equal(oldContinuation.response.status, 409);
    assert.match(oldContinuation.payload.error, /explicit operator step/);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        startStatus: start.response.status,
        malformedStartStatus: malformedStart.response.status,
        exactInspectionStatus: inspection.response.status,
        malformedStepStatus: malformed.response.status,
        staleStepStatus: stale.response.status,
        oldMultiRolePathStatus: oldContinuation.response.status,
      },
      ui: {
        oneRoleStepControl: true,
        durableAttemptEvidence: true,
        oldRunAllHiddenForBoundPlan: true,
        retryReworkParallelProviderControls: false,
        boundedResponsiveText: true,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)]);
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
  if (stderr.trim()) throw new Error(stderr.trim());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
