# Orchestration Codex Handoff Master Brief

## Purpose
This document is a repo-aligned handoff brief for Codex executors working in this repository.

It is a derivative briefing document, not a replacement source of truth. Repo policy and product contracts remain anchored in:

- `AGENTS.md`
- `docs/00_master-brief.md`
- `docs/01_decision-log.md`
- `docs/02_ia-v1.md`
- `docs/03_architecture-roadmap-v1.md`
- `packs/development/pack.md`
- `tasks/todo.md`
- `tasks/lessons.md`

Use this brief to understand what Orchestration is, what is already frozen, what must not change, and what the next implementation priority is.

## One-Line Product Definition
Orchestration is a local-first, single-user-first, ops-first development control plane that lets one operator run and govern bounded AI-assisted development flows with explicit provenance, review, approval, and local follow-up.

## What We Are Building
Orchestration is not a chat-first coding toy and not a generalized office workflow product.

The system exists so an operator can:

- register a local project
- create and track tasks
- run `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer`
- inspect logs, artifacts, review evidence, approvals, and decisions
- continue through `commit-package -> local commit -> release-package -> close-out` as explicit local follow-up

The product priority is not spectacle. The priority is inspectable execution, bounded authority, and operational control over local development work.

## Why This Exists
Typical AI coding tools often blur or hide the exact authority chain behind outputs:

- the input bundle is unclear
- the approval boundary is unclear
- the repo state and git guards are easy to bypass
- the UI implies readiness or semantics that the runtime did not actually prove
- artifacts, runs, decisions, and approvals drift apart

Orchestration exists to invert that posture:

- every stage is explicit
- every meaningful output has provenance
- approval creation and approval consumption are distinct
- local repo state remains authoritative
- UI stays thin and reads runtime/coordinator truth instead of inventing its own

## Operating Principles
- `local-first`: the operator's local repo and local runtime are the primary execution truth
- `single-user-first`: the first user is one operator controlling their own development loop
- `ops-first`: readiness, blockers, approvals, logs, and artifacts matter more than decorative UX
- `fail-closed`: missing evidence, malformed output, readiness failure, or scope ambiguity must stop execution instead of silently falling back
- `runtime/coordinator truth first`: readiness, flags, and allowed next steps come from runtime/coordinator summaries, not UI inference
- `repo-defined policy`: repo files define contracts; runtime state may persist usability context but must not overrule repo policy

## Core Terms
### Provenance
The exact chain that explains which inputs, approvals, runs, and artifacts produced a result.

Example: a `review` artifact must be anchored to one latest successful builder live-mutation bundle only.

### Freeze
An intentionally locked baseline used as the current implementation boundary.

Example: `milestone-m4-live-freeze` locks the live execution boundary at planner through reviewer.

### Bounded Convenience
A convenience affordance that does not widen authority or hide gates.

Example: a future commit-side resume helper may guide the operator from an already approved current `commit-package` to `local commit`, but it must not auto-create or auto-consume approval.

### Explicit Downstream Local Follow-Up
The part of the flow that stays outside current live provider execution and remains an explicit local step.

Current boundary: `commit-package -> local commit -> release-package -> close-out`

## Current Frozen Baseline
### Shell Surfaces
The current shell has four primary surfaces:

- `Taskboard`
- `Logs`
- `Artifacts`
- `Decision Inbox`

These surfaces are first-class ops panels, not secondary tabs under a chat shell.

### Lifecycle And Flags
The current lifecycle is fixed:

- `Inbox`
- `In Progress`
- `Review`
- `Done`

The following remain flags, not lifecycle states:

- `blocked`
- `waitingApproval`
- `waitingDecision`

### Decision And Approval Taxonomy
Top-level inbox kinds are fixed:

- `review`
- `decision`
- `approval`

`sourceType` is provenance metadata, not a second top-level taxonomy.

Important rules:

