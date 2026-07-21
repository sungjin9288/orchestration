# Council Operating Protocol

## Purpose

이 문서는 하나의 Mission을 여러 역할이 독립 검토하고, 이견을 보존하고, Conductor가 실행
가능한 결론으로 합성하고, 운영자가 방향을 승인하는 Council protocol을 정의한다.

Council은 group chat이나 역할극이 아니다. 같은 evidence packet에 대한 bounded independent
review와 explicit synthesis workflow다.

현재 runtime은 legacy deterministic Council transcript를 compatibility path로 유지하면서,
`DEC-082`가 승인한 opt-in `mode=real-local-stub` path와 `DEC-085`의 explicit
`mode=real-openai-responses` path에서 독립 role position, conflict summary, Conductor synthesis,
human alignment evidence를 기록한다. Provider mode는 readiness를 통과한 operator opt-in이며
local-stub fallback이나 role tool authority가 아니다.

## Council Entry Criteria

Council은 다음 조건을 모두 만족할 때만 시작한다.

- active project와 valid `project_path`가 있다.
- Mission goal과 constraints가 기록돼 있다.
- StaffingPlan mode가 `council`이다.
- 필수 역할과 role contracts를 source-backed blueprint에서 resolve했다.
- provider mode, call budget, turn limit, deadline이 정해져 있다.
- Council은 source mutation, commit, push authority를 갖지 않는다는 경계가 적용됐다.
- 동일 Mission에 active Council attempt가 중복되지 않는다.

조건이 없으면 Council을 흉내 낸 transcript를 만들지 않고 entry failure와 필요한 human action을
기록한다.

## Required Roles

### Conductor

- Agenda와 input packet을 고정한다.
- 역할 실행 순서, parallel group, budget, termination을 관리한다.
- Position을 수정하지 않고 synthesis에서 채택/보류/반대 근거를 연결한다.
- Final recommendation과 unresolved questions를 작성한다.
- Alignment decision을 대신하지 않는다.

### Strategist

- Desired outcome, audience, priority, success condition, non-goal을 검토한다.
- 범위가 목표에 비해 넓거나 잘못 정의됐는지 지적한다.

### Architect

- Current architecture, policy, dependency, reversibility, blast radius를 검토한다.
- Builder에게 넘길 수 없는 architecture decision을 objection으로 기록한다.

### Decomposer

- 결론 후보가 decision-complete WorkOrder로 분해 가능한지 검토한다.
- Dependency, checkpoint, expected artifact, stop condition 누락을 지적한다.

### Optional Roles

- `Researcher`: 외부 또는 local evidence가 부족할 때만 배정한다.
- `Reviewer`: Council output contract의 독립 검토가 필요한 고위험 Mission에 배정한다.
- `QA`: acceptance와 failure scenario 설계가 결론 품질에 직접 영향을 줄 때 배정한다.
- `Ops`: 긴 실행, 높은 provider usage, resume/recovery 계획이 필요한 경우 배정한다.

Optional role은 장식용 참석자가 아니다. `requiredCapabilities`와 selection rationale이 없으면
배정하지 않는다.

## Agenda Packet

모든 Council role은 같은 immutable agenda packet에서 시작한다.

```text
CouncilAgenda
- missionId
- projectId / projectPathRef
- goal
- constraints[]
- deliverableIntent
- sourceOfTruthRefs[]
- knownEvidenceRefs[]
- knownNegativeEvidence[]
- decisionsAlreadyAccepted[]
- decisionsStillOpen[]
- requestedCouncilQuestions[]
- authorityBoundary
- budget / terminationPolicy
- sourceDigest
```

역할별 instruction은 다르지만 Mission facts를 role마다 다르게 재작성하지 않는다.

## Meeting Phases

### Phase 1: Intake Validation

Conductor가 entry criteria, source refs, stale state, active attempt, authority boundary를 검사한다.

Output:

- accepted agenda 또는 fail-closed entry result
- participant list
- budget와 termination policy
- first checkpoint

