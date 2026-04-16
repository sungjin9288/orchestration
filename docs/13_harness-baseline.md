# Harness Baseline (2026-04)

## Purpose
Define a harness-first baseline for Orchestration 1.0 that is compatible with the existing
local-first / single-user-first / ops-first constraints. This is not a product feature expansion;
it is a development and execution posture: capabilities are added through harnesses (tools,
skills, MCP servers, and local adapters) instead of widening the core runtime surface.

## What "Harness-First" Means Here
- Capabilities are attached via harnesses (MCP servers, skills, local CLI wrappers) rather than
  embedding new logic into the core runtime.
- Harnesses remain optional and local. They must not flip the shipped default away from
  `local-stub` or `local-demo-only`.
- Harnesses must be auditable, with explicit boundaries documented in repo files.
- Harness use is gated by the same approval / review contracts already defined in the pack.

## External Reference Signals (2026-04)
These projects are signals, not direct dependencies:
- `markitdown` (Microsoft): document-to-Markdown CLI with an MCP server option and a wide
  file-type conversion surface. Useful as a local harness for artifact preprocessing and
  documentation ingestion, not as a runtime dependency.
- `hermes-agent` (NousResearch): self-improving agent with skills, memory, MCP integration,
  and multi-provider + multi-platform gateway posture. Useful for thinking about skill registry
  and memory separation, not for multi-platform bots or provider breadth in v1.
- `mempalace` (MemPalace): local-first memory store that keeps raw verbatim conversations and
  exposes an MCP tools posture. Useful as a local-only memory harness signal for future post-v1 work.
- `free-code` fork (Claude Code): CLI harness posture with multi-provider switching and looser
  guardrails as a signal. Not a v1 dependency; do not adopt its multi-provider-first posture.

## Approved Harness Applications (Now)
1. **Document-to-Markdown preprocessing** via `markitdown` CLI
   - Keep it as a local optional CLI wrapper.
   - Use it only for artifact preprocessing or documentation ingestion.
   - Do not embed it into core runtime or auto-run flows.

2. **Memory harness (future-post-v1)**
   - Treat memory as an external harness with explicit ingest/export boundaries.
   - Only local-first memory stores are acceptable.
   - No networked, account-bound, or multi-tenant memory systems in v1.

## Out Of Scope (Still)
- Any harness that implies multi-provider-first execution.
- Messenger-first bot surfaces or multi-platform chat gateways.
- Budget/HR/org-management simulators.
- Multiplayer workspace or team-first runtime semantics.
- "curl | bash" auto-installers or guardrail removal as default guidance.

## Minimal Integration Contract
Harnesses must:
- live outside the core runtime boundary (`src/execution/*` stays minimal)
- be invoked explicitly, not automatically
- leave evidence in logs or artifacts when used
- be documented in repo source-of-truth files (this doc + decision log)

## Harness Intake Checklist (Before Adoption)
- Is it local-first and optional, with no hidden background execution?
- Does it avoid multi-provider-first, messenger-first, or team-first semantics?
- Can we invoke it explicitly and capture evidence without widening runtime scope?
- Does installation avoid "curl | bash" by default, or at least document review-first flow?

## Inventory Posture
- `approved-now`: safe to use as an explicit local helper in the current repo
- `future-post-v1`: acceptable direction, but not part of the current shipped path
- `signal-only`: useful reference signal only; do not normalize into repo defaults

## Concrete Local Tooling (Now)
### `scripts/markitdown-convert.mjs`
Wrapper for optional local `markitdown` CLI usage:
- converts a document into markdown for later inspection
- refuses to run if `markitdown` is not installed
- does not change runtime behavior or UI

### `scripts/harness-status.mjs`
Local harness inventory and posture report:
- reports approved/future/signal-only posture for current external harness references
- checks whether the related local command is available in `PATH`
- makes it explicit that command availability does not imply repo adoption

