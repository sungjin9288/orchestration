import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
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
  verification: 'scripts/verification_status.mjs',
};

const requiredSections = [
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

const requiredDecisionFields = [
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

const invalidShortcuts = [
  'continue',
  'do everything',
  'approve all',
  'implement vNext',
  'apply the proposal',
  'ship it',
];

const blockedAuthorityMarkers = [
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

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertContainsAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(escapeRegExp(expectedValue)));
  }
}

function assertSourceEvidence(sourcesByName, evidenceBySource) {
  for (const [sourceName, expectedValues] of Object.entries(evidenceBySource)) {
    assertContainsAll(sourcesByName[sourceName], expectedValues);
  }
}

function assertContainsBacktickedAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(`\\\`${escapeRegExp(expectedValue)}\\\``));
  }
}

function assertDoesNotMatchAny(source, patterns) {
  for (const pattern of patterns) {
    assert.doesNotMatch(source, pattern);
  }
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredSections) {
  assert.match(sources.handoff, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.handoff, requiredDecisionFields);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
  handoff: [
    ...invalidShortcuts,
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
    '1. `proposal application implementation decision required`',
  ],
  inventory: ['vNext proposal application implementation decision handoff'],
  readme: [
    'Proposal application implementation decision handoff is not approval',
    'docs/34_proposal-application-implementation-decision-handoff.md',
  ],
  app: blockedAuthorityMarkers,
  verification: ['vnext-proposal-application-implementation-decision-handoff-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const applicationPlanStatus = runStatus('scripts/vnext-proposal-application-implementation-plan-status.mjs');
const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationImplementationGate = 'proposal application implementation decision required';

assert.equal(applicationPlanStatus.ok, true);
assert.equal(auditStatus.ok, true);
assert.equal(applicationPlanStatus.currentGate, proposalApplicationImplementationGate);
assert.equal(auditNextSlice, proposalApplicationImplementationGate);
assert.equal(applicationPlanStatus.authority?.implementationApproved, false);
assert.equal(applicationPlanStatus.authority?.proposalApplicationAllowed, false);
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'proposal application implementation decision handoff'),
  true,
);

const authority = {
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
      currentGate: proposalApplicationImplementationGate,
      handoffStatus: 'decision-input-only',
      requiredDecisionFields,
      invalidShortcutsRejected: invalidShortcuts,
      nextRequiredInput:
        'operator-provided approve-application-implementation-slice or reject-application-implementation decision',
      upstreamStatus: {
        applicationPlan: {
          ok: applicationPlanStatus.ok,
          currentGate: applicationPlanStatus.currentGate,
          implementationApproved: applicationPlanStatus.authority?.implementationApproved,
          proposalApplicationAllowed: applicationPlanStatus.authority?.proposalApplicationAllowed,
        },
        vnextAudit: {
          ok: auditStatus.ok,
          nextSlice: auditNextSlice,
        },
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
