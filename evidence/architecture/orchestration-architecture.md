# Orchestration Architecture Evidence

## Architecture Diagram

```mermaid
flowchart TD
  User["User / Local Operator"]
  UI["Static Shell UI\nui/index.html\nui/app.js\nui/styles.css"]
  Server["Local HTTP Server\nscripts/serve-ui-slice-01.mjs"]
  Runtime["Runtime Service\nsrc/runtime/runtime-service.js"]
  Coordinator["Execution Coordinator\nsrc/execution/execution-coordinator.js"]
  Adapter["Provider Adapter Boundary\nsrc/execution/provider-adapter.js"]
  LocalStub["Local Stub Adapter\nsrc/execution/providers/local-stub-adapter.js"]
  OpenAI["OpenAI Responses Adapter\nsrc/execution/providers/openai-responses-adapter.js"]
  Store["File Store\nsrc/runtime/file-store.js"]
  Evidence["Logs / Artifacts / State\nJSON, JSONL, artifact files"]

  User --> UI
  UI --> Server
  Server --> Runtime
  Server --> Coordinator
  Coordinator --> Runtime
  Coordinator --> Adapter
  Adapter --> LocalStub
  Adapter --> OpenAI
  Runtime --> Store
  Coordinator --> Store
  Store --> Evidence
  Evidence --> UI
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant User as User
  participant UI as Shell UI
  participant API as Local API Server
  participant Runtime as Runtime Service
  participant Coordinator as Execution Coordinator
  participant Adapter as Provider Adapter
  participant Store as File Store

  User->>UI: Register project / create task
  UI->>API: POST /api/projects, POST /api/tasks
  API->>Runtime: createProject, createTask
  Runtime->>Store: persist state
  UI->>API: POST /api/tasks/:id/run-planner
  API->>Coordinator: runPlanner
  Coordinator->>Runtime: read project/task context
  Coordinator->>Adapter: execute planner role
  Adapter-->>Coordinator: normalized result
  Coordinator->>Runtime: record run and artifact
  Runtime->>Store: write state/log/artifact
  UI->>API: GET /api/snapshot
  API-->>UI: updated task/run/artifact state
```

## Evidence Basis

- `src/runtime/contracts.js`
- `src/runtime/runtime-service.js`
- `src/runtime/file-store.js`
- `src/execution/execution-coordinator.js`
- `src/execution/provider-adapter.js`
- `src/execution/providers/local-stub-adapter.js`
- `src/execution/providers/openai-responses-adapter.js`
- `scripts/serve-ui-slice-01.mjs`
- `ui/index.html`
- `ui/app.js`
