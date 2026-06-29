import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-development-audit-status';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  readme: 'README.md',
  design: 'DESIGN.md',
  referenceAudit: 'docs/reference/vnext-reference-driven-ui-audit.md',
  vnextAudit: 'docs/23_vnext-development-audit.md',
  proposalDecisionSpec: 'docs/24_proposal-review-decision-spec.md',
  memoryDecisionSpec: 'docs/25_memory-readiness-decision-spec.md',
  authorityExpansionSpec: 'docs/26_authority-expansion-review-spec.md',
  authorityDecisionPacket: 'docs/27_authority-implementation-decision-packet.md',
  proposalRecordPlanningPreview: 'docs/28_durable-proposal-record-planning-preview.md',
  operatorDecisionHandoff: 'docs/29_operator-decision-handoff.md',
  proposalRecordImplementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  proposalApplicationDecisionPacket: 'docs/31_proposal-application-decision-packet.md',
  proposalRecordImplementationStatus: 'scripts/vnext-durable-proposal-record-implementation-status.mjs',
  proposalRecordCreationSmoke: 'scripts/smoke-durable-proposal-record-creation.mjs',
  decisionLog: 'docs/01_decision-log.md',
  growthPlan: 'docs/18_growth-gateway-vnext.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  app: 'ui/app.js',
  styles: 'ui/styles.css',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
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

