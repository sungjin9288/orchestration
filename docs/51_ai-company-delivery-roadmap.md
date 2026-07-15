# AI Company Delivery Roadmap

## Purpose

이 문서는 current deterministic company shell에서 실제 multi-agent AI Company runtime까지의
구현 순서, authority gate, acceptance evidence, rollback을 단계별로 정의한다.

Roadmap 항목은 planned work다. `DEC-076`은 문서화를 승인했으며 아래 runtime implementation을
일괄 승인하지 않는다.

## Delivery Strategy

- Vertical slice는 사용자-visible Mission 흐름과 runtime evidence를 함께 전진시킨다.
- 한 phase는 source contract, runtime, API, UI, focused smoke, aggregate registration을 함께
  닫는다.
- Local stub synthetic gate가 항상 먼저다.
- Live provider는 별도 opt-in evidence이며 synthetic gate를 대체하지 않는다.
- 기존 v1 execution chain과 Advanced Ops authority를 교체하지 않고 앞뒤로 연결한다.
- 각 phase는 rollback 또는 compatibility posture를 갖는다.

## Phase 0: Source-Of-Truth Foundation

### Objective

AI Company의 source policy와 planned runtime boundary를 repo files에 고정한다.

### Deliverables

- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `DEC-076`
- focused documentation smoke와 aggregate 등록

### Exit Evidence

- 네 문서가 current truth와 future target을 구분한다.
- runtime implementation, provider calls, memory persistence가 blocked로 명시된다.
- Focused smoke와 aggregate verification이 통과한다.
- 문서화 commit이 remote에 push된다.

### Rollback

문서와 verifier registration을 함께 revert한다. Runtime state 영향은 없어야 한다.

## Phase 1: Runtime Company Blueprint

### Objective

Browser-only company member 설정과 분리된 source-backed runtime roster를 만든다.

### Planned Files

- `company/blueprint.json`
- `company/roles/*.md`
- `src/runtime/company-blueprint.js`
- `src/runtime/runtime-service.js`
- `scripts/serve-ui-slice-01.mjs`
- `scripts/smoke-ai-company-runtime-blueprint.mjs`
- `scripts/verification_status.mjs`

### Contract

- Blueprint를 strict validation으로 load한다.
- Runtime snapshot은 stable agent identity와 source refs를 노출한다.
- UI local storage는 display preference만 소유하며 authority를 변경하지 않는다.
- Missing/invalid blueprint는 AI Company execution을 fail closed한다.

### Exit Evidence

- Reload 후 같은 agent ids가 유지된다.
- Unknown role/tool/authority가 거부된다.
- Existing Mission/Task runtime smoke가 회귀하지 않는다.
- Persisted state는 schema v6로 유지되고 company policy가 state에 저장되지 않는다.
- Optional runtime injection과 additive API snapshot compatibility smoke가 통과한다.

### Rollback

AI Company entrypoint를 disable하고 기존 deterministic Council과 execution baseline을 보존한다.

### Authority Gate

Planning-only decision은 `DEC-077`로 기록됐고 implementation plan은
`docs/52_ai-company-runtime-blueprint-implementation-plan.md`에 있다. Fielded implementation
decision은 `DEC-079`로 승인됐고 Phase 1 focused smoke가 current implementation evidence를
검증한다. 이 승인은 Phase 2 또는 다른 downstream authority를 열지 않는다.

## Phase 2: Real Council For One Mission

### Objective

첫 end-to-end multi-agent capability로 independent positions, synthesis, human alignment를
구현한다.

### Implemented Files

- `src/runtime/council-sessions.js`
- `src/execution/council-coordinator.js`
- `src/execution/providers/council-local-stub-adapter.js`
- `src/runtime/runtime-service.js`
- `scripts/serve-ui-slice-01.mjs`
- `ui/council-signals.js`
- `ui/app.js`
- `scripts/smoke-ai-company-real-council.mjs`
- `scripts/smoke-ui-slice-651.mjs`
- `scripts/verification_status.mjs`

### Runtime Sequence

```text
Mission
-> StaffingPlan(council)
-> Strategist/Architect/Decomposer positions
-> conflict check
-> Conductor synthesis
-> awaiting alignment
-> approve | request revision | stop
```

