import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dogfoodPath = path.join(repoRoot, 'docs', '16_v1-dogfood-triage.md');

const dogfood = fs.readFileSync(dogfoodPath, 'utf8');

assert.match(dogfood, /^# V1 Dogfood Triage/m);
assert.match(dogfood, /does not stage, commit, push, publish, merge, or approve downstream mutation/);
assert.match(dogfood, /## Dogfood Run 001/);
assert.match(dogfood, /Recorded at `2026-04-29 01:30:41 \+0900` on local `main`/);
assert.match(dogfood, /635878f6c95eadfd14c97885a94f3445c044789e/);
assert.match(dogfood, /project_path: `\/Users\/sungjin\/dev\/personal\/orchestration`/);
assert.match(dogfood, /provider mode: `local-stub`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-triage`/);
assert.match(dogfood, /result: pass/);
assert.match(dogfood, /git status after run: clean tree with `main\.\.\.origin\/main \[ahead 8\]`/);
assert.match(dogfood, /push state: deferred; no push was performed/);
assert.match(dogfood, /mission-0001/);
assert.match(dogfood, /councilSession-0001/);
assert.match(dogfood, /task-0001/);
assert.match(dogfood, /request-builder-live-mutation-approval/);
assert.match(dogfood, /waitingApproval=true/);
assert.match(dogfood, /run roles: `planner`, `architect`, `task-breaker`, `builder:preflight`/);
assert.match(dogfood, /artifact types: `plan`, `architecture`, `breakdown`, `preflight`/);
assert.match(dogfood, /approval-0001/);
assert.match(dogfood, /decisionInboxItem-0001/);
assert.match(dogfood, /No repo file was changed by the dogfood run/);
assert.match(dogfood, /No runtime listener remained after the run/);
assert.match(dogfood, /role=builder` with `executionMode=preflight`/);
assert.match(dogfood, /not a product regression/);
assert.match(dogfood, /isolated linked worktree/);
assert.match(dogfood, /convert the temporary runner into a repo-native smoke or dogfood script/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1DogfoodTriage: {
        document: 'docs/16_v1-dogfood-triage.md',
        run: 'Dogfood Run 001',
        result: 'pass',
        nextAction: 'operator-approved builder live mutation in an isolated linked worktree',
      },
    },
    null,
    2,
  ),
);
