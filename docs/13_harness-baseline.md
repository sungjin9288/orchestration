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
- `ui/app.js` `Execution` now exposes the hidden preview-copy action directly inside the hidden latest-result strip when the hidden execution already carries `outputPreview` or `stdoutPreview`
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-execution-preview` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden preview action -> local clipboard or status`

### Local-only hidden-result output path copy
Post-freeze execution hidden-result output-path copy follow-up:
- `ui/app.js` `Execution` now exposes the hidden output-path copy action directly inside the hidden latest-result strip when the hidden execution already carries a resolved output path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-output-path` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden output path action -> local clipboard or status`

### Local-only hidden-result input path copy
Post-freeze execution hidden-result input-path copy follow-up:
- `ui/app.js` `Execution` now exposes the hidden input-path copy action directly inside the hidden latest-result strip when the hidden execution already carries a resolved input path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `copy-harness-input-path` clipboard-or-status affordance with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> copy hidden input path action -> local clipboard or status`

### Local-only hidden-result reuse paths
Post-freeze execution hidden-result reuse-path follow-up:
- `ui/app.js` `Execution` now exposes `경로 다시 채우기` directly inside the hidden latest-result strip when the hidden execution already carries a resolved input path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `reuseHarnessExecutionPaths(...)` helper with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> reuse execution paths action -> execution form draft`

### Local-only hidden-result rerun
Post-freeze execution hidden-result rerun follow-up:
- `ui/app.js` `Execution` now exposes `같은 경로로 재실행` directly inside the hidden latest-result strip when the hidden execution already carries a resolved input path
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing `rerunHarnessExecutionPaths(...)` helper with the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics and the existing explicit run route
- this keeps the layering explicit: `hidden execution result register -> rerun execution paths action -> existing run-harness route`

### Local-only hidden-result path summary
Post-freeze execution hidden-result path-summary follow-up:
- `ui/app.js` `Execution` now renders compact input and output path summaries directly inside the hidden latest-result strip when the hidden execution already carries resolved paths
- the change does not introduce a new route, snapshot key, or visibility state; it reuses only the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> hidden path summary -> local latest execution payload`

### Local-only hidden-result run metadata summary
Post-freeze execution hidden-result run-metadata follow-up:
- `ui/app.js` `Execution` now renders a compact executed-at summary directly inside the hidden latest-result strip when the hidden execution already carries run timing
- the change does not introduce a new route, snapshot key, or visibility state; it reuses only the current hidden latest execution payload
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest execution payload plus current hidden-result semantics
- this keeps the layering explicit: `hidden execution result register -> hidden executed-at summary -> local latest execution payload`

### Local-only hidden-result harness/state summary
Post-freeze execution hidden-result metadata follow-up:
- `ui/app.js` `Execution` now renders compact representative harness and current harness-state summaries directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden harness/state summary -> statusCard + local latest execution payload`

### Local-only hidden-result command template summary
Post-freeze execution hidden-result operator-context follow-up:
- `ui/app.js` `Execution` now renders the representative repo-native command template directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.operatorAction`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden command summary -> operatorAction + local latest execution payload`

### Local-only hidden-result action-label summary
Post-freeze execution hidden-result operator-label follow-up:
- `ui/app.js` `Execution` now renders the representative operator action label directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.operatorAction`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden action summary -> operatorAction label + local latest execution payload`

### Local-only hidden-result host-state summary
Post-freeze execution hidden-result host-context follow-up:
- `ui/app.js` `Execution` now renders the representative host-state label directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard.currentHostState`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden host summary -> host-state label + local latest execution payload`

### Local-only hidden-result operator message summary
Post-freeze execution hidden-result operator-message follow-up:
- `ui/app.js` `Execution` now renders the representative operator message directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.operatorAction.message`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden message summary -> operatorAction message + local latest execution payload`

### Local-only hidden-result posture summary
Post-freeze execution hidden-result posture follow-up:
- `ui/app.js` `Execution` now renders the representative posture bucket directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard.primaryPosture`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden posture summary -> statusCard.primaryPosture + local latest execution payload`

### Local-only hidden-result kind summary
Post-freeze execution hidden-result harness-kind follow-up:
- `ui/app.js` `Execution` now renders the representative harness kind directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard.primaryKind`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden kind summary -> statusCard.primaryKind + local latest execution payload`

