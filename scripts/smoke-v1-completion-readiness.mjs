import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const readinessPath = path.join(repoRoot, 'docs', '17_v1-completion-readiness.md');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');
const todoPath = path.join(repoRoot, 'tasks', 'todo.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const readiness = fs.readFileSync(readinessPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');
const todo = fs.readFileSync(todoPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(readiness, /^# V1 Planned Feature Completion Readiness/m);
assert.match(readiness, /not a new feature plan/);
assert.match(readiness, /833d2735534609d91546f5fb9a3a7420b33e9f9d/);
assert.match(readiness, /Recorded Published Proof Snapshot/);
assert.match(readiness, /9f216e6ef4c35fcad60008c1d833877435c4e13a/);
assert.match(readiness, /verified at: `2026-05-26 15:09:48 \+0900`/);
assert.match(readiness, /git status: `## main\.\.\.origin\/main`/);
assert.match(readiness, /localDevelopmentComplete=true/);
assert.match(readiness, /kickoffReady=true/);
assert.match(readiness, /cleanupCompleted=true/);
assert.match(readiness, /aggregate verification: `node scripts\/verification_status\.mjs` passed `12\/12` checks/);
assert.match(readiness, /`12\/12` is the historical count for this recorded proof snapshot/);
assert.match(readiness, /current aggregate count must be read from `node scripts\/verification_status\.mjs` on the current\s+repository head/);
assert.match(
  readiness,
  /do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue/,
);

for (const anchor of [
  'Local-first, single-user-first, ops-first control plane',
  'Mission / Council / Execution / Deliverables',
  'Taskboard / Logs / Artifacts / Decision Inbox',
  'planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer',
  'openai-responses',
  'Harness-first posture and Hermes internal composition',
  'Dogfood Run 121 cleanup',
  'Issue-driven implementation entry gate',
]) {
  assert.match(readiness, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.doesNotMatch(
  readiness,
  /Dogfood lifecycle and cleanup evidence[^\n]*Complete through Dogfood Run 113 cleanup/,
);

for (const command of [
  'node scripts/v1-local-completion-status.mjs',
  'node scripts/v1-kickoff-status.mjs',
  'node scripts/v1-kickoff-evidence-triage.mjs',
  'node scripts/v1-dogfood-evidence-inventory.mjs',
  'node scripts/verification_status.mjs',
  'node scripts/ui_qa_status.mjs',
  'node scripts/smoke-v1-user-flow-kickoff.mjs',
  'node scripts/harness_verification_status.mjs',
  'node scripts/hermes-agent-internal-harness-status.mjs',
]) {
  assert.match(readiness, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(readiness, /optional real-live provider reruns/);
assert.match(readiness, /run-another-dogfood-execute/);
assert.match(readiness, /future vNext feature expansion/);
assert.match(readiness, /Do not open a new implementation slice/);

assert.match(runbook, /docs\/17_v1-completion-readiness\.md/);
assert.match(handoff, /docs\/17_v1-completion-readiness\.md/);
assert.doesNotMatch(runbook, /Current planned feature completion evidence was captured at baseline head/);
assert.match(runbook, /Recorded planned feature completion evidence was captured at baseline head `833d2735534609d91546f5fb9a3a7420b33e9f9d`/);
assert.doesNotMatch(handoff, /current handoff point for deciding whether the planned V1 and post-v1 company shell feature set is complete/i);
assert.match(handoff, /active handoff reference for deciding whether the planned V1 and post-v1 company shell feature set is complete/);
assert.match(runbook, /recorded proof head `9f216e6ef4c35fcad60008c1d833877435c4e13a`/);
assert.match(runbook, /current repository head still must be validated/);
assert.match(handoff, /recorded published proof head `9f216e6ef4c35fcad60008c1d833877435c4e13a`/);
assert.match(handoff, /not self-referential current-head claims/);
assert.match(todo, /v1-planned-feature-completion-readiness-post-m7-736/);
assert.match(todo, /v1-completion-published-head-proof-post-m7-737/);
assert.match(todo, /v1-completion-handoff-proof-language-post-m7-738/);
assert.match(todo, /v1-completion-dogfood-lifecycle-anchor-post-m7-760/);
assert.match(verificationStatus, /v1-completion-readiness/);
assert.match(verificationStatus, /scripts\/smoke-v1-completion-readiness\.mjs/);
assert.match(verificationStatus, /v1-review-passed-deliverables-routing/);
assert.match(verificationStatus, /scripts\/smoke-ui-slice-638\.mjs/);
assert.match(readiness, /review\.status=passed/);
assert.match(readiness, /approval\.status=approved/);
assert.match(readiness, /scripts\/smoke-ui-slice-638\.mjs/);
assert.match(readiness, /UI shell, advanced-ops, or first user-flow completion proof/);
assert.match(readiness, /current head before UI shell/);
assert.match(readiness, /Harness\/Hermes completion claim/);
assert.match(readiness, /close-out evidence/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1CompletionReadiness: {
        document: 'docs/17_v1-completion-readiness.md',
        baselineHead: '833d273',
        recordedProofHead: '9f216e6',
        implementationGate:
          'do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue',
      },
    },
    null,
    2,
  ),
);
