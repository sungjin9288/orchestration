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
- Impact: Non-development packs and generalized pack expansion are deferred unless a later accepted decision records an explicit non-default path. `DEC-066` records `knowledge-work` as that code-present opt-in path without replacing the default `development` workflow.

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
- Decision: `claw-empire` is a reference for runtime/control-plane patterns and selective product-shell cues, but not a wholesale product baseline.
- Why: The repo offers useful patterns around execution state, command-center density, visible role cast, and meeting posture, but Orchestration still needs its own local-first contracts and narrower scope.
- Impact: Borrow `project/task/worktree/log/report/api/AGENTS/bootstrap` ideas selectively, and also borrow visible-cast / command-center cues when they help the post-v1 shell. Runtime, policy, and scope contracts must still be rewritten from first principles for Orchestration 1.0.

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

### DEC-032
- Status: `Accepted`
- Decision: Define `strategy-slice-03` as the second live-role boundary: `architect` may open only as an explicit opt-in expansion behind the existing `openai-responses` adapter, while the current planner live path stays unchanged and `task-breaker`, `builder`, and `reviewer` remain outside live scope.
- Why: `architect` is already a no-write stage that reads the latest plan bundle, writes one `architecture` artifact, and raises at most one blocking decision before `task-breaker`. That makes it the smallest next live delta after planner without touching live mutation, reviewer provenance, approval consumers, or local-demo-only release and close-out semantics.
- Impact: Architect live input must be anchored to the latest current plan bundle only: `planArtifactId`, `planRunId`, the matching planner run summary, active task and project identity, the fixed repo source-of-truth file set, and the fixed architect code-context allowlist. It must not widen into arbitrary repo scans, operator-supplied file lists, or secret-bearing payloads. Architect live output must use Responses Structured Outputs and return schema-backed `anchor`, `artifact`, and `normalizedResult` data; the adapter must render canonical `architecture` markdown from that structured payload before the artifact is stored. The schema-backed artifact payload must cover boundary fit, affected components or contracts, policy impact, decision-log impact, approved assumptions, no-architecture-change statement, and blocking architecture issues. For this slice, `affectedComponentsOrContracts` must normalize to repo-relative paths only so the downstream architecture allowlist contract stays stable. Allowed architect `nextStage` values are `task-breaker` and `human gate` only. Valid blocking output may create one blocking decision item, but malformed output, anchor mismatch, unsupported stage, invalid affected-path values, missing required fields, or readiness and config failure must fail closed with a run error, no artifact, no decision item, no fallback to `local-stub`, and no secret leakage into runtime state, logs, artifacts, approvals, or UI payloads. Project config stays on the current non-secret metadata shape (`mode`, `adapter`, pinned `model`, env var name), and project-level provider summary remains a coarse readiness signal rather than a new per-role admin surface.

### DEC-033
- Status: `Accepted`
- Decision: Define `strategy-slice-04` as the next live-role boundary: `task-breaker` may open only as an explicit opt-in expansion behind the existing `openai-responses` adapter, while the implemented planner plus architect live path stays unchanged, builder and reviewer live remain blocked, and no UI, release, or close-out semantics widen.
- Why: `task-breaker` is the smallest downstream live delta after `architect`. It is still a no-write stage, it produces one `breakdown` artifact that already has a stable markdown/UI parser contract, and it may raise at most one blocking decision before builder handoff. Opening builder or reviewer instead would immediately widen mutation, review, approval-consumer, and provenance semantics.
- Impact: Task-breaker live input must be anchored to the current matched plan-plus-architecture provenance chain only: `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, active task and project identity, and the fixed repo source-of-truth file set. The coordinator must require that the selected latest `architecture` artifact resolves back to the current latest `plan` artifact and run before any live invocation proceeds. This slice does not add a task-breaker code-context allowlist and must not widen into arbitrary repo scans, operator-supplied file lists, or secret-bearing request material. Task-breaker live output must use Responses Structured Outputs with strict schema-backed `anchor`, `artifact`, and `normalizedResult` data; the adapter must render canonical `breakdown` markdown from that structured payload before the artifact is stored so the current UI/parser contract stays unchanged. The structured `artifact` payload must cover ordered sub-tasks, checkpoints, expected artifacts per checkpoint, verification checkpoints, review trigger point, stop-and-escalate conditions, and execution boundary summary for builder handoff. Allowed task-breaker `nextStage` values are `builder` and `human gate` only. The builder path is valid only when `needsDecision=false`, `blockers=[]`, and `orderedSubTasks` is non-empty. The human-gate path is valid only when `needsDecision=true` and `blockers` is non-empty; it may create exactly one blocking decision item with `kind=decision`, `sourceType=decision`, and `blocksTask=true`. Malformed output, anchor mismatch, provenance mismatch, unsupported stage, missing required fields, readiness or config failure, or any attempt to widen scope must fail closed with a run error only, no artifact, no decision item, no fallback to `local-stub`, and no secret leakage into runtime state, logs, artifacts, approvals, or UI payloads. Project config stays on the current non-secret metadata shape (`mode`, canonical adapter id, pinned `model`, env var name), project-level provider summary remains coarse readiness only, and live role gating opens at most `planner + architect + task-breaker`, with builder and reviewer remaining degraded and blocked until a later explicit decision.

### DEC-034
- Status: `Accepted`
- Decision: Define `strategy-slice-05` as the next live-role boundary: `builder-preflight` may open only as an explicit opt-in expansion behind the existing `openai-responses` adapter, while the implemented planner plus architect plus task-breaker live path stays unchanged, `builder-live-mutation` and `reviewer` live remain blocked, and no release-package or close-out semantics widen.
- Why: `builder-preflight` is the smallest downstream live delta after `task-breaker` that still keeps the slice no-write. It already produces one `preflight` artifact with a fixed shell parser contract, but unlike `builder-live-mutation` it does not consume approval, mutate source files, or change reviewer provenance. Opening `builder-live-mutation` or `reviewer` instead would immediately widen write safety, approval-consumer rules, and downstream provenance semantics.
- Impact: Builder-preflight live input must be anchored to the current matched plan-plus-architecture-plus-breakdown provenance chain only: `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, `breakdownArtifactId`, `breakdownRunId`, active task and project identity, the fixed repo source-of-truth file set, the architecture allowlist derived from the latest `architecture` artifact, and a fixed builder-preflight code-context allowlist constrained to repo-relative paths inside that approved architecture boundary. The coordinator must require that the selected latest `architecture` artifact still resolves to the current latest `plan` artifact and run, and that the selected latest `breakdown` artifact still resolves to that same current plan-plus-architecture chain, before any live invocation proceeds. Builder-preflight input must not widen into arbitrary repo scans, operator-supplied file lists, absolute paths, parent-directory traversal, secret-bearing payloads, or architecture-external code context. Builder-preflight live output must use Responses Structured Outputs with strict schema-backed `anchor`, `artifact`, and `normalizedResult` data; the adapter must render canonical `preflight` markdown from that validated payload before the artifact is stored so the current shell parser contract stays unchanged. The structured `artifact` payload must cover `targetFiles`, `intendedChanges`, `risks`, `verificationPlan`, `reviewEvidenceExpectations`, and `escalationTriggers`; `Input Summary` should remain adapter-rendered from the validated anchor and upstream artifacts instead of being trusted as free-form model output. Clean builder-preflight output must not hand off directly to `builder-live-mutation` or `reviewer`; it must allow only `request-builder-live-mutation-approval` as the downstream action, and only when `needsDecision=false`, `blockers=[]`, `targetFiles` is non-empty, and every target file stays inside the approved architecture allowlist. Escalation paths are limited to `architect`, `task-breaker`, and `human gate` only. Valid human-gate output may create exactly one blocking decision item with `kind=decision`, `sourceType=decision`, and `blocksTask=true`; malformed output, anchor mismatch, provenance mismatch, unsupported next action, invalid path values, missing required fields, readiness or config failure, or any attempt to widen scope must fail closed with a run error only, no artifact, no decision item, no approval record, no fallback to `local-stub`, and no secret leakage into runtime state, logs, artifacts, approvals, or UI payloads. Project config stays on the current non-secret metadata shape (`mode`, canonical adapter id, pinned `model`, env var name), project-level provider summary remains coarse readiness only, and live role gating may open at most `planner + architect + task-breaker + builder-preflight`, with `builder-live-mutation` and `reviewer` remaining degraded and blocked until a later explicit decision.