### Local-only hidden-result primary-command summary
Post-freeze execution hidden-result representative-command follow-up:
- `ui/app.js` `Execution` now renders the representative harness command directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard.primaryCommand`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden primary-command summary -> statusCard.primaryCommand + local latest execution payload`

### Local-only hidden-result primary-runner summary
Post-freeze execution hidden-result representative-runner follow-up:
- `ui/app.js` `Execution` now renders the representative harness runner path directly inside the hidden latest-result strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing hidden latest execution context plus `derived.harnessConsumerStatus.statusCard.primaryRunner`
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics and current consumer-status payload
- this keeps the layering explicit: `hidden execution result register -> hidden primary-runner summary -> statusCard.primaryRunner + local latest execution payload`

### Local-only hidden-result primary-runner wording
Post-freeze execution hidden-result representative-runner wording follow-up:
- `ui/app.js` now renders the hidden latest-result representative-runner summary label as `대표 러너` instead of the mixed-language `대표 runner`
- this keeps the hidden harness-context block in the same Korean operator wording baseline as adjacent `대표 하네스`, `대표 명령`, and `대표 포지션` summaries without changing the underlying `statusCard.primaryRunner` source
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden primary-runner wording -> summary label`

### Local-only hidden-result posture wording
Post-freeze execution hidden-result posture wording follow-up:
- `ui/app.js` now renders the hidden latest-result representative-posture summary label as `대표 정책` instead of `대표 포지션`
- this keeps the hidden harness-context block in the same policy-facing operator wording baseline while preserving the existing `statusCard.primaryPosture` source and compact summary structure
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden posture wording -> summary label`

### Local-only hidden-result posture fallback wording
Post-freeze execution hidden-result posture fallback follow-up:
- `ui/app.js` now renders the hidden latest-result representative-posture fallback as `미확인` instead of the implementation-facing `unknown`
- this keeps the hidden harness-context block in the same operator-facing wording baseline while preserving the existing `statusCard.primaryPosture` source, summary structure, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden posture fallback wording -> fallback value`

### Local-only hidden-result kind fallback wording
Post-freeze execution hidden-result kind fallback follow-up:
- `ui/app.js` now renders the hidden latest-result representative-kind fallback as `미확인` instead of the implementation-facing `unknown`
- this keeps the hidden harness-context block in the same operator-facing wording baseline while preserving the existing `statusCard.primaryKind` source, summary structure, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden kind fallback wording -> fallback value`

### Local-only hidden-result primary-command fallback wording
Post-freeze execution hidden-result representative-command fallback follow-up:
- `ui/app.js` now renders the hidden latest-result representative-command fallback as `미확인` instead of the implementation-facing `unknown`
- this keeps the hidden harness-context block in the same operator-facing wording baseline while preserving the existing `statusCard.primaryCommand` source, summary structure, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden primary-command fallback wording -> fallback value`

### Local-only hidden-result primary-runner fallback wording
Post-freeze execution hidden-result representative-runner fallback follow-up:
- `ui/app.js` now renders the hidden latest-result representative-runner fallback as `미확인` instead of the implementation-facing `unknown`
- this keeps the hidden harness-context block in the same operator-facing wording baseline while preserving the existing `statusCard.primaryRunner` source, summary structure, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden primary-runner fallback wording -> fallback value`

### Local-only rerun pending fallback wording
Post-freeze execution rerun pending-status follow-up:
- `ui/app.js` now renders the rerun pending-status fallback harness label as `미확인` instead of the implementation-facing `unknown`
- this keeps the rerun action status copy in the same operator-facing wording baseline while preserving the existing `statusCard.primaryHarnessId` source, rerun helper flow, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only rerun presentation semantics
- this keeps the layering explicit: `execution rerun action -> pending status wording -> fallback harness label`

### Local-only clear-history status wording
Post-freeze execution clear-history status wording follow-up:
- `ui/app.js` now renders the clear-history progress/success status copy as `하네스 <id>의 실행 기록 ...` so the helper wording matches the same operator-facing possessive baseline used by rerun status copy
- this keeps the clear-history action status copy inside the same local-only presentation layer while preserving the existing `statusCard.primaryHarnessId` source, clear-history helper flow, and runtime truth
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only clear-history presentation semantics
- this keeps the layering explicit: `execution clear-history action -> status wording -> progress and success copy`

