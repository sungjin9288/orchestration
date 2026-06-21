import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status';
requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const CLOSURE_AUTHORIZATION_STATES = [
  'source-mutation-lifecycle-closeout-closure-authorization-not-started',
  'source-mutation-lifecycle-closeout-closure-authorization-ready',
  'source-mutation-lifecycle-closeout-closure-authorization-blocked',
  'source-mutation-lifecycle-closeout-closure-authorization-ready-for-closure-execution-readiness-contract',
  'source-mutation-lifecycle-closeout-closure-authorization-rejected',
  'source-mutation-lifecycle-closeout-closure-authorization-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-authorization',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-review',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-lifecycle-closeout-closure-authorization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-authorization-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-authorization-blocked',
  'closed-no-action',
];

const CLOSURE_AUTHORIZATION_DECISION_TYPES = [
  'authorize-source-mutation-lifecycle-closeout-closure-execution-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-authorization',
  'request-current-source-mutation-lifecycle-closeout-closure-readiness',
  'request-current-source-mutation-lifecycle-closeout-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout-review',
  'request-current-source-mutation-lifecycle-closeout',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-lifecycle-closeout-closure-authorization-criteria',
  'request-source-mutation-lifecycle-closeout-closure-authorization-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-closure-authorization',
  'defer-source-mutation-lifecycle-closeout-closure-authorization',
  'hold-baseline',
];

const CLOSURE_AUTHORIZATION_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-closure-authorization-record',
  'source-mutation-lifecycle-closeout-closure-authorization-criteria',
  'source-mutation-lifecycle-closeout-closure-authorization-decision-note',
  'source-mutation-lifecycle-closeout-closure-readiness-record',
  'source-mutation-lifecycle-closeout-closure-readiness-criteria',
  'source-mutation-lifecycle-closeout-closure-readiness-decision-note',
  'source-mutation-lifecycle-closeout-review-acceptance-record',
  'source-mutation-lifecycle-closeout-review-record',
  'source-mutation-lifecycle-closeout-record',
  'source-mutation-completion-review-acceptance-record',
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

const CLOSURE_AUTHORIZATION_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-closure-authorization-missing',
  'source-mutation-lifecycle-closeout-closure-authorization-stale',
  'source-mutation-lifecycle-closeout-closure-authorization-rejected',
  'source-mutation-lifecycle-closeout-closure-readiness-missing',
  'source-mutation-lifecycle-closeout-closure-readiness-stale',
  'source-mutation-lifecycle-closeout-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-stale',
  'source-mutation-lifecycle-closeout-review-missing',
  'source-mutation-lifecycle-closeout-review-stale',
  'source-mutation-lifecycle-closeout-missing',
  'source-mutation-lifecycle-closeout-stale',
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
  'source-mutation-lifecycle-closeout-closure-authorization-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-authorization-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-closure-authorization-status-attempts-source-mutation',
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
  const authorizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
  );
  const readinessStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
  );
  const reviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  );
  const reviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
  );
  const closeoutStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureReadinessDocumented:
      /Forty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureAuthorizationDocumented:
      /Forty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-status'/.test(
        closeoutStatus,
      ),
    sourceMutationLifecycleCloseoutReviewImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-status'/.test(
        reviewStatus,
      ),
    sourceMutationLifecycleCloseoutReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status'/.test(
        reviewAcceptanceStatus,
      ),
    sourceMutationLifecycleCloseoutClosureReadinessImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status'/.test(
        readinessStatus,
      ),
    sourceMutationLifecycleCloseoutClosureAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status'/.test(
        authorizationStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureAuthorization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureAuthorization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureAuthorization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status-readonly-post-m7-851/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureAuthorization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureExecutionReadinessNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureAuthorizationDocumented:
      /current source mutation lifecycle closeout closure authorization record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureReadinessDocumented:
      /current source mutation lifecycle closeout closure readiness record/.test(plan),
    currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout review acceptance record/.test(plan),
    sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure authorization criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure authorization decision note refs/.test(plan),
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
    sourceMutationLifecycleCloseoutClosureAuthorizationSeparateFromMutation:
      /source mutation lifecycle closeout closure authorization status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureAuthorizationStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches/.test(plan),
    sourceMutationStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const sourceMutationLifecycleCloseoutClosureAuthorizationSchema = {
  sourceMutationLifecycleCloseoutClosureAuthorizationRecord: fields(
    [
      'sourceMutationLifecycleCloseoutClosureAuthorizationId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutReviewId',
      'sourceMutationLifecycleCloseoutId',
      'sourceMutationCompletionReviewAcceptanceId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefs',
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
  sourceMutationLifecycleCloseoutClosureAuthorizationDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutClosureAuthorizationId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
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
  sourceMutationLifecycleCloseoutClosureAuthorizationBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutClosureAuthorizationId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureExecutionReadiness',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureAuthorizationIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutClosureAuthorizationRefs',
      'sourceMutationLifecycleCloseoutClosureReadinessRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutClosureAuthorizationRules = [
  {
    id: 'source-mutation-lifecycle-closeout-closure-authorization-requires-current-readiness-chain',
    rule:
      'source mutation lifecycle closeout closure authorization can only bind to one current lifecycle closeout closure readiness record and its current lifecycle closeout chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-authorization-is-not-source-mutation',
    rule:
      'source mutation lifecycle closeout closure authorization status may authorize execution-readiness consideration, but it cannot close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-authorization-requires-criteria-and-decision-notes',
    rule:
      'lifecycle closeout closure authorization criteria refs and lifecycle closeout closure authorization decision note refs must be present before closure execution readiness can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-authorization-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure execution readiness can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-authorization-blocks-execution-readiness',
    rule:
      'stale closure authorization proof, stale closure readiness proof, stale review acceptance proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closure authorization criteria, missing closure authorization decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout closure execution readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutClosureAuthorizationSchema,
).every((schema) => schema.required.length > 0);
const ok =
  missingSources.length === 0 &&
  Object.entries(sourceSummary)
    .filter(([key]) => key !== 'sourceCount' && key !== 'availableSourceCount')
    .every(([_key, value]) => value === true) &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: MODE,
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-authorization-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureAuthorizationStates: CLOSURE_AUTHORIZATION_STATES,
    sourceMutationLifecycleCloseoutClosureAuthorizationDecisionTypes:
      CLOSURE_AUTHORIZATION_DECISION_TYPES,
    sourceMutationLifecycleCloseoutClosureAuthorizationEvidenceTypes:
      CLOSURE_AUTHORIZATION_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutClosureAuthorizationBlockerTypes:
      CLOSURE_AUTHORIZATION_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutClosureAuthorizationSchema,
  sourceMutationLifecycleCloseoutClosureAuthorizationRules,
  sourceMutationLifecycleCloseoutClosureAuthorizationState: {
    realSourceMutationLifecycleCloseoutClosureAuthorizationFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureAuthorizationRecords: 0,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-closure-authorization',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutClosureAuthorizationRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutClosureAuthorizationSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutClosureAuthorizationRequired: true,
    currentSourceMutationLifecycleCloseoutClosureReadinessRequired: true,
    currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutReviewRequired: true,
    currentSourceMutationLifecycleCloseoutRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureAuthorizationAndMutationSeparate: true,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutClosureExecutionReadinessStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure authorization is now modeled as read-only; the next safe slice should check execution readiness before lifecycle closure, patch application, or source mutation.',
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