### DEC-035
- Status: `Accepted`
- Decision: Define `strategy-slice-06` as the next live-role boundary: `builder-live-mutation` may open only as an explicit opt-in expansion behind the existing `openai-responses` adapter, while the implemented planner plus architect plus task-breaker plus builder-preflight live path stays unchanged, `reviewer` live remains blocked, and no release-package or close-out semantics widen.
- Why: `builder-live-mutation` is the smallest remaining downstream live delta after implemented `builder-preflight`. It already has a bounded approval-gated mutation path, and opening it before `reviewer` preserves the current reviewer provenance rule without widening review, release-package, or close-out semantics.
- Impact: Builder-live-mutation live input must be anchored to the current matched plan-plus-architecture-plus-breakdown-plus-preflight provenance chain and the current approved approval pair only: `projectId`, `taskId`, `planArtifactId`, `planRunId`, `architectureArtifactId`, `architectureRunId`, `breakdownArtifactId`, `breakdownRunId`, `preflightArtifactId`, `preflightRunId`, `approvalId`, `approvalTargetArtifactId`, `approvalTargetRunId`, the fixed repo source-of-truth file set, the architecture allowlist, the exact preflight target-file allowlist, code-context paths fixed to that same target-file set, and per-target baseline digests. `approvalTarget*` must exactly match `preflight*`; code-context paths must match the target-file allowlist set; target files stay existing-file-only. Builder-live-mutation output must use Responses Structured Outputs with strict schema-backed `anchor`, `artifact`, and `normalizedResult` data; the adapter must render canonical `change-summary` markdown from that validated payload before it is stored, while `patch` and `diff` remain coordinator-derived artifacts only. Allowed `nextStage` values are `reviewer`, `architect`, and `human gate` only. The reviewer path is valid only when `needsDecision=false`, `blockers=[]`, and `fileUpdates` is non-empty. The human-gate path is valid only when `needsDecision=true`, `blockers` is non-empty, and exactly one blocking decision item is created with `kind=decision`, `sourceType=decision`, and `blocksTask=true`. File-update paths must be repo-relative, unique, non-empty, and a subset of the target allowlist; actual changed files must exactly match the validated file-update path set. `change-summary`, `patch`, and `diff` are one mutation bundle, so partial persistence is forbidden: validation failure must restore the repo, create no mutation artifacts, and consume no approval. Approval is consumed only by one successful bundle for the current approved preflight pair; stale or duplicate reuse stays blocked. Project config stays on the current non-secret metadata shape (`mode`, canonical adapter id, pinned `model`, env var name), project-level provider summary remains coarse readiness, live role gating may open at most `planner + architect + task-breaker + builder-preflight + builder-live-mutation`, and `reviewer` remains degraded and blocked in live mode as an explicit operator step rather than a silent fallback. Provider secrets, auth material, raw provider payloads, and env values must not leak into runtime state, logs, artifacts, approvals, or UI payloads; repo-content redaction policy remains out of scope for this slice.

### DEC-036
- Status: `Accepted`
- Decision: Define `strategy-slice-07` as the next live-role boundary: `reviewer` may open only as an explicit opt-in expansion behind the existing `openai-responses` adapter, while the current implemented live path stays unchanged until later `provider-slice-06` and `provider-slice-07`, and no commit-package, local commit, release-package, or close-out semantics widen.
- Why: `reviewer` is the smallest remaining downstream live delta after `builder-live-mutation`. The reviewer already consumes one bounded builder live-mutation bundle, writes one terminal `review` artifact with a stable parser contract, and does not own commit or release execution. Locking reviewer live now preserves bundle provenance and keeps downstream commit and release follow-up explicit instead of silently moving that authority into the provider path.
- Impact: Reviewer live input must be anchored to the current latest builder live-mutation bundle only: `projectId`, `taskId`, the matched plan-plus-architecture-plus-breakdown-plus-preflight provenance chain, `changeSummaryArtifactId`, `changeSummaryRunId`, `patchArtifactId`, `patchRunId`, `diffArtifactId`, `diffRunId`, `approvalId`, the successful builder live-mutation run summary and logs, the fixed repo source-of-truth file set, and the exact changed-file path set derived from that same builder bundle. Reviewer input must not recombine latest artifacts by type across task history, widen into arbitrary repo scans, operator-supplied file lists, absolute paths, parent-directory traversal, secret-bearing payloads, or re-execute builder, commit, or release work. Reviewer live output must use Responses Structured Outputs with strict schema-backed `anchor`, `artifact`, and `normalizedResult` data; the adapter must render canonical `review` markdown from that validated payload before it is stored so the current `Review Verdict / Evidence Reviewed / Findings / Contract Compliance / Verification Evidence / Accepted Risks / Next Action / Follow-Up Gate` headings remain unchanged. The structured `artifact` payload must cover `verdict`, `evidenceReviewed`, `findings`, `contractCompliance`, `verificationEvidence`, `acceptedRisks`, and `followUpGate`; raw `fail` verdict must remain preserved in the artifact and run summary even if runtime review status maps it to `changes_requested`. Allowed `nextStage` values are `builder`, `architect`, and `human gate` only. The `builder` path is valid only when `verdict` is `fail` or `changes_requested` and the follow-up stays inside the approved architecture boundary. The `architect` path is valid only when the review finds architecture drift or contract-boundary violation. The `human gate` path is the only non-builder downstream on pass, risk-acceptance, or explicit policy follow-up; it must not auto-start `commit-package`, and it may create at most one blocking follow-up decision item only when `needsDecision=true`, `blockers` is non-empty, and that item is `kind=decision`, `sourceType=review`, `blocksTask=true`. Reviewer live must create no approval records and must not silently turn missing evidence, malformed output, or weak verification into a pass. Malformed structured output, anchor mismatch, bundle provenance mismatch, unsupported next action, invalid verdict or follow-up combinations, missing required fields, readiness or config failure, or any attempt to widen scope must fail closed with a run error only, no review artifact, no decision item, no fallback to `local-stub`, and no secret leakage into runtime state, logs, artifacts, approvals, or UI payloads. Project config stays on the current non-secret metadata shape (`mode`, canonical adapter id, pinned `model`, env var name), project-level provider summary remains coarse readiness only, live role gating may open at most `planner + architect + task-breaker + builder-preflight + builder-live-mutation + reviewer`, and downstream commit-package, local commit, release-package, and close-out remain explicit local follow-up steps outside reviewer live execution.

### DEC-030
- Status: `Accepted`
- Decision: Any future delete, archive, or GC capability must stay an explicit operator-invoked retention consumer over the normalized Tier A/B/C artifact rules from `DEC-018`; no hidden background cleanup is allowed, Tier A provenance-critical artifacts remain protected, Tier B remains inspectable and latest-centered until explicitly acted on, and Tier C is the first eligible cleanup tier.
- Why: The runtime now exposes an explicit retention consumer preview/apply path, so the important boundary is no longer "whether cleanup exists" but "whether it stays explicit, inspectable, and provenance-safe." Locking the consumer shape prevents later cleanup work from inventing parallel rules or silently weakening Tier A protection.
- Impact: The current runtime may expose inspect-only preview plus explicit operator-invoked `archive/delete/gc` apply behavior, but hidden cleanup still stays out of scope. Any delete, archive, or GC path must reuse the normalized tiers, keep Tier A protected, preserve inspectable state for Tier B and Tier C, and keep failure policy inspectable in runtime, coordinator, and UI flows. Automatic or hidden cleanup remains out of scope.
- Needed Before: adding any background, implicit, or policy-widening cleanup behavior beyond the explicit retention consumer

### DEC-037
- Status: `Accepted`
- Decision: The first repo-content redaction implementation stays `preview/export only`; it must not rewrite raw stored artifact content and must not create redacted derivative copies as new source-of-truth artifacts.
- Why: The current frozen baseline already separates provider secret non-leak from repo-content redaction and treats raw stored artifacts plus runtime metadata as the canonical evidence chain. A narrower first implementation keeps that boundary intact.
- Impact: Future redaction work may only affect preview, export, or presentation surfaces until a later decision explicitly widens that behavior. `patch` and `diff` stay exact provenance evidence outside redaction scope, and `change-summary` plus `review` keep canonical structured fields intact.

### DEC-038
- Status: `Accepted`
- Decision: `node scripts/smoke-qa-slice-01.mjs` remains optional browser coverage and is not promoted into the required freeze gate; task-breaker optional real-live coverage continues through `node scripts/smoke-qa-live-slice-04.mjs` and does not require a standalone provider live entrypoint.
- Why: The required local and live-provider synthetic baselines already cover the frozen contracts, while `smoke-qa-slice-01` and the task-breaker real-live path add supplementary browser or ops evidence. Keeping them optional avoids widening the required freeze matrix without losing coverage.
- Impact: Browser close-out coverage and task-breaker live evidence remain available for regression or operational follow-up, but the required freeze gate stays unchanged. Any future promotion of `smoke-qa-slice-01` or addition of a standalone task-breaker provider live smoke requires a new decision.

### DEC-039
- Status: `Accepted`
- Decision: Any future commit-side bounded resume CTA uses the operator-facing label `Resume Approved Local Commit` and appears only inside the existing `Task Detail` commit guard area; `Artifacts` and `Decision Inbox` may provide provenance/readiness context or navigation back to that panel, but not a second executing CTA.
- Why: Commit follow-up is already guarded by explicit readiness and approval semantics. Restricting the CTA to the current commit guard area keeps execution authority in one place and avoids turning `Artifacts` or `Decision Inbox` into hidden execution surfaces.
- Impact: Future commit-side helper work must keep approval status, current commit-package id, reviewer/builder/preflight provenance, and blocked reasons visible next to the CTA. `Decision Inbox` stays non-executing and may at most route the operator back to the current task or panel.

### DEC-040
- Status: `Accepted`
- Decision: Any future release-side bounded resume CTA uses the operator-facing label `Resume Approved Close Out` and appears only inside the existing `Task Detail` release or close-out guard area; `Artifacts` and `Decision Inbox` may show navigation-only hints when a current approved release bundle exists, while stale or blocked bundles continue to show guard reasons without a resume hint.
- Why: Release follow-up is heavier than commit continuation because it depends on approved current release provenance, linked worktree alignment, repo cleanliness, and terminal `Review -> Done` finalization. Keeping the CTA in the existing guard area prevents release follow-up from drifting into multiple semi-executing surfaces.
- Impact: Future release-side helper work must stay scoped to approved current release bundles only, must not expose executing CTA buttons from `Artifacts` or `Decision Inbox`, and must preserve existing guard messaging for stale, blocked, or non-current release bundles.