### Local-only clear-history failure wording
Post-freeze execution clear-history failure-wording follow-up:
- `scripts/serve-ui-slice-01.mjs` now renders the clear-history failure fallback as `하네스 실행 기록을 비우지 못했습니다.` instead of the less direct `하네스 실행 기록 비우기에 실패했습니다.` copy
- this keeps the clear-history route in the same operator-facing Korean wording baseline while preserving the existing local-only `POST /api/harness/operator-action/clear-history` contract, mutation kind, and success-path behavior
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only clear-history fallback presentation semantics
- this keeps the layering explicit: `execution clear-history action -> failure wording -> fallback copy`

### Local-only clear-history guard wording
Post-freeze execution clear-history guard-wording follow-up:
- `ui/app.js` now renders the client-side clear-history guard message as `현재 비울 실행 기록이 없습니다.` instead of the more implementation-facing `비울 수 있는 대표 하네스 실행 기록이 없습니다.` copy
- this keeps the local-only clear-history action in the same operator-facing wording baseline while preserving the existing `statusCard.primaryHarnessId` guard condition, button visibility rule, and clear-history helper flow
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only clear-history guard presentation semantics
- this keeps the layering explicit: `execution clear-history action -> guard wording -> missing history message`

### Local-only latest-run empty-state wording
Post-freeze execution latest-run empty-state wording follow-up:
- `ui/app.js` now renders the taskboard latest-run empty-state copy as `아직 실행 기록이 없습니다.` instead of the redundant `기록된 실행 기록이 없습니다.` phrasing
- this keeps the latest-run summary in the same operator-facing wording baseline while preserving the existing latest-run selection logic, taskboard summary structure, and run-derived state semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only latest-run empty-state presentation semantics
- this keeps the layering explicit: `taskboard latest-run summary -> empty-state wording -> helper copy`

### Local-only latest-run id fallback wording
Post-freeze execution latest-run id-fallback wording follow-up:
- `ui/app.js` now renders the taskboard latest-run id fallback as `아직 없음` instead of the terser `없음` label when no latest run is linked
- this keeps the latest-run summary in the same operator-facing wording baseline while preserving the existing latest-run selection logic, taskboard summary structure, and run-derived state semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only latest-run id-fallback presentation semantics
- this keeps the layering explicit: `taskboard latest-run summary -> id fallback wording -> value label`

### Local-only latest-run worktree fallback wording
Post-freeze execution latest-run worktree-fallback wording follow-up:
- `ui/app.js` now renders the taskboard latest-run worktree fallback as `아직 연결 안 됨` instead of the terser `연결 안 됨` label when no worktree ref is linked
- this keeps the latest-run summary in the same operator-facing wording baseline while preserving the existing `task.worktreeRef` relation, taskboard summary structure, and linked-worktree semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only latest-run worktree-fallback presentation semantics
- this keeps the layering explicit: `taskboard latest-run summary -> worktree fallback wording -> value label`

### Local-only latest-run worktree detail wording
Post-freeze execution latest-run worktree-detail wording follow-up:
- `ui/app.js` now renders the taskboard latest-run worktree detail copy as `아직 저장된 워크트리 경로가 없습니다.` instead of the longer `저장된 워크트리 경로가 아직 설정되지 않았습니다.` wording when no saved worktree ref exists in that summary block
- this keeps the latest-run summary in the same operator-facing time-baseline while preserving the existing `task.worktreeRef` relation, `currentWorktreeOption` resolution, taskboard summary structure, and linked-worktree semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only latest-run worktree-detail presentation semantics
- this keeps the layering explicit: `taskboard latest-run summary -> worktree detail wording -> detail copy`

### Local-only worktree helper not-set wording
Post-freeze worktree helper wording follow-up:
- `ui/app.js` now renders the `buildTaskWorktreeRelation(...)` not-set helper copy as `아직 저장된 워크트리 경로가 없습니다.` instead of `저장된 워크트리 경로가 아직 설정되지 않았습니다.`
- this keeps the worktree helper batch in the same operator-facing time-baseline while preserving the existing `task.worktreeRef` relation, current project-path comparison semantics, linked-worktree helper structure, and follow-up action semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only worktree-helper not-set presentation semantics
- this keeps the layering explicit: `worktree helper batch -> not-set branch wording -> helper copy`

