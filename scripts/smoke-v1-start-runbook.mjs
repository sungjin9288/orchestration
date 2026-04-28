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

assert.match(runbook, /node scripts\/smoke-provider-live-slice-05\.mjs/);
assert.match(runbook, /node scripts\/smoke-qa-live-slice-07\.mjs/);
assert.match(runbook, /scripts\/smoke-openspace-slice-03\.mjs/);
assert.match(runbook, /next development priority is v1 dogfood result triage/);
assert.match(runbook, /Do not reopen the already-completed preview-only artifact redaction policy/);
assert.match(handoff, /`v1 dogfood result triage`/);
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
        nextPriorityPinned: 'v1 dogfood result triage',
      },
    },
    null,
    2,
  ),
);
