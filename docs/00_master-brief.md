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
- `DEC-066` records the code-present `knowledge-work` pack as explicit opt-in for bounded non-coding deliverables; it does not replace the `development` pack, become the default v1 workflow, or open a pack marketplace
- `claw-empire` is a runtime/control-plane and product-shell reference, not a wholesale product or architecture fork
- `OpenHarness` is a harness/governance reference for tool-use loops, skills, memory, permissions, and delegation, not a generalized platform-breadth target

## V1 Outcome
The user can register or select a local project from `Taskboard`, create a task, run the current `development` pack loop end to end, inspect logs and artifacts, resolve review or approval gates in `Decision Inbox`, and close work explicitly without push, publish, or external release.

## Post-V1 Direction
The frozen v1 outcome is now treated as reusable execution infrastructure, not the final intended product experience.

- keep the current local-first execution engine, provenance model, bounded mutation model, and approval or review gates
- keep the current `Taskboard / Logs / Artifacts / Decision Inbox` shell available as `advanced ops mode`
- shift the next primary product entry toward `goal input -> visible multi-role AI alignment -> meeting-oriented planning -> bounded execution -> delivery`
- define that next primary experience around `Mission / Council / Execution / Deliverables`, not a more polished `Taskboard`-first operator console
- allow the next primary shell to adopt a company/ERP-style command-center frame with visible AI cast, meeting, attendance, desk, and workday cues when that makes the product legible to other operators or companies
- allow the same command-center language to continue into `advanced ops mode` entry and first viewport when it improves operator orientation, as long as `Taskboard / Logs / Artifacts / Decision Inbox` remain the authoritative operator control surfaces
- preserve the existing rejected boundaries: no budget/HR/org-management simulator, no messenger-first posture, no ranking layer, no OAuth-first expansion, and no multi-provider-first reframing

## Primary User
An individual operator or internal champion building or maintaining software locally who needs control over execution state, review gates, and delivery evidence. The operating model stays single-user-first even when the shell adopts a company-style command center that can be handed to other operators or companies without reading like a debug console.

## V1 Scope
### In Scope
- `development` pack only
- the explicit opt-in `knowledge-work` pack may exist as a bounded non-coding artifact workflow, but it is not the default v1 workflow and does not widen the pack marketplace boundary
- project registration and selection with required `project_path`
- first-run bootstrap through the `Taskboard` project registry
- thin-slice task lifecycle with `Inbox -> In Progress -> Review -> Done`
- builder `preflight` and bounded `live-mutation`
- reviewer flow anchored to the latest builder live-mutation bundle
- explicit project-level live-provider opt-in for `planner -> architect -> task-breaker -> builder preflight -> builder live-mutation -> reviewer` behind the existing adapter boundary, while the shipped default remains `local-stub`
- local commit flow via `commit-package -> commit-intent approval -> local commit`
- local-demo-only release follow-up via `release-package -> release-ready approval -> close-out`
- linked worktree detection, creation, and project switching in the shell
- dedicated linked worktree guard only before `release-package` and `close-out`
- live and historical logs
- artifact capture, preview, and provenance linkage with the fixed v1 taxonomy
- decision routing for human gates
- review before done
- approval before commit

### Out of Scope
- budget/HR/org-management simulator or avatar-only gameplay framing
- messenger-first workflows
- ranking, XP, leaderboard, or gamification layers
- generalized OAuth platform work
- multi-provider-first execution strategy
- broad pack marketplace or additional non-development packs beyond the explicit opt-in `knowledge-work` path

## Primary UI
V1 has four first-class surfaces:

1. `Taskboard`
2. `Logs`
3. `Artifacts`
4. `Decision Inbox`

These are not secondary tabs under a chat shell. They are the main operating surfaces of the product.

For the post-v1 pivot, these four surfaces remain authoritative for the frozen v1 shell and the future `advanced ops mode`, but they are no longer the intended default first-time product entry once the next orchestration layer is implemented.

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
A human authorization record that binds the next allowed local step to the current `preflight`, `commit-package`, or `release-package` provenance bundle.

## Product Principles
- Prefer thin slices over broad platform buildout.
- Keep policy and contracts in repo files.
- Make state transitions explicit.
- Surface blockers before throughput metrics.
- Avoid silent architecture changes.
- Start with one provider behind an adapter boundary, not a provider matrix.
- Keep the shipped v1 path `local-demo-only` by default.

## Reference Position On claw-empire
Orchestration 1.0 should reuse the useful control-plane ideas and selected product-shell cues from `claw-empire`, especially around `project`, `task`, `worktree`, `log`, `report`, `api`, `AGENTS`, bootstrap patterns, command-center density, visible AI cast, and meeting-oriented flow. It should not copy pixel-office gameplay, budget/HR/company-management, rankings, messenger posture, or platform-first assumptions.

## Reference Position On OpenHarness
Orchestration 1.0 may also reuse selective harness ideas from `OpenHarness`, especially around explicit agent loops, retry/backoff discipline, tool/skill/plugin boundaries, context and memory handling, path-level permission rules, approval dialogs, and delegation lifecycle. It should not copy generic agent-platform breadth, IM-channel expansion, or provider/platform sprawl.

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
- When live mode is explicitly opted in, execution remains limited to `planner -> architect -> task-breaker -> builder preflight -> builder live-mutation -> reviewer`, and downstream `commit-package`, `local commit`, `release-package`, and `close-out` remain explicit local follow-up.

## V1 Acceptance Checklist
- [x] `development` pack boundary is documented and enforced
- [x] `project_path required` is enforced before execution
- [x] first-run `Taskboard` project registry path is documented
- [x] `Taskboard / Logs / Artifacts / Decision Inbox` exist as primary surfaces
- [x] lifecycle and flags match the current runtime contract
- [x] builder `preflight` and `live-mutation` split is documented
- [x] review gate exists before task completion
- [x] approval gate exists before commit
- [x] `commit-package`, `local commit`, `release-package`, and `close-out` are described without widening scope
- [x] dedicated linked worktree guard is described narrowly for `release-package` and `close-out`
- [x] runtime/control-plane borrowing from `claw-empire` is selective, not copy-paste
- [x] out-of-scope areas remain deferred

## VNext Backlog After V1 Freeze
These items remain explicitly outside the frozen v1 baseline and do not block `milestone-m4-live-freeze`.

- `ai-orchestration-pivot-v2` is now implemented on current `main`: `Mission / Council / Execution / Deliverables` is the default post-v1 product baseline on top of the current v1 execution infrastructure, while `Taskboard / Logs / Artifacts / Decision Inbox` remains available as `advanced ops mode`
- future post-v1 follow-up returns to non-blocking housekeeping or later explicit `vNext` backlog items instead of treating the pivot itself as the next unresolved default product entry
- keep any future live-provider expansion behind the accepted adapter boundary while preserving the shipped `local-stub` / `local-demo-only` baseline and the current planner-through-reviewer live boundary
- keep synthetic readiness and failure smoke coverage authoritative before promoting any optional real-live verification into a required freeze gate
- keep delete/archive/GC behavior behind the explicit inspect-first retention consumer over the normalized retention tiers, with Tier A protected and no hidden cleanup
