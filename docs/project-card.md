# Project Card

## 1. Snapshot

- 프로젝트명: Orchestration 1.0
- 프로젝트 유형: 개인 / PoC
- 기간: 확인 필요
- 현재 상태: 고도화 중
- 내 역할: 확인 필요. 저장소 기준으로 기획, 개발, 문서화, 검증 흐름을 단일 프로젝트 안에서 관리한 개인 개발 프로젝트로 판단
- GitHub 링크: 추가 필요
- Demo 링크: 추가 필요
- 핵심 기술스택: JavaScript, Node.js, Vanilla HTML/CSS/JS, Node.js `http` local server, file-based JSON/JSONL storage, Git CLI, OpenAI Responses API opt-in adapter, local smoke scripts
- 이력서 반영 가능 여부: 조건부 가능
- 판단 이유: `src/runtime/*`, `src/execution/*`, `scripts/serve-ui-slice-01.mjs`, `ui/*`, `packs/development/pack.md` 기준으로 local-first 실행 제어, artifact/log persistence, review/approval gate, provider adapter, UI shell이 구현되어 있다. 현재 `README.md`는 screenshot/evidence manifest를 연결했지만 public demo, 사용자 검증, 성과 수치는 아직 없다.

## 2. One-liner

로컬 개발 프로젝트를 운영하는 단일 사용자의 실행 추적과 승인 누락 문제를 해결하기 위해 `project_path` 기반 작업 실행, 로그, 아티팩트, 리뷰, 승인 게이트를 개발 중인 local-first orchestration control plane.

## 3. Problem

- 이 프로젝트가 해결하려는 사용자 문제: AI-assisted 개발 실행이 어떤 프로젝트, 작업, 실행, 산출물, 리뷰, 승인에 연결되는지 추적하기 어렵다.
- 기존 방식의 불편함 또는 한계: 터미널 로그, git diff, 수동 메모, 채팅 기록이 분리되어 완료 판단과 후속 검토가 어렵다.
- 이 프로젝트에서 가장 중요한 문제정의: `project_path`를 기준으로 로컬 실행 범위를 고정하고, `review before done`과 `approval before commit`을 강제하는 것.
- 컨설팅 경험과 자연스럽게 연결되는 부분:
  - 문제정의: 실행 흐름의 불투명성과 승인 누락 리스크를 운영 문제로 구조화
  - 요구사항 정리: `AGENTS.md`, `docs/00_master-brief.md`, `packs/development/pack.md`에 운영 규칙과 금지 범위 정리
  - 사용자 관점: `Mission / Council / Execution / Deliverables`와 `Taskboard / Logs / Artifacts / Decision Inbox`로 사용자 흐름 분리
  - 문서화: decision log, architecture roadmap, pack contract, readiness docs로 프로젝트 경계 관리
  - 기대효과 정리: 실행 근거, 검토 상태, 승인 필요 항목을 한 흐름에서 확인 가능하게 설계

## 4. Solution

- 제공하려는 핵심 기능: 로컬 개발 작업을 project/task/run/artifact/review/approval 단위로 실행하고, UI에서 로그와 decision queue를 확인하는 control plane
- 현재 실제로 제공 가능한 기능:
  - 프로젝트 등록/선택: `createProject`, `/api/projects`, `/api/projects/:id/select`
  - 미션/태스크 생성: `createMission`, `createTask`, `/api/missions`, `/api/tasks`
  - 개발 pack 실행: `runPlanner`, `runArchitect`, `runTaskBreaker`, `runBuilderPreflight`, `runBuilderLiveMutation`, `runReviewer`
  - downstream local follow-up: `runCommitPackage`, `runLocalCommit`, `runReleasePackage`, `runCloseOut`
  - artifact/log persistence: `createFileStore`, `recordArtifact`, `appendLogRecord`
  - review/approval/decision inbox: `resolveReview`, `requestBuilderLiveMutationApproval`, `resolveDecisionInboxItem`
  - static web UI/API server: `scripts/serve-ui-slice-01.mjs`
- 개발 중인 기능: growth gateway와 self-improvement read-only status contracts, optional real-live provider 재검증, 포트폴리오 demo evidence 정리
- 아직 할 수 없는 기능: public hosted deployment, multi-user workspace, generalized OAuth, external push/publish/release automation, quantified user outcome reporting
- 사용자 흐름: Project 등록 -> Mission/Task 생성 -> planner/architect/task-breaker -> builder preflight -> approval -> live mutation -> reviewer -> commit/release local follow-up -> close-out
- AI/IT 기술을 적용한 방식: 기본 실행은 `local-stub` adapter이며, 명시적 opt-in 시 `openai-responses` adapter가 planner-through-reviewer 역할 실행에 사용된다.