### Phase 2: Independent Positions

Strategist, Architect, Decomposer와 선택된 optional role이 agenda를 독립 검토한다. 독립 검토가
끝나기 전에는 다른 role의 position content를 전달하지 않는다.

Required position output:

```text
- recommendation
- assumptions[]
- evidenceRefs[]
- objections[]
- risks[]
- confidence
- proposedNextStep
```

Position이 schema를 통과하지 못하면 completed로 계산하지 않는다.

### Phase 3: Evidence And Conflict Check

Deterministic coordinator가 다음을 계산한다.

- evidence 없는 recommendation
- 서로 충돌하는 constraints 또는 next step
- 공통 assumptions
- unique objections
- stale/missing refs
- required role failure

이 단계는 LLM synthesis 전에 conflict를 숨기지 않도록 만든다.

### Phase 4: Conductor Synthesis

Conductor는 raw transcript가 아니라 validated positions와 conflict summary를 입력으로 받는다.

Required synthesis output:

```text
- missionInterpretation
- adoptedRecommendation
- adoptedPositionRefs[]
- rejectedAlternatives[]
- dissentRefs[]
- unresolvedQuestions[]
- proposedExecutionBoundary
- proposedAcceptanceCriteria[]
- humanDecisionRequired
```

Conductor는 dissent를 삭제하거나 confidence를 근거 없이 올릴 수 없다.

### Phase 5: Alignment Review

Runtime은 operator에게 다음을 한 화면에서 보여준다.

- 참석 역할과 각 role status
- 핵심 recommendation과 evidence refs
- objections, risks, confidence
- Conductor synthesis
- unresolved questions와 dissent
- 승인 시 열리는 다음 행동
- 승인해도 계속 닫혀 있는 authority

Operator action:

- `approve`: 현재 synthesis를 실행 plan 후보로 넘긴다.
- `request-revision`: revision note와 target roles를 지정해 새 attempt를 만든다.
- `stop`: Mission Council path를 명시적으로 종료한다.

### Phase 6: Handoff

`approve`일 때만 normalized `HandoffPacket`과 draft ExecutionPlan을 만든다. 기존 linked task와
execution auto-chain 연결은 implementation slice에서 compatibility를 증명해야 한다.

Council approval 이후에도 다음은 자동으로 열리지 않는다.

- builder source mutation
- commit
- push
- release
- memory persistence
- skill promotion
- unattended follow-up

## Termination Policy

Council은 최소한 다음 limit를 갖는다.

- required roles 목록
- role별 max turns
- 전체 max provider calls
- deadline/timeout
- revision attempt cap
- cancellation signal

Terminal reasons:

```text
approved
revision-requested
operator-stopped
required-role-failed
budget-exhausted
deadline-exceeded
invalid-output
stale-input
cancelled
```

Limit 값의 runtime default는 implementation decision에서 실제 provider behavior와 smoke를 근거로
정한다. 이 문서는 검증되지 않은 숫자를 제품 사실로 선언하지 않는다.

## Quorum And Required Role Rule

초기 development pack Council은 Strategist, Architect, Decomposer를 required role로 계획한다.
Required role 하나라도 terminal failure이면 자동 synthesis approval-ready 상태로 가지 않는다.

향후 quorum 정책이 필요해도 역할 수만 세어 통과시키지 않는다. Required capability와 evidence
coverage를 만족해야 한다.

## Revision Protocol

- Revision은 기존 positions를 overwrite하지 않는다.
- Operator note, target role ids, source changes를 새 attempt에 기록한다.
- 변경되지 않은 valid position은 digest가 같을 때만 reuse할 수 있다.
- Source digest가 바뀌면 affected role은 다시 실행한다.
- Revision attempt cap에 도달하면 human decision으로 멈춘다.

## Failure Handling

