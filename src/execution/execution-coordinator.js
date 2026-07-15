'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  buildCombinedDiff,
  captureFileContents,
  captureFileDigests,
  computeContentDigest,
  resolveProjectFilePath,
  restoreFileContents,
} = require('./coordinator/diff');
const {
  assertDedicatedLinkedWorktreeReady,
  collectRepoChangeSet,
  ensureGitCommitEnvironment,
  normalizeRelativePath,
  parseGitPathLines,
  runGit,
} = require('./coordinator/git');
const {
  buildArchitectExecutionRequest,
  buildBuilderLiveMutationExecutionRequest,
  buildBuilderPreflightExecutionRequest,
  buildPlannerExecutionRequest,
  buildReviewerExecutionRequest,
  buildTaskBreakerExecutionRequest,
} = require('./coordinator/execution-requests');
const {
  buildArchitectDecisionInput,
  buildBuilderDecisionInput,
  buildBuilderLiveMutationDecisionInput,
  buildPlannerDecisionInput,
  buildReviewerDecisionInput,
  buildTaskBreakerDecisionInput,
  normalizeRoleResult,
} = require('./coordinator/decision-inputs');
const { getMarkdownSection, parseMarkdownKeyValueLines, parseMarkdownList, parseYesNoValue } = require('./coordinator/markdown');
const { sameExactDigestEntries, sameExactStringArrays } = require('./execution-text-utils');
const {
  buildCommitApprovalPrompt,
  buildCommitApprovalTitle,
  buildDefaultCommitMessage,
  buildReleaseApprovalPrompt,
  buildReleaseApprovalTitle,
  parseCommitPackageArtifactContent,
  parseCommitResultArtifactContent,
  parseReleasePackageArtifactContent,
  parseReviewerArtifactContent,
  renderCloseOutArtifact,
  renderCommitPackageArtifact,
  renderCommitResultArtifact,
  renderMarkdownList,
  renderReleasePackageArtifact,
} = require('./coordinator/artifact-content');
const { executeWithAdapter } = require('./provider-adapter');
const { runQaNodeChecks } = require('./qa-node-check-runner');
const {
  createOpenAIResponsesProviderAdapter,
} = require('./providers/openai-responses-adapter');
const { createLocalStubProviderAdapter } = require('./providers/local-stub-adapter');
const {
  APPROVAL_STATUS,
  COMMIT_ACTION,
  RELEASE_ACTION,
  DECISION_INBOX_SOURCE_TYPE,
  PACKS,
  PROVIDER_ADAPTER_ID,
  PROVIDER_MODE,
  PROVIDER_READINESS,
  REVIEW_STATUS,
  TASK_LIFECYCLE,
} = require('../runtime/contracts');

const DEFAULT_SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const DEFAULT_SOURCE_OF_TRUTH_PATHS_BY_PACK = {
  [PACKS.DEVELOPMENT]: DEFAULT_SOURCE_OF_TRUTH_PATHS,
  [PACKS.KNOWLEDGE_WORK]: [
    'AGENTS.md',
    'docs/06_ai-orchestration-pivot.md',
    'docs/07_mission-council-slice-m6-02.md',
    'packs/knowledge-work/pack.md',
    'tasks/todo.md',
    'tasks/lessons.md',
  ],
};
const DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];
const DEFAULT_BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/runtime-service.js',
  'src/execution/provider-adapter.js',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/openai-responses-adapter.js',
  'src/execution/providers/openai-responses-retry-policy.js',
  'ui/app.js',
];

function readContextFile(repoRoot, relativePath) {
  const filePath = path.join(repoRoot, relativePath);

  return {
    path: relativePath,
    content: fs.readFileSync(filePath, 'utf8'),
  };
}

function readProjectContextFile(projectPath, relativePath) {
  const filePath = resolveProjectFilePath(projectPath, relativePath);

  return {
    path: relativePath,
    content: fs.readFileSync(filePath, 'utf8'),
  };
}

function parseBase64FileUpdates(content) {
  const section = getMarkdownSection(content, 'File Updates');
  const fileUpdates = [];
  const seenPaths = new Set();

  for (const block of section.split(/^###\s+/m).filter(Boolean)) {
    const newlineIndex = block.indexOf('\n');
    const relativePath = normalizeRelativePath(block.slice(0, newlineIndex).trim());
    const fenceMatch = block.match(/```base64\n([\s\S]*?)\n```/);

    if (!relativePath) {
      throw new Error(`Unsupported file update path: ${block.slice(0, newlineIndex).trim()}`);
    }

    if (!fenceMatch) {
      throw new Error(`Missing base64 file update block for ${relativePath}`);
    }

    if (seenPaths.has(relativePath)) {
      throw new Error(`Duplicate file update path is not allowed: ${relativePath}`);
    }

    seenPaths.add(relativePath);

    fileUpdates.push({
      path: relativePath,
      content: Buffer.from(fenceMatch[1].replace(/\s+/g, ''), 'base64').toString('utf8'),
    });
  }

  return fileUpdates;
}

function compareRunsByStartedDesc(left, right) {
  const leftValue = left.startedAt || '';
  const rightValue = right.startedAt || '';

  if (leftValue === rightValue) {
    return String(right.id || '').localeCompare(String(left.id || ''));
  }

  return rightValue.localeCompare(leftValue);
}

function compareRecordsByCreatedDesc(left, right) {
  const leftValue = left.createdAt || '';
  const rightValue = right.createdAt || '';

  if (leftValue === rightValue) {
    return String(right.id || '').localeCompare(String(left.id || ''));
  }

  return rightValue.localeCompare(leftValue);
}

function sameStringSets(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSet = new Set(left);

  return right.every((value) => leftSet.has(value));
}

function findLatestTaskArtifact(runtime, task, type) {
  const snapshot = runtime.getSnapshot();
  const artifactIds = Array.isArray(task.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifactMeta = snapshot.artifacts[artifactId];

    if (artifactMeta && artifactMeta.type === type) {
      return runtime.getArtifact(artifactId);
    }
  }

  return null;
}

function resolveLatestTaskBreakerProvenance(runtime, task) {
  const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');

  if (!planArtifact) {
    throw new Error(`Plan artifact is required before task-breaker run for task ${task.id}`);
  }

  if (!planArtifact.runId) {
    throw new Error(`Plan run id is required before task-breaker run for task ${task.id}`);
  }

  const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');

  if (!architectureArtifact) {
    throw new Error(`Architecture artifact is required before task-breaker run for task ${task.id}`);
  }

  if (!architectureArtifact.runId) {
    throw new Error(`Architecture run id is required before task-breaker run for task ${task.id}`);
  }

  const plannerRun = runtime.getRun(planArtifact.runId);
  const architectRun = runtime.getRun(architectureArtifact.runId);
  const architectSummary =
    architectRun?.summary && typeof architectRun.summary === 'object' ? architectRun.summary : {};

  if (
    architectSummary.inputArtifactId !== planArtifact.id ||
    architectSummary.inputRunId !== planArtifact.runId
  ) {
    throw new Error(
      `Latest architecture artifact ${architectureArtifact.id} does not match current latest plan artifact ${planArtifact.id}`,
    );
  }

  return {
    architectureArtifact,
    architectRun,
    planArtifact,
    plannerRun,
  };
}

function resolveLatestBuilderPreflightProvenance(runtime, task) {
  const {
    architectureArtifact,
    architectRun,
    planArtifact,
    plannerRun,
  } = resolveLatestTaskBreakerProvenance(runtime, task);
  const breakdownArtifact = findLatestTaskArtifact(runtime, task, 'breakdown');

  if (!breakdownArtifact) {
    throw new Error(`Breakdown artifact is required before builder preflight run for task ${task.id}`);
  }

  if (!breakdownArtifact.runId) {
    throw new Error(`Breakdown run id is required before builder preflight run for task ${task.id}`);
  }

  const taskBreakerRun = runtime.getRun(breakdownArtifact.runId);
  const taskBreakerSummary =
    taskBreakerRun?.summary && typeof taskBreakerRun.summary === 'object'
      ? taskBreakerRun.summary
      : {};
  const inputArtifactIds = Array.isArray(taskBreakerSummary.inputArtifactIds)
    ? taskBreakerSummary.inputArtifactIds
    : [];
  const inputRunIds = Array.isArray(taskBreakerSummary.inputRunIds)
    ? taskBreakerSummary.inputRunIds
    : [];

  if (
    taskBreakerSummary.architectureArtifactId !== architectureArtifact.id ||
    taskBreakerSummary.architectureRunId !== architectureArtifact.runId ||
    !sameExactStringArrays(inputArtifactIds, [planArtifact.id, architectureArtifact.id]) ||
    !sameExactStringArrays(inputRunIds, [planArtifact.runId, architectureArtifact.runId])
  ) {
    throw new Error(
      `Latest breakdown artifact ${breakdownArtifact.id} does not match current latest plan-plus-architecture provenance chain`,
    );
  }

  return {
    architectureArtifact,
    architectRun,
    breakdownArtifact,
    planArtifact,
    plannerRun,
    taskBreakerRun,
  };
}

function resolveLatestBuilderLiveMutationProvenance(runtime, task, preflightArtifact, preflightRun) {
  const provenance = resolveLatestBuilderPreflightProvenance(runtime, task);
  const resolvedPreflightArtifact = preflightArtifact || findLatestTaskArtifact(runtime, task, 'preflight');

  if (!resolvedPreflightArtifact) {
    throw new Error(`Preflight artifact is required before builder live mutation run for task ${task.id}`);
  }

  const resolvedPreflightRun =
    preflightRun ||
    (resolvedPreflightArtifact.runId ? runtime.getRun(resolvedPreflightArtifact.runId) : null);

  if (!resolvedPreflightRun) {
    throw new Error(`Preflight run id is required before builder live mutation run for task ${task.id}`);
  }

  const preflightSummary =
    resolvedPreflightRun.summary && typeof resolvedPreflightRun.summary === 'object'
      ? resolvedPreflightRun.summary
      : {};
  const inputArtifactIds = Array.isArray(preflightSummary.inputArtifactIds)
    ? preflightSummary.inputArtifactIds
    : [];
  const inputRunIds = Array.isArray(preflightSummary.inputRunIds) ? preflightSummary.inputRunIds : [];

  if (
    preflightSummary.planArtifactId !== provenance.planArtifact.id ||
    preflightSummary.planRunId !== provenance.planArtifact.runId ||
    preflightSummary.architectureArtifactId !== provenance.architectureArtifact.id ||
    preflightSummary.architectureRunId !== provenance.architectureArtifact.runId ||
    preflightSummary.breakdownArtifactId !== provenance.breakdownArtifact.id ||
    preflightSummary.breakdownRunId !== provenance.breakdownArtifact.runId ||
    !sameExactStringArrays(inputArtifactIds, [
      provenance.planArtifact.id,
      provenance.architectureArtifact.id,
      provenance.breakdownArtifact.id,
    ]) ||
    !sameExactStringArrays(inputRunIds, [
      provenance.planArtifact.runId,
      provenance.architectureArtifact.runId,
      provenance.breakdownArtifact.runId,
    ])
  ) {
    throw new Error(
      `Latest preflight artifact ${resolvedPreflightArtifact.id} does not match current latest plan-plus-architecture-plus-breakdown provenance chain`,
    );
  }

  return {
    ...provenance,
    preflightArtifact: resolvedPreflightArtifact,
    preflightRun: resolvedPreflightRun,
  };
}

function findLatestSuccessfulBuilderLiveMutationRun(runtime, task) {
  const snapshot = runtime.getSnapshot();

  return (
    Object.values(snapshot.runs)
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
        const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : null;
        const artifactIds =
          summary?.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : null;

        return (
          run.taskId === task.id &&
          run.role === 'builder' &&
          (summary?.executionMode === 'live-mutation' ||
            metadata?.executionMode === 'live-mutation') &&
          !summary?.error &&
          Array.isArray(summary?.inputArtifactIds) &&
          summary.inputArtifactIds.length > 0 &&
          Boolean(summary?.approvalId) &&
          Boolean(summary?.preflightArtifactId) &&
          Boolean(summary?.preflightRunId) &&
          Array.isArray(summary?.changedFiles) &&
          summary.changedFiles.length > 0 &&
          Boolean(artifactIds?.changeSummary) &&
          Boolean(artifactIds?.patch) &&
          Boolean(artifactIds?.diff)
        );
      })
      .sort(compareRunsByStartedDesc)[0] || null
  );
}

function normalizeReviewerChangedFilePaths(changedFiles, builderRunId) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
    throw new Error(`Builder live mutation run ${builderRunId} changedFiles bundle is missing`);
  }

  const normalizedChangedFiles = changedFiles.map((value) => {
    const normalizedValue = normalizeRelativePath(value);

    if (!normalizedValue) {
      throw new Error(
        `Builder live mutation run ${builderRunId} changedFiles must contain repo-relative paths only`,
      );
    }

    return normalizedValue;
  });

  if (new Set(normalizedChangedFiles).size !== normalizedChangedFiles.length) {
    throw new Error(`Builder live mutation run ${builderRunId} changedFiles must be unique`);
  }

  return normalizedChangedFiles;
}

function assertReviewerBundleArtifact(artifact, expectedType, expectedRunId, label) {
  if (!artifact) {
    throw new Error(`${label} is missing`);
  }

  if (artifact.type !== expectedType) {
    throw new Error(`${label} ${artifact.id} must be type ${expectedType}`);
  }

  if (artifact.runId !== expectedRunId) {
    throw new Error(`${label} ${artifact.id} must belong to run ${expectedRunId}`);
  }
}

function resolveReviewerAnchorBundle(runtime, task) {
  const builderRun = findLatestSuccessfulBuilderLiveMutationRun(runtime, task);

  if (!builderRun) {
    throw new Error(
      `Latest successful builder live mutation bundle is required before reviewer run for task ${task.id}`,
    );
  }

  const summary = builderRun.summary && typeof builderRun.summary === 'object' ? builderRun.summary : {};
  const artifactIds = summary.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : {};
  const inputArtifactIds = Array.isArray(summary.inputArtifactIds) ? summary.inputArtifactIds : [];
  const changedFiles = normalizeReviewerChangedFilePaths(summary.changedFiles, builderRun.id);

  if (inputArtifactIds.length === 0) {
    throw new Error(`Builder live mutation run ${builderRun.id} input bundle is missing`);
  }

  if (!summary.preflightArtifactId) {
    throw new Error(`Builder live mutation run ${builderRun.id} preflight artifact is missing`);
  }

  if (!artifactIds.changeSummary || !artifactIds.patch || !artifactIds.diff) {
    throw new Error(`Builder live mutation run ${builderRun.id} artifact bundle is incomplete`);
  }

  if (!summary.approvalId) {
    throw new Error(`Builder live mutation run ${builderRun.id} approval linkage is missing`);
  }

  if (!inputArtifactIds.includes(summary.preflightArtifactId)) {
    throw new Error(
      `Builder live mutation run ${builderRun.id} preflight artifact is missing from the input bundle`,
    );
  }

  const inputArtifacts = inputArtifactIds.map((artifactId) => runtime.getArtifact(artifactId));
  const planArtifact = inputArtifacts.find((artifact) => artifact.type === 'plan') || null;
  const architectureArtifact =
    inputArtifacts.find((artifact) => artifact.type === 'architecture') || null;
  const breakdownArtifact = inputArtifacts.find((artifact) => artifact.type === 'breakdown') || null;

  if (!planArtifact || !architectureArtifact || !breakdownArtifact) {
    throw new Error(`Builder live mutation run ${builderRun.id} input bundle is incomplete`);
  }

  const preflightArtifact = runtime.getArtifact(summary.preflightArtifactId);
  const approval = runtime.getApproval(summary.approvalId);
  const changeSummaryArtifact = runtime.getArtifact(artifactIds.changeSummary);
  const patchArtifact = runtime.getArtifact(artifactIds.patch);
  const diffArtifact = runtime.getArtifact(artifactIds.diff);

  if (preflightArtifact.type !== 'preflight') {
    throw new Error(
      `Builder live mutation run ${builderRun.id} preflight artifact ${preflightArtifact.id} must be type preflight`,
    );
  }

  if (preflightArtifact.runId !== summary.preflightRunId) {
    throw new Error(
      `Builder live mutation run ${builderRun.id} preflight bundle does not match recorded preflight run ${summary.preflightRunId}`,
    );
  }

  if (
    (summary.approvalTargetArtifactId && summary.approvalTargetArtifactId !== preflightArtifact.id) ||
    (summary.approvalTargetRunId && summary.approvalTargetRunId !== preflightArtifact.runId)
  ) {
    throw new Error(
      `Builder live mutation run ${builderRun.id} approval target does not match preflight bundle ${preflightArtifact.id}`,
    );
  }

  if (
    approval.targetArtifactId !== preflightArtifact.id ||
    approval.targetRunId !== preflightArtifact.runId
  ) {
    throw new Error(
      `Builder live mutation run ${builderRun.id} approval ${approval.id} does not match preflight bundle ${preflightArtifact.id}`,
    );
  }

  assertReviewerBundleArtifact(
    changeSummaryArtifact,
    'change-summary',
    builderRun.id,
    'Reviewer source change-summary artifact',
  );
  assertReviewerBundleArtifact(
    patchArtifact,
    'patch',
    builderRun.id,
    'Reviewer source patch artifact',
  );
  assertReviewerBundleArtifact(
    diffArtifact,
    'diff',
    builderRun.id,
    'Reviewer source diff artifact',
  );

  const changeSummaryFileUpdates = parseBase64FileUpdates(changeSummaryArtifact.content).map(
    (fileUpdate) => fileUpdate.path,
  );

  if (!sameStringSets(changeSummaryFileUpdates, changedFiles)) {
    throw new Error(
      `Builder live mutation run ${builderRun.id} changedFiles do not match the latest successful bundle anchor`,
    );
  }

  return {
    approval,
    architectureArtifact,
    breakdownArtifact,
    builderLogs: runtime.getLogs(builderRun.id),
    builderRun,
    changeSummaryArtifact,
    changedFiles,
    diffArtifact,
    inputArtifacts,
    patchArtifact,
    planArtifact,
    preflightArtifact,
  };
}

