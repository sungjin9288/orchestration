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

for (const signal of referenceSignals) {
  assert.match(sources.referenceAudit, new RegExp(signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const marker of blockedAuthorityMarkers) {
  assert.match(sources.app, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(sources.design, /warm enterprise surfaces/);
assert.match(sources.design, /Mission \/ Council \/ Execution \/ Deliverables/);
assert.match(sources.styles, /--bg-top: #f4efe6/);
assert.match(sources.styles, /\.intelligence-overview/);
assert.match(sources.app, /data-growth-learning-surface="read-only"/);
assert.match(sources.app, /data-personalization-scope="local-only"/);
assert.match(sources.app, /function renderGrowthCandidateDrilldown\(growth\)/);
assert.match(sources.app, /function renderGrowthDashboardEvidenceDepth\(growth\)/);
assert.match(sources.app, /data-growth-dashboard-evidence-depth="read-only"/);
assert.match(sources.app, /data-failure-pattern-groups="true"/);
assert.match(sources.app, /data-regression-comparison="read-only"/);
assert.match(sources.app, /data-rollback-evidence-links="true"/);
assert.match(sources.app, /data-growth-dashboard-action-allowed="false"/);
assert.match(sources.app, /function renderGrowthProposalReviewPreview\(growth\)/);
assert.match(sources.app, /function renderPersonalizationSettings\(personalization, data\)/);
assert.match(sources.app, /const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(sources.app, /const UI_PREFERENCE_PACKET_SCHEMA = 'orchestration\.ui-preferences\.portable-review\.v1'/);
assert.match(sources.app, /function getPortableUiPreferenceReview\(\)/);
assert.match(sources.app, /runtimeMutationAllowed: false/);
assert.match(sources.app, /data-local-personalization-portability="copy-review-only"/);
assert.match(sources.app, /data-action="copy-local-personalization-review"/);
assert.match(sources.app, /data-memory-readiness-gate="blocked"/);
assert.match(sources.decisionLog, /### DEC-048/);
assert.match(sources.decisionLog, /### DEC-049/);
assert.match(sources.decisionLog, /### DEC-050/);
assert.match(sources.decisionLog, /### DEC-051/);
assert.match(sources.decisionLog, /### DEC-052/);
assert.match(sources.decisionLog, /### DEC-053/);
assert.match(sources.decisionLog, /### DEC-054/);
assert.match(sources.readme, /Read-only growth evidence/);
assert.match(sources.readme, /grouped failure patterns/);
assert.match(sources.readme, /regression comparison/);
assert.match(sources.readme, /rollback evidence links/);
assert.match(sources.readme, /Local-only personalization/);
assert.match(sources.readme, /docs\/25_memory-readiness-decision-spec\.md/);
assert.match(sources.readme, /Authority expansion review is not implementation approval/);
assert.match(sources.readme, /docs\/26_authority-expansion-review-spec\.md/);
assert.match(sources.readme, /Authority implementation decision packet is decision input only/);
assert.match(sources.readme, /docs\/27_authority-implementation-decision-packet\.md/);
assert.match(sources.readme, /Durable proposal record planning preview is not planning approval/);
assert.match(sources.readme, /docs\/28_durable-proposal-record-planning-preview\.md/);
assert.match(sources.vnextAudit, /^# vNext Development Audit/m);
assert.match(sources.vnextAudit, /local-only personalization portability/);
assert.match(sources.vnextAudit, /Completed: `proposal review decision spec`/);
assert.match(sources.vnextAudit, /durable proposal record creation or persistence/);
assert.match(sources.vnextAudit, /commit or push/);
assert.match(sources.proposalDecisionSpec, /^# Proposal Review Decision Spec/m);
assert.match(sources.proposalDecisionSpec, /## Durable Proposal Record Contract/);
assert.match(sources.proposalDecisionSpec, /## Approval Semantics/);
assert.match(sources.proposalDecisionSpec, /## Expiry And Supersession/);
assert.match(sources.proposalDecisionSpec, /Review-readiness evidence is not approval/);
assert.match(sources.vnextAudit, /Completed: `memory readiness decision spec`/);
assert.match(sources.vnextAudit, /Completed: `growth dashboard evidence depth`/);
assert.match(sources.vnextAudit, /Completed: `operator-approved authority expansion review`/);
assert.match(sources.vnextAudit, /Completed: `authority implementation decision packet`/);
assert.match(sources.vnextAudit, /Completed: `durable proposal record planning preview`/);
assert.match(sources.memoryDecisionSpec, /^# Memory Readiness Decision Spec/m);
assert.match(sources.memoryDecisionSpec, /## Memory Item Contract/);
assert.match(sources.memoryDecisionSpec, /## Source And Redaction Rules/);
assert.match(sources.memoryDecisionSpec, /## Expiry And Deletion/);
assert.match(sources.memoryDecisionSpec, /Local personalization is not memory/);
assert.match(sources.authorityExpansionSpec, /^# Authority Expansion Review Spec/m);
assert.match(sources.authorityExpansionSpec, /## Review Request Contract/);
assert.match(sources.authorityExpansionSpec, /## Review Candidates/);
assert.match(sources.authorityExpansionSpec, /Durable proposal record creation and persistence/);
assert.match(sources.authorityExpansionSpec, /Memory persistence/);
assert.match(sources.authorityExpansionSpec, /Provider calls from growth surfaces/);
assert.match(sources.authorityExpansionSpec, /Source mutation from accepted improvement candidates/);
assert.match(sources.authorityExpansionSpec, /## Approval Semantics/);
assert.match(sources.authorityExpansionSpec, /## Implementation Prerequisites/);
assert.match(sources.authorityExpansionSpec, /The current state remains `operator decision required`/);
assert.match(sources.authorityExpansionSpec, /Review acceptance can only feed the next explicit decision/);
assert.match(sources.authorityDecisionPacket, /^# Authority Implementation Decision Packet/m);
assert.match(sources.authorityDecisionPacket, /## Required Operator Decision/);
assert.match(sources.authorityDecisionPacket, /Current gate: `operator decision required`/);
assert.match(sources.authorityDecisionPacket, /Current implementation authority: blocked/);
assert.match(sources.authorityDecisionPacket, /This packet does not provide that approval/);
assert.match(sources.proposalRecordPlanningPreview, /^# Durable Proposal Record Planning Preview/m);
assert.match(sources.proposalRecordPlanningPreview, /It is not `approve-planning-only`/);
assert.match(sources.proposalRecordPlanningPreview, /Current gate: `operator decision required`/);
assert.match(sources.proposalRecordPlanningPreview, /file-store-backed durable proposal record collection/);
assert.match(sources.proposalRecordPlanningPreview, /proposal application remains blocked/);
assert.match(sources.proposalRecordPlanningPreview, /no explicit `approve-planning-only` or stronger accepted decision exists/);
assert.match(sources.uiSmoke, /data-growth-learning-surface="read-only"/);
assert.match(sources.uiSmoke, /data-personalization-scope="local-only"/);
assert.match(sources.uiSmoke, /data-growth-dashboard-evidence-depth="read-only"/);
assert.match(sources.uiSmoke, /data-regression-comparison="read-only"/);
assert.match(sources.uiSmoke, /data-rollback-evidence-links="true"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="persist-growth-memory"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="import-local-personalization"/);
assert.match(sources.verification, /smoke-ui-slice-649\.mjs/);
assert.match(sources.verification, /vnext-development-audit-status\.mjs/);
assert.match(sources.verification, /vnext-memory-readiness-decision-spec-status\.mjs/);
assert.match(sources.verification, /vnext-growth-dashboard-evidence-depth-status\.mjs/);
assert.match(sources.verification, /vnext-authority-expansion-review-status\.mjs/);
assert.match(sources.verification, /vnext-authority-implementation-decision-packet-status\.mjs/);
assert.match(sources.verification, /vnext-durable-proposal-record-planning-preview-status\.mjs/);
assert.match(sources.inventory, /vNext development audit/);
assert.match(sources.inventory, /vNext memory readiness decision spec/);
assert.match(sources.inventory, /vNext growth dashboard evidence depth/);
assert.match(sources.inventory, /vNext authority expansion review/);
assert.match(sources.inventory, /vNext authority implementation decision packet/);
assert.match(sources.inventory, /vNext durable proposal record planning preview/);

const growthEngine = runStatus('scripts/growth-engine-status.mjs');
const reflection = runStatus('scripts/growth-reflection-evaluator.mjs');
const proposalReadiness = runStatus('scripts/growth-evidence-ledger-proposal-readiness-status.mjs');

const nextGrowthSlice = growthEngine.nextRecommendedSlice?.id || null;
const reflectionNextSlice = reflection.nextRecommendedSlice?.id || null;
const proposalQueueHandoff = proposalReadiness.nextRecommendedSlice?.id || null;

assert.equal(growthEngine.ok, true);
assert.equal(reflection.ok, true);
assert.equal(proposalReadiness.ok, true);
assert.equal(nextGrowthSlice, reflectionNextSlice);
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
    area: 'completion and README evidence',
    evidence: ['scripts/smoke-readme-scope-evidence.mjs', 'scripts/verification_status.mjs'],
    status: 'verified',
  },
];

const blocked = [
  'durable proposal record creation and persistence',
  'proposal generation or application',
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
    slice: 'operator decision required',
    scope:
      'Choose whether a later approved slice may open durable proposal records, memory persistence, provider calls, or source mutation.',
    gate: 'Requires explicit operator approval, accepted implementation plan, rollback plan, and focused smoke before any authority opens.',
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
      },
    },
    null,
    2,
  )}\n`,
);
