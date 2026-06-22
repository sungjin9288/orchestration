# README Improvement Plan

## 1. 현재 README의 보강 지점

- `README.md`는 현재 작성되어 있으며 프로젝트 목적, 실행 방법, 기술스택, 구현 범위, verification, Scope & Limitations를 포함한다.
- screenshot/evidence manifest 연결과 optional live-provider note는 README에 반영되었다. local screencast artifact는 생성됐고, hosted/shareable demo artifact는 아직 별도 보강이 필요하다.
- local-first 실행 조건, smoke script 카운트, local UI/API server demo path가 README에 들어갔다.
- 포트폴리오 리뷰어가 볼 수 있는 screenshot, evidence manifest, architecture/CLI evidence 경로는 README에 연결되었다.

## 2. README에 추가해야 할 섹션

```markdown
# Orchestration 1.0

## 1. 프로젝트 개요
## 2. 개발 배경
## 3. 주요 기능
  - 구현 완료
  - 개발 중
  - 향후 개선
## 4. 기술 스택
## 5. 시스템 구조
## 6. 핵심 구현 내용
## 7. 실행 방법
## 8. 환경변수
## 9. 화면 예시
## 10. 개발 과정에서 해결한 문제
## 11. 비즈니스/사용자 관점의 적용 가능성
## 12. 향후 개선 계획
```

## 3. README 보강 초안

````markdown
# Orchestration 1.0

## 1. 프로젝트 개요

Orchestration 1.0은 로컬 개발 프로젝트의 AI-assisted 실행 흐름을 관리하기 위한 local-first orchestration control plane입니다.

핵심 목표는 단일 사용자가 로컬 repo에서 작업을 실행할 때 `project_path`, task lifecycle, run log, artifact, review, approval, decision inbox를 한 흐름으로 추적하고 통제하는 것입니다.

## 2. 개발 배경

AI-assisted 개발 도구를 사용할 때 실행 결과만 남고, 어떤 프로젝트에서 어떤 승인과 리뷰를 거쳐 파일이 변경되었는지 불분명해질 수 있습니다. 이 프로젝트는 실행 자동화를 더 빠르게 만드는 것보다, 로컬 작업의 근거와 승인 경계를 명확히 하는 데 초점을 둡니다.

## 3. 주요 기능

### 구현 완료

- 로컬 프로젝트 등록 및 선택
- Mission, Council, Execution, Deliverables shell
- Taskboard, Logs, Artifacts, Decision Inbox advanced ops mode
- `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer` development pack loop
- `knowledge-work` pack opt-in contract
- `commit-package -> local commit -> release-package -> close-out` local follow-up boundary
- file-based runtime state, JSONL logs, artifact persistence
- `local-stub` 기본 adapter와 `openai-responses` opt-in adapter
- review before done, approval before commit gate

### 개발 중

- growth gateway and self-improvement read-only status contracts
- optional live-provider verification evidence refresh
- portfolio/screencast documentation

### 향후 개선

- hosted/shareable demo artifact
- README 기반 설치/실행 가이드
- 대표 end-to-end scenario
- 배포 방식 검토

## 4. 기술 스택

- JavaScript / Node.js
- Vanilla HTML / CSS / JavaScript
- Node.js `http` local server
- File-based JSON state, JSONL logs, artifact files
- OpenAI Responses API optional adapter
- Git CLI and local smoke scripts

## 5. 시스템 구조

```text
User
-> Static UI (ui/)
-> Local HTTP server (scripts/serve-ui-slice-01.mjs)
-> Runtime service (src/runtime/)
-> Execution coordinator (src/execution/)
-> Provider adapter (local-stub or openai-responses)
-> File store (state, logs, artifacts)
```

## 6. 핵심 구현 내용

- `src/runtime/runtime-service.js`: project, mission, task, run, artifact, decision, approval 상태 관리
- `src/runtime/file-store.js`: file-based state/log/artifact 저장
- `src/execution/execution-coordinator.js`: planner-through-reviewer와 local follow-up 실행 조정
- `src/execution/providers/openai-responses-adapter.js`: OpenAI Responses API opt-in adapter
- `scripts/serve-ui-slice-01.mjs`: local UI/API server
- `ui/app.js`: shell rendering and user action binding

## 7. 실행 방법

현재 README 기준 실행 가이드는 harness 실행, static UI 확인, local UI/API server 확인 경로를 포함한다. 코드상 local server entrypoint는 아래 파일입니다.

```bash
node scripts/serve-ui-slice-01.mjs
```

기본 서버 옵션은 `scripts/serve-ui-slice-01.mjs`의 `parseArgs` 기준 `127.0.0.1:4310`입니다.

## 8. 환경변수

- 기본 실행: 별도 secret 불필요
- OpenAI live opt-in 검증: `OPENAI_API_KEY`, `OPENAI_RESPONSES_MODEL` 등 실제 환경 구성 확인 필요
- secret 값은 README, runtime state, artifact, log에 기록하지 않는 것을 원칙으로 합니다.

## 9. 화면 예시

현재 screenshot evidence는 `evidence/screenshots/`에 있으며 README의 `Evidence & Screenshots` 섹션에 직접 연결되어 있다:

- main shell
- project registration
- task execution
- artifact preview
- decision inbox

## 10. 개발 과정에서 해결한 문제

- 실행 자동화와 승인 통제의 충돌: preflight/live-mutation 분리
- 산출물 추적 어려움: artifact taxonomy와 provenance 연결
- provider 종속성: local-stub과 OpenAI Responses adapter 분리
- 완료 착각 방지: review before done, approval before commit gate

## 11. 비즈니스/사용자 관점의 적용 가능성

- AI 도구를 실제 개발 업무에 도입할 때 필요한 실행 근거, 승인선, 검토 흐름을 구조화한 프로젝트입니다.
- 컨설팅 경험은 문제정의, 요구사항 정리, 사용자 흐름 설계, 문서화, 기대효과 정리에 자연스럽게 연결됩니다.

## 12. 향후 개선 계획

- generated screencast의 portfolio attachment 또는 hosted/shareable demo artifact 제작
- optional live-provider smoke 재검증
- public portfolio review package 정리
````