- `review-follow-up` normalizes to `kind=decision, sourceType=review`
- approval remains an explicit human gate
- `blocksTask=true` is only valid on `kind=decision`

### Artifact Baseline
The main artifact chain is:

- `plan`
- `architecture`
- `breakdown`
- `preflight`
- `change-summary`
- `patch`
- `diff`
- `review`
- `commit-package`
- `commit-result`
- `release-package`
- `close-out`

Important rules:

- raw stored artifact content plus runtime metadata remain the source of truth
- structured preview is convenience only
- `patch` and `diff` remain exact provenance evidence and are outside current redaction scope

### Provider Baseline
Current provider posture is fixed:

- shipped default: `local-stub`
- current optional live provider: `openai-responses`
- opt-in only at project level
- no silent fallback from live mode back to `local-stub`
- provider config stores non-secret metadata only

### Current Live Boundary
The current live execution boundary is:

- `planner`
- `architect`
- `task-breaker`
- `builder-preflight`
- `builder-live-mutation`
- `reviewer`

Everything after reviewer remains outside the current live provider boundary.

### Downstream Local Follow-Up
Current downstream follow-up remains explicit:

- `commit-package` is an approval-producing prepare step
- `local commit` is an approval-consuming local execution step
- `release-package` is a release-ready approval-producing prepare step
- `close-out` is an approved current release bundle consuming finalization step

Still out of scope:

- push
- merge
- publish
- external release

### QA And Smoke Baseline
Current verification posture is split:

- required synthetic baseline remains authoritative for freeze
- optional real-live verification remains separate and non-blocking

Optional real-live rules:

- env missing => `skipped`
- env present => record `pass|fail|skipped + model`
- optional live results do not widen the required freeze gate

## Current Repo-Aligned Corrections
The following are true on current `main` and should be treated as implementation truth:

- planner-through-reviewer live boundary docs lock is already present in `docs/00_master-brief.md`, `docs/03_architecture-roadmap-v1.md`, `packs/development/pack.md`, and `tasks/todo.md`
- stale-alignment plus timeout-diagnostics changes for the relevant live smoke and QA runner paths are already merged into `main`
- provider and QA synthetic live baseline are recorded as green in `tasks/todo.md`
- required local baseline is re-closed on current `main` and recorded green in `tasks/todo.md`
- optional real-live verification ledger already records `ops-verification-m5-02`
- current `main` also records operator rehearsal and stabilization-close verification for the development-pack path
- the remaining optional real-live gap is tracked as an execution-context env visibility blocker, not as a required-baseline regression

Implication:

- current `main` reaches operator-usable v1 completion for the frozen development-pack baseline
- optional real-live reruns remain non-blocking operational follow-up
- current `main` now applies the first preview-only repo-content redaction on `change-summary` structured preview while keeping the raw artifact block unchanged as the source of truth
- current `main` now implements the bounded commit-side helper as `Resume Approved Local Commit` in `Task Detail` only, with `Artifacts` and `Decision Inbox` reduced to navigation-only commit follow-up hints
- current `main` now implements the bounded release-side helper as `Resume Approved Close Out` in `Task Detail` only, with `Artifacts` and `Decision Inbox` reduced to navigation-only close-out follow-up hints

## Current Backlog Ordering
The current post-freeze ordering is locked:

1. optional real-live verification
2. artifact redaction policy
3. commit/release future scope
4. second provider adapter

Additional convenience boundaries already locked:

