# Execution Spec: ops-verification-m5-02 Stale vs Real-Fail Separation

## Purpose
This document defines the immediate execution spec for the next operational follow-up after the M4 live baseline freeze.

The goal is not to add a new capability. The goal is to classify optional real-live verification results against current `main` truth without widening runtime, execution, provider, or UI semantics.

This spec is implementation-oriented, but it is still bounded by the frozen baseline and the existing repo contracts.

## Current Truth At Spec Start
Use current `main` as the only implementation truth.

At spec start, the following repo truths already hold:

- `tasks/todo.md` records `ops-verification-m5-02` results as a non-blocking ledger
- `scripts/smoke-provider-live-slice-03.mjs`, `05`, and `06` already expect reviewer/downstream readiness to be `ready` and `allowed=true`
- `scripts/smoke-provider-live-slice-07.mjs` already includes stage timing diagnostics and must keep its semantic expectation intact
- `scripts/qa-slice-06-runner.mjs` and `scripts/qa-slice-07-runner.mjs` already collect `stageTimings`, expose `timeoutBudgetMs`, and append `[stage=...][durationMs=...][stageTimings=...]` to failure messages

Implication:

- the first implementation step is not “blindly patch stale files”
- the first implementation step is “inspect current file truth, rerun where env is available, and update the ledger or diagnostics only if the current repo truth still requires it”

## Goal
Classify optional real-live verification evidence into stable failure classes using current repo truth.

Required outcome:

- stale expectation is separated from actual semantic failure
- timeout or 429 style live failure is separated from stale smoke debt
- env-missing skip remains a distinct non-failure classification
- `tasks/todo.md` remains the operational ledger for recorded outcomes

## Failure Classes
Use the following classes exactly:

- `stale_expectation`
- `semantic_fail`
- `timeout_or_429`
- `skipped_missing_env`

Definitions:

- `stale_expectation`: runtime/coordinator truth is correct, but the smoke expectation or stale wording was behind the frozen baseline
- `semantic_fail`: the current smoke still fails against current truth for a real contract or flow reason; do not widen expectations to hide it
- `timeout_or_429`: the failure is operational or provider-latency related and should be preserved with timing and stage evidence
- `skipped_missing_env`: optional real-live entrypoint exited early because `OPENAI_API_KEY` or `OPENAI_RESPONSES_MODEL` was missing

## Source Of Truth
Always classify results using the following sources in priority order:

1. current runtime/coordinator readiness and contracts
2. actual smoke output
3. recorded artifact/run evidence
4. `tasks/todo.md` ledger history

Do not treat:

- stale docs language
- past branch state
- UI wording alone

as sufficient evidence to redefine failure class.

## Immediate Scope
### In Scope
- rerun or re-read optional real-live smoke results on current `main`
- update stale smoke expectation only if the current file still disagrees with current truth
- keep semantic-fail evidence intact
- strengthen timeout evidence only through diagnostics fields that preserve current semantics
- update `tasks/todo.md` ledger entries or follow-up items to reflect the new classification cleanly

### Out Of Scope
- provider semantics changes
- runtime semantics changes
- execution coordinator widening
- UI semantics changes
- second provider support
- commit/release widening
- artifact redaction implementation

## Target Files
### Operational Ledger
- `tasks/todo.md`

### Stale Expectation Candidates
- `scripts/smoke-provider-live-slice-03.mjs`
- `scripts/smoke-provider-live-slice-05.mjs`
- `scripts/smoke-provider-live-slice-06.mjs`

### Timeout / Semantic Evidence Candidates
- `scripts/smoke-provider-live-slice-07.mjs`
- `scripts/qa-slice-06-runner.mjs`
- `scripts/qa-slice-07-runner.mjs`

Important rule:

- if current `main` already contains the correct readiness alignment or diagnostics, do not reopen those files unnecessarily

## Specific Expectations By Slice
### smoke-provider-live-slice-03 / 05 / 06
Expected current truth:

- reviewer readiness is `ready`
- reviewer `allowed === true`
- where applicable, downstream readiness that joined the frozen live boundary is also `ready` and `allowed === true`

Allowed change:

- expectation/assertion update only if the current file is still stale
- stale blocked/degraded wording cleanup only if it conflicts with the current frozen baseline

Not allowed:

- changing actual provider/coordinator semantics
- widening or narrowing the frozen live boundary

### smoke-provider-live-slice-07
This file keeps semantic-fail evidence.

Allowed change:

- diagnostics only
- preserve or improve failure evidence around stage name, duration, and timing history

Not allowed:

- relaxing the current semantic or flow expectation
- changing the expected `nextStage` or reviewer/builder follow-up contract to force a pass

### qa-slice-06-runner / qa-slice-07-runner
Allowed change:

- diagnostics only, if current `main` still lacks them
- `stageTimings`
- `timeoutBudgetMs`
- failure message suffix containing `[stage=...][durationMs=...][stageTimings=...]`

Not allowed:

- changing QA semantics
- changing readiness or provider flow behavior

## Ledger Schema
Each recorded live verification entry should be reducible to this shape:

```md
- script: `node scripts/...`
  status: `pass|fail|skipped`
  model: `...`
  failureClass: `stale_expectation|semantic_fail|timeout_or_429|skipped_missing_env`
  reason: `...`
  evidence: `...`
```

Required fields:

- `script`
- `status`
- `model`
- `failureClass`
- `reason`
- `evidence`

## Failure Evidence Schema
When available, evidence should include:

- `runId`
- `artifactId`
- `runtimeRoot`
- `outputRoot`
- `stage`
- `durationMs`
- `stageTimings`
- `timeoutBudgetMs`

Not every failure needs every field. Use the smallest grounded set available from the actual run.

## Allowed Change Rules
- stale smoke fix may change expectation, inline comment, or wording only
- semantic fail slices must keep the failing contract visible
- timeout slices may add diagnostics only
- docs-only work and code work must not be mixed in one slice unless the ledger update is part of the ops result

## Execution Steps
1. Confirm current `main` truth in the relevant smoke and runner files.
2. Check whether the current file contents are already aligned.
3. If stale alignment or diagnostics are already present, do not edit the code path again.
4. Rerun optional real-live smokes only when configured env is actually present in the current shell.
5. Reclassify outcomes in the ledger using the failure classes above.
6. Preserve semantic-fail evidence and timeout evidence without widening expectations.

## Acceptance Criteria
- stale smoke expectation matches current runtime/coordinator truth
- semantic fail evidence remains visible instead of being normalized away
- timeout diagnostics are available at stage level when the relevant file currently owns that evidence path
- optional real-live verification remains non-blocking
- required freeze gate semantics remain unchanged

## Verification
Use the smallest relevant verification set for the actual touched files:

- `node --check` on every changed script or runner
- relevant synthetic smoke for touched smoke/QA paths
- configured-env optional live reruns only when env is visible to the current shell
- `git diff --check`
- `git status --short`

## Defaults And Assumptions
- current authoritative branch is `main`
- current repo truth outranks historical branch context
- `tasks/todo.md` remains the operational ledger
- if a stale-alignment or diagnostics patch is already present on `main`, the immediate next action is rerun plus reclassification, not duplicate editing
