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
  {
    id: 'ai-company-memory-recall-preview-ui-api',
    script: 'scripts/smoke-ui-slice-665.mjs',
    purpose:
      'MemoryRecall UI and API preserve exact-id operator selection, bounded project-local source-contained recallSpec, response and browser-memory-only recall-ready evidence, refresh source input and failure invalidation, safe stale malformed content-type cross-workspace negative-evidence-dropping and credential refusal, responsive fit, and absent search ranking recommendation application or Mission injection controls',
  },
  {
    id: 'ai-company-durable-memory-recall-ui-api',
    script: 'scripts/smoke-ui-slice-666.mjs',
    purpose:
      'Durable MemoryRecall UI and API preserve exact DEC-124 recomputation, separate record approval, one immutable recorded audit fact, exact hydration, response-only preview compatibility, safe stale malformed content-type credential and cross-workspace failures, idempotent replay, responsive fit, and absent list history search ranking recommendation application or Mission injection controls',
  },
  {
    id: 'ai-company-mission-memory-context-preview-ui-api',
    script: 'scripts/smoke-ui-slice-667.mjs',
    purpose:
      'MissionMemoryContext UI and API preserve explicit exact-id operator selection, current draft Mission and canonical digest binding, complete positive negative redaction and review evidence, bounded response and browser-memory-only context preview, refresh source input and failure invalidation, safe malformed stale content-type cross-project provider oversized and non-draft refusal, responsive fit, source-state stability, and absent apply inject recommend search persist or downstream controls',
  },
  {
    id: 'ai-company-workorder-verification-plan-preview-ui-api',
    script: 'scripts/smoke-ui-slice-668.mjs',
    purpose:
      'WorkOrder verification plan UI and API preserve explicit exact WorkOrder selection, current ExecutionPlan and WorkOrder digest binding, complete source-backed criterion coverage, bounded response and browser-memory-only evidence, refresh source and failure invalidation, safe malformed stale content-type crossed and oversized refusal, source-state stability, separate durable-criteria authority, and absent execute complete or downstream controls',
  },
  {
    id: 'ai-company-acceptance-criterion-proof-ui-api',
    script: 'scripts/smoke-ui-slice-669.mjs',
    purpose:
      'AcceptanceCriterion and VerificationProof UI and API preserve durable criterion rendering, explicit operator rationale and verdict controls, source-bound node checks, current-proof Reviewer gating, safe malformed stale content-type and oversized refusal, idempotent replay, responsive fit, and absent automatic completion or downstream controls',
  },
  {
    id: 'ai-company-bounded-continuation-ui-api',
    script: 'scripts/smoke-ui-slice-670.mjs',
    purpose:
      'Bounded continuation UI and API preserve preview-before-resume interaction, exact current checkpoint and progress digest evidence, one-step deadline and cancellation bounds, browser-memory-only lifecycle, safe stale malformed content-type and oversized refusal, responsive fit, and absent automatic continuation scheduling or retry controls',
  },
  {
    id: 'llm-native-primary-shell',
    script: 'scripts/smoke-ui-slice-671.mjs',
    purpose:
      'Prompt-first Mission composer, chronological operator and agent workstream, compact context inspector, preserved Advanced Ops controls, and responsive LLM-native shell',
  },
  {
    id: 'ai-company-mission-evidence-graph-ui-api',
    script: 'scripts/smoke-ui-slice-672.mjs',
    purpose:
      'Mission Thread and Graph selector, exact read-only evidence projection, keyboard-readable SVG, semantic mobile fallback, bounded 250-node contract, state-byte stability, and absent authority-bearing graph controls',
  },
  {
    id: 'ai-company-mission-evidence-graph-exploration',
    script: 'scripts/smoke-ui-slice-673.mjs',
    purpose:
      'Browser-only graph search, lifecycle and status filters, direct-neighbor focus, read-only source detail, keyboard and mobile selection parity, escaped graph text, and absent explorer persistence or authority actions',
  },
  {
    id: 'ai-company-task-execution-provenance-graph',
    script: 'scripts/smoke-ui-slice-692.mjs',
    purpose:
      'Task Detail default-closed execution provenance disclosure, exact GET projection, browser-memory search and filters, direct-neighbor detail, desktop SVG, semantic mobile fallback, and absent graph authority actions',
  },
  {
    id: 'llm-native-active-mission-focus',
    script: 'scripts/smoke-ui-slice-674.mjs',
    purpose:
      'Active Mission workstream-first hierarchy, explicit new-Mission compose and cancel behavior, browser-memory draft continuity, refresh-stable focus, responsive Thread and Graph access, and unchanged submit and authority contracts',
  },
  {
    id: 'llm-native-mission-mode-control',
    script: 'scripts/smoke-ui-slice-675.mjs',
    purpose:
      'Native segmented Council mode selection, provider-readiness fallback, one Mission submit command, exact radio focus restoration, knowledge-work compatibility, and unchanged runtime authority contracts',
  },
  {
    id: 'llm-native-first-run-project-connection',
    script: 'scripts/smoke-ui-slice-676.mjs',
    purpose:
      'Honest project prerequisite, unframed first-run connection form, one-line command, stable responsive fields, bootstrap runner compatibility, and unchanged project/runtime authority contracts',
  },
  {
    id: 'llm-native-source-backed-mission-thread',
    script: 'scripts/smoke-ui-slice-677.mjs',
    purpose:
      'Source-backed chronological Mission turns, absent future-stage placeholders, one active conversation title, first-viewport next gate, unchanged Thread and Graph behavior, and zero generated-message or runtime authority expansion',
  },
  {
    id: 'llm-native-source-backed-council-meeting',
    script: 'scripts/smoke-ui-slice-678.mjs',
    purpose:
      'Source-backed Council role turns, one Conductor synthesis, conditional dissent, visible alignment actions, collapsed secondary evidence, and zero generated-message or runtime authority expansion',
  },
  {
    id: 'llm-native-source-backed-execution-flow',
    script: 'scripts/smoke-ui-slice-679.mjs',
    purpose:
      'Source-backed current Execution checkpoint, one readiness-bound command, ordered progress, conditional durable WorkOrders, collapsed harness and provenance evidence, and zero runtime authority expansion',
  },
  {
    id: 'llm-native-source-backed-deliverables-flow',
    script: 'scripts/smoke-ui-slice-680.mjs',
    purpose:
      'Source-backed current delivery state, one readiness-bound command, ordered result verification package acceptance and close-out progress, collapsed exact evidence and controls, and zero runtime authority expansion',
  },
  {
    id: 'llm-native-advanced-ops-navigation',
    script: 'scripts/smoke-ui-slice-681.mjs',
    purpose:
      'Four primary workflow surfaces, one native Advanced Ops disclosure with four exact authoritative surfaces, visible pending-gate status, preserved routing/count/current semantics, and zero runtime API schema dependency storage or authority expansion',
  },
  {
    id: 'llm-native-mission-history-navigation',
    script: 'scripts/smoke-ui-slice-682.mjs',
    purpose:
      'Current Mission sidebar context, project-scoped newest-first full Mission selection, exact selected state, existing selection route reuse, bounded responsive disclosure, full-register compatibility, and zero authority expansion',
  },
  {
    id: 'llm-native-workspace-header',
    script: 'scripts/smoke-ui-slice-683.mjs',
    purpose:
      'One visible project provider surface gate and refresh header, removed duplicate workstream metadata, responsive visibility, and zero runtime API schema dependency provider configuration or approval change',
  },
  {
    id: 'llm-native-mobile-navigation',
    script: 'scripts/smoke-ui-slice-684.mjs',
    purpose:
      'Three-row collapsed mobile rail, full-width native disclosure expansion, current Mission and pending-gate visibility, unchanged desktop navigation, and zero route runtime API schema dependency persistence or authority change',
  },
  {
    id: 'llm-native-sparse-mission-graph-density',
    script: 'scripts/smoke-ui-slice-685.mjs',
    purpose:
      'Source-density-derived sparse desktop Graph height, count-only empty mobile stages, unchanged dense layout and six-stage semantics, and zero projection runtime API schema dependency persistence or authority change',
  },
  {
    id: 'llm-native-mobile-mission-title-readability',
    script: 'scripts/smoke-ui-slice-686.mjs',
    purpose:
      'Complete naturally wrapped current Mission title in the three-row mobile rail, full-width disclosure compatibility, unchanged desktop navigation, and zero route runtime API schema dependency persistence or authority change',
  },
  {
    id: 'unchanged-snapshot-noop-refresh',
    script: 'scripts/smoke-ui-slice-687.mjs',
    purpose:
      'Timer-only unchanged snapshot refresh preserves browser controls and response-only previews while explicit bootstrap, manual, and QA refreshes retain the existing full refresh path',
  },
  {
    id: 'desktop-workspace-focus-offset',
    script: 'scripts/smoke-ui-slice-688.mjs',
    purpose:
      'Desktop workspace focus reserves the sticky header without changing the existing focus handoff, skip-link target, mobile static header, or browser authority boundary',
  },
  {
    id: 'advanced-ops-secondary-overview-placement',
    script: 'scripts/smoke-ui-slice-689.mjs',
    purpose:
      'Advanced Ops keeps the existing overview as a default-closed secondary disclosure after the authoritative workspace without changing renderers, browser-local state, or authority',
  },
  {
    id: 'mission-next-gate-native-navigation',
    script: 'scripts/smoke-ui-slice-690.mjs',
    purpose:
      'Mission Thread exposes one source-backed native jump to its existing lower next gate while preserving the lower authority action, Graph behavior, and every runtime boundary',
  },
  {
    id: 'llm-native-primary-workstream-language',
    script: 'scripts/smoke-ui-slice-691.mjs',
    purpose:
      'Primary workstream labels use natural operator language while product names, exact collapsed provenance, actions, readiness, and authority stay unchanged',
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
