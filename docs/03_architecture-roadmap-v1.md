# Orchestration 1.0 Architecture Roadmap v1

## Purpose
This document defines the current implemented baseline, architecture boundary, and remaining open work for the first usable version of Orchestration 1.0.

## Architecture Guardrails
- keep the product `local-first / single-user-first / ops-first`
- treat repo files as the source of truth for policy and contracts
- enforce `project_path required` before execution
- enforce `review before done`
- enforce `approval before commit`
- prefer thin vertical slices over broad platform scaffolding
- do not silently change architecture without updating the decision log
- keep `v1 scope = development pack only`

## Reference Position
`claw-empire` is a reference for runtime and control-plane patterns only. Reuse the useful ideas around `project`, `task`, `worktree`, `logs`, `reports`, `APIs`, `AGENTS`, and bootstrap. Do not fork its product framing, office metaphor, messenger posture, or platform assumptions.

## System Boundary

### Inside v1
- local project registry with explicit `project_path`
- task orchestration lifecycle
- run execution tracking
- linked worktree detection, creation, and project switching in the shell
- dedicated linked worktree guard only on `release-package` and `close-out`
- log capture and replay
- artifact capture and linkage
- decision, review, and approval gates
- `development` pack support

### Outside v1
- general team workspace model
- office-first or messenger-first surfaces
- ranking and gamification systems
- generic OAuth platform layer
- multi-provider-first orchestration
- non-development packs

## Source Of Truth

### Repo Files
- `AGENTS.md` for operating rules
- docs for product and architecture contracts
- pack files for capability boundaries

### Runtime State
Runtime may persist state for usability, but it must not become the hidden authority over the rules defined in repo files.

## Core Domain Contracts

### Project
Required minimum:
- stable identifier
- display name
- `project_path`
- pack type
- health or readiness state

### Task
Required minimum:
- task identifier
- title and intent
- lifecycle state
- blocker summary
- linked project
- linked worktree
- linked review and decision state

### Run
Required minimum:
- run identifier
- task identifier
- executor or role
- start and finish timestamps
- status and exit result
- log stream handle or reference

### Worktree
Required minimum:
- worktree identifier
- repo path
- branch or ref context
- dedicated linked-root status when release or close-out guards apply

### Artifact
Required minimum:
- artifact identifier
- type
- origin task or run
- storage reference
- preview mode classification with raw fallback rules

### Decision
Required minimum:
- decision identifier
- type
- prompt
- owner
- resolution state

### Review
Required minimum:
- review identifier
- subject task
- findings
- verification evidence
- outcome

### Approval
Required minimum:
- approval identifier
- scope
- approver
- status
- allowed next action

## Implemented Baseline

### Shell Bootstrap And Project Gate
- Runtime starts empty and the first usable path is the `Taskboard` project registry.
- Registering a project with `name` and `project_path` makes it active immediately.
- Later project switching reuses the same registry list instead of hidden bootstrap state.
- Linked worktree create and switch also reuse project register/select flows instead of task migration.

### Task And Gate Model
- The current lifecycle is `Inbox -> In Progress -> Review -> Done`.
- `blocked`, `waitingApproval`, and `waitingDecision` are task flags, not lifecycle columns.
- Review remains required before `Done`, and approval remains required before commit or release follow-up.

### Execution Core Loop
- The implemented loop is `planner -> architect -> task-breaker -> builder preflight -> builder live-mutation -> reviewer`.
- Builder execution is split into explicit no-write `preflight` and bounded `live-mutation`.
- `request-builder-live-mutation-approval` creates the builder approval for the latest `preflight`, and `builder live-mutation` consumes only that approved preflight target.
- Reviewer input is anchored to the latest builder live-mutation bundle only.
- The current shell consumes runtime and coordinator readiness summaries directly instead of re-deriving these guards in the client.

### Commit And Release Follow-Up
- Downstream follow-up is `commit-package -> local commit -> release-package -> close-out`.
- `commit-package` prepares the local commit bundle and raises `commit-intent` approval without executing git commit.
- `local commit` consumes only the current approved `commit-intent` approval for that exact `commit-package` provenance.
- `release-package` prepares a local-demo-only release-ready bundle and raises `release-ready` approval without executing push, publish, merge, or external release.
- `close-out` consumes the latest approved current `release-package` bundle provenance and is the explicit `Review -> Done` finalization path.
- Push, publish, merge, and external release remain disabled in the shipped v1 path.

### Worktree Boundary
- The shell can detect, create, and switch linked worktree roots earlier in the flow.
- The dedicated linked worktree guard is intentionally narrow: it applies to `release-package` and `close-out`, not to the earlier planner-through-local-commit loop.
- When `task.worktreeRef` is set for release or close-out, it must match the active linked worktree root exactly.

