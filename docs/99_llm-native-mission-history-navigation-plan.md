# LLM-Native Mission History Navigation Plan

## Status

- Decision: `DEC-148`
- Authority: delegated non-critical usability implementation
- Scope: sidebar Mission context and selection presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The shell starts new Missions from the sidebar, but existing Mission selection remains inside a
collapsed register at the bottom of the Mission workspace. That separates the two sides of the same
LLM-native navigation task: starting a conversation is immediate, while returning to one requires
scrolling through the active conversation first.

## Product Boundary

1. The sidebar shows the current Mission title and the number of Missions in the active project.
2. One native disclosure exposes every source-current Mission in newest-first order.
3. Each row shows the exact Mission title and status and reuses the existing `select-mission` action.
4. The selected row is explicit through `aria-pressed` and a restrained visual current state.
5. The disclosure is closed by default, uses browser-memory state only, and stays compact on mobile.
6. The existing full Mission register remains available in the Mission workspace as detailed history.

This adds no Mission search, ranking, grouping, pinning, deletion, mutation, or automatic selection.

## Compatibility

- `data.missions` remains project-scoped and newest-first through the existing `getDerived()` path.
- `submitSelectMission()` remains the only selection command and keeps its existing exact POST route,
  detail hydration, Mission surface handoff, and runtime-selected Mission behavior.
- The prompt-first new-Mission command, primary surface navigation, Advanced Ops disclosure, Thread,
  Graph, Council, Execution, Deliverables, and full Mission register remain unchanged.
- No localStorage, sessionStorage, URL state, runtime record, API route, schema, or dependency is added.

## Verification

Focused UI smoke proves source-current full-list rendering, exact selected state, existing selection
route reuse, browser-memory disclosure state, full-register compatibility, responsive bounded list
height, and the absence of persistence or authority expansion.

Real-browser QA covers 1440x1000 and 390x844. It verifies current Mission context, default collapse,
explicit and keyboard open, selection of another Mission, current-state update after runtime response,
full Mission count, workspace handoff, mobile fit, zero horizontal overflow, and console output.

## Rollback

Hide the sidebar Mission disclosure and keep the existing full Mission register as the sole Mission
selection surface. No record, route, preference, or runtime cleanup is required.

## Still Blocked

- Mission search, ranking, pinning, grouping, rename, delete, archive, or automatic selection
- persisted sidebar or Mission-history preference
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, scheduling, policy mutation, or connectors
