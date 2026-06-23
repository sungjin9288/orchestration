# Orchestration Completion Development Roadmap

## Purpose
This document fixes the current development direction for finishing Orchestration without widening
the frozen runtime contract.

The goal is not to keep advancing read-only lifecycle status chains as the default next step. The
goal is to turn the implemented local-first execution engine and the implemented
`Mission / Council / Execution / Deliverables` shell into a finished, inspectable product baseline.

## Completion North Star
Orchestration is complete for the current baseline when an operator can:

1. enter a mission against a registered local project,
2. understand which AI roles are aligned on the work,
3. run bounded execution through the existing development pack gates,
4. inspect evidence, review, approvals, and close-out from Deliverables or Advanced Ops,
5. see exactly why the loop is complete, blocked, or waiting for a human gate.

`Taskboard / Logs / Artifacts / Decision Inbox` remain the authoritative advanced-ops surfaces.
The primary product experience remains `Mission / Council / Execution / Deliverables`.

## Non-Negotiables
- Keep the product `local-first / single-user-first / ops-first`.
- Keep `v1 scope = development pack only`.
- Keep `project_path` required before execution.
- Keep review before done and approval before commit.
- Keep release and close-out `local-demo-only`.
- Do not add messenger-first, ranking, OAuth-first, multi-provider-first, budget, HR,
  org-management, multiplayer workspace, or unattended automation semantics.
- Do not treat live-provider housekeeping, optional real-live verification, or lifecycle status
  rechecks as product completion blockers unless they reveal a concrete current regression.

## Workstreams

### 1. Product Completion
Make the implemented shell feel finished and usable as a company operating system for AI work.

- `Mission`: clarify first-run entry, project selection, mission creation, linked task handoff,
  success checks, and stop/escalation conditions.
- `Council`: make role attendance, recommendation, objections, and alignment decision legible.
- `Execution`: keep current stage, owner, gate, blocked reason, and next safe action visible.
- `Deliverables`: summarize current packet, review status, approval line, verification evidence,
  close-out state, and remaining open work.
- `Advanced Ops`: keep Taskboard, Logs, Artifacts, and Decision Inbox visually aligned with the
  same company-shell language without changing their runtime authority.

### 2. Execution Reliability
Keep the current development pack loop stable and evidence-driven.

- Preserve the existing stage order:
  `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`.
- Preserve explicit downstream follow-up:
  `commit-package -> local commit -> release-package -> close-out`.
- Treat provider execution as explicit opt-in and fail-closed.
- Keep synthetic gates authoritative; keep optional real-live gates non-blocking unless a future
  decision promotes them.
- Continue lifecycle status commands only when they prove or repair a current stale source-of-truth
  mismatch.

### 3. Evidence And Portfolio Readiness
Prepare the repo for honest external review without unsupported claims.

- Keep README claims source-backed and measurable.
- Keep `Scope & Limitations` current.
- Keep demo, smoke, and verification instructions runnable from repo files.
- Record what was actually checked, what was skipped, and why.
- Do not publish demo or operational links unless access has been verified.

### 4. Growth Loop Readiness
Use Loop Engineering as a bounded operating model.

- Every loop slice names `Discover / Plan / Execute / Verify / Iterate` posture.
- Every loop slice names success, retry, escalation, and stop conditions.
- Any self-improvement, memory, skill, automation, or connector work stays approval-gated and
  source-of-truth-backed.
- Open-loop or unattended automation remains out of scope until a separate decision defines budget,
  retry, rollback, redaction, and human approval boundaries.

## Completion Gates
The current baseline can be called complete only when all gates below are true.

- Required source/runtime/UI synthetic gates pass for the touched surface.
- At least one current local demo path is documented or explicitly marked unverified with a reason.
- Product shell surfaces show current owner, current gate, current packet, and next safe action.
- Advanced Ops remains available and authoritative for raw task, run, artifact, approval, and log
  inspection.
