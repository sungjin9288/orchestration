import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-growth-dashboard-evidence-depth-status';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const growthDashboardEvidenceDepthFiles = {
  readme: 'README.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  app: 'ui/app.js',
  styles: 'ui/styles.css',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
};

const growthDashboardEvidenceDepthBlockedAuthorityMarkers = [
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

const forbiddenActions = [
  /data-action="generate-growth-proposal"/,
  /data-action="apply-improvement-candidate"/,
  /data-action="persist-growth-memory"/,
  /data-action="approve-growth-proposal"/,
  /data-action="create-proposal-record"/,
  /data-action="mutate-growth-source"/,
  /data-action="persist-memory"/,
  /data-action="store-long-term-memory"/,
  /data-action="ingest-raw-transcript"/,
  /data-action="enable-cross-workspace-memory"/,
  /data-action="promote-memory-skill"/,
  /data-action="create-memory-record"/,
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

function assertMatchesAll(source, expectedPatterns) {
  for (const expectedPattern of expectedPatterns) {
    assert.match(source, expectedPattern);
  }
}

function assertDoesNotMatchAny(source, forbiddenPatterns) {
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(source, forbiddenPattern);
  }
}

function assertSourceEvidence(sourcesByName, evidenceBySource) {
  for (const [sourceName, expectedPatterns] of Object.entries(evidenceBySource)) {
    assertMatchesAll(sourcesByName[sourceName], expectedPatterns);
  }
}

const growthDashboardEvidenceDepthSources = Object.fromEntries(
  Object.entries(growthDashboardEvidenceDepthFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

const growthDashboardEvidenceDepthEscapedAuthorityMarkers =
  growthDashboardEvidenceDepthBlockedAuthorityMarkers.map(
  (marker) => new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );

const growthDashboardEvidenceDepthSourceEvidence = {
  app: [
    /function getGrowthFailurePatternGroups\(\{ failedRuns, reviewArtifacts, blockedTasks \}\)/,
    /function getGrowthRegressionComparison\(\{ failedRuns, completedRuns \}\)/,
    /function getGrowthRollbackEvidenceLinks\(artifacts\)/,
    /function renderGrowthDashboardEvidenceDepth\(growth\)/,
    /data-growth-dashboard-evidence-depth="read-only"/,
    /data-failure-pattern-groups="true"/,
    /data-regression-comparison="read-only"/,
    /data-rollback-evidence-links="true"/,
    /data-growth-dashboard-action-allowed="false"/,
    /실패 묶음, 회귀 비교, 되돌림 근거를 함께 봅니다/,
    /되돌림 근거 링크/,
    ...growthDashboardEvidenceDepthEscapedAuthorityMarkers,
  ],
  styles: [
    /\.growth-dashboard-depth/,
    /\.growth-pattern-grid/,
    /\.growth-regression-row/,
    /\.growth-rollback-list/,
    /\.growth-rollback-chip/,
  ],
  uiSmoke: [
    /data-growth-dashboard-evidence-depth="read-only"/,
    /data-regression-comparison="read-only"/,
    /data-rollback-evidence-links="true"/,
  ],
  readme: [/grouped failure patterns/, /regression comparison/, /rollback evidence links/],
  audit: [/Completed: `growth dashboard evidence depth`/],
  inventory: [/vNext growth dashboard evidence depth/],
  verification: [/vnext-growth-dashboard-evidence-depth-status\.mjs/],
};

assertSourceEvidence(
  growthDashboardEvidenceDepthSources,
  growthDashboardEvidenceDepthSourceEvidence,
);

assertDoesNotMatchAny(growthDashboardEvidenceDepthSources.app, forbiddenActions);

const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationSourceMutationDecisionSlice =
  'proposal application source mutation decision required';
const proposalApplicationSourceMutationDecision = {
  id: 'proposal-application-source-mutation-decision-required',
  slice: proposalApplicationSourceMutationDecisionSlice,
  reason:
    'The read-only growth dashboard, approved durable proposal record creation/persistence slice, and audit-only application attempt are source-backed; real proposal application and source mutation still need a later explicit decision, rollback evidence, focused smoke, and aggregate verification.',
};

assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'growth dashboard evidence depth',
  ),
  true,
);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationSourceMutationDecisionSlice);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      posture: 'read-only-growth-dashboard-evidence-depth',
      implemented: {
        groupedFailurePatterns: true,
        regressionComparison: true,
        rollbackEvidenceLinks: true,
        displayOnly: true,
      },
      authority: {
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        proposalGenerationAllowed: false,
        proposalApplicationAllowed: false,
        proposalRecordCreationAllowed: false,
        proposalRecordPersistenceAllowed: false,
        sourceMutationAllowed: false,
        commitPushAllowed: false,
      },
      nextRecommendedDecision: proposalApplicationSourceMutationDecision,
    },
    null,
    2,
  )}\n`,
);
