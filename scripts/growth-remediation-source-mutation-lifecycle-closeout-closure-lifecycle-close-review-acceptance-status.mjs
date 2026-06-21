import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
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
  const lifecycleCloseReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
  );
  const lifecycleCloseReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented:
      /Sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceImplemented:
      /mode:\s+MODE/.test(lifecycleCloseReviewAcceptanceStatus),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewImplemented: /mode:\s+MODE/.test(
      lifecycleCloseReviewStatus,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-readonly-post-m7-870/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure lifecycle close review acceptance record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented:
      /current source mutation lifecycle closeout closure lifecycle close review record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented:
      /current source mutation lifecycle closeout closure lifecycle close record/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close review acceptance criteria refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close review acceptance decision note refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close review criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close review decision note refs/.test(
        plan,
      ),
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSeparateFromMutation:
      /source mutation lifecycle closeout closure lifecycle close review acceptance status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStillBlocked:
      /without accepting review\s+acceptance(?:,| or)\s+closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const lifecycleCloseReviewAcceptanceStates = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-not-started',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-ready',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-blocked',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-ready-for-lifecycle-close-acceptance-contract',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-rejected',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-decision-note',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-blocked',
  'closed-no-action',
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied =
  missingSources.length === 0 &&
  Object.entries(sourceSummary)
    .filter(([key]) => !['sourceCount', 'availableSourceCount'].includes(key))
    .every(([, value]) => value === true);

const payload = {
  ok: requiredFieldsSatisfied,
  mode: MODE,
  posture:
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStates:
      lifecycleCloseReviewAcceptanceStates,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-decision-note',
      'request-clean-baseline-proof',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-criteria',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-decision-note',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-record',
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
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-missing',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-stale',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-rejected',
      'clean-baseline-proof-missing',
      'dirty-baseline',
      'patch-draft-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-attempts-actual-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRecord: fields(
      [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
        'state',
        'decisionType',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefs',
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
        'lifecycleCloseAcceptanceAllowed',
        'lifecycleCloseReviewAcceptanceAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['ownerSurface', 'operatorNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecision: fields(
      [
        'decisionId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
        'decisionType',
        'authority',
        'reason',
        'evidenceRefs',
        'allowedNextAction',
        'lifecycleCloseAcceptanceAllowed',
        'lifecycleCloseReviewAcceptanceAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceBlocker: fields(
      [
        'blockerId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
        'blockerType',
        'severity',
        'evidenceRefs',
        'blocksSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
        'blocksSourceMutation',
        'resolvedAt',
      ],
      ['ownerSurface', 'resolutionNotes'],
    ),
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-requires-current-review-chain',
      rule: 'source mutation lifecycle closeout closure lifecycle close review acceptance status can only bind to one current lifecycle close review chain',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-is-not-lifecycle-close-or-source-mutation',
      rule: 'source mutation lifecycle closeout closure lifecycle close review acceptance status may mark lifecycle-close-acceptance readiness, but it cannot accept lifecycle close, close the lifecycle, apply patches, mutate source, execute remediation, commit, push, or release',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-requires-proof-and-negative-clearance',
      rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, lifecycle close review acceptance criteria refs, lifecycle close review acceptance decision note refs, lifecycle close review criteria refs, lifecycle close review decision note refs, and negative evidence clearance must be present before lifecycle close acceptance status can be considered',
    },
  ],
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRecords: 0,
    lifecycleCloseAcceptanceAllowed: false,
    lifecycleCloseReviewAcceptanceAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus:
      'contract-only-no-active-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  },
  readiness: {
    requiredFieldsSatisfied,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStatus:
      requiredFieldsSatisfied,
    lifecycleCloseAcceptanceAllowed: false,
    lifecycleCloseReviewAcceptanceAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure lifecycle close review acceptance status is now modeled as read-only; the next safe slice should define lifecycle close acceptance without closing the lifecycle, applying patches, or mutating source.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReview: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
    doesNotCloseSourceMutationLifecycleCloseoutClosure: true,
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
