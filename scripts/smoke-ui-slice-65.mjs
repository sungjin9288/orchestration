import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');

const statusOutput = execFileSync('git', ['status', '--short'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

const lines = statusOutput
  .split('\n')
  .map((line) => line.trimEnd())
  .filter(Boolean);

const trackedModified = [];
const untracked = [];

for (const line of lines) {
  const code = line.slice(0, 2);
  const file = line.slice(3);
  if (code === ' M') {
    trackedModified.push(file);
    continue;
  }
  if (code === '??') {
    untracked.push(file);
    continue;
  }
  throw new Error(`Unexpected git status entry: ${line}`);
}

const trackedBuckets = {
  // The 2026-04 dirty baseline was committed; every cleanup-readiness bucket is now empty.
  policyContracts: [],
  runtimeRetention: [],
  shellUi: [],
  browserCoverage: [],
};

const untrackedBuckets = {
  pivotDocs: [],
  retentionSmokes: [],
  uiSliceSmokes: [],
};

const expectedTracked = Object.values(trackedBuckets).flat().sort();
const expectedUntracked = Object.values(untrackedBuckets).flat().sort();

assert.deepEqual([...trackedModified].sort(), expectedTracked, 'Tracked modified inventory drifted from cleanup-readiness buckets.');
assert.deepEqual([...untracked].sort(), expectedUntracked, 'Untracked inventory drifted from cleanup-readiness buckets.');

assert.equal(trackedBuckets.policyContracts.length, 0);
assert.equal(trackedBuckets.runtimeRetention.length, 0);
assert.equal(trackedBuckets.shellUi.length, 0);
assert.equal(trackedBuckets.browserCoverage.length, 0);
assert.equal(untrackedBuckets.pivotDocs.length, 0);
assert.equal(untrackedBuckets.retentionSmokes.length, 0);
assert.equal(untrackedBuckets.uiSliceSmokes.length, 0);

assert.match(
  todo,
  /`scripts\/smoke-ui-slice-65\.mjs` now pins the cleanup-readiness inventory for that same dirty baseline: tracked modifications are bucketed into `policy\/contracts`, `runtime\/retention`, `shell\/ui`, and `browser coverage`, while untracked files stay bucketed as `pivot docs`, `retention smokes`, and `ui slice smokes` so future hygiene work can stage by bucket instead of ad-hoc file picking/,
);
assert.match(
  lessons,
  /dirty worktree를 실제로 정리할 시점이 오더라도 파일 하나씩 ad-hoc으로 고르기보다 `policy\/contracts`, `runtime\/retention`, `shell\/ui`, `browser coverage`, `docs\/smokes`처럼 stable bucket inventory를 먼저 고정해 두는 편이 staging 실수와 cleanup drift를 줄이기 쉬웠다\./,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      trackedBuckets: Object.fromEntries(
        Object.entries(trackedBuckets).map(([name, files]) => [name, files.length]),
      ),
      untrackedBuckets: Object.fromEntries(
        Object.entries(untrackedBuckets).map(([name, files]) => [name, files.length]),
      ),
    },
    null,
    2,
  ),
);
