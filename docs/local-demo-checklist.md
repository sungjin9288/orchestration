# Local Demo Checklist

이 문서는 public hosted demo가 아니라 local-first portfolio review를 위한 최소 demo flow를 고정한다.

## Preconditions

- Node.js가 설치되어 있어야 한다.
- `project_path`는 실제 로컬 git worktree의 absolute path여야 한다.
- 기본 demo는 `local-stub` provider를 사용하며 OpenAI API key가 필요하지 않다.
- demo runtime state는 repo 내부가 아니라 `/tmp/orchestration-demo-runtime` 같은 임시 경로에 둔다.

## Demo Flow

1. Local UI/API server를 실행한다.

```bash
node scripts/serve-ui-slice-01.mjs --runtime-root /tmp/orchestration-demo-runtime
```

2. Browser에서 UI shell을 연다.

```text
http://127.0.0.1:4310/
```

3. Snapshot endpoint가 응답하는지 확인한다.

```bash
curl http://127.0.0.1:4310/api/snapshot
```

4. Project를 등록한다.

```bash
curl -X POST http://127.0.0.1:4310/api/projects \
  -H 'content-type: application/json' \
  -d '{"name":"Local demo","projectPath":"/absolute/path/to/this/repo"}'
```

5. Task를 생성한다.

```bash
curl -X POST http://127.0.0.1:4310/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Demo task","intent":"Verify local-stub planner flow."}'
```

6. Planner를 실행한다.

```bash
curl -X POST http://127.0.0.1:4310/api/tasks/task-0001/run-planner \
  -H 'content-type: application/json' \
  -d '{}'
```

7. Snapshot에서 project, task, run, artifact가 생성됐는지 확인한다.

```bash
curl http://127.0.0.1:4310/api/snapshot
```

## Expected Evidence

- `snapshot.projects`에 등록 project가 있다.
- `snapshot.tasks`에 demo task가 있다.
- planner 실행 후 `snapshot.runs`와 `snapshot.artifacts`가 증가한다.
- UI에서는 Mission, Taskboard, Artifacts surface를 확인한다.

## Verified In This Repo Update

2026-06-22 현재 아래 local check로 demo API path를 확인했다.

```bash
node scripts/serve-ui-slice-01.mjs --port 4323 --runtime-root /tmp/orchestration-local-demo-doc-check-fresh
```

검증 결과:

```json
{
  "ok": true,
  "projectId": "project-0001",
  "taskId": "task-0001",
  "plannerRunId": "run-0001",
  "plannerArtifactId": "artifact-0001",
  "snapshotProjects": 1,
  "snapshotTasks": 1,
  "snapshotArtifacts": 1
}
```

## Out Of Scope

- Public hosted demo
- Screencast recording
- OpenAI live-provider configured-env rerun
- Multi-user, OAuth, messenger, ranking, HR, or org-management flow
