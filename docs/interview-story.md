# Interview Story

## 1. 1분 프로젝트 소개

이 프로젝트는 로컬 개발 작업에서 AI-assisted 실행의 범위, 로그, 산출물, 리뷰, 승인 근거가 분산되는 문제를 해결하기 위해 시작했습니다.
저는 확인 필요인 역할 범위 안에서 local-first execution control plane의 현재 구현된 핵심 기능인 project/task/run/artifact runtime, execution coordinator, review/approval gate, local UI shell을 개발했습니다.
기술적으로는 Node.js, Vanilla JavaScript, file-based storage, local-stub adapter, OpenAI Responses API opt-in adapter를 사용했고, 현재는 v1 control-plane baseline과 post-v1 shell baseline까지 구현했습니다.
개발 과정에서 실행 자동화가 무단 변경이나 완료 착각으로 이어질 수 있는 어려움이 있었고, 이를 `preflight`와 `live-mutation` 분리, review before done, approval before commit, artifact provenance로 해결했거나 해결 중입니다.
이 프로젝트를 통해 로컬 실행 시스템에서는 UI보다 정책, 상태, 검증 경계를 먼저 고정해야 한다는 점을 배웠고, 향후에는 generated screencast의 portfolio attachment, live-provider evidence, public case study로 고도화할 계획입니다.

## 2. 3분 상세 설명

- 프로젝트 배경: AI-assisted coding 흐름이 실제 repo 작업에 들어오면 실행 근거와 승인 경계가 필요하다.
- 문제정의: 어떤 project에서 어떤 task가 어떤 artifact와 review를 남겼는지 추적하고, 승인 없는 commit/release follow-up을 막아야 한다.
- 기술 선택 이유: local-first 요구 때문에 Node.js local server와 file-based runtime이 적합했고, provider 종속성은 adapter boundary로 분리했다.
- 핵심 구현: `createRuntimeService`, `createExecutionCoordinator`, provider adapters, `scripts/serve-ui-slice-01.mjs`, `ui/app.js`
- 현재 상태: docs 기준 v1 baseline complete, post-v1 shell baseline complete, growth gateway는 read-only status contract 중심으로 고도화 중
- 앞으로의 개선 방향: generated screencast의 portfolio attachment/shareable artifact 정리, optional real-live smoke, portfolio case study 보강
- 컨설팅 경험과의 자연스러운 연결: 문제를 기능 단위가 아니라 업무 흐름, 승인선, 검토 증거, 기대효과로 구조화했다는 점을 강조

## 3. 기술 면접 예상 질문 10개

| 예상 질문 | 답변 방향 | 코드 근거 | 보완 필요 지식 |
|---|---|---|---|
| 왜 DB 대신 file-based storage를 썼나요? | local-first PoC에서 설치 부담과 상태 가시성을 줄이기 위한 선택 | `src/runtime/file-store.js` | DB migration tradeoff |
| `project_path`는 어디서 강제되나요? | project record와 execution readiness에서 필수 맥락으로 사용 | `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js` | path traversal 방어 |
| approval before commit은 어떻게 구현했나요? | commit-package와 local commit을 분리하고 승인 record를 소비 | `runCommitPackage`, `runLocalCommit` | git state edge cases |
| provider adapter boundary는 왜 필요한가요? | local-stub 기본값과 live opt-in을 분리해 provider drift를 방지 | `provider-adapter.js`, `openai-responses-adapter.js` | adapter pattern |
| OpenAI structured output은 어디에 쓰이나요? | role output을 schema로 받아 canonical markdown artifact를 렌더링 | `openai-responses-adapter.js` | JSON schema validation |
| artifact taxonomy는 어떻게 관리하나요? | type별 retention, preview, provenance critical 여부를 catalog로 정의 | `src/runtime/contracts.js` | artifact lifecycle |
| UI와 runtime truth는 어떻게 동기화되나요? | `/api/snapshot`을 기준으로 UI가 상태를 다시 렌더링 | `scripts/serve-ui-slice-01.mjs`, `ui/app.js` | frontend state management |
| review before done은 어디서 막나요? | lifecycle transition과 reviewer output에서 review status를 검증 | `runtime-service.js`, `execution-coordinator.js` | state machine design |
| live mutation 실패 시 파일은 어떻게 보호하나요? | target allowlist, digest, restore path, atomic artifact persistence로 보호 | `runBuilderLiveMutation` | rollback strategy |
| 테스트 전략은 무엇인가요? | 기능별 smoke scripts와 aggregate verification docs를 사용 | `scripts/smoke-*.mjs`, `docs/17_v1-completion-readiness.md` | automated test hierarchy |

