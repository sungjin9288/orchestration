import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-proposal-queue-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/01_decision-log.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'scripts/growth-worker-event-schema.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-skill-memory-registry-status.mjs',
  'scripts/growth-gateway-surface-router-status.mjs',
  'scripts/growth-continuous-development-loop-status.mjs',
  'scripts/growth-improvement-acceptance-status.mjs',
  'scripts/growth-accepted-improvement-registry-status.mjs',
  'scripts/growth-regression-watch-status.mjs',
  'scripts/growth-rollback-review-status.mjs',
  'scripts/growth-remediation-plan-status.mjs',
  'scripts/growth-remediation-approval-status.mjs',
  'scripts/growth-remediation-implementation-proposal-status.mjs',
  'tasks/todo.md',
];

const PROPOSAL_TYPES = [
  'documentation',
  'smoke-guard',
  'ui-copy',
  'runtime-contract',
  'skill-memory',
  'gateway-routing',
];

const PROPOSAL_STATUSES = [
  'candidate',
  'needs-evidence',
  'ready-for-review',
  'waiting-approval',
  'approved-for-implementation',
  'rejected',
  'deferred',
];

const RISK_CLASSES = ['docs-only', 'smoke-only', 'ui-only', 'runtime-sensitive', 'architecture-sensitive'];

const REQUIRED_EVIDENCE_TYPES = [
  'reflection-finding',
  'worker-event',
  'status-check',
  'source-file',
  'negative-evidence',
  'field-delta',
  'projection-record',
  'verification-command',
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
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const completionReadiness = sourceText(sources, 'docs/17_v1-completion-readiness.md');
  const workerSchema = sourceText(sources, 'scripts/growth-worker-event-schema.mjs');
  const reflectionEvaluator = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    proposalQueueDocumented: /Fourth Implemented Slice: `growth-proposal-queue-status`/.test(plan),
    workerEventSchemaImplemented: /mode: 'growth-worker-event-schema'/.test(workerSchema),
    reflectionEvaluatorImplemented: /mode: 'growth-reflection-evaluator'/.test(reflectionEvaluator),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    harnessMentionsProposalQueue: /growth-proposal-queue-status/.test(harnessBaseline),
    completionReadinessMentionsProposalQueue: /growth-proposal-queue-status/.test(completionReadiness),
    ledgerMentionsProposalQueue: /growth-proposal-queue-status-readonly-post-m7-811/.test(todo),
    skillMemoryRegistryStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-skill-memory-registry-status.mjs'),
    ),
    skillMemoryRegistryStatusDocumented:
      /Fifth Implemented Slice: `growth-skill-memory-registry-status`/.test(plan),
    gatewaySurfaceRouterStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-gateway-surface-router-status.mjs'),
    ),
    gatewaySurfaceRouterStatusDocumented:
      /Sixth Implemented Slice: `growth-gateway-surface-router-status`/.test(plan),
    continuousDevelopmentLoopStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-continuous-development-loop-status.mjs'),
    ),
    continuousDevelopmentLoopStatusDocumented:
      /Seventh Implemented Slice: `growth-continuous-development-loop-status`/.test(plan),
    improvementAcceptanceStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-improvement-acceptance-status.mjs'),
    ),
    improvementAcceptanceStatusDocumented:
      /Eighth Implemented Slice: `growth-improvement-acceptance-status`/.test(plan),
    acceptedImprovementRegistryStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-accepted-improvement-registry-status.mjs'),
    ),
    acceptedImprovementRegistryStatusDocumented:
      /Ninth Implemented Slice: `growth-accepted-improvement-registry-status`/.test(plan),
    regressionWatchNextDocumented: /growth-regression-watch-status/.test(plan),
    regressionWatchStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-regression-watch-status.mjs'),
    ),
    regressionWatchStatusDocumented:
      /Tenth Implemented Slice: `growth-regression-watch-status`/.test(plan),
    rollbackReviewNextDocumented: /growth-rollback-review-status/.test(plan),
    rollbackReviewStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-rollback-review-status.mjs'),
    ),
    rollbackReviewStatusDocumented:
      /Eleventh Implemented Slice: `growth-rollback-review-status`/.test(plan),
    remediationPlanNextDocumented: /growth-remediation-plan-status/.test(plan),
    remediationPlanStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-plan-status.mjs'),
    ),
    remediationPlanStatusDocumented:
      /Twelfth Implemented Slice: `growth-remediation-plan-status`/.test(plan),
    remediationApprovalNextDocumented: /growth-remediation-approval-status/.test(plan),
    remediationApprovalStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-approval-status.mjs'),
    ),
    remediationApprovalStatusDocumented:
      /Thirteenth Implemented Slice: `growth-remediation-approval-status`/.test(plan),
    implementationProposalNextDocumented:
      /growth-remediation-implementation-proposal-status/.test(plan),
    implementationProposalStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-implementation-proposal-status.mjs'),
    ),
    implementationProposalStatusDocumented:
      /Fourteenth Implemented Slice: `growth-remediation-implementation-proposal-status`/.test(
        plan,
      ),
    implementationReviewNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
  };
}

