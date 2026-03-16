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
The user can point Orchestration 1.0 at a local repo, create and run development tasks, inspect logs and artifacts, route decisions into an inbox, and keep review and approval gates visible before code is considered done.

## Primary User
An individual operator building or maintaining software locally who needs control over execution state, review gates, and delivery evidence without adding office-style collaboration overhead.

## V1 Scope
### In Scope
- `development` pack only
- project registration and selection with required `project_path`
- task lifecycle for thin vertical slices
- worktree-aware execution flows
- live and historical logs
- artifact capture and linkage
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

## Reference Position On claw-empire
Orchestration 1.0 should reuse the useful control-plane ideas from `claw-empire`, especially around `project`, `task`, `worktree`, `log`, `report`, `api`, `AGENTS`, and bootstrap patterns. It should not copy the product framing, office metaphors, rankings, messenger posture, or platform-first assumptions.

## Success Criteria For V1
- A project cannot execute without `project_path`.
- A user can create a task and see its current state on the `Taskboard`.
- A run produces inspectable logs on `Logs`.
- A run can attach or generate artifacts visible on `Artifacts`.
- A blocked decision appears in `Decision Inbox`.
- A task cannot be marked done without review.
- A commit path cannot proceed without approval.
- The local core loop works for the `development` pack end to end without requiring live-provider integration or non-local-first architecture.

## V1 Acceptance Checklist
- [ ] `development` pack boundary is documented and enforced
- [ ] `project_path required` is enforced before execution
- [ ] `Taskboard / Logs / Artifacts / Decision Inbox` exist as primary surfaces
- [ ] review gate exists before task completion
- [ ] approval gate exists before commit
- [ ] runtime/control-plane borrowing from `claw-empire` is selective, not copy-paste
- [ ] out-of-scope areas remain deferred

## Open Areas To Resolve
- future live-provider opt-in boundary behind the adapter boundary after the v1 `local-demo-only` baseline
- exact task state machine
- artifact taxonomy for reports, evidence, and runbooks
- bootstrap scope for first-run setup
- decision inbox taxonomy and escalation rules
