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
  proposalApplicationSourceMutationDecisionOptions,
  proposalApplicationSourceMutationDecisionRequiredFields,
  proposalApplicationSourceMutationDecisionRequiredInput,
  proposalApplicationSourceMutationDecisionSlice,
  proposalApplicationSourceMutationImplementationDecisionRequiredInput,
  proposalApplicationSourceMutationImplementationDecisionSlice,
  proposalApplicationSourceMutationImplementedSlice,
  proposalApplicationSourceMutationForbiddenActionPatterns,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-decision-packet-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const sourceMutationDecisionPacketFiles = {
  packet: 'docs/36_proposal-application-source-mutation-decision-packet.md',
  planningPlan: 'docs/38_proposal-application-source-mutation-planning-plan.md',
  implementation: 'docs/39_proposal-application-source-mutation-implementation.md',
  applicationImplementation: 'docs/35_proposal-application-implementation.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
};

const sourceMutationDecisionPacketSections = [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Source Mutation Boundary',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const sourceMutationDecisionPacketSources = readRepoFiles(
  repoRoot,
  sourceMutationDecisionPacketFiles,
);

assertMarkdownSections(
  sourceMutationDecisionPacketSources.packet,
  sourceMutationDecisionPacketSections,
);
assertContainsBacktickedAll(
  sourceMutationDecisionPacketSources.packet,
  proposalApplicationSourceMutationDecisionRequiredFields,
);
assertDoesNotMatchAny(
  sourceMutationDecisionPacketSources.app,
  proposalApplicationSourceMutationForbiddenActionPatterns,
);

const sourceMutationDecisionPacketSourceEvidence = {
  packet: [
    'It is not source mutation approval',
    'Original gate: `proposal application source mutation decision required`',
    'Current packet status: `consumed-by-source-mutation-implementation-decision`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path under `DEC-067`',
    'Current source mutation authority: approved runtime function only; all other paths blocked',
    ...proposalApplicationSourceMutationDecisionOptions,
    'docs/38_proposal-application-source-mutation-planning-plan.md',
    'durable proposal record approval, application attempt approval, and source mutation approval are collapsed into one approval',
    'source mutation is requested without clean baseline proof, exact target-file scope, dry-run evidence, rollback proof, and focused smoke coverage',
    'node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
  ],
  planningPlan: [
    'Planning approval: accepted',
    'Implementation approval: accepted later under `DEC-067`',
    'Current source mutation planning authority: accepted historical plan evidence',
    'Current source mutation implementation authority: accepted for exactly one named path',
    'Current implementation evidence: `docs/39_proposal-application-source-mutation-implementation.md`',
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
  decisionLog: [
    '### DEC-063',
    '### DEC-065',
    '### DEC-067',
    'Proposal application source mutation planning-only decision is accepted as a plan artifact only',
  ],
  audit: [
    'Completed: `proposal application source mutation decision packet`',
    'Completed: `proposal application source mutation planning plan`',
    'Completed: `proposal application source mutation operator handoff`',
    'Completed: `proposal application source mutation implementation`',
    'Completed: `proposal-record lifecycle review alias`',
    'Next implementation entry: `explicit entry required`',
  ],
  inventory: [
    'vNext proposal application source mutation decision packet',
    'vNext proposal application source mutation planning plan',
    'vNext proposal application source mutation implementation',
  ],
  readme: [
    'Proposal application source mutation decision packet is consumed planning evidence',
    'docs/36_proposal-application-source-mutation-decision-packet.md',
    'Proposal application source mutation planning plan is planning-only evidence',
    'docs/38_proposal-application-source-mutation-planning-plan.md',
    'Proposal application source mutation is implemented for exactly one approved path',
    'docs/39_proposal-application-source-mutation-implementation.md',
  ],
  verification: ['vnext-proposal-application-source-mutation-decision-packet-status.mjs'],
  app: ["from './growth-config.js'"],
  growthConfig: proposalApplicationSourceMutationBlockedAuthorityMarkers,
};

assertSourceEvidence(
  sourceMutationDecisionPacketSources,
  sourceMutationDecisionPacketSourceEvidence,
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

assert.equal(applicationImplementationStatus.ok, true);
assert.equal(vnextAuditStatus.ok, true);
assert.equal(sourceMutationImplementationStatus.ok, true);
assert.equal(applicationImplementationStatus.authority?.sourceMutationAllowed, false);
assert.equal(vnextAuditStatus.authority?.sourceMutationImplementationAllowed, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationAllowedThroughApprovedRuntimeFunction, true);
assert.equal(vnextAuditStatus.authority?.sourceMutationOutsideApprovedPathAllowed, false);

const sourceMutationDecisionPacketAuthorityBoundary =
  createProposalApplicationSourceMutationImplementedAuthorityBoundary();

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-source-mutation-decision-packet',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      packet: sourceMutationDecisionPacketFiles.packet,
      originalGate: proposalApplicationSourceMutationDecisionSlice,
      implementationDecisionGate: proposalApplicationSourceMutationImplementationDecisionSlice,
      currentState: proposalApplicationSourceMutationImplementedSlice,
      originalRequiredInput: proposalApplicationSourceMutationDecisionRequiredInput,
      consumedRequiredInput: proposalApplicationSourceMutationImplementationDecisionRequiredInput,
      nextRecommendedSlice: vnextAuditStatus.nextGrowthSlice,
      decisionOptions: proposalApplicationSourceMutationDecisionOptions,
      requiredDecisionFields: proposalApplicationSourceMutationDecisionRequiredFields,
      upstreamStatus: {
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
      authority: sourceMutationDecisionPacketAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
