'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { executeWithAdapter } = require('./provider-adapter');
const { createLocalStubProviderAdapter } = require('./providers/local-stub-adapter');
const {
  APPROVAL_STATUS,
  COMMIT_ACTION,
  RELEASE_ACTION,
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
const DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];

function toExecutionTask(task) {
  return {
    id: task.id,
    title: task.title,
    intent: task.intent,
    lifecycleState: task.lifecycleState,
    flags: task.flags,
    review: task.review,
    worktreeRef: task.worktreeRef,
  };
}

function toExecutionProject(project) {
  return {
    id: project.id,
    name: project.name,
    projectPath: project.projectPath,
    pack: project.pack,
  };
}

function toExecutionArtifact(artifact) {
  return {
    id: artifact.id,
    runId: artifact.runId,
    type: artifact.type,
    createdAt: artifact.createdAt,
    content: artifact.content,
  };
}

function readContextFile(repoRoot, relativePath) {
  const filePath = path.join(repoRoot, relativePath);

  return {
    path: relativePath,
    content: fs.readFileSync(filePath, 'utf8'),
  };
}

function buildPlannerExecutionRequest(input) {
  return {
    role: 'planner',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    routingOutcome: {
      classification: input.routingOutcome.classification,
      scopeStatement: input.routingOutcome.scopeStatement,
      missingContext: input.routingOutcome.missingContext || [],
      decisionNote: input.routingOutcome.decisionNote || '',
    },
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'plan',
  };
}

function buildArchitectExecutionRequest(input) {
  return {
    role: 'architect',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    codeContext: input.codeContext,
    expectedArtifactType: 'architecture',
  };
}

function buildTaskBreakerExecutionRequest(input) {
  return {
    role: 'task-breaker',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'breakdown',
  };
}

function buildBuilderPreflightExecutionRequest(input) {
  return {
    role: 'builder',
    executionMode: 'preflight',
    mutationAllowed: false,
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    taskBreakerRunSummary: input.taskBreakerRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'preflight',
  };
}

function buildBuilderLiveMutationExecutionRequest(input) {
  return {
    role: 'builder',
    executionMode: 'live-mutation',
    mutationAllowed: true,
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    preflightArtifact: toExecutionArtifact(input.preflightArtifact),
    approval: {
      id: input.approval.id,
      status: input.approval.status,
      targetArtifactId: input.approval.targetArtifactId,
      targetRunId: input.approval.targetRunId,
    },
    plannerRunSummary: input.plannerRunSummary || null,
    architectRunSummary: input.architectRunSummary || null,
    taskBreakerRunSummary: input.taskBreakerRunSummary || null,
    preflightRunSummary: input.preflightRunSummary || null,
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'change-summary',
  };
}

function buildReviewerExecutionRequest(input) {
  return {
    role: 'reviewer',
    task: toExecutionTask(input.task),
    project: toExecutionProject(input.project),
    builderRun: {
      id: input.builderRun.id,
      summary: input.builderRun.summary || null,
      startedAt: input.builderRun.startedAt,
      finishedAt: input.builderRun.finishedAt,
    },
    approval: input.approval
      ? {
          id: input.approval.id,
          status: input.approval.status,
          targetArtifactId: input.approval.targetArtifactId,
          targetRunId: input.approval.targetRunId,
        }
      : null,
    planArtifact: toExecutionArtifact(input.planArtifact),
    architectureArtifact: toExecutionArtifact(input.architectureArtifact),
    breakdownArtifact: toExecutionArtifact(input.breakdownArtifact),
    preflightArtifact: toExecutionArtifact(input.preflightArtifact),
    changeSummaryArtifact: toExecutionArtifact(input.changeSummaryArtifact),
    patchArtifact: toExecutionArtifact(input.patchArtifact),
    diffArtifact: toExecutionArtifact(input.diffArtifact),
    builderLogs: input.builderLogs || [],
    promptContract: input.promptContract,
    sourceOfTruth: input.sourceOfTruth,
    expectedArtifactType: 'review',
  };
}

function getMarkdownSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^## ${escapedHeading}\\n([\\s\\S]*?)(?=^## [^\\n]+\\n|(?![\\s\\S]))`,
    'm',
  );
  const match = String(content || '').match(pattern);

  return match ? match[1].trim() : '';
}

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function parseMarkdownList(content, heading) {
  return [
    ...new Set(
      getMarkdownSection(content, heading)
        .split('\n')
        .map((line) => line.replace(/^[-*]\s+/, '').trim())
        .map((line) => normalizeRelativePath(line))
        .filter(Boolean),
    ),
  ];
}

