import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import openaiResponsesAdapterModule from '../src/execution/providers/openai-responses-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';
import retryPolicyModule from '../src/execution/providers/openai-responses-retry-policy.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createOpenAIResponsesProviderAdapter } = openaiResponsesAdapterModule;
const { createRuntimeService } = runtimeServiceModule;
const { DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS } = retryPolicyModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-provider-slice-07');
const sentinelSecret = 'provider-slice-07-secret-sentinel';
const liveProviderEnvVar = 'OPENAI_API_KEY';
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
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
const DEFAULT_TARGET_FILES = [
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
];

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFixtureFile(projectPath, relativePath) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(projectPath, relativePath);
  ensureParentDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
}

function createFixtureProject(label) {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-provider-slice-07-${label}-`));
  const fixtureFiles = [...new Set([...ARCHITECT_CODE_CONTEXT_PATHS, ...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS])];

  for (const relativePath of fixtureFiles) {
    copyFixtureFile(projectPath, relativePath);
  }

  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  return projectPath;
}

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

function countRuns(snapshot, taskId) {
  return Object.values(snapshot.runs).filter((run) => run.taskId === taskId).length;
}

function countArtifacts(snapshot, taskId, type = null) {
  return Object.values(snapshot.artifacts).filter(
    (artifact) => artifact.taskId === taskId && (!type || artifact.type === type),
  ).length;
}

function countDecisionItems(snapshot, taskId, kind = null) {
  return Object.values(snapshot.decisionInboxItems).filter(
    (item) => item.taskId === taskId && (!kind || item.kind === kind),
  ).length;
}

function scanFilesForSecret(rootPath, secret) {
  const matches = [];

  function visit(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const stat = fs.statSync(currentPath);

    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath)) {
        visit(path.join(currentPath, entry));
      }
      return;
    }

    const content = fs.readFileSync(currentPath, 'utf8');

    if (content.includes(secret)) {
      matches.push(currentPath);
    }
  }

  visit(rootPath);
  return matches;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSecretAbsent(value, secret, label) {
  assert.doesNotMatch(String(value || ''), new RegExp(escapeRegExp(secret)), label);
}

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

    const next = queue.shift();

    if (next && Object.prototype.hasOwnProperty.call(next, 'throwError')) {
      throw next.throwError;
    }

    return createResponse(next.status ?? 200, next.payload ?? {});
  }

  return {
    calls,
    fetchImpl,
    push(response) {
      if (Array.isArray(response)) {
        queue.push(...response);
        return;
      }

      queue.push(response);
    },
  };
}

function createTerminalStatusResponses(status, payload) {
  return Array.from({ length: DEFAULT_OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS + 1 }, () => ({
    status,
    payload,
  }));
}

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify provider-slice-07 builder-live-mutation plus reviewer live execution.

## Intended Outcome
Keep planner, architect, task-breaker, builder-preflight, and builder-live-mutation live stable while extending OpenAI Responses live execution through reviewer.

## Acceptance Target
- planner live invocation remains stable
- architect live invocation remains stable
- task-breaker live invocation remains stable
- builder-preflight live invocation remains stable
- builder-live-mutation live invocation succeeds with exact anchor, allowlist, and atomic mutation bundle validation
- reviewer live invocation succeeds from the latest successful builder live-mutation bundle only

## Verification Approach
- synthetic provider smoke

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
- breakdown
- preflight
- change-summary
- patch
- diff

## Worktree Need
No.

## Non-Goals
- release or close-out changes
`;
}

