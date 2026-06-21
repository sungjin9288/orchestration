import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
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
  const lifecycleCloseFinalizationReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
  );
  const lifecycleCloseFinalizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented:
      /Three-hundred-sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-recheck-after-lifecycle-close-finalization-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewImplemented:
      /mode:\s+MODE/.test(lifecycleCloseFinalizationReviewStatus),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented:
      /mode:\s+MODE/.test(lifecycleCloseFinalizationStatus),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-recheck-after-lifecycle-close-finalization-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1170/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented:
      /current source mutation lifecycle closeout closure lifecycle close finalization review\s+record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented:
      /current source mutation lifecycle closeout closure lifecycle close finalization record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDocumented:
      /current source mutation lifecycle closeout closure lifecycle close acceptance record/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close finalization review criteria refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close finalization review decision note refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close finalization criteria refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close finalization decision note refs/.test(
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewSeparateFromMutation:
      /source mutation lifecycle closeout closure lifecycle close finalization review status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStillBlocked:
      /without accepting lifecycle close\s+finalization review acceptance(?:,| or)\s+accepting lifecycle close finalization review(?:,| or)\s+closing the\s+lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

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
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStates: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-not-started',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-ready',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-blocked',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-ready-for-lifecycle-close-finalization-review-acceptance-contract',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-rejected',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-deferred',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-criteria',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-decision-note',
      'needs-clean-baseline-proof',
      'needs-patch-diff-verification-and-rollback-proof',
      'needs-negative-evidence-clearance',
      'stale-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-blocked',
      'closed-no-action',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-decision-note',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-criteria',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-decision-note',
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-missing',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-stale',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-rejected',
      'clean-baseline-proof-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-attempts-actual-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRecord: fields(
      [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceId',
        'state',
        'decisionType',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefs',
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
        'lifecycleCloseFinalizationReviewAcceptanceAllowed',
        'lifecycleCloseFinalizationReviewAccepted',
        'lifecycleCloseFinalized',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['ownerSurface', 'operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecision: fields(
      [
        'decisionId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
        'decisionType',
        'authority',
        'reason',
        'evidenceRefs',
        'allowedNextAction',
        'lifecycleCloseFinalizationReviewAcceptanceAllowed',
        'lifecycleCloseFinalizationReviewAccepted',
        'lifecycleCloseFinalized',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewBlocker: fields(
      [
        'blockerId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
        'blockerType',
        'severity',
        'evidenceRefs',
        'blocksSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview',
        'blocksSourceMutation',
        'resolvedAt',
      ],
      ['ownerSurface', 'resolutionNotes'],
    ),
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-requires-current-finalization-chain',
      rule: 'source mutation lifecycle closeout closure lifecycle close finalization review status can only bind to one current lifecycle close finalization chain',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-is-not-lifecycle-close-or-source-mutation',
      rule: 'source mutation lifecycle closeout closure lifecycle close finalization review status may mark finalization-review-acceptance readiness, but it cannot accept review, close the lifecycle, apply patches, mutate source, execute remediation, commit, push, or release',
    },
  ],
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRecords: 0,
    lifecycleCloseFinalizationReviewAcceptanceAllowed: false,
    lifecycleCloseFinalizationReviewAccepted: false,
    lifecycleCloseFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus:
      'contract-only-no-active-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
  },
  readiness: {
    requiredFieldsSatisfied,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRequired: true,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRequired: true,
    cleanBaselineProofRequired: true,
    patchDiffVerificationAndRollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRequired:
      true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAndMutationSeparate:
      true,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStatus:
      requiredFieldsSatisfied,
    lifecycleCloseFinalizationReviewAcceptanceAllowed: false,
    lifecycleCloseFinalizationReviewAccepted: false,
    lifecycleCloseFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure lifecycle close finalization review status is now modeled as read-only; the next safe slice should define lifecycle close finalization review acceptance without accepting review, closing the lifecycle, applying patches, or mutating source.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview: true,
    doesNotFinalizeSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance: true,
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