const proposalSchema = {
  proposalRecord: fields(
    [
      'proposalId',
      'title',
      'proposalType',
      'status',
      'createdAt',
      'sourceClaimIds',
      'evidenceRefs',
      'negativeEvidenceRefs',
      'affectedFiles',
      'riskClass',
      'approvalGate',
      'reviewQuestion',
      'verificationPlan',
      'applyAllowed',
    ],
    [
      'operatorDecisionRef',
      'implementationSliceId',
      'expectedUserImpact',
      'rollbackPlan',
      'expiresAt',
      'deferredReason',
    ],
  ),
  evidenceRef: fields(
    ['evidenceId', 'evidenceType', 'source', 'observedAt', 'claim'],
    ['command', 'exitCode', 'artifactRef', 'redactionState'],
  ),
  approvalGate: fields(
    ['gateId', 'requiredBefore', 'requiredActor', 'approvalPhrase', 'blockedActions'],
    ['decisionLogRef', 'taskLedgerRef'],
  ),
  verificationPlan: fields(
    ['commands', 'expectedSignals', 'failureStopCondition'],
    ['focusedSmokes', 'aggregateChecks', 'manualReviewNotes'],
  ),
};

function buildQueueRules() {
  return [
    {
      id: 'proposal-must-not-apply-itself',
      rule: 'proposal records may describe a candidate slice but cannot write files, mutate runtime, or execute implementation',
    },
    {
      id: 'explicit-approval-before-implementation',
      rule: 'applyAllowed stays false until the operator grants explicit approval for the concrete implementation slice',
    },
    {
      id: 'evidence-before-review',
      rule: 'ready-for-review proposals must include reflection, worker event/schema, source-file, negative-evidence, and verification-command references',
    },
    {
      id: 'risk-class-drives-gate',
      rule: 'runtime-sensitive and architecture-sensitive proposals require source-of-truth review before implementation',
    },
    {
      id: 'repo-relative-sources-only',
      rule: 'affectedFiles and evidence sources must be repo-relative unless explicitly marked as external source-only reference material',
    },
    {
      id: 'no-hidden-priority',
      rule: 'queue order is advisory and cannot override approval, review, verification, or task ledger gates',
    },
  ];
}

