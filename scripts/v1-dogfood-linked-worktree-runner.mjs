import { execFileSync, spawn } from 'node:child_process';
import { createServer as createNetServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultProjectPath = repoRoot;
const defaultSlug = 'v1-dogfood-safe-preview';

function printHelp() {
  console.log(`V1 linked worktree dogfood runner

Usage:
  node scripts/v1-dogfood-linked-worktree-runner.mjs --dry-run [--slug SLUG]
  node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug SLUG [options]

Options:
  --dry-run              Preview the linked worktree plan without mutating files. This is the default.
  --execute              Run the API dogfood flow and intentionally mutate only the new linked worktree.
  --slug SLUG            Linked worktree slug. Execute mode requires an explicit slug.
  --project-path PATH    Source project_path to register. Defaults to this repo.
  --runtime-root PATH    Runtime state root. Defaults to var/runtime-v1-dogfood-runner-<slug>.
  --port PORT            UI server port. Defaults to an ephemeral localhost port.
  --skip-reviewer        Stop after builder live mutation instead of running reviewer.
  --help                 Show this help.

Safety:
  - dry-run never creates runtime state, linked worktrees, branches, approvals, commits, or pushes
  - execute refuses an existing target linked worktree path, existing branch, dirty source repo, or existing runtime root
  - execute stops after reviewer or builder evidence and never runs commit-package, local commit, push, merge, release, or close-out`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    execute: false,
    explicitSlug: false,
    help: false,
    port: null,
    projectPath: defaultProjectPath,
    runtimeRoot: null,
    skipReviewer: false,
    slug: defaultSlug,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--execute') {
      options.execute = true;
      continue;
    }

    if (arg === '--skip-reviewer') {
      options.skipReviewer = true;
      continue;
    }

    if (arg === '--slug') {
      options.slug = requireValue(argv, (index += 1), arg);
      options.explicitSlug = true;
      continue;
    }

    if (arg === '--project-path') {
      options.projectPath = requireValue(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--runtime-root') {
      options.runtimeRoot = requireValue(argv, (index += 1), arg);
      continue;
    }

    if (arg === '--port') {
      options.port = Number.parseInt(requireValue(argv, (index += 1), arg), 10);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.execute && options.dryRun) {
    throw new Error('--execute and --dry-run cannot be used together');
  }

  if (!options.execute) {
    options.dryRun = true;
  }

  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];

  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

function normalizeSlug(value) {
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

function runGit(projectPath, args, options = {}) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  });
}

function commandSucceeds(projectPath, args) {
  try {
    runGit(projectPath, args, { stdio: 'ignore' });
    return true;
  } catch (_error) {
    return false;
  }
}

function realpathExisting(inputPath, label) {
  const resolved = path.resolve(inputPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`${label} does not exist: ${resolved}`);
  }

  return fs.realpathSync(resolved);
}

function buildPlan(options) {
  const projectPath = realpathExisting(options.projectPath, 'project_path');
  const slug = normalizeSlug(options.slug);
  const branch = `worktree/${slug}`;
  const linkedWorktreePath = path.join(path.dirname(projectPath), `${path.basename(projectPath)}--${slug}`);
  const runtimeRoot = path.resolve(
    options.runtimeRoot || path.join(repoRoot, 'var', `runtime-v1-dogfood-runner-${slug}`),
  );

  if (!Number.isInteger(options.port) && options.port !== null) {
    throw new Error('--port must be an integer');
  }

  return {
    branch,
    execute: options.execute,
    linkedWorktreePath,
    port: options.port,
    projectPath,
    runtimeRoot,
    skipReviewer: options.skipReviewer,
    slug,
  };
}

