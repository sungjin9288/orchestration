# Mission-Council Slice m6-02

## Purpose
이 문서는 `DEC-042`와 `docs/06_ai-orchestration-pivot.md`를 실제 구현 가능한 첫 thin slice로 고정한다.

목표는 간단하다.

- 현재 v1 execution engine은 유지한다.
- 현재 `Taskboard / Logs / Artifacts / Decision Inbox` 셸도 유지한다.
- 하지만 기본 제품 진입점을 `operator control plane`이 아니라 `AI orchestration start point`로 바꾸는 첫 단위를 정의한다.

이 문서는 첫 구현 범위 명세로 시작했으며, 현재 `main`에서는 아래 `Current Main Status`에
기록된 bounded behavior로 구현 완료된 source-of-truth 상태를 함께 고정한다.

## Slice Goal
첫 slice는 아래 경험 하나를 닫아야 한다.

1. 사용자가 project를 고른다.
2. 사용자가 "무엇을 만들고 싶은지"를 `Mission`으로 입력한다.
3. 시스템이 역할 기반 `Council`을 자동 실행한다.
4. 사용자는 역할별 핵심 의견, 충돌, 추천안을 본다.
5. 사용자는 한 번의 명시적 alignment decision을 내린다.
6. 승인되면 시스템은 기존 엔진 위에서 `planner -> architect -> task-breaker -> builder preflight`까지 자동 진행한다.
7. 그 이후 human gate와 downstream execution은 기존 v1 semantics를 그대로 따른다.

즉, 이 slice의 핵심은 "첫 진입과 정렬 경험"을 바꾸는 것이지, builder/reviewer/commit/release semantics를 다시 쓰는 것이 아니다.

## Non-Goals
이 slice에서 하지 않는 것:

- office-first UI
- messenger UI
- avatar animation or character theater
- provider 전략 변경
- builder live-mutation semantics 변경
- reviewer semantics 변경
- commit-package / local commit / release-package / close-out semantics 변경
- approval 자동 소비
- multi-mission planning board
- 팀 협업, multi-user workspace, cloud sync

## Must Reuse
아래는 그대로 재사용한다.

- `project_path required`
- current project registry
- current task/run/artifact/review/approval contracts
- current coordinator readiness
- current provenance and artifact model
- current live-provider boundary
- current advanced ops shell

## New Top-Layer Objects

### Mission
사용자가 입력하는 상위 목표 객체.

Required fields:
- `id`
- `projectId`
- `title`
- `goal`
- `constraints`
- `status`
- `linkedTaskId`
- `councilSessionId`

Allowed initial statuses:
- `draft`
- `aligning`
- `aligned`
- `executing`
- `completed`
- `blocked`

첫 slice에서는 mission 하나가 task 하나를 만든다. 하나의 mission이 여러 task로 fan-out되는 모델은 열지 않는다.

### Council Session
Mission을 실행 가능한 plan으로 정렬하는 visible multi-role transcript.

Required fields:
- `id`
- `missionId`
- `status`
- `participants`
- `summary`
- `recommendation`
- `openQuestions`
- `transcript`
- `selectedPlan`

첫 slice에서는 participant를 아래 4개로 고정한다.
- `Conductor`
- `Strategist`
- `Architect`
- `Decomposer`

`Maker`와 `Critic`은 현재 엔진에 존재하지만, 첫 slice council transcript에는 참여시키지 않는다. 이 둘은 이후 execution/review 단계에서 다시 나타난다.

## UX Contract

### 1. Default Entry
현재 앱의 기본 진입점은 `Taskboard`다.

첫 slice 이후 기본 진입점은 `Mission`이 되어야 한다.

Mission surface minimum sections:
- active project summary
- mission composer
- recent missions
- latest council outcome
- `Open Advanced Ops Mode` affordance

### 2. Council Visibility
Council은 단순 summary 카드가 아니라 최소한 아래를 보여야 한다.

- participant roster
- 역할별 핵심 발언 1개 이상
- disagreement or tension
- final recommendation
- explicit alignment question