### `scripts/harness-run.mjs`
Repo-native execution gate for approved harnesses:
- only allows `approved-now` harness ids to execute
- rejects `future-post-v1` and `signal-only` harnesses even if they are installed locally
- currently dispatches only to the `markitdown` wrapper
- `node scripts/harness-run.mjs list` reports the currently executable harness ids
- `node scripts/harness-run.mjs info <harness-id>` reports posture, runner, local availability, executable status, and install-review guidance for one harness
- `node scripts/harness-run.mjs doctor` reports a host-level summary of `ready / install-required / deferred / policy-blocked`
  plus an ordered `actionQueue`, top-level `nextAction`, `readyHarnessIds`, `installRequiredHarnessIds`, `deferredHarnessIds`, and `policyBlockedHarnessIds`
  plus a compact `summary` object, including `currentHostState`, `primaryHarnessId`, `primaryHarnessState`, `primaryRecommendedAction`, `primaryInstallReview`, `primaryInstallReviewRequired`, `primaryNote`, `primaryPosture`, `primaryKind`, `primaryCommand`, `primaryRunner`, `primaryExecutable`, `primaryAvailable`, `primaryReady`, `primaryActionShort`, and `primaryActionMessage`,
  so the operator or consumer can read the current host posture and its representative harness without recomputing counts, booleans, or priority from the full payload
- `actionQueue` and `nextAction` prioritize `install-required`, then `ready` approved harnesses, then `deferred`, then `policy-blocked`, so a runnable approved harness stays the primary operator surface once the current host becomes ready

#### Frozen `doctor.summary` contract for this milestone
The compact summary is frozen for the current harness-baseline milestone with these keys:
- `totalHarnesses`
- `readyHarnessCount`
- `installRequiredHarnessCount`
- `deferredHarnessCount`
- `policyBlockedHarnessCount`
- `runnableNow`
- `setupRequiredNow`
- `nextActionState`
- `currentHostState`
- `primaryHarnessId`
- `primaryHarnessState`
- `primaryRecommendedAction`
- `primaryInstallReview`
- `primaryInstallReviewRequired`
- `primaryNote`
- `primaryPosture`
- `primaryKind`
- `primaryCommand`
- `primaryRunner`
- `primaryExecutable`
- `primaryAvailable`
- `primaryReady`
- `primaryActionShort`
- `primaryActionMessage`

#### Completion boundary
- This milestone ends at the repo-native harness governance contract: `status / info / list / doctor / synthetic bundle`.
- Further `doctor.summary` field additions are not part of this milestone. Any new field requires a separate milestone or explicit consumer-driven justification.
- `consumer integration` and `host-ready install` stay as follow-up tracks and are not part of this completion batch.
- Follow-up consumers may read the frozen `doctor.summary` contract, but they must not widen or reinterpret the producer contract without an explicit new milestone.

### `scripts/harness-consumer-status.mjs`
First post-freeze repo-native consumer surface for the frozen doctor summary:
- consumes `node scripts/harness-run.mjs doctor` and reads only the frozen `summary` contract
- emits a compact `statusCard` payload for downstream operator or automation surfaces
- emits an `operatorAction` payload derived only from the frozen summary, including a repo-native run command when the representative approved harness is ready
- keeps consumer integration outside the doctor producer boundary so the frozen summary stays source-of-truth

### `scripts/harness-consumer-brief.mjs`
Shell-friendly post-freeze brief surface:
- consumes `node scripts/harness-consumer-status.mjs` instead of reopening the doctor producer
- emits a `brief` payload with one headline, one action label, one repo-native command, and one action message
- keeps the layering explicit: `doctor.summary -> consumer status -> consumer brief`

### UI snapshot bridge for harness consumers
Post-freeze UI follow-up surface:
- `scripts/serve-ui-slice-01.mjs` reads `node scripts/harness-consumer-status.mjs` and `node scripts/harness-consumer-brief.mjs` and exposes the results as `derived.harnessConsumerStatus` plus `derived.harnessConsumerBrief`
- `ui/app.js` consumes only those snapshot-derived payloads: the frozen brief drives the `Ops overview` signal strip plus read-only `하네스 실행 안내` registers inside the `Ops overview` org panel, `Execution`, `Taskboard`, `Logs`, `Artifacts`, `Deliverables`, and `Decision Inbox`, while the frozen consumer status drives one dedicated `하네스 실행 액션` shelf inside `Execution`
- keeps the layering explicit: `doctor.summary -> consumer status -> consumer brief -> snapshot derived -> ops overview signal + brief registers -> execution operator-action shelf`
- this is a UI consumer integration track, not a producer-contract change

