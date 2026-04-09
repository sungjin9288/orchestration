import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import openaiResponsesAdapterModule from '../src/execution/providers/openai-responses-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createOpenAIResponsesProviderAdapter } = openaiResponsesAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const liveProviderEnvVar = 'OPENAI_API_KEY';
const sentinelSecret = 'provider-slice-08-secret-sentinel';
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/06_ai-orchestration-pivot.md',
  'docs/07_mission-council-slice-m6-02.md',
  'packs/knowledge-work/pack.md',
  'tasks/todo.md',
  'tasks/lessons.md',
];
const ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];
const BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/runtime-service.js',
  'src/execution/provider-adapter.js',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/openai-responses-adapter.js',
  'src/execution/providers/openai-responses-retry-policy.js',
  'ui/app.js',
];
const TARGET_FILE = 'docs/prd.md';

function createResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

function createQueuedFetch(initialResponses = []) {
  const queue = [...initialResponses];
  const calls = [];

  async function fetchImpl(url, init = {}) {
    calls.push({
      body: init.body || '',
      headers: init.headers || {},
      method: init.method || 'GET',
      url,
    });

    if (queue.length === 0) {
      throw new Error('No queued response for openai-responses fetch stub');
    }

    return createResponse((queue[0] && queue[0].status) || 200, (queue.shift() || {}).payload || {});
  }

  return {
    calls,
    fetchImpl,
    push(response) {
      queue.push(response);
    },
  };
}

function createApiPayload(outputText, options = {}) {
  return {
    payload: {
      id: options.providerRunId || 'resp-provider-slice-08',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 24,
        output_tokens: 48,
        total_tokens: 72,
      },
    },
    status: options.status ?? 200,
  };
}

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Draft one bounded PRD inside the knowledge-work pack.

## Intended Deliverable
- product requirements document
- target file: docs/prd.md

## Acceptance Target
- required sections stay explicit
- next action stays explicit
- provenance trace stays visible

