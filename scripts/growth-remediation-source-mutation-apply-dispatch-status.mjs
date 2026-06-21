import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-apply-dispatch-status',
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
  'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLY_DISPATCH_STATES = [
  'source-mutation-apply-dispatch-not-started',
  'source-mutation-apply-dispatch-ready',
  'source-mutation-apply-dispatch-blocked',
  'source-mutation-apply-dispatch-ready-for-apply-execution-contract',
  'source-mutation-apply-dispatch-rejected',
  'source-mutation-apply-dispatch-deferred',
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
  'needs-negative-evidence-clearance',
  'stale-apply-dispatch-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLY_DISPATCH_DECISION_TYPES = [
  'approve-source-mutation-apply-execution-contract-readiness',
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
  'request-negative-evidence-clearance',
  'reject-source-mutation-apply-dispatch',
  'defer-source-mutation-apply-dispatch',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLY_DISPATCH_EVIDENCE_TYPES = [
  'source-mutation-apply-execution-readiness-record',
  'source-mutation-apply-preflight-record',
  'source-mutation-apply-authorization-record',
  'operator-dispatch-intent',
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

const SOURCE_MUTATION_APPLY_DISPATCH_BLOCKER_TYPES = [
  'apply-execution-readiness-missing',
  'apply-execution-readiness-stale',
  'apply-execution-readiness-rejected',
  'apply-preflight-missing',
  'apply-preflight-stale',
  'apply-authorization-missing',
  'apply-authorization-stale',
  'operator-dispatch-intent-missing',
  'operator-dispatch-intent-stale',
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
  'dispatch-attempts-source-mutation',
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
  const sourceMutationApplyPreflight = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  );
  const sourceMutationApplyExecutionReadiness = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
  );
  const sourceMutationApplyDispatch = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationApplyExecutionReadinessDocumented:
      /Twenty-sixth Implemented Slice: `growth-remediation-source-mutation-apply-execution-readiness-status`/.test(
        plan,
      ),
    sourceMutationApplyDispatchDocumented:
      /Twenty-seventh Implemented Slice: `growth-remediation-source-mutation-apply-dispatch-status`/.test(
        plan,
      ),
    sourceMutationApplyPreflightImplemented:
      /mode: 'growth-remediation-source-mutation-apply-preflight-status'/.test(
        sourceMutationApplyPreflight,
      ),
    sourceMutationApplyExecutionReadinessImplemented:
      /mode: 'growth-remediation-source-mutation-apply-execution-readiness-status'/.test(
        sourceMutationApplyExecutionReadiness,
      ),
    sourceMutationApplyDispatchImplemented:
      /mode: 'growth-remediation-source-mutation-apply-dispatch-status'/.test(
        sourceMutationApplyDispatch,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplyDispatch:
      /growth-remediation-source-mutation-apply-dispatch-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplyDispatch:
      /growth-remediation-source-mutation-apply-dispatch-status/.test(completionReadiness),
    ledgerMentionsSourceMutationApplyDispatch:
      /growth-remediation-source-mutation-apply-dispatch-status-readonly-post-m7-834/.test(
        todo,
      ),
    verificationIncludesSourceMutationApplyDispatch:
      /growth-remediation-source-mutation-apply-dispatch-status/.test(verificationStatus),
    sourceMutationApplyExecutionNextDocumented:
      /growth-remediation-source-mutation-apply-execution-status/.test(plan),
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
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    applyDispatchSeparateFromMutation:
      /apply dispatch stays separate from actually applying patches/.test(plan),
    applyExecutionStillBlocked:
      /before\s+source mutation apply execution can be considered/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationApplyDispatchSchema = {
  sourceMutationApplyDispatchRecord: fields(
    [
      'applyDispatchId',
      'applyExecutionReadinessId',
      'applyPreflightId',
      'applyAuthorizationId',
      'state',
      'decisionType',
      'operatorDispatchIntentRefs',
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
      'applyExecutionAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationApplyDispatchDecision: fields(
    [
      'decisionId',
      'applyDispatchId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applyExecutionAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplyDispatchBlocker: fields(
    [
      'blockerId',
      'applyDispatchId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplyExecution',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplyDispatchIndex: fields(
    [
      'indexId',
      'applyDispatchRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplyDispatchRules = [
  {
    id: 'apply-dispatch-requires-current-apply-execution-readiness',
    rule: 'source mutation apply dispatch can only bind to one current apply execution readiness record and its apply preflight chain',
  },
  {
    id: 'apply-dispatch-is-not-source-mutation',
    rule: 'source mutation apply dispatch status may mark apply-execution-contract readiness, but it cannot apply patches, mutate source, apply proposals, approve authorizations, or execute remediation',
  },
  {
    id: 'apply-dispatch-requires-clean-baseline-and-operator-dispatch-intent',
    rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, and operator dispatch intent must be present before source mutation apply execution can be considered',
  },
  {
    id: 'apply-dispatch-requires-verification-dry-run-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation apply execution can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-dispatch-blocks-apply-execution',
    rule: 'stale execution readiness, dirty or untracked baseline, changed patch/diff proof, failed verification, missing rollback proof, missing operator dispatch intent, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks apply execution readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplyDispatchSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationApplyExecutionReadinessDocumented &&
  sourceSummary.sourceMutationApplyDispatchDocumented &&
  sourceSummary.sourceMutationApplyPreflightImplemented &&
  sourceSummary.sourceMutationApplyExecutionReadinessImplemented &&
  sourceSummary.sourceMutationApplyDispatchImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplyDispatch &&
  sourceSummary.completionReadinessMentionsSourceMutationApplyDispatch &&
  sourceSummary.ledgerMentionsSourceMutationApplyDispatch &&
  sourceSummary.verificationIncludesSourceMutationApplyDispatch &&
  sourceSummary.sourceMutationApplyExecutionNextDocumented &&
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
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.applyDispatchSeparateFromMutation &&
  sourceSummary.applyExecutionStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-apply-dispatch-status',
  posture: 'local-read-only-remediation-source-mutation-apply-dispatch-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-apply-dispatch-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplyDispatchStates: SOURCE_MUTATION_APPLY_DISPATCH_STATES,
    sourceMutationApplyDispatchDecisionTypes: SOURCE_MUTATION_APPLY_DISPATCH_DECISION_TYPES,
    sourceMutationApplyDispatchEvidenceTypes: SOURCE_MUTATION_APPLY_DISPATCH_EVIDENCE_TYPES,
    sourceMutationApplyDispatchBlockerTypes: SOURCE_MUTATION_APPLY_DISPATCH_BLOCKER_TYPES,
  },
  sourceMutationApplyDispatchSchema,
  sourceMutationApplyDispatchRules,
  sourceMutationApplyDispatchState: {
    realSourceMutationApplyDispatchFileAdopted: false,
    discoveredSourceMutationApplyDispatchRecords: 0,
    applyExecutionAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-apply-dispatch',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplyDispatchRecordTypes: Object.keys(sourceMutationApplyDispatchSchema).length,
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
    negativeEvidenceClearanceRequired: true,
    applyDispatchAndMutationSeparate: true,
    applyExecutionAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplyExecutionStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-apply-execution-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-apply-execution-status.mjs',
    reason:
      'Source mutation apply dispatch is now modeled as read-only; the next safe slice should define apply-execution records without applying patches or mutating source.',
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
