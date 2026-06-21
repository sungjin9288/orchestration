import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status';
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
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
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
  const finalCloseStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
  );
  const finalizationAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalCloseDocumented:
      /Sixtieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalCloseImplemented: /mode: MODE/.test(
      finalCloseStatus,
    ),
    sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceImplemented: /mode: MODE/.test(
      finalizationAcceptanceStatus,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureFinalClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status-readonly-post-m7-867/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureFinalClose:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureFinalCloseDocumented:
      /current source mutation lifecycle closeout closure final close record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDocumented:
      /current source mutation lifecycle closeout closure finalization acceptance record/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented:
      /current source mutation lifecycle closeout closure finalization review acceptance record/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure final close criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure final close decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure finalization acceptance criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure finalization acceptance decision note refs/.test(
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
    sourceMutationLifecycleCloseoutClosureFinalCloseSeparateFromMutation:
      /source mutation lifecycle closeout closure final close status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureFinalCloseStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const finalCloseStates = [
  'source-mutation-lifecycle-closeout-closure-final-close-not-started',
  'source-mutation-lifecycle-closeout-closure-final-close-ready',
  'source-mutation-lifecycle-closeout-closure-final-close-blocked',
  'source-mutation-lifecycle-closeout-closure-final-close-ready-for-lifecycle-close-contract',
  'source-mutation-lifecycle-closeout-closure-final-close-rejected',
  'source-mutation-lifecycle-closeout-closure-final-close-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-final-close',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-final-close-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-final-close-decision-note',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-final-close-blocked',
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
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-final-close-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureFinalCloseStates: finalCloseStates,
    sourceMutationLifecycleCloseoutClosureFinalCloseDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-final-close',
      'request-source-mutation-lifecycle-closeout-closure-final-close-criteria',
      'request-source-mutation-lifecycle-closeout-closure-final-close-decision-note',
      'request-clean-baseline-proof',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-final-close',
      'defer-source-mutation-lifecycle-closeout-closure-final-close',
      'hold-baseline',
    ],
    sourceMutationLifecycleCloseoutClosureFinalCloseEvidenceTypes: [
      'source-mutation-lifecycle-closeout-closure-final-close-record',
      'source-mutation-lifecycle-closeout-closure-final-close-criteria',
      'source-mutation-lifecycle-closeout-closure-final-close-decision-note',
      'source-mutation-lifecycle-closeout-closure-finalization-acceptance-record',
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
    sourceMutationLifecycleCloseoutClosureFinalCloseBlockerTypes: [
      'source-mutation-lifecycle-closeout-closure-final-close-missing',
      'source-mutation-lifecycle-closeout-closure-final-close-stale',
      'source-mutation-lifecycle-closeout-closure-final-close-rejected',
      'clean-baseline-proof-missing',
      'dirty-baseline',
      'patch-draft-missing',
      'verification-output-failed',
      'rollback-proof-missing',
      'negative-evidence-unresolved',
      'source-mutation-lifecycle-closeout-closure-final-close-status-attempts-source-mutation',
      'source-mutation-lifecycle-closeout-closure-final-close-status-attempts-lifecycle-close',
    ],
  },
  sourceMutationLifecycleCloseoutClosureFinalCloseSchema: {
    sourceMutationLifecycleCloseoutClosureFinalCloseRecord: fields(
      [
        'sourceMutationLifecycleCloseoutClosureFinalCloseId',
        'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceId',
        'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
        'state',
        'decisionType',
        'sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRefs',
        'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionNoteRefs',
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
        'lifecycleCloseAllowed',
        'finalCloseAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['ownerSurface', 'operatorNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureFinalCloseDecision: fields(
      [
        'decisionId',
        'sourceMutationLifecycleCloseoutClosureFinalCloseId',
        'decisionType',
        'authority',
        'reason',
        'evidenceRefs',
        'allowedNextAction',
        'lifecycleCloseAllowed',
        'finalCloseAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      ['operatorNotes', 'reviewerNotes'],
    ),
    sourceMutationLifecycleCloseoutClosureFinalCloseBlocker: fields(
      [
        'blockerId',
        'sourceMutationLifecycleCloseoutClosureFinalCloseId',
        'blockerType',
        'severity',
        'evidenceRefs',
        'blocksSourceMutationLifecycleCloseoutClosureFinalClose',
        'blocksSourceMutation',
        'resolvedAt',
      ],
      ['ownerSurface', 'resolutionNotes'],
    ),
  },
  sourceMutationLifecycleCloseoutClosureFinalCloseRules: [
    {
      id: 'source-mutation-lifecycle-closeout-closure-final-close-requires-current-finalization-acceptance-chain',
      rule: 'source mutation lifecycle closeout closure final close status can only bind to one current finalization acceptance chain',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-final-close-is-not-lifecycle-close-or-source-mutation',
      rule: 'source mutation lifecycle closeout closure final close status may mark lifecycle-close readiness, but it cannot close the lifecycle, apply patches, mutate source, execute remediation, commit, push, or release',
    },
    {
      id: 'source-mutation-lifecycle-closeout-closure-final-close-requires-proof-and-negative-clearance',
      rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, final close criteria refs, final close decision note refs, finalization acceptance criteria refs, finalization acceptance decision note refs, and negative evidence clearance must be present before lifecycle close status can be considered',
    },
  ],
  sourceMutationLifecycleCloseoutClosureFinalCloseState: {
    realSourceMutationLifecycleCloseoutClosureFinalCloseFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureFinalCloseRecords: 0,
    lifecycleCloseAllowed: false,
    finalCloseAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-closure-final-close',
  },
  readiness: {
    requiredFieldsSatisfied,
    currentSourceMutationLifecycleCloseoutClosureFinalCloseRequired: true,
    currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureFinalCloseAndMutationSeparate: true,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseStatus: true,
    lifecycleCloseAllowed: false,
    finalCloseAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure final close status is now modeled as read-only; the next safe slice should define lifecycle close status without closing the lifecycle, applying patches, or mutating source.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalClose: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationAcceptance: true,
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
