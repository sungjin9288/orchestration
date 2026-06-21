import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-draft-status',
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
  'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-draft-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_DRAFT_STATES = [
  'source-mutation-draft-not-created',
  'source-mutation-draft-review-ready',
  'source-mutation-draft-blocked',
  'source-mutation-draft-ready-for-draft-review',
  'source-mutation-draft-rejected',
  'source-mutation-draft-deferred',
  'needs-current-application-preflight',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-expected-change-set',
  'needs-file-update-plan',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-command-set',
  'needs-dry-run-proof',
  'needs-restore-plan',
  'needs-rollback-plan',
  'stale-draft-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_DRAFT_DECISION_TYPES = [
  'approve-source-mutation-draft-review-readiness',
  'request-current-application-preflight',
  'request-target-lock',
  'request-clean-baseline-proof',
  'request-expected-change-set',
  'request-file-update-plan',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-command-set',
  'request-dry-run-proof',
  'request-restore-plan',
  'request-rollback-plan',
  'reject-source-mutation-draft',
  'defer-source-mutation-draft',
  'hold-baseline',
];

const SOURCE_MUTATION_DRAFT_EVIDENCE_TYPES = [
  'source-mutation-application-preflight-record',
  'source-mutation-authorization-record',
  'source-mutation-request-record',
  'target-lock',
  'baseline-digest',
  'dirty-state-proof',
  'untracked-state-proof',
  'expected-change-set',
  'file-update-plan',
  'patch-draft',
  'diff-preview',
  'verification-command-set',
  'dry-run-proof',
  'restore-plan',
  'rollback-plan',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_DRAFT_BLOCKER_TYPES = [
  'application-preflight-missing',
  'application-preflight-stale',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'dirty-baseline',
  'untracked-baseline',
  'source-of-truth-drift',
  'expected-change-set-missing',
  'expected-change-set-drift',
  'file-update-plan-missing',
  'file-update-plan-drift',
  'patch-draft-missing',
  'diff-preview-missing',
  'verification-command-set-missing',
  'verification-command-set-drift',
  'dry-run-proof-missing',
  'restore-plan-missing',
  'rollback-plan-missing',
  'negative-evidence-unresolved',
  'draft-scope-too-broad',
  'draft-touches-unapproved-file',
  'draft-mutates-source',
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
  const sourceMutationAuthorization = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-authorization-status.mjs',
  );
  const sourceMutationApplicationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  );
  const sourceMutationDraft = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationApplicationPreflightDocumented:
      /Twenty-first Implemented Slice: `growth-remediation-source-mutation-application-preflight-status`/.test(
        plan,
      ),
    sourceMutationDraftDocumented:
      /Twenty-second Implemented Slice: `growth-remediation-source-mutation-draft-status`/.test(
        plan,
      ),
    sourceMutationAuthorizationImplemented:
      /mode: 'growth-remediation-source-mutation-authorization-status'/.test(
        sourceMutationAuthorization,
      ),
    sourceMutationApplicationPreflightImplemented:
      /mode: 'growth-remediation-source-mutation-application-preflight-status'/.test(
        sourceMutationApplicationPreflight,
      ),
    sourceMutationDraftImplemented:
      /mode: 'growth-remediation-source-mutation-draft-status'/.test(sourceMutationDraft),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationDraft:
      /growth-remediation-source-mutation-draft-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationDraft:
      /growth-remediation-source-mutation-draft-status/.test(completionReadiness),
    ledgerMentionsSourceMutationDraft:
      /growth-remediation-source-mutation-draft-status-readonly-post-m7-829/.test(todo),
    verificationIncludesSourceMutationDraft:
      /growth-remediation-source-mutation-draft-status/.test(verificationStatus),
    sourceMutationDraftReviewNextDocumented:
      /growth-remediation-source-mutation-draft-review-status/.test(plan),
    currentApplicationPreflightDocumented: /current application preflight record/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    expectedChangeSetDocumented: /expected changed-file set/.test(plan),
    fileUpdatePlanDocumented: /file-update plan/.test(plan),
    patchDraftDocumented: /patch draft/.test(plan),
    diffPreviewDocumented: /diff preview/.test(plan),
    verificationCommandSetDocumented: /verification command set/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    restorePlanDocumented: /restore plan/.test(plan),
    rollbackPlanDocumented: /rollback plan/.test(plan),
    draftReviewDocumented: /draft review/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationDraftSchema = {
  sourceMutationDraftRecord: fields(
    [
      'draftId',
      'applicationPreflightId',
      'authorizationId',
      'requestId',
      'state',
      'decisionType',
      'targetLockRefs',
      'baselineDigestRefs',
      'dirtyStateProofRefs',
      'untrackedStateProofRefs',
      'expectedChangeSetRefs',
      'fileUpdatePlanRefs',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationCommandSetRefs',
      'dryRunProofRefs',
      'restorePlanRefs',
      'rollbackPlanRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'draftReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationDraftDecision: fields(
    [
      'decisionId',
      'draftId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'draftReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationDraftBlocker: fields(
    [
      'blockerId',
      'draftId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksDraftReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationDraftIndex: fields(
    ['indexId', 'draftRefs', 'stateCounts', 'decisionCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const sourceMutationDraftRules = [
  {
    id: 'draft-requires-current-application-preflight',
    rule: 'source mutation draft readiness can only bind to one current application preflight and its exact authorization/request chain',
  },
  {
    id: 'draft-is-not-source-mutation',
    rule: 'source mutation draft status may mark draft-review readiness, but it cannot mutate source, apply proposals, or execute remediation',
  },
  {
    id: 'draft-requires-file-plan-patch-and-diff-preview',
    rule: 'file-update plan, patch draft, and diff preview refs must be present before draft review readiness can be considered',
  },
  {
    id: 'draft-requires-dry-run-restore-rollback-and-verification',
    rule: 'dry-run proof, verification command set, restore plan, and rollback plan must be present before draft review readiness can be considered',
  },
  {
    id: 'stale-broad-or-unapproved-draft-blocks-review',
    rule: 'stale application preflight, dirty baseline, source-of-truth drift, unapproved file touches, broad draft scope, missing dry-run proof, or any source mutation attempt blocks draft review readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationDraftSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationApplicationPreflightDocumented &&
  sourceSummary.sourceMutationDraftDocumented &&
  sourceSummary.sourceMutationAuthorizationImplemented &&
  sourceSummary.sourceMutationApplicationPreflightImplemented &&
  sourceSummary.sourceMutationDraftImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationDraft &&
  sourceSummary.completionReadinessMentionsSourceMutationDraft &&
  sourceSummary.ledgerMentionsSourceMutationDraft &&
  sourceSummary.verificationIncludesSourceMutationDraft &&
  sourceSummary.sourceMutationDraftReviewNextDocumented &&
  sourceSummary.currentApplicationPreflightDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.expectedChangeSetDocumented &&
  sourceSummary.fileUpdatePlanDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationCommandSetDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.restorePlanDocumented &&
  sourceSummary.rollbackPlanDocumented &&
  sourceSummary.draftReviewDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-draft-status',
  posture: 'local-read-only-remediation-source-mutation-draft-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-draft-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationDraftStates: SOURCE_MUTATION_DRAFT_STATES,
    sourceMutationDraftDecisionTypes: SOURCE_MUTATION_DRAFT_DECISION_TYPES,
    sourceMutationDraftEvidenceTypes: SOURCE_MUTATION_DRAFT_EVIDENCE_TYPES,
    sourceMutationDraftBlockerTypes: SOURCE_MUTATION_DRAFT_BLOCKER_TYPES,
  },
  sourceMutationDraftSchema,
  sourceMutationDraftRules,
  sourceMutationDraftState: {
    realSourceMutationDraftFileAdopted: false,
    discoveredSourceMutationDrafts: 0,
    draftReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-draft',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationDraftRecordTypes: Object.keys(sourceMutationDraftSchema).length,
    currentApplicationPreflightRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    cleanBaselineProofRequired: true,
    expectedChangeSetRequired: true,
    fileUpdatePlanRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationCommandSetRequired: true,
    dryRunProofRequired: true,
    restorePlanRequired: true,
    rollbackPlanRequired: true,
    draftAndMutationSeparate: true,
    draftReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationDraftReviewStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-draft-review-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-draft-review-status.mjs',
    reason:
      'Source mutation draft readiness is now modeled as read-only; the next safe slice should define draft review gates before any source mutation or remediation execution can act.',
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