즉, planner artifact를 숨긴 채 요약만 뿌리는 것이 아니라 "누가 무슨 관점에서 그렇게 말했는지"가 보여야 한다.

### 3. Alignment Checkpoint
사용자가 눌러야 하는 명시적 decision은 하나다.

Allowed actions:
- `Approve Recommendation`
- `Revise Mission`
- `Open Advanced Ops Mode`

첫 slice에서는 free-form branching workflow를 열지 않는다.

### 4. Automatic Progression
`Approve Recommendation` 이후 자동 진행 범위는 아래로 고정한다.

- create linked task
- run planner
- run architect
- run task-breaker
- run builder preflight

자동 진행은 여기서 멈춘다.

자동 진행 후 상태는 아래 둘 중 하나여야 한다.
- `waiting approval` for live mutation
- `waiting decision` if upstream council/execution created a blocking item

## Runtime And Data Scope
첫 slice에서 필요한 최소 runtime 추가 항목:

- `missions`
- `councilSessions`
- `selectedMissionId`

하지만 아래는 유지한다.

- existing `projects`
- existing `tasks`
- existing `runs`
- existing `artifacts`
- existing `inboxItems`
- existing `approvals`

Mission과 Council은 기존 task/run/artifact 위에 얹는 상위 index여야 하며, source of truth를 대체하면 안 된다.

## Execution Mapping
Council transcript는 기존 engine role을 아래처럼 매핑한다.

- `Strategist` -> planner output 기반
- `Architect` -> architect output 기반
- `Decomposer` -> task-breaker output 기반
- `Conductor` -> 위 세 결과를 요약하고 recommendation을 정리하는 orchestration-only layer

첫 slice에서는 새로운 "회의용 LLM role"을 추가하지 않는다.
가능하면 existing planner/architect/task-breaker outputs를 기반으로 transcript를 구성하고, 필요한 orchestration summary만 얇게 추가한다.

## Surface Model For This Slice

### Mission
새 기본 surface.

Should show:
- mission composer
- recent mission list
- selected mission summary
- linked task state
- jump to council
- jump to advanced ops mode

### Council
새 기본 surface.

Should show:
- participant cards
- transcript timeline
- summary
- recommendation
- alignment CTA

### Execution
새 기본 surface이지만 첫 slice에서는 compact summary만 제공한다.

Should show:
- linked task lifecycle
- latest run stage
- blocked reason
- preflight readiness
- link to advanced ops detail

### Deliverables
새 기본 surface이지만 첫 slice에서는 latest artifact package summary만 제공한다.

Should show:
- latest relevant artifacts
- latest review state
- latest approval state
- jump to advanced ops detail

### Advanced Ops Mode
현재 v1 shell을 그대로 재사용한다.

Must remain available because:
- provenance inspection
- detailed execution control
- current smoke coverage
- current operator trust path

## Acceptance Checklist
- [x] 사용자는 `Mission`에서 목표를 입력할 수 있다.
- [x] mission 생성은 active project 없이 열리지 않는다.
- [x] mission 하나는 linked task 하나만 만든다.
- [x] `Council`은 최소 4개 역할의 visible contribution을 보여준다.
- [x] recommendation approval 전에는 downstream execution이 자동 시작되지 않는다.
- [x] approval 후 자동 진행은 `planner -> architect -> task-breaker -> builder preflight`까지만 허용된다.
- [x] builder live-mutation 이후 semantics는 current v1과 동일하다.
- [x] current `Taskboard / Logs / Artifacts / Decision Inbox` shell은 `advanced ops mode`로 계속 접근 가능하다.
- [x] current source-of-truth task/run/artifact/review/approval contracts는 유지된다.

## Suggested Implementation Order

### Step 1. Runtime Shape
- add mission and council-session storage
- add selected mission state
- keep current snapshot shape backward-compatible

### Step 2. Mission Surface
- add top-level `Mission` surface
- add mission composer
- add mission list and mission detail summary

### Step 3. Council Surface
- add council transcript renderer
- add recommendation and alignment CTA

### Step 4. Approval-To-Preflight Auto Chain
- on alignment approval, create task and run upstream stages through preflight
- stop at the existing gate