### DEC-041
- Status: `Accepted`
- Decision: Do not start a second provider adapter after v1 completion unless optional real-live housekeeping or a concrete operator gap shows that the current `openai-responses` planner-through-reviewer boundary is insufficient; current `main` stays single-provider and second-provider work remains explicitly deferred.
- Why: The current repo has already closed the operator-usable v1 baseline, preview-only redaction, and bounded downstream helpers without needing provider breadth. Starting a second adapter now would widen readiness, smoke, docs, and failure classification matrices before there is evidence that a second provider solves a current operator problem.
- Impact: Optional real-live housekeeping remains the only provider-related follow-up on current `main`. Any future second provider requires a new explicit decision, preserved `local-stub` shipped default, unchanged planner-through-reviewer live boundary semantics, and a fresh adapter-specific verification matrix rather than being treated as an automatic next step.

### DEC-042
- Status: `Accepted`
- Decision: After the frozen v1 control-plane baseline, treat the current shell as reusable execution infrastructure and pivot the next primary product experience toward `goal input -> visible multi-role AI alignment -> bounded execution -> delivery`, with top-level user-facing framing centered on `Mission / Council / Execution / Deliverables`.
- Why: The current `Taskboard / Logs / Artifacts / Decision Inbox` shell successfully closes inspectable local execution, review, approval, and provenance, but it does not match the intended product experience of "tell the system a goal and watch multiple AI roles coordinate toward a result." Continuing to polish the operator console as the default product would deepen that mismatch instead of fixing it.
- Impact: This decision does not reopen or weaken the frozen v1 constraints. `local-first`, `single-user-first`, `project_path required`, `review before done`, `approval before commit`, bounded live mutation, and the current planner-through-reviewer engine remain authoritative. The existing v1 shell is retained as `advanced ops mode`, while future implementation may add visible role collaboration, council-style alignment, and more automatic progression between stages. Office-first framing, messenger-first posture, ranking, OAuth-first platform work, and multi-provider-first strategy all remain rejected.

### DEC-043
- Status: `Accepted`
- Decision: User-facing orchestration copy defaults to Korean on the primary shell. Internal ids, runtime keys, role ids, artifact types, and route names may remain English where they are already structural source-of-truth identifiers.
- Why: The intended product experience is Korean-first orchestration, but current repo truth still allowed English helper copy, council-generated text, and smoke expectations to drift back into the default shell. Pinning the language rule at the decision level stops repeated copy regressions.
- Impact: `Mission / Council / Execution / Deliverables` and their visible guidance, role presentation, recommendation text, and next-step copy should be written in Korean by default. `advanced ops mode` may keep English-shaped structural ids internally, but visible copy should normalize to Korean whenever touched. This decision does not change runtime semantics, provider boundaries, role ids, or artifact taxonomy.

### DEC-044
- Status: `Accepted`
- Decision: A display-oriented `HQ / crew / flow ownership` metaphor is allowed on the post-v1 primary shell as the minimum safe baseline. When the repo explicitly opts into a stronger company-shell redesign, that wider allowance is governed by `DEC-045`.
- Why: Current `main` already uses visible cast, ranked staff presentation, HQ room names, and first-viewport flow rails to make the orchestration experience legible to first-time users. Repo truth still read that direction as a blanket office-first rejection, which created contract drift even though the implemented shell kept runtime, gate, and advanced-ops semantics intact.
- Impact: `Mission / Council / Execution / Deliverables` may use room names, crew presentation, avatars, and step-ownership rails as user-facing guidance. `Taskboard / Logs / Artifacts / Decision Inbox` remains the authoritative `advanced ops mode`, and runtime ids, task/run/artifact contracts, provider scope, approval/review gates, and local-first constraints stay unchanged. Budgets, org-management, and messenger/platform expansion remain rejected. `DEC-045` may widen the shell from orientation-only to a fuller ERP/company command-center posture.

### DEC-045
- Status: `Accepted`
- Decision: The post-v1 primary shell may adopt a company/ERP-style command-center frame with visible AI role assignment, meeting, attendance, desk, and workday cues as first-class product language. This is no longer limited to a display-only orientation layer.
- Why: The current softened HQ metaphor still reads too much like a themed website and not enough like a distributable orchestration product. The intended product is a company-like operating system where AI roles visibly convene, align, execute, and report on local repo work.
- Impact: `Mission / Council / Execution / Deliverables` may use company/ERP/meeting framing, role roster, attendance cues, meeting agendas, work-order posture, and approval-line language as the default shell. `Taskboard / Logs / Artifacts / Decision Inbox` remains the authoritative `advanced ops mode`, and runtime ids, artifact taxonomy, approval/review gates, provider boundary, and local-first execution rules stay unchanged. Budget/HR/org-management simulation, payroll/workforce mechanics, multiplayer workspace semantics, ranking, messenger-first posture, and generic platform expansion remain rejected.

### DEC-046
- Status: `Accepted`
- Decision: `OpenHarness` is an internal-structure reference for harness robustness only.
- Why: The company-shell redesign needs stronger internal harness discipline as well as a stronger outer shell. `OpenHarness` offers useful public patterns around explicit tool loops, retry/backoff, skill/plugin loading, memory/session handling, permission rules, approval dialogs, and delegation lifecycle without forcing a product-shell copy.
- Impact: Future internal structure work may selectively borrow harness patterns such as path-level permission rules, hook points, memory/session resume discipline, plugin or skill boundaries, and delegated-task lifecycle management. This does not widen the product into a generic agent platform, IM-channel surface, or provider-breadth strategy.

### DEC-047
- Status: `Accepted`
- Decision: Orchestration vNext adopts only two external advantages: OpenClaw-style local gateway/control-plane reach as the outer backbone, and Hermes-style self-improvement loop discipline as the inner growth engine.
- Why: The product needs both clear operator reach and continuous AI development, but copying either project wholesale would widen scope into messenger-first surfaces, provider sprawl, cloud daemon posture, or unattended autonomy. Separating the two advantages lets Orchestration become a local AI operating system without losing approval, review, provenance, and local-first constraints.
- Impact: Future growth work should follow `docs/18_growth-gateway-vnext.md`: gateway surfaces may expose where results, approvals, logs, artifacts, and growth proposals live; the growth engine may collect evidence, reflect, distill skills, learn failure patterns, template repeated work, and propose improvements; session separation, memory non-globalization, and right-sized security boundaries are mandatory; no component may silently mutate, self-commit, self-push, install upstream Hermes, fork OpenClaw, create generic shell execution, or add messenger/provider/cloud/cron breadth without a separate approved decision.
- Reference recheck: On 2026-06-01 the decision was recalibrated against `openclaw/openclaw`, `ultraworkers/claw-code`, `NousResearch/hermes-agent`, and `harness/harness` current public heads. The added signal is source-only: use OpenClaw for gateway/session/scope discipline, Hermes for memory/skill reflection discipline, claw-code for typed worker event/report evidence, and Harness for execution/status/artifact conformance. Do not import those runtimes or widen into their channel, cloud, provider, DevOps, or autonomous release surfaces.

### DEC-048
- Status: `Accepted`
- Decision: The vNext `제안 검토 게이트` is a review-readiness surface only. It does not create or persist durable proposal records, approve proposals, generate or apply proposals, persist long-term memory, mutate sources, call providers, commit, or push.
- Why: The growth shell now displays evidence-derived candidates and a blocked review gate. Without an explicit record boundary, a green review-looking panel can be mistaken for proposal approval, queue persistence, or memory learning. The next product step must preserve the local-first approval model by separating review readiness from durable record creation and long-term memory.
- Impact: `ui/app.js` must keep proposal record creation, proposal record persistence, long-term memory store, provider calls, source mutation, proposal generation/application, commit, and push as source-checkable `false` authority markers until another accepted decision opens them. README, reference audit, and focused UI smoke must describe the gate as blocked and read-only. Local personalization remains browser convenience only.
- Needed Before: A future durable proposal record feature needs an accepted decision, schema with `id`, `status`, timestamps, source refs, evidence refs, and reviewer/approval refs; separate human approval semantics for record creation and application; redaction, export, and expiry rules before long-term memory; focused smoke proving provider calls, memory persistence, source mutation, commit, and push stay blocked until explicit approval.

### DEC-049
- Status: `Accepted`
- Decision: The vNext long-term memory surface is a readiness gate only. It may show prerequisites for future memory storage, but it must not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills, mutate sources, call providers, commit, or push.
- Why: Personalization now stores local UI convenience in browser storage, and growth evidence can show repeated patterns. Without a separate memory boundary, those local hints can be mistaken for durable learning or global memory. The product needs a visible path toward memory while keeping the default behavior local-only and approval-gated.
- Impact: `ui/app.js` must expose long-term memory store, raw transcript ingestion, cross-workspace memory, and skill promotion as source-checkable `false` markers. README, reference audit, vNext plan, and focused smokes must describe the memory gate as blocked readiness, not learning persistence. Browser `localStorage` preferences remain convenience state and are not runtime memory.
- Needed Before: A future memory store needs an accepted storage decision, memory item schema with source refs and evidence refs, workspace/applicability rules, redaction policy, export format, expiry/deletion policy, human review semantics, and focused smoke proving provider calls, raw transcript ingestion, memory persistence, source mutation, commit, and push remain blocked until explicit approval.

