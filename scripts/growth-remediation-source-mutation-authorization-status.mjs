import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-authorization-status',
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
  'scripts/growth-remediation-mutation-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-request-status.mjs',
  'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_AUTHORIZATION_STATES = [
  'authorization-not-requested',
  'authorization-review-ready',
  'authorization-blocked',
  'authorization-ready-for-application-preflight',
  'authorization-rejected',
  'authorization-deferred',
  'needs-current-request',
  'needs-operator-approval',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-clean-baseline',
  'needs-expected-change-set',
  'needs-verification-command-set',
  'needs-restore-plan',
  'needs-rollback-plan',
  'stale-authorization-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_AUTHORIZATION_DECISION_TYPES = [
  'approve-source-mutation-application-preflight-readiness',
  'request-current-request',
  'request-operator-approval',
  'request-target-lock',
  'request-clean-baseline-proof',
  'request-expected-change-set',
  'request-verification-command-set',
  'request-restore-plan',
  'request-rollback-plan',
  'reject-source-mutation-authorization',
  'defer-source-mutation-authorization',
  'hold-baseline',
];

const SOURCE_MUTATION_AUTHORIZATION_EVIDENCE_TYPES = [
  'source-mutation-request-record',
  'mutation-preflight-record',
  'execution-authority-record',
  'operator-approval',
  'target-lock',
  'baseline-digest',
  'dirty-state-proof',
  'untracked-state-proof',
  'expected-change-set',
  'verification-command-set',
  'restore-plan',
  'rollback-plan',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_AUTHORIZATION_BLOCKER_TYPES = [
  'request-missing',
  'request-stale',
  'operator-approval-missing',
  'operator-approval-stale',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'dirty-baseline',
  'untracked-baseline',
  'source-of-truth-drift',
  'expected-change-set-missing',
  'expected-change-set-drift',
  'verification-command-set-missing',
  'verification-command-set-drift',
  'restore-plan-missing',
  'rollback-plan-missing',
  'negative-evidence-unresolved',
  'authorization-scope-too-broad',
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
  const mutationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-mutation-preflight-status.mjs',
  );
  const sourceMutationRequest = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-request-status.mjs',
  );
  const sourceMutationAuthorization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationRequestDocumented:
      /Nineteenth Implemented Slice: `growth-remediation-source-mutation-request-status`/.test(
        plan,
      ),
    sourceMutationAuthorizationDocumented:
      /Twentieth Implemented Slice: `growth-remediation-source-mutation-authorization-status`/.test(
        plan,
      ),
    mutationPreflightImplemented:
      /mode: 'growth-remediation-mutation-preflight-status'/.test(mutationPreflight),
    sourceMutationRequestImplemented:
      /mode: 'growth-remediation-source-mutation-request-status'/.test(sourceMutationRequest),
    sourceMutationAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-authorization-status'/.test(
        sourceMutationAuthorization,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationAuthorization:
      /growth-remediation-source-mutation-authorization-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationAuthorization:
      /growth-remediation-source-mutation-authorization-status/.test(completionReadiness),
    ledgerMentionsSourceMutationAuthorization:
      /growth-remediation-source-mutation-authorization-status-readonly-post-m7-827/.test(todo),
    verificationIncludesSourceMutationAuthorization:
      /growth-remediation-source-mutation-authorization-status/.test(verificationStatus),
    sourceMutationApplicationPreflightNextDocumented:
      /growth-remediation-source-mutation-application-preflight-status/.test(plan),
    currentRequestDocumented: /current request record/.test(plan),
    operatorApprovalDocumented: /operator approval/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    expectedChangeSetDocumented: /expected changed-file set/.test(plan),
    verificationCommandSetDocumented: /verification command set/.test(plan),
    restorePlanDocumented: /restore plan/.test(plan),
    rollbackPlanDocumented: /rollback plan/.test(plan),
    applicationPreflightDocumented: /application preflight/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationAuthorizationSchema = {
  sourceMutationAuthorizationRecord: fields(
    [
      'authorizationId',
      'requestId',
      'preflightId',
      'authorityId',
      'state',
      'decisionType',
      'operatorApprovalRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'dirtyStateProofRefs',
      'untrackedStateProofRefs',
      'expectedChangeSetRefs',
      'verificationCommandSetRefs',
      'restorePlanRefs',
      'rollbackPlanRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'applicationPreflightAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationAuthorizationDecision: fields(
    [
      'decisionId',
      'authorizationId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applicationPreflightAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationAuthorizationBlocker: fields(
    [
      'blockerId',
      'authorizationId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplicationPreflight',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationAuthorizationIndex: fields(
    [
      'indexId',
      'authorizationRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationAuthorizationRules = [
  {
    id: 'authorization-requires-current-source-mutation-request',
    rule: 'source mutation authorization can only bind to one current source mutation request record and its exact mutation preflight chain',
  },
  {
    id: 'authorization-is-not-source-mutation',
    rule: 'authorization status may mark application-preflight readiness, but it cannot mutate source or execute remediation',
  },
  {
    id: 'authorization-requires-operator-approval-and-clean-baseline',
    rule: 'operator approval, exact target lock, baseline digest, dirty-state proof, and untracked-state proof must be present before application preflight can be considered',
  },
  {
    id: 'authorization-requires-change-verification-and-rollback-lock',
    rule: 'expected changed-file set, verification command set, restore plan, and rollback plan must be present before application preflight can be considered',
  },
  {
    id: 'dirty-stale-or-broad-authorization-blocks-application-preflight',
    rule: 'dirty baseline, untracked baseline, stale request, source-of-truth drift, target-lock drift, changed verification command set, or broad authorization scope blocks application-preflight readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationAuthorizationSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationRequestDocumented &&
  sourceSummary.sourceMutationAuthorizationDocumented &&
  sourceSummary.mutationPreflightImplemented &&
  sourceSummary.sourceMutationRequestImplemented &&
  sourceSummary.sourceMutationAuthorizationImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationAuthorization &&
  sourceSummary.completionReadinessMentionsSourceMutationAuthorization &&
  sourceSummary.ledgerMentionsSourceMutationAuthorization &&
  sourceSummary.verificationIncludesSourceMutationAuthorization &&
  sourceSummary.sourceMutationApplicationPreflightNextDocumented &&
  sourceSummary.currentRequestDocumented &&
  sourceSummary.operatorApprovalDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.expectedChangeSetDocumented &&
  sourceSummary.verificationCommandSetDocumented &&
  sourceSummary.restorePlanDocumented &&
  sourceSummary.rollbackPlanDocumented &&
  sourceSummary.applicationPreflightDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-authorization-status',
  posture: 'local-read-only-remediation-source-mutation-authorization-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-authorization-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationAuthorizationStates: SOURCE_MUTATION_AUTHORIZATION_STATES,
    sourceMutationAuthorizationDecisionTypes: SOURCE_MUTATION_AUTHORIZATION_DECISION_TYPES,
    sourceMutationAuthorizationEvidenceTypes: SOURCE_MUTATION_AUTHORIZATION_EVIDENCE_TYPES,
    sourceMutationAuthorizationBlockerTypes: SOURCE_MUTATION_AUTHORIZATION_BLOCKER_TYPES,
  },
  sourceMutationAuthorizationSchema,
  sourceMutationAuthorizationRules,
  sourceMutationAuthorizationState: {
    realSourceMutationAuthorizationFileAdopted: false,
    discoveredSourceMutationAuthorizations: 0,
    applicationPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-authorization',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationAuthorizationRecordTypes: Object.keys(sourceMutationAuthorizationSchema).length,
    currentRequestRequired: true,
    operatorApprovalRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    cleanBaselineProofRequired: true,
    expectedChangeSetRequired: true,
    verificationCommandSetRequired: true,
    restorePlanRequired: true,
    rollbackPlanRequired: true,
    authorizationAndMutationSeparate: true,
    applicationPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplicationPreflightStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-application-preflight-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
    reason:
      'The source mutation authorization contract is now modeled as read-only; the next safe slice should define application preflight gates before any source mutation or remediation execution can act.',
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
