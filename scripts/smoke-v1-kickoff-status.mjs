import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const kickoffStatusPath = path.join(repoRoot, 'scripts', 'v1-kickoff-status.mjs');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const kickoffStatus = fs.readFileSync(kickoffStatusPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(kickoffStatus, /mode: 'v1-kickoff-status'/);
assert.match(kickoffStatus, /scripts\/v1-local-completion-status\.mjs/);
assert.match(kickoffStatus, /kickoffReady/);
assert.match(kickoffStatus, /blockingApprovalActions/);
assert.match(kickoffStatus, /run-another-dogfood-execute/);
assert.match(kickoffStatus, /v1-user-flow-kickoff-slice/);
assert.match(kickoffStatus, /Start in Mission, register or select a local project/);
assert.match(kickoffStatus, /run Council\/Execution\/Deliverables/);
assert.doesNotMatch(kickoffStatus, /Register\/select a local project/);
assert.match(kickoffStatus, /Mission/);
assert.match(kickoffStatus, /Decision Inbox/);
assert.match(kickoffStatus, /doesNotMutateRuntime: true/);
assert.match(kickoffStatus, /doesNotExecuteDogfood: true/);
assert.match(kickoffStatus, /doesNotPush: true/);

assert.match(runbook, /## V1 Kickoff Status/);
assert.match(runbook, /node scripts\/v1-kickoff-status\.mjs/);
assert.match(runbook, /first v1 kickoff slice/);
assert.match(runbook, /Start in `Mission`/);
assert.match(runbook, /register or select a local project from the Mission-first entry flow/);
assert.match(runbook, /Mission \/ Council \/ Execution \/ Deliverables/);
assert.match(runbook, /Taskboard \/ Logs \/ Artifacts \/ Decision Inbox/);
assert.match(runbook, /Additional execute-mode dogfood is optional/);
assert.match(runbook, /node scripts\/smoke-v1-user-flow-kickoff\.mjs/);
assert.match(runbook, /V1_KICKOFF_ALLOW_DIRTY=1/);
assert.match(runbook, /Do not use that override as release evidence/);
assert.match(handoff, /first v1 user-flow kickoff slice/);
assert.match(handoff, /node scripts\/v1-kickoff-status\.mjs/);
assert.match(handoff, /node scripts\/smoke-v1-user-flow-kickoff\.mjs/);
assert.match(handoff, /do not run another dogfood pass by default/);

assert.match(verificationStatus, /v1-kickoff-status/);
assert.match(verificationStatus, /scripts\/smoke-v1-kickoff-status\.mjs/);
assert.match(verificationStatus, /v1-review-passed-deliverables-routing/);
assert.match(verificationStatus, /scripts\/smoke-ui-slice-638\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1KickoffStatus: {
        document: 'docs/15_v1-start-runbook.md',
        readOnlyStatus: 'scripts/v1-kickoff-status.mjs',
        nextSlice: 'v1-user-flow-kickoff-slice',
      },
    },
    null,
    2,
  ),
);
