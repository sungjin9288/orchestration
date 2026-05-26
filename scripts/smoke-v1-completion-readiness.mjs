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
  'Dogfood Run 113 cleanup',
  'Issue-driven implementation entry gate',
]) {
  assert.match(readiness, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const command of [
  'node scripts/v1-local-completion-status.mjs',
  'node scripts/v1-kickoff-status.mjs',
  'node scripts/v1-kickoff-evidence-triage.mjs',
  'node scripts/v1-dogfood-evidence-inventory.mjs',
  'node scripts/verification_status.mjs',
]) {
  assert.match(readiness, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(readiness, /optional real-live provider reruns/);
assert.match(readiness, /run-another-dogfood-execute/);
assert.match(readiness, /future vNext feature expansion/);
assert.match(readiness, /Do not open a new implementation slice/);

assert.match(runbook, /docs\/17_v1-completion-readiness\.md/);
assert.match(handoff, /docs\/17_v1-completion-readiness\.md/);
assert.match(todo, /v1-planned-feature-completion-readiness-post-m7-736/);
assert.match(todo, /v1-completion-published-head-proof-post-m7-737/);
assert.match(verificationStatus, /v1-completion-readiness/);
assert.match(verificationStatus, /scripts\/smoke-v1-completion-readiness\.mjs/);

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