### Local-only worktree helper not-set label wording
Post-freeze worktree helper label follow-up:
- `ui/app.js` now renders the `buildTaskWorktreeRelation(...)` not-set label as `워크트리:아직 없음` instead of the terser `워크트리:미설정`
- this keeps the same not-set helper branch in the operator-facing time-baseline while preserving the existing `task.worktreeRef` relation, current project-path comparison semantics, linked-worktree helper structure, and follow-up action semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only worktree-helper not-set label presentation semantics
- this keeps the layering explicit: `worktree helper batch -> not-set branch label wording -> token label`

### Local-only linked-worktree success token wording
Post-freeze linked-worktree token wording follow-up:
- `ui/app.js` now renders the linked-worktree row success token as `현재 프로젝트 경로` instead of the mixed `현재 project_path`
- this keeps the linked-worktree row in the accepted operator-facing Korean baseline while preserving the existing current-project-path detection, linked-worktree row structure, and project switching semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only linked-worktree success-token presentation semantics
- this keeps the layering explicit: `linked-worktree row -> success token wording -> token label`

### Local-only worktree relation heading wording
Post-freeze worktree relation heading follow-up:
- `ui/app.js` now renders the task-detail relation heading as `저장된 워크트리 경로와 현재 프로젝트 경로` instead of the mixed `task.worktreeRef와 현재 project_path`
- this keeps the relation strip in the accepted operator-facing Korean baseline while preserving the existing worktree relation semantics, current-project-path detection, and project switching flow
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only worktree-relation heading presentation semantics
- this keeps the layering explicit: `task detail worktree relation -> heading wording -> title`

### Local-only worktree option current-project token wording
Post-freeze worktree option token follow-up:
- `ui/app.js` now renders the `formatWorktreeOptionLabel(...)` current-project marker as `현재 프로젝트 경로` instead of the mixed `현재 project_path`
- this keeps linked-worktree option labels in the accepted operator-facing Korean baseline while preserving the existing worktree option ordering, current-project-path detection, and linked-worktree relation semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only worktree-option token presentation semantics
- this keeps the layering explicit: `worktree option label -> current project token wording -> token label`

### Local-only harness-run form-help wording
Post-freeze harness-run form-help follow-up:
- `ui/app.js` now renders the harness-run path help as `현재 프로젝트 경로` instead of the mixed `현재 project_path`
- this keeps the operator-facing path guidance in the accepted Korean baseline while preserving the existing relative-path resolution rule, absolute-path allowlist, and harness-run submit flow
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only harness-run form-help presentation semantics
- this keeps the layering explicit: `harness run form -> path form-help wording -> helper copy`

### Local-only harness-run policy-note design polish
Post-freeze harness-run design follow-up:
- `ui/app.js` and `ui/styles.css` now render the harness-run path guidance as a compact policy note with a small kicker, top rail, and tokenized technical nouns instead of a flat helper line
- this keeps the execution desk aligned with the `DESIGN.md` desk-card / control-note direction while preserving the existing relative-path resolution rule, absolute-path allowlist, and harness-run submit flow
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only harness-run helper presentation styling
- this keeps the layering explicit: `harness run form -> policy note design polish -> helper note`

### Local-only harness-run action-shelf design polish
Post-freeze harness-run action-row follow-up:
- `ui/app.js` and `ui/styles.css` now render the harness-run button row as a compact command shelf with a light rail, padded control band, and tighter action grouping instead of a flat inline button line
- this keeps the execution desk aligned with the `DESIGN.md` desk-card / command-shelf direction while preserving the existing button order, submit semantics, clear-history path, and command-copy action
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only harness-run action-row presentation styling
- this keeps the layering explicit: `harness run form -> action shelf design polish -> command row`

### Local-only harness-run field-rack design polish
Post-freeze harness-run input follow-up:
- `ui/app.js` and `ui/styles.css` now render the input/output path fields as a compact intake rack with a shared light rail and grouped field band instead of two independent flat fields
- this keeps the execution desk aligned with the `DESIGN.md` intake-desk direction while preserving the existing field names, placeholders, required input rule, and harness-run submit semantics
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only harness-run field-cluster presentation styling
- this keeps the layering explicit: `harness run form -> field rack design polish -> input cluster`

### Local-only harness-run template-note design polish
Post-freeze harness-run template follow-up:
- `ui/app.js` and `ui/styles.css` now render the harness-run command template as a compact command note with a kicker, rail, and dedicated code block instead of a flat inline copy line
- this keeps the execution desk aligned with the `DESIGN.md` command-note direction while preserving the existing command template string, downstream copy action, and harness-run submit flow
- the change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only harness-run template presentation styling
- this keeps the layering explicit: `harness run desk -> template note design polish -> command template`

