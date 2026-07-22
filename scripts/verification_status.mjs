import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lockRoot = path.join(repoRoot, 'var', 'locks');
const lockPath = path.join(lockRoot, 'verification_status.lock');
const DEFAULT_LOCK_WAIT_MS = 120_000;
const lockWaitMs = readPositiveIntegerEnv(
  'ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS',
  DEFAULT_LOCK_WAIT_MS,
);
const staleLockMs = 10 * 60_000;

requireNoCliArgs(process.argv.slice(2), { mode: 'synthetic-verification-status' });

class VerificationLockTimeoutError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'VerificationLockTimeoutError';
    this.details = details;
  }
}

function readPositiveIntegerEnv(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue == null || rawValue === '') {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function writeFailure(error, message, details = {}) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'synthetic-verification-status',
        error,
        message,
        ...details,
      },
      null,
      2,
    ),
  );
}

const requiredChecks = [
  {
    id: 'knowledge-work-pack',
    script: 'scripts/smoke-knowledge-work-pack.mjs',
    purpose: 'Knowledge-work runtime and live-provider pack gate stays green as one synthetic verification bundle',
  },
];

const informationalChecks = [
  {
    id: 'smoke-runner-status',
    script: 'scripts/smoke-runner-status.mjs',
    purpose: 'Smoke runner lists available smoke scripts and requires explicit --filter or --all before execution',
  },
  {
    id: 'openspace-wiring',
    script: 'scripts/smoke-openspace-slice-01.mjs',
    purpose: 'OpenSpace wiring and local skill discovery stay connected to the repo without treating host execute_task timeout as a runtime blocker',
  },
  {
    id: 'openspace-doc-status',
    script: 'scripts/smoke-openspace-slice-02.mjs',
    purpose: 'OpenSpace integration documentation keeps repo wiring acceptance separate from host credential follow-up',
  },
  {
    id: 'openspace-skill-credential-boundary',
    script: 'scripts/smoke-openspace-slice-03.mjs',
    purpose: 'OpenSpace repo-local skills keep discovery and execute_task host credential readiness separate',
  },
  {
    id: 'v1-start-runbook',
    script: 'scripts/smoke-v1-start-runbook.mjs',
    purpose: 'V1 start runbook keeps local gate, push deferral, and host-dependent lanes explicit',
  },
  {
    id: 'v1-dogfood-triage',
    script: 'scripts/smoke-v1-dogfood-triage.mjs',
    purpose: 'V1 dogfood triage evidence keeps local run results, linked-worktree mutation/review evidence, and destructive cleanup boundary explicit',
  },
  {
    id: 'v1-dogfood-runner',
    script: 'scripts/smoke-v1-dogfood-runner.mjs',
    purpose: 'V1 linked-worktree dogfood runner stays dry-run by default and requires explicit execute plus slug before mutating an isolated worktree',
  },
  {
    id: 'v1-dogfood-evidence-inventory',
    script: 'scripts/smoke-v1-dogfood-evidence-inventory.mjs',
    purpose: 'V1 dogfood linked-worktree evidence lifecycle stays visible before and after approved cleanup',
  },
  {
    id: 'v1-operator-status',
    script: 'scripts/smoke-v1-operator-status.mjs',
    purpose: 'V1 local operator status keeps publish, cleanup, and execute-dogfood states explicit and approval-aware',
  },
  {
    id: 'v1-local-completion-status',
    script: 'scripts/smoke-v1-local-completion-status.mjs',
    purpose: 'V1 local completion focused smoke keeps clean/published, dogfood cleanup, and historical handoff wording guards aligned',
  },
  {
    id: 'v1-kickoff-status',
    script: 'scripts/smoke-v1-kickoff-status.mjs',
    purpose: 'V1 kickoff status moves the post-dogfood baseline into the first user-flow slice without executing dogfood or mutating runtime state',
  },
  {
    id: 'v1-kickoff-evidence-triage',
    script: 'scripts/smoke-v1-kickoff-evidence-triage.mjs',
    purpose: 'V1 kickoff evidence triage keeps post-proof implementation entry gated on concrete regressions or usability issues',
  },
  {
    id: 'v1-review-passed-deliverables-routing',
    script: 'scripts/smoke-ui-slice-638.mjs',
    purpose: 'V1 review-passed result routing keeps review.status=passed tied to Deliverables without confusing it with approval.status=approved',
  },
  {
    id: 'v1-completion-readiness',
    script: 'scripts/smoke-v1-completion-readiness.mjs',
    purpose: 'V1 planned feature completion readiness stays pinned to the clean published baseline and issue-driven entry gate',
  },
  {
    id: 'reference-claw-empire-audit',
    script: 'scripts/smoke-reference-claw-empire-audit.mjs',
    purpose: 'Historical claw-empire audit questions stay preserved as reference evidence without reopening current V1 implementation backlog',
  },
  {
    id: 'vnext-growth-gateway-plan',
    script: 'scripts/smoke-vnext-growth-gateway-plan.mjs',
    purpose: 'OpenClaw-style local gateway reach and Hermes-style self-improvement loop stay separated, local-first, and approval-gated for vNext planning',
  },
  {
    id: 'growth-engine-status',
    script: 'scripts/smoke-growth-engine-status.mjs',
    purpose: 'Growth engine status reads local evidence and recommends the next self-improvement slice without mutating runtime, providers, channels, commits, or pushes',
  },
  {
    id: 'growth-reflection-evaluator',
    script: 'scripts/smoke-growth-reflection-evaluator.mjs',
    purpose: 'Growth reflection evaluator scores local evidence with typed claims and negative evidence while staying read-only and approval-gated',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-lifecycle-review-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record lifecycle review status keeps the long proposal-record review/acceptance/finalization chain behind one read-only alias without creating records, approving proposals, calling providers, mutating source, committing, or pushing',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-lifecycle-review-smoke',
    script: 'scripts/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record lifecycle review smoke pins alias normalization, sourceCandidate retention, invalid-argument rejection, and unchanged authority boundaries',
  },
  {
    id: 'growth-worker-event-schema',
    script: 'scripts/smoke-growth-worker-event-schema.mjs',
    purpose: 'Growth worker event schema fixes read-only lifecycle/report/status-check vocabulary before worker automation or proposal queues can act',
  },
  {
    id: 'growth-proposal-queue-status',
    script: 'scripts/smoke-growth-proposal-queue-status.mjs',
    purpose: 'Growth proposal queue status fixes read-only proposal readiness, approval, and verification vocabulary before proposal generation or application can act',
  },
  {
    id: 'growth-skill-memory-registry-status',
    script: 'scripts/smoke-growth-skill-memory-registry-status.mjs',
    purpose: 'Growth skill memory registry status fixes read-only redaction, applicability, expiry, and verification vocabulary before memory persistence or skill promotion can act',
  },
  {
    id: 'growth-gateway-surface-router-status',
    script: 'scripts/smoke-growth-gateway-surface-router-status.mjs',
    purpose: 'Growth gateway surface router status fixes read-only routing for growth state across owned surfaces before external channels or execution authority can act',
  },
  {
    id: 'growth-continuous-development-loop-status',
    script: 'scripts/smoke-growth-continuous-development-loop-status.mjs',
    purpose: 'Growth continuous development loop status fixes the read-only evidence, reflection, proposal, approval, verification, lesson, and gateway exposure loop before improvement acceptance can act',
  },
  {
    id: 'growth-reflection-loop-automation-boundary-status',
    script: 'scripts/smoke-growth-reflection-loop-automation-boundary-status.mjs',
    purpose: 'Growth reflection loop automation boundary rule flags proposals missing budget, retry, rollback, or approval before proposal generation, application, scheduling, or execution can act',
  },
  {
    id: 'loop-readiness-status',
    script: 'scripts/smoke-loop-readiness-status.mjs',
    purpose: 'Loop Engineering readiness status checks goal, boundary, verification gate, stop condition, human return point, source-of-truth refs, and local evidence posture before loop automation can act',
  },
  {
    id: 'mission-council-loop-stage-stop-condition-copy',
    script: 'scripts/smoke-ui-slice-646.mjs',
    purpose: 'Mission and Council copy names the current loop stage and stop condition without adding runtime routes, state schema, provider calls, memory, or automation semantics',
  },
  {
    id: 'mission-first-run-handoff-state',
    script: 'scripts/smoke-ui-slice-647.mjs',
    purpose: 'Mission first-run handoff moves from project-backed mission creation into Council alignment, linked execution cell creation, and Execution handoff without adding new runtime routes',
  },
  {
    id: 'deliverables-completion-summary',
    script: 'scripts/smoke-ui-slice-648.mjs',
    purpose: 'Deliverables completion summary answers changed, passed, blocked, and safe-next questions without adding new downstream actions',
  },
  {
    id: 'reference-driven-growth-personalization-ui',
    script: 'scripts/smoke-ui-slice-649.mjs',
    purpose: 'Reference-driven enterprise redesign exposes read-only growth candidates and local-only personalization without provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'readme-scope-evidence',
    script: 'scripts/smoke-readme-scope-evidence.mjs',
    purpose: 'README public-facing setup, testing, scope, route, env, and limitation claims stay backed by current source and measured smoke counts',
  },
  {
    id: 'vnext-development-audit-status',
    script: 'scripts/vnext-development-audit-status.mjs',
    purpose: 'vNext design, growth learning, personalization, proposal, and memory development plan stays grounded in current source evidence without opening blocked authority',
  },
  {
    id: 'vnext-growth-dashboard-evidence-depth-status',
    script: 'scripts/vnext-growth-dashboard-evidence-depth-status.mjs',
    purpose: 'vNext Growth Evidence Ledger dashboard depth exposes grouped failure patterns, regression comparison, and rollback evidence links as display-only evidence without opening proposal, memory, provider, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-proposal-review-decision-spec-status',
    script: 'scripts/vnext-proposal-review-decision-spec-status.mjs',
    purpose: 'vNext proposal review decision spec defines durable proposal record schema, approval separation, expiry, and stop conditions without opening record creation, persistence, approval, application, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-memory-readiness-decision-spec-status',
    script: 'scripts/vnext-memory-readiness-decision-spec-status.mjs',
    purpose: 'vNext memory readiness decision spec defines durable memory schema, source and redaction rules, review gates, export, expiry, deletion, and stop conditions without opening memory persistence, raw transcript ingestion, cross-workspace memory, skill promotion, provider calls, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-authority-expansion-review-status',
    script: 'scripts/vnext-authority-expansion-review-status.mjs',
    purpose: 'vNext authority expansion review defines the shared read-only request contract, candidate authority paths, separated approvals, stop conditions, rollback requirements, and focused smoke requirements before any proposal, memory, provider, source mutation, commit, or push authority can open',
  },
  {
    id: 'vnext-authority-implementation-decision-packet-status',
    script: 'scripts/vnext-authority-implementation-decision-packet-status.mjs',
    purpose: 'vNext authority implementation decision packet defines operator decision outcomes, required decision fields, still-blocked authority, rollback refs, focused smoke refs, and aggregate verification refs before any authority-opening implementation can be considered',
  },
  {
    id: 'vnext-durable-proposal-record-planning-preview-status',
    script: 'scripts/vnext-durable-proposal-record-planning-preview-status.mjs',
    purpose: 'vNext durable proposal record planning preview defines record shape, local storage candidate, focused smoke preview, rollback preview, and stop conditions as read-only planning input without opening creation, persistence, proposal application, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-operator-decision-handoff-status',
    script: 'scripts/vnext-operator-decision-handoff-status.mjs',
    purpose: 'vNext operator decision handoff defines copy-ready decision fields, valid statements, invalid shortcuts, minimum planning-only acceptance, still-blocked authority, and stop conditions without recording a decision or opening planning, implementation, persistence, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-durable-proposal-record-implementation-plan-status',
    script: 'scripts/vnext-durable-proposal-record-implementation-plan-status.mjs',
    purpose: 'vNext durable proposal record implementation plan records accepted planning-only approval, implementation plan, rollback plan, focused smoke plan, and record contract without opening implementation, record creation, persistence, proposal application, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'durable-proposal-record-creation-smoke',
    script: 'scripts/smoke-durable-proposal-record-creation.mjs',
    purpose: 'Durable proposal record creation requires approved implementation payload evidence, persists to local state.json, keeps applyAllowed=false, and leaves proposal application, provider, memory, source mutation, commit, and push blocked',
  },
  {
    id: 'vnext-durable-proposal-record-implementation-status',
    script: 'scripts/vnext-durable-proposal-record-implementation-status.mjs',
    purpose: 'vNext durable proposal record implementation source-checks the runtime contract, file-store normalization, service API, read-only UI ledger, focused smoke, and aggregate registration for the approved creation/persistence slice',
  },
  {
    id: 'vnext-proposal-application-decision-packet-status',
    script: 'scripts/vnext-proposal-application-decision-packet-status.mjs',
    purpose: 'vNext proposal application decision packet defines application decision outcomes, required decision fields, application boundary, still-blocked authority, rollback refs, focused smoke refs, and aggregate verification refs before any durable proposal record can be applied',
  },
  {
    id: 'vnext-proposal-application-operator-decision-handoff-status',
    script: 'scripts/vnext-proposal-application-operator-decision-handoff-status.mjs',
    purpose: 'vNext proposal application operator decision handoff defines copy-ready application planning and implementation statement shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions without recording a decision or opening proposal application, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-proposal-application-implementation-plan-status',
    script: 'scripts/vnext-proposal-application-implementation-plan-status.mjs',
    purpose: 'vNext proposal application implementation plan records accepted planning-only approval, audit-only application attempt plan, rollback plan, focused smoke plan, and implementation prerequisites without opening proposal application implementation, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'vnext-proposal-application-implementation-decision-handoff-status',
    script: 'scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs',
    purpose: 'vNext proposal application implementation decision handoff defines copy-ready approval and rejection statement shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions without recording a decision or opening proposal application implementation, provider, memory, source mutation, commit, or push authority',
  },
  {
    id: 'proposal-application-attempt-creation-smoke',
    script: 'scripts/smoke-proposal-application-attempt-creation.mjs',
    purpose: 'Approved audit-only proposal application attempt creation records one inert local attempt for an existing durable proposal record while keeping proposal generation, provider, memory, source mutation, commit, and push authority blocked',
  },
  {
    id: 'vnext-proposal-application-implementation-status',
    script: 'scripts/vnext-proposal-application-implementation-status.mjs',
    purpose: 'vNext proposal application implementation source-checks the runtime contract, file-store normalization, service API, read-only UI marker, focused smoke, and aggregate registration for the approved audit-only attempt slice',
  },
  {
    id: 'vnext-proposal-application-source-mutation-decision-packet-status',
    script: 'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
    purpose: 'vNext proposal application source mutation decision packet is consumed planning evidence with required decision fields, application attempt refs, rollback refs, focused smoke refs, and stop conditions preserved before implementation can open',
  },
  {
    id: 'vnext-proposal-application-source-mutation-operator-decision-handoff-status',
    script: 'scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs',
    purpose: 'vNext proposal application source mutation operator decision handoff is consumed planning evidence while implementation, evidence-request, rejection, and deferral statement shapes remain source-checked without opening source mutation implementation, provider, memory, commit, or push authority',
  },
  {
    id: 'vnext-proposal-application-source-mutation-planning-plan-status',
    script: 'scripts/vnext-proposal-application-source-mutation-planning-plan-status.mjs',
    purpose: 'vNext proposal application source mutation planning plan records accepted planning-only approval, mutation plan, rollback plan, focused smoke plan, and implementation prerequisites without opening source mutation implementation, provider calls, memory persistence, proposal generation, commit, or push authority',
  },
  {
    id: 'proposal-application-source-mutation-smoke',
    script: 'scripts/smoke-proposal-application-source-mutation.mjs',
    purpose: 'Approved source mutation path applies exactly one accepted mutation plan with clean baseline proof, dry-run diff preview, rollback restore, and quarantine evidence while keeping proposal generation, provider, memory, out-of-path source mutation, commit, and push authority blocked',
  },
  {
    id: 'vnext-proposal-application-source-mutation-implementation-status',
    script: 'scripts/vnext-proposal-application-source-mutation-implementation-status.mjs',
    purpose: 'vNext proposal application source mutation implementation source-checks the runtime contract, pure validation helpers, file-store hardening, focused smoke, implementation doc, and aggregate registration for the approved single mutation path slice',
  },
  {
    id: 'vnext-proposal-generation-decision-packet-status',
    script: 'scripts/vnext-proposal-generation-decision-packet-status.mjs',
    purpose: 'vNext proposal generation decision packet source-checks the planning-only operator input for one deterministic local draft path while keeping generation implementation, provider calls, durable record creation, proposal application, memory, source mutation, commit, and push authority blocked',
  },
  {
    id: 'vnext-proposal-generation-operator-decision-handoff-status',
    script: 'scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs',
    purpose: 'vNext proposal generation operator decision handoff source-checks the fielded planning response shape, invalid shortcuts, minimum planning acceptance, upstream queue/readiness evidence, and blocked provider, memory, record, application, source mutation, commit, and push authority without recording an operator decision',
  },
  {
    id: 'vnext-proposal-generation-planning-plan-status',
    script: 'scripts/vnext-proposal-generation-planning-plan-status.mjs',
    purpose: 'vNext proposal generation planning plan preserves the accepted deterministic inert draft contract, rollback/quarantine plan, and focused smoke plan as historical evidence consumed by the approved pure implementation',
  },
  {
    id: 'deterministic-proposal-draft-generation-smoke',
    script: 'scripts/smoke-deterministic-proposal-draft-generation.mjs',
    purpose: 'Approved pure deterministic proposal draft generation validates one candidate, approval, required evidence, and freshness while returning only an inert in-memory draft with no durable record, queue, application, provider, memory, source, commit, or push authority',
  },
  {
    id: 'vnext-proposal-generation-implementation-status',
    script: 'scripts/vnext-proposal-generation-implementation-status.mjs',
    purpose: 'vNext proposal generation implementation status source-checks DEC-071, the pure inert draft generator, focused smoke, and still-blocked downstream authority',
  },
  {
    id: 'proposal-draft-human-review-smoke',
    script: 'scripts/smoke-proposal-draft-human-review.mjs',
    purpose: 'Pending human review packet preserves one fresh inert draft as inspection input while rejecting promoted or stale drafts and keeping record, queue, application, provider, memory, source, commit, and push authority blocked',
  },
  {
    id: 'vnext-proposal-draft-human-review-status',
    script: 'scripts/vnext-proposal-draft-human-review-status.mjs',
    purpose: 'vNext proposal draft human review status source-checks DEC-072, the pure pending review packet, focused smoke, and separate downstream authority',
  },
  {
    id: 'vnext-proposal-draft-human-review-decision-packet-status',
    script: 'scripts/vnext-proposal-draft-human-review-decision-packet-status.mjs',
    purpose: 'vNext proposal draft human review decision packet source-checks DEC-073, valid fielded outcome shapes, the pending review packet, and still-blocked downstream authority without recording an outcome',
  },
  {
    id: 'vnext-proposal-draft-human-review-evidence-decision-status',
    script: 'scripts/vnext-proposal-draft-human-review-evidence-decision-status.mjs',
    purpose: 'vNext proposal draft human review evidence decision source-checks DEC-074, the accepted evidence-only outcome, unchanged pending packet contract, and still-blocked downstream authority without runtime decision persistence',
  },
  {
    id: 'vnext-proposal-draft-downstream-authority-decision-packet-status',
    script: 'scripts/vnext-proposal-draft-downstream-authority-decision-packet-status.mjs',
    purpose: 'vNext proposal draft downstream authority decision packet source-checks DEC-075, one recommended local durable record planning target, valid fielded outcomes, rejected broad shortcuts, and still-blocked authority without recording a decision',
  },
  {
    id: 'ai-company-master-plan-documentation',
    script: 'scripts/smoke-ai-company-master-plan.mjs',
    purpose: 'AI Company Phase 0 source contract pins current deterministic Council and browser-only roster truth, the planned runtime/Council/delivery roadmap, per-phase rollback and verification gates, and still-blocked runtime, provider, memory, autonomous scheduling, source mutation, approval bypass, unattended commit, and unattended push authority',
  },
  {
    id: 'ai-company-runtime-blueprint-planning',
    script: 'scripts/smoke-ai-company-runtime-blueprint-planning.mjs',
    purpose: 'AI Company Phase 1 planning remains consumed provenance for DEC-079 and source-checks the implemented strict repo-backed blueprint, optional runtime injection, additive read-only snapshot, schema v7 compatibility after additive migration, rollback, and still-blocked downstream authority',
  },
  {
    id: 'ai-company-runtime-blueprint-implementation',
    script: 'scripts/smoke-ai-company-runtime-blueprint.mjs',
    purpose: 'AI Company Phase 1 runtime smoke proves strict immutable blueprint and nine-role loading, stable identities, fail-closed invalid source handling, configured-only additive companyRuntime exposure, schema v7 compatibility, deterministic Council compatibility, and blocked downstream authority',
  },
  {
    id: 'ai-company-real-council-planning',
    script: 'scripts/smoke-ai-company-real-council-planning.mjs',
    purpose: 'AI Company Phase 2 planning remains consumed provenance for DEC-082 and pins the accepted local-stub Real Council allowlist, compatibility, rollback, focused smoke, and blocked downstream authority',
  },
  {
    id: 'ai-company-real-council-implementation',
    script: 'scripts/smoke-ai-company-real-council.mjs',
    purpose: 'AI Company Phase 2 runtime smoke proves isolated Strategist Architect and Decomposer requests, strict position and synthesis validation, deterministic conflict evidence, Conductor synthesis, revision history, failure resume, schema v7 reload, stale-source rejection, legacy Council compatibility, and blocked provider memory mutation commit push and release authority',
  },
  {
    id: 'ai-company-real-council-ui-api',
    script: 'scripts/smoke-ui-slice-651.mjs',
    purpose: 'AI Company Phase 2 UI and API smoke proves opt-in start, targeted revision, stop without task creation, approved bounded execution handoff, mode-gated position conflict dissent synthesis controls, and legacy route compatibility',
  },
  {
    id: 'ai-company-council-live-provider-planning',
    script: 'scripts/smoke-ai-company-council-live-provider-planning.mjs',
    purpose: 'AI Company Phase 3 planning source-checks one explicit OpenAI Responses Council opt-in proposal, unchanged normalized schemas, local-stub authority, role and mode allowlists, retry timeout cancellation redaction optional live verification rollback, and still-blocked provider implementation calls runtime API UI and downstream authority',
  },
  {
    id: 'ai-company-council-live-provider-implementation',
    script: 'scripts/smoke-ai-company-council-live-provider.mjs',
    purpose: 'AI Company Phase 3 synthetic provider smoke proves explicit OpenAI Responses Council opt-in, isolated sequential role requests, strict normalized schemas, deterministic conflict before synthesis, bounded retry timeout cancellation and call budget, redacted evidence, schema v7 reload, and local-stub plus legacy compatibility',
  },
  {
    id: 'ai-company-council-live-provider-ui-api',
    script: 'scripts/smoke-ui-slice-652.mjs',
    purpose: 'AI Company Phase 3 UI and API smoke proves readiness-gated provider selection, safe provider evidence, missing-configuration refusal without incomplete session persistence, alignment parity, and unchanged local-stub behavior',
  },
  {
    id: 'ai-company-mission-workorder-compiler-planning',
    script: 'scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs',
    purpose: 'AI Company Phase 4 planning remains consumed provenance for DEC-088 and pins the implemented deterministic response-only Mission compiler, exact operator compile inputs, schema v7 compatibility after additive migration, rollback, and the then-blocked persistence and execution authorities later narrowed by DEC-091',
  },
  {
    id: 'ai-company-mission-workorder-compiler-implementation',
    script: 'scripts/smoke-ai-company-mission-workorder-compiler.mjs',
    purpose: 'AI Company Phase 4 runtime smoke proves exact compileSpec validation, source-current approved Council gating, deterministic deeply frozen Builder Reviewer QA previews, graph and authority closure, response-only non-persistence unless explicitly promoted through Phase 5, schema v7 compatibility, provider-shaped schema parity, and default local unresolved-question rejection',
  },
  {
    id: 'ai-company-mission-workorder-compiler-ui-api',
    script: 'scripts/smoke-ui-slice-653.mjs',
    purpose: 'AI Company Phase 4 UI and API smoke proves preflight before alignment persistence, explicit inert preview selection, response-only evidence, blocked downstream controls, deterministic recompute, no object persistence, responsive layout rules, and unchanged default linked-task auto-chain behavior',
  },
  {
    id: 'ai-company-workorder-persistence-execution-planning',
    script: 'scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs',
    purpose: 'AI Company Phase 5 planning remains consumed provenance for DEC-091 and pins additive schema v7 durable plan records, exact preview and source digest promotion, one task-owned plan approval, one separate local-stub sequential Builder dispatch stopping at the existing live-mutation approval, migration and rollback evidence, and still-blocked source mutation Reviewer QA scheduling provider commit push release and connectors',
  },
  {
    id: 'ai-company-workorder-persistence-execution-implementation',
    script: 'scripts/smoke-ai-company-workorder-persistence-execution.mjs',
    purpose: 'AI Company Phase 5 runtime smoke proves additive schema v7 migration, atomic exact-digest plan persistence, idempotency, approval and rejection binding, one local sequential Builder preflight dispatch, reload evidence, and the unchanged live-mutation gate with Reviewer QA providers source mutation commit push and release still blocked',
  },
  {
    id: 'ai-company-workorder-persistence-execution-ui-api',
    script: 'scripts/smoke-ui-slice-654.mjs',
    purpose: 'AI Company Phase 5 UI and API smoke proves explicit persist approve and start controls, stale digest refusal, Decision Inbox reconciliation, durable reload evidence, responsive layout rules, one Builder stop at live-mutation approval, and no Reviewer QA or source mutation controls',
  },
  {
    id: 'ai-company-reviewed-delivery-planning',
    script: 'scripts/smoke-ai-company-reviewed-delivery-planning.mjs',
    purpose: 'AI Company Phase 6 planning source-checks one explicit local-stub continuation from the exact approved Builder live-mutation gate through existing Builder and independent Reviewer, shell-free allowlisted node syntax QA, one response-only DeliveryPackage preview, rollback and focused smoke requirements, while implementation source mutation durable package Mission done scheduling provider memory commit push release and connectors remain blocked',
  },
  {
    id: 'ai-company-reviewed-delivery-implementation',
    script: 'scripts/smoke-ai-company-reviewed-delivery.mjs',
    purpose: 'AI Company Phase 6 runtime proves exact-gated local Builder mutation, independent review, constrained node syntax QA evidence, changes-requested stop, reload, and authority-closed response-only delivery',
  },
  {
    id: 'ai-company-reviewed-delivery-ui-api',
    script: 'scripts/smoke-ui-slice-655.mjs',
    purpose: 'AI Company Phase 6 UI and API prove approval-gated continuation, reload-safe response-only DeliveryPackage rendering, idempotent replay, and blocked downstream controls',
  },
  {
    id: 'ai-company-checkpoint-resume-recovery-planning',
    script: 'scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs',
    purpose: 'AI Company Phase 7 planning remains consumed provenance for DEC-097 and pins the accepted additive schema v8 checkpoint contract, exact digest-bound reviewer-ready or qa-ready resume boundaries, explicit operator resume or cancel, active-stage quarantine without replay, rollback retention, and still-blocked scheduling provider Mission done commit push release and connectors',
  },
  {
    id: 'ai-company-checkpoint-resume-recovery-implementation',
    script: 'scripts/smoke-ai-company-checkpoint-resume-recovery.mjs',
    purpose: 'AI Company Phase 7 runtime proves additive schema v8 migration, deterministic checkpoint digests, restart-safe Reviewer and QA resume, next-boundary stop, idempotent replay, stale and authority mismatch refusal, cancellation retention, active-stage quarantine, and blocked Builder replay scheduling provider durable package Mission done commit push release and connectors',
  },
  {
    id: 'ai-company-checkpoint-resume-recovery-ui-api',
    script: 'scripts/smoke-ui-slice-656.mjs',
    purpose: 'AI Company Phase 7 UI and API prove read-only recovery inspection, exact tuple-gated Reviewer resume and checkpoint cancel, qa-ready stop, stale failure safety, repeated request idempotency, durable reload evidence, quarantine presentation, responsive controls, and blocked downstream authority',
  },
  {
    id: 'ai-company-durable-delivery-package-planning',
    script: 'scripts/smoke-ai-company-durable-delivery-package-planning.mjs',
    purpose: 'AI Company durable DeliveryPackage planning pins DEC-098 and DEC-099, one future additive schema v9 review-required record from exact delivery-ready preview and terminal checkpoint digests, explicit operator persistence, strict no-write and idempotency requirements, rollback retention, and current negative evidence with package acceptance Mission close-out done commit push release learning memory scheduling providers policy mutation and connectors still blocked',
  },
  {
    id: 'ai-company-durable-delivery-package-implementation',
    script: 'scripts/smoke-ai-company-durable-delivery-package.mjs',
    purpose: 'AI Company durable DeliveryPackage runtime proves additive schema v9 migration with schema v8 checkpoint preservation, exact preview source package and terminal checkpoint digest binding, one immutable review-required record, strict stale no-write behavior, idempotent replay, reload retention, and blocked package acceptance Mission task close-out commit push release learning providers scheduling and connectors',
  },
  {
    id: 'ai-company-durable-delivery-package-ui-api',
    script: 'scripts/smoke-ui-slice-657.mjs',
    purpose: 'AI Company durable DeliveryPackage UI and API prove read-only hydration, exact tuple-gated explicit persistence, durable review-required evidence rendering, stale failure safety, idempotent replay, responsive controls, and absent package acceptance Mission done task close-out commit push release or learning actions',
  },
  {
    id: 'ai-company-delivery-package-acceptance-planning',
    script: 'scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs',
    purpose: 'AI Company DeliveryPackage acceptance planning pins DEC-101 and DEC-102, future additive schema v10 append-only acceptance evidence from one exact current schema v9 package tuple, immutable source package retention, strict no-write and idempotency requirements, rollback retention, and current negative evidence with acceptance implementation rejection changes-requested Mission task close-out done commit push release learning memory scheduling providers policy mutation and connectors still blocked',
  },
  {
    id: 'ai-company-delivery-package-acceptance-implementation',
    script: 'scripts/smoke-ai-company-delivery-package-acceptance.mjs',
    purpose: 'AI Company DeliveryPackage acceptance runtime proves additive schema v10 migration with schema v9 package preservation, exact preview source package and terminal checkpoint decision binding, one immutable accepted event, strict stale and malformed no-write behavior, idempotent replay, reload retention, and unchanged package Mission task plan WorkOrder checkpoint run artifact approval inbox source provider commit push release learning and policy authority',
  },
  {
    id: 'ai-company-delivery-package-acceptance-ui-api',
    script: 'scripts/smoke-ui-slice-658.mjs',
    purpose: 'AI Company DeliveryPackage acceptance UI and API prove read-only hydration, exact tuple-gated explicit acceptance, append-only accepted evidence rendering, safe stale and malformed failures, idempotent replay, responsive fit, and absent rejection changes-requested Mission task close-out done commit push release or learning actions',
  },
  {
    id: 'ai-company-mission-task-close-out-planning',
    script: 'scripts/smoke-ai-company-mission-task-close-out-planning.mjs',
    purpose: 'AI Company Mission and linked control-task close-out planning preserves consumed DEC-104 and DEC-105 provenance while DEC-106 fixes the exact schema v11 event and atomic terminal transaction boundary',
  },
  {
    id: 'ai-company-mission-task-close-out-implementation',
    script: 'scripts/smoke-ai-company-mission-task-close-out.mjs',
    purpose: 'AI Company Mission close-out runtime proves additive schema v11 migration, exact accepted package tuple binding, completed WorkOrders, passed review, recomputed no-active-gate state, one immutable canonical event, one-save atomic task and Mission terminal transitions, terminal-record-first replay, strict loader refusal, generic bypass guards, and unchanged package acceptance standalone close-out source Git release learning scheduling provider policy and connector authority',
  },
  {
    id: 'ai-company-mission-task-close-out-ui-api',
    script: 'scripts/smoke-ui-slice-659.mjs',
    purpose: 'AI Company Mission close-out UI and API prove read-only hydration, exact tuple-gated command, safe stale and malformed failures, concurrent exact request convergence, idempotent replay, immutable package and acceptance evidence, terminal rendering, responsive fit, and blocked downstream authority',
  },
  {
    id: 'ai-company-learning-candidate-preview-planning',
    script: 'scripts/smoke-ai-company-learning-candidate-preview-planning.mjs',
    purpose: 'AI Company Phase 8 planning preserves consumed DEC-107 and DEC-108 provenance while DEC-109 fixes the exact schema-v11-preserving response-only LearningCandidate preview boundary',
  },
  {
    id: 'ai-company-learning-candidate-preview-implementation',
    script: 'scripts/smoke-ai-company-learning-candidate-preview.mjs',
    purpose: 'AI Company LearningCandidate runtime proves strict schema v11 read-only load, current DeliveryPackage preview and QA evidence recomputation, exact completed Mission source closure, operator retrospectiveSpec validation, source-contained paths commands and negative evidence, conservative credential-marker refusal, canonical digest and stable preview id, deep freeze, zero saveState and byte mutation, no snapshot or durable record, and blocked downstream authority',
  },
  {
    id: 'ai-company-learning-candidate-preview-ui-api',
    script: 'scripts/smoke-ui-slice-660.mjs',
    purpose: 'AI Company LearningCandidate UI and API prove bounded JSON-only terminal response preview, exact tuple gating, redaction and review-required evidence, Mission-scoped draft reset, edit invalidation, browser-memory-only lifecycle, stale malformed oversized wrong-content-type and credential failure safety, no runtime path GET or snapshot persistence, responsive fit, and absent downstream controls',
  },
  {
    id: 'ai-company-durable-learning-candidate-planning',
    script: 'scripts/smoke-ai-company-durable-learning-candidate-planning.mjs',
    purpose: 'AI Company durable LearningCandidate planning preserves consumed DEC-110 and DEC-111 provenance while DEC-112 fixes the exact schema v12 persistence and blocked downstream authority boundary',
  },
  {
    id: 'ai-company-durable-learning-candidate-implementation',
    script: 'scripts/smoke-ai-company-durable-learning-candidate.mjs',
    purpose: 'AI Company durable LearningCandidate runtime proves one-save schema v11 to v12 migration and exact record append, DEC-109 recomputation, source tuple retrospective preview and candidate digest binding, immutable record digest, replay idempotency, stale divergent expired malformed credential and corrupt-state refusal, read-only absence and reload, source stability, and blocked review memory skill provider Git release scheduling policy and connectors',
  },
  {
    id: 'ai-company-durable-learning-candidate-ui-api',
    script: 'scripts/smoke-ui-slice-661.mjs',
    purpose: 'AI Company durable LearningCandidate UI and API prove exact-gated explicit persistence, read-only durable hydration, response-only preview compatibility, safe stale malformed and content-type failures, idempotent replay, runtime-path redaction, responsive fit, and absent candidate review promotion memory skill provider source Git release schedule next-Mission policy bypass and connector controls',
  },
  {
    id: 'ai-company-learning-candidate-review-outcome-planning',
    script: 'scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs',
    purpose: 'AI Company LearningCandidate review outcome planning preserves consumed DEC-113 and DEC-114 provenance while DEC-115 fixes the exact schema v13 append-only review event and blocked downstream authority boundary',
  },
  {
    id: 'ai-company-learning-candidate-review-outcome-implementation',
    script: 'scripts/smoke-ai-company-learning-candidate-review-outcome.mjs',
    purpose: 'AI Company LearningCandidate review runtime proves one-save schema v12 to v13 migration and exact append-only accepted rejected or changes-requested review evidence, immutable candidate binding, canonical digest, replay idempotency, stale expired malformed credential and corrupt-state refusal, read-only absence and reload, source stability, and blocked candidate mutation memory skill provider Git release scheduling policy and connectors',
  },
  {
    id: 'ai-company-learning-candidate-review-outcome-ui-api',
    script: 'scripts/smoke-ui-slice-662.mjs',
    purpose: 'AI Company LearningCandidate review UI and API prove exact-gated human-reviewed submission, all three decision choices, read-only durable hydration, safe stale malformed and content-type failures, idempotent replay, runtime-path redaction, responsive fit, and absent candidate revision promotion memory skill provider source Git release schedule next-Mission policy bypass and connector controls',
  },
  {
    id: 'ai-company-memory-candidate-preview-planning',
    script: 'scripts/smoke-ai-company-memory-candidate-preview-planning.mjs',
    purpose: 'AI Company MemoryCandidate preview planning fixes one accepted-review-only schema-v13 response-only readiness preview target while durable memory retrieval import apply export deletion skill provider source Git release scheduling policy and connector authority remain blocked',
  },
  {
    id: 'ai-company-memory-candidate-preview-implementation',
    script: 'scripts/smoke-ai-company-memory-candidate-preview.mjs',
    purpose: 'AI Company MemoryCandidate runtime proves strict schema v13 read-only load, exact current immutable candidate and accepted review binding, bounded operator memorySpec, project-only source-contained applicability evidence negative evidence redaction and review refs, canonical digest stable id deep freeze deterministic replay, zero saveState and byte mutation, rejected changes-requested stale expired malformed credential and cross-workspace refusal, and blocked durable memory skill provider source Git release scheduling policy and connectors',
  },
  {
    id: 'ai-company-memory-candidate-preview-ui-api',
    script: 'scripts/smoke-ui-slice-663.mjs',
    purpose: 'AI Company MemoryCandidate UI and API prove bounded JSON-only accepted-review response preview, exact tuple gating, review-ready persisted-false storage-not-approved browser-memory lifecycle, edit refresh and failed-recompute invalidation, no GET snapshot runtime path or durable record, safe stale malformed oversized wrong-content-type credential and cross-workspace failures, responsive fit, and absent downstream controls',
  },
  {
    id: 'ai-company-durable-memory-item-planning',
    script: 'scripts/smoke-ai-company-durable-memory-item-planning.mjs',
    purpose: 'AI Company durable MemoryItem planning fixes one schema v14 sequence and map only stored-record target with exact DEC-118 recomputation and separate project-scoped storage approval while implementation recommendation retrieval application import export deletion refresh cross-workspace skill provider source Git release scheduling policy and connector authority remain blocked',
  },
  {
    id: 'ai-company-durable-memory-item-implementation',
    script: 'scripts/smoke-ai-company-durable-memory-item.mjs',
    purpose: 'AI Company durable MemoryItem runtime proves one-save schema v13 to v14 migration and exact immutable stored append, DEC-118 recomputation, separate project-scoped storage approval, canonical record digest, replay idempotency, stale divergent expired malformed credential corrupt and cross-workspace no-write refusal, passive read absence, reload, source stability, and blocked retrieval application export deletion skill provider Git release scheduling policy and connectors',
  },
  {
    id: 'ai-company-durable-memory-item-ui-api',
    script: 'scripts/smoke-ui-slice-664.mjs',
    purpose: 'AI Company durable MemoryItem UI and API prove exact-gated explicit storage approval, read-only exact durable hydration, response-only preview compatibility, safe stale malformed and content-type failures, idempotent replay, immutable source records, responsive fit, and absent retrieval application export deletion promotion or downstream controls',
  },
  {
    id: 'ai-company-memory-recall-preview-planning',
    script: 'scripts/smoke-ai-company-memory-recall-preview-planning.mjs',
    purpose: 'AI Company MemoryRecall preview planning fixes one schema v14 preserving exact-id operator-selected project-local response-only review target and records the complete fielded gate consumed by DEC-124',
  },
  {
    id: 'ai-company-memory-recall-preview-implementation',
    script: 'scripts/smoke-ai-company-memory-recall-preview.mjs',
    purpose: 'AI Company MemoryRecall runtime proves exact current unexpired stored item and record digest binding, bounded project-local source-contained recallSpec, complete negative evidence preservation, deterministic deep-frozen exact-id response-only output, zero saveState and byte mutation, stale expired malformed credential cross-workspace and authority-widening refusal, and blocked automatic retrieval recommendation Mission injection application durable recall provider source Git release scheduling policy and connectors',
  },
  {
    id: 'ai-company-memory-recall-preview-ui-api',
    script: 'scripts/smoke-ui-slice-665.mjs',
    purpose: 'AI Company MemoryRecall UI and API prove bounded JSON-only exact-id operator-selected preview, response and browser-memory-only recall-ready evidence, source input and refresh invalidation, safe stale malformed wrong-content-type cross-workspace negative-evidence-dropping and credential failures, zero schema-v15 snapshot or state-byte mutation, responsive fit, and absent search ranking recommendation application or Mission injection controls',
  },
  {
    id: 'ai-company-durable-memory-recall-planning',
    script: 'scripts/smoke-ai-company-durable-memory-recall-planning.mjs',
    purpose: 'AI Company durable MemoryRecall planning preserves the consumed schema v15 sequence and map only recorded audit contract, exact DEC-124 recomputation, separate record approval, and still-blocked list history index automatic retrieval search ranking recommendation Mission or WorkOrder injection application provider source Git release scheduling policy and connector authority',
  },
  {
    id: 'ai-company-durable-memory-recall-implementation',
    script: 'scripts/smoke-ai-company-durable-memory-recall.mjs',
    purpose: 'AI Company durable MemoryRecall runtime proves one atomic schema v14 to v15 migration and immutable recorded audit append from exact DEC-124 recomputation and separate approval, plus no-write failures, idempotent replay, exact inspection, reload, rollback retention, source immutability, and blocked downstream authority',
  },
  {
    id: 'ai-company-durable-memory-recall-ui-api',
    script: 'scripts/smoke-ui-slice-666.mjs',
    purpose: 'AI Company durable MemoryRecall UI and API prove explicit record approval, exact bounded persistence and inspection, safe stale malformed content-type credential and cross-workspace failures, idempotent replay, responsive fit, source-record immutability, and absent list history search ranking recommendation application or Mission injection controls',
  },
  {
    id: 'ai-company-mission-memory-context-preview-planning',
    script: 'scripts/smoke-ai-company-mission-memory-context-preview-planning.mjs',
    purpose: 'AI Company Mission memory context preview planning fixes one schema v15 preserving exact operator-selected recorded recall plus exact same-project draft Mission response-only context review target and records the complete fielded implementation gate while injection application automatic retrieval recommendation provider schema source Git release scheduling policy and connector authority remain blocked',
  },
  {
    id: 'ai-company-mission-memory-context-preview-implementation',
    script: 'scripts/smoke-ai-company-mission-memory-context-preview.mjs',
    purpose: 'AI Company Mission memory context runtime proves exact current unexpired recorded recall and stored item plus exact same-project draft Mission and canonical target digest binding, complete evidence closure, bounded contextSpec, deterministic deep-frozen response-only replay, zero saveState or byte mutation, safe stale expired non-draft cross-project credential provider application and authority-widening refusal, and blocked Mission WorkOrder prompt policy injection or memory application',
  },
  {
    id: 'ai-company-mission-memory-context-preview-ui-api',
    script: 'scripts/smoke-ui-slice-667.mjs',
    purpose: 'AI Company Mission memory context UI and API prove one explicit exact-id operator selection form, browser canonical Mission digest parity, bounded JSON-only POST, response and browser-memory-only context-review-ready evidence, refresh source input and failure invalidation, safe malformed stale content-type cross-project provider oversized and non-draft failures, responsive fit, source-state byte stability, and absent apply inject recommend search persist or downstream controls',
  },
  {
    id: 'ai-company-workorder-verification-plan-preview',
    script: 'scripts/smoke-ai-company-workorder-verification-plan-preview.mjs',
    purpose: 'AI Company WorkOrder verification plan runtime proves exact current ExecutionPlan and WorkOrder record digest binding, complete acceptance stop command and artifact source coverage, deterministic deep-frozen response-only replay, zero state mutation, safe stale malformed crossed and future input refusal, and blocked approval completion command execution persistence provider source Git scheduling and connector authority',
  },
  {
    id: 'ai-company-workorder-verification-plan-preview-ui-api',
    script: 'scripts/smoke-ui-slice-668.mjs',
    purpose: 'AI Company WorkOrder verification plan UI and API prove explicit exact WorkOrder selection, browser and runtime digest parity, bounded JSON-only POST, response and browser-memory-only criterion evidence, refresh source and failure invalidation, safe malformed stale content-type crossed and oversized failures, source-state byte stability, separate durable-criteria authority, and absent execute complete or downstream controls',
  },
  {
    id: 'state-transaction-guard',
    script: 'scripts/smoke-state-transaction-guard.mjs',
    purpose: 'Runtime state commit guard proves source-revision conflict detection, lost-update prevention, bounded active-lock timeout, dead-owner stale-lock recovery, direct symlink-state refusal, valid schema-v16 atomic replacement, and owned lock and temporary-file cleanup without changing existing runtime method contracts',
  },
  {
    id: 'ai-company-acceptance-criterion-proof',
    script: 'scripts/smoke-ai-company-acceptance-criterion-proof.mjs',
    purpose: 'AI Company AcceptanceCriterion and VerificationProof runtime proves additive schema v15-to-v16 migration, exact preview-bound durable criteria, append-only failed and passed review evidence, source-bound shell-free node checks, source drift invalidation, proof-gated Reviewer resume, idempotent requests, reload integrity, and blocked commit push release authority',
  },
  {
    id: 'ai-company-acceptance-criterion-proof-ui-api',
    script: 'scripts/smoke-ui-slice-669.mjs',
    purpose: 'AI Company AcceptanceCriterion and VerificationProof UI and API prove durable criterion rendering, explicit operator rationale and verdict controls, bounded exact proof routes, current-proof Reviewer gating, safe malformed stale content-type and oversized failures, idempotent command replay, responsive fit, and absent automatic completion or downstream controls',
  },
  {
    id: 'ai-company-bounded-continuation',
    script: 'scripts/smoke-ai-company-bounded-continuation.mjs',
    purpose: 'AI Company bounded continuation runtime proves one response-only current-checkpoint next-step preview, exact progress digest binding, deterministic ready no-progress deadline and cancellation outcomes, state-byte stability, existing resume revalidation, and blocked background scheduling retry or active mutation replay',
  },
  {
    id: 'ai-company-bounded-continuation-ui-api',
    script: 'scripts/smoke-ui-slice-670.mjs',
    purpose: 'AI Company bounded continuation UI and API prove preview-before-resume interaction, one-step and five-minute browser-owned bounds, JSON-only bounded failures, browser-memory lifecycle, state-byte stability, responsive evidence, and absent automatic continuation controls',
  },
  {
    id: 'llm-native-primary-shell',
    script: 'scripts/smoke-ui-slice-671.mjs',
    purpose: 'LLM-native primary shell proves prompt-first Mission intake, chronological agent workstream, compact context inspection, responsive layout, and preserved Advanced Ops authority',
  },
  {
    id: 'ai-company-mission-evidence-graph',
    script: 'scripts/smoke-ai-company-mission-evidence-graph.mjs',
    purpose: 'Mission evidence graph runtime proves deterministic schema-v16 read-only projection, exact active-project and Mission binding, 250-node cap, source-reference closure, sensitive-body exclusion, deep-frozen output, and byte-stable state with every graph action blocked',
  },
  {
    id: 'ai-company-mission-evidence-graph-ui-api',
    script: 'scripts/smoke-ui-slice-672.mjs',
    purpose: 'Mission Thread and Graph UI and exact GET API prove opt-in read-only SVG projection, semantic mobile fallback, safe missing and wrong-method failures, state-byte stability, and absent authority-bearing graph controls',
  },
  {
    id: 'ai-company-mission-evidence-graph-exploration',
    script: 'scripts/smoke-ui-slice-673.mjs',
    purpose: 'Mission graph browser-only exploration proves deterministic short-field search, lifecycle and status filtering, direct-neighbor focus, read-only relationship detail, stale-selection cleanup, escaped text, source immutability, and zero persistence or authority actions',
  },
  {
    id: 'llm-native-active-mission-focus',
    script: 'scripts/smoke-ui-slice-674.mjs',
    purpose: 'LLM-native active Mission focus proves compact-by-default current workstream, explicit full composer mode, cancel and selection collapse, refresh-stable field focus, existing Mission submit compatibility, and zero runtime schema dependency persistence or authority expansion',
  },
  {
    id: 'wigolo-exact-fetch-adapter',
    script: 'scripts/smoke-wigolo-exact-fetch-adapter.mjs',
    purpose: 'Optional wigolo exact-fetch adapter proves disabled-by-default readiness, no-shell one-shot fetch argv, bounded untrusted evidence normalization, requested and final URL SSRF guards, malformed timeout and API failure handling, and blocked crawl search cache persistence synthesis or Mission injection authority with a local fake sidecar only',
  },
  {
    id: 'wigolo-exact-fetch-live',
    script: 'scripts/smoke-wigolo-exact-fetch-live.mjs',
    purpose: 'Optional wigolo live exact-fetch evidence remains informational and reports skipped_missing_env unless the operator explicitly supplies enabled sidecar path and exact live URL configuration',
  },
  {
    id: 'context-budget-telemetry',
    script: 'scripts/smoke-context-budget-telemetry.mjs',
    purpose: 'Context budget telemetry proves payload-preserving response-only UTF-8 byte character and leaf-field measurement, exact-by-default and explicit gist classification, protected authority evidence refusal, raw-value omission, deterministic digest parity, bounded API failures, and blocked rewrite truncation compression provider or persistence authority',
  },
  {
    id: 'coordinator-path-containment-smoke',
    script: 'scripts/smoke-coordinator-path-containment.mjs',
    purpose: 'Coordinator resolveProjectFilePath and restoreFileContents reject symlink-follow escapes (target or ancestor directory) so the builder-live-mutation write path cannot read or write outside the project, while still allowing in-project symlinks and normal writes and keeping lexical traversal and Windows-drive inputs blocked',
  },
  {
    id: 'lifecycle-supporting-boundary',
    script: 'scripts/smoke-lifecycle-supporting-boundary.mjs',
    purpose: 'Growth lifecycle status chain remains supporting evidence only and cannot become the default product development lane without stale command or source-of-truth evidence',
  },
  {
    id: 'completion-zero-open-baseline',
    script: 'scripts/smoke-ui-slice-63.mjs',
    purpose: 'Completion baseline stays zero-open until an explicit operator request, concrete regression, usability issue, or accepted vNext decision opens a new implementation slice',
  },
  {
    id: 'completion-gate-inventory-current-evidence',
    script: 'scripts/smoke-completion-gate-inventory-current-evidence.mjs',
    purpose: 'Completion gate inventory keeps current aggregate, UI QA, zero-open backlog, post-completion router, README count, and growth routing evidence aligned with the latest verified source state',
  },
  {
    id: 'post-completion-next-step-status',
    script: 'scripts/post-completion-next-step-status.mjs',
    purpose: 'Post-completion follow-up routes through an explicit operator request, regression, usability issue, or accepted vNext decision before any new implementation slice opens',
  },
  {
    id: 'growth-evidence-ledger-status',
    script: 'scripts/growth-evidence-ledger-status.mjs',
    purpose: 'Growth Evidence Ledger status fixes read-only typed evidence source buckets and ledger schemas before reflection handoff, proposal generation, memory persistence, provider calls, or gateway execution can act',
  },
  {
    id: 'growth-evidence-ledger-gateway-routing-status',
    script: 'scripts/growth-evidence-ledger-gateway-routing-status.mjs',
    purpose: 'Growth Evidence Ledger gateway routing status maps ledger evidence into owned gateway surfaces without granting execution authority, provider calls, memory persistence, source mutation, commits, or pushes',
  },
  {
    id: 'growth-evidence-ledger-reflection-handoff-status',
    script: 'scripts/growth-evidence-ledger-reflection-handoff-status.mjs',
    purpose: 'Growth Evidence Ledger reflection handoff status connects routed ledger evidence to reflection input without generating proposals, applying proposals, mutating source, persisting memory, calling providers, committing, or pushing',
  },
  {
    id: 'growth-evidence-ledger-proposal-readiness-status',
    script: 'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
    purpose: 'Growth Evidence Ledger proposal readiness status defines a read-only evidence envelope before proposal generation, proposal queue mutation, approval, source mutation, provider calls, commits, or pushes can act',
  },
  {
    id: 'growth-evidence-ledger-proposal-queue-handoff-status',
    script: 'scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
    purpose: 'Growth Evidence Ledger proposal queue handoff status maps proposal-readiness evidence into queue review input without creating records, mutating queues, approving proposals, calling providers, mutating source, committing, or pushing',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-readiness-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record readiness status classifies proposalRecord fields as preview-only, mapped review input, forced false, or blocked before any record creation, approval, queue mutation, source mutation, commit, or push can act',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-review-gate-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record review gate status defines a read-only human review boundary before any record creation, proposal approval, queue mutation, source mutation, commit, or push can act',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-creation-readiness-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record creation readiness status defines id/status/timestamp policies without generating ids, assigning status, stamping timestamps, creating records, mutating queues, committing, or pushing',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-shape-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-dry-run-shape-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run shape status covers the proposalRecord schema without assigning ids, status, timestamps, approval, persistence, queue mutation, commit, or push authority',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-validation-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-dry-run-validation-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run validation status validates schema coverage and non-authority invariants without creating, persisting, approving, promoting, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-dry-run-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review status reviews validation evidence without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-status',
    script: 'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance status accepts review evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization status finalizes acceptance evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review status reviews finalized evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance status accepts reviewed finalization evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization status finalizes accepted finalization review evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review status reviews finalized finalization review acceptance evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review acceptance finalization evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization status finalizes accepted finalization review acceptance finalization review evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review status reviews finalized finalization review acceptance finalization review acceptance finalization evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review acceptance finalization review acceptance finalization review evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization status finalizes accepted finalization review acceptance finalization review acceptance finalization review acceptance evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review status reviews finalized finalization review acceptance finalization review acceptance finalization review acceptance evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review acceptance finalization review acceptance finalization review acceptance evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization status finalizes accepted finalization review acceptance finalization review acceptance finalization review acceptance finalization review evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review status reviews finalized finalization review acceptance finalization review acceptance finalization review acceptance finalization review evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization status finalizes accepted finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review status reviews finalized finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-dry-run-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization status finalizes accepted finalization review evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review status reviews finalized finalization evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status accepts reviewed finalization review evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization alias finalizes accepted short-alias evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review alias reviews finalized short-alias evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance alias accepts reviewed short-alias evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization alias finalizes accepted short-alias evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review alias reviews finalized short-alias evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance alias accepts reviewed short-alias evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization alias finalizes accepted short-alias evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review alias reviews finalized short-alias evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script: 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance alias accepts reviewed short-alias evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a short alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization alias finalizes accepted short-alias evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review alias reviews finalized short-alias evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance alias accepts reviewed short-alias evidence only for read-only finalization checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization alias finalizes accepted short-alias evidence only for read-only review checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status',
    script:
      'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs',
    purpose: 'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review alias reviews finalized short-alias evidence only for read-only acceptance checking without approving, creating, persisting, promoting, implementing, or mutating proposal records; script uses a shorter alias path to avoid filesystem filename limits',
  },
  {
    id: 'growth-improvement-acceptance-status',
    script: 'scripts/smoke-growth-improvement-acceptance-status.mjs',
    purpose: 'Growth improvement acceptance status fixes read-only before/after evidence, regression, review, and approval criteria before accepted improvements can be recorded',
  },
  {
    id: 'growth-accepted-improvement-registry-status',
    script: 'scripts/smoke-growth-accepted-improvement-registry-status.mjs',
    purpose: 'Growth accepted improvement registry status fixes read-only accepted/rejected/deferred/rollback records before post-acceptance regression watch can act',
  },
  {
    id: 'growth-regression-watch-status',
    script: 'scripts/smoke-growth-regression-watch-status.mjs',
    purpose: 'Growth regression watch status fixes read-only post-acceptance regression signals before rollback review or remediation can act',
  },
  {
    id: 'growth-rollback-review-status',
    script: 'scripts/smoke-growth-rollback-review-status.mjs',
    purpose: 'Growth rollback review status fixes read-only rollback review states before remediation planning or rollback execution can act',
  },
  {
    id: 'growth-remediation-plan-status',
    script: 'scripts/smoke-growth-remediation-plan-status.mjs',
    purpose: 'Growth remediation plan status fixes read-only remediation plan fields before remediation approval, implementation proposals, or remediation execution can act',
  },
  {
    id: 'growth-remediation-approval-status',
    script: 'scripts/smoke-growth-remediation-approval-status.mjs',
    purpose: 'Growth remediation approval status fixes read-only approval gate fields before implementation proposals or remediation execution can act',
  },
  {
    id: 'growth-remediation-implementation-proposal-status',
    script: 'scripts/smoke-growth-remediation-implementation-proposal-status.mjs',
    purpose: 'Growth remediation implementation proposal status fixes read-only proposal fields before implementation review, source mutation, or remediation execution can act',
  },
  {
    id: 'growth-remediation-implementation-review-status',
    script: 'scripts/smoke-growth-remediation-implementation-review-status.mjs',
    purpose: 'Growth remediation implementation review status fixes read-only review gates before thin-slice readiness, source mutation, or remediation execution can act',
  },
  {
    id: 'growth-remediation-thin-slice-status',
    script: 'scripts/smoke-growth-remediation-thin-slice-status.mjs',
    purpose: 'Growth remediation thin-slice status fixes read-only target and authority readiness before source mutation or remediation execution can act',
  },
  {
    id: 'growth-remediation-execution-authority-status',
    script: 'scripts/smoke-growth-remediation-execution-authority-status.mjs',
    purpose: 'Growth remediation execution authority status fixes read-only approval, target-lock, and baseline gates before mutation preflight or remediation execution can act',
  },
  {
    id: 'growth-remediation-mutation-preflight-status',
    script: 'scripts/smoke-growth-remediation-mutation-preflight-status.mjs',
    purpose: 'Growth remediation mutation preflight status fixes read-only baseline digest, target-lock, restore, verification, and rollback gates before source mutation request or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-request-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-request-status.mjs',
    purpose: 'Growth remediation source mutation request status fixes read-only preflight, operator intent, target-lock, expected change-set, verification command, and rollback gates before source mutation authorization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-authorization-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-authorization-status.mjs',
    purpose: 'Growth remediation source mutation authorization status fixes read-only request, operator approval, target-lock, expected change-set, verification command, restore, and rollback gates before source mutation application preflight or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-application-preflight-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-application-preflight-status.mjs',
    purpose: 'Growth remediation source mutation application preflight status fixes read-only authorization, approved-request, target-lock, expected change-set, verification command, restore, rollback, and dry-run gates before source mutation draft or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-draft-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-draft-status.mjs',
    purpose: 'Growth remediation source mutation draft status fixes read-only application-preflight, file-update plan, patch draft, diff preview, verification command, dry-run proof, restore, and rollback gates before draft review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-draft-review-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-draft-review-status.mjs',
    purpose: 'Growth remediation source mutation draft review status fixes read-only draft, patch/diff, verification output, rollback proof, reviewer note, and negative-evidence gates before apply authorization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-authorization-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-authorization-status.mjs',
    purpose: 'Growth remediation source mutation apply authorization status fixes read-only passed draft review, operator intent, exact scope, verification output, rollback proof, and negative-evidence gates before apply preflight or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-preflight-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-preflight-status.mjs',
    purpose: 'Growth remediation source mutation apply preflight status fixes read-only current apply authorization, clean baseline, patch/diff proof, verification output, rollback proof, and negative-evidence gates before final apply execution readiness or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-execution-readiness-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
    purpose: 'Growth remediation source mutation apply execution readiness status fixes read-only current apply preflight, clean baseline, operator dispatch intent, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply dispatch or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-dispatch-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-dispatch-status.mjs',
    purpose: 'Growth remediation source mutation apply dispatch status fixes read-only current apply execution readiness, operator dispatch intent, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply execution or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-execution-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-execution-status.mjs',
    purpose: 'Growth remediation source mutation apply execution status fixes read-only current apply dispatch, operator dispatch intent, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply result or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-result-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-result-status.mjs',
    purpose: 'Growth remediation source mutation apply result status fixes read-only current apply execution, dispatch, operator intent, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply result review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-result-review-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-result-review-status.mjs',
    purpose: 'Growth remediation source mutation apply result review status fixes read-only current apply result, reviewer note, acceptance criteria, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply result acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-result-acceptance-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation apply result acceptance status fixes read-only current apply result review, acceptance decision notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply closure or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-closure-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-closure-status.mjs',
    purpose: 'Growth remediation source mutation apply closure status fixes read-only current apply result acceptance, closure decision notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before apply finalization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-apply-finalization-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-apply-finalization-status.mjs',
    purpose: 'Growth remediation source mutation apply finalization status fixes read-only current apply closure, finalization decision notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before post-apply audit or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-post-apply-audit-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-post-apply-audit-status.mjs',
    purpose: 'Growth remediation source mutation post-apply audit status fixes read-only current post-apply audit, apply finalization, audit notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before post-apply audit review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-post-apply-audit-review-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
    purpose: 'Growth remediation source mutation post-apply audit review status fixes read-only current review, audit evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation post-apply audit review acceptance status fixes read-only current review acceptance, audit review evidence, acceptance notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before source mutation completion or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-completion-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-completion-status.mjs',
    purpose: 'Growth remediation source mutation completion status fixes read-only current completion, review-acceptance evidence, completion decision notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before completion review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-completion-review-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-completion-review-status.mjs',
    purpose: 'Growth remediation source mutation completion review status fixes read-only current completion review, reviewer notes, review decision notes, current completion evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before completion review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-completion-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation completion review acceptance status fixes read-only current completion review acceptance, acceptance criteria, acceptance decision notes, current review evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-status',
    script: 'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout status fixes read-only current lifecycle closeout, accepted review evidence, closeout criteria, closeout decision notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout review status fixes read-only current lifecycle closeout review, reviewer notes, review decision notes, current closeout evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout review acceptance status fixes read-only current lifecycle closeout review acceptance, acceptance criteria, acceptance decision notes, current review evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure readiness or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure readiness status fixes read-only current lifecycle closeout closure readiness, closure readiness criteria, closure readiness decision notes, current review acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure authorization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure authorization status fixes read-only current lifecycle closeout closure authorization, closure authorization criteria, closure authorization decision notes, current closure readiness evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure execution readiness or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure execution readiness status fixes read-only current lifecycle closeout closure execution readiness, closure execution readiness criteria, closure execution readiness decision notes, current closure authorization evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure dispatch or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure dispatch status fixes read-only current lifecycle closeout closure dispatch, closure dispatch criteria, closure dispatch decision notes, current closure execution readiness evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure execution or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure execution status fixes read-only current lifecycle closeout closure execution, closure execution criteria, closure execution decision notes, current closure dispatch evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure result or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure result status fixes read-only current lifecycle closeout closure result, closure result criteria, closure result decision notes, current closure execution evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure result review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure result review status fixes read-only current lifecycle closeout closure result review, closure result review criteria, closure result review decision notes, reviewer notes, current closure result evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure result review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure result review acceptance status fixes read-only current lifecycle closeout closure result review acceptance, closure result review acceptance criteria, closure result review acceptance decision notes, reviewer notes, current closure result review evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure result acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure result acceptance status fixes read-only current lifecycle closeout closure result acceptance, closure result acceptance criteria, closure result acceptance decision notes, current closure result review acceptance evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure status or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure status fixes read-only current lifecycle closeout closure, closure criteria, closure decision notes, current closure result acceptance evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure review status fixes read-only current lifecycle closeout closure review, closure review criteria, closure review decision notes, current closure evidence, current closure result acceptance evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure review acceptance status fixes read-only current lifecycle closeout closure review acceptance, closure review acceptance criteria, closure review acceptance decision notes, current closure review evidence, current closure evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure acceptance status fixes read-only current lifecycle closeout closure acceptance, closure acceptance criteria, closure acceptance decision notes, current closure review acceptance evidence, current closure evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure finalization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure finalization status fixes read-only current lifecycle closeout closure finalization, closure finalization criteria, closure finalization decision notes, current closure acceptance evidence, current closure review acceptance evidence, current closure evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure finalization review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure finalization review status fixes read-only current lifecycle closeout closure finalization review, closure finalization review criteria, closure finalization review decision notes, current closure finalization evidence, current closure acceptance evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure finalization review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure finalization review acceptance status fixes read-only current lifecycle closeout closure finalization review acceptance, closure finalization review acceptance criteria, closure finalization review acceptance decision notes, current closure finalization review evidence, current closure finalization evidence, reviewer notes, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure finalization acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure finalization acceptance status fixes read-only current lifecycle closeout closure finalization acceptance, closure finalization acceptance criteria, closure finalization acceptance decision notes, current closure finalization review acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure final close or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure final close status fixes read-only current final close, final close criteria, final close decision notes, current finalization acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure lifecycle close or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close status fixes read-only current lifecycle close, lifecycle close criteria, lifecycle close decision notes, current final close evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure lifecycle close review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close review status fixes read-only current lifecycle close review, lifecycle close review criteria, lifecycle close review decision notes, current lifecycle close evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle closeout closure lifecycle close review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close review acceptance status fixes read-only current lifecycle close review acceptance, review acceptance criteria, review acceptance decision notes, current lifecycle close review evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close acceptance status fixes read-only current lifecycle close acceptance, lifecycle close acceptance criteria, lifecycle close acceptance decision notes, current lifecycle close review acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close finalization or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close finalization status fixes read-only current lifecycle close finalization, lifecycle close finalization criteria, lifecycle close finalization decision notes, current lifecycle close acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close finalization review or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close finalization review status fixes read-only current lifecycle close finalization review, lifecycle close finalization review criteria, lifecycle close finalization review decision notes, current lifecycle close finalization evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close finalization review acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close finalization review acceptance status fixes read-only current lifecycle close finalization review acceptance, lifecycle close finalization review acceptance criteria, lifecycle close finalization review acceptance decision notes, current lifecycle close finalization review evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close finalization acceptance or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close finalization acceptance status fixes read-only current lifecycle close finalization acceptance, lifecycle close finalization acceptance criteria, lifecycle close finalization acceptance decision notes, current lifecycle close finalization review acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close final close or remediation execution can act',
  },
  {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status',
    script:
      'scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs',
    purpose: 'Growth remediation source mutation lifecycle closeout closure lifecycle close final-close status fixes read-only current lifecycle close final-close, lifecycle close final-close criteria, lifecycle close final-close decision notes, current lifecycle close finalization acceptance evidence, clean baseline, patch/diff proof, verification output, dry-run proof, rollback proof, and negative-evidence gates before lifecycle close status can be re-checked',
  },
];

