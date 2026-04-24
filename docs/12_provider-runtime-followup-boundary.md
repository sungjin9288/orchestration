# Provider Runtime Follow-Up Boundary

## Purpose
이 문서는 `company-shell freeze bundle` 이후 worktree에 남아 있는 provider/runtime dirty 범위를 별도 follow-up bundle로 분리하기 위한 source-of-truth다.

목표는 단순하다.

- `company-shell` PR 범위를 다시 넓히지 않는다.
- 남아 있는 provider/runtime 변경을 하나의 후속 bundle로 정확히 정의한다.
- 다음 stage/commit candidate가 `retry policy + provider smoke + runtime companion docs` 만 다루도록 경계를 고정한다.

## Why This Bundle Exists
- `codex/company-shell-design-reset-20260408-main` 과 draft PR `#59` 는 grouped workspace 기반 `company-shell freeze bundle` 만 다룬다.
- 현재 dirty worktree에는 별도 의도를 가진 provider/runtime follow-up 이 남아 있다.
- 이 bundle은 display-layer polish가 아니라 `OpenAI Responses retry/backoff extraction`, `builder preflight code-context update`, `provider QA/smoke sync`, 그리고 그에 맞는 companion docs 정리를 대상으로 한다.

## Exact File Inventory For This Follow-Up

### Include
- companion docs
  - `docs/00_master-brief.md`
  - `docs/01_decision-log.md`
  - `docs/03_architecture-roadmap-v1.md`
  - `docs/06_ai-orchestration-pivot.md`
- runtime / provider implementation
  - `src/execution/execution-coordinator.js`
  - `src/execution/providers/openai-responses-adapter.js`
  - `src/execution/providers/openai-responses-retry-policy.js`
- provider QA / smoke
  - `scripts/qa-slice-05-runner.mjs`
  - `scripts/smoke-provider-live-slice-05.mjs`
  - `scripts/smoke-provider-slice-05.mjs`
  - `scripts/smoke-provider-slice-06.mjs`
  - `scripts/smoke-provider-slice-07.mjs`
  - `scripts/smoke-provider-slice-08.mjs`
  - `scripts/smoke-provider-slice-13.mjs`
  - `scripts/smoke-provider-slice-14.mjs`

### Keep Separate From This Follow-Up
- local instruction drift
  - `AGENTS.md`
- leftover UI smoke carryover
  - `scripts/smoke-ui-slice-10.mjs`
  - `scripts/smoke-ui-slice-12.mjs`
  - `scripts/smoke-ui-slice-14.mjs`
  - `scripts/smoke-ui-slice-15.mjs`
  - `scripts/smoke-ui-slice-37.mjs`
- already-published company-shell bundle
  - PR `#59`
  - `docs/10_company-shell-design-reset.md`
  - `docs/11_orchestration-ui-research.md`
  - `ui/index.html`
  - `ui/app.js`
  - `ui/styles.css`

## Runtime Intent Of This Bundle

### 1. Retry Policy Extraction
- `openai-responses-adapter` 안에 있던 timeout / retry / header backoff logic을 `openai-responses-retry-policy.js` 로 분리한다.
- 목적은 adapter body를 줄이고, retry rules를 isolated unit으로 smoke 가능하게 만드는 것이다.

### 2. Builder Preflight Context Sync
- `execution-coordinator.js`, `qa-slice-05-runner.mjs`, `smoke-provider-slice-{05,06,07,08}.mjs`, `smoke-provider-live-slice-05.mjs` 는 새 retry-policy file을 builder preflight code-context allowlist에 포함한다.
- 목적은 architect/builder/provider smoke가 새 module split 이후에도 같은 evidence set을 읽게 만드는 것이다.

### 3. Provider Smoke Coverage
- `scripts/smoke-provider-slice-13.mjs` 는 retry-policy helper boundary를 직접 검증한다.
- provider synthetic/live smoke는 새 module split 이후에도 `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer` 경로를 현재 baseline으로 유지해야 한다.

### 4. Companion Docs
- `docs/00`, `docs/01`, `docs/03`, `docs/06` 변경은 company-shell PR에 싣지 않고, 이 follow-up bundle에서 같이 정리한다.
- 이유는 이 문서들이 `claw-empire` 와 `OpenHarness` reference position, company-shell pivot wording, 그리고 future harness direction을 함께 건드리기 때문이다.

## Staging Rule For This Bundle
- stage exact files from the inventory above only
- do not use repo-wide staging like `git add .`
- do not stage `AGENTS.md` or leftover `smoke-ui-slice-*` carryover just because they are dirty in the same worktree
- do not reopen PR `#59`; this bundle must land as a separate branch/commit/PR

## Freeze Gate For This Bundle
- `node --check src/execution/execution-coordinator.js`
- `node --check src/execution/providers/openai-responses-adapter.js`
- `node --check src/execution/providers/openai-responses-retry-policy.js`
- `node --check scripts/smoke-provider-slice-13.mjs`
- `node scripts/smoke-provider-slice-07.mjs`
- `node scripts/smoke-provider-slice-13.mjs`
- `node scripts/smoke-ui-slice-63.mjs`
- optional stronger gate when local browser/runtime env is available:
  - `node scripts/qa-slice-05-runner.mjs`

## Current Verification Note
- `node scripts/smoke-provider-slice-13.mjs` currently passes and confirms the extracted retry-policy helper boundary.
- `node scripts/smoke-provider-slice-07.mjs` now passes again after the terminal `429` failure cases in provider smoke were made retry-aware.
- current follow-up red item is no longer the boundary doc gate itself; the next implementation step can move from boundary definition to actual stage-candidate prep for the runtime/provider bundle.

## Done Definition
- provider/runtime follow-up exact inventory is documented
- excluded dirty files are named explicitly
- retry-policy split and provider smoke boundary can be verified without referring back to PR `#59`
- the next stage/commit candidate can be prepared without widening the company-shell freeze bundle
