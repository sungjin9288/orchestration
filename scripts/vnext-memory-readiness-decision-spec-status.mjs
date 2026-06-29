import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-memory-readiness-decision-spec-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const memoryReadinessDecisionSpecFiles = {
  spec: 'docs/25_memory-readiness-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
};

const memoryReadinessSpecSections = [
  '## Purpose',
  '## Current Status',
  '## Non-Authority Boundary',
  '## Memory Item Contract',
  '## Source And Redaction Rules',
  '## Review And Approval Semantics',
  '## Expiry And Deletion',
  '## Stop Conditions',
  '## Implementation Prerequisites',
  '## Verification',
];

const requiredMemoryFields = [
  'id',
  'status',
  'createdAt',
  'updatedAt',
  'expiresAt',
  'sourceRefs',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'redactionRefs',
  'workspaceScope',
  'applicability',
  'reviewRefs',
  'exportRefs',
  'deletionRefs',
  'blockedActions',
  'nonPersistenceStatement',
];

const reviewSemantics = [
  'Readiness review',
  'Storage approval',
  'Export approval',
  'Deletion approval',
  'Skill-promotion review',
  'Readiness can only feed the next explicit decision',
];

const blockedAuthorityMarkers = [
  'memoryPersistenceAllowed: false',
  'longTermMemoryStoreAllowed: false',
  'rawTranscriptIngestionAllowed: false',
  'crossWorkspaceMemoryAllowed: false',
  'skillPromotionAllowed: false',
  'providerCallsAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

const forbiddenAuthorityPatterns = [
  /data-action="persist-growth-memory"/,
  /data-action="persist-memory"/,
  /data-action="store-long-term-memory"/,
  /data-action="ingest-raw-transcript"/,
  /data-action="enable-cross-workspace-memory"/,
  /data-action="promote-memory-skill"/,
  /data-action="promote-skill"/,
  /data-action="create-memory-record"/,
  /data-action="import-local-personalization"/,
  /memoryPersistenceAllowed: true/,
  /longTermMemoryStoreAllowed: true/,
  /rawTranscriptIngestionAllowed: true/,
  /crossWorkspaceMemoryAllowed: true/,
  /skillPromotionAllowed: true/,
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

const memoryReadinessDecisionSpecSources = Object.fromEntries(
  Object.entries(memoryReadinessDecisionSpecFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of memoryReadinessSpecSections) {
  assert.match(
    memoryReadinessDecisionSpecSources.spec,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(memoryReadinessDecisionSpecSources.spec, requiredMemoryFields);
assertDoesNotMatchAny(memoryReadinessDecisionSpecSources.app, forbiddenAuthorityPatterns);

const sourceEvidence = {
  spec: reviewSemantics,
  app: blockedAuthorityMarkers,
  decisionLog: [
    '### DEC-049',
    '### DEC-051',
    'docs/25_memory-readiness-decision-spec.md',
    'memory item schema with source refs and evidence refs',
    'redaction policy, export format, expiry/deletion policy, human review semantics',
  ],
  audit: [
    'Completed: `memory readiness decision spec`',
    'docs/25_memory-readiness-decision-spec.md',
    'Completed: `growth dashboard evidence depth`',
    'Completed: `operator-approved authority expansion review`',
    '`proposal application implementation decision required`',
  ],
  inventory: ['vNext memory readiness decision spec'],
  readme: ['Long-term memory is readiness only', 'docs/25_memory-readiness-decision-spec.md'],
  uiSmoke: [
    'data-memory-readiness-gate="blocked"',
    'doesNotMatch(appJs, /data-action="persist-growth-memory"',
    'doesNotMatch(appJs, /data-action="ingest-raw-transcript"',
    'doesNotMatch(appJs, /data-action="promote-memory-skill"',
    'doesNotMatch(appJs, /data-action="enable-cross-workspace-memory"',
    'doesNotMatch(appJs, /data-action="create-memory-record"',
  ],
  verification: ['vnext-memory-readiness-decision-spec-status.mjs'],
};

assertSourceEvidence(memoryReadinessDecisionSpecSources, sourceEvidence);

const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const proposalReviewDecisionSpecStatus = runStatus(
  'scripts/vnext-proposal-review-decision-spec-status.mjs',
);
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationImplementationDecisionSlice =
  'proposal application implementation decision required';
const proposalApplicationImplementationDecision = {
  id: 'proposal-application-implementation-decision-required',
  slice: proposalApplicationImplementationDecisionSlice,
  command: 'node scripts/vnext-memory-readiness-decision-spec-status.mjs',
  reason:
    'Proposal, memory, growth dashboard, authority review, durable proposal record creation/persistence, and application planning-only evidence are source-backed; applying proposals still requires a later accepted implementation decision.',
};

assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationImplementationDecisionSlice);
assert.equal(proposalReviewDecisionSpecStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.authority?.memoryPersistenceAllowed, false);

const memoryReadinessAuthorityBoundary = {
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  memoryImportAllowed: false,
  memoryApplyAllowed: false,
  providerCallsAllowed: false,
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
      posture: 'read-only-memory-readiness-decision-spec',
      spec: memoryReadinessDecisionSpecFiles.spec,
      requiredSections: memoryReadinessSpecSections,
      requiredMemoryFields,
      reviewSemantics,
      stopConditions: [
        'missing sourceRefs',
        'missing evidenceRefs',
        'missing negativeEvidenceRefs',
        'missing redactionRefs',
        'missing reviewRefs',
        'missing explicit storage approval',
        'missing explicit export approval',
        'missing explicit deletion approval',
        'stale source evidence',
        'unresolved negative evidence',
        'expired or deleted memory item',
        'cross-workspace memory attempt',
        'raw transcript ingestion attempt',
        'secret-bearing payload detected',
        'provider call attempt from memory readiness',
        'source mutation attempt from memory readiness',
        'commit or push attempt from memory readiness',
      ],
      upstreamStatus: {
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
        proposalDecisionSpec: {
          ok: proposalReviewDecisionSpecStatus.ok,
          memoryPersistenceAllowed:
            proposalReviewDecisionSpecStatus.authority?.memoryPersistenceAllowed,
        },
      },
      nextRecommendedSlice: proposalApplicationImplementationDecision,
      authority: memoryReadinessAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