### DEC-050
- Status: `Accepted`
- Decision: The vNext proposal review decision spec is defined in `docs/24_proposal-review-decision-spec.md` as a read-only contract for future durable proposal records.
- Why: `DEC-048` blocked durable proposal record creation until schema, approval semantics, source refs, evidence refs, reviewer refs, expiry, and stop conditions were explicit. The product now needs that contract to guide a later implementation slice without turning the current blocked proposal-review preview into record creation, approval, application, or persistence.
- Impact: Future proposal record work must preserve the required fields, separated review/create/apply gates, expiry and supersession rules, and stop conditions in `docs/24_proposal-review-decision-spec.md`. A review acceptance can only feed the next explicit decision. It must not approve record creation, proposal application, source mutation, commit, or push. `ui/app.js` must keep proposal generation, proposal application, proposal record creation, proposal record persistence, provider calls, memory persistence, source mutation, commit, and push blocked until a later accepted implementation decision opens a narrower path.
- Needed Before: A future proposal record creation slice still needs implementation code, focused smoke coverage, task-ledger evidence, and aggregate verification proving record creation is gated and proposal application remains blocked.

### DEC-051
- Status: `Accepted`
- Decision: The vNext memory readiness decision spec is defined in `docs/25_memory-readiness-decision-spec.md` as a read-only contract for future durable memory.
- Why: `DEC-049` blocked long-term memory until the product had a memory item schema with source refs and evidence refs, workspace/applicability rules, redaction policy, export format, expiry/deletion policy, and human review semantics. The product now needs that contract so local browser preferences and Growth Evidence Ledger findings cannot be mistaken for durable memory, raw transcript ingestion, cross-workspace memory, or skill promotion.
- Impact: Future memory work must preserve the required memory item fields, source/redaction rules, separated readiness/storage/export/deletion/skill-promotion gates, expiry and deletion rules, and stop conditions in `docs/25_memory-readiness-decision-spec.md`. Readiness can only feed the next explicit decision. It must not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills, call providers, mutate source, commit, or push. `ui/app.js` must keep memory persistence, long-term memory store, raw transcript ingestion, cross-workspace memory, skill promotion, provider calls, source mutation, commit, and push blocked until a later accepted implementation decision opens a narrower path.
- Needed Before: A future memory persistence slice still needs implementation code, focused smoke coverage, task-ledger evidence, and aggregate verification proving storage is gated and raw transcript ingestion, cross-workspace memory, skill promotion, source mutation, commit, and push remain blocked.

### DEC-052
- Status: `Accepted`
- Decision: The vNext authority expansion review spec is defined in `docs/26_authority-expansion-review-spec.md` as a read-only contract for deciding whether any currently blocked authority can move into later implementation planning.
- Why: The current vNext audit has completed read-only proposal, memory, and growth-dashboard depth contracts, but durable proposal records, memory persistence, provider calls, source mutation, commit, and push still need one shared approval boundary before any narrower implementation slice can open.
- Impact: Future authority expansion work must preserve the request fields, separated readiness/planning/implementation/application gates, stop conditions, rollback requirements, and verification requirements in `docs/26_authority-expansion-review-spec.md`. Review acceptance can only feed the next explicit decision. It must not open proposal generation/application, proposal record creation/persistence, memory persistence, provider calls, source mutation, commit, or push by itself.
- Needed Before: Any future authority-opening slice still needs a later accepted implementation decision naming the exact authority, target surface, approval payload, implementation plan, rollback plan, focused smoke coverage, aggregate verification, and authorities that remain blocked.

### DEC-053
- Status: `Accepted`
- Decision: The vNext authority implementation decision packet is defined in `docs/27_authority-implementation-decision-packet.md` as a read-only operator input for the current `operator decision required` gate.
- Why: `DEC-052` fixed the shared review boundary, but the next human decision still needed one compact packet that separates planning-only approval, implementation-slice approval, rejection, deferral, and request-more-evidence outcomes before any authority-opening implementation can be considered.
- Impact: Future authority-opening work must use the packet's required decision fields, single-target-authority rule, still-blocked authority list, rollback refs, focused smoke refs, and aggregate verification ref. The packet is not implementation approval and must not create proposal records, persist memory, call providers, mutate source, commit, or push.
- Needed Before: Any future implementation still needs an explicit operator decision choosing one outcome, a later accepted implementation plan for exactly one authority path, rollback evidence, focused smoke coverage, aggregate verification, and separate approval before commit or push.

### DEC-054
- Status: `Accepted`
- Decision: The vNext durable proposal record planning preview is defined in `docs/28_durable-proposal-record-planning-preview.md` as a read-only pre-decision planning input for the recommended first candidate.
- Why: The authority decision packet names durable proposal record creation and persistence as the most reviewable first candidate, but the repo needs a concrete shape, storage candidate, focused smoke preview, rollback preview, and stop conditions before the operator can approve planning without accidentally opening implementation authority.
- Impact: Future proposal record planning must preserve the preview's single-authority scope, record shape, local-first storage candidate, focused smoke preview, rollback preview, and stop conditions. This preview is not `approve-planning-only`, implementation approval, record creation, record persistence, proposal application, memory persistence, provider calls, source mutation, commit, or push.
- Needed Before: Actual implementation still needs explicit operator approval through `approve-planning-only` or a stronger accepted decision, a later accepted implementation plan, focused smoke coverage, aggregate verification, rollback evidence, and separate commit or push approval.

### DEC-055
- Status: `Accepted`
- Decision: The vNext operator decision handoff is defined in `docs/29_operator-decision-handoff.md` as a read-only, copy-ready decision template for the current `operator decision required` gate.
- Why: The repo now has a decision packet and planning preview, but the next human action still needs a fielded response shape that separates valid outcomes from ambiguous shortcuts such as `continue`, `approve all`, or `implement vNext`.
- Impact: Future operator decisions must use the required fields, decision options, invalid shortcut rules, minimum planning-only acceptance criteria, still-blocked authority list, and stop conditions in `docs/29_operator-decision-handoff.md`. The handoff is not an operator decision and must not approve planning, approve implementation, create or persist records, apply proposals, persist memory, call providers, mutate source, commit, or push.
- Needed Before: Any future plan or implementation still needs the operator to provide an explicit decision using the handoff fields, followed by a later accepted implementation plan, focused smoke coverage, aggregate verification, rollback evidence, and separate commit or push approval.

### DEC-056
- Status: `Accepted`
- Decision: The vNext durable proposal record implementation plan is defined in `docs/30_durable-proposal-record-implementation-plan.md` after the operator accepted `approve-planning-only` for `durable proposal record creation and persistence`.
- Why: The planning-only decision allows one implementation plan, rollback plan, and focused smoke plan, but it does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push. The repo needs that plan recorded before any later implementation decision can be reviewed.
- Impact: Future durable proposal record implementation must stay limited to one local-first creation and persistence path, use the existing runtime `state.json` under the selected runtime root, keep `applyAllowed=false`, and prove through focused smoke that proposal application, provider calls, memory persistence, source mutation, commit, and push remain blocked. This decision approves planning only; it does not create or persist records and does not open implementation authority.
- Needed Before: Actual implementation still needs a later `approve-implementation-slice` decision for this single authority path, accepted rollback evidence, focused smoke coverage, aggregate verification, and separate commit or push approval.

### DEC-057
- Status: `Accepted`
- Decision: The durable proposal record creation and persistence slice is implemented only for approved local runtime records under the selected runtime root.
- Why: The operator approved `approve-implementation-slice` for the single authority path planned in `docs/30_durable-proposal-record-implementation-plan.md`. The implementation needed to persist reviewed proposal evidence without turning record creation into proposal application, provider execution, memory persistence, source mutation, commit, or push authority.
- Impact: `src/runtime/contracts.js`, `src/runtime/file-store.js`, and `src/runtime/runtime-service.js` now support a `proposalRecords` collection, `proposalRecord` sequence, `proposal-record-0001` ids, approved creation payload validation, required source/negative/reviewer/approval evidence, default 30-day expiry, `applyAllowed=false`, and rollback quarantine. `ui/app.js` reads saved records on the proposal review surface, but still exposes no create/apply UI action. Proposal application, proposal generation, provider calls, memory persistence, source mutation, commit, and push remain blocked.
- Needed Before: Any proposal application or source mutation from a durable proposal record still needs a later explicit operator decision, application approval semantics, rollback evidence, focused smoke coverage, aggregate verification, and separate commit or push approval.

### DEC-058
- Status: `Accepted`
- Decision: Proposal application now stops at a read-only decision packet instead of moving directly from durable record creation into application implementation.
- Why: Durable proposal records can now be created and persisted locally, but applying a record could imply source mutation, provider execution, memory persistence, commit, or push. The next gate needs a fielded operator decision that separates application planning, application implementation, source mutation approval, commit approval, and push approval.
- Impact: `docs/31_proposal-application-decision-packet.md` defines decision options, required fields, application boundary, still-blocked authority, stop conditions, and verification for the next proposal application decision. `scripts/vnext-proposal-application-decision-packet-status.mjs` pins that this is decision input only and does not create a proposal application path. Runtime, UI, provider, memory, source mutation, commit, and push behavior remain unchanged.
- Needed Before: Any proposal application implementation still needs an explicit `approve-application-planning-only` or `approve-application-implementation-slice` path as appropriate, source and negative evidence refs, rollback refs, focused smoke refs, aggregate verification, and separate approval for source mutation, commit, or push when those actions are involved.

