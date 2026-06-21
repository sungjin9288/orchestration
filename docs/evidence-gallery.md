# Evidence Gallery

## Screenshots

| 화면 | 파일 | 설명 |
|---|---|---|
| Mission surface | `evidence/screenshots/mission-surface.png` | 기본 제품 진입 표면 |
| Taskboard surface | `evidence/screenshots/taskboard-surface.png` | advanced ops 작업판 표면 |
| Artifacts surface | `evidence/screenshots/artifacts-surface.png` | artifact evidence 표면 |

## API Responses

| API evidence | 파일 | 확인 내용 |
|---|---|---|
| Initial snapshot | `evidence/api-responses/01-snapshot-initial.json` | runtime snapshot endpoint 응답 |
| Create project | `evidence/api-responses/02-create-project.json` | project 생성과 active project 설정 |
| Snapshot after project | `evidence/api-responses/03-snapshot-after-project.json` | project persistence |
| Create task | `evidence/api-responses/04-create-task.json` | task 생성과 review-required 기본 상태 |
| Snapshot after task | `evidence/api-responses/05-snapshot-after-task.json` | task persistence와 readiness summary |
| Run planner | `evidence/api-responses/06-run-planner.json` | local-stub planner run과 artifact 생성 |
| Snapshot after planner | `evidence/api-responses/07-snapshot-after-planner.json` | run/artifact persistence |

## CLI Logs

| 로그 | 결과 |
|---|---|
| `evidence/cli-logs/syntax-check.log` | pass |
| `evidence/cli-logs/smoke-dev-loop-m2.log` | pass |
| `evidence/cli-logs/smoke-ui-slice-63.log` | pass |
| `evidence/cli-logs/smoke-qa-slice-07.log` | timeout / manual stop |

## Architecture

- `evidence/architecture/orchestration-architecture.md`
- `evidence/architecture/workflow-sequence-diagram.md`
- `evidence/architecture/workflow-architecture-diagram.md`

## Workflow Evidence

| Evidence | 파일 | 확인 내용 |
|---|---|---|
| Workflow execution log | `evidence/workflow-logs/workflow-execution-log.md` | project -> task -> planner -> architect -> task-breaker execution flow |
| State transition summary | `evidence/state-transitions/state-transition-summary.md` | lifecycle, flags, run count, artifact count changes |
| Config evidence | `evidence/config-evidence/workflow-config-evidence.md` | source-of-truth docs, runtime constants, API routes |
