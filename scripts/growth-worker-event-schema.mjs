import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-worker-event-schema' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/01_decision-log.md',
  'docs/13_harness-baseline.md',
  'docs/18_growth-gateway-vnext.md',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-proposal-queue-status.mjs',
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

const EVENT_TYPES = [
  'worker.requested',
  'worker.started',
  'worker.input_loaded',
  'worker.stage_started',
  'worker.stage_completed',
  'worker.stage_failed',
  'worker.awaiting_approval',
  'worker.awaiting_decision',
  'worker.report_emitted',
  'worker.status_checked',
  'worker.projection_recorded',
  'worker.negative_evidence_recorded',
  'worker.completed',
  'worker.blocked',
  'worker.failed',
  'worker.cancelled',
];

const STATUS_VALUES = [
  'requested',
  'queued',
  'running',
  'waiting_approval',
  'waiting_decision',
  'blocked',
  'completed',
  'failed',
  'cancelled',
  'skipped',
];

const EVIDENCE_TYPES = [
  'claim',
  'evidence',
  'negative-evidence',
  'field-delta',
  'projection',
  'lifecycle-event',
  'operator-approved',
  'checked-absent',
  'redacted',
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

const schemas = {
  baseEvent: fields(
    [
      'schemaVersion',
      'eventId',
      'eventType',
      'observedAt',
      'source',
      'workerId',
      'status',
      'evidenceType',
      'trace',
    ],
    [
      'projectId',
      'taskId',
      'runId',
      'stageId',
      'claimId',
      'approvalId',
      'decisionId',
      'artifactRefs',
      'runtimeRefs',
      'redactionState',
      'operatorActionAllowed',
    ],
  ),
  runRecord: fields(
    [
      'runId',
      'projectId',
      'taskId',
      'workerId',
      'role',
      'status',
      'startedAt',
      'finishedAt',
      'eventRefs',
      'artifactRefs',
      'approvalRefs',
      'decisionRefs',
    ],
    ['failureClass', 'blockedReason', 'reviewStatus', 'allowedNextAction'],
  ),
  stageRecord: fields(
    [
      'stageId',
      'runId',
      'stageName',
      'status',
      'startedAt',
      'finishedAt',
      'inputRefs',
      'outputRefs',
    ],
    ['error', 'durationMs', 'retryCount', 'fallbackUsed'],
  ),
  reportRecord: fields(
    [
      'reportId',
      'workerId',
      'generatedAt',
      'summary',
      'claims',
      'evidence',
      'negativeEvidence',
      'fieldDeltas',
      'projections',
      'verificationRefs',
      'allowedNextAction',
    ],
    ['acceptedRisks', 'blockedReasons', 'proposalRefs'],
  ),
  statusCheckRecord: fields(
    ['checkId', 'command', 'status', 'exitCode', 'startedAt', 'finishedAt', 'stdoutDigest', 'stderrDigest'],
    ['logPath', 'artifactRefs', 'failureClass', 'durationMs'],
  ),
  negativeEvidenceRecord: fields(
    ['claimId', 'checkedField', 'checkedAt', 'result', 'source', 'reason'],
    ['redactionState', 'artifactRefs', 'operatorDecisionRef'],
  ),
  projectionRecord: fields(
    ['projectionId', 'sourceRepo', 'sourcePattern', 'importedAs', 'downgradedTo', 'decisionRef'],
    ['prohibitedBehaviors', 'allowedScope', 'expiryCondition'],
  ),
};

function buildValidationRules() {
  return [
    {
      id: 'event-type-allowlist',
      rule: 'eventType must be one of EVENT_TYPES; unknown events are rejected by consumers',
    },
    {
      id: 'status-allowlist',
      rule: 'status must be one of STATUS_VALUES; prose-only state is not machine truth',
    },
    {
      id: 'negative-evidence-required',
      rule: 'absence claims must use negativeEvidenceRecord or checked-absent evidence, not vague prose',
    },
    {
      id: 'projection-downgrade-required',
      rule: 'external repo patterns must record sourceRepo, importedAs, downgradedTo, and prohibitedBehaviors',
    },
    {
      id: 'operator-authority-separated',
      rule: 'operatorActionAllowed is never implied by event status; approval/decision records remain separate gates',
    },
    {
      id: 'redaction-explicit',
      rule: 'redacted or omitted fields must carry redactionState so consumers do not infer hidden truth',
    },
    {
      id: 'no-runtime-mutation',
      rule: 'this schema is a read-only vocabulary and does not execute workers, providers, dogfood, commits, or pushes',
    },
  ];
}

function buildConsumerBoundaries() {
  return [
    'Gateway surfaces may display worker state but must not treat it as permission to execute.',
    'Reflection may score events but must not apply proposals or mutate source.',
    'Worker completion is not task completion; review and approval gates remain authoritative.',
    'Projection records may cite external repos only as source-only discipline signals.',
    'Memory promotion still requires redaction, review, applicability, and verification commands.',
  ];
}

function summarizeSources(sources) {
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const reflection = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    workerSchemaDocumented: /growth-worker-event-schema/.test(plan),
    reflectionEvaluatorImplemented: /mode: 'growth-reflection-evaluator'/.test(reflection),
    proposalQueueStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-proposal-queue-status.mjs'),
    ),
    proposalQueueStatusDocumented: /Fourth Implemented Slice: `growth-proposal-queue-status`/.test(plan),
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
    referenceRepoRecheckPresent: /Reference Repo Recheck \(2026-06-01\)/.test(plan),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    harnessConformanceMentioned: /execution\/status\/artifact conformance|artifact\s+conformance/.test(
      harnessBaseline,
    ),
    ledgerMentionsWorkerSchema: /growth-worker-event-schema/.test(todo),
  };
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredSchemaCount = Object.keys(schemas).length;
const requiredFieldsSatisfied = Object.values(schemas).every((schema) => schema.required.length > 0);
const proposalQueueStatusImplemented =
  sourceSummary.proposalQueueStatusScriptPresent && sourceSummary.proposalQueueStatusDocumented;
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
const acceptedImprovementRegistryStatusImplemented =
  sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
  sourceSummary.acceptedImprovementRegistryStatusDocumented;