### DEC-059
- Status: `Accepted`
- Decision: Proposal application planning now has a read-only, copy-ready operator decision handoff.
- Why: `DEC-058` defined the application decision packet, but the next human response still needs a fielded shape that rejects shortcuts such as `continue`, `apply all proposals`, or `approve all`. The handoff makes the next decision easier without becoming the decision itself.
- Impact: `docs/32_proposal-application-operator-decision-handoff.md` defines valid application planning and implementation statement shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. `scripts/vnext-proposal-application-operator-decision-handoff-status.mjs` verifies the handoff remains read-only and that proposal application, provider calls, memory persistence, source mutation, commit, and push stay blocked.
- Needed Before: Any proposal application planning or implementation still needs the operator to provide a fielded decision using the handoff values, followed by accepted rollback evidence, focused smoke coverage, aggregate verification, and separate approval for source mutation, commit, or push when those actions are involved.

### DEC-060
- Status: `Accepted`
- Decision: Proposal application planning-only approval is accepted for existing durable proposal records.
- Why: The operator provided the full fielded `approve-application-planning-only` decision for `proposal application planning for existing durable proposal records`. The repo now needs one application plan, rollback plan, and focused smoke plan before any implementation decision can be reviewed.
- Impact: `docs/33_proposal-application-implementation-plan.md` records the accepted planning-only decision, the audit-only application attempt plan, rollback plan, focused smoke plan, application contract, and stop conditions. This decision consumes `docs/31_proposal-application-decision-packet.md` and `docs/32_proposal-application-operator-decision-handoff.md` as planning evidence, but it does not approve proposal application implementation, proposal generation, provider calls, memory persistence, source mutation, commit, or push.
- Needed Before: Actual application implementation still needs a later explicit `approve-application-implementation-slice` decision naming exactly one application path, accepted rollback evidence, focused smoke coverage, aggregate verification, and separate approval before source mutation, commit, or push.

### DEC-061
- Status: `Accepted`
- Decision: Proposal application implementation decision handoff is documented as read-only input for the current implementation decision gate.
- Why: The accepted planning-only decision produced an application plan, but implementation remains blocked until the operator provides either an explicit `approve-application-implementation-slice` decision or a rejection. A copy-ready handoff reduces ambiguity without opening implementation authority.
- Impact: `docs/34_proposal-application-implementation-decision-handoff.md` defines the valid implementation decision shape, rejection shape, invalid shortcuts, minimum acceptance criteria, still-blocked authorities, stop conditions, and verification command. It is not an operator decision and does not approve proposal application implementation, proposal generation, provider calls, memory persistence, source mutation, commit, or push.
- Needed Before: Actual application implementation still requires a later fielded operator decision that names exactly one audit-only application attempt path, rollback refs, focused smoke refs, aggregate verification, and the authorities that remain blocked.

### DEC-062
- Status: `Accepted`
- Decision: Proposal application audit-only attempt creation is implemented for existing durable proposal records.
- Why: The operator provided the fielded `approve-application-implementation-slice` decision for one inert application attempt path and then separately approved repository source-file edits for that implementation slice. The approved path needs durable local audit evidence without opening proposal generation, source mutation, provider calls, memory persistence, commit, or push.
- Impact: `src/runtime/contracts.js`, `src/runtime/file-store.js`, and `src/runtime/runtime-service.js` now support local `proposalApplicationAttempts` records with forced-false authority flags. `ui/app.js` exposes application attempt evidence as a read-only proposal review marker. `docs/35_proposal-application-implementation.md`, `scripts/smoke-proposal-application-attempt-creation.mjs`, and `scripts/vnext-proposal-application-implementation-status.mjs` record and verify the implementation. This decision does not approve proposal generation, provider calls, memory persistence, source mutation, commit, or push.
- Needed Before: Any actual proposal application that mutates runtime proposal source, project source files, provider state, memory, commits, or pushes still requires a later explicit authority decision, rollback evidence, focused smoke coverage, and aggregate verification.

### DEC-063
- Status: `Accepted`
- Decision: Proposal application source mutation now stops at a read-only decision packet before any planning or implementation authority can open.
- Why: The implemented audit-only application attempt records operator intent, but moving from that evidence into source mutation would change project files and could imply provider calls, memory persistence, commit, or push. The next gate needs a fielded operator decision that separates application evidence, source mutation planning, source mutation implementation, provider approval, memory approval, commit approval, and push approval.
- Impact: `docs/36_proposal-application-source-mutation-decision-packet.md` defines decision options, required fields, source mutation boundary, still-blocked authorities, stop conditions, and verification for the next proposal application source mutation decision. `scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs` pins that this is decision input only. Runtime, UI, provider, memory, source mutation, commit, and push behavior remain unchanged.
- Needed Before: Any source mutation planning or implementation still needs a later fielded operator decision, source and negative evidence refs, application attempt refs, mutation plan refs, rollback refs, focused smoke refs, aggregate verification, and separate approval for provider calls, memory persistence, commit, or push when those actions are involved.

### DEC-064
- Status: `Accepted`
- Decision: Proposal application source mutation operator handoff is documented as read-only decision input.
- Why: The source mutation decision packet defines the required decision fields, but the operator still needs a copy-ready handoff that separates planning-only approval, implementation-slice approval, evidence requests, rejection, and deferral without opening source mutation authority.
- Impact: `docs/37_proposal-application-source-mutation-operator-decision-handoff.md` defines valid source mutation planning and implementation statement shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authorities, stop conditions, and verification. `scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs` verifies the handoff is now consumed by the planning-only decision and moves the live route to a source mutation implementation decision requirement. Runtime, UI, provider, memory, source mutation implementation, commit, and push behavior remain unchanged.
- Needed Before: Any source mutation implementation still requires a later fielded operator decision naming exactly one accepted mutation plan, application attempt refs, rollback refs, focused smoke refs, aggregate verification, and the authorities that remain blocked.

### DEC-065
- Status: `Accepted`
- Decision: Proposal application source mutation planning-only decision is accepted as a plan artifact only.
- Why: The operator provided the full fielded `approve-source-mutation-planning-only` decision for `proposal application source mutation planning for one audit-only application attempt path`. The repo now needs one mutation plan, rollback plan, and focused smoke plan before any implementation decision can be reviewed.
- Impact: `docs/38_proposal-application-source-mutation-planning-plan.md` records the accepted planning-only decision, mutation plan, rollback plan, focused smoke plan, source mutation contract, and implementation prerequisites. This decision consumes `docs/36_proposal-application-source-mutation-decision-packet.md` and `docs/37_proposal-application-source-mutation-operator-decision-handoff.md` as planning evidence, but it does not approve source mutation implementation, proposal generation, provider calls, memory persistence, commit, or push.
- Needed Before: Actual source mutation implementation still needs a later explicit `approve-source-mutation-implementation-slice` decision naming exactly one accepted mutation plan, target files or surfaces, clean baseline proof, diff preview evidence, accepted rollback refs, focused smoke coverage, aggregate verification, and separate approval before provider calls, memory persistence, commit, or push.

### DEC-066
- Status: `Accepted`
- Decision: The code-present `knowledge-work` pack is explicit opt-in and non-default, while the frozen v1 baseline remains centered on the `development` pack.
- Why: The repository includes `packs/knowledge-work/pack.md`, runtime pack constants, UI selection, coordinator references, and smoke coverage for bounded non-coding deliverables. Leaving docs at a plain "development pack only" statement makes the code-present pack look like scope drift instead of an explicit, non-default path.
- Impact: `AGENTS.md`, `docs/00_master-brief.md`, `docs/03_architecture-roadmap-v1.md`, and README must describe `knowledge-work` as opt-in support for bounded artifacts such as decision memos, plans, checklists, and research briefs. This decision does not replace the default `development` workflow, create a pack marketplace, add further non-development packs, weaken review or approval gates, call providers, persist memory, mutate source, commit, or push.
- Needed Before: Any additional pack, default workflow change, marketplace behavior, or broader non-development expansion still requires a later explicit decision and verification plan.

### DEC-067
- Status: `Accepted`
- Decision: Implement the approved proposal application source mutation slice: `applyProposalSourceMutation` applies exactly one accepted mutation plan for one audit-only application attempt, with `rollbackProposalSourceMutation` and `quarantineProposalSourceMutation` as the recorded safety paths.
- Why: The operator accepted `operator-decision-vnext-proposal-source-mutation-implementation-001` (`approve-source-mutation-implementation-slice`) against the accepted planning plan in `DEC-065` and `docs/38_proposal-application-source-mutation-planning-plan.md`, after the audit-only attempt path (`DEC-062`) and the decision packet/handoff evidence (`DEC-063`, `DEC-064`).
- Impact: The runtime gains one approved local mutation path guarded by a separate source mutation approval, exactly-one-target normalization, clean baseline proof, dry-run diff preview, expectedBeforeContent matching, one-mutation-per-attempt, project-path containment, recorded beforeContent rollback, quarantine, and load-time authority hardening in `src/runtime/file-store.js`. `docs/39_proposal-application-source-mutation-implementation.md`, `scripts/smoke-proposal-application-source-mutation.mjs`, and `scripts/vnext-proposal-application-source-mutation-implementation-status.mjs` record and pin the slice. Proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, and push remain blocked, and `proposalRecord.applyAllowed` stays false.
- Needed Before: Any broader mutation scope, multi-file mutation, proposal generation, provider call, memory persistence, commit, or push still requires a later explicit decision with rollback, focused smoke, and aggregate verification evidence.

