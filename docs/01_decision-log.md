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
- Decision: The shell first-run path is the `Taskboard` project registry: start from an empty runtime state, register the first project with `name` and `project_path`, make it the active project immediately, reuse the same registry list for later project selection, and reuse the same create/select path when switching the active project to a detected or newly created linked worktree root.
- Why: This is the implemented v1 path. The runtime initializes with no active project, the shell exposes first-run bootstrap and project-selection states, task creation plus other primary surfaces stay gated until an active project exists, and linked worktree create or switch stays a project-scope operation instead of a separate migration workflow.
- Impact: `project_path required before execution` stays enforced without pre-seeded runtime state. Linked worktree switching remains explicit at the project level, `task.worktreeRef` remains an explicit task relation instead of an auto-migrated field, and this decision does not add a new bootstrap wizard, provider semantics, or broader runtime or UI behavior.

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
- Decision: Before `release-package` or `close-out`, `project_path` must resolve to a registered dedicated linked git worktree root, not the main worktree. `task.worktreeRef`, when set, must match that same root. This requirement does not apply to the earlier planner-through-local-commit core loop even though the shell can already detect, create, and switch linked worktree projects before that point.
- Why: This is the implemented boundary. The coordinator enforces the dedicated linked worktree guard only on `release-package` and `close-out`, while the current real-path dev-loop smoke closes planner through local commit on a clean temp repo without worktree orchestration. Shell-level linked worktree create/switch reuse the existing project registry flow, but that does not widen the execution guard.
- Impact: `DEC-026` closes as a narrow release-gate requirement. v1 may expose linked worktree detection, creation, selection, and explicit `task.worktreeRef` assignment in the shell, but it still does not require worktree orchestration for the earlier planner-through-local-commit loop and does not auto-assign task worktree relations.

### DEC-027
- Status: `Accepted`
- Decision: Close-out runs from the latest approved `release-package` bundle and is the explicit shell path from `Review` to `Done`.
- Why: This is now implemented end to end. The coordinator computes close-out readiness from passed review, clear task flags, clean repo state, the current approved `release-package` bundle, and approved `release-ready` approval, and the shell exposes a dedicated close-out action and route.
- Impact: The shell records a `close-out` artifact, then transitions the task `Review -> Done` without push, publish, or external release. Stale or duplicate close-out attempts remain blocked.

### DEC-028
- Status: `Accepted`
- Decision: The shipped v1 human-gate and release scope is explicit and stays local-only. `request-builder-live-mutation-approval`, `commit-package`, and `release-package` are approval-producing steps; `builder live-mutation`, `local commit`, and `close-out` are approval-consuming steps. `close-out` is a finalization step that consumes the latest approved `release-package` provenance instead of executing release automation.
- Why: This matches the implemented runtime, coordinator, and shell behavior. Builder approval targets the latest `preflight`, `commit-package` raises `commit-intent` approval without running git commit, `release-package` raises `release-ready` approval without push/publish/external release, and `close-out` only finalizes `Review -> Done` from the latest approved local-demo-only release bundle.
- Impact: Remaining release or human-gate scope is no longer implied. Docs can distinguish approval request steps from approval consumer steps without adding capabilities or changing runtime, execution, or UI semantics. Push, publish, external release, and merge automation remain out of scope.

### DEC-020
- Status: `Accepted`
- Decision: `Decision Inbox` top-level kinds stay fixed to `review`, `decision`, and `approval`. `review-follow-up` normalizes to `kind=decision, sourceType=review`, and `unblock/clarification` normalizes to `kind=decision, sourceType=decision, blocksTask=false`.
- Why: This matches the implemented queue and action model without adding a new product capability. The current shell already treats review items as read-only gate markers, decision items as resolve-only, and approval items as approve/reject-only.
- Impact: The allowed matrix is fixed to `sourceType=approval -> kind=approval`, `sourceType=review -> kind=review|decision`, and `sourceType=decision -> kind=decision`. `blocksTask=true` is only valid on `kind=decision`. `waitingDecision` remains driven by pending decision items, `waitingApproval` remains driven by pending approval records, and review items continue to resolve through the review flow rather than the generic inbox action route.

