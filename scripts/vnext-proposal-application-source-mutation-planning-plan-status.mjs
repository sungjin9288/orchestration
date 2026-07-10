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
  proposalApplicationSourceMutationImplementedSlice,
  proposalApplicationSourceMutationPlanningDecisionId,
  proposalApplicationSourceMutationPlanningPlanSlice,
  proposalApplicationSourceMutationPlanningTargetAuthority,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-planning-plan-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const sourceMutationPlanningPlanFiles = {
  plan: 'docs/38_proposal-application-source-mutation-planning-plan.md',
  handoff: 'docs/37_proposal-application-source-mutation-operator-decision-handoff.md',
  decisionPacket: 'docs/36_proposal-application-source-mutation-decision-packet.md',
  implementation: 'docs/39_proposal-application-source-mutation-implementation.md',
  applicationImplementation: 'docs/35_proposal-application-implementation.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
  verification: 'scripts/verification_status.mjs',
};

const sourceMutationPlanningPlanSections = [
  '## Purpose',
  '## Accepted Planning-Only Decision',
  '## Current Status',
  '## Mutation Plan',
  '## Source Mutation Contract',
  '## Rollback Plan',
  '## Focused Smoke Plan',
  '## Implementation Decision Evidence',
  '## Stop Conditions',
  '## Verification',
];

const sourceMutationPlanningContractFields = [
  'applicationAttemptId',
  'proposalId',
  'targetFiles',
  'baselineProofRefs',
  'diffPreviewRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'sourceMutationImplementationAllowed',
  'sourceMutationAllowed',
  'providerCallsAllowed',
  'memoryPersistenceAllowed',
  'commitAllowed',
  'pushAllowed',
  'nonApprovalStatement',
];

const sourceMutationPlanningPlanSources = readRepoFiles(
  repoRoot,
  sourceMutationPlanningPlanFiles,
);

assertMarkdownSections(
  sourceMutationPlanningPlanSources.plan,
  sourceMutationPlanningPlanSections,
);
assertContainsBacktickedAll(
  sourceMutationPlanningPlanSources.plan,
  proposalApplicationSourceMutationDecisionRequiredFields,
);
assertContainsBacktickedAll(
  sourceMutationPlanningPlanSources.plan,
  sourceMutationPlanningContractFields,
);
assertDoesNotMatchAny(
  sourceMutationPlanningPlanSources.app,
  proposalApplicationSourceMutationForbiddenActionPatterns,
);

const sourceMutationPlanningPlanSourceEvidence = {
  plan: [
    `decisionId\` | \`${proposalApplicationSourceMutationPlanningDecisionId}`,
    'decisionStatus` | `approve-source-mutation-planning-only`',
    `targetAuthority\` | \`${proposalApplicationSourceMutationPlanningTargetAuthority}`,
    'Planning approval: accepted',
    'Implementation approval: accepted later under `DEC-067`',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path',
    'Current implementation evidence: `docs/39_proposal-application-source-mutation-implementation.md`',
    'identify exactly one eligible `proposalApplicationAttempts` record',
    'capture clean baseline proof before any write',
    'define a dry-run diff preview before source mutation',
    'sourceMutationImplementationAllowed` | `false` in this planning-only artifact; the later `DEC-067` decision opens only its named runtime function.',
    'sourceMutationAllowed` | Always `false` for this planning-only slice.',
    'providerCallsAllowed` | Always `false`.',
    'memoryPersistenceAllowed` | Always `false`.',
    'commitAllowed` | Always `false`.',
    'pushAllowed` | Always `false`.',
    'the `approve-source-mutation-implementation-slice` decision is absent or invalid',
  ],
  handoff: [
    'Handoff status: `consumed-by-source-mutation-implementation-decision`',
    'Original gate: `proposal application source mutation implementation decision required`',
  ],
  decisionPacket: [
    'Current packet status: `consumed-by-source-mutation-implementation-decision`',
    'Current source mutation planning authority: accepted historical plan evidence',
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
  decisionLog: ['### DEC-063', '### DEC-064', '### DEC-065', '### DEC-067'],
  audit: [
    'Completed: `proposal application source mutation planning plan`',
    'Completed: `proposal application source mutation implementation`',
    'Next: `current read-only growth candidate`',
  ],
  inventory: [
    'vNext proposal application source mutation planning plan',
    'vNext proposal application source mutation implementation',
  ],
  readme: [
    'Proposal application source mutation planning plan is planning-only evidence',
    'docs/38_proposal-application-source-mutation-planning-plan.md',
    'Proposal application source mutation is implemented for exactly one approved path',
    'docs/39_proposal-application-source-mutation-implementation.md',
  ],
  app: ["from './growth-config.js'"],
  growthConfig: proposalApplicationSourceMutationBlockedAuthorityMarkers,
  verification: ['vnext-proposal-application-source-mutation-planning-plan-status.mjs'],
};

assertSourceEvidence(
  sourceMutationPlanningPlanSources,
  sourceMutationPlanningPlanSourceEvidence,
);

const sourceMutationDecisionPacketStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
);
const sourceMutationOperatorHandoffStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs',
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
assert.equal(sourceMutationOperatorHandoffStatus.ok, true);
assert.equal(applicationImplementationStatus.ok, true);
assert.equal(vnextAuditStatus.ok, true);
assert.equal(sourceMutationImplementationStatus.ok, true);
assert.equal(sourceMutationDecisionPacketStatus.currentState, proposalApplicationSourceMutationImplementedSlice);
assert.equal(sourceMutationOperatorHandoffStatus.currentState, proposalApplicationSourceMutationImplementedSlice);
assert.equal(applicationImplementationStatus.authority?.sourceMutationAllowed, false);
assert.equal(vnextAuditStatus.authority?.sourceMutationImplementationAllowed, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationAllowedThroughApprovedRuntimeFunction, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationOutsideApprovedPathAllowed, false);
assert.equal(
  vnextAuditStatus.implemented?.some(
    (entry) => entry.area === 'proposal application source mutation planning plan',
  ),
  true,
);

const sourceMutationPlanningPlanAuthorityBoundary =
  createProposalApplicationSourceMutationImplementedAuthorityBoundary();

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-source-mutation-planning-plan',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      currentState: proposalApplicationSourceMutationImplementedSlice,
      plan: sourceMutationPlanningPlanFiles.plan,
      acceptedPlanningDecision: proposalApplicationSourceMutationPlanningDecisionId,
      targetAuthority: proposalApplicationSourceMutationPlanningTargetAuthority,
      planningSlice: proposalApplicationSourceMutationPlanningPlanSlice,
      consumedRequiredInput: proposalApplicationSourceMutationImplementationDecisionRequiredInput,
      nextRecommendedSlice: vnextAuditStatus.nextGrowthSlice,
      upstreamStatus: {
        sourceMutationDecisionPacket: {
          ok: sourceMutationDecisionPacketStatus.ok,
          currentGate: sourceMutationDecisionPacketStatus.currentGate,
        },
        sourceMutationOperatorHandoff: {
          ok: sourceMutationOperatorHandoffStatus.ok,
          currentGate: sourceMutationOperatorHandoffStatus.currentGate,
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
      authority: sourceMutationPlanningPlanAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