### DEC-068
- Status: `Accepted`
- Decision: Document one read-only proposal generation decision packet for deterministic local proposal draft generation from exactly one existing Growth Evidence Ledger candidate.
- Why: Growth evidence candidates, durable proposal record creation, audit-only application attempts, and one approved source-mutation path exist, but proposal generation remains blocked and has no fielded operator decision input. The next planning gate must separate deterministic draft assembly from provider-assisted generation, durable record creation, proposal application, source mutation, commit, and push.
- Impact: `docs/40_proposal-generation-decision-packet.md` and `scripts/vnext-proposal-generation-decision-packet-status.mjs` define and verify the planning-only decision fields, one-candidate boundary, inert draft posture, rollback requirements, focused smoke requirements, stop conditions, and copy-ready operator statement. This decision documents input only; it does not approve planning, implementation, proposal generation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, or push.
- Needed Before: Any proposal generation plan still requires a fielded `approve-proposal-generation-planning-only` operator decision. Implementation requires a later accepted plan, implementation decision, rollback evidence, focused smoke, aggregate verification, and separate approval for every downstream authority.

### DEC-069
- Status: `Accepted`
- Decision: Add a read-only proposal generation operator decision handoff for the `proposal generation planning decision required` gate.
- Why: The decision packet defines the required field set, but broad continuation phrases such as `continue`, `do everything`, or `approve all` are invalid shortcuts for opening planning authority. The next gate needs an operator-facing handoff that makes the exact decision shape reusable without treating the handoff itself as approval.
- Impact: `docs/41_proposal-generation-operator-decision-handoff.md` and `scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs` define and verify valid planning, evidence-request, rejection, and deferral shapes; invalid shortcuts; minimum planning acceptance; upstream proposal queue/readiness evidence; and still-blocked authority. This decision records handoff evidence only; it does not record an operator decision, approve planning, approve implementation, generate proposals, call providers, persist memory, create durable records, apply proposals, mutate source, commit, or push.
- Needed Before: Any proposal generation plan still requires the operator to provide the full fielded `approve-proposal-generation-planning-only` decision for exactly one deterministic local draft planning path from one existing Growth Evidence Ledger candidate.

### DEC-070
- Status: `Accepted`
- Decision: Accept `operator-decision-vnext-proposal-generation-planning-001` as planning-only approval for one deterministic local proposal draft generation path.
- Why: The operator provided every required field for exactly one Growth Evidence Ledger candidate path, including positive and negative evidence, rollback, focused-smoke, aggregate-verification, and still-blocked-authority references.
- Impact: `docs/42_proposal-generation-planning-plan.md` records one inert draft contract, deterministic mapping boundary, stale-evidence rejection, rollback/quarantine plan, and focused smoke plan. This accepts planning only; proposal generation implementation, provider calls, durable record creation, proposal application, memory persistence, runtime/UI/source mutation, commit, and push remain blocked.
- Needed Before: A later fielded implementation decision must name exactly one entrypoint and inert draft path, carry the accepted plan plus rollback and focused-smoke evidence, and keep all downstream authority blocked.

### DEC-071
- Status: `Accepted`
- Decision: Approve `operator-decision-vnext-proposal-generation-implementation-001` for exactly one deterministic local inert proposal draft generator.
- Why: The accepted planning evidence now names one candidate, one pure entrypoint, explicit freshness input, rollback boundary, and focused smoke, allowing a narrowly testable implementation without opening any durable or external authority.
- Impact: `src/runtime/proposal-drafts.js#createDeterministicProposalDraft` validates the approved candidate and evidence, then returns an in-memory `draft-only` object with `applyAllowed=false`. It does not persist records, mutate queues, apply proposals, call providers, persist memory, mutate runtime/UI/source state, commit, or push. `docs/43_proposal-generation-implementation.md` and its focused smoke are the current implementation evidence.

### DEC-072
- Status: `Accepted`
- Decision: Add a read-only pending human-review packet for one deterministic inert proposal draft.
- Why: An inert draft needs a compact, inspectable review input before any human outcome can be considered. The review surface must preserve evidence and freshness without becoming a review decision or an implicit promotion path.
- Impact: `src/runtime/proposal-draft-reviews.js#createProposalDraftHumanReviewPacket` accepts only fresh `draft-only` input and returns `pending-human-review` with no `reviewOutcome`. It does not create records, mutate queues, apply proposals, call providers, persist memory, mutate runtime/UI/source state, commit, or push. A later fielded human review decision remains required for any downstream authority.

### DEC-073
- Status: `Accepted`
- Decision: Define a read-only fielded human-review decision packet for one deterministic inert proposal draft.
- Why: `DEC-072` supplies pending review evidence, but a human outcome needs a complete, inspectable shape that cannot be confused with durable record creation, queue mutation, proposal application, or external authority.
- Impact: `docs/45_proposal-draft-human-review-decision-packet.md` and `scripts/vnext-proposal-draft-human-review-decision-packet-status.mjs` define and verify evidence-only acceptance, request-more-evidence, rejection, and deferral outcomes. They do not record an outcome, mutate state, or open durable record, queue, application, provider, memory, runtime/UI/source mutation, commit, or push authority.
- Needed Before: Any actual human-review outcome must be provided as a complete fielded decision for exactly one fresh pending packet. Any durable or external action remains subject to a separate explicit authority decision and verification.

### DEC-074
- Status: `Accepted`
- Decision: Accept `operator-decision-vnext-proposal-draft-human-review-001` as `accept-review-evidence-only` for one deterministic local inert proposal draft.
- Why: The operator explicitly supplied the permitted `decisionStatus=accept-review-evidence-only` outcome after the fielded review packet in `DEC-073`. Recording that result as repository evidence closes the review-evidence gate without claiming a runtime packet, runtime decision record, or downstream action.
- Impact: `docs/46_proposal-draft-human-review-evidence-decision.md` records the fixed source references, freshness rule, blocked authorities, rollback boundary, and aggregate verification. The pending packet remains in-memory with no `reviewOutcome`; durable record creation, queue mutation, proposal application, provider calls, memory persistence, runtime/UI/source mutation, commit, and push remain blocked.
- Needed Before: Any durable or external action still needs a later fielded decision that names exactly one downstream authority, rollback evidence, focused smoke coverage, aggregate verification, and all remaining blocked authorities.

### DEC-075
- Status: `Accepted`
- Decision: Define a read-only downstream authority decision packet for one reviewed deterministic local inert proposal draft.
- Why: `DEC-074` closes the review-evidence gate but intentionally opens no downstream authority. The next operator choice needs one complete, inspectable shape that recommends the smallest local-first planning target and rejects broad continuation wording as approval.
- Impact: `docs/47_proposal-draft-downstream-authority-decision-packet.md` and `scripts/vnext-proposal-draft-downstream-authority-decision-packet-status.mjs` define and verify planning-only approval, evidence request, rejection, and deferral for local durable proposal record creation planning. They do not record an outcome or open implementation, record creation, persistence, queue mutation, application, provider, memory, runtime/UI/source mutation, commit, or push authority.
- Needed Before: The operator must supply one complete fielded decision for the named candidate. Any later implementation still requires a separate accepted plan and implementation decision.