### Local-only hidden-result metadata consolidation
Post-freeze execution hidden-result readability follow-up:
- `ui/app.js` `Execution` now groups the hidden latest-result metadata into two compact read-only blocks: `하네스 컨텍스트` and `운영 컨텍스트`
- the change does not introduce a new route, snapshot key, or visibility state; it reorganizes only the existing hidden latest execution summaries and current consumer-status payload already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden metadata groups -> harness context + operator context`

### Local-only hidden-result run-context grouping
Post-freeze execution hidden-result run-context follow-up:
- `ui/app.js` `Execution` now groups the hidden latest-result execution record into one compact read-only block: `실행 기록`
- the change does not introduce a new route, snapshot key, or visibility state; it reorganizes only the existing hidden latest execution timestamp and resolved path summaries already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution` payload
- this keeps the layering explicit: `hidden execution result register -> hidden run-context group -> executedAt + resolved paths`

### Local-only hidden-result block ordering
Post-freeze execution hidden-result ordering follow-up:
- `ui/app.js` `Execution` now renders the hidden latest-result blocks in this order: `실행 기록 -> 하네스 컨텍스트 -> 운영 컨텍스트`
- the change does not introduce a new route, snapshot key, or visibility state; it reorders only the existing compact blocks already present in the hidden latest-result strip
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden block ordering -> run context first`

### Local-only hidden-result compact density
Post-freeze execution hidden-result density follow-up:
- `ui/app.js` and `ui/styles.css` now tighten the hidden latest-result strip through a dedicated compact root class, compact block class, and compact copy treatment
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only presentation density for the existing hidden latest-result blocks already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden compact density -> root class + block class + compact copy`

### Local-only hidden-result action-row density
Post-freeze execution hidden-result action-row follow-up:
- `ui/app.js` and `ui/styles.css` now tighten the hidden latest-result action row through a dedicated compact action-row class scoped to the hidden strip
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only presentation density for the existing hidden latest-result action row already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden action-row density -> compact action row`

### Local-only hidden-result header density
Post-freeze execution hidden-result header follow-up:
- `ui/app.js` now tightens the hidden latest-result root header by reusing the existing `card-title-row-tight` presentation pattern
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only header density for the existing hidden latest-result root header already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden header density -> tight title row`

### Local-only hidden-result root wording
Post-freeze execution hidden-result copy follow-up:
- `ui/app.js` now localizes the hidden latest-result root token label and intro copy while reusing the tight title-row presentation at the root header
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only root-level wording for the existing hidden latest-result strip already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden root wording -> localized header copy`

### Local-only hidden-result restore label wording
Post-freeze execution hidden-result restore-label follow-up:
- `ui/app.js` now shortens the hidden latest-result restore button label to `결과 다시 보기` so it matches the existing recent-history restore wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result restore action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden restore wording -> show action label`

### Local-only hidden-result rerun label wording
Post-freeze execution hidden-result rerun-label follow-up:
- `ui/app.js` now shortens the hidden latest-result rerun button label to `같은 경로 재실행` so it stays consistent with the compact hidden action row
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result rerun action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden rerun wording -> rerun action label`

### Local-only hidden-result reuse label wording
Post-freeze execution hidden-result reuse-label follow-up:
- `ui/app.js` now shortens the hidden latest-result reuse button label to `경로 채우기` so it stays consistent with the compact hidden action row
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result reuse action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden reuse wording -> reuse action label`

### Local-only hidden-result output-copy label wording
Post-freeze execution hidden-result output-copy-label follow-up:
- `ui/app.js` now shortens the hidden latest-result output-copy button label to `출력 경로` so it better fits the compact hidden action row
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result output-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden output copy wording -> output copy action label`

### Local-only hidden-result input-copy label wording
Post-freeze execution hidden-result input-copy-label follow-up:
- `ui/app.js` now shortens the hidden latest-result input-copy button label to `입력 경로` so it better fits the compact hidden action row
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result input-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden input copy wording -> input copy action label`

