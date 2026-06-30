import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  createProposalApplicationSourceMutationDecision,
  proposalApplicationSourceMutationImplementationDecisionSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-review-decision-spec-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const proposalReviewDecisionSpecFiles = {
  spec: 'docs/24_proposal-review-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const proposalReviewSpecSections = [
  '## Purpose',
  '## Current Status',
  '## Non-Authority Boundary',
  '## Durable Proposal Record Contract',
  '## Approval Semantics',
  '## Expiry And Supersession',
  '## Stop Conditions',
  '## Implementation Prerequisites',
  '## Verification',
];

const proposalReviewRecordFields = [
  'id',
  'status',
  'createdAt',
  'updatedAt',
  'expiresAt',
  'sourceFindingId',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'reviewerRefs',
  'approvalRefs',
  'riskClass',
  'proposedAction',
  'blockedActions',
  'nonApprovalStatement',
];

const proposalReviewApprovalSemantics = [
  'Review gate',
  'Creation approval',
  'Application approval',
  'Review acceptance can only feed the next explicit decision',
];

const proposalReviewDecisionSpecBlockedAuthorityMarkers = [
  'proposalRecordCreationAllowed: false',
  'proposalRecordPersistenceAllowed: false',
  'proposalGenerationAllowed: false',
  'proposalApplicationAllowed: false',
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

const forbiddenAuthorityPatterns = [
  /data-action="create-proposal-record"/,
  /data-action="persist-proposal-record"/,
  /data-action="approve-proposal"/,
  /data-action="apply-proposal"/,
  /proposalRecordCreationAllowed: true/,
  /proposalRecordPersistenceAllowed: true/,
  /proposalGenerationAllowed: true/,
  /proposalApplicationAllowed: true/,
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

const proposalReviewDecisionSpecSources = Object.fromEntries(
  Object.entries(proposalReviewDecisionSpecFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of proposalReviewSpecSections) {
  assert.match(
    proposalReviewDecisionSpecSources.spec,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(proposalReviewDecisionSpecSources.spec, proposalReviewRecordFields);
assertDoesNotMatchAny(proposalReviewDecisionSpecSources.app, forbiddenAuthorityPatterns);

const proposalReviewDecisionSpecSourceEvidence = {
  spec: proposalReviewApprovalSemantics,
  app: proposalReviewDecisionSpecBlockedAuthorityMarkers,
  decisionLog: [
    '### DEC-048',
    '### DEC-050',
    'docs/24_proposal-review-decision-spec.md',
    'schema with `id`, `status`, timestamps, source refs, evidence refs, and reviewer/approval refs',
    'separate human approval semantics for record creation and application',
  ],
  audit: [
    'Completed: `proposal review decision spec`',
    'docs/24_proposal-review-decision-spec.md',
    '`memory readiness decision spec`',
  ],
  inventory: ['vNext proposal review decision spec'],
  readme: [
    'Proposal review is not proposal approval',
    'docs/24_proposal-review-decision-spec.md',
  ],
  verification: ['vnext-proposal-review-decision-spec-status.mjs'],
};

assertSourceEvidence(
  proposalReviewDecisionSpecSources,
  proposalReviewDecisionSpecSourceEvidence,
);

const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationSourceMutationDecision = createProposalApplicationSourceMutationDecision({
  command: 'node scripts/vnext-proposal-review-decision-spec-status.mjs',
  reason:
    'Proposal review, durable proposal record creation/persistence, and audit-only application attempt evidence are source-backed; real proposal application and source mutation still require a later explicit decision.',
});

assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationSourceMutationImplementationDecisionSlice);

const proposalQueue = runStatus('scripts/growth-proposal-queue-status.mjs');
const creationReadiness = runStatus(
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
);

assert.equal(proposalQueue.ok, true);
assert.equal(proposalQueue.readiness?.readyForHumanReviewContract, true);
assert.equal(proposalQueue.readiness?.proposalGenerationAllowed, false);
assert.equal(proposalQueue.readiness?.proposalApplicationAllowed, false);
assert.equal(proposalQueue.readiness?.proposalQueueMutationAllowed, false);
assert.equal(creationReadiness.ok, true);
assert.equal(creationReadiness.readiness?.creationReadinessEnvelopeDefined, true);
assert.equal(creationReadiness.readiness?.creationStillBlocked, true);
assert.equal(creationReadiness.readiness?.proposalRecordCreationAllowed, false);
assert.equal(creationReadiness.readiness?.proposalRecordPersistenceAllowed, false);
assert.equal(creationReadiness.readiness?.proposalQueueMutationAllowed, false);
assert.equal(creationReadiness.readiness?.implementationAllowed, false);
assert.equal(creationReadiness.readiness?.dryRunOnly, true);

const proposalReviewAuthorityBoundary = {
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
  proposalApprovalAllowed: false,
  proposalApplicationAllowed: false,
  proposalQueueMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  runtimeMutationAllowed: false,
  uiActionMutationAllowed: false,
  sourceMutationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-review-decision-spec',
      spec: proposalReviewDecisionSpecFiles.spec,
      requiredSections: proposalReviewSpecSections,
      requiredRecordFields: proposalReviewRecordFields,
      approvalSemantics: proposalReviewApprovalSemantics,
      stopConditions: [
        'missing sourceFindingId',
        'missing sourceEvidenceRefs',
        'missing negativeEvidenceRefs',
        'missing reviewerRefs',
        'missing explicit creation approval',
        'missing explicit application approval',
        'stale source evidence',
        'unresolved negative evidence',
        'expired or superseded proposal record',
        'dirty runtime mutation attempt',
        'dirty source mutation attempt',
        'provider call attempt from the review surface',
        'commit or push attempt from proposal review',
      ],
      upstreamStatus: {
        proposalQueue: {
          ok: proposalQueue.ok,
          readyForHumanReviewContract: proposalQueue.readiness?.readyForHumanReviewContract,
          proposalGenerationAllowed: proposalQueue.readiness?.proposalGenerationAllowed,
          proposalApplicationAllowed: proposalQueue.readiness?.proposalApplicationAllowed,
          proposalQueueMutationAllowed: proposalQueue.readiness?.proposalQueueMutationAllowed,
        },
        creationReadiness: {
          ok: creationReadiness.ok,
          creationStillBlocked: creationReadiness.readiness?.creationStillBlocked,
          dryRunOnly: creationReadiness.readiness?.dryRunOnly,
        },
      },
      nextRecommendedSlice: proposalApplicationSourceMutationDecision,
      authority: proposalReviewAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