### DEC-018
- Status: `Accepted`
- Decision: Normalize artifact retention, preview, browse, and source-of-truth rules to the current implemented taxonomy. Tier A provenance-critical artifacts are `preflight`, `change-summary`, `patch`, `diff`, `review`, `commit-package`, `commit-result`, `release-package`, and `close-out`, and they always retain history. `plan`, `architecture`, and `breakdown` are latest-centered browse artifacts with history retained. `output` remains an allowed generic Tier C fallback only. `decision`, `approval`, `execution-log`, and `verification` are not artifact types in the current core loop.
- Why: This matches the implemented runtime, coordinator, and UI behavior without adding delete, archive, or garbage-collection capability. Artifacts already persist as raw stored files plus runtime metadata, structured previews are best-effort with raw fallback, and downstream readiness is anchored to exact artifact and run provenance.
- Impact: `recordArtifact` may validate types on write, repo docs plus runtime contracts define the allowed taxonomy, and `Artifacts` keeps latest-first browsing without weakening raw-source-of-truth fallback. No read-path migration, lifecycle expansion, provider change, or cleanup capability is added.

### DEC-029
- Status: `Accepted`
- Decision: Define the live-provider opt-in boundary that extends `DEC-016` without changing the shipped default. `local-demo-only` via `local-stub` remains the baseline, and any live provider is an explicit operator opt-in that only changes the adapter used for role execution (`planner`, `architect`, `task-breaker`, `builder`, `reviewer`).
- Why: The repo already has one adapter seam and a fixed local-only delivery stance, but it did not yet define how a future live provider could opt in without leaking provider semantics into lifecycle, approval, artifact, release, or UI behavior.
- Impact: Provider selection and delivery stance are separate concerns. `release-package` and `close-out` remain `local-demo-only`; no live-provider opt-in may weaken review, approval, worktree, or artifact provenance rules. The core adapter contract stays `name + execute(request)` with the current response shape, while any future live adapter may add only opt-in metadata for supported roles, config requirements, readiness probing, and safe error classification. Secrets stay operator-local and must not be written into runtime state, artifacts, logs, approvals, or UI payloads. Provider health may surface only as a coarse opt-in readiness summary such as `not-configured`, `ready`, `degraded`, or `error`; it must not redefine project readiness, add provider-admin UI, or silently fall back to `local-stub` when explicit live opt-in fails.

### DEC-031
- Status: `Accepted`
- Decision: The first concrete live provider is `OpenAI Responses API`, and the first live execution scope is `planner` only. `local-stub` remains the shipped default, live execution remains explicit operator opt-in plus fail-closed plus no-fallback, and the concrete model stays operator-pinned project config instead of a repo default.
- Why: This keeps the first live slice inside the smallest proven boundary. The current adapter contract already expects one `execute(request)` result with `outputText`, `model`, `providerRunId`, `normalizedResult`, and optional `usage`, which aligns cleanly with an OpenAI Responses-backed adapter. Restricting first live scope to `planner` avoids widening builder, reviewer, approval, provenance, worktree, or release semantics before they need live-provider behavior.
- Impact: `DEC-029` remains the general opt-in boundary, while this new decision fixes the first concrete provider and scope without widening runtime behavior. The canonical live adapter id is `openai-responses`; legacy `live-provider` may exist only as a temporary compatibility alias during transition. Provider readiness remains project-level coarse state only. Live config continues to store only non-secret metadata such as provider mode, adapter id, operator-pinned model, and env-var name; actual secret values stay out of runtime state, logs, artifacts, approvals, and UI payloads. Planner live output should use Responses Structured Outputs with `text.format.type=json_schema` so the adapter receives both `artifactMarkdown` and `normalizedResult` in one schema-backed payload. `outputText` should prefer top-level `response.output_text`, and when that field is absent the adapter should safely aggregate `output_text` content items from the `output` array without index-specific assumptions. `architect`, `task-breaker`, `builder`, and `reviewer` remain outside the first live scope until a later explicit decision.

## [OPEN]

### DEC-030
- Status: `[OPEN]`
- Decision: Define when and how a future retention consumer may apply delete, archive, or GC behavior to the normalized Tier A/B/C artifact rules from `DEC-018`.
- Why: The runtime already classifies artifact retention tiers, but the current file store and runtime only retain history and do not implement cleanup semantics. Before any cleanup capability exists, provenance-critical artifacts and latest-centered browse behavior need an explicit protection and failure-policy contract.
- Impact: Future cleanup work should consume the existing retention tiers instead of inventing parallel artifact rules. Tier A provenance-critical artifacts must stay protected, Tier B latest-centered history must keep inspectable retention behavior, and any cleanup action must remain explicit rather than hidden drift.
- Needed Before: adding delete, archive, or GC capability to runtime, coordinator, or UI flows

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