### Local-only hidden-result preview-copy label wording
Post-freeze execution hidden-result preview-copy-label follow-up:
- `ui/app.js` now shortens the hidden latest-result preview-copy button label to `미리보기` so it better fits the compact hidden action row
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing hidden latest-result preview-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden-result semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden preview copy wording -> preview copy action label`

### Local-only recent-history reuse label wording
Post-freeze execution recent-history reuse-label follow-up:
- `ui/app.js` now shortens the recent-history reuse button label to `경로 채우기` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing recent-history reuse action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history reuse wording -> reuse action label`

### Local-only recent-history rerun label wording
Post-freeze execution recent-history rerun-label follow-up:
- `ui/app.js` now shortens the recent-history rerun button label to `같은 경로 재실행` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing recent-history rerun action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history rerun wording -> rerun action label`

### Local-only recent-history input-copy label wording
Post-freeze execution recent-history input-copy-label follow-up:
- `ui/app.js` now shortens the recent-history input-copy button label to `입력 경로` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing recent-history input-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history input copy wording -> input copy action label`

### Local-only recent-history output-copy label wording
Post-freeze execution recent-history output-copy-label follow-up:
- `ui/app.js` now shortens the recent-history output-copy button label to `출력 경로` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing recent-history output-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `latestHarnessExecution`, `statusCard`, and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history output copy wording -> output copy action label`

### Local-only latest-result input-copy label wording
Post-freeze execution latest-result input-copy-label follow-up:
- `ui/app.js` now shortens the visible latest-result input-copy button label to `입력 경로` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing latest-result input-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible input copy wording -> input copy action label`

### Local-only latest-result output-copy label wording
Post-freeze execution latest-result output-copy-label follow-up:
- `ui/app.js` now shortens the visible latest-result output-copy button label to `출력 경로` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing latest-result output-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible output copy wording -> output copy action label`

### Local-only latest-result preview-copy label wording
Post-freeze execution latest-result preview-copy-label follow-up:
- `ui/app.js` now shortens the visible latest-result preview-copy button label to `미리보기` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing latest-result preview-copy action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible preview copy wording -> preview copy action label`

### Local-only latest-result rerun label wording
Post-freeze execution latest-result rerun-label wording follow-up:
- `ui/app.js` now shortens the visible latest-result rerun button label to `같은 경로 재실행` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing latest-result rerun action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible rerun wording -> rerun action label`

### Local-only latest-result reuse label wording
Post-freeze execution latest-result reuse-label wording follow-up:
- `ui/app.js` now shortens the visible latest-result reuse button label to `경로 채우기` so it stays consistent with the compact hidden action row wording
- the change does not introduce a new route, snapshot key, or visibility state; it adjusts only the operator-facing label for the existing latest-result reuse action already in render scope
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible reuse wording -> reuse action label`

### Local-only latest-result action-row density
Post-freeze execution latest-result action-density follow-up:
- `ui/app.js` now adds the existing `form-actions-compact` class to the visible latest-result action row so the latest register keeps the same compact scan rhythm as the hidden strip without introducing a new presentation contract
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact action-row token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible action density -> compact action row`

### Local-only latest-result detail-row density
Post-freeze execution latest-result detail-density follow-up:
- `ui/app.js` now adds the existing `detail-copy-compact` class to the visible latest-result input/output path rows so the latest register keeps the same compact copy rhythm as the hidden strip without introducing a new typography contract
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact detail-copy token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible detail density -> compact path rows`

### Local-only latest-result preview-empty density
Post-freeze execution latest-result preview-empty follow-up:
- `ui/app.js` now adds the existing `detail-copy-compact` class to the visible latest-result preview-empty fallback copy so the latest register keeps the same compact copy rhythm even when no preview text is available
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact detail-copy token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible preview-empty density -> compact empty copy`

### Local-only latest-result token-row density
Post-freeze execution latest-result token-density follow-up:
- `ui/app.js` now adds the existing `token-row-compact` class to the visible latest-result token row so the latest register keeps the same compact token rhythm already used across the execution surface
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact token-row token already used elsewhere in the UI shell
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible token density -> compact token row`

### Local-only latest-result root density
Post-freeze execution latest-result root-density follow-up:
- `ui/app.js` now adds the existing `relation-strip-compact` class to the visible latest-result root so the latest register keeps the same compact board rhythm already used by the hidden execution strip
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact relation-strip token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible root density -> compact relation strip`

### Local-only latest-result preview density
Post-freeze execution latest-result preview-density follow-up:
- `ui/app.js` now adds the existing `log-viewer-compact` class to the visible latest-result preview `<pre>` so the latest register keeps a tighter preview footprint without introducing a new preview variant
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact preview token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `latestHarnessExecution` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register -> visible preview density -> compact preview log`

