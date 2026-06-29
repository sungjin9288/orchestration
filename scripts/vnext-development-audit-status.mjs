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
assert.match(sources.readme, /Read-only growth evidence/);
assert.match(sources.readme, /Local-only personalization/);
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
assert.match(sources.uiSmoke, /data-growth-learning-surface="read-only"/);
assert.match(sources.uiSmoke, /data-personalization-scope="local-only"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="persist-growth-memory"/);
assert.match(sources.uiSmoke, /doesNotMatch\(appJs, \/data-action="import-local-personalization"/);
assert.match(sources.verification, /smoke-ui-slice-649\.mjs/);
assert.match(sources.verification, /vnext-development-audit-status\.mjs/);
assert.match(sources.inventory, /vNext development audit/);

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
    slice: 'memory readiness decision spec',
    scope:
      'Define memory item schema, source boundaries, redaction, export, expiry, deletion, and skill-promotion review before enabling long-term memory.',
    gate: 'Requires focused smoke proving raw transcript ingestion and cross-workspace memory remain blocked until approval.',
  },
  {
    priority: 2,
    slice: 'growth dashboard evidence depth',
    scope:
      'Expand read-only Growth Evidence Ledger views with grouped failure patterns, regression comparisons, and rollback evidence links.',
    gate: 'Must remain evidence display only; no proposal application or source mutation.',
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
