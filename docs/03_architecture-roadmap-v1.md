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
- `provider-slice-02` implements the first concrete live provider as `OpenAI Responses API` for `planner`, `provider-slice-03` extends that same adapter boundary to `architect`, `provider-slice-04` extends it to `task-breaker`, `provider-slice-05` extends it to `builder-preflight`, `provider-slice-06` extends it to `builder-live-mutation`, and `provider-slice-07` extends it to `reviewer` without widening commit-package, local commit, release-package, or close-out execution.
- The canonical adapter id for that first live provider is `openai-responses`; any retained `live-provider` identifier is compatibility-only and must not become the long-term source-of-truth id.
- The first concrete provider is selected by smallest adapter-contract delta, explicit opt-in config fit, project-level readiness visibility, fail-closed behavior, and no-secret-leak verification.
- The first live slice must not introduce a repo-level model default. The concrete model remains operator-pinned project config.
- Secrets and provider-specific auth stay outside repo-defined runtime state and must not be written into runtime snapshots, artifacts, logs, approvals, or UI payloads.
- Planner live output should use Responses Structured Outputs with `text.format.type=json_schema`, and the schema should carry both `artifactMarkdown` and `normalizedResult` so the current adapter contract can stay narrow.
- `outputText` extraction should prefer top-level `response.output_text`; when it is absent, the adapter should safely aggregate `output_text` content from the response `output` array without relying on fixed indexes.
- Provider health is an execution prerequisite, not a new product surface. A future live opt-in may expose only coarse readiness such as `not-configured`, `ready`, `degraded`, or `error`.
- Verification direction stays local-first: keep the current `local-stub` regression gate unchanged, keep planner plus architect plus task-breaker plus builder-preflight live regression coverage unchanged, add builder-live-mutation plus reviewer-specific synthetic opt-in smoke coverage, and keep optional real live smoke explicit opt-in only for the current planner-through-reviewer adapter boundary.

