# Workflow Configuration Evidence

## Source-of-truth files

| File | Evidence | Why it matters |
|---|---|---|
| `AGENTS.md` | local-first, single-user-first, ops-first; `project_path` required; review before done; approval before commit | Defines repository operating contract |
| `docs/00_master-brief.md` | v1 development pack, project/task/run/artifact/decision/review/approval model | Defines product scope and workflow objects |
| `docs/01_decision-log.md` | DEC-001, DEC-002, DEC-004, DEC-005, DEC-006, DEC-023, DEC-024 | Records accepted workflow boundaries |
| `docs/02_ia-v1.md` | Taskboard, Logs, Artifacts, Decision Inbox as primary ops surfaces | Defines UI surfaces used to inspect workflow evidence |
| `docs/03_architecture-roadmap-v1.md` | implemented baseline and execution core loop | Confirms current architecture boundary |
| `packs/development/pack.md` | `router -> planner -> architect -> task-breaker -> builder -> reviewer -> human gate` | Defines workflow stage sequence |
| `src/runtime/contracts.js` | `TASK_LIFECYCLE`, `ARTIFACT_TYPE`, `REVIEW_STATUS`, `APPROVAL_STATUS` constants | Defines runtime state vocabulary |
| `scripts/serve-ui-slice-01.mjs` | `/api/projects`, `/api/tasks`, `/api/tasks/:id/run-*`, `/api/snapshot` routes | Defines API entrypoints used for evidence collection |

## Runtime configuration observations

- No `package.json`, `requirements.txt`, `pyproject.toml`, Dockerfile, or `docker-compose.yml` was found at repo root during evidence collection.
- Local server entrypoint is `scripts/serve-ui-slice-01.mjs`.
- Evidence runtime used `--runtime-root /tmp/orchestration-workflow-evidence-runtime`.
- Evidence project used `/tmp/orchestration-workflow-evidence-project`.
- Provider mode in captured API snapshots is `local-stub`.
- No API key or secret value was used.

## Config commands used

```bash
rg -n "TASK_LIFECYCLE|ARTIFACT_TYPE|PROVIDER_MODE|APPROVAL_STATUS|REVIEW_STATUS|PACKS|DECISION_INBOX_KIND" src/runtime/contracts.js
curl -X POST http://127.0.0.1:4321/api/projects
curl -X POST http://127.0.0.1:4321/api/tasks
curl -X POST http://127.0.0.1:4321/api/tasks/task-0001/run-planner
curl -X POST http://127.0.0.1:4321/api/tasks/task-0001/run-architect
curl -X POST http://127.0.0.1:4321/api/tasks/task-0001/run-task-breaker
```
