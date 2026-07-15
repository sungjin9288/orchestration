# Agent Runtime Contract

## Purpose

이 문서는 AI Company 계획을 runtime implementation으로 옮길 때 지켜야 할 domain schema,
state machine, authority, handoff, failure, observability contract를 정의한다.

`DEC-079`는 source-backed `CompanyBlueprint`/`AgentProfile` strict loading과 configured-path
additive read-only snapshot을 승인했다. `DEC-082`는 그 identity 위에서 one-Mission local-stub
Real Council position, conflict, synthesis, alignment path만 추가 승인했다. Schema migration,
standalone StaffingPlan, provider call, memory persistence, runtime profile mutation은 승인하지 않는다.

## Contract Principles

- Repo files are the source of truth for company policy and role contracts.
- Runtime state는 실행 사실과 provenance를 기록하며 source policy를 덮어쓰지 않는다.
- Agent output은 untrusted structured input으로 취급한다.
- 상태 전이와 authority 검사는 deterministic code가 소유한다.
- 모든 실행에는 `project_path`, Mission, role identity, input refs, budget가 필요하다.
- Role은 허용된 tool, workspace, output schema 밖으로 권한을 확장할 수 없다.
- Review, approval, commit, release gate는 기존 contract를 재사용한다.

## Source Layout

구현된 source-backed company layout은 다음과 같다.

```text
company/
  blueprint.json
  roles/
    conductor.md
    strategist.md
    architect.md
    decomposer.md
    researcher.md
    builder.md
    reviewer.md
    qa.md
    ops.md
```

`company/blueprint.json`은 identity와 policy metadata를 소유한다. `company/roles/*.md`는 역할별
objective, input/output, decision rules, stop/escalation rules를 소유한다. Provider-specific
prompt formatting은 adapter boundary 안에 남는다.

## CompanyBlueprint

```text
CompanyBlueprint
- schemaVersion
- companyId
- displayName
- operatingPrinciples[]
- defaultStaffingPolicy
- defaultTerminationPolicy
- agentProfiles[]
- authorityPolicy
- sourceRefs[]
```

Required invariants:

- `companyId`와 `AgentProfile.id`는 stable하고 중복되지 않는다.
- 모든 `instructionsRef`는 repo-relative path이며 `company/roles/` 안에 존재한다.
- Browser local storage는 blueprint를 변경하거나 override할 수 없다.
- Unknown field, role, tool action, authority는 fail closed한다.
- Blueprint load 실패 시 기존 runtime은 유지되지만 AI Company execution은 시작하지 않는다.

## AgentProfile

```text
AgentProfile
- id
- displayName
- role
- objective
- instructionsRef
- supportedPacks[]
- skillAllowlist[]
- toolPolicy
  - read[]
  - write[]
  - deny[]
- workspacePolicy
  - mode: shared-readonly | isolated | approved-project
  - projectPathRequired
- sessionPolicy
  - scope: mission-role | work-order
  - resumeAllowed
- providerPolicy
  - allowedModes[]
  - modelRef optional
- authority
  - canRecommend
  - canCreateWorkOrderDraft
  - canRequestApproval
  - canMutateSource
  - canCommit
  - canPush
- concurrencyLimit
```

Initial authority defaults:

- 모든 role은 `canRecommend=true`일 수 있다.
- Conductor와 Decomposer만 draft plan/work-order를 제안할 수 있다.
- Builder는 승인된 preflight 이후 기존 bounded mutation path만 사용할 수 있다.
- 어떤 role도 `canCommit` 또는 `canPush`를 갖지 않는다.
- Reviewer와 QA는 build mutation을 수행하지 않는다.
- Ops는 관찰과 cancellation request만 수행한다.

## StaffingPlan

```text
StaffingPlan
- id
- missionId
- mode: solo | council | parallel-specialists
- selectedAgentIds[]
- selectionRationale
- requiredCapabilities[]
- parallelGroups[][]
- budget
  - maxProviderCalls
  - maxTurnsPerAgent
  - deadlineMs
- terminationPolicy
- status: proposed | accepted | rejected | expired
- createdAt
- decidedAt
```

Staffing selection rules:

- 단순 분류, 조회, deterministic status는 `solo`를 우선한다.
- 의미 있는 trade-off, architecture impact, 모호한 목표는 `council` 후보가 된다.
- 서로 독립적인 조사나 검토만 `parallel-specialists` 후보가 된다.
- StaffingPlan acceptance는 source mutation authority가 아니다.
- Budget 또는 required capability가 없으면 실행하지 않는다.

