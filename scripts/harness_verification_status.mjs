#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'synthetic-harness-verification' });

const requiredChecks = [
  {
    id: 'harness-inventory-status',
    script: 'scripts/harness-status.mjs',
    purpose: 'Harness posture inventory and local availability report stays readable and executable.',
  },
  {
    id: 'harness-doc-baseline',
    script: 'scripts/smoke-harness-slice-01.mjs',
    purpose: 'Harness baseline doc and markitdown wrapper stay pinned.',
  },
  {
    id: 'harness-inventory-contract',
    script: 'scripts/smoke-harness-slice-02.mjs',
    purpose: 'Harness inventory posture contract stays pinned.',
  },
  {
    id: 'harness-policy-gate',
    script: 'scripts/smoke-harness-slice-03.mjs',
    purpose: 'Only approved-now harnesses remain executable through the repo-native gate.',
  },
  {
    id: 'harness-approved-dispatch',
    script: 'scripts/smoke-harness-slice-04.mjs',
    purpose: 'Approved harness dispatch remains self-describing and routes into wrapper usage.',
  },
  {
    id: 'harness-info-entrypoint',
    script: 'scripts/smoke-harness-slice-06.mjs',
    purpose: 'Per-harness info lookup stays available for approved and future harnesses.',
  },
  {
    id: 'harness-info-status-sync',
    script: 'scripts/smoke-harness-slice-07.mjs',
    purpose: 'Harness status and info outputs stay aligned on availability and executable truth.',
  },
  {
    id: 'harness-doctor-summary',
    script: 'scripts/smoke-harness-slice-08.mjs',
    purpose: 'Harness doctor summary stays aligned with posture and host availability truth.',
  },
  {
    id: 'harness-doctor-action-queue',
    script: 'scripts/smoke-harness-slice-09.mjs',
    purpose: 'Harness doctor action queue stays ordered and actionable for the current host posture.',
  },
  {
    id: 'harness-doctor-next-action',
    script: 'scripts/smoke-harness-slice-10.mjs',
    purpose: 'Harness doctor nextAction stays aligned with the first actionable operator decision.',
  },
  {
    id: 'harness-doctor-ready-list',
    script: 'scripts/smoke-harness-slice-11.mjs',
    purpose: 'Harness doctor readyHarnessIds stays aligned with ready state classification.',
  },
  {
    id: 'harness-doctor-install-required-list',
    script: 'scripts/smoke-harness-slice-12.mjs',
    purpose: 'Harness doctor installRequiredHarnessIds stays aligned with install-required state classification.',
  },
  {
    id: 'harness-doctor-deferred-list',
    script: 'scripts/smoke-harness-slice-13.mjs',
    purpose: 'Harness doctor deferredHarnessIds stays aligned with deferred state classification.',
  },
  {
    id: 'harness-doctor-policy-blocked-list',
    script: 'scripts/smoke-harness-slice-14.mjs',
    purpose: 'Harness doctor policyBlockedHarnessIds stays aligned with signal-only blocked state classification.',
  },
  {
    id: 'harness-doctor-summary-object',
    script: 'scripts/smoke-harness-slice-15.mjs',
    purpose: 'Harness doctor summary object stays aligned with top-level arrays, nextAction, and counts.',
  },
  {
    id: 'harness-doctor-current-host-state',
    script: 'scripts/smoke-harness-slice-16.mjs',
    purpose: 'Harness doctor summary.currentHostState stays aligned with the current top-level posture priority.',
  },
  {
    id: 'harness-doctor-primary-harness',
    script: 'scripts/smoke-harness-slice-17.mjs',
    purpose: 'Harness doctor summary.primaryHarnessId stays aligned with the current host-state priority.',
  },
  {
    id: 'harness-doctor-primary-harness-state',
    script: 'scripts/smoke-harness-slice-18.mjs',
    purpose: 'Harness doctor summary.primaryHarnessState stays aligned with the representative harness priority.',
  },
  {
    id: 'harness-doctor-primary-recommended-action',
    script: 'scripts/smoke-harness-slice-19.mjs',
    purpose: 'Harness doctor summary.primaryRecommendedAction stays aligned with the representative harness action priority.',
  },
  {
    id: 'harness-doctor-primary-install-review',
    script: 'scripts/smoke-harness-slice-20.mjs',
    purpose: 'Harness doctor summary.primaryInstallReview stays aligned with the representative harness guidance.',
  },
  {
    id: 'harness-doctor-primary-note',
    script: 'scripts/smoke-harness-slice-21.mjs',
    purpose: 'Harness doctor summary.primaryNote stays aligned with the representative harness note.',
  },
  {
    id: 'harness-doctor-primary-posture',
    script: 'scripts/smoke-harness-slice-22.mjs',
    purpose: 'Harness doctor summary.primaryPosture stays aligned with the representative harness posture bucket.',
  },
  {
    id: 'harness-doctor-primary-command',
    script: 'scripts/smoke-harness-slice-23.mjs',
    purpose: 'Harness doctor summary.primaryCommand stays aligned with the representative harness command name.',
  },
  {
    id: 'harness-doctor-primary-runner',
    script: 'scripts/smoke-harness-slice-24.mjs',
    purpose: 'Harness doctor summary.primaryRunner stays aligned with the representative harness runner path.',
  },
  {
    id: 'harness-doctor-primary-executable',
    script: 'scripts/smoke-harness-slice-25.mjs',
    purpose: 'Harness doctor summary.primaryExecutable stays aligned with the representative harness executable truth.',
  },
  {
    id: 'harness-doctor-primary-available',
    script: 'scripts/smoke-harness-slice-26.mjs',
    purpose: 'Harness doctor summary.primaryAvailable stays aligned with the representative harness PATH availability truth.',
  },
  {
    id: 'harness-doctor-primary-kind',
    script: 'scripts/smoke-harness-slice-27.mjs',
    purpose: 'Harness doctor summary.primaryKind stays aligned with the representative harness kind classification.',
  },
  {
    id: 'harness-doctor-primary-install-review-required',
    script: 'scripts/smoke-harness-slice-28.mjs',
    purpose: 'Harness doctor summary.primaryInstallReviewRequired stays aligned with the representative harness install-review presence.',
  },
  {
    id: 'harness-doctor-primary-ready',
    script: 'scripts/smoke-harness-slice-29.mjs',
    purpose: 'Harness doctor summary.primaryReady stays aligned with the representative harness ready state.',
  },
  {
    id: 'harness-doctor-primary-action-short',
    script: 'scripts/smoke-harness-slice-30.mjs',
    purpose: 'Harness doctor summary.primaryActionShort stays aligned with the representative harness action shorthand.',
  },
  {
    id: 'harness-doctor-primary-action-message',
    script: 'scripts/smoke-harness-slice-31.mjs',
    purpose: 'Harness doctor summary.primaryActionMessage stays aligned with the representative harness operator guidance.',
  },
  {
    id: 'harness-doctor-summary-contract-freeze',
    script: 'scripts/smoke-harness-slice-32.mjs',
    purpose: 'Harness doctor summary frozen key set and current host baseline stay pinned for milestone completion.',
  },
  {
    id: 'harness-consumer-status',
    script: 'scripts/smoke-harness-slice-33.mjs',
    purpose: 'Harness consumer surface stays pinned to the frozen doctor summary contract without widening the producer.',
  },
  {
    id: 'harness-markitdown-host-ready-run',
    script: 'scripts/smoke-harness-slice-34.mjs',
    purpose: 'Approved markitdown harness stays runnable through the repo-native gate on the current host.',
  },
  {
    id: 'harness-consumer-operator-action',
    script: 'scripts/smoke-harness-slice-35.mjs',
    purpose: 'Harness consumer surface exposes a repo-native operatorAction derived only from the frozen doctor summary.',
  },
  {
    id: 'harness-consumer-brief',
    script: 'scripts/smoke-harness-slice-36.mjs',
    purpose: 'Harness consumer brief stays pinned as a shell-friendly operator summary derived only from the frozen consumer payload.',
  },
  {
    id: 'harness-command-template-alignment',
    script: 'scripts/smoke-harness-slice-37.mjs',
    purpose: 'Harness consumer command templates stay aligned with wrappers that require runtime arguments and do not over-claim zero-arg launchability.',
  },
  {
    id: 'harness-memory-brief-preview',
    script: 'scripts/smoke-harness-slice-38.mjs',
    purpose: 'Local memory brief preview stays read-only, source-of-truth scoped, and dependency-free.',
  },
  {
    id: 'harness-prompt-provenance-guard',
    script: 'scripts/smoke-harness-slice-39.mjs',
    purpose: 'Prompt provenance guard stays source-only and blocks direct prompt-leak corpus import.',
  },
  {
    id: 'harness-external-reference-inventory-sync',
    script: 'scripts/smoke-harness-slice-40.mjs',
    purpose: 'Harness runtime inventory stays aligned with documented external reference signals.',
  },
  {
    id: 'harness-work-quality-guard',
    script: 'scripts/smoke-harness-slice-41.mjs',
    purpose: 'Repo-native work quality guard keeps imported guideline signals source-only and policy-anchored.',
  },
  {
    id: 'harness-verification-output-brief',
    script: 'scripts/smoke-harness-slice-42.mjs',
    purpose: 'Explicit verification output brief stays local, hook-free, and command-rewrite-free.',
  },
  {
    id: 'harness-markitdown-policy-report',
    script: 'scripts/smoke-harness-slice-43.mjs',
    purpose: 'Markitdown wrapper exposes a no-write policy report before document conversion.',
  },
  {
    id: 'harness-hermes-agent-acp-bridge-boundary',
    script: 'scripts/smoke-harness-slice-44.mjs',
    purpose: 'Hermes Agent stays a future ACP harness reference without becoming a core runtime, provider, gateway, or executable v1 harness.',
  },
  {
    id: 'harness-hermes-agent-internal-composition',
    script: 'scripts/smoke-harness-slice-45.mjs',
    purpose: 'Hermes-style function-calling loop is adopted as an internal repo-native agent harness without importing the upstream runtime or widening v1 scope.',
  },
  {
    id: 'harness-run-target-failure-contract',
    script: 'scripts/smoke-harness-slice-46.mjs',
    purpose: 'Harness-run target failures stay structured for missing ids, unknown ids, unknown info targets, and non-executable harness references.',
  },
];

function runNodeScript(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

const results = requiredChecks.map((check) => {
  const result = runNodeScript(check.script);
  return {
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: result.ok,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  };
});

const failedChecks = results.filter((check) => !check.ok);
const report = {
  ok: failedChecks.length === 0,
  mode: 'synthetic-harness-verification',
  counts: {
    totalChecks: results.length,
    passedChecks: results.length - failedChecks.length,
    failedChecks: failedChecks.length,
  },
  checks: results.map((check) => ({
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: check.ok,
    status: check.status,
  })),
  failures: failedChecks.map((check) => ({
    id: check.id,
    script: check.script,
    status: check.status,
    signal: check.signal,
    stdout: check.stdout,
    stderr: check.stderr,
  })),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