function buildCandidateTemplates() {
  return [
    {
      id: 'docs-boundary-clarification',
      proposalType: 'documentation',
      defaultRiskClass: 'docs-only',
      requiredEvidenceTypes: ['source-file', 'negative-evidence', 'verification-command'],
      applyAllowed: false,
    },
    {
      id: 'smoke-regression-guard',
      proposalType: 'smoke-guard',
      defaultRiskClass: 'smoke-only',
      requiredEvidenceTypes: ['reflection-finding', 'status-check', 'verification-command'],
      applyAllowed: false,
    },
    {
      id: 'runtime-contract-review',
      proposalType: 'runtime-contract',
      defaultRiskClass: 'runtime-sensitive',
      requiredEvidenceTypes: [
        'reflection-finding',
        'worker-event',
        'source-file',
        'negative-evidence',
        'verification-command',
      ],
      applyAllowed: false,
    },
    {
      id: 'skill-memory-promotion-review',
      proposalType: 'skill-memory',
      defaultRiskClass: 'architecture-sensitive',
      requiredEvidenceTypes: [
        'reflection-finding',
        'source-file',
        'negative-evidence',
        'projection-record',
        'verification-command',
      ],
      applyAllowed: false,
    },
  ];
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(proposalSchema).every((schema) => schema.required.length > 0);
const skillMemoryRegistryStatusImplemented =
  sourceSummary.skillMemoryRegistryStatusScriptPresent && sourceSummary.skillMemoryRegistryStatusDocumented;
const gatewaySurfaceRouterStatusImplemented =
  sourceSummary.gatewaySurfaceRouterStatusScriptPresent && sourceSummary.gatewaySurfaceRouterStatusDocumented;
const continuousDevelopmentLoopStatusImplemented =
  sourceSummary.continuousDevelopmentLoopStatusScriptPresent &&
  sourceSummary.continuousDevelopmentLoopStatusDocumented;
const improvementAcceptanceStatusImplemented =
  sourceSummary.improvementAcceptanceStatusScriptPresent &&
  sourceSummary.improvementAcceptanceStatusDocumented;
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.proposalQueueDocumented &&
  sourceSummary.workerEventSchemaImplemented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.harnessMentionsProposalQueue &&
  sourceSummary.completionReadinessMentionsProposalQueue &&
  sourceSummary.ledgerMentionsProposalQueue &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-proposal-queue-status',
  posture: 'local-read-only-proposal-queue-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-proposal-queue-status/v0',
  sourceSummary,
  vocabulary: {
    proposalTypes: PROPOSAL_TYPES,
    proposalStatuses: PROPOSAL_STATUSES,
    riskClasses: RISK_CLASSES,
    requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
  },
  proposalSchema,
  queueRules: buildQueueRules(),
  candidateTemplates: buildCandidateTemplates(),
  queueState: {
    realQueueFileAdopted: false,
    discoveredProposalRecords: 0,
    queueMutationAllowed: false,
    implementationFromQueueAllowed: false,
  },
  readiness: {
    proposalRecordTypes: Object.keys(proposalSchema).length,
    requiredFieldsSatisfied,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    proposalQueueMutationAllowed: false,
    requiresHumanApproval: true,
    readyForHumanReviewContract: true,
  },
  nextRecommendedSlice: skillMemoryRegistryStatusImplemented
    ? gatewaySurfaceRouterStatusImplemented
      ? continuousDevelopmentLoopStatusImplemented
        ? improvementAcceptanceStatusImplemented
          ? sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
            sourceSummary.acceptedImprovementRegistryStatusDocumented
            ? sourceSummary.regressionWatchStatusScriptPresent &&
              sourceSummary.regressionWatchStatusDocumented
              ? sourceSummary.rollbackReviewStatusScriptPresent &&
                sourceSummary.rollbackReviewStatusDocumented
                ? sourceSummary.remediationPlanStatusScriptPresent &&
                  sourceSummary.remediationPlanStatusDocumented
                  ? sourceSummary.remediationApprovalStatusScriptPresent &&
                    sourceSummary.remediationApprovalStatusDocumented
                    ? sourceSummary.implementationProposalStatusScriptPresent &&
                      sourceSummary.implementationProposalStatusDocumented
                      ? {
                          id: 'growth-remediation-source-mutation-request-status',
                          commandToAdd:
                            'node scripts/growth-remediation-source-mutation-request-status.mjs',
                          reason:
                            'The implementation proposal contract is now modeled as read-only; the next safe slice should define review gates before any thin implementation slice can mutate source or execute remediation.',
                          mustRemainReadOnly: true,
                        }
                      : {
                          id: 'growth-remediation-implementation-proposal-status',
                          commandToAdd:
                            'node scripts/growth-remediation-implementation-proposal-status.mjs',
                          reason:
                            'The remediation approval contract is now modeled as read-only; the next safe slice should define implementation proposal fields without generating proposals, mutating source, or executing remediation.',
                          mustRemainReadOnly: true,
                        }
                  : {
                        id: 'growth-remediation-approval-status',
                        commandToAdd: 'node scripts/growth-remediation-approval-status.mjs',
                        reason:
                          'The remediation plan contract is now modeled as read-only; the next safe slice should define approval gates before implementation proposals or remediation execution can act.',
                        mustRemainReadOnly: true,
                      }
                  : {
                      id: 'growth-remediation-plan-status',
                      commandToAdd: 'node scripts/growth-remediation-plan-status.mjs',
                      reason:
                        'The rollback review contract is now modeled as read-only; the next safe slice should define remediation plan fields without executing remediation or mutating accepted records.',
                      mustRemainReadOnly: true,
                    }
                : {
                    id: 'growth-rollback-review-status',
                    commandToAdd: 'node scripts/growth-rollback-review-status.mjs',
                    reason:
                      'The regression watch contract is now modeled as read-only; the next safe slice should define rollback review states without executing rollback or remediation.',
                    mustRemainReadOnly: true,
                  }
              : {
                  id: 'growth-regression-watch-status',
                  commandToAdd: 'node scripts/growth-regression-watch-status.mjs',
                  reason:
                    'The accepted improvement registry is now modeled as read-only; the next safe slice should define post-acceptance regression watch signals without remediation.',
                  mustRemainReadOnly: true,
                }
            : {
                id: 'growth-accepted-improvement-registry-status',
                commandToAdd: 'node scripts/growth-accepted-improvement-registry-status.mjs',
                reason:
                  'The improvement acceptance contract is now modeled as read-only; the next safe slice should define accepted improvement registry records without applying improvements.',
                mustRemainReadOnly: true,
              }
          : {
        id: 'growth-improvement-acceptance-status',
        commandToAdd: 'node scripts/growth-improvement-acceptance-status.mjs',
        reason:
          'The continuous development loop is now modeled as read-only; the next safe slice should define acceptance criteria before improvements are adopted.',
        mustRemainReadOnly: true,
      }
        : {
        id: 'growth-continuous-development-loop-status',
        commandToAdd: 'node scripts/growth-continuous-development-loop-status.mjs',
        reason:
          'Gateway surface routing is now modeled as read-only; the next safe slice should compose proposal, registry, and routing states into a continuous development loop without automation.',
        mustRemainReadOnly: true,
      }
      : {
        id: 'growth-gateway-surface-router-status',
        commandToAdd: 'node scripts/growth-gateway-surface-router-status.mjs',
        reason:
          'Skill and memory registry readiness is now modeled as read-only; the next safe slice should route growth state into gateway surfaces without adding channels.',
        mustRemainReadOnly: true,
      }
    : {
        id: 'growth-skill-memory-registry-status',
        commandToAdd: 'node scripts/growth-skill-memory-registry-status.mjs',
        reason:
          'Proposal readiness is now modeled as a read-only contract; the next safe slice should define skill/memory registry status without persisting memory.',
        mustRemainReadOnly: true,
      },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotCallProviders: true,
    doesNotOpenExternalChannels: true,
    doesNotGenerateProposals: true,
    doesNotApplyProposals: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
