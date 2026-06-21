import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
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
  const lifecycleCloseStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
  );
  const finalCloseStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented:
      /Sixty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseImplemented: /mode: MODE/.test(
      lifecycleCloseStatus,
    ),
    sourceMutationLifecycleCloseoutClosureFinalCloseImplemented: /mode: MODE/.test(
      finalCloseStatus,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status-readonly-post-m7-868/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented:
      /current source mutation lifecycle closeout closure lifecycle close record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureFinalCloseDocumented:
      /current source mutation lifecycle closeout closure final close record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDocumented:
      /current source mutation lifecycle closeout closure finalization acceptance record/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure lifecycle close decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure final close criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure final close decision note refs/.test(plan),
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseSeparateFromMutation:
      /source mutation lifecycle closeout closure lifecycle close status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const lifecycleCloseStates = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-not-started',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-ready',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-blocked',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-ready-for-review-contract',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-rejected',
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  'needs-current-source-mutation-lifecycle-closeout-closure-final-close',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-decision-note',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-lifecycle-close-blocked',
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
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseStates: lifecycleCloseStates,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-decision-note',
      'request-clean-baseline-proof',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-criteria',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-decision-note',
      'source-mutation-lifecycle-closeout-closure-final-close-record',
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-missing',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-stale',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-rejected',
      'clean-baseline-proof-missing',
      'dirty-baseline',
      'patch-draft-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-status-attempts-actual-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseRecord: fields(
      [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
        'sourceMutationLifecycleCloseoutClosureFinalCloseId',
        'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceId',
        'state',
        'decisionType',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefs',
        'sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRefs',
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
        'lifecycleCloseReviewAllowed',
        'lifecycleCloseAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['ownerSurface', 'operatorNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseDecision: fields(
      [
        'decisionId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
        'decisionType',
        'authority',
        'reason',
        'evidenceRefs',
        'allowedNextAction',
        'lifecycleCloseReviewAllowed',
        'lifecycleCloseAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseBlocker: fields(
      [
        'blockerId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
        'blockerType',
        'severity',
        'evidenceRefs',
        'blocksSourceMutationLifecycleCloseoutClosureLifecycleClose',
        'blocksSourceMutation',
        'resolvedAt',
      ],
      ['ownerSurface', 'resolutionNotes'],
    ),
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-requires-current-final-close-chain',
      rule: 'source mutation lifecycle closeout closure lifecycle close status can only bind to one current final close chain',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-is-not-actual-lifecycle-close-or-source-mutation',
      rule: 'source mutation lifecycle closeout closure lifecycle close status may mark review readiness, but it cannot close the lifecycle, apply patches, mutate source, execute remediation, commit, push, or release',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-requires-proof-and-negative-clearance',
      rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, lifecycle close criteria refs, lifecycle close decision note refs, final close criteria refs, final close decision note refs, and negative evidence clearance must be present before lifecycle close review status can be considered',
    },
  ],
  sourceMutationLifecycleCloseoutClosureLifecycleCloseState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureLifecycleCloseRecords: 0,
    lifecycleCloseReviewAllowed: false,
    lifecycleCloseAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  },
  readiness: {
    requiredFieldsSatisfied,
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseRequired: true,
    currentSourceMutationLifecycleCloseoutClosureFinalCloseRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureLifecycleCloseAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStatus: requiredFieldsSatisfied,
    lifecycleCloseReviewAllowed: false,
    lifecycleCloseAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure lifecycle close status is now modeled as read-only; the next safe slice should define lifecycle close review status without closing the lifecycle, applying patches, or mutating source.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalClose: true,
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
process.exit(payload.ok ? 0 : 1);