- commit-side convenience stays limited to `commit-package -> local commit` and only as a bounded resume helper candidate
- release-side convenience stays limited to `approved current release-package -> close-out` and remains deferred
- one-click full chain, hidden approval consumption, and auto close-out remain widening-forbidden
- the first redaction implementation defaults to `preview/export only`; raw stored artifact content remains the source of truth and no redacted derivative copy becomes canonical
- the future commit-side helper label is fixed to `Resume Approved Local Commit` in the `Task Detail` commit guard area only
- the future release-side helper label is fixed to `Resume Approved Close Out` in the `Task Detail` release/close-out guard area only
- `Artifacts` and `Decision Inbox` may offer navigation-only hints for those helpers, but remain non-executing surfaces
- `smoke-qa-slice-01` stays optional browser coverage, and task-breaker optional real-live coverage stays on the existing `smoke-qa-live-slice-04` path
- current `main` now implements both bounded helper slices: `Resume Approved Local Commit` and `Resume Approved Close Out` execute only from `Task Detail`, while `Artifacts` and `Decision Inbox` remain navigation-only companion surfaces
- second-provider work is not required for current completion and remains explicitly deferred on current `main`; revisit it only if optional real-live housekeeping or a concrete operator gap shows that the current `openai-responses` boundary is insufficient

## Absolute Guardrails
Codex executors must not break the following:

- `local-stub` as the shipped default
- `openai-responses` as the only current live provider
- reviewer as the end of the current live boundary
- explicit downstream local follow-up after reviewer
- no silent fallback
- no-secret-leak
- no hidden approval creation or approval consumption inside convenience helpers
- no provider/reviewer auto-start of downstream commit or release steps
- no linked worktree auto-create, auto-switch, or auto-assign in helper flows
- no push, merge, publish, or external release widening
- no UI-owned semantics that diverge from runtime/coordinator truth

## Working Rules For Codex Executors
- Read current docs/runtime/coordinator truth before changing smoke expectations or operator-facing wording.
- If a smoke fails, first determine whether the expectation is stale or the implementation actually regressed.
- If runtime/coordinator truth is unchanged and the smoke is stale, fix the smoke instead of relaxing truth.
- If the failure is semantic, keep the evidence visible. Do not widen expectations to make the failure disappear.
- Keep docs-only slices, implementation slices, and ops-verification slices separate.
- Avoid broad refactors. Prefer the smallest change that preserves the frozen baseline and improves evidence quality.

