# Company Shell Design Reset

## Purpose
이 문서는 Orchestration의 다음 디자인 리셋을 `soft HQ metaphor` 에서 `ERP/company command center` 로 명시적으로 전환하기 위한 source-of-truth brief다.

핵심 목표는 단순하다.

- 지금 shell이 website처럼 읽히는 문제를 끝낸다.
- 역할을 맡은 AI들이 실제로 출근하고 회의하고 실행하고 보고하는 회사 운영 화면처럼 보이게 만든다.
- 그 위에서도 local-first, single-user-first, ops-first execution contract는 절대 흔들지 않는다.

## Product Direction
Orchestration의 기본 shell은 앞으로 아래처럼 읽혀야 한다.

- 사용자가 목표를 넣는다.
- 역할을 맡은 AI들이 회의에 참석한다.
- 합의 가능한 단계는 자동으로 이어서 진행한다.
- 사람이 승인해야 하는 곳에서만 멈춘다.
- 결과는 보고용 패키지와 승인선으로 정리된다.

즉, 제품은 `debug console with themed cards` 가 아니라 `company operating system for AI orchestration` 이어야 한다.

## Non-Negotiables
- `local-first / single-user-first / ops-first` 는 유지한다.
- `development pack only` 는 유지한다.
- `project_path required`, `review before done`, `approval before commit` 는 유지한다.
- `Taskboard / Logs / Artifacts / Decision Inbox` 는 `advanced ops mode` 로 유지한다.
- runtime ids, artifact taxonomy, provider boundary, approval/review semantics는 바꾸지 않는다.
- 허용되는 company feel은 `ERP/control-plane` 이다.
- 금지되는 방향은 `budget/HR/org-management simulator`, `pixel-office gameplay`, `messenger-first`, `ranking`, `multi-provider-first` 다.

## Reference Cues

### From `claw-empire`
- visible AI cast
- command-center density
- meeting posture
- company-like control framing

### From current Orchestration
- `Mission / Council / Execution / Deliverables`
- advanced ops authority
- bounded execution and explicit human gates
- artifact/review/approval provenance

### From `OpenHarness`
- explicit tool-use loop discipline
- retry/backoff and failure containment
- skill/plugin boundary clarity
- memory/session and governance layer separation
- permission rules and approval dialog posture
- delegation lifecycle as an internal structure reference, not a product-shell cue

### From `awesome-design-md`
- root-level `DESIGN.md` as an agent-readable design contract
- explicit sections for palette, typography, component rules, layout, depth, do/don'ts, and responsive behavior
- design guidance that future UI batches can read without reopening the whole product debate

## Reference Map

### Shell / Product Posture
- `claw-empire`: visible cast, command-center density, meeting/company shell
- `agency-agents`: specialist roster framing, role identity, deliverable-focused agent cast
- `claw-code`: harness-first CLI framing, health-check posture, durable workflow docs
- `oh-my-codex`: workflow-layer framing, project guidance, durable session state
- `multi-agent-workflow`: solver/critic/checker/synth debate pattern for `Council`

### Design-System Discipline
- `awesome-design-md`: `DESIGN.md` pattern itself
- `mrstack`: concise enterprise utility UI cues are useful, but Telegram-first surface is still out of scope

### Harness / Governance / Automation
- `OpenHarness`: tool loop, retry/backoff, skills/plugins, permissions, delegation
- `OpenSpace`: self-evolving skills, search/share, host integration posture
- `everything-claude-code`: memory, evals, hooks, security, subagent orchestration
- `fireauto`: hook-based automation, PRD/milestone knowledge capture, auto-learning posture

이 reference map은 `무엇을 가져올지` 와 `무엇을 안 가져올지` 를 나누기 위한 것이다. 하나의 레포를 통째로 따라가지 않는다.

## Internal Structure Cues
이번 reset의 1차 목표는 shell redesign이지만, 내부 구조도 아래 방향으로 더 단단해질 수 있다.

- execution loop는 더 명시적인 retry/backoff, timeout, and recovery discipline를 가져야 한다.
- skill/plugin/hook 경계는 UI shell과 별도로 문서화되어야 한다.
- memory/session/summary handling은 future dogfooding과 longer-lived missions를 위해 더 명확한 contract를 가져야 한다.
- permission/approval model은 이미 있는 human gate를 더 일관된 harness governance layer로 정리할 수 있다.
- delegated-task lifecycle은 현재 orchestration role chain과 충돌하지 않는 범위에서만 참고한다.

이 문서의 immediate slice는 UI 중심이지만, 구조 참고 레포는 `OpenHarness`, shell 참고 레포는 `claw-empire` 로 분리해 해석한다.

## Visual System Rules

### 1. ERP First, Not Website First
- 첫 화면은 landing page처럼 넓고 느슨한 hero가 아니라 dense한 command center처럼 보여야 한다.
- decorative copy보다 assignment, status, meeting agenda, work-order, approval-line이 먼저 보여야 한다.
- panel은 marketing-card보다 desk, queue, board, packet처럼 읽혀야 한다.

