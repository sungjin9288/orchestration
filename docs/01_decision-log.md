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

### DEC-016
- Status: `[OPEN]`
- Decision: Choose the initial provider for the single-provider-first adapter.
- Why It Is Open: The strategy is set, but the concrete provider is still unspecified.
- Needed Before: runtime adapter implementation starts.

### DEC-017
- Status: `[OPEN]`
- Decision: Finalize the initial task state machine.
- Why It Is Open: It is not yet settled whether `Blocked`, `Waiting Approval`, and `Waiting Decision` are states, flags, or queues.
- Needed Before: `Taskboard` interaction and task contract implementation.

### DEC-018
- Status: `[OPEN]`
- Decision: Define the artifact taxonomy for reports, evidence, runbooks, and generated outputs.
- Why It Is Open: `Artifacts` cannot be implemented well without stable types and retention rules.
- Needed Before: artifact storage and browsing flows.

### DEC-019
- Status: `[OPEN]`
- Decision: Define the exact scope of bootstrap.
- Why It Is Open: It is not yet decided whether bootstrap stops at scaffold and checks or also seeds example project setup.
- Needed Before: first-run flow design.

### DEC-020
- Status: `[OPEN]`
- Decision: Define `Decision Inbox` item types and escalation rules.
- Why It Is Open: Decision, review, and approval may share one queue or require distinct subtypes and actions.
- Needed Before: inbox UI and runtime gate wiring.

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
