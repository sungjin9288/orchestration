import { createServer } from 'node:http';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import fileStoreModule from '../src/runtime/file-store.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { ARTIFACT_CATALOG } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const uiRoot = path.join(repoRoot, 'ui');
const tempRoot = path.resolve(tmpdir());
const harnessRunScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');
const harnessConsumerStatusScript = path.join(repoRoot, 'scripts', 'harness-consumer-status.mjs');
const harnessConsumerBriefScript = path.join(repoRoot, 'scripts', 'harness-consumer-brief.mjs');
const verificationOutputBriefScript = path.join(repoRoot, 'scripts', 'verification-output-brief.mjs');
let latestHarnessExecution = null;
let recentHarnessExecutions = [];
let harnessExecutionSequence = 0;

function parseArgs(argv) {
  const options = {
    host: '127.0.0.1',
    port: 4310,
    runtimeRoot: path.join(repoRoot, 'var', 'runtime'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--host') {
      options.host = requireOptionValue(argv, index, arg);
      index += 1;
    } else if (arg === '--port') {
      options.port = Number(requireOptionValue(argv, index, arg));
      index += 1;
    } else if (arg === '--runtime-root') {
      options.runtimeRoot = path.resolve(repoRoot, requireOptionValue(argv, index, arg));
      index += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.port) || options.port <= 0) {
    throw new Error(`Invalid port: ${options.port}`);
  }

  return options;
}

function requireOptionValue(argv, index, flag) {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

let options;

try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'serve-ui-argument-error',
        error: 'invalid-arguments',
        message: error.message,
        allowedFlags: ['--host', '--port', '--runtime-root'],
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const store = createFileStore({ runtimeRoot: options.runtimeRoot });
const runtime = createRuntimeService({
  runtimeRoot: options.runtimeRoot,
  companyBlueprintPath: path.join(repoRoot, 'company', 'blueprint.json'),
  companyRepoRoot: repoRoot,
});
const executionCoordinator = createExecutionCoordinator({
  repoRoot,
  runtimeService: runtime,
});

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function runAbortableCouncilProviderRequest(request, response, execute) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const abortOnEarlyClose = () => {
    if (!response.writableEnded) {
      abort();
    }
  };

  request.once('aborted', abort);
  response.once('close', abortOnEarlyClose);

  try {
    return await execute(controller.signal);
  } finally {
    request.off('aborted', abort);
    response.off('close', abortOnEarlyClose);
  }
}

