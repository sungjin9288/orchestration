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
  {
    branch: 'worktree/v1-dogfood-runner-002',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-005',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-002',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-002'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-003',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-006',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-003',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-003'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-004',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-007',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-004',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-004'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-005',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-008',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-005',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-005'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-006',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-009',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-006',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-006'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-007',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-010',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-007',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-007'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-008',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-011',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-008',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-008'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-009',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-012',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-009',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-009'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-010',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-013',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-010',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-010'),
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
  const branchExists = runGitOrNull(repoRoot, ['show-ref', '--verify', '--quiet', `refs/heads/${entry.branch}`]) === '';
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
    branchExists,
    cleanupApprovalRequired: exists || branchExists,
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
const validEvidenceLifecycle = worktrees.every(
  (entry) => (entry.exists && entry.branchExists && entry.dirtyByDesign) || (!entry.exists && !entry.branchExists),
);
const retainedEvidenceAvailable = worktrees.some((entry) => entry.exists && entry.branchExists && entry.dirtyByDesign);
const cleanupCompleted = worktrees.every((entry) => !entry.exists && !entry.branchExists);
const unexpectedEvidenceState = worktrees.filter(
  (entry) => !((entry.exists && entry.branchExists && entry.dirtyByDesign) || (!entry.exists && !entry.branchExists)),
);
const cleanupBlockedUntilApproval = worktrees.some((entry) => entry.exists || entry.branchExists);

const report = {
  ok: validEvidenceLifecycle,
  mode: 'v1-dogfood-evidence-inventory',
  cleanupBlockedUntilApproval,
  cleanupCompleted,
  cleanupPolicy: {
    destructive: true,
    requiresExplicitOperatorApproval: true,
    runnerExecutesCleanup: false,
  },
  main: {
    path: repoRoot,
    statusShort: mainStatusShort || 'clean',
  },
  retainedEvidenceAvailable,
  retainedDogfoodWorktrees: worktrees,
  validEvidenceLifecycle,
  failures: unexpectedEvidenceState.map((entry) => ({
    branchExists: entry.branchExists,
    cleanupCompleted,
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