### Local-only hidden-result preview density
Post-freeze execution hidden-result preview-density follow-up:
- `ui/app.js` now adds the existing `log-viewer-compact` class to the hidden latest-result preview `<pre>` so the hidden strip keeps the same compact preview footprint as the visible latest-result register
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact preview token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only hidden latest execution semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `hidden execution result register -> hidden preview density -> compact preview log`

### Local-only execution preview base class cleanup
Post-freeze execution preview base-class follow-up:
- `ui/app.js` now reuses the existing `log-viewer` base class together with `log-viewer-compact` for both visible and hidden execution preview `<pre>` blocks so preview styling no longer depends on the undefined `task-evidence-log` class name
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing preview classes already used elsewhere in the execution and artifact surfaces
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only latest and hidden execution preview semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution result register + hidden execution result register -> preview base class -> log viewer compact`

### Local-only recent-history action density
Post-freeze execution recent-history action-density follow-up:
- `ui/app.js` now adds the existing `form-actions-compact` class to the visible recent-history action row so the history register keeps the same tighter operator scan rhythm already used by the visible latest-result register
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact action-row token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history action density -> compact action row`

### Local-only recent-history root density
Post-freeze execution recent-history root-density follow-up:
- `ui/app.js` now adds the existing `relation-strip-compact` class to the visible recent-history root so the history register keeps the same tighter board rhythm already used by the latest-result and hidden execution strips
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing compact relation-strip token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history root density -> compact relation strip`

### Local-only recent-history header density
Post-freeze execution recent-history header-density follow-up:
- `ui/app.js` now adds the existing `card-title-row-tight` class to the visible recent-history title row so the history register header keeps the same tighter heading rhythm already used by the latest-result and hidden execution strips
- the change does not introduce a new route, snapshot key, or visibility state; it reuses the existing tight title-row token already used elsewhere in the execution surface
- this remains outside frozen producer, consumer, and runtime persistence contracts: it consumes only the existing local-only `recentHarnessExecutions` semantics plus current `statusCard` and `operatorAction` payloads
- this keeps the layering explicit: `execution history register -> history header density -> tight title row`

### Local-only recent-history item density
Post-freeze execution recent-history item-density follow-up:
- `ui/app.js` now adds a dedicated `control-overview-register-compact` class to visible recent-history item cards so each execution register row keeps a tighter card footprint without changing shared register behavior outside the history surface
- `ui/styles.css` scopes the compact item treatment to recent-history register cards only by trimming card gap/padding and inner row gap while leaving the base `control-overview-register` token untouched for the rest of the shell
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only recent-history presentation semantics
- this keeps the layering explicit: `execution history register -> history item density -> compact register card`

### Local-only recent-history text density
Post-freeze execution recent-history text-density follow-up:
- `ui/styles.css` now tightens `control-overview-register-label` and `control-overview-register-value` typography only when those rows are rendered inside the existing `control-overview-register-compact` history card variant
- the shared register token remains unchanged outside recent-history, so this narrows only label/value scan density for the local execution-history surface instead of widening typography semantics shell-wide
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only recent-history presentation semantics
- this keeps the layering explicit: `execution history register -> history text density -> compact register typography`

### Local-only recent-history list density
Post-freeze execution recent-history list-density follow-up:
- `ui/app.js` now adds a dedicated `harness-execution-history-list-compact` class to the visible recent-history list container so the list gap can tighten without touching the shared `stack` token used across the shell
- `ui/styles.css` scopes that list treatment to the recent-history container only by trimming the list gap from the base stack rhythm while leaving generic stack semantics unchanged elsewhere
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only recent-history presentation semantics
- this keeps the layering explicit: `execution history register -> history list density -> compact list gap`

### Local-only recent-history output fallback wording
Post-freeze execution recent-history output-fallback wording follow-up:
- `ui/app.js` now renders the recent-history output fallback as `표준 출력 전용` instead of the mixed-language `stdout only` label when a run has no persisted output path
- this keeps the recent-history register in the same Korean operator copy rhythm as the rest of the execution surface while leaving run semantics, path resolution, and route behavior unchanged
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only recent-history presentation semantics
- this keeps the layering explicit: `execution history register -> history output fallback wording -> output value label`

### Local-only recent-history title wording
Post-freeze execution recent-history title-wording follow-up:
- `ui/app.js` now shortens the visible recent-history section title from `최근 실행 기록` to `실행 기록` so it aligns with the existing hidden run-context block wording
- this keeps the visible history register in the same execution-record naming rhythm as adjacent hidden/visible execution surfaces while leaving history payload ordering, route behavior, and newest-first semantics unchanged
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only recent-history presentation semantics
- this keeps the layering explicit: `execution history register -> history title wording -> section title`

### Local-only hidden-result hide status wording
Post-freeze execution hidden-result hide-status wording follow-up:
- `ui/app.js` now shortens the hide success status copy from `최근 하네스 실행 결과를 숨겼습니다.` to `최근 실행 결과를 숨겼습니다.` while keeping the existing `실행 기록에서 다시 볼 수 있습니다.` guidance unchanged
- this keeps the hidden latest-result feedback in the same operator wording rhythm as the visible/hidden execution surfaces without changing hide/show behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `execution result register -> hide execution result status wording -> refresh status copy`

### Local-only hidden-result title wording
Post-freeze execution hidden-result title-wording follow-up:
- `ui/app.js` now shortens the hidden latest-result section title from `최근 하네스 실행 결과가 숨겨져 있습니다` to `최근 실행 결과가 숨겨져 있습니다` while preserving the existing hidden-state token and helper copy
- this keeps the hidden latest-result header in the same execution wording baseline as adjacent visible/hidden execution surfaces without changing hide/show behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden title wording -> section title`

