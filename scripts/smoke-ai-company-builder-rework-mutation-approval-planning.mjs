import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-builder-rework-mutation-approval-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function section(text, heading) {
  const start = text.indexOf(`${heading}\n`);
  assert.notEqual(start, -1, `${heading} section is required`);
  const bodyStart = start + heading.length + 1;
  const nextHeading = text.indexOf('\n## ', bodyStart);
  return text.slice(bodyStart, nextHeading === -1 ? text.length : nextHeading);
}

const plan = read('docs/135_ai-company-builder-rework-mutation-approval-plan.md');
const handoff = read(
  'docs/136_ai-company-builder-rework-mutation-approval-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const todo = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');

const fields = [
  'decisionId', 'decisionStatus', 'targetAuthority', 'targetSurface',
  'implementationPlanRefs', 'runtimePath', 'compatibilityPlanRefs',
  'migrationPlanRefs', 'sourceEvidenceRefs', 'negativeEvidenceRefs',
  'rollbackRefs', 'focusedSmokeRefs', 'aggregateVerificationRef',
  'stillBlockedAuthorities', 'approvalStatement',
];

for (const field of fields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

for (const pattern of [
  /planning-only `DEC-198`/, /`DEC-199` records/, /`DEC-200` implements/,
  /schema v24/, /allowedNextAction=builder-rework-live-mutation/,
  /scope=builder-rework/, /bindingDigest/, /exact preflight Run and Artifact lineage/,
  /POST \/api\/rework-plans\/:reworkPlanId\/builder-rework-mutation-approval/,
  /GET \/api\/rework-plans\/:reworkPlanId\/builder-rework-mutation-approval/,
  /dedicated source-bound creation and resolution\s+wrappers/,
  /generic `createApprovalPlaceholder` and\s+the generic resolver/,
  /pending -> approved/,
  /pending -> rejected/,
  /strictly validate the nested metadata and binding digest on every load and save/,
  /sequence\s+collisions/, /every Reviewer Decision referenced[\s\S]*remains\s+pending and blocking/,
  /waitingApproval/, /prioritizes the still-blocking Reviewer\s+Decision/,
  /original Builder\s+live-mutation, scheduler, Reviewer, and QA paths/,
  /exact replay/, /divergent `409`/, /stop before Builder source mutation/,
  /approvalRefs=\[\]/, /decisionInboxItemRefs=\[\]/,
  /builder-rework-mutation-approvals\.js/,
  /preflightArtifactContentDigest/,
  /recursively sort object keys/,
  /preflightRunRecordDigest = digestCanonical/,
  /preflightArtifactRecordDigest = digestCanonical/,
  /sha256\(exact raw Artifact file bytes\)/,
  /generic `builder-live-mutation` Approval/,
  /authority collision and returns `409`/,
  /create-one-reviewable-rework-approval-without-source-mutation/,
  /terminal\s+resolution replay or status reversal/,
  /empty source Decision ref list remains empty/,
]) {
  assert.match(plan, pattern);
}

assert.match(section(plan, '## Exact Source Gate'), /DEC-188\/DEC-191\/DEC-194/);
assert.match(section(plan, '## Compatibility And Rollback'), /no downgrade, deletion/);
assert.match(
  section(plan, '## Planned Approval Contract'),
  /preflightRunRecordDigest = digestCanonical\(\{\s+id, taskId, kind, role, status, metadata, summary,\s+startedAt, finishedAt, logPath\s+\}\)/,
);
assert.match(
  section(plan, '## Planned Approval Contract'),
  /preflightArtifactRecordDigest = digestCanonical\(\{\s+id, taskId, runId, type, path, createdAt\s+\}\)/,
);
assert.match(
  section(plan, '## Exact Source Gate'),
  /Historical generic Approvals for an earlier\s+Builder attempt remain compatible/,
);
assert.match(handoff, /operator-decision-ai-company-builder-rework-mutation-approval-implementation-001/);
assert.match(handoff, /no schema migration sequence map or durable domain record is authorized/);
assert.match(handoff, /src\/runtime\/file-store\.js/);
assert.match(handoff, /ui\/execution-labels\.js/);
assert.match(handoff, /ui\/task-summaries\.js/);
assert.match(handoff, /preserve historical generic Approvals for earlier Builder attempts/);
assert.match(handoff, /terminal replay and status reversal 409/);
assert.match(decisionLog, /^### DEC-198$/m);
assert.match(decisionLog, /^### DEC-199$/m);
assert.match(decisionLog, /^### DEC-200$/m);

for (const text of [masterPlan, runtimeContract, councilProtocol, deliveryRoadmap, completionPlan]) {
  assert.match(text, /DEC-198/);
  assert.match(text, /DEC-199/);
  assert.match(text, /DEC-200/);
}

assert.match(inventory, /AI Company Builder rework mutation Approval planning/);
assert.match(inventory, /informational `303\/303`, total `304\/304`/);
assert.match(readme, /docs\/135_ai-company-builder-rework-mutation-approval-plan\.md/);
assert.match(readme, /docs\/136_ai-company-builder-rework-mutation-approval-implementation-decision-handoff\.md/);
assert.match(readme, /999 smoke files/);
assert.match(readme, /712 UI smoke files/);
assert.match(todo, /ai-company-builder-rework-mutation-approval-planning-post-m7-2030/);
assert.match(lessons, /Builder rework mutation Approval must bind the exact waiting-gate lineage/);
assert.match(verification, /ai-company-builder-rework-mutation-approval-planning/);

process.stdout.write(`${mode}: ok planning-only Stage 5E approval handoff remains blocked before source mutation\n`);
