import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import {
  getMissionExecutionPlanBundle,
  getMissionWorkflowCheckpointSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-656');
const runtimeRoot = path.join(tempRoot, 'runtime');
const projectPath = path.join(tempRoot, 'project');
const targetPath = 'src/runtime/runtime-service.js';
const port = 6600 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-656-checkpoint-recovery-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_656_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['Builder mutation, review, and QA evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, commit, push, or release'],
};
const projectFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'ui-slice-656-council-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function createTargetedProviderAdapter() {
  const base = createLocalStubProviderAdapter();
  return {
    name: 'ui-slice-656-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// ui-slice-656 ${request.approval.id}\n`;
      return {
        providerRunId: `ui-slice-656-builder-${request.task.id}`,
        model: 'ui-slice-656-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded syntax-safe fixture update.',
        },
        outputText: `# Builder Live Mutation\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content, 'utf8').toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
  };
}

function stageRecord(stage, result = {}) {
  return {
    stage,
    runId: result.run?.id || null,
    artifactId: result.artifact?.id || null,
    inboxItemId: result.decisionInboxItem?.id || result.item?.id || null,
    approvalId: result.approval?.id || null,
  };
}

async function seedReviewerReadyState() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  for (const relativePath of projectFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\nmodule.exports = { uiSlice656: true };\n`
        : relativePath.endsWith('.md')
          ? '# UI slice 656 fixture\n'
          : `'use strict';\n`,
    );
  }

  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name: 'ui-slice-656', projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Workflow checkpoint operator recovery',
    goal: 'Resume exactly one durable reviewed-delivery boundary.',
    constraints: 'No automatic replay, provider expansion, Mission done, commit, push, or release.',
  });
  const council = runtime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  runtime.decideRealCouncilSession({ councilSessionId: council.councilSession.id, action: 'approve' });
  const preview = runtime.previewMissionWorkOrders({
    councilSessionId: council.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: council.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({ itemId: persisted.approval.inboxItemId, action: 'approved' });
  const started = runtime.beginSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    approvalId: persisted.approval.id,
  });
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    providerAdapter: createTargetedProviderAdapter(),
  });
  const task = started.controlTask;
  const planner = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: {
      classification: 'new task',
      scopeStatement: task.intent,
      missingContext: [],
      decisionNote: '',
    },
  });
  const architect = await coordinator.runArchitect({ taskId: task.id });
  const taskBreaker = await coordinator.runTaskBreaker({ taskId: task.id });
  const preflight = await coordinator.runBuilderPreflight({ taskId: task.id });
  const terminalApproval = runtime.requestBuilderLiveMutationApproval({ taskId: task.id });
  runtime.finalizeSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    workOrderId: started.executionPlan.activeWorkOrderId,
    stageResults: [
      stageRecord('planner', planner),
      stageRecord('architect', architect),
      stageRecord('task-breaker', taskBreaker),
      stageRecord('builder-preflight', preflight),
      stageRecord('request-builder-live-mutation-approval', {
        approval: terminalApproval,
        item: runtime.getDecisionInboxItem(terminalApproval.inboxItemId),
      }),
    ],
    stopReason: 'waiting-approval',
    stoppedAt: 'request-builder-live-mutation-approval',
    terminalGateApprovalId: terminalApproval.id,
  });
  runtime.resolveDecisionInboxItem({ itemId: terminalApproval.inboxItemId, action: 'approved' });
  runtime.beginReviewedDeliveryContinuation({
    executionPlanId: persisted.executionPlan.id,
    terminalGateApprovalId: terminalApproval.id,
    sourceDigest: persisted.executionPlan.sourceDigest,
  });
  const builder = await coordinator.runBuilderLiveMutation({ taskId: task.id });
  runtime.completeReviewedDeliveryBuilder({
    executionPlanId: persisted.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  return { mission, persisted, runtime };
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

function postJson(pathname, body = {}) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-656 server');
}

function exactTuple(recovery, action) {
  return {
    checkpointId: recovery.checkpoint.id,
    checkpointDigest: recovery.checkpoint.checkpointDigest,
    inputDigest: recovery.checkpoint.inputDigest,
    authorityDigest: recovery.checkpoint.authorityDigest,
    ...(action ? { action } : {}),
  };
}

async function main() {
  const seeded = await seedReviewerReadyState();
  const executionPlanId = seeded.persisted.executionPlan.id;
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourceBeforeServer = fs.readFileSync(path.join(projectPath, targetPath), 'utf8');
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
    assert.match(appSource, /Workflow recovery/);
    assert.match(appSource, /Reviewer 재개/);
    assert.match(appSource, /QA 재개/);
    assert.match(appSource, /Checkpoint 취소/);
    assert.match(appSource, /격리됨/);
    assert.match(appSource, /오래됨/);
    assert.match(appSource, /data-action="resume-workflow-checkpoint"/);
    assert.match(appSource, /data-action="cancel-workflow-checkpoint"/);
    assert.doesNotMatch(appSource, /data-action="auto-resume-workflow"/);
    assert.doesNotMatch(appSource, /data-action="replay-builder-workorder"/);
    assert.match(appSource, /data-action="persist-delivery-package"/);
    assert.match(appSource, /data-action="accept-delivery-package"/);
    assert.match(signalSource, /getMissionWorkflowCheckpointSummary/);
    assert.match(stylesSource, /\.workflow-checkpoint-register/);
    assert.match(stylesSource, /\.workflow-checkpoint-grid \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.workflow-checkpoint-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshot = await fetchJson('/api/snapshot');
    assert.equal(snapshot.response.status, 200);
    const bundle = getMissionExecutionPlanBundle(
      snapshot.payload.snapshot,
      snapshot.payload.snapshot.missions[seeded.mission.id].councilSessionId,
    );
    assert.equal(bundle.latestCheckpoint.stage, 'reviewer-ready');
    assert.equal(bundle.workflowCheckpoints.length, 2);

    const recoveryResult = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/recovery`,
    );
    assert.equal(recoveryResult.response.status, 200);
    const reviewerRecovery = recoveryResult.payload.executionPlanRecovery;
    assert.equal(reviewerRecovery.classification, 'ready');
    assert.deepEqual(reviewerRecovery.nextAllowedActions, ['resume-reviewer']);

    const quarantinedSummary = getMissionWorkflowCheckpointSummary(
      {
        ...reviewerRecovery,
        classification: 'quarantined',
        current: false,
        nextAllowedActions: [],
      },
      executionPlanId,
    );
    assert.equal(quarantinedSummary.canResume, false);
    assert.equal(quarantinedSummary.canCancel, false);
    const builderWaitingSummary = getMissionWorkflowCheckpointSummary(
      {
        ...reviewerRecovery,
        checkpoint: { ...reviewerRecovery.checkpoint, stage: 'builder-waiting-gate' },
        nextAllowedActions: [],
      },
      executionPlanId,
    );
    assert.equal(builderWaitingSummary.canResume, false);
    assert.equal(builderWaitingSummary.canCancel, false);

    const beforeStale = fs.readFileSync(statePath, 'utf8');
    const stale = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/resume-from-checkpoint`,
      { ...exactTuple(reviewerRecovery, 'resume-reviewer'), inputDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /inputDigest/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const resumed = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/resume-from-checkpoint`,
      exactTuple(reviewerRecovery, 'resume-reviewer'),
    );
    assert.equal(resumed.response.status, 200);
    assert.equal(resumed.payload.mutation.resumedStage, 'reviewer');
    assert.equal(resumed.payload.executionPlanRecovery.checkpoint.stage, 'qa-ready');
    assert.equal(resumed.payload.executionPlanRecovery.classification, 'ready');
    assert.equal(resumed.payload.executionPlanBundle.workOrders.find((entry) => entry.role === 'qa').status, 'queued');
    const runCount = Object.keys(resumed.payload.snapshot.runs).length;

    const repeated = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/resume-from-checkpoint`,
      exactTuple(reviewerRecovery, 'resume-reviewer'),
    );
    assert.equal(repeated.response.status, 200);
    assert.equal(repeated.payload.mutation.idempotent, true);
    assert.equal(Object.keys(repeated.payload.snapshot.runs).length, runCount);

    const qaRecovery = resumed.payload.executionPlanRecovery;
    const cancelled = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/cancel-checkpoint`,
      { ...exactTuple(qaRecovery), reason: `operator-cancelled:${qaRecovery.checkpoint.id}` },
    );
    assert.equal(cancelled.response.status, 200);
    assert.equal(cancelled.payload.executionPlanRecovery.classification, 'cancelled');
    const reload = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/recovery`,
    );
    assert.equal(reload.payload.executionPlanRecovery.classification, 'cancelled');
    assert.equal(fs.readFileSync(path.join(projectPath, targetPath), 'utf8'), sourceBeforeServer);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        readOnlyInspection: true,
        exactTupleRequired: true,
        reviewerResumeStopsAtQaReady: true,
        repeatedResumeIdempotent: true,
        cancellationRetained: true,
        staleInputStatus: stale.response.status,
      },
      ui: {
        readyStaleQuarantineLabels: true,
        exactGatedControls: true,
        downstreamControlsBlocked: true,
        desktopColumns: 2,
        mobileColumns: 1,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)]);
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
    if (stderr.trim()) process.stderr.write(stderr);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
