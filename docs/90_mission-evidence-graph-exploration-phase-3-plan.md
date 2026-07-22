# Mission Evidence Graph Exploration Phase 3 Plan

## Status

- Decision: `DEC-139`
- Authority: delegated non-critical implementation approval
- Scope: browser-only exploration of the existing Mission evidence graph response
- Runtime schema: v16 unchanged
- API contract: existing exact GET unchanged

## Problem

Phase 2 makes the complete Mission evidence chain visible, but a graph with many records is still
slow to inspect. The operator can see the lifecycle shape, yet cannot quickly isolate one stage,
find a source ref, or understand the relationships around one node.

The next useful step is not a larger graph engine. It is a small set of reading controls over the
already-loaded response.

## Product Boundary

Phase 3 adds four browser-memory capabilities to the selected Mission's `Graph` view:

- case-insensitive search over node label, kind, status, stage, and source ref
- one lifecycle-stage filter and one status-tone filter
- one selected-node focus with unrelated nodes and edges visually dimmed
- one read-only detail region for the selected node and its visible relationships

These controls inspect the current Phase 2 response only. They do not fetch a broader graph, alter
the source projection, persist preferences, navigate to an authority-bearing surface, or expose a
runtime action.

## View Model

The graph renderer derives one pure view model from `graph` plus browser-owned explorer state:

```text
query
stage
statusTone
selectedNodeId
```

The view model returns:

```text
visibleNodes
visibleEdges
visibleNodesByStage
matchedNodeIds
focusedNodeIds
selectedNode
selectedRelationships
availableStatusTones
counts
```

Rules:

- Empty query and `all` filters preserve every projected node and edge.
- Search and filters remove non-matching nodes from the visible set.
- An edge is visible only when both endpoints are visible.
- Selecting a visible node keeps all visible nodes in layout, but marks the selected node and its
  directly connected visible neighbors as focused.
- Selection is cleared when the node is no longer visible or the Mission changes.
- Focus never changes the runtime graph, source digest, or response counts.

## Search And Filter Contract

- Query text is trimmed, lower-cased, and capped at 120 characters in browser state.
- Search inspects only the existing short graph fields: `label`, `kind`, `status`, `stage`, and
  `sourceRef`.
- Lifecycle filter values are `all` plus the six existing stage ids.
- Status filter values are `all`, `success`, `warning`, `danger`, and `neutral`, derived through the
  existing status-tone classifier.
- The UI reports visible nodes and relationships separately from the source projection count.
- A zero-result state keeps the controls and exact source evidence visible.

## Read-Only Detail Contract

The selected-node detail shows only fields already present in the exact GET response:

- label, kind, lifecycle stage, status, importance, source ref, and optional creation time
- visible incoming and outgoing relationship kind, adjacent node label, and edge source refs

It does not show Mission goal or constraints, transcript or artifact bodies, provider payloads,
project paths, environment values, credentials, or inferred recommendations. The detail region has
no approval, execution, resume, mutation, Git, release, or navigation action.

## Interaction And Accessibility

- Search applies through an explicit form submit so typing does not repeatedly replace the document
  or move keyboard focus.
- Stage and status selects apply immediately and use native menu semantics.
- SVG nodes use `role=button`, keyboard focus, `aria-pressed`, and Enter or Space selection.
- The mobile semantic list uses real buttons with the same selected-node behavior.
- A clear command resets query, filters, and selection in browser memory only.
- The detail region uses `aria-live=polite`; focus remains on the node or control that caused the
  update.
- Reduced-motion behavior remains unchanged because no graph animation is added.

## Compatibility

- `Thread` remains the default Mission view.
- `GET /api/missions/:missionId/evidence-graph` and its response are unchanged.
- `src/runtime/mission-evidence-graph.js`, runtime service behavior, schema v16, file-store
  normalization, dependencies, and provider contracts remain unchanged.
- Phase 2 still proves exact GET, source-backed projection, 250-node cap, state-byte stability, and
  absent authority-bearing graph actions.
- Browser explorer state is cleared on Mission change and page refresh.

## Verification

Focused Phase 3 smoke must prove:

- default view model preserves every node and endpoint-closed edge
- query matches label, kind, status, stage, and source ref case-insensitively
- lifecycle and status filters compose deterministically
- selected-node focus includes only the selected node and direct visible neighbors
- stale or filtered-out selection clears safely
- details contain only existing graph fields and exact visible relationship refs
- renderer escapes untrusted graph text
- browser source contains no explorer persistence, fetch, write endpoint, or authority action
- Phase 2 exact GET and state-byte-stability smoke remains green

Real-browser QA covers desktop and 390px mobile search, filter, selection, detail rendering, keyboard
selection, zero horizontal overflow, and zero console warning or error. Final closure includes UI QA,
README and completion inventory checks, `git diff --check`, and aggregate verification.

## Rollback

Remove the explorer controls, browser explorer state, selection handlers, detail region, focused
styles, Phase 3 smoke, and registry entries. Keep the Phase 2 graph projection, exact GET route,
Thread default, schema-v16 state, and every source record unchanged.

## Still Blocked

- runtime or durable graph search, index, ranking, recommendation, or automatic selection
- graph-derived approval, execution, resume, mutation, source, Git, release, or navigation authority
- URL, localStorage, sessionStorage, file-store, or schema persistence of explorer state
- timeline, replay, historical reconstruction, graph diff, or checkpoint time travel
- Canvas, WebGL, Three.js, 2.5D, 3D, avatars, flight, or immersive scenes
- provider calls, memory application, scheduling, policy mutation, or external connectors