### Local-only hidden-result helper wording
Post-freeze execution hidden-result helper-wording follow-up:
- `ui/app.js` now shortens the hidden latest-result helper copy from `필요하면 방금 숨긴 최신 실행 결과를 다시 표시할 수 있습니다.` to `필요하면 방금 숨긴 실행 결과를 다시 표시할 수 있습니다.`
- this keeps the hidden helper line in the same compact execution wording baseline as the surrounding hidden latest-result title and status copy without changing hide/show behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only hidden-result presentation semantics
- this keeps the layering explicit: `hidden execution result register -> hidden helper wording -> helper copy`

### Local-only visible-result title wording
Post-freeze execution visible-result title-wording follow-up:
- `ui/app.js` now shortens the visible latest-result section title from `최근 하네스 실행 결과` to `최근 실행 결과` while preserving the existing success token and execution evidence structure
- this keeps the visible latest-result header in the same compact execution wording baseline as the hidden latest-result title and adjacent execution-history surfaces without changing restore behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only visible-result presentation semantics
- this keeps the layering explicit: `execution result register -> visible title wording -> section title`

### Local-only visible-result stdout token wording
Post-freeze execution visible-result token-wording follow-up:
- `ui/app.js` now renders the visible latest-result no-output token as `표준 출력` instead of `stdout` while preserving the existing `출력파일` token for persisted output-path runs
- this keeps the visible latest-result token row in the same Korean operator wording baseline as the surrounding execution titles and path fallbacks without changing restore behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only visible-result presentation semantics
- this keeps the layering explicit: `execution result register -> visible stdout token wording -> token label`

### Local-only visible-result header token wording
Post-freeze execution visible-result header-token wording follow-up:
- `ui/app.js` now renders the visible latest-result header success token as `완료` instead of `success` while preserving the existing success-tone token styling and section title
- this keeps the visible latest-result header in the same Korean operator wording baseline as the surrounding execution titles, path fallbacks, and token row without changing restore behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only visible-result presentation semantics
- this keeps the layering explicit: `execution result register -> visible header token wording -> token label`

### Local-only visible-result output-file token wording
Post-freeze execution visible-result output-file token wording follow-up:
- `ui/app.js` now renders the visible latest-result output-path token as `출력 파일` instead of `출력파일` while preserving the existing `표준 출력` fallback token for stdout-only runs
- this keeps the visible latest-result token row in the same spacing and Korean operator wording baseline as the surrounding execution titles, path labels, and fallbacks without changing restore behavior, route flow, or local visibility state semantics
- this change does not introduce a new route, snapshot key, or visibility state; it stays entirely inside local-only visible-result presentation semantics
- this keeps the layering explicit: `execution result register -> visible output-file token wording -> token label`

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
