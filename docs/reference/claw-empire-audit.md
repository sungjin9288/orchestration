# claw-empire Historical Audit Draft

## Current Status
This document is a historical reference-audit snapshot. It is not the current source of truth for
Orchestration 1.0 scope, open work, or implementation backlog.

Use the current source-of-truth files for active policy and completion decisions:
- `docs/00_master-brief.md`
- `docs/01_decision-log.md`
- `docs/02_ia-v1.md`
- `docs/03_architecture-roadmap-v1.md`
- `packs/development/pack.md`
- `docs/17_v1-completion-readiness.md`

The historical open questions below have been reconciled into the current V1 and post-v1 baseline.
Do not treat this reference document's historical `[OPEN]` content as active implementation work.

## 목적
이 문서는 `claw-empire`를 오케스트레이션 1.0의 참고 레포로 검토한 결과를 정리한다. 목표는 그대로 복제하는 것이 아니라, 오케스트레이션의 v1 기준인 `local-first / single-user-first / ops-first / development pack only`에 맞는 패턴만 선별적으로 채택하는 것이다.

## 분석 기준
- local-first: 로컬 파일과 로컬 실행 흐름이 기준이어야 한다.
- single-user-first: 팀 협업 기능보다 개인 운영 효율을 우선한다.
- ops-first: 예쁜 화면보다 task 상태, 막힘, 로그, 산출물, 승인 가시성을 우선한다.
- development pack only: v1은 `development` pack 하나만 실제 운영 가능 상태로 만든다.

## 분석 근거
- 이 문서는 초기 audit 당시의 historical snapshot이다. 현재 저장소의 필수 문서와 completion baseline은 위 Current Status의 source-of-truth 파일로 이동했다.
- `claw-empire`는 로컬 클론이 아닌 공개 문서 기준으로 검토했다.
- 참고한 공개 문서:
  - `README.md`
  - `AGENTS.md`
  - `docs/api.md`

## 채택

### 1. project 패턴
- 판정: 채택
- 이유: `project_path`를 명시적으로 요구하고, 프로젝트를 실행의 기본 컨텍스트로 두는 설계는 오케스트레이션 v1과 강하게 맞는다.
- 오케스트레이션 반영:
  - `project_path` 없으면 task 생성/실행 금지
  - project를 task, artifact, decision, review의 상위 컨텍스트로 사용
  - 다중 프로젝트를 지원하되 single-user 기준의 로컬 registry로 시작
- 구현 우선순위: P0

### 2. task 패턴
- 판정: 채택
- 이유: 요청을 바로 실행하지 않고 task 객체로 관리하는 방식은 stage-gated 운영에 적합하다.
- 오케스트레이션 반영:
  - `router -> planner -> architect -> task-breaker -> builder -> reviewer -> human gate`
  - task는 상태, 담당 role, blocker, linked artifact, decision 필요 여부를 가진다
  - task는 thin-slice 단위로 쪼개고 `done`은 review 이후에만 허용
- 구현 우선순위: P0

### 3. worktree 패턴
- 판정: 채택
- 이유: task 단위 worktree 격리는 병렬 시도, 실험, 리뷰, 폐기 처리에 모두 유리하다.
- 오케스트레이션 반영:
  - task별 전용 worktree 생성
  - `diff / merge / discard`를 런타임이 추적
  - merge 전 review와 approval을 필수 게이트로 둔다
- 구현 우선순위: P0

### 4. log 패턴
- 판정: 채택
- 이유: 실행 로그와 terminal 흐름은 ops-first UI의 핵심 표면이다.
- 오케스트레이션 반영:
  - task/run/role 단위 로그를 연결
  - `run / stop / resume` 수준의 최소 제어면 제공
  - 마지막 에러, 마지막 이벤트, prior run 여부를 표시
- 구현 우선순위: P0

### 5. report 패턴
- 판정: 채택
- 이유: 완료 시점에 근거를 묶은 보고서를 남기는 구조는 artifact/history 운영에 도움이 된다.
- 오케스트레이션 반영:
  - completion report는 `무엇을 했는가 / 무엇을 검증했는가 / 무엇이 남았는가`를 남긴다
  - report는 독립 화면보다 `Artifacts`와 `Decision Inbox`에서 추적 가능해야 한다
  - runbook, review evidence, deployment guide를 artifact로 함께 묶는다
- 구현 우선순위: P1

### 6. api 패턴
- 판정: 채택
- 이유: 얇고 명확한 control-plane API는 UI와 runtime 분리에 유리하다.
- 오케스트레이션 반영:
  - 초기 API surface는 최소한 아래 범위를 다룬다
  - `/projects`
  - `/tasks`
  - `/runs` 또는 `/terminal`
  - `/worktrees`
  - `/artifacts`
  - `/decision-inbox`
  - `/reviews`
  - `/approvals`
- 구현 우선순위: P1

### 7. AGENTS 패턴
- 판정: 채택
- 이유: 레포별 `AGENTS.md`를 통해 실행 규칙을 주입하는 방식은 local-first와 repo-files-first에 잘 맞는다.
- 오케스트레이션 반영:
  - AGENTS는 역할 연출 문서가 아니라 운영 계약 문서로 사용
  - 핵심 규칙:
    - `project_path required`
    - `review before done`
    - `approval before commit`
    - 계약 밖 구조 변경 금지
    - architecture/auth/billing/infra/release는 human gate
  - `CEO/company` 서사는 제거하고 실무 규칙만 남긴다
- 구현 우선순위: P1