## Implemented Architect Live Boundary
- `provider-slice-03` implements the accepted `strategy-slice-03` boundary. The current live runtime keeps that planner plus architect path unchanged inside the wider `provider-slice-04` boundary.
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
- `provider-slice-04` implements the accepted `strategy-slice-04` boundary. The current live runtime is planner plus architect plus task-breaker only; `builder-preflight`, `builder-live-mutation`, and `reviewer` remain blocked and degraded in live mode.
- Why `task-breaker` next: it stays no-write, it writes one `breakdown` artifact with an already-fixed markdown/UI parser contract, and it may raise at most one blocking decision before builder handoff. That keeps the slice downstream of architect without opening builder mutation, reviewer semantics, release-package, or close-out behavior.
- Task-breaker input anchor is fixed to the current matched plan-plus-architecture provenance chain: `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, active task and project identity, and the fixed repo source-of-truth file set.
- The coordinator should require that the selected latest `architecture` artifact points back to the current latest `plan` artifact and run before task-breaker execution starts, instead of independently mixing the latest upstream artifacts by type.
- This boundary does not introduce a task-breaker code-context allowlist. Task-breaker input must stay limited to stored `plan` plus `architecture` artifacts, matching upstream run summaries, and the fixed source-of-truth set. It must not widen into arbitrary repo scans, operator-supplied path lists, or secret-bearing payloads.
- Task-breaker live output should use Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields.
- The schema-backed `artifact` payload should cover ordered sub-tasks, checkpoints, expected artifacts per checkpoint, verification checkpoints, review trigger point, stop-and-escalate conditions, and execution boundary summary for builder handoff.
- The adapter should render canonical `breakdown` markdown from that validated structured payload before storing the artifact so the current breakdown headings and parser behavior remain unchanged in the shell.
- Allowed task-breaker `nextStage` values stay `builder` and `human gate` only. This boundary does not reopen planner or architect handoff from task-breaker and does not widen builder or reviewer live execution.
- Decision and blocking defaults stay fail-closed: the builder path is valid only when `needsDecision=false`, `blockers=[]`, and `orderedSubTasks` is non-empty; the human-gate path is valid only when `needsDecision=true` and `blockers` is non-empty, and it may create exactly one blocking decision item with `kind=decision`, `sourceType=decision`, and `blocksTask=true`.
- Config and readiness stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; live role gating now opens at most `planner + architect + task-breaker`, while `builder-preflight`, `builder-live-mutation`, and `reviewer` remain degraded and blocked.
- Failures stay fail-closed and no-secret-leak: malformed structured output, anchor or provenance mismatch, unsupported stage, missing required fields, readiness or config failure, and provider HTTP/network errors must produce a run error only with no artifact, no decision item, no fallback to `local-stub`, and no secret material written into runtime state, logs, artifacts, approvals, or UI payloads.

## Implemented Builder-Preflight Live Boundary
- `provider-slice-05` implements the accepted `strategy-slice-05` boundary. The current live runtime is planner plus architect plus task-breaker plus builder-preflight only; `builder-live-mutation` and `reviewer` continue to stay blocked and degraded in live mode.
- Why `builder-preflight` next: it is still a no-write stage and it writes one `preflight` artifact with an already-fixed shell parser contract. That makes it the smallest downstream live delta after `task-breaker` without opening source mutation, approval consumption, reviewer provenance, release-package, or close-out behavior.
- Builder-preflight input anchor is fixed to the current matched plan-plus-architecture-plus-breakdown provenance chain: `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, `breakdownArtifactId`, `breakdownRunId`, active task and project identity, and the fixed repo source-of-truth file set.
- The coordinator requires that the selected latest `architecture` artifact still points back to the current latest `plan` artifact and run, and that the selected latest `breakdown` artifact still points back to that same current plan-plus-architecture chain, before builder-preflight execution starts.
- This boundary adds a builder-preflight code-context allowlist and keeps it narrow: repo-relative paths only, deterministic ordering only, and only inside the approved architecture allowlist derived from the latest `architecture` artifact. Builder-preflight input does not widen into arbitrary repo scans, operator-supplied file targets, absolute paths, parent-directory traversal, or secret-bearing request material.
- Builder-preflight live output uses Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields.
- The schema-backed `artifact` payload covers `targetFiles`, `intendedChanges`, `risks`, `verificationPlan`, `reviewEvidenceExpectations`, and `escalationTriggers`. `Input Summary` remains adapter-rendered from validated anchor and upstream artifacts so the current `preflight` markdown contract stays stable in the shell.
- The adapter renders canonical `preflight` markdown from that validated structured payload before storing the artifact so the current `Target Files / Intended Changes / Risks / Verification Plan / Review Evidence Expectations / Escalation Triggers / Input Summary` headings remain unchanged.
- Clean builder-preflight output does not hand off directly to `builder-live-mutation` or `reviewer`. The only clean downstream action is `request-builder-live-mutation-approval`, and it is valid only when `needsDecision=false`, `blockers=[]`, `targetFiles` is non-empty, and every target file stays inside the approved architecture allowlist.
- Escalation paths stay limited to `architect`, `task-breaker`, and `human gate` only. The architect path is for architecture-boundary mismatch; the task-breaker path is for insufficient breakdown detail; the human-gate path is for blocking operator or policy decisions.
- Config and readiness stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; role-specific readiness may open at most `planner + architect + task-breaker + builder-preflight`, while `builder-live-mutation` and `reviewer` remain degraded and blocked.
- Failures stay fail-closed and no-secret-leak: malformed structured output, anchor or provenance mismatch, unsupported next action, invalid path values, missing required fields, target files outside the approved architecture boundary, readiness or config failure, and provider HTTP/network errors produce a run error only with no artifact, no decision item, no approval record, no fallback to `local-stub`, and no secret material written into runtime state, logs, artifacts, approvals, or UI payloads.