### Artifact And Evidence Model
- Artifact taxonomy is fixed by repo contracts and runtime validation.
- `plan`, `architecture`, and `breakdown` are latest-centered browse artifacts with history retained.
- `preflight`, `change-summary`, `patch`, `diff`, `review`, `commit-package`, `commit-result`, `release-package`, and `close-out` are provenance-critical artifacts.
- Structured preview remains best-effort with raw fallback, and stored raw content plus runtime metadata remain the source of truth.

## Quality Gates

### Before Builder Live-Mutation
- latest `preflight` exists and still matches current `plan`, `architecture`, and `breakdown`
- latest builder approval targets that exact `preflight`
- target files stay inside the approved architecture boundary

### Before Local Commit
- latest passing reviewer bundle is current
- current `commit-package` bundle exists and matches the latest reviewer and builder provenance
- approved commit approval matches that same package provenance
- repo dirty, staged, and untracked files match the commit scope exactly

### Before Release-Package
- latest successful local commit bundle is current
- active `project_path` resolves to a dedicated linked worktree root
- `task.worktreeRef`, when set, matches that same root
- delivery stance remains `local-demo-only`

### Before Close-Out
- task is in `Review`
- review status is `passed`
- no active task flags remain
- latest approved `release-ready` approval matches the current `release-package` bundle
- repo is clean immediately before `close-out`

### Before Architectural Expansion
- decision log updated
- scope impact recorded
- out-of-scope list revisited intentionally, not by drift

## Change Control
The following changes require an explicit decision log update before implementation:

- changing the primary UI surfaces
- expanding beyond `development pack only`
- weakening `project_path`, review, or approval gates
- changing provider strategy
- adding office-first, messenger-first, or multi-provider-first features

## Implemented Live-Provider Boundary
- `local-stub` remains the shipped default; a live provider is explicit operator opt-in only and does not auto-enable from env or secret presence.
- Provider selection changes only the adapter used for role execution; it does not change lifecycle, artifact taxonomy, approval semantics, linked-worktree rules, or the local-only release boundary.
- `provider-slice-02` implements the first concrete live provider as `OpenAI Responses API` for `planner`, and `provider-slice-03` extends that same adapter boundary to `architect` without widening downstream live execution.
- The canonical adapter id for that first live provider is `openai-responses`; any retained `live-provider` identifier is compatibility-only and must not become the long-term source-of-truth id.
- The first concrete provider is selected by smallest adapter-contract delta, explicit opt-in config fit, project-level readiness visibility, fail-closed behavior, and no-secret-leak verification.
- The first live slice must not introduce a repo-level model default. The concrete model remains operator-pinned project config.
- Secrets and provider-specific auth stay outside repo-defined runtime state and must not be written into runtime snapshots, artifacts, logs, approvals, or UI payloads.
- Planner live output should use Responses Structured Outputs with `text.format.type=json_schema`, and the schema should carry both `artifactMarkdown` and `normalizedResult` so the current adapter contract can stay narrow.
- `outputText` extraction should prefer top-level `response.output_text`; when it is absent, the adapter should safely aggregate `output_text` content from the response `output` array without relying on fixed indexes.
- Provider health is an execution prerequisite, not a new product surface. A future live opt-in may expose only coarse readiness such as `not-configured`, `ready`, `degraded`, or `error`.
- Verification direction stays local-first: keep the current `local-stub` regression gate unchanged, keep planner live regression coverage unchanged, add architect-specific synthetic opt-in smoke coverage for anchor validation, readiness failure, fail-closed behavior, malformed adapter responses, and no-secret-leak guarantees, and limit optional real live smoke to explicit opt-in planner plus architect happy-path coverage only.

