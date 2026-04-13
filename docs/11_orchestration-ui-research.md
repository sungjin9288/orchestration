# Orchestration UI Research Reset

## Purpose
이 문서는 current `company-shell` local reset을 그대로 더 밀기 전에, 실제로 `orchestration` 제품이 어떤 구조와 시각 언어를 가져야 읽기 쉬운지 다시 조사한 결과를 정리한 research brief다.

사용자 피드백은 명확했다.

- current shell은 아직도 `사용 가능한 제품` 보다 `조정 중인 themed website` 에 가깝다.
- 문제는 단순히 예쁜가 못생겼는가가 아니라, first viewport가 `무엇이 현재 활성인지`, `누가 잡고 있는지`, `어디서 막히는지`, `다음에 무엇을 해야 하는지` 를 빠르게 전달하지 못하는 데 있다.
- 그래서 다음 구현은 incremental polish가 아니라, research-grounded reset 기준에서 다시 잘라야 한다.

## Research Question

1. modern internal-tool / orchestration UI는 무엇을 first viewport에 둬야 하는가
2. `회사 느낌` 은 어떤 구조에서 생기고, 어떤 장식에서 망가지는가
3. Orchestration의 `Mission / Council / Execution / Deliverables / Advanced Ops` 는 어떤 정보 구조를 가져야 하는가

## External Reference Scan