## Implemented Builder Live-Mutation Boundary
- `provider-slice-06` implements the accepted `strategy-slice-06` boundary. The current live runtime includes planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation, while commit-package, local commit, release-package, and close-out semantics do not widen.
- Why `builder-live-mutation` next: it is the smallest downstream live delta after implemented `builder-preflight`. The approval gate, bounded file-write path, and reviewer provenance rule already exist, so the next safe expansion is to let the live adapter prepare validated bounded file updates while the coordinator keeps write authority.
- Builder-live-mutation input anchor should be fixed to the current matched plan-plus-architecture-plus-breakdown-plus-preflight provenance chain and the current approved approval pair: `projectId`, `taskId`, `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, `breakdownArtifactId`, `breakdownRunId`, `preflightArtifactId`, `preflightRunId`, `approvalId`, `approvalTargetArtifactId`, `approvalTargetRunId`, the fixed repo source-of-truth file set, the architecture allowlist, the exact preflight target-file allowlist, code-context paths fixed to that same target-file set, and per-target baseline digests.
- `approvalTarget*` must exactly match `preflight*`; `codeContextPaths` must match the target-file allowlist set in this slice; target files stay existing-file-only. Builder-live-mutation input must not widen into arbitrary repo scans, operator-supplied file targets, absolute paths, parent-directory traversal, or secret-bearing request material.
- Builder-live-mutation live output should use Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields. The adapter should render canonical `change-summary` markdown from that validated payload before it is stored so the current `Change Summary / Target Files / File Updates / Risks / Verification Notes` headings remain unchanged.
- The schema-backed `artifact` payload should cover `targetFiles`, `fileUpdates`, `changeSummary`, `risks`, and `verificationNotes`. `fileUpdates` paths must be repo-relative, unique, non-empty, and a subset of the target-file allowlist. Actual changed files must exactly match the validated `fileUpdates` path set; any mismatch must fail closed.
- Allowed `nextStage` values should stay `reviewer`, `architect`, and `human gate` only. The reviewer path is valid only when `needsDecision=false`, `blockers=[]`, and `fileUpdates.length >= 1`. The architect path is valid only when `needsDecision=false` and `blockers` is non-empty. The human-gate path is valid only when `needsDecision=true`, `blockers.length >= 1`, and exactly one blocking decision item is created with `kind=decision`, `sourceType=decision`, and `blocksTask=true`.
- `change-summary`, `patch`, and `diff` should be treated as one mutation bundle. `change-summary` is the validated adapter-rendered artifact, while `patch` and `diff` remain coordinator-derived artifacts only. Partial persistence is forbidden: validation failure must restore the repo, create no mutation artifacts, and consume no approval.
- Approval consumption should stay exact and narrow: the live mutation path may start only from the latest approved approval that targets the current latest preflight artifact and run. Approval is consumed only by one successful mutation bundle for that exact preflight pair; failed validation, failed writes, or repo restore paths must leave the approval unconsumed; stale or duplicate reuse stays blocked.
- Config and readiness should stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; role-specific readiness may open at most `planner + architect + task-breaker + builder-preflight + builder-live-mutation + reviewer`, while commit-package, local commit, release-package, and close-out remain explicit local follow-up steps.
- Failures should stay fail-closed and no-secret-leak: malformed structured output, anchor or provenance mismatch, approval mismatch, invalid path values, empty or duplicate file updates, target files outside the approved architecture boundary, actual changed-file mismatch, readiness or config failure, and provider HTTP/network errors must produce a run error only with repo restore, no mutation artifacts, no approval consumption, no fallback to `local-stub`, and no provider secret, auth material, raw provider payload, or env value written into runtime state, logs, artifacts, approvals, or UI payloads. Repo-content redaction policy remains out of scope for this slice.
- Reviewer is the only downstream live consumer of the successful builder mutation bundle in this boundary. Commit-package remains explicit downstream follow-up and is never auto-started by builder-live-mutation.

## Implemented Reviewer Live Boundary
- `provider-slice-07` implements the accepted `strategy-slice-07` boundary. The current live runtime includes planner plus architect plus task-breaker plus builder-preflight plus builder-live-mutation plus reviewer, while commit-package, local commit, release-package, and close-out semantics do not widen.
- Why `reviewer` next: it is the smallest remaining downstream live delta after `builder-live-mutation`. The review stage already consumes one bounded builder live-mutation bundle, writes one terminal `review` artifact with an existing parser contract, and should stay separate from commit and release execution authority.
- Reviewer input anchor should be fixed to the current latest builder live-mutation bundle: `projectId`, `taskId`, `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, `breakdownArtifactId`, `breakdownRunId`, `preflightArtifactId`, `preflightRunId`, `changeSummaryArtifactId`, `changeSummaryRunId`, `patchArtifactId`, `patchRunId`, `diffArtifactId`, `diffRunId`, `approvalId`, the successful builder live-mutation run summary and logs, the fixed repo source-of-truth file set, and the exact changed-file path set derived from that same builder bundle.
- Reviewer input must not recombine latest artifacts by type across task history, widen into arbitrary repo scans, operator-supplied file targets, absolute paths, parent-directory traversal, secret-bearing request material, or builder, commit, or release re-execution.
- Reviewer live output should use Responses Structured Outputs with a strict schema carrying `anchor`, `artifact`, and `normalizedResult` fields. The adapter should render canonical `review` markdown from that validated payload before it is stored so the current `Review Verdict / Evidence Reviewed / Findings / Contract Compliance / Verification Evidence / Accepted Risks / Next Action / Follow-Up Gate` headings remain unchanged.
- The schema-backed `artifact` payload should cover `verdict`, `evidenceReviewed`, `findings`, `contractCompliance`, `verificationEvidence`, `acceptedRisks`, and `followUpGate`. Raw `fail` must remain preserved in the artifact and run summary even if runtime review status maps it to `changes_requested`.
- Allowed `nextStage` values should stay `builder`, `architect`, and `human gate` only. The builder path is valid only for `fail` or `changes_requested` follow-up inside the approved boundary. The architect path is valid only for architecture drift or contract-boundary violation. The human-gate path is the only pass-side downstream and must not auto-start `commit-package`; it may create at most one blocking review-sourced decision item only when `needsDecision=true`, `blockers` is non-empty, and the item is `kind=decision`, `sourceType=review`, `blocksTask=true`.
- Reviewer live should remain terminal at the review artifact boundary: no approval creation, no commit-package execution, and no silent pass on missing evidence or weak verification.
- Config and readiness should stay narrow: the current project provider config shape remains `mode`, canonical adapter id, operator-pinned `model`, and env-var name only; project-level provider summary stays coarse readiness; live role gating may open at most `planner + architect + task-breaker + builder-preflight + builder-live-mutation + reviewer`, while commit-package, local commit, release-package, and close-out remain explicit local follow-up steps outside live role execution.
- Failures should stay fail-closed and no-secret-leak: malformed structured output, anchor or bundle provenance mismatch, unsupported next stage, invalid verdict or follow-up combinations, missing required fields, readiness or config failure, and provider HTTP or network errors must produce a run error only with no review artifact, no decision item, no fallback to `local-stub`, and no provider secret, raw provider payload, or env value written into runtime state, logs, artifacts, approvals, or UI payloads.

