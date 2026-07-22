# Mission Evidence Graph Phase 2 Plan

## Status

- Decision: `DEC-138`
- Authority: operator-approved Phase 2 implementation
- Scope: one selected Mission, one read-only graph projection, one optional Mission view
- Runtime schema: v16 unchanged

## Problem

The Mission thread explains the normal flow well, but a complex Mission can spread its Council,
WorkOrder, run, approval, checkpoint, artifact, proof, and delivery evidence across several surfaces.
The operator needs one compact way to see how those records connect without turning the graph into a
new execution surface or treating visual proximity as authority.

## Product Boundary

`Mission Evidence Graph` is an optional `Thread | Graph` reading mode inside Mission.

- `Thread` remains the default and authoritative narrative.
- `Graph` shows source-backed relationships for the currently selected Mission.
- The graph can be refreshed or left to the existing snapshot refresh cycle.
- It cannot approve, execute, resume, mutate, persist, commit, push, release, or call a provider.
- Search, filters, focus-and-dim, timeline replay, 2.5D, 3D, and graph editing remain later work.

## Source Of Truth

The projection reads current schema-v16 state through `loadStateReadonly()`.

Eligible records are limited to the selected Mission's project-scoped provenance chain:

- Mission and Council session attempts, positions, and synthesis
- ExecutionPlan, WorkOrder, dependency, and HandoffPacket evidence
- linked control Task, Run, Artifact, Approval, and Decision Inbox records
- WorkflowCheckpoint, AcceptanceCriterion, and VerificationProof records
- DeliveryPackage, DeliveryPackageAcceptance, and MissionCloseOut records
- source-linked LearningCandidate, review, MemoryItem, and MemoryRecall records

Nested Council records remain source-backed by their parent session and stable record id. A derived
node or edge must name its exact source ref. The projection does not synthesize missing runtime facts.

## Read-Only Contract

The exact route is:

```text
GET /api/missions/:missionId/evidence-graph
```

The response contains:

```text
schemaVersion
projectId
missionId
generatedAt
sourceDigest
maxNodes
truncated
counts
nodes[]
edges[]
authority
```

Every node contains a graph id, runtime kind, lifecycle stage, short label, current source status,
source ref, importance tier, and optional creation timestamp. Every edge contains a stable graph id,
relationship kind, source and target graph ids, and one or more source refs.

The source digest is computed from the deterministic projected node and edge data. `generatedAt` is
excluded from that digest. The returned object is deeply frozen in runtime memory.

## Size And Truncation

- `maxNodes` is fixed at `250`.
- Core Mission, Council, plan, WorkOrder, gate, and checkpoint records are ordered ahead of lower-level
  run, artifact, proof, learning, and memory evidence.
- When eligible source records exceed the cap, the projection returns the first 250 deterministic
  nodes, removes edges whose endpoints were omitted, and reports the excluded count.
- Truncation never creates a substitute aggregate node and never changes source state.

## Privacy And Authorization

- The Mission must belong to the active project.
- No goal body, constraints body, transcript content, recommendation body, artifact body, log body,
  project path, runtime root, provider payload, environment value, or credential is returned.
- Labels use already-visible titles, role names, record types, or ids only.
- The route returns no mutation token and exposes no downstream action.

## UI Contract

- Mission renders a two-option segmented control: `Thread` and `Graph`.
- `Thread` is selected on boot and keeps the existing chronological workstream unchanged.
- `Graph` loads only the exact selected Mission projection and stores it in browser memory.
- A changed Mission id invalidates the browser-memory graph before the next render.
- The graph uses deterministic lifecycle columns rather than a force simulation.
- SVG is the primary visual; a semantic details list preserves keyboard and screen-reader access.
- Status uses outline and text in addition to color. Reduced-motion users receive no animated layout.
- The graph contains no buttons for approval, execution, resume, source mutation, or Git actions.

## Verification

Focused runtime smoke must prove:

- deterministic source digest and deep freeze
- exact Mission and project scoping
- source-backed node and edge refs
- 250-node cap and endpoint closure after truncation
- omission of sensitive body/path/provider fields
- byte-stable state across repeated reads
- schema v16 and dependency baseline unchanged

Focused API/UI smoke must prove:

- exact GET success, unknown Mission refusal, and non-GET refusal
- `Thread | Graph` source contract and default Thread state
- browser-memory graph loading and selected-Mission stale-result refusal
- SVG lifecycle columns, semantic fallback, and responsive styles
- state bytes remain unchanged after HTTP reads
- no graph mutation controls or write endpoint

Final verification runs JavaScript syntax checks, the focused runtime and UI/API smokes,
`ui_qa_status`, `git diff --check`, README honesty checks, and the aggregate
`node scripts/verification_status.mjs` gate. Real-provider verification is outside this slice.

## Rollback

Remove the exact GET route, runtime projection entry point, Mission view selector, graph renderer,
styles, and focused smoke registrations. Keep schema-v16 state and every source record unchanged.
The existing Mission thread remains the default compatibility path throughout rollback.

## Still Blocked

- graph persistence, schema migration, or graph-derived runtime authority
- graph approval, execution, resume, mutation, commit, push, or release actions
- search, filters, focus-and-dim, timeline replay, or historical state reconstruction
- Canvas, WebGL, Three.js, 2.5D, 3D, avatar, flight, or immersive scenes
- provider calls, automatic retrieval, memory application, scheduling, policy mutation, or connectors
