# agent product pattern audit

## 목적
이 문서는 아래 5개 공개 레포를 참고해, 현재 Orchestration 1.0에 실제로 가져올 기능/디자인 패턴과 의도적으로 배제할 패턴을 정리한다.

- `claw-empire`
- `dify`
- `crewAI`
- `oh-my-openagent`
- `paperclip`

목표는 외부 제품을 복제하는 것이 아니라, 현재 repo의 `local-first / single-user-first / ops-first / development pack only` 경계를 유지한 채 사용자 이해도와 orchestration 가시성을 높이는 것이다.

## 관찰한 공통 패턴

### 채택 패턴
- `목표 가시성`: 첫 화면에서 사용자가 지금 무엇을 시키는지 바로 읽히게 만든다.
- `역할 가시성`: 어떤 agent/crew가 이 안건을 다루는지 숨기지 않고 전면에 보여 준다.
- `흐름 가시화`: 입력 -> 정렬 -> 실행 -> 결과 같은 stage를 한눈에 읽히게 만든다.
- `운영 기준 가시성`: 승인, 검토, 증적, bounded execution 같은 rule을 설명문이 아니라 product surface에 직접 드러낸다.

### 배제 패턴
- `회사 시뮬레이터`: 조직도, 예산, 팀 운영, CEO/company roleplay가 제품의 본질이 되는 방향
- `generic workflow builder`: 범용 node editor나 broad platform studio가 primary experience가 되는 방향
- `chatbot-first posture`: 채팅창 하나가 product shell 전체를 대체하는 방향
- `multi-provider breadth`: provider matrix나 platform breadth가 첫 가치 제안이 되는 방향

## 레포별 채택 / 배제

### 1. `claw-empire`
- 관찰:
  - 공개 repo framing에서 `Command Your AI Agent Empire`처럼 agent cast와 command-center 연출이 전면에 나온다.
- 채택:
  - 역할군이 숨어 있지 않고 바로 보이는 `cast visibility`
  - command-center처럼 현재 안건과 agent 배치가 즉시 읽히는 first-view hierarchy
- 배제:
  - empire/company roleplay 자체를 product contract로 삼는 방향
  - pixel office나 virtual company를 primary product semantics로 승격하는 방향

### 2. `dify`
- 관찰:
  - repo description과 README surface에서 `workflow`, `RAG pipeline`, `prompt IDE`, `observability`처럼 흐름과 운용 도구를 명확히 나눈다.
- 채택:
  - 입력 후 무엇이 어떤 순서로 흘러가는지 보이는 `flow strip`
  - operator가 바로 이해할 수 있는 clear section framing
- 배제:
  - broad studio/platform shell
  - builder-like generalized app composition UI

### 3. `crewAI`
- 관찰:
  - README에서 `Crews`와 `Flows`를 분리해 role-specialized collaboration과 orchestration path를 함께 설명한다.
- 채택:
  - `crew`와 `flow`를 별도 시각 단위로 보여 주는 구성
  - 역할 specialization과 stage handoff가 동시에 보이는 surface
- 배제:
  - autonomous background swarm이 기본이고 operator visibility가 약한 방향
  - runtime scope보다 larger multi-agent system framing

### 4. `oh-my-openagent`
- 관찰:
  - 현재 GitHub repo 표면은 `renamed-to-oh-my-opencode`로 바뀌어 있지만, specialist-agent shell을 전면에 두는 openagent 계열 reference로는 여전히 참고 가치가 있다.
- 채택:
  - specialist identity를 숨기지 않는 approachable entry
  - operator가 여러 agent 역할을 제품 안에서 자연스럽게 이해하는 shell posture
- 배제:
  - generic plugin mall이나 open-ended assistant shell
  - naming/branding drift를 product contract 대신 repo 밖 branding에 의존하는 방향

### 5. `paperclip`
- 관찰:
  - README 표면에서 `AI workspace`, `org chart`, `responsibilities`, `budgets`, `not a chatbot` framing이 강하다.
- 채택:
  - goal과 responsibility가 흐릿하지 않게 보이는 `charter` 구성
  - conversational novelty보다 `workspace clarity`를 앞세우는 posture
- 배제:
  - budget, org-management, company operations를 product domain으로 들여오는 방향
  - multi-person workspace를 current single-user baseline보다 우선하는 방향

## 현재 repo에 적용할 디자인 규칙

### first viewport rule
첫 화면에서 아래 네 가지가 동시에 보여야 한다.

1. `목표`: 지금 무엇을 정하려는가
2. `참모`: 누가 이 안건을 본다
3. `흐름`: 다음에 어떤 단계로 간다
4. `운영 기준`: 무엇이 자동이고 무엇이 gate인지

### visual priority rule
- `Mission / Council` 상단은 설명 패널보다 `charter`와 `cast`가 먼저 읽혀야 한다.
- `Taskboard / Logs / Artifacts / Decision Inbox`는 여전히 `advanced ops mode`로 남고, HQ 연출보다 판단 속도가 우선이다.
- avatar는 display-only readability layer로 사용하고 runtime role id나 execution semantics를 바꾸지 않는다.

### copy rule
- user-facing shell copy는 한국어를 기본으로 유지한다.
- `goal / crew / flow / rule` 같은 product concept은 한국어 설명으로 먼저 전달하고, structural id는 내부에만 남긴다.

## thin-slice implementation checklist
- [x] 외부 repo를 reference로 보고 채택/배제 패턴을 문서화한다.
- [x] `Mission / Council` first viewport에 `목표 / 참모 / 흐름 / 운영 기준` charter를 올린다.
- [x] HQ/cast 연출은 유지하되 company simulator semantics는 넣지 않는다.
- [x] 새 charter를 smoke로 고정한다.
- [x] `dify`와 `crewAI`에서 가져온 `flow visibility`를 `누가 맡는지 + 지금 어느 단계인지`가 같이 보이는 `flow ownership rail`로 압축한다.
- [x] `flow ownership rail`을 읽기 전용 strip이 아니라 현재 mission context를 유지한 채 `Mission / Council / Execution / Deliverables`로 바로 점프하는 mission-control rail로 연결한다.

## 즉시 적용한 product slice
- `goal charter`: `paperclip`의 workspace clarity를 참고해 첫 화면에서 현재 안건 목표를 한 카드로 먼저 보여 준다.
- `crew lineup`: `claw-empire`, `oh-my-openagent`, `crewAI`의 role visibility를 참고해 어떤 참모가 이 안건을 다루는지 바로 보이게 둔다.
- `flow ownership rail`: `dify`의 workflow readability와 `crewAI`의 crews + flows framing을 참고해 각 단계마다 `owner / status / next summary`를 같이 보여 준다.
- `mission-control rail`: 같은 흐름 rail에서 현재 mission selection을 유지한 채 각 owning surface로 바로 이동하게 만들어, 설명 strip이 아니라 첫 화면 control surface로도 쓰이게 한다.
- `operating rules`: current repo 계약을 그대로 따라 `project_path`, `review`, `approval`, `bounded execution`을 first viewport에 같이 올린다.

## 결론
이 5개 repo에서 현재 Orchestration 1.0이 가져와야 할 핵심은 `goal clarity + visible crew + visible flow + explicit operating rules`이다. 반대로 `company simulator`, `generic workflow studio`, `chatbot-first shell`, `provider breadth`, `team workspace management`는 현재 baseline에 넣지 않는 편이 맞다.
