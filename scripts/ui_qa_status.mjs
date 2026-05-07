import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const smokeChecks = [
  {
    id: 'deliverables-ops-entry',
    script: 'scripts/smoke-ui-slice-169.mjs',
    purpose: 'Deliverables advanced-ops entry signal bridge stays pinned',
  },
  {
    id: 'taskboard-entry',
    script: 'scripts/smoke-ui-slice-170.mjs',
    purpose: 'Taskboard first-deck entry signal stays pinned',
  },
  {
    id: 'advanced-ops-first-decks',
    script: 'scripts/smoke-ui-slice-172.mjs',
    purpose: 'Logs / Artifacts / Decision Inbox first-deck signal bridge stays pinned',
  },
  {
    id: 'decision-first-action',
    script: 'scripts/smoke-ui-slice-173.mjs',
    purpose: 'Decision Inbox first action block keeps the same lane language',
  },
  {
    id: 'artifacts-first-hint',
    script: 'scripts/smoke-ui-slice-174.mjs',
    purpose: 'Artifacts first handling hint keeps the same lane language',
  },
  {
    id: 'logs-first-detail',
    script: 'scripts/smoke-ui-slice-175.mjs',
    purpose: 'Logs first detail block keeps the same lane language',
  },
  {
    id: 'taskboard-first-detail',
    script: 'scripts/smoke-ui-slice-176.mjs',
    purpose: 'Taskboard first detail block keeps the same lane language',
  },
  {
    id: 'advanced-ops-continuity-freeze',
    script: 'scripts/smoke-ui-slice-177.mjs',
    purpose: 'Deliverables -> Advanced Ops continuity stays pinned as one chain',
  },
  {
    id: 'freeze-baseline',
    script: 'scripts/smoke-ui-slice-59.mjs',
    purpose: 'Primary shell freeze baseline stays green',
  },
  {
    id: 'harness-brief-mode-labels',
    script: 'scripts/smoke-ui-slice-628.mjs',
    purpose: 'Harness preview brief actions stay mode-aware across latest, hidden, history, and handoff surfaces',
  },
  {
    id: 'harness-brief-copy-payload-title',
    script: 'scripts/smoke-ui-slice-630.mjs',
    purpose: 'Harness output-brief copy payload titles stay aligned with policy-report versus execution mode',
  },
  {
    id: 'harness-packet-brief-presence-label',
    script: 'scripts/smoke-ui-slice-631.mjs',
    purpose: 'Harness packet-copy brief presence labels stay mode-aware',
  },
  {
    id: 'harness-preview-brief-doc-mode-labels',
    script: 'scripts/smoke-ui-slice-632.mjs',
    purpose: 'Harness preview-brief baseline documentation stays aligned with mode-aware UI labels',
  },
  {
    id: 'harness-baseline-verification-doc-bundle',
    script: 'scripts/smoke-ui-slice-634.mjs',
    purpose: 'Harness baseline verification documentation stays aligned with the current aggregate bundle',
  },
  {
    id: 'pre-real-readiness-ui-qa-status-doc',
    script: 'scripts/smoke-ui-slice-635.mjs',
    purpose: 'Pre-real-test readiness documentation keeps the UI QA aggregate and snapshot lane semantics visible',
  },
  {
    id: 'mission-council-slice-doc-status',
    script: 'scripts/smoke-ui-slice-636.mjs',
    purpose: 'Mission/Council slice documentation stays aligned with implemented current-main acceptance status',
  },
  {
    id: 'workspace-click-outcome-guidance',
    script: 'scripts/smoke-ui-slice-637.mjs',
    purpose: 'Workspace playbook tells operators where results live and what each shortcut opens',
  },
  {
    id: 'deliverables-review-passed-result-routing',
    script: 'scripts/smoke-ui-slice-638.mjs',
    purpose: 'Review-passed result bundles route operators to Deliverables and use runtime review status correctly',
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

const checkResults = smokeChecks.map((check) => {
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

let snapshotStatus = {
  ok: false,
  reachable: false,
  skipped: false,
  url: 'http://127.0.0.1:4315/api/snapshot',
  status: null,
  generatedAt: null,
  error: null,
  reason: null,
};

try {
  const response = await fetch(snapshotStatus.url);
  snapshotStatus.status = response.status;
  snapshotStatus.reachable = response.ok;
  if (response.ok) {
    const payload = await response.json();
    snapshotStatus.ok = true;
    snapshotStatus.generatedAt = payload.generatedAt || null;
  } else {
    snapshotStatus.error = `snapshot endpoint returned ${response.status}`;
  }
} catch (error) {
  snapshotStatus.error = error instanceof Error ? error.message : String(error);
  snapshotStatus.skipped = true;
  snapshotStatus.reason = 'Local UI server is not running, so live snapshot reachability is skipped.';
}

const passedRequiredChecks = checkResults.filter((check) => check.ok).length;
const failedRequiredChecks = checkResults.length - passedRequiredChecks;
const informationalChecks = [
  {
    id: 'snapshot-reachability',
    purpose: 'Local /api/snapshot reachability when the UI server is running',
    ok: snapshotStatus.ok,
    skipped: snapshotStatus.skipped,
    status: snapshotStatus.skipped ? 'skipped' : snapshotStatus.status,
  },
];
const passedInformationalChecks = informationalChecks.filter((check) => check.ok).length;
const skippedInformationalChecks = informationalChecks.filter((check) => check.skipped).length;
const failedInformationalChecks = informationalChecks.filter(
  (check) => !check.ok && !check.skipped,
).length;

console.log(
  JSON.stringify(
    {
      ok: failedRequiredChecks === 0,
      allChecksOk: failedRequiredChecks === 0 && failedInformationalChecks === 0,
      mode: 'synthetic-ui-qa',
      browserAutomation: 'manual-required',
      counts: {
        totalChecks: checkResults.length,
        passedChecks: passedRequiredChecks,
        failedChecks: failedRequiredChecks,
        requiredChecks: checkResults.length,
        passedRequiredChecks,
        failedRequiredChecks,
        informationalChecks: informationalChecks.length,
        passedInformationalChecks,
        failedInformationalChecks,
        skippedInformationalChecks,
      },
      lanes: {
        required: {
          totalChecks: checkResults.length,
          passedChecks: passedRequiredChecks,
          failedChecks: failedRequiredChecks,
        },
        informational: {
          totalChecks: informationalChecks.length,
          passedChecks: passedInformationalChecks,
          failedChecks: failedInformationalChecks,
          skippedChecks: skippedInformationalChecks,
        },
      },
      snapshot: snapshotStatus,
      checks: checkResults.map((check) => ({
        id: check.id,
        script: check.script,
        purpose: check.purpose,
        ok: check.ok,
        status: check.status,
      })),
      informationalChecks,
      requiredChecks: checkResults.map((check) => ({
        id: check.id,
        script: check.script,
        purpose: check.purpose,
        ok: check.ok,
        status: check.status,
      })),
    },
    null,
    2,
  ),
);
