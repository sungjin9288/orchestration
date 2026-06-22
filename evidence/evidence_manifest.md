# Evidence Manifest

## Summary

- 생성일: 2026-06-09
- 프로젝트 유형: 개인 PoC / local-first AI-assisted development control plane
- 수집 범위: 구현 증거 문서, API 응답, CLI/smoke 로그, UI screenshots, Mermaid architecture diagram
- 추가 수집 범위: workflow 실행 로그, planner-through-task-breaker 상태 전이 snapshot, workflow sequence/architecture diagram, 설정 파일 근거
- 앱 소스코드 수정 여부: 수정하지 않음
- 새 기능 개발 여부: 수행하지 않음

## Verified Evidence

| 기능 | 검증 결과 | Evidence |
|---|---|---|
| Project registration | pass | `evidence/api-responses/02-create-project.json` |
| Task creation | pass | `evidence/api-responses/04-create-task.json` |
| Planner run/artifact creation | pass | `evidence/api-responses/06-run-planner.json`, `evidence/output-artifacts/planner-artifact-0001.json` |
| Runtime snapshot | pass | `evidence/api-responses/01-snapshot-initial.json`, `07-snapshot-after-planner.json` |
| UI rendering | pass | `evidence/screenshots/mission-surface.png`, `taskboard-surface.png`, `artifacts-surface.png` |
| Syntax check | pass | `evidence/cli-logs/syntax-check.log` |
| Development loop smoke | pass | `evidence/cli-logs/smoke-dev-loop-m2.log` |
| UI backlog smoke | pass | `evidence/cli-logs/smoke-ui-slice-63.log` |
| Representative user-flow smoke | pass | `evidence/cli-logs/smoke-v1-user-flow-kickoff-2026-06-22.status` |

## Failed Or Incomplete Evidence

| 기능 | 결과 | Evidence |
|---|---|---|
| QA browser smoke | timeout / stopped during evidence collection | `evidence/cli-logs/smoke-qa-slice-07.log`, `.status` |
| Optional OpenAI live provider | 검증 필요 | live env not used |
| Public deployment | 미구현 | no deployment config found |
| Multi-user auth/workspace | 미구현 | out of scope in repo source-of-truth |

## Included Evidence Files

- `docs/workflow-evidence.md`
- `docs/implementation-evidence.md`
- `docs/evidence-checklist.md`
- `docs/evidence-gallery.md`
- `evidence/workflow-logs/*.md`
- `evidence/workflow-logs/*.log`
- `evidence/workflow-logs/*.status`
- `evidence/state-transitions/*.json`
- `evidence/state-transitions/*.md`
- `evidence/config-evidence/*.md`
- `evidence/api-responses/*.json`
- `evidence/cli-logs/*.log`
- `evidence/cli-logs/*.status`
- `evidence/output-artifacts/*.json`
- `evidence/screenshots/*.png`
- `evidence/architecture/orchestration-architecture.md`

## Sensitive Data Policy

- `.env`, API key values, tokens, passwords, personal data, customer/internal institutional materials, dependency folders, build output, and `.git/` are not included.
- API evidence used `/tmp/orchestration-evidence-project` and `/tmp/orchestration-evidence-runtime` fixture paths.
