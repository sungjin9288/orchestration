import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import contractsModule from '../src/runtime/contracts.js';
import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import verificationPlanModule from '../src/runtime/workorder-verification-plan-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createEmptyState } = contractsModule;
const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const {
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
} = verificationPlanModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_ACCEPTANCE_PROOF_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-acceptance-proof-smoke');
const keepFixture = process.env.ORCHESTRATION_ACCEPTANCE_PROOF_KEEP_FIXTURE === '1';
const seedStage = process.env.ORCHESTRATION_ACCEPTANCE_PROOF_SEED_STAGE || '';
const targetPath = 'src/runtime/runtime-service.js';
const MODE = 'ai-company-acceptance-criterion-proof-smoke';
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
  expectedArtifacts: ['Builder change summary, patch, and diff evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Reviewer until every essential proof is current'],
};

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'acceptance-proof-council-local-stub',
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
    name: 'acceptance-proof-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }

      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const marker = `builder-live-mutation ${request.approval.id}`;
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// ${marker}\n`;
      return {
        providerRunId: `acceptance-proof-builder-${request.task.id}`,
        model: 'acceptance-proof-targeted-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded syntax-safe verification target update.',
        },
        outputText: `# Builder Live Mutation: ${request.task.title}\n\n## Change Summary\n- prepared file updates: 1\n\n## Target Files\n- ${targetPath}\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content, 'utf8').toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
  };
}

function createContext() {
  const runtimeRoot = path.join(tempRoot, 'runtime');
  const projectPath = path.join(tempRoot, 'project');
  for (const relativePath of preflightProjectFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\n\nmodule.exports = { proofReady: false };\n`
        : relativePath.endsWith('.md')
          ? '# Acceptance proof smoke fixture\n'
          : `'use strict';\n`,
    );
  }

  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name: 'Acceptance proof', projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Durable acceptance proof gate',
    goal: 'Require exact current proof before independent Reviewer execution.',
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
    absoluteTarget: path.join(projectPath, targetPath),
    coordinator,
    persisted,
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

function approval(createdAt, rationale) {
  return {
    decision: 'record-proof',
    acknowledgement: 'reviewed-current-workorder-evidence-for-verification-proof',
    rationale,
    reviewedAt: createdAt,
  };
}

