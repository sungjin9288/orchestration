import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  durableProposalRecordCreationCandidate,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-authority-expansion-review-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const authorityExpansionReviewFiles = {
  spec: 'docs/26_authority-expansion-review-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
};

const authorityExpansionSpecSections = [
  '## Purpose',
  '## Current Status',
  '## Non-Authority Boundary',
  '## Review Request Contract',
  '## Review Candidates',
  '## Recommendation',
  '## Approval Semantics',
  '## Stop Conditions',
  '## Implementation Prerequisites',
  '## Verification',
];

const authorityExpansionReviewRequestFields = [
  'id',
  'status',
  'createdAt',
  'updatedAt',
  'expiresAt',
  'targetAuthorities',
  'scopeRefs',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'approvalRefs',
  'implementationPlanRefs',
  'verificationPlanRefs',
  'rollbackRefs',
  'blockedActions',
  'nonApprovalStatement',
];

const reviewCandidates = [
  'Durable proposal record creation and persistence',
  'Memory persistence',
  'Provider calls from growth surfaces',
  'Source mutation from accepted improvement candidates',
];

const authorityExpansionReviewBlockedAuthorityMarkers = [
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'longTermMemoryStoreAllowed: false',
  'rawTranscriptIngestionAllowed: false',
  'crossWorkspaceMemoryAllowed: false',
  'skillPromotionAllowed: false',
  'proposalGenerationAllowed: false',
  'proposalApplicationAllowed: false',
  'proposalRecordCreationAllowed: false',
  'proposalRecordPersistenceAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

const forbiddenActionPatterns = [
  /data-action="generate-growth-proposal"/,
  /data-action="apply-improvement-candidate"/,
  /data-action="approve-growth-proposal"/,
  /data-action="create-proposal-record"/,
  /data-action="persist-growth-memory"/,
  /data-action="persist-memory"/,
  /data-action="store-long-term-memory"/,
  /data-action="ingest-raw-transcript"/,
  /data-action="enable-cross-workspace-memory"/,
  /data-action="promote-memory-skill"/,
  /data-action="mutate-growth-source"/,
  /data-action="apply-growth-dashboard-evidence"/,
  /data-action="create-growth-dashboard-proposal"/,
  /data-action="persist-growth-dashboard-memory"/,
  /data-action="mutate-growth-dashboard-source"/,
  /providerCallsAllowed: true/,
  /memoryPersistenceAllowed: true/,
  /longTermMemoryStoreAllowed: true/,
  /rawTranscriptIngestionAllowed: true/,
  /crossWorkspaceMemoryAllowed: true/,
  /skillPromotionAllowed: true/,
  /proposalGenerationAllowed: true/,
  /proposalApplicationAllowed: true/,
  /proposalRecordCreationAllowed: true/,
  /proposalRecordPersistenceAllowed: true/,
  /sourceMutationAllowed: true/,
  /commitPushAllowed: true/,
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

const authorityExpansionReviewSources = Object.fromEntries(
  Object.entries(authorityExpansionReviewFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of authorityExpansionSpecSections) {
  assert.match(
    authorityExpansionReviewSources.spec,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  authorityExpansionReviewSources.spec,
  authorityExpansionReviewRequestFields,
);
assertDoesNotMatchAny(authorityExpansionReviewSources.app, forbiddenActionPatterns);

const authorityExpansionReviewSourceEvidence = {
  spec: reviewCandidates,
  app: ["from './growth-config.js'"],
  growthConfig: authorityExpansionReviewBlockedAuthorityMarkers,
  decisionLog: [
    '### DEC-052',
    'docs/26_authority-expansion-review-spec.md',
    'Review acceptance can only feed the next explicit decision',
  ],
  audit: [
    'Completed: `operator-approved authority expansion review`',
    'Completed: `proposal application source mutation implementation`',
    'Completed: `proposal-record lifecycle review alias`',
    'Next implementation entry: `explicit entry required`',
  ],
  inventory: ['vNext authority expansion review'],
  readme: [
    'Authority expansion review is not implementation approval',
    'docs/26_authority-expansion-review-spec.md',
  ],
  uiSmoke: [
    'providerCallsAllowed: false',
    'proposalRecordCreationAllowed: false',
    'commitPushAllowed: false',
  ],
  verification: ['vnext-authority-expansion-review-status.mjs'],
};

assertSourceEvidence(authorityExpansionReviewSources, authorityExpansionReviewSourceEvidence);

const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const growthDashboardEvidenceDepthStatus = runStatus(
  'scripts/vnext-growth-dashboard-evidence-depth-status.mjs',
);
const proposalReviewDecisionSpecStatus = runStatus(
  'scripts/vnext-proposal-review-decision-spec-status.mjs',
);
const memoryReadinessDecisionSpecStatus = runStatus(
  'scripts/vnext-memory-readiness-decision-spec-status.mjs',
);
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(growthDashboardEvidenceDepthStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.ok, true);
assert.equal(memoryReadinessDecisionSpecStatus.ok, true);
assert.equal(vnextDevelopmentAuditStatus.authority?.sourceMutationImplementationAllowed, true);
assert.equal(
  vnextDevelopmentAuditStatus.authority?.sourceMutationAllowedThroughApprovedRuntimeFunction,
  true,
);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'operator-approved authority expansion review',
  ),
  true,
);

const authorityExpansionReviewAuthorityBoundary = {
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  proposalGenerationAllowed: false,
  proposalApplicationAllowed: false,
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
  sourceMutationAllowed: false,
  commitPushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-authority-expansion-review',
      spec: authorityExpansionReviewFiles.spec,
      candidates: reviewCandidates,
      recommendedFirstCandidate: durableProposalRecordCreationCandidate,
      nextRequiredInput: 'explicit proposal application decision, focused smoke, rollback evidence, and aggregate verification before proposal application opens',
      upstreamStatus: {
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
        growthDashboardEvidenceDepth: {
          ok: growthDashboardEvidenceDepthStatus.ok,
          displayOnly: growthDashboardEvidenceDepthStatus.implemented?.displayOnly,
        },
        proposalReviewDecisionSpec: {
          ok: proposalReviewDecisionSpecStatus.ok,
          proposalRecordCreationAllowed:
            proposalReviewDecisionSpecStatus.authority?.proposalRecordCreationAllowed,
        },
        memoryReadinessDecisionSpec: {
          ok: memoryReadinessDecisionSpecStatus.ok,
          memoryPersistenceAllowed:
            memoryReadinessDecisionSpecStatus.authority?.memoryPersistenceAllowed,
        },
      },
      authority: authorityExpansionReviewAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
