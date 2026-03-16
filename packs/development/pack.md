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
- Provider-agnostic contract language stays intact, but the shipped v1 default is `local-demo-only` via the built-in `local-stub` adapter. Any live provider remains a future explicit opt-in behind the same adapter boundary.

## Entry Criteria
A task may enter this pack only when all of the following are true:
- An active project exists and its `project_path` is valid.
- The requested work is within `development` pack scope.
- The task or request has a clear intent, target outcome, or problem statement.
- Relevant repo policy and contract files are available to the workflow.
- Existing blockers, pending approvals, and pending decisions are visible before execution starts.

If any entry criterion is missing, the workflow must stop at routing or raise a decision item instead of proceeding silently.

## Stage Sequence
Standard stage flow:

`router -> planner -> architect -> task-breaker -> builder -> reviewer -> human gate`

Rules for stage flow:
- Stages run in order unless a blocking gate routes the task into `Decision Inbox`.
- `Blocked`, `Waiting Approval`, and `Waiting Decision` are task flags, not lifecycle statuses.
- A flag may coexist with a lifecycle state such as `Planned`, `In Progress`, or `Review`.
- When a flag is raised, the task stays visible in its current lifecycle state while the gate is surfaced in `Taskboard` and `Decision Inbox`.
- A task resumes from the blocked stage or the next appropriate stage after the gate is resolved.

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
- Call out dependencies, expected artifacts, and whether worktree isolation is needed.
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

Required result:
- An actionable breakdown that the builder can execute without widening scope.

### Builder
Responsibilities:
- Execute the approved task breakdown inside the project context.
- Produce the intended code, config, docs, or operational changes for the slice.
- Capture execution evidence, logs, diffs, and verification outputs.
- Route back to `architect` or `human gate` if the work reveals an unapproved architecture change, policy conflict, or decision need.

Required result:
- Built changes and supporting evidence that match the approved scope.

### Reviewer
Responsibilities:
- Inspect the built result for correctness, regressions, and contract compliance.
- Run the most relevant practical verification available for the change.
- Record findings, required changes, accepted risks, and evidence.
- Prevent premature completion when verification or review evidence is missing.

Required result:
- A review record with explicit outcome and linked verification evidence.

### Human Gate
Responsibilities:
- Resolve human-required approval and decision items.
- Confirm whether commit approval is required and, if so, whether it is granted.
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

Baseline artifact taxonomy:
- `plan`
- `architecture`
- `decision`
- `execution-log`
- `diff`
- `verification`
- `review`
- `approval`
- `output`

Artifact expectations:
- `plan`: scoped execution plan, acceptance target, verification intent
- `architecture`: architecture check, boundary note, decision-log linkage
- `decision`: question, context, resolution, and affected task scope
- `execution-log`: retained run or command evidence
- `diff`: code or configuration change evidence
- `verification`: test, lint, build, runtime, or inspection evidence
- `review`: findings, outcome, and follow-up
- `approval`: explicit approval scope and recorded authorization
- `output`: generated deliverable, report, runbook, or other produced result

## Review / Approval / Done Rules
- Review must happen before a task can be marked done.
- A review outcome must include findings or an explicit no-findings result plus verification evidence.
- A task cannot be marked done while `blocked`, `waiting_approval`, or `waiting_decision` is still active.
- Commit must not proceed until approval is explicitly recorded.
- If the builder discovers an architectural change beyond the approved boundary, the workflow must return to `architect` and, when required, create or resolve a human decision before continuing.
- Done requires all of the following:
  - planned scope completed
  - required artifacts linked
  - review recorded
  - verification evidence recorded
  - pending decisions resolved
  - pending approvals resolved when commit is requested

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

## [OPEN]
### Future Live-Provider Opt-In Boundary
- Why still open: The shipped v1 default is fixed to `local-demo-only` via `local-stub`, but the boundary for any future live-provider opt-in is not yet defined at the pack-contract level.
- Current temporary default: Keep provider-agnostic interface language and do not add live-provider-specific workflow requirements to this pack.
- Decide again when: Before adding any live execution integration beyond the current local-only baseline.

### Task Flag Model
- Why still open: The broader product task state machine is not yet fully finalized across `Taskboard`, `Logs`, and `Decision Inbox`.
- Current temporary default: `Blocked`, `Waiting Approval`, and `Waiting Decision` are all flags, not lifecycle statuses.
- Decide again when: Before the task contract and `Taskboard` interaction model are finalized in implementation.

### Artifact Taxonomy Baseline
- Why still open: The baseline artifact types are defined here, but storage layout, retention, preview behavior, and possible subtype expansion are not yet settled.
- Current temporary default: `plan`, `architecture`, `decision`, `execution-log`, `diff`, `verification`, `review`, `approval`, `output`
- Decide again when: Before artifact storage, browsing, preview, and retention behavior are implemented.