## Milestone M4 Live Freeze

### Current Live Baseline
- The shipped default remains `local-stub`, and downstream delivery stance remains `local-demo-only`.
- Explicit live opt-in is limited to project-level `openai-responses` configuration with non-secret metadata only.
- The current live execution boundary is frozen at `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`.
- `builder-live-mutation` remains anchored to the latest approved preflight pair with exact target-file and atomic mutation-bundle validation.
- `reviewer` remains anchored to the latest successful builder live-mutation bundle only and keeps downstream `commit-package -> local commit -> release-package -> close-out` as explicit local follow-up.

### Required Freeze Gate
- The required local baseline from `milestone-m3-freeze` remains unchanged and still applies.
- The required live-provider synthetic baseline is:
  - `node scripts/smoke-provider-slice-04.mjs`
  - `node scripts/smoke-provider-slice-05.mjs`
  - `node scripts/smoke-provider-slice-06.mjs`
  - `node scripts/smoke-provider-slice-07.mjs`
  - `node scripts/smoke-qa-slice-04.mjs`
  - `node scripts/smoke-qa-slice-05.mjs`
  - `node scripts/smoke-qa-slice-06.mjs`
  - `node scripts/smoke-qa-slice-07.mjs`

### Optional Real-Live Verification
- Optional real-live verification stays fully separate from the required freeze gate.
- Missing `OPENAI_API_KEY` or `OPENAI_RESPONSES_MODEL` records a `skipped` result and does not fail `milestone-m4-live-freeze`.
- Optional real-live verification for the current planner-through-reviewer boundary is:
  - `node scripts/smoke-provider-live-slice-02.mjs`
  - `node scripts/smoke-provider-live-slice-03.mjs`
  - `node scripts/smoke-provider-live-slice-05.mjs`
  - `node scripts/smoke-provider-live-slice-06.mjs`
  - `node scripts/smoke-provider-live-slice-07.mjs`
  - `node scripts/smoke-qa-live-slice-04.mjs`
  - `node scripts/smoke-qa-live-slice-05.mjs`
  - `node scripts/smoke-qa-live-slice-06.mjs`
  - `node scripts/smoke-qa-live-slice-07.mjs`

