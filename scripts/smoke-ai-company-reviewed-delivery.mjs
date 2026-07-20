import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import qaRunnerModule from '../src/execution/qa-node-check-runner.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { parseNodeCheckCommand, runNodeCheck, runQaNodeChecks } = qaRunnerModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-reviewed-delivery-smoke');
const targetPath = 'src/runtime/runtime-service.js';
const MODE = 'ai-company-reviewed-delivery-smoke';
const preflightProjectFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['Builder mutation, independent review, and QA evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, commit, push, or release'],
};

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'reviewed-delivery-resolved-local-stub',
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
    name: 'reviewed-delivery-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }

      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const marker = `builder-live-mutation ${request.approval.id} ${targetPath}`;
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// ${marker}\n`;
      return {
        providerRunId: `reviewed-delivery-builder-${request.task.id}`,
        model: 'reviewed-delivery-targeted-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded runtime-service syntax-safe update.',
        },
        outputText: `# Builder Live Mutation: ${request.task.title}\n\n## Change Summary\n- prepared file updates: 1\n\n## Target Files\n- ${targetPath}\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content, 'utf8').toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
  };
}

function createContext(name, goal = 'Build one bounded reviewed delivery pass path.') {
  const runtimeRoot = path.join(tempRoot, name, 'runtime');
  const projectPath = path.join(tempRoot, name, 'project');
  const absoluteTarget = path.join(projectPath, targetPath);
  for (const relativePath of preflightProjectFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\n\nmodule.exports = { reviewedDeliveryReady: false };\n`
        : relativePath.endsWith('.md')
          ? '# Reviewed delivery smoke fixture\n'
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
  const project = runtime.createProject({ name, projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Reviewed delivery ${name}`,
    goal,
    constraints: 'Use local-stub only and stop before commit, push, release, or Mission done.',
  });
  const started = runtime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  runtime.decideRealCouncilSession({
    councilSessionId: started.councilSession.id,
    action: 'approve',
  });
  const preview = runtime.previewMissionWorkOrders({
    councilSessionId: started.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: started.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    providerAdapter: createTargetedProviderAdapter(),
  });

  return {
    absoluteTarget,
    coordinator,
    mission,
    persisted,
    project,
    runtime,
    runtimeRoot,
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

async function prepareWaitingGate(context) {
  const { runtime, coordinator, persisted } = context;
  const started = runtime.beginSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    approvalId: persisted.approval.id,
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
  const stopped = runtime.finalizeSequentialWorkOrderExecution({
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
  return { stopped, task, terminalApproval };
}

async function executeThroughReview(context, gate) {
  const { runtime, coordinator, persisted } = context;
  runtime.resolveDecisionInboxItem({
    itemId: gate.terminalApproval.inboxItemId,
    action: 'approved',
  });
  runtime.beginReviewedDeliveryContinuation({
    executionPlanId: persisted.executionPlan.id,
    terminalGateApprovalId: gate.terminalApproval.id,
    sourceDigest: persisted.executionPlan.sourceDigest,
  });
  const builder = await coordinator.runBuilderLiveMutation({ taskId: gate.task.id });
  runtime.completeReviewedDeliveryBuilder({
    executionPlanId: persisted.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  runtime.beginReviewedDeliveryReviewer({ executionPlanId: persisted.executionPlan.id });
  const reviewer = await coordinator.runReviewer({ taskId: gate.task.id });
  const bundle = runtime.completeReviewedDeliveryReviewer({
    executionPlanId: persisted.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  return { builder, bundle, reviewer };
}

function createSyntheticChild(action) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => {
    queueMicrotask(() => child.emit('close', null));
    return true;
  };
  queueMicrotask(() => action(child));
  return child;
}

async function proveQaRunnerSafety(projectPath) {
  assert.deepEqual(parseNodeCheckCommand(`node --check ${targetPath}`), {
    kind: 'node-check',
    relativePath: targetPath,
  });
  for (const invalid of [
    `node ${targetPath}`,
    `node --check ../outside.js`,
    `node --check ${targetPath} --eval bad`,
    `node --check ${targetPath} | cat`,
    `NODE_ENV=test node --check ${targetPath}`,
  ]) {
    assert.throws(() => parseNodeCheckCommand(invalid));
  }

  let spawnOptions = null;
  const timeout = await runNodeCheck(
    { projectRoot: projectPath, relativePath: targetPath },
    {
      timeoutMs: 5,
      spawnImpl(_command, _argv, options) {
        spawnOptions = options;
        return createSyntheticChild(() => {});
      },
    },
  );
  assert.equal(timeout.timedOut, true);
  assert.equal(timeout.passed, false);
  assert.equal(spawnOptions.shell, false);
  assert.deepEqual(spawnOptions.env, {});

  const capped = await runNodeCheck(
    { projectRoot: projectPath, relativePath: targetPath },
    {
      outputCapBytes: 8,
      spawnImpl() {
        return createSyntheticChild((child) => {
          child.stdout.write('0123456789');
          child.stdout.end();
          child.stderr.end();
          child.emit('close', 0);
        });
      },
    },
  );
  assert.equal(capped.truncated, true);
  assert.equal(capped.passed, false);

  const mutationResult = await runQaNodeChecks(
    {
      projectRoot: projectPath,
      changedFiles: [targetPath],
      targetPathAllowlist: [targetPath],
      commands: [`node --check ${targetPath}`],
    },
    {
      spawnImpl(_command, _argv, options) {
        return createSyntheticChild((child) => {
          fs.appendFileSync(path.join(options.cwd, targetPath), '\n// unexpected qa mutation\n');
          child.stdout.end();
          child.stderr.end();
          child.emit('close', 0);
        });
      },
    },
  );
  assert.equal(mutationResult.mutationDetected, true);
  assert.equal(mutationResult.verdict, 'failed');
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const success = createContext('success');
    const gate = await prepareWaitingGate(success);
    const statePath = path.join(success.runtimeRoot, 'state.json');
    const beforeApprovalState = fs.readFileSync(statePath, 'utf8');
    const beforeApprovalSource = fs.readFileSync(success.absoluteTarget, 'utf8');
    assert.throws(
      () => success.runtime.beginReviewedDeliveryContinuation({
        executionPlanId: success.persisted.executionPlan.id,
        terminalGateApprovalId: gate.terminalApproval.id,
        sourceDigest: success.persisted.executionPlan.sourceDigest,
      }),
      /exact approved terminal gate/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeApprovalState);
    assert.equal(fs.readFileSync(success.absoluteTarget, 'utf8'), beforeApprovalSource);

    success.runtime.resolveDecisionInboxItem({
      itemId: gate.terminalApproval.inboxItemId,
      action: 'approved',
    });
    const beforeStaleState = fs.readFileSync(statePath, 'utf8');
    assert.throws(
      () => success.runtime.beginReviewedDeliveryContinuation({
        executionPlanId: success.persisted.executionPlan.id,
        terminalGateApprovalId: gate.terminalApproval.id,
        sourceDigest: 'stale-source-digest',
      }),
      /sourceDigest/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStaleState);

    const started = success.runtime.beginReviewedDeliveryContinuation({
      executionPlanId: success.persisted.executionPlan.id,
      terminalGateApprovalId: gate.terminalApproval.id,
      sourceDigest: success.persisted.executionPlan.sourceDigest,
    });
    assert.equal(started.idempotent, false);
    assert.equal(started.workOrders[0].status, 'active');
    const builder = await success.coordinator.runBuilderLiveMutation({ taskId: gate.task.id });
    let bundle = success.runtime.completeReviewedDeliveryBuilder({
      executionPlanId: success.persisted.executionPlan.id,
      runId: builder.run.id,
      changeSummaryArtifactId: builder.artifacts.changeSummary.id,
      patchArtifactId: builder.artifacts.patch.id,
      diffArtifactId: builder.artifacts.diff.id,
      changedFiles: builder.changedFiles,
    });
    assert.deepEqual(bundle.workOrders.map((entry) => entry.status), [
      'completed',
      'queued',
      'blocked-dependency',
    ]);
    assert.match(fs.readFileSync(success.absoluteTarget, 'utf8'), /builder-live-mutation approval-/);

    success.runtime.beginReviewedDeliveryReviewer({
      executionPlanId: success.persisted.executionPlan.id,
    });
    const reviewer = await success.coordinator.runReviewer({ taskId: gate.task.id });
    bundle = success.runtime.completeReviewedDeliveryReviewer({
      executionPlanId: success.persisted.executionPlan.id,
      runId: reviewer.run.id,
      reviewArtifactId: reviewer.artifact.id,
      reviewStatus: reviewer.run.summary.mappedReviewStatus,
      decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
    });
    assert.equal(reviewer.run.summary.mappedReviewStatus, 'passed');
    assert.deepEqual(bundle.workOrders.map((entry) => entry.status), [
      'completed',
      'completed',
      'queued',
    ]);

    bundle = success.runtime.beginReviewedDeliveryQa({
      executionPlanId: success.persisted.executionPlan.id,
    });
    const byRole = Object.fromEntries(bundle.workOrders.map((entry) => [entry.role, entry]));
    const qa = await success.coordinator.runQaWorkOrder({
      taskId: gate.task.id,
      executionPlanId: success.persisted.executionPlan.id,
      workOrderId: byRole.qa.id,
      builderRunId: byRole.builder.completionRunId,
      reviewerRunId: byRole.reviewer.completionRunId,
      sourceDigest: success.persisted.executionPlan.sourceDigest,
      changedFiles: byRole.builder.changedFiles,
      targetPathAllowlist: byRole.qa.targetPathAllowlist,
      commands: byRole.qa.verificationCommands,
    });
    bundle = success.runtime.completeReviewedDeliveryQa({
      executionPlanId: success.persisted.executionPlan.id,
      runId: qa.run.id,
      qaEvidenceArtifactId: qa.artifact.id,
    });
    assert.equal(qa.evidence.verdict, 'passed');
    assert.equal(qa.evidence.checks[0].argv[0], process.execPath);
    assert.equal(bundle.executionPlan.status, 'delivery-ready');
    assert.deepEqual(bundle.workOrders.map((entry) => entry.status), [
      'completed',
      'completed',
      'completed',
    ]);

    const preview = success.runtime.previewExecutionPlanDelivery({
      executionPlanId: success.persisted.executionPlan.id,
    });
    assert.equal(preview.persisted, false);
    assert.equal(preview.missionDone, false);
    assert.equal(preview.verificationSummary.verdict, 'passed');
    assert.equal(Object.isFrozen(preview), true);
    assert.equal(preview.authoritySummary.durablePersistenceAllowed, true);
    assert.ok(
      Object.entries(preview.authoritySummary)
        .filter(([key]) => key !== 'durablePersistenceAllowed')
        .every(([, value]) => value === false),
    );
    const countsBeforeRepeat = success.runtime.getSnapshot().sequences;
    assert.throws(
      () => success.runtime.beginReviewedDeliveryContinuation({
        executionPlanId: success.persisted.executionPlan.id,
        terminalGateApprovalId: 'approval-wrong-replay',
        sourceDigest: success.persisted.executionPlan.sourceDigest,
      }),
      /exact approved terminal gate/,
    );
    const repeated = success.runtime.beginReviewedDeliveryContinuation({
      executionPlanId: success.persisted.executionPlan.id,
      terminalGateApprovalId: gate.terminalApproval.id,
      sourceDigest: success.persisted.executionPlan.sourceDigest,
    });
    assert.equal(repeated.idempotent, true);
    assert.deepEqual(success.runtime.getSnapshot().sequences, countsBeforeRepeat);
    assert.deepEqual(
      success.runtime.previewExecutionPlanDelivery({
        executionPlanId: success.persisted.executionPlan.id,
      }),
      preview,
    );

    const reloaded = createRuntimeService({
      runtimeRoot: success.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    assert.equal(reloaded.getSnapshot().schemaVersion, 12);
    assert.deepEqual(
      reloaded.previewExecutionPlanDelivery({
        executionPlanId: success.persisted.executionPlan.id,
      }),
      preview,
    );
    assert.equal(reloaded.getMission(success.mission.id).status, 'executing');
    assert.equal(
      Object.values(reloaded.getSnapshot().artifacts).filter(
        (artifact) => artifact.type === 'qa-evidence',
      ).length,
      1,
    );
    assert.ok(
      Object.values(reloaded.getSnapshot().artifacts).every(
        (artifact) => !['commit-package', 'commit-result', 'release-package', 'close-out'].includes(
          artifact.type,
        ),
      ),
    );

    const changesRequested = createContext(
      'changes-requested',
      'Build one bounded update and review changes requested before QA.',
    );
    const changesGate = await prepareWaitingGate(changesRequested);
    const changedReview = await executeThroughReview(changesRequested, changesGate);
    assert.equal(changedReview.reviewer.run.summary.mappedReviewStatus, 'changes_requested');
    assert.equal(changedReview.bundle.executionPlan.status, 'blocked');
    assert.equal(changedReview.bundle.executionPlan.stopReason, 'reviewer-changes-requested');
    assert.equal(changedReview.bundle.workOrders[1].status, 'changes-requested');
    assert.equal(changedReview.bundle.workOrders[2].status, 'blocked-dependency');
    assert.equal(
      Object.values(changesRequested.runtime.getSnapshot().runs).filter((run) => run.role === 'qa')
        .length,
      0,
    );
    assert.throws(
      () => changesRequested.runtime.previewExecutionPlanDelivery({
        executionPlanId: changesRequested.persisted.executionPlan.id,
      }),
      /not delivery-ready/,
    );

    const safetyProject = path.join(tempRoot, 'qa-safety-project');
    fs.mkdirSync(path.dirname(path.join(safetyProject, targetPath)), { recursive: true });
    fs.writeFileSync(path.join(safetyProject, targetPath), `'use strict';\n`);
    await proveQaRunnerSafety(safetyProject);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      runtime: {
        schemaVersion: 12,
        sequence: ['builder-live-mutation', 'reviewer', 'node-check-qa'],
        finalPlanStatus: 'delivery-ready',
        missionDone: false,
        idempotent: true,
        reloadVerified: true,
      },
      qa: {
        shell: false,
        exactParser: true,
        containment: true,
        timeout: true,
        outputCap: true,
        mutationDetection: true,
        evidenceArtifactCount: 1,
      },
      stopPaths: {
        approvalRequired: true,
        exactGateReplayRejected: true,
        staleDigestRejectedWithoutMutation: true,
        changesRequestedBlocksQa: true,
      },
      deliveryPackage: {
        responseOnly: true,
        deeplyFrozen: true,
        authorityClosed: true,
      },
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