| Failure | Council behavior | Authority behavior |
| --- | --- | --- |
| 한 role timeout | 해당 position failed, checkpoint 기록 | retry 또는 stop만 허용 |
| provider unavailable | local evidence와 failure 표시 | live 실행을 local stub 성공으로 위장하지 않음 |
| malformed schema | position reject | synthesis 입력에서 제외 |
| evidence ref missing | objection/open question 생성 | approval-ready 금지 가능 |
| conflicting recommendations | dissent refs 보존 | operator decision 필요 |
| budget exhausted | Council stopped | 추가 budget 승인 전 resume 금지 |
| operator cancel | cancelled evidence 기록 | downstream action 없음 |
| stale source digest | attempt stale | 새 attempt 필요 |

## UI Contract

Council UI는 messenger thread가 아니라 scan 가능한 meeting board로 유지한다.

필수 영역:

- Agenda and current phase
- Participant status rail
- Role position summaries
- Evidence and objection register
- Conductor synthesis
- Open questions and dissent
- Alignment action shelf
- Provenance and next-authority boundary

Raw chain-of-thought, typing simulation, decorative chatter, role ranking은 표시하지 않는다.

## API Compatibility Intent

현재 route:

```text
POST /api/missions/:missionId/draft-council
POST /api/missions/:missionId/approve-council
```

계획된 real Council route:

```text
POST /api/missions/:missionId/council/start
POST /api/council-sessions/:sessionId/resume
POST /api/council-sessions/:sessionId/decision
```

첫 implementation은 기존 route를 즉시 제거하지 않는다. Compatibility wrapper가 deterministic
draft를 만들지 real Council을 시작할지 명시하고, API smoke와 UI smoke가 같은 의미를 검증해야
한다.

## Acceptance Scenarios

Focused implementation smoke는 최소 다음을 증명해야 한다.

1. Local stub happy path에서 세 독립 position과 하나의 synthesis가 생긴다.
2. Position refs와 synthesis refs가 Mission/Council provenance로 연결된다.
3. Required role failure가 approval-ready로 진행하지 않는다.
4. Conflicting positions가 dissent로 노출된다.
5. Revision이 새 attempt를 만들고 history를 보존한다.
6. Stop이 linked task와 provider follow-up을 만들지 않는다.
7. Approve가 기존 execution chain을 preflight/approval boundary까지만 연결한다.
8. Approval 전 source mutation, commit, push가 불가능하다.
9. Reload 후 checkpoint와 alignment 상태가 보존된다.
10. UI가 status, evidence, dissent, next authority를 실제 snapshot에서 렌더한다.

## Implementation Boundary

이 protocol의 첫 local-stub vertical slice planning은 `DEC-080`, implementation handoff는
`DEC-081`, complete fielded implementation outcome은 `DEC-082`로 기록됐다.
`docs/54_ai-company-real-council-implementation-plan.md`의 one Mission, local-stub-only, schema v6,
legacy route preservation, isolated position request, deterministic conflict, Conductor synthesis,
approve/request-revision/stop 범위만 구현됐다. Provider calls와 모든 downstream authority는 blocked다.

Phase 3 planning은 `DEC-083`과 `DEC-084`로 승인·문서화됐고 implementation은 `DEC-085`로
accepted됐다. `real-openai-responses`는 명시적으로 선택하고 readiness를 통과할 때만 열리며,
Strategist/Architect/Decomposer position isolation, deterministic conflict-before-synthesis,
Conductor normalized output, human alignment를 그대로 유지한다. Local-stub synthetic gate는
authoritative하며 provider expansion과 모든 downstream authority는 계속 blocked다.

Phase 4 planning과 handoff는 `DEC-086`, `DEC-087`로 문서화됐고 exact implementation은
`DEC-088`로 accepted됐다. Council approval은 그 자체로 WorkOrder execution authority가 아니다.
`inert-workorder-preview` handoff는 approved and source-current synthesis, empty unresolved questions,
exact operator `compileSpec`을 요구하고 fixed Builder -> Reviewer -> QA draft graph를 response-only로
반환한다. Existing linked-task auto-chain은 explicit mode가 없을 때 compatibility behavior로 유지한다.