## 5. Tech Stack

| 영역 | 사용 기술 | 현재 사용 여부 | 근거 파일 |
|---|---|---|---|
| Language | JavaScript / Node.js | 사용 중 | `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs` |
| Frontend | Vanilla HTML/CSS/JS | 사용 중 | `ui/index.html`, `ui/app.js`, `ui/styles.css` |
| Backend | Node.js `http` local server, CommonJS runtime modules | 사용 중 | `scripts/serve-ui-slice-01.mjs`, `src/runtime/*`, `src/execution/*` |
| AI/LLM | local-stub, OpenAI Responses API adapter | 사용 중 | `src/execution/providers/local-stub-adapter.js`, `src/execution/providers/openai-responses-adapter.js` |
| Database | File-based JSON state, JSONL logs, artifact files | 사용 중 | `src/runtime/file-store.js` |
| Infra/Deploy | Local server only | 확인 필요 | `scripts/serve-ui-slice-01.mjs`; `package.json`, Dockerfile 없음 |
| Tools | Git CLI, smoke scripts, harness scripts | 사용 중 | `scripts/smoke-*.mjs`, `scripts/harness-*.mjs` |
| Test | Node smoke scripts and syntax checks | 사용 중 | `scripts/smoke-dev-loop-m2.mjs`, `scripts/smoke-qa-slice-07.mjs`, `scripts/smoke-ui-slice-63.mjs` |

## 6. Architecture

### 현재 아키텍처

```text
User
-> Static UI (ui/index.html, ui/app.js, ui/styles.css)
-> Local HTTP server (scripts/serve-ui-slice-01.mjs)
-> Runtime service (src/runtime/runtime-service.js)
-> Execution coordinator (src/execution/execution-coordinator.js)
-> Provider adapter (local-stub or openai-responses)
-> File store (state.json, JSONL logs, artifacts)
```

### 목표 아키텍처

```text
User
-> Mission / Council / Execution / Deliverables shell
-> Advanced ops surfaces
-> Local execution runtime
-> Explicit provider adapter
-> Review / approval / artifact provenance gates
-> Optional demo or packaged local review environment
```

### 설명

- 주요 데이터 흐름: UI action -> API route -> runtime/coordinator -> artifact/log/state persistence -> `/api/snapshot` refresh
- 주요 모듈 구성: runtime contracts, file store, runtime service, execution coordinator, provider adapters, local UI server
- API 구조: `/api/snapshot`, `/api/projects`, `/api/missions`, `/api/tasks`, `/api/tasks/:id/run-*`, `/api/decision-inbox/:id/actions`, `/api/artifacts/:id`
- AI/LLM 처리 흐름: `executeWithAdapter`를 통해 `local-stub` 또는 `openai-responses` adapter가 역할별 output을 생성한다.
- DB 또는 저장소 구조: 외부 DB 없이 file-based state/log/artifact 저장
- 인증/보안/환경변수 처리 방식: live provider 설정은 project provider config의 env var name만 저장하고 실제 secret 값은 runtime state에 저장하지 않는 설계
- 배포 구조: 미구현. 현재는 local server 중심

## 7. My Contribution

- 직접 구현했다고 설명 가능한 기능: 확인 필요. 저장소 기준으로는 runtime service, execution coordinator, provider adapter, local UI/API server, UI shell 구현을 코드 근거로 설명 가능
- 설계했다고 설명 가능한 구조: local-first, single-user-first, ops-first execution model, artifact taxonomy, review/approval gate, provider adapter boundary
- 문서화 또는 기획 측면 기여: master brief, decision log, architecture roadmap, development pack, portfolio docs
- 문제 해결 또는 디버깅 사례: 승인 전 mutation 차단, reviewer provenance 고정, local-only release boundary 설계
- 면접에서 코드 수준으로 설명해야 할 부분: `createRuntimeService`, `createExecutionCoordinator`, `executeWithAdapter`, `createOpenAIResponsesProviderAdapter`, `scripts/serve-ui-slice-01.mjs`

## 8. Current Status