function createPlannerStructuredText({ artifactMarkdown, normalizedResult = {} }) {
  return JSON.stringify({
    artifactMarkdown,
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'architect',
      summary: normalizedResult.summary || 'Planner output is ready for architect handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createArchitectStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      boundaryFit: artifact.boundaryFit || 'fit',
      affectedComponentsOrContracts: Array.isArray(artifact.affectedComponentsOrContracts)
        ? artifact.affectedComponentsOrContracts
        : [...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS],
      policyImpact: Array.isArray(artifact.policyImpact)
        ? artifact.policyImpact
        : ['The slice stays inside the existing provider boundary.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : ['Builder live mutation must preserve the exact current provenance chain.'],
      noArchitectureChangeStatement:
        artifact.noArchitectureChangeStatement ||
        'No architecture change is approved by this note. Downstream work must stay inside the current boundary.',
      blockingArchitectureIssues: Array.isArray(artifact.blockingArchitectureIssues)
        ? artifact.blockingArchitectureIssues
        : [],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'task-breaker',
      summary:
        normalizedResult.summary || 'Architect output is ready for task-breaker handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createTaskBreakerStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      orderedSubTasks: Array.isArray(artifact.orderedSubTasks)
        ? artifact.orderedSubTasks
        : [
            'Validate the exact current plan-plus-architecture provenance chain.',
            'Prepare the minimum implementation slice without widening scope.',
            'Stop after the bounded implementation slice is ready for builder handoff.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the implementation boundary and non-goals remain unchanged',
            'checkpoint 2: define the minimum bounded mutation plan',
            'checkpoint 3: collect verification and review handoff evidence',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : ['checkpoint 1: breakdown', 'checkpoint 2: preflight', 'checkpoint 3: mutation bundle'],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Run the smallest practical verification tied to the approved slice.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review only after the bounded mutation bundle exists.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if the live mutation would widen the approved boundary.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['Builder handoff stays bounded to the current approved slice only.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'builder',
      summary:
        normalizedResult.summary || 'Task-breaker output is ready for builder handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createBuilderPreflightStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      targetFiles: Array.isArray(artifact.targetFiles) ? artifact.targetFiles : [...DEFAULT_TARGET_FILES],
      intendedChanges: Array.isArray(artifact.intendedChanges)
        ? artifact.intendedChanges
        : [
            'Extend OpenAI Responses live execution to builder-live-mutation.',
            'Keep file writes bounded to the latest approved preflight allowlist.',
          ],
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when live mutation anchor, approval, or file validation diverges.'],
      verificationPlan: Array.isArray(artifact.verificationPlan)
        ? artifact.verificationPlan
        : ['Run synthetic smoke for happy-path and fail-closed cases.'],
      reviewEvidenceExpectations: Array.isArray(artifact.reviewEvidenceExpectations)
        ? artifact.reviewEvidenceExpectations
        : ['Capture a canonical preflight artifact with explicit target files.'],
      escalationTriggers: Array.isArray(artifact.escalationTriggers)
        ? artifact.escalationTriggers
        : ['Escalate if a target file leaves the approved architecture boundary.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage:
        normalizedResult.nextStage || 'request-builder-live-mutation-approval',
      summary:
        normalizedResult.summary ||
        'Builder-preflight output is ready for explicit live-mutation approval request.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createBuilderLiveMutationStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  const fileUpdates = Array.isArray(artifact.fileUpdates) ? artifact.fileUpdates : [];

  return JSON.stringify({
    anchor,
    artifact: {
      changeSummary: Array.isArray(artifact.changeSummary)
        ? artifact.changeSummary
        : ['Prepare a bounded mutation bundle for the approved preflight target set.'],
      targetFiles: Array.isArray(artifact.targetFiles)
        ? artifact.targetFiles
        : [...anchor.targetFileAllowlistPaths],
      fileUpdates: fileUpdates.map((fileUpdate) => ({
        path: fileUpdate.path,
        contentBase64:
          fileUpdate.contentBase64 || Buffer.from(fileUpdate.content || '', 'utf8').toString('base64'),
      })),
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when actual changed files diverge from the validated file update set.'],
      verificationNotes: Array.isArray(artifact.verificationNotes)
        ? artifact.verificationNotes
        : ['Prepare the latest successful builder bundle for reviewer handoff without widening commit or release semantics.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'reviewer',
      summary:
        normalizedResult.summary ||
        'Builder live mutation prepared a bounded file update inside the approved target allowlist.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createReviewerStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      verdict: artifact.verdict || 'pass',
      evidenceReviewed: Array.isArray(artifact.evidenceReviewed)
        ? artifact.evidenceReviewed
        : [
            `builder run ${anchor.sourceBuilderRunId}`,
            `change-summary artifact ${anchor.changeSummaryArtifactId}`,
            `patch artifact ${anchor.patchArtifactId}`,
            `diff artifact ${anchor.diffArtifactId}`,
          ],
      findings: Array.isArray(artifact.findings) ? artifact.findings : [],
      contractCompliance: Array.isArray(artifact.contractCompliance)
        ? artifact.contractCompliance
        : ['Latest successful builder live-mutation bundle anchor was preserved.'],
      verificationEvidence: Array.isArray(artifact.verificationEvidence)
        ? artifact.verificationEvidence
        : [`changed files: ${anchor.changedFilePaths.join(', ')}`],
      acceptedRisks: Array.isArray(artifact.acceptedRisks) ? artifact.acceptedRisks : [],
      followUpGate: {
        blockingIssue: artifact.followUpGate?.blockingIssue === true,
        decisionRequired: artifact.followUpGate?.decisionRequired === true,
      },
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'human gate',
      summary:
        normalizedResult.summary ||
        'Reviewer completed the latest successful builder live-mutation bundle inspection.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createApiPayload(outputText, options = {}) {
  return {
    payload: {
      id: options.providerRunId || 'resp-provider-slice-07',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 18,
        output_tokens: 36,
        total_tokens: 54,
      },
    },
    status: options.status ?? 200,
  };
}

function createPlannerApiPayload(label, options = {}) {
  return createApiPayload(
    createPlannerStructuredText({
      artifactMarkdown: createPlannerArtifactMarkdown(label),
      normalizedResult: options.normalizedResult || {},
    }),
    options,
  );
}

function createArchitectApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createArchitectStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createTaskBreakerApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createTaskBreakerStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createBuilderPreflightApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createBuilderPreflightStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createBuilderLiveMutationApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createBuilderLiveMutationStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createReviewerApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createReviewerStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createAbortError() {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

function createLiveCoordinator(runtime, fetchImpl) {
  return createExecutionCoordinator({
    liveProviderAdapter: createOpenAIResponsesProviderAdapter({
      fetchImpl,
    }),
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
    builderPreflightCodeContextPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  });
}

function collectTaskRunErrors(runtime, taskId) {
  const snapshot = runtime.getSnapshot();
  const runs = Object.values(snapshot.runs)
    .filter((run) => run.taskId === taskId)
    .sort((left, right) => (right.startedAt || '').localeCompare(left.startedAt || ''));

  return runs.map((run) => ({
    id: run.id,
    error: run.summary?.error || null,
    logs: runtime.getLogs(run.id),
  }));
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
  architectureAllowlistPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  codeContextPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
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
    architectureAllowlistPaths,
    codeContextPaths,
  };
}

function captureDigests(projectPath, relativePaths) {
  return relativePaths.map((relativePath) => {
    const filePath = path.join(projectPath, relativePath);
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      path: relativePath,
      digest: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
    };
  });
}

function createBuilderLiveMutationAnchor(context) {
  const digests = captureDigests(context.project.projectPath, context.targetFiles);

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
    architectureAllowlistPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
    targetFileAllowlistPaths: context.targetFiles,
    codeContextPaths: context.targetFiles,
    targetFileBaselineDigests: digests,
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
  return `provider-slice-07 ${approvalId} ${relativePath}`;
}

function createMutatedFileContent(projectPath, relativePath, approvalId) {
  const filePath = path.join(projectPath, relativePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = buildMutationMarker(approvalId, relativePath);
  const suffix =
    path.extname(relativePath).toLowerCase() === '.js'
      ? `\n// ${marker}\n`
      : `\n<!-- ${marker} -->\n`;

  return {
    marker,
    mutated: `${content.replace(/\s*$/, '\n').replace(/\n$/, '')}${suffix}`,
    original: content,
  };
}

async function runPlannerArchitectTaskBreakerForTask({
  coordinator,
  project,
  queuedFetch,
  runtime,
  label,
  intent,
  scopeStatement,
}) {
  const task = runtime.createTask({
    projectId: project.id,
    title: `provider-slice-07 ${label}`,
    intent,
  });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);
  const architectAnchor = createArchitectAnchor(
    project.id,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
  );

  queuedFetch.push(createArchitectApiPayload(architectAnchor));

  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
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

  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });
  const breakdownArtifact = runtime.getArtifact(taskBreakerResult.artifact.id);

  return {
    architectResult,
    architectureArtifact,
    breakdownArtifact,
    planArtifact,
    plannerResult,
    task,
    taskBreakerResult,
  };
}

async function runApprovedBuilderPreflightContext({
  coordinator,
  project,
  queuedFetch,
  runtime,
  label,
  targetFiles = DEFAULT_TARGET_FILES,
}) {
  const context = await runPlannerArchitectTaskBreakerForTask({
    coordinator,
    project,
    queuedFetch,
    runtime,
    label,
    intent: `Run provider-slice-07 synthetic smoke for ${label}.`,
    scopeStatement:
      'Verify planner, architect, task-breaker, builder-preflight, and builder-live-mutation live execution inside the approved bounded slice.',
  });
  const builderPreflightAnchor = createBuilderPreflightAnchor(
    project.id,
    context.task.id,
    context.planArtifact.id,
    context.plannerResult.run.id,
    context.architectureArtifact.id,
    context.architectResult.run.id,
    context.breakdownArtifact.id,
    context.taskBreakerResult.run.id,
  );

  queuedFetch.push(
    createBuilderPreflightApiPayload(builderPreflightAnchor, {
      artifact: {
        targetFiles,
      },
      providerRunId: `resp-builder-preflight-${label}`,
    }),
  );

  const preflightResult = await coordinator.runBuilderPreflight({
    taskId: context.task.id,
  });

  assert.equal(preflightResult.run.summary.nextStage, 'request-builder-live-mutation-approval');

  const approval = runtime.requestBuilderLiveMutationApproval({
    taskId: context.task.id,
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: `Approve live mutation for ${label}.`,
  });

  return {
    ...context,
    approval: runtime.getApproval(approval.id),
    preflightResult,
    project,
    targetFiles,
  };
}

async function runSuccessfulBuilderLiveMutationContext({
  coordinator,
  project,
  queuedFetch,
  runtime,
  label,
  targetFiles = DEFAULT_TARGET_FILES,
}) {
  const context = await runApprovedBuilderPreflightContext({
    coordinator,
    project,
    queuedFetch,
    runtime,
    label,
    targetFiles,
  });
  const builderAnchor = createBuilderLiveMutationAnchor(context);
  const mutationPlan = createMutatedFileContent(
    context.project.projectPath,
    context.targetFiles[0],
    context.approval.id,
  );

  queuedFetch.push(
    createBuilderLiveMutationApiPayload(builderAnchor, {
      artifact: {
        changeSummary: ['Prepare one bounded file update inside the approved allowlist.'],
        fileUpdates: [
          {
            path: context.targetFiles[0],
            content: mutationPlan.mutated,
          },
        ],
        targetFiles: context.targetFiles,
        risks: ['Fail closed if actual changed files do not match the validated file updates.'],
        verificationNotes: [
          'Store change-summary, patch, and diff together as one mutation bundle.',
        ],
      },
      providerRunId: `resp-builder-live-mutation-${label}`,
    }),
  );

  const builderResult = await coordinator.runBuilderLiveMutation({
    taskId: context.task.id,
  });

  return {
    ...context,
    builderAnchor,
    builderResult,
    mutationPlan,
  };
}

async function assertBuilderLiveMutationFailure({
  errorPattern,
  label,
  project,
  runtime,
  builderLiveResponseFactory,
}) {
  const queuedFetch = createQueuedFetch([createPlannerApiPayload(`${label}-planner`)]);
  const coordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);
  const context = await runApprovedBuilderPreflightContext({
    coordinator,
    project,
    queuedFetch,
    runtime,
    label,
  });
  const approvalBefore = runtime.getApproval(context.approval.id);
  const builderAnchor = createBuilderLiveMutationAnchor(context);
  const beforeSnapshot = runtime.getSnapshot();
  const runCountBefore = countRuns(beforeSnapshot, context.task.id);
  const changeSummaryCountBefore = countArtifacts(beforeSnapshot, context.task.id, 'change-summary');
  const patchCountBefore = countArtifacts(beforeSnapshot, context.task.id, 'patch');
  const diffCountBefore = countArtifacts(beforeSnapshot, context.task.id, 'diff');
  const targetFileContentsBefore = context.targetFiles.map((relativePath) => ({
    path: relativePath,
    content: fs.readFileSync(path.join(context.project.projectPath, relativePath), 'utf8'),
  }));

  queuedFetch.push(builderLiveResponseFactory(builderAnchor, context));

  await assert.rejects(
    () => coordinator.runBuilderLiveMutation({ taskId: context.task.id }),
    errorPattern,
  );

  const afterSnapshot = runtime.getSnapshot();
  const taskRuns = collectTaskRunErrors(runtime, context.task.id);
  const approvalAfter = runtime.getApproval(context.approval.id);

  assert.equal(countRuns(afterSnapshot, context.task.id), runCountBefore + 1);
  assert.equal(countArtifacts(afterSnapshot, context.task.id, 'change-summary'), changeSummaryCountBefore);
  assert.equal(countArtifacts(afterSnapshot, context.task.id, 'patch'), patchCountBefore);
  assert.equal(countArtifacts(afterSnapshot, context.task.id, 'diff'), diffCountBefore);
  assert.match(taskRuns[0]?.error || '', errorPattern);
  assert.match(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /invoking provider adapter openai-responses/i,
  );
  assert.doesNotMatch(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /local-stub/i,
  );
  assert.equal(Boolean(approvalBefore.metadata?.consumedAt), false);
  assert.equal(Boolean(approvalAfter.metadata?.consumedAt), false);

  for (const fileRecord of targetFileContentsBefore) {
    const content = fs.readFileSync(path.join(context.project.projectPath, fileRecord.path), 'utf8');
    assert.equal(content, fileRecord.content);
  }
}

async function assertReviewerFailure({
  errorPattern,
  label,
  project,
  runtime,
  reviewerResponseFactory,
}) {
  const queuedFetch = createQueuedFetch([createPlannerApiPayload(`${label}-planner`)]);
  const coordinator = createLiveCoordinator(runtime, queuedFetch.fetchImpl);
  const context = await runSuccessfulBuilderLiveMutationContext({
    coordinator,
    project,
    queuedFetch,
    runtime,
    label,
  });
  const reviewerAnchor = createReviewerAnchor(context);
  const beforeSnapshot = runtime.getSnapshot();
  const runCountBefore = countRuns(beforeSnapshot, context.task.id);
  const reviewCountBefore = countArtifacts(beforeSnapshot, context.task.id, 'review');
  const decisionCountBefore = countDecisionItems(beforeSnapshot, context.task.id, 'decision');

  queuedFetch.push(reviewerResponseFactory(reviewerAnchor, context));

  await assert.rejects(
    () => coordinator.runReviewer({ taskId: context.task.id }),
    errorPattern,
  );

  const afterSnapshot = runtime.getSnapshot();
  const taskRuns = collectTaskRunErrors(runtime, context.task.id);

  assert.equal(countRuns(afterSnapshot, context.task.id), runCountBefore + 1);
  assert.equal(countArtifacts(afterSnapshot, context.task.id, 'review'), reviewCountBefore);
  assert.equal(countDecisionItems(afterSnapshot, context.task.id, 'decision'), decisionCountBefore);
  assert.match(taskRuns[0]?.error || '', errorPattern);
  assert.match(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /invoking provider adapter openai-responses/i,
  );
  assert.doesNotMatch(
    taskRuns[0]?.logs.map((entry) => entry.message).join('\n') || '',
    /local-stub/i,
  );
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();
process.env[liveProviderEnvVar] = sentinelSecret;

const defaultProject = runtime.createProject({
  name: 'provider-slice-07 default',
  projectPath: createFixtureProject('provider-slice-07-default'),
});
const liveProject = runtime.createProject({
  name: 'provider-slice-07 live',
  projectPath: createFixtureProject('provider-slice-07-live'),
  provider: {
    adapter: 'openai-responses',
    mode: 'live',
    model: 'provider-slice-07-operator-model',
    env: {
      apiKeyVar: liveProviderEnvVar,
    },
  },
});

const readinessFetch = createQueuedFetch();
const readinessCoordinator = createLiveCoordinator(runtime, readinessFetch.fetchImpl);
const defaultReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: defaultProject.id,
  role: 'planner',
});
const plannerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'planner',
});
const architectReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'architect',
});
const taskBreakerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'task-breaker',
});
const builderPreflightReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-preflight',
});
const builderLiveMutationReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'builder-live-mutation',
});
const reviewerReadiness = readinessCoordinator.getProviderExecutionReadiness({
  projectId: liveProject.id,
  role: 'reviewer',
});

