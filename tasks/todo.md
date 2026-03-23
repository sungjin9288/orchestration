# todo

## milestone-m4-live-freeze

### current live baseline [accepted]
- [x] shipped default stays `local-stub`, and downstream delivery stance stays `local-demo-only`
- [x] explicit live opt-in uses canonical `openai-responses` project config with non-secret metadata only
- [x] the current live execution boundary is frozen at `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`
- [x] `builder-live-mutation` stays anchored to the latest approved preflight pair and persists atomic `change-summary / patch / diff` bundles only
- [x] `reviewer` stays anchored to the latest successful builder live-mutation bundle only and keeps `commit-package -> local commit -> release-package -> close-out` as explicit downstream local follow-up
- [x] `milestone-m4-live-freeze` does not add capability or change runtime, execution, or UI semantics

### regression / verification [required freeze gate]
- [ ] unchanged required local baseline from `milestone-m3-freeze` remains green
- [ ] `node scripts/smoke-dev-loop-m2.mjs`
- [ ] `node scripts/smoke-runtime-slice-05.mjs`
- [ ] `node scripts/smoke-runtime-slice-06.mjs`
- [ ] `node scripts/smoke-execution-slice-05.mjs`
- [ ] `node scripts/smoke-execution-slice-06.mjs`
- [ ] `node scripts/smoke-execution-slice-07.mjs`
- [ ] `node scripts/smoke-execution-slice-08.mjs`
- [ ] `node scripts/smoke-execution-slice-09.mjs`
- [ ] `node scripts/smoke-execution-slice-10.mjs`
- [ ] `node scripts/smoke-execution-slice-11.mjs`
- [ ] `node scripts/smoke-ui-slice-11.mjs`
- [ ] `node scripts/smoke-ui-slice-12.mjs`
- [ ] `node scripts/smoke-worktree-slice-03.mjs`
- [x] required live-provider synthetic baseline remains green
- [x] `node scripts/smoke-provider-slice-04.mjs`
- [x] `node scripts/smoke-provider-slice-05.mjs`
- [x] `node scripts/smoke-provider-slice-06.mjs`
- [x] `node scripts/smoke-provider-slice-07.mjs`
- [x] `node scripts/smoke-qa-slice-04.mjs`
- [x] `node scripts/smoke-qa-slice-05.mjs`
- [x] `node scripts/smoke-qa-slice-06.mjs`
- [x] `node scripts/smoke-qa-slice-07.mjs`

### optional real-live verification [non-blocking]
- [x] optional real-live verification is fully separate from the required freeze gate
- [x] missing `OPENAI_API_KEY` or `OPENAI_RESPONSES_MODEL` records `skipped` and does not fail `milestone-m4-live-freeze`
- [ ] `node scripts/smoke-provider-live-slice-02.mjs`
- [ ] `node scripts/smoke-provider-live-slice-03.mjs`
- [ ] `node scripts/smoke-provider-live-slice-05.mjs`
- [ ] `node scripts/smoke-provider-live-slice-06.mjs`
- [ ] `node scripts/smoke-provider-live-slice-07.mjs`
- [ ] `node scripts/smoke-qa-live-slice-04.mjs`
- [ ] `node scripts/smoke-qa-live-slice-05.mjs`
- [ ] `node scripts/smoke-qa-live-slice-06.mjs`
- [ ] `node scripts/smoke-qa-live-slice-07.mjs`

### source-of-truth docs/tasks [accepted]
- [x] `docs/00_master-brief.md`, `docs/03_architecture-roadmap-v1.md`, `packs/development/pack.md`, and `tasks/todo.md` describe the current implemented planner-through-reviewer live boundary without widening scope
- [x] optional real-live verification is described as non-blocking and separate from required synthetic gates
- [x] `docs/01_decision-log.md` remains unchanged in this freeze

