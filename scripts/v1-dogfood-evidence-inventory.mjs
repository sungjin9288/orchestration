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
  {
    branch: 'worktree/v1-dogfood-runner-011',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-014',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-011',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-011'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-012',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-015',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-012',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-012'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-013',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-016',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-013',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-013'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-014',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-017',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-014',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-014'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-015',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-018',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-015',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-015'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-016',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-019',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-016',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-016'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-017',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-020',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-017',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-017'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-018',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-021',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-018',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-018'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-019',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-022',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-019',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-019'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-020',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-023',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-020',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-020'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-021',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-024',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-021',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-021'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-022',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-025',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-022',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-022'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-023',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-026',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-023',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-023'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-024',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-027',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-024',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-024'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-025',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-028',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-025',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-025'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-026',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-029',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-026',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-026'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-027',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-030',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-027',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-027'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-028',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-031',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-028',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-028'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-029',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-032',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-029',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-029'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-030',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-033',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-030',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-030'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-031',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-034',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-031',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-031'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-032',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-035',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-032',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-032'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-033',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-036',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-033',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-033'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-034',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-037',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-034',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-034'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-035',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-038',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-035',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-035'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-036',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-039',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-036',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-036'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-037',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-040',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-037',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-037'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-038',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-041',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-038',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-038'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-039',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-042',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-039',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-039'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-040',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-043',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-040',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-040'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-041',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-044',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-041',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-041'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-042',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-045',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-042',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-042'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-043',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-046',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-043',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-043'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-044',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-047',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-044',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-044'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-045',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-048',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-045',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-045'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-046',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-049',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-046',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-046'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-047',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-050',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-047',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-047'),
  },
  {
    branch: 'worktree/v1-dogfood-runner-048',
    expectedDirtyFile: 'prompts/builder.md',
    id: 'dogfood-run-051',
    path: '/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-048',
    runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-dogfood-runner-v1-dogfood-runner-048'),
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
