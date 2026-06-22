# Case Study

## 1. 배경

- 이 프로젝트를 시작한 배경: 로컬 개발 프로젝트에서 AI-assisted 실행을 사용하더라도 실행 단위, 로그, 산출물, 리뷰, 승인 근거가 분산되면 작업 완료를 신뢰하기 어렵다.
- 해결하려는 사용자 문제: 단일 사용자가 로컬 repo에서 개발 작업을 실행할 때 현재 project, task, run, artifact, review, approval 상태를 한 흐름으로 확인하고 통제해야 한다.
- 이 문제가 중요한 이유: AI 또는 자동화가 파일을 변경하는 경우 실행 근거와 승인 경계가 불명확하면 회귀, 무단 변경, 완료 착각이 발생한다.
- 현재 개발 진행 상태: repo docs 기준 v1 control-plane baseline과 post-v1 shell baseline은 완료로 기록되어 있으며, 현재는 growth gateway와 self-improvement status contract가 read-only 형태로 고도화 중이다.

## 2. 문제 정의

### As-Is

- 현재 사용자는 어떤 방식으로 문제를 해결하고 있는가? 터미널, git diff, 수동 메모, 채팅 기록, 테스트 실행 결과를 따로 확인한다.
- 기존 방식의 한계는 무엇인가? 실행 흐름과 승인 근거가 연결되지 않아 어떤 artifact가 어떤 run과 review에 기반했는지 추적하기 어렵다.

### Pain Points

- 불편 1: 프로젝트 경로가 명확하지 않으면 실행 결과의 책임 범위가 불분명하다.
- 불편 2: 리뷰와 승인 없이 작업이 완료된 것처럼 보일 수 있다.
- 불편 3: 로그, 산출물, 결정 항목이 분리되어 후속 작업과 면접 설명 근거를 모으기 어렵다.

## 3. 목표

### MVP 목표

- 로컬 프로젝트를 등록하고 task lifecycle을 `Inbox -> In Progress -> Review -> Done`으로 관리
- planner부터 reviewer까지 development pack loop를 실행
- artifact, log, review, approval, decision inbox를 연결

### 기술 목표

- Node.js 기반 local HTTP server와 file-based runtime 구현
- provider adapter boundary로 `local-stub` 기본값과 `openai-responses` opt-in 실행 분리
- smoke scripts로 local-first regression gate 유지

### 사용자 목표

- 로컬 작업의 현재 상태, 막힌 이유, 다음 실행 단계, 승인 필요 항목을 한 화면에서 확인
- 산출물과 원문 근거를 함께 추적

### 학습 목표

- 로컬 runtime 상태 모델링
- bounded mutation 및 approval gate 설계
- AI provider adapter와 fail-closed 검증 설계
- 문서 기반 product contract 관리

## 4. 해결 접근

- 어떤 기능으로 문제를 해결하려 했는가? project/task/run/artifact/review/approval/decision 객체를 runtime에 두고, UI와 API로 실행 흐름을 통제한다.
- AI/IT 기술을 어디에 적용했는가? `planner`, `architect`, `task-breaker`, `builder`, `reviewer` 역할 실행에 provider adapter를 적용한다.
- 왜 이 기술스택을 선택했는가? local-first와 빠른 검증을 위해 외부 DB나 프레임워크 없이 Node.js, file storage, static UI를 사용했다.
- 현재 구현된 접근: local-stub 기본 실행, OpenAI Responses opt-in adapter, static UI, file-based runtime, smoke checks
- 향후 목표 접근: growth gateway, reflection evaluator, proposal queue, memory/skill registry를 read-only status에서 승인 기반 개선 루프로 확장

## 5. 구현 범위

### 구현 완료

- `createRuntimeService` 기반 프로젝트, 미션, 태스크, 실행, artifact, decision, approval 관리
- `createExecutionCoordinator` 기반 planner-through-reviewer 및 local follow-up 실행
- `scripts/serve-ui-slice-01.mjs` 기반 local UI/API server
- `ui/app.js` 기반 Mission, Council, Execution, Deliverables, Taskboard, Logs, Artifacts, Decision Inbox 렌더링
- `local-stub` 및 `openai-responses` provider adapter
- `packs/development/pack.md` 및 `packs/knowledge-work/pack.md` 기반 pack contract

### 개발 중

- read-only growth gateway와 self-improvement contract scripts
- optional live-provider real smoke 재검증
- README, demo, portfolio artifact 정리