## Implemented Architect Live Boundary
- `provider-slice-03` implements the accepted `strategy-slice-03` boundary. The current live runtime is planner plus architect only; `task-breaker`, `builder`, and `reviewer` remain blocked and degraded in live mode.
- Why `architect` first: the architect stage is already no-write, artifact-producing, and decision-producing without consuming approvals or touching builder, reviewer, release-package, or close-out semantics.
- Architect input anchor is fixed to the latest current `plan` bundle: `planArtifactId`, `planRunId`, matching planner run summary, active task and project identity, the existing source-of-truth file set, and the existing architect code-context allowlist.
- Architect input must not widen into arbitrary repo scans, operator-supplied file targets, or secret-bearing request material. Missing anchor parts block execution instead of degrading into partial input.
- Architect live output should use Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields.
- The schema-backed `artifact` payload should cover `boundaryFit`, `affectedComponentsOrContracts`, `policyImpact`, `decisionLogImpact`, `approvedAssumptions`, `noArchitectureChangeStatement`, and `blockingArchitectureIssues`.
- For this slice, `affectedComponentsOrContracts` stays a repo-relative path allowlist only so downstream builder-preflight architecture-boundary checks keep their current meaning.
- The adapter should render canonical `architecture` markdown from the validated structured payload before storing the artifact instead of trusting free-form markdown directly from the model.
- Allowed architect `nextStage` values stay `task-breaker` and `human gate` only. This slice does not widen architect handoff into `planner`, builder, reviewer, or any new stage semantics.
- Decision and blocking defaults stay fail-closed: valid `boundaryFit=fit` output may hand off to `task-breaker`; valid blocked output may create one blocking decision item; malformed output, anchor mismatch, unsupported stage, invalid path values, missing required fields, or readiness and config failure must produce a run error only with no artifact, no decision item, and no fallback to `local-stub`.
- Config and readiness stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; architect capability is checked through role-specific readiness; unsupported downstream live roles remain degraded and blocked.
- Secrets stay operator-local and must not be written into runtime state, logs, artifacts, approvals, or UI payloads. Raw auth headers, secret values, and provider payload dumps remain out of scope for persistence and display.

## Defined Task-Breaker Live Boundary
- `strategy-slice-04` defines the next live boundary but does not implement it. The current live runtime remains planner plus architect only until a later provider slice lands.
- Why `task-breaker` next: it stays no-write, it writes one `breakdown` artifact with an already-fixed markdown/UI parser contract, and it may raise at most one blocking decision before builder handoff. That keeps the slice downstream of architect without opening builder mutation, reviewer semantics, release-package, or close-out behavior.
- Task-breaker input anchor is fixed to the current matched plan-plus-architecture provenance chain: `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, active task and project identity, and the fixed repo source-of-truth file set.
- The coordinator should require that the selected latest `architecture` artifact points back to the current latest `plan` artifact and run before task-breaker execution starts, instead of independently mixing the latest upstream artifacts by type.
- This boundary does not introduce a task-breaker code-context allowlist. Task-breaker input must stay limited to stored `plan` plus `architecture` artifacts, matching upstream run summaries, and the fixed source-of-truth set. It must not widen into arbitrary repo scans, operator-supplied path lists, or secret-bearing payloads.
- Task-breaker live output should use Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields.
- The schema-backed `artifact` payload should cover ordered sub-tasks, checkpoints, expected artifacts per checkpoint, verification checkpoints, review trigger point, stop-and-escalate conditions, and execution boundary summary for builder handoff.
- The adapter should render canonical `breakdown` markdown from that validated structured payload before storing the artifact so the current breakdown headings and parser behavior remain unchanged in the shell.
- Allowed task-breaker `nextStage` values stay `builder` and `human gate` only. This boundary does not reopen planner or architect handoff from task-breaker and does not widen builder or reviewer live execution.
- Decision and blocking defaults stay fail-closed: the builder path is valid only when `needsDecision=false`, `blockers=[]`, and `orderedSubTasks` is non-empty; the human-gate path is valid only when `needsDecision=true` and `blockers` is non-empty, and it may create exactly one blocking decision item with `kind=decision`, `sourceType=decision`, and `blocksTask=true`.
- Config and readiness stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; if this boundary is implemented later, live role gating may open at most `planner + architect + task-breaker`, while `builder-preflight`, `builder-live-mutation`, and `reviewer` remain degraded and blocked.
- Failures stay fail-closed and no-secret-leak: malformed structured output, anchor or provenance mismatch, unsupported stage, missing required fields, readiness or config failure, and provider HTTP/network errors must produce a run error only with no artifact, no decision item, no fallback to `local-stub`, and no secret material written into runtime state, logs, artifacts, approvals, or UI payloads.

## Deferred Items
- office or radar visualization
- messenger adapters
- ranking or gamification
- generalized OAuth
- provider matrix
- non-development packs

## V1 Freeze Exit Criteria
- required docs and tasks reflect the current implemented `local-demo-only` `development` pack baseline without widening scope
- required regression smoke coverage is named explicitly and the required freeze gate passes on the current baseline
- `git status --short` stays clean before and after the required freeze regression run
- remaining open items are separated into explicit `vNext` backlog entries only

## VNext Backlog After V1 Freeze
- implement any future live-provider opt-in only behind the accepted adapter boundary while preserving the v1 `local-demo-only` baseline
- add synthetic readiness and failure smoke coverage before any real live-provider integration ships
- define when a future delete/archive/GC capability should consume the normalized retention tiers

## Slice Review Checklist
- [ ] does the slice preserve local-first behavior
- [ ] does it keep single-user-first assumptions
- [ ] does it improve ops visibility
- [ ] does it preserve `development pack only`
- [ ] does it respect review and approval gates
- [ ] does it avoid architecture drift from the decision log
