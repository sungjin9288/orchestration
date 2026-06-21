import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
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
  const lifecycleCloseFinalizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  );
  const lifecycleCloseAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented:
      /Sixty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented:
      /mode:\s+MODE/.test(lifecycleCloseFinalizationStatus),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceImplemented:
      /mode:\s+MODE/.test(lifecycleCloseAcceptanceStatus),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status-readonly-post-m7-872/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/.test(
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
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure lifecycle close review acceptance record/.test(
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close acceptance criteria refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close acceptance decision note refs/.test(
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationSeparateFromMutation:
      /source mutation lifecycle closeout closure lifecycle close finalization status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStillBlocked:
      /without accepting lifecycle close\s+finalization review(?:,| or)\s+closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const lifecycleCloseFinalizationStates = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-not-started',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-ready',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-blocked',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-ready-for-lifecycle-close-finalization-review-contract',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-rejected',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-decision-note',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-blocked',
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
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStates:
      lifecycleCloseFinalizationStates,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-decision-note',
      'request-clean-baseline-proof',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-criteria',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-decision-note',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-record',
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-missing',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-stale',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-rejected',
      'clean-baseline-proof-missing',
      'dirty-baseline',
      'patch-draft-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status-attempts-actual-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRecord: fields(
      [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
        'state',
        'decisionType',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefs',
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
        'lifecycleCloseFinalizationReviewAllowed',
        'lifecycleCloseFinalized',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['ownerSurface', 'operatorNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecision: fields(
      [
        'decisionId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
        'decisionType',
        'authority',
        'reason',
        'evidenceRefs',
        'allowedNextAction',
        'lifecycleCloseFinalizationReviewAllowed',
        'lifecycleCloseFinalized',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationBlocker: fields(
      [
        'blockerId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
        'blockerType',
        'severity',
        'evidenceRefs',
        'blocksSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization',
        'blocksSourceMutation',
        'resolvedAt',
      ],
      ['ownerSurface', 'resolutionNotes'],
    ),
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-requires-current-acceptance-chain',
      rule: 'source mutation lifecycle closeout closure lifecycle close finalization status can only bind to one current lifecycle close acceptance chain',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-is-not-lifecycle-close-or-source-mutation',
      rule: 'source mutation lifecycle closeout closure lifecycle close finalization status may mark lifecycle-close-finalization-review readiness, but it cannot close the lifecycle, apply patches, mutate source, execute remediation, commit, push, or release',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-requires-proof-and-negative-clearance',
      rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, lifecycle close finalization criteria refs, lifecycle close finalization decision note refs, lifecycle close acceptance criteria refs, lifecycle close acceptance decision note refs, and negative evidence clearance must be present before lifecycle close finalization review status can be considered',
    },
  ],
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRecords: 0,
    lifecycleCloseFinalizationReviewAllowed: false,
    lifecycleCloseFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus:
      'contract-only-no-active-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
  },
  readiness: {
    requiredFieldsSatisfied,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRequired: true,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStatus:
      requiredFieldsSatisfied,
    lifecycleCloseFinalizationReviewAllowed: false,
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
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure lifecycle close finalization status is now modeled as read-only; the next safe slice should define lifecycle close finalization review without closing the lifecycle, applying patches, or mutating source.',
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
    doesNotFinalizeSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance: true,
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
