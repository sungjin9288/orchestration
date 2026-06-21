import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-execution-authority-status',
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
  'scripts/growth-remediation-implementation-review-status.mjs',
  'scripts/growth-remediation-thin-slice-status.mjs',
  'scripts/growth-remediation-execution-authority-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const EXECUTION_AUTHORITY_STATES = [
  'authority-not-requested',
  'authority-review-ready',
  'authority-blocked',
  'authority-approved-for-preflight',
  'authority-rejected',
  'authority-deferred',
  'needs-baseline-snapshot',
  'needs-operator-approval',
  'needs-target-lock',
  'needs-rollback-proof',
  'stale-authority-blocked',
  'closed-no-action',
];

const EXECUTION_AUTHORITY_DECISION_TYPES = [
  'approve-mutation-preflight',
  'request-baseline-snapshot',
  'request-target-lock',
  'request-operator-approval',
  'request-rollback-proof',
  'reject-execution-authority',
  'defer-authority',
  'hold-baseline',
];

const EXECUTION_AUTHORITY_EVIDENCE_TYPES = [
  'thin-slice-readiness-record',
  'implementation-review-record',
  'operator-approval',
  'exact-target-scope',
  'baseline-snapshot',
  'dirty-state-proof',
  'verification-output',
  'rollback-proof',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const EXECUTION_AUTHORITY_BLOCKER_TYPES = [
  'thin-slice-missing',
  'thin-slice-not-ready',
  'operator-approval-missing',
  'baseline-snapshot-missing',
  'target-lock-missing',
  'dirty-baseline',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'stale-target-proof',
  'authority-scope-too-broad',
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
  const implementationReview = sourceText(
    sources,
    'scripts/growth-remediation-implementation-review-status.mjs',
  );
  const thinSlice = sourceText(sources, 'scripts/growth-remediation-thin-slice-status.mjs');
  const executionAuthority = sourceText(
    sources,
    'scripts/growth-remediation-execution-authority-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    thinSliceDocumented:
      /Sixteenth Implemented Slice: `growth-remediation-thin-slice-status`/.test(plan),
    executionAuthorityDocumented:
      /Seventeenth Implemented Slice: `growth-remediation-execution-authority-status`/.test(plan),
    implementationReviewImplemented:
      /mode: 'growth-remediation-implementation-review-status'/.test(implementationReview),
    thinSliceImplemented: /mode: 'growth-remediation-thin-slice-status'/.test(thinSlice),
    executionAuthorityImplemented:
      /mode: 'growth-remediation-execution-authority-status'/.test(executionAuthority),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /Human Gate/.test(pack) || /human gate/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsExecutionAuthority: /growth-remediation-execution-authority-status/.test(
      harnessBaseline,
    ),
    completionReadinessMentionsExecutionAuthority:
      /growth-remediation-execution-authority-status/.test(completionReadiness),
    ledgerMentionsExecutionAuthority:
      /growth-remediation-execution-authority-status-readonly-post-m7-824/.test(todo),
    verificationIncludesExecutionAuthority:
      /growth-remediation-execution-authority-status/.test(verificationStatus),
    sourceMutationRequestNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
    operatorApprovalDocumented: /operator approval/.test(plan),
    exactTargetScopeDocumented: /exact target scope/.test(plan),
    baselineSnapshotDocumented: /baseline snapshot/.test(plan),
    dirtyBaselineDocumented: /dirty baseline/.test(plan) || /dirty-state proof/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    mutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const executionAuthoritySchema = {
  executionAuthorityRecord: fields(
    [
      'authorityId',
      'thinSliceId',
      'reviewId',
      'proposalId',
      'state',
      'decisionType',
      'operatorApprovalRefs',
      'exactTargetScopeRefs',
      'baselineSnapshotRefs',
      'dirtyStateProofRefs',
      'verificationOutputRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'mutationPreflightAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'approvedAt', 'expiresAt', 'deferredReason'],
  ),
  executionAuthorityDecision: fields(
    [
      'decisionId',
      'authorityId',
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
  executionAuthorityBlocker: fields(
    [
      'blockerId',
      'authorityId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksMutationPreflight',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  executionAuthorityIndex: fields(
    ['indexId', 'authorityRefs', 'stateCounts', 'decisionCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const executionAuthorityRules = [
  {
    id: 'authority-requires-thin-slice-readiness',
    rule: 'execution authority can only bind to one reviewed thin-slice readiness record with exact target refs',
  },
  {
    id: 'authority-is-not-source-mutation',
    rule: 'authority status may approve mutation preflight readiness, but it cannot mutate source or execute remediation',
  },
  {
    id: 'baseline-and-target-lock-required',
    rule: 'baseline snapshot, dirty-state proof, and exact target scope must be present before mutation preflight can be allowed',
  },
  {
    id: 'operator-approval-is-distinct-from-execution',
    rule: 'operator approval records authorize the next gated preflight only and do not run source mutation, commit, push, or remediation execution',
  },
  {
    id: 'broad-authority-and-dirty-baseline-block-preflight',
    rule: 'authority scope that targets a broad category, stale proof, source-of-truth drift, or dirty baseline blocks mutation preflight',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(executionAuthoritySchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.thinSliceDocumented &&
  sourceSummary.executionAuthorityDocumented &&
  sourceSummary.implementationReviewImplemented &&
  sourceSummary.thinSliceImplemented &&
  sourceSummary.executionAuthorityImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsExecutionAuthority &&
  sourceSummary.completionReadinessMentionsExecutionAuthority &&
  sourceSummary.ledgerMentionsExecutionAuthority &&
  sourceSummary.verificationIncludesExecutionAuthority &&
  sourceSummary.sourceMutationRequestNextDocumented &&
  sourceSummary.operatorApprovalDocumented &&
  sourceSummary.exactTargetScopeDocumented &&
  sourceSummary.baselineSnapshotDocumented &&
  sourceSummary.dirtyBaselineDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.mutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-execution-authority-status',
  posture: 'local-read-only-remediation-execution-authority-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-execution-authority-status/v0',
  sourceSummary,
  vocabulary: {
    executionAuthorityStates: EXECUTION_AUTHORITY_STATES,
    executionAuthorityDecisionTypes: EXECUTION_AUTHORITY_DECISION_TYPES,
    executionAuthorityEvidenceTypes: EXECUTION_AUTHORITY_EVIDENCE_TYPES,
    executionAuthorityBlockerTypes: EXECUTION_AUTHORITY_BLOCKER_TYPES,
  },
  executionAuthoritySchema,
  executionAuthorityRules,
  executionAuthorityState: {
    realExecutionAuthorityFileAdopted: false,
    discoveredExecutionAuthorities: 0,
    mutationPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-execution-authority',
  },
  readiness: {
    requiredFieldsSatisfied,
    executionAuthorityRecordTypes: Object.keys(executionAuthoritySchema).length,
    thinSliceReadinessRequired: true,
    operatorApprovalRequired: true,
    baselineSnapshotRequired: true,
    exactTargetScopeRequired: true,
    rollbackProofRequired: true,
    dirtyBaselineBlocksPreflight: true,
    authorityAndExecutionSeparate: true,
    mutationPreflightAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForMutationPreflightStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-request-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-request-status.mjs',
    reason:
      'The execution authority contract is now modeled as read-only; the next safe slice should define mutation preflight gates before any source mutation or remediation execution can act.',
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