function text(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

function readSnapshotReadonly() {
  return runtime.getSnapshot();
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

function parseWorktreeList(output) {
  const records = [];
  let current = null;

  for (const rawLine of String(output || '').split('\n')) {
    const line = rawLine.trim();

    if (!line) {
      if (current?.worktree) {
        records.push(current);
      }
      current = null;
      continue;
    }

    const separatorIndex = line.indexOf(' ');
    const key = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).trim();

    if (key === 'worktree') {
      if (current?.worktree) {
        records.push(current);
      }
      current = { worktree: value };
      continue;
    }

    if (!current) {
      current = {};
    }

    current[key] = value || true;
  }

  if (current?.worktree) {
    records.push(current);
  }

  return records;
}

function compareRecordsByUpdatedDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

function toBranchName(branchRef) {
  return String(branchRef || '').replace(/^refs\/heads\//, '') || null;
}

function isDedicatedLinkedWorktree(worktreePath) {
  try {
    const gitDir = realpathSync(
      path.resolve(worktreePath, runGit(worktreePath, ['rev-parse', '--git-dir']).trim()),
    );
    const gitCommonDir = realpathSync(
      path.resolve(worktreePath, runGit(worktreePath, ['rev-parse', '--git-common-dir']).trim()),
    );

    return gitDir !== gitCommonDir;
  } catch (_error) {
    return false;
  }
}

function detectLinkedWorktrees(projectPath) {
  const result = {
    error: null,
    options: [],
  };

  if (!projectPath) {
    return result;
  }

  if (!existsSync(projectPath)) {
    return {
      ...result,
      error: `project_path does not exist: ${projectPath}`,
    };
  }

  let resolvedProjectPath = null;

  try {
    resolvedProjectPath = realpathSync(projectPath);
    const insideWorkTree = runGit(projectPath, ['rev-parse', '--is-inside-work-tree']).trim();

    if (insideWorkTree !== 'true') {
      throw new Error(`project_path is not a git worktree: ${projectPath}`);
    }

    const optionMap = new Map();
    const records = parseWorktreeList(runGit(projectPath, ['worktree', 'list', '--porcelain']));

    for (const record of records) {
      if (!record.worktree || !existsSync(record.worktree)) {
        continue;
      }

      if (!isDedicatedLinkedWorktree(record.worktree)) {
        continue;
      }

      const resolvedWorktreePath = realpathSync(record.worktree);

      if (optionMap.has(resolvedWorktreePath)) {
        continue;
      }

      optionMap.set(resolvedWorktreePath, {
        branch: toBranchName(record.branch),
        head: record.HEAD || null,
        isCurrentProjectPath: resolvedWorktreePath === resolvedProjectPath,
        path: resolvedWorktreePath,
      });
    }

    result.options = [...optionMap.values()].sort((left, right) => {
      if (left.isCurrentProjectPath !== right.isCurrentProjectPath) {
        return left.isCurrentProjectPath ? -1 : 1;
      }

      const leftBranch = left.branch || '';
      const rightBranch = right.branch || '';

      if (leftBranch !== rightBranch) {
        return leftBranch.localeCompare(rightBranch);
      }

      return left.path.localeCompare(right.path);
    });
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

function getCanonicalProjectPath(projectPath) {
  if (!projectPath || !existsSync(projectPath)) {
    return null;
  }

  try {
    return realpathSync(projectPath);
  } catch (_error) {
    return null;
  }
}

function buildRegisteredProjectByCanonicalPath(snapshot, activeProject) {
  const projects = Object.values(snapshot.projects || {}).sort(compareRecordsByUpdatedDesc);
  const index = new Map();
  const activeCanonicalPath = getCanonicalProjectPath(activeProject?.projectPath);

  if (activeProject && activeCanonicalPath) {
    index.set(activeCanonicalPath, activeProject);
  }

  for (const project of projects) {
    const canonicalPath = getCanonicalProjectPath(project.projectPath);

    if (!canonicalPath || index.has(canonicalPath)) {
      continue;
    }

    index.set(canonicalPath, project);
  }

  return index;
}

function buildSuggestedLinkedWorktreeProjectName(activeProject, option) {
  const baseName = String(activeProject?.name || '').trim() || 'project';
  const suffix = String(option.branch || '').trim() || path.basename(option.path) || 'linked-worktree';

  return `${baseName} · ${suffix}`;
}

function normalizeLinkedWorktreeSlug(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (!slug) {
    throw new Error('linked worktree slug is required');
  }

  return slug;
}

function buildLinkedWorktreeBranchName(slug) {
  return `worktree/${slug}`;
}

function buildLinkedWorktreePath(projectPath, slug) {
  const resolvedProjectPath = getCanonicalProjectPath(projectPath) || path.resolve(projectPath);
  const parentDir = path.dirname(resolvedProjectPath);
  const baseName = path.basename(resolvedProjectPath);

  return path.join(parentDir, `${baseName}--${slug}`);
}

function branchExists(projectPath, branchName) {
  try {
    execFileSync('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branchName}`], {
      cwd: projectPath,
      stdio: 'ignore',
    });
    return true;
  } catch (_error) {
    return false;
  }
}

function buildDerivedSnapshotData(snapshot) {
  const activeProject = getActiveProject(snapshot);
  const linkedWorktrees = activeProject
    ? detectLinkedWorktrees(activeProject.projectPath)
    : { error: null, options: [] };
  const registeredProjectsByCanonicalPath = buildRegisteredProjectByCanonicalPath(
    snapshot,
    activeProject,
  );
  const resolvedProjectPath = getCanonicalProjectPath(activeProject?.projectPath);
  const mappedOptions = linkedWorktrees.options.map((option) => {
    const registeredProject = registeredProjectsByCanonicalPath.get(option.path) || null;

    return {
      ...option,
      isCurrentProjectPath: option.path === resolvedProjectPath,
      registeredProjectId: registeredProject?.id || null,
      registeredProjectName: registeredProject?.name || null,
      suggestedProjectName: buildSuggestedLinkedWorktreeProjectName(activeProject, option),
    };
  });
  const harnessConsumerStatus = readHarnessConsumerStatusPayload();
  const harnessConsumerBrief = readHarnessConsumerBriefPayload();

  return {
    activeProjectLinkedWorktrees: {
      error: null,
      notice: linkedWorktrees.error,
      options: mappedOptions,
      projectId: activeProject?.id || null,
      projectPath: activeProject?.projectPath || null,
      resolvedProjectPath,
    },
    closeOutReadinessSummaries: executionCoordinator.listCloseOutReadinessSummaries(),
    commitExecutionReadinessSummaries:
      executionCoordinator.listCommitExecutionReadinessSummaries(),
    commitPackageReadinessSummaries: executionCoordinator.listCommitPackageReadinessSummaries(),
    executionEntrySummaries: executionCoordinator.listExecutionEntryReadinessSummaries(),
    providerExecutionSummaries:
      executionCoordinator.listProviderExecutionReadinessSummaries(),
    councilProviderReadinessSummaries:
      runtime.listCouncilProviderReadinessSummaries(),
    releasePackageReadinessSummaries:
      executionCoordinator.listReleasePackageReadinessSummaries(),
    reviewerReadinessSummaries: executionCoordinator.listReviewerReadinessSummaries(),
    taskGuardSummaries: runtime.listTaskGuardSummaries(),
    harnessConsumerStatus,
    harnessConsumerBrief,
    latestHarnessExecution,
    recentHarnessExecutions,
  };
}

function rememberHarnessExecution(harnessExecution) {
  latestHarnessExecution = harnessExecution;
  recentHarnessExecutions = [harnessExecution, ...recentHarnessExecutions]
    .filter(Boolean)
    .slice(0, 5);
}

function clearHarnessExecutionMemory() {
  latestHarnessExecution = null;
  recentHarnessExecutions = [];
}

function nextHarnessExecutionRequestId() {
  harnessExecutionSequence += 1;
  return `harness-exec-${String(harnessExecutionSequence).padStart(4, '0')}`;
}

function readHarnessConsumerStatusPayload() {
  try {
    const output = execFileSync(process.execPath, [harnessConsumerStatusScript], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const payload = JSON.parse(output);

    if (
      payload?.ok === true &&
      payload.mode === 'harness-consumer-status' &&
      payload.statusCard &&
      payload.operatorAction
    ) {
      return payload;
    }
  } catch (error) {
    const detail = String(error.stderr || error.stdout || error.message || '').trim();

    return {
      ok: false,
      mode: 'harness-consumer-status',
      error: detail || 'harness consumer status unavailable',
      operatorAction: null,
      statusCard: null,
    };
  }

  return {
    ok: false,
    mode: 'harness-consumer-status',
    error: 'harness consumer status returned an unexpected payload',
    operatorAction: null,
    statusCard: null,
  };
}

function readHarnessConsumerBriefPayload() {
  try {
    const output = execFileSync(process.execPath, [harnessConsumerBriefScript], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const payload = JSON.parse(output);

    if (payload?.ok === true && payload.mode === 'harness-consumer-brief' && payload.brief) {
      return payload;
    }
  } catch (error) {
    const detail = String(error.stderr || error.stdout || error.message || '').trim();

    return {
      ok: false,
      mode: 'harness-consumer-brief',
      error: detail || 'harness consumer brief unavailable',
      brief: null,
    };
  }

  return {
    ok: false,
    mode: 'harness-consumer-brief',
    error: 'harness consumer brief returned an unexpected payload',
    brief: null,
  };
}

function isPathInside(rootPath, candidatePath) {
  const relativePath = path.relative(rootPath, candidatePath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function isAllowedHarnessExecutionPath(candidatePath, activeProjectPath) {
  const allowedRoots = [repoRoot, tempRoot];

  if (activeProjectPath) {
    allowedRoots.push(activeProjectPath);
  }

  return allowedRoots.some((rootPath) => isPathInside(rootPath, candidatePath));
}

function runHarnessOperatorAction(input = {}) {
  const harnessStatus = readHarnessConsumerStatusPayload();

  if (harnessStatus.ok !== true || !harnessStatus.operatorAction || !harnessStatus.statusCard) {
    throw new Error(
      harnessStatus.error || '현재 하네스 operator action payload를 읽을 수 없습니다.',
    );
  }

  const { operatorAction, statusCard } = harnessStatus;

  if (operatorAction.kind !== 'repo-native-run' || !operatorAction.harnessId) {
    throw new Error('현재 호스트는 즉시 실행 가능한 대표 하네스 action을 제공하지 않습니다.');
  }

  if (operatorAction.harnessId !== 'markitdown') {
    throw new Error(
      `현재 interactive execution route는 ${operatorAction.harnessId}를 지원하지 않습니다.`,
    );
  }

  const activeProject = getActiveProject();
  const resolutionBase = path.resolve(activeProject?.projectPath || repoRoot);
  const inputPath = String(input.inputPath || '').trim();
  const outputPath = String(input.outputPath || '').trim();
  const policyReport = input.policyReport === true;

  if (!inputPath) {
    throw new Error('입력 파일 경로가 필요합니다.');
  }

  const resolvedInputPath = path.resolve(resolutionBase, inputPath);
  const resolvedOutputPath = outputPath ? path.resolve(resolutionBase, outputPath) : null;

  if (!existsSync(resolvedInputPath)) {
    throw new Error(`입력 파일을 찾을 수 없습니다: ${resolvedInputPath}`);
  }

  if (!isAllowedHarnessExecutionPath(resolvedInputPath, activeProject?.projectPath || null)) {
    throw new Error('입력 파일은 현재 project_path, repo root, 또는 /tmp 하위여야 합니다.');
  }

  if (
    resolvedOutputPath &&
    !isAllowedHarnessExecutionPath(resolvedOutputPath, activeProject?.projectPath || null)
  ) {
    throw new Error('출력 파일은 현재 project_path, repo root, 또는 /tmp 하위여야 합니다.');
  }

  const runArgs = [
    harnessRunScript,
    operatorAction.harnessId,
    ...(policyReport ? ['--policy-report'] : []),
    resolvedInputPath,
    ...(resolvedOutputPath ? [resolvedOutputPath] : []),
  ];
  const result = spawnSync(process.execPath, runArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stdout = String(result.stdout || '').trim();
  const stderr = String(result.stderr || '').trim();

  if (result.status !== 0) {
    throw new Error(
      stderr || stdout || `하네스 ${operatorAction.harnessId} 실행이 status ${result.status}로 실패했습니다.`,
    );
  }

  const requestId = nextHarnessExecutionRequestId();

  return {
    executionId: requestId,
    executedAt: new Date().toISOString(),
    actionMode: policyReport ? 'policy-report' : 'conversion',
    harnessId: operatorAction.harnessId,
    requestId,
    currentHostState: statusCard.currentHostState,
    inputPath,
    outputPath: outputPath || null,
    projectId: activeProject?.id || null,
    repoNativeCommand: operatorAction.repoNativeCommand,
    resolvedInputPath,
    resolvedOutputPath,
    outputExists: !policyReport && resolvedOutputPath ? existsSync(resolvedOutputPath) : false,
    outputPreview:
      !policyReport && resolvedOutputPath && existsSync(resolvedOutputPath)
        ? readFileSync(resolvedOutputPath, 'utf8').slice(0, 800)
        : null,
    stdoutPreview: stdout ? stdout.slice(0, policyReport ? 1600 : 400) : null,
  };
}

function runVerificationOutputBrief(input = {}) {
  const text = String(input.text || '').trim();
  const maxLines = Number.isInteger(input.maxLines) && input.maxLines > 0 ? input.maxLines : 6;

  if (!text) {
    throw new Error('요약할 실행 미리보기 텍스트가 필요합니다.');
  }

  const result = spawnSync(
    process.execPath,
    [verificationOutputBriefScript, '--max-lines', String(maxLines)],
    {
      cwd: repoRoot,
      input: text,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const stdout = String(result.stdout || '').trim();
  const stderr = String(result.stderr || '').trim();

  if (result.status !== 0) {
    throw new Error(stderr || stdout || `verification output brief failed with status ${result.status}`);
  }

  const payload = JSON.parse(stdout);

  if (payload?.ok !== true || payload.mode !== 'verification-output-brief') {
    throw new Error('verification output brief returned an unexpected payload.');
  }

  return payload;
}

function buildSnapshotResponse(extra = {}) {
  const snapshot = readSnapshotReadonly();

  return {
    artifactCatalog: ARTIFACT_CATALOG,
    generatedAt: new Date().toISOString(),
    runtimeRoot: options.runtimeRoot,
    snapshot,
    derived: buildDerivedSnapshotData(snapshot),
    ...extra,
  };
}

function getActiveProject(snapshot = readSnapshotReadonly()) {
  if (!snapshot.activeProjectId) {
    return null;
  }

  return snapshot.projects[snapshot.activeProjectId] || null;
}

function buildTaskRoutingOutcome(task) {
  const scopeStatement = (task.intent || task.title || '').trim();

  return {
    classification: task.latestRunId ? 'task continuation' : 'new task',
    scopeStatement: scopeStatement || `Plan the next thin slice for ${task.id}.`,
    missingContext: [],
    decisionNote: '',
  };
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString('utf8').trim();

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

function parseProviderConfigInput(input) {
  const provider = input?.provider && typeof input.provider === 'object' ? input.provider : {};
  const env = provider.env && typeof provider.env === 'object' ? provider.env : {};
  const apiKeyVar = env.apiKeyVar ?? provider.apiKeyVar;

  return {
    adapter: typeof provider.adapter === 'string' ? provider.adapter : undefined,
    env: {
      apiKeyVar: typeof apiKeyVar === 'string' ? apiKeyVar : undefined,
    },
    mode: typeof provider.mode === 'string' ? provider.mode : undefined,
    model: typeof provider.model === 'string' ? provider.model : undefined,
  };
}

function parseProjectPackInput(input) {
  return typeof input?.pack === 'string' ? input.pack : undefined;
}

async function serveStaticAsset(response, assetPath) {
  const filePath = path.join(uiRoot, assetPath);

  if (!filePath.startsWith(uiRoot)) {
    text(response, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  try {
    const body = await readFile(filePath);
    const extension = path.extname(filePath);
    const contentType =
      extension === '.css'
        ? 'text/css; charset=utf-8'
        : extension === '.js'
          ? 'text/javascript; charset=utf-8'
          : 'text/html; charset=utf-8';

    text(response, 200, body, contentType);
  } catch (error) {
    text(response, 404, 'Not Found', 'text/plain; charset=utf-8');
  }
}

function getRunLogsPayload(runId) {
  const snapshot = readSnapshotReadonly();
  const run = snapshot.runs[runId];

  if (!run) {
    return null;
  }

  return {
    runtimeRoot: options.runtimeRoot,
    run,
    logs: store.readLogRecords(runId),
  };
}

function getArtifactPayload(artifactId) {
  try {
    const artifact = runtime.getArtifact(artifactId);

    return {
      artifactCatalog: ARTIFACT_CATALOG,
      runtimeRoot: options.runtimeRoot,
      artifact,
    };
  } catch (_error) {
    return null;
  }
}

function buildAutoChainStageRecord(stage, result = {}) {
  return {
    artifactId: result.artifact?.id || null,
    approvalId: result.approval?.id || null,
    inboxItemId: result.decisionInboxItem?.id || result.item?.id || null,
    nextStage: result.nextStage || null,
    runId: result.run?.id || null,
    stage,
    taskId: result.task?.id || null,
    targetArtifactId: result.approval?.targetArtifactId || null,
    targetRunId: result.approval?.targetRunId || null,
  };
}

async function runMissionAlignmentAutoChain(missionId, options = {}) {
  const approved = options.alignedResult || runtime.approveCouncilRecommendation({
    missionId,
  });
  let mission = approved.mission;
  const councilSession = approved.councilSession;
  let task = null;
  let approval = null;
  let approvalItem = null;
  let lastResult = null;
  const stageResults = [];
  const linkedTaskCreated = !mission.linkedTaskId;

  if (mission.linkedTaskId) {
    task = runtime.getTask(mission.linkedTaskId);
  } else {
    const linkedTaskResult = runtime.createLinkedTaskForMission({
      missionId,
    });
    mission = linkedTaskResult.mission;
    task = linkedTaskResult.task;
  }

  try {
    const plannerResult = await executionCoordinator.runPlanner({
      taskId: task.id,
      routingOutcome: buildTaskRoutingOutcome(task),
    });
    lastResult = plannerResult;
    stageResults.push(buildAutoChainStageRecord('planner', plannerResult));

    if (plannerResult.decisionInboxItem || plannerResult.nextStage !== 'architect') {
      return {
        approval,
        approvalItem,
        councilSession,
        lastResult,
        linkedTaskCreated,
        mission: runtime.syncMissionExecutionStateFromTask({
          missionId,
          taskId: task.id,
        }),
        stageResults,
        stopReason: plannerResult.decisionInboxItem ? 'waiting-decision' : plannerResult.nextStage,
        stoppedAt: 'planner',
        task: runtime.getTask(task.id),
      };
    }

    const architectResult = await executionCoordinator.runArchitect({
      taskId: task.id,
    });
    lastResult = architectResult;
    stageResults.push(buildAutoChainStageRecord('architect', architectResult));

    if (architectResult.decisionInboxItem || architectResult.nextStage !== 'task-breaker') {
      return {
        approval,
        approvalItem,
        councilSession,
        lastResult,
        linkedTaskCreated,
        mission: runtime.syncMissionExecutionStateFromTask({
          missionId,
          taskId: task.id,
        }),
        stageResults,
        stopReason: architectResult.decisionInboxItem
          ? 'waiting-decision'
          : architectResult.nextStage,
        stoppedAt: 'architect',
        task: runtime.getTask(task.id),
      };
    }

    const taskBreakerResult = await executionCoordinator.runTaskBreaker({
      taskId: task.id,
    });
    lastResult = taskBreakerResult;
    stageResults.push(buildAutoChainStageRecord('task-breaker', taskBreakerResult));

    if (taskBreakerResult.decisionInboxItem || taskBreakerResult.nextStage !== 'builder') {
      return {
        approval,
        approvalItem,
        councilSession,
        lastResult,
        linkedTaskCreated,
        mission: runtime.syncMissionExecutionStateFromTask({
          missionId,
          taskId: task.id,
        }),
        stageResults,
        stopReason: taskBreakerResult.decisionInboxItem
          ? 'waiting-decision'
          : taskBreakerResult.nextStage,
        stoppedAt: 'task-breaker',
        task: runtime.getTask(task.id),
      };
    }

    const preflightResult = await executionCoordinator.runBuilderPreflight({
      taskId: task.id,
    });
    lastResult = preflightResult;
    stageResults.push(buildAutoChainStageRecord('builder-preflight', preflightResult));

    if (!preflightResult.decisionInboxItem &&
        preflightResult.nextStage === 'request-builder-live-mutation-approval') {
      approval = runtime.requestBuilderLiveMutationApproval({
        taskId: task.id,
      });
      approvalItem = runtime.getDecisionInboxItem(approval.inboxItemId);
      stageResults.push(
        buildAutoChainStageRecord('request-builder-live-mutation-approval', {
          approval,
          item: approvalItem,
          task,
        }),
      );
    }

    return {
      approval,
      approvalItem,
      councilSession,
      lastResult,
      linkedTaskCreated,
      mission: runtime.syncMissionExecutionStateFromTask({
        missionId,
        taskId: task.id,
      }),
      stageResults,
      stopReason:
        preflightResult.decisionInboxItem
          ? 'waiting-decision'
          : approval
            ? 'waiting-approval'
            : preflightResult.nextStage,
      stoppedAt:
        approval ? 'request-builder-live-mutation-approval' : 'builder-preflight',
      task: runtime.getTask(task.id),
    };
  } catch (error) {
    if (task?.id) {
      try {
        runtime.syncMissionExecutionStateFromTask({
          missionId,
          taskId: task.id,
        });
      } catch (_syncError) {
        // Preserve the original auto-chain failure.
      }
    }

    throw error;
  }
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);

  if (method === 'POST' && url.pathname === '/api/projects') {
    try {
      const input = await readJsonBody(request);
      const name = String(input.name || '').trim();
      const projectPath = String(input.projectPath || '').trim();

      if (!name) {
        json(response, 400, { error: '프로젝트 이름이 필요합니다.' });
        return;
      }

      if (!projectPath) {
        json(response, 400, { error: 'project_path가 필요합니다.' });
        return;
      }

      const project = runtime.createProject({
        name,
        pack: parseProjectPackInput(input),
        projectPath,
        provider: parseProviderConfigInput(input),
      });

      json(
        response,
        201,
        buildSnapshotResponse({
          mutation: {
            kind: 'create-project',
            projectId: project.id,
          },
          project: {
            ...project,
            pack: project.pack,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '프로젝트 등록에 실패했습니다.' });
      return;
    }
  }

  const projectProviderConfigMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/provider-config$/);

  if (method === 'POST' && projectProviderConfigMatch) {
    try {
      const projectId = decodeURIComponent(projectProviderConfigMatch[1]);
      const input = await readJsonBody(request);
      const project = runtime.setProjectProviderConfig({
        projectId,
        provider: parseProviderConfigInput(input),
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            kind: 'update-project-provider',
            projectId: project.id,
          },
          project,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, {
        error: error.message || '프로젝트 프로바이더 설정 갱신에 실패했습니다.',
      });
      return;
    }
  }

  const projectLinkedWorktreesMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/linked-worktrees$/);

  if (method === 'POST' && projectLinkedWorktreesMatch) {
    try {
      const projectId = decodeURIComponent(projectLinkedWorktreesMatch[1]);
      const input = await readJsonBody(request);
      const snapshot = readSnapshotReadonly();
      const activeProject = getActiveProject(snapshot);
      const project = runtime.getProject(projectId);
      const slug = normalizeLinkedWorktreeSlug(input.slug);
      const branchName = buildLinkedWorktreeBranchName(slug);

      if (!activeProject || activeProject.id !== project.id) {
        throw new Error('연결 워크트리 생성은 현재 활성 프로젝트에서만 할 수 있습니다.');
      }

      if (!project.projectPath) {
        throw new Error('연결 워크트리를 만들기 전에 project_path가 필요합니다.');
      }

      if (!existsSync(project.projectPath)) {
        throw new Error(`project_path가 존재하지 않습니다: ${project.projectPath}`);
      }

      const targetPath = buildLinkedWorktreePath(project.projectPath, slug);

      runGit(project.projectPath, ['rev-parse', '--is-inside-work-tree']);

      if (branchExists(project.projectPath, branchName)) {
        throw new Error(
          `연결 워크트리 브랜치가 이미 존재합니다: ${branchName}. 기존 탐지/전환 흐름을 사용하세요.`,
        );
      }

      if (existsSync(targetPath)) {
        throw new Error(
          `연결 워크트리 경로가 이미 존재합니다: ${targetPath}. 기존 탐지/전환 흐름을 사용하세요.`,
        );
      }

      runGit(project.projectPath, ['worktree', 'add', '-b', branchName, targetPath, 'HEAD']);

      const resolvedWorktreePath = getCanonicalProjectPath(targetPath);

      if (!resolvedWorktreePath) {
        throw new Error(`생성 후 연결 워크트리 경로를 확인할 수 없습니다: ${targetPath}`);
      }

      const registeredProjectsByCanonicalPath = buildRegisteredProjectByCanonicalPath(
        snapshot,
        activeProject,
      );
      const existingProject = registeredProjectsByCanonicalPath.get(resolvedWorktreePath) || null;
      const linkedWorktreeOption = {
        branch: branchName,
        path: resolvedWorktreePath,
      };
      const linkedProject = existingProject
        ? runtime.selectProject(existingProject.id)
        : runtime.createProject({
            name: buildSuggestedLinkedWorktreeProjectName(project, linkedWorktreeOption),
            projectPath: resolvedWorktreePath,
          });

      json(
        response,
        201,
        buildSnapshotResponse({
          linkedWorktree: {
            branch: branchName,
            path: resolvedWorktreePath,
            slug,
          },
          mutation: {
            kind: 'create-linked-worktree',
            mode: existingProject ? 'select-project' : 'create-project',
            projectId: linkedProject.id,
            slug,
          },
          project: linkedProject,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /already exists/i.test(error.message)
        ? 409
        : /not found/i.test(error.message)
          ? 404
          : 400;
      json(response, statusCode, { error: error.message || '연결 워크트리 생성에 실패했습니다.' });
      return;
    }
  }

  const projectSelectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/select$/);

  if (method === 'POST' && projectSelectMatch) {
    try {
      const projectId = decodeURIComponent(projectSelectMatch[1]);
      const project = runtime.selectProject(projectId);

      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            kind: 'select-project',
            projectId: project.id,
          },
          project,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '프로젝트 선택에 실패했습니다.' });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/missions') {
    try {
      const input = await readJsonBody(request);
      const snapshot = readSnapshotReadonly();
      const activeProject = getActiveProject(snapshot);
      const autoDraftCouncil = input.autoDraftCouncil === true;
      const title = String(input.title || '').trim();
      const goal = String(input.goal || '').trim();
      const constraints = String(input.constraints || '').trim();
      const deliverableType =
        typeof input.deliverableType === 'string' ? input.deliverableType.trim() : '';

      if (!activeProject) {
        json(response, 400, { error: '미션을 만들기 전에 활성 프로젝트가 필요합니다.' });
        return;
      }

      const mission = runtime.createMission({
        constraints,
        deliverableType,
        goal,
        projectId: activeProject.id,
        title,
      });
      const autodraftResult = autoDraftCouncil
        ? runtime.createCouncilSessionForMission({
            missionId: mission.id,
          })
        : null;

      json(
        response,
        201,
        buildSnapshotResponse({
          councilSession: autodraftResult?.councilSession || null,
          mission: autodraftResult?.mission || mission,
          mutation: {
            councilSessionId: autodraftResult?.councilSession?.id || null,
            kind: autoDraftCouncil ? 'create-mission-autodraft-council' : 'create-mission',
            missionId: (autodraftResult?.mission || mission).id,
            projectId: activeProject.id,
          },
        }),
      );
      return;
    } catch (error) {
      json(response, 400, { error: error.message || '잘못된 미션 요청입니다.' });
      return;
    }
  }

  const missionSelectMatch = url.pathname.match(/^\/api\/missions\/([^/]+)\/select$/);

  if (method === 'POST' && missionSelectMatch) {
    try {
      const missionId = decodeURIComponent(missionSelectMatch[1]);
      const mission = runtime.selectMission(missionId);

      json(
        response,
        200,
        buildSnapshotResponse({
          mission,
          mutation: {
            kind: 'select-mission',
            missionId: mission.id,
            projectId: mission.projectId,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '미션 선택에 실패했습니다.' });
      return;
    }
  }

  const missionCreateLinkedTaskMatch = url.pathname.match(
    /^\/api\/missions\/([^/]+)\/create-linked-task$/,
  );

  if (method === 'POST' && missionCreateLinkedTaskMatch) {
    try {
      const missionId = decodeURIComponent(missionCreateLinkedTaskMatch[1]);
      const input = await readJsonBody(request);
      const result = runtime.createLinkedTaskForMission({
        intent: String(input.intent || '').trim(),
        missionId,
        title: String(input.title || '').trim(),
      });

      json(
        response,
        201,
        buildSnapshotResponse({
          mission: result.mission,
          mutation: {
            kind: 'create-linked-task-for-mission',
            missionId: result.mission.id,
            taskId: result.task.id,
          },
          task: result.task,
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        /already has a linked task/i.test(error.message)
          ? 409
          : /not found/i.test(error.message)
            ? 404
            : 400;
      json(response, statusCode, { error: error.message || '미션 연결 태스크 생성에 실패했습니다.' });
      return;
    }
  }

  const missionDraftCouncilMatch = url.pathname.match(/^\/api\/missions\/([^/]+)\/draft-council$/);

  if (method === 'POST' && missionDraftCouncilMatch) {
    try {
      const missionId = decodeURIComponent(missionDraftCouncilMatch[1]);
      const result = runtime.createCouncilSessionForMission({
        missionId,
      });

      json(
        response,
        201,
        buildSnapshotResponse({
          councilSession: result.councilSession,
          mission: result.mission,
          mutation: {
            councilSessionId: result.councilSession.id,
            kind: 'draft-council-for-mission',
            missionId: result.mission.id,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        /already has a council session/i.test(error.message)
          ? 409
          : /not found/i.test(error.message)
            ? 404
            : 400;
      json(response, statusCode, { error: error.message || '협의회 초안 생성에 실패했습니다.' });
      return;
    }
  }

  const missionStartRealCouncilMatch = url.pathname.match(
    /^\/api\/missions\/([^/]+)\/council\/start$/,
  );

  if (method === 'POST' && missionStartRealCouncilMatch) {
    try {
      const missionId = decodeURIComponent(missionStartRealCouncilMatch[1]);
      const input = await readJsonBody(request);
      const mode = typeof input.mode === 'string' ? input.mode.trim() : undefined;
      const result = mode === 'real-openai-responses'
        ? await runAbortableCouncilProviderRequest(request, response, (signal) =>
            runtime.startProviderCouncilForMission({ missionId, mode, signal }))
        : runtime.startRealCouncilForMission({ missionId, mode });

      json(
        response,
        201,
        buildSnapshotResponse({
          councilSession: result.councilSession,
          mission: result.mission,
          mutation: {
            councilSessionId: result.councilSession.id,
            kind: 'start-real-council-for-mission',
            missionId: result.mission.id,
            mode: result.councilSession.mode,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, {
        error: error.message || 'Real Council 시작에 실패했습니다.',
      });
      return;
    }
  }

  const realCouncilResumeMatch = url.pathname.match(
    /^\/api\/council-sessions\/([^/]+)\/resume$/,
  );

  if (method === 'POST' && realCouncilResumeMatch) {
    try {
      const councilSessionId = decodeURIComponent(realCouncilResumeMatch[1]);
      const input = await readJsonBody(request);
      const councilSession = runtime.getCouncilSession(councilSessionId);
      const resumeInput = {
        councilSessionId,
        targetAgentIds: Array.isArray(input.targetAgentIds) ? input.targetAgentIds : undefined,
      };
      const result = councilSession.mode === 'real-openai-responses'
        ? await runAbortableCouncilProviderRequest(request, response, (signal) =>
            runtime.resumeProviderCouncilSession({ ...resumeInput, signal }))
        : runtime.resumeRealCouncilSession(resumeInput);

      json(
        response,
        200,
        buildSnapshotResponse({
          attempt: result.attempt,
          councilSession: result.councilSession,
          mission: result.mission,
          mutation: {
            attemptId: result.attempt.id,
            councilSessionId: result.councilSession.id,
            kind: 'resume-real-council-session',
            missionId: result.mission.id,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, {
        error: error.message || 'Real Council 재개에 실패했습니다.',
      });
      return;
    }
  }

  const realCouncilDecisionMatch = url.pathname.match(
    /^\/api\/council-sessions\/([^/]+)\/decision$/,
  );

  if (method === 'POST' && realCouncilDecisionMatch) {
    try {
      const councilSessionId = decodeURIComponent(realCouncilDecisionMatch[1]);
      const input = await readJsonBody(request);
      const action = String(input.action || '').trim();
      const handoffMode = String(input.handoffMode || '').trim();
      const councilSession = runtime.getCouncilSession(councilSessionId);
      if (handoffMode && handoffMode !== 'inert-workorder-preview') {
        throw new Error(`Unsupported Council handoff mode: ${handoffMode}`);
      }
      if (handoffMode && action !== 'approve') {
        throw new Error('Council handoff mode is supported only for approve');
      }
      if (handoffMode === 'inert-workorder-preview') {
        runtime.preflightMissionWorkOrderPreview({
          councilSessionId,
          compileSpec: input.compileSpec,
          action,
        });
      }
      const decisionInput = {
        councilSessionId,
        action,
        note: input.note,
        targetAgentIds: input.targetAgentIds,
      };
      const alignedResult = councilSession.mode === 'real-openai-responses'
        ? await runAbortableCouncilProviderRequest(request, response, (signal) =>
            runtime.decideProviderCouncilSession({ ...decisionInput, signal }))
        : runtime.decideRealCouncilSession(decisionInput);

      if (action === 'approve' && handoffMode === 'inert-workorder-preview') {
        const missionWorkOrderPreview = runtime.previewMissionWorkOrders({
          councilSessionId,
          compileSpec: input.compileSpec,
        });

        json(
          response,
          200,
          buildSnapshotResponse({
            councilSession: alignedResult.councilSession,
            mission: alignedResult.mission,
            missionWorkOrderPreview,
            mutation: {
              action: 'approve',
              councilSessionId,
              handoffMode,
              kind: 'decide-real-council-session',
              missionId: alignedResult.mission.id,
              persistedPreview: false,
              taskId: null,
            },
          }),
        );
        return;
      }

      if (action === 'approve') {
        const result = await runMissionAlignmentAutoChain(alignedResult.mission.id, {
          alignedResult,
        });

        json(
          response,
          200,
          buildSnapshotResponse({
            approval: result.approval ? runtime.getApproval(result.approval.id) : null,
            councilSession: result.councilSession,
            item: result.approvalItem,
            mission: result.mission,
            mutation: {
              approvalId: result.approval?.id || null,
              autoChain: {
                linkedTaskCreated: result.linkedTaskCreated,
                stageResults: result.stageResults,
                stopReason: result.stopReason,
                stoppedAt: result.stoppedAt,
              },
              councilSessionId: result.councilSession.id,
              kind: 'decide-real-council-session',
              action: 'approve',
              lastArtifactId:
                result.approval?.targetArtifactId || result.lastResult?.artifact?.id || null,
              lastRunId: result.lastResult?.run?.id || null,
              missionId: result.mission.id,
              taskId: result.task?.id || null,
            },
            runLogs: result.lastResult?.run?.id
              ? getRunLogsPayload(result.lastResult.run.id)
              : null,
            task: result.task,
          }),
        );
        return;
      }

      json(
        response,
        200,
        buildSnapshotResponse({
          attempt: alignedResult.attempt,
          councilSession: alignedResult.councilSession,
          mission: alignedResult.mission,
          mutation: {
            action,
            attemptId: alignedResult.attempt?.id || null,
            councilSessionId: alignedResult.councilSession.id,
            kind: 'decide-real-council-session',
            missionId: alignedResult.mission.id,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, {
        error: error.message || 'Real Council 결정 처리에 실패했습니다.',
      });
      return;
    }
  }

  const realCouncilWorkOrderPreviewMatch = url.pathname.match(
    /^\/api\/council-sessions\/([^/]+)\/work-order-preview$/,
  );

  if (method === 'POST' && realCouncilWorkOrderPreviewMatch) {
    try {
      const councilSessionId = decodeURIComponent(realCouncilWorkOrderPreviewMatch[1]);
      const input = await readJsonBody(request);
      const missionWorkOrderPreview = runtime.previewMissionWorkOrders({
        councilSessionId,
        compileSpec: input.compileSpec,
      });
      const councilSession = runtime.getCouncilSession(councilSessionId);
      const mission = runtime.getMission(councilSession.missionId);

      json(
        response,
        200,
        buildSnapshotResponse({
          councilSession,
          mission,
          missionWorkOrderPreview,
          mutation: {
            councilSessionId,
            kind: 'recompute-mission-workorder-preview',
            missionId: mission.id,
            persistedPreview: false,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, {
        error: error.message || 'WorkOrder preview 계산에 실패했습니다.',
      });
      return;
    }
  }

  const missionApproveCouncilMatch = url.pathname.match(
    /^\/api\/missions\/([^/]+)\/approve-council$/,
  );

  if (method === 'POST' && missionApproveCouncilMatch) {
    try {
      const missionId = decodeURIComponent(missionApproveCouncilMatch[1]);
      const result = await runMissionAlignmentAutoChain(missionId);

      json(
        response,
        200,
        buildSnapshotResponse({
          approval: result.approval ? runtime.getApproval(result.approval.id) : null,
          councilSession: result.councilSession,
          item: result.approvalItem,
          mission: result.mission,
          mutation: {
            approvalId: result.approval?.id || null,
            autoChain: {
              linkedTaskCreated: result.linkedTaskCreated,
              stageResults: result.stageResults,
              stopReason: result.stopReason,
              stoppedAt: result.stoppedAt,
            },
            councilSessionId: result.councilSession.id,
            kind: 'approve-council-for-mission',
            lastArtifactId:
              result.approval?.targetArtifactId ||
              result.lastResult?.artifact?.id ||
              null,
            lastRunId: result.lastResult?.run?.id || null,
            missionId: result.mission.id,
            taskId: result.task?.id || null,
          },
          runLogs: result.lastResult?.run?.id ? getRunLogsPayload(result.lastResult.run.id) : null,
          task: result.task,
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, {
        error: error.message || '협의회 추천안 승인에 실패했습니다.',
      });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/tasks') {
    try {
      const input = await readJsonBody(request);
      const snapshot = readSnapshotReadonly();
      const activeProject = getActiveProject(snapshot);
      const title = String(input.title || '').trim();
      const intent = String(input.intent || '').trim();

      if (!activeProject) {
        json(response, 400, { error: '태스크를 만들기 전에 활성 프로젝트가 필요합니다.' });
        return;
      }

      if (!title) {
        json(response, 400, { error: '태스크 제목이 필요합니다.' });
        return;
      }

      const task = runtime.createTask({
        projectId: activeProject.id,
        title,
        intent,
      });

      json(
        response,
        201,
        buildSnapshotResponse({
          mutation: {
            kind: 'create-task',
            taskId: task.id,
          },
          task,
        }),
      );
      return;
    } catch (error) {
      json(response, 400, { error: error.message || '잘못된 요청입니다.' });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/retention-consumer/preview') {
    try {
      const input = await readJsonBody(request);
      const retentionConsumer = runtime.previewRetentionConsumer({
        projectId: typeof input.projectId === 'string' ? input.projectId : null,
        taskId: typeof input.taskId === 'string' ? input.taskId : null,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            action: retentionConsumer.action,
            applyActionsImplemented: retentionConsumer.applyActionsImplemented,
            kind: 'preview-retention-consumer',
            projectId: retentionConsumer.scope.projectId,
            taskId: retentionConsumer.scope.taskId,
          },
          retentionConsumer,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, {
        error: error.message || '보존 정리 미리보기에 실패했습니다.',
      });
      return;
    }
  }

  const taskWorktreeRefMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/worktree-ref$/);

  if (method === 'POST' && taskWorktreeRefMatch) {
    try {
      const taskId = decodeURIComponent(taskWorktreeRefMatch[1]);
      const input = await readJsonBody(request);
      const task = runtime.getTask(taskId);
      const project = runtime.getProject(task.projectId);
      const rawWorktreeRef = input.worktreeRef;
      let nextWorktreeRef = null;

      if (rawWorktreeRef !== null && rawWorktreeRef !== undefined && String(rawWorktreeRef).trim()) {
        const detectedWorktrees = detectLinkedWorktrees(project.projectPath);

        if (detectedWorktrees.error || detectedWorktrees.options.length === 0) {
          throw new Error(`프로젝트 ${project.id}에 현재 탐지된 연결 워크트리가 없습니다.`);
        }

        const resolvedRequestedWorktreeRef = path.resolve(String(rawWorktreeRef).trim());

        if (!existsSync(resolvedRequestedWorktreeRef)) {
          throw new Error(`worktreeRef가 존재하지 않습니다: ${rawWorktreeRef}`);
        }

        nextWorktreeRef = realpathSync(resolvedRequestedWorktreeRef);

        if (!detectedWorktrees.options.some((option) => option.path === nextWorktreeRef)) {
          throw new Error(
            `worktreeRef는 프로젝트 ${project.id}에서 탐지된 연결 워크트리와 일치해야 합니다: ${nextWorktreeRef}`,
          );
        }
      }

      const updatedTask = runtime.setTaskWorktreeRef({
        taskId: task.id,
        worktreeRef: nextWorktreeRef,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            kind: nextWorktreeRef ? 'set-task-worktree-ref' : 'clear-task-worktree-ref',
            taskId: updatedTask.id,
            worktreeRef: updatedTask.worktreeRef,
          },
          task: updatedTask,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '태스크 워크트리 설정 갱신에 실패했습니다.' });
      return;
    }
  }

  const plannerRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-planner$/);

  if (method === 'POST' && plannerRunMatch) {
    try {
      const taskId = decodeURIComponent(plannerRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runPlanner({
        taskId: task.id,
        routingOutcome: buildTaskRoutingOutcome(task),
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            inboxItemId: result.decisionInboxItem?.id || null,
            kind: 'run-planner',
            normalizedResult: result.normalizedResult,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '플래너 실행에 실패했습니다.' });
      return;
    }
  }

  const architectRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-architect$/);

  if (method === 'POST' && architectRunMatch) {
    try {
      const taskId = decodeURIComponent(architectRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runArchitect({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            inboxItemId: result.decisionInboxItem?.id || null,
            inputArtifactId: result.inputArtifact.id,
            kind: 'run-architect',
            normalizedResult: result.normalizedResult,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '설계 실행에 실패했습니다.' });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/retention-consumer/apply') {
    try {
      const input = await readJsonBody(request);
      const retentionConsumer = runtime.applyRetentionConsumer({
        action: input.action,
        artifactIds: input.artifactIds,
        note: input.note,
        projectId: input.projectId,
        taskId: input.taskId,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            action: retentionConsumer.action,
            artifactIds: retentionConsumer.affectedArtifactIds,
            kind: 'apply-retention-consumer',
            projectId: retentionConsumer.scope.projectId,
            taskId: retentionConsumer.scope.taskId,
          },
          retentionConsumer,
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '보존 정리 적용에 실패했습니다.' });
      return;
    }
  }

  const taskBreakerRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-task-breaker$/);

  if (method === 'POST' && taskBreakerRunMatch) {
    try {
      const taskId = decodeURIComponent(taskBreakerRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runTaskBreaker({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            inboxItemId: result.decisionInboxItem?.id || null,
            inputArtifactIds: result.inputArtifacts.map((artifact) => artifact.id),
            kind: 'run-task-breaker',
            normalizedResult: result.normalizedResult,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '태스크 분해 실행에 실패했습니다.' });
      return;
    }
  }

  const builderPreflightRunMatch = url.pathname.match(
    /^\/api\/tasks\/([^/]+)\/run-builder-preflight$/,
  );

  if (method === 'POST' && builderPreflightRunMatch) {
    try {
      const taskId = decodeURIComponent(builderPreflightRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runBuilderPreflight({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            inboxItemId: result.decisionInboxItem?.id || null,
            inputArtifactIds: result.inputArtifacts.map((artifact) => artifact.id),
            kind: 'run-builder-preflight',
            normalizedResult: result.normalizedResult,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '빌더 사전 점검 실행에 실패했습니다.' });
      return;
    }
  }

  const builderLiveApprovalRequestMatch = url.pathname.match(
    /^\/api\/tasks\/([^/]+)\/request-builder-live-mutation-approval$/,
  );

  if (method === 'POST' && builderLiveApprovalRequestMatch) {
    try {
      const taskId = decodeURIComponent(builderLiveApprovalRequestMatch[1]);
      const approval = runtime.requestBuilderLiveMutationApproval({
        taskId,
      });

      json(
        response,
        201,
        buildSnapshotResponse({
          approval: runtime.getApproval(approval.id),
          item: runtime.getDecisionInboxItem(approval.inboxItemId),
          mutation: {
            approvalId: approval.id,
            inboxItemId: approval.inboxItemId,
            kind: 'request-builder-live-mutation-approval',
            targetArtifactId: approval.targetArtifactId,
            targetRunId: approval.targetRunId,
            taskId,
          },
        }),
      );
      return;
    } catch (error) {
      const statusCode =
        error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(
        response,
        statusCode,
        { error: error.message || '빌더 라이브 변경 승인 요청에 실패했습니다.' },
      );
      return;
    }
  }

  const builderLiveMutationRunMatch = url.pathname.match(
    /^\/api\/tasks\/([^/]+)\/run-builder-live-mutation$/,
  );

  if (method === 'POST' && builderLiveMutationRunMatch) {
    try {
      const taskId = decodeURIComponent(builderLiveMutationRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runBuilderLiveMutation({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifacts.changeSummary.id)?.artifact || null,
          mutation: {
            approvalId: result.run.summary?.approvalId || null,
            artifactId: result.artifacts.changeSummary.id,
            changedFiles: result.changedFiles,
            diffArtifactId: result.artifacts.diff.id,
            inputArtifactIds: result.inputArtifacts.map((artifact) => artifact.id),
            kind: 'run-builder-live-mutation',
            normalizedResult: result.normalizedResult,
            patchArtifactId: result.artifacts.patch.id,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '빌더 라이브 변경 실행에 실패했습니다.' });
      return;
    }
  }

  const reviewerRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-reviewer$/);

  if (method === 'POST' && reviewerRunMatch) {
    try {
      const taskId = decodeURIComponent(reviewerRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runReviewer({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            inboxItemId: result.decisionInboxItem?.id || null,
            inputArtifactIds: result.inputArtifacts.map((artifact) => artifact.id),
            kind: 'run-reviewer',
            mappedReviewStatus: result.run.summary?.mappedReviewStatus || null,
            rawVerdict: result.run.summary?.rawVerdict || null,
            runId: result.run.id,
            sourceRunId: result.run.summary?.sourceRunId || null,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '리뷰어 실행에 실패했습니다.' });
      return;
    }
  }

  const commitPackageRunMatch = url.pathname.match(
    /^\/api\/tasks\/([^/]+)\/run-commit-package$/,
  );

  if (method === 'POST' && commitPackageRunMatch) {
    try {
      const taskId = decodeURIComponent(commitPackageRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runCommitPackage({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            approvalId: result.approval.id,
            artifactId: result.artifact.id,
            inboxItemId: result.inboxItem.id,
            inputArtifactIds: result.inputArtifacts.map((artifact) => artifact.id),
            kind: 'run-commit-package',
            runId: result.run.id,
            sourceBuilderRunId: result.run.summary?.sourceBuilderRunId || null,
            sourceReviewerRunId: result.run.summary?.sourceReviewerRunId || null,
            targetPreflightArtifactId: result.run.summary?.targetPreflightArtifactId || null,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '커밋 패키지 준비에 실패했습니다.' });
      return;
    }
  }

  const localCommitRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-local-commit$/);

  if (method === 'POST' && localCommitRunMatch) {
    try {
      const taskId = decodeURIComponent(localCommitRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runLocalCommit({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            approvalId: result.approval.id,
            artifactId: result.artifact.id,
            commitPackageArtifactId: result.run.summary?.commitPackageArtifactId || null,
            commitSha: result.commitSha,
            committedFiles: result.committedFiles,
            kind: 'run-local-commit',
            runId: result.run.id,
            sourceBuilderRunId: result.run.summary?.sourceBuilderRunId || null,
            sourceReviewerRunId: result.run.summary?.sourceReviewerRunId || null,
            targetPreflightArtifactId: result.run.summary?.targetPreflightArtifactId || null,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '로컬 커밋 실행에 실패했습니다.' });
      return;
    }
  }

  const releasePackageRunMatch = url.pathname.match(
    /^\/api\/tasks\/([^/]+)\/run-release-package$/,
  );

  if (method === 'POST' && releasePackageRunMatch) {
    try {
      const taskId = decodeURIComponent(releasePackageRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runReleasePackage({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            approvalId: result.approval.id,
            artifactId: result.artifact.id,
            commitPackageArtifactId: result.run.summary?.commitPackageArtifactId || null,
            commitResultArtifactId: result.run.summary?.commitResultArtifactId || null,
            inboxItemId: result.inboxItem.id,
            kind: 'run-release-package',
            runId: result.run.id,
            sourceBuilderRunId: result.run.summary?.sourceBuilderRunId || null,
            sourceReviewerRunId: result.run.summary?.sourceReviewerRunId || null,
            targetPreflightArtifactId: result.run.summary?.targetPreflightArtifactId || null,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '릴리스 패키지 준비에 실패했습니다.' });
      return;
    }
  }

  const closeOutRunMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/run-close-out$/);

  if (method === 'POST' && closeOutRunMatch) {
    try {
      const taskId = decodeURIComponent(closeOutRunMatch[1]);
      const task = runtime.getTask(taskId);
      const result = await executionCoordinator.runCloseOut({
        taskId: task.id,
      });

      json(
        response,
        200,
        buildSnapshotResponse({
          artifactDetail: getArtifactPayload(result.artifact.id)?.artifact || null,
          mutation: {
            artifactId: result.artifact.id,
            commitPackageArtifactId: result.run.summary?.commitPackageArtifactId || null,
            commitResultArtifactId: result.run.summary?.commitResultArtifactId || null,
            kind: 'run-close-out',
            releasePackageArtifactId: result.run.summary?.sourceReleasePackageArtifactId || null,
            runId: result.run.id,
            taskId: task.id,
          },
          runLogs: getRunLogsPayload(result.run.id),
        }),
      );
      return;
    } catch (error) {
      const statusCode = error.statusCode || (/not found/i.test(error.message) ? 404 : 400);
      json(response, statusCode, { error: error.message || '종료 정리 실행에 실패했습니다.' });
      return;
    }
  }

  const inboxActionMatch = url.pathname.match(/^\/api\/decision-inbox\/([^/]+)\/actions$/);

  if (method === 'POST' && inboxActionMatch) {
    try {
      const itemId = decodeURIComponent(inboxActionMatch[1]);
      const input = await readJsonBody(request);
      const item = runtime.getDecisionInboxItem(itemId);
      const verb = String(input.verb || '').trim();
      let resolvedItem = null;

      if (!['approve', 'reject', 'resolve'].includes(verb)) {
        json(response, 400, { error: 'verb는 approve, reject, resolve 중 하나여야 합니다.' });
        return;
      }

      if (item.status !== 'pending') {
        json(response, 409, { error: `결정함 항목 ${item.id}은 이미 ${item.status} 상태입니다.` });
        return;
      }

      if (verb === 'approve') {
        if (item.kind !== 'approval') {
          json(response, 400, { error: 'approve는 승인 항목에서만 사용할 수 있습니다.' });
          return;
        }

        resolvedItem = runtime.resolveDecisionInboxItem({
          action: 'approved',
          itemId: item.id,
        });
      }

      if (verb === 'reject') {
        if (item.kind !== 'approval') {
          json(response, 400, { error: 'reject는 승인 항목에서만 사용할 수 있습니다.' });
          return;
        }

        resolvedItem = runtime.resolveDecisionInboxItem({
          action: 'rejected',
          itemId: item.id,
        });
      }

      if (verb === 'resolve') {
        if (item.kind !== 'decision') {
          json(response, 400, { error: 'resolve는 결정 항목에서만 사용할 수 있습니다.' });
          return;
        }

        resolvedItem = runtime.resolveDecisionInboxItem({
          action: 'resolved',
          itemId: item.id,
        });
      }

      json(
        response,
        200,
        buildSnapshotResponse({
          item: runtime.getDecisionInboxItem(item.id),
          mutation: {
            itemId: item.id,
            kind: 'decision-inbox-action',
            taskId: item.taskId,
            verb,
          },
          resolvedItem,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || '결정함 처리에 실패했습니다.' });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/harness/operator-action/run') {
    try {
      const input = await readJsonBody(request);
      const harnessExecution = runHarnessOperatorAction(input);
      rememberHarnessExecution(harnessExecution);

      json(
        response,
        200,
        buildSnapshotResponse({
          harnessExecution,
          mutation: {
            kind: 'run-harness-operator-action',
            harnessId: harnessExecution.harnessId,
            inputPath: harnessExecution.inputPath,
            outputPath: harnessExecution.outputPath,
          },
        }),
      );
      return;
    } catch (error) {
      json(response, 400, {
        error: error.message || '하네스 operator action 실행에 실패했습니다.',
      });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/harness/operator-action/clear-history') {
    try {
      const harnessConsumerStatus = readHarnessConsumerStatusPayload();
      const harnessId = harnessConsumerStatus?.statusCard?.primaryHarnessId || null;

      clearHarnessExecutionMemory();
      json(
        response,
        200,
        buildSnapshotResponse({
          mutation: {
            kind: 'clear-harness-operator-action-history',
            harnessId,
          },
        }),
      );
      return;
    } catch (error) {
      json(response, 400, {
        error: error.message || '하네스 실행 기록을 비우지 못했습니다.',
      });
      return;
    }
  }

  if (method === 'POST' && url.pathname === '/api/harness/output-brief') {
    try {
      const input = await readJsonBody(request);
      const outputBrief = runVerificationOutputBrief(input);

      json(response, 200, {
        ok: true,
        mode: 'harness-output-brief',
        outputBrief,
      });
      return;
    } catch (error) {
      json(response, 400, {
        error: error.message || '하네스 출력 요약을 만들지 못했습니다.',
      });
      return;
    }
  }

  if (method !== 'GET') {
    text(response, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
    return;
  }

  if (url.pathname === '/api/snapshot') {
    json(response, 200, buildSnapshotResponse());
    return;
  }

  const runMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/logs$/);

  if (runMatch) {
    const payload = getRunLogsPayload(decodeURIComponent(runMatch[1]));

    if (!payload) {
      json(response, 404, { error: '실행을 찾을 수 없습니다.' });
      return;
    }

    json(response, 200, payload);
    return;
  }

  const artifactMatch = url.pathname.match(/^\/api\/artifacts\/([^/]+)$/);

  if (artifactMatch) {
    const payload = getArtifactPayload(decodeURIComponent(artifactMatch[1]));

    if (!payload) {
      json(response, 404, { error: '아티팩트를 찾을 수 없습니다.' });
      return;
    }

    json(response, 200, payload);
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    await serveStaticAsset(response, 'index.html');
    return;
  }

  if (url.pathname === '/styles.css') {
    await serveStaticAsset(response, 'styles.css');
    return;
  }

  if (url.pathname === '/app.js') {
    await serveStaticAsset(response, 'app.js');
    return;
  }

  if (url.pathname === '/artifact-preview.js') {
    await serveStaticAsset(response, 'artifact-preview.js');
    return;
  }

  if (url.pathname === '/artifact-relations.js') {
    await serveStaticAsset(response, 'artifact-relations.js');
    return;
  }

  if (url.pathname === '/artifact-structured-render.js') {
    await serveStaticAsset(response, 'artifact-structured-render.js');
    return;
  }

  if (url.pathname === '/availability.js') {
    await serveStaticAsset(response, 'availability.js');
    return;
  }

  if (url.pathname === '/execution-labels.js') {
    await serveStaticAsset(response, 'execution-labels.js');
    return;
  }

  if (url.pathname === '/inbox-labels.js') {
    await serveStaticAsset(response, 'inbox-labels.js');
    return;
  }

  if (url.pathname === '/pack-config.js') {
    await serveStaticAsset(response, 'pack-config.js');
    return;
  }

  if (url.pathname === '/control-snapshots.js') {
    await serveStaticAsset(response, 'control-snapshots.js');
    return;
  }

  if (url.pathname === '/council-config.js') {
    await serveStaticAsset(response, 'council-config.js');
    return;
  }

  if (url.pathname === '/council-signals.js') {
    await serveStaticAsset(response, 'council-signals.js');
    return;
  }

  if (url.pathname === '/ops-entry-signals.js') {
    await serveStaticAsset(response, 'ops-entry-signals.js');
    return;
  }

  if (url.pathname === '/desk-status.js') {
    await serveStaticAsset(response, 'desk-status.js');
    return;
  }

  if (url.pathname === '/formatters.js') {
    await serveStaticAsset(response, 'formatters.js');
    return;
  }

  if (url.pathname === '/growth-config.js') {
    await serveStaticAsset(response, 'growth-config.js');
    return;
  }

  if (url.pathname === '/growth-learning.js') {
    await serveStaticAsset(response, 'growth-learning.js');
    return;
  }

  if (url.pathname === '/growth-panels.js') {
    await serveStaticAsset(response, 'growth-panels.js');
    return;
  }

  if (url.pathname === '/harness-brief-labels.js') {
    await serveStaticAsset(response, 'harness-brief-labels.js');
    return;
  }

  if (url.pathname === '/harness-execution-tokens.js') {
    await serveStaticAsset(response, 'harness-execution-tokens.js');
    return;
  }

  if (url.pathname === '/harness-labels.js') {
    await serveStaticAsset(response, 'harness-labels.js');
    return;
  }

  if (url.pathname === '/harness-state.js') {
    await serveStaticAsset(response, 'harness-state.js');
    return;
  }

  if (url.pathname === '/preference-config.js') {
    await serveStaticAsset(response, 'preference-config.js');
    return;
  }

  if (url.pathname === '/project-bootstrap.js') {
    await serveStaticAsset(response, 'project-bootstrap.js');
    return;
  }

  if (url.pathname === '/personalization-snapshot.js') {
    await serveStaticAsset(response, 'personalization-snapshot.js');
    return;
  }

  if (url.pathname === '/company-config.js') {
    await serveStaticAsset(response, 'company-config.js');
    return;
  }

  if (url.pathname === '/surface-config.js') {
    await serveStaticAsset(response, 'surface-config.js');
    return;
  }

  if (url.pathname === '/worktree-labels.js') {
    await serveStaticAsset(response, 'worktree-labels.js');
    return;
  }

  if (url.pathname === '/markdown-artifact-parsing.js') {
    await serveStaticAsset(response, 'markdown-artifact-parsing.js');
    return;
  }

  if (url.pathname === '/artifact-parsing.js') {
    await serveStaticAsset(response, 'artifact-parsing.js');
    return;
  }

  if (url.pathname === '/task-summaries.js') {
    await serveStaticAsset(response, 'task-summaries.js');
    return;
  }

  if (url.pathname === '/task-detail-snapshots.js') {
    await serveStaticAsset(response, 'task-detail-snapshots.js');
    return;
  }

  text(response, 404, 'Not Found', 'text/plain; charset=utf-8');
});

server.listen(options.port, options.host, () => {
  console.log(
    `ops shell listening on http://${options.host}:${options.port} (runtime root: ${options.runtimeRoot})`,
  );
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// builder-live-mutation approval-0001 scripts/serve-ui-slice-01.mjs
