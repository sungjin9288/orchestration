import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-skill-memory-registry-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/01_decision-log.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
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
  'tasks/lessons.md',
];

const MEMORY_CLASSES = [
  'session-local',
  'workspace-specific',
  'project-pattern',
  'reusable-skill-template',
  'rejected-raw-transcript',
];

const SKILL_CANDIDATE_TYPES = [
  'operator-workflow',
  'verification-guard',
  'failure-pattern',
  'repo-convention',
  'ui-copy-pattern',
  'provider-boundary',
  'dogfood-lifecycle',
];

const REGISTRY_STATUSES = [
  'observed',
  'candidate',
  'needs-redaction',
  'needs-applicability-rule',
  'ready-for-review',
  'waiting-approval',
  'approved-for-persistence',
  'rejected',
  'expired',
];

const REQUIRED_EVIDENCE_TYPES = [
  'lesson-entry',
  'proposal-record',
  'reflection-finding',
  'source-file',
  'negative-evidence',
  'redaction-review',
  'applicability-rule',
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

function countMatches(text, pattern) {
  return [...String(text || '').matchAll(pattern)].length;
}

function fields(required, optional = []) {
  return { required, optional };
}

function summarizeSources(sources) {
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const completionReadiness = sourceText(sources, 'docs/17_v1-completion-readiness.md');
  const proposalQueue = sourceText(sources, 'scripts/growth-proposal-queue-status.mjs');
  const reflectionEvaluator = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    skillMemoryRegistryDocumented: /Fifth Implemented Slice: `growth-skill-memory-registry-status`/.test(plan),
    proposalQueueImplemented: /mode: 'growth-proposal-queue-status'/.test(proposalQueue),
    reflectionEvaluatorImplemented: /mode: 'growth-reflection-evaluator'/.test(reflectionEvaluator),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    harnessMentionsSkillMemoryRegistry: /growth-skill-memory-registry-status/.test(harnessBaseline),
    completionReadinessMentionsSkillMemoryRegistry: /growth-skill-memory-registry-status/.test(
      completionReadiness,
    ),
    ledgerMentionsSkillMemoryRegistry: /growth-skill-memory-registry-status-readonly-post-m7-812/.test(
      todo,
    ),
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
    lessonEntries: countMatches(lessons, /^- /gm),
    redactionMentioned: /redaction/.test(plan) && /redaction/.test(proposalQueue),
    applicabilityMentioned: /applicability/.test(plan),
    globalMemoryBlocked: /Do not globalize memory/.test(plan),
  };
}

const registrySchema = {
  memoryCandidate: fields(
    [
      'memoryId',
      'title',
      'memoryClass',
      'status',
      'sourceRefs',
      'redactionState',
      'applicability',
      'expiry',
      'verificationPlan',
      'approvalGate',
      'persistAllowed',
    ],
    ['workspaceScope', 'operatorDecisionRef', 'rejectionReason', 'supersedesMemoryId'],
  ),
  skillCandidate: fields(
    [
      'skillId',
      'title',
      'skillCandidateType',
      'status',
      'sourceRefs',
      'applicabilityRule',
      'inputs',
      'outputs',
      'verificationCommands',
      'approvalGate',
      'promoteAllowed',
    ],
    ['relatedMemoryIds', 'failurePatterns', 'redactionState', 'expiry'],
  ),
  redactionRecord: fields(
    ['recordId', 'sourceRef', 'checkedAt', 'redactionState', 'removedFields', 'keptFields'],
    ['operatorDecisionRef', 'notes'],
  ),
  applicabilityRule: fields(
    ['ruleId', 'appliesWhen', 'doesNotApplyWhen', 'scope', 'verificationCommand'],
    ['examples', 'expiryCondition'],
  ),
  registryReview: fields(
    ['reviewId', 'subjectId', 'reviewQuestion', 'requiredEvidenceRefs', 'status', 'allowedNextAction'],
    ['acceptedRisks', 'operatorDecisionRef'],
  ),
};