function runNodeScript(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ORCHESTRATION_VERIFICATION_STATUS: '1',
    },
  });

  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

function executeChecks(checks, blocking) {
  return checks.map((check) => {
    const result = runNodeScript(check.script);
    return {
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      blocking,
      ok: result.ok,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  });
}

function sleepSync(milliseconds) {
  const buffer = new SharedArrayBuffer(4);
  const view = new Int32Array(buffer);
  Atomics.wait(view, 0, 0, milliseconds);
}

function removeLockIfStale(now) {
  try {
    const stats = fs.statSync(lockPath);
    if (now - stats.mtimeMs < staleLockMs) {
      return false;
    }
    fs.rmSync(lockPath, { recursive: true, force: true });
    return true;
  } catch (_error) {
    return false;
  }
}

function acquireVerificationLock() {
  fs.mkdirSync(lockRoot, { recursive: true });
  const startTime = Date.now();

  while (Date.now() - startTime <= lockWaitMs) {
    try {
      fs.mkdirSync(lockPath);
      fs.writeFileSync(
        path.join(lockPath, 'owner.json'),
        `${JSON.stringify(
          {
            host: os.hostname(),
            pid: process.pid,
            startedAt: new Date().toISOString(),
          },
          null,
          2,
        )}\n`,
      );
      return { acquired: true, path: lockPath };
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error;
      }
      removeLockIfStale(Date.now());
      sleepSync(250);
    }
  }

  throw new VerificationLockTimeoutError(`Timed out waiting for verification_status lock: ${lockPath}`, {
    lockPath: path.relative(repoRoot, lockPath),
    waitedMs: lockWaitMs,
    staleLockMs,
    guidance:
      'Another verification_status process may be active. Wait for it to finish, or remove the stale lock only after confirming no process owns it.',
  });
}

