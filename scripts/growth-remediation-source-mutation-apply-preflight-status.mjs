import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-apply-preflight-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLY_PREFLIGHT_STATES = [
  'source-mutation-apply-preflight-not-started',
  'source-mutation-apply-preflight-ready',
  'source-mutation-apply-preflight-blocked',
  'source-mutation-apply-preflight-ready-for-apply-execution-readiness',
  'source-mutation-apply-preflight-rejected',
  'source-mutation-apply-preflight-deferred',
  'needs-current-apply-authorization',
  'needs-passed-draft-review',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-clean-baseline-proof',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-command-set',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-apply-preflight-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLY_PREFLIGHT_DECISION_TYPES = [
  'approve-source-mutation-apply-execution-readiness',
  'request-current-apply-authorization',
  'request-passed-draft-review',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-clean-baseline-proof',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-command-set',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-negative-evidence-clearance',
  'reject-source-mutation-apply-preflight',
  'defer-source-mutation-apply-preflight',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLY_PREFLIGHT_EVIDENCE_TYPES = [
  'source-mutation-apply-authorization-record',
  'source-mutation-draft-review-record',
  'source-mutation-draft-record',
  'source-mutation-application-preflight-record',
  'exact-scope-lock',
  'target-lock',
  'baseline-digest',
  'clean-baseline-proof',
  'patch-draft',
  'diff-preview',
  'verification-command-set',
  'verification-output',
  'dry-run-proof',
  'rollback-proof',
  'source-of-truth-doc',
  'negative-evidence-clearance',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_APPLY_PREFLIGHT_BLOCKER_TYPES = [
  'apply-authorization-missing',
  'apply-authorization-stale',
  'apply-authorization-rejected',
  'draft-review-not-passed',
  'exact-scope-lock-missing',
  'exact-scope-lock-drift',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'dirty-baseline',
  'untracked-baseline',
  'patch-draft-missing',
  'patch-draft-drift',
  'diff-preview-missing',
  'diff-preview-drift',
  'verification-command-set-missing',
  'verification-command-set-drift',
  'verification-output-missing',
  'verification-output-failed',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'apply-scope-too-broad',
  'apply-preflight-attempts-source-mutation',
];

function runGitOrNull(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (_error) {
    return null;
  }
}

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

function fields(required, optional = []) {
  return { required, optional };
}

function summarizeSources(sources) {
  const agents = sourceText(sources, 'AGENTS.md');
  const masterBrief = sourceText(sources, 'docs/00_master-brief.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const roadmap = sourceText(sources, 'docs/03_architecture-roadmap-v1.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const completionReadiness = sourceText(sources, 'docs/17_v1-completion-readiness.md');
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const pack = sourceText(sources, 'packs/development/pack.md');
  const sourceMutationDraftReview = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  );
  const sourceMutationApplyAuthorization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  );
  const sourceMutationApplyPreflight = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationApplyAuthorizationDocumented:
      /Twenty-fourth Implemented Slice: `growth-remediation-source-mutation-apply-authorization-status`/.test(
        plan,
      ),
    sourceMutationApplyPreflightDocumented:
      /Twenty-fifth Implemented Slice: `growth-remediation-source-mutation-apply-preflight-status`/.test(
        plan,
      ),
    sourceMutationDraftReviewImplemented:
      /mode: 'growth-remediation-source-mutation-draft-review-status'/.test(
        sourceMutationDraftReview,
      ),
    sourceMutationApplyAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-apply-authorization-status'/.test(
        sourceMutationApplyAuthorization,
      ),
    sourceMutationApplyPreflightImplemented:
      /mode: 'growth-remediation-source-mutation-apply-preflight-status'/.test(
        sourceMutationApplyPreflight,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplyPreflight:
      /growth-remediation-source-mutation-apply-preflight-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplyPreflight:
      /growth-remediation-source-mutation-apply-preflight-status/.test(completionReadiness),
    ledgerMentionsSourceMutationApplyPreflight:
      /growth-remediation-source-mutation-apply-preflight-status-readonly-post-m7-832/.test(todo),
    verificationIncludesSourceMutationApplyPreflight:
      /growth-remediation-source-mutation-apply-preflight-status/.test(verificationStatus),
    sourceMutationApplyExecutionReadinessNextDocumented:
      /growth-remediation-source-mutation-apply-execution-readiness-status/.test(plan),
    currentApplyAuthorizationDocumented: /current apply authorization record/.test(plan),
    passedDraftReviewDocumented: /passed draft review record/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    verificationCommandSetDocumented: /verification command set/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    applyPreflightSeparateFromMutation:
      /apply preflight stays separate from actually applying patches/.test(plan),
    applyExecutionReadinessStillBlocked:
      /before source mutation apply\s+execution readiness can be considered/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationApplyPreflightSchema = {
  sourceMutationApplyPreflightRecord: fields(
    [
      'applyPreflightId',
      'applyAuthorizationId',
      'draftReviewId',
      'state',
      'decisionType',
      'exactScopeLockRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'cleanBaselineProofRefs',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationCommandSetRefs',
      'verificationOutputRefs',
      'dryRunProofRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'applyExecutionReadinessAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationApplyPreflightDecision: fields(
    [
      'decisionId',
      'applyPreflightId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applyExecutionReadinessAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplyPreflightBlocker: fields(
    [
      'blockerId',
      'applyPreflightId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplyExecutionReadiness',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplyPreflightIndex: fields(
    [
      'indexId',
      'applyPreflightRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplyPreflightRules = [
  {
    id: 'apply-preflight-requires-current-apply-authorization',
    rule: 'source mutation apply preflight readiness can only bind to one current apply authorization and its passed draft-review chain',
  },
  {
    id: 'apply-preflight-is-not-source-mutation',
    rule: 'source mutation apply preflight status may mark apply-execution-readiness review readiness, but it cannot apply patches, mutate source, apply proposals, approve authorizations, or execute remediation',
  },
  {
    id: 'apply-preflight-requires-clean-baseline-and-exact-scope',
    rule: 'exact scope lock, target lock, baseline digest, and clean baseline proof must be present before apply execution readiness can be considered',
  },
  {
    id: 'apply-preflight-requires-verification-dry-run-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification command set refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before apply execution readiness can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-preflight-blocks-apply-execution-readiness',
    rule: 'stale apply authorization, scope drift, dirty or untracked baseline, changed patch/diff proof, failed verification, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks apply execution readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplyPreflightSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationApplyAuthorizationDocumented &&
  sourceSummary.sourceMutationApplyPreflightDocumented &&
  sourceSummary.sourceMutationDraftReviewImplemented &&
  sourceSummary.sourceMutationApplyAuthorizationImplemented &&
  sourceSummary.sourceMutationApplyPreflightImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplyPreflight &&
  sourceSummary.completionReadinessMentionsSourceMutationApplyPreflight &&
  sourceSummary.ledgerMentionsSourceMutationApplyPreflight &&
  sourceSummary.verificationIncludesSourceMutationApplyPreflight &&
  sourceSummary.sourceMutationApplyExecutionReadinessNextDocumented &&
  sourceSummary.currentApplyAuthorizationDocumented &&
  sourceSummary.passedDraftReviewDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.cleanBaselineProofDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationCommandSetDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.applyPreflightSeparateFromMutation &&
  sourceSummary.applyExecutionReadinessStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-apply-preflight-status',
  posture: 'local-read-only-remediation-source-mutation-apply-preflight-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-apply-preflight-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplyPreflightStates: SOURCE_MUTATION_APPLY_PREFLIGHT_STATES,
    sourceMutationApplyPreflightDecisionTypes:
      SOURCE_MUTATION_APPLY_PREFLIGHT_DECISION_TYPES,
    sourceMutationApplyPreflightEvidenceTypes: SOURCE_MUTATION_APPLY_PREFLIGHT_EVIDENCE_TYPES,
    sourceMutationApplyPreflightBlockerTypes: SOURCE_MUTATION_APPLY_PREFLIGHT_BLOCKER_TYPES,
  },
  sourceMutationApplyPreflightSchema,
  sourceMutationApplyPreflightRules,
  sourceMutationApplyPreflightState: {
    realSourceMutationApplyPreflightFileAdopted: false,
    discoveredSourceMutationApplyPreflights: 0,
    applyExecutionReadinessAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-apply-preflight',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplyPreflightRecordTypes: Object.keys(sourceMutationApplyPreflightSchema)
      .length,
    currentApplyAuthorizationRequired: true,
    passedDraftReviewRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    cleanBaselineProofRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationCommandSetRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    negativeEvidenceClearanceRequired: true,
    applyPreflightAndMutationSeparate: true,
    applyExecutionReadinessAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplyExecutionReadinessStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-apply-execution-readiness-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
    reason:
      'Source mutation apply preflight readiness is now modeled as read-only; the next safe slice should define final apply-execution readiness gates before any source mutation or remediation execution can act.',
    mustRemainReadOnly: true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotGenerateProposals: true,
    doesNotApplyProposals: true,
    doesNotGeneratePatch: true,
    doesNotApplyPatch: true,
    doesNotApproveApplyAuthorization: true,
    doesNotOpenApplyExecution: true,
    doesNotMutateAcceptedRecords: true,
    doesNotMutateSource: true,
    doesNotExecuteRollback: true,
    doesNotCreateRemediation: true,
    doesNotExecuteRemediation: true,
    doesNotPersistMemory: true,
    doesNotPromoteSkills: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotOpenExternalChannels: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
