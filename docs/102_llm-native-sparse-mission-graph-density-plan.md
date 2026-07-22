# LLM-Native Sparse Mission Graph Density Plan

## Status

- Decision: `DEC-151`
- Authority: delegated non-critical usability implementation
- Scope: Mission Graph browser presentation only
- Runtime schema: v16 unchanged
- API contract: exact DEC-138 GET unchanged

## Problem

The current selected Mission projects two source nodes and one relationship correctly, but the
desktop SVG still uses the large-graph minimum height. The complete Graph region occupies 682px even
though its nodes fit on one row. At 390px, the semantic fallback repeats a separate empty-state
sentence for each of four zero-node stages. Both layouts are accurate, but they spend more space on
absence than on source evidence.

## Product Boundary

1. Desktop keeps all six lifecycle columns and derives SVG height from the largest visible stage.
2. Sparse projections use a 220-unit minimum canvas. Dense projections keep the existing 52-unit row
   spacing, viewport scroll cap, node positions, edges, labels, and selection behavior.
3. Mobile keeps all six semantic stage headings and counts. A zero-node stage omits only its repeated
   empty-state paragraph.
4. Search, lifecycle/status filters, reset, direct-neighbor focus, source detail, and keyboard
   behavior remain unchanged.
5. The workspace grid keeps the Header in its intrinsic row and gives remaining viewport height to
   the content row, so a short Graph cannot stretch the Header.

This slice does not change the projection, response, source digest, truncation, stage membership, or
authority.

## Compatibility

- `GET /api/missions/:missionId/evidence-graph` remains the only graph data source.
- `Thread` remains the default Mission view.
- `maxNodes=250`, deterministic endpoint closure, exact source refs, and state-byte stability remain
  DEC-138 runtime responsibilities.
- No fetch, storage, schema field, dependency, runtime write, provider call, or action control is
  added to the renderer.

## Verification

Focused smoke proves a 220-unit sparse canvas, unchanged row-derived dense height, six semantic stage
headings, count-only empty mobile stages, intrinsic Header row ownership, input immutability, escaped
source text, and absent authority actions. DEC-138 and DEC-139 smokes remain the
runtime/API/explorer compatibility gates.

Current-state Playwright covers 1440x1000 and 390x844, verifies exact Graph selection, desktop SVG,
mobile semantic fallback, reduced Graph height, zero horizontal overflow, and zero console or request
errors.

## Rollback

Restore the previous 360-unit minimum canvas and empty-stage paragraph rendering. No runtime state,
route, browser storage, or source evidence cleanup is required.

## Still Blocked

- lifecycle stage removal, reordering, inference, or projection changes
- runtime graph search/index, persisted layout or explorer state, and cross-Mission retrieval
- graph approval, execution, resume, source mutation, or Git actions
- runtime/API/schema/dependency changes, providers, scheduling, policy mutation, or connectors
