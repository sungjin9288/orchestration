import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(runbook, /^# V1 Start Runbook/m);
assert.match(runbook, /does not stage, commit, push, publish, merge, or widen runtime behavior/);
assert.match(runbook, /Frozen v1 control-plane baseline is complete/);
assert.match(runbook, /Mission \/ Council \/ Execution \/ Deliverables/);
assert.match(runbook, /Preview-only repo-content redaction/);
assert.match(runbook, /Taskboard \/ Logs \/ Artifacts \/ Decision Inbox/);
assert.match(runbook, /push remains a separate approval-sensitive action/);
assert.match(runbook, /blocked_missing_host_llm_credentials/);

for (const command of [
  'git status --short --branch',
  'git diff --check',
  'node scripts/ui_qa_status.mjs',
  'node scripts/harness_verification_status.mjs',
  'node scripts/verification_status.mjs',
  'node scripts/smoke-qa-slice-07.mjs',
]) {
  assert.match(runbook, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(runbook, /## Latest Local Readiness Evidence/);
assert.match(runbook, /Recorded at `2026-04-29 01:21:17 \+0900` on local `main`/);
assert.match(runbook, /This evidence was collected before this readiness-record documentation update/);
assert.match(runbook, /88819f9a859f97624f0f64569b05b9a7742682ec/);
assert.match(runbook, /repo status: clean tree with `main\.\.\.origin\/main \[ahead 7\]`/);
assert.match(runbook, /`node scripts\/ui_qa_status\.mjs`: pass, `16\/16` required checks/);
assert.match(runbook, /`node scripts\/harness_verification_status\.mjs`: pass, `44\/44` checks/);
assert.match(runbook, /`node scripts\/smoke-qa-slice-07\.mjs`: pass/);
assert.match(runbook, /runtimeRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/var\/runtime-qa-slice-07`/);
assert.match(runbook, /outputRoot: `\/Users\/sungjin\/dev\/personal\/orchestration\/output\/playwright\/qa-slice-07`/);
assert.match(runbook, /`run-0005` builder, `run-0006` reviewer/);
assert.match(runbook, /`artifact-0005` change summary, `artifact-0006` patch, `artifact-0007` diff, `artifact-0008` review/);
assert.match(runbook, /listener check: no `runtime-qa-slice-07`, `59006`, or `4315` listener remained/);
assert.match(runbook, /push state: deferred; no push was performed/);
assert.match(runbook, /follow-up: start `v1 dogfood result triage`/);
assert.match(runbook, /## Post-Dogfood Local Handoff Evidence/);
assert.match(runbook, /Recorded at `2026-04-29 16:34:42 \+0900` on local `main`/);
assert.match(runbook, /5f8f4778aa22d2a94ccc569628f96487e3a4918f/);
assert.match(runbook, /repo status: clean tree with `main\.\.\.origin\/main \[ahead 14\]`/);
assert.match(runbook, /dogfood triage status: `Dogfood Run 001` through `Dogfood Run 005` recorded/);
assert.match(runbook, /scripts\/v1-dogfood-linked-worktree-runner\.mjs` defaults to `--dry-run`/);
assert.match(runbook, /execute mode requires explicit `--execute --slug <slug>`/);
assert.match(runbook, /Dogfood Run 004` passed through linked worktree creation, approval consumption, builder live mutation, reviewer, and artifact bundle capture/);
assert.match(runbook, /node scripts\/v1-dogfood-evidence-inventory\.mjs` returned `ok=true`/);
assert.match(runbook, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-run-002/);
assert.match(runbook, /\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-001/);
assert.match(runbook, /both are dirty by design with `prompts\/builder\.md` marker mutation/);
assert.match(runbook, /Dogfood Run 002, Run 004, and Run 005 cleanup was completed after explicit operator approval/);
assert.match(runbook, /`node scripts\/verification_status\.mjs`: pass, `1\/1` required checks and `7\/7` informational checks/);
assert.match(runbook, /follow-up: push and retained dogfood cleanup were completed/);
assert.match(runbook, /node scripts\/smoke-provider-live-slice-05\.mjs/);
assert.match(runbook, /node scripts\/smoke-qa-live-slice-07\.mjs/);
assert.match(runbook, /scripts\/smoke-openspace-slice-03\.mjs/);
assert.match(runbook, /V1 dogfood result triage has been recorded through Dogfood Run 001 through Dogfood Run 005/);
assert.match(runbook, /Current local completion is now represented by `node scripts\/v1-local-completion-status\.mjs`/);
assert.match(runbook, /Default next action without approval/);
assert.match(runbook, /defer push/);
assert.match(runbook, /Explicit approval-gated next actions/);
assert.match(runbook, /push is complete/);
assert.match(runbook, /Dogfood Run 002, Run 004, and Run 005 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /run another intentional `--execute --slug <slug>` dogfood pass/);
assert.match(runbook, /Do not reopen the already-completed preview-only artifact redaction policy/);
assert.match(handoff, /current local v1 development baseline is complete on `main`/);
assert.match(handoff, /node scripts\/v1-local-completion-status\.mjs` reports `localDevelopmentComplete=true`/);
assert.match(handoff, /The next action is no longer an implementation backlog item by default/);
assert.match(handoff, /push had completed before the retained cleanup documentation update/);
assert.match(handoff, /Dogfood Run 002, Run 004, and Run 005 retained dogfood linked worktree cleanup has completed/);
assert.match(handoff, /approve another intentional `--execute --slug <slug>` dogfood run/);
assert.match(handoff, /preview-only artifact redaction policy is already implemented/);

assert.match(verificationStatus, /v1-start-runbook/);
assert.match(verificationStatus, /scripts\/smoke-v1-start-runbook\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1StartRunbook: {
        document: 'docs/15_v1-start-runbook.md',
        requiredGatePinned: true,
        pushDeferredBoundaryPinned: true,
        openSpaceCredentialBoundaryPinned: true,
        nextPriorityPinned: 'approval-gated operator choices after completed dogfood triage',
      },
    },
    null,
    2,
  ),
);