### Step 5. Advanced Ops Linking
- keep deep links into current task detail, artifacts, logs, and inbox

## Example Mission

### Input
- project: `orchestration`
- goal: `로그인 UX를 더 단순하게 만들고 싶다. 너무 큰 구조 변경은 피하고 먼저 작은 수정안을 제안해줘.`
- constraints:
  - `project_path` 안에서만 작업
  - 작은 수정 우선
  - 기존 semantics 보존

### Expected Council Output
- Strategist: 작은 UX friction 제거를 우선하자
- Architect: auth/session boundary는 건드리지 말자
- Decomposer: UI copy, button placement, validation timing을 따로 보자
- Conductor recommendation: UI copy + validation timing의 bounded slice부터 시작

### Alignment Question
`이 추천안으로 첫 bounded slice를 시작할까요?`

## Current Main Status
current `main` now implements `mission-surface-m6-03`, `council-surface-m6-04`, `alignment-auto-chain-m6-05`, `deliverables-surface-m6-06`, `advanced-ops-demotion-m6-07`, `mission-project-bootstrap-m6-08`, `mission-to-council-autodraft-m6-09`, `mission-execution-approval-bridge-m6-10`, `primary-approval-cta-m6-11`, `primary-live-mutation-cta-m6-12`, `primary-reviewer-cta-m6-13`, `primary-commit-package-cta-m6-14`, `primary-commit-approval-cta-m6-15`, `primary-local-commit-cta-m6-16`, `primary-release-package-cta-m6-17`, `primary-release-approval-cta-m6-18`, `primary-close-out-cta-m6-19`, `mission-done-summary-m6-20`, `mission-next-cycle-entry-m6-21`, `completed-mission-list-framing-m6-22`, `mission-council-preview-m6-23`, `mission-execution-preview-m6-24`, `mission-deliverables-preview-m6-25`, `mission-next-action-framing-m6-26`, `mission-preview-density-trim-m6-27`, `mission-preview-surface-handoff-m6-28`, `mission-list-row-scanability-m6-29`, `mission-detail-copy-tighten-m6-30`, `mission-detail-token-density-m6-31`, `mission-detail-section-balance-m6-32`, `mission-detail-action-balance-m6-33`, `mission-detail-summary-dedup-m6-34`, `mission-detail-surface-copy-tighten-m6-35`, and `mission-empty-state-copy-tighten-m6-36` with the following bounded behavior:

