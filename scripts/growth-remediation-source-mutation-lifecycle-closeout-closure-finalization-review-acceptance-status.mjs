import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_STATES = [
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-not-started',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-ready',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-blocked',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-ready-for-finalization-acceptance-contract',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-rejected',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization',
  'needs-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure',
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
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'needs-source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-blocked',
  'closed-no-action',
];

const CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_DECISION_TYPES = [
  'record-source-mutation-lifecycle-closeout-closure-finalization-acceptance-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure-finalization-review',
  'request-current-source-mutation-lifecycle-closeout-closure-finalization',
  'request-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'request-current-source-mutation-lifecycle-closeout-closure',
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
  'request-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-criteria',
  'request-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-finalization-review-criteria',
  'request-source-mutation-lifecycle-closeout-closure-finalization-review-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'request-source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'request-source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'request-source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'defer-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'hold-baseline',
];

const CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-criteria',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-decision-note',
  'source-mutation-lifecycle-closeout-closure-finalization-review-record',
  'source-mutation-lifecycle-closeout-closure-finalization-review-criteria',
  'source-mutation-lifecycle-closeout-closure-finalization-review-decision-note',
  'source-mutation-lifecycle-closeout-closure-finalization-record',
  'source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'source-mutation-lifecycle-closeout-closure-finalization-decision-note',
  'source-mutation-lifecycle-closeout-closure-acceptance-record',
  'source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
  'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
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

const CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-stale',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-rejected',
  'source-mutation-lifecycle-closeout-closure-finalization-review-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-review-stale',
  'source-mutation-lifecycle-closeout-closure-finalization-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-stale',
  'source-mutation-lifecycle-closeout-closure-acceptance-missing',
  'source-mutation-lifecycle-closeout-closure-missing',
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
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-review-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-review-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-finalization-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-acceptance-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-acceptance-decision-note-missing',
  'source-mutation-lifecycle-closeout-closure-result-reviewer-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-attempts-source-mutation',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-attempts-finalization',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-attempts-lifecycle-close',
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
  const closureFinalizationReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
  );
  const closureFinalizationReviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
  );
  const closureFinalizationStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented:
      /Fifty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented:
      /Fifty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewImplemented: /mode: MODE/.test(
      closureFinalizationReviewStatus,
    ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceImplemented: /mode: MODE/.test(
      closureFinalizationReviewAcceptanceStatus,
    ),
    sourceMutationLifecycleCloseoutClosureFinalizationImplemented: /mode: MODE/.test(
      closureFinalizationStatus,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-readonly-post-m7-865/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure finalization review acceptance record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented:
      /current source mutation lifecycle closeout closure finalization review record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented:
      /current source mutation lifecycle closeout closure finalization record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented:
      /current source mutation lifecycle closeout closure acceptance record/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure finalization review acceptance criteria refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure finalization review acceptance decision note refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure finalization review criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure finalization review decision note refs/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure finalization criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure finalization decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure acceptance decision note refs/.test(plan),
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
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSeparateFromMutation:
      /source mutation lifecycle closeout closure finalization review acceptance status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceStillBlocked:
      /without accepting finalization\s+review acceptance(?:,| or)\s+accepting finalization review(?:,| or)\s+finalizing closure(?:,| or)\s+closing\s+the\s+lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema = {
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRecord: fields(
    [
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewId',
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutClosureAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureId',
      'sourceMutationLifecycleCloseoutId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefs',
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
      'closureFinalizationAcceptanceAllowed',
      'closureFinalizationReviewAcceptanceAccepted',
      'closureFinalizationReviewAccepted',
      'closureFinalized',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewId',
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'closureFinalizationAcceptanceAllowed',
      'closureFinalizationReviewAcceptanceAccepted',
      'closureFinalized',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewId',
      'sourceMutationLifecycleCloseoutClosureFinalizationId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationReviewRefs',
      'sourceMutationLifecycleCloseoutClosureFinalizationRefs',
      'sourceMutationLifecycleCloseoutClosureAcceptanceRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRules = [
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-current-review-acceptance-chain',
    rule:
      'source mutation lifecycle closeout closure finalization review acceptance status can only bind to one current closure finalization review record and its current lifecycle closeout chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-is-not-finalization-or-source-mutation',
    rule:
      'source mutation lifecycle closeout closure finalization review acceptance status may mark finalization acceptance readiness, but it cannot accept finalization review acceptance, accept finalization review, finalize closure, close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-criteria-decision-and-reviewer-notes',
    rule:
      'closure finalization review acceptance criteria refs, closure finalization review acceptance decision note refs, closure finalization review criteria refs, closure finalization review decision note refs, closure finalization criteria refs, closure finalization decision note refs, closure acceptance criteria refs, closure acceptance decision note refs, and closure result reviewer note refs must be present before closure finalization acceptance status can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure finalization acceptance can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-finalization-review-acceptance-blocks-finalization-acceptance',
    rule:
      'stale closure finalization review acceptance proof, stale closure finalization review proof, stale closure finalization proof, stale closure acceptance proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closure finalization review acceptance criteria, missing closure finalization review acceptance decision note, missing reviewer note, unresolved negative evidence, unapproved file touches, or any attempted finalization acceptance, finalization, source mutation, or lifecycle close blocks lifecycle closeout closure finalization acceptance',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema,
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
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceStates:
      CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_STATES,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionTypes:
      CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_DECISION_TYPES,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceEvidenceTypes:
      CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceBlockerTypes:
      CLOSURE_FINALIZATION_REVIEW_ACCEPTANCE_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema,
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRules,
  sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState: {
    realSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRecords: 0,
    closureFinalizationAcceptanceAllowed: false,
    closureFinalizationReviewAcceptanceAccepted: false,
    closureFinalizationReviewAccepted: false,
    closureFinalized: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus:
      'contract-only-no-active-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutClosureFinalizationReviewRequired: true,
    currentSourceMutationLifecycleCloseoutClosureFinalizationRequired: true,
    currentSourceMutationLifecycleCloseoutClosureAcceptanceRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRequired: true,
    sourceMutationLifecycleCloseoutClosureResultReviewerNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceStatus: true,
    closureFinalizationAcceptanceAllowed: false,
    closureFinalizationReviewAcceptanceAccepted: false,
    closureFinalizationReviewAccepted: false,
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
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure finalization review acceptance status is now modeled as read-only; the next safe slice should define closure finalization acceptance status without final lifecycle closure, patch application, or source mutation.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationReview: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalization: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureAcceptance: true,
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
