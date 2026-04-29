import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runnerPath = path.join(repoRoot, 'scripts', 'v1-dogfood-linked-worktree-runner.mjs');
const dogfoodPath = path.join(repoRoot, 'docs', '16_v1-dogfood-triage.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const runner = fs.readFileSync(runnerPath, 'utf8');
const dogfood = fs.readFileSync(dogfoodPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(runner, /V1 linked worktree dogfood runner/);
assert.match(runner, /--dry-run/);
assert.match(runner, /--execute/);
assert.match(runner, /--execute requires an explicit --slug/);
assert.match(runner, /willMutate/);
assert.match(runner, /neverRuns/);
assert.match(runner, /commit-package/);
assert.match(runner, /local commit/);
assert.match(runner, /push/);
assert.match(runner, /release-package/);
assert.match(runner, /close-out/);
assert.match(runner, /\/api\/projects/);
assert.match(runner, /linked-worktrees/);
assert.match(runner, /\/api\/missions/);
assert.match(runner, /approve-council/);
assert.match(runner, /request-builder-live-mutation-approval/);
assert.match(runner, /decision-inbox/);
assert.match(runner, /run-builder-live-mutation/);
assert.match(runner, /run-reviewer/);
assert.match(runner, /refused existing linked worktree path/);
assert.match(runner, /refused existing linked worktree branch/);
assert.match(runner, /requires a clean source repo/);
assert.match(runner, /refused existing runtime root/);
assert.match(runner, /server\.kill\('SIGTERM'\)/);
assert.match(runner, /server\.kill\('SIGKILL'\)/);

assert.match(dogfood, /## Repo-native Dogfood Runner/);
assert.match(dogfood, /scripts\/v1-dogfood-linked-worktree-runner\.mjs/);
assert.match(dogfood, /defaults to non-mutating `--dry-run`/);
assert.match(dogfood, /`--execute --slug <slug>`/);
assert.match(dogfood, /refuses an existing linked worktree path/);
assert.match(dogfood, /never runs `commit-package`, `local commit`, `push`, `merge`, `release-package`, or `close-out`/);
assert.match(dogfood, /Dogfood Run 002 linked worktree remains dirty by design/);
assert.match(dogfood, /Dogfood Run 004 linked worktree remains dirty by design/);
assert.match(dogfood, /## Dogfood Run 004/);
assert.match(dogfood, /The repo-native runner self-dogfood passed/);
assert.match(dogfood, /Use `--dry-run` for routine runner safety checks/);

assert.match(verificationStatus, /v1-dogfood-runner/);
assert.match(verificationStatus, /scripts\/smoke-v1-dogfood-runner\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1DogfoodRunner: {
        document: 'docs/16_v1-dogfood-triage.md',
        runner: 'scripts/v1-dogfood-linked-worktree-runner.mjs',
        executeRequiresExplicitSlug: true,
        dryRunDefault: true,
        noCommitPushRelease: true,
      },
    },
    null,
    2,
  ),
);
