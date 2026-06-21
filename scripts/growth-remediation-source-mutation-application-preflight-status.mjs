import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-application-preflight-status',
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
  'scripts/growth-remediation-source-mutation-request-status.mjs',
  'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_APPLICATION_PREFLIGHT_STATES = [
  'application-preflight-not-requested',
  'application-preflight-review-ready',
  'application-preflight-blocked',
  'application-preflight-ready-for-mutation-draft',
  'application-preflight-rejected',
  'application-preflight-deferred',
  'needs-current-authorization',
  'needs-approved-request',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-clean-baseline',
  'needs-expected-change-set',
  'needs-verification-command-set',
  'needs-restore-plan',
  'needs-rollback-plan',
  'needs-dry-run-plan',
  'stale-application-preflight-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_APPLICATION_PREFLIGHT_DECISION_TYPES = [
  'approve-source-mutation-draft-readiness',
  'request-current-authorization',
  'request-approved-request',
  'request-target-lock',
  'request-clean-baseline-proof',
  'request-expected-change-set',
  'request-verification-command-set',
  'request-restore-plan',
  'request-rollback-plan',
  'request-dry-run-plan',
  'reject-application-preflight',
  'defer-application-preflight',
  'hold-baseline',
];

const SOURCE_MUTATION_APPLICATION_PREFLIGHT_EVIDENCE_TYPES = [
  'source-mutation-authorization-record',
  'source-mutation-request-record',
  'mutation-preflight-record',
  'target-lock',
  'baseline-digest',
  'dirty-state-proof',
  'untracked-state-proof',
  'expected-change-set',
  'verification-command-set',
  'restore-plan',
  'rollback-plan',
  'dry-run-plan',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_APPLICATION_PREFLIGHT_BLOCKER_TYPES = [
  'authorization-missing',
  'authorization-stale',
  'request-missing',
  'request-stale',
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
  'dry-run-plan-missing',
  'negative-evidence-unresolved',
  'application-preflight-scope-too-broad',
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
  const sourceMutationRequest = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-request-status.mjs',
  );
  const sourceMutationAuthorization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  );
  const sourceMutationApplicationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationAuthorizationDocumented:
      /Twentieth Implemented Slice: `growth-remediation-source-mutation-authorization-status`/.test(
        plan,
      ),
    sourceMutationApplicationPreflightDocumented:
      /Twenty-first Implemented Slice: `growth-remediation-source-mutation-application-preflight-status`/.test(
        plan,
      ),
    sourceMutationRequestImplemented:
      /mode: 'growth-remediation-source-mutation-request-status'/.test(sourceMutationRequest),
    sourceMutationAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-authorization-status'/.test(
        sourceMutationAuthorization,
      ),
    sourceMutationApplicationPreflightImplemented:
      /mode: 'growth-remediation-source-mutation-application-preflight-status'/.test(
        sourceMutationApplicationPreflight,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationApplicationPreflight:
      /growth-remediation-source-mutation-application-preflight-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationApplicationPreflight:
      /growth-remediation-source-mutation-application-preflight-status/.test(completionReadiness),
    ledgerMentionsSourceMutationApplicationPreflight:
      /growth-remediation-source-mutation-application-preflight-status-readonly-post-m7-828/.test(
        todo,
      ),
    verificationIncludesSourceMutationApplicationPreflight:
      /growth-remediation-source-mutation-application-preflight-status/.test(verificationStatus),
    sourceMutationDraftNextDocumented:
      /growth-remediation-source-mutation-draft-status/.test(plan),
    currentAuthorizationDocumented: /current authorization record/.test(plan),
    approvedRequestDocumented: /approved request record/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    expectedChangeSetDocumented: /expected changed-file set/.test(plan),
    verificationCommandSetDocumented: /verification command set/.test(plan),
    restorePlanDocumented: /restore plan/.test(plan),
    rollbackPlanDocumented: /rollback plan/.test(plan),
    dryRunPlanDocumented: /dry-run plan/.test(plan),
    mutationDraftDocumented: /mutation draft/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationApplicationPreflightSchema = {
  sourceMutationApplicationPreflightRecord: fields(
    [
      'applicationPreflightId',
      'authorizationId',
      'requestId',
      'preflightId',
      'state',
      'decisionType',
      'targetLockRefs',
      'baselineDigestRefs',
      'dirtyStateProofRefs',
      'untrackedStateProofRefs',
      'expectedChangeSetRefs',
      'verificationCommandSetRefs',
      'restorePlanRefs',
      'rollbackPlanRefs',
      'dryRunPlanRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'mutationDraftAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationApplicationPreflightDecision: fields(
    [
      'decisionId',
      'applicationPreflightId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'mutationDraftAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationApplicationPreflightBlocker: fields(
    [
      'blockerId',
      'applicationPreflightId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksMutationDraft',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationApplicationPreflightIndex: fields(
    [
      'indexId',
      'applicationPreflightRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationApplicationPreflightRules = [
  {
    id: 'application-preflight-requires-current-authorization',
    rule: 'source mutation application preflight can only bind to one current authorization record and its exact approved source mutation request chain',
  },
  {
    id: 'application-preflight-is-not-source-mutation',
    rule: 'application preflight status may mark mutation-draft readiness, but it cannot mutate source or execute remediation',
  },
  {
    id: 'application-preflight-requires-clean-baseline-and-target-lock',
    rule: 'exact target lock, baseline digest, dirty-state proof, and untracked-state proof must be present before mutation draft readiness can be considered',
  },
  {
    id: 'application-preflight-requires-change-verification-restore-and-rollback',
    rule: 'expected changed-file set, verification command set, restore plan, rollback plan, and dry-run plan must be present before mutation draft readiness can be considered',
  },
  {
    id: 'dirty-stale-or-broad-application-preflight-blocks-mutation-draft',
    rule: 'dirty baseline, untracked baseline, stale authorization, stale request, source-of-truth drift, target-lock drift, changed verification command set, changed expected file set, missing dry-run plan, or broad application preflight scope blocks mutation-draft readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationApplicationPreflightSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationAuthorizationDocumented &&
  sourceSummary.sourceMutationApplicationPreflightDocumented &&
  sourceSummary.sourceMutationRequestImplemented &&
  sourceSummary.sourceMutationAuthorizationImplemented &&
  sourceSummary.sourceMutationApplicationPreflightImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationApplicationPreflight &&
  sourceSummary.completionReadinessMentionsSourceMutationApplicationPreflight &&
  sourceSummary.ledgerMentionsSourceMutationApplicationPreflight &&
  sourceSummary.verificationIncludesSourceMutationApplicationPreflight &&
  sourceSummary.sourceMutationDraftNextDocumented &&
  sourceSummary.currentAuthorizationDocumented &&
  sourceSummary.approvedRequestDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.expectedChangeSetDocumented &&
  sourceSummary.verificationCommandSetDocumented &&
  sourceSummary.restorePlanDocumented &&
  sourceSummary.rollbackPlanDocumented &&
  sourceSummary.dryRunPlanDocumented &&
  sourceSummary.mutationDraftDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-application-preflight-status',
  posture: 'local-read-only-remediation-source-mutation-application-preflight-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-application-preflight-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationApplicationPreflightStates: SOURCE_MUTATION_APPLICATION_PREFLIGHT_STATES,
    sourceMutationApplicationPreflightDecisionTypes:
      SOURCE_MUTATION_APPLICATION_PREFLIGHT_DECISION_TYPES,
    sourceMutationApplicationPreflightEvidenceTypes:
      SOURCE_MUTATION_APPLICATION_PREFLIGHT_EVIDENCE_TYPES,
    sourceMutationApplicationPreflightBlockerTypes:
      SOURCE_MUTATION_APPLICATION_PREFLIGHT_BLOCKER_TYPES,
  },
  sourceMutationApplicationPreflightSchema,
  sourceMutationApplicationPreflightRules,
  sourceMutationApplicationPreflightState: {
    realSourceMutationApplicationPreflightFileAdopted: false,
    discoveredSourceMutationApplicationPreflights: 0,
    mutationDraftAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-application-preflight',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationApplicationPreflightRecordTypes: Object.keys(
      sourceMutationApplicationPreflightSchema,
    ).length,
    currentAuthorizationRequired: true,
    approvedRequestRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    cleanBaselineProofRequired: true,
    expectedChangeSetRequired: true,
    verificationCommandSetRequired: true,
    restorePlanRequired: true,
    rollbackPlanRequired: true,
    dryRunPlanRequired: true,
    applicationPreflightAndMutationSeparate: true,
    mutationDraftAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationDraftStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-draft-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-draft-status.mjs',
    reason:
      'Application preflight is now modeled as read-only; the next safe slice should define mutation draft gates before any source mutation or remediation execution can act.',
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