### 미구현 / 예정

- public deployment
- user auth
- multi-user workspace
- external release automation
- 정량 성과 수집

### 이번 MVP에서 제외한 범위

- 제외한 기능: multi-provider-first platform, multiplayer workspace, OAuth-first product, external push/publish/release automation
- 제외한 이유: repo source-of-truth가 local-first, single-user-first, ops-first v1 boundary를 고정하고 있기 때문

## 6. 시스템 설계

- 전체 구조: static UI -> local HTTP server -> runtime service -> execution coordinator -> provider adapter -> file store
- 데이터 흐름: API action이 runtime state를 갱신하고, artifact/log는 file store에 저장되며, UI는 `/api/snapshot`으로 최신 상태를 다시 읽는다.
- API 구조: `/api/projects`, `/api/missions`, `/api/tasks`, `/api/tasks/:id/run-*`, `/api/decision-inbox/:id/actions`, `/api/artifacts/:id`
- AI/LLM 처리 흐름: `executeWithAdapter`가 project provider config에 따라 `local-stub` 또는 `openai-responses` adapter를 호출한다.
- 예외 처리: coordinator readiness와 fail-closed guard로 missing context, stale provenance, invalid approval을 차단한다.
- 보안/환경변수 처리: secret 값은 repo/runtime state에 저장하지 않고 env var name만 provider config에 둔다.
- 배포 계획: 현재 미구현. local server 또는 recorded demo 우선 보강 필요

## 7. 나의 역할

- 기획: 확인 필요. repo docs 기준 product boundary와 user flow 정의에 기여한 것으로 설명 가능
- 요구사항 정의: `AGENTS.md`, master brief, decision log, pack contract로 설명 가능
- 프론트엔드: `ui/app.js`, `ui/index.html`, `ui/styles.css` 근거로 설명 가능
- 백엔드: `scripts/serve-ui-slice-01.mjs`, `src/runtime/*`, `src/execution/*` 근거로 설명 가능
- AI/LLM: provider adapter boundary와 OpenAI Responses opt-in adapter 근거로 설명 가능
- 데이터 처리: file-based state/log/artifact persistence 근거로 설명 가능
- 배포: 미구현
- 문서화: `docs/*`, `packs/*`, portfolio docs 근거로 설명 가능

## 8. 결과

- 구현 완료 기능: local-first runtime, execution coordinator, provider adapter, UI shell, artifact/log persistence, review/approval gates
- 로컬 실행 가능 여부: `scripts/serve-ui-slice-01.mjs` 기준 가능. README 실행 가이드는 보완 필요
- 테스트 여부: 다수의 `scripts/smoke-*.mjs` 존재. 이번 문서 작업에서는 zip 검증 중심으로 수행
- 배포 여부: 미구현
- 사용자 피드백: 현재 없음. 임의 생성 금지
- 수치 성과: 현재 없음. 임의 생성 금지
- 공개 데모 상태: hosted public demo는 미공개이며, 현재는 `docs/public-demo-screencast-plan.md` 기준 recorded local-first walkthrough를 우선한다.
- 대표 검증 근거: `evidence/cli-logs/smoke-v1-user-flow-kickoff-2026-06-22.status`

## 9. 배운 점

- 기술적으로 배운 점: file-based runtime도 artifact provenance와 lifecycle guard가 있으면 작은 local control plane을 구성할 수 있다.
- 설계에서 배운 점: AI execution은 provider 호출보다 project context, review, approval, rollback boundary가 먼저 고정되어야 한다.
- 사용자 관점에서 배운 점: 작업자는 raw log보다 현재 상태, 막힌 이유, 다음 행동을 먼저 확인해야 한다.
- 다음 프로젝트에 반영할 점: README, demo, screenshot, smoke evidence를 개발 중간부터 함께 관리한다.

## 10. 이 프로젝트가 보여주는 역량

- 개발 역량: Node.js local server, runtime state management, provider adapter, UI rendering
- 문제정의 역량: AI-assisted local execution의 추적성과 승인 통제 문제 정의
- 데이터/AI 활용 역량: role-based provider execution boundary와 structured output adapter 설계
- 커뮤니케이션/문서화 역량: decision log, architecture roadmap, pack contract, portfolio docs 작성
- 컨설팅형 사고: 요구사항, 사용자 흐름, 승인선, 기대효과를 구조화해 기술 구현과 연결