### DEC-076
- Status: `Accepted`
- Decision: Accept `decisionStatus=approve-ai-company-master-plan-documentation` for the source-of-truth AI Company master plan documentation package.
- Why: The product goal is to evolve the existing local-first Mission/Council/Execution/Deliverables shell into an inspectable AI company where source-backed roles can staff a Mission, produce independent Council positions, synthesize a recommendation, execute bounded WorkOrders, review and QA results, and deliver a provenance-complete package. The current runtime has the execution and approval spine but still uses a deterministic Council transcript and browser-only company presentation, so implementation needs one coherent source contract before any runtime authority opens.
- Impact: `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, and `docs/51_ai-company-delivery-roadmap.md` define current truth, the target operating model, planned domain objects, state and authority contracts, Council protocol, phase gates, rollback, verification, and the first recommended runtime slice. This decision authorizes those docs, the decision/task ledgers, one focused documentation smoke, aggregate registration, verification, commit, and push only. It does not change runtime schema or behavior and does not authorize provider role expansion, memory persistence, autonomous scheduling, agent source mutation, approval bypass, unattended commit, or unattended push.
- Needed Before: Phase 1 or any later runtime work requires a separate fielded decision naming exactly one implementation authority, exact target files, compatibility or migration plan, rollback refs, focused runtime/API/UI smoke, aggregate verification, and all authorities that remain blocked. The recommended next planning target is `runtime CompanyBlueprint and AgentProfile implementation planning`.

### DEC-077
- Status: `Accepted`
- Decision: Accept `operator-delegated-ai-company-runtime-blueprint-planning-001` with `decisionStatus=approve-runtime-company-blueprint-planning-only` for `runtime CompanyBlueprint and AgentProfile implementation planning`.
- Why: The operator approved the named next gate and delegated self-approval for non-critical decisions. Planning is reversible documentation work, while the resulting runtime/API change remains architecture-sensitive and separately gated. The current source evidence shows no repo-backed blueprint, role contracts, strict loader, or runtime company envelope, while persisted state remains schema v6 and the browser roster remains presentation-only.
- Impact: `docs/52_ai-company-runtime-blueprint-implementation-plan.md` fixes an exact read-only source-loader and additive snapshot plan, strict validation, schema v6 compatibility, rollback, focused smoke, and blocked authority. It authorizes planning evidence, its focused documentation smoke, aggregate registration, documentation commit, and push only. It does not authorize company source files, runtime loader/API implementation, schema migration, Council role execution, provider calls, memory persistence, autonomous scheduling, source mutation, approval bypass, or runtime-agent commit/push/release.
- Needed Before: Runtime implementation requires the full fielded `approve-ai-company-runtime-blueprint-implementation-slice` decision in `docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md`.

### DEC-078
- Status: `Accepted`
- Decision: Define the AI Company runtime blueprint implementation decision handoff as read-only input for the current Phase 1 implementation gate.
- Why: The accepted planning-only decision creates a reviewable plan but cannot open an architecture-sensitive loader or API snapshot change. A copy-ready fielded shape is required to keep schema v6 compatibility, exact target files, invalid-source failure, rollback, focused smoke, and downstream blocked authority explicit.
- Impact: `docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md` defines valid approval and rejection shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. It records no runtime implementation outcome and does not create company source files, load profiles, change API snapshots, execute Council roles, call providers, persist memory, schedule work, mutate source, bypass approval, or grant runtime-agent commit/push/release authority.
- Needed Before: The operator must provide the complete fielded implementation decision. Broad approval or delegated self-approval does not cover this architecture-sensitive runtime slice.

### DEC-079
- Status: `Accepted`
- Decision: Accept `operator-decision-ai-company-runtime-blueprint-implementation-001` with `decisionStatus=approve-ai-company-runtime-blueprint-implementation-slice` for read-only runtime `CompanyBlueprint` and `AgentProfile` loading plus additive snapshot exposure.
- Why: The operator supplied the complete fielded decision against `docs/52_ai-company-runtime-blueprint-implementation-plan.md`, including exact target files, schema v6 compatibility, negative evidence, rollback, focused smoke, aggregate verification, and still-blocked downstream authority. The repository needed a stable runtime identity layer before any real Council execution could be considered.
- Impact: `company/blueprint.json` and nine `company/roles/*.md` files now define immutable source policy. `src/runtime/company-blueprint.js` strictly rejects unknown fields, unsupported roles/modes/tools, duplicate ids, unsafe or missing role refs, malformed JSON, and forbidden authority; it returns deeply frozen policy or a secret-free invalid status. `createRuntimeService` preserves the legacy snapshot when no path is supplied and adds a read-only `companyRuntime` envelope only for the configured local server path. Persisted state remains schema v6 and stores no company policy. Current deterministic Council behavior is unchanged.
- Needed Before: StaffingPlan runtime, independent Council positions, Conductor synthesis, provider role expansion, memory/checkpoint persistence, autonomous scheduling, WorkOrder execution, runtime profile mutation, source mutation, approval bypass, or runtime-agent commit/push/release each require later fielded decisions. The recommended next target is `Real Council for one Mission implementation planning` using local-stub roles only.

### DEC-080
- Status: `Accepted`
- Decision: Accept `operator-delegated-ai-company-real-council-planning-001` with `decisionStatus=approve-ai-company-real-council-planning-only` for `Real Council for one Mission implementation planning using local-stub roles only`.
- Why: The operator approved the next named gate and previously delegated non-critical self-approval. Planning is reversible documentation work, while separate role execution, persisted attempts, new API routes, and UI actions are architecture-sensitive implementation and remain separately gated. Current evidence proves a strict source-backed roster but only one synchronous deterministic Council transcript.
- Impact: `docs/54_ai-company-real-council-implementation-plan.md` fixes one opt-in local-stub vertical slice with independent Strategist/Architect/Decomposer position requests, deterministic conflict checking, Conductor synthesis, human `approve/request-revision/stop`, schema v6 compatibility, legacy route preservation, rollback, and focused runtime/API/UI smoke plans. It authorizes planning evidence, documentation/verifier updates, verification, commit, and push only. It does not authorize Council role execution or runtime/API/UI changes.
- Needed Before: Real Council implementation requires the complete fielded `approve-ai-company-real-council-local-stub-implementation-slice` decision in `docs/55_ai-company-real-council-implementation-decision-handoff.md`.

### DEC-081
- Status: `Accepted`
- Decision: Define the AI Company Real Council implementation decision handoff as read-only input for the current Phase 2 implementation gate.
- Why: The accepted planning package must not let broad continuation wording open independent role execution, new persisted state, API routes, or alignment actions. A copy-ready decision shape keeps the exact allowlist, local-stub-only execution, schema v6 compatibility, legacy route behavior, rollback, focused smoke, and downstream blocked authority explicit.
- Impact: `docs/55_ai-company-real-council-implementation-decision-handoff.md` defines valid approval/rejection shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. It records no runtime implementation outcome and does not execute roles, create new Council records, alter APIs/UI, call providers, persist memory, schedule work, mutate source, bypass approval, or grant runtime-agent commit/push/release authority.
- Needed Before: The operator must supply the complete fielded implementation decision. General approval and delegated non-critical self-approval do not cover the architecture-sensitive Phase 2 implementation.

### DEC-082
- Status: `Accepted`
- Decision: Accept `operator-decision-ai-company-real-council-implementation-001` with `decisionStatus=approve-ai-company-real-council-local-stub-implementation-slice` for one Mission independent local-stub Council positions, deterministic conflict check, Conductor synthesis, and human alignment decisions.
- Why: The operator explicitly approved every field in `docs/55_ai-company-real-council-implementation-decision-handoff.md`, including the exact target allowlist, schema v6 and legacy compatibility plan, rollback, focused runtime/API/UI smokes, aggregate verification, and downstream blocked authority. Phase 1 already provides strict source-backed role identities, so the smallest next vertical slice can execute only those local-stub Council contracts without opening provider or mutation authority.
- Impact: New pure Council record validators, a Council-only local-stub adapter, and a dependency-injected coordinator produce isolated Strategist/Architect/Decomposer positions, deterministic conflict evidence, and validated Conductor synthesis. `createRuntimeService` adds opt-in start/resume/decision methods; the server adds separate start/resume/decision routes; the UI renders real-session evidence and `approve/request-revision/stop` controls while preserving legacy deterministic routes and sessions. Persisted state remains schema v6, `createEmptyState` and file-store normalization are unchanged, and approval reuses the existing bounded execution chain only through the current builder-preflight approval boundary.
- Needed Before: Provider-assisted Council, standalone StaffingPlan, dynamic or parallel scheduling, ExecutionPlan/WorkOrder runtime, memory/checkpoint schema expansion, runtime profile mutation, source mutation, approval bypass, runtime-agent commit/push, or release each require a later complete fielded decision. The next recommended target is Phase 3 Council live-provider opt-in planning, not implementation.

### DEC-083
- Status: `Accepted`
- Decision: Accept `operator-delegated-ai-company-council-live-provider-planning-001` with `decisionStatus=approve-ai-company-council-live-provider-planning-only` for `Council live-provider opt-in implementation planning for the existing normalized position and synthesis contract`.
- Why: The operator approved the next named gate and delegated non-critical self-approval, while provider implementation and calls remain architecture- and credential-sensitive. The repository already proves a strict local-stub Council contract and one execution OpenAI Responses boundary, but it has no Council provider adapter, mode, evidence envelope, cancellation path, or focused provider smoke.
- Impact: `docs/56_ai-company-council-live-provider-implementation-plan.md` fixes one explicit `real-openai-responses` path with a four-role allowlist, unchanged normalized position/synthesis schema, isolated prompts, deterministic conflict-before-synthesis, sequential bounded calls, retry/timeout/cancellation, redacted provider evidence, schema v6 and local-stub compatibility, optional live verification, rollback, and exact future target files. This authorizes planning evidence, documentation/verifier updates, verification, commit, and push only; it does not authorize provider implementation, credentials, calls, runtime/API/UI changes, or downstream authority.
- Needed Before: Council provider implementation requires the complete fielded `approve-ai-company-council-live-provider-implementation-slice` decision in `docs/57_ai-company-council-live-provider-implementation-decision-handoff.md`.

### DEC-084
- Status: `Accepted`
- Decision: Define the AI Company Council live-provider implementation decision handoff as read-only input for the current Phase 3 implementation gate.
- Why: The accepted planning package must not let broad continuation wording open provider code, credential access, network calls, async runtime behavior, source-policy expansion, or UI controls. A copy-ready fielded decision keeps the exact allowlist, one-provider boundary, local-stub authority, schema v6 compatibility, redaction, cancellation, rollback, focused synthetic/optional-live/UI smoke, and downstream blocked authority explicit.
- Impact: `docs/57_ai-company-council-live-provider-implementation-decision-handoff.md` defines valid approval/rejection shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. It records no implementation outcome, reads no credentials, calls no provider, and changes no runtime/API/UI/provider behavior.
- Needed Before: The operator must supply the complete fielded implementation decision. General approval and delegated non-critical self-approval do not cover the architecture- and credential-sensitive Phase 3 implementation.

### DEC-085
- Status: `Accepted`
- Decision: Accept `operator-decision-ai-company-council-live-provider-implementation-001` with `decisionStatus=approve-ai-company-council-live-provider-implementation-slice` for one explicit OpenAI Responses opt-in path using the existing Real Council normalized position and synthesis contract.
- Why: The operator supplied the complete fielded decision with the exact target allowlist, one-provider and four-role boundary, local-stub authority, schema v6 compatibility, rollback, focused synthetic/UI/optional-live verification, and downstream blocked authority. Phase 2 already proves isolated normalized role contracts, so the provider slice can remain an additive transport path rather than redefining Council semantics.
- Impact: `real-openai-responses` adds a readiness-gated async path for sequential Strategist, Architect, Decomposer, and Conductor requests. Deterministic code computes conflict before synthesis; provider evidence stores only adapter, model, provider run id, usage, attempt count, timestamps, outcome, and safe error code. HTTP 429/5xx retry, timeout, request cancellation, malformed output, missing configuration, and call budget fail closed without local fallback. `real-local-stub`, legacy routes, schema v6, existing execution provider behavior, and human `approve/request-revision/stop` remain unchanged.
- Needed Before: Provider matrix expansion, standalone StaffingPlan, dynamic or parallel scheduling, ExecutionPlan/WorkOrder compilation or execution, memory/checkpoint schema expansion, runtime profile or source mutation, approval bypass, runtime-agent commit/push/release, and external connectors each require a later complete fielded decision. The next recommended target is Phase 4 Mission compiler and WorkOrder planning only.

### DEC-086
- Status: `Accepted`
- Decision: Accept `operator-delegated-ai-company-mission-workorder-compiler-planning-001` with `decisionStatus=approve-ai-company-mission-workorder-compiler-planning-only` for `planning only for one deterministic Mission-to-ExecutionPlan and inert WorkOrder draft compiler`.
- Why: The operator approved the next named gate and delegated non-critical self-approval, while runtime/API/UI implementation remains architecture-sensitive. Current evidence has approved normalized Council synthesis and a linked-task auto-chain but no ExecutionPlan, WorkOrder, HandoffPacket, compile spec, graph validator, or inert preview. Council output also lacks target path allowlists and verification commands, so a compiler must require those fields explicitly instead of inventing them.
- Impact: `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md` defines one explicit response-only preview path with an exact operator `compileSpec`, fixed Builder -> Reviewer -> QA graph, deterministic digest, dependency/cycle/collision validation, closed authority, schema v6 compatibility, default auto-chain preservation, rollback, and focused runtime/API/UI smoke requirements. This authorizes planning evidence, documentation/verifier updates, verification, commit, and push only; it does not authorize compiler implementation or any durable or executable WorkOrder authority.
- Needed Before: Compiler implementation requires the complete fielded `approve-ai-company-mission-workorder-compiler-implementation-slice` decision in `docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md`.

### DEC-087
- Status: `Accepted`
- Decision: Define the AI Company Mission compiler and inert WorkOrder implementation decision handoff as read-only input for the current Phase 4 implementation gate.
- Why: Broad continuation wording must not open a new runtime compiler, Council handoff mode, API/UI preview, graph semantics, or downstream execution authority. A copy-ready fielded shape keeps the exact target allowlist, response-only contract, operator-owned missing inputs, schema v6 compatibility, default auto-chain behavior, rollback, focused smoke, and blocked authority explicit.
- Impact: `docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md` defines valid approval/rejection shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. It records no implementation outcome and creates no ExecutionPlan, WorkOrder, HandoffPacket, task, run, artifact, approval, checkpoint, provider call, mutation, commit, push, or release.
- Needed Before: The operator must supply the complete fielded implementation decision. General approval and delegated non-critical self-approval do not cover this architecture-sensitive Phase 4 implementation.

### DEC-088
- Status: `Accepted`
- Decision: Accept `operator-decision-ai-company-mission-workorder-compiler-implementation-001` with `decisionStatus=approve-ai-company-mission-workorder-compiler-implementation-slice` for one deterministic in-memory Mission-to-ExecutionPlan and inert Builder, Reviewer, and QA WorkOrder preview path.
- Why: The operator supplied the complete fielded decision against `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`, including the exact target surface, source-current Council gate, operator-owned compile inputs, schema v6 compatibility, rollback, focused runtime/API/UI smokes, and downstream blocked authority. Phase 3 already provides normalized Real Council synthesis, but it does not provide execution-critical target paths, expected artifacts, verification commands, or stop conditions, so those fields must remain exact operator input.
- Impact: `src/runtime/mission-workorder-compiler.js` now validates one complete candidate graph before Council approval persistence and returns a deeply frozen response-only ExecutionPlan, three sequential WorkOrder drafts, and normalized HandoffPackets. Runtime/API/UI add only explicit `inert-workorder-preview` approval and recompute paths; invalid input leaves alignment unchanged, successful inert approval skips the linked-task auto-chain, and the default approval path remains compatible. No plan, WorkOrder, handoff, task, run, artifact, approval, or checkpoint object is persisted; schema v6 and source policy remain unchanged.
- Needed Before: Any ExecutionPlan or WorkOrder persistence, approval, queueing, scheduling, execution, StaffingPlan, dynamic staffing, provider expansion, memory/checkpoint expansion, profile/source mutation, approval bypass, runtime-agent commit/push/release, or external connector requires a later complete fielded decision. The next architecture-sensitive target is Phase 5 WorkOrder persistence and execution planning, not implementation.

### DEC-089
- Status: `Accepted`
- Decision: Accept `operator-delegated-ai-company-workorder-persistence-execution-planning-001` with `decisionStatus=approve-ai-company-workorder-persistence-execution-planning-only` for planning only for one durable ExecutionPlan and WorkOrder record set, one digest-bound operator approval, and one sequential Builder dispatch that stops at the existing live-mutation approval gate.
- Why: The operator requested the next step and previously delegated non-critical self-approval, while schema migration, durable runtime records, approval integration, and execution dispatch remain architecture-sensitive. Current state is schema v6, the Phase 4 preview is response-only, approvals are task-owned, and no WorkOrder coordinator or QA runtime exists. The smallest coherent plan therefore reuses existing task, Decision Inbox, local-stub execution, and builder preflight gates instead of introducing a general scheduler.
- Impact: `docs/60_ai-company-workorder-persistence-execution-plan.md` defines additive schema v7 records, exact preview/source digest promotion, one task-owned plan approval, one separate local sequential Builder start, and a hard stop at the existing targeted builder live-mutation approval. It defines migration, idempotency, reload, failure, rollback, runtime/API/UI, and focused smoke requirements while keeping Reviewer/QA execution, parallel scheduling, provider-backed WorkOrder dispatch, source mutation, commit, push, release, and connectors blocked. This decision authorizes planning evidence, documentation/verifier updates, verification, commit, and push only.
- Needed Before: Schema/runtime/API/UI implementation requires the complete fielded `approve-ai-company-workorder-persistence-execution-implementation-slice` decision in `docs/61_ai-company-workorder-persistence-execution-decision-handoff.md`.

### DEC-090
- Status: `Accepted`
- Decision: Define the AI Company WorkOrder persistence and sequential execution implementation decision handoff as read-only input for the current Phase 5 implementation gate.
- Why: Broad continuation wording must not open schema v7 migration, durable plan records, approval creation, provider calls, WorkOrder dispatch, or source mutation. A copy-ready fielded shape keeps the exact target allowlist, migration contract, digest-bound approval, local-stub-only first Builder dispatch, existing live-mutation stop, rollback retention, focused smoke, and downstream blocked authority explicit.
- Impact: `docs/61_ai-company-workorder-persistence-execution-decision-handoff.md` defines valid approval/rejection shapes, invalid shortcuts, minimum acceptance criteria, still-blocked authority, and stop conditions. It records no schema or runtime implementation outcome and creates no durable record, task, approval, run, artifact, provider call, source mutation, commit, push, or release.
- Needed Before: The operator must supply the complete fielded implementation decision. General approval and delegated non-critical self-approval do not cover this schema- and execution-sensitive Phase 5 implementation.

### DEC-091
- Status: `Accepted`
- Decision: Accept `operator-decision-ai-company-workorder-persistence-execution-implementation-001` with `decisionStatus=approve-ai-company-workorder-persistence-execution-implementation-slice` for one schema-v7 durable ExecutionPlan/WorkOrder path, one digest-bound operator approval, and one local sequential Builder dispatch.
- Why: The operator supplied the complete fielded decision against `docs/60_ai-company-workorder-persistence-execution-plan.md`, including exact migration, runtime/API/UI, rollback, focused smoke, compatibility, and still-blocked authority fields. Phase 4 already provides a deterministic source-current preview; the smallest durable continuation promotes that exact graph and reuses the existing task, Decision Inbox, and Builder preflight gates instead of adding a scheduler.
- Impact: Valid schema v6 state migrates additively to schema v7 with durable ExecutionPlan, WorkOrder, and HandoffPacket maps. Exact preview/source digest input atomically creates one plan, three sequential WorkOrders, three handoffs, one linked control task, and one task-owned plan approval. Decision Inbox approval queues only Builder; a separate local-stub start runs the existing planner -> architect -> task-breaker -> builder-preflight chain and stops at the targeted builder live-mutation approval. Reviewer and QA remain blocked, and no source mutation, provider-backed WorkOrder dispatch, commit, push, or release occurs.
- Needed Before: Builder live mutation, Reviewer/QA WorkOrder execution, parallel/dynamic/autonomous/retry scheduling, provider-backed WorkOrder execution, memory/checkpoint expansion, runtime profile/source mutation, approval bypass, runtime-agent commit/push/release, or external connectors require later complete fielded decisions.

### DEC-045
- Status: `Accepted`
- Decision: Adopt a **harness-first** posture for capability expansion: new capabilities should attach via harnesses (MCP servers, skills, local CLI wrappers) rather than expanding the core runtime, and they must remain optional and local-first.
- Why: The repo already treats policy and execution boundaries as inspectable files. Harnesses let us add capability without widening v1 scope, changing provider strategy, or diluting approval/review gates.
- Impact: `src/execution/*` stays minimal; harnesses are documented in repo files, invoked explicitly, and remain `local-stub`-compatible. Multi-provider-first, messenger-first, or team-first harness posture remains out of scope.

## Rejected

### DEC-010
- Status: `Rejected`
- Decision: Do not make pixel-office gameplay or company-management simulation the primary product surface.
- Why: The product should feel like a company operating system, not a management game or decorative office toy.
- Impact: Budgets, payroll, workforce simulation, org-chart management, or room metaphors that displace goal input, execution gates, or advanced-ops authority remain rejected. Company/ERP shell framing is allowed when it stays inside the accepted `DEC-042`, `DEC-044`, and `DEC-045` boundary.

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
