import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'synthetic-ui-qa' });

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
  {
    id: 'operator-home-runway',
    script: 'scripts/smoke-ui-slice-640.mjs',
    purpose:
      'Operator home runway keeps active mission, owner, gate, next action, result, evidence, and log shortcuts visible above the fold',
  },
  {
    id: 'operator-home-no-mission-start-gate',
    script: 'scripts/smoke-ui-slice-641.mjs',
    purpose:
      'Operator home keeps no-mission first users on Mission/new-agenda registration instead of routing them to Council prematurely',
  },
  {
    id: 'operator-home-no-mission-handoff-label',
    script: 'scripts/smoke-ui-slice-642.mjs',
    purpose:
      'Operator home labels the no-mission handoff panel as Mission intake instead of implying Execution is already active',
  },
  {
    id: 'workspace-playbook-no-mission-next-location',
    script: 'scripts/smoke-ui-slice-643.mjs',
    purpose:
      'Workspace playbook keeps the no-mission next-location strip on Mission/new-agenda registration instead of routing to Council',
  },
  {
    id: 'serve-ui-argument-guard',
    script: 'scripts/smoke-ui-slice-644.mjs',
    purpose:
      'Local UI server CLI rejects unknown flags and missing option values before falling back to the default runtime root',
  },
  {
    id: 'manual-ui-qa-summary-argument-guard',
    script: 'scripts/smoke-ui-slice-645.mjs',
    purpose:
      'Manual UI QA checklist rejects unexpected CLI arguments before emitting operator evidence',
  },
  {
    id: 'mission-first-run-handoff-state',
    script: 'scripts/smoke-ui-slice-647.mjs',
    purpose:
      'Mission first-run handoff moves from project-backed mission creation into Council alignment, linked execution cell creation, and Execution handoff without adding new runtime routes',
  },
  {
    id: 'deliverables-completion-summary',
    script: 'scripts/smoke-ui-slice-648.mjs',
    purpose:
      'Deliverables completion summary answers changed, passed, blocked, and safe-next questions without adding new downstream actions',
  },
  {
    id: 'reference-driven-growth-personalization-ui',
    script: 'scripts/smoke-ui-slice-649.mjs',
    purpose:
      'Reference-driven enterprise redesign exposes read-only growth candidates and local-only personalization without provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'nav-dispatcher-in-surface-action-reachability',
    script: 'scripts/smoke-ui-slice-650.mjs',
    purpose:
      'Global click dispatcher scopes surface navigation to .nav-button so in-surface action buttons stay reachable by real operator clicks',
  },
  {
    id: 'ai-company-real-council-ui-api',
    script: 'scripts/smoke-ui-slice-651.mjs',
    purpose:
      'Opt-in Real Council UI and API preserve independent position, conflict, synthesis, alignment, bounded handoff, and legacy route evidence',
  },
  {
    id: 'ai-company-council-live-provider-ui-api',
    script: 'scripts/smoke-ui-slice-652.mjs',
    purpose:
      'OpenAI Responses Council opt-in UI and API preserve readiness-gated selection, redacted provider evidence, alignment parity, and unchanged local-stub behavior',
  },
  {
    id: 'ai-company-mission-workorder-compiler-ui-api',
    script: 'scripts/smoke-ui-slice-653.mjs',
    purpose:
      'Mission compiler UI and API preserve explicit inert-preview selection, preflight-before-approval, response-only evidence, blocked downstream controls, deterministic recompute, and default linked-task compatibility',
  },
  {
    id: 'ai-company-workorder-persistence-execution-ui-api',
    script: 'scripts/smoke-ui-slice-654.mjs',
    purpose:
      'Durable WorkOrder UI and API preserve explicit persist approve and start actions, stale digest refusal, reload evidence, responsive controls, one Builder preflight dispatch, and the existing live-mutation stop gate',
  },
  {
    id: 'ai-company-reviewed-delivery-ui-api',
    script: 'scripts/smoke-ui-slice-655.mjs',
    purpose:
      'Reviewed-delivery UI and API preserve exact approval-gated continuation, Builder Reviewer QA evidence, response-only package reload, safe replay, and blocked downstream controls',
  },
  {
    id: 'ai-company-checkpoint-resume-recovery-ui-api',
    script: 'scripts/smoke-ui-slice-656.mjs',
    purpose:
      'Workflow recovery UI and API preserve read-only checkpoint inspection, exact digest-gated Reviewer or QA resume, explicit cancellation, stale and quarantine evidence, next-boundary stops, responsive controls, and blocked Builder replay or downstream authority',
  },
  {
    id: 'ai-company-durable-delivery-package-ui-api',
    script: 'scripts/smoke-ui-slice-657.mjs',
    purpose:
      'Durable DeliveryPackage UI and API preserve read-only hydration, exact preview source package and terminal checkpoint tuple gating, one review-required record, safe stale failures, idempotent replay, responsive evidence rendering, and blocked downstream authority',
  },
  {
    id: 'ai-company-delivery-package-acceptance-ui-api',
    script: 'scripts/smoke-ui-slice-658.mjs',
    purpose:
      'DeliveryPackage acceptance UI and API preserve exact tuple-gated append-only acceptance, immutable package evidence, safe stale and malformed failures, idempotent replay, read-only accepted rendering, responsive fit, and blocked Mission task close-out or downstream authority',
  },
  {
    id: 'ai-company-mission-task-close-out-ui-api',
    script: 'scripts/smoke-ui-slice-659.mjs',
    purpose:
      'Mission close-out UI and API preserve exact accepted evidence gating, one immutable close-out fact, atomic Mission and task terminal states, safe stale and concurrent request behavior, immutable package and acceptance evidence, responsive fit, and blocked downstream authority',
  },
  {
    id: 'ai-company-learning-candidate-preview-ui-api',
    script: 'scripts/smoke-ui-slice-660.mjs',
    purpose:
      'LearningCandidate UI and API preserve bounded JSON-only exact terminal evidence gating, explicit response-only preview, source-summary-only redaction and review-required status, Mission-scoped draft reset and edit invalidation, safe stale malformed oversized wrong-content-type and credential failures, no runtime path exposure, responsive fit, and blocked downstream authority',
  },
  {
    id: 'ai-company-durable-learning-candidate-ui-api',
    script: 'scripts/smoke-ui-slice-661.mjs',
    purpose:
      'Durable LearningCandidate UI and API preserve exact-gated explicit persistence, read-only durable hydration, response-only preview compatibility, safe failures, idempotent replay, runtime-path redaction, responsive fit, and absent review promotion or downstream controls',
  },
  {
    id: 'ai-company-learning-candidate-review-outcome-ui-api',
    script: 'scripts/smoke-ui-slice-662.mjs',
    purpose:
      'LearningCandidate review UI and API preserve exact candidate and digest gating, one explicit human-reviewed accepted rejected or changes-requested event, immutable candidate evidence, safe stale and malformed failures, idempotent replay, responsive fit, and blocked revision promotion or downstream controls',
  },
  {
    id: 'ai-company-memory-candidate-preview-ui-api',
    script: 'scripts/smoke-ui-slice-663.mjs',
    purpose:
      'MemoryCandidate UI and API preserve accepted-review-only exact tuple gating, bounded project-scoped memorySpec, response and browser-memory-only review-ready evidence, edit refresh and failure invalidation, safe stale malformed oversized wrong-content-type credential and cross-workspace refusal, responsive fit, and absent storage retrieval application promotion or downstream controls',
  },
  {
    id: 'ai-company-durable-memory-item-ui-api',
    script: 'scripts/smoke-ui-slice-664.mjs',
    purpose:
      'Durable MemoryItem UI and API preserve exact recomputation and separate storage approval, one immutable stored record, read-only exact hydration, response-only preview compatibility, safe stale malformed and content-type failures, idempotent replay, responsive fit, and absent retrieval application export deletion promotion or downstream controls',
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
