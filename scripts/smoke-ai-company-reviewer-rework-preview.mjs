import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import previewModule from '../src/runtime/reviewer-rework-preview.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import workOrderAttemptModule from '../src/runtime/work-order-attempts.js';
import workOrderPreviewModule from '../src/runtime/workorder-verification-plan-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const {
  FINDING_KEYS,
  REVIEWER_REWORK_BLOCKED_ACTIONS,
  REVIEWER_REWORK_EVIDENCE_KEYS,
  REVIEWER_REWORK_RESPONSE_KEYS,
  computeReviewerReworkPreviewDigest,
} = previewModule;
const { createRuntimeService } = runtimeModule;
const { computeWorkOrderAttemptRecordDigest } = workOrderAttemptModule;
const {
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
} = workOrderPreviewModule;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(
  repoRoot,
  'var',
  `runtime-ai-company-reviewer-rework-preview-smoke-${process.pid}`,
);
const runtimeRoot = path.join(tempRoot, 'runtime');
const projectPath = path.join(tempRoot, 'project');
const statePath = path.join(runtimeRoot, 'state.json');
const targetPath = 'src/runtime/runtime-service.js';
const fixtureFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];
const port = 10300 + (process.pid % 50);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ai-company-reviewer-rework-preview-smoke';
const keepFixture =
  process.env.ORCHESTRATION_REVIEWER_REWORK_KEEP_FIXTURE === '1';
const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['One bounded Reviewer rework evidence chain'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before retry, mutation, provider, Git, or release'],
};

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'reviewer-rework-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function createReworkProviderAdapter() {
  const base = createLocalStubProviderAdapter();
  return {
    name: 'reviewer-rework-local-stub',
    async execute(request) {
      const response = await base.execute(request);
      if (request.role === 'builder' && request.executionMode === 'live-mutation') {
        const absoluteTarget = path.join(request.project.projectPath, targetPath);
        const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// reviewer rework fixture\n`;
        return {
          ...response,
          normalizedResult: {
            blockers: [],
            needsDecision: false,
            nextStage: 'reviewer',
            summary: 'Applied one bounded syntax-safe fixture update.',
          },
          outputText: `# Builder Live Mutation

## Change Summary
- prepared file updates: 1

## Target Files
- ${targetPath}

## File Updates
### ${targetPath}
\`\`\`base64
${Buffer.from(content).toString('base64')}
\`\`\`
`,
        };
      }
      if (request.role === 'reviewer') {
        const finding =
          'A follow-up implementation pass is required before the task may proceed.';
        return {
          ...response,
          outputText: response.outputText.replace(
            `## Findings\n- ${finding}`,
            `## Findings\n- ${finding}\n- ${finding}`,
          ),
        };
      }
      return response;
    },
  };
}

function writeProjectFixture() {
  for (const relativePath of fixtureFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? "'use strict';\n\nmodule.exports = { reviewerReworkReady: false };\n"
        : relativePath.endsWith('.md')
          ? '# Reviewer rework smoke fixture\n'
          : "'use strict';\n",
    );
  }
}

