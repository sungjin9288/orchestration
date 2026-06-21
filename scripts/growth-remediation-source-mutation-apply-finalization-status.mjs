import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-apply-finalization-status',
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
  'scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLY_FINALIZATION_STATES = [
  'source-mutation-apply-finalization-not-started',
  'source-mutation-apply-finalization-ready',
  'source-mutation-apply-finalization-blocked',
  'source-mutation-apply-finalization-ready-for-post-apply-audit-contract',
  'source-mutation-apply-finalization-rejected',
  'source-mutation-apply-finalization-deferred',
  'needs-current-apply-closure',
  'needs-current-apply-result-acceptance',
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
  'needs-closure-decision-note',
  'needs-finalization-decision-note',
  'needs-negative-evidence-clearance',
  'stale-apply-finalization-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLY_FINALIZATION_DECISION_TYPES = [
  'approve-source-mutation-post-apply-audit-contract-readiness',
  'request-current-apply-closure',
  'request-current-apply-result-acceptance',
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
  'request-closure-decision-note',
  'request-finalization-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-apply-finalization',
  'defer-source-mutation-apply-finalization',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLY_FINALIZATION_EVIDENCE_TYPES = [
  'source-mutation-apply-finalization-record',
  'source-mutation-apply-closure-record',
  'source-mutation-apply-result-acceptance-record',
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
  'closure-decision-note',
  'finalization-decision-note',
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

const SOURCE_MUTATION_APPLY_FINALIZATION_BLOCKER_TYPES = [
  'apply-closure-missing',
  'apply-closure-stale',
  'apply-closure-rejected',
  'apply-result-acceptance-missing',
  'apply-result-acceptance-stale',
  'apply-result-acceptance-rejected',
  'apply-result-review-missing',
  'apply-result-review-stale',
  'apply-result-review-rejected',
  'apply-result-missing',
  'apply-result-stale',
  'apply-result-rejected',
  'apply-execution-missing',
  'apply-execution-stale',
  'apply-dispatch-missing',
  'apply-dispatch-stale',
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
  'closure-decision-note-missing',
  'closure-decision-note-stale',
  'finalization-decision-note-missing',
  'finalization-decision-note-stale',
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
  'apply-finalization-status-attempts-source-mutation',
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
  const sourceMutationApplyClosure = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
  );
  const sourceMutationApplyFinalization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationApplyClosureDocumented:
      /Thirty-second Implemented Slice: `growth-remediation-source-mutation-apply-closure-status`/.test(
        plan,
      ),
    sourceMutationApplyFinalizationDocumented:
      /Thirty-third Implemented Slice: `growth-remediation-source-mutation-apply-finalization-status`/.test(
        plan,
      ),
    sourceMutationApplyClosureImplemented:
      /mode: 'growth-remediation-source-mutation-apply-closure-status'/.test(
        sourceMutationApplyClosure,
      ),
    sourceMutationApplyFinalizationImplemented:
      /mode: 'growth-remediation-source-mutation-apply-finalization-status'/.test(
        sourceMutationApplyFinalization,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplyFinalization:
      /growth-remediation-source-mutation-apply-finalization-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplyFinalization:
      /growth-remediation-source-mutation-apply-finalization-status/.test(completionReadiness),
    ledgerMentionsSourceMutationApplyFinalization:
      /growth-remediation-source-mutation-apply-finalization-status-readonly-post-m7-840/.test(
        todo,
      ),
    verificationIncludesSourceMutationApplyFinalization:
      /growth-remediation-source-mutation-apply-finalization-status/.test(verificationStatus),
    sourceMutationPostApplyAuditNextDocumented:
      /growth-remediation-source-mutation-post-apply-audit-status/.test(plan),
    currentApplyFinalizationDocumented: /current apply finalization record/.test(plan),
    currentApplyClosureDocumented: /current apply closure record/.test(plan),
    currentApplyResultAcceptanceDocumented: /current apply result acceptance record/.test(plan),
    currentApplyResultReviewDocumented: /current apply result review record/.test(plan),
    currentApplyResultDocumented: /current apply result record/.test(plan),
    currentApplyExecutionDocumented:
      /current apply execution record|current apply execution chain/.test(plan),
    currentApplyDispatchDocumented:
      /current apply dispatch record|current apply execution chain/.test(plan),
    currentApplyExecutionReadinessDocumented:
      /current apply execution readiness record|current apply execution chain/.test(plan),
    currentApplyPreflightDocumented:
      /current apply preflight record|current apply execution chain/.test(plan),
    currentApplyAuthorizationDocumented:
      /current apply authorization record|current apply execution chain/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs|patch\/diff proof/.test(plan),
    diffPreviewDocumented: /diff preview refs|patch\/diff proof/.test(plan),
    verificationOutputDocumented: /verification output/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    rollbackProofDocumented: /rollback proof/.test(plan),
    operatorDispatchIntentDocumented: /operator dispatch intent/.test(plan),
    reviewerNoteDocumented: /result reviewer note refs/.test(plan),
    acceptanceCriteriaDocumented: /result acceptance criteria refs/.test(plan),
    acceptanceDecisionNoteDocumented: /acceptance decision note refs/.test(plan),
    closureDecisionNoteDocumented: /closure decision note refs/.test(plan),
    finalizationDecisionNoteDocumented: /finalization decision note refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    applyFinalizationSeparateFromMutation:
      /apply finalization status stays separate from actual patch application/.test(plan) ||
      /apply lifecycle finalization status stays separate from actual patch application/.test(plan),
    postApplyAuditStillBlocked:
      /before\s+source\s+mutation post-apply audit can be\s+considered/.test(plan),
    sourceMutationStillBlocked: /without applying patches(?: or|,)\s+mutating source/.test(plan),
    remediationExecutionStillBlocked: /or remediation execution/.test(plan),
  };
}

