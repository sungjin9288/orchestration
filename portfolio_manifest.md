# Portfolio Package Manifest

## 프로젝트 정보

- 프로젝트명: Orchestration 1.0
- 생성일: 2026-06-09
- 최신 갱신: 2026-06-22
- 현재 상태: local-first portfolio evidence 정리 중
- 핵심 기술스택: JavaScript, Node.js, Vanilla HTML/CSS/JS, file-based JSON/JSONL storage, Node.js local HTTP server, OpenAI Responses API opt-in adapter, local smoke scripts
- 이력서 반영 가능 여부: 조건부 가능

## 포함 파일

- README.md
- DEV_LOG.md
- links.md
- portfolio_manifest.md
- docs/project-card.md
- docs/contribution-scope-note.md
- docs/external-share-verification-plan.md
- docs/case-study.md
- docs/resume-bullets.md
- docs/interview-story.md
- docs/roadmap.md
- docs/readme-improvement.md
- docs/live-provider-verification-note.md
- docs/implementation-evidence.md
- docs/evidence-checklist.md
- docs/evidence-gallery.md
- docs/workflow-evidence.md
- evidence/evidence_manifest.md
- evidence/workflow-logs/*.md
- evidence/workflow-logs/*.log
- evidence/workflow-logs/*.status
- evidence/state-transitions/*.json
- evidence/state-transitions/*.md
- evidence/config-evidence/*.md
- evidence/api-responses/*.json
- evidence/cli-logs/*.log
- evidence/cli-logs/*.status
- evidence/output-artifacts/*.json
- evidence/screenshots/*.png
- evidence/architecture/*.md
- output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm (로컬 생성 artifact, repository commit 제외)
- _portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip (screencast 포함 local package, repository commit 제외)
- screenshots 폴더가 있으면 이미지 파일만 포함

## 제외한 파일/폴더

아래 항목은 압축에서 제외했다.

- .env
- API key
- 비밀번호/토큰
- node_modules/
- venv/
- .venv/
- __pycache__/
- dist/
- build/
- .git/
- 개인정보가 들어간 데이터
- 고객사/기관 내부자료
- 기타 민감정보
- output/ (repository commit과 기존 zip export에서는 제외)
- src/
- app/
- backend/
- frontend/
- components/
- routes/
- services/
- models/
- utils/

## 검증 결과

- 민감정보 포함 여부: 압축 전 파일명 및 secret pattern 검사 기준 미포함
- 압축 파일 생성 여부: 생성 완료
- 압축 파일 경로: `_portfolio_export/orchestration_portfolio_pack.zip`
- 압축 파일명: `orchestration_portfolio_pack.zip`
- 압축 파일 내용 확인 여부: 생성 후 `unzip -l`로 확인
- screencast artifact 상태: `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm` 로컬 생성 확인, `.gitignore` 기준 repository commit 제외
- screencast 포함 최신 local package: `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`
- 최신 local package 검증: `unzip -l`로 screencast, README, case study, screenshots, evidence manifest 포함 확인; `ls -lh` 기준 zip 크기 `3.7M`; `.gitignore` 기준 repository commit 제외
- external share handoff: `docs/portfolio-share-handoff.md`에 package checksum, 포함 evidence, candidate share target, pre-publish checklist를 repository-side gate로 기록했다. 이 handoff 문서는 checksum self-reference를 피하기 위해 zip payload에는 포함하지 않는다.
