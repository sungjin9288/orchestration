import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-reflection-loop-automation-boundary-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/20_loop-engineering-concept-review.md',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-continuous-development-loop-status.mjs',
];

const REQUIRED_BOUNDARIES = [
  {
    id: 'budget',
    label: 'Budget',
    requiredEvidence: 'Proposal names budget, cost, quota, or bounded spend limits for loop automation.',
    pattern: /\b(budget|cost|quota|spend|token limit|bounded spend|limit)\b/i,
  },
  {
    id: 'retry',
    label: 'Retry',
    requiredEvidence: 'Proposal names retry, attempt, backoff, or rerun limits before iteration can continue.',
    pattern: /\b(retry|retries|attempt|backoff|rerun|re-run)\b/i,
  },
  {
    id: 'rollback',
    label: 'Rollback',
    requiredEvidence: 'Proposal names rollback, restore, revert, or undo evidence for automation failure.',
    pattern: /\b(rollback|restore|revert|undo|roll back)\b/i,
  },
  {
    id: 'approval',
    label: 'Approval',
    requiredEvidence: 'Proposal names operator approval or human approval before mutation or external action.',
    pattern: /\b(approval|approved|operator approval|human approval|approval gate)\b/i,
  },
];

const LOOP_AUTOMATION_CLAIM_PATTERNS = [
  /\bloop automation\b/i,
  /\bautomated loop\b/i,
  /\bunattended loop\b/i,
  /\bautonomous loop\b/i,
  /\bbackground loop\b/i,
  /\bcontinuous development loop\b/i,
];

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

function readSource(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function evaluateProposal({ id, title, body }) {
  const proposalText = `${title || ''}\n${body || ''}`;
  const claimsLoopAutomation = hasAny(proposalText, LOOP_AUTOMATION_CLAIM_PATTERNS);
  const boundaryChecks = REQUIRED_BOUNDARIES.map((boundary) => ({
    id: boundary.id,
    label: boundary.label,
    present: boundary.pattern.test(proposalText),
    requiredEvidence: boundary.requiredEvidence,
  }));
  const missingBoundaries = boundaryChecks
    .filter((boundary) => !boundary.present)
    .map((boundary) => boundary.id);
  const flagged = claimsLoopAutomation && missingBoundaries.length > 0;

  return {
    id,
    title,
    claimsLoopAutomation,
    flagged,
    severity: flagged ? 'blocking' : 'none',
    classification: flagged ? 'loop-automation-boundary-gap' : 'no-boundary-gap',
    missingBoundaries: claimsLoopAutomation ? missingBoundaries : [],
    boundaryChecks,
    allowedAction: flagged
      ? 'return read-only growth reflection finding; do not generate, apply, schedule, or execute the proposal'
      : 'no mutation authorized; continue normal read-only proposal review',
  };
}

const sources = Object.fromEntries(SOURCE_FILES.map((relativePath) => [relativePath, readSource(relativePath)]));
const conceptReview = sources['docs/20_loop-engineering-concept-review.md'];
const growthGatewayPlan = sources['docs/18_growth-gateway-vnext.md'];
const allSourceText = Object.values(sources).join('\n');

const sampleEvaluations = [
  evaluateProposal({
    id: 'complete-loop-automation-boundaries',
    title: 'Loop automation proposal with explicit controls',
    body:
      'Add loop automation only after a budget limit, retry/backoff cap, rollback restore plan, and operator approval gate are documented.',
  }),
  evaluateProposal({
    id: 'missing-all-boundaries',
    title: 'Loop automation proposal',
    body: 'Run the growth loop automatically in the background and continue until improvements are found.',
  }),
  evaluateProposal({
    id: 'non-loop-copy-slice',
    title: 'Mission copy slice',
    body: 'Clarify current stage copy without runtime automation, source mutation, or provider calls.',
  }),
];

const sourceAlignment = {
  loopAutomationRuleDocumented:
    /Implemented Growth Reflection Rule Slice: `growth-reflection-loop-automation-boundary-status`/.test(
      conceptReview,
    ) &&
    /claims `loop automation`/i.test(conceptReview) &&
    /required boundary: `budget`, `retry`, `rollback`, or `approval`/i.test(conceptReview),
  budgetBoundaryDocumented: /\bbudget\b/i.test(allSourceText),
  retryBoundaryDocumented: /\bretry\b/i.test(allSourceText),
  rollbackBoundaryDocumented: /\brollback\b/i.test(allSourceText),
  approvalBoundaryDocumented: /\bapproval\b/i.test(allSourceText),
  proposalQueueReadOnlyDocumented:
    /proposal generation/i.test(allSourceText) &&
    /(proposal application|apply proposals)/i.test(allSourceText),
  continuousLoopReadOnlyDocumented:
    /read-only evidence, reflection, proposal, approval, verification, lesson/i.test(allSourceText) ||
    /continuous development loop/i.test(growthGatewayPlan),
};

const failedAlignment = Object.entries(sourceAlignment)
  .filter(([, passed]) => !passed)
  .map(([id]) => id);

const payload = {
  ok: failedAlignment.length === 0,
  mode: 'growth-reflection-loop-automation-boundary-status',
  posture: 'local-read-only-growth-reflection-boundary-rule',
  schemaVersion: 'growth-reflection-loop-automation-boundary-status/v0',
  repo: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    currentHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  sourceFiles: SOURCE_FILES,
  rule: {
    id: 'loop-automation-boundary-gap',
    trigger: 'proposal text claims loop automation, automated loop, unattended loop, autonomous loop, background loop, or continuous development loop',
    requiredBoundaries: REQUIRED_BOUNDARIES.map(({ id, label, requiredEvidence }) => ({
      id,
      label,
      requiredEvidence,
    })),
    flagWhen: 'claimsLoopAutomation is true and any required boundary is absent',
    severity: 'blocking',
    outputOnly: true,
  },
  sampleEvaluations,
  sourceAlignment,
  failedAlignment,
  safetyBoundary: {
    readOnly: true,
    mutatesRuntime: false,
    generatesProposal: false,
    appliesProposal: false,
    schedulesWork: false,
    runsProviderCalls: false,
    persistsMemory: false,
    opensConnectors: false,
    createsCommits: false,
    createsPushes: false,
  },
  notAuthorized: [
    'proposal generation',
    'proposal application',
    'unattended scheduled execution',
    'background worker execution',
    'runtime mutation',
    'provider calls',
    'persistent memory writes',
    'connector or external notification dispatch',
    'automatic commit, push, merge, or release',
  ],
  nextRecommendedSlice: {
    id: 'growth-reflection-evaluator-boundary-finding-integration',
    type: 'read-only-evaluator-integration-candidate',
    status: 'candidate-not-approved',
    rationale:
      'This command fixes the rule contract first; integrating the finding into the broader evaluator can be considered later without changing automation authority.',
  },
};

console.log(JSON.stringify(payload, null, 2));
