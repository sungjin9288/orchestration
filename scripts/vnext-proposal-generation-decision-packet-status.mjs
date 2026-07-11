import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-generation-decision-packet-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const files = {
  packet: 'docs/40_proposal-generation-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  authorityReview: 'docs/26_authority-expansion-review-spec.md',
  authorityPacket: 'docs/27_authority-implementation-decision-packet.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  growthConfig: 'ui/growth-config.js',
  growthPanels: 'ui/growth-panels.js',
  proposalQueue: 'scripts/growth-proposal-queue-status.mjs',
  proposalReadiness: 'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  verification: 'scripts/verification_status.mjs',
};

const sections = [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Recommended Planning Target',
  '## Generation Boundary',
  '## Still Blocked',
  '## Stop Conditions',
  '## Copy-Ready Planning Decision',
  '## Verification',
];

const decisionOptions = [
  'approve-proposal-generation-planning-only',
  'request-more-evidence',
  'reject',
  'defer',
];

const requiredDecisionFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'generationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const authority = {
  proposalGenerationPlanningAllowed: false,
  proposalGenerationImplementationAllowed: false,
  providerAssistedGenerationAllowed: false,
  proposalRecordCreationOutsideApprovedRuntimeAllowed: false,
  proposalRecordUiCreateActionAllowed: false,
  proposalApplicationAllowed: false,
  proposalQueueMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  runtimeMutationAllowed: false,
  uiMutationAllowed: false,
  sourceMutationOutsideApprovedPathAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

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

function assertBacktickedAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(`\\\`${escapeRegExp(expectedValue)}\\\``));
  }
}

function runStatus(relativePath) {
  return JSON.parse(
    execFileSync(process.execPath, [relativePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of sections) {
  assert.match(sources.packet, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertBacktickedAll(sources.packet, decisionOptions);
assertBacktickedAll(sources.packet, requiredDecisionFields);

assertContainsAll(sources.packet, [
  'Current gate: `proposal generation planning decision required`',
  'Current packet status: `awaiting-operator-planning-decision`',
  'deterministic local proposal draft generation from exactly one existing evidence candidate',
  'Provider-assisted generation: separately blocked',
  'It is not planning approval, implementation approval',
  'decisionId=operator-decision-vnext-proposal-generation-planning-001',
  'approvalStatement=I approve planning only for one deterministic local proposal draft generation path',
]);

assertContainsAll(sources.proposalSpec, [
  'Proposal review, proposal record creation, and proposal application are separate gates',
  'Review acceptance can only feed the next explicit decision',
]);
assertContainsAll(sources.authorityReview, [
  'proposal generation',
  'Review acceptance can only feed the next explicit decision',
]);
assertContainsAll(sources.authorityPacket, [
  'targetAuthority',
  'proposal generation',
]);
assertContainsAll(sources.audit, [
  'Completed: `proposal generation decision packet`',
  'proposal generation planning decision required',
]);
assertContainsAll(sources.decisionLog, ['### DEC-068']);
assertContainsAll(sources.inventory, ['vNext proposal generation decision packet']);
assertContainsAll(sources.readme, [
  'Proposal generation decision packet:',
  'docs/40_proposal-generation-decision-packet.md',
]);
assertContainsAll(sources.growthConfig, [
  'proposalGenerationAllowed: false',
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
]);
assert.doesNotMatch(sources.growthPanels, /data-action="generate-growth-proposal"/);
assertContainsAll(sources.proposalQueue, [
  "const PROPOSAL_STATUSES = [",
  "'candidate'",
  "'ready-for-review'",
  'proposal records may describe a candidate slice but cannot write files',
]);
assertContainsAll(sources.proposalReadiness, [
  'growth-evidence-ledger-proposal-readiness-status',
  'doesNotGenerateProposals: true',
]);
assertContainsAll(sources.verification, [
  'vnext-proposal-generation-decision-packet-status.mjs',
]);

const proposalQueueStatus = runStatus('scripts/growth-proposal-queue-status.mjs');
const proposalReadinessStatus = runStatus(
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
);

assert.equal(proposalQueueStatus.ok, true);
assert.equal(proposalReadinessStatus.ok, true);
assert.equal(proposalQueueStatus.safetyBoundary?.doesNotGenerateProposals, true);
assert.equal(proposalReadinessStatus.safetyBoundary?.doesNotGenerateProposals, true);
assert.equal(proposalReadinessStatus.safetyBoundary?.doesNotApplyProposals, true);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      posture: 'read-only-proposal-generation-decision-packet',
      packet: files.packet,
      currentGate: 'proposal generation planning decision required',
      recommendedTarget: {
        authority: 'deterministic local proposal draft generation planning',
        inputCandidateCount: 1,
        providerAssisted: false,
        implementationAllowed: false,
      },
      decisionOptions,
      requiredDecisionFields,
      upstream: {
        proposalQueue: {
          ok: proposalQueueStatus.ok,
          nextRecommendedSlice: proposalQueueStatus.nextRecommendedSlice?.id || null,
        },
        proposalReadiness: {
          ok: proposalReadinessStatus.ok,
          nextRecommendedSlice: proposalReadinessStatus.nextRecommendedSlice?.id || null,
        },
      },
      authority,
      safetyBoundary: {
        readOnly: true,
        doesNotWriteFiles: true,
        doesNotMutateRuntime: true,
        doesNotMutateUi: true,
        doesNotGenerateProposals: true,
        doesNotCreateProposalRecords: true,
        doesNotApplyProposals: true,
        doesNotMutateProposalQueue: true,
        doesNotCallProviders: true,
        doesNotPersistMemory: true,
        doesNotMutateSource: true,
        doesNotCommit: true,
        doesNotPush: true,
      },
    },
    null,
    2,
  )}\n`,
);
