import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-mutation-preflight-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  'scripts/growth-remediation-thin-slice-status.mjs',
  'scripts/growth-remediation-execution-authority-status.mjs',
  'scripts/growth-remediation-mutation-preflight-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const MUTATION_PREFLIGHT_STATES = [
  'preflight-not-requested',
  'preflight-review-ready',
  'preflight-blocked',
  'preflight-ready-for-source-mutation-request',
  'preflight-rejected',
  'preflight-deferred',
  'needs-current-authority',
  'needs-baseline-digest',
  'needs-target-lock',
  'needs-clean-baseline',
  'needs-restore-plan',
  'needs-verification-precheck',
  'needs-rollback-plan',
  'stale-preflight-blocked',
  'closed-no-action',
];

const MUTATION_PREFLIGHT_DECISION_TYPES = [
  'approve-source-mutation-request-readiness',
  'request-current-authority',
  'request-baseline-digest',
  'request-target-lock',
  'request-clean-baseline-proof',
  'request-restore-plan',
  'request-verification-precheck',
  'request-rollback-plan',
  'reject-mutation-preflight',
  'defer-preflight',
  'hold-baseline',
];

const MUTATION_PREFLIGHT_EVIDENCE_TYPES = [
  'execution-authority-record',
  'thin-slice-readiness-record',
  'baseline-digest',
  'target-lock',
  'dirty-state-proof',
  'untracked-state-proof',
  'restore-plan',
  'verification-precheck',
  'rollback-plan',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const MUTATION_PREFLIGHT_BLOCKER_TYPES = [
  'authority-missing',
  'authority-not-current',
  'baseline-digest-missing',
  'target-lock-missing',
  'dirty-baseline',
  'untracked-baseline',
  'restore-plan-missing',
  'verification-precheck-missing',
  'rollback-plan-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'target-lock-drift',
  'preflight-scope-too-broad',
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
  const thinSlice = sourceText(sources, 'scripts/growth-remediation-thin-slice-status.mjs');
  const executionAuthority = sourceText(
    sources,
    'scripts/growth-remediation-execution-authority-status.mjs',
  );
  const mutationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-mutation-preflight-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    executionAuthorityDocumented:
      /Seventeenth Implemented Slice: `growth-remediation-execution-authority-status`/.test(plan),
    mutationPreflightDocumented:
      /Eighteenth Implemented Slice: `growth-remediation-mutation-preflight-status`/.test(plan),
    thinSliceImplemented: /mode: 'growth-remediation-thin-slice-status'/.test(thinSlice),
    executionAuthorityImplemented:
      /mode: 'growth-remediation-execution-authority-status'/.test(executionAuthority),
    mutationPreflightImplemented:
      /mode: 'growth-remediation-mutation-preflight-status'/.test(mutationPreflight),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsMutationPreflight: /growth-remediation-mutation-preflight-status/.test(
      harnessBaseline,
    ),
    completionReadinessMentionsMutationPreflight:
      /growth-remediation-mutation-preflight-status/.test(completionReadiness),
    ledgerMentionsMutationPreflight:
      /growth-remediation-mutation-preflight-status-readonly-post-m7-825/.test(todo),
    verificationIncludesMutationPreflight:
      /growth-remediation-mutation-preflight-status/.test(verificationStatus),
    sourceMutationRequestNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
    currentAuthorityDocumented: /current authority record/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    dirtyUntrackedProofDocumented:
      /dirty\/untracked state proof/.test(plan) || /dirty-state proof/.test(plan),
    restorePlanDocumented: /restore plan/.test(plan),
    verificationPrecheckDocumented: /verification precheck/.test(plan),
    rollbackPlanDocumented: /rollback plan/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    mutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const mutationPreflightSchema = {
  mutationPreflightRecord: fields(
    [
      'preflightId',
      'authorityId',
      'thinSliceId',
      'state',
      'decisionType',
      'baselineDigestRefs',
      'targetLockRefs',
      'dirtyStateProofRefs',
      'untrackedStateProofRefs',
      'restorePlanRefs',
      'verificationPrecheckRefs',
      'rollbackPlanRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'sourceMutationRequestAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  mutationPreflightDecision: fields(
    [
      'decisionId',
      'preflightId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  mutationPreflightBlocker: fields(
    [
      'blockerId',
      'preflightId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationRequest',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  mutationPreflightIndex: fields(
    ['indexId', 'preflightRefs', 'stateCounts', 'decisionCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const mutationPreflightRules = [
  {
    id: 'preflight-requires-current-execution-authority',
    rule: 'mutation preflight can only bind to one current execution authority record and one exact thin slice',
  },
  {
    id: 'preflight-is-not-source-mutation',
    rule: 'preflight status may approve source-mutation-request readiness, but it cannot mutate source or execute remediation',
  },
  {
    id: 'baseline-digest-and-target-lock-required',
    rule: 'baseline digest, target lock, dirty-state proof, and untracked-state proof must be present before source mutation can be requested',
  },
  {
    id: 'restore-and-rollback-proof-required',
    rule: 'restore plan, verification precheck, and rollback plan must be present before mutation request readiness can be considered',
  },
  {
    id: 'dirty-or-broad-preflight-blocks-source-mutation-request',
    rule: 'dirty baseline, untracked baseline, stale authority, source-of-truth drift, target-lock drift, or broad preflight scope blocks source-mutation-request readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(mutationPreflightSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.executionAuthorityDocumented &&
  sourceSummary.mutationPreflightDocumented &&
  sourceSummary.thinSliceImplemented &&
  sourceSummary.executionAuthorityImplemented &&
  sourceSummary.mutationPreflightImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsMutationPreflight &&
  sourceSummary.completionReadinessMentionsMutationPreflight &&
  sourceSummary.ledgerMentionsMutationPreflight &&
  sourceSummary.verificationIncludesMutationPreflight &&
  sourceSummary.sourceMutationRequestNextDocumented &&
  sourceSummary.currentAuthorityDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.dirtyUntrackedProofDocumented &&
  sourceSummary.restorePlanDocumented &&
  sourceSummary.verificationPrecheckDocumented &&
  sourceSummary.rollbackPlanDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.mutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-mutation-preflight-status',
  posture: 'local-read-only-remediation-mutation-preflight-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-mutation-preflight-status/v0',
  sourceSummary,
  vocabulary: {
    mutationPreflightStates: MUTATION_PREFLIGHT_STATES,
    mutationPreflightDecisionTypes: MUTATION_PREFLIGHT_DECISION_TYPES,
    mutationPreflightEvidenceTypes: MUTATION_PREFLIGHT_EVIDENCE_TYPES,
    mutationPreflightBlockerTypes: MUTATION_PREFLIGHT_BLOCKER_TYPES,
  },
  mutationPreflightSchema,
  mutationPreflightRules,
  mutationPreflightState: {
    realMutationPreflightFileAdopted: false,
    discoveredMutationPreflights: 0,
    sourceMutationRequestAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-mutation-preflight',
  },
  readiness: {
    requiredFieldsSatisfied,
    mutationPreflightRecordTypes: Object.keys(mutationPreflightSchema).length,
    currentAuthorityRequired: true,
    baselineDigestRequired: true,
    targetLockRequired: true,
    cleanBaselineProofRequired: true,
    restorePlanRequired: true,
    verificationPrecheckRequired: true,
    rollbackPlanRequired: true,
    preflightAndMutationSeparate: true,
    sourceMutationRequestAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationRequestStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-request-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-request-status.mjs',
    reason:
      'The mutation preflight contract is now modeled as read-only; the next safe slice should define source mutation request gates before any source mutation or remediation execution can act.',
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
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