function parseMarkdownKeyValueLines(content) {
  const result = {};

  for (const line of String(content || '').split('\n')) {
    const normalizedLine = line.replace(/^[-*]\s+/, '').trim();
    const separatorIndex = normalizedLine.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim().toLowerCase();
    const value = normalizedLine.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function parseYesNoValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'yes') {
    return true;
  }

  if (normalized === 'no') {
    return false;
  }

  return null;
}

function parseBase64FileUpdates(content) {
  const section = getMarkdownSection(content, 'File Updates');
  const fileUpdates = [];

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

    fileUpdates.push({
      path: relativePath,
      content: Buffer.from(fenceMatch[1].replace(/\s+/g, ''), 'base64').toString('utf8'),
    });
  }

  return fileUpdates;
}

function resolveProjectFilePath(projectPath, relativePath) {
  const resolvedProjectPath = path.resolve(projectPath);
  const filePath = path.resolve(resolvedProjectPath, relativePath);

  if (filePath !== resolvedProjectPath && !filePath.startsWith(`${resolvedProjectPath}${path.sep}`)) {
    throw new Error(`Resolved file path escapes project_path: ${relativePath}`);
  }

  return filePath;
}

function captureFileContents(projectPath, relativePaths) {
  const contents = new Map();

  for (const relativePath of [...new Set(relativePaths)]) {
    const filePath = resolveProjectFilePath(projectPath, relativePath);

    contents.set(relativePath, fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null);
  }

  return contents;
}

function restoreFileContents(projectPath, fileContents) {
  for (const [relativePath, content] of fileContents.entries()) {
    const filePath = resolveProjectFilePath(projectPath, relativePath);

    if (content === null) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
      }
      continue;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
}

