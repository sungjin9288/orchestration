import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'loop-readiness-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/20_loop-engineering-concept-review.md',
  'packs/development/pack.md',
];

function readSource(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
}

function runGitOrNull(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_error) {
    return null;
  }
}

function hasAny(source, patterns) {
  return patterns.some((pattern) => pattern.test(source));
}

const sources = Object.fromEntries(SOURCE_FILES.map((relativePath) => [relativePath, readSource(relativePath)]));
const allSourceText = Object.values(sources).join('\n');
const loopConcept = sources['docs/20_loop-engineering-concept-review.md'];
const harnessBaseline = sources['docs/13_harness-baseline.md'];
const agents = sources['AGENTS.md'];
const developmentPack = sources['packs/development/pack.md'];

const readinessCriteria = [
  {
    id: 'goal',
    label: 'Goal',
    requiredEvidence: 'A proposed loop must name the concrete work outcome before execution starts.',
    evidenceRefs: ['AGENTS.md', 'docs/20_loop-engineering-concept-review.md'],
    passed:
      /explicit goal/i.test(loopConcept) &&
      /identify goal, context, constraints, and missing information/i.test(loopConcept),
  },
  {
    id: 'boundary',
    label: 'Boundary',
    requiredEvidence: 'A loop must preserve local-first, single-user-first, ops-first, and v1 development-pack scope.',
    evidenceRefs: ['AGENTS.md', 'docs/00_master-brief.md', 'packs/development/pack.md'],
    passed:
      /local-first/i.test(allSourceText) &&
      /single-user-first/i.test(allSourceText) &&
      /ops-first/i.test(allSourceText) &&
      /development pack/i.test(developmentPack + allSourceText),
  },
  {
    id: 'verification-gate',
    label: 'Verification Gate',
    requiredEvidence: 'A loop must state the smoke, lint, build, runtime, or aggregate check that controls continuation.',
    evidenceRefs: ['AGENTS.md', 'docs/20_loop-engineering-concept-review.md'],
    passed:
      /required synthetic gates/i.test(agents) &&
      /verification/i.test(loopConcept) &&
      /stop\/go condition|control point/i.test(loopConcept),
  },
  {
    id: 'stop-condition',
    label: 'Stop Condition',
    requiredEvidence: 'A loop must define complete, blocked, failed, rollback, or waiting-on-approval states.',
    evidenceRefs: ['AGENTS.md', 'docs/20_loop-engineering-concept-review.md'],
    passed:
      /complete, blocked, or waiting on approval/i.test(loopConcept) &&
      /success, blocker, stale proof, failed verification/i.test(loopConcept) &&
      /rollback/i.test(loopConcept),
  },
  {
    id: 'human-return-point',
    label: 'Human Return Point',
    requiredEvidence: 'A loop must return to the operator for approval before risky mutation, publication, or external action.',
    evidenceRefs: ['AGENTS.md', 'docs/20_loop-engineering-concept-review.md'],
    passed:
      /approval before commit/i.test(agents) &&
      /human approval/i.test(loopConcept) &&
      /external notification/i.test(loopConcept),
  },
  {
    id: 'source-of-truth',
    label: 'Source Of Truth',
    requiredEvidence: 'A loop must treat repo docs, task ledgers, and verification output as the controlling record.',
    evidenceRefs: ['AGENTS.md', 'docs/13_harness-baseline.md'],
    passed:
      /source of truth/i.test(agents) &&
      /source-of-truth/i.test(harnessBaseline + loopConcept) &&
      /read-only/i.test(harnessBaseline),
  },
  {
    id: 'local-evidence',
    label: 'Local Evidence',
    requiredEvidence: 'A loop must prefer local source, status, smoke, and runtime evidence over provider assumptions.',
    evidenceRefs: ['docs/13_harness-baseline.md', 'docs/20_loop-engineering-concept-review.md'],
    passed:
      /local evidence/i.test(harnessBaseline + loopConcept) &&
      /provider expansion/i.test(loopConcept) &&
      /read-only/i.test(harnessBaseline),
  },
];

const loopSkeleton = [
  {
    stage: 'discover',
    status: 'modeled-read-only',
    purpose: 'Collect local source, task, runtime, and negative-evidence signals without executing work.',
    requiredOutputs: ['evidence-refs', 'unknowns', 'blocked-assumptions'],
    gatewaySurface: 'Mission',
  },
  {
    stage: 'plan',
    status: 'modeled-read-only',
    purpose: 'Define goal, boundary, verification gate, stop condition, and human return point.',
    requiredOutputs: ['thin-slice-scope', 'verification-command', 'approval-boundaries'],
    gatewaySurface: 'Council',
  },
  {
    stage: 'execute',
    status: 'approval-gated',
    purpose: 'Apply only the approved thin slice and preserve exact scope locks.',
    requiredOutputs: ['changed-files', 'diff-proof', 'rollback-path'],
    gatewaySurface: 'Execution',
  },
  {
    stage: 'verify',
    status: 'required-control-point',
    purpose: 'Run focused and aggregate checks before the loop can continue or close.',
    requiredOutputs: ['focused-smoke-result', 'aggregate-verification-result', 'negative-evidence'],
    gatewaySurface: 'Deliverables',
  },
  {
    stage: 'iterate',
    status: 'human-return-required',
    purpose: 'Close, block, retry, or request approval for the next thin slice.',
    requiredOutputs: ['closeout-status', 'remaining-open-items', 'next-safe-candidate'],
    gatewaySurface: 'Decision Inbox',
  },
];

const notAuthorized = [
  'unattended scheduled execution',
  'open-loop exploration',
  'provider expansion or model-default changes',
  'persistent memory store adoption',
  'automatic pull request, push, merge, release, or external notification semantics',
  'new connector/channel execution',
  'weakening project_path, review, approval, linked-worktree, or local-demo-only gates',
];

const safetyBoundary = {
  readOnly: true,
  mutatesRuntime: false,
  runsProviderCalls: false,
  createsCommits: false,
  createsPushes: false,
  persistsMemory: false,
  opensConnectors: false,
  schedulesWork: false,
};

const criteriaChecks = readinessCriteria.map((criterion) => ({
  id: criterion.id,
  label: criterion.label,
  passed: criterion.passed,
  evidenceRefs: criterion.evidenceRefs,
  requiredEvidence: criterion.requiredEvidence,
}));

const failedCriteria = criteriaChecks.filter((criterion) => !criterion.passed).map((criterion) => criterion.id);

const payload = {
  ok: failedCriteria.length === 0,
  mode: 'loop-readiness-status',
  posture: 'local-read-only-loop-readiness',
  schemaVersion: 'loop-readiness-status/v0',
  repo: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    currentHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  sourceFiles: SOURCE_FILES,
  loopSkeleton,
  criteriaChecks,
  failedCriteria,
  workItemReadinessTemplate: {
    requiredFields: [
      'goal',
      'boundary',
      'verificationGate',
      'stopCondition',
      'humanReturnPoint',
      'sourceOfTruthRefs',
    ],
    rejectIfMissingAnyRequiredField: true,
    safeDefaultWhenIncomplete: 'return read-only status and wait for operator clarification',
  },
  notAuthorized,
  safetyBoundary,
  nextRecommendedSlice: {
    id: 'mission-council-loop-stage-stop-condition-copy',
    type: 'docs-ui-copy-only',
    command: 'node scripts/loop-readiness-status.mjs',
    rationale:
      'Loop readiness is now modeled as read-only; the next safe slice can expose loop stage and stop condition language without changing runtime semantics.',
  },
};

console.log(JSON.stringify(payload, null, 2));