function findTerminalReviewerRun(runtime, task, sourceRunId) {
  const snapshot = runtime.getSnapshot();

  return (
    Object.values(snapshot.runs)
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;

        return (
          run.taskId === task.id &&
          run.role === 'reviewer' &&
          summary?.sourceRunId === sourceRunId &&
          summary?.terminal === true &&
          !summary?.error &&
          summary?.reviewArtifactId
        );
      })
      .sort(compareRunsByStartedDesc)[0] || null
  );
}

function mapReviewerVerdictToReviewStatus(verdict) {
  return verdict === 'pass' ? 'passed' : 'changes_requested';
}

function buildReviewerResolutionNote(parsedReview, reviewArtifact) {
  if (parsedReview.verdict === 'pass') {
    return `Review passed. See ${reviewArtifact.id} for evidence.`;
  }

  return `Review follow-up is required. See ${reviewArtifact.id} for evidence and findings.`;
}

function assertReviewerArtifactMatchesBundle(parsedReview, readyContext) {
  const expectedFields = [
    ['sourceBuilderRunId', readyContext.builderRun.id, 'source builder run'],
    ['preflightArtifactId', readyContext.preflightArtifact.id, 'preflight artifact'],
    ['changeSummaryArtifactId', readyContext.changeSummaryArtifact.id, 'change-summary artifact'],
    ['patchArtifactId', readyContext.patchArtifact.id, 'patch artifact'],
    ['diffArtifactId', readyContext.diffArtifact.id, 'diff artifact'],
  ];

  for (const [field, expectedValue, label] of expectedFields) {
    if (parsedReview[field] !== expectedValue) {
      throw new Error(`Reviewer artifact ${label} must match the latest successful builder bundle anchor`);
    }
  }
}

function assertReviewerFollowUpMatchesNormalizedResult(parsedReview, normalizedResult) {
  const expectsBlockingDecision =
    normalizedResult.nextStage === 'human gate' &&
    normalizedResult.needsDecision === true &&
    normalizedResult.blockers.length > 0;

  if (parsedReview.decisionRequired !== normalizedResult.needsDecision) {
    throw new Error(
      'Reviewer artifact follow-up gate must match the validated reviewer normalizedResult.needsDecision value',
    );
  }

  if (parsedReview.blockingIssue !== expectsBlockingDecision) {
    throw new Error(
      'Reviewer artifact follow-up gate must match the validated reviewer human-gate decision condition',
    );
  }
}

function shouldCreateReviewerDecision(parsedReview, normalizedResult) {
  return (
    normalizedResult.nextStage === 'human gate' &&
    normalizedResult.needsDecision === true &&
    normalizedResult.blockers.length > 0 &&
    parsedReview.decisionRequired === true &&
    parsedReview.blockingIssue === true
  );
}

function shouldCreateBlockingDecision(normalizedResult) {
  return normalizedResult.needsDecision || normalizedResult.nextStage === 'human gate';
}

function buildReviewerReadinessSummary(input) {
  const reasons = Array.isArray(input.reasons) ? [...new Set(input.reasons.filter(Boolean))] : [];
  const anchor = input.anchor || null;
  const existingReviewerRun = input.existingReviewerRun || null;
  const existingReviewerSummary =
    existingReviewerRun?.summary && typeof existingReviewerRun.summary === 'object'
      ? existingReviewerRun.summary
      : null;

  return {
    allowed: reasons.length === 0,
    approvalId: anchor?.approval?.id || null,
    changeSummaryArtifactId: anchor?.changeSummaryArtifact?.id || null,
    changedFileCount: anchor?.changedFiles?.length || 0,
    diffArtifactId: anchor?.diffArtifact?.id || null,
    existingReviewArtifactId: existingReviewerSummary?.reviewArtifactId || null,
    existingReviewerRunId: existingReviewerRun?.id || null,
    patchArtifactId: anchor?.patchArtifact?.id || null,
    preflightArtifactId: anchor?.preflightArtifact?.id || null,
    reasons,
    sourceBuilderRunId: anchor?.builderRun?.id || null,
  };
}

function createDefaultProjectProviderConfig() {
  return {
    mode: PROVIDER_MODE.LOCAL_STUB,
    adapter: PROVIDER_ADAPTER_ID.LOCAL_STUB,
    model: null,
    env: {
      apiKeyVar: null,
    },
  };
}

function normalizeProviderReasons(reasons) {
  return [...new Set((reasons || []).map((reason) => String(reason || '').trim()).filter(Boolean))];
}

function getExecutionEntryProviderReasons(summary) {
  if (!summary || summary.allowed || !Array.isArray(summary.reasons) || summary.reasons.length === 0) {
    return [];
  }

  return [`provider-not-ready: ${summary.reasons[0]}`];
}

function normalizeProjectProviderConfig(provider) {
  const defaults = createDefaultProjectProviderConfig();
  const source = provider && typeof provider === 'object' ? provider : {};
  const env = source.env && typeof source.env === 'object' ? source.env : {};
  const mode = source.mode === PROVIDER_MODE.LIVE ? PROVIDER_MODE.LIVE : PROVIDER_MODE.LOCAL_STUB;

  return {
    ...defaults,
    mode,
    adapter:
      mode === PROVIDER_MODE.LIVE
        ? PROVIDER_ADAPTER_ID.OPENAI_RESPONSES
        : PROVIDER_ADAPTER_ID.LOCAL_STUB,
    model:
      mode === PROVIDER_MODE.LIVE && typeof source.model === 'string' && source.model.trim().length > 0
        ? source.model.trim()
        : null,
    env: {
      apiKeyVar:
        mode === PROVIDER_MODE.LIVE &&
        typeof (env.apiKeyVar ?? source.apiKeyVar) === 'string' &&
        String(env.apiKeyVar ?? source.apiKeyVar).trim().length > 0
          ? String(env.apiKeyVar ?? source.apiKeyVar).trim()
          : null,
    },
  };
}

function getProjectPathExecutionReasons(project) {
  const projectPath = String(project?.projectPath || '').trim();

  if (!projectPath) {
    return ['project_path is required'];
  }

  if (!fs.existsSync(projectPath)) {
    return [`project_path does not exist: ${projectPath}`];
  }

  let stats = null;

  try {
    stats = fs.statSync(projectPath);
  } catch (error) {
    return [`project_path is not accessible: ${projectPath}`];
  }

  if (!stats.isDirectory()) {
    return [`project_path must point to a directory: ${projectPath}`];
  }

  return [];
}

function getExecutionEntryWorktreeReasons(task, project) {
  const projectPath = String(project?.projectPath || '').trim();
  const expectedWorktreeRef = String(task?.worktreeRef || '').trim();

  if (!projectPath || !expectedWorktreeRef) {
    return [];
  }

  if (!fs.existsSync(expectedWorktreeRef)) {
    return [
      `linked-worktree mismatch: task.worktreeRef does not exist before execution: ${expectedWorktreeRef}`,
    ];
  }

  let resolvedProjectPath = null;

  try {
    resolvedProjectPath = fs.realpathSync(projectPath);
  } catch (_error) {
    return [];
  }

  let currentExecutionRoot = resolvedProjectPath;

  try {
    currentExecutionRoot = fs.realpathSync(
      runGit(projectPath, ['rev-parse', '--show-toplevel']).trim(),
    );
  } catch (_error) {
    currentExecutionRoot = resolvedProjectPath;
  }

  const resolvedWorktreeRef = fs.realpathSync(expectedWorktreeRef);

  if (resolvedWorktreeRef === currentExecutionRoot) {
    return [];
  }

  return [
    `linked-worktree mismatch: task.worktreeRef must match current project_path before execution: expected=${resolvedWorktreeRef} actual=${currentExecutionRoot}`,
  ];
}

function normalizeProviderAdapterReadinessSummary(summary) {
  const source = summary && typeof summary === 'object' ? summary : {};
  const readiness = Object.values(PROVIDER_READINESS).includes(source.readiness)
    ? source.readiness
    : PROVIDER_READINESS.ERROR;
  const reasons = normalizeProviderReasons(source.reasons);

  return {
    readiness,
    allowed: source.allowed === true && reasons.length === 0,
    reasons:
      reasons.length > 0
        ? reasons
        : source.allowed === true
          ? []
          : ['provider readiness probe blocked execution'],
  };
}

