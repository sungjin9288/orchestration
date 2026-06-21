import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-apply-authorization-status',
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
  'scripts/growth-remediation-source-mutation-draft-status.mjs',
  'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLY_AUTHORIZATION_STATES = [
  'source-mutation-apply-authorization-not-started',
  'source-mutation-apply-authorization-ready',
  'source-mutation-apply-authorization-blocked',
  'source-mutation-apply-authorization-ready-for-apply-preflight',
  'source-mutation-apply-authorization-granted',
  'source-mutation-apply-authorization-rejected',
  'source-mutation-apply-authorization-deferred',
  'needs-passed-draft-review',
  'needs-current-draft-review',
  'needs-operator-approval-intent',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-apply-authorization-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLY_AUTHORIZATION_DECISION_TYPES = [
  'approve-source-mutation-apply-preflight-readiness',
  'request-passed-draft-review',
  'request-current-draft-review',
  'request-operator-approval-intent',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-rollback-proof',
  'request-negative-evidence-clearance',
  'reject-source-mutation-apply-authorization',
  'defer-source-mutation-apply-authorization',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLY_AUTHORIZATION_EVIDENCE_TYPES = [
  'source-mutation-draft-review-record',
  'source-mutation-draft-record',
  'source-mutation-application-preflight-record',
  'source-mutation-authorization-record',
  'operator-approval-intent',
  'exact-scope-lock',
  'target-lock',
  'baseline-digest',
  'patch-draft',
  'diff-preview',
  'verification-command-set',
  'verification-output',
  'dry-run-proof',
  'rollback-proof',
  'reviewer-notes',
  'source-of-truth-doc',
  'negative-evidence-clearance',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_APPLY_AUTHORIZATION_BLOCKER_TYPES = [
  'draft-review-missing',
  'draft-review-not-passed',
  'draft-review-stale',
  'operator-approval-intent-missing',
  'operator-approval-intent-stale',
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
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'apply-scope-too-broad',
  'authorization-approves-unapproved-file',
  'authorization-attempts-source-mutation',
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
  const sourceMutationDraft = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-status.mjs',
  );
  const sourceMutationDraftReview = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  );
  const sourceMutationApplyAuthorization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationDraftReviewDocumented:
      /Twenty-third Implemented Slice: `growth-remediation-source-mutation-draft-review-status`/.test(
        plan,
      ),
    sourceMutationApplyAuthorizationDocumented:
      /Twenty-fourth Implemented Slice: `growth-remediation-source-mutation-apply-authorization-status`/.test(
        plan,
      ),
    sourceMutationDraftImplemented:
      /mode: 'growth-remediation-source-mutation-draft-status'/.test(sourceMutationDraft),
    sourceMutationDraftReviewImplemented:
      /mode: 'growth-remediation-source-mutation-draft-review-status'/.test(
        sourceMutationDraftReview,
      ),
    sourceMutationApplyAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-apply-authorization-status'/.test(
        sourceMutationApplyAuthorization,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplyAuthorization:
      /growth-remediation-source-mutation-apply-authorization-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplyAuthorization:
      /growth-remediation-source-mutation-apply-authorization-status/.test(completionReadiness),
    ledgerMentionsSourceMutationApplyAuthorization:
      /growth-remediation-source-mutation-apply-authorization-status-readonly-post-m7-831/.test(
        todo,
      ),
    verificationIncludesSourceMutationApplyAuthorization:
      /growth-remediation-source-mutation-apply-authorization-status/.test(verificationStatus),
    sourceMutationApplyPreflightNextDocumented:
      /growth-remediation-source-mutation-apply-preflight-status/.test(plan),
    passedDraftReviewDocumented: /passed draft review record/.test(plan),
    currentDraftReviewDocumented: /current draft review record/.test(plan),
    operatorApprovalIntentDocumented: /operator approval intent/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    applyAuthorizationSeparateFromMutation:
      /apply authorization stays separate from actually applying patches/.test(plan),
    applyPreflightStillBlocked:
      /before source mutation apply preflight can be considered/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationApplyAuthorizationSchema = {
  sourceMutationApplyAuthorizationRecord: fields(
    [
      'applyAuthorizationId',
      'draftReviewId',
      'draftId',
      'applicationPreflightId',
      'authorizationId',
      'state',
      'decisionType',
      'operatorApprovalIntentRefs',
      'exactScopeLockRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationCommandSetRefs',
      'verificationOutputRefs',
      'dryRunProofRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'applyPreflightAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationApplyAuthorizationDecision: fields(
    [
      'decisionId',
      'applyAuthorizationId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applyPreflightAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplyAuthorizationBlocker: fields(
    [
      'blockerId',
      'applyAuthorizationId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplyPreflight',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplyAuthorizationIndex: fields(
    [
      'indexId',
      'applyAuthorizationRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplyAuthorizationRules = [
  {
    id: 'apply-authorization-requires-passed-current-draft-review',
    rule: 'source mutation apply authorization readiness can only bind to one passed current draft review and its exact draft/application-preflight/authorization chain',
  },
  {
    id: 'apply-authorization-is-not-source-mutation',
    rule: 'source mutation apply authorization status may mark apply-preflight readiness, but it cannot approve authorization, apply patches, mutate source, apply proposals, or execute remediation',
  },
  {
    id: 'apply-authorization-requires-operator-intent-and-exact-scope',
    rule: 'operator approval intent, exact scope lock, target lock, and baseline digest refs must be present before apply preflight readiness can be considered',
  },
  {
    id: 'apply-authorization-requires-verification-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before apply preflight readiness can be considered',
  },
  {
    id: 'failed-stale-broad-or-mutating-authorization-blocks-apply-preflight',
    rule: 'failed or stale draft review proof, missing operator approval intent, scope drift, unapproved file touches, changed verification output, unresolved negative evidence, or any attempted source mutation blocks apply preflight readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplyAuthorizationSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationDraftReviewDocumented &&
  sourceSummary.sourceMutationApplyAuthorizationDocumented &&
  sourceSummary.sourceMutationDraftImplemented &&
  sourceSummary.sourceMutationDraftReviewImplemented &&
  sourceSummary.sourceMutationApplyAuthorizationImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplyAuthorization &&
  sourceSummary.completionReadinessMentionsSourceMutationApplyAuthorization &&
  sourceSummary.ledgerMentionsSourceMutationApplyAuthorization &&
  sourceSummary.verificationIncludesSourceMutationApplyAuthorization &&
  sourceSummary.sourceMutationApplyPreflightNextDocumented &&
  sourceSummary.passedDraftReviewDocumented &&
  sourceSummary.currentDraftReviewDocumented &&
  sourceSummary.operatorApprovalIntentDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.applyAuthorizationSeparateFromMutation &&
  sourceSummary.applyPreflightStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-apply-authorization-status',
  posture: 'local-read-only-remediation-source-mutation-apply-authorization-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-apply-authorization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplyAuthorizationStates: SOURCE_MUTATION_APPLY_AUTHORIZATION_STATES,
    sourceMutationApplyAuthorizationDecisionTypes:
      SOURCE_MUTATION_APPLY_AUTHORIZATION_DECISION_TYPES,
    sourceMutationApplyAuthorizationEvidenceTypes:
      SOURCE_MUTATION_APPLY_AUTHORIZATION_EVIDENCE_TYPES,
    sourceMutationApplyAuthorizationBlockerTypes:
      SOURCE_MUTATION_APPLY_AUTHORIZATION_BLOCKER_TYPES,
  },
  sourceMutationApplyAuthorizationSchema,
  sourceMutationApplyAuthorizationRules,
  sourceMutationApplyAuthorizationState: {
    realSourceMutationApplyAuthorizationFileAdopted: false,
    discoveredSourceMutationApplyAuthorizations: 0,
    applyPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-apply-authorization',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplyAuthorizationRecordTypes: Object.keys(
      sourceMutationApplyAuthorizationSchema,
    ).length,
    passedDraftReviewRequired: true,
    currentDraftReviewRequired: true,
    operatorApprovalIntentRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    rollbackProofRequired: true,
    negativeEvidenceClearanceRequired: true,
    applyAuthorizationAndMutationSeparate: true,
    applyPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplyPreflightStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-apply-preflight-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
    reason:
      'Source mutation apply authorization readiness is now modeled as read-only; the next safe slice should define apply preflight gates before any source mutation or remediation execution can act.',
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
    doesNotOpenApplyPreflight: true,
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