function preflightPlan(plan, options) {
  const sourceIsGitWorktree = commandSucceeds(plan.projectPath, ['rev-parse', '--is-inside-work-tree']);
  const sourceStatus = sourceIsGitWorktree
    ? runGit(plan.projectPath, ['status', '--short']).trim()
    : null;
  const branchExists = sourceIsGitWorktree
    ? commandSucceeds(plan.projectPath, ['show-ref', '--verify', '--quiet', `refs/heads/${plan.branch}`])
    : false;
  const linkedWorktreePathExists = fs.existsSync(plan.linkedWorktreePath);
  const runtimeRootExists = fs.existsSync(plan.runtimeRoot);

  const report = {
    ok: true,
    mode: 'v1-dogfood-linked-worktree-runner',
    execute: plan.execute,
    willMutate: plan.execute,
    neverRuns: ['commit-package', 'local commit', 'push', 'merge', 'release-package', 'close-out'],
    plan: {
      branch: plan.branch,
      linkedWorktreePath: plan.linkedWorktreePath,
      projectPath: plan.projectPath,
      runtimeRoot: plan.runtimeRoot,
      skipReviewer: plan.skipReviewer,
      slug: plan.slug,
    },
    safety: {
      branchExists,
      linkedWorktreePathExists,
      runtimeRootExists,
      sourceGitWorktree: sourceIsGitWorktree,
      sourceStatus: sourceStatus || 'clean',
    },
  };

  if (!sourceIsGitWorktree) {
    report.ok = false;
    report.error = `project_path is not a git worktree: ${plan.projectPath}`;
  }

  if (!plan.execute) {
    return report;
  }

  if (!options.explicitSlug) {
    throw new Error('--execute requires an explicit --slug so the linked worktree name is operator chosen');
  }

  if (!sourceIsGitWorktree) {
    throw new Error(report.error);
  }

  if (sourceStatus) {
    throw new Error(`--execute requires a clean source repo before creating a linked worktree: ${sourceStatus}`);
  }

  if (branchExists) {
    throw new Error(`--execute refused existing linked worktree branch: ${plan.branch}`);
  }

  if (linkedWorktreePathExists) {
    throw new Error(`--execute refused existing linked worktree path: ${plan.linkedWorktreePath}`);
  }

  if (runtimeRootExists) {
    throw new Error(`--execute refused existing runtime root: ${plan.runtimeRoot}`);
  }

  return report;
}

async function allocatePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

function startUiServer({ port, runtimeRoot }) {
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let stderr = '';
  let stdout = '';

  server.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  return {
    async stop() {
      server.kill('SIGTERM');
      await delay(150);

      if (server.exitCode === null) {
        server.kill('SIGKILL');
      }

      if (stderr.trim()) {
        process.stderr.write(stderr);
      }

      if (server.exitCode !== 0 && stdout.trim()) {
        process.stdout.write(stdout);
      }
    },
  };
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the temporary local server is ready.
    }

    await delay(200);
  }

  throw new Error(`Timed out waiting for UI server: ${baseUrl}`);
}

async function fetchJson(baseUrl, pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `GET ${pathname} failed: ${response.status}`);
  }

  return payload;
}

async function postJson(baseUrl, pathname, body = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `POST ${pathname} failed: ${response.status}`);
  }

  return payload;
}

function listTaskArtifacts(snapshot, taskId) {
  return Object.values(snapshot.artifacts || {})
    .filter((artifact) => artifact.taskId === taskId)
    .sort((left, right) => String(left.createdAt || '').localeCompare(String(right.createdAt || '')))
    .map((artifact) => ({
      id: artifact.id,
      runId: artifact.runId || null,
      type: artifact.type,
    }));
}

function listTaskRuns(snapshot, taskId) {
  return Object.values(snapshot.runs || {})
    .filter((run) => run.taskId === taskId)
    .sort((left, right) => String(left.startedAt || '').localeCompare(String(right.startedAt || '')))
    .map((run) => ({
      executionMode: run.executionMode || null,
      id: run.id,
      role: run.role,
      status: run.status,
    }));
}