### Exit Evidence

- 각 role이 별도 run/position evidence를 남긴다.
- Required role failure, conflict, revision, stop path가 검증된다.
- Approval 전 linked task와 mutation이 시작되지 않는다.
- Approve 후 기존 chain이 builder preflight approval 대기까지 연결된다.
- Council UI가 runtime snapshot에서 evidence와 dissent를 표시한다.

### Rollback

Real Council feature flag/entrypoint를 disable하고 새 incomplete sessions를 quarantine한다.
Mission source evidence와 기존 task/run/artifact records는 보존한다.

### Authority Gate

Planning-only decision은 `DEC-080`, implementation handoff는 `DEC-081`, complete fielded
implementation outcome은 `DEC-082`로 기록됐다. Local-stub Real Council은 exact target,
compatibility, rollback, focused runtime/API/UI smoke 안에서 구현됐고, live provider role 확장은
별도 Phase 3 decision으로 유지한다.

## Phase 3: Council Live Provider Opt-In

### Objective

검증된 local stub Council contract를 기존 provider adapter boundary에서 live opt-in으로 실행한다.

### Deliverables

- Council role allowlist와 structured output schema
- Role-specific prompt contract
- timeout/retry/cancellation/usage evidence
- secret redaction과 malformed-output failure smoke
- optional real-live verification note

### Exit Evidence

- Local stub synthetic gate가 계속 authoritative하다.
- Live role output이 같은 normalized schema를 만족한다.
- Retryable failure만 retry하고 authority/schema failure는 즉시 멈춘다.
- API key가 없으면 skipped/not-configured로 정확히 기록한다.

### Rollback

Live Council provider mode를 disable하고 local stub mode로 되돌린다. Live output history는
quarantine 또는 evidence-only로 보존한다.

### Authority Gate

Planning-only authority는 `DEC-083`, implementation decision handoff는 `DEC-084`, complete fielded
implementation outcome은 `DEC-085`로 기록됐다. One-provider/four-role allowlist, normalized schema
parity, sequential call budget, retry/timeout/cancellation, redaction, optional live verification,
local-stub compatibility, rollback이 구현·검증됐다. Provider expansion과 Phase 4 이후 authority는
별도 complete fielded decision 전까지 blocked다.

## Phase 4: Mission Compiler And WorkOrders

### Objective

Approved Council synthesis를 decision-complete ExecutionPlan과 WorkOrder graph로 compile한다.

### Deliverables

- `ExecutionPlan`, `WorkOrder`, `HandoffPacket` runtime objects
- dependency/collision validation
- solo/council/parallel Staffing mode
- WorkOrder preview와 approval boundary UI
- plan compiler focused smoke

### Exit Evidence

- Builder에게 해석이 필요한 architecture decision이 남지 않는다.
- Target path allowlist와 acceptance/verification가 required field다.
- Dependency cycle과 parallel write collision이 fail closed한다.
- WorkOrder creation이 mutation/commit/push authority를 열지 않는다.

### Rollback

Compiler entrypoint를 disable하고 draft plan/workorders를 quarantine한다. Council alignment
evidence를 보존하며 기존 linked-task path를 compatibility fallback으로 유지한다.

### Authority Gate

Planning-only authority는 `DEC-086`, implementation decision handoff는 `DEC-087`, exact
response-only implementation은 `DEC-088`로 기록됐다. Implemented slice는 approved source-current
Council, exact operator compile spec, fixed Builder -> Reviewer -> QA graph, dependency/cycle/collision
validation, schema v6와 default auto-chain compatibility를 유지한다. Durable plan/WorkOrder
persistence, approval, scheduling, execution은 별도 fielded decision 전까지 blocked다.

Accepted `DEC-088` target provenance:

```text
targetAuthority=one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path from one operator-approved source-current Real Council synthesis
```

## Phase 5: Team Execution And Supervision

### Objective

WorkOrder를 specialist에게 배정하고 안전한 경우 병렬 실행하며 Ops가 진행과 실패를 감시한다.

### Deliverables

