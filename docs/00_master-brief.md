# Orchestration 1.0 Master Brief

## Product Statement
Orchestration 1.0 is a local-first, single-user-first, ops-first control plane for running development work on local projects with explicit review, approval, logging, and artifact handling.

## Why This Exists
Most agent products optimize for spectacle, chat, or provider breadth before they solve the operational basics of real repo work. Orchestration 1.0 exists to make execution inspectable and gated:

- every run belongs to a project
- every execution requires `project_path`
- every meaningful change is reviewed before it is done
- every commit waits for approval
- repo files define the policy, not hidden runtime state

## Governing Constraints
- `local-first`: the primary operating model is local projects, local files, and local execution
- `single-user-first`: the first user is one operator managing their own work, not a team workspace
- `ops-first`: status, blockers, logs, artifacts, decisions, and approvals matter more than decorative UI
- `v1 scope = development pack only`
- `claw-empire` is a runtime/control-plane reference, not a product or architecture fork

## V1 Outcome
The user can register or select a local project from `Taskboard`, create a task, run the current `development` pack loop end to end, inspect logs and artifacts, resolve review or approval gates in `Decision Inbox`, and close work explicitly without push, publish, or external release.

## Primary User
An individual operator building or maintaining software locally who needs control over execution state, review gates, and delivery evidence without adding office-style collaboration overhead.

## V1 Scope
### In Scope
- `development` pack only
- project registration and selection with required `project_path`
- first-run bootstrap through the `Taskboard` project registry
- thin-slice task lifecycle with `Inbox -> In Progress -> Review -> Done`
- builder `preflight` and bounded `live-mutation`
- reviewer flow anchored to the latest builder live-mutation bundle
- local commit flow via `commit-package -> local commit`
- local-demo-only release flow via `release-package -> close-out`
- linked worktree detection, creation, and project switching in the shell
- dedicated linked worktree guard only before `release-package` and `close-out`
- live and historical logs
- artifact capture, preview, and provenance linkage with the fixed v1 taxonomy
- decision routing for human gates
- review before done
- approval before commit

### Out of Scope
- office-first or avatar-first UI
- messenger-first workflows
- ranking, XP, leaderboard, or gamification layers
- generalized OAuth platform work
- multi-provider-first execution strategy
- broad pack marketplace or non-development packs

## Primary UI
V1 has four first-class surfaces:

1. `Taskboard`
2. `Logs`
3. `Artifacts`
4. `Decision Inbox`

These are not secondary tabs under a chat shell. They are the main operating surfaces of the product.

## Core Operating Model
### Project
The top-level execution context. No task runs without a valid `project_path`.

### Task
The unit of planned work. Tasks move through explicit states and carry blockers, linked artifacts, review status, and decision requirements.

### Run
A concrete execution attempt for a task. Runs produce logs, artifacts, and review evidence.

### Worktree
An isolated repo context for task execution, experimentation, review, merge, or discard.

### Artifact
A retained output such as a report, diff, test evidence, runbook, or generated asset.

### Decision
A human-visible question or gate that blocks progress until resolved.

### Review
A quality gate that must pass before the task can be marked done.

### Approval
A human authorization gate that must pass before commit or merge actions proceed.

## Product Principles
- Prefer thin slices over broad platform buildout.
- Keep policy and contracts in repo files.
- Make state transitions explicit.
- Surface blockers before throughput metrics.
- Avoid silent architecture changes.
- Start with one provider behind an adapter boundary, not a provider matrix.
- Keep the shipped v1 path `local-demo-only` by default.

## Reference Position On claw-empire
Orchestration 1.0 should reuse the useful control-plane ideas from `claw-empire`, especially around `project`, `task`, `worktree`, `log`, `report`, `api`, `AGENTS`, and bootstrap patterns. It should not copy the product framing, office metaphors, rankings, messenger posture, or platform-first assumptions.

## Success Criteria For V1
- A project cannot execute without `project_path`.
- The first-run shell path is project registration or selection on `Taskboard`.
- A user can create a task and see its current state on the `Taskboard`.
- The task lifecycle remains `Inbox -> In Progress -> Review -> Done`, while `blocked`, `waitingApproval`, and `waitingDecision` stay as flags.
- A run produces inspectable logs on `Logs`.
- A run can attach or generate artifacts visible on `Artifacts`.
- A blocked decision appears in `Decision Inbox`.
- Builder execution is split into explicit `preflight` and bounded `live-mutation`.
- A task cannot be marked done without review.
- A commit path cannot proceed without approval.
- `release-package` and `close-out` stay local-demo-only and do not push, publish, or trigger external release.
- `release-package` and `close-out` only proceed from a dedicated linked worktree root when required by the current guard.
- The local core loop works for the `development` pack end to end without requiring live-provider integration or non-local-first architecture.

## V1 Acceptance Checklist
- [ ] `development` pack boundary is documented and enforced
- [ ] `project_path required` is enforced before execution
- [ ] first-run `Taskboard` project registry path is documented
- [ ] `Taskboard / Logs / Artifacts / Decision Inbox` exist as primary surfaces
- [ ] lifecycle and flags match the current runtime contract
- [ ] builder `preflight` and `live-mutation` split is documented
- [ ] review gate exists before task completion
- [ ] approval gate exists before commit
- [ ] `commit-package`, `local commit`, `release-package`, and `close-out` are described without widening scope
- [ ] dedicated linked worktree guard is described narrowly for `release-package` and `close-out`
- [ ] runtime/control-plane borrowing from `claw-empire` is selective, not copy-paste
- [ ] out-of-scope areas remain deferred

## Open Areas To Resolve
- future live-provider opt-in boundary behind the adapter boundary after the v1 `local-demo-only` baseline
- future delete/archive/GC policy for retained artifact history
- remaining release or human-gate scope that still needs explicit product approval
