import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const retainedDogfoodWorktrees = [
  {
    branch: 'worktree/v1-dogfood-run-002',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-002',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-run-002'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-001',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-004',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-001',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-001'),
  },
];

function runGit(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runGitOrNull(cwd, args) {
  try {
    return runGit(cwd, args);
  } catch (_error) {
    return null;
  }
}

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

function readTextOrEmpty(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_error) {
    return '';
  }
}

function inspectDogfoodWorktree(entry) {
  const exists = pathExists(entry.path);
  const currentBranch = exists ? runGitOrNull(entry.path, ['branch', '--show-current']) : null;
  const statusShort = exists ? runGitOrNull(entry.path, ['status', '--short']) || '' : '';
  const expectedDirtyFilePath = path.join(entry.path, entry.expectedDirtyFile);
  const expectedDirtyFileContent = exists ? readTextOrEmpty(expectedDirtyFilePath) : '';
  const hasExpectedMarker = expectedDirtyFileContent.includes(
    '<!-- builder-live-mutation approval-0001 prompts/builder.md -->',
  );
  const hasExpectedDirtyFile = statusShort
    .split('\n')
    .some((line) => line.trim() === `M ${entry.expectedDirtyFile}`);
  const runtimeRootIgnored = pathExists(entry.runtimeRoot);

  return {
    ...entry,
    cleanupApprovalRequired: true,
    cleanupCommandsPreview: [
      `git worktree remove ${JSON.stringify(entry.path)}`,
      `git branch -D ${JSON.stringify(entry.branch)}`,
    ],
    currentBranch,
    dirtyByDesign: hasExpectedDirtyFile && hasExpectedMarker,
    exists,
    expectedDirtyFileExists: pathExists(expectedDirtyFilePath),
    hasExpectedDirtyFile,
    hasExpectedMarker,
    runtimeRootExists: runtimeRootIgnored,
    statusShort: statusShort || 'clean',
  };
}

const mainStatusShort = runGitOrNull(repoRoot, ['status', '--short']) || '';
const worktrees = retainedDogfoodWorktrees.map(inspectDogfoodWorktree);
const missingEvidence = worktrees.filter((entry) => !entry.exists || !entry.dirtyByDesign);
const cleanupBlockedUntilApproval = worktrees.some((entry) => entry.exists);

const report = {
  ok: missingEvidence.length === 0,
  mode: 'v1-dogfood-evidence-inventory',
  cleanupBlockedUntilApproval,
  cleanupPolicy: {
    destructive: true,
    requiresExplicitOperatorApproval: true,
    runnerExecutesCleanup: false,
  },
  main: {
    path: repoRoot,
    statusShort: mainStatusShort || 'clean',
  },
  retainedDogfoodWorktrees: worktrees,
  failures: missingEvidence.map((entry) => ({
    id: entry.id,
    exists: entry.exists,
    dirtyByDesign: entry.dirtyByDesign,
    hasExpectedDirtyFile: entry.hasExpectedDirtyFile,
    hasExpectedMarker: entry.hasExpectedMarker,
    path: entry.path,
  })),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