### Shared shell action affordance
Post-freeze local-only shell action follow-up:
- `ui/app.js` shared `renderHarnessBriefRegister()` now exposes a `명령 복사` button when `brief.actionCommand` is present and an `실행 데스크 열기` button whenever the operator is not already on `Execution`
- the copied string is a repo-native command template, not an unconditional zero-arg launch command; wrappers that require runtime input keep placeholders such as `<input-file> [output-file]` in the consumer payload
- both affordances stay local-only and consumer-only: `명령 복사` uses browser clipboard when available and otherwise falls back to a refresh-status instruction line, while `실행 데스크 열기` reuses the existing `open-surface` navigation path instead of introducing a shell-launch route
- no new runtime route, no snapshot schema change, and no producer-contract widening are introduced

### Execution operator-action shelf
Post-freeze execution follow-up surface:
- `ui/app.js` `Execution` now reads `derived.harnessConsumerStatus.operatorAction` through a dedicated `renderHarnessExecutionActionShelf()` helper
- the shelf shows the representative harness, current operator-action kind, host posture, and repo-native command in the same execution viewport without reopening `doctor` or recomputing action priority from raw harness arrays
- the shelf stays consumer-only and local-only: it reuses the existing `copy-harness-command` browser affordance and introduces no shell-launch API, no mutation route, and no producer-contract change

### Explicit execution mutation path
Post-freeze execution mutation follow-up:
- `scripts/serve-ui-slice-01.mjs` now exposes one narrow local-only mutation route at `POST /api/harness/operator-action/run`
- the route reads the already frozen `harness-consumer-status` payload, requires `operatorAction.kind === repo-native-run`, and currently supports only the representative `markitdown` wrapper path
- `ui/app.js` `Execution` action shelf now renders a small input/output path form sourced from the existing command template and posts to that route instead of introducing a generic shell-exec surface
- relative paths are resolved against the current `project_path`; absolute paths remain limited to the current `project_path`, repo root, or `/tmp`
- this keeps the layering explicit: `doctor.summary -> consumer status -> snapshot derived -> execution operator-action shelf -> explicit local-only mutation route`
- this is still not a general shell launch API or provider mutation path

### Explicit execution evidence surface
Post-freeze execution evidence follow-up:
- the same explicit execution route now returns a small evidence payload: `executedAt`, resolved input/output paths, `outputPreview`, and `stdoutPreview`
- `ui/app.js` `Execution` action shelf renders a local-only `최근 하네스 실행 결과` register immediately under the explicit run form when a route call succeeds
- the evidence register stays transient and local-only; it is not written into `doctor.summary`, consumer payloads, or snapshot-derived frozen contracts
- this keeps the layering explicit: `explicit local-only mutation route -> transient execution result register`

### Local-only execution evidence restore
Post-freeze execution evidence restore follow-up:
- `scripts/serve-ui-slice-01.mjs` now keeps the most recent explicit harness execution result in server-process local memory and exposes it only as `derived.latestHarnessExecution`
- `ui/app.js` `Execution` restores the existing `최근 하네스 실행 결과` register from that derived payload after a snapshot refresh, but only when the active project and representative harness still match
- this remains outside the frozen harness producer and consumer contracts: no new `doctor.summary` field, no `harness-consumer-status` change, and no artifact persistence
- this keeps the layering explicit: `explicit local-only mutation route -> snapshot-derived latestHarnessExecution -> execution result register restore`

### Local-only recent execution history
Post-freeze execution history follow-up:
- `scripts/serve-ui-slice-01.mjs` now keeps a short server-process local array of recent explicit harness executions and exposes it only as `derived.recentHarnessExecutions`
- `ui/app.js` `Execution` renders a compact `최근 실행 기록` register under the current detailed execution result so the operator can compare the newest local runs after refresh
- the history stays local-only, newest-first, and bounded; it is not written into frozen harness producers, consumer payloads, runtime artifacts, or persistent runtime state
- this keeps the layering explicit: `explicit local-only mutation route -> snapshot-derived recentHarnessExecutions -> execution history register`

