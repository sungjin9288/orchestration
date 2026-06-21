import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-apply-result-acceptance-status',
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
  'scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_STATES = [
  'source-mutation-apply-result-acceptance-not-started',
  'source-mutation-apply-result-acceptance-ready',
  'source-mutation-apply-result-acceptance-blocked',
  'source-mutation-apply-result-acceptance-ready-for-apply-closure-contract',
  'source-mutation-apply-result-acceptance-rejected',
  'source-mutation-apply-result-acceptance-deferred',
  'needs-current-apply-result-review',
  'needs-current-apply-result',
  'needs-current-apply-execution',
  'needs-current-apply-dispatch',
  'needs-current-apply-execution-readiness',
  'needs-current-apply-preflight',
  'needs-current-apply-authorization',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-operator-dispatch-intent',
  'needs-result-reviewer-note',
  'needs-result-acceptance-criteria',
  'needs-acceptance-decision-note',
  'needs-negative-evidence-clearance',
  'stale-apply-result-acceptance-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_DECISION_TYPES = [
  'approve-source-mutation-apply-closure-contract-readiness',
  'request-current-apply-result-review',
  'request-current-apply-result',
  'request-current-apply-execution',
  'request-current-apply-dispatch',
  'request-current-apply-execution-readiness',
  'request-current-apply-preflight',
  'request-current-apply-authorization',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-operator-dispatch-intent',
  'request-result-reviewer-note',
  'request-result-acceptance-criteria',
  'request-acceptance-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-apply-result-acceptance',
  'defer-source-mutation-apply-result-acceptance',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_EVIDENCE_TYPES = [
  'source-mutation-apply-result-review-record',
  'source-mutation-apply-result-record',
  'source-mutation-apply-execution-record',
  'source-mutation-apply-dispatch-record',
  'source-mutation-apply-execution-readiness-record',
  'source-mutation-apply-preflight-record',
  'source-mutation-apply-authorization-record',
  'operator-dispatch-intent',
  'result-reviewer-note',
  'result-acceptance-criteria',
  'acceptance-decision-note',
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

const SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_BLOCKER_TYPES = [
  'apply-result-review-missing',
  'apply-result-review-stale',
  'apply-result-review-rejected',
  'apply-result-missing',
  'apply-result-stale',
  'apply-result-rejected',
  'apply-execution-missing',
  'apply-execution-stale',
  'apply-execution-rejected',
  'apply-dispatch-missing',
  'apply-dispatch-stale',
  'apply-dispatch-rejected',
  'apply-execution-readiness-missing',
  'apply-execution-readiness-stale',
  'apply-preflight-missing',
  'apply-preflight-stale',
  'apply-authorization-missing',
  'apply-authorization-stale',
  'operator-dispatch-intent-missing',
  'operator-dispatch-intent-stale',
  'result-reviewer-note-missing',
  'result-reviewer-note-stale',
  'result-acceptance-criteria-missing',
  'result-acceptance-criteria-stale',
  'acceptance-decision-note-missing',
  'acceptance-decision-note-stale',
  'clean-baseline-proof-missing',
  'dirty-baseline',
  'untracked-baseline',
  'exact-scope-lock-missing',
  'exact-scope-lock-drift',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'patch-draft-missing',
  'patch-draft-drift',
  'diff-preview-missing',
  'diff-preview-drift',
  'verification-output-missing',
  'verification-output-failed',
  'dry-run-proof-missing',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'result-acceptance-status-attempts-source-mutation',
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
  const sourceMutationApplyResultReview = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
  );
  const sourceMutationApplyResultAcceptance = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationApplyResultReviewDocumented:
      /Thirtieth Implemented Slice: `growth-remediation-source-mutation-apply-result-review-status`/.test(
        plan,
      ),
    sourceMutationApplyResultAcceptanceDocumented:
      /Thirty-first Implemented Slice: `growth-remediation-source-mutation-apply-result-acceptance-status`/.test(
        plan,
      ),
    sourceMutationApplyResultReviewImplemented:
      /mode: 'growth-remediation-source-mutation-apply-result-review-status'/.test(
        sourceMutationApplyResultReview,
      ),
    sourceMutationApplyResultAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-apply-result-acceptance-status'/.test(
        sourceMutationApplyResultAcceptance,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplyResultAcceptance:
      /growth-remediation-source-mutation-apply-result-acceptance-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplyResultAcceptance:
      /growth-remediation-source-mutation-apply-result-acceptance-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationApplyResultAcceptance:
      /growth-remediation-source-mutation-apply-result-acceptance-status-readonly-post-m7-838/.test(
        todo,
      ),
    verificationIncludesSourceMutationApplyResultAcceptance:
      /growth-remediation-source-mutation-apply-result-acceptance-status/.test(
        verificationStatus,
      ),
    sourceMutationApplyClosureNextDocumented:
      /growth-remediation-source-mutation-apply-closure-status/.test(plan),
    currentApplyResultAcceptanceDocumented:
      /current apply result acceptance record/.test(plan),
    currentApplyResultReviewDocumented: /current apply result review record/.test(plan),
    currentApplyResultDocumented: /current apply result record/.test(plan),
    currentApplyExecutionDocumented: /current apply execution record/.test(plan),
    currentApplyDispatchDocumented: /current apply dispatch record/.test(plan),
    currentApplyExecutionReadinessDocumented:
      /current apply execution readiness record/.test(plan),
    currentApplyPreflightDocumented: /current apply preflight record/.test(plan),
    currentApplyAuthorizationDocumented: /current apply authorization record/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    operatorDispatchIntentDocumented: /operator dispatch intent/.test(plan),
    reviewerNoteDocumented: /result reviewer note refs/.test(plan),
    acceptanceCriteriaDocumented: /result acceptance criteria refs/.test(plan),
    acceptanceDecisionNoteDocumented: /acceptance decision note refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    applyResultAcceptanceSeparateFromMutation:
      /apply result acceptance status stays separate from actually applying patches/.test(plan),
    applyClosureStillBlocked:
      /before\s+source\s+mutation apply closure can be considered/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationApplyResultAcceptanceSchema = {
  sourceMutationApplyResultAcceptanceRecord: fields(
    [
      'applyResultAcceptanceId',
      'applyResultReviewId',
      'applyResultId',
      'applyExecutionId',
      'applyDispatchId',
      'applyExecutionReadinessId',
      'applyPreflightId',
      'applyAuthorizationId',
      'state',
      'decisionType',
      'operatorDispatchIntentRefs',
      'resultReviewerNoteRefs',
      'resultAcceptanceCriteriaRefs',
      'acceptanceDecisionNoteRefs',
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
      'blockerRefs',
      'applyClosureAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationApplyResultAcceptanceDecision: fields(
    [
      'decisionId',
      'applyResultAcceptanceId',
      'applyResultReviewId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applyClosureAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplyResultAcceptanceBlocker: fields(
    [
      'blockerId',
      'applyResultAcceptanceId',
      'applyResultReviewId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplyClosure',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplyResultAcceptanceIndex: fields(
    [
      'indexId',
      'applyResultAcceptanceRefs',
      'applyResultReviewRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplyResultAcceptanceRules = [
  {
    id: 'apply-result-acceptance-requires-current-apply-result-review',
    rule: 'source mutation apply result acceptance can only bind to one current apply result review record and its apply execution chain',
  },
  {
    id: 'apply-result-acceptance-is-not-source-mutation',
    rule: 'source mutation apply result acceptance status may mark apply-closure-contract readiness, but it cannot accept actual results, apply patches, mutate source, apply proposals, approve authorizations, or execute remediation',
  },
  {
    id: 'apply-result-acceptance-requires-clean-baseline-and-operator-dispatch-intent',
    rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, operator dispatch intent, reviewer notes, acceptance criteria, and acceptance decision notes must be present before source mutation apply closure can be considered',
  },
  {
    id: 'apply-result-acceptance-requires-verification-dry-run-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation apply closure can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-result-acceptance-blocks-apply-closure',
    rule: 'stale result review, stale result, stale execution, dirty or untracked baseline, changed patch/diff proof, failed verification, missing rollback proof, missing operator dispatch intent, missing reviewer note, missing acceptance criteria, missing acceptance decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks apply closure readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplyResultAcceptanceSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationApplyResultReviewDocumented &&
  sourceSummary.sourceMutationApplyResultAcceptanceDocumented &&
  sourceSummary.sourceMutationApplyResultReviewImplemented &&
  sourceSummary.sourceMutationApplyResultAcceptanceImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplyResultAcceptance &&
  sourceSummary.completionReadinessMentionsSourceMutationApplyResultAcceptance &&
  sourceSummary.ledgerMentionsSourceMutationApplyResultAcceptance &&
  sourceSummary.verificationIncludesSourceMutationApplyResultAcceptance &&
  sourceSummary.sourceMutationApplyClosureNextDocumented &&
  sourceSummary.currentApplyResultAcceptanceDocumented &&
  sourceSummary.currentApplyResultReviewDocumented &&
  sourceSummary.currentApplyResultDocumented &&
  sourceSummary.currentApplyExecutionDocumented &&
  sourceSummary.currentApplyDispatchDocumented &&
  sourceSummary.currentApplyExecutionReadinessDocumented &&
  sourceSummary.currentApplyPreflightDocumented &&
  sourceSummary.currentApplyAuthorizationDocumented &&
  sourceSummary.cleanBaselineProofDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.operatorDispatchIntentDocumented &&
  sourceSummary.reviewerNoteDocumented &&
  sourceSummary.acceptanceCriteriaDocumented &&
  sourceSummary.acceptanceDecisionNoteDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.applyResultAcceptanceSeparateFromMutation &&
  sourceSummary.applyClosureStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-apply-result-acceptance-status',
  posture: 'local-read-only-remediation-source-mutation-apply-result-acceptance-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-apply-result-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplyResultAcceptanceStates:
      SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_STATES,
    sourceMutationApplyResultAcceptanceDecisionTypes:
      SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_DECISION_TYPES,
    sourceMutationApplyResultAcceptanceEvidenceTypes:
      SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_EVIDENCE_TYPES,
    sourceMutationApplyResultAcceptanceBlockerTypes:
      SOURCE_MUTATION_APPLY_RESULT_ACCEPTANCE_BLOCKER_TYPES,
  },
  sourceMutationApplyResultAcceptanceSchema,
  sourceMutationApplyResultAcceptanceRules,
  sourceMutationApplyResultAcceptanceState: {
    realSourceMutationApplyResultAcceptanceFileAdopted: false,
    discoveredSourceMutationApplyResultAcceptanceRecords: 0,
    applyClosureAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-apply-result-acceptance',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplyResultAcceptanceRecordTypes: Object.keys(
      sourceMutationApplyResultAcceptanceSchema,
    ).length,
    currentApplyResultReviewRequired: true,
    currentApplyResultRequired: true,
    currentApplyExecutionRequired: true,
    currentApplyDispatchRequired: true,
    currentApplyExecutionReadinessRequired: true,
    currentApplyPreflightRequired: true,
    currentApplyAuthorizationRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    operatorDispatchIntentRequired: true,
    resultReviewerNoteRequired: true,
    resultAcceptanceCriteriaRequired: true,
    acceptanceDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    applyResultAcceptanceAndMutationSeparate: true,
    applyClosureAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplyClosureStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-apply-closure-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
    reason:
      'Source mutation apply result acceptance is now modeled as read-only; the next safe slice should close the apply lifecycle contract without applying patches or mutating source.',
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