Phase 5 계획은 one digest-bound operator approval과 separate start command를 요구하며 `DEC-089`,
`DEC-090`으로 planning/handoff evidence가 기록됐고 implementation은 `DEC-091`로 accepted됐다. Approval은 exact plan, preview, source digest,
control task에 묶이고 local-stub-only first Builder dispatch는 기존 preflight chain을 재사용한 뒤
targeted live-mutation approval에서 멈춘다. 이 authority는 source mutation, Reviewer/QA dispatch,
parallel scheduling, provider-backed WorkOrder execution을 열지 않는다.

Phase 6 reviewed-delivery planning은 `DEC-092`, implementation handoff는 `DEC-093`으로
기록됐고 exact implementation은 `DEC-094`로 accepted됐다. Council alignment와 plan approval만으로
Builder source mutation이나 Reviewer/QA가 열리지 않으며, exact terminal live-mutation approval과
explicit continue를 모두 요구한다. Existing local-stub Builder/Reviewer 뒤 shell-free allowlisted
Node.js syntax QA를 실행하고 response-only DeliveryPackage preview에서 멈춘다. Changes requested는
QA를 열지 않고 plan을 blocked로 남긴다.

Phase 7 recovery planning은 `DEC-095`, implementation handoff는 `DEC-096`, exact implementation은
`DEC-097`로 기록됐다. Council approval이나 prior checkpoint만으로 restart resume이 열리지 않는다.
Resume은 current digest와
authority를 다시 증명한 `reviewer-ready`/`qa-ready` checkpoint plus explicit operator action을 요구한다.
Active or ambiguous Builder/Reviewer/QA는 자동 retry하지 않고 quarantine하며 새 reconciliation
decision 전까지 실행 authority가 없다.

Durable DeliveryPackage persistence planning은 `DEC-098`, implementation handoff는 `DEC-099`, exact
implementation은 `DEC-100`으로 기록됐다. Council alignment, plan approval, Builder approval,
Reviewer pass, QA pass, terminal checkpoint 중 어느 하나도 durable package authority가 아니다.
Current path는 이 evidence를 모두 exact digest로 재검증한 separate operator persist request만 받고
one immutable `review-required` record에서 멈춘다.

DeliveryPackage acceptance planning은 `DEC-101`, implementation handoff는 `DEC-102`로 기록됐다.
Exact implementation은 `DEC-103`으로 accepted됐다. Council 또는 execution evidence만으로
acceptance가 열리지 않으며 current package와 exact digest tuple plus `decision=accept`를 요구하고
append-only evidence에서 멈춘다. Mission/task close-out과 done은 계속 별도 decision이다.

Mission/task close-out planning은 `DEC-104`, complete fielded implementation handoff는 `DEC-105`, exact
implementation은 `DEC-106`으로 기록됐다. Council 합의, plan approval, review pass, QA pass, package
persistence, acceptance 중 어느 하나도 단독 close-out authority가 아니다. Current schema-v11
runtime은 exact accepted tuple, completed WorkOrders, passed linked-task review, recomputed no-active-
gate state를 다시 검증하고 one atomic MissionCloseOut transaction만 허용한다. Standalone close-out,
Git/release, reopen, learning, scheduling/provider/policy, next-Mission, and connector authority는 blocked다.

LearningCandidate preview planning은 `DEC-107`, complete fielded implementation handoff는
`DEC-108`, exact response-only implementation은 `DEC-109`로 기록됐다. Council position, conflict,
synthesis는 retrospective의 허용 source evidence 일부일 뿐이며 단독으로 lesson, applicability,
negative evidence, candidate review, memory, or skill authority를 만들지 않는다. Current path는
exact completed Mission tuple과 operator-owned `retrospectiveSpec`을 요구하고 source-contained
refs만 정규화한다.

Durable LearningCandidate persistence planning은 `DEC-110`, complete fielded implementation
handoff는 `DEC-111`, exact implementation은 `DEC-112`로 기록됐다. Persistence는 Council
evidence를 새로 생성하거나 재해석하지 않고 exact DEC-109 preview recomputation의 existing
source ref로만 schema-v12 immutable record에 보존한다. Candidate review, provider generation,
raw evidence ingestion, memory/skill promotion, source/Git/release, scheduling, next-Mission, policy,
bypass, and connectors remain blocked.

