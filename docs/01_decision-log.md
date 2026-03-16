# Orchestration 1.0 Decision Log

This file records product and architecture decisions that shape v1. Add a new entry when a scope, workflow, contract, or boundary changes in a way that affects implementation.

## Status Legend
- `Accepted`: active decision for v1
- `Rejected`: explicitly out of scope or intentionally avoided
- `[OPEN]`: unresolved and blocking or shaping future implementation

## Accepted

### DEC-001
- Status: `Accepted`
- Decision: Orchestration 1.0 is `local-first / single-user-first / ops-first`.
- Why: These constraints keep the product focused on inspectable local execution instead of office simulation or team platform work.
- Impact: Local projects, local files, and operational visibility are first-class. Team and cloud abstractions stay secondary.

### DEC-002
- Status: `Accepted`
- Decision: `v1 scope = development pack only`.
- Why: A single pack keeps the first release narrow enough to verify end to end.
- Impact: Non-development packs and generalized pack expansion are deferred.

### DEC-003
- Status: `Accepted`
- Decision: Primary UI surfaces are `Taskboard`, `Logs`, `Artifacts`, and `Decision Inbox`.
- Why: The operator needs status, execution evidence, and gates before conversational or decorative surfaces.
- Impact: Chat shells, office views, and dashboard extras cannot displace these four surfaces.

### DEC-004
- Status: `Accepted`
- Decision: `project_path` is required before any execution.
- Why: Execution without an explicit repo context breaks traceability and policy enforcement.
- Impact: Project selection or registration is mandatory before task execution.

### DEC-005
- Status: `Accepted`
- Decision: Review happens before a task is considered done.
- Why: Completion without review hides regressions and weakens the control plane.
- Impact: Task state and UI must model review explicitly.

### DEC-006
- Status: `Accepted`
- Decision: Approval is required before commit.
- Why: Human authorization is a distinct gate from automated execution or review.
- Impact: Commit paths must stop on missing approval and surface the gate in `Decision Inbox`.

### DEC-007
- Status: `Accepted`
- Decision: `claw-empire` is a reference for runtime/control-plane patterns only.
- Why: The repo offers useful patterns, but its product framing does not match this project.
- Impact: Borrow `project/task/worktree/log/report/api/AGENTS/bootstrap` ideas selectively and rewrite contracts for Orchestration 1.0.

### DEC-008
- Status: `Accepted`
- Decision: Start with a single provider behind an adapter boundary.
- Why: v1 needs reliability and explicit state more than provider breadth.
- Impact: Provider replacement can be designed for later, but provider matrix work is deferred.

### DEC-009
- Status: `Accepted`
- Decision: Source-of-truth policy and contracts live in repo files.
- Why: Local-first operation requires inspectable, versioned rules.
- Impact: `AGENTS.md`, docs, and pack definitions shape runtime behavior and review expectations.

### DEC-016
- Status: `Accepted`
- Decision: Fix the v1 provider stance to `local-demo-only` by default: the shipped path uses the built-in `local-stub` adapter, while any live provider remains a future explicit opt-in behind the same adapter boundary.
- Why: This matches the implemented path. The execution coordinator defaults to `local-stub`, `release-package` and `close-out` carry `deliveryStance=local-demo-only`, and the current core loop plus release gate stay local-only without push, publish, or external release.
- Impact: Provider-agnostic interface language stays intact, but the v1 success baseline is the local `development` pack core loop. This decision does not add a live provider or change runtime, execution, or UI semantics.

### DEC-019
- Status: `Accepted`
- Decision: The shell first-run path is the `Taskboard` project registry: start from an empty runtime state, register the first project with `name` and `project_path`, make it the active project immediately, and reuse the same registry list for later project selection.
- Why: This is the implemented v1 path. The runtime initializes with no active project, the shell exposes first-run bootstrap and project-selection states, and task creation plus other primary surfaces stay gated until an active project exists.
- Impact: `project_path required before execution` stays enforced without pre-seeded runtime state. This decision does not add a new bootstrap wizard, provider semantics, or broader runtime or UI behavior.

### DEC-021
- Status: `Accepted`
- Decision: The current core-loop lifecycle is `Inbox -> In Progress -> Review -> Done`.
- Why: This is the implemented lifecycle that preserves review-before-done without adding extra status churn during v1 consolidation.
- Impact: Any additional lifecycle column such as `Planned` stays deferred until a later explicit decision.

### DEC-022
- Status: `Accepted`
- Decision: `Blocked`, `Waiting Approval`, and `Waiting Decision` are task flags, not lifecycle statuses.
- Why: Gate state must stay visible across surfaces without multiplying lifecycle states or drifting from the development-pack contract.
- Impact: Runtime, coordinator, and UI derive readiness from flags plus inbox and approval records.

