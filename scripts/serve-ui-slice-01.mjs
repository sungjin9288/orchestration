import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
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

function parseArgs(argv) {
  const options = {
    host: '127.0.0.1',
    port: 4310,
    runtimeRoot: path.join(repoRoot, 'var', 'runtime'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--host' && next) {
      options.host = next;
      index += 1;
    } else if (arg === '--port' && next) {
      options.port = Number(next);
      index += 1;
    } else if (arg === '--runtime-root' && next) {
      options.runtimeRoot = path.resolve(repoRoot, next);
      index += 1;
    }
  }

  if (!Number.isInteger(options.port) || options.port <= 0) {
    throw new Error(`Invalid port: ${options.port}`);
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const store = createFileStore({ runtimeRoot: options.runtimeRoot });
const runtime = createRuntimeService({ runtimeRoot: options.runtimeRoot });
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
    providerExecutionSummaries:
      executionCoordinator.listProviderExecutionReadinessSummaries(),
    releasePackageReadinessSummaries:
      executionCoordinator.listReleasePackageReadinessSummaries(),
    reviewerReadinessSummaries: executionCoordinator.listReviewerReadinessSummaries(),
    taskGuardSummaries: runtime.listTaskGuardSummaries(),
  };
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
  const snapshot = readSnapshotReadonly();
  const artifact = snapshot.artifacts[artifactId];

  if (!artifact) {
    return null;
  }

  const filename = path.basename(artifact.path);

  return {
    artifactCatalog: ARTIFACT_CATALOG,
    runtimeRoot: options.runtimeRoot,
    artifact: {
      ...artifact,
      content: store.readArtifact(filename),
    },
  };
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
        json(response, 400, { error: 'Project name is required' });
        return;
      }

      if (!projectPath) {
        json(response, 400, { error: 'project_path is required' });
        return;
      }

      const project = runtime.createProject({
        name,
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
          project,
        }),
      );
      return;
    } catch (error) {
      const statusCode = /not found/i.test(error.message) ? 404 : 400;
      json(response, statusCode, { error: error.message || 'Project creation failed' });
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
      json(response, statusCode, { error: error.message || 'Project provider update failed' });
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
        throw new Error('Linked worktree creation is only available for the active project');
      }

      if (!project.projectPath) {
        throw new Error('project_path is required before creating a linked worktree');
      }

      if (!existsSync(project.projectPath)) {
        throw new Error(`project_path does not exist: ${project.projectPath}`);
      }

      const targetPath = buildLinkedWorktreePath(project.projectPath, slug);

      runGit(project.projectPath, ['rev-parse', '--is-inside-work-tree']);

      if (branchExists(project.projectPath, branchName)) {
        throw new Error(
          `Linked worktree branch already exists: ${branchName}. Use the existing detected/switch flow instead.`,
        );
      }

      if (existsSync(targetPath)) {
        throw new Error(
          `Linked worktree path already exists: ${targetPath}. Use the existing detected/switch flow instead.`,
        );
      }

      runGit(project.projectPath, ['worktree', 'add', '-b', branchName, targetPath, 'HEAD']);

      const resolvedWorktreePath = getCanonicalProjectPath(targetPath);

      if (!resolvedWorktreePath) {
        throw new Error(`Linked worktree path could not be resolved after creation: ${targetPath}`);
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
      json(response, statusCode, { error: error.message || 'Linked worktree creation failed' });
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
      json(response, statusCode, { error: error.message || 'Project selection failed' });
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
        json(response, 400, { error: 'Active project is required before creating tasks' });
        return;
      }

      if (!title) {
        json(response, 400, { error: 'Task title is required' });
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
      json(response, 400, { error: error.message || 'Invalid request body' });
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
          throw new Error(`No detected linked worktrees are currently available for project ${project.id}`);
        }

        const resolvedRequestedWorktreeRef = path.resolve(String(rawWorktreeRef).trim());

        if (!existsSync(resolvedRequestedWorktreeRef)) {
          throw new Error(`worktreeRef does not exist: ${rawWorktreeRef}`);
        }

        nextWorktreeRef = realpathSync(resolvedRequestedWorktreeRef);

        if (!detectedWorktrees.options.some((option) => option.path === nextWorktreeRef)) {
          throw new Error(
            `worktreeRef must match a detected linked worktree for project ${project.id}: ${nextWorktreeRef}`,
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
      json(response, statusCode, { error: error.message || 'Task worktree update failed' });
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
      json(response, statusCode, { error: error.message || 'Planner run failed' });
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
      json(response, statusCode, { error: error.message || 'Architect run failed' });
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
      json(response, statusCode, { error: error.message || 'Task-breaker run failed' });
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
      json(response, statusCode, { error: error.message || 'Builder preflight run failed' });
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
        { error: error.message || 'Builder live mutation approval request failed' },
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
      json(response, statusCode, { error: error.message || 'Builder live mutation run failed' });
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
      json(response, statusCode, { error: error.message || 'Reviewer run failed' });
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
      json(response, statusCode, { error: error.message || 'Commit package run failed' });
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
      json(response, statusCode, { error: error.message || 'Local commit run failed' });
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
      json(response, statusCode, { error: error.message || 'Release package run failed' });
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
      json(response, statusCode, { error: error.message || 'Close-out run failed' });
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
        json(response, 400, { error: 'verb must be approve, reject, or resolve' });
        return;
      }

      if (item.status !== 'pending') {
        json(response, 409, { error: `Decision inbox item ${item.id} is already ${item.status}` });
        return;
      }

      if (verb === 'approve') {
        if (item.kind !== 'approval') {
          json(response, 400, { error: 'approve is only allowed for approval items' });
          return;
        }

        resolvedItem = runtime.resolveDecisionInboxItem({
          action: 'approved',
          itemId: item.id,
        });
      }

      if (verb === 'reject') {
        if (item.kind !== 'approval') {
          json(response, 400, { error: 'reject is only allowed for approval items' });
          return;
        }

        resolvedItem = runtime.resolveDecisionInboxItem({
          action: 'rejected',
          itemId: item.id,
        });
      }

      if (verb === 'resolve') {
        if (item.kind !== 'decision') {
          json(response, 400, { error: 'resolve is only allowed for decision items' });
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
      json(response, statusCode, { error: error.message || 'Decision inbox action failed' });
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
      json(response, 404, { error: 'Run not found' });
      return;
    }

    json(response, 200, payload);
    return;
  }

  const artifactMatch = url.pathname.match(/^\/api\/artifacts\/([^/]+)$/);

  if (artifactMatch) {
    const payload = getArtifactPayload(decodeURIComponent(artifactMatch[1]));

    if (!payload) {
      json(response, 404, { error: 'Artifact not found' });
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
