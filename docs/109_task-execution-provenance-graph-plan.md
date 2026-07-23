# Task Execution Provenance Graph Plan

- Decision: `DEC-158`
- Scope: one Task Detail read-only evidence projection
- Runtime schema: v16 unchanged
- API: `GET /api/tasks/:taskId/execution-provenance`

## Goal

Let an operator inspect the recorded lineage of one selected Task without turning the graph into a
second workflow engine.

## Contract

- The projection reads only the active project's exact Task through `loadStateReadonly()`.
  Missing or non-canonical Task IDs return `404`; Tasks outside the active project return `409`.
- It emits deterministic Context, Plan, Build, Verify, Deliver, and Close lanes. Nodes and edges
  come only from recorded project, Mission, Task, ExecutionPlan, WorkOrder, Run, Artifact,
  Approval, Decision Inbox, checkpoint, criterion, proof, package, acceptance, and close-out refs.
  Mission lineage uses exact equality, including `null`, so a Task without a Mission cannot absorb
  another Mission's plan, verification, package, or close-out records.
- A Role node is derived only from a stored `run.role`. Artifact body, log, path, prompt,
  provider payload, environment, credential, and changed-file content are never parsed or returned.
- Every node and edge carries sorted source refs. The projection caps at 250 nodes, removes dangling
  edges after truncation, excludes `generatedAt` from the digest, and deep-freezes the response.
- Task Detail keeps the disclosure closed by default. Opening it performs one exact GET; filtering,
  selected-node focus, and detail inspection remain browser-memory-only. Desktop renders an SVG and
  mobile renders the same records as a semantic list. A source snapshot change invalidates the
  visible graph and re-reads the same Task so old status or digest evidence cannot remain on screen.

## Verification

- `node --check src/runtime/execution-provenance-graph.js`
- `node scripts/smoke-ai-company-execution-provenance-graph.mjs`
- `node scripts/smoke-ui-slice-692.mjs`
- `node scripts/ui_qa_status.mjs`
- `node scripts/verification_status.mjs`

## Boundaries

No schema migration, dependency, write, approval, execution, resume, automatic selection, runtime
search/index, persisted layout, artifact-specific subgraph, 3D/WebGL, provider call, source
mutation, commit, push, release, or scheduling authority is included.
