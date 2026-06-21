import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_STATES = [
  'source-mutation-lifecycle-closeout-review-acceptance-not-started',
  'source-mutation-lifecycle-closeout-review-acceptance-ready',
  'source-mutation-lifecycle-closeout-review-acceptance-blocked',
  'source-mutation-lifecycle-closeout-review-acceptance-ready-for-closure-readiness-contract',
  'source-mutation-lifecycle-closeout-review-acceptance-rejected',
  'source-mutation-lifecycle-closeout-review-acceptance-deferred',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-review',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-lifecycle-closeout-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-review-acceptance-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-review-acceptance-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_DECISION_TYPES = [
  'approve-source-mutation-lifecycle-closeout-closure-readiness',
  'request-current-source-mutation-lifecycle-closeout-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout-review',
  'request-current-source-mutation-lifecycle-closeout',
  'request-current-source-mutation-completion-review-acceptance',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-lifecycle-closeout-review-acceptance-criteria',
  'request-source-mutation-lifecycle-closeout-review-acceptance-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-review-acceptance',
  'defer-source-mutation-lifecycle-closeout-review-acceptance',
  'hold-baseline',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-review-acceptance-record',
  'source-mutation-lifecycle-closeout-review-acceptance-criteria',
  'source-mutation-lifecycle-closeout-review-acceptance-decision-note',
  'source-mutation-lifecycle-closeout-review-record',
  'source-mutation-lifecycle-closeout-reviewer-note',
  'source-mutation-lifecycle-closeout-review-decision-note',
  'source-mutation-lifecycle-closeout-record',
  'source-mutation-lifecycle-closeout-criteria',
  'source-mutation-lifecycle-closeout-decision-note',
  'source-mutation-completion-review-acceptance-record',
  'source-mutation-completion-review-record',
  'source-mutation-completion-record',
  'exact-scope-lock',
  'target-lock',
  'baseline-digest',
  'clean-baseline-proof',
  'patch-draft',
  'diff-preview',
  'verification-output',
  'dry-run-proof',
  'rollback-proof',
  'source-of-truth-doc',
  'negative-evidence-clearance',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-stale',
  'source-mutation-lifecycle-closeout-review-acceptance-rejected',
  'source-mutation-lifecycle-closeout-review-missing',
  'source-mutation-lifecycle-closeout-review-stale',
  'source-mutation-lifecycle-closeout-missing',
  'source-mutation-lifecycle-closeout-stale',
  'source-mutation-completion-review-acceptance-missing',
  'clean-baseline-proof-missing',
  'dirty-baseline',
  'untracked-baseline',
  'exact-scope-lock-missing',
  'target-lock-missing',
  'baseline-digest-missing',
  'patch-draft-missing',
  'diff-preview-missing',
  'verification-output-missing',
  'verification-output-failed',
  'dry-run-proof-missing',
  'rollback-proof-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-criteria-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-review-acceptance-status-attempts-source-mutation',
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
  const lifecycleCloseoutReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  );
  const lifecycleCloseoutReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
  );
  const lifecycleCloseoutStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  );
  const completionReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutReviewDocumented:
      /Forty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutReviewAcceptanceDocumented:
      /Forty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationCompletionReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-completion-review-acceptance-status'/.test(
        completionReviewAcceptanceStatus,
      ),
    sourceMutationLifecycleCloseoutImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-status'/.test(
        lifecycleCloseoutStatus,
      ),
    sourceMutationLifecycleCloseoutReviewImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-status'/.test(
        lifecycleCloseoutReviewStatus,
      ),
    sourceMutationLifecycleCloseoutReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status'/.test(
        lifecycleCloseoutReviewAcceptanceStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status-readonly-post-m7-849/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureReadinessNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout review acceptance record/.test(plan),
    currentSourceMutationLifecycleCloseoutReviewDocumented:
      /current source mutation lifecycle closeout review record/.test(plan),
    currentSourceMutationLifecycleCloseoutDocumented:
      /current source mutation lifecycle closeout record/.test(plan),
    sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout review acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout review acceptance decision note refs/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    dryRunProofDocumented: /dry-run proof refs/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceMutationLifecycleCloseoutReviewAcceptanceSeparateFromMutation:
      /source mutation lifecycle closeout review acceptance status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutReviewAcceptanceStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches/.test(plan),
    sourceMutationStillBlocked: /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
      plan,
    ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(plan),
  };
}