## CouncilSession And CouncilPosition

```text
CouncilSession
- id
- missionId
- staffingPlanId
- agenda
- participantAgentIds[]
- positionIds[]
- synthesis
- unresolvedQuestions[]
- dissentRefs[]
- status
- alignment
- checkpointRefs[]
- createdAt / updatedAt
```

```text
CouncilPosition
- id
- councilSessionId
- agentId
- runRef
- status: pending | running | completed | failed | cancelled
- recommendation
- assumptions[]
- evidenceRefs[]
- objections[]
- risks[]
- confidence: low | medium | high
- outputDigest
- createdAt / completedAt
```

Council session states:

```text
drafting
-> collecting-positions
-> synthesizing
-> awaiting-alignment
-> approved | revision-requested | stopped | failed
```

Allowed transitions are explicit. `approved`에서 다시 position을 바꾸지 않는다. Revision은 같은
record를 덮어쓰지 않고 새 attempt와 refs를 추가한다.

## ExecutionPlan And WorkOrder

```text
ExecutionPlan
- id
- missionId
- councilSessionId
- alignmentDecisionRef
- objective
- nonGoals[]
- workOrderIds[]
- dependencyEdges[]
- acceptanceCriteria[]
- verificationPlan[]
- authorityBoundary
- status: draft | approved | executing | review | complete | stopped
```

```text
WorkOrder
- id
- executionPlanId
- assignedAgentId
- title
- intent
- inputRefs[]
- targetPathAllowlist[]
- expectedArtifacts[]
- acceptanceCriteria[]
- verificationCommands[]
- dependencies[]
- authority
- stopConditions[]
- status
- attemptRefs[]
```

WorkOrder invariants:

- 해석이 필요한 architecture 결정을 Builder에게 넘기지 않는다.
- Target path가 필요한 작업은 explicit allowlist가 비어 있으면 실행하지 않는다.
- Dependency가 통과하지 않으면 downstream WorkOrder를 시작하지 않는다.
- 같은 mutable target을 쓰는 WorkOrder는 병렬 실행하지 않는다.
- WorkOrder approval은 commit 또는 push approval이 아니다.

## HandoffPacket

```text
HandoffPacket
- id
- missionId
- fromAgentId
- toAgentId
- objective
- acceptedDecisions[]
- constraints[]
- evidenceRefs[]
- artifactRefs[]
- openQuestions[]
- expectedOutput
- acceptanceCriteria[]
- authorityBoundary
- stopConditions[]
- sourceDigest
```

Handoff rules:

- Raw chain-of-thought를 저장하거나 전달하지 않는다.
- 전체 provider transcript 대신 normalized output과 refs만 전달한다.
- Secret, raw env value, auth material은 packet에 들어갈 수 없다.
- Input source가 바뀌면 `sourceDigest` mismatch로 stale 처리한다.
- 수신 role은 packet authority를 확장할 수 없다.

## Checkpoint

```text
Checkpoint
- id
- workflowType
- workflowId
- step
- attempt
- status
- inputDigest
- completedUnitRefs[]
- pendingUnitRefs[]
- failedUnitRefs[]
- nextAllowedActions[]
- stopReason
- createdAt
```

Checkpoint rules:

- State transition 전후 저장 경계를 명시한다.
- 병렬 cell 일부가 성공하면 성공 refs를 보존한다.
- Resume은 같은 input digest와 authority policy에서만 허용한다.
- Stale checkpoint는 replay하지 않고 새 attempt 또는 human decision으로 보낸다.
- Cancellation은 terminal evidence이며 silent deletion이 아니다.

## DeliveryPackage

```text
DeliveryPackage
- id
- missionId
- executionPlanId
- deliveredArtifactRefs[]
- workOrderResults[]
- reviewerEvidenceRef
- qaEvidenceRefs[]
- verificationSummary
- acceptedRisks[]
- unresolvedItems[]
- authoritySummary
- nextAction
- status: draft | review-required | accepted | changes-requested | failed
```

Mission completion requires:

- required WorkOrder가 terminal success 상태다.
- required artifact refs가 실제로 존재한다.
- Reviewer verdict가 passed다.
- 계획된 QA evidence가 존재하고 통과한다.
- unresolved blocking decision/approval이 없다.
- source mutation, commit, release를 요청했다면 각각 기존 승인 provenance가 현재 상태와 맞는다.