function releaseVerificationLock(lock) {
  if (!lock?.acquired) {
    return;
  }
  fs.rmSync(lock.path, { recursive: true, force: true });
}

function buildReport() {
  const requiredResults = executeChecks(requiredChecks, true);
  const informationalResults = executeChecks(informationalChecks, false);
  const allResults = [...requiredResults, ...informationalResults];

  const failedRequiredChecks = requiredResults.filter((check) => !check.ok).length;
  const passedRequiredChecks = requiredResults.length - failedRequiredChecks;
  const failedInformationalChecks = informationalResults.filter((check) => !check.ok).length;
  const passedInformationalChecks = informationalResults.length - failedInformationalChecks;

  return {
    ok: failedRequiredChecks === 0,
    mode: 'synthetic-verification-status',
    concurrency: {
      lockPath: path.relative(repoRoot, lockPath),
      serialized: true,
      duplicateSmokeStatusAssertionsSkipped: true,
    },
    counts: {
      totalChecks: allResults.length,
      requiredChecks: requiredResults.length,
      passedRequiredChecks,
      failedRequiredChecks,
      informationalChecks: informationalResults.length,
      passedInformationalChecks,
      failedInformationalChecks,
    },
    required: requiredResults.map((check) => ({
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      ok: check.ok,
      status: check.status,
    })),
    informational: informationalResults.map((check) => ({
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      ok: check.ok,
      status: check.status,
    })),
    failures: allResults
      .filter((check) => !check.ok)
      .map((check) => ({
        id: check.id,
        script: check.script,
        blocking: check.blocking,
        status: check.status,
        signal: check.signal,
        stdout: check.stdout,
        stderr: check.stderr,
      })),
  };
}

let lock = null;
let exitCode = 1;

try {
  lock = acquireVerificationLock();
  const report = buildReport();
  exitCode = report.ok ? 0 : 1;
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (error instanceof VerificationLockTimeoutError) {
    writeFailure('lock-timeout', error.message, error.details);
    exitCode = 2;
  } else {
    throw error;
  }
} finally {
  releaseVerificationLock(lock);
}

process.exitCode = exitCode;