### 2. Role Assignment Must Feel Real
- 역할은 단순 캐릭터 장식이 아니라 실제 담당자처럼 보여야 한다.
- 각 role에는 최소한 `이름`, `담당`, `현재 상태`, `현재 안건에서의 입장` 이 보여야 한다.
- `출근`, `참석`, `대기`, `검토 중`, `실행 중`, `보고 완료` 같은 상태 언어를 사용할 수 있다.

### 3. Meeting Must Be A First-Class Surface
- `Council` 은 recommendation summary만 있는 카드가 아니라 실제 meeting room이어야 한다.
- agenda, 참석자, 핵심 의견, objection, recommendation, human alignment CTA가 한 화면 위계로 보여야 한다.

### 4. Execution Must Feel Like Work Orders
- `Execution` 은 abstract stage card가 아니라 현재 어떤 일이 누구에게 할당됐고 어디서 막혔는지 보이는 work-order surface여야 한다.
- current owner, blocked reason, next approval, expected artifact가 즉시 보여야 한다.

### 5. Deliverables Must Feel Like A Delivery Desk
- `Deliverables` 은 보고서 카드 모음이 아니라 결과 패키지 desk처럼 보여야 한다.
- review, approval, close-out, next handoff가 한 control line으로 읽혀야 한다.

## Surface Guidance

### Mission
- intake board
- active mission register
- assigned roles preview
- immediate next meeting CTA
- company health / current shift / active approvals 같은 dense top summary

### Council
- meeting room
- attendee roster
- agenda and objections board
- recommendation vote / adopted plan shelf
- user alignment CTA

### Execution
- work-order floor
- current stage owner
- queue / blocked reason / approval line
- expected artifacts and verification checkpoints

### Deliverables
- delivery desk
- evidence packet
- review outcome
- approval line
- close-out / next handoff desk

### Advanced Ops Mode
- debugger/control-plane authority
- deep inspection only
- first viewport도 same company-shell language를 일부 이어갈 수 있지만 authority는 ops surfaces에 둔다

## First Implementation Slices

### Slice 1. Global Shell Frame Reset
Target files:
- `ui/styles.css`
- `ui/index.html`
- `ui/app.js`

Goals:
- poster-like hero rhythm 축소
- denser masthead + company command bar 추가
- panel hierarchy를 website card에서 ERP desk/board hierarchy로 전환

### Slice 2. Mission Intake Board Reset
Target files:
- `ui/app.js`
- `ui/styles.css`
- related `scripts/smoke-ui-slice-*.mjs`

Goals:
- `Mission` first viewport를 intake desk + assignment board로 재구성
- goal input, current mission register, next meeting trigger를 한 구조로 정리

### Slice 3. Council Meeting Room Reset
Target files:
- `ui/app.js`
- `ui/styles.css`
- related `scripts/smoke-ui-slice-*.mjs`

Goals:
- attendee roster / agenda / objections / recommendation board를 한 회의 room으로 재구성
- 기존 role ordering과 approval semantics는 유지

### Slice 4. Execution Work-Order Reset
Target files:
- `ui/app.js`
- `ui/styles.css`
- related `scripts/smoke-ui-slice-*.mjs`

Goals:
- stage summary를 work-order / queue / gate control surface로 재구성
- current owner / next gate / blocked reason 가시성 강화

### Slice 5. Deliverables Delivery Desk Reset
Target files:
- `ui/app.js`
- `ui/styles.css`
- related `scripts/smoke-ui-slice-*.mjs`

Goals:
- result packet / review / approval / close-out desk를 한 delivery surface로 재구성
- artifact authority와 advanced-ops routing은 유지

## Verification
- docs-only reset 단계:
  - `node scripts/smoke-ui-slice-63.mjs`
  - `git diff --check`
- first visual slice 이후:
  - touched `smoke-ui-slice-*`
  - `node scripts/smoke-ui-slice-63.mjs`
  - `node scripts/smoke-qa-slice-07.mjs`

## Done Definition For The Reset
- source-of-truth docs가 `company/ERP shell` 방향을 명시적으로 허용한다.
- 새 UI batch가 `display-only HQ metaphor` 제약에 다시 막히지 않는다.
- first implementation slices가 files/verification까지 포함해 문서화되어 있다.

## Current Freeze Candidate

### First Viewport Contract
- first viewport는 `one control header + grouped workspace` 로 유지한다.
- `what is active / who owns it / what is blocked / what is next` 가 above-the-fold 에서 바로 읽혀야 한다.
- decorative hero strip, stacked intro bands, repeated summary layers는 다시 추가하지 않는다.

