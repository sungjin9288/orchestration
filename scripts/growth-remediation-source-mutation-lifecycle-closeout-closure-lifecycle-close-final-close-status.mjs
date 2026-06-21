import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status';
requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const PREVIOUS_MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status';
const NEXT_MODE =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status';

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
  const lifecycleCloseStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: has(plan, /# Growth Gateway VNext Plan/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDocumented:
      has(
        plan,
        /Three-hundred-sixty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseImplemented:
      has(currentStatus, /mode:\s+MODE/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceImplemented:
      has(previousStatus, /mode:\s+MODE/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseImplemented:
      has(lifecycleCloseStatus, /mode:\s+MODE/),
    decisionAccepted: has(decisionLog, /### DEC-047/),
    masterBriefMentionsApprovalBeforeCommit: has(masterBrief, /approval before commit/),
    roadmapMentionsReviewBeforeDone: has(roadmap, /review before done/),
    packMentionsPreflight: has(pack, /preflight/),
    agentsRequireReviewBeforeDone: has(agents, /review before done/),
    agentsRequireApprovalBeforeCommit: has(agents, /approval before commit/),
    harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose:
      has(harnessBaseline, new RegExp(MODE)),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose:
      has(completionReadiness, new RegExp(MODE)),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose:
      has(
        todo,
        /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1173/,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose:
      has(verificationStatus, new RegExp(MODE)),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseNextDocumented:
      has(plan, new RegExp(NEXT_MODE)),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDocumented:
      has(
        plan,
        /current source mutation lifecycle closeout closure lifecycle close final\s+close\s+record/,
      ),
    currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDocumented:
      has(
        plan,
        /current source mutation lifecycle closeout closure lifecycle close finalization\s+acceptance\s+record/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseCriteriaRefsDocumented:
      has(plan, /source mutation lifecycle closeout closure lifecycle close final close criteria refs/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionNoteRefsDocumented:
      has(plan, /source mutation lifecycle closeout closure lifecycle close final close decision note refs/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceCriteriaRefsDocumented:
      has(plan, /source mutation lifecycle closeout closure lifecycle close finalization acceptance criteria refs/),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDecisionNoteRefsDocumented:
      has(
        plan,
        /source mutation lifecycle closeout closure lifecycle close finalization acceptance decision note refs/,
      ),
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
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseSeparateFromMutation:
      has(
        plan,
        /source mutation lifecycle closeout closure lifecycle close final close status stays separate from actual source mutation execution/,
      ),
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStillBlocked:
      has(
        plan,
        /without\s+accepting lifecycle close final close(?:,| or)\s+closing the\s+lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating\s+source/,
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
    'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-contract',
  currentHead: {
    branchLine: runGitOrNull(['status', '--short', '--branch'])?.split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStates: [
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-not-started',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-ready',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-blocked',
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-ready-for-lifecycle-close-contract',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close',
      'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-criteria',
      'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-decision-note',
      'needs-clean-baseline-proof',
      'needs-patch-diff-verification-and-rollback-proof',
      'needs-negative-evidence-clearance',
      'closed-no-action',
    ],
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionTypes: [
      'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-readiness',
      'request-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-criteria',
      'request-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-decision-note',
      'request-negative-evidence-clearance',
      'reject-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close',
      'defer-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close',
      'hold-baseline',
    ],
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseSchema: {
    sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseRecord: {
      required: [
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceId',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseCriteriaRefs',
        'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionNoteRefs',
        'lifecycleCloseAllowed',
        'lifecycleCloseFinalCloseAccepted',
        'lifecycleClosed',
        'sourceMutationAllowed',
        'remediationExecutionAllowed',
      ],
      optional: ['operatorNotes', 'negativeEvidenceClearanceRefs'],
    },
  },
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseState: {
    realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseFileAdopted: false,
    lifecycleCloseAllowed: false,
    lifecycleCloseFinalCloseAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    remediationExecutionAllowed: false,
  },
  readiness: {
    requiredFieldsSatisfied,
    readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseStatus: requiredFieldsSatisfied,
    lifecycleCloseAllowed: false,
    lifecycleCloseFinalCloseAccepted: false,
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
      'The lifecycle close final-close contract is now modeled as read-only; the next slice can re-check lifecycle close status without closing lifecycle, patching, or mutating source.',
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
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance: true,
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
