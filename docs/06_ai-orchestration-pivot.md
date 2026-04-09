# AI Orchestration Pivot Brief

## Purpose
이 문서는 현재 구현된 Orchestration 1.0 v1을 기준으로, 원래 의도했던 "AI 오케스트레이션" 제품으로 피벗할 때 무엇을 유지하고 무엇을 버려야 하는지 정리한다.

핵심 전제는 단순하다.

- 현재 v1은 `local-first / single-user-first / ops-first` 운영 셸로는 완성되었다.
- 하지만 사용자가 원했던 제품은 운영 콘솔이 아니라 "목표를 지시하면 역할을 맡은 AI들이 회의하고 조율해 결과물을 만들어내는 오케스트레이션 시스템"에 더 가깝다.
- 따라서 다음 단계는 v1을 더 정교하게 다듬는 것이 아니라, v1 엔진 위에 새로운 상위 제품 경험을 세우는 일이다.

## Problem Statement
현재 구현은 다음 질문에는 잘 답한다.

- 어떤 project에서 실행 중인가
- 어떤 task가 어디까지 갔는가
- 어떤 run이 실패했는가
- 어떤 artifact가 근거인가
- 어느 approval 또는 review가 막고 있는가

하지만 다음 질문에는 잘 답하지 못한다.

- 내가 목표를 말하면 누가 어떻게 일하기 시작하는가
- 어떤 역할들이 어떤 의견을 냈는가
- 왜 이런 합의안이 나왔는가
- 서로 충돌한 의견은 어떻게 조정되었는가
- 지금 시스템이 "내 지시를 받아 알아서 움직이는 팀"처럼 느껴지는가

즉, 현재 제품은 실행 엔진은 있지만 오케스트레이션 경험은 부족하다.

## What V1 Already Gives Us
현재 v1에서 재사용 가치가 높은 것은 아래와 같다.

### 1. Execution Engine
- `project_path required`
- `Task -> Run -> Artifact -> Review -> Approval` 계약
- `planner -> architect -> task-breaker -> builder preflight -> builder live-mutation -> reviewer` 역할 경계
- explicit gate와 fail-closed 처리

이건 버리면 안 된다. 사용자가 원하는 AI 오케스트레이션도 결국 실행 엔진이 필요하고, 현재 엔진은 그 기초로 충분히 쓸 만하다.

### 2. Provenance And Evidence
- 로그
- 산출물
- review evidence
- approval provenance
- worktree와 repo 경계

AI 오케스트레이션이 "멋진 대화"만 하고 실제로 뭘 했는지 모르면 신뢰를 잃는다. 지금의 provenance 체계는 그대로 가져가야 한다.

### 3. Bounded Mutation Model
- `preflight`와 `live-mutation` 분리
- 변경 가능 파일 경계
- review before done
- approval before commit

이 경계는 AI가 자율적으로 움직이더라도 유지해야 한다. 오히려 AI 오케스트레이션일수록 더 중요하다.

### 4. Local-First Core
- 로컬 repo
- linked worktree
- 로컬 로그
- 로컬 artifact

이것도 유지하는 편이 맞다. 이 제품의 차별점은 로컬 실제 작업을 다룬다는 점이기 때문이다.

## What Must Change
원래 의도한 제품으로 가려면 아래는 바뀌어야 한다.

### 1. Primary Product Entry
지금의 첫 진입은 `Taskboard`와 프로젝트 등록이다.

원하는 진입은 더 가깝게 아래여야 한다.

- "무엇을 만들고 싶은가?"
- "이번 작업에서 어떤 역할들이 필요할까?"
- "지금 회의를 시작할까?"

즉, 첫 화면은 운영 패널이 아니라 미션 입력과 오케스트레이션 시작점이어야 한다.

### 2. Visible Multi-Agent Collaboration
현재 역할은 내부 단계 이름이다.

원하는 제품에서는 역할이 사용자에게 보이는 캐릭터 또는 에이전트로 나타나야 한다.

예:
- 전략가
- 시스템 설계자
- 작업 분해자
- 제작자
- 비평가
- 진행자

중요한 점은 "캐릭터 연출"이 목적이 아니라, 역할별 관점과 충돌을 사용자에게 보이게 하는 것이다.

### 3. Meeting Layer
현재는 단계별 실행 결과만 있다.

원하는 제품에는 최소한 아래가 필요하다.