- `Mission` is the default top-level surface
- mission create/select is available
- `Council` is a dedicated top-level surface
- one mission can draft one visible `councilSession`
- council shows participant roster, transcript, recommendation, open questions, and one explicit alignment CTA
- `Approve Recommendation` now auto-creates one linked task when needed and advances `planner -> architect -> task-breaker -> builder preflight`
- auto progression now requests the existing builder live-mutation approval gate and then stops
- `Execution` is now a compact top-level surface for linked task lifecycle, latest run stage, current approval bridge, blocked reason, and preflight readiness
- `Deliverables` is now a compact top-level surface for latest artifact package, latest review state, latest approval state, and the current approval target summary
- `Execution` now exposes one explicit `Approve Current Gate` CTA for the pending builder approval, and that CTA reuses the existing inbox approval action instead of adding a new runtime path
- `Execution` now also exposes one bounded `Run Live Mutation` CTA after the current builder gate is approved, and that CTA reuses the existing task live-mutation route before landing on `Logs`
- `Execution` now also exposes one bounded `Run Reviewer` CTA after the latest live-mutation bundle is ready, and that CTA reuses the existing reviewer route before landing on `Artifacts`
- `Execution` now also exposes one bounded `Prepare Commit Package` CTA after the latest passing reviewer bundle is ready, and that CTA reuses the existing commit-package route while stopping at the existing commit approval gate
- `Execution` now also exposes one explicit `Approve Current Commit Gate` CTA after the current commit package opens a pending commit approval, and that CTA reuses the existing inbox approval action before handing local commit back to `Advanced Ops Mode`
- `Execution` now also exposes one bounded `Resume Approved Local Commit` CTA after the current commit gate is approved and local commit readiness is green, and that CTA reuses the existing local commit route before landing on `Artifacts`
- `Execution` now also exposes one bounded `Prepare Release Package` CTA after the latest successful local commit bundle is ready, and that CTA reuses the existing release-package route while stopping at the existing release approval gate
- `Execution` now also exposes one explicit `Approve Current Release Gate` CTA after the current release package opens a pending release approval, and that CTA reuses the existing inbox approval action before handing close-out back to the same primary shell
- `Execution` now also exposes one bounded `Resume Approved Close Out` CTA after the current approved release bundle is ready, and that CTA reuses the existing close-out route before landing on `Artifacts`
- `Mission` now also derives completion summary from linked task `Done` plus the saved close-out bundle, so the primary shell can explain the current completion state and next-safe follow-up without changing runtime mission semantics
- `Mission` now also exposes one bounded `Prepare Next Mission` entry after completion, and that entry only seeds the next mission draft from current constraints without starting new execution or changing the current mission record
- `Mission` list now frames active rows and completed rows separately, and completed rows show sealed close-out provenance plus next-cycle readiness directly in the list without adding new runtime state
- `Mission` now also previews the latest council recommendation, selected plan, and alignment state directly in both the mission row and mission detail without duplicating council runtime state or adding new actions
- `Mission` now also previews the linked task's latest execution stage, current gate, and blocked reason directly in both the mission row and mission detail while reusing existing run, approval, inbox, and task flag state
- `Mission` now also previews the latest artifact package, review state, and approval state directly in both the mission row and mission detail while reusing existing artifact, review, and approval state
- `Mission` now also derives one compact current best next-step framing from existing council, execution, deliverables, and completion previews without adding new mutation routes or runtime state
- active `Mission` detail now trims preview density by collapsing council, execution, deliverables, and next-step context into one compact `Mission Snapshot` strip while keeping completion, council action, and advanced-ops escape hatches separate
- compact `Mission Snapshot` now labels each preview with its owning primary surface and explicit handoff copy, so the operator can see whether to stay on `Mission` or jump to `Council / Execution / Deliverables` without adding new controls
- `Mission` list row now trims active/completed token and copy density down to one compact summary line plus one next-owner line, so rows can be scanned faster without changing any runtime or execution semantics
- selected `Mission` detail now tightens helper copy and empty-state copy so the default surface reads more like a product shell and less like an ops manual, without changing structure or semantics
- selected `Mission` detail now also trims token density down to the minimum provenance needed for current status, active snapshot, completion, and council scanning, without adding new runtime fields or controls
- selected `Mission` detail now also rebalances section order so current mission state appears before lower-priority context and escape-hatch sections, without changing routes or semantics
- selected `Mission` detail now also groups primary actions into one `Mission Actions` strip and leaves `Advanced Ops` as a secondary escape hatch, without changing any underlying routes or action semantics
- selected `Mission` detail now also trims duplicated `Mission Actions` guidance from nearby summary strips, so the same action explanation is only stated once without changing any behavior
- selected `Mission` detail now also tightens the remaining surface helper wording so panel, snapshot, action, and advanced-ops copy read shorter and more consistently without changing any controls or semantics
- `Mission` now also tightens no-project and no-selected-mission empty-state wording so first entry and empty selection states read shorter and more consistently without changing any controls or semantics
- `Deliverables` stays summary-only and points the operator back to `Execution` when the current approval CTA is available
- `Deliverables` also points the operator back to `Execution` when the current live mutation CTA is available
- `Deliverables` also points the operator back to `Execution` when the current reviewer CTA is available
- `Deliverables` also points the operator back to `Execution` when the current commit-package CTA is available
- `Deliverables` also points the operator back to `Execution` when the current commit approval CTA is available
- `Deliverables` also points the operator back to `Execution` when the current local commit CTA is available
- `Deliverables` also points the operator back to `Execution` when the current release-package CTA is available
- `Deliverables` also points the operator back to `Execution` when the current release approval CTA is available
- `Deliverables` also points the operator back to `Execution` when the current close-out CTA is available
- `Deliverables` now also surfaces the current mission completion state, source close-out bundle, and bounded next-safe follow-up after close-out is saved
- `Deliverables` now also points the operator back to `Mission` when the next-cycle entry is the safest follow-up after completion
- the shell header and nav now frame `Mission / Council / Execution / Deliverables` as the default path and label `Taskboard / Logs / Artifacts / Decision Inbox` as `Advanced Ops Mode`
- first-run project registration and project selection now start on `Mission`, while provider/worktree/detail controls stay in `Advanced Ops Mode`
- mission creation now drafts council immediately and lands the user on the visible `Council` path without starting execution
- council approval handoff copy now points the user to `Execution`, where the current approval id, target artifact, inbox item, and next operator step are summarized
- one mission still maps to one linked task only
- `Open Advanced Ops Mode` drops into the existing `Taskboard` shell
- current builder, reviewer, commit, release, and close-out semantics stay unchanged

