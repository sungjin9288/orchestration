# Development Pack

## Purpose
This pack defines the only v1 workflow pack for Orchestration 1.0. It governs how development work is routed, planned, architected, broken down, built, reviewed, and gated on a local project with explicit evidence, review, approval, and decision handling.

The pack exists to keep development execution inspectable and controlled:
- local-first
- single-user-first
- ops-first
- `project_path` required before execution
- review before done
- approval before commit

## Pack Boundary / Operating Principles
- `development` is the only in-scope pack for v1.
- Repo files are the source of truth for workflow policy and contracts.
- This pack applies to local project work only. It does not define office-first, messenger-first, ranking, OAuth, or multi-provider-first behavior.
- `project_path` is required before any execution, run, or build step starts.
- Thin-slice / vertical-slice work is preferred over broad scaffolding or platform expansion.
- The builder must not silently change architecture. If an architectural change is discovered or required, the task must route back through architecture review and, when needed, a human decision.
- Review is a required gate before a task can be considered done.
- Approval is a required gate before commit.
- Provider-agnostic contract language stays intact. The shipped v1 default remains `local-demo-only` via the built-in `local-stub` adapter, and the current implemented live opt-in stays narrowly limited to planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation plus reviewer `openai-responses` execution behind the same adapter boundary.
- `milestone-m4-live-freeze` fixes that current live-provider baseline at planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation plus reviewer only; `commit-package`, `local commit`, `release-package`, and `close-out` remain explicit downstream local follow-up.
- `provider-slice-05` implements the accepted builder-preflight live boundary without widening commit-package, local commit, release-package, or close-out semantics.
- `provider-slice-06` implements the accepted builder-live-mutation live boundary with bounded file updates, atomic `change-summary / patch / diff` persistence, and fail-closed approval consumption semantics.
- `provider-slice-07` implements the accepted reviewer live boundary with latest successful builder-bundle anchoring, canonical review markdown persistence, and explicit downstream commit-package follow-up.

## Entry Criteria
A task may enter this pack only when all of the following are true:
- An active project exists and its `project_path` is valid.
- The requested work is within `development` pack scope.
- The task or request has a clear intent, target outcome, or problem statement.
- Relevant repo policy and contract files are available to the workflow.
- Existing blockers, pending approvals, and pending decisions are visible before execution starts.

If any entry criterion is missing, the workflow must stop at routing or raise a decision item instead of proceeding silently.

## Stage Sequence
Contract stage flow:

`router -> planner -> architect -> task-breaker -> builder -> reviewer -> human gate`

Current implemented flow for the shipped v1 slice:

`router -> planner -> architect -> task-breaker -> builder(preflight) -> human gate(builder-live-mutation approval) -> builder(live-mutation) -> reviewer -> commit-package -> human gate(commit approval) -> local commit -> release-package -> human gate(release approval) -> close-out`

Rules for stage flow:
- Stages run in order unless a blocking gate routes the task into `Decision Inbox`.
- `Blocked`, `Waiting Approval`, and `Waiting Decision` are task flags, not lifecycle statuses.
- A flag may coexist with a lifecycle state such as `Inbox`, `In Progress`, `Review`, or `Done`.
- When a flag is raised, the task stays visible in its current lifecycle state while the gate is surfaced in `Taskboard` and `Decision Inbox`.
- A task resumes from the blocked stage or the next appropriate stage after the gate is resolved.
- The contract stays stage-oriented, but the current implementation already exposes the downstream `commit-package`, `local commit`, `release-package`, and `close-out` follow-up steps explicitly.
- `request-builder-live-mutation-approval` creates the approval for the latest `preflight`; `builder(live-mutation)` only consumes that approved preflight target.
- `commit-package` creates `commit-intent` approval and does not run git commit; `local commit` only consumes the approved current commit-package provenance.
- `release-package` creates `release-ready` approval and does not push, publish, merge, or execute external release; `close-out` only consumes the latest approved current `release-package` bundle provenance and finalizes `Review -> Done`.

## Linked Worktree Rule
- The shell may detect, create, and switch linked worktree roots before downstream release follow-up.
- The earlier planner-through-local-commit core loop does not require worktree orchestration.
- Before `release-package` or `close-out`, the active `project_path` must resolve to a registered dedicated linked worktree root, not the main worktree.
- When `task.worktreeRef` is set for those downstream steps, it must match that same linked worktree root exactly.

## Stage Contracts
### Router
Responsibilities:
- Verify active project context and valid `project_path`.
- Confirm the request belongs to the `development` pack.
- Identify whether the work is a new task, existing task continuation, review follow-up, approval request, or decision follow-up.
- Surface missing context, ambiguity, or out-of-scope conditions instead of letting them pass downstream.

Required result:
- A routed task with clear scope, visible current flags, and enough context to plan.