async function executeDogfood(plan) {
  const port = plan.port || (await allocatePort());
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startUiServer({ port, runtimeRoot: plan.runtimeRoot });

  try {
    await waitForServer(baseUrl);

    const rootProjectPayload = await postJson(baseUrl, '/api/projects', {
      name: `v1 dogfood root ${plan.slug}`,
      projectPath: plan.projectPath,
    });
    const rootProject = rootProjectPayload.project;

    const linkedPayload = await postJson(
      baseUrl,
      `/api/projects/${encodeURIComponent(rootProject.id)}/linked-worktrees`,
      { slug: plan.slug },
    );
    const linkedProject = linkedPayload.project;

    const missionPayload = await postJson(baseUrl, '/api/missions', {
      autoDraftCouncil: true,
      constraints:
        'Use local-stub only, mutate only the isolated linked worktree, and do not commit, push, merge, release, or close out.',
      deliverableType: 'dogfood evidence',
      goal:
        'Verify the v1 mission, council, builder approval, linked worktree mutation, artifact bundle, and reviewer flow through the repo-native dogfood runner.',
      title: `V1 linked worktree dogfood ${plan.slug}`,
    });
    const missionId = missionPayload.mission.id;

    const councilPayload = await postJson(
      baseUrl,
      `/api/missions/${encodeURIComponent(missionId)}/approve-council`,
    );
    const taskId = councilPayload.mutation.taskId;
    const approvalId = councilPayload.mutation.approvalId;
    const inboxItemId = councilPayload.mutation.autoChain.stageResults.find(
      (stage) => stage.stage === 'request-builder-live-mutation-approval',
    )?.inboxItemId;

    if (!taskId || !approvalId || !inboxItemId) {
      throw new Error('Auto-chain did not stop at builder live mutation approval');
    }

    await postJson(baseUrl, `/api/decision-inbox/${encodeURIComponent(inboxItemId)}/actions`, {
      verb: 'approve',
    });

    const mutationPayload = await postJson(
      baseUrl,
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`,
    );

    const reviewerPayload = plan.skipReviewer
      ? null
      : await postJson(baseUrl, `/api/tasks/${encodeURIComponent(taskId)}/run-reviewer`);
    const finalPayload = await fetchJson(baseUrl, '/api/snapshot');
    const finalSnapshot = finalPayload.snapshot;
    const task = finalSnapshot.tasks?.[taskId] || null;
    const artifacts = listTaskArtifacts(finalSnapshot, taskId);
    const runs = listTaskRuns(finalSnapshot, taskId);
    const approval = finalSnapshot.approvals?.[approvalId] || null;
    const linkedStatus = runGit(linkedProject.projectPath, ['status', '--short']).trim();

    return {
      ok: true,
      mode: 'v1-dogfood-linked-worktree-runner',
      execute: true,
      baseUrl,
      project: {
        id: rootProject.id,
        projectPath: rootProject.projectPath,
      },
      linkedWorktree: {
        branch: linkedPayload.linkedWorktree.branch,
        path: linkedPayload.linkedWorktree.path,
        projectId: linkedProject.id,
        status: linkedStatus || 'clean',
      },
      mission: {
        councilSessionId: councilPayload.mutation.councilSessionId,
        id: missionId,
      },
      task: {
        id: taskId,
        lifecycleState: task?.lifecycleState || null,
        reviewStatus: task?.review?.status || null,
      },
      approval: {
        consumedByRunId: approval?.metadata?.consumedByRunId || null,
        id: approvalId,
        status: approval?.status || null,
      },
      builderLiveMutation: {
        artifactId: mutationPayload.mutation.artifactId,
        changedFiles: mutationPayload.mutation.changedFiles || [],
        diffArtifactId: mutationPayload.mutation.diffArtifactId,
        patchArtifactId: mutationPayload.mutation.patchArtifactId,
        runId: mutationPayload.mutation.runId,
      },
      reviewer: reviewerPayload
        ? {
            artifactId: reviewerPayload.mutation.artifactId,
            mappedReviewStatus: reviewerPayload.mutation.mappedReviewStatus,
            rawVerdict: reviewerPayload.mutation.rawVerdict,
            runId: reviewerPayload.mutation.runId,
            sourceRunId: reviewerPayload.mutation.sourceRunId,
          }
        : null,
      artifacts,
      runs,
      neverRan: ['commit-package', 'local commit', 'push', 'merge', 'release-package', 'close-out'],
    };
  } finally {
    await server.stop();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const plan = buildPlan(options);
  const preflight = preflightPlan(plan, options);

  if (!plan.execute) {
    console.log(JSON.stringify(preflight, null, 2));
    return;
  }

  const result = await executeDogfood(plan);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