LearningCandidate review outcome planning은 `DEC-113`, complete fielded implementation handoff는
`DEC-114`, exact implementation은 `DEC-115`로 기록됐다. Council evidence는 review rationale이나 outcome을 생성하지 않으며
candidate의 existing sourceEvidenceRefs 중 operator가 명시적으로 선택할 수 있는 evidence
domain일 뿐이다. Review event는 append-only operator evidence이며 candidate mutation, memory/skill,
provider, source/Git/release, scheduling, next-Mission, policy, bypass, and connectors는 blocked다.

MemoryCandidate preview planning은 `DEC-116`, complete fielded implementation handoff는
`DEC-117`, exact response-only implementation은 `DEC-118`로 기록됐다. Council evidence는 memory
summary, scope, applicability, redaction, expiry, or promotion decision을 생성하지 않는다.
Accepted LearningCandidateReview는 operator-owned memorySpec이 검증될 수 있는 source ref일
뿐이며 runtime은 response/browser-memory `review-ready` preview에서 멈춘다. Durable memory,
cross-workspace retrieval, skill promotion, provider, source/Git/release, scheduling, next-Mission,
policy, bypass, and connectors는 blocked다.

Durable MemoryItem persistence planning은 `DEC-119`, complete fielded implementation handoff는
`DEC-120`, exact implementation은 `DEC-121`로 기록됐다. Council output은 storage approval을
생성하지 않으며 source-contained evidence ref로만 보존된다. Schema-v14 path도 exact DEC-118
recomputation과 별도 operator storage approval을 요구하고 `status=stored`에서 멈춘다.
Recommendation retrieval/application, export/delete/refresh, skill, provider, source/Git/release,
scheduling, next-Mission, policy, bypass, and connectors는 blocked다.

MemoryRecall preview planning은 `DEC-122`, complete fielded implementation handoff는 `DEC-123`,
exact response-only implementation은 `DEC-124`로 기록됐다. Council은 recall item을 선택하거나
relevance를 score/rank/recommend하지 않는다. Runtime은 operator-selected exact item과 project-local
recallSpec의 response/browser-memory review에서 멈추며 Council/Mission/Execution context injection이나
application authority를 만들지 않는다. DEC-124의 response-only behavior와 Council behavior는
schema-v15 migration 이후에도 unchanged다.

Durable MemoryRecall persistence planning은 `DEC-125`, complete fielded implementation handoff는
`DEC-126`, exact implementation은 `DEC-127`로 기록됐다. Durable record는 Council output이나
selection이 아니라 operator-selected exact item, current DEC-124 recomputation, and separate record
approval만 source로 삼는다. Council은 record approval을 생성하지 않으며 recall list/history,
relevance scoring, recommendation, context injection, or application authority를 얻지 않는다.

Mission memory context preview planning은 `DEC-128`, complete fielded implementation handoff는
`DEC-129`로 기록됐다. Council은 recorded recall이나 target Mission을 자동 선택하거나 relevance를
score/rank/recommend하지 않는다. Planned preview는 operator-selected exact recall과 exact
same-project draft Mission을 response/browser-memory에서 함께 검토할 뿐이며, Council agenda,
position prompt, synthesis, Mission, WorkOrder, policy를 변경하거나 memory application authority를
만들지 않는다. Runtime/API/UI implementation은 별도 complete fielded decision 전까지 blocked다.

## Verification