## 4. 프로젝트 면접 예상 질문 10개

| 예상 질문 | 답변 방향 | 근거 | 보완 필요 사항 |
|---|---|---|---|
| 이 프로젝트의 핵심 사용자 문제는 무엇인가요? | AI-assisted local execution의 추적성과 승인 통제 문제 | `docs/00_master-brief.md` | 실제 사용자 사례 |
| 현재 완성도는 어느 정도인가요? | v1 baseline은 docs상 complete, local screencast evidence는 있으나 hosted/shareable demo는 부족 | `docs/17_v1-completion-readiness.md`, `docs/public-demo-screencast-plan.md` | demo attachment |
| 가장 중요한 설계 원칙은 무엇인가요? | local-first, single-user-first, ops-first | `AGENTS.md`, `docs/00_master-brief.md` | tradeoff 설명 |
| 왜 Mission/Council shell이 추가됐나요? | 운영 콘솔을 AI orchestration 경험으로 확장하기 위해 | `docs/06_ai-orchestration-pivot.md`, `ui/index.html` | UX rationale |
| 어떤 기능은 아직 구현되지 않았나요? | deployment, public demo, multi-user auth, external release automation | file inventory, docs out-of-scope | roadmap |
| README에서 아직 부족한 점은 무엇인가요? | 현재 README는 프로젝트 개요, 실행 방법, verification, Scope & Limitations, screenshot/evidence link를 포함하지만 hosted/shareable demo와 optional live-provider 검증 note가 더 필요합니다. | `README.md`, `evidence/screenshots/*`, `docs/public-demo-screencast-plan.md` | demo attachment |
| 이력서에 넣어도 되나요? | 조건부 가능. 코드 근거가 있는 항목만 사용 | portfolio docs | 구현자 범위 확인 |
| 가장 어려웠던 점은 무엇인가요? | 자동화 편의와 승인/검토 통제의 균형 | `packs/development/pack.md` | 구체 사례 |
| 성과 수치는 있나요? | 현재 없음. 임의 생성하지 않음 | analytics 없음 | 사용성 검증 |
| 다음 개발 우선순위는 무엇인가요? | screencast attachment/shareable artifact, live provider verification, portfolio evidence | `docs/roadmap.md` | 일정 |

## 5. 컨설팅 경험과의 연결 질문 5개

| 예상 질문 | 답변 방향 | 주의할 점 |
|---|---|---|
| 비개발 경험이 이 프로젝트에 어떻게 도움이 됐나요? | 문제정의, 요구사항 정리, 승인 흐름, 문서화로 연결 | 특정 산업 프로젝트로 억지 연결하지 않기 |
| 사용자 관점은 어떻게 반영했나요? | Mission/Council/Execution/Deliverables와 advanced ops mode를 분리 | UI 미검증 부분은 검증 필요로 말하기 |
| 문서가 많은 이유는 무엇인가요? | 실행 권한과 제품 경계를 repo source of truth로 관리하기 위해 | 문서만 있고 코드 없는 기능은 분리 |
| 개선안 도출 경험은 어디에 드러나나요? | decision log, roadmap, readiness criteria에 드러남 | 성과 수치 과장 금지 |
| AI 컨설팅 직무와 어떤 관련이 있나요? | AI 도구 도입 시 통제, 검증, 운영 흐름을 설계하는 관점 | 현재 프로젝트 자체를 다른 도메인으로 포장하지 않기 |

## 6. 내가 추가로 공부해야 할 부분

- 기술: Node.js HTTP server 구조, CommonJS/ESM 혼용, filesystem safety
- 아키텍처: state machine, artifact provenance, adapter boundary
- 보안: path traversal, secret handling, local file permission, prompt/data leakage
- 배포: local app packaging, README-based install/run guide, demo hosting strategy
- 테스트: smoke와 unit/integration test의 역할 분리
- AI/LLM: Responses structured outputs, schema validation, retry/backoff, failure classification
- CS 기초: concurrency, file locking, process lifecycle, error handling
