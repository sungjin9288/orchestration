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
assert.match(dogfood, /does not stage, commit, push, publish, or merge/);
assert.match(dogfood, /operator-approved mutation/);
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
assert.match(dogfood, /## Dogfood Run 002/);
assert.match(dogfood, /Recorded at `2026-04-29 15:42:02 \+0900` on local `main`/);
assert.match(dogfood, /fa326814442b01c74b3ead245209857c8b8da109/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-run-002`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-run-002`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-run-002`/);
assert.match(dogfood, /source git status after run: clean tree with `main\.\.\.origin\/main \[ahead 9\]`/);
assert.match(dogfood, /linked worktree status after run: dirty by design, `prompts\/builder\.md` modified/);
assert.match(dogfood, /commit state: no commit was performed/);
assert.match(dogfood, /Approved pending approval `approval-0001` through `decisionInboxItem-0001`/);
assert.match(dogfood, /builder:live-mutation/);
assert.match(dogfood, /artifact-0005` change-summary, `artifact-0006` patch, `artifact-0007` diff/);
assert.match(dogfood, /changed files: `prompts\/builder\.md`/);
assert.match(dogfood, /consumed by `run-0005`/);
assert.match(dogfood, /next stage: `reviewer`/);
assert.match(dogfood, /builder-live-mutation approval-0001 prompts\/builder\.md/);
assert.match(dogfood, /Current `main` stayed clean; mutation was isolated to the linked worktree/);
assert.match(dogfood, /The local-stub builder mutation is intentionally low-signal/);
assert.match(dogfood, /Review the linked worktree mutation through reviewer flow/);
assert.match(dogfood, /Do not commit the linked worktree mutation unless/);
assert.match(dogfood, /## Dogfood Run 003/);
assert.match(dogfood, /Recorded at `2026-04-29 16:05:08 \+0900` on local `main`/);
assert.match(dogfood, /dd8527e86945506988231ef1e8518f023d5ba27e/);
assert.match(dogfood, /temporary API reviewer dogfood runner/);
assert.match(dogfood, /no `runtime-v1-dogfood-run-002`, `60459`, `59138`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /source git status after run: clean tree with `main\.\.\.origin\/main \[ahead 10\]`/);
assert.match(dogfood, /still dirty by design, `prompts\/builder\.md` modified/);
assert.match(dogfood, /no linked worktree commit was performed/);
assert.match(dogfood, /successful builder live mutation `run-0005`/);
assert.match(dogfood, /\/api\/tasks\/task-0001\/run-reviewer/);
assert.match(dogfood, /review artifact `artifact-0008`/);
assert.match(dogfood, /moved to `Review` with review status `passed`/);
assert.match(dogfood, /commit-package readiness is now allowed/);
assert.match(dogfood, /reviewer run: `run-0006`/);
assert.match(dogfood, /raw verdict: `pass`/);
assert.match(dogfood, /next stage: `human gate`/);
assert.match(dogfood, /run roles: `planner`, `architect`, `task-breaker`, `builder:preflight`, `builder:live-mutation`, `reviewer`/);
assert.match(dogfood, /artifact types: `plan`, `architecture`, `breakdown`, `preflight`, `change-summary`, `patch`, `diff`, `review`/);
assert.match(dogfood, /commit package readiness: allowed with source review artifact `artifact-0008`/);
assert.match(dogfood, /Reviewer Report: V1 dogfood linked worktree live mutation/);
assert.match(dogfood, /Route to human gate after review/);
assert.match(dogfood, /Reviewer anchoring worked/);
assert.match(dogfood, /Task review state advanced to `passed`/);
assert.match(dogfood, /Do not promote the local-stub marker mutation as implementation output/);
assert.match(dogfood, /convert the reusable API dogfood runner into a repo-native script/);
assert.match(dogfood, /## Repo-native Dogfood Runner/);
assert.match(dogfood, /scripts\/v1-dogfood-linked-worktree-runner\.mjs/);
assert.match(dogfood, /defaults to non-mutating `--dry-run`/);
assert.match(dogfood, /`--execute --slug <slug>`/);
assert.match(dogfood, /refuses an existing linked worktree path/);
assert.match(dogfood, /dirty source repo/);
assert.match(dogfood, /never runs `commit-package`, `local commit`, `push`, `merge`, `release-package`, or `close-out`/);
assert.match(dogfood, /The retained worktrees and branches were removed only after explicit operator cleanup approval/);
assert.match(dogfood, /## Dogfood Run 004/);
assert.match(dogfood, /Recorded at `2026-04-29 16:19:39 \+0900` on local `main`/);
assert.match(dogfood, /d2076aef100d915969b73addbc7d8d082423175d/);
assert.match(dogfood, /node scripts\/v1-dogfood-linked-worktree-runner\.mjs --execute --slug v1-dogfood-runner-001/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-runner-001`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-001`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-runner-v1-dogfood-runner-001`/);
assert.match(dogfood, /listener cleanup: no `runtime-v1-dogfood-runner-v1-dogfood-runner-001`, `61654`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /source git status after run: clean tree with `main\.\.\.origin\/main \[ahead 12\]`/);
assert.match(dogfood, /linked worktree status after run: dirty by design, `prompts\/builder\.md` modified/);
assert.match(dogfood, /Ran the repo-native dogfood runner in explicit execute mode/);
assert.match(dogfood, /project-0002` at `worktree\/v1-dogfood-runner-001`/);
assert.match(dogfood, /Consumed builder live-mutation approval `approval-0001`|consumed builder live-mutation approval `approval-0001`/);
assert.match(dogfood, /builder live mutation run: `run-0005`/);
assert.match(dogfood, /reviewer run: `run-0006`/);
assert.match(dogfood, /reviewer source run: `run-0005`/);
assert.match(dogfood, /reviewer raw verdict: `pass`/);
assert.match(dogfood, /never ran: `commit-package`, `local commit`, `push`, `merge`, `release-package`, `close-out`/);
assert.match(dogfood, /The repo-native runner self-dogfood passed/);
assert.match(dogfood, /Retained dogfood linked worktree cleanup has completed after explicit operator approval/);
assert.match(dogfood, /## Dogfood Run 005/);
assert.match(dogfood, /Recorded at `2026-04-29 19:22:17 \+0900` on local `main`/);
assert.match(dogfood, /b62618b96cf54295097ba00ccd15f8abf3677b32/);
assert.match(dogfood, /node scripts\/v1-dogfood-linked-worktree-runner\.mjs --execute --slug v1-dogfood-runner-002/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-runner-002`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-002`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-runner-v1-dogfood-runner-002`/);
assert.match(dogfood, /listener cleanup: no `runtime-v1-dogfood-runner-v1-dogfood-runner-002`, `52378`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /source git status after run: clean tree with `main\.\.\.origin\/main`/);
assert.match(dogfood, /linked worktree status after run: dirty by design, `prompts\/builder\.md` modified/);
assert.match(dogfood, /push state: no push was required for source `main`/);
assert.match(dogfood, /no linked worktree commit was performed/);
assert.match(dogfood, /operator-chosen slug `v1-dogfood-runner-002`/);
assert.match(dogfood, /project-0002` at `worktree\/v1-dogfood-runner-002`/);
assert.match(dogfood, /builder live mutation run: `run-0005`/);
assert.match(dogfood, /reviewer run: `run-0006`/);
assert.match(dogfood, /reviewer source run: `run-0005`/);
assert.match(dogfood, /reviewer raw verdict: `pass`/);
assert.match(dogfood, /never ran: `commit-package`, `local commit`, `push`, `merge`, `release-package`, `close-out`/);
assert.match(dogfood, /Dogfood Run 005 retained linked worktree cleanup has completed after explicit operator approval/);
assert.match(dogfood, /Dogfood Run 005 worktree removed/);
assert.match(dogfood, /## Dogfood Run 006/);
assert.match(dogfood, /Recorded at `2026-04-30 10:49:50 \+0900` on published `main`/);
assert.match(dogfood, /175403dcc165cb4b8750ec60b14eace637a56912/);
assert.match(dogfood, /node scripts\/v1-dogfood-linked-worktree-runner\.mjs --execute --slug v1-dogfood-runner-003/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-runner-003`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-003`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-runner-v1-dogfood-runner-003`/);
assert.match(dogfood, /listener cleanup: no `runtime-v1-dogfood-runner-v1-dogfood-runner-003`, `56028`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /operator-approved slug `v1-dogfood-runner-003`/);
assert.match(dogfood, /project-0002` at `worktree\/v1-dogfood-runner-003`/);
assert.match(dogfood, /Dogfood Run 006 retained linked worktree cleanup has completed after explicit operator approval/);
assert.match(dogfood, /Dogfood Run 006 worktree removed/);
assert.match(dogfood, /## Dogfood Run 007/);
assert.match(dogfood, /Recorded at `2026-04-30 20:39:45 \+0900` on published `main`/);
assert.match(dogfood, /3498832bc1a17c13568bcffe074e47485982f20e/);
assert.match(dogfood, /node scripts\/v1-dogfood-linked-worktree-runner\.mjs --execute --slug v1-dogfood-runner-004/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-runner-004`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-004`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-runner-v1-dogfood-runner-004`/);
assert.match(dogfood, /listener cleanup: no `runtime-v1-dogfood-runner-v1-dogfood-runner-004`, `61829`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /operator-approved slug `v1-dogfood-runner-004`/);
assert.match(dogfood, /project-0002` at `worktree\/v1-dogfood-runner-004`/);
assert.match(dogfood, /Dogfood Run 007 retained linked worktree cleanup has completed after explicit operator approval/);
assert.match(dogfood, /Dogfood Run 007 worktree removed/);
assert.match(dogfood, /## Dogfood Run 008/);
assert.match(dogfood, /Recorded at `2026-04-30 23:00:37 \+0900` on published `main`/);
assert.match(dogfood, /68d235db5066b11e6ef1805e0210f4f3d52f4035/);
assert.match(dogfood, /node scripts\/v1-dogfood-linked-worktree-runner\.mjs --execute --slug v1-dogfood-runner-005/);
assert.match(dogfood, /linked worktree branch: `worktree\/v1-dogfood-runner-005`/);
assert.match(dogfood, /linked worktree path: `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-005`/);
assert.match(dogfood, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-v1-dogfood-runner-v1-dogfood-runner-005`/);
assert.match(dogfood, /listener cleanup: no `runtime-v1-dogfood-runner-v1-dogfood-runner-005`, `51931`, `4315`, or `59006` listener remained/);
assert.match(dogfood, /operator-approved slug `v1-dogfood-runner-005`/);
assert.match(dogfood, /project-0002` at `worktree\/v1-dogfood-runner-005`/);
assert.match(dogfood, /Dogfood Run 008 retained linked worktree cleanup is pending explicit operator approval/);
assert.match(dogfood, /Dogfood Run 008 worktree retained/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1DogfoodTriage: {
        document: 'docs/16_v1-dogfood-triage.md',
        run: 'Dogfood Run 008',
        result: 'pass',
        nextAction: 'Dogfood Run 008 retained linked worktree cleanup pending explicit operator approval',
      },
    },
    null,
    2,
  ),
);