assert.equal(defaultReadiness.mode, 'local-stub');
assert.equal(defaultReadiness.allowed, true);
assert.equal(plannerReadiness.readiness, 'ready');
assert.equal(plannerReadiness.allowed, true);
assert.equal(architectReadiness.readiness, 'ready');
assert.equal(architectReadiness.allowed, true);
assert.equal(taskBreakerReadiness.readiness, 'ready');
assert.equal(taskBreakerReadiness.allowed, true);
assert.equal(builderPreflightReadiness.readiness, 'ready');
assert.equal(builderPreflightReadiness.allowed, true);
assert.equal(builderLiveMutationReadiness.readiness, 'ready');
assert.equal(builderLiveMutationReadiness.allowed, true);
assert.equal(reviewerReadiness.readiness, 'ready');
assert.equal(reviewerReadiness.allowed, true);

const happyFetch = createQueuedFetch([createPlannerApiPayload('builder-live-mutation-happy')]);
const happyCoordinator = createLiveCoordinator(runtime, happyFetch.fetchImpl);
const happyContext = await runApprovedBuilderPreflightContext({
  coordinator: happyCoordinator,
  project: liveProject,
  queuedFetch: happyFetch,
  runtime,
  label: 'builder-live-mutation happy path',
});
const happyAnchor = createBuilderLiveMutationAnchor(happyContext);
const happyMutation = createMutatedFileContent(
  happyContext.project.projectPath,
  happyContext.targetFiles[0],
  happyContext.approval.id,
);