## Deferred Items
- office or radar visualization
- messenger adapters
- ranking or gamification
- generalized OAuth
- provider matrix
- non-development packs

## V1 Freeze Exit Criteria
- required docs and tasks reflect the current implemented shipped default plus the current planner-through-reviewer live boundary without widening scope
- required regression smoke coverage is named explicitly, and `milestone-m4-live-freeze` keeps the local baseline plus the required live-provider synthetic baseline separate from any optional real-live verification
- optional real-live verification stays non-blocking, and env-missing `skipped` results do not fail the freeze
- `git status --short` stays clean before and after the required freeze regression run
- remaining open items are separated into explicit `vNext` backlog entries only

## VNext Backlog After V1 Freeze
- `strategy-m5-01` is docs-only backlog ordering: do not add capability, do not change runtime, execution, or UI semantics, and do not promote optional real-live verification into the required freeze gate
- priority 1: keep optional real-live verification as the first post-freeze backlog item for the current planner-through-reviewer boundary, while keeping it non-blocking and allowing env-missing `skipped`
- priority 2: define artifact redaction policy after optional real-live verification, and keep that policy separate from the already accepted provider secret/auth/raw payload/env non-leak boundary
- priority 3: define future `commit-package -> local commit -> release-package -> close-out` scope only after artifact redaction policy, without widening the current live execution boundary
- priority 4: evaluate any second provider adapter only after the three items above, while preserving the accepted adapter boundary and the v1 single-provider-first shipped baseline
- `strategy-m5-02` is docs/tasks-only policy lock: do not add capability, do not change runtime, execution, or UI semantics, and do not reinterpret provider non-leak as repo-content redaction.
- provider secret/auth/raw payload/env non-leak remains a persistence-prohibited boundary: those values must not be written into runtime state, logs, artifacts, approvals, or UI payloads, and they are not a redaction candidate because they must not persist at all.
- repo-content redaction policy is narrower and applies only to future duplicated narrative exposure. It does not rewrite or mask the current raw stored artifact content that remains the source of truth in v1.
- `patch` and `diff` stay exact raw provenance evidence for the mutation bundle and are not redaction targets in the current frozen baseline.
- `change-summary` and `review` keep canonical structured provenance, findings, verdict, verification, and follow-up fields intact. Only duplicated large verbatim repo-content excerpts inside future convenience narratives are redaction candidates.
- boundary application stays explicit: runtime snapshot metadata keeps current shape, logs keep current no-secret-leak behavior, artifact storage keeps raw stored content plus metadata as the source of truth, and the current Artifact Detail raw-content view remains unchanged in this slice.
- `strategy-m5-03` is docs/tasks-only future-scope lock: do not add capability, do not change runtime, execution, or UI semantics, and do not reinterpret downstream local follow-up as provider-owned or auto-starting execution.
- the current downstream local follow-up baseline remains explicit after reviewer: `commit-package` and `release-package` are approval-producing prepare steps, while `local commit` and `close-out` are approval-consuming local execution steps.
- this boundary stays explicit because review authority, approval authority, git side effects, linked-worktree release guard, and local-demo-only delivery stance remain intentionally separated in the current frozen baseline.
- recommended priority 1 for any future automation candidate is operator-invoked local convenience chaining only, and only when it reuses the current readiness, approval, provenance, linked-worktree, and `local-demo-only` guards without changing their meaning.
- provider or reviewer auto-start of `commit-package`, `local commit`, `release-package`, or `close-out` remains out of scope. Approval auto-resolution, approval-consumer collapse, or hidden chaining across those steps remains out of scope.
- push, merge, publish, and external release remain widening-forbidden lines for this backlog item, and `release-package` plus `close-out` must continue to require the current dedicated linked worktree boundary.
- `strategy-m5-04` is docs/tasks-only convenience-scope lock: do not add capability, do not change runtime, execution, or UI semantics, and do not reinterpret explicit downstream local follow-up as one hidden downstream chain.
- priority 1 convenience candidate is the commit-side bounded continuation only: `commit-package -> local commit`.
- the allowed future shape is a resume helper only. It may continue from the current `commit-package` bundle into the next explicit local step only after the current commit approval state is re-checked as approved, and it must not create, resolve, consume, or hide the approval boundary implicitly.
- `release-package -> close-out` remains deferred future scope, because dedicated linked-worktree readiness, approved current release provenance, clean-repo verification, and terminal `Review -> Done` finalization stay heavier downstream boundaries than the commit-side continuation.
- the full four-step downstream chain `commit-package -> local commit -> release-package -> close-out` remains non-recommended and widening-forbidden for this backlog item.
- provider or reviewer auto-start, approval auto-resolution, hidden multi-step chaining, linked-worktree auto-switch, and any push, merge, publish, or external release action remain out of scope for convenience chaining.
- `strategy-m5-05` is docs/tasks-only operator-facing form lock: do not add capability, do not change runtime, execution, or UI semantics, and do not reinterpret the commit-side resume helper as a new inbox action or hidden execution route.
- the preferred operator-facing form is an in-panel commit-side resume CTA inside the existing commit guard area, such as `Resume Approved Local Commit`, rather than a one-click `prepare + commit` chain or a new standalone surface.
- approval visibility remains mandatory: the current commit approval status, approval id, current commit-package id, reviewer/builder/preflight provenance, and disabled reasons must remain visible next to the helper and must not be collapsed into a generic `ready` state.
- the helper relationship to readiness stays explicit: availability must come directly from the current `commitExecutionReadiness` and `commitPackageReadiness` summaries, and the client must not infer hidden commit semantics beyond those coordinator summaries.
- when commit approval is `pending`, `rejected`, `stale`, `missing`, or otherwise blocked, the helper must stay disabled or absent and the operator must continue through the existing explicit approval-resolution path before the next local step.
- one-click `commit-package -> approval -> local commit`, hidden approval consumption, and inbox-triggered execution remain out of scope for this backlog item; at most, a future inbox affordance may navigate back to the current task and commit panel without running the step itself.
- `strategy-m5-06` is docs/tasks-only release-side convenience-scope lock: do not add capability, do not change runtime, execution, or UI semantics, and do not reinterpret release follow-up as one hidden completion chain.
- release-side is not permanently closed as manual/local-only; it remains a deferred convenience candidate only after the commit-side helper decisions are settled.
- the only allowed future shape is an in-panel resume helper from the approved current `release-package` bundle into the next explicit local step `close-out`, and it must remain scoped to the existing release/close-out guard area rather than a new standalone surface.
- the helper scope stays narrow: it must not prepare or regenerate `release-package`, resolve `release-ready` approval, create or switch linked worktrees, recover repo cleanliness, or bypass `Review -> Done` close-out guard checks. Those remain explicit/manual prerequisites outside the helper.
- Decision Inbox remains non-executing on the release side as well: at most, it may offer a navigation hint back to the current task and release/close-out panel when a current approved release bundle exists.
- one-click `release-package -> approval -> close-out`, hidden approval consumption, linked-worktree automation, repo-clean recovery automation, auto close-out, and the broader four-step downstream chain remain widening-forbidden for this backlog item.
- define when a future delete/archive/GC capability should consume the normalized retention tiers

## Slice Review Checklist
- [ ] does the slice preserve local-first behavior
- [ ] does it keep single-user-first assumptions
- [ ] does it improve ops visibility
- [ ] does it preserve `development pack only`
- [ ] does it respect review and approval gates
- [ ] does it avoid architecture drift from the decision log
