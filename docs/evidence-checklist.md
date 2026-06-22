# Evidence Checklist

| 증거 항목 | 상태 | 파일 |
|---|---|---|
| 프로젝트 유형 판단 | 완료 | `docs/implementation-evidence.md` |
| 구현 증거 기능 표 | 완료 | `docs/implementation-evidence.md` |
| 로컬 syntax check 로그 | 완료 | `evidence/cli-logs/syntax-check.log` |
| development loop smoke 로그 | 완료 | `evidence/cli-logs/smoke-dev-loop-m2.log` |
| UI smoke 로그 | 완료 | `evidence/cli-logs/smoke-ui-slice-63.log` |
| 대표 user-flow smoke 상태 | 완료 | `evidence/cli-logs/smoke-v1-user-flow-kickoff-2026-06-22.status` |
| Public demo / screencast plan | 완료 | `docs/public-demo-screencast-plan.md` |
| QA smoke 로그 | 타임아웃 기록 | `evidence/cli-logs/smoke-qa-slice-07.log` |
| API snapshot 응답 | 완료 | `evidence/api-responses/01-snapshot-initial.json`, `07-snapshot-after-planner.json` |
| Project 생성 API 응답 | 완료 | `evidence/api-responses/02-create-project.json` |
| Task 생성 API 응답 | 완료 | `evidence/api-responses/04-create-task.json` |
| Planner 실행 API 응답 | 완료 | `evidence/api-responses/06-run-planner.json` |
| Planner artifact 응답 | 완료 | `evidence/output-artifacts/planner-artifact-0001.json` |
| 웹앱 스크린샷 | 완료 | `evidence/screenshots/*.png` |
| Architecture Mermaid | 완료 | `evidence/architecture/orchestration-architecture.md` |
| Evidence manifest | 완료 | `evidence/evidence_manifest.md` |

## Exclusion Checklist

| 제외 항목 | 결과 |
|---|---|
| `.env` / `.env.*` | 포함하지 않음 |
| API key / token / password value | 포함하지 않음 |
| 개인정보 | 포함하지 않음 |
| 고객사/기관 내부자료 | 포함하지 않음 |
| `node_modules/`, `venv/`, `.git/`, build output | evidence 및 zip에서 제외 대상 |
| 앱 소스코드 수정 | 수행하지 않음 |
| 새 기능 개발 | 수행하지 않음 |