happyFetch.push(
  createBuilderLiveMutationApiPayload(happyAnchor, {
    artifact: {
      changeSummary: ['Prepare one bounded file update inside the approved allowlist.'],
      fileUpdates: [
        {
          path: happyContext.targetFiles[0],
          content: happyMutation.mutated,
        },
      ],
      targetFiles: happyContext.targetFiles,
      risks: ['Fail closed if actual changed files do not match the validated file updates.'],
      verificationNotes: [
        'Store change-summary, patch, and diff together as one mutation bundle.',
      ],
    },
    providerRunId: 'resp-builder-live-mutation-happy',
  }),
);

const happyBuilderResult = await happyCoordinator.runBuilderLiveMutation({
  taskId: happyContext.task.id,
});
const happyRequestBody = JSON.parse(happyFetch.calls[4].body);
const happyApproval = runtime.getApproval(happyContext.approval.id);
const happySnapshot = runtime.getSnapshot();
const happyChangeSummaryArtifact = runtime.getArtifact(happyBuilderResult.artifacts.changeSummary.id);

assert.equal(happyBuilderResult.run.summary.adapter, 'openai-responses');
assert.equal(happyBuilderResult.run.summary.providerRunId, 'resp-builder-live-mutation-happy');
assert.equal(happyBuilderResult.run.summary.preflightArtifactId, happyContext.preflightResult.artifact.id);
assert.equal(happyBuilderResult.run.summary.preflightRunId, happyContext.preflightResult.run.id);
assert.equal(happyBuilderResult.run.summary.approvalId, happyContext.approval.id);
assert.equal(happyBuilderResult.run.summary.nextStage, 'reviewer');
assert.deepEqual(happyBuilderResult.changedFiles, [happyContext.targetFiles[0]]);
assert.equal(happyApproval.metadata.consumedByRunId, happyBuilderResult.run.id);
assert.deepEqual(
  happyApproval.metadata.consumedArtifactIds.sort(),
  [
    happyBuilderResult.artifacts.changeSummary.id,
    happyBuilderResult.artifacts.patch.id,
    happyBuilderResult.artifacts.diff.id,
  ].sort(),
);
assert.equal(
  fs.readFileSync(path.join(happyContext.project.projectPath, happyContext.targetFiles[0]), 'utf8'),
  happyMutation.mutated,
);
assert.match(happyChangeSummaryArtifact.content, /^# Builder Live Mutation:/m);
assert.match(happyChangeSummaryArtifact.content, /^## Change Summary$/m);
assert.match(happyChangeSummaryArtifact.content, /^## File Updates$/m);
assert.equal(happyRequestBody.text.format.type, 'json_schema');
assert.equal(happyRequestBody.text.format.name, 'builder_live_mutation_artifact_response');
assert.match(
  String(happyRequestBody.instructions || ''),
  /fileUpdates\[\]\.path must be repo-relative, unique, non-empty, and a subset of anchor\.targetFileAllowlistPaths/i,
);
assert.match(String(happyRequestBody.input || ''), new RegExp(escapeRegExp(happyContext.approval.id)));
assert.match(
  String(happyRequestBody.input || ''),
  new RegExp(escapeRegExp(happyContext.preflightResult.artifact.id)),
);
assert.equal(countArtifacts(happySnapshot, happyContext.task.id, 'change-summary'), 1);
assert.equal(countArtifacts(happySnapshot, happyContext.task.id, 'patch'), 1);
assert.equal(countArtifacts(happySnapshot, happyContext.task.id, 'diff'), 1);
assert.equal(
  runtime.getTaskGuardSummary(happyContext.task.id).builderLiveMutation.latestApprovalDisplayStatus,
  'consumed',
);
await assert.rejects(
  () => happyCoordinator.runBuilderLiveMutation({ taskId: happyContext.task.id }),
  /already has successful builder live mutation run|already consumed/i,
);
assert.throws(
  () => runtime.requestBuilderLiveMutationApproval({ taskId: happyContext.task.id }),
  (error) => error.statusCode === 409 && /successful builder live mutation run|already covers/i.test(error.message),
);

const happyReviewerAnchor = createReviewerAnchor({
  ...happyContext,
  builderResult: happyBuilderResult,
});

happyFetch.push(
  createReviewerApiPayload(happyReviewerAnchor, {
    artifact: {
      verdict: 'pass',
      evidenceReviewed: [
        `builder run ${happyBuilderResult.run.id}`,
        `change-summary artifact ${happyBuilderResult.artifacts.changeSummary.id}`,
        `patch artifact ${happyBuilderResult.artifacts.patch.id}`,
        `diff artifact ${happyBuilderResult.artifacts.diff.id}`,
      ],
      findings: [],
      contractCompliance: [
        'Latest successful builder live-mutation bundle anchor was preserved exactly.',
      ],
      verificationEvidence: [
        `changed files: ${happyBuilderResult.changedFiles.join(', ')}`,
      ],
      acceptedRisks: ['Commit-package remains an explicit downstream operator action.'],
      followUpGate: {
        blockingIssue: false,
        decisionRequired: false,
      },
    },
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'human gate',
      summary: 'Review passed and leaves commit-package as an explicit downstream human step.',
      decisionTitle: '',
      decisionPrompt: '',
    },
    providerRunId: 'resp-reviewer-pass-human-gate',
  }),
);

const happyReviewerResult = await happyCoordinator.runReviewer({
  taskId: happyContext.task.id,
});
const happyReviewerRequestBody = JSON.parse(happyFetch.calls[5].body);
const happyReviewArtifact = runtime.getArtifact(happyReviewerResult.artifact.id);
const happyReviewerSnapshot = runtime.getSnapshot();
const happyCommitPackageReadiness = happyCoordinator.getCommitPackageReadiness({
  taskId: happyContext.task.id,
});

assert.equal(happyReviewerResult.run.summary.adapter, 'openai-responses');
assert.equal(happyReviewerResult.run.summary.providerRunId, 'resp-reviewer-pass-human-gate');
assert.equal(happyReviewerResult.run.summary.sourceRunId, happyBuilderResult.run.id);
assert.equal(happyReviewerResult.run.summary.rawVerdict, 'pass');
assert.equal(happyReviewerResult.run.summary.mappedReviewStatus, 'passed');
assert.equal(happyReviewerResult.run.summary.nextStage, 'human gate');
assert.equal(happyReviewerResult.run.summary.decisionCreated, false);
assert.equal(Boolean(happyReviewerResult.decisionInboxItem), false);
assert.equal(runtime.getTask(happyContext.task.id).review.status, 'passed');
assert.equal(countArtifacts(happyReviewerSnapshot, happyContext.task.id, 'review'), 1);
assert.equal(countDecisionItems(happyReviewerSnapshot, happyContext.task.id, 'decision'), 0);
assert.equal(countArtifacts(happyReviewerSnapshot, happyContext.task.id, 'commit-package'), 0);
assert.equal(happyCommitPackageReadiness.allowed, true);
assert.equal(happyCommitPackageReadiness.sourceReviewArtifactId, happyReviewerResult.artifact.id);
assert.match(happyReviewArtifact.content, /^# Reviewer Report:/m);
assert.match(happyReviewArtifact.content, /^## Review Verdict$/m);
assert.match(happyReviewArtifact.content, /^## Evidence Reviewed$/m);
assert.match(happyReviewArtifact.content, /^## Findings$/m);
assert.match(happyReviewArtifact.content, /^## Contract Compliance$/m);
assert.match(happyReviewArtifact.content, /^## Verification Evidence$/m);
assert.match(happyReviewArtifact.content, /^## Accepted Risks$/m);
assert.match(happyReviewArtifact.content, /^## Next Action$/m);
assert.match(happyReviewArtifact.content, /^## Follow-Up Gate$/m);
assert.equal(happyReviewerRequestBody.text.format.type, 'json_schema');
assert.equal(happyReviewerRequestBody.text.format.name, 'reviewer_artifact_response');
assert.match(
  String(happyReviewerRequestBody.instructions || ''),
  /artifact\.verdict must be pass, fail, or changes_requested only/i,
);
assert.match(
  String(happyReviewerRequestBody.input || ''),
  new RegExp(escapeRegExp(happyBuilderResult.run.id)),
);
assert.match(
  String(happyReviewerRequestBody.input || ''),
  new RegExp(escapeRegExp(happyBuilderResult.changedFiles[0])),
);
await assert.rejects(
  () => happyCoordinator.runReviewer({ taskId: happyContext.task.id }),
  (error) =>
    error.statusCode === 409 &&
    /Terminal reviewer run .* already exists for builder live mutation run/i.test(error.message),
);

const failFetch = createQueuedFetch([createPlannerApiPayload('reviewer-fail-builder-planner')]);
const failCoordinator = createLiveCoordinator(runtime, failFetch.fetchImpl);
const failContext = await runSuccessfulBuilderLiveMutationContext({
  coordinator: failCoordinator,
  project: liveProject,
  queuedFetch: failFetch,
  runtime,
  label: 'reviewer-fail-builder',
});
const failReviewerAnchor = createReviewerAnchor(failContext);

failFetch.push(
  createReviewerApiPayload(failReviewerAnchor, {
    artifact: {
      verdict: 'fail',
      evidenceReviewed: [`builder run ${failContext.builderResult.run.id}`],
      findings: ['Builder must correct the bounded mutation before review can pass.'],
      contractCompliance: ['Review stayed anchored to the latest successful builder bundle.'],
      verificationEvidence: ['No additional mutation is allowed until builder follow-up completes.'],
      acceptedRisks: [],
      followUpGate: {
        blockingIssue: false,
        decisionRequired: false,
      },
    },
    normalizedResult: {
      blockers: [],
      needsDecision: false,
      nextStage: 'builder',
      summary: 'Return the latest bundle to builder for corrective changes.',
      decisionTitle: '',
      decisionPrompt: '',
    },
    providerRunId: 'resp-reviewer-fail-builder',
  }),
);

const failReviewerResult = await failCoordinator.runReviewer({
  taskId: failContext.task.id,
});

assert.equal(failReviewerResult.run.summary.rawVerdict, 'fail');
assert.equal(failReviewerResult.run.summary.mappedReviewStatus, 'changes_requested');
assert.equal(failReviewerResult.run.summary.nextStage, 'builder');
assert.equal(failReviewerResult.run.summary.decisionCreated, false);
assert.equal(Boolean(failReviewerResult.decisionInboxItem), false);
assert.equal(
  failCoordinator.getCommitPackageReadiness({ taskId: failContext.task.id }).allowed,
  false,
);

const architectFetch = createQueuedFetch([createPlannerApiPayload('reviewer-architect-planner')]);
const architectCoordinator = createLiveCoordinator(runtime, architectFetch.fetchImpl);
const architectContext = await runSuccessfulBuilderLiveMutationContext({
  coordinator: architectCoordinator,
  project: liveProject,
  queuedFetch: architectFetch,
  runtime,
  label: 'reviewer-architect-escalation',
});
const architectReviewerAnchor = createReviewerAnchor(architectContext);

architectFetch.push(
  createReviewerApiPayload(architectReviewerAnchor, {
    artifact: {
      verdict: 'changes_requested',
      evidenceReviewed: [`builder run ${architectContext.builderResult.run.id}`],
      findings: ['Architecture drift needs upstream clarification before another mutation pass.'],
      contractCompliance: ['Bundle anchoring stayed exact.'],
      verificationEvidence: ['Builder output and review anchor reference the same patch/diff pair.'],
      acceptedRisks: [],
      followUpGate: {
        blockingIssue: false,
        decisionRequired: false,
      },
    },
    normalizedResult: {
      blockers: ['Architecture drift requires architect review before another builder attempt.'],
      needsDecision: false,
      nextStage: 'architect',
      summary: 'Escalate to architect with the current failing review bundle.',
      decisionTitle: '',
      decisionPrompt: '',
    },
    providerRunId: 'resp-reviewer-architect',
  }),
);

const architectReviewerResult = await architectCoordinator.runReviewer({
  taskId: architectContext.task.id,
});

assert.equal(architectReviewerResult.run.summary.rawVerdict, 'changes_requested');
assert.equal(architectReviewerResult.run.summary.mappedReviewStatus, 'changes_requested');
assert.equal(architectReviewerResult.run.summary.nextStage, 'architect');
assert.equal(architectReviewerResult.run.summary.decisionCreated, false);
assert.equal(Boolean(architectReviewerResult.decisionInboxItem), false);

const humanGateFetch = createQueuedFetch([createPlannerApiPayload('reviewer-human-gate-planner')]);
const humanGateCoordinator = createLiveCoordinator(runtime, humanGateFetch.fetchImpl);
const humanGateContext = await runSuccessfulBuilderLiveMutationContext({
  coordinator: humanGateCoordinator,
  project: liveProject,
  queuedFetch: humanGateFetch,
  runtime,
  label: 'reviewer-human-gate',
});
const humanGateReviewerAnchor = createReviewerAnchor(humanGateContext);

humanGateFetch.push(
  createReviewerApiPayload(humanGateReviewerAnchor, {
    artifact: {
      verdict: 'fail',
      evidenceReviewed: [`builder run ${humanGateContext.builderResult.run.id}`],
      findings: ['Human policy acceptance is required before work may proceed.'],
      contractCompliance: ['Bundle anchoring stayed exact.'],
      verificationEvidence: ['The review references the latest successful builder patch/diff bundle only.'],
      acceptedRisks: ['A human must decide whether to accept the flagged policy risk.'],
      followUpGate: {
        blockingIssue: true,
        decisionRequired: true,
      },
    },
    normalizedResult: {
      blockers: ['Policy risk needs explicit human approval before another execution stage.'],
      needsDecision: true,
      nextStage: 'human gate',
      summary: 'Hold the task at human gate with one blocking review decision item.',
      decisionTitle: 'Review decision required',
      decisionPrompt: 'Decide whether the flagged policy risk is acceptable for this builder bundle.',
    },
    providerRunId: 'resp-reviewer-human-gate',
  }),
);

const humanGateReviewerResult = await humanGateCoordinator.runReviewer({
  taskId: humanGateContext.task.id,
});
const humanGateSnapshot = runtime.getSnapshot();
const humanGateDecisionItem = humanGateReviewerResult.decisionInboxItem;

assert.equal(humanGateReviewerResult.run.summary.rawVerdict, 'fail');
assert.equal(humanGateReviewerResult.run.summary.mappedReviewStatus, 'changes_requested');
assert.equal(humanGateReviewerResult.run.summary.nextStage, 'human gate');
assert.equal(humanGateReviewerResult.run.summary.decisionCreated, true);
assert.ok(humanGateDecisionItem);
assert.equal(humanGateDecisionItem.kind, 'decision');
assert.equal(humanGateDecisionItem.sourceType, 'review');
assert.equal(humanGateDecisionItem.blocksTask, true);
assert.equal(countDecisionItems(humanGateSnapshot, humanGateContext.task.id, 'decision'), 1);
assert.equal(
  humanGateCoordinator.getCommitPackageReadiness({ taskId: humanGateContext.task.id }).allowed,
  false,
);

await assertBuilderLiveMutationFailure({
  errorPattern: /structured output JSON is required/i,
  label: 'builder-live-mutation malformed json',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: () =>
    createBuilderLiveMutationApiPayload(null, {
      rawOutputText: '{not-json',
    }),
});

await assertBuilderLiveMutationFailure({
  errorPattern: /approved target-file allowlist|outside the latest preflight target files/i,
  label: 'builder-live-mutation allowlist mismatch',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: (anchor, context) => {
    const mutated = createMutatedFileContent(
      context.project.projectPath,
      context.targetFiles[0],
      context.approval.id,
    );

    return createBuilderLiveMutationApiPayload(anchor, {
      artifact: {
        fileUpdates: [
          {
            path: 'outside/scope.js',
            content: mutated.mutated,
          },
        ],
        targetFiles: context.targetFiles,
      },
      providerRunId: 'resp-builder-live-mutation-outside-scope',
    });
  },
});

await assertBuilderLiveMutationFailure({
  errorPattern: /Actual changed files do not match the validated file updates/i,
  label: 'builder-live-mutation exact-match mismatch',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: (anchor, context) => {
    const firstTarget = context.targetFiles[0];
    const secondTarget = context.targetFiles[1];
    const firstContent = fs.readFileSync(path.join(context.project.projectPath, firstTarget), 'utf8');
    const secondMutation = createMutatedFileContent(
      context.project.projectPath,
      secondTarget,
      context.approval.id,
    );

    return createBuilderLiveMutationApiPayload(anchor, {
      artifact: {
        fileUpdates: [
          {
            path: firstTarget,
            content: firstContent,
          },
          {
            path: secondTarget,
            content: secondMutation.mutated,
          },
        ],
        targetFiles: context.targetFiles,
      },
      providerRunId: 'resp-builder-live-mutation-exact-match',
    });
  },
});

await assertBuilderLiveMutationFailure({
  errorPattern: /status 401/i,
  label: 'builder-live-mutation auth failure',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: () => ({
    status: 401,
    payload: {
      error: {
        message: 'Unauthorized',
      },
    },
  }),
});

await assertBuilderLiveMutationFailure({
  errorPattern: /status 429/i,
  label: 'builder-live-mutation quota failure',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: () =>
    createTerminalStatusResponses(429, {
      error: {
        message: 'Rate limited',
      },
    }),
});

await assertBuilderLiveMutationFailure({
  errorPattern: /timed out/i,
  label: 'builder-live-mutation timeout failure',
  project: liveProject,
  runtime,
  builderLiveResponseFactory: () => ({
    throwError: createAbortError(),
  }),
});

await assertReviewerFailure({
  errorPattern: /structured output JSON is required/i,
  label: 'reviewer malformed json',
  project: liveProject,
  runtime,
  reviewerResponseFactory: () =>
    createReviewerApiPayload(null, {
      rawOutputText: '{not-json',
    }),
});

await assertReviewerFailure({
  errorPattern: /anchor must exactly match the reviewer request anchor/i,
  label: 'reviewer anchor mismatch',
  project: liveProject,
  runtime,
  reviewerResponseFactory: (anchor) =>
    createReviewerApiPayload(anchor, {
      anchor: {
        ...anchor,
        sourceBuilderRunId: 'run-anchor-mismatch',
      },
      artifact: {
        verdict: 'pass',
        evidenceReviewed: ['anchor mismatch should fail closed'],
        findings: [],
        contractCompliance: ['none'],
        verificationEvidence: ['none'],
        acceptedRisks: [],
        followUpGate: {
          blockingIssue: false,
          decisionRequired: false,
        },
      },
      normalizedResult: {
        blockers: [],
        needsDecision: false,
        nextStage: 'human gate',
        summary: 'This response should never persist.',
        decisionTitle: '',
        decisionPrompt: '',
      },
    }),
});

await assertReviewerFailure({
  errorPattern: /builder handoff must keep non-pass verdict/i,
  label: 'reviewer invalid verdict next-stage',
  project: liveProject,
  runtime,
  reviewerResponseFactory: (anchor) =>
    createReviewerApiPayload(anchor, {
      artifact: {
        verdict: 'pass',
        evidenceReviewed: ['invalid combo'],
        findings: [],
        contractCompliance: ['invalid combo'],
        verificationEvidence: ['invalid combo'],
        acceptedRisks: [],
        followUpGate: {
          blockingIssue: false,
          decisionRequired: false,
        },
      },
      normalizedResult: {
        blockers: [],
        needsDecision: false,
        nextStage: 'builder',
        summary: 'Invalid pass-to-builder combo.',
        decisionTitle: '',
        decisionPrompt: '',
      },
    }),
});

await assertReviewerFailure({
  errorPattern: /status 401/i,
  label: 'reviewer auth failure',
  project: liveProject,
  runtime,
  reviewerResponseFactory: () => ({
    status: 401,
    payload: {
      error: {
        message: 'Unauthorized',
      },
    },
  }),
});

await assertReviewerFailure({
  errorPattern: /status 429/i,
  label: 'reviewer quota failure',
  project: liveProject,
  runtime,
  reviewerResponseFactory: () =>
    createTerminalStatusResponses(429, {
      error: {
        message: 'Rate limited',
      },
    }),
});

await assertReviewerFailure({
  errorPattern: /timed out/i,
  label: 'reviewer timeout failure',
  project: liveProject,
  runtime,
  reviewerResponseFactory: () => ({
    throwError: createAbortError(),
  }),
});

const finalSnapshot = runtime.getSnapshot();

assertSecretAbsent(JSON.stringify(finalSnapshot), sentinelSecret, 'snapshot payload');

for (const run of Object.values(finalSnapshot.runs)) {
  const logs = runtime.getLogs(run.id);
  assertSecretAbsent(JSON.stringify(logs), sentinelSecret, `logs ${run.id}`);
}

for (const artifact of Object.values(finalSnapshot.artifacts)) {
  const artifactPayload = runtime.getArtifact(artifact.id);
  assertSecretAbsent(JSON.stringify(artifactPayload), sentinelSecret, `artifact ${artifact.id}`);
}

const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, sentinelSecret);
assert.deepEqual(runtimeSecretMatches, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      liveProjectId: liveProject.id,
      happyTaskId: happyContext.task.id,
      happyBuilderRunId: happyBuilderResult.run.id,
      happyReviewerRunId: happyReviewerResult.run.id,
      reviewerReadiness: reviewerReadiness.readiness,
    },
    null,
    2,
  ),
);
