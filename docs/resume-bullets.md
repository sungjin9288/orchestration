# Resume Bullets

## 1. 이력서용 프로젝트 제목 후보

- Orchestration 1.0 - Local-first AI Development Control Plane
- Local Project Execution Orchestrator with Review and Approval Gates
- AI-assisted Development Workflow Orchestration System

## 2. 한 줄 소개 후보

- 로컬 개발 프로젝트의 실행, 로그, 산출물, 리뷰, 승인을 한 흐름으로 관리하는 local-first orchestration control plane
- AI-assisted 개발 작업을 `project_path` 기반으로 단계화하고 review/approval gate를 적용한 개인 PoC 프로젝트
- Mission/Council/Execution/Deliverables UI와 advanced ops mode를 결합한 로컬 개발 실행 관리 도구

## 3. 현재 이력서에 넣어도 되는 bullet

- 로컬 개발 작업에서 실행 컨텍스트가 불명확한 문제를 해결하기 위해 `project_path` 필수 조건을 runtime 계약으로 정의하고, project/task/run/artifact 상태를 file-based JSON/JSONL 구조로 관리하는 Node.js control plane을 구현
- AI-assisted 개발 흐름의 무단 변경 리스크를 줄이기 위해 `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer` 실행 단계를 `execution-coordinator`로 분리하고 review before done, approval before commit 게이트를 적용
- 실행 결과 추적이 어려운 문제를 해결하기 위해 artifact taxonomy와 raw fallback preview 구조를 설계하고 `plan`, `architecture`, `breakdown`, `preflight`, `diff`, `review`, `commit-package`, `release-package`, `close-out` 산출물을 provenance와 연결
- provider 종속성을 줄이기 위해 `local-stub` 기본 adapter와 `openai-responses` opt-in adapter를 분리하고, OpenAI Responses structured output 기반 planner-through-reviewer 실행 경계를 구현
- 사용자가 현재 작업 상태와 승인 필요 항목을 빠르게 확인하도록 `Mission / Council / Execution / Deliverables` shell과 `Taskboard / Logs / Artifacts / Decision Inbox` advanced ops surfaces를 Vanilla JavaScript UI로 구현
- 문제정의, 요구사항 정리, 사용자 흐름, 기대효과를 source-of-truth docs로 구조화하고 `AGENTS.md`, master brief, decision log, architecture roadmap, pack contract를 통해 범위 확장과 금지 사항을 명시

## 4. 구현 후 넣을 수 있는 bullet

- 구현 후 사용 가능: shareable demo artifact를 정리한 뒤, 로컬 실행부터 task close-out까지의 end-to-end 사용자 시나리오를 포트폴리오 case study로 제시
- 구현 후 사용 가능: configured OpenAI environment에서 live provider smoke를 통과시킨 뒤, OpenAI Responses API 기반 role execution을 실사용 검증 사례로 설명
- 현재 사용 가능: local screencast artifact와 screenshot evidence를 근거로 UI shell과 advanced ops mode의 사용자 흐름을 demo evidence로 제시

## 5. 기술스택 한 줄

- 현재 사용 중: JavaScript, Node.js, Vanilla HTML/CSS/JS, file-based JSON/JSONL storage, development/knowledge-work pack contracts, Git CLI, OpenAI Responses API adapter, local smoke scripts
- 예정 / 검증 필요: hosted demo, deployment pipeline, optional real-live provider rerun evidence

## 6. 지원 직무별 강조 포인트

### AI/IT 개발자

- provider adapter, execution coordinator, file-based runtime, smoke verification을 중심으로 구현 역량 강조

### AI 서비스 기획

- AI 역할 흐름을 Mission/Council/Execution/Deliverables 사용자 경험으로 재구성한 문제정의와 UX 구조 강조

### AI 솔루션 엔지니어

- local-first 운영 제약, project_path gate, approval/review workflow, artifact evidence를 고객 환경에 맞게 통제하는 관점 강조

### DX/AI 컨설팅 주니어

- 개발 업무 흐름을 단계, 승인, 산출물, 검증 기준으로 구조화한 요구사항 정리와 문서화 역량 강조

## 7. 쓰면 위험한 표현

- 상용 서비스 운영
- 실사용자 성과 검증
- 다중 사용자 협업 플랫폼
- 자동 배포 시스템
- 완전 자율 개발 에이전트

## 8. 보완 후 쓸 수 있는 표현

- live provider 실행 검증 후: OpenAI Responses API 기반 역할 실행을 configured environment에서 검증
- README와 local demo guide 기준: 로컬 실행 가능한 AI-assisted development workflow control plane
- local screencast 기준: 프로젝트 등록부터 실행 evidence 확인까지의 작업 흐름을 시연 가능한 포트폴리오 프로젝트

## 9. 최종 판단

- 현재 이력서 반영 가능 여부: 조건부 가능
- 이유: 핵심 runtime, UI, adapter, smoke evidence, screenshot, local screencast 근거는 있으나 hosted/shareable demo, 사용자 검증, 성과 지표는 아직 없다.
- 이력서에 넣기 전 반드시 보완할 것: 내가 직접 구현한 범위 명시, hosted/shareable demo 필요 여부 판단, optional live-provider 검증 note 보강
- 가장 먼저 개선해야 할 것: generated screencast의 portfolio attachment/shareable artifact 정리와 optional live-provider 검증 note 보강
