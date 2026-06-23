import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const varRoot = path.join(repoRoot, 'var');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-evidence-ledger-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/21_completion-development-roadmap.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-status.mjs',
  'scripts/post-completion-next-step-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-worker-event-schema.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/verification_status.mjs',
];

const LEDGER_EVIDENCE_TYPES = [
  'lifecycle-event',
  'claim',
  'negative-evidence',
  'checked-absent',
  'field-delta',
  'run-outcome',
  'changed-file',
  'review-result',
  'approval-state',
  'failed-check',
  'operator-decision',
  'lesson-candidate',
  'artifact-ref',
  'log-ref',
  'projection',
  'redacted',
];

const LEDGER_SOURCE_BUCKETS = [
  {
    id: 'source-of-truth-docs',
    paths: [
      'AGENTS.md',
      'docs/18_growth-gateway-vnext.md',
      'docs/21_completion-development-roadmap.md',
      'docs/22_completion-gate-inventory.md',
    ],
    allowedUse: 'policy, roadmap, completion gate, and vNext routing claims',
  },
  {
    id: 'task-ledger',
    paths: ['tasks/todo.md', 'tasks/lessons.md'],
    allowedUse: 'completed task evidence, zero-open backlog proof, and lesson candidates',
  },
  {
    id: 'read-only-status-scripts',
    paths: [
      'scripts/growth-evidence-ledger-status.mjs',
      'scripts/post-completion-next-step-status.mjs',
      'scripts/growth-engine-status.mjs',
      'scripts/growth-reflection-evaluator.mjs',
      'scripts/growth-worker-event-schema.mjs',
      'scripts/growth-proposal-queue-status.mjs',
      'scripts/verification_status.mjs',
    ],
    allowedUse: 'machine-readable status, schema, reflection, proposal, and verification evidence',
  },
  {
    id: 'runtime-snapshots',
    paths: ['var/runtime*/state.json'],
    allowedUse: 'bounded local runtime counts and provenance refs only',
  },
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

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_error) {
    return null;
  }
}

function valuesOf(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === 'object') {
    return Object.values(value);
  }
  return [];
}

