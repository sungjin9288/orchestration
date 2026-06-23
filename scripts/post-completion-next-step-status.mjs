import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'post-completion-next-step-status' });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function runGit(args) {
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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const todo = read('tasks/todo.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const roadmap = read('docs/21_completion-development-roadmap.md');
const growthPlan = read('docs/18_growth-gateway-vnext.md');

const uncheckedTaskCount = countMatches(todo, /^- \[ \] /gm);
const envVisibility = {
  OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
  OPENAI_RESPONSES_MODEL: Boolean(process.env.OPENAI_RESPONSES_MODEL),
};
const optionalLiveStatus =
  envVisibility.OPENAI_API_KEY && envVisibility.OPENAI_RESPONSES_MODEL
    ? 'configured-env-visible'
    : 'skipped_missing_env';

const completionBaselineClosed =
  uncheckedTaskCount === 0 &&
  /The current required completion baseline is closed for default implementation work\./.test(
    inventory,
  ) &&
  /No default completion implementation slice remains open/.test(inventory);

const growthLoopReady =
  /Growth Loop Readiness/.test(roadmap) &&
  /Use Loop Engineering as a bounded operating model/.test(roadmap) &&
  /Growth Evidence Ledger/.test(growthPlan) &&
  /Reflection Evaluator/.test(growthPlan) &&
  /Continuous Development Loop/.test(growthPlan);

const report = {
  ok: completionBaselineClosed && growthLoopReady,
  mode: 'post-completion-next-step-status',
  posture: 'local-read-only-post-completion-router',
  currentHead: {
    branch: runGit(['branch', '--show-current']),
    commit: runGit(['rev-parse', '--short', 'HEAD']),
    status: runGit(['status', '--short', '--branch']),
  },
  completionBaseline: {
    zeroOpenBacklog: uncheckedTaskCount === 0,
    uncheckedTaskCount,
    defaultCompletionImplementationOpen: false,
    source: 'tasks/todo.md',
    inventoryClosed: completionBaselineClosed,
  },
  entryGate: {
    currentEntryReason: 'explicit-operator-request',
    allowedEntryReasons: [
      'explicit-operator-request',
      'concrete-regression',
      'usability-issue',
      'accepted-vnext-decision',
    ],
    defaultAutostartAllowed: false,
  },
  recommendedNextStep: {
    track: 'vNext-read-only-growth-loop',
    firstSlice: 'post-completion-next-step-router',
    nextImplementationPosture: 'read-only-status-or-doc-smoke-first',
    rationale:
      'The completion baseline is zero-open, so follow-up work should route through an explicit vNext or operations gate before any runtime or UI mutation opens.',
    candidateWorkstreams: [
      'growth-evidence-ledger',
      'reflection-evaluator',
      'gateway-surface-router',
      'optional-real-live-rerun-when-env-visible',
    ],
  },
  optionalLiveVerification: {
    status: optionalLiveStatus,
    requiredEnv: ['OPENAI_API_KEY', 'OPENAI_RESPONSES_MODEL'],
    envVisibility,
    blocking: false,
  },
  boundaries: {
    runtimeMutation: false,
    uiMutation: false,
    providerMutation: false,
    memoryPersistence: false,
    connectorReach: false,
    automation: false,
    commitOrPushAuthority: false,
    lifecycleSemanticsChanged: false,
  },
};

console.log(JSON.stringify(report, null, 2));