## Immediate Next Step
이 문서 기준 추가 primary-shell blocker는 없다.

그 범위는 아래로 제한한다.

- post-v1 default product baseline은 이미 frozen 상태로 유지한다
- 이후 follow-up은 기존 non-blocking housekeeping backlog로 되돌린다
- optional real-live/provider evidence cleanup이나 non-blocking polish만 다루고, primary shell의 mutation/runtime/execution semantics는 바꾸지 않는다
- source of truth는 계속 `project / task / run / artifact / review / approval`이며 `Mission / Council Session / selectedMissionId`만 상위 index로 유지한다
- current `Mission / Council / Execution / Deliverables` baseline은 completion target으로 유지하고 더 이상 blocker scope를 넓히지 않는다
- `Advanced Ops Mode`는 계속 secondary deep-control path로 유지한다

## Latest Slice
- `pivot-postcompletion-housekeeping-m6-50` is now implemented on current `main`: the post-v1 default product baseline remains frozen, and any remaining follow-up is now explicitly pushed back into the existing non-blocking housekeeping backlog instead of reopening new primary-shell baseline slices; `node scripts/smoke-ui-slice-60.mjs` closes that boundary by verifying docs/todo freeze language, unchanged default surfaces, unchanged `Advanced Ops Mode` fallback, and unchanged active execution-gate runtime truth

## Pivot Completion Baseline
- `Mission` is the default entry surface and the first product question is the bounded goal, not task-level ops control
- creating a mission drafts `Council` immediately so visible role discussion starts without a second handoff
- `Council` keeps `Conductor / Strategist / Architect / Decomposer` visible, surfaces recommendation plus alignment state, and stops on one explicit approval checkpoint
- approving the recommendation reuses the current engine and auto-advances only through `planner -> architect -> task-breaker -> builder preflight`
- `Execution` owns the current gate, next operator step, and bounded downstream CTA chain by reusing the existing runtime routes
- `Deliverables` stays summary-only for artifact, review, approval, and completion state and routes the operator back to `Execution` or `Mission` when action is needed
- completion is still derived from linked task `Done` plus saved close-out provenance, and `Prepare Next Mission` remains the bounded next-cycle entry
- `Advanced Ops Mode` keeps the current `Taskboard / Logs / Artifacts / Decision Inbox` shell as the secondary deep-control path instead of the default product entry
- this baseline is now the completion target for the post-v1 orchestration shell, not an intermediate waypoint before a second default surface rewrite

## Post-Completion Housekeeping
- optional real-live/provider evidence cleanup remains available, but only as non-blocking operational follow-up
- non-blocking polish may continue only when it does not change default product surfaces, runtime objects, or execution semantics
- second-provider, team/cloud/workspace expansion, and new default-surface rewrites remain outside this completed baseline
- future follow-up should return to the existing backlog ordering in `tasks/todo.md` and `docs/03_architecture-roadmap-v1.md` instead of reopening new `m6` baseline blockers

reviewer, commit, release, and close-out semantics는 계속 현재 v1을 그대로 따른다.
