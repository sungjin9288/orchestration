import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_STATES = [
  'source-mutation-lifecycle-closeout-closure-readiness-not-started',
  'source-mutation-lifecycle-closeout-closure-readiness-ready',
  'source-mutation-lifecycle-closeout-closure-readiness-blocked',
  'source-mutation-lifecycle-closeout-closure-readiness-ready-for-closure-authorization-contract',
  'source-mutation-lifecycle-closeout-closure-readiness-rejected',
  'source-mutation-lifecycle-closeout-closure-readiness-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
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
  'needs-source-mutation-lifecycle-closeout-closure-readiness-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-readiness-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-readiness-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_DECISION_TYPES = [
  'approve-source-mutation-lifecycle-closeout-closure-authorization-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-readiness',
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
  'request-source-mutation-lifecycle-closeout-closure-readiness-criteria',
  'request-source-mutation-lifecycle-closeout-closure-readiness-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-closure-readiness',
  'defer-source-mutation-lifecycle-closeout-closure-readiness',
  'hold-baseline',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-closure-readiness-record',
  'source-mutation-lifecycle-closeout-closure-readiness-criteria',
  'source-mutation-lifecycle-closeout-closure-readiness-decision-note',
  'source-mutation-lifecycle-closeout-review-acceptance-record',
  'source-mutation-lifecycle-closeout-review-acceptance-criteria',
  'source-mutation-lifecycle-closeout-review-acceptance-decision-note',
  'source-mutation-lifecycle-closeout-review-record',
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

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-closure-readiness-missing',
  'source-mutation-lifecycle-closeout-closure-readiness-stale',
  'source-mutation-lifecycle-closeout-closure-readiness-rejected',
  'source-mutation-lifecycle-closeout-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-stale',
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
  'source-mutation-lifecycle-closeout-closure-readiness-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-readiness-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-closure-readiness-status-attempts-source-mutation',
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
  const lifecycleCloseoutClosureReadinessStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
  );
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
    sourceMutationLifecycleCloseoutReviewAcceptanceDocumented:
      /Forty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureReadinessDocumented:
      /Forty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status`/.test(
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
    sourceMutationLifecycleCloseoutClosureReadinessImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status'/.test(
        lifecycleCloseoutClosureReadinessStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureReadiness:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureReadiness:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureReadiness:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status-readonly-post-m7-850/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureReadiness:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureAuthorizationNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureReadinessDocumented:
      /current source mutation lifecycle closeout closure readiness record/.test(plan),
    currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout review acceptance record/.test(plan),
    currentSourceMutationLifecycleCloseoutReviewDocumented:
      /current source mutation lifecycle closeout review record/.test(plan),
    currentSourceMutationLifecycleCloseoutDocumented:
      /current source mutation lifecycle closeout record/.test(plan),
    sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure readiness criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure readiness decision note refs/.test(plan),
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
    sourceMutationLifecycleCloseoutClosureReadinessSeparateFromMutation:
      /source mutation lifecycle closeout closure readiness status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureReadinessStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches/.test(plan),
    sourceMutationStillBlocked: /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
      plan,
    ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(plan),
  };
}

const sourceMutationLifecycleCloseoutClosureReadinessSchema = {
  sourceMutationLifecycleCloseoutClosureReadinessRecord: fields(
    [
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutReviewId',
      'sourceMutationLifecycleCloseoutId',
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'sourceMutationCompletionId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefs',
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
  sourceMutationLifecycleCloseoutClosureReadinessDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
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
  sourceMutationLifecycleCloseoutClosureReadinessBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureAuthorization',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureReadinessIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutClosureReadinessRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutReviewRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutClosureReadinessRules = [
  {
    id: 'source-mutation-lifecycle-closeout-closure-readiness-requires-current-acceptance-chain',
    rule:
      'source mutation lifecycle closeout closure readiness can only bind to one current lifecycle closeout review acceptance record and its current lifecycle closeout chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-readiness-is-not-source-mutation',
    rule:
      'source mutation lifecycle closeout closure readiness status may mark authorization readiness, but it cannot close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-readiness-requires-criteria-and-decision-notes',
    rule:
      'lifecycle closeout closure readiness criteria refs and lifecycle closeout closure readiness decision note refs must be present before closure authorization can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-readiness-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure authorization can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-readiness-blocks-authorization',
    rule:
      'stale closure readiness proof, stale review acceptance proof, stale review proof, stale closeout proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closure readiness criteria, missing closure readiness decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout closure authorization readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutClosureReadinessSchema,
).every((schema) => schema.required.length > 0);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureReadiness &&
  sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureReadiness &&
  sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureReadiness &&
  sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureReadiness &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationNextDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutClosureReadinessDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutReviewDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefsDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefsDocumented &&
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
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessSeparateFromMutation &&
  sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-readiness-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureReadinessStates:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_STATES,
    sourceMutationLifecycleCloseoutClosureReadinessDecisionTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_DECISION_TYPES,
    sourceMutationLifecycleCloseoutClosureReadinessEvidenceTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutClosureReadinessBlockerTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_CLOSURE_READINESS_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutClosureReadinessSchema,
  sourceMutationLifecycleCloseoutClosureReadinessRules,
  sourceMutationLifecycleCloseoutClosureReadinessState: {
    realSourceMutationLifecycleCloseoutClosureReadinessFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureReadinessRecords: 0,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-closure-readiness',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutClosureReadinessRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutClosureReadinessSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutClosureReadinessRequired: true,
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
    sourceMutationLifecycleCloseoutClosureReadinessCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureReadinessAndMutationSeparate: true,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutClosureAuthorizationStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure readiness is now modeled as read-only; the next safe slice should authorize closure readiness before lifecycle closure, patch application, or source mutation.',
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