- 역할별 발언
- 의견 충돌
- 합의안
- 보류 이슈
- 사용자에게 다시 확인할 질문

즉, planner 결과만 보여주는 것이 아니라, "planner가 왜 이런 방향을 냈는지"와 "architect가 어디를 반대했는지"가 회의 형태로 보여야 한다.

### 4. Automation Default
현재는 operator가 버튼을 눌러야 다음 단계로 간다.

원하는 제품에서는 기본 동작이 반대여야 한다.

- 목표를 입력하면
- 에이전트 회의를 자동 시작하고
- 합의 가능한 단계는 자동 진행하고
- 사람 승인이 필요한 지점에서만 멈춘다

즉, 수동 단계를 기본값으로 두면 안 된다.

### 5. Surface Hierarchy
현재 상위 표면은

1. `Taskboard`
2. `Logs`
3. `Artifacts`
4. `Decision Inbox`

하지만 원래 의도에 맞는 상위 표면은 더 가깝게 아래여야 한다.

1. `Mission`
2. `Council`
3. `Execution`
4. `Deliverables`

`Logs`, `Artifacts`, `Decision Inbox`는 사라질 필요는 없지만, 적어도 첫 번째 탐색 구조에서는 뒤로 물러나야 한다.

## Proposed V2 Product Statement
AI Orchestration v2는 사용자가 목표를 지시하면 역할을 맡은 AI 에이전트들이 자동으로 회의를 진행하고, 충돌을 조율하고, 합의된 실행안을 바탕으로 bounded local execution을 수행한 뒤, 근거와 결과물을 함께 제공하는 local-first orchestration system이다.

## Proposed Core Objects For V2
현재 객체를 완전히 버릴 필요는 없다. 다만 상위 객체를 새로 올려야 한다.

### Mission
- 사용자가 원하는 목표
- 성공 기준
- 제약 조건
- 대상 repo/project

현재 `task`보다 상위 개념이다.

### Council Session
- 어떤 역할들이 참여하는가
- 각 역할이 무슨 입장을 냈는가
- 어떤 합의안이 선택되었는가
- unresolved question이 무엇인가

현재에는 없는 핵심 객체다.

### Execution Plan
- 합의안에서 실제 실행 가능한 thin slice로 정리된 결과
- 기존 `plan / architecture / breakdown`을 묶어 보여주는 상위 표현이다

### Delivery Package
- change-summary
- patch/diff
- review
- verification
- close-out or next-step guidance

현재 `artifacts` 묶음을 사용자 친화적으로 다시 보여주는 상위 객체다.

## Proposed Role Cast
현재 엔진 역할을 사용자 경험상 캐릭터로 매핑하면 아래 구조가 적당하다.

### 1. Conductor
- 회의를 시작하고 정리한다
- 사용자 목표를 세션으로 변환한다
- 현재 상태를 요약한다

### 2. Strategist
- 목표 해석
- 우선순위
- 성공 기준 정의

현재 `planner`에 가깝다.

### 3. Architect
- 구조 영향 검토
- 경계 확인
- 리스크 식별

현재 `architect`에 가깝다.

### 4. Decomposer
- 실행 단위 분해
- 체크포인트 정의
- stop condition 제시

현재 `task-breaker`에 가깝다.

### 5. Maker
- 실제 수정 실행
- bounded mutation 수행

현재 `builder`에 가깝다.

### 6. Critic
- 결과 검토
- 변경 요청 또는 승인 의견

현재 `reviewer`에 가깝다.

## Proposed User Flow
### Flow 1. Start A Mission
사용자는 repo를 선택하고 목표를 한 문장으로 입력한다.

예:
"이 프로젝트에서 로그인 UX를 개선해줘. 너무 복잡한 흐름은 피하고, 우선 작은 수정부터 제안해."

### Flow 2. Convene The Council
시스템은 역할들을 자동 소집한다.

- Strategist가 목표를 해석한다
- Architect가 구조 영향과 리스크를 말한다
- Decomposer가 실행 단위를 제안한다
- Conductor가 합의안을 정리한다

### Flow 3. Ask For Alignment
사용자에게 보여줘야 하는 것은 상세 로그가 아니라 아래다.

- 회의 요약
- 역할별 핵심 의견
- 추천안
- 예상 변경 범위
- 사용자 확인이 필요한 질문