## LearningCandidate

```text
LearningCandidate
- id
- sourceMissionId
- sourceEvidenceRefs[]
- lesson
- applicability
- negativeEvidence[]
- redactionStatus
- expiry
- reviewerStatus
- promotionStatus: proposed | accepted | rejected | expired
```

첫 AI Company implementation에서 `LearningCandidate`는 read-only proposal까지만 허용한다.
Memory persistence와 skill promotion은 별도 decision과 rollback evidence가 필요하다.

## Provider Boundary

- 기존 `executeWithAdapter` contract를 재사용하되 Council role allowlist 확장은 별도 승인이다.
- Local stub은 deterministic fixture와 failure injection을 제공해야 한다.
- Live provider는 optional opt-in이며 synthetic verification을 대체하지 않는다.
- Role output은 adapter가 반환한 뒤 schema validation을 통과해야 runtime state에 들어간다.
- Usage metadata는 secret 없이 role/council/mission provenance에 연결한다.
- Retry는 retryable provider failure에만 적용하고 schema/authority failure는 즉시 fail closed한다.

## API Intent

계획된 API shape는 다음과 같다. 최종 route는 implementation slice에서 기존 route compatibility를
검토한 뒤 확정한다.

```text
POST /api/missions/:missionId/staffing-plan
POST /api/missions/:missionId/council/start
POST /api/council-sessions/:sessionId/resume
POST /api/council-sessions/:sessionId/decision
GET  /api/council-sessions/:sessionId/evidence
```

Decision action은 `approve`, `request-revision`, `stop`만 허용한다. 기존
`draft-council`/`approve-council` route는 첫 migration에서 compatibility wrapper 후보이며
조용히 의미를 바꾸지 않는다.

## Observability

각 Mission workflow는 end-to-end trace identity를 갖고 role run은 child span과 같은 관계를
갖는다. Local runtime evidence에는 다음이 필요하다.

- workflow id, role id, attempt, started/finished timestamp
- input/output digest와 artifact refs
- provider adapter/model identity와 redacted usage
- handoff, guard, approval, cancellation, retry event
- terminal status와 stop reason

Sensitive prompt/tool input을 그대로 저장하지 않는다. 기존 logs/artifacts와 연결하되 raw stored
content와 derived UI preview의 source-of-truth 경계를 유지한다.

## Failure And Recovery Matrix

| Failure | Required state | Resume rule |
| --- | --- | --- |
| Provider timeout | role failed, timeout reason, checkpoint | failed role만 retry 가능 |
| Malformed output | validation failure, raw secret-free diagnostic | prompt/schema 수정 또는 retry decision |
| Partial Council failure | completed positions 보존, failed refs 표시 | required quorum/role rule 충족 전 synthesis 금지 |
| Conflicting positions | dissent refs와 unresolved question | human alignment 필요 |
| Budget exhausted | stopped with budget reason | 새 budget approval 없이는 resume 금지 |
| Stale source | stale checkpoint/position | 새 attempt 필요 |
| Unauthorized tool request | denied event, no side effect | policy 변경은 별도 decision |
| Builder verification failure | changes-requested 또는 failed | 새 WorkOrder attempt |
| Operator cancellation | cancelled terminal evidence | explicit resume/new attempt 필요 |

## Security Invariants

- Prompt 또는 tool output이 authority policy를 변경할 수 없다.
- Agent별 workspace/tool allowlist는 code에서 검사한다.
- Project path containment와 symlink safety는 기존 hardened helper를 재사용한다.
- Parallel write는 target collision 검사 후에만 허용한다.
- Secrets는 state, artifact, log, trace, handoff에 기록하지 않는다.
- 외부 content는 untrusted evidence로 표시하고 instruction으로 승격하지 않는다.
- 모든 mutation은 현재 approval target과 digest가 일치해야 한다.

## Implementation Boundary

`CompanyBlueprint`와 `AgentProfile` source loading은 `DEC-079`로 구현됐다. 현재 runtime schema는
v6이며 company policy는 `state.json`에 저장되지 않는다. Direct runtime caller가 blueprint path를
생략하면 기존 snapshot shape를 유지하고, configured local server만 additive read-only
`companyRuntime` envelope를 노출한다. Standalone StaffingPlan, provider, memory, scheduling,
profile mutation은 별도 fielded decision 전까지 구현하지 않는다.