### 8. bootstrap 패턴
- 판정: 채택
- 이유: 설치 이후 첫 실행까지의 환경 점검과 규칙 주입을 한 번에 처리하면 운영 진입 비용이 줄어든다.
- 오케스트레이션 반영:
  - bootstrap은 아래까지만 담당한다
  - scaffold 생성
  - AGENTS 주입 또는 갱신
  - provider health check
  - 기본 secret/config 확인
  - worktree 및 runtime 사전 조건 점검
- 구현 우선순위: P1

## 기각

### 1. pixel office
- 판정: 기각
- 이유: pixel office는 시각적 재미와 상황 연출에는 유리하지만, v1의 ops-first 기준과 직접적으로 맞지 않는다.
- 처리 방침:
  - primary UI로 채택하지 않는다
  - 필요하면 post-v1의 보조 `Office View / Radar`로만 검토한다

### 2. rankings
- 판정: 기각
- 이유: ranking, XP, leaderboard는 single-user 운영도구의 핵심 문제를 풀지 못한다.
- 처리 방침:
  - v1 구현 범위에서 제외
  - task throughput, blocker age, review latency 같은 운영 지표로 대체

### 3. messenger
- 판정: 기각
- 이유: Slack/Telegram/Signal/WhatsApp 계열 연동은 메시징 플랫폼 운영과 인증 부담을 크게 늘린다.
- 처리 방침:
  - v1에서는 메신저 연동을 넣지 않는다
  - chat assist panel과 local inbox로 대체
  - post-v1에 `inbox adapter`로만 재검토 가능

### 4. multi-provider
- 판정: 기각
- 이유: v1에서 중요한 것은 provider 다양성이 아니라 실행 책임과 상태 정합성이다.
- 처리 방침:
  - `single-provider-first + adapter boundary`를 채택
  - provider 교체 가능성은 adapter 경계로만 확보
  - 초기부터 provider matrix를 운영하지 않는다

### 5. OAuth
- 판정: 기각
- 이유: 범용 OAuth 플랫폼 레이어는 auth product를 먼저 만드는 방향으로 흐르기 쉽다.
- 처리 방침:
  - v1 core에 일반화된 OAuth 계층을 두지 않는다
  - 초기 provider가 OAuth를 강제할 경우 adapter 내부 구현으로 국소화한다
  - 사용자/권한/조직 개념까지 확장하지 않는다

### 6. virtual company / CEO narrative
- 판정: 기각
- 이유: company, CEO, department 같은 연출은 재밌지만 오케스트레이션의 운영 계약을 흐릴 가능성이 높다.
- 처리 방침:
  - role은 `router/planner/architect/task-breaker/builder/reviewer` 같은 실행 역할로만 유지
  - 문법 설탕이 필요해도 운영 객체보다 위에 두지 않는다

## Historical Open Questions And Current Disposition

These items were open in the original audit snapshot. They are preserved for provenance only and
must not be counted as current open implementation items.

| Historical question | Current disposition |
| --- | --- |
| 초기 provider 실명 | Resolved by the current local-stub default plus narrow `openai-responses` opt-in boundary behind the existing adapter. |
| task 상태 머신 | Resolved by the implemented `Inbox -> In Progress -> Review -> Done` lifecycle plus blocker, approval, and decision flags. |
| report taxonomy | Resolved by the current artifact taxonomy, completion readiness evidence, review evidence, runbook, and delivery artifacts. |
| AGENTS 입력 문법 | Resolved as repo-file source-of-truth plus normal operator text; no new syntax sugar is active in V1. |
| bootstrap 범위 | Resolved as local-first project registration and runtime bootstrap; provider setup and example seeding are not hidden V1 requirements. |
| Office View 시점 | Reframed into the implemented Mission / Council / Execution / Deliverables shell and advanced ops surfaces; no pixel-office gameplay baseline is active. |
| messenger/OAuth 후속 위치 | Still excluded from V1 core; any future adapter work must preserve local-first, single-user-first, and ops-first boundaries. |
| 공개 문서 기준 분석 한계 | Preserved as provenance only; current decisions come from repo source-of-truth docs and executable smoke gates. |

## 구현 우선순위

### Phase 1. 문서 계약과 객체 정의
1. `Project`, `Task`, `Run`, `Artifact`, `Decision`, `Review`, `Approval`, `Worktree` 최소 계약 확정
2. `development pack only` 전제를 문서와 AGENTS에 고정

### Phase 2. thin runtime 핵심
1. `project` 생성/선택
2. `task` lifecycle
3. `worktree` 생성/폐기/merge 제어
4. `log` 수집과 terminal 연결

### Phase 3. quality gate와 artifact
1. `report` 생성
2. `review`와 `approval` 연결
3. `decision inbox` 운영

### Phase 4. control-plane API
1. UI가 기대는 최소 API surface 확정
2. runtime과 UI를 분리 가능한 수준으로만 구현

### Phase 5. AGENTS와 bootstrap
1. AGENTS 규칙 주입
2. bootstrap으로 초기 환경 검증
3. first-run 진입 비용 최소화

### Phase 6. 후순위 항목 유지
1. `pixel office`
2. `rankings`
3. `messenger`
4. `OAuth`
5. `multi-provider`

## 결론
`claw-empire`에서 오케스트레이션 v1이 가져와야 할 핵심은 `project/task/worktree/log/report/api/AGENTS/bootstrap`의 control-plane 패턴이다. 반대로 `pixel office`, `rankings`, `messenger`, 범용 `OAuth`, `multi-provider-first`, `virtual company` 연출은 v1 기준에서는 의도적으로 제외하는 편이 맞다.