### Planner
Responsibilities:
- Translate the routed request into a thin-slice / vertical-slice plan.
- Define the intended outcome, acceptance target, and verification approach.
- Call out dependencies, expected artifacts, and any downstream linked-worktree requirement that later release or close-out must respect.
- Avoid broad or speculative expansion when a narrower slice can prove the path.

Required result:
- A concrete execution plan that is small enough to review and verify.

### Architect
Responsibilities:
- Check the plan against current architecture and repo contracts.
- Confirm whether the change fits existing boundaries or needs an explicit architecture decision.
- Identify architecture-sensitive areas, policy impacts, and decision-log implications.
- Stop silent drift by escalating meaningful architectural changes before build work proceeds.

Required result:
- An architecture note or decision reference that makes the intended boundary explicit.

### Task-Breaker
Responsibilities:
- Break the approved plan into executable sub-tasks and checkpoints.
- Keep tasks ordered, inspectable, and narrow enough to maintain momentum.
- Make review points, artifact expectations, and verification checkpoints explicit.
- Prefer steps that produce observable end-to-end movement over isolated internal churn.
- Preserve the current plan-plus-architecture provenance chain and do not recombine stale upstream artifacts.
- Preserve the current breakdown markdown contract so downstream parser and UI behavior stay stable.

Required result:
- An actionable breakdown that the builder can execute without widening scope.

### Builder
Responsibilities:
- Execute the approved task breakdown inside the project context.
- Run explicit `preflight` before any write and keep no-write planning separate from bounded live mutation.
- Produce the intended code, config, docs, or operational changes for the slice once the current preflight-targeted approval exists.
- Capture execution evidence, logs, diffs, and verification outputs.
- Route back to `architect` or `human gate` if the work reveals an unapproved architecture change, policy conflict, or decision need.

Required result:
- Built changes and supporting evidence that match the approved scope and the latest approved preflight boundary.

### Reviewer
Responsibilities:
- Inspect the built result for correctness, regressions, and contract compliance.
- Anchor review input to the latest builder live-mutation bundle only and do not recombine latest artifacts by type across task history.
- Run the most relevant practical verification available for the change.
- Record findings, required changes, accepted risks, and evidence.
- Keep reviewer output limited to the review artifact plus explicit follow-up to `builder`, `architect`, or `human gate`; do not create approval or run commit or release follow-up inside review.
- Prevent premature completion when verification or review evidence is missing.

Required result:
- A review record with explicit outcome, linked verification evidence, and explicit follow-up posture.

### Human Gate
Responsibilities:
- Resolve human-required approval and decision items.
- Resolve decision follow-up created by planner, architect, task-breaker, builder preflight, or reviewer when those stages route to `Decision Inbox`.
- Approve or reject builder live-mutation, `commit-intent`, and `release-ready` approvals only; the corresponding execution step consumes the approval later.
- Resolve review follow-up or clarification items that cannot be closed automatically.
- Clear or maintain `waiting_approval` and `waiting_decision` flags based on explicit human action.

Required result:
- An approval or decision record, or an explicit statement that no pending human gate remains.

## Required Inputs
Minimum inputs for this pack:
- Active project identity
- Valid `project_path`
- Task or request intent
- Relevant repo policy and contract files
- Current task lifecycle state
- Current task flags: `blocked`, `waiting_approval`, `waiting_decision`
- Linked repo or worktree context when implementation work is involved
- Any existing review, approval, or decision context already attached to the task

## Required Outputs / Artifacts
Each task should leave behind inspectable outputs tied back to the task and, when applicable, the originating run.

Minimum required outputs:
- Routing outcome
- Plan
- Architecture note or decision reference
- Task breakdown
- Build evidence
- Review record
- Approval or decision record when a human gate exists

Current artifact taxonomy:
- Tier A provenance-critical: `preflight`, `change-summary`, `patch`, `diff`, `review`, `commit-package`, `commit-result`, `release-package`, `close-out`
- Tier B latest-centered browse with history retained: `plan`, `architecture`, `breakdown`
- Tier C generic fallback only: `output`

These are not artifact types in the current core loop:
- `decision`
- `approval`
- `execution-log`
- `verification`

Current storage and browse rules:
- All artifact history is retained in v1 because delete/archive/GC capability is out of scope.
- `Artifacts` may browse latest generated outputs first, but Tier B artifacts remain history-retained and should not be collapsed into single mutable slots.
- Structured preview is always best-effort with raw fallback. No structured-only artifact exists in the current shell contract.
- Raw stored artifact content plus runtime metadata remain the source of truth. Client-derived relations and structured previews are convenience only.

Artifact expectations:
- `plan`: scoped execution plan, acceptance target, verification intent
- `architecture`: architecture check, boundary note, decision-log linkage
- `breakdown`: ordered sub-tasks, checkpoints, review triggers, and stop/escalate conditions
- `preflight`: target files, intended changes, risks, verification plan, and escalation triggers
- `change-summary`: bounded live-mutation summary, approval linkage, and target file context
- `patch`: planned file-update evidence before write
- `diff`: code or configuration change evidence
- `review`: findings, outcome, verification evidence, and follow-up
- `commit-package`: review-passed local commit bundle with source builder and reviewer linkage
- `commit-result`: local commit result with commit sha and scope validation
- `release-package`: local-demo-only release-ready bundle with local commit provenance
- `close-out`: terminal `Review -> Done` bundle with approved release provenance
- `output`: generated deliverable, report, runbook, or other generic fallback output