### post-freeze backlog ordering [accepted]
- [x] `strategy-m5-01` is limited to docs-only backlog ordering; no new capability or runtime/execution/UI semantics change is introduced
- [x] priority 1 is fixed to optional real-live verification and stays non-blocking instead of becoming a required freeze gate
- [x] priority 2 remains artifact redaction policy
- [x] priority 3 remains commit/release future scope
- [x] priority 4 remains second provider adapter
- [x] `docs/01_decision-log.md` remains untouched in this slice

### remaining [OPEN]
- [ ] decide whether to keep `milestone-m3-freeze` as pure archive provenance or trim it in a later docs-only cleanup
- [ ] decide whether `node scripts/smoke-qa-slice-01.mjs` should be promoted from optional browser coverage to a required regression gate
- [ ] decide whether task-breaker optional real-live coverage needs a standalone provider entrypoint beyond the existing `smoke-qa-live-slice-04.mjs` path
- [ ] run and record optional real-live verification for the current planner-through-reviewer boundary without promoting it into the required freeze gate
- [ ] define artifact redaction policy after optional real-live verification, without widening into implementation
- [ ] define future `commit-package -> local commit -> release-package -> close-out` scope after artifact redaction policy, without widening current live semantics
- [ ] evaluate whether any second provider adapter is needed only after the three items above
- [ ] clean non-SSoT reference docs that can drift from the repo contracts

## milestone-m3-freeze [archive]

Historical freeze baseline retained for provenance. Current source-of-truth freeze entry is `milestone-m4-live-freeze`.

### freeze baseline [accepted]
- [x] current v1 baseline is frozen as `local-first / single-user-first / ops-first`, `development` pack only, and `local-demo-only` by default
- [x] docs/tasks language matches the implemented lifecycle, gate model, artifact taxonomy, linked worktree boundary, and close-out path
- [x] remaining v1 open items are separated into explicit `vNext` backlog entries only
- [x] `milestone-m3-freeze` does not add new capability or change runtime, execution, or UI semantics

### regression / verification [required freeze gate]
- [x] `node scripts/smoke-dev-loop-m2.mjs`
- [x] `node scripts/smoke-runtime-slice-05.mjs`
- [x] `node scripts/smoke-runtime-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-05.mjs`
- [x] `node scripts/smoke-execution-slice-06.mjs`
- [x] `node scripts/smoke-execution-slice-07.mjs`
- [x] `node scripts/smoke-execution-slice-08.mjs`
- [x] `node scripts/smoke-execution-slice-09.mjs`
- [x] `node scripts/smoke-execution-slice-10.mjs`
- [x] `node scripts/smoke-execution-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-11.mjs`
- [x] `node scripts/smoke-ui-slice-12.mjs`
- [x] `node scripts/smoke-worktree-slice-03.mjs`

### regression / verification [extended browser]
- [ ] `node scripts/smoke-qa-slice-01.mjs`
- [ ] `node scripts/smoke-qa-slice-02.mjs`
- [x] `node scripts/smoke-qa-slice-04.mjs`
- [x] `node scripts/smoke-qa-slice-06.mjs`

### clean worktree / reproducibility
- [x] no unintended worktree drift was introduced by the required freeze regression run; only intended freeze files remain modified
- [x] canonical regression entrypoints stay direct `node scripts/*.mjs`; no root package runner is required for the frozen baseline
- [x] required smoke fixtures keep runtime roots isolated under `var/` and use temp git repos for reproducible local execution

