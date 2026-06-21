import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const CLOSURE_FINALIZATION_STATES = [
  'source-mutation-lifecycle-closeout-closure-finalization-not-started',
  'source-mutation-lifecycle-closeout-closure-finalization-ready',
  'source-mutation-lifecycle-closeout-closure-finalization-blocked',
  'source-mutation-lifecycle-closeout-closure-finalization-ready-for-review-contract',
  'source-mutation-lifecycle-closeout-closure-finalization-rejected',
  'source-mutation-lifecycle-closeout-closure-finalization-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization',
  'needs-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-review',
  'needs-current-source-mutation-lifecycle-closeout-closure',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-result',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution',
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
  'needs-source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-review-acceptance-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-review-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-result-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-result-acceptance-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-finalization-blocked',
  'closed-no-action',
];

const CLOSURE_FINALIZATION_DECISION_TYPES = [
  'record-source-mutation-lifecycle-closeout-closure-finalization-review-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-finalization',
  'request-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure-review',
  'request-current-source-mutation-lifecycle-closeout-closure',
  'request-current-source-mutation-lifecycle-closeout-closure-result-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure-result-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure-result-review',
  'request-current-source-mutation-lifecycle-closeout-closure-result',
  'request-current-source-mutation-lifecycle-closeout-closure-execution',
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
  'request-source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'request-source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'request-source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-review-acceptance-criteria',
  'request-source-mutation-lifecycle-closeout-closure-review-acceptance-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-closure-finalization',
  'defer-source-mutation-lifecycle-closeout-closure-finalization',
  'hold-baseline',
];

const CLOSURE_FINALIZATION_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-closure-finalization-record',
  'source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'source-mutation-lifecycle-closeout-closure-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'source-mutation-lifecycle-closeout-closure-review-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-review-record',
  'source-mutation-lifecycle-closeout-closure-record',
  'source-mutation-lifecycle-closeout-closure-result-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-result-review-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-result-review-record',
  'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  'source-mutation-lifecycle-closeout-closure-result-record',
  'source-mutation-lifecycle-closeout-closure-execution-record',
  'source-mutation-lifecycle-closeout-record',
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