## Review / Approval / Done Rules
- Review must happen before a task can be marked done.
- A review outcome must include findings or an explicit no-findings result plus verification evidence.
- A task cannot be marked done while `blocked`, `waiting_approval`, or `waiting_decision` is still active.
- Builder live mutation must not proceed until the latest approved approval targets the latest preflight artifact and run.
- Local commit must not proceed until approval is explicitly recorded for the current commit-package provenance.
- `release-package` must stay `local-demo-only`, must not proceed from the main worktree, and must only prepare the current release bundle plus `release-ready` approval.
- `close-out` must run only from the latest approved `release-package` bundle on a clean dedicated linked worktree root and must act as finalization rather than release execution.
- If the builder discovers an architectural change beyond the approved boundary, the workflow must return to `architect` and, when required, create or resolve a human decision before continuing.
- Done requires all of the following:
  - planned scope completed
  - required artifacts linked
  - review recorded
  - verification evidence recorded
  - pending decisions resolved
  - pending approvals resolved when commit or release follow-up is requested
  - current approved release bundle recorded when `close-out` is the terminal step

## Decision Inbox Taxonomy
- Top-level inbox kinds are fixed to `review`, `decision`, and `approval`.
- `review-follow-up` normalizes to `kind=decision, sourceType=review`.
- `unblock/clarification` normalizes to `kind=decision, sourceType=decision, blocksTask=false`.
- Allowed matrix: `sourceType=approval -> kind=approval`, `sourceType=review -> kind=review|decision`, `sourceType=decision -> kind=decision`.
- `blocksTask=true` is only valid on `kind=decision`.
- `review` items remain read-only gate markers; `decision` items resolve through `resolve`; `approval` items resolve through `approve` or `reject`.
- `waiting_decision` is driven by pending `decision` items, `waiting_approval` is driven by pending approval records, and `review` items do not set either flag.

## Forbidden Actions
- Running work in this pack without a valid `project_path`
- Treating `Blocked`, `Waiting Approval`, or `Waiting Decision` as lifecycle statuses in this pack contract
- Marking a task done before review is recorded
- Committing before approval is recorded
- Silently changing architecture during build work
- Expanding a thin slice into a broad refactor without explicit re-planning
- Introducing office-first, messenger-first, ranking, OAuth, or multi-provider-first behavior into this pack
- Letting hidden runtime state override repo-defined policy or contract files
- Hard-coding live-provider-specific pack behavior into this contract beyond the accepted `local-demo-only` `local-stub` baseline
- Extending this pack into non-development workflows without an explicit scope decision

## V1 Freeze Note
- `Blocked`, `Waiting Approval`, and `Waiting Decision` are fixed v1 task flags, not lifecycle statuses.
- `milestone-m4-live-freeze` treats the required live-provider synthetic baseline as `smoke-provider-slice-04/05/06/07` plus `smoke-qa-slice-04/05/06/07`.
- Optional real-live verification stays separate from the required freeze gate; missing `OPENAI_API_KEY` or `OPENAI_RESPONSES_MODEL` may record `skipped` without failing the freeze.

## VNext Backlog After V1 Freeze
### Future Live-Provider Expansion Boundary
- Why still open: The current implemented live-provider boundary now includes planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation plus reviewer `openai-responses`, but additional providers, artifact-redaction policy, and any widening into commit-package, local commit, release-package, or close-out live execution remain out of scope.
- Current temporary default: Keep `local-stub` as the shipped default, keep implemented live execution capped at planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation plus reviewer, keep builder-live-mutation anchored to one approved preflight bundle with exact target-file validation and atomic `change-summary / patch / diff` persistence, keep reviewer anchored to one latest successful builder live-mutation bundle with canonical `Review Verdict / Evidence Reviewed / Findings / Contract Compliance / Verification Evidence / Accepted Risks / Next Action / Follow-Up Gate` headings, keep pass-side follow-up explicit instead of auto-starting `commit-package`, allow at most one blocking `kind=decision, sourceType=review, blocksTask=true` item only when review explicitly needs a decision, and keep fail-closed, no-fallback, and no-secret-leak guarantees in scope.
- Decide again when: Before adding another provider adapter or before widening live execution beyond reviewer into commit-package, local commit, release-package, or close-out.

### Future Cleanup Policy
- Why still open: Retention tiers are normalized, but no delete/archive/GC capability exists in v1.
- Current temporary default: retain full history; tiers define auditability and browse policy only.
- Decide again when: Before any cleanup capability is added.