### Local-only execution history clear
Post-freeze execution history clear follow-up:
- `scripts/serve-ui-slice-01.mjs` now exposes one narrow local-only route at `POST /api/harness/operator-action/clear-history`
- the route clears only the server-process local evidence store that backs `derived.latestHarnessExecution` and `derived.recentHarnessExecutions`
- `ui/app.js` `Execution` shows an `실행 기록 비우기` button only when local execution evidence exists and resets the current detailed result plus recent history in one action
- this still does not widen `doctor.summary`, `harness-consumer-status`, `harness-consumer-brief`, snapshot-derived frozen contracts, or runtime artifact persistence
- this keeps the layering explicit: `execution operator-action shelf -> clear execution history action -> local-only route -> empty latest/recent derived state`

### Local-only execution history reuse
Post-freeze execution history reuse follow-up:
- `ui/app.js` `Execution` now keeps `inputPath` and `outputPath` as local form draft state instead of losing them on rerender
- the compact `최근 실행 기록` register exposes a `경로 다시 채우기` action that reuses a past run's input and output paths back into the current execution form
- no new route or snapshot key is introduced; the feature consumes the existing local-only `derived.recentHarnessExecutions` payload only
- this keeps the layering explicit: `snapshot-derived recentHarnessExecutions -> execution history register -> reuse execution paths action -> execution form draft`

### Local-only execution history rerun
Post-freeze execution history rerun follow-up:
- `ui/app.js` `Execution` now exposes a `같은 경로로 재실행` action on each recent-history row
- the action does not introduce a new route; it reuses the existing local-only `POST /api/harness/operator-action/run` path with the selected recent-history input and output paths
- this remains outside frozen producer and snapshot contracts: it consumes the existing `derived.recentHarnessExecutions` payload and existing explicit execution route only
- this keeps the layering explicit: `snapshot-derived recentHarnessExecutions -> rerun execution paths action -> existing run-harness route`

### Local-only execution output path copy
Post-freeze execution output copy follow-up:
- `ui/app.js` `Execution` now exposes `출력 경로 복사` on both the latest-result register and each recent-history row when a resolved output path exists
- the action does not introduce a new route or snapshot key; it reuses the existing browser clipboard-or-status fallback pattern already used by the shared harness brief register
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only execution result/history payloads
- this keeps the layering explicit: `execution result/history register -> copy execution output path action -> local-only clipboard or status affordance`

### Local-only execution history preview restore
Post-freeze execution history preview follow-up:
- `ui/app.js` `Execution` now exposes `결과 다시 보기` on each recent-history row so an operator can lift one past entry back into the detailed `최근 하네스 실행 결과` register
- the action does not introduce a new route or snapshot key; it reuses the existing local-only `derived.recentHarnessExecutions` payload and updates only `state.lastHarnessExecutionResult`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only execution result/history payloads and preserves the current explicit run/clear routes
- this keeps the layering explicit: `snapshot-derived recentHarnessExecutions -> restore execution preview action -> latest execution result register`

### Local-only execution input path copy
Post-freeze execution input copy follow-up:
- `ui/app.js` `Execution` now exposes `입력 경로 복사` on both the latest-result register and each recent-history row when a resolved input path exists
- the action does not introduce a new route or snapshot key; it reuses the existing browser clipboard-or-status fallback pattern already used by command copy and output-path copy
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only execution result/history payloads
- this keeps the layering explicit: `execution result/history register -> copy execution input path action -> local-only clipboard or status affordance`

### Local-only execution preview copy
Post-freeze execution preview copy follow-up:
- `ui/app.js` `Execution` now exposes `미리보기 복사` on the latest-result register when an execution preview body exists
- the action does not introduce a new route or snapshot key; it reuses the existing browser clipboard-or-status fallback pattern and copies the already available `outputPreview` or `stdoutPreview`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload
- this keeps the layering explicit: `latest execution result register -> copy execution preview action -> local-only clipboard or status affordance`

### Local-only latest-result path reuse
Post-freeze execution latest-result reuse follow-up:
- `ui/app.js` `Execution` now exposes `경로 다시 채우기` on the latest-result register when a resolved input path exists
- the action does not introduce a new route or snapshot key; it reuses the existing `reuseHarnessExecutionPaths(...)` helper and copies the already available latest execution input/output paths back into the current form draft
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload
- this keeps the layering explicit: `latest execution result register -> reuse execution paths action -> execution form draft`