### Flow 4. Auto-Execute The Approved Plan
사용자가 승인하면 시스템은 가능한 단계는 자동으로 진행한다.

- plan
- architecture
- breakdown
- preflight

승인이 필요한 지점에서만 멈춘다.

### Flow 5. Deliver Results
사용자에게는 아래가 하나의 "결과 패키지"로 보여야 한다.

- 무엇을 바꾸려 했는가
- 실제 무엇이 바뀌었는가
- 어떤 논의가 있었는가
- reviewer는 뭐라고 했는가
- 지금 승인/수정/종료 중 무엇을 할 수 있는가

## Proposed Surface Model
### 1. Mission
- 목표 입력
- 현재 미션 목록
- 현재 미션 상태

### 2. Council
- 역할별 발언
- 합의안
- unresolved disagreement
- 사용자 질문

### 3. Execution
- 현재 실행 단계
- 자동 진행 상태
- 중단 이유
- advanced logs

### 4. Deliverables
- 최종 제안안
- patch/diff
- review 결과
- 승인 액션

### 5. Advanced Ops Mode
현재 v1의 `Taskboard / Logs / Artifacts / Decision Inbox`는 완전히 삭제할 필요는 없다.

대신 `Advanced Ops Mode`로 내리는 편이 맞다.

- 기본 사용자는 보지 않는다
- 문제 추적이나 깊은 운영 디버깅이 필요할 때만 연다

## Shell Posture
새 기본 shell은 marketing-style website가 아니라 company/ERP-style command center처럼 읽혀야 한다.

- 역할은 단순 avatar가 아니라 `누가 출근했고`, `누가 지금 안건을 맡고 있으며`, `누가 회의에서 반대하거나 승인하는지`가 보이는 assigned cast로 나타난다.
- `Mission / Council / Execution / Deliverables`는 각각 `안건 접수`, `회의`, `실행`, `결과 보고`라는 회사 운영 동선을 닮아야 한다.
- 이 framing은 product shell을 위한 것이며, underlying authority는 여전히 local-first execution engine과 `advanced ops mode`에 남는다.
- 허용되는 company feel은 `ERP/control-plane` 쪽이지 `budget/HR/company-management simulator` 나 `pixel-office gameplay` 쪽이 아니다.

## Migration Strategy
### Keep
- runtime
- coordinator
- role contracts
- artifact taxonomy
- approval and review guards
- linked worktree and local-first boundaries

### Hide Or Demote
- top-level `Taskboard`
- top-level `Logs`
- top-level `Artifacts`
- top-level `Decision Inbox`
- 세부 단계별 수동 버튼 나열

### Add
- mission intake
- council session model
- role voices and meeting transcript
- consensus summary
- auto-chain orchestration controller
- deliverable-centric result view

## First Acceptable V2 Slice
가장 먼저 구현해야 하는 것은 전체 재작성보다 아래의 얇은 수직 슬라이스다.

### Slice Goal
사용자가 하나의 목표를 입력하면, Strategist/Architect/Decomposer의 회의가 먼저 보이고, 사용자가 합의안을 승인하면 기존 planner/architect/task-breaker/preflight 엔진이 자동으로 이어서 실행되는 첫 경험을 만든다.

### What This Slice Must Include
- mission 입력
- visible council transcript
- 합의안 1개 이상
- 사용자 승인 CTA
- 승인 후 자동 체인 시작
- 최종적으로 preflight artifact까지 도달

### What This Slice Must Exclude
- pixel-office gameplay 또는 budget/HR/company-management semantics 과다
- messenger 연동
- multi-provider 확장
- generalized team workspace

## Decision Needed Before Implementation
이 피벗은 단순 UX 조정이 아니다.

아래가 같이 바뀐다.

- primary UI surfaces
- default user flow
- product framing
- task visibility model

따라서 실제 구현에 들어가기 전에는 `docs/01_decision-log.md`와 core source-of-truth docs를 v2 방향으로 갱신해야 한다.

## Bottom Line
현재 v1은 "운영 콘솔"로는 성공했다.
하지만 원래 원한 제품은 "AI 오케스트레이션"이었다.

따라서 다음 단계의 올바른 질문은
"현재 v1을 더 다듬을까?"
가 아니라
"현재 v1 엔진 위에 AI 오케스트레이션 경험을 어떻게 다시 세울까?"
여야 한다.
