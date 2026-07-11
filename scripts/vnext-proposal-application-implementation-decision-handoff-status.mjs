import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  proposalApplicationImplementationDecisionGate,
} from './vnext-status-constants.mjs';
import {
  assertContainsBacktickedAll,
  assertDoesNotMatchAny,
  assertMarkdownSections,
  assertSourceEvidence,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const proposalApplicationImplementationDecisionHandoffFiles = {
  handoff: 'docs/34_proposal-application-implementation-decision-handoff.md',
  plan: 'docs/33_proposal-application-implementation-plan.md',
  planningHandoff: 'docs/32_proposal-application-operator-decision-handoff.md',
  decisionPacket: 'docs/31_proposal-application-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  durableImplementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
  verification: 'scripts/verification_status.mjs',
};

const proposalApplicationImplementationDecisionHandoffSections = [
  '## Purpose',
  '## Current Gate',
  '## Source Evidence',
  '## Valid Implementation Decision Shape',
  '## Rejection Decision Shape',
  '## Invalid Shortcuts',
  '## Minimum Acceptance Criteria',
  '## Still Blocked After Approval',
  '## Stop Conditions',
  '## Verification',
];

const proposalApplicationImplementationDecisionRequiredFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'implementationPlanRefs',
  'applicationPath',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const proposalApplicationImplementationDecisionInvalidShortcuts = [
  'continue',
  'do everything',
  'approve all',
  'implement vNext',
  'apply the proposal',
  'ship it',
];

const proposalApplicationImplementationDecisionHandoffBlockedAuthorityMarkers = [
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'longTermMemoryStoreAllowed: false',
  'rawTranscriptIngestionAllowed: false',
  'crossWorkspaceMemoryAllowed: false',
  'skillPromotionAllowed: false',
  'proposalGenerationAllowed: false',
  'proposalApplicationAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

const forbiddenActionPatterns = [
  /data-action="apply-proposal"/,
  /data-action="approve-proposal"/,
  /data-action="generate-growth-proposal"/,
  /data-action="mutate-growth-source"/,
  /data-action="persist-growth-memory"/,
  /proposalApplicationAllowed: true/,
  /proposalGenerationAllowed: true/,
  /sourceMutationAllowed: true/,
];

const proposalApplicationImplementationDecisionHandoffSources = readRepoFiles(
  repoRoot,
  proposalApplicationImplementationDecisionHandoffFiles,
);

assertMarkdownSections(
  proposalApplicationImplementationDecisionHandoffSources.handoff,
  proposalApplicationImplementationDecisionHandoffSections,
);

assertContainsBacktickedAll(
  proposalApplicationImplementationDecisionHandoffSources.handoff,
  proposalApplicationImplementationDecisionRequiredFields,
);
assertDoesNotMatchAny(
  proposalApplicationImplementationDecisionHandoffSources.app,
  forbiddenActionPatterns,
);

const proposalApplicationImplementationDecisionHandoffSourceEvidence = {
  handoff: [
    ...proposalApplicationImplementationDecisionInvalidShortcuts,
    'It is not an operator decision',
    'Current gate: `proposal application implementation decision required`',
    'Handoff status: `decision-input-only`',
    'Planning approval: accepted through `operator-decision-vnext-proposal-application-001`',
    'Implementation approval: blocked',
    'decisionStatus=approve-application-implementation-slice',
    'targetAuthority=proposal application implementation for one audit-only attempt path on existing durable proposal records',
    'applicationPath=record one inert application attempt for an existing durable proposal record without source mutation',
    'proposal generation remains blocked, source mutation remains blocked, provider calls remain blocked, memory persistence remains blocked, commit and push remain blocked',
    'This does not approve proposal generation, source mutation, provider calls, memory persistence, commit, or push.',
    'decisionStatus=reject-application-implementation',
    'source mutation approval',
    'node scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs',
  ],
  plan: [
    'Planning approval: accepted',
    'Implementation approval: blocked',
    'Current downstream gate: `proposal application implementation decision required`',
    'no later `approve-application-implementation-slice` decision exists',
  ],
  planningHandoff: [
    'Handoff status: `consumed-by-application-planning-only-decision`',
    'Current gate: `proposal application implementation decision required`',
  ],
  decisionPacket: [
    'Current packet status: `consumed-by-application-planning-only-decision`',
    'Current application authority: planning only',
  ],
  proposalSpec: ['Creation approval', 'Application approval'],
  durableImplementationPlan: [
    'Runtime implementation: completed',
    'Next blocked authority: proposal application',
  ],
  decisionLog: ['### DEC-060', '### DEC-061'],
  audit: [
    'Completed: `proposal application implementation decision handoff`',
    'Completed: `proposal application source mutation implementation`',
    'Completed: `proposal-record lifecycle review alias`',
    'Next implementation entry: `explicit entry required`',
  ],
  inventory: ['vNext proposal application implementation decision handoff'],
  readme: [
    'Proposal application implementation decision handoff is not approval',
    'docs/34_proposal-application-implementation-decision-handoff.md',
  ],
  app: ["from './growth-config.js'"],
  growthConfig: proposalApplicationImplementationDecisionHandoffBlockedAuthorityMarkers,
  verification: ['vnext-proposal-application-implementation-decision-handoff-status.mjs'],
};

assertSourceEvidence(
  proposalApplicationImplementationDecisionHandoffSources,
  proposalApplicationImplementationDecisionHandoffSourceEvidence,
);

const proposalApplicationImplementationPlanStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-application-implementation-plan-status.mjs',
);
const vnextDevelopmentAuditStatus = runStatus(
  repoRoot,
  'scripts/vnext-development-audit-status.mjs',
);
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
assert.equal(proposalApplicationImplementationPlanStatus.ok, true);
assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(
  proposalApplicationImplementationPlanStatus.currentGate,
  proposalApplicationImplementationDecisionGate,
);
assert.equal(vnextDevelopmentAuditStatus.authority?.sourceMutationImplementationAllowed, true);
assert.equal(
  vnextDevelopmentAuditStatus.authority?.sourceMutationAllowedThroughApprovedRuntimeFunction,
  true,
);
assert.equal(proposalApplicationImplementationPlanStatus.authority?.implementationApproved, false);
assert.equal(proposalApplicationImplementationPlanStatus.authority?.proposalApplicationAllowed, false);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'proposal application implementation decision handoff',
  ),
  true,
);

const proposalApplicationImplementationDecisionHandoffAuthorityBoundary = {
  handoffRecordsDecision: false,
  implementationApproved: false,
  proposalApplicationAllowed: false,
  proposalApplicationImplementationAllowed: false,
  proposalGenerationAllowed: false,
  proposalQueueMutationAllowed: false,
  sourceMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-implementation-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      currentGate: proposalApplicationImplementationDecisionGate,
      handoffStatus: 'decision-input-only',
      requiredDecisionFields: proposalApplicationImplementationDecisionRequiredFields,
      invalidShortcutsRejected: proposalApplicationImplementationDecisionInvalidShortcuts,
      nextRequiredInput:
        'operator-provided approve-application-implementation-slice or reject-application-implementation decision',
      upstreamStatus: {
        applicationPlan: {
          ok: proposalApplicationImplementationPlanStatus.ok,
          currentGate: proposalApplicationImplementationPlanStatus.currentGate,
          implementationApproved:
            proposalApplicationImplementationPlanStatus.authority?.implementationApproved,
          proposalApplicationAllowed:
            proposalApplicationImplementationPlanStatus.authority?.proposalApplicationAllowed,
        },
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
      },
      authority: proposalApplicationImplementationDecisionHandoffAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