const CLOSURE_FINALIZATION_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-closure-finalization-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-stale',
  'source-mutation-lifecycle-closeout-closure-finalization-rejected',
  'source-mutation-lifecycle-closeout-closure-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-acceptance-stale',
  'source-mutation-lifecycle-closeout-closure-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-review-missing',
  'source-mutation-lifecycle-closeout-closure-missing',
  'source-mutation-lifecycle-closeout-closure-result-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-result-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-result-review-missing',
  'source-mutation-lifecycle-closeout-closure-result-stale',
  'source-mutation-lifecycle-closeout-closure-execution-stale',
  'source-mutation-lifecycle-closeout-missing',
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
  'source-mutation-lifecycle-closeout-closure-finalization-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-acceptance-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-acceptance-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-result-reviewer-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-closure-finalization-status-attempts-source-mutation',
  'source-mutation-lifecycle-closeout-closure-finalization-status-attempts-finalization',
  'source-mutation-lifecycle-closeout-closure-finalization-status-attempts-lifecycle-close',
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
  const closureFinalizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
  );
  const closureAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
  );
  const closureReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status.mjs',
  );
  const closureReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
  );
  const closureStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
  );
  const resultAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status.mjs',
  );
  const resultReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status.mjs',
  );
  const resultReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
  );
  const resultStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
  );
  const executionStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureAcceptanceDocumented:
      /Fifty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationDocumented:
      /Fifty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureResultImplemented: /mode: MODE/.test(resultStatus),
    sourceMutationLifecycleCloseoutClosureResultReviewImplemented: /mode: MODE/.test(
      resultReviewStatus,
    ),
    sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceImplemented: /mode: MODE/.test(
      resultReviewAcceptanceStatus,
    ),
    sourceMutationLifecycleCloseoutClosureResultAcceptanceImplemented: /mode: MODE/.test(
      resultAcceptanceStatus,
    ),
    sourceMutationLifecycleCloseoutClosureImplemented: /mode: MODE/.test(closureStatus),
    sourceMutationLifecycleCloseoutClosureReviewImplemented: /mode: MODE/.test(
      closureReviewStatus,
    ),
    sourceMutationLifecycleCloseoutClosureReviewAcceptanceImplemented: /mode: MODE/.test(
      closureReviewAcceptanceStatus,
    ),
    sourceMutationLifecycleCloseoutClosureAcceptanceImplemented: /mode: MODE/.test(
      closureAcceptanceStatus,
    ),
    sourceMutationLifecycleCloseoutClosureFinalizationImplemented: /mode: MODE/.test(
      closureFinalizationStatus,
    ),
    sourceMutationLifecycleCloseoutClosureExecutionImplemented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status/.test(
        executionStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status-readonly-post-m7-863/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureFinalization:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented:
      /current source mutation lifecycle closeout closure finalization record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented:
      /current source mutation lifecycle closeout closure acceptance record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure review acceptance record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureReviewDocumented:
      /current source mutation lifecycle closeout closure review record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureDocumented:
      /current source mutation lifecycle closeout closure record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented:
      /current source mutation lifecycle closeout closure result acceptance record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure result review acceptance record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureResultReviewDocumented:
      /current source mutation lifecycle closeout closure result review record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureResultDocumented:
      /current source mutation lifecycle closeout closure result record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureExecutionDocumented:
      /current source mutation lifecycle closeout closure execution record/.test(plan),
    currentSourceMutationLifecycleCloseoutDocumented:
      /current source mutation lifecycle closeout record/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure finalization criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure finalization decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure acceptance decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureReviewAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure review acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureReviewAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure review acceptance decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureReviewCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure review criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure review decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure result acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure result acceptance decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefsDocumented:
      /source mutation lifecycle closeout closure result reviewer note refs/.test(plan),
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
    sourceMutationLifecycleCloseoutClosureFinalizationSeparateFromMutation:
      /source mutation lifecycle closeout closure finalization status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationStillBlocked:
      /without finalizing closure(?:,| or)\s+closing\s+the\s+lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const sourceMutationLifecycleCloseoutClosureFinalizationSchema = {
  sourceMutationLifecycleCloseoutClosureFinalizationRecord: fields(
    [
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutClosureAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureReviewId',
      'sourceMutationLifecycleCloseoutClosureId',
      'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureResultReviewId',
      'sourceMutationLifecycleCloseoutClosureResultId',
      'sourceMutationLifecycleCloseoutClosureExecutionId',
      'sourceMutationLifecycleCloseoutId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureReviewAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureReviewAcceptanceDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureReviewCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
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
      'closureFinalizationReviewAllowed',
      'closureFinalized',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutClosureAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureId',
      'sourceMutationLifecycleCloseoutId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'closureFinalizationReviewAllowed',
      'closureFinalized',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutClosureAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureFinalization',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutClosureFinalizationRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceRefs',
      'sourceMutationLifecycleCloseoutClosureReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutClosureReviewRefs',
      'sourceMutationLifecycleCloseoutClosureRefs',
      'sourceMutationLifecycleCloseoutClosureResultAcceptanceRefs',
      'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutClosureResultReviewRefs',
      'sourceMutationLifecycleCloseoutClosureResultRefs',
      'sourceMutationLifecycleCloseoutClosureExecutionRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutClosureFinalizationRules = [
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-requires-current-finalization-chain',
    rule:
      'source mutation lifecycle closeout closure finalization status can only bind to one current closure acceptance record and its current lifecycle closeout chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-is-not-finalization-or-source-mutation',
    rule:
      'source mutation lifecycle closeout closure finalization status may mark review readiness, but it cannot finalize closure, close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-requires-criteria-decision-and-reviewer-notes',
    rule:
      'closure finalization criteria refs, closure finalization decision note refs, closure acceptance criteria refs, closure acceptance decision note refs, closure review acceptance criteria refs, closure review acceptance decision note refs, closure review criteria refs, closure review decision note refs, closure criteria refs, closure decision note refs, closure result acceptance criteria refs, closure result acceptance decision note refs, and closure result reviewer note refs must be present before closure finalization review status can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure finalization review can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-finalization-blocks-review',
    rule:
      'stale closure finalization proof, stale closure acceptance proof, stale closure review acceptance proof, stale closure review proof, stale closure proof, stale result acceptance proof, stale result review proof, stale result proof, stale execution proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closure finalization criteria, missing closure finalization decision note, missing closure acceptance criteria, missing closure acceptance decision note, missing reviewer note, unresolved negative evidence, unapproved file touches, or any attempted finalization, source mutation, or lifecycle close blocks lifecycle closeout closure finalization review',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutClosureFinalizationSchema,
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
  posture:
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureFinalizationStates: CLOSURE_FINALIZATION_STATES,
    sourceMutationLifecycleCloseoutClosureFinalizationDecisionTypes:
      CLOSURE_FINALIZATION_DECISION_TYPES,
    sourceMutationLifecycleCloseoutClosureFinalizationEvidenceTypes:
      CLOSURE_FINALIZATION_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutClosureFinalizationBlockerTypes:
      CLOSURE_FINALIZATION_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutClosureFinalizationSchema,
  sourceMutationLifecycleCloseoutClosureFinalizationRules,
  sourceMutationLifecycleCloseoutClosureFinalizationState: {
    realSourceMutationLifecycleCloseoutClosureFinalizationFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureFinalizationRecords: 0,
    closureFinalizationReviewAllowed: false,
    closureFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus:
      'contract-only-no-active-source-mutation-lifecycle-closeout-closure-finalization',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutClosureFinalizationRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutClosureFinalizationSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutClosureFinalizationRequired: true,
    currentSourceMutationLifecycleCloseoutClosureAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureReviewRequired: true,
    currentSourceMutationLifecycleCloseoutClosureRequired: true,
    currentSourceMutationLifecycleCloseoutClosureResultAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureResultReviewRequired: true,
    currentSourceMutationLifecycleCloseoutClosureResultRequired: true,
    currentSourceMutationLifecycleCloseoutClosureExecutionRequired: true,
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
    sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureReviewAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureReviewAcceptanceDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureReviewCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureResultReviewerNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureFinalizationReviewStatus: true,
    closureFinalizationReviewAllowed: false,
    closureFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure finalization status is now modeled as read-only; the next safe slice should define closure finalization review status without final lifecycle closure, patch application, or source mutation.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalization: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureReviewAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureReview: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosure: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureResultAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureResultReviewAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureResultReview: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureResult: true,
    doesNotFinalizeSourceMutationLifecycleCloseoutClosure: true,
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
process.exit(ok ? 0 : 1);
