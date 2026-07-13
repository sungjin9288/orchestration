import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  assertContainsBacktickedAll,
  assertDoesNotMatchAny,
  assertMarkdownSections,
  assertSourceEvidence,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const STATUS_MODE = 'vnext-proposal-generation-planning-plan-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const files = {
  plan: 'docs/42_proposal-generation-planning-plan.md',
  handoff: 'docs/41_proposal-generation-operator-decision-handoff.md',
  decisionPacket: 'docs/40_proposal-generation-decision-packet.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  growthConfig: 'ui/growth-config.js',
  verification: 'scripts/verification_status.mjs',
};
const sources = readRepoFiles(repoRoot, files);

assertMarkdownSections(sources.plan, [
  '## Purpose',
  '## Accepted Planning-Only Decision',
  '## Current Status',
  '## Draft Generation Plan',
  '## Inert Draft Contract',
  '## Rollback Plan',
  '## Focused Smoke Plan',
  '## Implementation Decision Required',
  '## Stop Conditions',
  '## Verification',
]);
assertContainsBacktickedAll(sources.plan, [
  'decisionId', 'decisionStatus', 'targetAuthority', 'targetSurface', 'sourceEvidenceRefs',
  'negativeEvidenceRefs', 'generationPlanRefs', 'rollbackRefs', 'focusedSmokeRefs',
  'aggregateVerificationRef', 'stillBlockedAuthorities', 'approvalStatement', 'candidateId',
  'sourceFindingId', 'evidenceRefs', 'negativeEvidenceRefs', 'routeRefs', 'verificationRefs',
  'blockedActions', 'reviewQuestion', 'draftStatus', 'recordId', 'applyAllowed',
  'nonApprovalStatement',
]);
assertDoesNotMatchAny(sources.plan, [/approve-proposal-generation-implementation-slice/]);
assertSourceEvidence(sources, {
  plan: [
    'operator-decision-vnext-proposal-generation-planning-001',
    'approve-proposal-generation-planning-only',
    'Planning approval: accepted',
    'Implementation approval: blocked',
    'Current downstream gate: `proposal generation implementation decision required`',
    'exactly one existing Growth Evidence Ledger candidate',
    'deterministically maps',
    'no durable proposal id',
    'no application status',
    'no queue mutation',
    'must not call a model or provider',
    'applyAllowed` | Always `false`',
  ],
  handoff: ['Handoff status: `consumed-by-proposal-generation-planning-only-decision`'],
  decisionPacket: ['Current gate: `proposal generation implementation decision required`'],
  decisionLog: ['### DEC-070'],
  audit: ['Completed: `proposal generation planning plan`'],
  inventory: ['vNext proposal generation planning plan'],
  readme: ['Proposal generation planning plan is accepted planning-only evidence'],
  growthConfig: ['proposalGenerationAllowed: false', 'providerCallsAllowed: false', 'commitPushAllowed: false'],
  verification: ['vnext-proposal-generation-planning-plan-status.mjs'],
});

const packet = runStatus(repoRoot, 'scripts/vnext-proposal-generation-decision-packet-status.mjs');
const handoff = runStatus(repoRoot, 'scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs');
const audit = runStatus(repoRoot, 'scripts/vnext-development-audit-status.mjs');
assert.equal(packet.ok, true);
assert.equal(handoff.ok, true);
assert.equal(audit.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'planning-only-deterministic-local-proposal-draft',
  readOnly: true,
  doesNotCommit: true,
  doesNotPush: true,
  acceptedDecisionId: 'operator-decision-vnext-proposal-generation-planning-001',
  currentGate: 'proposal generation implementation decision required',
  implementationApproved: false,
  authority: {
    proposalGenerationAllowed: false,
    providerCallsAllowed: false,
    memoryPersistenceAllowed: false,
    proposalRecordCreationAllowed: false,
    proposalApplicationAllowed: false,
    sourceMutationAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  },
}, null, 2)}\n`);