const regressionWatchStatusImplemented =
  sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented;
const rollbackReviewStatusImplemented =
  sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented;
const remediationPlanStatusImplemented =
  sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented;
const ok =
  missingSources.length === 0 &&
  sourceSummary.workerSchemaDocumented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.referenceRepoRecheckPresent &&
  sourceSummary.decisionAccepted &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-worker-event-schema',
  posture: 'local-read-only-worker-event-vocabulary',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-worker-event-schema/v0',
  sourceSummary,
  vocabulary: {
    eventTypes: EVENT_TYPES,
    statusValues: STATUS_VALUES,
    evidenceTypes: EVIDENCE_TYPES,
  },
  schemas,
  validationRules: buildValidationRules(),
  consumerBoundaries: buildConsumerBoundaries(),
  readiness: {
    schemaRecordTypes: requiredSchemaCount,
    requiredFieldsSatisfied,
    proposalGenerationAllowed: false,
    workerAutomationAllowed: false,
    gatewayActionAllowedFromEvents: false,
    proposalQueueStatusImplemented,
    skillMemoryRegistryStatusImplemented,
    gatewaySurfaceRouterStatusImplemented,
    continuousDevelopmentLoopStatusImplemented,
    improvementAcceptanceStatusImplemented,
    acceptedImprovementRegistryStatusImplemented,
    regressionWatchStatusImplemented,
    rollbackReviewStatusImplemented,
    remediationPlanStatusImplemented,
  },
  nextRecommendedSlice: proposalQueueStatusImplemented
    ? skillMemoryRegistryStatusImplemented
      ? gatewaySurfaceRouterStatusImplemented
        ? continuousDevelopmentLoopStatusImplemented
          ? improvementAcceptanceStatusImplemented
            ? acceptedImprovementRegistryStatusImplemented
              ? regressionWatchStatusImplemented
                ? rollbackReviewStatusImplemented
                  ? remediationPlanStatusImplemented
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
            'Gateway surface routing is now modeled as read-only; the next safe slice should compose growth evidence into a continuous development loop without automation.',
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
          'Proposal queue readiness is now modeled as read-only; the next safe slice should define skill/memory registry status without persisting memory.',
        mustRemainReadOnly: true,
      }
    : {
        id: 'growth-proposal-queue-status',
        commandToAdd: 'node scripts/growth-proposal-queue-status.mjs',
        reason:
          'Worker event vocabulary is now defined; the next safe slice should model proposal queue readiness without applying proposals.',
        mustRemainReadOnly: true,
      },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteDogfood: true,
    doesNotCallProviders: true,
    doesNotOpenExternalChannels: true,
    doesNotCommit: true,
    doesNotPush: true,
    doesNotAuthorizeGatewayActions: true,
  },
  failures: {
    missingSources,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