| 구분 | 기능 | 상태 | 근거 파일 | 이력서 반영 가능 여부 |
|---|---|---|---|---|
| 구현 완료 | project/task/run/artifact runtime | 구현 완료 | `src/runtime/runtime-service.js`, `src/runtime/file-store.js` | 가능 |
| 구현 완료 | development pack coordinator | 구현 완료 | `src/execution/execution-coordinator.js`, `packs/development/pack.md` | 가능 |
| 구현 완료 | local UI/API server | 구현 완료 | `scripts/serve-ui-slice-01.mjs`, `ui/*` | 가능 |
| 구현 완료 | provider adapter boundary | 구현 완료 | `src/execution/provider-adapter.js`, `src/execution/providers/*` | 가능 |
| 개발 중 | growth gateway/self-improvement status contracts | 개발 중 | `docs/18_growth-gateway-vnext.md`, `scripts/growth-*status.mjs` | 조건부 가능 |
| 미구현 | hosted public demo | 미구현 | 배포 설정 파일 없음 | 보류 |
| 검증 필요 | optional real-live OpenAI run | 검증 필요 | `src/execution/providers/openai-responses-adapter.js` | 조건부 가능 |
| 문서상 존재, 코드 근거 없음 | 성과 수치, 사용자 피드백 | 코드 근거 없음 | analytics/user feedback 파일 없음 | 보류 |

## 9. Evidence

- 주요 코드 파일: `src/runtime/runtime-service.js`, `src/runtime/file-store.js`, `src/runtime/contracts.js`, `src/execution/execution-coordinator.js`
- 주요 함수/클래스: `createRuntimeService`, `createFileStore`, `createExecutionCoordinator`, `executeWithAdapter`, `createLocalStubProviderAdapter`, `createOpenAIResponsesProviderAdapter`
- 주요 API 엔드포인트: `/api/snapshot`, `/api/projects`, `/api/missions`, `/api/tasks`, `/api/tasks/:id/run-planner`, `/api/tasks/:id/run-builder-live-mutation`, `/api/tasks/:id/run-reviewer`, `/api/decision-inbox/:id/actions`
- 설정 파일: 별도 `package.json`, `requirements.txt`, `pyproject.toml`, Dockerfile 없음
- 실행 파일: `scripts/serve-ui-slice-01.mjs`
- 테스트 파일: `scripts/smoke-*.mjs`, `scripts/smoke-dev-loop-m2.mjs`, `scripts/smoke-qa-slice-07.mjs`
- README 또는 문서 근거: `README.md`는 프로젝트 개요, 기술스택, 구조, 실행 방법, verification, screenshot/evidence link, Scope & Limitations를 포함하며, 상세 근거는 `docs/*`, `packs/development/pack.md`, `AGENTS.md`
- 실행 방법이 명확한지: README가 harness 실행과 정적 UI 확인 경로를 안내한다. local HTTP demo flow는 별도 checklist 보강 대상이다.
- 스크린샷/데모가 필요한 부분: main shell, task execution, artifact preview, decision inbox, local close-out flow

## 10. Consulting Angle

| 프로젝트 요소 | 연결되는 컨설팅 역량 | 이력서/면접 표현 | 근거 |
|---|---|---|---|
| execution gate 설계 | 업무 흐름과 승인선 구조화 | AI-assisted 개발 실행의 승인/검토 흐름을 요구사항으로 정의 | `packs/development/pack.md` |
| artifact provenance | 문서화와 증거 관리 | 실행 산출물과 검토 근거를 연결하는 evidence model 설계 | `src/runtime/contracts.js` |
| Mission/Council shell | 사용자 관점의 흐름 설계 | 복잡한 실행 단계를 사용자가 이해할 수 있는 표면으로 재구성 | `ui/app.js`, `docs/06_ai-orchestration-pivot.md` |
| README 개선안 | 기대효과와 전달자료 정리 | 외부 리뷰어가 이해 가능한 프로젝트 설명 구조 제안 | `docs/readme-improvement.md` |

## 11. Safe vs Risky Expressions

### 써도 되는 표현

- local-first AI-assisted development control plane
- file-based runtime and artifact/log provenance 구현
- review before done, approval before commit gate 구현
- OpenAI Responses API opt-in adapter boundary 구현

### 조건부로 가능한 표현

- 실사용 가능한 도구: local demo와 실행 가이드 보강 후 사용
- OpenAI 기반 role execution 검증: 실제 env로 optional live smoke 통과 후 사용
- 포트폴리오 대표 프로젝트: public demo 또는 screencast와 사용자 검증 범위를 분리해 설명할 때 사용

### 쓰면 위험한 표현

- 상용 서비스 운영
- 실사용자 성과 검증
- 완전 자율 개발 에이전트
- 다중 사용자 협업 플랫폼
- 자동 배포 시스템

### 위험한 이유

- public deployment, 사용자 지표, multi-user auth, external release automation 근거가 현재 repo에 없다.
