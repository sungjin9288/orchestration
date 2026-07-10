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
import {
  createProposalApplicationSourceMutationImplementedAuthorityBoundary,
  proposalApplicationSourceMutationBlockedAuthorityMarkers,
  proposalApplicationSourceMutationDecisionRequiredFields,
  proposalApplicationSourceMutationForbiddenActionPatterns,
  proposalApplicationSourceMutationImplementationDecisionRequiredInput,
  proposalApplicationSourceMutationImplementationDecisionSlice,
  proposalApplicationSourceMutationImplementedSlice,
  proposalApplicationSourceMutationPlanningPlanSlice,
  proposalApplicationSourceMutationInvalidShortcutPhrases,
  proposalApplicationSourceMutationOperatorHandoffSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-operator-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const sourceMutationOperatorHandoffFiles = {
  handoff: 'docs/37_proposal-application-source-mutation-operator-decision-handoff.md',
  decisionPacket: 'docs/36_proposal-application-source-mutation-decision-packet.md',
  planningPlan: 'docs/38_proposal-application-source-mutation-planning-plan.md',
  implementation: 'docs/39_proposal-application-source-mutation-implementation.md',
  applicationImplementation: 'docs/35_proposal-application-implementation.md',
  applicationImplementationStatus: 'scripts/vnext-proposal-application-implementation-status.mjs',
  sourceMutationDecisionPacketStatus:
    'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
  statusConstants: 'scripts/vnext-status-constants.mjs',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
};

const sourceMutationOperatorHandoffSections = [
  '## Purpose',
  '## Current State',
  '## Source Evidence',
  '## Planning-Only Decision Shape',
  '## Implementation-Slice Decision Shape',
  '## Request More Evidence',
  '## Reject Or Defer',
  '## Invalid Shortcuts',
  '## Minimum Planning Acceptance',
  '## Minimum Implementation Acceptance',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const sourceMutationOperatorHandoffSources = readRepoFiles(
  repoRoot,
  sourceMutationOperatorHandoffFiles,
);

assertMarkdownSections(
  sourceMutationOperatorHandoffSources.handoff,
  sourceMutationOperatorHandoffSections,
);
assertContainsBacktickedAll(
  sourceMutationOperatorHandoffSources.handoff,
  proposalApplicationSourceMutationDecisionRequiredFields,
);
assertDoesNotMatchAny(
  sourceMutationOperatorHandoffSources.app,
  proposalApplicationSourceMutationForbiddenActionPatterns,
);

const sourceMutationOperatorHandoffSourceEvidence = {
  handoff: [
    ...proposalApplicationSourceMutationInvalidShortcutPhrases,
    'It is not an operator decision',
    'Original gate: `proposal application source mutation implementation decision required`',
    'Handoff status: `consumed-by-source-mutation-implementation-decision`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path under `DEC-067`',
    'Current source mutation authority: approved runtime function only; all other paths blocked',
    'decisionStatus=approve-source-mutation-planning-only',
    'targetAuthority=proposal application source mutation planning for one audit-only application attempt path',
    'decisionStatus=approve-source-mutation-implementation-slice',
    'targetAuthority=proposal application source mutation implementation for exactly one accepted mutation plan',
    'decisionStatus=request-more-evidence',
    'decisionStatus=reject',
    'applicationAttemptRefs',
    'mutationPlanRefs',
    'clean baseline proof',
    'It does not approve source mutation implementation, proposal generation, provider calls, memory persistence, commit, or push.',
    'node scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs',
  ],
  decisionPacket: [
    'Current packet status: `consumed-by-source-mutation-implementation-decision`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path under `DEC-067`',
    'Current source mutation authority: approved runtime function only; all other paths blocked',
    'approve-source-mutation-planning-only',
    'approve-source-mutation-implementation-slice',
  ],
  planningPlan: [
    'Planning approval: accepted',
    'Implementation approval: accepted later under `DEC-067`',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path',
  ],
  implementation: [
    'Implementation approval: accepted',
    'Runtime implementation: completed',
    'operator-decision-vnext-proposal-source-mutation-implementation-001',
  ],
  applicationImplementation: [
    'Implementation approval: accepted',
    'Runtime implementation: completed',
    'Proposal source mutation remains a separate authority decision',
  ],
  applicationImplementationStatus: [
    'sourceMutationAllowed: false',
    'proposalGenerationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
  ],
  sourceMutationDecisionPacketStatus: [
    'posture: \'read-only-proposal-application-source-mutation-decision-packet\'',
    'createProposalApplicationSourceMutationImplementedAuthorityBoundary',
  ],
  statusConstants: [
    'sourceMutationPlanningAllowed: true',
    'sourceMutationImplementationAllowed: true',
    'sourceMutationAllowedThroughApprovedRuntimeFunction: true',
    'sourceMutationOutsideApprovedPathAllowed: false',
    'proposalApplicationAllowed: false',
    'proposalGenerationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
    'commitAllowed: false',
    'pushAllowed: false',
  ],
  decisionLog: [
    '### DEC-064',
    '### DEC-065',
    '### DEC-067',
    'Proposal application source mutation planning-only decision is accepted as a plan artifact only',
  ],
  audit: [
    'Completed: `proposal application source mutation operator handoff`',
    'Completed: `proposal application source mutation planning plan`',
    'Completed: `proposal application source mutation implementation`',
  ],
  inventory: [
    'vNext proposal application source mutation operator handoff',
    'vNext proposal application source mutation planning plan',
    'vNext proposal application source mutation implementation',
  ],
  readme: [
    'Proposal application source mutation operator handoff is consumed planning evidence',
    'docs/37_proposal-application-source-mutation-operator-decision-handoff.md',
    'Proposal application source mutation planning plan is planning-only evidence',
    'docs/38_proposal-application-source-mutation-planning-plan.md',
    'Proposal application source mutation is implemented for exactly one approved path',
    'docs/39_proposal-application-source-mutation-implementation.md',
  ],
  verification: ['vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs'],
  app: ["from './growth-config.js'"],
  growthConfig: proposalApplicationSourceMutationBlockedAuthorityMarkers,
};

assertSourceEvidence(
  sourceMutationOperatorHandoffSources,
  sourceMutationOperatorHandoffSourceEvidence,
);

const sourceMutationDecisionPacketStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
);
const applicationImplementationStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-implementation-status.mjs',
);
const vnextAuditStatus = runStatus(repoRoot, 'scripts/vnext-development-audit-status.mjs');
const sourceMutationImplementationStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-source-mutation-implementation-status.mjs',
);

