# Development Roadmap

## 1. 현재 상태 요약

- 현재 구현 완료: local-first runtime, development pack execution loop, opt-in knowledge-work pack, review/approval gates, static UI shell, file-based artifacts/logs, local-stub and OpenAI Responses adapter boundary
- 개발 중: growth gateway and self-improvement read-only status contracts, portfolio documentation, external demo/share target planning
- 미구현: public deployment, hosted demo, multi-user auth, external release automation, quantitative usage metrics
- 검증 필요: optional real-live OpenAI smoke in a visible configured environment, hosted/shareable demo access. Combined operator checklist: `docs/portfolio-open-items-handoff.md`; claim-safe external share copy: `docs/portfolio-share-copy-template.md`.
- 현재 live-provider note: `docs/live-provider-verification-note.md` records full optional live smoke rerun `skipped_missing_env` for `main@95b4835`; the current Codex process and `launchctl` environment did not expose the required OpenAI env values.

## 2. Phase 1 - MVP 완성

- 목표: 사용자가 README만 보고 로컬에서 프로젝트를 실행하고 핵심 flow를 확인할 수 있게 만든다.
- 해야 할 작업:
  - README 실행 방법 작성
  - `node scripts/serve-ui-slice-01.mjs` 실행 예시 추가
  - project registration -> task execution -> artifact 확인 demo path 정리
  - local screencast artifact 생성
- 완료 기준:
  - 새 사용자가 local server를 실행하고 `/api/snapshot`과 UI를 확인
  - README에 구현 완료, 개발 중, 미구현 범위가 분리됨
- 산출물:
  - README
  - screenshots
  - `docs/local-demo-checklist.md`

## 3. Phase 2 - 기능 고도화

- 목표: 구현된 기능의 안정성과 설명 가능성을 높인다.
- 해야 할 작업:
  - core runtime에 대한 focused unit/integration tests 추가 검토
  - live provider optional smoke 재실행
  - artifact preview와 decision inbox 대표 시나리오 정리
  - 구현자 범위와 핵심 코드 설명 문서화 완료: `docs/contribution-scope-note.md`
- 완료 기준:
  - local-stub smoke와 representative UI/QA smoke 통과
  - live provider는 env가 있으면 pass/fail/skipped 근거가 명확히 기록됨
- 산출물:
  - test evidence
  - live provider verification note
  - architecture explanation

## 4. Phase 3 - 서비스화 / 배포

- 목표: public portfolio review가 가능한 수준의 접근성과 안정성을 확보한다.
- 해야 할 작업:
  - 배포 방식 결정: hosted static demo, local-only packaged demo, 또는 recorded demo
  - 환경변수 가이드 작성
  - demo data seed 또는 sample runtime state 준비
  - 보안/비밀정보 노출 점검
- 완료 기준:
  - 외부 리뷰어가 실행 화면과 핵심 흐름을 확인
  - secret value와 local absolute path 노출 리스크가 관리됨
- 산출물:
  - screencast 또는 hosted demo decision
  - setup guide
  - security checklist

## 5. Phase 4 - 포트폴리오 완성

- 목표: 이력서, GitHub README, case study, 면접 답변으로 일관되게 설명 가능한 프로젝트로 정리한다.
- 해야 할 작업:
  - README 개선안 실제 반영
  - case study에 screenshot, architecture diagram, before/after problem framing 추가
  - resume bullets를 실제 구현자 범위에 맞게 확정
  - 위험 표현 제거
- 완료 기준:
  - 코드 근거 없는 기능을 구현 완료로 표현하지 않음
  - 면접에서 파일명, 함수명, API route를 근거로 설명 가능
- 산출물:
  - portfolio case study
  - final resume bullets
  - interview Q&A

## 6. 우선순위 높은 다음 작업

| 우선순위 | 작업 | 이유 | 예상 산출물 |
|---|---|---|---|
| 1 | external share target 선택 및 접근 검증 | local screencast 포함 portfolio package, share handoff, target decision plan, claim-safe share copy는 준비됐지만 외부 리뷰어가 접근할 URL은 아직 없음 | verified shareable URL or hosted walkthrough decision |
| 2 | configured-env optional OpenAI live smoke 재실행 | `main@95b4835`에서 full optional live set은 `skipped_missing_env`로 갱신됐으므로 env가 보이는 상태에서 pass/fail evidence가 필요함 | pass/fail evidence |
| 3 | portfolio open-item handoff 유지 관리 | share target과 configured-env live smoke가 모두 외부 조건을 필요로 하므로 operator checklist로 묶어야 함 | `docs/portfolio-open-items-handoff.md` |
| 4 | portfolio case study 유지 관리 | case study는 screenshot, screencast, smoke evidence, local package, contribution note를 연결했으므로 외부 URL 검증 후 링크만 갱신하면 됨 | updated case study after verified share URL |