function buildUnifiedDiff(relativePath, beforeContent, afterContent) {
  if ((beforeContent || '') === (afterContent || '')) {
    return '';
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-live-mutation-'));
  const beforePath = path.join(tempDir, 'before');
  const afterPath = path.join(tempDir, 'after');

  fs.writeFileSync(beforePath, beforeContent || '', 'utf8');
  fs.writeFileSync(afterPath, afterContent || '', 'utf8');

  try {
    let diffOutput = '';

    try {
      diffOutput = execFileSync(
        'git',
        ['diff', '--no-index', '--no-ext-diff', '--', beforePath, afterPath],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
    } catch (error) {
      if (error.status !== 1) {
        throw error;
      }

      diffOutput = String(error.stdout || '');
    }

    return diffOutput
      .replaceAll(beforePath, `a/${relativePath}`)
      .replaceAll(afterPath, `b/${relativePath}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function buildCombinedDiff(relativePaths, beforeContents, afterContents) {
  return relativePaths
    .map((relativePath) =>
      buildUnifiedDiff(
        relativePath,
        beforeContents.get(relativePath) || '',
        afterContents.get(relativePath) || '',
      ),
    )
    .filter(Boolean)
    .join('\n');
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

function normalizeRoleResult(result, options = {}) {
  const normalizedResult = result && typeof result === 'object' ? result : {};
  const blockers = Array.isArray(normalizedResult.blockers)
    ? normalizedResult.blockers.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  const needsDecision = Boolean(normalizedResult.needsDecision);
  const defaultNextStage = options.defaultNextStage || 'architect';
  const allowedNextStages = Array.isArray(options.allowedNextStages)
    ? options.allowedNextStages
    : null;
  const nextStage =
    normalizedResult.nextStage || (blockers.length > 0 || needsDecision ? 'human gate' : defaultNextStage);

  if (allowedNextStages && !allowedNextStages.includes(nextStage)) {
    throw new Error(`Unsupported nextStage for ${options.role || 'role'}: ${nextStage}`);
  }

  return {
    blockers,
    needsDecision,
    nextStage,
    summary: normalizedResult.summary || '',
    decisionTitle: normalizedResult.decisionTitle || '',
    decisionPrompt: normalizedResult.decisionPrompt || '',
  };
}

function buildPlannerDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- planner output requires a human decision before architect handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Planner follow-up: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Planner output requires human follow-up before architect handoff.',
    blocksTask: normalizedResult.blockers.length > 0,
  };
}

function buildArchitectDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- architect output requires a human decision before task-breaker handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Architecture decision: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Architect output requires human follow-up before task-breaker handoff.',
    blocksTask: true,
  };
}

function buildTaskBreakerDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- task-breaker output requires a human decision before builder handoff');
  }

  return {
    title: normalizedResult.decisionTitle || `Breakdown decision: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Task-breaker output requires human follow-up before builder handoff.',
    blocksTask: true,
  };
}

function buildBuilderDecisionInput(task, normalizedResult) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (normalizedResult.needsDecision && normalizedResult.blockers.length === 0) {
    lines.push('- builder preflight requires a human decision before any live execution');
  }

  return {
    title: normalizedResult.decisionTitle || `Builder preflight risk: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      'Builder preflight requires human follow-up before any live execution.',
    blocksTask: true,
  };
}

function buildReviewerDecisionInput(task, parsedReview, normalizedResult, reviewArtifact) {
  const lines = [];

  if (normalizedResult.summary) {
    lines.push(normalizedResult.summary);
  }

  if (parsedReview.findings.length > 0) {
    lines.push(...parsedReview.findings.map((finding) => `- ${finding}`));
  }

  if (normalizedResult.blockers.length > 0) {
    lines.push(...normalizedResult.blockers.map((blocker) => `- ${blocker}`));
  }

  if (parsedReview.decisionRequired && lines.length === 0) {
    lines.push(`- review artifact ${reviewArtifact.id} requires a human decision`);
  }

  return {
    title: normalizedResult.decisionTitle || `Review follow-up: ${task.title}`,
    prompt:
      normalizedResult.decisionPrompt ||
      lines.join('\n') ||
      `Review artifact ${reviewArtifact.id} requires a human decision before work may proceed.`,
    blocksTask: Boolean(parsedReview.blockingIssue || normalizedResult.blockers.length > 0),
    sourceId: reviewArtifact.id,
    sourceType: 'review',
  };
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

function findLatestBuilderLiveMutationRun(runtime, task) {
  const snapshot = runtime.getSnapshot();

  return (
    Object.values(snapshot.runs)
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
        const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : null;

        return (
          run.taskId === task.id &&
          run.role === 'builder' &&
          (summary?.executionMode === 'live-mutation' ||
            metadata?.executionMode === 'live-mutation')
        );
      })
      .sort(compareRunsByStartedDesc)[0] || null
  );
}

function resolveReviewerAnchorBundle(runtime, task) {
  const builderRun = findLatestBuilderLiveMutationRun(runtime, task);

  if (!builderRun) {
    throw new Error(`Latest builder live mutation run is required before reviewer run for task ${task.id}`);
  }

  const summary = builderRun.summary && typeof builderRun.summary === 'object' ? builderRun.summary : {};
  const artifactIds = summary.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : {};
  const inputArtifactIds = Array.isArray(summary.inputArtifactIds) ? summary.inputArtifactIds : [];

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

  const inputArtifacts = inputArtifactIds.map((artifactId) => runtime.getArtifact(artifactId));
  const planArtifact = inputArtifacts.find((artifact) => artifact.type === 'plan') || null;
  const architectureArtifact =
    inputArtifacts.find((artifact) => artifact.type === 'architecture') || null;
  const breakdownArtifact = inputArtifacts.find((artifact) => artifact.type === 'breakdown') || null;

  if (!planArtifact || !architectureArtifact || !breakdownArtifact) {
    throw new Error(`Builder live mutation run ${builderRun.id} input bundle is incomplete`);
  }

  return {
    approval: runtime.getApproval(summary.approvalId),
    architectureArtifact,
    breakdownArtifact,
    builderLogs: runtime.getLogs(builderRun.id),
    builderRun,
    changeSummaryArtifact: runtime.getArtifact(artifactIds.changeSummary),
    diffArtifact: runtime.getArtifact(artifactIds.diff),
    inputArtifacts,
    patchArtifact: runtime.getArtifact(artifactIds.patch),
    planArtifact,
    preflightArtifact: runtime.getArtifact(summary.preflightArtifactId),
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
          summary?.reviewArtifactId
        );
      })
      .sort(compareRunsByStartedDesc)[0] || null
  );
}

function parseReviewerArtifactContent(content) {
  const verdictValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Review Verdict'));
  const followUpValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Follow-Up Gate'));
  const verdict = String(verdictValues.verdict || '').trim().toLowerCase();

  if (!['pass', 'fail', 'changes_requested'].includes(verdict)) {
    throw new Error('Reviewer artifact verdict must be pass, fail, or changes_requested');
  }

  return {
    blockingIssue: parseYesNoValue(followUpValues['blocking issue']) === true,
    changeSummaryArtifactId: verdictValues['change-summary artifact'] || null,
    contractCompliance: parseMarkdownList(content, 'Contract Compliance'),
    decisionRequired: parseYesNoValue(followUpValues['decision required']) === true,
    diffArtifactId: verdictValues['diff artifact'] || null,
    evidence: parseMarkdownList(content, 'Evidence Reviewed'),
    findings: parseMarkdownList(content, 'Findings'),
    nextAction: parseMarkdownList(content, 'Next Action')[0] || null,
    patchArtifactId: verdictValues['patch artifact'] || null,
    preflightArtifactId: verdictValues['preflight artifact'] || null,
    sourceBuilderRunId: verdictValues['source builder run'] || null,
    verificationEvidence: parseMarkdownList(content, 'Verification Evidence'),
    verdict,
  };
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
    diffArtifactId: anchor?.diffArtifact?.id || null,
    existingReviewArtifactId: existingReviewerSummary?.reviewArtifactId || null,
    existingReviewerRunId: existingReviewerRun?.id || null,
    patchArtifactId: anchor?.patchArtifact?.id || null,
    preflightArtifactId: anchor?.preflightArtifact?.id || null,
    reasons,
    sourceBuilderRunId: anchor?.builderRun?.id || null,
  };
}

function buildDefaultCommitMessage(task) {
  return [task?.id, String(task?.title || task?.intent || 'local commit').replace(/\s+/g, ' ').trim()]
    .filter(Boolean)
    .join(': ');
}

function parseCommitPackageArtifactContent(content) {
  const sourceReviewerValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Reviewer Bundle'));
  const sourceBuilderValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Builder Bundle'));
  const verificationValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Verification Evidence'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Execution Safety'));
  const commitMessage = getMarkdownSection(content, 'Commit Message').trim();

  return {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    builderLiveMutationApprovalId: sourceReviewerValues['builder live mutation approval'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    changedFiles: parseMarkdownList(content, 'Changed Files'),
    commitMessage: commitMessage || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceReviewerValues['target preflight artifact'] || null,
    reviewArtifactId: sourceReviewerValues['review artifact'] || null,
    reviewerMappedStatus: verificationValues['reviewer mapped status'] || null,
    reviewerRawVerdict: verificationValues['reviewer raw verdict'] || null,
    sourceBuilderRunId: sourceReviewerValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewerValues['source reviewer run'] || null,
  };
}

function parseCommitResultArtifactContent(content) {
  const sourceValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Commit Package'));
  const commitValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Commit'));
  const validationValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Validation'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Safety'));

  return {
    commitApprovalId: sourceValues['commit approval'] || null,
    commitMessage: commitValues['commit message'] || null,
    commitPackageArtifactId: sourceValues['source commit-package artifact'] || null,
    commitSha: commitValues['commit sha'] || null,
    committedFiles: parseMarkdownList(content, 'Committed Files'),
    committedFilesMatchedScope: parseYesNoValue(validationValues['committed files matched scope']),
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    preflightArtifactId: sourceValues['target preflight artifact'] || null,
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    reviewArtifactId: sourceValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceValues['source builder approval'] || null,
    sourceBuilderRunId: sourceValues['source builder run'] || null,
    sourceReviewerRunId: sourceValues['source reviewer run'] || null,
  };
}

function parseReleasePackageArtifactContent(content) {
  const sourceCommitValues = parseMarkdownKeyValueLines(
    getMarkdownSection(content, 'Source Local Commit Bundle'),
  );
  const sourceBuilderValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Source Builder Bundle'));
  const releaseCandidateValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Release Candidate'));
  const safetyValues = parseMarkdownKeyValueLines(getMarkdownSection(content, 'Execution Safety'));

  return {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    commitApprovalId: sourceCommitValues['commit approval'] || null,
    commitMessage: releaseCandidateValues['commit message'] || null,
    commitPackageArtifactId: sourceCommitValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceCommitValues['source commit-result artifact'] || null,
    commitSha: releaseCandidateValues['commit sha'] || null,
    committedFiles: parseMarkdownList(content, 'Committed Files'),
    deliveryStance: releaseCandidateValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    externalReleaseExecuted: parseYesNoValue(safetyValues['external release executed']),
    localCommitBundleExecuted: parseYesNoValue(safetyValues['local commit bundle executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceCommitValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(safetyValues['publish executed']),
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    reviewArtifactId: sourceCommitValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceCommitValues['source builder approval'] || null,
    sourceBuilderRunId: sourceCommitValues['source builder run'] || null,
    sourceReviewerRunId: sourceCommitValues['source reviewer run'] || null,
  };
}

function parseGitPathLines(output) {
  return [
    ...new Set(
      String(output || '')
        .split('\n')
        .map((line) => normalizeRelativePath(line.trim()))
        .filter(Boolean),
    ),
  ];
}

function runGit(projectPath, args) {
  try {
    return execFileSync('git', args, {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = String(error.stderr || '').trim();
    const stdout = String(error.stdout || '').trim();
    const detail = stderr || stdout || error.message;

    throw new Error(`git ${args.join(' ')} failed: ${detail}`);
  }
}

function collectRepoChangeSet(projectPath) {
  const dirtyFiles = parseGitPathLines(runGit(projectPath, ['diff', '--name-only']));
  const stagedFiles = parseGitPathLines(runGit(projectPath, ['diff', '--cached', '--name-only']));
  const untrackedFiles = parseGitPathLines(
    runGit(projectPath, ['ls-files', '--others', '--exclude-standard']),
  );

  return {
    allFiles: [...new Set([...dirtyFiles, ...stagedFiles, ...untrackedFiles])],
    dirtyFiles,
    stagedFiles,
    untrackedFiles,
  };
}

function ensureGitCommitEnvironment(projectPath) {
  const insideWorkTree = runGit(projectPath, ['rev-parse', '--is-inside-work-tree']).trim();

  if (insideWorkTree !== 'true') {
    throw new Error(`project_path is not a git worktree: ${projectPath}`);
  }

  runGit(projectPath, ['rev-parse', '--verify', 'HEAD']);
  runGit(projectPath, ['config', '--get', 'user.name']);
  runGit(projectPath, ['config', '--get', 'user.email']);
}

function buildCommitApprovalTitle(metadata) {
  return `Approval required: ${COMMIT_ACTION.COMMIT_INTENT} | commitPackageArtifactId=${metadata.commitPackageArtifactId} | sourceReviewerRunId=${metadata.sourceReviewerRunId} | sourceBuilderRunId=${metadata.sourceBuilderRunId} | targetPreflightArtifactId=${metadata.targetPreflightArtifactId}`;
}

function buildCommitApprovalPrompt(metadata) {
  return [
    `Approval required before ${COMMIT_ACTION.COMMIT_INTENT}.`,
    `commitPackageArtifactId: ${metadata.commitPackageArtifactId}`,
    `sourceReviewerRunId: ${metadata.sourceReviewerRunId}`,
    `sourceBuilderRunId: ${metadata.sourceBuilderRunId}`,
    `targetPreflightArtifactId: ${metadata.targetPreflightArtifactId}`,
  ].join('\n');
}

function buildReleaseApprovalTitle(metadata) {
  return `Approval required: ${RELEASE_ACTION.RELEASE_READY} | releasePackageArtifactId=${metadata.releasePackageArtifactId} | commitResultArtifactId=${metadata.commitResultArtifactId} | commitPackageArtifactId=${metadata.commitPackageArtifactId} | sourceReviewerRunId=${metadata.sourceReviewerRunId} | sourceBuilderRunId=${metadata.sourceBuilderRunId} | targetPreflightArtifactId=${metadata.targetPreflightArtifactId} | commitSha=${metadata.commitSha} | deliveryStance=${metadata.deliveryStance}`;
}

function buildReleaseApprovalPrompt(metadata) {
  return [
    `Approval required before ${RELEASE_ACTION.RELEASE_READY}.`,
    `releasePackageArtifactId: ${metadata.releasePackageArtifactId}`,
    `commitResultArtifactId: ${metadata.commitResultArtifactId}`,
    `commitPackageArtifactId: ${metadata.commitPackageArtifactId}`,
    `sourceReviewerRunId: ${metadata.sourceReviewerRunId}`,
    `sourceBuilderRunId: ${metadata.sourceBuilderRunId}`,
    `targetPreflightArtifactId: ${metadata.targetPreflightArtifactId}`,
    `commitSha: ${metadata.commitSha}`,
    `deliveryStance: ${metadata.deliveryStance}`,
  ].join('\n');
}

function renderMarkdownList(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function renderCommitPackageArtifact(input) {
  const changedFiles = Array.isArray(input.builderRun.summary?.changedFiles)
    ? input.builderRun.summary.changedFiles
    : [];
  const commitMessage = String(input.commitMessage || '').trim();

  return `# Commit Package: ${input.task.title}

## Source Reviewer Bundle
- source reviewer run: ${input.reviewerRun.id}
- review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- builder live mutation approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Source Builder Bundle
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Commit Message
${commitMessage}

## Changed Files
${renderMarkdownList(changedFiles, 'none')}

## Verification Evidence
- reviewer mapped status: passed
- reviewer raw verdict: pass
- review artifact: ${input.reviewArtifact.id}
- diff artifact: ${input.diffArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- builder logs reviewed: ${input.builderLogs.length}

## Execution Safety
- git commit executed: no
- push executed: no
- merge executed: no
- release executed: no
`;
}

function renderCommitResultArtifact(input) {
  return `# Commit Result: ${input.task.title}

## Source Commit Package
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit approval: ${input.commitApproval.id}
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Commit
- commit sha: ${input.commitSha}
- commit message: ${input.commitMessage}

## Committed Files
${renderMarkdownList(input.committedFiles, 'none')}

## Validation
- scope file count: ${input.scopeFiles.length}
- repo changed file count before commit: ${input.repoStatusBefore.allFiles.length}
- dirty file count before commit: ${input.repoStatusBefore.dirtyFiles.length}
- staged file count before commit: ${input.repoStatusBefore.stagedFiles.length}
- untracked file count before commit: ${input.repoStatusBefore.untrackedFiles.length}
- staged file count after git add: ${input.repoStatusAfterAdd.stagedFiles.length}
- dirty file count after git add: ${input.repoStatusAfterAdd.dirtyFiles.length}
- untracked file count after git add: ${input.repoStatusAfterAdd.untrackedFiles.length}
- committed files matched scope: yes
- repo clean after commit: yes

## Safety
- git commit executed: yes
- push executed: no
- merge executed: no
- release executed: no
`;
}

function renderReleasePackageArtifact(input) {
  return `# Release Package: ${input.task.title}

## Source Local Commit Bundle
- source commit-result artifact: ${input.commitResultArtifact.id}
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit approval: ${input.commitApproval.id}
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}

## Source Builder Bundle
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Release Candidate
- commit sha: ${input.commitSha}
- commit message: ${input.commitMessage}
- delivery stance: ${input.deliveryStance}

## Committed Files
${renderMarkdownList(input.committedFiles, 'none')}

## Human Gate
- release approval required: yes
- allowed next action: ${RELEASE_ACTION.RELEASE_READY}

## Execution Safety
- local commit bundle executed: yes
- push executed: no
- publish executed: no
- external release executed: no
`;
}

function renderCloseOutArtifact(input) {
  return `# Close-Out: ${input.task.title}

## Done Transition
- source release approval: ${input.releaseApproval.id}
- source release-package artifact: ${input.releasePackageArtifact.id}
- close-out run: ${input.run.id}
- closed out at: ${input.closedOutAt}
- lifecycle transition: Review -> Done
- task lifecycle before close-out: ${input.lifecycleStateBefore}
- task lifecycle after close-out: Done

## Source Release Bundle
- source release-package artifact: ${input.releasePackageArtifact.id}
- source commit-result artifact: ${input.commitResultArtifact.id}
- source commit-package artifact: ${input.commitPackageArtifact.id}
- commit sha: ${input.commitSha}
- delivery stance: ${input.deliveryStance}

## Source Review Bundle
- source reviewer run: ${input.reviewerRun.id}
- source review artifact: ${input.reviewArtifact.id}
- reviewer mapped status: ${input.reviewerRun.summary?.mappedReviewStatus || 'unknown'}
- reviewer raw verdict: ${input.reviewerRun.summary?.rawVerdict || 'unknown'}

## Source Builder Bundle
- source builder run: ${input.builderRun.id}
- source builder approval: ${input.builderApproval?.id || 'none'}
- target preflight artifact: ${input.preflightArtifact.id}
- plan artifact: ${input.planArtifact.id}
- architecture artifact: ${input.architectureArtifact.id}
- breakdown artifact: ${input.breakdownArtifact.id}
- change-summary artifact: ${input.changeSummaryArtifact.id}
- patch artifact: ${input.patchArtifact.id}
- diff artifact: ${input.diffArtifact.id}

## Worktree Verification
- repo clean before close-out: yes
- dirty file count: ${input.repoStatus.dirtyFiles.length}
- staged file count: ${input.repoStatus.stagedFiles.length}
- untracked file count: ${input.repoStatus.untrackedFiles.length}

## Release Safety
- push executed: no
- publish executed: no
- external release executed: no
`;
}

function createExecutionCoordinator(options = {}) {
  if (!options.runtimeService) {
    throw new Error('runtimeService is required');
  }

  const runtime = options.runtimeService;
  const repoRoot = path.resolve(options.repoRoot || process.cwd());
  const providerAdapter = options.providerAdapter || createLocalStubProviderAdapter();
  const plannerPromptPath = options.plannerPromptPath || 'prompts/planner.md';
  const architectPromptPath = options.architectPromptPath || 'prompts/architect.md';
  const taskBreakerPromptPath = options.taskBreakerPromptPath || 'prompts/task-breaker.md';
  const builderPromptPath = options.builderPromptPath || 'prompts/builder.md';
  const reviewerPromptPath = options.reviewerPromptPath || 'prompts/reviewer.md';
  const sourceOfTruthPaths = options.sourceOfTruthPaths || DEFAULT_SOURCE_OF_TRUTH_PATHS;
  const architectCodeContextPaths =
    options.architectCodeContextPaths || DEFAULT_ARCHITECT_CODE_CONTEXT_PATHS;

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
        reasons,
        reviewArtifact: currentCommitBundle.reviewArtifact,
        reviewerRun: currentCommitBundle.reviewerRun,
      }),
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
      try {
        ensureGitCommitEnvironment(project.projectPath);
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
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

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
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
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
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before architect run for task ${task.id}`);
    }

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;

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
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
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
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
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
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');
    const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before task-breaker run for task ${task.id}`);
    }

    if (!architectureArtifact) {
      throw new Error(
        `Architecture artifact is required before task-breaker run for task ${task.id}`,
      );
    }

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;
    const architectRun = architectureArtifact.runId ? runtime.getRun(architectureArtifact.runId) : null;

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
      architectRunSummary: architectRun?.summary || null,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
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
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
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
          decisionCreated: Boolean(decisionInboxItem),
          inputArtifactIds: [planArtifact.id, architectureArtifact.id],
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
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');
    const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');
    const breakdownArtifact = findLatestTaskArtifact(runtime, task, 'breakdown');

    if (!planArtifact) {
      throw new Error(`Plan artifact is required before builder preflight run for task ${task.id}`);
    }

    if (!architectureArtifact) {
      throw new Error(
        `Architecture artifact is required before builder preflight run for task ${task.id}`,
      );
    }

    if (!breakdownArtifact) {
      throw new Error(
        `Breakdown artifact is required before builder preflight run for task ${task.id}`,
      );
    }

    runtime.assertTaskCanRunBuilderPreflight({
      taskId: input.taskId,
    });

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;
    const architectRun = architectureArtifact.runId ? runtime.getRun(architectureArtifact.runId) : null;
    const taskBreakerRun = breakdownArtifact.runId ? runtime.getRun(breakdownArtifact.runId) : null;

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
    const request = buildBuilderPreflightExecutionRequest({
      architectureArtifact,
      architectRunSummary: architectRun?.summary || null,
      breakdownArtifact,
      planArtifact,
      plannerRunSummary: plannerRun?.summary || null,
      project,
      promptContract,
      sourceOfTruth,
      task,
      taskBreakerRunSummary: taskBreakerRun?.summary || null,
    });
    const run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'builder',
      metadata: {
        executionMode: 'preflight',
        inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
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
      message: `built builder preflight execution request with ${sourceOfTruth.length} source-of-truth files`,
    });

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['reviewer', 'task-breaker', 'architect', 'human gate'],
        defaultNextStage: 'reviewer',
        role: 'builder',
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
          decisionCreated: Boolean(decisionInboxItem),
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          model: response.model,
          blockers: normalizedResult.blockers.length,
          mutationAllowed: false,
          needsDecision: normalizedResult.needsDecision,
          nextStage: normalizedResult.nextStage,
          providerRunId: response.providerRunId,
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
          error: error.message,
          executionMode: 'preflight',
          inputArtifactIds: [planArtifact.id, architectureArtifact.id, breakdownArtifact.id],
          nextStage: null,
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

    const readyContext = await assertBuilderLiveMutationReady({
      taskId: input.taskId,
    });
    const task = readyContext.task;
    const project = readyContext.project;
    const approval = readyContext.approval;
    const preflightArtifact = readyContext.preflightArtifact;
    const preflightRun = readyContext.preflightRun;
    const planArtifact = findLatestTaskArtifact(runtime, task, 'plan');
    const architectureArtifact = findLatestTaskArtifact(runtime, task, 'architecture');
    const breakdownArtifact = findLatestTaskArtifact(runtime, task, 'breakdown');

    if (!planArtifact || !architectureArtifact || !breakdownArtifact) {
      throw new Error(`Latest plan, architecture, and breakdown artifacts are required for task ${task.id}`);
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

    const plannerRun = planArtifact.runId ? runtime.getRun(planArtifact.runId) : null;
    const architectRun = architectureArtifact.runId ? runtime.getRun(architectureArtifact.runId) : null;
    const taskBreakerRun = breakdownArtifact.runId ? runtime.getRun(breakdownArtifact.runId) : null;
    const promptContract = readContextFile(repoRoot, builderPromptPath);
    const sourceOfTruth = sourceOfTruthPaths.map((relativePath) =>
      readContextFile(repoRoot, relativePath),
    );
    const request = buildBuilderLiveMutationExecutionRequest({
      approval,
      architectureArtifact,
      architectRunSummary: architectRun?.summary || null,
      breakdownArtifact,
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
    const baselineTargetContents = captureFileContents(project.projectPath, targetFiles);

    run = runtime.startRun({
      taskId: task.id,
      kind: 'role',
      role: 'builder',
      metadata: {
        approvalId: approval.id,
        executionMode: 'live-mutation',
        inputArtifactIds,
        mutationAllowed: true,
        preflightArtifactId: preflightArtifact.id,
        promptPath: promptContract.path,
        sourceOfTruthPaths,
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

    try {
      runtime.appendLog({
        runId: run.id,
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['reviewer', 'architect', 'human gate'],
        defaultNextStage: 'reviewer',
        role: 'builder',
      });
      const changeSummaryArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'change-summary',
        content: response.outputText,
      });
      const fileUpdates = parseBase64FileUpdates(response.outputText);
      const updatedFiles = [...new Set(fileUpdates.map((fileUpdate) => fileUpdate.path))];
      const outOfScopeFiles = updatedFiles.filter((relativePath) => !targetFiles.includes(relativePath));
      const outsideArchitectureFiles = updatedFiles.filter(
        (relativePath) => !architectureAllowlist.includes(relativePath),
      );

      runtime.appendLog({
        runId: run.id,
        message: `saved builder live mutation change-summary artifact ${changeSummaryArtifact.id}`,
      });

      if (normalizedResult.blockers.length > 0 || normalizedResult.needsDecision) {
        throw new Error(
          `Builder live mutation must stop before file writes: ${normalizedResult.blockers.join('; ') || normalizedResult.summary || 'provider requested follow-up'}`,
        );
      }

      if (fileUpdates.length === 0) {
        throw new Error('Builder live mutation returned no bounded file updates');
      }

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

      backupContents = captureFileContents(project.projectPath, updatedFiles);

      if ([...backupContents.values()].some((content) => content === null)) {
        const missingFiles = [...backupContents.entries()]
          .filter(([, content]) => content === null)
          .map(([relativePath]) => relativePath);

        throw new Error(
          `Builder live mutation only supports existing files in this slice: ${missingFiles.join(', ')}`,
        );
      }

      const plannedAfterContents = new Map(fileUpdates.map((fileUpdate) => [fileUpdate.path, fileUpdate.content]));
      const patchText = buildCombinedDiff(updatedFiles, backupContents, plannedAfterContents);

      if (!patchText.trim()) {
        throw new Error('Builder live mutation produced no patch after validation');
      }

      const patchArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'patch',
        extension: 'patch',
        content: patchText,
      });

      runtime.appendLog({
        runId: run.id,
        message: `saved builder live mutation patch artifact ${patchArtifact.id}`,
      });

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
      const diffArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'diff',
        extension: 'diff',
        content: diffText,
      });

      runtime.appendLog({
        runId: run.id,
        message: `applied limited live mutation to ${actualChangedFiles.join(', ')}`,
      });
      runtime.appendLog({
        runId: run.id,
        message: `saved builder live mutation diff artifact ${diffArtifact.id}`,
      });

      const completedRun = runtime.completeRun({
        runId: run.id,
        summary: {
          adapter: response.adapterName,
          approvalId: approval.id,
          artifactIds: {
            changeSummary: changeSummaryArtifact.id,
            diff: diffArtifact.id,
            patch: patchArtifact.id,
          },
          changedFiles: actualChangedFiles,
          executionMode: 'live-mutation',
          inputArtifactIds,
          model: response.model,
          mutationAllowed: true,
          nextStage: normalizedResult.nextStage,
          preflightArtifactId: preflightArtifact.id,
          providerRunId: response.providerRunId,
        },
      });

      return {
        artifacts: {
          changeSummary: changeSummaryArtifact,
          diff: diffArtifact,
          patch: patchArtifact,
        },
        changedFiles: actualChangedFiles,
        inputArtifacts: [planArtifact, architectureArtifact, breakdownArtifact, preflightArtifact],
        normalizedResult,
        run: completedRun,
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
      changeSummaryArtifact: readyContext.changeSummaryArtifact,
      diffArtifact: readyContext.diffArtifact,
      patchArtifact: readyContext.patchArtifact,
      planArtifact: readyContext.planArtifact,
      preflightArtifact: readyContext.preflightArtifact,
      project,
      promptContract,
      sourceOfTruth,
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
        message: `invoking provider adapter ${providerAdapter.name || 'unknown-adapter'}`,
      });

      const response = await executeWithAdapter(providerAdapter, request);
      const normalizedResult = normalizeRoleResult(response.normalizedResult, {
        allowedNextStages: ['builder', 'architect', 'human gate'],
        defaultNextStage: 'builder',
        role: 'reviewer',
      });
      const reviewArtifact = runtime.recordArtifact({
        taskId: task.id,
        runId: run.id,
        type: 'review',
        content: response.outputText,
      });
      const parsedReview = parseReviewerArtifactContent(response.outputText);
      const mappedReviewStatus = mapReviewerVerdictToReviewStatus(parsedReview.verdict);
      let decisionInboxItem = null;

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

      if (parsedReview.decisionRequired || normalizedResult.needsDecision) {
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
    getReleasePackageReadiness,
    getReviewerReadiness,
    listCloseOutReadinessSummaries,
    listCommitExecutionReadinessSummaries,
    listCommitPackageReadinessSummaries,
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