const sourceMutationLifecycleCloseoutReviewAcceptanceSchema = {
  sourceMutationLifecycleCloseoutReviewAcceptanceRecord: fields(
    [
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutReviewId',
      'sourceMutationLifecycleCloseoutId',
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'sourceMutationCompletionId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutReviewerNoteRefs',
      'sourceMutationLifecycleCloseoutReviewDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutCriteriaRefs',
      'sourceMutationLifecycleCloseoutDecisionNoteRefs',
      'exactScopeLockRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'cleanBaselineProofRefs',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationOutputRefs',
      'dryRunProofRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'negativeEvidenceClearanceRefs',
      'blockerRefs',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationLifecycleCloseoutReviewAcceptanceDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutReviewId',
      'sourceMutationLifecycleCloseoutId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationLifecycleCloseoutReviewAcceptanceBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutReviewId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureReadiness',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutReviewAcceptanceIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutReviewRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'sourceMutationCompletionReviewAcceptanceRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutReviewAcceptanceRules = [
  {
    id: 'source-mutation-lifecycle-closeout-review-acceptance-requires-current-review-chain',
    rule:
      'source mutation lifecycle closeout review acceptance can only bind to one current lifecycle closeout review record and its current lifecycle closeout plus accepted completion review chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-review-acceptance-is-not-source-mutation',
    rule:
      'source mutation lifecycle closeout review acceptance status may mark closure readiness, but it cannot close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-review-acceptance-requires-criteria-and-decision-notes',
    rule:
      'lifecycle closeout review acceptance criteria refs and lifecycle closeout review acceptance decision note refs must be present before closure readiness can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-review-acceptance-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure readiness can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-review-acceptance-blocks-closure-readiness',
    rule:
      'stale review acceptance proof, stale review proof, stale closeout proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing acceptance criteria, missing acceptance decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout closure readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutReviewAcceptanceSchema,
).every((schema) => schema.required.length > 0);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutReviewAcceptance &&
  sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutReviewAcceptance &&
  sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutReviewAcceptance &&
  sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutReviewAcceptance &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessNextDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutReviewDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefsDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefsDocumented &&
  sourceSummary.cleanBaselineProofDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceSeparateFromMutation &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-review-acceptance-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutReviewAcceptanceStates:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_STATES,
    sourceMutationLifecycleCloseoutReviewAcceptanceDecisionTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_DECISION_TYPES,
    sourceMutationLifecycleCloseoutReviewAcceptanceEvidenceTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutReviewAcceptanceBlockerTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_REVIEW_ACCEPTANCE_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutReviewAcceptanceSchema,
  sourceMutationLifecycleCloseoutReviewAcceptanceRules,
  sourceMutationLifecycleCloseoutReviewAcceptanceState: {
    realSourceMutationLifecycleCloseoutReviewAcceptanceFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutReviewAcceptanceRecords: 0,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-review-acceptance',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutReviewAcceptanceRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutReviewAcceptanceSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutReviewRequired: true,
    currentSourceMutationLifecycleCloseoutRequired: true,
    currentSourceMutationCompletionReviewAcceptanceRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutReviewAcceptanceAndMutationSeparate: true,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutClosureReadinessStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
    reason:
      'Source mutation lifecycle closeout review acceptance is now modeled as read-only; the next safe slice should check closure readiness before lifecycle closure, patch application, or source mutation.',
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
    doesNotOpenApplyDispatch: true,
    doesNotOpenApplyExecution: true,
    doesNotOpenApplyResult: true,
    doesNotOpenApplyResultReview: true,
    doesNotAcceptApplyResult: true,
    doesNotOpenApplyClosure: true,
    doesNotFinalizeApplyLifecycle: true,
    doesNotExecutePostApplyAudit: true,
    doesNotExecutePostApplyAuditReview: true,
    doesNotExecutePostApplyAuditReviewAcceptance: true,
    doesNotOpenSourceMutationCompletion: true,
    doesNotExecuteSourceMutationCompletion: true,
    doesNotOpenSourceMutationCompletionReview: true,
    doesNotExecuteSourceMutationCompletionReview: true,
    doesNotOpenSourceMutationCompletionReviewAcceptance: true,
    doesNotExecuteSourceMutationCompletionReviewAcceptance: true,
    doesNotCloseSourceMutationLifecycle: true,
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
    sourceSummary,
    requiredFieldsSatisfied,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