### vNext backlog
#### candidate A [next]
- [x] define the `DEC-016` live-provider opt-in boundary without changing the default `local-demo-only` baseline
- [x] keep the shipped default on `local-stub` and treat any live provider as explicit operator opt-in
- [x] clarify the adapter contract, secrets handling, health checks, and failure modes before any live-provider implementation starts
- [x] record the first concrete live provider as `OpenAI Responses API` in a new decision instead of extending `DEC-029`
- [x] fix the first live scope to `planner` only while keeping explicit opt-in, fail-closed behavior, and no fallback
- [x] lock the first live adapter strategy to canonical id `openai-responses`, with `live-provider` allowed only as a temporary compatibility alias
- [x] lock planner live output to Responses Structured Outputs via `text.format.type=json_schema`, with schema fields `artifactMarkdown` and `normalizedResult`
- [x] lock `outputText` extraction to top-level `response.output_text` first, then safe aggregated `output` content without fixed-index access
- [x] keep the concrete live model operator-pinned in project config instead of adding a repo default
- [x] implement opt-in provider selection/config plumbing behind the accepted boundary without changing current v1 semantics
- [x] add synthetic smoke coverage for config missing, readiness failure, fail-closed behavior, malformed adapter responses, and no-secret-leak guarantees
- [x] define `strategy-slice-03` as the architect-only live opt-in boundary while keeping the implemented planner live path unchanged
- [x] lock architect live input anchor to the latest plan bundle plus the fixed source-of-truth and architect code-context allowlists
- [x] lock architect live structured output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered markdown
- [x] lock architect live defaults to `task-breaker | human gate`, blocking decision-on-valid-blocked only, and fail-closed on invalid output or readiness failure
- [x] keep builder/reviewer live expansion and release/close-out semantics out of scope for this slice
- [x] update provider and release wording only if future implementation requires new operator-visible copy
- [x] implement architect live adapter, role-specific readiness, and architect-specific smoke coverage in a later slice
- [x] define `strategy-slice-04` as the task-breaker-only next live boundary while keeping the implemented planner plus architect live path unchanged
- [x] lock task-breaker input anchor to `planArtifactId / planRunId + architectureArtifactId / architectureRunId` and require latest architecture provenance to match the current latest plan before live execution
- [x] lock task-breaker live output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered canonical breakdown markdown
- [x] lock task-breaker live defaults to `builder | human gate` only, with builder allowed only on `needsDecision=false`, `blockers=[]`, and non-empty ordered sub-tasks
- [x] lock task-breaker blocked output to `needsDecision=true`, non-empty blockers, and exactly one blocking decision item (`kind=decision`, `sourceType=decision`, `blocksTask=true`)
- [x] keep the current breakdown UI/parser contract unchanged and keep builder/reviewer live expansion out of scope for this slice
- [x] implement task-breaker live adapter, provenance-chain enforcement, and task-breaker-specific readiness in `provider-slice-04`
- [x] add synthetic task-breaker live smoke coverage for happy-path, human-gate, provenance-mismatch, fail-closed, and no-secret-leak cases
- [x] add optional real live task-breaker smoke coverage behind explicit `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL`
- [x] add task-breaker live browser/API QA coverage without widening current UI semantics
- [x] define `strategy-slice-05` as the builder-preflight-only next live boundary while keeping the implemented planner plus architect plus task-breaker live path unchanged
- [x] lock builder-preflight live input anchor to `planArtifactId / planRunId + architectureArtifactId / architectureRunId + breakdownArtifactId / breakdownRunId`, require the current architecture and breakdown provenance chain to match the current latest plan, and keep code context inside the approved architecture boundary
- [x] lock builder-preflight live structured output to schema-backed `anchor`, `artifact`, and `normalizedResult` data with adapter-rendered canonical preflight markdown that preserves the current shell parser contract
- [x] lock builder-preflight clean handoff to `request-builder-live-mutation-approval` only, with `architect | task-breaker | human gate` as the only escalation paths and builder-live-mutation plus reviewer live still blocked
- [x] lock builder-preflight config/readiness/failure defaults to explicit live opt-in, coarse project readiness, fail-closed no-fallback behavior, and no-secret-leak guarantees
- [x] keep builder live mutation / reviewer live expansion and release/close-out semantics out of scope for this slice
- [x] implement builder-preflight live adapter, upstream provenance enforcement, and builder-preflight-specific readiness in `provider-slice-05`
- [x] add synthetic builder-preflight live smoke coverage for happy-path, escalation-path, provenance-mismatch, fail-closed, and no-secret-leak cases
- [x] add builder-preflight live browser/API QA coverage without widening current UI semantics
- [x] define `strategy-slice-06` as the builder-live-mutation-only next live boundary while keeping the implemented planner plus architect plus task-breaker plus builder-preflight live path unchanged
- [x] lock builder-live-mutation input anchor to `projectId / taskId + planArtifactId / planRunId + architectureArtifactId / architectureRunId + breakdownArtifactId / breakdownRunId + preflightArtifactId / preflightRunId + approvalId + approvalTargetArtifactId / approvalTargetRunId + sourceOfTruthPaths + architectureAllowlistPaths + targetFileAllowlistPaths + codeContextPaths + targetFileBaselineDigests`
- [x] lock `approvalTarget*` to exact-match `preflight*`, lock `codeContextPaths` to the target-file allowlist set, and keep target files existing-file-only in this slice
- [x] lock builder-live-mutation allowlist/exact-match rules to repo-relative unique non-empty file-update paths inside the target-file allowlist, with actual changed files required to exact-match the validated file-update set
- [x] lock builder-live-mutation `nextStage` to `reviewer | architect | human gate` only, with reviewer valid only on `needsDecision=false`, `blockers=[]`, and `fileUpdates.length>=1`, and human gate valid only on `needsDecision=true`, `blockers.length>=1`, and exactly one blocking decision item
- [x] lock `change-summary / patch / diff` to one mutation bundle with partial persistence forbidden, repo restore + artifact non-creation + approval non-consumption on validation failure
- [x] keep reviewer live expansion out of scope, and document reviewer blocked/degraded in a live-mode project as an explicit operator step instead of a silent fallback
- [x] keep provider secret/auth/raw payload/env value non-leak in scope for this slice while leaving repo-content redaction policy out of scope
- [x] implement builder-live-mutation live adapter, anchor enforcement, atomic mutation-bundle persistence, and approval-consumption rules in `provider-slice-06`
- [x] add synthetic builder-live-mutation live smoke coverage for happy-path, approval-consumption, allowlist-mismatch, exact-match-failure, fail-closed, and no-secret-leak cases
- [x] add builder-live-mutation live browser/API QA coverage without widening reviewer live semantics
- [x] define `strategy-slice-07` as the reviewer-only next live boundary while keeping the current implemented live path unchanged until later `provider-slice-06` and `provider-slice-07`
- [x] lock reviewer live input to the latest builder live-mutation bundle only, with matched upstream provenance, builder logs, exact changed-file context, and no recombining latest artifacts by type
- [x] lock reviewer live structured output to schema-backed `anchor / artifact / normalizedResult` data with canonical `Review Verdict / Evidence Reviewed / Findings / Contract Compliance / Verification Evidence / Accepted Risks / Next Action / Follow-Up Gate` headings and raw `fail` preserved
- [x] lock reviewer live follow-up to `builder | architect | human gate` only, keep pass-side follow-up explicit instead of auto-starting `commit-package`, and allow at most one blocking `sourceType=review` decision item only when the review explicitly needs it
- [x] keep reviewer live fail-closed, no-fallback, no-approval-creation, and no-secret-leak guarantees in scope without widening commit-package, local commit, release-package, or close-out semantics
- [x] implement reviewer live adapter, builder-bundle anchor enforcement, and terminal review artifact persistence in `provider-slice-07`
- [x] add synthetic reviewer live smoke coverage for pass, fail, changes-requested, architecture-drift, human-gate, fail-closed, and no-secret-leak cases
- [x] add reviewer live browser/API QA coverage without widening commit-package, local commit, release-package, or close-out semantics