function createRuntime(root = runtimeRoot, runtimeOptions = {}) {
  return createRuntimeService({
    runtimeRoot: root,
    companyBlueprintPath: path.join(repoRoot, 'company', 'blueprint.json'),
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
    ...runtimeOptions,
  });
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
      'Bind one exact local Council before Reviewer rework inspection.',
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

function stageRecord(stage, result = {}) {
  return {
    stage,
    runId: result.run?.id || null,
    artifactId: result.artifact?.id || null,
    inboxItemId: result.decisionInboxItem?.id || result.item?.id || null,
    approvalId: result.approval?.id || null,
  };
}

function buildStepInput(bundle, action, terminalGateApprovalId = null) {
  const checkpoint = bundle.latestCheckpoint;
  const role =
    action === 'continue-builder'
      ? 'builder'
      : action === 'run-reviewer'
        ? 'reviewer'
        : 'qa';
  const workOrder = bundle.workOrders.find((entry) => entry.role === role);
  return {
    executionPlanId: bundle.executionPlan.id,
    action,
    expectedWorkOrderId: workOrder.id,
    sourceDigest: bundle.executionPlan.sourceDigest,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    terminalGateApprovalId,
    evaluatedAt: new Date().toISOString(),
  };
}

async function createChangesRequestedFixture() {
  writeProjectFixture();
  const runtime = createRuntime();
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'Reviewer rework preview',
    projectPath,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Review changes requested rework',
    goal: 'Execute the bounded change and request changes during review.',
    constraints: 'No retry, rework execution, provider, Git, release, or memory.',
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
      rationale: 'Bind the exact accepted plan to one local Council.',
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
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    providerAdapter: createReworkProviderAdapter(),
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
  const terminalApproval = runtime.requestBuilderLiveMutationApproval({
    taskId: task.id,
  });
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
  runtime.resolveDecisionInboxItem({
    itemId: terminalApproval.inboxItemId,
    action: 'approved',
  });

  let bundle = runtime.getExecutionPlan(persisted.executionPlan.id);
  runtime.beginOperatorSteppedWorkOrderStep(
    buildStepInput(bundle, 'continue-builder', terminalApproval.id),
  );
  const builder = await coordinator.runBuilderLiveMutation({ taskId: task.id });
  bundle = runtime.completeReviewedDeliveryBuilder({
    executionPlanId: persisted.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  runtime.beginOperatorSteppedWorkOrderStep(
    buildStepInput(bundle, 'run-reviewer'),
  );
  const reviewer = await coordinator.runReviewer({ taskId: task.id });
  bundle = runtime.completeReviewedDeliveryReviewer({
    executionPlanId: persisted.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  assert.equal(bundle.executionPlan.status, 'blocked');
  assert.equal(bundle.latestWorkOrderAttempt.status, 'changes-requested');
  assert.equal(
    bundle.workOrderAttempts.some((attempt) => attempt.action === 'run-qa'),
    false,
  );
  return { bundle, mission, project, runtime, staffingPlan, entered };
}

function buildPreviewRequest(bundle) {
  const reviewer = bundle.workOrders.find((entry) => entry.role === 'reviewer');
  const attempt = bundle.latestWorkOrderAttempt;
  return {
    executionPlanId: bundle.executionPlan.id,
    reviewerWorkOrderId: reviewer.id,
    reviewerAttemptId: attempt.id,
    reviewerRunId: reviewer.completionRunId,
    reviewArtifactId: reviewer.reviewArtifactId,
    expectedExecutionPlanDigest: computeExecutionPlanRecordDigest(
      bundle.executionPlan,
    ),
    expectedAttemptRecordDigest: attempt.recordDigest,
    evaluatedAt: new Date(
      Math.max(Date.now(), Date.parse(attempt.completedAt)),
    ).toISOString(),
  };
}

function assertDeepFrozen(value) {
  assert.equal(Object.isFrozen(value), true);
  if (!value || typeof value !== 'object') return;
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function assertPreview(preview, request) {
  assert.deepEqual(Object.keys(preview), REVIEWER_REWORK_RESPONSE_KEYS);
  assert.equal(preview.schemaVersion, 21);
  assert.equal(preview.persisted, false);
  assert.equal(preview.status, 'rework-review-required');
  assert.equal(preview.executionPlanId, request.executionPlanId);
  assert.equal(preview.reviewerAttemptId, request.reviewerAttemptId);
  assert.equal(preview.executionPlanDigest, request.expectedExecutionPlanDigest);
  assert.equal(preview.attemptRecordDigest, request.expectedAttemptRecordDigest);
  assert.equal(preview.nextAttemptNumber, 2);
  assert.equal(preview.maxAdditionalBuilderAttempts, 1);
  assert.deepEqual(preview.targetPathAllowlist, compileSpec.targetPathAllowlist);
  assert.deepEqual(preview.verificationCommands, compileSpec.verificationCommands);
  assert.equal(preview.findings.length, 2);
  assert.equal(preview.findings[0].text, preview.findings[1].text);
  assert.notEqual(
    preview.findings[0].findingDigest,
    preview.findings[1].findingDigest,
  );
  preview.findings.forEach((finding) => {
    assert.deepEqual(Object.keys(finding), FINDING_KEYS);
  });
  assert.deepEqual(Object.keys(preview.evidenceRefs), REVIEWER_REWORK_EVIDENCE_KEYS);
  assert.deepEqual(preview.allowedActions, []);
  assert.deepEqual(preview.blockedActions, REVIEWER_REWORK_BLOCKED_ACTIONS);
  assert.equal(
    computeReviewerReworkPreviewDigest(preview),
    preview.previewDigest,
  );
  assert.equal(
    preview.id,
    `reviewer-rework-preview-${preview.previewDigest.slice(0, 16)}`,
  );
  assertDeepFrozen(preview);
  assert.doesNotMatch(
    JSON.stringify(preview),
    /artifact body|provider payload|prompt content|transcript|PRIVATE KEY|sk-proj-|password=/i,
  );
}

function copyRuntime(name) {
  const target = path.join(tempRoot, name);
  fs.cpSync(runtimeRoot, target, { recursive: true });
  const targetStatePath = path.join(target, 'state.json');
  const state = JSON.parse(fs.readFileSync(targetStatePath));
  for (const artifact of Object.values(state.artifacts)) {
    artifact.path = path.join(target, 'artifacts', path.basename(artifact.path));
  }
  fs.writeFileSync(targetStatePath, `${JSON.stringify(state, null, 2)}\n`);
  return {
    root: target,
    runtime: createRuntime(target),
    statePath: targetStatePath,
  };
}

function mutateCopiedState(name, mutate) {
  const copied = copyRuntime(name);
  const state = JSON.parse(fs.readFileSync(copied.statePath));
  mutate(state);
  fs.writeFileSync(copied.statePath, `${JSON.stringify(state, null, 2)}\n`);
  return { ...copied, state };
}

function getCopiedReviewArtifactPath(copied, request) {
  const state =
    copied.state || JSON.parse(fs.readFileSync(copied.statePath));
  return state.artifacts[request.reviewArtifactId].path;
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  for (let index = 0; index < 200; index += 1) {
    if (output.includes(`http://127.0.0.1:${port}`)) return;
    if (child.exitCode !== null) {
      throw new Error(`UI server exited before readiness: ${output}`);
    }
    await delay(20);
  }
  throw new Error(`Timed out waiting for UI server: ${output}`);
}

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  return {
    response,
    payload: contentType.includes('application/json')
      ? await response.json()
      : await response.text(),
  };
}

async function main() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(tempRoot, { recursive: true });
  let server = null;
  try {
    const fixture = await createChangesRequestedFixture();
    const request = buildPreviewRequest(fixture.bundle);
    const stateBefore = fs.readFileSync(statePath);
    const sourceBefore = fs.readFileSync(path.join(projectPath, targetPath));
    const artifactPath =
      JSON.parse(stateBefore).artifacts[request.reviewArtifactId].path;
    const artifactBefore = fs.readFileSync(artifactPath);
    const preview = fixture.runtime.getReviewerReworkPlanPreview(request);
    assertPreview(preview, request);
    assert.deepEqual(
      fixture.runtime.getReviewerReworkPlanPreview(request),
      preview,
    );
    assert.deepEqual(fs.readFileSync(statePath), stateBefore);
    assert.deepEqual(fs.readFileSync(artifactPath), artifactBefore);
    assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBefore);

    assert.throws(
      () =>
        fixture.runtime.getReviewerReworkPlanPreview({
          ...request,
          expectedExecutionPlanDigest: '0'.repeat(64),
        }),
      /source digest is stale/,
    );
    assert.throws(
      () =>
        fixture.runtime.getReviewerReworkPlanPreview({
          ...request,
          evaluatedAt: new Date(
            Date.parse(fixture.bundle.latestWorkOrderAttempt.completedAt) - 1,
          ).toISOString(),
        }),
      /precedes Reviewer completion/,
    );
    assert.throws(
      () =>
        fixture.runtime.getReviewerReworkPlanPreview({
          ...request,
          evaluatedAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
        }),
      /too far in the future/,
    );
    assert.throws(
      () =>
        fixture.runtime.getReviewerReworkPlanPreview({
          ...request,
          unexpected: true,
        }),
      /unexpected or missing fields/,
    );
    assert.deepEqual(fs.readFileSync(statePath), stateBefore);

    const oversized = copyRuntime('oversized-runtime');
    const oversizedState = JSON.parse(fs.readFileSync(oversized.statePath));
    fs.writeFileSync(
      oversizedState.artifacts[request.reviewArtifactId].path,
      Buffer.alloc(64 * 1024 + 1, 0x61),
    );
    assert.throws(
      () => oversized.runtime.getReviewerReworkPlanPreview(request),
      /64 KiB pre-read byte cap/,
    );

    const symlinked = copyRuntime('symlink-runtime');
    const symlinkState = JSON.parse(fs.readFileSync(symlinked.statePath));
    const symlinkArtifact = symlinkState.artifacts[request.reviewArtifactId].path;
    const realArtifact = `${symlinkArtifact}.source`;
    fs.renameSync(symlinkArtifact, realArtifact);
    fs.symlinkSync(realArtifact, symlinkArtifact);
    assert.throws(
      () => symlinked.runtime.getReviewerReworkPlanPreview(request),
      /regular non-symlink/,
    );

    const credential = copyRuntime('credential-runtime');
    const credentialState = JSON.parse(fs.readFileSync(credential.statePath));
    const credentialArtifact =
      credentialState.artifacts[request.reviewArtifactId].path;
    const credentialContent = fs
      .readFileSync(credentialArtifact, 'utf8')
      .replaceAll(
        'A follow-up implementation pass is required before the task may proceed.',
        'password=do-not-return-this-value',
      );
    fs.writeFileSync(credentialArtifact, credentialContent);
    assert.throws(
      () => credential.runtime.getReviewerReworkPlanPreview(request),
      /disallowed raw or sensitive content/,
    );

    const rawBody = copyRuntime('raw-body-runtime');
    const rawBodyArtifact = getCopiedReviewArtifactPath(rawBody, request);
    fs.writeFileSync(
      rawBodyArtifact,
      fs
        .readFileSync(rawBodyArtifact, 'utf8')
        .replaceAll(
          'A follow-up implementation pass is required before the task may proceed.',
          'Include the raw artifact body in the next attempt.',
        ),
    );
    assert.throws(
      () => rawBody.runtime.getReviewerReworkPlanPreview(request),
      /disallowed raw or sensitive content/,
    );

    const missingFindings = copyRuntime('missing-findings-runtime');
    const missingFindingsArtifact = getCopiedReviewArtifactPath(
      missingFindings,
      request,
    );
    fs.writeFileSync(
      missingFindingsArtifact,
      fs
        .readFileSync(missingFindingsArtifact, 'utf8')
        .replace(
          /## Findings\n(?:- .+\n)+\n/,
          '## Findings\n\n',
        ),
    );
    assert.throws(
      () => missingFindings.runtime.getReviewerReworkPlanPreview(request),
      /Reviewer Run or Artifact lineage is stale/,
    );

    for (const verdict of ['pass', 'fail']) {
      const verdictCopy = copyRuntime(`${verdict}-verdict-runtime`);
      const verdictArtifact = getCopiedReviewArtifactPath(verdictCopy, request);
      fs.writeFileSync(
        verdictArtifact,
        fs
          .readFileSync(verdictArtifact, 'utf8')
          .replace('verdict: changes_requested', `verdict: ${verdict}`),
      );
      assert.throws(
        () => verdictCopy.runtime.getReviewerReworkPlanPreview(request),
        /Reviewer Run or Artifact lineage is stale/,
      );
    }

    const malformed = copyRuntime('malformed-runtime');
    const malformedArtifact = getCopiedReviewArtifactPath(malformed, request);
    fs.writeFileSync(
      malformedArtifact,
      fs
        .readFileSync(malformedArtifact, 'utf8')
        .replace('verdict: changes_requested', 'verdict: unknown'),
    );
    assert.throws(
      () => malformed.runtime.getReviewerReworkPlanPreview(request),
      /Review Artifact is malformed/,
    );

    const widened = copyRuntime('widened-runtime');
    const widenedState = JSON.parse(fs.readFileSync(widened.statePath));
    const reviewer = fixture.bundle.workOrders.find(
      (entry) => entry.role === 'reviewer',
    );
    widenedState.workOrders[reviewer.id].targetPathAllowlist.push(
      'src/runtime/contracts.js',
    );
    fs.writeFileSync(
      widened.statePath,
      `${JSON.stringify(widenedState, null, 2)}\n`,
    );
    assert.throws(
      () => widened.runtime.getReviewerReworkPlanPreview(request),
      /target or verification scope diverged/,
    );

    const widenedCommand = mutateCopiedState(
      'widened-command-runtime',
      (state) => {
        state.workOrders[reviewer.id].verificationCommands.push(
          'node --check src/runtime/contracts.js',
        );
      },
    );
    assert.throws(
      () => widenedCommand.runtime.getReviewerReworkPlanPreview(request),
      /target or verification scope diverged/,
    );

    const qaWorkOrder = fixture.bundle.workOrders.find(
      (entry) => entry.role === 'qa',
    );
    const qaAlreadyRun = mutateCopiedState(
      'qa-already-run-runtime',
      (state) => {
        const qa = state.workOrders[qaWorkOrder.id];
        const sourceAttempt = state.workOrderAttempts[request.reviewerAttemptId];
        const qaAttempt = {
          ...sourceAttempt,
          id: 'work-order-attempt-0004',
          workOrderId: qa.id,
          role: 'qa',
          position: qa.position,
          attemptNumber: 1,
          action: 'run-qa',
          status: 'completed',
          workOrderDigest: computeWorkOrderRecordDigest(qa),
          stopReason: null,
          recordDigest: '',
        };
        qaAttempt.recordDigest =
          computeWorkOrderAttemptRecordDigest(qaAttempt);
        state.workOrderAttempts[qaAttempt.id] = qaAttempt;
        state.sequences.workOrderAttempt = 4;
        qa.status = 'completed';
        qa.attemptRefs = [qaAttempt.id];
        qa.runRefs = [...qaAttempt.runRefs];
        qa.artifactRefs = [...qaAttempt.artifactRefs];
      },
    );
    assert.throws(
      () => qaAlreadyRun.runtime.getReviewerReworkPlanPreview(request),
      /latest exact changes-requested stop/,
    );

    const unbound = mutateCopiedState('legacy-unbound-runtime', (state) => {
      state.councilSessions[
        fixture.entered.councilSession.id
      ].staffingEntryRef = null;
    });
    assert.throws(
      () => unbound.runtime.getReviewerReworkPlanPreview(request),
      /requires supported state|requires StaffingEntry binding/,
    );

    const providerBacked = mutateCopiedState(
      'provider-backed-runtime',
      (state) => {
        state.projects[fixture.project.id].provider = {
          mode: 'live',
          adapter: 'openai-responses',
          model: 'gpt-test',
          env: { apiKeyVar: 'OPENAI_API_KEY' },
        };
      },
    );
    assert.throws(
      () => providerBacked.runtime.getReviewerReworkPlanPreview(request),
      /local-stub only/,
    );

    const activePlan = mutateCopiedState('active-plan-runtime', (state) => {
      const plan = state.executionPlans[request.executionPlanId];
      plan.status = 'active';
      plan.stopReason = null;
    });
    assert.throws(
      () =>
        activePlan.runtime.getReviewerReworkPlanPreview({
          ...request,
          expectedExecutionPlanDigest: computeExecutionPlanRecordDigest(
            activePlan.state.executionPlans[request.executionPlanId],
          ),
        }),
      /latest exact changes-requested stop/,
    );

    const terminalPlan = mutateCopiedState('terminal-plan-runtime', (state) => {
      const plan = state.executionPlans[request.executionPlanId];
      plan.status = 'cancelled';
      plan.stopReason = null;
      plan.stoppedAt = null;
    });
    assert.throws(
      () =>
        terminalPlan.runtime.getReviewerReworkPlanPreview({
          ...request,
          expectedExecutionPlanDigest: computeExecutionPlanRecordDigest(
            terminalPlan.state.executionPlans[request.executionPlanId],
          ),
        }),
      /latest exact changes-requested stop/,
    );

    const staleLineage = mutateCopiedState(
      'stale-reviewer-lineage-runtime',
      (state) => {
        state.runs[request.reviewerRunId].summary.sourceRunId = 'run-unknown';
      },
    );
    assert.throws(
      () => staleLineage.runtime.getReviewerReworkPlanPreview(request),
      /Reviewer Run or Artifact lineage is stale/,
    );

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
        cwd: repoRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    await waitForServer(server);
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(request).filter(([key]) => key !== 'executionPlanId'),
      ),
    );
    const endpoint = `${baseUrl}/api/execution-plans/${encodeURIComponent(request.executionPlanId)}/reviewer-rework-preview`;
    const validApi = await getJson(`${endpoint}?${query}`);
    assert.equal(validApi.response.status, 200);
    assert.deepEqual(validApi.payload, preview);

    const missingApi = await getJson(endpoint);
    assert.equal(missingApi.response.status, 400);
    assert.match(missingApi.payload.error, /exactly seven bounded query fields/);
    const extraApi = await getJson(`${endpoint}?${query}&extra=value`);
    assert.equal(extraApi.response.status, 400);
    const repeatedApi = await getJson(
      `${endpoint}?${query}&reviewerRunId=${encodeURIComponent(request.reviewerRunId)}`,
    );
    assert.equal(repeatedApi.response.status, 400);
    const unknownApi = await getJson(
      `${baseUrl}/api/execution-plans/execution-plan-unknown/reviewer-rework-preview?${query}`,
    );
    assert.equal(unknownApi.response.status, 404);
    const wrongMethod = await getJson(`${endpoint}?${query}`, {
      method: 'POST',
    });
    assert.equal(wrongMethod.response.status, 405);
    assert.deepEqual(fs.readFileSync(statePath), stateBefore);
    assert.deepEqual(fs.readFileSync(artifactPath), artifactBefore);
    assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), sourceBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: preview.schemaVersion,
          responseOnly: preview.persisted === false,
          findings: preview.findings.length,
          duplicateFindingsPreserved: true,
          artifactPreReadCap: true,
          exactGetFields: 7,
          downstreamActions: preview.allowedActions.length,
          stateWrites: 0,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(1000),
      ]);
      if (server.exitCode === null) server.kill('SIGKILL');
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

export {
  buildPreviewRequest,
  createChangesRequestedFixture,
  createRuntime,
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
  tempRoot,
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
