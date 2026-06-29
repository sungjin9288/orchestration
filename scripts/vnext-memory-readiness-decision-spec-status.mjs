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

const files = {
  spec: 'docs/25_memory-readiness-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
};

const requiredSpecSections = [
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

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredSpecSections) {
  assert.match(sources.spec, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

for (const field of requiredMemoryFields) {
  assert.match(sources.spec, new RegExp(`\\\`${escapeRegExp(field)}\\\``));
}

for (const semantic of reviewSemantics) {
  assert.match(sources.spec, new RegExp(escapeRegExp(semantic)));
}

for (const marker of blockedAuthorityMarkers) {
  assert.match(sources.app, new RegExp(escapeRegExp(marker)));
}

for (const pattern of forbiddenAuthorityPatterns) {
  assert.doesNotMatch(sources.app, pattern);
}

assert.match(sources.decisionLog, /### DEC-049/);
assert.match(sources.decisionLog, /### DEC-051/);
assert.match(sources.decisionLog, /docs\/25_memory-readiness-decision-spec\.md/);
assert.match(sources.decisionLog, /memory item schema with source refs and evidence refs/);
assert.match(sources.decisionLog, /redaction policy, export format, expiry\/deletion policy, human review semantics/);
assert.match(sources.audit, /Completed: `memory readiness decision spec`/);
assert.match(sources.audit, /docs\/25_memory-readiness-decision-spec\.md/);
assert.match(sources.audit, /Completed: `growth dashboard evidence depth`/);
assert.match(sources.audit, /Completed: `operator-approved authority expansion review`/);
assert.match(sources.audit, /`proposal application decision required`/);
assert.match(sources.inventory, /vNext memory readiness decision spec/);
assert.match(sources.readme, /Long-term memory is readiness only/);
assert.match(sources.readme, /docs\/25_memory-readiness-decision-spec\.md/);
assert.match(sources.uiSmoke, /data-memory-readiness-gate="blocked"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="persist-growth-memory"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="ingest-raw-transcript"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="promote-memory-skill"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="enable-cross-workspace-memory"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="create-memory-record"/);
assert.match(sources.verification, /vnext-memory-readiness-decision-spec-status\.mjs/);

const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const proposalSpecStatus = runStatus('scripts/vnext-proposal-review-decision-spec-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const currentNextSlice = {
  id: 'proposal-application-decision-required',
  slice: 'proposal application decision required',
  command: 'node scripts/vnext-memory-readiness-decision-spec-status.mjs',
  reason:
    'Proposal, memory, growth dashboard, authority review, and durable proposal record creation/persistence are source-backed; applying proposals still requires a later accepted application decision.',
};

assert.equal(auditStatus.ok, true);
assert.equal(auditNextSlice, currentNextSlice.slice);
assert.equal(proposalSpecStatus.ok, true);
assert.equal(proposalSpecStatus.authority?.memoryPersistenceAllowed, false);

const authority = {
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
      spec: files.spec,
      requiredSections: requiredSpecSections,
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
          ok: auditStatus.ok,
          nextSlice: auditStatus.recommendedDevelopmentPlan?.[0]?.slice,
        },
        proposalDecisionSpec: {
          ok: proposalSpecStatus.ok,
          memoryPersistenceAllowed: proposalSpecStatus.authority?.memoryPersistenceAllowed,
        },
      },
      nextRecommendedSlice: currentNextSlice,
      authority,
    },
    null,
    2,
  )}\n`,
);
