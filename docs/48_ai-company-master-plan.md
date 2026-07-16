# AI Company Master Plan

## Purpose

이 문서는 Orchestration을 여러 AI 역할이 하나의 팀으로 협의하고, 제작하고, 검토하고,
결과를 인계하는 local-first AI Company control plane으로 발전시키기 위한 최상위 계획이다.

이 계획의 목표는 사람처럼 보이는 대화 UI를 늘리는 것이 아니다. 목표는 다음 질문에
runtime evidence로 답할 수 있는 운영체제를 만드는 것이다.

- 누가 이 Mission에 배정됐는가?
- 각 역할은 어떤 근거로 무엇을 제안했는가?
- 어떤 이견이 남았고 누가 결론을 승인했는가?
- 누가 어떤 WorkOrder를 실행했고 무엇을 만들었는가?
- Reviewer와 QA는 무엇을 검증했는가?
- 어떤 권한이 열렸고 어떤 권한은 계속 닫혀 있는가?
- 실패한 작업은 어디에서 멈췄고 어떻게 재개되는가?

## Approved Documentation Authority

- Decision status: `approve-ai-company-master-plan-documentation`
- Target authority: `source-of-truth AI Company master plan documentation`
- Recorded decision: `DEC-076`
- Allowed in this slice: 이 문서군, decision log, task ledger, focused documentation smoke,
  aggregate verification 등록, 검증, commit, push
- Still blocked by `DEC-076` alone: runtime implementation, provider role expansion, memory
  persistence, autonomous scheduling, source mutation by agents, approval bypass, unattended
  commit/push

이 문서군은 구현 계획을 승인했다. 이후 `DEC-079`가 read-only runtime blueprint foundation만
별도로 승인했으며 나머지 runtime authority는 계속 차단한다.

## Approved Runtime Foundation Authority

- Decision id: `operator-decision-ai-company-runtime-blueprint-implementation-001`
- Decision status: `approve-ai-company-runtime-blueprint-implementation-slice`
- Recorded decision: `DEC-079`
- Allowed: strict repo-backed CompanyBlueprint/AgentProfile loading, optional runtime injection,
  configured-path additive read-only snapshot, focused/aggregate verification
- Compatibility: persisted state stays at schema v6; direct runtime callers without a blueprint path
  keep the legacy snapshot shape
- Still blocked: StaffingPlan runtime, independent Council execution, providers, memory, scheduling,
  source mutation, approval bypass, runtime-agent commit/push/release

## Current Product Truth

현재 구현은 AI Company의 기반이지만 완성된 AI Company는 아니다.

- `Mission / Council / Execution / Deliverables` primary shell이 존재한다.
- Mission 생성, 선택, legacy Council 초안/승인 API와 opt-in Real Council start/resume/decision
  API가 존재한다.
- Legacy Council session은 기존 deterministic transcript를 그대로 생성한다. 별도
  `mode=real-local-stub` session은 source-backed Strategist/Architect/Decomposer position을
  독립 요청으로 수집하고 deterministic conflict evidence 뒤 Conductor synthesis를 기록한다.
- 실행 엔진은 `planner -> architect -> task-breaker -> builder preflight -> builder live
  mutation -> reviewer`를 지원한다.
- Review before done, approval before mutation/commit, provenance, artifact, log, Decision Inbox
  경계가 구현돼 있다.
- `ui/company-config.js`의 회사 구성은 browser-side presentation 설정이며 runtime authority가
  아니다.
- `company/blueprint.json`과 `company/roles/*.md`는 strict validation을 통과한 source-backed
  runtime identity/policy이며, configured local server snapshot의 read-only `companyRuntime`
  envelope로 노출된다.
- Provider 기본값은 local stub이며 live OpenAI Responses 경로는 현재 승인된 실행 역할에만
  한정된다.
- Memory와 growth 기능은 대부분 read-only readiness/evidence 상태이며 조직 기억 자동 저장은
  승인되지 않았다.