assert.equal(sourceMutationDecisionPacketStatus.ok, true);
assert.equal(applicationImplementationStatus.ok, true);
assert.equal(vnextAuditStatus.ok, true);
assert.equal(sourceMutationImplementationStatus.ok, true);
assert.equal(applicationImplementationStatus.authority?.sourceMutationAllowed, false);
assert.equal(sourceMutationDecisionPacketStatus.currentState, proposalApplicationSourceMutationImplementedSlice);
assert.equal(vnextAuditStatus.authority?.sourceMutationImplementationAllowed, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationAllowedThroughApprovedRuntimeFunction, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationOutsideApprovedPathAllowed, false);

const sourceMutationOperatorHandoffAuthorityBoundary =
  createProposalApplicationSourceMutationImplementedAuthorityBoundary({
    handoffRecordsDecision: false,
  });

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-source-mutation-operator-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      originalGate: proposalApplicationSourceMutationOperatorHandoffSlice,
      implementationDecisionGate: proposalApplicationSourceMutationImplementationDecisionSlice,
      currentState: proposalApplicationSourceMutationImplementedSlice,
      handoffStatus: 'consumed-by-source-mutation-implementation-decision',
      handoff: sourceMutationOperatorHandoffFiles.handoff,
      requiredDecisionFields: proposalApplicationSourceMutationDecisionRequiredFields,
      invalidShortcutsRejected: proposalApplicationSourceMutationInvalidShortcutPhrases,
      consumedRequiredInput: proposalApplicationSourceMutationImplementationDecisionRequiredInput,
      planningSlice: proposalApplicationSourceMutationPlanningPlanSlice,
      nextRecommendedSlice: vnextAuditStatus.nextGrowthSlice,
      upstreamStatus: {
        sourceMutationDecisionPacket: {
          ok: sourceMutationDecisionPacketStatus.ok,
          nextRecommendedSlice: sourceMutationDecisionPacketStatus.nextRecommendedSlice,
        },
        applicationImplementation: {
          ok: applicationImplementationStatus.ok,
          sourceMutationAllowed: applicationImplementationStatus.authority?.sourceMutationAllowed,
        },
        vnextAudit: {
          ok: vnextAuditStatus.ok,
          nextSlice: vnextAuditStatus.nextGrowthSlice,
        },
        sourceMutationImplementation: {
          ok: sourceMutationImplementationStatus.ok,
          posture: sourceMutationImplementationStatus.posture,
        },
      },
      authority: sourceMutationOperatorHandoffAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