### Sidebar Contract
- `회사 디렉터리` 는 어느 메뉴에서나 계속 보여야 한다.
- visible AI roles, 현재 seat, 역할, desk ownership은 sidebar에서 persistent 하게 유지한다.
- intro copy보다 queue/ownership visibility가 우선이다.

### Workspace Contract
- `업무` = `workflow map -> selected work order -> execution handoff`
- `검토` = `queue -> selected packet -> inspector`
- `운영` = `scope tabs -> read-only roster -> mutation editor`
- 세 workspace 모두 `signal strip + playbook strip + body` grammar를 유지하되 body responsibility는 섞지 않는다.

### Vocabulary Contract
- CTA는 noun-first operator baseline으로 유지한다.
- accepted baseline:
  - `협의회 / 실행 / 산출물 / 아티팩트 / 결정함`
  - `바로 / 다음 / 이동`
  - `회의 초안 / 회의실 / 실행 셀 / 고급 운영`
- 다시 늘리지 않을 표현:
  - `... 열기`
  - `... 바로 열기`
  - `... 만들기`
  - `바로 이동`

### External Pattern Adoption Boundary
- external orchestration references는 runtime semantics가 아니라 `explicit workflow framing` 정도만 display layer에 반영한다.
- 최근 실제로 채택한 pattern은 [`oh-my-claudecode`](https://github.com/Yeachan-Heo/oh-my-claudecode), [`gstack`](https://github.com/garrytan/gstack), [`superpowers`](https://github.com/obra/superpowers), [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) 를 보고 정리한 `workspace playbook strip` 이다.
- local-first runtime, approval/review gate, provider boundary는 이 reference adoption 범위에 포함되지 않는다.

## Bundle Boundary For Commit Candidate

### Include In The Company-Shell Freeze Bundle
- source-of-truth design docs:
  - `DESIGN.md`
  - `docs/10_company-shell-design-reset.md`
  - `docs/11_orchestration-ui-research.md`
- primary shell files:
  - `ui/index.html`
  - `ui/app.js`
  - `ui/styles.css`
- grouped workspace/browser proof:
  - `scripts/qa-slice-06-runner.mjs`
  - `scripts/qa-slice-07-runner.mjs`
  - related `scripts/smoke-ui-slice-*` in the `246` through current freeze range
- task ledger:
  - `tasks/todo.md`
  - `tasks/lessons.md`

### Exact File Inventory For Current Snapshot
- docs
  - `DESIGN.md`
  - `docs/10_company-shell-design-reset.md`
  - `docs/11_orchestration-ui-research.md`
- shell implementation
  - `ui/index.html`
  - `ui/app.js`
  - `ui/styles.css`
- browser QA runners
  - `scripts/qa-slice-06-runner.mjs`
  - `scripts/qa-slice-07-runner.mjs`
- legacy smoke backfills that were explicitly synced to the current company-shell baseline
  - `scripts/smoke-ui-slice-{17,20,36,40,45,49,53,59,71,72,73,74,75,82,84,85,90,91,93,94,95,96,97,98,99,100,106,107,108,116,121,122,128,138,140,157,158,159,160,161,181,183,199,200,203,233,234,235,236,237,244,245}.mjs`
- reset-era smoke set
  - `scripts/smoke-ui-slice-{246..293}.mjs`
- ledgers
  - `tasks/todo.md`
  - `tasks/lessons.md`

### Staging Rule For This Bundle
- stage exact files from the inventory above only
- do not use repo-wide staging like `git add .`
- do not stage provider/runtime files just because they are dirty in the same worktree

### Keep Separate From The Visual Freeze Commit
- `src/execution/*`
- `scripts/smoke-provider-*`
- `scripts/qa-slice-05-runner.mjs`
- `docs/00_master-brief.md`
- `docs/01_decision-log.md`
- `docs/03_architecture-roadmap-v1.md`
- `docs/06_ai-orchestration-pivot.md`
- any provider/runtime slice that changes adapter, retry, or live execution semantics

### Do Not Reopen Without A New Slice
- product direction reset
- grouped workspace structure
- local-first / approval / review / provider boundaries
- `advanced ops mode` authority split

## Freeze Gate For This Bundle
- `node --check ui/app.js`
- `node scripts/smoke-ui-slice-246.mjs`
- `node scripts/smoke-ui-slice-271.mjs`
- `node scripts/smoke-ui-slice-274.mjs`
- `node scripts/smoke-ui-slice-275.mjs`
- `node scripts/smoke-ui-slice-278.mjs`
- `node scripts/smoke-ui-slice-289.mjs`
- `node scripts/smoke-ui-slice-293.mjs`
- `node scripts/smoke-ui-slice-63.mjs`
- `node scripts/smoke-qa-slice-06.mjs`
- `node scripts/smoke-qa-slice-07.mjs`
- `git diff --check`

Detailed external reference synthesis and the current-shell diagnosis now live in `docs/11_orchestration-ui-research.md`.
