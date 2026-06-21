import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-thin-slice-status',
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
  'scripts/growth-remediation-implementation-proposal-status.mjs',
  'scripts/growth-remediation-implementation-review-status.mjs',
  'scripts/growth-remediation-thin-slice-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const THIN_SLICE_STATES = [
  'thin-slice-not-started',
  'candidate-ready',
  'candidate-blocked',
  'scope-locked',
  'needs-exact-targets',
  'needs-verification-output',
  'needs-rollback-proof',
  'needs-execution-authority',
  'ready-for-execution-authority-review',
  'execution-authority-blocked',
  'changes-requested',
  'rejected',
  'deferred',
  'stale-review-blocked',
  'closed-no-action',
];

const THIN_SLICE_TARGET_TYPES = [
  'docs-only',
  'smoke-only',
  'task-ledger-only',
  'ui-copy-only',
  'runtime-guard-only',
  'source-of-truth-alignment',
  'verification-only',
];

const THIN_SLICE_EVIDENCE_TYPES = [
  'implementation-review-record',
  'implementation-proposal-record',
  'remediation-approval-record',
  'exact-file-target',
  'exact-surface-target',
  'verification-command',
  'verification-output',
  'rollback-proof',
  'reviewer-decision',
  'operator-authority',
  'negative-evidence',
  'source-of-truth-doc',
  'aggregate-verification',
];

const THIN_SLICE_BLOCKER_TYPES = [
  'review-missing',
  'review-not-approved',
  'target-scope-unclear',
  'target-scope-drift',
  'verification-output-missing',
  'rollback-proof-missing',
  'operator-authority-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'stale-review',
  'execution-boundary-missing',
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
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    implementationReviewDocumented:
      /Fifteenth Implemented Slice: `growth-remediation-implementation-review-status`/.test(plan),
    thinSliceDocumented:
      /Sixteenth Implemented Slice: `growth-remediation-thin-slice-status`/.test(plan),
    implementationReviewImplemented:
      /mode: 'growth-remediation-implementation-review-status'/.test(implementationReview),
    thinSliceImplemented: /mode: 'growth-remediation-thin-slice-status'/.test(thinSlice),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsThinSlice: /Thin-slice|thin-slice|vertical-slice/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsThinSlice: /growth-remediation-thin-slice-status/.test(harnessBaseline),
    completionReadinessMentionsThinSlice: /growth-remediation-thin-slice-status/.test(
      completionReadiness,
    ),
    ledgerMentionsThinSlice: /growth-remediation-thin-slice-status-readonly-post-m7-823/.test(
      todo,
    ),
    verificationIncludesThinSlice: /growth-remediation-thin-slice-status/.test(verificationStatus),
    mutationPreflightNextDocumented: /growth-remediation-source-mutation-request-status/.test(plan),
    exactTargetsDocumented: /exact file targets/.test(plan) && /exact surface targets/.test(plan),
    verificationOutputDocumented: /verification output/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    staleReviewDocumented: /stale review/.test(plan),
    negativeEvidenceDocumented: /negative evidence/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    mutationStillBlocked:
      /without applying proposals, mutating source, or executing remediation/.test(plan) ||
      /does not .*mutate source/.test(plan),
    executionStillBlocked:
      /without .*executing remediation/.test(plan) || /does not execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const thinSliceSchema = {
  thinSliceReadinessRecord: fields(
    [
      'thinSliceId',
      'reviewId',
      'proposalId',
      'state',
      'targetTypes',
      'exactFileTargets',
      'exactSurfaceTargets',
      'reviewerDecisionRefs',
      'verificationCommandRefs',
      'verificationOutputRefs',
      'rollbackProofRefs',
      'operatorAuthorityRefs',
      'sourceOfTruthRefs',
      'blockerRefs',
      'executionAuthorityRequired',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['riskClass', 'ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  thinSliceTarget: fields(
    [
      'targetId',
      'thinSliceId',
      'targetType',
      'pathOrSurfaceRef',
      'changeIntent',
      'allowedChangeTypes',
      'verificationOutputRefs',
      'rollbackProofRequired',
      'sourceMutationAllowed',
    ],
    ['riskClass', 'operatorNotes'],
  ),
  thinSliceBlocker: fields(
    [
      'blockerId',
      'thinSliceId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksExecutionAuthorityReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'reviewerNote'],
  ),
  thinSliceIndex: fields(
    ['indexId', 'thinSliceRefs', 'stateCounts', 'targetTypeCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const thinSliceRules = [
  {
    id: 'thin-slice-requires-approved-implementation-review',
    rule: 'thin-slice readiness starts from an approved implementation review and cannot bypass proposal, remediation approval, or rollback proof',
  },
  {
    id: 'thin-slice-readiness-is-not-execution-authority',
    rule: 'status output may define readiness fields, but it cannot apply proposals, mutate source, or execute remediation',
  },
  {
    id: 'exact-targets-required-before-authority',
    rule: 'each thin slice must carry exact file targets or exact surface targets before execution authority can be reviewed',
  },
  {
    id: 'verification-output-and-rollback-proof-required',
    rule: 'thin-slice readiness requires verification output and rollback proof, not only planned verification commands',
  },
  {
    id: 'stale-review-or-target-drift-blocks-authority',
    rule: 'stale review proof, target drift, source-of-truth drift, unresolved negative evidence, or missing operator authority blocks execution-authority review',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(thinSliceSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.implementationReviewDocumented &&
  sourceSummary.thinSliceDocumented &&
  sourceSummary.implementationReviewImplemented &&
  sourceSummary.thinSliceImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsThinSlice &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsThinSlice &&
  sourceSummary.completionReadinessMentionsThinSlice &&
  sourceSummary.ledgerMentionsThinSlice &&
  sourceSummary.verificationIncludesThinSlice &&
  sourceSummary.mutationPreflightNextDocumented &&
  sourceSummary.exactTargetsDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.staleReviewDocumented &&
  sourceSummary.negativeEvidenceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.mutationStillBlocked &&
  sourceSummary.executionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-thin-slice-status',
  posture: 'local-read-only-remediation-thin-slice-readiness-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-thin-slice-status/v0',
  sourceSummary,
  vocabulary: {
    thinSliceStates: THIN_SLICE_STATES,
    thinSliceTargetTypes: THIN_SLICE_TARGET_TYPES,
    thinSliceEvidenceTypes: THIN_SLICE_EVIDENCE_TYPES,
    thinSliceBlockerTypes: THIN_SLICE_BLOCKER_TYPES,
  },
  thinSliceSchema,
  thinSliceRules,
  thinSliceState: {
    realThinSliceFileAdopted: false,
    discoveredThinSlices: 0,
    thinSliceReadinessMutationAllowed: false,
    executionAuthorityGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-thin-slices',
  },
  readiness: {
    requiredFieldsSatisfied,
    thinSliceRecordTypes: Object.keys(thinSliceSchema).length,
    implementationReviewRequired: true,
    exactTargetsRequired: true,
    verificationOutputRequired: true,
    rollbackProofRequired: true,
    staleReviewBlocksAuthority: true,
    reviewAndExecutionAuthoritySeparate: true,
    thinSliceReadinessMutationAllowed: false,
    executionAuthorityGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForExecutionAuthorityStatus: true,
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
