'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { executeWithAdapter } = require('./provider-adapter');
const { createLocalStubProviderAdapter } = require('./providers/local-stub-adapter');
const { TASK_LIFECYCLE } = require('../runtime/contracts');

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

  function assertReviewerReady(input) {
    if (!input || !input.taskId) {
      throw new Error('taskId is required');
    }

    const task = runtime.getTask(input.taskId);
    const project = runtime.getProject(task.projectId);

    if (!project.projectPath) {
      throw new Error('project_path is required');
    }

    const anchor = resolveReviewerAnchorBundle(runtime, task);
    const existingReviewerRun = findTerminalReviewerRun(runtime, task, anchor.builderRun.id);

    if (existingReviewerRun) {
      const error = new Error(
        `Terminal reviewer run ${existingReviewerRun.id} already exists for builder live mutation run ${anchor.builderRun.id}`,
      );

      error.statusCode = 409;
      throw error;
    }

    return {
      ...anchor,
      project,
      task,
    };
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

  return {
    assertBuilderLiveMutationReady,
    assertReviewerReady,
    runArchitect,
    runBuilderLiveMutation,
    runBuilderPreflight,
    runPlanner,
    runReviewer,
    runTaskBreaker,
  };
}

module.exports = {
  createExecutionCoordinator,
};