```bash
node scripts/smoke-ai-company-master-plan.mjs
node scripts/smoke-ai-company-real-council-planning.mjs
node scripts/smoke-ai-company-real-council.mjs
node scripts/smoke-ui-slice-651.mjs
node scripts/smoke-ai-company-council-live-provider-planning.mjs
node scripts/smoke-ai-company-council-live-provider.mjs
node scripts/smoke-ui-slice-652.mjs
node scripts/smoke-ai-company-mission-workorder-compiler-planning.mjs
node scripts/smoke-ai-company-mission-workorder-compiler.mjs
node scripts/smoke-ui-slice-653.mjs
node scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs
node scripts/smoke-ai-company-reviewed-delivery-planning.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ui-slice-656.mjs
node scripts/smoke-ai-company-durable-delivery-package-planning.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/smoke-ai-company-mission-task-close-out-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs
node scripts/smoke-ai-company-learning-candidate-preview.mjs
node scripts/smoke-ui-slice-660.mjs
node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs
node scripts/smoke-ai-company-durable-learning-candidate.mjs
node scripts/smoke-ui-slice-661.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs
node scripts/smoke-ai-company-memory-candidate-preview.mjs
node scripts/smoke-ui-slice-663.mjs
node scripts/smoke-ai-company-durable-memory-item-planning.mjs
node scripts/smoke-ai-company-durable-memory-item.mjs
node scripts/smoke-ui-slice-664.mjs
node scripts/smoke-ai-company-memory-recall-preview-planning.mjs
node scripts/smoke-ai-company-memory-recall-preview.mjs
node scripts/smoke-ui-slice-665.mjs
node scripts/smoke-ai-company-durable-memory-recall-planning.mjs
node scripts/smoke-ai-company-durable-memory-recall.mjs
node scripts/smoke-ui-slice-666.mjs
node scripts/smoke-ai-company-mission-memory-context-preview-planning.mjs
node scripts/verification_status.mjs
```

Runtime/API/UI smokes가 위 Acceptance Scenarios를 검증한다. Planning smokes는 consumed authority와
exact boundary evidence로 유지하고 implementation smokes는 response-only compiler와 blocked
downstream authority를 검증한다. Phase 5 implementation smoke는 durable Builder stop을 고정하고,
Phase 6 runtime/UI smokes는 exact approval, Reviewer stop, constrained QA, response-only delivery를
고정한다. Phase 7 planning smoke는 consumed fielded gate를 고정하고 runtime/UI smokes는 exact
resume, next-boundary stop, cancellation, stale refusal, active-stage quarantine를 고정한다. Durable
DeliveryPackage planning smoke는 consumed schema-v9 persistence boundary를 고정하고 acceptance
runtime/UI smokes는 exact schema-v10 event와 blocked Mission/task close-out를 고정한다.
Mission/task close-out planning smoke는 consumed contract provenance를 고정하고 runtime/UI smokes는
schema-v11 exact event-plus-transition, terminal replay, bypass guards, and standalone close-out
isolation을 고정한다.
LearningCandidate preview planning/runtime/UI smokes는 Council evidence가 bounded source ref로만
사용됨을 고정한다. Durable LearningCandidate planning/runtime/UI smokes는 persisted record가
Council execution이나 learning acceptance authority를 새로 만들지 않는 exact gate임을 고정한다.
LearningCandidate review smokes는 Council output과 operator outcome을 분리한다. MemoryCandidate
planning/runtime/UI smokes는 Council evidence가 memory scope, redaction, expiry, storage, or skill
authority를 생성하지 않고 source-contained refs로만 사용되는 경계를 고정한다.
Durable MemoryItem planning smoke는 Council evidence와 explicit storage approval을 분리하고
schema-v14 implementation 및 every downstream memory authority를 blocked로 고정한다.
MemoryRecall planning/runtime/UI smokes는 exact inspection과 recall eligibility를 분리하고 Council
selection, ranking, recommendation, Mission injection, and application authority를 blocked로 고정한다.
Durable MemoryRecall planning smoke는 response-only eligibility와 separate record approval을 분리하고
schema-v15 implementation provenance와 still-blocked list/history/downstream authority를 고정한다.
Durable MemoryRecall runtime/UI smokes는 exact recomputation, one atomic append, exact inspection,
idempotent replay, source immutability, and blocked downstream authority를 고정한다.
