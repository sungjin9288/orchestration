# Workflow Architecture Diagram

```mermaid
flowchart LR
  subgraph Browser["Browser Shell"]
    Mission["Mission"]
    Council["Council"]
    Execution["Execution"]
    Deliverables["Deliverables"]
    Ops["Advanced Ops\nTaskboard / Logs / Artifacts / Decision Inbox"]
  end

  subgraph API["Local API Server\nscripts/serve-ui-slice-01.mjs"]
    Routes["/api/projects\n/api/tasks\n/api/tasks/:id/run-*\n/api/snapshot"]
  end

  subgraph Runtime["Runtime Layer"]
    Contracts["contracts.js\nlifecycle, artifact, review, approval constants"]
    Service["runtime-service.js\nprojects, tasks, runs, artifacts, inbox, approvals"]
    FileStore["file-store.js\nstate, logs, artifact files"]
  end

  subgraph Execution["Execution Layer"]
    Coordinator["execution-coordinator.js\nplanner -> architect -> task-breaker -> builder -> reviewer"]
    ProviderBoundary["provider-adapter.js"]
    LocalStub["local-stub-adapter.js"]
    OpenAI["openai-responses-adapter.js\noptional live adapter"]
  end

  Browser --> Routes
  Routes --> Service
  Routes --> Coordinator
  Service --> Contracts
  Service --> FileStore
  Coordinator --> Service
  Coordinator --> ProviderBoundary
  ProviderBoundary --> LocalStub
  ProviderBoundary --> OpenAI
  Coordinator --> FileStore
  FileStore --> Browser
```

## Captured Evidence

- `evidence/config-evidence/workflow-config-evidence.md`
- `evidence/state-transitions/state-transition-summary.md`
- `evidence/workflow-logs/workflow-api-sequence.status`
