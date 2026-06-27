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

process.exit(exitCode);
