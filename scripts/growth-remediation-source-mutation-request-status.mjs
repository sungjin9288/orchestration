import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-request-status',
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
  'scripts/growth-remediation-execution-authority-status.mjs',
  'scripts/growth-remediation-mutation-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-request-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_REQUEST_STATES = [
  'request-not-created',
  'request-draft',
  'request-review-ready',
  'request-blocked',
  'request-ready-for-authorization-review',
  'request-rejected',
  'request-deferred',
  'needs-current-preflight',
  'needs-operator-intent',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-clean-baseline',
  'needs-restore-plan',
  'needs-expected-change-set',
  'needs-verification-command-set',
  'needs-rollback-plan',
  'stale-request-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_REQUEST_DECISION_TYPES = [
  'approve-source-mutation-request-review-readiness',
  'request-current-preflight',
  'request-operator-intent',
  'request-target-lock',
  'request-clean-baseline-proof',
  'request-restore-plan',
  'request-expected-change-set',
  'request-verification-command-set',
  'request-rollback-plan',
  'reject-source-mutation-request',
  'defer-source-mutation-request',
  'hold-baseline',
];

const SOURCE_MUTATION_REQUEST_EVIDENCE_TYPES = [
  'mutation-preflight-record',
  'execution-authority-record',
  'target-lock',
  'baseline-digest',
  'dirty-state-proof',
  'untracked-state-proof',
  'operator-intent',
  'restore-plan',
  'expected-change-set',
  'verification-command-set',
  'rollback-plan',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_REQUEST_BLOCKER_TYPES = [
  'preflight-missing',
  'preflight-stale',
  'operator-intent-missing',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'dirty-baseline',
  'untracked-baseline',
  'source-of-truth-drift',
  'restore-plan-missing',
  'expected-change-set-missing',
  'verification-command-set-missing',
  'rollback-plan-missing',
  'negative-evidence-unresolved',
  'request-scope-too-broad',
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
  const executionAuthority = sourceText(
    sources,
    'scripts/growth-remediation-execution-authority-status.mjs',
  );
  const mutationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-mutation-preflight-status.mjs',
  );
  const sourceMutationRequest = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-request-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    mutationPreflightDocumented:
      /Eighteenth Implemented Slice: `growth-remediation-mutation-preflight-status`/.test(plan),
    sourceMutationRequestDocumented:
      /Nineteenth Implemented Slice: `growth-remediation-source-mutation-request-status`/.test(
        plan,
      ),
    executionAuthorityImplemented:
      /mode: 'growth-remediation-execution-authority-status'/.test(executionAuthority),
    mutationPreflightImplemented:
      /mode: 'growth-remediation-mutation-preflight-status'/.test(mutationPreflight),
    sourceMutationRequestImplemented:
      /mode: 'growth-remediation-source-mutation-request-status'/.test(sourceMutationRequest),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationRequest:
      /growth-remediation-source-mutation-request-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationRequest:
      /growth-remediation-source-mutation-request-status/.test(completionReadiness),
    ledgerMentionsSourceMutationRequest:
      /growth-remediation-source-mutation-request-status-readonly-post-m7-826/.test(todo),
    verificationIncludesSourceMutationRequest:
      /growth-remediation-source-mutation-request-status/.test(verificationStatus),
    sourceMutationAuthorizationNextDocumented:
      /growth-remediation-source-mutation-authorization-status/.test(plan),
    currentPreflightDocumented: /current preflight record/.test(plan),
    operatorIntentDocumented: /operator intent/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    restorePlanDocumented: /restore plan/.test(plan),
    expectedChangeSetDocumented: /expected changed-file set/.test(plan),
    verificationCommandSetDocumented: /verification command set/.test(plan),
    rollbackPlanDocumented: /rollback plan/.test(plan),
    requestReviewDocumented: /request review/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationRequestSchema = {
  sourceMutationRequestRecord: fields(
    [
      'requestId',
      'preflightId',
      'authorityId',
      'state',
      'decisionType',
      'operatorIntentRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'dirtyStateProofRefs',
      'untrackedStateProofRefs',
      'restorePlanRefs',
      'expectedChangeSetRefs',
      'verificationCommandSetRefs',
      'rollbackPlanRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'authorizationReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationRequestDecision: fields(
    [
      'decisionId',
      'requestId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'authorizationReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationRequestBlocker: fields(
    [
      'blockerId',
      'requestId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksAuthorizationReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationRequestIndex: fields(
    ['indexId', 'requestRefs', 'stateCounts', 'decisionCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const sourceMutationRequestRules = [
  {
    id: 'request-requires-current-mutation-preflight',
    rule: 'source mutation request can only bind to one current mutation preflight record and one current execution authority record',
  },
  {
    id: 'request-is-not-source-mutation',
    rule: 'source mutation request status may mark authorization review readiness, but it cannot mutate source or execute remediation',
  },
  {
    id: 'request-requires-operator-intent-and-target-lock',
    rule: 'operator intent, exact target lock, baseline digest, dirty-state proof, and untracked-state proof must be present before authorization review readiness can be considered',
  },
  {
    id: 'request-requires-change-and-verification-contract',
    rule: 'expected changed-file set, verification command set, restore plan, and rollback plan must be present before authorization review readiness can be considered',
  },
  {
    id: 'dirty-stale-or-broad-request-blocks-authorization-review',
    rule: 'dirty baseline, untracked baseline, stale preflight, source-of-truth drift, target-lock drift, or broad request scope blocks authorization review readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationRequestSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.mutationPreflightDocumented &&
  sourceSummary.sourceMutationRequestDocumented &&
  sourceSummary.executionAuthorityImplemented &&
  sourceSummary.mutationPreflightImplemented &&
  sourceSummary.sourceMutationRequestImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationRequest &&
  sourceSummary.completionReadinessMentionsSourceMutationRequest &&
  sourceSummary.ledgerMentionsSourceMutationRequest &&
  sourceSummary.verificationIncludesSourceMutationRequest &&
  sourceSummary.sourceMutationAuthorizationNextDocumented &&
  sourceSummary.currentPreflightDocumented &&
  sourceSummary.operatorIntentDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.restorePlanDocumented &&
  sourceSummary.expectedChangeSetDocumented &&
  sourceSummary.verificationCommandSetDocumented &&
  sourceSummary.rollbackPlanDocumented &&
  sourceSummary.requestReviewDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-request-status',
  posture: 'local-read-only-remediation-source-mutation-request-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-request-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationRequestStates: SOURCE_MUTATION_REQUEST_STATES,
    sourceMutationRequestDecisionTypes: SOURCE_MUTATION_REQUEST_DECISION_TYPES,
    sourceMutationRequestEvidenceTypes: SOURCE_MUTATION_REQUEST_EVIDENCE_TYPES,
    sourceMutationRequestBlockerTypes: SOURCE_MUTATION_REQUEST_BLOCKER_TYPES,
  },
  sourceMutationRequestSchema,
  sourceMutationRequestRules,
  sourceMutationRequestState: {
    realSourceMutationRequestFileAdopted: false,
    discoveredSourceMutationRequests: 0,
    authorizationReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-request',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationRequestRecordTypes: Object.keys(sourceMutationRequestSchema).length,
    currentPreflightRequired: true,
    operatorIntentRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    cleanBaselineProofRequired: true,
    restorePlanRequired: true,
    expectedChangeSetRequired: true,
    verificationCommandSetRequired: true,
    rollbackPlanRequired: true,
    requestAndMutationSeparate: true,
    authorizationReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationAuthorizationStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-authorization-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-authorization-status.mjs',
    reason:
      'The source mutation request contract is now modeled as read-only; the next safe slice should define authorization gates before any source mutation or remediation execution can act.',
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