function createExecutionCoordinator(options = {}) {
  if (!options.runtimeService) {
    throw new Error('runtimeService is required');
  }

  const runtime = options.runtimeService;
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const localStubProviderAdapter = options.providerAdapter || createLocalStubProviderAdapter();
  const liveProviderAdapter =
    options.liveProviderAdapter || createOpenAIResponsesProviderAdapter();
  const providerAdaptersById = {
    [PROVIDER_ADAPTER_ID.LOCAL_STUB]: localStubProviderAdapter,
    [PROVIDER_ADAPTER_ID.OPENAI_RESPONSES]: liveProviderAdapter,
    [PROVIDER_ADAPTER_ID.LIVE_PROVIDER_ALIAS]: liveProviderAdapter,
    ...(options.providerAdaptersById || {}),
  };
  const plannerPromptPath = options.plannerPromptPath || 'prompts/planner.md';
  const architectPromptPath = options.architectPromptPath || 'prompts/architect.md';
  const taskBreakerPromptPath = options.taskBreakerPromptPath || 'prompts/task-breaker.md';
  const builderPromptPath = options.builderPromptPath || 'prompts/builder.md';
  const reviewerPromptPath = options.reviewerPromptPath || 'prompts/reviewer.md';
  const sourceOfTruthPathOverride = options.sourceOfTruthPaths || null;
  const sourceOfTruthPathsByPack =
    options.sourceOfTruthPathsByPack || DEFAULT_SOURCE_OF_TRUTH_PATHS_BY_PACK;
  const architectCodeContextPaths =
    options.architectCodeContextPaths || DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS;
  const builderPreflightCodeContextPaths =
    options.builderPreflightCodeContextPaths || DEFAULT_BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS;
  const qaNodeCheckRunner = options.qaNodeCheckRunner || runQaNodeChecks;

  function resolveSourceOfTruthPaths(project) {
    if (sourceOfTruthPathOverride) {
      return sourceOfTruthPathOverride;
    }

    return sourceOfTruthPathsByPack[project?.pack] || DEFAULT_SOURCE_OF_TRUTH_PATHS;
  }

  function resolveProviderExecutionContext(project, role) {
    const providerConfig = normalizeProjectProviderConfig(project?.provider);
    const reasons = [];
    let readiness = PROVIDER_READINESS.READY;
    let allowed = true;
    let adapterId = providerConfig.adapter;

    if (providerConfig.mode === PROVIDER_MODE.LOCAL_STUB) {
      adapterId = PROVIDER_ADAPTER_ID.LOCAL_STUB;
    } else {
      adapterId = PROVIDER_ADAPTER_ID.OPENAI_RESPONSES;

      if (!providerConfig.model) {
        reasons.push('live provider model is required before execution');
      }

      if (!providerConfig.env.apiKeyVar) {
        reasons.push('live provider apiKey env var is required before execution');
      } else if (!process.env[providerConfig.env.apiKeyVar]) {
        reasons.push(
          `live provider env var ${providerConfig.env.apiKeyVar} is not configured for execution`,
        );
      }

      if (reasons.length > 0) {
        readiness = PROVIDER_READINESS.NOT_CONFIGURED;
        allowed = false;
      }
    }

    const adapter = providerAdaptersById[adapterId] || null;

    if (!adapter || typeof adapter.execute !== 'function') {
      readiness = PROVIDER_READINESS.ERROR;
      allowed = false;
      reasons.push(`provider adapter ${adapterId} is unavailable`);
    } else if (
      providerConfig.mode === PROVIDER_MODE.LIVE &&
      reasons.length === 0
    ) {
      if (typeof adapter.getReadiness !== 'function') {
        readiness = PROVIDER_READINESS.ERROR;
        allowed = false;
        reasons.push(`provider adapter ${adapterId} readiness probe is required`);
      } else {
        const adapterReadiness = normalizeProviderAdapterReadinessSummary(
          adapter.getReadiness({
            project,
            providerConfig,
            role,
          }),
        );

        readiness = adapterReadiness.readiness;
        allowed = adapterReadiness.allowed;
        reasons.push(...adapterReadiness.reasons);
      }
    }

    const summary = {
      adapter: adapterId,
      allowed: allowed && normalizeProviderReasons(reasons).length === 0,
      mode: providerConfig.mode,
      projectId: project?.id || null,
      readiness,
      reasons: normalizeProviderReasons(reasons),
    };

    return {
      adapter,
      project,
      providerConfig,
      summary,
    };
  }

  function assertProviderExecutionReady(project, role) {
    const context = resolveProviderExecutionContext(project, role);

    if (context.summary.allowed) {
      return context;
    }

    throw new Error(
      context.summary.reasons[0] || `provider execution is not ready for ${role}`,
    );
  }

  function getProviderExecutionReadiness(input = {}) {
    let project = null;

    if (input.projectId) {
      project = runtime.getProject(input.projectId);
    } else if (input.taskId) {
      const task = runtime.getTask(input.taskId);
      project = runtime.getProject(task.projectId);
    }

    if (!project) {
      throw new Error('projectId or taskId is required');
    }

    return resolveProviderExecutionContext(project, input.role || 'planner').summary;
  }

  function listProviderExecutionReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const project of Object.values(snapshot.projects)) {
      if (input.projectId && project.id !== input.projectId) {
        continue;
      }

      summaries[project.id] = resolveProviderExecutionContext(project, 'planner').summary;
    }

    return summaries;
  }

  function normalizeExecutionEntryStage(stage) {
    if (stage === 'architect') {
      return 'architect';
    }

    if (stage === 'task-breaker' || stage === 'taskBreaker') {
      return 'taskBreaker';
    }

    if (stage === 'builder-preflight' || stage === 'builderPreflight') {
      return 'builderPreflight';
    }

    return 'planner';
  }

  function toExecutionEntryRole(stage) {
    if (stage === 'taskBreaker') {
      return 'task-breaker';
    }

    if (stage === 'builderPreflight') {
      return 'builder-preflight';
    }

    return stage;
  }

  function resolveExecutionEntryReadiness(input = {}) {
    if (!input.taskId) {
      throw new Error('taskId is required');
    }

    const stage = normalizeExecutionEntryStage(input.stage);
    const task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);
    const reasons = [...getProjectPathExecutionReasons(project)];
    let providerSummary = null;

    if (reasons.length === 0) {
      reasons.push(...getExecutionEntryWorktreeReasons(task, project));
    }

    if (reasons.length === 0) {
      providerSummary = resolveProviderExecutionContext(project, toExecutionEntryRole(stage)).summary;

      if (!providerSummary.allowed) {
        reasons.push(...getExecutionEntryProviderReasons(providerSummary));
      }
    }

    if (stage === 'architect') {
      const latestPlanArtifact = findLatestTaskArtifact(runtime, task, 'plan');

      if (!latestPlanArtifact) {
        reasons.push(`Plan artifact is required before architect run for task ${task.id}`);
      }
    } else if (stage === 'taskBreaker' || stage === 'builderPreflight') {
      const guardSummary = runtime.getTaskGuardSummary(task.id);
      const stageGuard =
        stage === 'taskBreaker' ? guardSummary.taskBreaker : guardSummary.builderPreflight;

      if (stageGuard?.reasons?.length) {
        reasons.push(...stageGuard.reasons);
      }
    }

    return {
      allowed: normalizeProviderReasons(reasons).length === 0,
      projectId: project.id,
      providerSummary,
      reasons: normalizeProviderReasons(reasons),
      stage,
      taskId: task.id,
    };
  }

  function getExecutionEntryReadiness(input = {}) {
    return resolveExecutionEntryReadiness(input);
  }

  function listExecutionEntryReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = {
        architect: getExecutionEntryReadiness({
          stage: 'architect',
          taskId: task.id,
        }),
        builderPreflight: getExecutionEntryReadiness({
          stage: 'builderPreflight',
          taskId: task.id,
        }),
        planner: getExecutionEntryReadiness({
          stage: 'planner',
          taskId: task.id,
        }),
        taskBreaker: getExecutionEntryReadiness({
          stage: 'taskBreaker',
          taskId: task.id,
        }),
      };
    }

    return summaries;
  }

  function assertExecutionEntryReady(input = {}) {
    const readiness = resolveExecutionEntryReadiness(input);

    if (readiness.allowed) {
      return readiness;
    }

    throw new Error(
      readiness.reasons[0] || `${toExecutionEntryRole(readiness.stage)} execution is not ready`,
    );
  }

  async function assertBuilderLiveMutationReady(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const { guardSummary, task } = runtime.assertTaskCanRunBuilderLiveMutation({
      taskId: input.taskId,
    });
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const preflightArtifact = findLatestTaskArtifact(runtime, task, 'preflight');

    if (!preflightArtifact) {
      throw new Error(`Preflight artifact is required before builder live mutation for task ${task.id}`);
    }

    if (!guardSummary.latestApprovalId) {
      throw new Error(`Approved builder live mutation approval is required for task ${task.id}`);
    }

    const approval = runtime.getApproval(guardSummary.latestApprovalId);

    return {
      approval,
      guardSummary,
      preflightArtifact,
      preflightRun: preflightArtifact.runId ? runtime.getRun(preflightArtifact.runId) : null,
      project,
      task,
    };
  }

  function resolveReviewerReadiness(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);
    const reasons = [];

    if (!project.projectPath) {
      reasons.push('project_path is required');
    }

    let anchor = null;

    if (project.projectPath) {
      try {
        anchor = resolveReviewerAnchorBundle(runtime, task);
      } catch (error) {
        reasons.push(error.message);
      }
    }

    return {
      anchor,
      existingReviewerRun:
        anchor ? findTerminalReviewerRun(runtime, task, anchor.builderRun.id) : null,
      project,
      reasons,
      task,
    };
  }

  function getReviewerReadiness(input) {
    const ready = resolveReviewerReadiness(input);
    const reasons = [...ready.reasons];

    if (ready.anchor && ready.existingReviewerRun) {
      reasons.push(
        `Terminal reviewer run ${ready.existingReviewerRun.id} already exists for builder live mutation run ${ready.anchor.builderRun.id}`,
      );
    }

    return buildReviewerReadinessSummary({
      anchor: ready.anchor,
      existingReviewerRun: ready.existingReviewerRun,
      reasons,
    });
  }

  function assertReviewerReady(input) {
    const ready = resolveReviewerReadiness(input);
    const summary = getReviewerReadiness(input);

    if (summary.allowed) {
      return {
        ...ready.anchor,
        project: ready.project,
        task: ready.task,
      };
    }

    if (ready.existingReviewerRun) {
      const error = new Error(summary.reasons[0]);

      error.statusCode = 409;
      throw error;
    }

    throw new Error(summary.reasons[0] || 'reviewer is not ready');
  }

  function listReviewerReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getReviewerReadiness({
        taskId: task.id,
      });
    }

    return summaries;
  }

  function findLatestCommitPackageContext(task) {
    const artifact = findLatestTaskArtifact(runtime, task, 'commit-package');
    const run = artifact?.runId ? runtime.getRun(artifact.runId) : null;
    const summary = run?.summary && typeof run.summary === 'object' ? run.summary : null;

    return {
      artifact,
      run,
      summary,
    };
  }

  function findLatestSuccessfulLocalCommitContext(task) {
    const snapshot = runtime.getSnapshot();
    const run =
      Object.values(snapshot.runs)
        .filter((candidate) => {
          const summary =
            candidate.summary && typeof candidate.summary === 'object' ? candidate.summary : null;
          const metadata =
            candidate.metadata && typeof candidate.metadata === 'object'
              ? candidate.metadata
              : null;

          return (
            candidate.taskId === task.id &&
            candidate.role === 'commit-executor' &&
            (summary?.executionMode === 'local-commit' ||
              metadata?.executionMode === 'local-commit') &&
            summary?.commitResultArtifactId &&
            summary?.gitCommitExecuted === true &&
            !summary?.error
          );
        })
        .sort(compareRunsByStartedDesc)[0] || null;
    const artifact = run?.summary?.commitResultArtifactId
      ? runtime.getArtifact(run.summary.commitResultArtifactId)
      : null;

    return {
      artifact,
      parsedArtifact: artifact ? parseCommitResultArtifactContent(artifact.content) : null,
      run,
      summary: run?.summary && typeof run.summary === 'object' ? run.summary : null,
    };
  }

  function findLatestReleasePackageContext(task) {
    const artifact = findLatestTaskArtifact(runtime, task, 'release-package');
    const run = artifact?.runId ? runtime.getRun(artifact.runId) : null;
    const summary = run?.summary && typeof run.summary === 'object' ? run.summary : null;

    return {
      artifact,
      parsedArtifact: artifact ? parseReleasePackageArtifactContent(artifact.content) : null,
      run,
      summary,
    };
  }

  function findLatestCloseOutContext(task) {
    const artifact = findLatestTaskArtifact(runtime, task, 'close-out');
    const run = artifact?.runId ? runtime.getRun(artifact.runId) : null;
    const summary = run?.summary && typeof run.summary === 'object' ? run.summary : null;

    return {
      artifact,
      run,
      summary,
    };
  }

  function findTerminalCloseOutRun(task, sourceReleasePackageArtifactId) {
    const snapshot = runtime.getSnapshot();

    return (
      Object.values(snapshot.runs)
        .filter((run) => {
          const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
          const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : null;

          return (
            run.taskId === task.id &&
            run.role === 'close-out' &&
            (summary?.executionMode === 'close-out' || metadata?.executionMode === 'close-out') &&
            summary?.closeOutArtifactId &&
            summary?.sourceReleasePackageArtifactId === sourceReleasePackageArtifactId &&
            summary?.lifecycleTransition === 'Review -> Done' &&
            !summary?.error
          );
        })
        .sort(compareRunsByStartedDesc)[0] || null
    );
  }

  function resolveCommitPackageReadiness(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);
    const reasons = [];
    const pendingBlockingDecisionItems = runtime
      .listDecisionInboxItems({
        taskId: task.id,
        kind: 'decision',
        status: 'pending',
      })
      .filter((item) => item.blocksTask);
    let anchor = null;
    let reviewerRun = null;
    let reviewArtifact = null;

    if (!project.projectPath) {
      reasons.push('project_path is required');
    }

    if (project.projectPath) {
      try {
        anchor = resolveReviewerAnchorBundle(runtime, task);
      } catch (error) {
        reasons.push(error.message);
      }
    }

    if (anchor) {
      reviewerRun = findTerminalReviewerRun(runtime, task, anchor.builderRun.id);

      if (!reviewerRun) {
        reasons.push(
          `Latest successful terminal reviewer pass bundle is required before commit package for task ${task.id}`,
        );
      } else {
        const reviewerSummary =
          reviewerRun.summary && typeof reviewerRun.summary === 'object' ? reviewerRun.summary : {};

        if (
          reviewerSummary.mappedReviewStatus !== 'passed' ||
          reviewerSummary.rawVerdict !== 'pass'
        ) {
          reasons.push(
            `Latest terminal reviewer run ${reviewerRun.id} for builder live mutation run ${anchor.builderRun.id} must pass before commit package`,
          );
        } else if (!reviewerSummary.reviewArtifactId) {
          reasons.push(`Terminal reviewer run ${reviewerRun.id} review artifact is missing`);
        } else {
          reviewArtifact = runtime.getArtifact(reviewerSummary.reviewArtifactId);
        }
      }
    }

    if (pendingBlockingDecisionItems.length > 0) {
      reasons.push(
        `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
      );
    }

    const latestCommitPackage = findLatestCommitPackageContext(task);
    const currentCommitPackage =
      latestCommitPackage.summary &&
      reviewerRun &&
      anchor &&
      latestCommitPackage.summary.sourceReviewerRunId === reviewerRun.id &&
      latestCommitPackage.summary.sourceBuilderRunId === anchor.builderRun.id &&
      latestCommitPackage.summary.targetPreflightArtifactId === anchor.preflightArtifact.id
        ? latestCommitPackage
        : null;
    const latestCommitApproval =
      runtime
        .listApprovals({
          taskId: task.id,
          allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
        })
        .sort(compareRecordsByCreatedDesc)[0] || null;
    const approvalTargetsCurrentSource =
      Boolean(latestCommitApproval) &&
      Boolean(anchor?.preflightArtifact) &&
      latestCommitApproval.targetArtifactId === anchor.preflightArtifact.id &&
      latestCommitApproval.targetRunId === anchor.preflightArtifact.runId;
    const approvalStale = Boolean(latestCommitApproval) && Boolean(anchor?.preflightArtifact)
      ? !approvalTargetsCurrentSource
      : false;
    const packageStale = Boolean(latestCommitPackage.artifact) &&
      Boolean(reviewerRun) &&
      Boolean(anchor) &&
      !currentCommitPackage;
    let conflict = false;

    if (
      latestCommitApproval &&
      approvalTargetsCurrentSource &&
      (latestCommitApproval.status === 'pending' || latestCommitApproval.status === 'approved')
    ) {
      conflict = true;
      reasons.push(
        `latest approval ${latestCommitApproval.id} for ${COMMIT_ACTION.COMMIT_INTENT} is already ${latestCommitApproval.status} for source reviewer run ${reviewerRun.id}`,
      );
    }

    return {
      anchor,
      currentCommitPackage,
      latestCommitApproval,
      latestCommitPackage,
      pendingBlockingDecisionItems,
      project,
      reviewArtifact,
      reviewerRun,
      summary: {
        allowed: reasons.length === 0,
        approvalStale,
        conflict,
        currentCommitPackageArtifactId: currentCommitPackage?.artifact?.id || null,
        latestApprovalId: latestCommitApproval?.id || null,
        latestApprovalStatus: latestCommitApproval?.status || null,
        latestCommitPackageArtifactId: latestCommitPackage.artifact?.id || null,
        packageStale,
        reasons: [...new Set(reasons.filter(Boolean))],
        sourceBuilderRunId: anchor?.builderRun?.id || null,
        sourceReviewArtifactId: reviewArtifact?.id || null,
        sourceReviewerRunId: reviewerRun?.id || null,
        targetPreflightArtifactId: anchor?.preflightArtifact?.id || null,
        targetPreflightRunId: anchor?.preflightArtifact?.runId || null,
      },
      task,
    };
  }

  function getCommitPackageReadiness(input) {
    return resolveCommitPackageReadiness(input).summary;
  }

  function assertCommitPackageReady(input) {
    const ready = resolveCommitPackageReadiness(input);

    if (ready.summary.allowed) {
      return ready;
    }

    const error = new Error(
      ready.summary.reasons[0] || 'commit-package is not ready',
    );

    if (ready.summary.conflict) {
      error.statusCode = 409;
    }

    throw error;
  }

  function listCommitPackageReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getCommitPackageReadiness({
        taskId: task.id,
      });
    }

    return summaries;
  }

  function buildCommitExecutionReadinessSummary(input) {
    return {
      allowed: input.reasons.length === 0,
      approvalStale: Boolean(input.approvalStale),
      changedFileCount: input.parsedCommitPackage?.changedFiles?.length || 0,
      commitMessagePresent: Boolean(input.parsedCommitPackage?.commitMessage),
      commitPackageArtifactId: input.commitPackageArtifact?.id || null,
      conflict: Boolean(input.conflict),
      existingCommitResultArtifactId:
        input.existingLocalCommitRun?.summary?.commitResultArtifactId || null,
      existingLocalCommitRunId: input.existingLocalCommitRun?.id || null,
      latestApprovalDisplayStatus: input.approvalStale
        ? 'stale'
        : input.latestApproval?.status || 'none',
      latestApprovalId: input.latestApproval?.id || null,
      latestApprovalStatus: input.latestApproval?.status || null,
      reasons: [...new Set(input.reasons.filter(Boolean))],
      repoChangeCountBeforeCommit: input.repoStatusBefore?.allFiles?.length ?? null,
      sourceBuilderRunId: input.ready.anchor?.builderRun?.id || null,
      sourceReviewArtifactId: input.ready.reviewArtifact?.id || null,
      sourceReviewerRunId: input.ready.reviewerRun?.id || null,
      targetPreflightArtifactId: input.ready.anchor?.preflightArtifact?.id || null,
      targetPreflightRunId: input.ready.anchor?.preflightArtifact?.runId || null,
    };
  }

  function buildReleasePackageReadinessSummary(input) {
    return {
      allowed: input.reasons.length === 0,
      approvalStale: Boolean(input.approvalStale),
      commitPackageArtifactId: input.commitPackageArtifact?.id || null,
      commitResultArtifactId: input.commitResultArtifact?.id || null,
      commitSha: input.parsedCommitResult?.commitSha || null,
      conflict: Boolean(input.conflict),
      currentReleasePackageArtifactId: input.currentReleasePackage?.artifact?.id || null,
      deliveryStance: input.deliveryStance,
      latestApprovalDisplayStatus: input.approvalStale
        ? 'stale'
        : input.latestApproval?.status || 'none',
      latestApprovalId: input.latestApproval?.id || null,
      latestApprovalStatus: input.latestApproval?.status || null,
      latestReleasePackageArtifactId: input.latestReleasePackage?.artifact?.id || null,
      packageStale: Boolean(input.packageStale),
      reasons: [...new Set(input.reasons.filter(Boolean))],
      sourceBuilderRunId: input.anchor?.builderRun?.id || null,
      sourceReviewArtifactId: input.reviewArtifact?.id || null,
      sourceReviewerRunId: input.reviewerRun?.id || null,
      targetPreflightArtifactId: input.anchor?.preflightArtifact?.id || null,
      targetPreflightRunId: input.anchor?.preflightArtifact?.runId || null,
    };
  }

  function buildCloseOutReadinessSummary(input) {
    return {
      allowed: input.reasons.length === 0,
      approvalStale: Boolean(input.approvalStale),
      commitPackageArtifactId: input.commitPackageArtifact?.id || null,
      commitResultArtifactId: input.commitResultArtifact?.id || null,
      commitSha: input.parsedCommitResult?.commitSha || null,
      conflict: Boolean(input.conflict),
      currentReleasePackageArtifactId: input.currentReleasePackage?.artifact?.id || null,
      deliveryStance: input.deliveryStance,
      existingCloseOutArtifactId: input.existingCloseOutArtifact?.id || null,
      existingCloseOutRunId: input.existingCloseOutRun?.id || null,
      latestApprovedReleaseApprovalId: input.latestApprovedReleaseApproval?.id || null,
      latestApprovedReleaseApprovalStatus: input.latestApprovedReleaseApproval?.status || null,
      latestCloseOutArtifactId: input.latestCloseOut?.artifact?.id || null,
      latestReleasePackageArtifactId: input.latestReleasePackage?.artifact?.id || null,
      reasons: [...new Set(input.reasons.filter(Boolean))],
      repoClean: Boolean(input.repoStatus) && input.repoStatus.allFiles.length === 0,
      repoDirtyFileCount: input.repoStatus?.dirtyFiles?.length ?? null,
      repoStagedFileCount: input.repoStatus?.stagedFiles?.length ?? null,
      repoUntrackedFileCount: input.repoStatus?.untrackedFiles?.length ?? null,
      sourceBuilderApprovalId: input.anchor?.approval?.id || null,
      sourceBuilderRunId: input.anchor?.builderRun?.id || null,
      sourceReviewArtifactId: input.reviewArtifact?.id || null,
      sourceReviewerRunId: input.reviewerRun?.id || null,
      targetPreflightArtifactId: input.anchor?.preflightArtifact?.id || null,
      targetPreflightRunId: input.anchor?.preflightArtifact?.runId || null,
    };
  }

  function findLatestLocalCommitRun(task) {
    const snapshot = runtime.getSnapshot();

    return (
      Object.values(snapshot.runs)
        .filter((run) => {
          const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
          const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : null;

          return (
            run.taskId === task.id &&
            run.role === 'commit-executor' &&
            (summary?.executionMode === 'local-commit' ||
              metadata?.executionMode === 'local-commit')
          );
        })
        .sort(compareRunsByStartedDesc)[0] || null
    );
  }

  function resolveLocalCommitReadiness(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const ready = resolveCommitPackageReadiness(input);
    const task = ready.task;
    const project = ready.project;
    const reasons = [];
    let conflict = false;
    let parsedCommitPackage = null;
    let repoStatusBefore = null;

    if (!project.projectPath) {
      reasons.push('project_path is required');
    }

    if (project.projectPath) {
      try {
        ensureGitCommitEnvironment(project.projectPath);
      } catch (error) {
        reasons.push(error.message);
      }
    }

    const commitPackageArtifact = ready.currentCommitPackage?.artifact || null;
    const latestApproval = ready.latestCommitApproval || null;
    const existingLocalCommitRun = findLatestLocalCommitRun(task);
    const sourceChangedFiles = Array.isArray(ready.anchor?.builderRun?.summary?.changedFiles)
      ? ready.anchor.builderRun.summary.changedFiles
      : [];

    if (!commitPackageArtifact) {
      reasons.push(`Latest valid commit-package artifact is required before local commit for task ${task.id}`);
    } else {
      parsedCommitPackage = parseCommitPackageArtifactContent(commitPackageArtifact.content);

      if (!parsedCommitPackage.commitMessage) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} is missing required Commit Message section`,
        );
      }

      if (parsedCommitPackage.changedFiles.length === 0) {
        reasons.push(`Commit package artifact ${commitPackageArtifact.id} changed files are required`);
      }

      if (
        parsedCommitPackage.sourceReviewerRunId &&
        ready.reviewerRun &&
        parsedCommitPackage.sourceReviewerRunId !== ready.reviewerRun.id
      ) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} is stale for reviewer run ${ready.reviewerRun.id}`,
        );
      }

      if (
        parsedCommitPackage.sourceBuilderRunId &&
        ready.anchor?.builderRun &&
        parsedCommitPackage.sourceBuilderRunId !== ready.anchor.builderRun.id
      ) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} is stale for builder run ${ready.anchor.builderRun.id}`,
        );
      }

      if (
        parsedCommitPackage.preflightArtifactId &&
        ready.anchor?.preflightArtifact &&
        parsedCommitPackage.preflightArtifactId !== ready.anchor.preflightArtifact.id
      ) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} is stale for preflight ${ready.anchor.preflightArtifact.id}`,
        );
      }

      if (
        parsedCommitPackage.reviewArtifactId &&
        ready.reviewArtifact &&
        parsedCommitPackage.reviewArtifactId !== ready.reviewArtifact.id
      ) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} is stale for review artifact ${ready.reviewArtifact.id}`,
        );
      }

      if (sourceChangedFiles.length > 0 && !sameStringSets(parsedCommitPackage.changedFiles, sourceChangedFiles)) {
        reasons.push(
          `Commit package artifact ${commitPackageArtifact.id} changed files do not match source builder run ${ready.anchor.builderRun.id}`,
        );
      }
    }

    try {
      runtime.ensureCommitActionAllowed({
        taskId: task.id,
        action: COMMIT_ACTION.COMMIT_INTENT,
      });
    } catch (error) {
      reasons.push(error.message);
    }

    const approvalMatchesCurrentCommitPackage =
      Boolean(latestApproval) &&
      Boolean(commitPackageArtifact) &&
      Boolean(ready.reviewerRun) &&
      Boolean(ready.anchor?.builderRun) &&
      Boolean(ready.anchor?.preflightArtifact) &&
      latestApproval.metadata?.commitPackageArtifactId === commitPackageArtifact.id &&
      latestApproval.metadata?.sourceReviewerRunId === ready.reviewerRun.id &&
      latestApproval.metadata?.sourceBuilderRunId === ready.anchor.builderRun.id &&
      latestApproval.metadata?.targetPreflightArtifactId === ready.anchor.preflightArtifact.id &&
      latestApproval.targetArtifactId === ready.anchor.preflightArtifact.id &&
      latestApproval.targetRunId === ready.anchor.preflightArtifact.runId;
    const approvalStale =
      Boolean(latestApproval) &&
      latestApproval.status === 'approved' &&
      !approvalMatchesCurrentCommitPackage;

    if (approvalStale) {
      reasons.push(
        `latest approval ${latestApproval.id} for ${COMMIT_ACTION.COMMIT_INTENT} is stale for commit-package ${commitPackageArtifact?.id || 'missing'}`,
      );
    }

    if (
      existingLocalCommitRun &&
      latestApproval &&
      commitPackageArtifact &&
      existingLocalCommitRun.summary?.approvalId === latestApproval.id &&
      existingLocalCommitRun.summary?.commitPackageArtifactId === commitPackageArtifact.id &&
      existingLocalCommitRun.summary?.commitResultArtifactId &&
      !existingLocalCommitRun.summary?.error
    ) {
      conflict = true;
      reasons.push(
        `Local commit run ${existingLocalCommitRun.id} already executed approval ${latestApproval.id} for commit-package ${commitPackageArtifact.id}`,
      );
    }

    if (!conflict && project.projectPath && parsedCommitPackage?.changedFiles?.length) {
      try {
        runGit(project.projectPath, ['ls-files', '--error-unmatch', '--', ...parsedCommitPackage.changedFiles]);
        repoStatusBefore = collectRepoChangeSet(project.projectPath);

        if (!sameStringSets(repoStatusBefore.allFiles, parsedCommitPackage.changedFiles)) {
          reasons.push(
            `repo dirty/staged/untracked files must exactly match commit-package scope: expected=${parsedCommitPackage.changedFiles.join(', ') || 'none'} actual=${repoStatusBefore.allFiles.join(', ') || 'none'}`,
          );
        }
      } catch (error) {
        reasons.push(error.message);
      }
    }

    return {
      commitPackageArtifact,
      conflict,
      existingLocalCommitRun,
      latestApproval,
      parsedCommitPackage,
      project,
      ready,
      repoStatusBefore,
      reasons: [...new Set(reasons.filter(Boolean))],
      summary: buildCommitExecutionReadinessSummary({
        approvalStale,
        commitPackageArtifact,
        conflict,
        existingLocalCommitRun,
        latestApproval,
        parsedCommitPackage,
        ready,
        reasons,
        repoStatusBefore,
      }),
      task,
    };
  }

  function assertLocalCommitReady(input) {
    const ready = resolveLocalCommitReadiness(input);

    if (ready.reasons.length === 0) {
      return ready;
    }

    const error = new Error(ready.reasons[0] || 'local commit is not ready');

    if (ready.conflict) {
      error.statusCode = 409;
    }

    throw error;
  }

  function getCommitExecutionReadiness(input) {
    return resolveLocalCommitReadiness(input).summary;
  }

  function listCommitExecutionReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getCommitExecutionReadiness({
        taskId: task.id,
      });
    }

    return summaries;
  }

  function resolveReleasePackageReadiness(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const currentCommitBundle = resolveCommitPackageReadiness(input);
    const task = currentCommitBundle.task;
    const project = currentCommitBundle.project;
    const reasons = [];
    const deliveryStance = 'local-demo-only';
    const upstreamReasons = currentCommitBundle.summary.reasons.filter(
      (reason) => !new RegExp(`latest approval .*${COMMIT_ACTION.COMMIT_INTENT} is already`, 'i').test(reason),
    );

    reasons.push(
      ...upstreamReasons.map((reason) => reason.replace(/before commit package/gi, 'before release package')),
    );

    try {
      assertDedicatedLinkedWorktreeReady({
        actionLabel: 'release-package',
        projectPath: project.projectPath,
        worktreeRef: task.worktreeRef,
      });
    } catch (error) {
      reasons.push(error.message);
    }

    if (!currentCommitBundle.currentCommitPackage?.artifact) {
      if (currentCommitBundle.summary.packageStale) {
        reasons.push(
          `Latest successful local commit bundle is stale for current reviewer/builder provenance on task ${task.id}`,
        );
      } else {
        reasons.push(
          `Latest valid commit-package artifact is required before release package for task ${task.id}`,
        );
      }
    }

    const commitPackageArtifact = currentCommitBundle.currentCommitPackage?.artifact || null;
    const localCommitContext = findLatestSuccessfulLocalCommitContext(task);
    const commitResultArtifact = localCommitContext.artifact || null;
    const parsedCommitResult = localCommitContext.parsedArtifact || null;
    const localCommitRun = localCommitContext.run || null;
    const localCommitSummary = localCommitContext.summary || null;

    if (!localCommitRun || !commitResultArtifact || !parsedCommitResult) {
      reasons.push(`Latest successful local commit bundle is required before release package for task ${task.id}`);
    } else {
      if (localCommitSummary.commitResultArtifactId !== commitResultArtifact.id) {
        reasons.push(`Local commit run ${localCommitRun.id} is missing current commit-result linkage`);
      }

      if (!parsedCommitResult.commitSha || localCommitSummary.commitSha !== parsedCommitResult.commitSha) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} commit sha must match local commit run ${localCommitRun.id}`);
      }

      if (parsedCommitResult.commitPackageArtifactId !== localCommitSummary.commitPackageArtifactId) {
        reasons.push(
          `Commit result artifact ${commitResultArtifact.id} source commit-package linkage is incomplete`,
        );
      }

      if (parsedCommitResult.gitCommitExecuted !== true) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} must record git commit executed: yes`);
      }

      if (parsedCommitResult.pushExecuted !== false || parsedCommitResult.releaseExecuted !== false) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} must keep push and release disabled`);
      }

      if (
        commitPackageArtifact &&
        parsedCommitResult.commitPackageArtifactId !== commitPackageArtifact.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for commit-package ${commitPackageArtifact.id}`,
        );
      }

      if (
        currentCommitBundle.reviewerRun &&
        parsedCommitResult.sourceReviewerRunId !== currentCommitBundle.reviewerRun.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for reviewer run ${currentCommitBundle.reviewerRun.id}`,
        );
      }

      if (
        currentCommitBundle.reviewArtifact &&
        parsedCommitResult.reviewArtifactId !== currentCommitBundle.reviewArtifact.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for review artifact ${currentCommitBundle.reviewArtifact.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.builderRun &&
        parsedCommitResult.sourceBuilderRunId !== currentCommitBundle.anchor.builderRun.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for builder run ${currentCommitBundle.anchor.builderRun.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.preflightArtifact &&
        parsedCommitResult.preflightArtifactId !== currentCommitBundle.anchor.preflightArtifact.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for preflight ${currentCommitBundle.anchor.preflightArtifact.id}`,
        );
      }
    }

    const latestReleasePackage = findLatestReleasePackageContext(task);
    const currentReleasePackage =
      latestReleasePackage.summary &&
      commitResultArtifact &&
      commitPackageArtifact &&
      currentCommitBundle.reviewerRun &&
      currentCommitBundle.anchor?.builderRun &&
      currentCommitBundle.anchor?.preflightArtifact &&
      latestReleasePackage.summary.sourceCommitResultArtifactId === commitResultArtifact.id &&
      latestReleasePackage.summary.sourceCommitPackageArtifactId === commitPackageArtifact.id &&
      latestReleasePackage.summary.sourceReviewerRunId === currentCommitBundle.reviewerRun.id &&
      latestReleasePackage.summary.sourceBuilderRunId === currentCommitBundle.anchor.builderRun.id &&
      latestReleasePackage.summary.targetPreflightArtifactId ===
        currentCommitBundle.anchor.preflightArtifact.id &&
      latestReleasePackage.summary.commitSha === parsedCommitResult?.commitSha &&
      latestReleasePackage.summary.deliveryStance === deliveryStance
        ? latestReleasePackage
        : null;
    const packageStale =
      Boolean(latestReleasePackage.artifact) &&
      Boolean(commitResultArtifact) &&
      !currentReleasePackage;
    const latestApproval =
      runtime
        .listApprovals({
          taskId: task.id,
          allowedNextAction: RELEASE_ACTION.RELEASE_READY,
        })
        .sort(compareRecordsByCreatedDesc)[0] || null;
    const approvalMatchesCurrentSource =
      Boolean(latestApproval) &&
      Boolean(currentReleasePackage?.artifact) &&
      Boolean(commitResultArtifact) &&
      Boolean(commitPackageArtifact) &&
      Boolean(currentCommitBundle.reviewerRun) &&
      Boolean(currentCommitBundle.anchor?.builderRun) &&
      Boolean(currentCommitBundle.anchor?.preflightArtifact) &&
      latestApproval.metadata?.releasePackageArtifactId === currentReleasePackage.artifact.id &&
      latestApproval.metadata?.commitResultArtifactId === commitResultArtifact.id &&
      latestApproval.metadata?.commitPackageArtifactId === commitPackageArtifact.id &&
      latestApproval.metadata?.sourceReviewerRunId === currentCommitBundle.reviewerRun.id &&
      latestApproval.metadata?.sourceBuilderRunId === currentCommitBundle.anchor.builderRun.id &&
      latestApproval.metadata?.targetPreflightArtifactId ===
        currentCommitBundle.anchor.preflightArtifact.id &&
      latestApproval.metadata?.commitSha === parsedCommitResult?.commitSha &&
      latestApproval.metadata?.deliveryStance === deliveryStance &&
      latestApproval.targetArtifactId === currentCommitBundle.anchor.preflightArtifact.id &&
      latestApproval.targetRunId === currentCommitBundle.anchor.preflightArtifact.runId;
    const approvalStale = Boolean(latestApproval) && !approvalMatchesCurrentSource;
    let conflict = false;

    if (
      latestApproval &&
      approvalMatchesCurrentSource &&
      (latestApproval.status === 'pending' || latestApproval.status === 'approved')
    ) {
      conflict = true;
      reasons.push(
        `latest approval ${latestApproval.id} for ${RELEASE_ACTION.RELEASE_READY} is already ${latestApproval.status} for commit-result ${commitResultArtifact.id}`,
      );
    }

    return {
      commitPackageArtifact,
      commitResultArtifact,
      conflict,
      currentReleasePackage,
      currentCommitBundle,
      deliveryStance,
      latestApproval,
      latestReleasePackage,
      localCommitRun,
      parsedCommitResult,
      reasons: [...new Set(reasons.filter(Boolean))],
      summary: buildReleasePackageReadinessSummary({
        anchor: currentCommitBundle.anchor,
        approvalStale,
        commitPackageArtifact,
        commitResultArtifact,
        conflict,
        currentReleasePackage,
        deliveryStance,
        latestApproval,
        latestReleasePackage,
        packageStale,
        parsedCommitResult,
        project,
        reasons,
        reviewArtifact: currentCommitBundle.reviewArtifact,
        reviewerRun: currentCommitBundle.reviewerRun,
      }),
      project,
      task,
    };
  }

  function getReleasePackageReadiness(input) {
    return resolveReleasePackageReadiness(input).summary;
  }

  function assertReleasePackageReady(input) {
    const ready = resolveReleasePackageReadiness(input);

    if (ready.reasons.length === 0) {
      return ready;
    }

    const error = new Error(ready.reasons[0] || 'release-package is not ready');

    if (ready.conflict) {
      error.statusCode = 409;
    }

    throw error;
  }

  function listReleasePackageReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getReleasePackageReadiness({
        taskId: task.id,
      });
    }

    return summaries;
  }

  function resolveCloseOutReadiness(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const currentCommitBundle = resolveCommitPackageReadiness(input);
    const task = currentCommitBundle.task;
    const project = currentCommitBundle.project;
    const reasons = [];
    const deliveryStance = 'local-demo-only';
    const activeFlags = [];
    const commitPackageArtifact = currentCommitBundle.currentCommitPackage?.artifact || null;
    const localCommitContext = findLatestSuccessfulLocalCommitContext(task);
    const commitResultArtifact = localCommitContext.artifact || null;
    const parsedCommitResult = localCommitContext.parsedArtifact || null;
    const localCommitRun = localCommitContext.run || null;
    const localCommitSummary = localCommitContext.summary || null;
    const latestReleasePackage = findLatestReleasePackageContext(task);
    const latestCloseOut = findLatestCloseOutContext(task);
    const parsedReleasePackage = latestReleasePackage.parsedArtifact || null;
    let currentReleasePackage = null;
    let latestApprovedReleaseApproval = null;
    let existingCloseOutRun = null;
    let existingCloseOutArtifact = null;
    let approvalStale = false;
    let conflict = false;
    let repoStatus = null;

    if (task.lifecycleState !== TASK_LIFECYCLE.REVIEW) {
      reasons.push(`Task ${task.id} must be in Review before close-out`);
    }

    if (task.review?.status !== REVIEW_STATUS.PASSED) {
      reasons.push(`Task ${task.id} review must be passed before close-out`);
    }

    if (task.flags?.blocked) {
      activeFlags.push('blocked');
    }

    if (task.flags?.waitingApproval) {
      activeFlags.push('waitingApproval');
    }

    if (task.flags?.waitingDecision) {
      activeFlags.push('waitingDecision');
    }

    if (activeFlags.length > 0) {
      reasons.push(`Task ${task.id} cannot close out while flags remain active: ${activeFlags.join(', ')}`);
    }

    if (!project.projectPath) {
      reasons.push('project_path is required');
    }

    if (project.projectPath) {
      let linkedWorktreeReady = false;

      try {
        assertDedicatedLinkedWorktreeReady({
          actionLabel: 'close-out',
          projectPath: project.projectPath,
          worktreeRef: task.worktreeRef,
        });
        linkedWorktreeReady = true;
      } catch (error) {
        reasons.push(error.message);
      }

      if (linkedWorktreeReady) {
        try {
          repoStatus = collectRepoChangeSet(project.projectPath);

          if (repoStatus.allFiles.length > 0) {
            reasons.push(
              `Repo must be clean before close-out. dirty=${repoStatus.dirtyFiles.length} staged=${repoStatus.stagedFiles.length} untracked=${repoStatus.untrackedFiles.length}`,
            );
          }
        } catch (error) {
          reasons.push(error.message);
        }
      }
    }

    if (!commitPackageArtifact) {
      if (currentCommitBundle.summary.packageStale) {
        reasons.push(
          `Latest valid commit-package artifact is stale for current reviewer/builder provenance on task ${task.id}`,
        );
      } else {
        reasons.push(`Latest valid commit-package artifact is required before close-out for task ${task.id}`);
      }
    }

    if (!localCommitRun || !commitResultArtifact || !parsedCommitResult) {
      reasons.push(`Latest successful local commit bundle is required before close-out for task ${task.id}`);
    } else {
      if (localCommitSummary.commitResultArtifactId !== commitResultArtifact.id) {
        reasons.push(`Local commit run ${localCommitRun.id} is missing current commit-result linkage`);
      }

      if (!parsedCommitResult.commitSha || localCommitSummary.commitSha !== parsedCommitResult.commitSha) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} commit sha must match local commit run ${localCommitRun.id}`);
      }

      if (parsedCommitResult.commitPackageArtifactId !== localCommitSummary.commitPackageArtifactId) {
        reasons.push(
          `Commit result artifact ${commitResultArtifact.id} source commit-package linkage is incomplete`,
        );
      }

      if (parsedCommitResult.gitCommitExecuted !== true) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} must record git commit executed: yes`);
      }

      if (parsedCommitResult.pushExecuted !== false || parsedCommitResult.releaseExecuted !== false) {
        reasons.push(`Commit result artifact ${commitResultArtifact.id} must keep push and release disabled`);
      }

      if (commitPackageArtifact && parsedCommitResult.commitPackageArtifactId !== commitPackageArtifact.id) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for commit-package ${commitPackageArtifact.id}`,
        );
      }

      if (
        currentCommitBundle.reviewerRun &&
        parsedCommitResult.sourceReviewerRunId !== currentCommitBundle.reviewerRun.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for reviewer run ${currentCommitBundle.reviewerRun.id}`,
        );
      }

      if (
        currentCommitBundle.reviewArtifact &&
        parsedCommitResult.reviewArtifactId !== currentCommitBundle.reviewArtifact.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for review artifact ${currentCommitBundle.reviewArtifact.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.builderRun &&
        parsedCommitResult.sourceBuilderRunId !== currentCommitBundle.anchor.builderRun.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for builder run ${currentCommitBundle.anchor.builderRun.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.preflightArtifact &&
        parsedCommitResult.preflightArtifactId !== currentCommitBundle.anchor.preflightArtifact.id
      ) {
        reasons.push(
          `Local commit bundle ${commitResultArtifact.id} is stale for preflight ${currentCommitBundle.anchor.preflightArtifact.id}`,
        );
      }
    }

    if (!latestReleasePackage.artifact || !latestReleasePackage.run || !parsedReleasePackage) {
      reasons.push(`Latest release-package artifact is required before close-out for task ${task.id}`);
    } else {
      const releaseSummary = latestReleasePackage.summary || {};

      if (
        commitResultArtifact &&
        commitPackageArtifact &&
        currentCommitBundle.reviewerRun &&
        currentCommitBundle.anchor?.builderRun &&
        currentCommitBundle.anchor?.preflightArtifact &&
        releaseSummary.sourceCommitResultArtifactId === commitResultArtifact.id &&
        releaseSummary.sourceCommitPackageArtifactId === commitPackageArtifact.id &&
        releaseSummary.sourceReviewerRunId === currentCommitBundle.reviewerRun.id &&
        releaseSummary.sourceBuilderRunId === currentCommitBundle.anchor.builderRun.id &&
        releaseSummary.targetPreflightArtifactId === currentCommitBundle.anchor.preflightArtifact.id &&
        releaseSummary.commitSha === parsedCommitResult?.commitSha &&
        releaseSummary.deliveryStance === deliveryStance
      ) {
        currentReleasePackage = latestReleasePackage;
      } else {
        reasons.push(
          `Latest release-package artifact ${latestReleasePackage.artifact.id} is stale for current local commit/reviewer/builder provenance`,
        );
      }

      if (
        !parsedReleasePackage.commitResultArtifactId ||
        !parsedReleasePackage.commitPackageArtifactId ||
        !parsedReleasePackage.sourceReviewerRunId ||
        !parsedReleasePackage.sourceBuilderRunId ||
        !parsedReleasePackage.preflightArtifactId ||
        !parsedReleasePackage.commitSha
      ) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} provenance is incomplete for close-out`,
        );
      }

      if (commitResultArtifact && parsedReleasePackage.commitResultArtifactId !== commitResultArtifact.id) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for commit-result ${commitResultArtifact.id}`,
        );
      }

      if (commitPackageArtifact && parsedReleasePackage.commitPackageArtifactId !== commitPackageArtifact.id) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for commit-package ${commitPackageArtifact.id}`,
        );
      }

      if (
        currentCommitBundle.reviewerRun &&
        parsedReleasePackage.sourceReviewerRunId !== currentCommitBundle.reviewerRun.id
      ) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for reviewer run ${currentCommitBundle.reviewerRun.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.builderRun &&
        parsedReleasePackage.sourceBuilderRunId !== currentCommitBundle.anchor.builderRun.id
      ) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for builder run ${currentCommitBundle.anchor.builderRun.id}`,
        );
      }

      if (
        currentCommitBundle.anchor?.preflightArtifact &&
        parsedReleasePackage.preflightArtifactId !== currentCommitBundle.anchor.preflightArtifact.id
      ) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for preflight ${currentCommitBundle.anchor.preflightArtifact.id}`,
        );
      }

      if (parsedCommitResult?.commitSha && parsedReleasePackage.commitSha !== parsedCommitResult.commitSha) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} is stale for commit sha ${parsedCommitResult.commitSha}`,
        );
      }

      if (parsedReleasePackage.deliveryStance !== deliveryStance) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} must keep delivery stance ${deliveryStance}`,
        );
      }

      if (parsedReleasePackage.localCommitBundleExecuted !== true) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} must record local commit bundle executed: yes`,
        );
      }

      if (
        parsedReleasePackage.pushExecuted !== false ||
        parsedReleasePackage.publishExecuted !== false ||
        parsedReleasePackage.externalReleaseExecuted !== false
      ) {
        reasons.push(
          `Release package artifact ${latestReleasePackage.artifact.id} must keep push, publish, and external release disabled`,
        );
      }

      if (
        releaseSummary.pushExecuted !== false ||
        releaseSummary.publishExecuted !== false ||
        releaseSummary.externalReleaseExecuted !== false
      ) {
        reasons.push(
          `Release-package run ${latestReleasePackage.run.id} must keep push, publish, and external release disabled`,
        );
      }
    }

    latestApprovedReleaseApproval =
      runtime
        .listApprovals({
          taskId: task.id,
          allowedNextAction: RELEASE_ACTION.RELEASE_READY,
          status: APPROVAL_STATUS.APPROVED,
        })
        .sort(compareRecordsByCreatedDesc)[0] || null;

    const approvalMatchesCurrentSource =
      Boolean(latestApprovedReleaseApproval) &&
      Boolean(currentReleasePackage?.artifact) &&
      Boolean(commitResultArtifact) &&
      Boolean(commitPackageArtifact) &&
      Boolean(currentCommitBundle.reviewerRun) &&
      Boolean(currentCommitBundle.anchor?.builderRun) &&
      Boolean(currentCommitBundle.anchor?.preflightArtifact) &&
      latestApprovedReleaseApproval.metadata?.releasePackageArtifactId === currentReleasePackage.artifact.id &&
      latestApprovedReleaseApproval.metadata?.commitResultArtifactId === commitResultArtifact.id &&
      latestApprovedReleaseApproval.metadata?.commitPackageArtifactId === commitPackageArtifact.id &&
      latestApprovedReleaseApproval.metadata?.sourceReviewerRunId === currentCommitBundle.reviewerRun.id &&
      latestApprovedReleaseApproval.metadata?.sourceBuilderRunId === currentCommitBundle.anchor.builderRun.id &&
      latestApprovedReleaseApproval.metadata?.targetPreflightArtifactId ===
        currentCommitBundle.anchor.preflightArtifact.id &&
      latestApprovedReleaseApproval.metadata?.commitSha === parsedCommitResult?.commitSha &&
      latestApprovedReleaseApproval.metadata?.deliveryStance === deliveryStance &&
      latestApprovedReleaseApproval.targetArtifactId === currentCommitBundle.anchor.preflightArtifact.id &&
      latestApprovedReleaseApproval.targetRunId === currentCommitBundle.anchor.preflightArtifact.runId;

    approvalStale = Boolean(latestApprovedReleaseApproval) && !approvalMatchesCurrentSource;

    if (!latestApprovedReleaseApproval) {
      reasons.push(`Latest approved ${RELEASE_ACTION.RELEASE_READY} approval is required before close-out for task ${task.id}`);
    } else if (approvalStale) {
      reasons.push(
        `latest approved approval ${latestApprovedReleaseApproval.id} for ${RELEASE_ACTION.RELEASE_READY} is stale for release-package ${currentReleasePackage?.artifact?.id || 'missing'}`,
      );
    }

    if (currentReleasePackage?.artifact) {
      existingCloseOutRun = findTerminalCloseOutRun(task, currentReleasePackage.artifact.id);
      existingCloseOutArtifact =
        existingCloseOutRun?.summary?.closeOutArtifactId
          ? runtime.getArtifact(existingCloseOutRun.summary.closeOutArtifactId)
          : null;

      if (existingCloseOutRun) {
        conflict = true;
        reasons.unshift(
          `Close-out run ${existingCloseOutRun.id} already completed for release-package ${currentReleasePackage.artifact.id}`,
        );
      }
    }

    return {
      commitPackageArtifact,
      commitResultArtifact,
      conflict,
      currentCommitBundle,
      currentReleasePackage,
      deliveryStance,
      existingCloseOutArtifact,
      existingCloseOutRun,
      latestApprovedReleaseApproval,
      latestCloseOut,
      latestReleasePackage,
      localCommitRun,
      parsedCommitResult,
      parsedReleasePackage,
      project,
      repoStatus,
      reviewArtifact: currentCommitBundle.reviewArtifact,
      reviewerRun: currentCommitBundle.reviewerRun,
      summary: buildCloseOutReadinessSummary({
        anchor: currentCommitBundle.anchor,
        approvalStale,
        commitPackageArtifact,
        commitResultArtifact,
        conflict,
        currentReleasePackage,
        deliveryStance,
        existingCloseOutArtifact,
        existingCloseOutRun,
        latestApprovedReleaseApproval,
        latestCloseOut,
        latestReleasePackage,
        parsedCommitResult,
        reasons,
        repoStatus,
        reviewArtifact: currentCommitBundle.reviewArtifact,
        reviewerRun: currentCommitBundle.reviewerRun,
      }),
      task,
    };
  }

  function getCloseOutReadiness(input) {
    return resolveCloseOutReadiness(input).summary;
  }

  function assertCloseOutReady(input) {
    const ready = resolveCloseOutReadiness(input);

    if (ready.summary.allowed) {
      return ready;
    }

    const error = new Error(ready.summary.reasons[0] || 'close-out is not ready');

    if (ready.summary.conflict) {
      error.statusCode = 409;
    }

    throw error;
  }

  function listCloseOutReadinessSummaries(input = {}) {
    const snapshot = runtime.getSnapshot();
    const summaries = {};

    for (const task of Object.values(snapshot.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getCloseOutReadiness({
        taskId: task.id,
      });
    }

    return summaries;
  }

  async function runPlanner(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    if (!input.routingOutcome || !input.routingOutcome.scopeStatement) {
      throw new Error('routingOutcome with scopeStatement is required');
    }

    let task = runtime.getTask(input.taskId);
    const readiness = assertExecutionEntryReady({
      stage: 'planner',
      taskId: task.id,
    });
    const project = runtime.getProject(task.projectId);
    const providerContext =
      readiness.providerSummary && readiness.providerSummary.allowed
        ? resolveProviderExecutionContext(project, 'planner')
        : assertProviderExecutionReady(project, 'planner');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, plannerPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildPlannerExecutionRequest({
      project,
      promptContract,
      routingOutcome: input.routingOutcome,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'planner',
      metadata: {
        promptPath: promptContract.path,
        routingClassification: request.routingOutcome.classification || 'unspecified',
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `planner run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built planner execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['architect', 'human gate'],
        defaultNextStage: 'architect',
        role: 'planner',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'plan',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved planner output artifact ${artifact.id}`,
      });

      if (normalizedResult.blockers.length > 0 || normalizedResult.needsDecision) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildPlannerDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created planner decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `planner execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runArchitect(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    let task = runtime.getTask(input.taskId);
    assertExecutionEntryReady({
      stage: 'architect',
      taskId: task.id,
    });
    const project = runtime.getProject(task.projectId);

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before architect run for task ${task.id}`);
    }

    if (!planArtifact.runId) {
      throw new Error(`Plan run id is required before architect run for task ${task.id}`);
    }

    const plannerRun = runtime.getRun(planArtifact.runId);
    const providerContext = assertProviderExecutionReady(project, 'architect');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, architectPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const codeContext = architectCodeContextPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildArchitectExecutionRequest({
      codeContext,
      planArtifact,
      planRunId: planArtifact.runId,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      codeContextPaths: architectCodeContextPaths,
      sourceOfTruthPaths,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'architect',
      metadata: {
        codeContextPaths: architectCodeContextPaths,
        inputArtifactId: planArtifact.id,
        inputRunId: planArtifact.runId,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `architect run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architect prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as architect input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built architect execution request with ${sourceOfTruth.length} source-of-truth files and ${codeContext.length} code-context files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['human gate', 'task-breaker'],
        defaultNextStage: 'task-breaker',
        role: 'architect',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'architecture',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved architecture note artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildArchitectDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created architect decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          decisionCreated: Boolean(decisionInboxItem),
          inputArtifactId: planArtifact.id,
          inputRunId: planArtifact.runId,
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        inputArtifact: planArtifact,
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `architect execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          inputArtifactId: planArtifact.id,
          inputRunId: planArtifact.runId,
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runTaskBreaker(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    runtime.assertTaskCanRunTaskBreaker({
      taskId: input.taskId,
    });

    let task = runtime.getTask(input.taskId);
    assertExecutionEntryReady({
      stage: 'taskBreaker',
      taskId: task.id,
    });
    const project = runtime.getProject(task.projectId);

    const {
      architectureArtifact,
      architectRun,
      planArtifact,
      plannerRun,
    } = resolveLatestTaskBreakerProvenance(runtime, task);
    const providerContext = assertProviderExecutionReady(project, 'task-breaker');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, taskBreakerPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildTaskBreakerExecutionRequest({
      architectureArtifact,
      architectureRunId: architectureArtifact.runId,
      architectRunSummary: architectRun?.summary || null,
      planArtifact,
      planRunId: planArtifact.runId,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruthPaths,
      sourceOfTruth,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'task-breaker',
      metadata: {
        architectureArtifactId: architectureArtifact.id,
        inputArtifactIds: [planArtifact.id, architectureArtifact.id],
        inputRunIds: [planArtifact.runId, architectureArtifact.runId],
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `task-breaker run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded task-breaker prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as task-breaker input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architecture artifact ${architectureArtifact.id} as task-breaker input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built task-breaker execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['builder', 'human gate'],
        defaultNextStage: 'builder',
        role: 'task-breaker',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'breakdown',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved breakdown artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildTaskBreakerDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created task-breaker decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          architectureArtifactId: architectureArtifact.id,
          architectureRunId: architectureArtifact.runId,
          decisionCreated: Boolean(decisionInboxItem),
          inputArtifactIds: [planArtifact.id, architectureArtifact.id],
          inputRunIds: [planArtifact.runId, architectureArtifact.runId],
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifact,
        architectureArtifact,
        decisionInboxItem,
        inputArtifacts: [planArtifact, architectureArtifact],
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `task-breaker execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          error: error.message,
          inputArtifactIds: [planArtifact.id, architectureArtifact.id],
          inputRunIds: [planArtifact.runId, architectureArtifact.runId],
          nextStage: null,
        },
      });

      throw error;
    }
  }

  async function runBuilderPreflight(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    let task = runtime.getTask(input.taskId);
    assertExecutionEntryReady({
      stage: 'builderPreflight',
      taskId: task.id,
    });
    const project = runtime.getProject(task.projectId);

    runtime.assertTaskCanRunBuilderPreflight({
      taskId: input.taskId,
    });
    const {
      architectureArtifact,
      architectRun,
      breakdownArtifact,
      planArtifact,
      plannerRun,
      taskBreakerRun,
    } = resolveLatestBuilderPreflightProvenance(runtime, task);
    const providerContext = assertProviderExecutionReady(project, 'builder-preflight');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);

    if (task.lifecycleState !== TASK_LIFECYCLE.IN_PROGRESS) {
      task = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.IN_PROGRESS,
      });
    }

    const promptContract = readContextFile(repoRoot, builderPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const architectureAllowlistPaths = parseMarkdownList(
      architectureArtifact.content,
      'Affected Components or Contracts',
    );

    if (architectureAllowlistPaths.length === 0) {
      throw new Error(
        `Architecture artifact ${architectureArtifact.id} affected components allowlist is required before builder preflight run for task ${task.id}`,
      );
    }

    const knowledgeWorkPack = project.pack === PACKS.KNOWLEDGE_WORK;
    const codeContextPaths = knowledgeWorkPack
      ? architectureAllowlistPaths
      : builderPreflightCodeContextPaths.filter((relativePath) =>
          architectureAllowlistPaths.includes(relativePath),
        );

    if (!knowledgeWorkPack && codeContextPaths.length === 0) {
      throw new Error(
        `Builder preflight code context allowlist resolved to zero files inside the approved architecture boundary for task ${task.id}`,
      );
    }

    const codeContext = codeContextPaths.map((relativePath) => {
      if (!knowledgeWorkPack) {
        return readContextFile(repoRoot, relativePath);
      }

      const filePath = resolveProjectFilePath(project.projectPath, relativePath);

      return {
        path: relativePath,
        content: fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '',
      };
    });
    const request = buildBuilderPreflightExecutionRequest({
      architectureArtifact,
      architectureAllowlistPaths,
      architectRunSummary: architectRun?.summary || null,
      breakdownArtifact,
      codeContext,
      codeContextPaths,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruthPaths,
      sourceOfTruth,
      task,
      taskBreakerRunSummary: taskBreakerRun?.summary || null,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'builder',
      metadata: {
        architectureAllowlistPaths,
        codeContextPaths,
        executionMode: 'preflight',
        inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
        inputRunIds: [planArtifact.runId, architectureArtifact.runId, breakdownArtifact.runId],
        mutationAllowed: false,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `builder preflight run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded builder prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded planner artifact ${planArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded architecture artifact ${architectureArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded breakdown artifact ${breakdownArtifact.id} as builder preflight input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built builder preflight execution request with ${sourceOfTruth.length} source-of-truth files and ${codeContext.length} code-context files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: [
          'request-builder-live-mutation-approval',
          'task-breaker',
          'architect',
          'human gate',
        ],
        defaultNextStage: 'request-builder-live-mutation-approval',
        role: 'builder-preflight',
      });
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'preflight',
        content: response.outputText,
      });
      let decisionInboxItem = null;

      runtime.appendLog({
        runId: run.id,
        message: `saved builder preflight artifact ${artifact.id}`,
      });

      if (shouldCreateBlockingDecision(normalizedResult)) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildBuilderDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created builder preflight decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          architectureArtifactId: architectureArtifact.id,
          architectureRunId: architectureArtifact.runId,
          breakdownArtifactId: breakdownArtifact.id,
          breakdownRunId: breakdownArtifact.runId,
          architectureAllowlistPaths,
          codeContextPaths,
          decisionCreated: Boolean(decisionInboxItem),
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          inputRunIds: [planArtifact.runId, architectureArtifact.runId, breakdownArtifact.runId],
          mutationAllowed: false,
          model: response.model,
          blockers: normalizedResult.blockers.length,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          planArtifactId: planArtifact.id,
          planRunId: planArtifact.runId,
          providerRunId: response.providerRunId,
          sourceOfTruthPaths,
        },
      });

      return {
        artifact,
        decisionInboxItem,
        inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact],
        nextStage: normalizedResult.nextStage,
        normalizedResult,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `builder preflight execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          architectureArtifactId: architectureArtifact.id,
          architectureRunId: architectureArtifact.runId,
          breakdownArtifactId: breakdownArtifact.id,
          breakdownRunId: breakdownArtifact.runId,
          error: error.message,
          inputRunIds: [planArtifact.runId, architectureArtifact.runId, breakdownArtifact.runId],
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          nextStage: null,
          planArtifactId: planArtifact.id,
          planRunId: planArtifact.runId,
        },
      });

      throw error;
    }
  }

  async function runBuilderLiveMutation(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    let run = null;
    let backupContents = null;
    let inputArtifactIds = [];
    let decisionInboxItem = null;

    const readyContext = await assertBuilderLiveMutationReady({
      taskId: input.taskId,
    });
    const task = readyContext.task;
    const project = readyContext.project;
    const approval = readyContext.approval;
    const {
      planArtifact,
      plannerRun,
      architectureArtifact,
      architectRun,
      breakdownArtifact,
      taskBreakerRun,
      preflightArtifact,
      preflightRun,
    } = resolveLatestBuilderLiveMutationProvenance(
      runtime,
      task,
      readyContext.preflightArtifact,
      readyContext.preflightRun,
    );

    if (approval.targetArtifactId !== preflightArtifact.id || approval.targetRunId !== preflightRun.id) {
      throw new Error(
        `Builder live mutation approval ${approval.id} must exactly match preflight ${preflightArtifact.id}`,
      );
    }

    const targetFiles = parseMarkdownList(preflightArtifact.content, 'Target Files');
    const architectureAllowlist = parseMarkdownList(
      architectureArtifact.content,
      'Affected Components or Contracts',
    );

    if (targetFiles.length === 0) {
      throw new Error(`Latest preflight ${preflightArtifact.id} target files are required`);
    }

    const targetFilesOutsideArchitecture = targetFiles.filter(
      (relativePath) => !architectureAllowlist.includes(relativePath),
    );

    if (targetFilesOutsideArchitecture.length > 0) {
      throw new Error(
        `Latest preflight ${preflightArtifact.id} target files exceed the approved architecture boundary: ${targetFilesOutsideArchitecture.join(', ')}`,
      );
    }

    inputArtifactIds = [
      planArtifact.id,
      architectureArtifact.id,
      breakdownArtifact.id,
      preflightArtifact.id,
    ];

    const providerContext = assertProviderExecutionReady(project, 'builder-live-mutation');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);
    const promptContract = readContextFile(repoRoot, builderPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const baselineTargetContents = captureFileContents(project.projectPath, targetFiles);
    const knowledgeWorkPack = project.pack === PACKS.KNOWLEDGE_WORK;

    if (!knowledgeWorkPack && [...baselineTargetContents.values()].some((content) => content === null)) {
      const missingFiles = [...baselineTargetContents.entries()]
        .filter(([, content]) => content === null)
        .map(([relativePath]) => relativePath);

      throw new Error(
        `Builder live mutation only supports existing files in this slice: ${missingFiles.join(', ')}`,
      );
    }

    const baselineTargetDigests = [...baselineTargetContents.entries()].map(
      ([relativePath, content]) => ({
        path: relativePath,
        digest: content === null ? null : computeContentDigest(content),
      }),
    );
    const codeContext = [...baselineTargetContents.entries()].map(([relativePath, content]) => ({
      path: relativePath,
      content: content === null ? '' : content,
    }));
    const request = buildBuilderLiveMutationExecutionRequest({
      anchor: {
        projectId: project.id,
        taskId: task.id,
        planArtifactId: planArtifact.id,
        planRunId: planArtifact.runId,
        architectureArtifactId: architectureArtifact.id,
        architectureRunId: architectureArtifact.runId,
        breakdownArtifactId: breakdownArtifact.id,
        breakdownRunId: breakdownArtifact.runId,
        preflightArtifactId: preflightArtifact.id,
        preflightRunId: preflightRun.id,
        approvalId: approval.id,
        approvalTargetArtifactId: approval.targetArtifactId,
        approvalTargetRunId: approval.targetRunId,
        sourceOfTruthPaths,
        architectureAllowlistPaths: architectureAllowlist,
        targetFileAllowlistPaths: targetFiles,
        codeContextPaths: targetFiles,
        targetFileBaselineDigests: baselineTargetDigests,
      },
      approval,
      architectureArtifact,
      architectRunSummary: architectRun?.summary || null,
      breakdownArtifact,
      codeContext,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      preflightArtifact,
      preflightRunSummary: preflightRun?.summary || null,
      project,
      promptContract,
      sourceOfTruth,
      task,
      taskBreakerRunSummary: taskBreakerRun?.summary || null,
    });

    run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'builder',
      metadata: {
        approvalId: approval.id,
        approvalTargetArtifactId: approval.targetArtifactId,
        approvalTargetRunId: approval.targetRunId,
        architectureAllowlistPaths: architectureAllowlist,
        codeContextPaths: targetFiles,
        executionMode: 'live-mutation',
        inputArtifactIds,
        mutationAllowed: true,
        preflightArtifactId: preflightArtifact.id,
        preflightRunId: preflightRun.id,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
        targetFileBaselineDigests: baselineTargetDigests,
        targetFiles,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `builder live mutation run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded builder prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded latest preflight artifact ${preflightArtifact.id} as builder live mutation input`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded approved live mutation approval ${approval.id} targeting preflight ${approval.targetArtifactId}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `validated ${targetFiles.length} preflight target files inside the approved architecture boundary`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `anchored builder live mutation input to approval ${approval.id} and preflight ${preflightArtifact.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `built builder live mutation execution request with ${sourceOfTruth.length} source-of-truth files and ${codeContext.length} code-context files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['reviewer', 'architect', 'human gate'],
        defaultNextStage: 'reviewer',
        role: 'builder',
      });

      if (normalizedResult.nextStage === 'architect') {
        const completedRun = runtime.completeRun({
          runId: run.id,
          summary: {
            adapter: response.adapterName,
            approvalId: approval.id,
            executionMode: 'live-mutation',
            inputArtifactIds,
            model: response.model,
            mutationAllowed: true,
            nextStage: normalizedResult.nextStage,
            preflightArtifactId: preflightArtifact.id,
            preflightRunId: preflightRun.id,
            providerRunId: response.providerRunId,
          },
        });

        return {
          artifacts: {},
          changedFiles: [],
          decisionInboxItem: null,
          inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact, preflightArtifact],
          normalizedResult,
          run: completedRun,
        };
      }

      if (normalizedResult.nextStage === 'human gate') {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildBuilderLiveMutationDecisionInput(task, normalizedResult),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created builder live mutation decision inbox item ${decisionInboxItem.id}`,
        });

        const completedRun = runtime.completeRun({
          runId: run.id,
          summary: {
            adapter: response.adapterName,
            approvalId: approval.id,
            decisionCreated: true,
            executionMode: 'live-mutation',
            inputArtifactIds,
            model: response.model,
            mutationAllowed: true,
            nextStage: normalizedResult.nextStage,
            preflightArtifactId: preflightArtifact.id,
            preflightRunId: preflightRun.id,
            providerRunId: response.providerRunId,
          },
        });

        return {
          artifacts: {},
          changedFiles: [],
          decisionInboxItem,
          inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact, preflightArtifact],
          normalizedResult,
          run: completedRun,
        };
      }

      const fileUpdates = parseBase64FileUpdates(response.outputText);
      const updatedFiles = fileUpdates.map((fileUpdate) => fileUpdate.path);
      const outOfScopeFiles = updatedFiles.filter((relativePath) => !targetFiles.includes(relativePath));
      const outsideArchitectureFiles = updatedFiles.filter(
        (relativePath) => !architectureAllowlist.includes(relativePath),
      );

      if (outOfScopeFiles.length > 0) {
        throw new Error(
          `Builder live mutation attempted to update files outside the latest preflight target files: ${outOfScopeFiles.join(', ')}`,
        );
      }

      if (outsideArchitectureFiles.length > 0) {
        throw new Error(
          `Builder live mutation attempted to update files outside the approved architecture boundary: ${outsideArchitectureFiles.join(', ')}`,
        );
      }

      if (normalizedResult.blockers.length > 0 || normalizedResult.needsDecision) {
        throw new Error(
          `Builder live mutation must stop before file writes: ${normalizedResult.blockers.join('; ') || normalizedResult.summary || 'provider requested follow-up'}`,
        );
      }

      if (fileUpdates.length === 0) {
        throw new Error('Builder live mutation returned no bounded file updates');
      }

      const currentTargetDigests = captureFileDigests(project.projectPath, targetFiles);

      if (!sameExactDigestEntries(currentTargetDigests, baselineTargetDigests)) {
        throw new Error(
          `Builder live mutation baseline drift detected for preflight ${preflightArtifact.id}; rerun builder preflight before live mutation`,
        );
      }

      backupContents = captureFileContents(project.projectPath, updatedFiles);
      const plannedAfterContents = new Map(fileUpdates.map((fileUpdate) => [fileUpdate.path, fileUpdate.content]));
      const patchText = buildCombinedDiff(updatedFiles, backupContents, plannedAfterContents);

      if (!patchText.trim()) {
        throw new Error('Builder live mutation produced no patch after validation');
      }

      for (const fileUpdate of fileUpdates) {
        const filePath = resolveProjectFilePath(project.projectPath, fileUpdate.path);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, fileUpdate.content);
      }

      const afterTargetContents = captureFileContents(project.projectPath, targetFiles);
      const actualChangedFiles = targetFiles.filter(
        (relativePath) => baselineTargetContents.get(relativePath) !== afterTargetContents.get(relativePath),
      );

      if (!sameStringSets(actualChangedFiles, updatedFiles)) {
        restoreFileContents(project.projectPath, backupContents);
        throw new Error(
          `Actual changed files do not match the validated file updates. expected=${updatedFiles.join(', ')} actual=${actualChangedFiles.join(', ')}`,
        );
      }

      const diffText = buildCombinedDiff(actualChangedFiles, baselineTargetContents, afterTargetContents);
      const finalized = runtime.finalizeBuilderLiveMutationSuccess({
        approvalId: approval.id,
        artifacts: [
          {
            content: response.outputText,
            type: 'change-summary',
          },
          {
            content: patchText,
            extension: 'patch',
            type: 'patch',
          },
          {
            content: diffText,
            extension: 'diff',
            type: 'diff',
          },
        ],
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          approvalId: approval.id,
          approvalTargetArtifactId: approval.targetArtifactId,
          approvalTargetRunId: approval.targetRunId,
          changedFiles: actualChangedFiles,
          executionMode: 'live-mutation',
          inputArtifactIds,
          model: response.model,
          mutationAllowed: true,
          nextStage: normalizedResult.nextStage,
          preflightArtifactId: preflightArtifact.id,
          preflightRunId: preflightRun.id,
          providerRunId: response.providerRunId,
          targetFiles,
        },
      });

      return {
        artifacts: finalized.artifacts,
        changedFiles: actualChangedFiles,
        decisionInboxItem: null,
        inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact, preflightArtifact],
        normalizedResult,
        run: finalized.run,
      };
    } catch (error) {
      if (backupContents) {
        restoreFileContents(project.projectPath, backupContents);
      }

      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `builder live mutation execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: approval.id,
          error: error.message,
          executionMode: 'live-mutation',
          inputArtifactIds,
          nextStage: null,
          preflightArtifactId: preflightArtifact.id,
        },
      });

      throw error;
    }
  }

  async function runReviewer(input) {
    const readyContext = assertReviewerReady(input);
    let task = readyContext.task;
    const project = readyContext.project;
    const builderRun = readyContext.builderRun;
    const approval = readyContext.approval;
    const providerContext = assertProviderExecutionReady(project, 'reviewer');
    const sourceOfTruthPaths = resolveSourceOfTruthPaths(project);
    const promptContract = readContextFile(repoRoot, reviewerPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const reviewGate = runtime.openReviewGate({
      taskId: task.id,
    });
    const inputArtifacts = [
      readyContext.planArtifact,
      readyContext.architectureArtifact,
      readyContext.breakdownArtifact,
      readyContext.preflightArtifact,
      readyContext.changeSummaryArtifact,
      readyContext.patchArtifact,
      readyContext.diffArtifact,
    ];

    task = runtime.getTask(task.id);

    const request = buildReviewerExecutionRequest({
      approval,
      architectureArtifact: readyContext.architectureArtifact,
      breakdownArtifact: readyContext.breakdownArtifact,
      builderLogs: readyContext.builderLogs,
      builderRun,
      changedFiles: readyContext.changedFiles,
      changeSummaryArtifact: readyContext.changeSummaryArtifact,
      diffArtifact: readyContext.diffArtifact,
      patchArtifact: readyContext.patchArtifact,
      planArtifact: readyContext.planArtifact,
      preflightArtifact: readyContext.preflightArtifact,
      project,
      promptContract,
      sourceOfTruth,
      sourceOfTruthPaths,
      task,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'reviewer',
      metadata: {
        approvalId: approval.id,
        inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
        promptPath: promptContract.path,
        sourceOfTruthPaths,
        sourceRunId: builderRun.id,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `reviewer run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded reviewer prompt contract from ${promptContract.path}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `anchored reviewer input to builder live mutation run ${builderRun.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded builder bundle artifacts ${inputArtifacts.map((artifact) => artifact.id).join(', ')}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded ${readyContext.builderLogs.length} builder log records as reviewer evidence`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerContext.adapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerContext.adapter, request, providerContext);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['builder', 'architect', 'human gate'],
        defaultNextStage: 'builder',
        role: 'reviewer',
      });
      const parsedReview = parseReviewerArtifactContent(response.outputText);
      const mappedReviewStatus = mapReviewerVerdictToReviewStatus(parsedReview.verdict);
      const createDecision = shouldCreateReviewerDecision(parsedReview, normalizedResult);
      let decisionInboxItem = null;

      assertReviewerArtifactMatchesBundle(parsedReview, readyContext);
      assertReviewerFollowUpMatchesNormalizedResult(parsedReview, normalizedResult);

      const reviewArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'review',
        content: response.outputText,
      });

      runtime.appendLog({
        runId: run.id,
        message: `saved reviewer artifact ${reviewArtifact.id}`,
      });

      runtime.resolveReview({
        taskId: task.id,
        itemId: reviewGate.reviewItem.id,
        action: mappedReviewStatus,
        note: buildReviewerResolutionNote(parsedReview, reviewArtifact),
        verificationArtifactIds: [],
      });

      if (createDecision) {
        decisionInboxItem = runtime.createDecisionInboxItem({
          taskId: task.id,
          ...buildReviewerDecisionInput(task, parsedReview, normalizedResult, reviewArtifact),
        });

        runtime.appendLog({
          runId: run.id,
          message: `created reviewer decision inbox item ${decisionInboxItem.id}`,
        });
      }

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          approvalId: approval.id,
          decisionCreated: Boolean(decisionInboxItem),
          evidenceCount: parsedReview.evidence.length,
          findingsCount: parsedReview.findings.length,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          mappedReviewStatus,
          model: response.model,
          nextStage: normalizedResult.nextStage,
          preflightArtifactId: readyContext.preflightArtifact.id,
          providerRunId: response.providerRunId,
          rawVerdict: parsedReview.verdict,
          reviewArtifactId: reviewArtifact.id,
          sourceRunId: builderRun.id,
          terminal: true,
        },
      });

      return {
        artifact: reviewArtifact,
        builderRun,
        decisionInboxItem,
        inputArtifacts,
        normalizedResult,
        parsedReview,
        review: runtime.getTask(task.id).review,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `reviewer execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: approval.id,
          error: error.message,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          nextStage: null,
          sourceRunId: builderRun.id,
        },
      });

      throw error;
    }
  }

  async function runQaWorkOrder(input) {
    if (!input?.taskId || !input.executionPlanId || !input.workOrderId) {
      throw new Error('taskId, executionPlanId, and workOrderId are required');
    }

    const task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw new Error('QA WorkOrder supports local-stub projects only');
    }

    const run = runtime.startRun({
      taskId: task.id,
      kind: 'verification',
      role: 'qa',
      metadata: {
        executionMode: 'shell-free-node-check',
        executionPlanId: input.executionPlanId,
        workOrderId: input.workOrderId,
        builderRunId: input.builderRunId,
        reviewerRunId: input.reviewerRunId,
        sourceDigest: input.sourceDigest,
      },
    });

    runtime.appendLog({
      runId: run.id,
      message: `QA node-check run started for WorkOrder ${input.workOrderId}`,
    });

    try {
      const result = await qaNodeCheckRunner({
        projectRoot: project.projectPath,
        changedFiles: input.changedFiles,
        targetPathAllowlist: input.targetPathAllowlist,
        commands: input.commands,
      });
      const evidence = {
        schemaVersion: 1,
        executionPlanId: input.executionPlanId,
        workOrderId: input.workOrderId,
        builderRunId: input.builderRunId,
        reviewerRunId: input.reviewerRunId,
        sourceDigest: input.sourceDigest,
        changedFiles: result.changedFiles,
        checks: result.checks,
        mutationDetected: result.mutationDetected,
        reasons: result.reasons,
        verdict: result.verdict,
        createdAt: new Date().toISOString(),
      };
      const artifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'qa-evidence',
        extension: 'json',
        content: `${JSON.stringify(evidence, null, 2)}\n`,
      });
      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          executionMode: 'shell-free-node-check',
          executionPlanId: input.executionPlanId,
          workOrderId: input.workOrderId,
          builderRunId: input.builderRunId,
          reviewerRunId: input.reviewerRunId,
          qaEvidenceArtifactId: artifact.id,
          checkCount: evidence.checks.length,
          mutationDetected: evidence.mutationDetected,
          verdict: evidence.verdict,
          terminal: true,
        },
      });

      return { artifact, evidence, run: completedRun };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `QA node-check execution failed: ${error.message}`,
      });
      runtime.completeRun({
        runId: run.id,
        summary: {
          executionMode: 'shell-free-node-check',
          executionPlanId: input.executionPlanId,
          workOrderId: input.workOrderId,
          error: error.message,
          terminal: true,
        },
      });
      throw error;
    }
  }

  async function runCommitPackage(input) {
    const readyContext = assertCommitPackageReady(input);
    const task = readyContext.task;
    const reviewArtifact = readyContext.reviewArtifact;
    const reviewerRun = readyContext.reviewerRun;
    const commitMessage = buildDefaultCommitMessage(task);
    const inputArtifacts = [
      readyContext.anchor.planArtifact,
      readyContext.anchor.architectureArtifact,
      readyContext.anchor.breakdownArtifact,
      readyContext.anchor.preflightArtifact,
      readyContext.anchor.changeSummaryArtifact,
      readyContext.anchor.patchArtifact,
      readyContext.anchor.diffArtifact,
      reviewArtifact,
    ];
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'system',
      role: 'commit-packager',
      metadata: {
        inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
        sourceBuilderRunId: readyContext.anchor.builderRun.id,
        sourceReviewerRunId: reviewerRun.id,
        targetPreflightArtifactId: readyContext.anchor.preflightArtifact.id,
      },
    });
    let commitPackageArtifact = readyContext.currentCommitPackage?.artifact || null;
    let reusedCommitPackageArtifact = false;

    runtime.appendLog({
      runId: run.id,
      message: `commit-package run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `anchored commit-package input to reviewer run ${reviewerRun.id} and builder run ${readyContext.anchor.builderRun.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded commit-package bundle artifacts ${inputArtifacts.map((artifact) => artifact.id).join(', ')}`,
    });

    try {
      if (commitPackageArtifact) {
        const currentCommitPackage = parseCommitPackageArtifactContent(commitPackageArtifact.content);

        if (!currentCommitPackage.commitMessage) {
          runtime.appendLog({
            runId: run.id,
            message: `current commit-package artifact ${commitPackageArtifact.id} is missing Commit Message; regenerating`,
          });
          commitPackageArtifact = null;
        } else {
          reusedCommitPackageArtifact = true;
          runtime.appendLog({
            runId: run.id,
            message: `reusing current commit-package artifact ${commitPackageArtifact.id} for source reviewer run ${reviewerRun.id}`,
          });
        }
      } else {
        commitPackageArtifact = runtime.recordArtifact({
          taskId: task.id,
          runId: run.id,
          type: 'commit-package',
          content: renderCommitPackageArtifact({
            architectureArtifact: readyContext.anchor.architectureArtifact,
            breakdownArtifact: readyContext.anchor.breakdownArtifact,
            builderApproval: readyContext.anchor.approval,
            builderLogs: readyContext.anchor.builderLogs,
            builderRun: readyContext.anchor.builderRun,
            changeSummaryArtifact: readyContext.anchor.changeSummaryArtifact,
            commitMessage,
            diffArtifact: readyContext.anchor.diffArtifact,
            patchArtifact: readyContext.anchor.patchArtifact,
            planArtifact: readyContext.anchor.planArtifact,
            preflightArtifact: readyContext.anchor.preflightArtifact,
            reviewArtifact,
            reviewerRun,
            task,
          }),
        });

        runtime.appendLog({
          runId: run.id,
          message: `saved commit-package artifact ${commitPackageArtifact.id}`,
        });
      }

      if (!commitPackageArtifact) {
        commitPackageArtifact = runtime.recordArtifact({
          taskId: task.id,
          runId: run.id,
          type: 'commit-package',
          content: renderCommitPackageArtifact({
            architectureArtifact: readyContext.anchor.architectureArtifact,
            breakdownArtifact: readyContext.anchor.breakdownArtifact,
            builderApproval: readyContext.anchor.approval,
            builderLogs: readyContext.anchor.builderLogs,
            builderRun: readyContext.anchor.builderRun,
            changeSummaryArtifact: readyContext.anchor.changeSummaryArtifact,
            commitMessage,
            diffArtifact: readyContext.anchor.diffArtifact,
            patchArtifact: readyContext.anchor.patchArtifact,
            planArtifact: readyContext.anchor.planArtifact,
            preflightArtifact: readyContext.anchor.preflightArtifact,
            reviewArtifact,
            reviewerRun,
            task,
          }),
        });

        runtime.appendLog({
          runId: run.id,
          message: `saved commit-package artifact ${commitPackageArtifact.id}`,
        });
      }

      const approvalMetadata = {
        commitPackageArtifactId: commitPackageArtifact.id,
        sourceBuilderRunId: readyContext.anchor.builderRun.id,
        sourceReviewerRunId: reviewerRun.id,
        targetPreflightArtifactId: readyContext.anchor.preflightArtifact.id,
      };
      const approval = runtime.createApprovalPlaceholder({
        taskId: task.id,
        scope: 'commit',
        allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
        targetArtifactId: readyContext.anchor.preflightArtifact.id,
        targetRunId: readyContext.anchor.preflightArtifact.runId,
        title: buildCommitApprovalTitle(approvalMetadata),
        prompt: buildCommitApprovalPrompt(approvalMetadata),
        metadata: approvalMetadata,
      });

      runtime.appendLog({
        runId: run.id,
        message: `created commit approval placeholder ${approval.id} for commit-package artifact ${commitPackageArtifact.id}`,
      });
      runtime.appendLog({
        runId: run.id,
        message: 'actual git commit, merge, and release remained disabled',
      });

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: approval.id,
          commitPackageArtifactId: commitPackageArtifact.id,
          executionMode: 'commit-package',
          gitCommitExecuted: false,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          mergeExecuted: false,
          nextStage: 'human gate',
          pushExecuted: false,
          releaseExecuted: false,
          reusedCommitPackageArtifact,
          sourceBuilderRunId: readyContext.anchor.builderRun.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: readyContext.anchor.preflightArtifact.id,
          targetPreflightRunId: readyContext.anchor.preflightArtifact.runId,
        },
      });

      return {
        approval,
        artifact: commitPackageArtifact,
        inboxItem: runtime.getDecisionInboxItem(approval.inboxItemId),
        inputArtifacts,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `commit-package execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          commitPackageArtifactId: commitPackageArtifact?.id || null,
          error: error.message,
          executionMode: 'commit-package',
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          nextStage: null,
          pushExecuted: false,
          sourceBuilderRunId: readyContext.anchor.builderRun.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: readyContext.anchor.preflightArtifact.id,
          targetPreflightRunId: readyContext.anchor.preflightArtifact.runId,
        },
      });

      throw error;
    }
  }

  async function runLocalCommit(input) {
    const readyContext = assertLocalCommitReady(input);
    const task = readyContext.task;
    const project = readyContext.project;
    const commitPackageArtifact = readyContext.commitPackageArtifact;
    const commitApproval = readyContext.latestApproval;
    const parsedCommitPackage = readyContext.parsedCommitPackage;
    const reviewArtifact = readyContext.ready.reviewArtifact;
    const reviewerRun = readyContext.ready.reviewerRun;
    const anchor = readyContext.ready.anchor;
    const inputArtifacts = [
      anchor.planArtifact,
      anchor.architectureArtifact,
      anchor.breakdownArtifact,
      anchor.preflightArtifact,
      anchor.changeSummaryArtifact,
      anchor.patchArtifact,
      anchor.diffArtifact,
      reviewArtifact,
      commitPackageArtifact,
    ];
    const scopeFiles = parsedCommitPackage.changedFiles;
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'system',
      role: 'commit-executor',
      metadata: {
        approvalId: commitApproval.id,
        commitPackageArtifactId: commitPackageArtifact.id,
        executionMode: 'local-commit',
        inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
        sourceBuilderRunId: anchor.builderRun.id,
        sourceReviewerRunId: reviewerRun.id,
        targetPreflightArtifactId: anchor.preflightArtifact.id,
      },
    });
    let commitResultArtifact = null;
    let commitSha = null;
    let repoStatusAfterAdd = null;

    runtime.appendLog({
      runId: run.id,
      message: `local commit run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `validated latest commit-package ${commitPackageArtifact.id} and approved commit approval ${commitApproval.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `validated exact repo dirty/staged/untracked set match for scope ${scopeFiles.join(', ')}`,
    });

    const messageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-commit-message-'));
    const messagePath = path.join(messageDir, 'COMMIT_EDITMSG');

    try {
      fs.writeFileSync(messagePath, `${parsedCommitPackage.commitMessage}\n`, 'utf8');

      const headBefore = runGit(project.projectPath, ['rev-parse', 'HEAD']).trim();

      runGit(project.projectPath, ['add', '-A', '--', ...scopeFiles]);
      repoStatusAfterAdd = collectRepoChangeSet(project.projectPath);

      if (
        !sameStringSets(repoStatusAfterAdd.stagedFiles, scopeFiles) ||
        repoStatusAfterAdd.dirtyFiles.length > 0 ||
        repoStatusAfterAdd.untrackedFiles.length > 0
      ) {
        throw new Error(
          `git add -A did not produce an exact staged scope match. staged=${repoStatusAfterAdd.stagedFiles.join(', ') || 'none'} dirty=${repoStatusAfterAdd.dirtyFiles.join(', ') || 'none'} untracked=${repoStatusAfterAdd.untrackedFiles.join(', ') || 'none'}`,
        );
      }

      runtime.appendLog({
        runId: run.id,
        message: `staged exact commit scope with git add -A -- ${scopeFiles.join(' ')}`,
      });

      runGit(project.projectPath, ['commit', '-F', messagePath]);
      commitSha = runGit(project.projectPath, ['rev-parse', 'HEAD']).trim();

      if (!commitSha || commitSha === headBefore) {
        throw new Error('git commit did not create a new commit');
      }

      const committedFiles = parseGitPathLines(
        runGit(project.projectPath, ['diff-tree', '--no-commit-id', '--name-only', '-r', commitSha]),
      );

      if (!sameStringSets(committedFiles, scopeFiles)) {
        throw new Error(
          `Committed files do not match commit-package scope. expected=${scopeFiles.join(', ')} actual=${committedFiles.join(', ') || 'none'}`,
        );
      }

      const repoStatusAfterCommit = collectRepoChangeSet(project.projectPath);

      if (repoStatusAfterCommit.allFiles.length > 0) {
        throw new Error(
          `Repo must be clean after local commit execution. remaining=${repoStatusAfterCommit.allFiles.join(', ')}`,
        );
      }

      runtime.appendLog({
        runId: run.id,
        message: `created local git commit ${commitSha} for scope ${committedFiles.join(', ')}`,
      });

      commitResultArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'commit-result',
        content: renderCommitResultArtifact({
          builderApproval: anchor.approval,
          builderRun: anchor.builderRun,
          commitApproval,
          commitMessage: parsedCommitPackage.commitMessage,
          commitPackageArtifact,
          commitSha,
          committedFiles,
          preflightArtifact: anchor.preflightArtifact,
          repoStatusAfterAdd,
          repoStatusBefore: readyContext.repoStatusBefore,
          reviewArtifact,
          reviewerRun,
          scopeFiles,
          task,
        }),
      });

      runtime.appendLog({
        runId: run.id,
        message: `saved commit-result artifact ${commitResultArtifact.id}`,
      });
      runtime.appendLog({
        runId: run.id,
        message: 'actual push, merge, and release remained disabled',
      });

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: commitApproval.id,
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact.id,
          commitSha,
          committedFiles,
          executionMode: 'local-commit',
          gitCommitExecuted: true,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          mergeExecuted: false,
          nextStage: null,
          pushExecuted: false,
          releaseExecuted: false,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      return {
        artifact: commitResultArtifact,
        approval: commitApproval,
        commitSha,
        committedFiles,
        inputArtifacts,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `local commit execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: commitApproval.id,
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact?.id || null,
          commitSha,
          error: error.message,
          executionMode: 'local-commit',
          gitCommitExecuted: Boolean(commitSha),
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          mergeExecuted: false,
          nextStage: null,
          pushExecuted: false,
          releaseExecuted: false,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      throw error;
    } finally {
      fs.rmSync(messageDir, { recursive: true, force: true });
    }
  }

  async function runReleasePackage(input) {
    const readyContext = assertReleasePackageReady(input);
    const task = readyContext.task;
    const project = readyContext.project || runtime.getProject(task.projectId);
    const currentCommitBundle = readyContext.currentCommitBundle;
    const commitPackageArtifact = readyContext.commitPackageArtifact;
    const commitResultArtifact = readyContext.commitResultArtifact;
    const parsedCommitResult = readyContext.parsedCommitResult;
    const parsedCommitPackage = parseCommitPackageArtifactContent(commitPackageArtifact.content);
    const reviewArtifact = currentCommitBundle.reviewArtifact;
    const reviewerRun = currentCommitBundle.reviewerRun;
    const anchor = currentCommitBundle.anchor;
    const inputArtifacts = [
      anchor.planArtifact,
      anchor.architectureArtifact,
      anchor.breakdownArtifact,
      anchor.preflightArtifact,
      anchor.changeSummaryArtifact,
      anchor.patchArtifact,
      anchor.diffArtifact,
      reviewArtifact,
      commitPackageArtifact,
      commitResultArtifact,
    ];

    assertDedicatedLinkedWorktreeReady({
      actionLabel: 'release-package',
      projectPath: project.projectPath,
      worktreeRef: task.worktreeRef,
    });

    const run = runtime.startRun({
      taskId: task.id,
      kind: 'system',
      role: 'release-packager',
      metadata: {
        commitPackageArtifactId: commitPackageArtifact.id,
        commitResultArtifactId: commitResultArtifact.id,
        deliveryStance: readyContext.deliveryStance,
        executionMode: 'release-package',
        inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
        sourceBuilderRunId: anchor.builderRun.id,
        sourceReviewerRunId: reviewerRun.id,
        targetPreflightArtifactId: anchor.preflightArtifact.id,
      },
    });
    let releasePackageArtifact = readyContext.currentReleasePackage?.artifact || null;
    let reusedReleasePackageArtifact = false;

    runtime.appendLog({
      runId: run.id,
      message: `release-package run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `anchored release-package input to local commit bundle ${commitResultArtifact.id} (${parsedCommitResult.commitSha})`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `loaded release-package bundle artifacts ${inputArtifacts.map((artifact) => artifact.id).join(', ')}`,
    });

    try {
      if (releasePackageArtifact) {
        const currentReleasePackage = parseReleasePackageArtifactContent(releasePackageArtifact.content);

        if (
          !currentReleasePackage.commitResultArtifactId ||
          !currentReleasePackage.commitPackageArtifactId ||
          !currentReleasePackage.sourceReviewerRunId ||
          !currentReleasePackage.sourceBuilderRunId ||
          !currentReleasePackage.preflightArtifactId ||
          !currentReleasePackage.commitSha ||
          currentReleasePackage.deliveryStance !== readyContext.deliveryStance
        ) {
          runtime.appendLog({
            runId: run.id,
            message: `current release-package artifact ${releasePackageArtifact.id} is incomplete; regenerating`,
          });
          releasePackageArtifact = null;
        } else {
          reusedReleasePackageArtifact = true;
          runtime.appendLog({
            runId: run.id,
            message: `reusing current release-package artifact ${releasePackageArtifact.id} for commit-result ${commitResultArtifact.id}`,
          });
        }
      }

      if (!releasePackageArtifact) {
        releasePackageArtifact = runtime.recordArtifact({
          taskId: task.id,
          runId: run.id,
          type: 'release-package',
          content: renderReleasePackageArtifact({
            architectureArtifact: anchor.architectureArtifact,
            breakdownArtifact: anchor.breakdownArtifact,
            builderApproval: anchor.approval,
            builderRun: anchor.builderRun,
            changeSummaryArtifact: anchor.changeSummaryArtifact,
            commitApproval: runtime.getApproval(parsedCommitResult.commitApprovalId),
            commitMessage: parsedCommitResult.commitMessage || parsedCommitPackage.commitMessage || 'none',
            commitPackageArtifact,
            commitResultArtifact,
            commitSha: parsedCommitResult.commitSha,
            committedFiles:
              parsedCommitResult.committedFiles.length > 0
                ? parsedCommitResult.committedFiles
                : parsedCommitPackage.changedFiles,
            deliveryStance: readyContext.deliveryStance,
            diffArtifact: anchor.diffArtifact,
            patchArtifact: anchor.patchArtifact,
            planArtifact: anchor.planArtifact,
            preflightArtifact: anchor.preflightArtifact,
            reviewArtifact,
            reviewerRun,
            task,
          }),
        });

        runtime.appendLog({
          runId: run.id,
          message: `saved release-package artifact ${releasePackageArtifact.id}`,
        });
      }

      const approvalMetadata = {
        releasePackageArtifactId: releasePackageArtifact.id,
        commitResultArtifactId: commitResultArtifact.id,
        commitPackageArtifactId: commitPackageArtifact.id,
        sourceReviewerRunId: reviewerRun.id,
        sourceBuilderRunId: anchor.builderRun.id,
        targetPreflightArtifactId: anchor.preflightArtifact.id,
        commitSha: parsedCommitResult.commitSha,
        deliveryStance: readyContext.deliveryStance,
      };
      const approval = runtime.createApprovalPlaceholder({
        taskId: task.id,
        scope: 'release',
        allowedNextAction: RELEASE_ACTION.RELEASE_READY,
        targetArtifactId: anchor.preflightArtifact.id,
        targetRunId: anchor.preflightArtifact.runId,
        title: buildReleaseApprovalTitle(approvalMetadata),
        prompt: buildReleaseApprovalPrompt(approvalMetadata),
        metadata: approvalMetadata,
      });

      runtime.appendLog({
        runId: run.id,
        message: `created release approval placeholder ${approval.id} for release-package artifact ${releasePackageArtifact.id}`,
      });
      runtime.appendLog({
        runId: run.id,
        message: 'actual push, publish, and external release remained disabled',
      });

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          approvalId: approval.id,
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact.id,
          commitSha: parsedCommitResult.commitSha,
          deliveryStance: readyContext.deliveryStance,
          executionMode: 'release-package',
          externalReleaseExecuted: false,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          nextStage: 'human gate',
          publishExecuted: false,
          pushExecuted: false,
          releaseExecuted: false,
          releasePackageArtifactId: releasePackageArtifact.id,
          reusedReleasePackageArtifact,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceCommitPackageArtifactId: commitPackageArtifact.id,
          sourceCommitResultArtifactId: commitResultArtifact.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      return {
        approval,
        artifact: releasePackageArtifact,
        inboxItem: runtime.getDecisionInboxItem(approval.inboxItemId),
        inputArtifacts,
        run: completedRun,
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `release-package execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact.id,
          commitSha: parsedCommitResult.commitSha,
          deliveryStance: readyContext.deliveryStance,
          error: error.message,
          executionMode: 'release-package',
          externalReleaseExecuted: false,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          nextStage: null,
          publishExecuted: false,
          pushExecuted: false,
          releaseExecuted: false,
          releasePackageArtifactId: releasePackageArtifact?.id || null,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceCommitPackageArtifactId: commitPackageArtifact.id,
          sourceCommitResultArtifactId: commitResultArtifact.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      throw error;
    }
  }

  async function runCloseOut(input) {
    const readyContext = assertCloseOutReady(input);
    const task = readyContext.task;
    const project = readyContext.project || runtime.getProject(task.projectId);
    const commitPackageArtifact = readyContext.commitPackageArtifact;
    const commitResultArtifact = readyContext.commitResultArtifact;
    const releasePackageArtifact = readyContext.currentReleasePackage.artifact;
    const releaseApproval = readyContext.latestApprovedReleaseApproval;
    const reviewArtifact = readyContext.reviewArtifact;
    const reviewerRun = readyContext.reviewerRun;
    const anchor = readyContext.currentCommitBundle.anchor;
    const inputArtifacts = [
      anchor.planArtifact,
      anchor.architectureArtifact,
      anchor.breakdownArtifact,
      anchor.preflightArtifact,
      anchor.changeSummaryArtifact,
      anchor.patchArtifact,
      anchor.diffArtifact,
      reviewArtifact,
      commitPackageArtifact,
      commitResultArtifact,
      releasePackageArtifact,
    ];

    assertDedicatedLinkedWorktreeReady({
      actionLabel: 'close-out',
      projectPath: project.projectPath,
      worktreeRef: task.worktreeRef,
    });

    const run = runtime.startRun({
      taskId: task.id,
      kind: 'system',
      role: 'close-out',
      metadata: {
        commitPackageArtifactId: commitPackageArtifact.id,
        commitResultArtifactId: commitResultArtifact.id,
        deliveryStance: readyContext.deliveryStance,
        executionMode: 'close-out',
        inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
        sourceBuilderRunId: anchor.builderRun.id,
        sourceReleaseApprovalId: releaseApproval.id,
        sourceReleasePackageArtifactId: releasePackageArtifact.id,
        sourceReviewerRunId: reviewerRun.id,
        targetPreflightArtifactId: anchor.preflightArtifact.id,
      },
    });
    const lifecycleStateBefore = task.lifecycleState;
    const closedOutAt = new Date().toISOString();
    let closeOutArtifact = null;

    runtime.appendLog({
      runId: run.id,
      message: `close-out run started for task ${task.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `validated approved release-ready approval ${releaseApproval.id} for release-package ${releasePackageArtifact.id}`,
    });
    runtime.appendLog({
      runId: run.id,
      message: `validated clean repo state before close-out: dirty=${readyContext.repoStatus.dirtyFiles.length} staged=${readyContext.repoStatus.stagedFiles.length} untracked=${readyContext.repoStatus.untrackedFiles.length}`,
    });

    try {
      closeOutArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'close-out',
        content: renderCloseOutArtifact({
          architectureArtifact: anchor.architectureArtifact,
          breakdownArtifact: anchor.breakdownArtifact,
          builderApproval: anchor.approval,
          builderRun: anchor.builderRun,
          changeSummaryArtifact: anchor.changeSummaryArtifact,
          closedOutAt,
          commitPackageArtifact,
          commitResultArtifact,
          commitSha: readyContext.parsedCommitResult.commitSha,
          deliveryStance: readyContext.deliveryStance,
          diffArtifact: anchor.diffArtifact,
          lifecycleStateBefore,
          patchArtifact: anchor.patchArtifact,
          planArtifact: anchor.planArtifact,
          preflightArtifact: anchor.preflightArtifact,
          releaseApproval,
          releasePackageArtifact,
          repoStatus: readyContext.repoStatus,
          reviewArtifact,
          reviewerRun,
          run,
          task,
        }),
      });

      runtime.appendLog({
        runId: run.id,
        message: `saved close-out artifact ${closeOutArtifact.id}`,
      });

      const transitionedTask = runtime.transitionTaskLifecycle({
        taskId: task.id,
        to: TASK_LIFECYCLE.DONE,
      });

      runtime.appendLog({
        runId: run.id,
        message: `transitioned task ${task.id} from ${lifecycleStateBefore} to ${transitionedTask.lifecycleState}`,
      });

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          closeOutArtifactId: closeOutArtifact.id,
          closedOutAt,
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact.id,
          commitSha: readyContext.parsedCommitResult.commitSha,
          deliveryStance: readyContext.deliveryStance,
          executionMode: 'close-out',
          externalReleaseExecuted: false,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          lifecycleTransition: 'Review -> Done',
          nextStage: null,
          publishExecuted: false,
          pushExecuted: false,
          repoClean: true,
          repoDirtyFileCount: readyContext.repoStatus.dirtyFiles.length,
          repoStagedFileCount: readyContext.repoStatus.stagedFiles.length,
          repoUntrackedFileCount: readyContext.repoStatus.untrackedFiles.length,
          sourceBuilderApprovalId: anchor.approval?.id || null,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceCommitPackageArtifactId: commitPackageArtifact.id,
          sourceCommitResultArtifactId: commitResultArtifact.id,
          sourceReleaseApprovalId: releaseApproval.id,
          sourceReleasePackageArtifactId: releasePackageArtifact.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      return {
        artifact: closeOutArtifact,
        inputArtifacts,
        run: completedRun,
        task: runtime.getTask(task.id),
      };
    } catch (error) {
      runtime.appendLog({
        runId: run.id,
        level: 'error',
        message: `close-out execution failed: ${error.message}`,
      });

      runtime.completeRun({
        runId: run.id,
        summary: {
          closeOutArtifactId: closeOutArtifact?.id || null,
          commitPackageArtifactId: commitPackageArtifact.id,
          commitResultArtifactId: commitResultArtifact.id,
          commitSha: readyContext.parsedCommitResult.commitSha,
          deliveryStance: readyContext.deliveryStance,
          error: error.message,
          executionMode: 'close-out',
          externalReleaseExecuted: false,
          inputArtifactIds: inputArtifacts.map((artifact) => artifact.id),
          lifecycleTransition: null,
          nextStage: null,
          publishExecuted: false,
          pushExecuted: false,
          repoClean: false,
          repoDirtyFileCount: readyContext.repoStatus?.dirtyFiles?.length ?? null,
          repoStagedFileCount: readyContext.repoStatus?.stagedFiles?.length ?? null,
          repoUntrackedFileCount: readyContext.repoStatus?.untrackedFiles?.length ?? null,
          sourceBuilderApprovalId: anchor.approval?.id || null,
          sourceBuilderRunId: anchor.builderRun.id,
          sourceCommitPackageArtifactId: commitPackageArtifact.id,
          sourceCommitResultArtifactId: commitResultArtifact.id,
          sourceReleaseApprovalId: releaseApproval.id,
          sourceReleasePackageArtifactId: releasePackageArtifact.id,
          sourceReviewArtifactId: reviewArtifact.id,
          sourceReviewerRunId: reviewerRun.id,
          targetPreflightArtifactId: anchor.preflightArtifact.id,
          targetPreflightRunId: anchor.preflightArtifact.runId,
        },
      });

      throw error;
    }
  }

  return {
    assertBuilderLiveMutationReady,
    assertCloseOutReady,
    assertCommitPackageReady,
    assertReleasePackageReady,
    assertReviewerReady,
    getCloseOutReadiness,
    getCommitExecutionReadiness,
    getCommitPackageReadiness,
    getExecutionEntryReadiness,
    getProviderExecutionReadiness,
    getReleasePackageReadiness,
    getReviewerReadiness,
    listCloseOutReadinessSummaries,
    listCommitExecutionReadinessSummaries,
    listCommitPackageReadinessSummaries,
    listExecutionEntryReadinessSummaries,
    listProviderExecutionReadinessSummaries,
    listReleasePackageReadinessSummaries,
    listReviewerReadinessSummaries,
    runArchitect,
    runBuilderLiveMutation,
    runBuilderPreflight,
    runCloseOut,
    runCommitPackage,
    runLocalCommit,
    runReleasePackage,
    runPlanner,
    runQaWorkOrder,
    runReviewer,
    runTaskBreaker,
  };
}

module.exports = {
  createExecutionCoordinator,
};
// builder-live-mutation approval-0001 src/execution/execution-coordinator.js
// builder-live-mutation approval-0002 src/execution/execution-coordinator.js
// builder-live-mutation approval-0003 src/execution/execution-coordinator.js
// builder-live-mutation approval-0004 src/execution/execution-coordinator.js