#### candidate B [later]
- [ ] define retention-consumer capability against the normalized Tier A/B/C artifact rules
- [ ] apply delete/archive/GC policy without weakening provenance-critical artifact protection
- [ ] keep Tier A protected while preserving explicit, inspectable retention behavior for Tier B and Tier C

#### optional verification / housekeeping
- [x] optional real live planner plus architect smoke entrypoints are available behind explicit `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL`
- [ ] `node scripts/smoke-qa-live-slice-04.mjs`
- [ ] `node scripts/smoke-qa-live-slice-05.mjs`
- [ ] `node scripts/smoke-qa-live-slice-06.mjs`
- [ ] `node scripts/smoke-qa-live-slice-07.mjs`
- [ ] decide whether to promote `node scripts/smoke-qa-slice-01.mjs` from optional coverage to a required regression gate
- [ ] clean non-SSoT reference docs that can drift from the repo contracts

## milestone-m2-consolidation

### current core loop [accepted]
- [x] `project_path` gate is enforced before task execution and task creation in the shell
- [x] first-run bootstrap is the `Taskboard` project registry and later project selection reuses the same shell path
- [x] `planner -> architect -> task-breaker -> builder preflight` stores logs and artifacts through the coordinator
- [x] builder live mutation requires a targeted approval for the latest preflight and saves `change-summary`, `patch`, and `diff`
- [x] reviewer is anchored to the latest builder live-mutation bundle and records a terminal review artifact
- [x] `commit-package` and limited local git commit are wired behind explicit human approval
- [x] `release-package` is anchored to the latest successful local commit bundle and only prepares a local/demo-only release artifact plus `human/release` approval
- [x] latest approved `release-package` bundle now drives explicit `close-out` artifact capture and `Review -> Done` transition without push, publish, or external release
- [x] dedicated linked worktree guarding is narrow and only applies to `release-package` and `close-out`
- [x] `Taskboard / Logs / Artifacts / Decision Inbox` operate as the primary ops shell surfaces
- [x] `Task Detail / Artifacts` can prepare a `release-package`, show structured release provenance and guard reasons, and preselect the matching `human/release` inbox item without forcing a surface change
- [x] stale smoke expectations and live-mutation fixture assumptions were consolidated around the current guard and preflight contract
- [x] a real-path end-to-end development loop smoke now covers planner through local commit on a clean temp repo
- [x] provider stance keeps `local-stub` as the shipped default while planner plus architect `openai-responses` live opt-in remains explicit and fail-closed
- [x] accepted / rejected / [OPEN] docs are reconciled to the implemented bootstrap, worktree, build, review, commit, release-package, close-out, and artifact-policy baseline

