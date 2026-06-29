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

const files = {
  readme: 'README.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  app: 'ui/app.js',
  styles: 'ui/styles.css',
  uiSmoke: 'scripts/smoke-ui-slice-649.mjs',
  verification: 'scripts/verification_status.mjs',
};

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

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

assert.match(sources.app, /function getGrowthFailurePatternGroups\(\{ failedRuns, reviewArtifacts, blockedTasks \}\)/);
assert.match(sources.app, /function getGrowthRegressionComparison\(\{ failedRuns, completedRuns \}\)/);
assert.match(sources.app, /function getGrowthRollbackEvidenceLinks\(artifacts\)/);
assert.match(sources.app, /function renderGrowthDashboardEvidenceDepth\(growth\)/);
assert.match(sources.app, /data-growth-dashboard-evidence-depth="read-only"/);
assert.match(sources.app, /data-failure-pattern-groups="true"/);
assert.match(sources.app, /data-regression-comparison="read-only"/);
assert.match(sources.app, /data-rollback-evidence-links="true"/);
assert.match(sources.app, /data-growth-dashboard-action-allowed="false"/);
assert.match(sources.app, /실패 묶음, 회귀 비교, 되돌림 근거를 함께 봅니다/);
assert.match(sources.app, /되돌림 근거 링크/);

for (const marker of blockedAuthorityMarkers) {
  assert.match(sources.app, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const action of forbiddenActions) {
  assert.doesNotMatch(sources.app, action);
}

assert.match(sources.styles, /\.growth-dashboard-depth/);
assert.match(sources.styles, /\.growth-pattern-grid/);
assert.match(sources.styles, /\.growth-regression-row/);
assert.match(sources.styles, /\.growth-rollback-list/);
assert.match(sources.styles, /\.growth-rollback-chip/);
assert.match(sources.uiSmoke, /data-growth-dashboard-evidence-depth="read-only"/);
assert.match(sources.uiSmoke, /data-regression-comparison="read-only"/);
assert.match(sources.uiSmoke, /data-rollback-evidence-links="true"/);
assert.match(sources.readme, /grouped failure patterns/);
assert.match(sources.readme, /regression comparison/);
assert.match(sources.readme, /rollback evidence links/);
assert.match(sources.audit, /Completed: `growth dashboard evidence depth`/);
assert.match(sources.inventory, /vNext growth dashboard evidence depth/);
assert.match(sources.verification, /vnext-growth-dashboard-evidence-depth-status\.mjs/);

const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const nextDecisionIds = {
  'operator-approved authority expansion review': 'operator-approved-authority-expansion-review',
  'explicit authority implementation decision required': 'explicit-authority-implementation-decision-required',
  'operator decision required': 'operator-decision-required',
};

assert.equal(auditStatus.ok, true);
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'growth dashboard evidence depth'),
  true,
);
assert.ok(Object.hasOwn(nextDecisionIds, auditNextSlice));

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
      nextRecommendedDecision: {
        id: nextDecisionIds[auditNextSlice],
        slice: auditNextSlice,
        reason:
          'The read-only growth dashboard and authority review contracts are now source-backed; any durable proposal, memory, provider, or source-mutation implementation needs a later accepted decision, explicit approval, a new plan, and focused smoke.',
      },
    },
    null,
    2,
  )}\n`,
);
