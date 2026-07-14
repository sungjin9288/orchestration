# Council Operating Protocol

## Purpose

이 문서는 하나의 Mission을 여러 역할이 독립 검토하고, 이견을 보존하고, Conductor가 실행
가능한 결론으로 합성하고, 운영자가 방향을 승인하는 Council protocol을 정의한다.

Council은 group chat이나 역할극이 아니다. 같은 evidence packet에 대한 bounded independent
review와 explicit synthesis workflow다.

현재 runtime의 deterministic Council transcript는 이 protocol의 UI prototype evidence일 뿐,
실제 role run 구현이 아니다. Runtime implementation은 별도 승인 상태다.

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

이 protocol은 `DEC-076`이 승인한 계획 문서다. Council provider calls, role prompt 추가,
schemaVersion 변경, runtime/API/UI 구현은 별도 implementation decision 없이는 시작하지 않는다.

## Verification

```bash
node scripts/smoke-ai-company-master-plan.mjs
node scripts/verification_status.mjs
```

현재 focused smoke는 문서 contract만 검증한다. 위 Acceptance Scenarios의 runtime 증거는 첫
implementation slice에서 별도 smoke로 추가해야 한다.
