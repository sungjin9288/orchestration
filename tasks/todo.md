# todo

## milestone-m3-freeze

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

### clean worktree / reproducibility
- [x] no unintended worktree drift was introduced by the required freeze regression run; only intended freeze files remain modified
- [x] canonical regression entrypoints stay direct `node scripts/*.mjs`; no root package runner is required for the frozen baseline
- [x] required smoke fixtures keep runtime roots isolated under `var/` and use temp git repos for reproducible local execution

### vNext backlog
#### candidate A [next]
- [x] define the `DEC-016` live-provider opt-in boundary without changing the default `local-demo-only` baseline
- [x] keep the shipped default on `local-stub` and treat any live provider as explicit operator opt-in
- [x] clarify the adapter contract, secrets handling, health checks, and failure modes before any live-provider implementation starts
- [x] implement opt-in provider selection/config plumbing behind the accepted boundary without changing current v1 semantics
- [x] add synthetic smoke coverage for config missing, readiness failure, fail-closed behavior, malformed adapter responses, and no-secret-leak guarantees
- [ ] update provider and release wording only if future implementation requires new operator-visible copy

#### candidate B [later]
- [ ] define retention-consumer capability against the normalized Tier A/B/C artifact rules
- [ ] apply delete/archive/GC policy without weakening provenance-critical artifact protection
- [ ] keep Tier A protected while preserving explicit, inspectable retention behavior for Tier B and Tier C

#### optional verification / housekeeping
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
- [x] provider stance is locked to `local-demo-only` via `local-stub`, while any live provider remains future opt-in
- [x] accepted / rejected / [OPEN] docs are reconciled to the implemented bootstrap, worktree, build, review, commit, release-package, close-out, and artifact-policy baseline

### next phase entry conditions
- [x] real-path smoke coverage is green for planner through local commit, including the end-to-end dev loop smoke
- [x] red or stale smoke debt is either fixed or replaced with current coverage
- [x] `accepted / rejected / [OPEN]` docs match the implemented core loop and remaining release gate

### remaining [OPEN]
- [x] remaining release or human-gate scope is explicitly approved instead of implied

### completed slices [archive]
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