const sourceMutationApplyFinalizationSchema = {
  sourceMutationApplyFinalizationRecord: fields(
    [
      'applyFinalizationId',
      'applyClosureId',
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
      'closureDecisionNoteRefs',
      'finalizationDecisionNoteRefs',
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
      'postApplyAuditAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationApplyFinalizationDecision: fields(
    [
      'decisionId',
      'applyFinalizationId',
      'applyClosureId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'postApplyAuditAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplyFinalizationBlocker: fields(
    [
      'blockerId',
      'applyFinalizationId',
      'applyClosureId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksPostApplyAudit',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplyFinalizationIndex: fields(
    [
      'indexId',
      'applyFinalizationRefs',
      'applyClosureRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplyFinalizationRules = [
  {
    id: 'apply-finalization-requires-current-apply-closure',
    rule: 'source mutation apply finalization can only bind to one current apply closure record and its accepted apply execution chain',
  },
  {
    id: 'apply-finalization-is-not-source-mutation',
    rule: 'source mutation apply finalization status may mark post-apply-audit contract readiness, but it cannot apply patches, mutate source, mutate accepted records, finalize actual lifecycle state, or execute remediation',
  },
  {
    id: 'apply-finalization-requires-clean-baseline-and-operator-dispatch-intent',
    rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, operator dispatch intent, reviewer notes, acceptance criteria, acceptance decision notes, closure decision notes, and finalization decision notes must be present before source mutation post-apply audit can be considered',
  },
  {
    id: 'apply-finalization-requires-verification-dry-run-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation post-apply audit can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-apply-finalization-blocks-post-apply-audit',
    rule: 'stale closure, stale result acceptance, stale result review, stale result, stale execution, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing finalization decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks post-apply audit readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplyFinalizationSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationApplyClosureDocumented &&
  sourceSummary.sourceMutationApplyFinalizationDocumented &&
  sourceSummary.sourceMutationApplyClosureImplemented &&
  sourceSummary.sourceMutationApplyFinalizationImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplyFinalization &&
  sourceSummary.completionReadinessMentionsSourceMutationApplyFinalization &&
  sourceSummary.ledgerMentionsSourceMutationApplyFinalization &&
  sourceSummary.verificationIncludesSourceMutationApplyFinalization &&
  sourceSummary.sourceMutationPostApplyAuditNextDocumented &&
  sourceSummary.currentApplyFinalizationDocumented &&
  sourceSummary.currentApplyClosureDocumented &&
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
  sourceSummary.closureDecisionNoteDocumented &&
  sourceSummary.finalizationDecisionNoteDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.applyFinalizationSeparateFromMutation &&
  sourceSummary.postApplyAuditStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-apply-finalization-status',
  posture: 'local-read-only-remediation-source-mutation-apply-finalization-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-apply-finalization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplyFinalizationStates: SOURCE_MUTATION_APPLY_FINALIZATION_STATES,
    sourceMutationApplyFinalizationDecisionTypes: SOURCE_MUTATION_APPLY_FINALIZATION_DECISION_TYPES,
    sourceMutationApplyFinalizationEvidenceTypes: SOURCE_MUTATION_APPLY_FINALIZATION_EVIDENCE_TYPES,
    sourceMutationApplyFinalizationBlockerTypes: SOURCE_MUTATION_APPLY_FINALIZATION_BLOCKER_TYPES,
  },
  sourceMutationApplyFinalizationSchema,
  sourceMutationApplyFinalizationRules,
  sourceMutationApplyFinalizationState: {
    realSourceMutationApplyFinalizationFileAdopted: false,
    discoveredSourceMutationApplyFinalizationRecords: 0,
    postApplyAuditAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-apply-finalization',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplyFinalizationRecordTypes: Object.keys(sourceMutationApplyFinalizationSchema).length,
    currentApplyClosureRequired: true,
    currentApplyResultAcceptanceRequired: true,
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
    closureDecisionNoteRequired: true,
    finalizationDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    applyFinalizationAndMutationSeparate: true,
    postApplyAuditAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationPostApplyAuditStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-post-apply-audit-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
    reason:
      'Source mutation apply finalization is now modeled as read-only; the next safe slice should define post-apply audit readiness without applying patches or mutating source.',
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
    doesNotOpenPostApplyAudit: true,
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
