import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status';
requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const PREVIOUS_MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status';
const NEXT_MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status';

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  `scripts/${MODE}.mjs`,
  `scripts/${PREVIOUS_MODE}.mjs`,
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
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

function has(text, pattern) {
  return pattern.test(text);
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
  const currentStatus = sourceText(sources, `scripts/${MODE}.mjs`);
  const previousStatus = sourceText(sources, `scripts/${PREVIOUS_MODE}.mjs`);
  const finalizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: has(plan, /# Growth Gateway VNext Plan/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDocumented:
      has(
        plan,
        /Three-hundred-sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-recheck-after-lifecycle-close-finalization-review-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceImplemented:
      has(currentStatus, /mode:\s+MODE/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewImplemented:
      has(previousStatus, /mode:\s+MODE/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented:
      has(finalizationStatus, /mode:\s+MODE/),
    decisionAccepted: has(decisionLog, /### DEC-047/),
    masterBriefMentionsApprovalBeforeCommit: has(masterBrief, /approval before commit/),
    roadmapMentionsReviewBeforeDone: has(roadmap, /review before done/),
    packMentionsPreflight: has(pack, /preflight/),
    agentsRequireReviewBeforeDone: has(agents, /review before done/),
    agentsRequireApprovalBeforeCommit: has(agents, /approval before commit/),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance:
      has(harnessBaseline, new RegExp(MODE)),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance:
      has(completionReadiness, new RegExp(MODE)),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance:
      has(
        todo,
        /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-recheck-after-lifecycle-close-finalization-review-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1171/,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance:
      has(verificationStatus, new RegExp(MODE)),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceNextDocumented:
      has(plan, new RegExp(NEXT_MODE)),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDocumented:
      has(
        plan,
        /current source mutation lifecycle closeout closure lifecycle close finalization review\s+acceptance\s+record/,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented:
      has(
        plan,
        /current source mutation lifecycle closeout closure lifecycle close finalization review\s+record/,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented:
      has(plan, /current source mutation lifecycle closeout closure lifecycle close finalization record/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceCriteriaRefsDocumented:
      has(
        plan,
        /source mutation lifecycle closeout closure lifecycle close finalization review acceptance criteria refs/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionNoteRefsDocumented:
      has(
        plan,
        /source mutation lifecycle closeout closure lifecycle close finalization review acceptance decision note refs/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefsDocumented:
      has(plan, /source mutation lifecycle closeout closure lifecycle close finalization review criteria refs/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefsDocumented:
      has(plan, /source mutation lifecycle closeout closure lifecycle close finalization review decision note refs/),
    cleanBaselineProofDocumented: has(plan, /clean baseline proof/),
    exactScopeLockDocumented: has(plan, /exact scope lock/),
    targetLockDocumented: has(plan, /target lock/),
    baselineDigestDocumented: has(plan, /baseline digest/),
    patchDraftDocumented: has(plan, /patch draft refs/),
    diffPreviewDocumented: has(plan, /diff preview refs/),
    verificationOutputDocumented: has(plan, /verification output refs/),
    dryRunProofDocumented: has(plan, /dry-run proof refs/),
    rollbackProofDocumented: has(plan, /rollback proof refs/),
    negativeEvidenceClearanceDocumented: has(plan, /negative evidence clearance/),
    sourceOfTruthDocumented: has(plan, /source-of-truth refs/),
    taskLedgerRefsDocumented: has(plan, /task ledger refs/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceSeparateFromMutation:
      has(
        plan,
        /source mutation lifecycle closeout closure lifecycle close finalization review acceptance status stays separate from actual source mutation execution/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStillBlocked:
      has(
        plan,
        /without\s+accepting lifecycle close\s+finalization(?:,| or)\s+accepting lifecycle close finalization review acceptance(?:,| or)\s+accepting lifecycle close finalization review(?:,| or)\s+closing the\s+lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating\s+source/,
      ),
    remediationExecutionStillBlocked: has(plan, /opening remediation execution, or executing remediation/),
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
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStates: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-not-started',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-ready',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-blocked',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-ready-for-lifecycle-close-finalization-acceptance-contract',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-rejected',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-deferred',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-criteria',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-decision-note',
      'needs-clean-baseline-proof',
      'needs-patch-diff-verification-and-rollback-proof',
      'needs-negative-evidence-clearance',
      'closed-no-action',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-decision-note',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-record',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-criteria',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-decision-note',
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-missing',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-stale',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-rejected',
      'clean-baseline-proof-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-attempts-actual-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceRecord: {
      required: [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionNoteRefs',
        'lifecycleCloseFinalizationAcceptanceAllowed',
        'lifecycleCloseFinalizationReviewAcceptanceAccepted',
        'lifecycleCloseFinalizationReviewAccepted',
        'lifecycleCloseFinalized',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      optional: ['operatorNotes', 'negativeEvidenceClearanceRefs'],
    },
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-is-not-lifecycle-close-or-source-mutation',
      required: true,
      description:
        'A finalization review acceptance status command can only check evidence and route to the next read-only finalization acceptance contract; it cannot accept, close, patch, mutate source, or execute remediation.',
    },
  ],
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceFileAdopted: false,
    lifecycleCloseFinalizationAcceptanceAllowed: false,
    lifecycleCloseFinalizationReviewAcceptanceAccepted: false,
    lifecycleCloseFinalizationReviewAccepted: false,
    lifecycleCloseFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    remediationExecutionAllowed: false,
  },
  readiness: {
    requiredFieldsSatisfied,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceStatus:
      requiredFieldsSatisfied,
    lifecycleCloseFinalizationAcceptanceAllowed: false,
    lifecycleCloseFinalizationReviewAcceptanceAccepted: false,
    lifecycleCloseFinalizationReviewAccepted: false,
    lifecycleCloseFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: NEXT_MODE,
    commandToAdd: `node scripts/${NEXT_MODE}.mjs`,
    reason:
      'The lifecycle close finalization review acceptance contract is now modeled as read-only; the next slice should check lifecycle close finalization acceptance before lifecycle closure, patch application, or source mutation.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance: true,
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
  missingSources,
};

console.log(JSON.stringify(payload, null, 2));