## Immediate Priority
The current source `main` baseline is `f87d5accc98831098d3c16e76310a1daaf060320` after Dogfood Run 075 cleanup-completed evidence was committed and pushed. Dogfood Run 076 has executed after explicit approval; linked worktree `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-073` and branch `worktree/v1-dogfood-runner-073` are retained dirty by design, while runtime evidence remains under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-073`.

Current local completion snapshot:

- `node scripts/v1-local-completion-status.mjs` reports the current local completion state, including whether any future local commit has reopened the push approval gate
- current `main` publish state is reported by `git status --short --branch`; Dogfood Run 075 cleanup-completed evidence is published, and Dogfood Run 076 retained-evidence is local until commit/push/cleanup approval
- `node scripts/verification_status.mjs` must remain green after any future evidence update
- Dogfood Run 001 through Dogfood Run 076 evidence is recorded
- Current published-head V1 kickoff proof passed at head `f87d5accc98831098d3c16e76310a1daaf060320` before Dogfood Run 076 execute
- Dogfood Run 038 retained-evidence was committed locally as `5cafefb` before destructive cleanup
- Dogfood Run 039 retained-evidence was committed locally as `e2c2ff3` before destructive cleanup
- Dogfood Run 040 retained-evidence was committed locally as `07b4a16` before destructive cleanup
- Dogfood Run 041 retained-evidence was committed locally as `e10d29e` before destructive cleanup
- Dogfood Run 042 retained-evidence was committed locally as `a05e64f` before destructive cleanup
- Dogfood Run 043 retained-evidence was committed locally as `c756c6c` before destructive cleanup
- Dogfood Run 044 retained-evidence was committed locally as `347bca0` before destructive cleanup
- Dogfood Run 045 retained-evidence was committed locally as `5633a92` before destructive cleanup
- Dogfood Run 046 retained-evidence was committed locally as `ed6752a` before destructive cleanup
- Dogfood Run 047 retained-evidence was committed locally as `2c11d66` before destructive cleanup
- Dogfood Run 048 retained-evidence was committed locally as `598bd6a` before destructive cleanup
- Dogfood Run 049 retained-evidence was committed locally as `18f7340` before destructive cleanup
- Dogfood Run 049 cleanup-completed evidence is published on current `main`
- Dogfood Run 050 executed from clean/published `main` with slug `v1-dogfood-runner-047` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 050 retained-evidence was committed locally as `dd41a03` before destructive cleanup
- Dogfood Run 050 cleanup-completed evidence is published on current `main`
- Dogfood Run 051 executed from clean/published `main` with slug `v1-dogfood-runner-048` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 051 retained-evidence was committed locally as `fb7db42` before destructive cleanup
- Dogfood Run 051 cleanup-completed evidence is published on current `main`
- Dogfood Run 052 executed from clean/published `main` with slug `v1-dogfood-runner-049` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 052 retained-evidence was committed locally as `5bcd9e7` before destructive cleanup
- Dogfood Run 052 cleanup-completed evidence is published on current `main`
- Dogfood Run 053 executed from clean/published `main` with slug `v1-dogfood-runner-050` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 053 retained-evidence was committed locally as `d2a45b0` before destructive cleanup
- Dogfood Run 053 cleanup-completed evidence is published on current `main`
- Dogfood Run 054 executed from clean/published `main` with slug `v1-dogfood-runner-051` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 054 retained-evidence was committed locally as `94fdfd7` before destructive cleanup
- Dogfood Run 054 cleanup-completed evidence is published on current `main`
- Dogfood Run 055 executed from clean/published `main` with slug `v1-dogfood-runner-052` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 055 retained-evidence was committed locally as `699e3ac` before destructive cleanup
- Dogfood Run 056 executed from clean/published `main` with slug `v1-dogfood-runner-053` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 056 retained-evidence was committed locally as `c8a7f51` before destructive cleanup
- Dogfood Run 056 cleanup-completed evidence is published on current `main`
- Dogfood Run 057 executed from clean/published `main` with slug `v1-dogfood-runner-054` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 057 retained-evidence was committed locally as `a19615f` before destructive cleanup
- Dogfood Run 057 cleanup-completed evidence is published on current `main`
- Dogfood Run 058 executed from clean/published `main` with slug `v1-dogfood-runner-055` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 002, Run 004, Run 005, Run 006, Run 007, Run 008, Run 009, Run 010, Run 011, Run 012, Run 013, Run 014, Run 015, Run 016, Run 017, Run 018, Run 019, Run 020, Run 021, Run 022, Run 023, and Run 024 retained dogfood linked worktree cleanup has completed after explicit operator approval
- Dogfood Run 024 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-021` and branch `worktree/v1-dogfood-runner-021` have been removed
- Dogfood Run 025 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-022` and branch `worktree/v1-dogfood-runner-022` have been removed after explicit cleanup approval
- Dogfood Run 026 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-023` and branch `worktree/v1-dogfood-runner-023` have been removed after explicit cleanup approval
- Dogfood Run 027 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-024` and branch `worktree/v1-dogfood-runner-024` have been removed after explicit cleanup approval
- Dogfood Run 028 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-025` and branch `worktree/v1-dogfood-runner-025` have been removed after explicit cleanup approval
- Dogfood Run 029 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-026` and branch `worktree/v1-dogfood-runner-026` have been removed after explicit cleanup approval
- Dogfood Run 030 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-027` and branch `worktree/v1-dogfood-runner-027` have been removed after explicit cleanup approval
- Dogfood Run 031 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-028` and branch `worktree/v1-dogfood-runner-028` have been removed after explicit cleanup approval
- Dogfood Run 032 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-029` and branch `worktree/v1-dogfood-runner-029` have been removed after retained-evidence commit `a0b3677` was preserved
- Dogfood Run 033 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-030` and branch `worktree/v1-dogfood-runner-030` have been removed after retained-evidence commit `bc834ff` was preserved
- Dogfood Run 034 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-031` and branch `worktree/v1-dogfood-runner-031` have been removed after retained-evidence commit `e11eaf0` was preserved
- Dogfood Run 035 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-032` and branch `worktree/v1-dogfood-runner-032` have been removed after retained-evidence commit `7459131` was preserved
- Dogfood Run 036 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-033` and branch `worktree/v1-dogfood-runner-033` have been removed after retained-evidence commit `993c992` was preserved
- Dogfood Run 037 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-034` and branch `worktree/v1-dogfood-runner-034` have been removed after retained-evidence commit `98a8122` was preserved
- Dogfood Run 038 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-035` and branch `worktree/v1-dogfood-runner-035` have been removed after retained-evidence commit `5cafefb` was preserved
- Dogfood Run 039 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-036` and branch `worktree/v1-dogfood-runner-036` have been removed after retained-evidence commit `e2c2ff3` was preserved
- Dogfood Run 040 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-037` and branch `worktree/v1-dogfood-runner-037` have been removed after retained-evidence commit `07b4a16` was preserved
- Dogfood Run 041 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-038` and branch `worktree/v1-dogfood-runner-038` have been removed after retained-evidence commit `e10d29e` was preserved
- Dogfood Run 042 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-039` and branch `worktree/v1-dogfood-runner-039` have been removed after retained-evidence commit `a05e64f` was preserved
- Dogfood Run 043 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-040` and branch `worktree/v1-dogfood-runner-040` have been removed after retained-evidence commit `c756c6c` was preserved
- Dogfood Run 044 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-041` and branch `worktree/v1-dogfood-runner-041` have been removed after retained-evidence commit `347bca0` was preserved
- Dogfood Run 045 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-042` and branch `worktree/v1-dogfood-runner-042` have been removed after retained-evidence commit `5633a92` was preserved
- Dogfood Run 046 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-043` and branch `worktree/v1-dogfood-runner-043` have been removed after retained-evidence commit `ed6752a` was preserved
- Dogfood Run 047 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-044` and branch `worktree/v1-dogfood-runner-044` have been removed after retained-evidence commit `2c11d66` was preserved
- Dogfood Run 048 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-045` and branch `worktree/v1-dogfood-runner-045` have been removed after retained-evidence commit `598bd6a` was preserved
- Dogfood Run 049 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-046` and branch `worktree/v1-dogfood-runner-046` have been removed after retained-evidence commit `18f7340` was preserved
- Dogfood Run 050 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-047` and branch `worktree/v1-dogfood-runner-047` have been removed after retained-evidence commit `dd41a03` was preserved
- Dogfood Run 051 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-048` and branch `worktree/v1-dogfood-runner-048` have been removed after retained-evidence commit `fb7db42` was preserved
- Dogfood Run 052 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-049` and branch `worktree/v1-dogfood-runner-049` have been removed after retained-evidence commit `5bcd9e7` was preserved
- Dogfood Run 053 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-050` and branch `worktree/v1-dogfood-runner-050` have been removed after retained-evidence commit `d2a45b0` was preserved
- Dogfood Run 054 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-051` and branch `worktree/v1-dogfood-runner-051` have been removed after retained-evidence commit `94fdfd7` was preserved
- Dogfood Run 055 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-052` and branch `worktree/v1-dogfood-runner-052` have been removed after retained-evidence commit `699e3ac` was preserved
- Dogfood Run 056 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-053` and branch `worktree/v1-dogfood-runner-053` have been removed after retained-evidence commit `c8a7f51` was preserved
- Dogfood Run 057 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-054` and branch `worktree/v1-dogfood-runner-054` have been removed after retained-evidence commit `a19615f` was preserved
- Dogfood Run 058 retained-evidence was committed locally as `8c06978` before destructive cleanup
- Dogfood Run 058 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-055` and branch `worktree/v1-dogfood-runner-055` have been removed after retained-evidence commit `8c06978` was preserved
- Dogfood Run 058 cleanup-completed evidence is published on current `main`
- Dogfood Run 059 executed from clean/published `main` with slug `v1-dogfood-runner-056` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 059 retained-evidence was committed locally as `b4833d0` before destructive cleanup
- Dogfood Run 059 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-056` and branch `worktree/v1-dogfood-runner-056` have been removed after retained-evidence commit `b4833d0` was preserved
- Dogfood Run 059 cleanup-completed evidence is published on current `main`
- Dogfood Run 060 executed from clean/published `main` with slug `v1-dogfood-runner-057` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 060 retained-evidence was committed locally as `58d6fea` before destructive cleanup
- Dogfood Run 060 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-057` and branch `worktree/v1-dogfood-runner-057` have been removed after retained-evidence commit `58d6fea` was preserved
- Dogfood Run 060 cleanup-completed evidence is published on current `main`
- Dogfood Run 061 executed from clean/published `main` with slug `v1-dogfood-runner-058` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 061 retained-evidence was committed locally as `2bc905b` before destructive cleanup
- Dogfood Run 061 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-058` and branch `worktree/v1-dogfood-runner-058` have been removed after retained-evidence commit `2bc905b` was preserved
- Dogfood Run 061 cleanup-completed evidence is published on current `main`
- Dogfood Run 062 executed from clean/published `main` with slug `v1-dogfood-runner-059` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 062 retained-evidence was committed locally and published as `dd7567d` before destructive cleanup
- Dogfood Run 062 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-059` and branch `worktree/v1-dogfood-runner-059` have been removed after retained-evidence commit `dd7567d` was preserved and published
- Dogfood Run 062 cleanup-completed evidence is being recorded locally before commit/push
- Dogfood Run 063 executed from clean/published `main` with slug `v1-dogfood-runner-060` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 063 retained-evidence was committed locally and published as `3fed66c` before destructive cleanup
- Dogfood Run 063 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-060` and branch `worktree/v1-dogfood-runner-060` have been removed after retained-evidence commit `3fed66c` was preserved and published
- Dogfood Run 063 cleanup-completed evidence was committed and published as `cbf431c` before Dogfood Run 064 execute
- Dogfood Run 064 executed from clean/published `main` with slug `v1-dogfood-runner-061` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 064 retained-evidence was committed locally and published as `6d3a5e4` before destructive cleanup
- Dogfood Run 064 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-061` and branch `worktree/v1-dogfood-runner-061` have been removed after retained-evidence commit `6d3a5e4` was preserved and published
- Dogfood Run 064 cleanup-completed evidence was published on current `main` before Dogfood Run 065 execute
- Dogfood Run 065 executed from clean/published `main` with slug `v1-dogfood-runner-062` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 065 retained-evidence was committed locally and published as `5469094` before destructive cleanup
- Dogfood Run 065 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-062` and branch `worktree/v1-dogfood-runner-062` have been removed after retained-evidence commit `5469094` was preserved and published
- Dogfood Run 065 cleanup-completed evidence was published on current `main` before Dogfood Run 066 execute
- Dogfood Run 066 executed from clean/published `main` with slug `v1-dogfood-runner-063` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 066 retained-evidence was committed locally and published as `af125b6` before destructive cleanup
- Dogfood Run 066 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-063` and branch `worktree/v1-dogfood-runner-063` have been removed after retained-evidence commit `af125b6` was preserved and published
- Dogfood Run 066 cleanup-completed evidence was published on current `main` before Dogfood Run 067 execute
- Dogfood Run 067 executed from clean/published `main` with slug `v1-dogfood-runner-064` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 067 retained-evidence was committed locally as `4a0420f` before destructive cleanup
- Dogfood Run 067 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-064` and branch `worktree/v1-dogfood-runner-064` have been removed after retained-evidence commit `4a0420f` was preserved locally
- Dogfood Run 067 cleanup-completed evidence is published on current `main` before Dogfood Run 068 execute
- Dogfood Run 068 executed from clean/published `main` with slug `v1-dogfood-runner-065` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 068 retained-evidence was committed locally and published as `de30b1d` before destructive cleanup
- Dogfood Run 068 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-065` and branch `worktree/v1-dogfood-runner-065` have been removed after retained-evidence commit `de30b1d` was preserved and published
- Dogfood Run 068 cleanup-completed evidence was committed and published as `9acf515` before Dogfood Run 069 execute
- Dogfood Run 069 executed from clean/published `main` with slug `v1-dogfood-runner-066` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 069 retained-evidence was committed locally and published as `a15bd7c` before destructive cleanup
- Dogfood Run 069 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-066` and branch `worktree/v1-dogfood-runner-066` have been removed after retained-evidence commit `a15bd7c` was preserved and published
- Dogfood Run 069 cleanup-completed evidence is published on current `main` before Dogfood Run 070 execute
- Dogfood Run 070 executed from clean/published `main` with slug `v1-dogfood-runner-067` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 070 retained-evidence was committed locally and published as `e4552fc` before destructive cleanup
- Dogfood Run 070 retained dogfood linked worktree cleanup is complete
- Dogfood Run 070 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-067` and branch `worktree/v1-dogfood-runner-067` have been removed after retained-evidence commit `e4552fc` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 070 cleanup
- Dogfood Run 070 cleanup-completed evidence was committed and published as `0fe6f1d`
- Current published head `0fe6f1d` passed `node scripts/smoke-v1-user-flow-kickoff.mjs` without `V1_KICKOFF_ALLOW_DIRTY`
- Dogfood Run 071 executed from clean/published `main` with slug `v1-dogfood-runner-068` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 071 retained-evidence was committed locally and published as `5acd2ab` before destructive cleanup
- Dogfood Run 071 retained dogfood linked worktree cleanup is complete
- Dogfood Run 071 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-068` and branch `worktree/v1-dogfood-runner-068` have been removed after retained-evidence commit `5acd2ab` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 071 cleanup
- Dogfood Run 071 cleanup-completed evidence was committed and published as `0c2da90` before Dogfood Run 072 execute
- Dogfood Run 071 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-068`
- Dogfood Run 072 executed from clean/published `main` with slug `v1-dogfood-runner-069` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 072 retained-evidence was committed locally and published as `fda0af2` before destructive cleanup
- Dogfood Run 072 retained dogfood linked worktree cleanup is complete
- Dogfood Run 072 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-069` and branch `worktree/v1-dogfood-runner-069` have been removed after retained-evidence commit `fda0af2` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 072 cleanup
- Dogfood Run 072 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-069`
- Dogfood Run 072 cleanup-completed evidence was committed and published as `3d58767` before Dogfood Run 073 execute
- Dogfood Run 073 executed from clean/published `main` with slug `v1-dogfood-runner-070` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 073 retained-evidence was committed locally and published as `5b7bf54` before destructive cleanup
- Dogfood Run 073 retained dogfood linked worktree cleanup is complete
- Dogfood Run 073 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-070` and branch `worktree/v1-dogfood-runner-070` have been removed after retained-evidence commit `5b7bf54` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 073 cleanup
- Dogfood Run 073 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-070`
- Dogfood Run 073 cleanup-completed evidence was committed and published as `13d600b`
- Dogfood Run 074 executed from clean/published `main` with slug `v1-dogfood-runner-071` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 074 retained-evidence was committed locally and published as `baf749b` before destructive cleanup
- Dogfood Run 074 retained dogfood linked worktree cleanup is complete
- Dogfood Run 074 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-071` and branch `worktree/v1-dogfood-runner-071` have been removed after retained-evidence commit `baf749b` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 074 cleanup
- Dogfood Run 074 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-071`
- Dogfood Run 074 cleanup-completed evidence was committed and published as `292e9ab` before Dogfood Run 075 execute
- Dogfood Run 075 executed from clean/published `main` with slug `v1-dogfood-runner-072` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 075 retained-evidence was committed locally and published as `eaa9a28` before destructive cleanup
- Dogfood Run 075 retained dogfood linked worktree cleanup is complete
- Dogfood Run 075 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-072` and branch `worktree/v1-dogfood-runner-072` have been removed after retained-evidence commit `eaa9a28` was preserved and published
- No retained dogfood linked worktree remains after Dogfood Run 075 cleanup
- Dogfood Run 075 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-072`
- Dogfood Run 075 cleanup-completed evidence was committed and published as `f87d5ac` before Dogfood Run 076 execute
- Dogfood Run 076 executed from clean/published `main` with slug `v1-dogfood-runner-073` and stopped before commit-package, local commit, push, merge, release-package, or close-out
- Dogfood Run 076 retained-evidence is being recorded locally before commit/push/cleanup
- Dogfood Run 076 retained linked worktree path `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-073` and branch `worktree/v1-dogfood-runner-073` remain intentionally dirty by design until retained-evidence commit/publish and explicit destructive cleanup approval
- Dogfood Run 076 runtime evidence remains available under `var/runtime-v1-dogfood-runner-v1-dogfood-runner-073`

