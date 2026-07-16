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
  getMissionReviewedDeliverySummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-655');
const runtimeRoot = path.join(tempRoot, 'runtime');
const projectPath = path.join(tempRoot, 'project');
const targetPath = 'src/runtime/runtime-service.js';
const port = 6300 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-655-reviewed-delivery-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_655_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['Builder mutation, review, and QA evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, commit, push, or release'],
};
const preflightProjectFiles = [
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
    id: 'ui-slice-655-resolved-local-stub',
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
    name: 'ui-slice-655-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const marker = `builder-live-mutation ${request.approval.id} ${targetPath}`;
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// ${marker}\n`;
      return {
        providerRunId: `ui-slice-655-builder-${request.task.id}`,
        model: 'ui-slice-655-targeted-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded syntax-safe update.',
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

async function seedDeliveryReadyState() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  for (const relativePath of preflightProjectFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\nmodule.exports = { uiSlice655: true };\n`
        : relativePath.endsWith('.md')
          ? '# UI slice 655 fixture\n'
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
  const project = runtime.createProject({ name: 'ui-slice-655', projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Reviewed Delivery operator flow',
    goal: 'Prepare one response-only reviewed delivery package.',
    constraints: 'Stop before Mission done, commit, push, or release.',
  });
  const startedCouncil = runtime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  runtime.decideRealCouncilSession({
    councilSessionId: startedCouncil.councilSession.id,
    action: 'approve',
  });
  const preview = runtime.previewMissionWorkOrders({
    councilSessionId: startedCouncil.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: startedCouncil.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  const dispatch = runtime.beginSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    approvalId: persisted.approval.id,
  });
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    providerAdapter: createTargetedProviderAdapter(),
  });
  const task = dispatch.controlTask;
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
    workOrderId: dispatch.executionPlan.activeWorkOrderId,
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
  runtime.resolveDecisionInboxItem({
    itemId: terminalApproval.inboxItemId,
    action: 'approved',
  });
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
  runtime.beginReviewedDeliveryReviewer({ executionPlanId: persisted.executionPlan.id });
  const reviewer = await coordinator.runReviewer({ taskId: task.id });
  let bundle = runtime.completeReviewedDeliveryReviewer({
    executionPlanId: persisted.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: null,
  });
  bundle = runtime.beginReviewedDeliveryQa({ executionPlanId: persisted.executionPlan.id });
  const byRole = Object.fromEntries(bundle.workOrders.map((entry) => [entry.role, entry]));
  const qa = await coordinator.runQaWorkOrder({
    taskId: task.id,
    executionPlanId: persisted.executionPlan.id,
    workOrderId: byRole.qa.id,
    builderRunId: byRole.builder.completionRunId,
    reviewerRunId: byRole.reviewer.completionRunId,
    sourceDigest: persisted.executionPlan.sourceDigest,
    changedFiles: byRole.builder.changedFiles,
    targetPathAllowlist: byRole.qa.targetPathAllowlist,
    commands: byRole.qa.verificationCommands,
  });
  runtime.completeReviewedDeliveryQa({
    executionPlanId: persisted.executionPlan.id,
    runId: qa.run.id,
    qaEvidenceArtifactId: qa.artifact.id,
  });

  return { mission, persisted, runtime, terminalApproval };
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
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-655 server');
}

async function main() {
  const seeded = await seedDeliveryReadyState();
  const stateBeforeServer = fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8');
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
    assert.match(appSource, /검토·QA 이어서 실행/);
    assert.match(appSource, /DeliveryPackage Preview/);
    assert.match(appSource, /response-only/);
    assert.match(appSource, /mission:not-done/);
    assert.match(appSource, /commit:blocked/);
    assert.match(appSource, /push:blocked/);
    assert.match(appSource, /release:blocked/);
    assert.match(appSource, /data-action="persist-delivery-package"/);
    assert.doesNotMatch(appSource, /data-action="accept-delivery-package"/);
    assert.doesNotMatch(appSource, /data-action="mark-mission-done"/);
    assert.match(signalSource, /getMissionReviewedDeliverySummary/);
    assert.match(signalSource, /terminalGateApproval/);
    assert.match(stylesSource, /\.delivery-package-preview/);
    assert.match(stylesSource, /\.surface \{[\s\S]*min-width: 0;[\s\S]*max-width: 100%/);
    assert.match(stylesSource, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.delivery-package-results[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const bundle = getMissionExecutionPlanBundle(
      snapshotResult.payload.snapshot,
      snapshotResult.payload.snapshot.missions[seeded.mission.id].councilSessionId,
    );
    const deliverySummary = getMissionReviewedDeliverySummary(bundle);
    assert.equal(deliverySummary.deliveryReady, true);
    assert.equal(deliverySummary.canContinue, false);
    assert.deepEqual(bundle.workOrders.map((entry) => entry.status), [
      'completed',
      'completed',
      'completed',
    ]);

    const previewResult = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/delivery-preview`,
    );
    assert.equal(previewResult.response.status, 200);
    assert.equal(previewResult.payload.deliveryPackagePreview.persisted, false);
    assert.equal(previewResult.payload.deliveryPackagePreview.missionDone, false);
    assert.equal(
      previewResult.payload.deliveryPackagePreview.authoritySummary.durablePersistenceAllowed,
      true,
    );
    assert.ok(
      Object.entries(previewResult.payload.deliveryPackagePreview.authoritySummary)
        .filter(([key]) => key !== 'durablePersistenceAllowed')
        .every(([, value]) => value === false),
    );

    const repeated = await postJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/continue-reviewed-delivery`,
      {
        terminalGateApprovalId: seeded.terminalApproval.id,
        sourceDigest: seeded.persisted.executionPlan.sourceDigest,
      },
    );
    assert.equal(repeated.response.status, 200);
    assert.equal(repeated.payload.mutation.idempotent, true);
    assert.deepEqual(repeated.payload.deliveryPackagePreview, previewResult.payload.deliveryPackagePreview);
    assert.equal(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'), stateBeforeServer);
    assert.equal(fs.readFileSync(path.join(projectPath, targetPath), 'utf8'), sourceBeforeServer);

    const wrongApproval = await postJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/continue-reviewed-delivery`,
      {
        terminalGateApprovalId: 'approval-wrong-replay',
        sourceDigest: seeded.persisted.executionPlan.sourceDigest,
      },
    );
    assert.equal(wrongApproval.response.status, 409);
    assert.match(wrongApproval.payload.error, /exact approved terminal gate/);

    const stale = await postJson(
      `/api/execution-plans/${encodeURIComponent(seeded.persisted.executionPlan.id)}/continue-reviewed-delivery`,
      {
        terminalGateApprovalId: seeded.terminalApproval.id,
        sourceDigest: 'stale-source-digest',
      },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /sourceDigest/);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        reloadPreview: true,
        exactGateReplayRejected: true,
        idempotentContinuation: true,
        staleInputStatus: stale.response.status,
        sourceUnchangedOnReplay: true,
      },
      ui: {
        approvalGatedCommand: true,
        workOrderEvidence: true,
        responseOnlyPackage: true,
        downstreamControlsBlocked: true,
        desktopColumns: 3,
        mobileColumns: 1,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)]);
    if (!keepFixture) {
      fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
    }
  }

  if (stderr.trim()) throw new Error(stderr.trim());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