Phase 1은 browser-only roster와 runtime 사이의 read-only identity 계층을 채웠고, Phase 2는 이
foundation 위에서 one-Mission local-stub Real Council path를 구현했다. Provider-backed role
execution과 standalone StaffingPlan은 아직 구현되지 않았다.

## Approved Real Council Planning Authority

- Planning decision: `operator-delegated-ai-company-real-council-planning-001`
- Decision status: `approve-ai-company-real-council-planning-only`
- Recorded decisions: `DEC-080`, `DEC-081`
- Allowed: Phase 2 implementation plan, implementation decision handoff, focused planning smoke,
  aggregate registration, documentation/README/task evidence, commit, push
- Consumed by: `DEC-082`

## Approved Real Council Implementation Authority

- Implementation decision: `operator-decision-ai-company-real-council-implementation-001`
- Decision status: `approve-ai-company-real-council-local-stub-implementation-slice`
- Recorded decision: `DEC-082`
- Implemented: opt-in start/resume/decision routes, isolated local-stub positions, deterministic
  conflict summary, Conductor synthesis, additive attempt history, human alignment controls,
  schema v6 reload, and legacy route compatibility
- Still blocked after Phase 2: provider use until `DEC-085`, standalone StaffingPlan, WorkOrders, memory/checkpoint expansion,
  autonomous scheduling, profile/source mutation, approval bypass, runtime-agent commit/push/release

## Accepted Council Live Provider Implementation Authority

- Planning decision: `operator-delegated-ai-company-council-live-provider-planning-001`
- Decision status: `approve-ai-company-council-live-provider-planning-only`
- Recorded decisions: `DEC-083`, `DEC-084`, `DEC-085`
- Allowed: one explicit readiness-gated `real-openai-responses` implementation, four Council roles,
  redacted provider evidence, focused synthetic/UI and optional live smoke, aggregate registration
- Implemented boundary: existing normalized Council position and synthesis contract;
  `real-local-stub` stays authoritative and there is no automatic provider fallback
- Still blocked: provider expansion,
  StaffingPlan, WorkOrders, memory/checkpoint expansion, scheduling, mutation, approval bypass,
  runtime-agent commit/push/release

## Product North Star

운영자는 하나의 local project와 Mission을 입력하고 다음 흐름을 끝까지 관찰하고 제어한다.

```text
Mission Intake
-> Staffing Decision
-> Council Positions
-> Conductor Synthesis
-> Human Alignment Gate
-> Execution Plan and WorkOrders
-> Specialist Execution
-> Reviewer and QA
-> Delivery Package
-> Retrospective and Learning Candidate
```

모든 단계는 현재 상태, 입력 refs, 출력 refs, owner, 다음 허용 행동, stop reason을 갖는다.

## Operating Principles

### 1. Company Is A Runtime Contract

회사 구성은 avatar, 이름, org chart가 아니라 역할, 책임, 권한, tool policy, workspace policy,
handoff contract의 집합이다. UI는 이 contract를 보여주며 별도 authority를 만들지 않는다.

### 2. Deterministic Spine, Agentic Cells

상태 전이, 권한 검사, budget, timeout, approval, review, checkpoint는 code가 결정한다. 목표
해석, 대안 작성, 설계 검토, 제작, 비평처럼 판단이 필요한 cell만 agent가 수행한다.

### 3. Multi-Agent Only When It Adds Value

모든 Mission을 Council로 보내지 않는다. Staffing 단계가 `solo`, `council`,
`parallel-specialists` 중 하나를 선택하고 근거를 남긴다. 단순한 작업은 한 역할이 처리한다.

### 4. Independent Positions Before Synthesis

Council 역할은 서로의 전체 응답을 먼저 보지 않고 같은 Mission packet을 독립 검토한다.
Conductor는 정규화된 position만 받아 결론과 이견을 합성한다. 사회적 동조를 합의로 오인하지
않는다.

### 5. Handoff Packets, Not Transcript Flooding