`DEC-080`과 `DEC-081`의 Phase 2 planning evidence는 `DEC-082`가 consume했다. 구현은 schema v6와
legacy deterministic Council routes를 유지하고 새 opt-in route에만 independent positions,
deterministic conflict check, Conductor synthesis, alignment action을 둔다. Provider, standalone
StaffingPlan, WorkOrder, memory, scheduling, mutation, commit/push/release authority는 계속 blocked다.

Phase 3 provider 계획은 `DEC-083`과 `DEC-084`로 문서화됐고 complete fielded decision은
`DEC-085`로 accepted됐다. 기존 normalized position/synthesis schema를 바꾸지 않는 명시적 async
`real-openai-responses` path가 구현됐으며, synchronous `real-local-stub`, schema v6, legacy routes,
execution provider behavior는 compatibility baseline으로 유지된다. Provider expansion,
StaffingPlan, WorkOrder, memory, scheduling, mutation, commit/push/release는 계속 blocked다.

Phase 4 planning과 handoff는 `DEC-086`, `DEC-087`로 문서화됐고 response-only compiler는
`DEC-088`로 accepted됐다. Approved and source-current Real Council synthesis에 exact operator
`compileSpec`을 결합해 draft `ExecutionPlan`, fixed Builder -> Reviewer -> QA `WorkOrder` graph,
normalized `HandoffPacket`을 깊게 동결한 응답으로만 반환한다. Output persistence, execution,
WorkOrder approval, standalone StaffingPlan, scheduling, schema migration은 별도 authority다.

Phase 5 schema v7 durable record planning은 `DEC-089`, implementation decision handoff는
`DEC-090`으로 문서화됐고 exact implementation은 `DEC-091`로 accepted됐다. Runtime은 exact preview/source digest를 재검증한 뒤 one ExecutionPlan,
three WorkOrders, three HandoffPackets, linked control task, task-owned plan approval을 atomic하게
저장하고, 별도 approved start에서 local-stub Builder만 기존 preflight chain으로 dispatch한 뒤
live-mutation approval에서 멈춘다. 현재 runtime은 schema v7이며 Reviewer/QA execution과 source mutation은 blocked다.

Phase 6 reviewed-delivery planning은 `DEC-092`, implementation handoff는 `DEC-093`으로
문서화됐고 exact implementation은 `DEC-094`로 accepted됐다. Runtime은 source-current plan,
source digest, exact terminal approval, preflight artifact/run, control task, local-stub mode를 explicit
continue 때 재검증한다. 기존 Builder/Reviewer provenance를 durable WorkOrder에 reconcile하고,
changed-file allowlist 안의 shell-free `process.execPath --check`만 one `qa-evidence` artifact로
허용한다. `DeliveryPackage`는 deeply frozen response-only preview이며 Mission은 `executing`에 남는다.

Phase 7 safe-boundary recovery planning은 `DEC-095`, implementation handoff는 `DEC-096`으로
문서화됐다. Planned schema-v8 checkpoint는 exact input/authority/checkpoint digest와 attempt evidence를
보존하고 `reviewer-ready` 또는 `qa-ready`에서만 explicit local-stub resume을 허용한다. Restart 뒤
active Builder/Reviewer/QA, stale digest, partial/corrupt evidence는 quarantine or stale inspection으로
멈춘다. 현재 runtime은 schema v7이며 WorkflowCheckpoint persistence와 recovery routes는 없다.

## Verification

```bash
node scripts/smoke-ai-company-master-plan.mjs
node scripts/smoke-ai-company-runtime-blueprint.mjs
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
node scripts/smoke-ai-company-workorder-persistence-execution.mjs
node scripts/smoke-ui-slice-654.mjs
node scripts/smoke-ai-company-reviewed-delivery-planning.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs
node scripts/verification_status.mjs
```

Focused runtime/API/UI smoke는 strict source load, independent request isolation, invalid rejection,
conflict/synthesis, revision/stop/resume, snapshot compatibility, schema v7 migration/reload, legacy
Council 보존, Phase 4 response-only compilation, Phase 5 durable Builder stop boundary, Phase 6
exact-gated reviewed delivery, Phase 7 planning-only safe recovery contract를 검증한다. StaffingPlan,
schema-v8 implementation, durable DeliveryPackage, Mission done, auto-rework, provider-backed
WorkOrders, memory/checkpoint expansion, commit/push/release는 blocked다.