- WorkOrder scheduler/coordinator
- immutable target collision detector
- concurrency and budget enforcement
- cancellation and retry controls
- Execution surface team status/progress
- partial-failure smokes

### Exit Evidence

- Dependency-ready WorkOrder만 실행된다.
- Mutable target collision이 있는 작업은 serialize된다.
- 성공 cell은 재개 시 재사용되고 실패 cell만 retry된다.
- Budget/timeout/cancel terminal reason이 logs와 UI에 일치한다.
- Builder mutation은 기존 preflight-targeted approval을 계속 요구한다.

### Rollback

Parallel scheduling을 disable하고 sequential compatibility mode로 전환한다. Active work를 새로
dispatch하지 않고 checkpoint에서 정지한다.

### Authority Gate

Planning-only authority는 `DEC-089`, implementation decision handoff는 `DEC-090`, exact
implementation은 `DEC-091`로 기록됐다.
첫 implementation target은 general scheduler가 아니라 additive schema v7 records, exact
preview/source digest에 묶인 one task-owned approval, separate start, local-stub-only first Builder
dispatch다. 기존 planner -> architect -> task-breaker -> builder-preflight chain을 재사용하고 targeted
live-mutation approval에서 멈춘다. Reviewer/QA와 downstream authority는 계속 blocked다.

Accepted `DEC-089` planning provenance:

```text
targetAuthority=planning only for durable WorkOrder persistence, approval, and sequential execution through existing gates
```

Required implementation decision target:

```text
targetAuthority=one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path with one digest-bound operator approval and one sequential Builder dispatch stopping at the existing live-mutation approval gate
```

## Phase 6: Reviewer, QA, And Delivery Package

### Objective

제작 결과를 독립 검토하고 operator가 한 곳에서 결과와 위험을 판단할 수 있는 DeliveryPackage를
만든다.

### Deliverables

- QA role contract와 verification evidence schema
- DeliveryPackage composer
- Reviewer/QA disagreement handling
- Deliverables surface package view
- done-gate integration smoke

### Exit Evidence

- Reviewer verdict와 QA evidence가 서로 다른 refs로 남는다.
- Missing artifact/provenance/required check가 fail closed한다.
- Changes requested가 새 WorkOrder attempt로 돌아간다.
- Done은 passed review, required QA, resolved gates, complete artifacts 없이는 불가능하다.
- Commit/release는 기존 별도 approval과 linked-worktree rule을 유지한다.

### Rollback

DeliveryPackage composition을 disable하고 기존 artifacts/review/close-out surfaces를 유지한다.
새 package record는 evidence-preserving quarantine 대상으로 둔다.

### Authority Gate

`DeliveryPackage and QA completion gate implementation` 별도 승인이 필요하다.

## Phase 7: Checkpoint, Resume, And Recovery

### Objective

Process restart, provider interruption, partial parallel failure 이후에도 inspectable하게 재개한다.

### Deliverables

- Checkpoint schema와 migration
- resume/stale/cancel API
- digest validation
- retry attempt history
- recovery UI와 focused restart smoke

### Exit Evidence

- Restart 후 latest safe checkpoint를 읽는다.
- Input/policy digest mismatch는 stale로 멈춘다.
- Completed unit을 중복 provider call하지 않는다.
- Cancellation, quarantine, rollback evidence가 삭제되지 않는다.
- Corrupt/incomplete checkpoint가 기존 runtime baseline을 손상시키지 않는다.

### Rollback

Resume entrypoint를 disable하고 active AI Company workflow를 operator decision으로 정지한다.
기존 task/run/artifact state는 보존한다.

### Authority Gate

`durable AI Company checkpoint and resume implementation` 별도 승인이 필요하다.

## Phase 8: Reviewed Organizational Learning

### Objective

완료된 Mission의 반복 가능한 lesson을 검토 가능한 LearningCandidate로 만든다.

### Deliverables

- retrospective evaluator
- LearningCandidate schema
- redaction/applicability/expiry/reviewer gate
- duplicate/conflict detection
- read-only candidate UI

### Exit Evidence

- Raw transcript와 secret가 candidate에 들어가지 않는다.
- Negative evidence와 applicability가 필수다.
- Candidate가 자동 memory/skill로 승격되지 않는다.
- Reject/expire/quarantine가 검증된다.