역할 간 전달은 전체 chat history가 아니라 목표, 제약, evidence refs, accepted decisions,
expected output, authority, stop conditions를 담은 `HandoffPacket`으로 제한한다.

### 6. Evidence Before Authority

Agent output은 evidence이지 authority가 아니다. Alignment approval, source mutation approval,
commit approval, release approval은 서로 다른 human gate로 유지한다.

### 7. Failure Must Be Inspectable And Resumable

모든 bounded loop는 budget, retry cap, timeout, cancellation, rollback 또는 quarantine,
human return point를 갖는다. 성공한 독립 role result는 재개 시 재사용하고 실패한 cell만
재시도한다.

### 8. Learning Is A Reviewed Promotion

Retrospective output은 즉시 memory가 되지 않는다. 먼저 `LearningCandidate`로 남고 redaction,
applicability, expiry, reviewer approval을 통과한 경우에만 별도 authority에서 승격한다.

## Logical Organization

### Operator

- 최종 목표, 제약, 위험 허용도와 human gates를 소유한다.
- Agent가 스스로 확장할 수 없는 최상위 authority다.

### Conductor

- Mission intake와 StaffingPlan을 조정한다.
- Council agenda, termination, synthesis, unresolved questions를 소유한다.
- 최종 사용자-facing 결론을 작성하지만 mutation authority는 갖지 않는다.

### Strategist

- 원하는 outcome, audience, priority, success condition, non-goal을 명확히 한다.

### Architect

- system boundary, dependency, policy impact, reversibility, architecture escalation을 검토한다.

### Decomposer

- 승인된 방향을 decision-complete WorkOrder와 checkpoint로 나눈다.

### Researcher

- 필요한 경우 source-backed evidence를 수집하고 사실, 추론, 미확인을 구분한다.

### Builder

- 승인된 WorkOrder와 allowlist 안에서만 제작한다.
- Architecture를 조용히 바꾸지 않으며 preflight와 mutation을 분리한다.

### Reviewer

- 요구사항, 회귀, provenance, contract compliance를 독립 검토한다.

### QA

- 실행 가능한 acceptance check와 failure scenario를 검증한다.
- Reviewer의 서술 판단과 별도 증거를 남긴다.

### Ops

- timeout, retry, blocked run, checkpoint, resource usage, resume 상태를 감시한다.
- 제품 authority를 확장하지 않는다.

## Core Domain Objects

| Object | Purpose | Authority posture |
| --- | --- | --- |
| `CompanyBlueprint` | source-backed roster와 기본 정책 | repo file이 authority |
| `AgentProfile` | 역할별 instruction, skill, tool, workspace, provider policy | self-modification 금지 |
| `Mission` | 운영자가 요청한 목표와 제약 | 기존 runtime object 확장 |
| `StaffingPlan` | solo/council/parallel 선택과 배정 근거 | 실행 전 검증 필요 |
| `CouncilSession` | agenda, positions, synthesis, alignment 상태 | recommendation only |
| `CouncilPosition` | 역할별 독립 주장, 근거, 이견, confidence | evidence only |
| `ExecutionPlan` | 승인된 목표를 실행 단계로 compile | mutation authority 없음 |
| `WorkOrder` | 한 역할이 수행할 decision-complete 단위 | 명시적 allowlist 필요 |
| `HandoffPacket` | 역할 간 최소 전달 contract | raw transcript 제외 |
| `Checkpoint` | 재개 가능한 상태와 refs | immutable history 우선 |
| `DeliveryPackage` | 결과, review, QA, open risk, next action | done 판정 입력 |
| `LearningCandidate` | 검토 전 lesson/memory 후보 | persistence blocked by default |

세부 schema와 state machine은 `docs/49_agent-runtime-contract.md`를 따른다.

## External Pattern Intake

외부 프로젝트는 dependency나 제품 identity가 아니라 검증된 pattern input으로만 사용한다.