### Local-only latest-result rerun
Post-freeze execution latest-result rerun follow-up:
- `ui/app.js` `Execution` now exposes `같은 경로로 재실행` on the latest-result register when a resolved input path exists
- the action does not introduce a new route or snapshot key; it reuses the existing `rerunHarnessExecutionPaths(...)` helper and sends the already available latest execution input/output paths back through the existing explicit run route
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload and current explicit run route
- this keeps the layering explicit: `latest execution result register -> rerun execution paths action -> existing run-harness route`

### Local-only latest-result hide
Post-freeze execution latest-result hide follow-up:
- `ui/app.js` `Execution` now exposes `결과 숨기기` on the latest-result register when a current explicit execution result is visible
- the action does not introduce a new route or snapshot key; it stores only a local hidden-result key in UI state and suppresses the detailed register until a new run or a restore action makes a result visible again
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload and current restore/run actions
- this keeps the layering explicit: `latest execution result register -> hide execution result action -> local visibility state`

### Local-only latest-result show again
Post-freeze execution latest-result show-again follow-up:
- `ui/app.js` `Execution` now exposes `숨긴 결과 다시 보기` when the latest explicit execution result exists but is locally hidden
- the action does not introduce a new route or snapshot key; it clears only the local hidden-result key and restores the existing latest-result register from the same current execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload and current hide/restore semantics
- this keeps the layering explicit: `hidden execution result register -> show execution result action -> latest execution result register`

### Local-only hidden-result preview excerpt
Post-freeze execution hidden-result preview follow-up:
- `ui/app.js` `Execution` now renders a preview excerpt directly inside the hidden latest-result strip when the hidden execution already carries `outputPreview` or `stdoutPreview`
- the change does not introduce a new route, snapshot key, or visibility state; it reuses only the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> hidden preview excerpt -> local latest execution payload`

### Local-only hidden-result preview copy
Post-freeze execution hidden-result preview-copy follow-up:
- `ui/app.js` `Execution` now exposes `미리보기 복사` directly inside the hidden latest-result strip when the hidden execution already carries `outputPreview` or `stdoutPreview`
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-execution-preview` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden preview action -> local clipboard or status`

### Local-only hidden-result output path copy
Post-freeze execution hidden-result output-path copy follow-up:
- `ui/app.js` `Execution` now exposes `출력 경로 복사` directly inside the hidden latest-result strip when the hidden execution already carries a resolved output path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-output-path` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden output path action -> local clipboard or status`

### Local-only hidden-result input path copy
Post-freeze execution hidden-result input-path copy follow-up:
- `ui/app.js` `Execution` now exposes `입력 경로 복사` directly inside the hidden latest-result strip when the hidden execution already carries a resolved input path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-input-path` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden input path action -> local clipboard or status`

### Local-only hidden-result reuse paths
Post-freeze execution hidden-result reuse-path follow-up:
- `ui/app.js` `Execution` now exposes `경로 다시 채우기` directly inside the hidden latest-result strip when the hidden execution already carries a resolved input path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `reuseHarnessExecutionPaths(...)` helper with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> reuse execution paths action -> execution form draft`

### Current host-ready proof
- the current maintainer host now has `markitdown` available in `PATH`
- `node scripts/harness-run.mjs doctor` reports `currentHostState: runnable`
- the representative harness is `markitdown` with `primaryHarnessState: ready`
- the current repo-native command template is `node scripts/harness-run.mjs markitdown <input-file> [output-file]`; bare zero-arg dispatch remains intentionally self-describing and surfaces wrapper usage
- repo-native execution proof runs through `scripts/smoke-harness-slice-34.mjs`, which now generates its own ASCII-only temp fixture so host-ready verification does not drift with localized repo docs