function assertMatchesAll(source, expectedPatterns) {
  for (const expectedPattern of expectedPatterns) {
    assert.match(source, expectedPattern);
  }
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

const referenceSignals = ['Linear', 'LangSmith Studio', 'Retool', 'Dify', 'n8n HITL', 'Zapier', 'NN/g 2026 UX'];
const blockedAuthorityMarkers = [
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

assertContainsAll(sources.referenceAudit, referenceSignals);
assertContainsAll(sources.app, blockedAuthorityMarkers);

assertContainsAll(sources.design, ['warm enterprise surfaces', 'Mission / Council / Execution / Deliverables']);
assertContainsAll(sources.styles, ['--bg-top: #f4efe6', '.intelligence-overview']);
assertContainsAll(sources.app, [
  'data-growth-learning-surface="read-only"',
  'data-personalization-scope="local-only"',
  'function renderGrowthCandidateDrilldown(growth)',
  'function renderGrowthDashboardEvidenceDepth(growth)',
  'data-growth-dashboard-evidence-depth="read-only"',
  'data-failure-pattern-groups="true"',
  'data-regression-comparison="read-only"',
  'data-rollback-evidence-links="true"',
  'data-growth-dashboard-action-allowed="false"',
  'function renderGrowthProposalReviewPreview(growth)',
  'function renderPersonalizationSettings(personalization, data)',
  "const UI_PREFERENCE_STORAGE_KEY = 'orchestration.ui-preferences.v1'",
  "const UI_PREFERENCE_PACKET_SCHEMA = 'orchestration.ui-preferences.portable-review.v1'",
  'function getPortableUiPreferenceReview()',
  'runtimeMutationAllowed: false',
  'data-local-personalization-portability="copy-review-only"',
  'data-action="copy-local-personalization-review"',
  'data-memory-readiness-gate="blocked"',
]);
assertContainsAll(sources.decisionLog, [
  '### DEC-048',
  '### DEC-049',
  '### DEC-050',
  '### DEC-051',
  '### DEC-052',
  '### DEC-053',
  '### DEC-054',
  '### DEC-055',
  '### DEC-056',
  '### DEC-057',
  '### DEC-058',
]);
assertContainsAll(sources.readme, [
  'Read-only growth evidence',
  'grouped failure patterns',
  'regression comparison',
  'rollback evidence links',
  'Local-only personalization',
  'docs/25_memory-readiness-decision-spec.md',
  'Authority expansion review is not implementation approval',
  'docs/26_authority-expansion-review-spec.md',
  'Authority implementation decision packet is decision input only',
  'docs/27_authority-implementation-decision-packet.md',
  'Durable proposal record planning preview is not planning approval',
  'docs/28_durable-proposal-record-planning-preview.md',
  'Operator decision handoff is not approval',
  'docs/29_operator-decision-handoff.md',
  'Durable proposal record implementation plan is consumed decision evidence',
  'Durable proposal record creation and persistence is implemented',
  'docs/30_durable-proposal-record-implementation-plan.md',
  'Proposal application decision packet is decision input only',
  'docs/31_proposal-application-decision-packet.md',
]);
assertContainsAll(sources.vnextAudit, [
  'local-only personalization portability',
  'Completed: `proposal review decision spec`',
  'durable proposal records',
  'commit or push',
  'Completed: `memory readiness decision spec`',
  'Completed: `growth dashboard evidence depth`',
  'Completed: `operator-approved authority expansion review`',
  'Completed: `authority implementation decision packet`',
  'Completed: `durable proposal record planning preview`',
  'Completed: `operator decision handoff`',
  'Completed: `durable proposal record implementation plan`',
  'Completed: `durable proposal record implementation`',
  'Completed: `proposal application decision packet`',
  '1. `proposal application planning decision required`',
]);
assertMatchesAll(sources.vnextAudit, [/^# vNext Development Audit/m]);

assertContainsAll(sources.proposalDecisionSpec, [
  '## Durable Proposal Record Contract',
  '## Approval Semantics',
  '## Expiry And Supersession',
  'Review-readiness evidence is not approval',
]);
assertMatchesAll(sources.proposalDecisionSpec, [/^# Proposal Review Decision Spec/m]);

assertContainsAll(sources.memoryDecisionSpec, [
  '## Memory Item Contract',
  '## Source And Redaction Rules',
  '## Expiry And Deletion',
  'Local personalization is not memory',
]);
assertMatchesAll(sources.memoryDecisionSpec, [/^# Memory Readiness Decision Spec/m]);

assertContainsAll(sources.authorityExpansionSpec, [
  '## Review Request Contract',
  '## Review Candidates',
  'Durable proposal record creation and persistence',
  'Memory persistence',
  'Provider calls from growth surfaces',
  'Source mutation from accepted improvement candidates',
  '## Approval Semantics',
  '## Implementation Prerequisites',
  'current downstream state to `proposal application decision required`',
  'Review acceptance can only feed the next explicit decision',
]);
assertMatchesAll(sources.authorityExpansionSpec, [/^# Authority Expansion Review Spec/m]);

assertContainsAll(sources.authorityDecisionPacket, [
  '## Required Operator Decision',
  'Original gate: `operator decision required`',
  'Current downstream gate: `proposal application decision required`',
  'Current packet status: `consumed-by-planning-only-decision`',
  'Current implementation authority: accepted for durable proposal record creation and persistence only',
  'This packet does not provide that approval',
]);
assertMatchesAll(sources.authorityDecisionPacket, [/^# Authority Implementation Decision Packet/m]);

assertContainsAll(sources.proposalRecordPlanningPreview, [
  'It is not `approve-planning-only`',
  'Original gate: `operator decision required`',
  'Current downstream gate: `proposal application decision required`',
  'Current preview status: `consumed-by-planning-only-decision`',
  'file-store-backed durable proposal record collection',
  'proposal application remains blocked',
  'no later proposal application decision exists for the created durable proposal records',
]);
assertMatchesAll(sources.proposalRecordPlanningPreview, [/^# Durable Proposal Record Planning Preview/m]);

assertContainsAll(sources.operatorDecisionHandoff, [
  'It is not an operator decision',
  'Handoff status: `consumed-by-planning-only-decision`',
  '## Valid Decision Statements',
  '## Invalid Shortcuts',
  '## Minimum Planning-Only Acceptance',
  'I approve planning only for durable proposal record creation and persistence',
  'does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push',
]);
assertMatchesAll(sources.operatorDecisionHandoff, [/^# Operator Decision Handoff/m]);

assertContainsAll(sources.proposalApplicationDecisionPacket, [
  'Original gate: `proposal application decision required`',
  'Source implementation: `DEC-057`',
  'Current packet status: `decision-input-only`',
  'Current application authority: blocked',
  'It is not proposal application approval',
  'approve-application-planning-only',
  'approve-application-implementation-slice',
  'creation approval and application approval are collapsed into one approval',
  'application approval and source mutation approval are collapsed into one approval',
]);
assertMatchesAll(sources.proposalApplicationDecisionPacket, [/^# Proposal Application Decision Packet/m]);

assertContainsAll(sources.proposalRecordImplementationPlan, [
  'decisionStatus` | `approve-planning-only`',
  'Planning approval: accepted',
  'Implementation approval: accepted',
  'Runtime implementation: completed',
  'Default expiry policy: 30 days from `createdAt`',
  'extend the runtime state contract with a `proposalRecords` collection and a `proposalRecord` sequence',
  'persist records in the existing runtime `state.json` under the selected runtime root',
  'record creation fails without explicit creation approval',
  'proposal application remains blocked',
  'provider calls remain blocked',
  'memory persistence remains blocked',
  'source mutation remains blocked',
  'commit and push remain blocked',
]);
assertMatchesAll(sources.proposalRecordImplementationPlan, [
  /^# Durable Proposal Record Implementation Plan/m,
]);

assertContainsAll(sources.uiSmoke, [
  'data-growth-learning-surface="read-only"',
  'data-personalization-scope="local-only"',
  'data-growth-dashboard-evidence-depth="read-only"',
  'data-regression-comparison="read-only"',
  'data-rollback-evidence-links="true"',
  'doesNotMatch(appJs, /data-action="persist-growth-memory"',
  'doesNotMatch(appJs, /data-action="import-local-personalization"',
]);
assertContainsAll(sources.verification, [
  'smoke-ui-slice-649.mjs',
  'vnext-development-audit-status.mjs',
  'vnext-memory-readiness-decision-spec-status.mjs',
  'vnext-growth-dashboard-evidence-depth-status.mjs',
  'vnext-authority-expansion-review-status.mjs',
  'vnext-authority-implementation-decision-packet-status.mjs',
  'vnext-durable-proposal-record-planning-preview-status.mjs',
  'vnext-operator-decision-handoff-status.mjs',
  'vnext-durable-proposal-record-implementation-plan-status.mjs',
  'smoke-durable-proposal-record-creation.mjs',
  'vnext-durable-proposal-record-implementation-status.mjs',
  'vnext-proposal-application-decision-packet-status.mjs',
]);
assertContainsAll(sources.inventory, [
  'vNext development audit',
  'vNext memory readiness decision spec',
  'vNext growth dashboard evidence depth',
  'vNext authority expansion review',
  'vNext authority implementation decision packet',
  'vNext durable proposal record planning preview',
  'vNext operator decision handoff',
  'vNext durable proposal record implementation plan',
  'vNext proposal application decision packet',
]);

const growthEngine = runStatus('scripts/growth-engine-status.mjs');
const reflection = runStatus('scripts/growth-reflection-evaluator.mjs');
const proposalReadiness = runStatus('scripts/growth-evidence-ledger-proposal-readiness-status.mjs');

const growthEngineNextSlice = growthEngine.nextRecommendedSlice?.id || null;
const reflectionNextSlice = reflection.nextRecommendedSlice?.id || null;
const proposalQueueHandoff = proposalReadiness.nextRecommendedSlice?.id || null;
const nextGrowthSlice = 'proposal application planning decision required';

assert.equal(growthEngine.ok, true);
assert.equal(reflection.ok, true);
assert.equal(proposalReadiness.ok, true);
assert.equal(growthEngineNextSlice, reflectionNextSlice);
assert.equal(proposalQueueHandoff, 'growth-evidence-ledger-proposal-queue-handoff');

const implemented = [
  {
    area: 'reference-driven design',
    evidence: ['DESIGN.md', 'docs/reference/vnext-reference-driven-ui-audit.md', 'ui/styles.css'],
    status: 'implemented',
  },
  {
    area: 'read-only growth evidence',
    evidence: ['ui/app.js', 'scripts/smoke-ui-slice-649.mjs', 'docs/01_decision-log.md#DEC-048'],
    status: 'implemented-read-only-with-dashboard-depth',
  },
  {
    area: 'growth dashboard evidence depth',
    evidence: ['ui/app.js', 'ui/styles.css', 'scripts/vnext-growth-dashboard-evidence-depth-status.mjs'],
    status: 'implemented-read-only',
  },
  {
    area: 'local-only personalization',
    evidence: ['ui/app.js', 'README.md', 'docs/01_decision-log.md#DEC-049', 'scripts/smoke-ui-slice-649.mjs'],
    status: 'implemented-local-only-copy-review',
  },
  {
    area: 'proposal review decision spec',
    evidence: ['docs/24_proposal-review-decision-spec.md', 'docs/01_decision-log.md#DEC-048', 'docs/01_decision-log.md#DEC-050'],
    status: 'documented-read-only',
  },
  {
    area: 'memory readiness decision spec',
    evidence: ['docs/25_memory-readiness-decision-spec.md', 'docs/01_decision-log.md#DEC-049', 'docs/01_decision-log.md#DEC-051'],
    status: 'documented-read-only',
  },
  {
    area: 'operator-approved authority expansion review',
    evidence: ['docs/26_authority-expansion-review-spec.md', 'docs/01_decision-log.md#DEC-052', 'scripts/vnext-authority-expansion-review-status.mjs'],
    status: 'documented-read-only',
  },
  {
    area: 'authority implementation decision packet',
    evidence: [
      'docs/27_authority-implementation-decision-packet.md',
      'docs/01_decision-log.md#DEC-053',
      'scripts/vnext-authority-implementation-decision-packet-status.mjs',
    ],
    status: 'documented-read-only',
  },
  {
    area: 'durable proposal record planning preview',
    evidence: [
      'docs/28_durable-proposal-record-planning-preview.md',
      'docs/01_decision-log.md#DEC-054',
      'scripts/vnext-durable-proposal-record-planning-preview-status.mjs',
    ],
    status: 'documented-read-only-planning-input',
  },
  {
    area: 'operator decision handoff',
    evidence: [
      'docs/29_operator-decision-handoff.md',
      'docs/01_decision-log.md#DEC-055',
      'scripts/vnext-operator-decision-handoff-status.mjs',
    ],
    status: 'documented-read-only-decision-template',
  },
  {
    area: 'durable proposal record implementation plan',
    evidence: [
      'docs/30_durable-proposal-record-implementation-plan.md',
      'docs/01_decision-log.md#DEC-056',
      'scripts/vnext-durable-proposal-record-implementation-plan-status.mjs',
    ],
    status: 'documented-implemented-slice-plan',
  },
  {
    area: 'durable proposal record implementation',
    evidence: [
      'src/runtime/contracts.js',
      'src/runtime/file-store.js',
      'src/runtime/runtime-service.js',
      'ui/app.js',
      'scripts/smoke-durable-proposal-record-creation.mjs',
      'scripts/vnext-durable-proposal-record-implementation-status.mjs',
    ],
    status: 'implemented-creation-persistence-only',
  },
  {
    area: 'proposal application decision packet',
    evidence: [
      'docs/31_proposal-application-decision-packet.md',
      'docs/01_decision-log.md#DEC-058',
      'scripts/vnext-proposal-application-decision-packet-status.mjs',
    ],
    status: 'documented-read-only-decision-input',
  },
  {
    area: 'completion and README evidence',
    evidence: ['scripts/smoke-readme-scope-evidence.mjs', 'scripts/verification_status.mjs'],
    status: 'verified',
  },
];

const blocked = [
  'proposal generation or application',
  'durable proposal record UI creation action',
  'long-term memory persistence',
  'raw transcript ingestion',
  'cross-workspace memory',
  'skill promotion',
  'provider calls from growth learning surfaces',
  'runtime, UI, or source mutation from growth candidates',
  'commit or push from growth candidates',
];

const recommendedDevelopmentPlan = [
  {
    priority: 1,
    slice: 'proposal application planning decision required',
    scope:
      'Choose whether a later slice should plan proposal application semantics for existing durable proposal records.',
    gate: 'Requires explicit proposal application planning or implementation authority, focused smoke coverage, rollback evidence, and aggregate verification before any proposal can mutate source or apply itself.',
  },
];

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      posture: 'read-only-current-state-audit',
      implemented,
      blocked,
      nextGrowthSlice,
      proposalQueueHandoff,
      recommendedDevelopmentPlan,
      authority: {
        planningApproved: true,
        implementationApproved: true,
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
        proposalRecordCreationAllowedThroughApprovedRuntimeFunction: true,
        proposalRecordPersistenceAllowedThroughApprovedRuntimeFunction: true,
        proposalRecordUiCreateActionAllowed: false,
        sourceMutationAllowed: false,
        commitPushAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