- [OpenClaw](https://github.com/openclaw/openclaw): local gateway, agent별 workspace/session,
  skill/tool isolation
- [AutoGen Teams](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/teams.html):
  team composition, speaker strategy, termination, observability
- [CrewAI Crews and Flows](https://docs.crewai.com/en/concepts/crews): crew definition과 flow state 분리
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence): checkpoint,
  interrupt, resume, partial failure recovery
- [OpenAI Agents SDK Orchestration](https://openai.github.io/openai-agents-js/guides/multi-agent/):
  manager-owned synthesis, specialist delegation, code-driven orchestration

채택하지 않는 범위는 외부 runtime vendoring, messenger-first UX, framework migration,
multi-provider-first matrix, agent self-authorization이다.

## Product Success Criteria

계획 완료가 아니라 AI Company runtime 완료를 주장하려면 다음 증거가 모두 필요하다.

1. Source-backed roster가 runtime snapshot과 UI에 같은 identity로 나타난다.
2. 한 Mission에서 둘 이상의 독립 Council role run과 Conductor synthesis가 생성된다.
3. 이견과 미해결 질문이 승인 전에 가려지지 않는다.
4. 승인 전에는 linked execution과 source mutation이 시작되지 않는다.
5. 승인 후 WorkOrder가 기존 execution gates로 연결된다.
6. Builder result와 독립 Reviewer/QA evidence가 DeliveryPackage에 연결된다.
7. timeout, malformed output, partial role failure, revision, cancellation, resume가 focused smoke로
   증명된다.
8. Done은 review passed, QA evidence, unresolved gate 없음, required artifacts 존재를 모두
   만족해야 한다.
9. Optional live-provider 결과는 synthetic gate와 분리해서 기록한다.
10. README는 실제 구현과 검증된 범위만 반영한다.

## Non-Goals

- payroll, budget accounting, HR, hiring game, ranking, XP
- messenger-first collaboration 또는 multi-user workspace
- agent가 approval, commit, push, release authority를 스스로 부여하는 기능
- 모든 Mission에 무조건 여러 agent를 호출하는 구조
- raw chain-of-thought 또는 전체 내부 transcript 저장
- 외부 agent framework를 core runtime으로 교체
- unattended cron company 또는 무제한 self-improvement loop

## First Implementation Target

첫 runtime foundation slice는 `DEC-079`로 구현됐다. Source-backed `CompanyBlueprint`와
`AgentProfile`을 strict하게 load하고 configured path의 read-only snapshot으로 노출하며, state
schema와 deterministic Council/browser presentation roster behavior를 유지한다.

첫 behavior vertical slice는 foundation 검증 이후의 `Real Council for one Mission`이다.

- source-backed 네 Council role을 load한다.
- Strategist, Architect, Decomposer position을 독립 실행한다.
- Conductor가 structured position을 합성한다.
- UI가 role status, evidence, objection, synthesis, open question을 표시한다.
- Operator가 `approve`, `request-revision`, `stop` 중 하나를 선택한다.
- `approve` 후에만 기존 linked task와 preflight auto-chain이 열린다.
- Source mutation, commit, push는 기존 별도 gate에서 계속 멈춘다.

이 vertical slice의 decision-complete planning과 implementation gate는
`docs/54_ai-company-real-council-implementation-plan.md`와
`docs/55_ai-company-real-council-implementation-decision-handoff.md`에 고정됐고 `DEC-082`로
구현됐다. Independent positions, deterministic conflict, Conductor synthesis, human alignment가
`real-local-stub` 경로에서 검증됐다. `DEC-085`는 같은 normalized contract에 명시적
`real-openai-responses` transport만 추가하며 local-stub authority와 downstream gate를 유지한다.

Phase 4 planning과 handoff는 `DEC-086`, `DEC-087`로 기록됐고 exact implementation은 `DEC-088`로
accepted됐다. Source-current approved Council synthesis와 exact operator `compileSpec`에서만
response-only `ExecutionPlan`, fixed Builder -> Reviewer -> QA inert WorkOrder graph, normalized
HandoffPackets를 deterministic하게 preview한다. Council synthesis에 없는 target allowlist나
verification commands를 추론하지 않으며, explicit inert mode는 기존 linked-task auto-chain 전에
멈춘다. Plan/WorkOrder persistence, approval, execution, scheduling authority는 계속 blocked다.

Phase 5 planning과 implementation handoff는 `DEC-089`, `DEC-090`으로 기록됐고 complete fielded
implementation은 `DEC-091`로 accepted됐다. 구현된 최소 vertical slice는 additive schema v7 plan/WorkOrder/handoff records, exact preview/source digest에
묶인 task-owned operator approval, 별도 start command, local-stub-only Builder 순차 dispatch를
사용한다. 기존 planner -> architect -> task-breaker -> builder-preflight chain을 재사용하고 targeted
live-mutation approval에서 멈춘다. Source mutation, Reviewer/QA 실행, 병렬 scheduling,
provider-backed WorkOrder dispatch는 여전히 blocked다.

Phase 6 reviewed-delivery continuation planning은 `DEC-092`, implementation decision handoff는
`DEC-093`으로 기록됐고 complete fielded implementation은 `DEC-094`로 accepted됐다. 구현 경로는
exact approved Builder live-mutation gate와 explicit continue를 다시 검증하고 기존 local-stub
Builder와 independent Reviewer를 순차 재사용한다. QA는 Builder-changed allowlist 안의 shell-free
`process.execPath --check`만 실행하고 one `qa-evidence` artifact를 남긴다. DeliveryPackage는
delivery-ready evidence에서 deterministic response-only preview로만 계산된다. Durable package,
Mission done, auto-rework, scheduling/provider/memory expansion, commit/push/release authority는 blocked다.

Phase 7 checkpoint/resume/recovery planning은 `DEC-095`, implementation decision handoff는
`DEC-096`, exact implementation은 `DEC-097`로 accepted됐다. Valid schema-v7 safe boundary에는 migration
중 one bootstrap checkpoint를 만들고, 새 transition의 Builder waiting/Reviewer-ready/QA-ready/delivery-ready
boundary에 Schema-v8 WorkflowCheckpoint를 append한다. Exact input/authority/checkpoint digest와 explicit
operator action으로 기존 local-stub Reviewer 또는 QA를 한 stage만 재개하는 경로다. Interrupted
active Builder/Reviewer/QA는 replay하지 않고 quarantine한다. Automatic retry, Builder replay,
provider/scheduling expansion, durable package, Mission done, commit/push/release는 blocked다.

Durable DeliveryPackage persistence planning은 `DEC-098`, complete fielded implementation handoff는
`DEC-099`로 기록됐다. Planned minimum은 source-current schema-v8 delivery-ready plan, terminal
WorkflowCheckpoint, deterministic response-only preview의 exact preview/source/package/checkpoint
digest를 one explicit operator request에서 재검증하고 one schema-v9 `review-required` record만
append하는 경로다. Current runtime은 여전히 schema v8이며 package persistence, package acceptance,
Mission/task close-out, done, commit/push/release, learning/memory authority는 blocked다.

Foundation 계획과 consumed implementation decision input은
`docs/52_ai-company-runtime-blueprint-implementation-plan.md`와
`docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md`를 따른다. 전체 구현
순서와 acceptance gate는 `docs/51_ai-company-delivery-roadmap.md`를 따른다.

## Verification

이 문서화 slice의 검증은 다음 명령으로 제한된다.

```bash
node scripts/smoke-ai-company-master-plan.mjs
node scripts/smoke-ai-company-real-council.mjs
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
node scripts/verification_status.mjs
```

이 검증은 source contract, local-stub Council, explicit provider opt-in, UI/API readiness gate와
authority boundary, Phase 4 response-only compiler, Phase 5 durable Builder stop, Phase 6 exact-gated
reviewed-delivery와 response-only package, Phase 7 schema-v8 safe recovery boundary를 확인한다.
Durable DeliveryPackage planning smoke는 schema-v9 implementation이 아직 absent임을 source-check한다.
Optional live-provider 결과는 별도 informational evidence다.
