# LLM-Native Advanced Ops Navigation Plan

## Status

- Decision: `DEC-147`
- Authority: delegated non-critical usability implementation
- Scope: sidebar navigation presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The primary Mission, Council, Execution, and Deliverables surfaces now read as one LLM-native
workstream, but the sidebar still starts with `workflows / review / ops` tabs of equal visual weight.
That presentation contradicts the accepted product hierarchy: operational evidence should remain one
step away without taking over the default screen.

## Product Boundary

The sidebar uses two levels:

1. Mission, Council, Execution, and Deliverables remain visible as the primary workstream.
2. One native Advanced Ops disclosure contains Decision Inbox, Artifacts, Logs, and Taskboard.
3. The disclosure stays closed in the primary workstream unless the operator explicitly opens it.
4. Entering any Advanced Ops surface opens the disclosure and preserves the exact current button.
5. Returning to a primary surface closes the disclosure.
6. A pending-gate count remains visible in the disclosure summary so demotion never hides operator
   attention state.

This is navigation hierarchy, not a new mode, permission, route, or workflow. The same surface buttons
continue to receive their source-backed counts and `aria-current` state from `renderNav()`.

## Compatibility

- Existing grouped navigation markup remains source-present and hidden only in the LLM-native shell.
- `NAV_GROUPS`, `getNavGroupForSurface()`, `handleSurfaceChange()`, surface renderers, and control
  overview routing remain unchanged.
- The disclosure uses browser-memory state only. It creates no localStorage, sessionStorage, URL,
  runtime, API, or persisted preference.
- Decision Inbox, Artifacts, Logs, and Taskboard remain the authoritative Advanced Ops surfaces.
- Schema v16, dependencies, records, provider policy, review and approval semantics, source mutation,
  commit, push, release, scheduling, policy, and connector authority do not change.

## Verification

Focused UI smoke proves one primary list, one Advanced Ops disclosure, exact eight-surface coverage,
dynamic count and current-state reuse, transition-aware disclosure behavior, native keyboard semantics,
hidden grouped-navigation compatibility, and absence of runtime, API, schema, dependency, storage, or
authority changes.

Real-browser QA covers 1440x1000 and 390x844. It verifies default collapsed state, explicit open,
Decision Inbox navigation and current state, automatic open for Advanced Ops, automatic close on
Mission return, keyboard access, pending-gate visibility, zero horizontal overflow, and console output.

## Rollback

Hide the LLM-native navigation block and restore the existing grouped navigation. No route, record,
preference, gate, or action requires migration or cleanup.

## Still Blocked

- removal or semantic demotion of any authoritative Advanced Ops surface
- routing, count, gate, action-selection, or control-overview behavior changes
- persisted navigation preferences or automatic surface selection
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, scheduling, policy mutation, or connectors