function listRuntimeStateFiles() {
  if (!fs.existsSync(varRoot)) {
    return [];
  }

  return fs
    .readdirSync(varRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('runtime'))
    .map((entry) => path.join(varRoot, entry.name, 'state.json'))
    .filter((statePath) => fs.existsSync(statePath))
    .map((statePath) => ({
      path: statePath,
      relativePath: path.relative(repoRoot, statePath),
      mtimeMs: fs.statSync(statePath).mtimeMs,
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs)
    .slice(0, 12);
}

function summarizeRuntimeState(entry) {
  const state = safeReadJson(entry.path) || {};
  const projects = valuesOf(state.projects);
  const tasks = valuesOf(state.tasks);
  const runs = valuesOf(state.runs);
  const artifacts = valuesOf(state.artifacts);
  const approvals = valuesOf(state.approvals);
  const decisions = valuesOf(state.decisionInboxItems);

  return {
    runtimeRoot: path.dirname(entry.relativePath),
    stateFile: entry.relativePath,
    updatedAt: new Date(entry.mtimeMs).toISOString(),
    counts: {
      projects: projects.length,
      tasks: tasks.length,
      runs: runs.length,
      artifacts: artifacts.length,
      approvals: approvals.length,
      decisionInboxItems: decisions.length,
    },
    evidenceFlags: {
      hasProjectPath: projects.some((project) => Boolean(project.project_path || project.projectPath)),
      hasReviewResult: tasks.some((task) => Boolean(task.review?.status)),
      hasApprovalState: approvals.length > 0,
      hasArtifactRefs: artifacts.length > 0,
      hasFailedChecks: runs.some((run) => run.status === 'failed'),
      hasOperatorDecision: decisions.some((decision) => decision.status === 'resolved'),
    },
  };
}

function summarizeSources(sources) {
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const roadmap = sourceText(sources, 'docs/21_completion-development-roadmap.md');
  const inventory = sourceText(sources, 'docs/22_completion-gate-inventory.md');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');
  const router = sourceText(sources, 'scripts/post-completion-next-step-status.mjs');
  const engine = sourceText(sources, 'scripts/growth-engine-status.mjs');
  const reflection = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');
  const workerSchema = sourceText(sources, 'scripts/growth-worker-event-schema.mjs');
  const proposalQueue = sourceText(sources, 'scripts/growth-proposal-queue-status.mjs');
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const uncheckedTaskCount = countMatches(todo, /^- \[ \]/gm);

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    zeroOpenBacklog: uncheckedTaskCount === 0,
    uncheckedTaskCount,
    completedTaskCount: countMatches(todo, /^- \[x\]/gm),
    lessonCount: countMatches(lessons, /^- /gm),
    growthEvidenceLedgerPlanned: /### Slice 1: Growth Evidence Ledger/.test(plan),
    growthEvidenceLedgerDocumented: /growth-evidence-ledger-status/.test(plan),
    completionInventoryClosed:
      /The current required completion baseline is closed for default implementation work\./.test(
        inventory,
      ) && /No default completion implementation slice remains open/.test(inventory),
    growthLoopReadinessDocumented:
      /Growth Loop Readiness/.test(roadmap) &&
      /Use Loop Engineering as a bounded operating model/.test(roadmap),
    postCompletionRouterDocumented:
      /Post-completion next-step router/.test(inventory) &&
      /post-completion-next-step-status/.test(router),
    engineRoutesToLedger: /nextRecommendedSlice[\s\S]*growth-evidence-ledger/.test(engine),
    reflectionRoutesToLedger: /nextRecommendedSlice[\s\S]*growth-evidence-ledger/.test(reflection),
    workerSchemaAvailable: /mode: 'growth-worker-event-schema'/.test(workerSchema),
    proposalQueueAvailable: /mode: 'growth-proposal-queue-status'/.test(proposalQueue),
    verificationIncludesLedger: /growth-evidence-ledger-status/.test(verificationStatus),
  };
}

function fields(required, optional = []) {
  return { required, optional };
}

const ledgerSchemas = {
  evidenceEntry: fields(
    [
      'entryId',
      'evidenceType',
      'observedAt',
      'sourcePath',
      'claim',
      'status',
      'confidence',
      'negativeEvidence',
      'refs',
    ],
    ['redactionState', 'fieldDelta', 'projection', 'operatorDecisionRef', 'artifactRefs', 'logRefs'],
  ),
  runtimeEvidenceRef: fields(
    ['runtimeRoot', 'stateFile', 'projectRefs', 'taskRefs', 'runRefs', 'artifactRefs'],
    ['approvalRefs', 'decisionRefs', 'reviewRefs', 'failedCheckRefs'],
  ),
  verificationEvidenceRef: fields(
    ['command', 'status', 'scope', 'checkedAt', 'required', 'blocking'],
    ['exitCode', 'stdoutDigest', 'stderrDigest', 'skippedReason'],
  ),
  lessonCandidate: fields(
    ['lessonId', 'sourcePath', 'claim', 'applicability', 'notApplicableWhen', 'verificationRef'],
    ['expiryCondition', 'promotionDecisionRef'],
  ),
};

function buildReadiness(sourceSummary) {
  const implemented =
    sourceSummary.zeroOpenBacklog &&
    sourceSummary.growthEvidenceLedgerPlanned &&
    sourceSummary.completionInventoryClosed &&
    sourceSummary.growthLoopReadinessDocumented &&
    sourceSummary.postCompletionRouterDocumented &&
    sourceSummary.engineRoutesToLedger &&
    sourceSummary.reflectionRoutesToLedger &&
    sourceSummary.workerSchemaAvailable &&
    sourceSummary.proposalQueueAvailable;

  return {
    implemented,
    ledgerStatusReady: implemented,
    reflectionHandoffAllowed: implemented,
    proposalGenerationAllowed: false,
    ledgerMutationAllowed: false,
    runtimeMutationAllowed: false,
    memoryPersistenceAllowed: false,
    providerCallsAllowed: false,
    gatewayExecutionAllowed: false,
  };
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const runtimeEvidence = listRuntimeStateFiles().map(summarizeRuntimeState);
const readiness = buildReadiness(sourceSummary);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const ok = readiness.ledgerStatusReady && missingSources.length === 0;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-status',
  posture: 'local-read-only-growth-evidence-ledger',
  schemaVersion: 'growth-evidence-ledger-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  ledgerVocabulary: {
    evidenceTypes: LEDGER_EVIDENCE_TYPES,
    sourceBuckets: LEDGER_SOURCE_BUCKETS,
  },
  ledgerSchemas,
  runtimeEvidence: {
    scannedRuntimeRoots: runtimeEvidence.length,
    summaries: runtimeEvidence,
  },
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-gateway-routing',
    commandToAdd: 'node scripts/growth-evidence-ledger-status.mjs && node scripts/growth-gateway-surface-router-status.mjs',
    reason:
      'The Growth Evidence Ledger status is now readable; the next safe read-only slice can map ledger status into gateway routing without mutating runtime, UI execution authority, memory, providers, source files, commits, or pushes.',
    mustRemainReadOnly: true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotCallProviders: true,
    doesNotPersistMemory: true,
    doesNotOpenExternalChannels: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