- README and portfolio-facing docs contain no unsupported metrics or capability claims.
- `tasks/todo.md` has no active unchecked item that is a hidden blocker for the current completion
  lane.
- Any optional live-provider or real-live check is recorded as pass, fail, or skipped with concrete
  environment evidence.

## Immediate Next Slices

### Slice 1: `completion-gate-inventory`
Inventory the required synthetic gates, optional real-live gates, local demo steps, README honesty
checks, and remaining product-shell gaps.

Stop condition: a single source-backed table identifies required, optional, skipped, and missing
evidence without adding runtime behavior.

Implemented evidence: `docs/22_completion-gate-inventory.md` records the current gate table. The
follow-up harness memory-brief open-lane mismatch was reclassified by aligning the focused smoke to
the current completion lane while keeping `memory-brief` read-only.

### Slice 2: `completion-first-run-product-polish`
Tighten the first operator path from project selection and mission creation into council alignment
and execution handoff.

Stop condition: Mission first-run state explains the next bounded move without long helper copy and
without hiding `project_path` or linked task provenance.

Implemented evidence: `ui/app.js` now derives Mission first-run handoff from current Mission,
Council alignment, and linked task state. The source smoke `scripts/smoke-ui-slice-647.mjs` pins
the bounded route sequence as Mission registration, Council alignment, linked execution cell
creation, and Execution handoff without adding runtime routes.

### Slice 3: `completion-deliverables-evidence-polish`
Tighten Deliverables so review, approval, verification, close-out, and next-cycle readiness are
visible without leaving the primary product shell.

Stop condition: Deliverables can answer what changed, what passed, what is blocked, and what the
operator can safely do next.

Implemented evidence: `ui/app.js` now derives a read-only Deliverables completion summary from the
current artifact, review result, approval line, execution evidence, close-out state, release-package
state, commit-package state, and reviewer readiness. The source smoke `scripts/smoke-ui-slice-648.mjs`
pins the changed, passed, blocked, and safe-next labels while preserving existing release-package,
close-out, inbox approval, and execution routes only.

### Slice 4: `completion-readme-scope-evidence-pass`
Refresh public-facing docs from code and verification evidence only.

Stop condition: README and portfolio-facing docs have current setup, testing, scope, limitations,
and links with no unsupported numbers or unverified capability claims.

Implemented evidence: `README.md` now states current setup, local API usage, source-derived route
surface, source-derived optional OpenAI env vars, measured smoke file counts, current-head local API
evidence from 2026-06-23, and explicit scope limitations. The source smoke
`scripts/smoke-readme-scope-evidence.mjs` pins README section order, honesty patterns, measured
counts, missing root `.env.example` / `package.json` notes, and server route coverage.

## Status-Loop Boundary
The growth lifecycle read-only status chain remains supporting evidence, not the default product
development path.

Continue a lifecycle status recheck only when the current completion gate inventory or verification
run finds a stale command, stale reference, or source-of-truth mismatch. Otherwise, move the next
slice through the completion workstreams above.

Implemented evidence: `docs/22_completion-gate-inventory.md` now records the lifecycle status chain
as pass/supporting-only after the product-shell, Deliverables, README, and local demo evidence passes.
The source smoke `scripts/smoke-lifecycle-supporting-boundary.mjs` pins that this chain is not the
default product development lane and can be reopened only for stale command, stale source reference,
or source-of-truth mismatch evidence.

## Post-Completion Follow-Up Router
After the zero-open completion baseline, follow-up work starts only from an explicit operator
request, concrete regression, usability issue, or accepted vNext decision.

Implemented evidence: `scripts/post-completion-next-step-status.mjs` emits the read-only routing
status for that boundary. It records the zero-open backlog state, the explicit-entry reasons, the
non-blocking optional-live env status, the recommended vNext read-only growth-loop posture, and the
no-mutation boundary before any future runtime or UI slice opens.