### next phase entry conditions
- [x] real-path smoke coverage is green for planner through local commit, including the end-to-end dev loop smoke
- [x] red or stale smoke debt is either fixed or replaced with current coverage
- [x] `accepted / rejected / [OPEN]` docs match the implemented core loop and remaining release gate

### remaining [OPEN]
- [x] remaining release or human-gate scope is explicitly approved instead of implied

### completed slices [archive]
- [x] strategy-slice-02
- [x] provider-slice-02
- [x] strategy-slice-03
- [x] full-docs-reconcile-01
- [x] docs-patch-06
- [x] runtime-slice-01
- [x] runtime-slice-02
- [x] runtime-slice-03
- [x] runtime-slice-04
- [x] runtime-slice-05
- [x] authoring-slice-01
- [x] ui-slice-01
- [x] execution-slice-01
- [x] execution-slice-02
- [x] execution-slice-03
- [x] execution-slice-04
- [x] execution-slice-05
- [x] execution-slice-06
- [x] execution-slice-07
- [x] execution-slice-08
- [x] execution-slice-09
- [x] execution-slice-10
- [x] execution-slice-11
- [x] ui-slice-02
- [x] ui-slice-03
- [x] ui-slice-04
- [x] ui-slice-05
- [x] ui-slice-06
- [x] ui-slice-07
- [x] ui-slice-08
- [x] ui-slice-09
- [x] ui-slice-10
- [x] ui-slice-11
- [x] ui-slice-12
- [x] worktree-slice-01
- [x] worktree-slice-02
- [x] worktree-slice-03
- [x] qa-slice-01
- [x] provider-slice-01

### deferred / rejected
- [ ] provider adapter
- [ ] report/content packs
- [ ] office/radar view