### DEC-023
- Status: `Accepted`
- Decision: Builder execution is split into explicit `preflight` and `live-mutation` modes.
- Why: No-write planning and bounded file mutation need distinct guardrails, artifacts, and approval semantics.
- Impact: The latest approved preflight plus targeted approval are required before live mutation may proceed.

### DEC-024
- Status: `Accepted`
- Decision: Reviewer input is anchored to the latest builder live-mutation bundle only.
- Why: Review provenance becomes unreliable when artifacts are mixed across runs by type instead of by source bundle.
- Impact: Reviewer, commit-package, and local commit flows all trace back to one builder bundle.

### DEC-025
- Status: `Accepted`
- Decision: Commit flow is split into `commit-package` and `local commit`, while push, merge, and release stay out of scope.
- Why: Approval-before-commit can be enforced locally without widening into release automation during v1.
- Impact: Human gate approves the current commit-package bundle first; local commit executes only after that approval.

### DEC-026
- Status: `Accepted`
- Decision: Before `release-package` or `close-out`, `project_path` must resolve to a registered dedicated linked git worktree root, not the main worktree. `task.worktreeRef`, when set, must match that same root. This requirement does not apply to the earlier planner-through-local-commit core loop.
- Why: This is the implemented boundary. The coordinator enforces the dedicated linked worktree guard only on `release-package` and `close-out`, and the current real-path dev-loop smoke closes planner through local commit on a clean temp repo without worktree orchestration.
- Impact: `DEC-026` closes as a narrow release-gate requirement. v1 does not add automatic worktree creation, selection UX, or broader runtime/UI worktree semantics in this patch.

### DEC-027
- Status: `Accepted`
- Decision: Close-out runs from the latest approved `release-package` bundle and is the explicit shell path from `Review` to `Done`.
- Why: This is now implemented end to end. The coordinator computes close-out readiness from passed review, clear task flags, clean repo state, the current approved `release-package` bundle, and approved `release-ready` approval, and the shell exposes a dedicated close-out action and route.
- Impact: The shell records a `close-out` artifact, then transitions the task `Review -> Done` without push, publish, or external release. Stale or duplicate close-out attempts remain blocked.

## Rejected

### DEC-010
- Status: `Rejected`
- Decision: Do not make office-first or pixel-office UI the primary product surface.
- Why: It optimizes for presentation instead of execution control.
- Impact: Any office or radar view is, at most, a later read-only companion.

### DEC-011
- Status: `Rejected`
- Decision: Do not make messenger-first workflows part of v1.
- Why: Messaging adapters add operational and auth complexity without solving the core control-plane problem.
- Impact: The product centers on local UI and local inbox flows instead.

### DEC-012
- Status: `Rejected`
- Decision: Do not introduce ranking, XP, or leaderboard systems in v1.
- Why: Gamification does not help a single operator manage blockers, evidence, or approvals.
- Impact: Operational metrics, if added, should focus on throughput, blocker age, and review latency.

### DEC-013
- Status: `Rejected`
- Decision: Do not build a generalized OAuth layer for v1.
- Why: Platform auth work pulls the product away from local-first execution.
- Impact: Provider-specific auth, if needed, stays inside the relevant adapter boundary.

### DEC-014
- Status: `Rejected`
- Decision: Do not build multi-provider-first orchestration in v1.
- Why: It widens the matrix before the core lifecycle is stable.
- Impact: One provider path is enough for the first vertical slices.

### DEC-015
- Status: `Rejected`
- Decision: Do not fork `claw-empire` as the product baseline.
- Why: The project needs selective reuse, not inheritance of unrelated framing or architecture.
- Impact: Contracts and docs must be written from first principles for this repo.

## [OPEN]

### DEC-018
- Status: `[OPEN]`
- Decision: Finalize artifact retention, preview, and browse rules for the current taxonomy.
- Why It Is Open: The baseline types now exist in the core loop, but retention behavior and preview guarantees are still incomplete.
- Needed Before: release hardening of `Artifacts`.

### DEC-020
- Status: `[OPEN]`
- Decision: Finalize `Decision Inbox` item taxonomy and escalation rules.
- Why It Is Open: Approval, decision, and review-follow-up now share one queue, but the release rules for routing, escalation, and operator expectations are still incomplete.
- Needed Before: release or human-gate sign-off.

## New Decision Template
Use this template for future entries:

```md
### DEC-XXX
- Status: `Accepted|Rejected|[OPEN]`
- Decision:
- Why:
- Impact:
- Needed Before:
```
