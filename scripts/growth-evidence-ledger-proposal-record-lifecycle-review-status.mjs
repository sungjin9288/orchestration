import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-evidence-ledger-proposal-record-lifecycle-review-status';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-next-candidate.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
  'scripts/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
  'scripts/verification_status.mjs',
];

const BLOCKED_AUTHORITY = {
  proposalGenerationAllowed: false,
  proposalRecordCreationOutsideApprovedRuntimeAllowed: false,
  proposalApplicationAllowed: false,
  proposalQueueMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  runtimeMutationAllowed: false,
  uiMutationAllowed: false,
  sourceMutationOutsideApprovedRuntimeAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

function readSource(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const exists = fs.existsSync(absolutePath);

  return {
    path: relativePath,
    exists,
    text: exists ? fs.readFileSync(absolutePath, 'utf8') : '',
  };
}

function sourceText(sources, relativePath) {
  return sources.find((source) => source.path === relativePath)?.text || '';
}

function runJsonScript(relativePath) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 60 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';

  let payload = null;
  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    path: relativePath,
    ok: result.status === 0 && payload?.ok === true,
    status: result.status,
    stderr,
    payload,
  };
}

function summarizeSources(sources) {
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const inventory = sourceText(sources, 'docs/22_completion-gate-inventory.md');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');
  const nextCandidate = sourceText(sources, 'scripts/growth-next-candidate.mjs');
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    lifecycleReviewDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-lifecycle-review-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record lifecycle review status/.test(inventory),
    lifecycleReviewLedgered:
      /growth-evidence-ledger-proposal-record-lifecycle-review-status-readonly-post-m7/.test(
        todo,
      ),
    lifecycleReviewLessonCaptured:
      /proposal record lifecycle review.*suffix/i.test(lessons) ||
      /lifecycle suffix.*proposal record lifecycle review/i.test(lessons),
    lifecycleReviewAggregateRegistered:
      /growth-evidence-ledger-proposal-record-lifecycle-review-status/.test(verificationStatus),
    lifecycleReviewSmokeRegistered:
      /smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status/.test(
        verificationStatus,
      ),
    shortAliasCandidateExists:
      /proposalRecordLifecycleReviewCandidate/.test(nextCandidate) &&
      /growth-evidence-ledger-proposal-record-lifecycle-review/.test(nextCandidate),
    repeatedLifecycleNormalizationExists:
      /lifecycleSegmentCount < 2/.test(nextCandidate) &&
      /sourceCandidate/.test(nextCandidate),
  };
}

function buildReview({ enginePayload, reflectionPayload }) {
  const nextEngineSlice = enginePayload?.hermesEngine?.nextEngineSlice || null;
  const reflectionNextSlice = reflectionPayload?.nextRecommendedSlice || {};
  const reflectionFinding = (reflectionPayload?.reflectionFindings || []).find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-lifecycle-review-needed',
  );
  const sourceCandidate = reflectionNextSlice.sourceCandidate || null;

  return {
    reviewId: 'growth-evidence-ledger-proposal-record-lifecycle-review',
    reviewPurpose:
      'Review the current proposal-record evidence lifecycle as one read-only state instead of adding another review, acceptance, or finalization suffix.',
    inputs: {
      engineNextSlice: nextEngineSlice,
      reflectionNextSliceId: reflectionNextSlice.id || null,
      sourceCandidateId: sourceCandidate?.id || null,
      sourceCandidateCommand: sourceCandidate?.commandToAdd || null,
      reflectionFindingId: reflectionFinding?.id || null,
    },
    findings: [
      {
        id: 'engine-routes-to-short-lifecycle-review',
        ok: nextEngineSlice === 'growth-evidence-ledger-proposal-record-lifecycle-review',
        observed: nextEngineSlice,
      },
      {
        id: 'reflection-routes-to-short-lifecycle-review',
        ok:
          reflectionNextSlice.id === 'growth-evidence-ledger-proposal-record-lifecycle-review' &&
          reflectionNextSlice.mustRemainReadOnly === true,
        observed: {
          id: reflectionNextSlice.id || null,
          mustRemainReadOnly: reflectionNextSlice.mustRemainReadOnly,
        },
      },
      {
        id: 'source-candidate-preserves-long-route-evidence',
        ok:
          typeof sourceCandidate?.id === 'string' &&
          sourceCandidate.id.includes('review-acceptance-finalization') &&
          sourceCandidate.mustRemainReadOnly === true,
        observed: sourceCandidate,
      },
      {
        id: 'reflection-finding-is-review-not-authority',
        ok:
          reflectionFinding?.severity === 'info' &&
          /without creating records, widening authority, or adding another lifecycle suffix/.test(
            reflectionFinding.allowedNextAction || '',
          ),
        observed: reflectionFinding || null,
      },
    ],
    blockedAuthority: BLOCKED_AUTHORITY,
  };
}