## Verification Approach
- synthetic provider smoke
`;
}

function createPlannerApiPayload(label, options = {}) {
  return createApiPayload(
    JSON.stringify({
      artifactMarkdown: createPlannerArtifactMarkdown(label),
      normalizedResult: {
        blockers: Array.isArray(options.normalizedResult?.blockers)
          ? options.normalizedResult.blockers
          : [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'architect',
        summary:
          options.normalizedResult?.summary ||
          'Planner output is ready for architect handoff inside the knowledge-work boundary.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createArchitectApiPayload(anchor, options = {}) {
  return createApiPayload(
    JSON.stringify({
      anchor,
      artifact: {
        boundaryFit: options.artifact?.boundaryFit || 'fit',
        affectedComponentsOrContracts: options.artifact?.affectedComponentsOrContracts || [TARGET_FILE],
        policyImpact: options.artifact?.policyImpact || ['The slice remains inside the knowledge-work boundary.'],
        decisionLogImpact: options.artifact?.decisionLogImpact || ['None.'],
        approvedAssumptions:
          options.artifact?.approvedAssumptions || [
            'The deliverable should stay as one bounded PRD draft.',
          ],
        noArchitectureChangeStatement:
          options.artifact?.noArchitectureChangeStatement ||
          'No architecture change is approved by this note. Downstream work stays inside the current PRD drafting boundary.',
        blockingArchitectureIssues: options.artifact?.blockingArchitectureIssues || [],
      },
      normalizedResult: {
        blockers: options.normalizedResult?.blockers || [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'task-breaker',
        summary:
          options.normalizedResult?.summary ||
          'Architect output is ready for task-breaker handoff.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createTaskBreakerApiPayload(anchor, options = {}) {
  return createApiPayload(
    JSON.stringify({
      anchor,
      artifact: {
        orderedSubTasks:
          options.artifact?.orderedSubTasks || [
            'Confirm the PRD boundary and required sections.',
            'Prepare the bounded PRD draft.',
            'Review the draft for explicit next action and provenance trace.',
          ],
        checkpoints:
          options.artifact?.checkpoints || [
            'checkpoint 1: confirm deliverable scope',
            'checkpoint 2: draft required sections',
            'checkpoint 3: review quality gate expectations',
          ],
        expectedArtifactsPerCheckpoint:
          options.artifact?.expectedArtifactsPerCheckpoint || [
            'checkpoint 1: breakdown',
            'checkpoint 2: preflight',
            'checkpoint 3: review',
          ],
        verificationCheckpoints:
          options.artifact?.verificationCheckpoints || [
            'Verify required sections, next action, and provenance trace.',
          ],
        reviewTriggerPoints:
          options.artifact?.reviewTriggerPoints || ['Trigger review after the bounded PRD draft exists.'],
        stopAndEscalateConditions:
          options.artifact?.stopAndEscalateConditions || [
            'Stop if the slice widens into implementation or release work.',
          ],
        executionBoundarySummary:
          options.artifact?.executionBoundarySummary || [
            'Builder handoff stays bounded to docs/prd.md only.',
          ],
      },
      normalizedResult: {
        blockers: options.normalizedResult?.blockers || [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'builder',
        summary:
          options.normalizedResult?.summary ||
          'Task-breaker output is ready for builder handoff.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createBuilderPreflightApiPayload(anchor, options = {}) {
  return createApiPayload(
    JSON.stringify({
      anchor,
      artifact: {
        targetFiles: options.artifact?.targetFiles || [TARGET_FILE],
        intendedChanges:
          options.artifact?.intendedChanges || [
            'Create one bounded PRD file with the required section structure.',
          ],
        risks:
          options.artifact?.risks || [
            'Fail closed if the PRD loses explicit next action or provenance trace.',
          ],
        verificationPlan:
          options.artifact?.verificationPlan || [
            'Run reviewer against the generated PRD and verify the rubric outcome.',
          ],
        reviewEvidenceExpectations:
          options.artifact?.reviewEvidenceExpectations || [
            'The review should confirm required sections, next action, and trace marker.',
          ],
        escalationTriggers:
          options.artifact?.escalationTriggers || [
            'Escalate if the deliverable widens beyond docs/prd.md.',
          ],
      },
      normalizedResult: {
        blockers: options.normalizedResult?.blockers || [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'request-builder-live-mutation-approval',
        summary:
          options.normalizedResult?.summary ||
          'Builder-preflight output is ready for explicit live-mutation approval request.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createBuilderLiveMutationApiPayload(anchor, options = {}) {
  const fileUpdates = Array.isArray(options.artifact?.fileUpdates) ? options.artifact.fileUpdates : [];

  return createApiPayload(
    JSON.stringify({
      anchor,
      artifact: {
        changeSummary:
          options.artifact?.changeSummary || [
            'Prepare one bounded PRD draft inside the approved knowledge-work target file.',
          ],
        targetFiles: options.artifact?.targetFiles || [TARGET_FILE],
        fileUpdates: fileUpdates.map((fileUpdate) => ({
          path: fileUpdate.path,
          contentBase64:
            fileUpdate.contentBase64 ||
            Buffer.from(fileUpdate.content || '', 'utf8').toString('base64'),
        })),
        risks:
          options.artifact?.risks || [
            'Fail closed if the PRD file update leaves the approved target or loses provenance.',
          ],
        verificationNotes:
          options.artifact?.verificationNotes || [
            'Prepare the PRD draft for knowledge-work reviewer handoff only.',
          ],
      },
      normalizedResult: {
        blockers: options.normalizedResult?.blockers || [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'reviewer',
        summary:
          options.normalizedResult?.summary ||
          'Builder live mutation prepared a bounded PRD draft for reviewer handoff.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createReviewerApiPayload(anchor, options = {}) {
  return createApiPayload(
    JSON.stringify({
      anchor,
      artifact: {
        verdict: options.artifact?.verdict || 'pass',
        evidenceReviewed:
          options.artifact?.evidenceReviewed || [
            `builder run ${anchor.sourceBuilderRunId}`,
            `change-summary artifact ${anchor.changeSummaryArtifactId}`,
            `patch artifact ${anchor.patchArtifactId}`,
            `diff artifact ${anchor.diffArtifactId}`,
          ],
        findings: options.artifact?.findings || [],
        contractCompliance:
          options.artifact?.contractCompliance || [
            'Latest successful builder live-mutation bundle anchor was preserved exactly.',
          ],
        verificationEvidence:
          options.artifact?.verificationEvidence || [`changed files: ${anchor.changedFilePaths.join(', ')}`],
        acceptedRisks: options.artifact?.acceptedRisks || [],
        followUpGate: {
          blockingIssue: options.artifact?.followUpGate?.blockingIssue === true,
          decisionRequired: options.artifact?.followUpGate?.decisionRequired === true,
        },
        ...(options.artifact?.knowledgeWorkRubric
          ? {
              knowledgeWorkRubric: options.artifact.knowledgeWorkRubric,
            }
          : {}),
      },
      normalizedResult: {
        blockers: options.normalizedResult?.blockers || [],
        needsDecision: Boolean(options.normalizedResult?.needsDecision),
        nextStage: options.normalizedResult?.nextStage || 'human gate',
        summary:
          options.normalizedResult?.summary ||
          'Reviewer completed the latest successful knowledge-work builder bundle inspection.',
        decisionTitle: options.normalizedResult?.decisionTitle || '',
        decisionPrompt: options.normalizedResult?.decisionPrompt || '',
      },
    }),
    options,
  );
}

function createLiveCoordinator(runtime, fetchImpl) {
  return createExecutionCoordinator({
    liveProviderAdapter: createOpenAIResponsesProviderAdapter({
      fetchImpl,
    }),
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function countArtifacts(snapshot, taskId, type = null) {
  return Object.values(snapshot.artifacts).filter(
    (artifact) => artifact.taskId === taskId && (!type || artifact.type === type),
  ).length;
}

function createArchitectAnchor(projectId, taskId, planArtifactId, planRunId) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    codeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
  };
}

function createTaskBreakerAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
  };
}

function createBuilderPreflightAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
  breakdownArtifactId,
  breakdownRunId,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    breakdownArtifactId,
    breakdownRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectureAllowlistPaths: [TARGET_FILE],
    codeContextPaths: [TARGET_FILE],
  };
}

function captureDigests(projectPath, relativePaths) {
  return relativePaths.map((relativePath) => {
    const filePath = path.join(projectPath, relativePath);

    if (!fs.existsSync(filePath)) {
      return {
        path: relativePath,
        digest: null,
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');

    return {
      path: relativePath,
      digest: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
    };
  });
}

function createBuilderLiveMutationAnchor(context) {
  return {
    projectId: context.project.id,
    taskId: context.task.id,
    planArtifactId: context.planArtifact.id,
    planRunId: context.plannerResult.run.id,
    architectureArtifactId: context.architectureArtifact.id,
    architectureRunId: context.architectResult.run.id,
    breakdownArtifactId: context.breakdownArtifact.id,
    breakdownRunId: context.taskBreakerResult.run.id,
    preflightArtifactId: context.preflightResult.artifact.id,
    preflightRunId: context.preflightResult.run.id,
    approvalId: context.approval.id,
    approvalTargetArtifactId: context.approval.targetArtifactId,
    approvalTargetRunId: context.approval.targetRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectureAllowlistPaths: [TARGET_FILE],
    targetFileAllowlistPaths: [TARGET_FILE],
    codeContextPaths: [TARGET_FILE],
    targetFileBaselineDigests: captureDigests(context.project.projectPath, [TARGET_FILE]),
  };
}

function createReviewerAnchor(context) {
  return {
    projectId: context.project.id,
    taskId: context.task.id,
    planArtifactId: context.planArtifact.id,
    planRunId: context.plannerResult.run.id,
    architectureArtifactId: context.architectureArtifact.id,
    architectureRunId: context.architectResult.run.id,
    breakdownArtifactId: context.breakdownArtifact.id,
    breakdownRunId: context.taskBreakerResult.run.id,
    preflightArtifactId: context.preflightResult.artifact.id,
    preflightRunId: context.preflightResult.run.id,
    changeSummaryArtifactId: context.builderResult.artifacts.changeSummary.id,
    changeSummaryRunId: context.builderResult.artifacts.changeSummary.runId,
    patchArtifactId: context.builderResult.artifacts.patch.id,
    patchRunId: context.builderResult.artifacts.patch.runId,
    diffArtifactId: context.builderResult.artifacts.diff.id,
    diffRunId: context.builderResult.artifacts.diff.runId,
    approvalId: context.approval.id,
    sourceBuilderRunId: context.builderResult.run.id,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    changedFilePaths: context.builderResult.changedFiles,
  };
}

function buildMutationMarker(approvalId, relativePath) {
  return `provider-slice-08 ${approvalId} ${relativePath}`;
}

function createPrdContent(taskTitle, approvalId) {
  const marker = buildMutationMarker(approvalId, TARGET_FILE);

  return `# ${taskTitle}