The next action is no longer an implementation backlog item by default. It is an explicit operator choice:

- inspect `node scripts/v1-kickoff-evidence-triage.mjs` before opening new implementation work
- open a new implementation slice only for a concrete regression or usability issue
- approve the local retained-evidence commit for Dogfood Run 076 after verification
- approve publishing the Run 076 retained-evidence commit to `origin/main` after it is committed locally
- approve destructive cleanup for the Dogfood Run 076 retained linked worktree and branch only after retained-evidence is preserved
- do not run another intentional `--execute --slug <slug>` dogfood run until Run 076 retained-evidence is committed/published and the cleanup decision is settled

The first v1 user-flow kickoff slice has now been verified on clean/published `main`. Before opening another implementation slice, run:

- `node scripts/v1-kickoff-status.mjs`

If that status is green, do not run another dogfood pass by default. Use the existing clean kickoff evidence to decide whether there is a concrete regression or usability issue to fix.

The runtime/browser proof command for that first slice is:

- `node scripts/smoke-v1-user-flow-kickoff.mjs`

Latest clean proof:

- recorded on `2026-05-14 14:14:16 +0900`
- head `0fe6f1d4bbca8a58a7454ed0e5966cff6d7d9e0c`
- `node scripts/smoke-v1-user-flow-kickoff.mjs` passed without `V1_KICKOFF_ALLOW_DIRTY`
- scenario covered `task-0001`, `approval-0001`, builder `run-0005`, reviewer `run-0006`, and artifacts `artifact-0005` through `artifact-0008`
- verified `Mission`, `Council`, `Execution`, `Deliverables`, `Taskboard`, `Logs`, `Artifacts`, and `Decision Inbox`

Use `node scripts/v1-kickoff-evidence-triage.mjs` when the next action is unclear. It is read-only, checks the clean proof plus retained runtime/output evidence, and should keep implementation closed unless there is a concrete regression or usability issue.

The preview-only artifact redaction policy is already implemented for `change-summary` structured preview and should not be reopened unless dogfood exposes a concrete redaction regression.

Optional real-live reruns remain non-blocking operational housekeeping when configured env is visible to the current execution context. The historical execution spec for that work remains locked in:

- `docs/05_execution-spec-ops-verification-m5-02.md`

## Final Direction
The target product is not “AI that silently finishes everything for the user.”

The target product is a bounded local orchestration system where:

- live provider execution remains explicit and inspectable
- provenance, approval, readiness, and artifact chains stay visible
- downstream local follow-up remains under operator control
- convenience helpers, if added later, do not hide gates or widen authority
- additional providers, if ever added, must fit the same bounded adapter architecture instead of redefining the product
