# Workflow Sequence Diagram

```mermaid
sequenceDiagram
  participant Operator as Local Operator
  participant UI as Shell UI
  participant API as Local API Server
  participant Runtime as Runtime Service
  participant Coordinator as Execution Coordinator
  participant Adapter as Provider Adapter
  participant Store as File Store

  Operator->>UI: Create or select project
  UI->>API: POST /api/projects
  API->>Runtime: createProject(project_path)
  Runtime->>Store: Persist project and activeProjectId

  Operator->>UI: Create task
  UI->>API: POST /api/tasks
  API->>Runtime: createTask()
  Runtime->>Store: Persist task as Inbox

  Operator->>UI: Run planner
  UI->>API: POST /api/tasks/:id/run-planner
  API->>Coordinator: runPlanner(taskId)
  Coordinator->>Adapter: execute role=planner
  Adapter-->>Coordinator: plan artifact payload
  Coordinator->>Runtime: record run-0001 and artifact-0001
  Runtime->>Store: Task moves to In Progress

  Operator->>UI: Run architect
  UI->>API: POST /api/tasks/:id/run-architect
  API->>Coordinator: runArchitect(taskId)
  Coordinator->>Runtime: Resolve latest plan provenance
  Coordinator->>Adapter: execute role=architect
  Adapter-->>Coordinator: architecture artifact payload
  Coordinator->>Runtime: record run-0002 and artifact-0002

  Operator->>UI: Run task-breaker
  UI->>API: POST /api/tasks/:id/run-task-breaker
  API->>Coordinator: runTaskBreaker(taskId)
  Coordinator->>Runtime: Resolve plan + architecture provenance
  Coordinator->>Adapter: execute role=task-breaker
  Adapter-->>Coordinator: breakdown artifact payload
  Coordinator->>Runtime: record run-0003 and artifact-0003

  UI->>API: GET /api/snapshot
  API-->>UI: Current state, runs, artifacts, readiness summaries
```

## Captured Evidence

- `evidence/state-transitions/03-run-planner-response.json`
- `evidence/state-transitions/04-run-architect-response.json`
- `evidence/state-transitions/05-run-task-breaker-response.json`
- `evidence/state-transitions/state-transition-summary.md`