| Source | Observed cue | What to borrow | What not to copy |
| --- | --- | --- | --- |
| [claw-empire](https://github.com/GreenSheep01201/claw-empire) | visible cast, department framing, status counts, room-based company posture | `who is on shift`, `which team owns what`, `meeting/workday mental model` | pixel-office gameplay, cute ornament, management-sim tone |
| [paperclip](https://github.com/paperclipai/paperclip) / [paperclip.ing](https://paperclip.ing/) | organization chart, tasks, goals, budgets, governance를 한 control surface로 묶음 | one workspace that treats company operations as one system, cleaner product polish | org-management/budget simulator as primary v1 shell |
| [agency-agents](https://github.com/msitarzewski/agency-agents) | specialist roster, explicit role identity, deliverable-focused agent cast | role roster와 책임 분리를 front-stage에 두는 방식 | personality theater가 workflow보다 앞서는 framing |
| [OpenHarness](https://github.com/HKUDS/OpenHarness) | harness, permissions, memory, tools, workflow, agent layers 분리 | internal structure clarity, governance boundary, retry/backoff posture | infra/harness docs를 product shell copy로 직접 노출하는 것 |
| [LangSmith Studio](https://docs.langchain.com/langsmith/studio) | graph/chat modes, assistants, traces, threads, memory를 한 studio에서 다룸 | operator가 `control` 과 `inspection` 을 같이 본다는 구조 | generalized AI studio를 그대로 가져오는 것 |
| [Prefect work pools](https://docs.prefect.io/v3/concepts/work-pools) | work pools / queues / priority / concurrency / deployment routing | execution surface를 queue-first control plane으로 보는 방식 | infra scheduler terminology를 shell 전면 copy로 쓰는 것 |
| [n8n executions](https://docs.n8n.io/workflows/executions/single-workflow-executions/) / [debug + re-run](https://docs.n8n.io/workflows/executions/debug/) | workflow editor와 execution/debug path가 강하게 연결됨 | build surface와 run/debug surface를 가까이 두는 구조 | canvas-first product framing을 그대로 복제하는 것 |

## Research Findings

### 1. 좋은 orchestration UI는 `hero` 가 아니라 `current state` 로 시작한다

reference 전반에서 공통적으로 보이는 것은 `현재 무엇이 열려 있는지`, `누가 담당하는지`, `실행은 어디까지 갔는지`, `다시 돌릴 수 있는지` 를 first viewport에서 바로 잡아준다는 점이다.

`marketing lead copy -> summary cards -> decorative strip -> actual work surface` 순서는 orchestration 제품과 맞지 않는다. operator는 소개를 읽으려고 들어오지 않고, 지금 시스템이 어떤 상태인지 판단하려고 들어온다.

### 2. `회사 느낌` 은 room metaphor보다 ownership과 ritual에서 생긴다

`claw-empire` 가 주는 유효한 cue는 픽셀이 아니라 `visible staff`, `department ownership`, `meeting posture`, `company-like routine` 이다. 반대로 pixel office, mascot, cute ornament를 그대로 가져오면 바로 game/roleplay 톤이 강해진다.

즉, 회사 느낌은 아래에서 생긴다.

- 누가 현재 근무 중인지
- 어떤 안건이 회의 중인지
- 어느 승인선에서 멈췄는지
- 어떤 패킷이 리뷰 중인지
- 다음 handoff가 어디인지

회사 느낌은 장식 noun을 늘리는 방식이 아니라, `staff / meeting / queue / packet / approval` 을 실제 상태로 보여 주는 방식에서 생긴다.

### 3. `트렌디하고 깔끔한 internal tool` 은 조용하고 촘촘하다

reference 중 상대적으로 modern product polish가 좋은 쪽은 공통적으로 아래 특성을 가진다.

- low-chroma palette
- limited accent colors
- 짧은 header copy
- split-pane 또는 register-first layout
- row/table/list 중심의 dense information hierarchy
- shadow보다 border, rail, spacing rhythm
- decorative metaphor보다 `filters / owners / state / evidence`

즉, trendy함은 화려한 카드가 아니라 `조용한 chrome + 강한 hierarchy + 즉시 해석 가능한 state` 에서 나온다.

### 4. orchestration 제품은 `design system` 보다 먼저 `operator narrative` 를 정해야 한다

Orchestration에서는 사용자가 실제로 알고 싶은 질문이 항상 비슷하다.

1. 지금 어떤 안건이 active 인가
2. 지금 어느 desk/surface가 owner 인가
3. 사람이 막고 있는가, 자동으로 흐르는가
4. 결과 패킷은 어디까지 준비됐는가
5. 이상하면 어디에서 trace/log/artifact를 열어야 하는가

이 다섯 질문을 first viewport와 each surface에서 같은 구조로 반복해서 답해야 한다.

## Current Shell Diagnosis

current local shell은 이전보다 company tone으로 이동했지만, 여전히 사용성이 떨어지는 핵심 이유가 있다.

### A. first viewport가 너무 많이 쌓여 있다

current shell은 sidebar intro, summary, floor board, focus strip, surface entry frame이 순서대로 겹친다. 정보는 많지만 operator가 `지금 뭘 해야 하는가` 로 진입하기까지 여러 레이어를 읽어야 한다.

### B. left rail이 아직 action-first가 아니다

sidebar에 status register가 추가되긴 했지만, 여전히 brand/introduction copy 비중이 크고 실제 queue나 active mission list가 먼저 나오지 않는다.

### C. 반복적인 metaphor label이 control보다 많다

`desk / board / register / line / pulse / focus` 같은 단어가 많지만, 그 라벨이 실제 action cost를 줄여 주지는 않는다. label density가 높은데 operator clarity는 그만큼 올라가지 않는다.

### D. surface body는 여전히 `operator grid` 보다 `themed card system` 에 가깝다

Mission, Council, Execution, Deliverables가 각각 회사형 noun을 더 쓰긴 했지만, `queue -> selection -> detail -> evidence -> next action` 구조가 강하게 고정되어 있지 않아서 사용자가 surface마다 읽는 법을 다시 배워야 한다.

### E. Advanced Ops authority는 옳지만 adjacency가 약하다

현재 contract는 `Advanced Ops` authority를 잘 지키고 있다. 문제는 primary shell에서 `inspectability` 의 존재감이 약해서, 실제로 무엇이 evidence truth인지 first use에서 덜 선명하게 읽힌다.

## Design Thesis For Orchestration

### Orchestration should look like this

- `single operator control room`
- `AI staff on shift`
- `meeting and approval ritual`
- `execution queue with explicit blockers`
- `delivery packets with traceable evidence`

### Orchestration should not look like this

- marketing homepage with internal-tool styling
- gamified company sim
- whimsical AI office
- generic chatbot with tabs
- card collage where each surface invents its own layout language

## Recommended Information Architecture

## 1. Global Shell

### Top bar
- current project
- current environment/runtime
- active mission
- open approvals
- active runs
- one quick action group

### Left rail
- active missions queue
- today on-shift roles
- open approvals / blocked runs
- current navigation

Left rail should be queue-first and action-first. Intro copy는 secondary여야 하고, 1~2 lines를 넘기지 않는 편이 좋다.

### Main workspace
- current surface only
- split into `selection rail / active detail / operator-evidence rail`

### Bottom or right inspector
- logs
- artifacts
- decision inbox
- trace links

`Advanced Ops` 는 separate authority surface로 유지하되, inspectability 자체는 메인 shell과 더 가까워져야 한다.

## 2. Surface Structures

### Mission
- left: active mission register
- center: selected mission charter + scope + next council trigger
- right: assigned roles preview + current blocker + next meeting CTA

Mission은 intake desk이지, 설명 hero가 아니다.

### Council
- left: attendee roster
- center: agenda / objection / recommendation board
- right: adopted plan + approval-needed points + next execution handoff

Council은 recommendation card가 아니라 실제 meeting room이어야 한다.

### Execution
- left: work-order queue
- center: selected run/task state, current owner, blocker, gate
- right: evidence checklist, retry/review gate, next artifact expectation

Execution은 abstract stage overview가 아니라 queue control surface여야 한다.

### Deliverables
- left: packet list
- center: selected packet summary + evidence bundle + reviewer stance
- right: approval line + close-out + next handoff

Deliverables은 report card shelf가 아니라 packet desk여야 한다.

### Advanced Ops
- logs / artifacts / decision inbox / taskboard 를 maintain
- 하지만 layout grammar는 primary shell과 맞춰서 `inspection control plane` 처럼 읽혀야 한다

## Visual Direction

### Keep
- warm neutral canvas
- restrained semantic accent
- compact chips
- mono ids
- structured row systems

### Change
- 줄글 intro copy를 과감히 줄인다
- stacked summary strips를 한 control header로 통합한다
- repeated metaphor labels를 줄인다
- large rounded card feel을 더 말린다
- serif authority를 shell headline 전체가 아니라 limited emphasis에만 쓴다

## First-Viewport Contract

다음 구현부터는 first viewport가 아래 네 질문에 5초 안에 답해야 한다.

1. 지금 active mission은 무엇인가
2. 지금 owner는 어느 역할/desk인가
3. 지금 막고 있는 gate/blocker는 무엇인가
4. 다음 action은 어디로 가야 하는가

이 네 질문에 바로 답하지 못하는 strip/card/copy는 first viewport에서 제거하거나 아래로 내리는 편이 맞다.

## Implementation Checklist

다음 구현은 아래 순서로 다시 잘라야 한다.

1. first viewport를 `one control header + one tri-pane workspace` 로 줄인다
2. left rail을 intro-first에서 mission/approval queue-first로 바꾼다
3. `Mission / Council / Execution / Deliverables` 를 모두 같은 `rail / detail / evidence` grammar로 맞춘다
4. `Advanced Ops` 를 separate authority로 유지하되 evidence adjacency를 강화한다
5. long helper prose를 owner/state/next-action row로 대체한다

## Wireframe Template

```text
+----------------------------------------------------------------------------------+
| Project | Active mission | Open approvals | Active runs | Runtime | Quick action |
+----------------------+--------------------------------------+--------------------+
| Mission queue        | Current surface workspace            | Owner / gate /     |
| Approval queue       | - selected item                      | evidence rail      |
| Staff on shift       | - main detail                        | - current owner    |
| Nav                  | - next action                        | - blocker          |
|                      |                                      | - packet / trace   |
+----------------------+--------------------------------------+--------------------+
```

## Sources

- [claw-empire](https://github.com/GreenSheep01201/claw-empire)
- [paperclip](https://github.com/paperclipai/paperclip)
- [paperclip.ing](https://paperclip.ing/)
- [agency-agents](https://github.com/msitarzewski/agency-agents)
- [OpenHarness](https://github.com/HKUDS/OpenHarness)
- [LangSmith Studio](https://docs.langchain.com/langsmith/studio)
- [Prefect work pools](https://docs.prefect.io/v3/concepts/work-pools)
- [n8n workflow executions](https://docs.n8n.io/workflows/executions/single-workflow-executions/)
- [n8n debug and re-run](https://docs.n8n.io/workflows/executions/debug/)