function assertStateUnchanged(statePath, operation, pattern) {
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const migrationRoot = path.join(tempRoot, 'migration');
    fs.mkdirSync(migrationRoot, { recursive: true });
    const v15 = createEmptyState();
    v15.schemaVersion = 15;
    delete v15.sequences.acceptanceCriterion;
    delete v15.sequences.verificationProof;
    delete v15.acceptanceCriteria;
    delete v15.verificationProofs;
    fs.writeFileSync(path.join(migrationRoot, 'state.json'), JSON.stringify(v15));
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 16);
    assert.equal(migrated.sequences.acceptanceCriterion, 0);
    assert.equal(migrated.sequences.verificationProof, 0);
    assert.deepEqual(migrated.acceptanceCriteria, {});
    assert.deepEqual(migrated.verificationProofs, {});

    const context = createContext();
    const gate = await prepareWaitingGate(context);
    const { runtime, persisted } = context;
    const executionPlanId = persisted.executionPlan.id;
    const statePath = path.join(context.runtimeRoot, 'state.json');
    const waitingBundle = runtime.getExecutionPlan(executionPlanId);
    const waitingBuilder = waitingBundle.workOrders.find((entry) => entry.role === 'builder');
    const evaluatedAt = new Date().toISOString();
    const previewRequest = {
      executionPlanId,
      executionPlanDigest: computeExecutionPlanRecordDigest(waitingBundle.executionPlan),
      workOrderId: waitingBuilder.id,
      workOrderDigest: computeWorkOrderRecordDigest(waitingBuilder),
      sourceDigest: waitingBundle.executionPlan.sourceDigest,
      evaluatedAt,
    };
    const verificationPlan = runtime.previewWorkOrderVerificationPlan(previewRequest);
    const persistenceRequest = {
      ...previewRequest,
      previewId: verificationPlan.id,
      previewDigest: verificationPlan.previewDigest,
      persistenceApproval: {
        decision: 'persist',
        acknowledgement: 'reviewed-workorder-verification-plan-for-durable-criteria',
        rationale: 'Keep exact acceptance evidence durable before the approved Builder mutation.',
        reviewedAt: evaluatedAt,
      },
    };

    assertStateUnchanged(
      statePath,
      () => runtime.persistWorkOrderAcceptanceCriteria({ ...persistenceRequest, extra: true }),
      /unexpected or missing fields/,
    );
    assertStateUnchanged(
      statePath,
      () => runtime.persistWorkOrderAcceptanceCriteria({
        ...persistenceRequest,
        previewDigest: '0'.repeat(64),
      }),
      /preview/,
    );

    const persistedCriteria = runtime.persistWorkOrderAcceptanceCriteria(persistenceRequest);
    assert.equal(persistedCriteria.idempotent, false);
    assert.equal(persistedCriteria.acceptanceCriteria.length, 4);
    assert.deepEqual(
      persistedCriteria.acceptanceCriteria.map((criterion) => criterion.kind),
      ['happy-path', 'risk', 'regression', 'manual'],
    );
    assert.equal(runtime.getSnapshot().schemaVersion, 16);
    assert.equal(Object.keys(runtime.getSnapshot().verificationProofs).length, 0);
    const repeatedCriteria = runtime.persistWorkOrderAcceptanceCriteria(persistenceRequest);
    assert.equal(repeatedCriteria.idempotent, true);
    assert.deepEqual(
      repeatedCriteria.acceptanceCriteria.map((criterion) => criterion.recordDigest),
      persistedCriteria.acceptanceCriteria.map((criterion) => criterion.recordDigest),
    );

    runtime.resolveDecisionInboxItem({
      itemId: gate.terminalApproval.inboxItemId,
      action: 'approved',
    });
    runtime.beginReviewedDeliveryContinuation({
      executionPlanId,
      terminalGateApprovalId: gate.terminalApproval.id,
      sourceDigest: persisted.executionPlan.sourceDigest,
    });
    const builderResult = await context.coordinator.runBuilderLiveMutation({ taskId: gate.task.id });
    const reviewerReady = runtime.completeReviewedDeliveryBuilder({
      executionPlanId,
      runId: builderResult.run.id,
      changeSummaryArtifactId: builderResult.artifacts.changeSummary.id,
      patchArtifactId: builderResult.artifacts.patch.id,
      diffArtifactId: builderResult.artifacts.diff.id,
      changedFiles: builderResult.changedFiles,
    });
    const builder = reviewerReady.workOrders.find((entry) => entry.role === 'builder');
    assert.equal(builder.status, 'completed');
    assert.equal(reviewerReady.workOrders.find((entry) => entry.role === 'reviewer').status, 'queued');
    assert.equal(runtime.getWorkOrderVerificationStatus(executionPlanId, builder.id).ready, false);

    const blockedRecovery = runtime.getExecutionPlanRecovery(executionPlanId);
    assert.throws(
      () => runtime.resumeExecutionPlanFromCheckpoint({
        executionPlanId,
        checkpointId: blockedRecovery.checkpoint.id,
        checkpointDigest: blockedRecovery.checkpoint.checkpointDigest,
        inputDigest: blockedRecovery.checkpoint.inputDigest,
        authorityDigest: blockedRecovery.checkpoint.authorityDigest,
        action: 'resume-reviewer',
      }),
      /requires current passed VerificationProofs/,
    );

    if (seedStage === 'reviewer-ready') {
      console.log(JSON.stringify({
        ok: true,
        mode: MODE,
        seedStage,
        schemaVersion: 16,
        executionPlanId,
        workOrderId: builder.id,
        acceptanceCriteria: persistedCriteria.acceptanceCriteria.length,
        verificationProofs: 0,
      }, null, 2));
      return;
    }

    const currentWorkOrderDigest = computeWorkOrderRecordDigest(builder);
    const evidenceArtifactIds = [...builder.artifactRefs];
    const baseTime = Math.max(Date.now(), Date.parse(persistedCriteria.acceptanceCriteria[0].createdAt));
    const at = (offset) => new Date(baseTime + offset).toISOString();
    const manualCriteria = persistedCriteria.acceptanceCriteria.filter(
      (criterion) => criterion.proofMode !== 'command',
    );
    const failedRequest = {
      executionPlanId,
      workOrderId: builder.id,
      acceptanceCriterionId: manualCriteria[0].id,
      criterionRecordDigest: manualCriteria[0].recordDigest,
      workOrderDigest: currentWorkOrderDigest,
      sourceDigest: persisted.executionPlan.sourceDigest,
      status: 'failed',
      evidenceArtifactIds,
      proofApproval: approval(at(1), 'The first review found evidence insufficient.'),
    };
    const failedProof = runtime.recordWorkOrderVerificationProof(failedRequest);
    assert.equal(failedProof.proof.status, 'failed');
    assert.equal(failedProof.proof.attempt, 1);
    const passedFirst = runtime.recordWorkOrderVerificationProof({
      ...failedRequest,
      status: 'passed',
      proofApproval: approval(at(2), 'The current Builder evidence now satisfies the criterion.'),
    });
    assert.equal(passedFirst.proof.status, 'passed');
    assert.equal(passedFirst.proof.attempt, 2);
    const repeatedFirst = runtime.recordWorkOrderVerificationProof({
      ...failedRequest,
      status: 'passed',
      proofApproval: approval(at(2), 'The current Builder evidence now satisfies the criterion.'),
    });
    assert.equal(repeatedFirst.idempotent, true);
    assert.equal(repeatedFirst.proof.id, passedFirst.proof.id);

    manualCriteria.slice(1).forEach((criterion, index) => {
      const result = runtime.recordWorkOrderVerificationProof({
        executionPlanId,
        workOrderId: builder.id,
        acceptanceCriterionId: criterion.id,
        criterionRecordDigest: criterion.recordDigest,
        workOrderDigest: currentWorkOrderDigest,
        sourceDigest: persisted.executionPlan.sourceDigest,
        status: 'passed',
        evidenceArtifactIds,
        proofApproval: approval(at(3 + index), `Reviewed ${criterion.kind} evidence against the exact Builder artifacts.`),
      });
      assert.equal(result.proof.status, 'passed');
    });

    const commandCriterion = persistedCriteria.acceptanceCriteria.find(
      (criterion) => criterion.proofMode === 'command',
    );
    const commandRequest = {
      executionPlanId,
      workOrderId: builder.id,
      acceptanceCriterionId: commandCriterion.id,
      criterionRecordDigest: commandCriterion.recordDigest,
      workOrderDigest: currentWorkOrderDigest,
      sourceDigest: persisted.executionPlan.sourceDigest,
      proofApproval: approval(at(10), 'Run the exact source-bound node syntax check.'),
    };
    const commandProof = await runtime.runWorkOrderVerificationProof(commandRequest);
    assert.equal(commandProof.proof.status, 'passed');
    assert.equal(commandProof.proof.commandResults.length, 1);
    assert.equal(commandProof.proof.commandResults[0].argv[0], process.execPath);
    assert.equal(runtime.getWorkOrderVerificationStatus(executionPlanId, builder.id).ready, true);

    fs.appendFileSync(context.absoluteTarget, '\n// deliberate source drift\n');
    const staleStatus = runtime.getWorkOrderVerificationStatus(executionPlanId, builder.id);
    assert.equal(staleStatus.ready, false);
    assert.equal(
      staleStatus.entries.find((entry) => entry.criterion.id === commandCriterion.id).current,
      false,
    );
    const rerun = await runtime.runWorkOrderVerificationProof(commandRequest);
    assert.equal(rerun.idempotent, false);
    assert.equal(rerun.proof.attempt, 2);
    assert.notEqual(rerun.proof.verificationInputDigest, commandProof.proof.verificationInputDigest);
    assert.equal(runtime.getWorkOrderVerificationStatus(executionPlanId, builder.id).ready, true);

    if (seedStage === 'reviewer-ready-proven') {
      console.log(JSON.stringify({
        ok: true,
        mode: MODE,
        seedStage,
        schemaVersion: 16,
        executionPlanId,
        workOrderId: builder.id,
        acceptanceCriteria: persistedCriteria.acceptanceCriteria.length,
        verificationProofs: 6,
      }, null, 2));
      return;
    }

    const recovery = runtime.getExecutionPlanRecovery(executionPlanId);
    const resumed = runtime.resumeExecutionPlanFromCheckpoint({
      executionPlanId,
      checkpointId: recovery.checkpoint.id,
      checkpointDigest: recovery.checkpoint.checkpointDigest,
      inputDigest: recovery.checkpoint.inputDigest,
      authorityDigest: recovery.checkpoint.authorityDigest,
      action: 'resume-reviewer',
    });
    assert.equal(resumed.resumeStage, 'reviewer');
    assert.equal(resumed.workOrders.find((entry) => entry.role === 'reviewer').status, 'active');

    const reloaded = createRuntimeService({
      runtimeRoot: context.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    const reloadedState = reloaded.getSnapshot();
    assert.equal(reloadedState.schemaVersion, 16);
    assert.equal(Object.keys(reloadedState.acceptanceCriteria).length, 4);
    assert.equal(Object.keys(reloadedState.verificationProofs).length, 6);
    assert.equal(
      reloaded.getWorkOrderVerificationStatus(executionPlanId, builder.id).ready,
      true,
    );
    assert.ok(
      Object.values(reloadedState.artifacts).every(
        (artifact) => !['commit-package', 'commit-result', 'release-package'].includes(artifact.type),
      ),
    );

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: 16,
      migration: 'v15-to-v16-additive',
      acceptanceCriteria: 4,
      verificationProofs: 6,
      failedThenPassedHistory: true,
      commandReplayBoundToSourceDigest: true,
      staleProofBlockedReviewer: true,
      reviewerResumeReady: true,
      providerMode: 'local-stub',
      downstreamAuthority: 'commit-push-release-blocked',
    }, null, 2));
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
