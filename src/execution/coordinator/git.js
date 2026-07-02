'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { normalizeRelativePath } = require('./paths');

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

function assertDedicatedLinkedWorktreeReady(input) {
  const actionLabel = input?.actionLabel || 'execution';
  const projectPath = String(input?.projectPath || '').trim();
  const expectedWorktreeRef = String(input?.worktreeRef || '').trim();

  if (!projectPath) {
    throw new Error('project_path is required');
  }

  if (!fs.existsSync(projectPath)) {
    throw new Error(`project_path does not exist: ${projectPath}`);
  }

  const resolvedProjectPath = fs.realpathSync(projectPath);
  let insideWorkTree = null;

  try {
    insideWorkTree = runGit(projectPath, ['rev-parse', '--is-inside-work-tree']).trim();
  } catch (_error) {
    throw new Error(`project_path is not a git worktree: ${projectPath}`);
  }

  if (insideWorkTree !== 'true') {
    throw new Error(`project_path is not a git worktree: ${projectPath}`);
  }

  const linkedWorktreeRoot = fs.realpathSync(runGit(projectPath, ['rev-parse', '--show-toplevel']).trim());
  const gitDir = fs.realpathSync(path.resolve(projectPath, runGit(projectPath, ['rev-parse', '--git-dir']).trim()));
  const gitCommonDir = fs.realpathSync(
    path.resolve(projectPath, runGit(projectPath, ['rev-parse', '--git-common-dir']).trim()),
  );
  const registeredWorktreeRoots = runGit(projectPath, ['worktree', 'list', '--porcelain'])
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length).trim())
    .filter(Boolean)
    .map((worktreePath) => fs.realpathSync(worktreePath));

  if (resolvedProjectPath !== linkedWorktreeRoot) {
    throw new Error(
      `project_path must point to the linked worktree root before ${actionLabel}: ${projectPath}`,
    );
  }

  if (gitDir === gitCommonDir) {
    throw new Error(
      `main worktree is blocked before ${actionLabel}; use a dedicated linked worktree root: ${projectPath}`,
    );
  }

  if (!registeredWorktreeRoots.includes(linkedWorktreeRoot)) {
    throw new Error(
      `project_path is not a registered linked worktree root before ${actionLabel}: ${projectPath}`,
    );
  }

  if (expectedWorktreeRef) {
    if (!fs.existsSync(expectedWorktreeRef)) {
      throw new Error(`task.worktreeRef does not exist before ${actionLabel}: ${expectedWorktreeRef}`);
    }

    const resolvedWorktreeRef = fs.realpathSync(expectedWorktreeRef);

    if (resolvedWorktreeRef !== linkedWorktreeRoot) {
      throw new Error(
        `task.worktreeRef must match the current linked worktree root before ${actionLabel}: expected=${resolvedWorktreeRef} actual=${linkedWorktreeRoot}`,
      );
    }
  }

  return {
    gitCommonDir,
    gitDir,
    linkedWorktreeRoot,
  };
}

module.exports = {
  assertDedicatedLinkedWorktreeReady,
  collectRepoChangeSet,
  ensureGitCommitEnvironment,
  normalizeRelativePath,
  parseGitPathLines,
  runGit,
};