function buildRegistryRules() {
  return [
    {
      id: 'raw-transcripts-rejected-by-default',
      rule: 'raw transcripts and broad chat logs are not registry material unless redacted and narrowed to a reviewed source reference',
    },
    {
      id: 'memory-scope-explicit',
      rule: 'memory candidates must declare session, workspace, project, reusable-skill, or rejected-raw-transcript class explicitly',
    },
    {
      id: 'applicability-before-reuse',
      rule: 'skill candidates require applies-when and does-not-apply-when rules before review',
    },
    {
      id: 'expiry-before-persistence',
      rule: 'registry candidates must describe expiry or supersession conditions before persistence can be approved',
    },
    {
      id: 'verification-before-promotion',
      rule: 'a memory or skill candidate cannot be promoted without at least one executable verification command',
    },
    {
      id: 'approval-before-persistence',
      rule: 'persistAllowed and promoteAllowed stay false until an explicit operator approval references the candidate',
    },
  ];
}

function buildCandidateTemplates() {
  return [
    {
      id: 'lesson-to-project-pattern',
      memoryClass: 'project-pattern',
      requiredEvidenceTypes: ['lesson-entry', 'source-file', 'verification-command'],
      persistAllowed: false,
    },
    {
      id: 'repeated-work-to-skill-template',
      memoryClass: 'reusable-skill-template',
      requiredEvidenceTypes: ['lesson-entry', 'proposal-record', 'applicability-rule', 'verification-command'],
      persistAllowed: false,
    },
    {
      id: 'failure-pattern-to-guard',
      skillCandidateType: 'failure-pattern',
      requiredEvidenceTypes: ['negative-evidence', 'reflection-finding', 'verification-command'],
      promoteAllowed: false,
    },
    {
      id: 'raw-transcript-rejection',
      memoryClass: 'rejected-raw-transcript',
      requiredEvidenceTypes: ['redaction-review', 'negative-evidence'],
      persistAllowed: false,
    },
  ];
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(registrySchema).every((schema) => schema.required.length > 0);
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
  sourceSummary.skillMemoryRegistryDocumented &&
  sourceSummary.proposalQueueImplemented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.harnessMentionsSkillMemoryRegistry &&
  sourceSummary.completionReadinessMentionsSkillMemoryRegistry &&
  sourceSummary.ledgerMentionsSkillMemoryRegistry &&
  sourceSummary.redactionMentioned &&
  sourceSummary.applicabilityMentioned &&
  sourceSummary.globalMemoryBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-skill-memory-registry-status',
  posture: 'local-read-only-skill-memory-registry-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-skill-memory-registry-status/v0',
  sourceSummary,
  vocabulary: {
    memoryClasses: MEMORY_CLASSES,
    skillCandidateTypes: SKILL_CANDIDATE_TYPES,
    registryStatuses: REGISTRY_STATUSES,
    requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
  },
  registrySchema,
  registryRules: buildRegistryRules(),
  candidateTemplates: buildCandidateTemplates(),
  registryState: {
    realRegistryFileAdopted: false,
    discoveredMemoryRecords: 0,
    discoveredSkillRecords: 0,
    registryMutationAllowed: false,
    persistenceAllowed: false,
    promotionAllowed: false,
  },
  readiness: {
    registryRecordTypes: Object.keys(registrySchema).length,
    requiredFieldsSatisfied,
    lessonsAvailableForReview: sourceSummary.lessonEntries > 0,
    memoryPersistenceAllowed: false,
    skillPromotionAllowed: false,
    globalMemoryAllowed: false,
    rawTranscriptIngestionAllowed: false,
    requiresHumanApproval: true,
    readyForRegistryReviewContract: true,
  },
  nextRecommendedSlice: gatewaySurfaceRouterStatusImplemented
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
          'Gateway surface routing is now modeled as read-only; the next safe slice should compose registry, routing, reflection, and proposal state into a continuous development loop without automation.',
        mustRemainReadOnly: true,
      }
    : {
        id: 'growth-gateway-surface-router-status',
        commandToAdd: 'node scripts/growth-gateway-surface-router-status.mjs',
        reason:
          'Skill and memory registry readiness is now modeled as read-only; the next safe slice should route growth state into gateway surfaces without adding channels.',
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
    doesNotPersistMemory: true,
    doesNotPromoteSkills: true,
    doesNotIngestRawTranscripts: true,
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