const sources = SOURCE_FILES.map(readSource);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const sourceSummary = summarizeSources(sources);
const engineStatus = runJsonScript('scripts/growth-engine-status.mjs');
const reflectionStatus = runJsonScript('scripts/growth-reflection-evaluator.mjs');
const lifecycleReview = buildReview({
  enginePayload: engineStatus.payload,
  reflectionPayload: reflectionStatus.payload,
});

const readiness = {
  sourcesPresent: missingSources.length === 0,
  sourceEvidenceReady: Object.entries(sourceSummary)
    .filter(([key]) => !['sourceCount', 'availableSourceCount'].includes(key))
    .every(([, value]) => value === true),
  engineStatusReady: engineStatus.ok,
  reflectionStatusReady: reflectionStatus.ok,
  reviewFindingsPassed: lifecycleReview.findings.every((finding) => finding.ok === true),
  lifecycleReviewOnly: true,
  ...BLOCKED_AUTHORITY,
};

const ok =
  readiness.sourcesPresent &&
  readiness.sourceEvidenceReady &&
  readiness.engineStatusReady &&
  readiness.reflectionStatusReady &&
  readiness.reviewFindingsPassed;

const payload = {
  ok,
  mode: MODE,
  posture: 'local-read-only-proposal-record-lifecycle-review',
  schemaVersion: 'growth-evidence-ledger-proposal-record-lifecycle-review-status/v0',
  sourceSummary,
  inputStatuses: {
    growthEngineStatus: {
      path: engineStatus.path,
      ok: engineStatus.ok,
      status: engineStatus.status,
      nextEngineSlice: engineStatus.payload?.hermesEngine?.nextEngineSlice || null,
    },
    growthReflectionEvaluator: {
      path: reflectionStatus.path,
      ok: reflectionStatus.ok,
      status: reflectionStatus.status,
      nextRecommendedSlice: reflectionStatus.payload?.nextRecommendedSlice?.id || null,
      sourceCandidate: reflectionStatus.payload?.nextRecommendedSlice?.sourceCandidate?.id || null,
    },
  },
  lifecycleReview,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-lifecycle-review-maintenance',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
    reason:
      'The proposal-record lifecycle is now reviewed through one read-only alias; continue by maintaining this alias only when engine or reflection evidence drifts.',
    mustRemainReadOnly: true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotMutateUi: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotCallProviders: true,
    doesNotPersistMemory: true,
    doesNotOpenExternalChannels: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotGenerateProposals: true,
    doesNotCreateProposalRecords: true,
    doesNotCreateProposalRecordsOutsideApprovedRuntime: true,
    doesNotPersistProposalRecordsOutsideApprovedRuntime: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotMutateSourceOutsideApprovedRuntime: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    sourceEvidenceMissing: Object.entries(sourceSummary)
      .filter(([key, value]) => !['sourceCount', 'availableSourceCount'].includes(key) && value !== true)
      .map(([key]) => key),
    failedFindings: lifecycleReview.findings
      .filter((finding) => !finding.ok)
      .map((finding) => finding.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