### Rollback

Candidate generation을 disable하고 candidate를 quarantine한다. Source Mission evidence를
변경하지 않는다.

### Authority Gate

Read-only candidate generation, memory persistence, skill promotion은 각각 별도 승인이다.

## Phase 9: Dogfood And Productization

### Objective

실제 local project를 Mission intake부터 DeliveryPackage까지 수행하고 제품 claim을 검증한다.

### Required Scenarios

- simple Mission이 `solo`로 처리되는 경로
- architecture trade-off가 있는 Mission의 Council 경로
- 독립 research/QA의 bounded parallel 경로
- provider timeout과 partial retry
- revision과 operator stop
- builder mutation approval
- reviewer changes requested 후 재작업
- accepted DeliveryPackage와 close-out
- restart/resume

### Exit Evidence

- 각 scenario가 source-backed fixture 또는 isolated project에서 재현된다.
- Synthetic aggregate가 통과한다.
- Optional live-provider 결과가 pass/fail/skipped로 기록된다.
- README의 Features, Architecture, Testing, Scope & Limitations가 실제 증거와 일치한다.
- 사용자가 해야 할 setup과 승인 action이 runbook에 명확하다.

### Rollback

Product claim을 이전 검증 범위로 되돌리고 incomplete capability를 README에서 제거하거나 planned로
표시한다. Runtime records와 evidence는 보존한다.

## Cross-Phase Verification Matrix

| Evidence layer | Required proof |
| --- | --- |
| Source contract | docs/decision/role files and source smoke |
| Runtime | state normalization, reload, transition, stale/invalid rejection |
| Execution | local stub happy/failure paths, budget, cancellation, provenance |
| API | status code, compatibility, idempotency/conflict behavior |
| UI | real snapshot rendering, no hidden authority, responsive browser proof |
| Security | tool/path allowlist, secret absence, untrusted content, approval targeting |
| Recovery | checkpoint/restart/resume/quarantine/rollback |
| Product | Mission-to-Delivery dogfood and honest README |

## Implementation Decision Template

각 phase를 열 때 최소 다음 필드를 제공한다.

```text
decisionId=
decisionStatus=approve-implementation-slice
targetAuthority=
targetSurface=
sourceEvidenceRefs=
negativeEvidenceRefs=
implementationPlanRefs=
rollbackRefs=
focusedSmokeRefs=
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=
approvalStatement=
```

`continue`, `do everything`, `approve all` 같은 shortcut은 implementation authority가 아니다.

## Immediate Next Decision

Phase 5 planning과 implementation handoff는 `DEC-089`, `DEC-090`, exact implementation은
`DEC-091`로 accepted됐다. 다음 architecture-sensitive decision은 현재 blocked authority 중
하나를 complete fielded shape로 별도 승인해야 한다.

```text
targetAuthority=one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path with one digest-bound operator approval and one sequential Builder dispatch stopping at the existing live-mutation approval gate
```

Any Phase 5 implementation must preserve the `DEC-088` response-only baseline, migrate valid schema
v6 state additively, bind approval to exact plan provenance, use only the existing local-stub gates,
stop before live mutation, preserve rollback evidence, and keep still-blocked authority explicit.
Schema migration, durable record persistence, approval creation, and one Builder preflight dispatch는
구현됐다. Mutation, Reviewer/QA execution, parallel scheduling, provider-backed WorkOrders, memory
expansion, commit, push, release, and external connectors remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-master-plan.mjs
node scripts/smoke-ai-company-council-live-provider-planning.mjs
node scripts/smoke-ai-company-council-live-provider.mjs
node scripts/smoke-ui-slice-652.mjs
node scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs
node scripts/smoke-ai-company-mission-workorder-compiler.mjs
node scripts/smoke-ui-slice-653.mjs
node scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs
node scripts/smoke-ai-company-workorder-persistence-execution.mjs
node scripts/smoke-ui-slice-654.mjs
node scripts/verification_status.mjs
```

Phase 0 verifier와 focused smokes는 implemented Phase 1-5 evidence, schema v7 migration, durable
approval binding, Builder live-mutation stop gate를 확인한다.