## Problem
Bound the next operator move in one reviewable PRD.

## User
- Primary operator: single-user owner reviewing the next move
- Reviewer: person deciding whether the PRD is actionable enough to hand off

## Goals
- Clarify the intended outcome
- Keep assumptions and open questions visible
- Make the next bounded action explicit

## Non-Goals
- implementation
- release or deployment
- hidden external research

## Requirements
- Draft one bounded PRD
- Keep provenance explicit
- Preserve reviewable scope

## Acceptance Signals
- A reviewer can explain the desired outcome
- A reviewer can identify what is in scope and out of scope

## Open Questions
- Which local source should own the final decision?

## Trace
- ${marker}
`;
}

function createRuntimeForLabel(label) {
  const runtimeRoot = path.join(repoRoot, 'var', `runtime-provider-slice-08-${label}`);
  const projectRoot = path.join(repoRoot, 'var', `provider-slice-08-${label}-project`);

  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  ensureDir(projectRoot);

  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  return {
    projectRoot,
    runtime,
  };
}

async function prepareKnowledgeWorkLiveContext(label) {
  const { projectRoot, runtime } = createRuntimeForLabel(label);
  const queuedFetch = createQueuedFetch();
  const coordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);

  const project = runtime.createProject({
    name: `provider-slice-08 ${label}`,
    pack: 'knowledge-work',
    projectPath: projectRoot,
    provider: {
      adapter: 'openai-responses',
      mode: 'live',
      model: 'provider-slice-08-operator-model',
      env: {
        apiKeyVar: liveProviderEnvVar,
      },
    },
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `provider-slice-08 ${label}`,
    intent: 'Draft a bounded PRD and keep review criteria explicit.',
    deliverableType: 'prd',
  });

  queuedFetch.push(createPlannerApiPayload(label));
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(
      'Draft one bounded PRD for the next operator move and keep the review rubric explicit.',
    ),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);

  const architectAnchor = createArchitectAnchor(project.id, task.id, planArtifact.id, plannerResult.run.id);
  queuedFetch.push(createArchitectApiPayload(architectAnchor));
  const architectResult = await coordinator.runArchitect({ taskId: task.id });
  const architectureArtifact = runtime.getArtifact(architectResult.artifact.id);

  const taskBreakerAnchor = createTaskBreakerAnchor(
    project.id,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
    architectureArtifact.id,
    architectResult.run.id,
  );
  queuedFetch.push(createTaskBreakerApiPayload(taskBreakerAnchor));
  const taskBreakerResult = await coordinator.runTaskBreaker({ taskId: task.id });
  const breakdownArtifact = runtime.getArtifact(taskBreakerResult.artifact.id);

  const builderPreflightAnchor = createBuilderPreflightAnchor(
    project.id,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
    architectureArtifact.id,
    architectResult.run.id,
    breakdownArtifact.id,
    taskBreakerResult.run.id,
  );
  queuedFetch.push(createBuilderPreflightApiPayload(builderPreflightAnchor));
  const preflightResult = await coordinator.runBuilderPreflight({ taskId: task.id });

  const approval = runtime.requestBuilderLiveMutationApproval({ taskId: task.id });
  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: `Approve knowledge-work live mutation for ${label}.`,
  });
  const approvalRecord = runtime.getApproval(approval.id);

  const builderLiveMutationAnchor = createBuilderLiveMutationAnchor({
    approval: approvalRecord,
    architectResult,
    architectureArtifact,
    breakdownArtifact,
    planArtifact,
    plannerResult,
    preflightResult,
    project,
    projectRoot,
    task,
    taskBreakerResult,
  });
  const prdContent = createPrdContent(task.title, approvalRecord.id);

  queuedFetch.push(
    createBuilderLiveMutationApiPayload(builderLiveMutationAnchor, {
      artifact: {
        fileUpdates: [
          {
            path: TARGET_FILE,
            content: prdContent,
          },
        ],
      },
      providerRunId: `resp-builder-live-${label}`,
    }),
  );
  const builderResult = await coordinator.runBuilderLiveMutation({ taskId: task.id });

  return {
    approval: approvalRecord,
    architectResult,
    architectureArtifact,
    breakdownArtifact,
    builderResult,
    coordinator,
    planArtifact,
    plannerResult,
    preflightResult,
    project,
    projectRoot,
    queuedFetch,
    runtime,
    task,
    taskBreakerResult,
  };
}

async function assertReviewerFailure(label, reviewerResponseFactory, errorPattern) {
  const context = await prepareKnowledgeWorkLiveContext(label);
  const reviewerAnchor = createReviewerAnchor(context);
  const beforeSnapshot = context.runtime.getSnapshot();

  context.queuedFetch.push(reviewerResponseFactory(reviewerAnchor, context));

  await assert.rejects(
    () => context.coordinator.runReviewer({ taskId: context.task.id }),
    errorPattern,
  );

  const afterSnapshot = context.runtime.getSnapshot();

  assert.equal(countArtifacts(afterSnapshot, context.task.id, 'review'), 0);
  assert.equal(countArtifacts(beforeSnapshot, context.task.id, 'review'), 0);
}

process.env[liveProviderEnvVar] = sentinelSecret;

const happyContext = await prepareKnowledgeWorkLiveContext('happy');
const happyBuilderRequestBody = JSON.parse(happyContext.queuedFetch.calls[4].body);

assert.equal(happyBuilderRequestBody.text.format.name, 'builder_live_mutation_artifact_response');
assert.match(String(happyBuilderRequestBody.input || ''), /"digest": null/);
assert.match(String(happyBuilderRequestBody.input || ''), /docs\/prd\.md/);

const happyReviewerAnchor = createReviewerAnchor(happyContext);

happyContext.queuedFetch.push(
  createReviewerApiPayload(happyReviewerAnchor, {
    artifact: {
      verdict: 'pass',
      findings: [],
      contractCompliance: [
        'Latest successful builder live-mutation bundle anchor was preserved exactly.',
      ],
      verificationEvidence: ['changed files: docs/prd.md'],
      knowledgeWorkRubric: {
        deliverableType: 'prd',
        deliverablePath: TARGET_FILE,
        requiredSections: [
          'Problem',
          'User',
          'Goals',
          'Non-Goals',
          'Requirements',
          'Acceptance Signals',
          'Open Questions',
          'Trace',
        ],
        deliverablePresent: true,
        missingRequiredSections: [],
        emptyRequiredSections: [],
        explicitNextAction: true,
        traceMarkerVerified: true,
        checklistItemsPresent: true,
        acceptanceSignalsExplicit: true,
      },
    },
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'human gate',
      summary: 'Reviewer passed the bounded PRD and leaves commit-package as an explicit downstream step.',
      decisionTitle: '',
      decisionPrompt: '',
    },
    providerRunId: 'resp-reviewer-knowledge-work-pass',
  }),
);

const happyReviewerResult = await happyContext.coordinator.runReviewer({ taskId: happyContext.task.id });
const happyReviewerRequestBody = JSON.parse(happyContext.queuedFetch.calls[5].body);
const happyReviewArtifact = happyContext.runtime.getArtifact(happyReviewerResult.artifact.id);

assert.equal(happyReviewerResult.run.summary.rawVerdict, 'pass');
assert.equal(happyReviewerResult.run.summary.mappedReviewStatus, 'passed');
assert.equal(happyContext.runtime.getTask(happyContext.task.id).review.status, 'passed');
assert.match(String(happyReviewerRequestBody.instructions || ''), /artifact\.knowledgeWorkRubric is required/i);
assert.match(String(happyReviewerRequestBody.input || ''), /Knowledge-Work Deliverable Snapshot/);
assert.match(String(happyReviewerRequestBody.input || ''), /^## Problem$/m);
assert.match(happyReviewArtifact.content, /deliverable file reviewed: docs\/prd\.md/);
assert.match(happyReviewArtifact.content, /Required knowledge-work rubric checks passed/i);

const changesContext = await prepareKnowledgeWorkLiveContext('changes-requested');
const changesReviewerAnchor = createReviewerAnchor(changesContext);

changesContext.queuedFetch.push(
  createReviewerApiPayload(changesReviewerAnchor, {
    artifact: {
      verdict: 'changes_requested',
      findings: ['Missing required section: Acceptance Signals.'],
      contractCompliance: ['Bundle anchoring stayed exact.'],
      verificationEvidence: ['changed files: docs/prd.md'],
      knowledgeWorkRubric: {
        deliverableType: 'prd',
        deliverablePath: TARGET_FILE,
        requiredSections: [
          'Problem',
          'User',
          'Goals',
          'Non-Goals',
          'Requirements',
          'Acceptance Signals',
          'Open Questions',
          'Trace',
        ],
        deliverablePresent: true,
        missingRequiredSections: ['Acceptance Signals'],
        emptyRequiredSections: [],
        explicitNextAction: true,
        traceMarkerVerified: true,
        checklistItemsPresent: true,
        acceptanceSignalsExplicit: false,
      },
      followUpGate: {
        blockingIssue: false,
        decisionRequired: false,
      },
    },
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'builder',
      summary: 'Return to builder to complete the missing PRD section.',
      decisionTitle: '',
      decisionPrompt: '',
    },
    providerRunId: 'resp-reviewer-knowledge-work-changes',
  }),
);

const changesReviewerResult = await changesContext.coordinator.runReviewer({
  taskId: changesContext.task.id,
});
const changesArtifact = changesContext.runtime.getArtifact(changesReviewerResult.artifact.id);

assert.equal(changesReviewerResult.run.summary.rawVerdict, 'changes_requested');
assert.equal(changesContext.runtime.getTask(changesContext.task.id).review.status, 'changes_requested');
assert.match(changesArtifact.content, /Missing required section: Acceptance Signals\./);
assert.match(changesArtifact.content, /deliverable file reviewed: docs\/prd\.md/);

await assertReviewerFailure(
  'invalid-pass',
  (reviewerAnchor) =>
    createReviewerApiPayload(reviewerAnchor, {
      artifact: {
        verdict: 'pass',
        findings: [],
        contractCompliance: ['Bundle anchoring stayed exact.'],
        verificationEvidence: ['changed files: docs/prd.md'],
        knowledgeWorkRubric: {
          deliverableType: 'prd',
          deliverablePath: TARGET_FILE,
          requiredSections: [
            'Problem',
            'User',
            'Goals',
            'Non-Goals',
            'Requirements',
            'Acceptance Signals',
            'Open Questions',
            'Trace',
          ],
          deliverablePresent: true,
          missingRequiredSections: ['Acceptance Signals'],
          emptyRequiredSections: [],
          explicitNextAction: true,
          traceMarkerVerified: true,
          checklistItemsPresent: true,
          acceptanceSignalsExplicit: false,
        },
      },
      normalizedResult: {
        blockers: [],
        needsDecision: false,
        nextStage: 'human gate',
        summary: 'Incorrectly attempt to pass the PRD despite rubric gaps.',
        decisionTitle: '',
        decisionPrompt: '',
      },
      providerRunId: 'resp-reviewer-knowledge-work-invalid-pass',
    }),
  /reviewer artifact\.verdict must not understate knowledge-work rubric issues/i,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      pass: {
        reviewArtifactId: happyReviewerResult.artifact.id,
        deliverablePath: path.join(happyContext.projectRoot, TARGET_FILE),
        rawVerdict: happyReviewerResult.run.summary.rawVerdict,
      },
      changesRequested: {
        reviewArtifactId: changesReviewerResult.artifact.id,
        deliverablePath: path.join(changesContext.projectRoot, TARGET_FILE),
        rawVerdict: changesReviewerResult.run.summary.rawVerdict,
      },
    },
    null,
    2,
  ),
);
