import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-review-decision-spec-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  spec: 'docs/24_proposal-review-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const requiredSpecSections = [
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

const requiredRecordFields = [
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

const approvalSemantics = [
  'Review gate',
  'Creation approval',
  'Application approval',
  'Review acceptance can only feed the next explicit decision',
];

const blockedAuthorityMarkers = [
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

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredSpecSections) {
  assert.match(sources.spec, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

for (const field of requiredRecordFields) {
  assert.match(sources.spec, new RegExp(`\\\`${escapeRegExp(field)}\\\``));
}

for (const semantic of approvalSemantics) {
  assert.match(sources.spec, new RegExp(escapeRegExp(semantic)));
}

for (const marker of blockedAuthorityMarkers) {
  assert.match(sources.app, new RegExp(escapeRegExp(marker)));
}

for (const pattern of forbiddenAuthorityPatterns) {
  assert.doesNotMatch(sources.app, pattern);
}

assert.match(sources.decisionLog, /### DEC-048/);
assert.match(sources.decisionLog, /### DEC-050/);
assert.match(sources.decisionLog, /docs\/24_proposal-review-decision-spec\.md/);
assert.match(sources.decisionLog, /schema with `id`, `status`, timestamps, source refs, evidence refs, and reviewer\/approval refs/);
assert.match(sources.decisionLog, /separate human approval semantics for record creation and application/);
assert.match(sources.audit, /Completed: `proposal review decision spec`/);
assert.match(sources.audit, /docs\/24_proposal-review-decision-spec\.md/);
assert.match(sources.audit, /`memory readiness decision spec`/);
assert.match(sources.inventory, /vNext proposal review decision spec/);
assert.match(sources.readme, /Proposal review is not proposal approval/);
assert.match(sources.readme, /docs\/24_proposal-review-decision-spec\.md/);
assert.match(sources.verification, /vnext-proposal-review-decision-spec-status\.mjs/);

const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
assert.equal(auditStatus.ok, true);
assert.equal(auditStatus.recommendedDevelopmentPlan?.[0]?.slice, 'memory readiness decision spec');

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

const authority = {
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
      spec: files.spec,
      requiredSections: requiredSpecSections,
      requiredRecordFields,
      approvalSemantics,
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
      nextRecommendedSlice: {
        id: 'memory-readiness-decision-spec',
        slice: 'memory readiness decision spec',
        command: 'node scripts/vnext-proposal-review-decision-spec-status.mjs',
        reason:
          'Proposal review now has a source-backed decision spec; long-term memory still needs its own schema, source, redaction, export, expiry, deletion, and review boundary before persistence can open.',
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