### `scripts/harness_verification_status.mjs`
Repo-native harness verification bundle:
- runs harness inventory status plus smoke slices `01` through `04`, `06`, `07`, `08`, `09`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`, `32`, `33`, `34`, `35`, `36`, and `37`
- reports one synthetic harness status payload for the current repo posture
- keeps harness verification separate from broader runtime or UI verification bundles

## Verification
Use:
- `markitdown --version`
- `node scripts/harness-status.mjs`
- `node scripts/harness-run.mjs <harness-id> ...`
- `node scripts/harness-run.mjs list`
- `node scripts/harness-run.mjs info <harness-id>`
- `node scripts/harness-run.mjs doctor`
- `node scripts/harness-consumer-status.mjs`
- `node scripts/harness-consumer-brief.mjs`
- `node scripts/harness_verification_status.mjs`
- `node --check ui/app.js`
- `node --check scripts/serve-ui-slice-01.mjs`
- `node --check scripts/markitdown-convert.mjs`
- `node scripts/smoke-harness-slice-01.mjs`
- `node scripts/smoke-harness-slice-02.mjs`
- `node scripts/smoke-harness-slice-03.mjs`
- `node scripts/smoke-harness-slice-04.mjs`
- `node scripts/smoke-harness-slice-05.mjs`
- `node scripts/smoke-harness-slice-06.mjs`
- `node scripts/smoke-harness-slice-07.mjs`
- `node scripts/smoke-harness-slice-08.mjs`
- `node scripts/smoke-harness-slice-09.mjs`
- `node scripts/smoke-harness-slice-10.mjs`
- `node scripts/smoke-harness-slice-11.mjs`
- `node scripts/smoke-harness-slice-12.mjs`
- `node scripts/smoke-harness-slice-13.mjs`
- `node scripts/smoke-harness-slice-14.mjs`
- `node scripts/smoke-harness-slice-15.mjs`
- `node scripts/smoke-harness-slice-16.mjs`
- `node scripts/smoke-harness-slice-17.mjs`
- `node scripts/smoke-harness-slice-18.mjs`
- `node scripts/smoke-harness-slice-19.mjs`
- `node scripts/smoke-harness-slice-20.mjs`
- `node scripts/smoke-harness-slice-21.mjs`
- `node scripts/smoke-harness-slice-22.mjs`
- `node scripts/smoke-harness-slice-23.mjs`
- `node scripts/smoke-harness-slice-24.mjs`
- `node scripts/smoke-harness-slice-25.mjs`
- `node scripts/smoke-harness-slice-26.mjs`
- `node scripts/smoke-harness-slice-27.mjs`
- `node scripts/smoke-harness-slice-28.mjs`
- `node scripts/smoke-harness-slice-29.mjs`
- `node scripts/smoke-harness-slice-30.mjs`
- `node scripts/smoke-harness-slice-31.mjs`
- `node scripts/smoke-harness-slice-32.mjs`
- `node scripts/smoke-harness-slice-33.mjs`
- `node scripts/smoke-harness-slice-34.mjs`
- `node scripts/smoke-harness-slice-35.mjs`
- `node scripts/smoke-harness-slice-36.mjs`
- `node scripts/smoke-harness-slice-37.mjs`
- `node scripts/smoke-ui-slice-295.mjs`
- `node scripts/smoke-ui-slice-296.mjs`
- `node scripts/smoke-ui-slice-297.mjs`
- `node scripts/smoke-ui-slice-298.mjs`
- `node scripts/smoke-ui-slice-299.mjs`
- `node scripts/smoke-ui-slice-300.mjs`
- `node scripts/smoke-ui-slice-301.mjs`
- `node scripts/smoke-ui-slice-302.mjs`
- `node scripts/smoke-ui-slice-303.mjs`
- `node scripts/smoke-ui-slice-304.mjs`
- `node scripts/smoke-ui-slice-305.mjs`
- `node scripts/smoke-ui-slice-306.mjs`
- `node scripts/smoke-ui-slice-307.mjs`
- `node scripts/smoke-ui-slice-308.mjs`
- `node scripts/smoke-ui-slice-309.mjs`
- `node scripts/smoke-ui-slice-313.mjs`
- `node scripts/smoke-ui-slice-310.mjs`
- `node scripts/smoke-ui-slice-311.mjs`
- `node scripts/smoke-ui-slice-312.mjs`
- `node scripts/smoke-ui-slice-314.mjs`
- `node scripts/smoke-ui-slice-315.mjs`
- `node scripts/smoke-ui-slice-316.mjs`
- `node scripts/smoke-ui-slice-317.mjs`
- `node scripts/smoke-ui-slice-318.mjs`
