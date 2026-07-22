# LLM-Native Workspace Header Plan

## Status

- Decision: `DEC-149`
- Authority: delegated non-critical usability implementation
- Scope: browser presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The visible workspace header says only `WORK` and `local workspace`. The project, current surface,
and open gate count already exist, but they sit in a hidden legacy register. The primary Mission,
Council, Execution, and Deliverables leads then repeat project and status metadata above their titles.
The result is more chrome without a clearer operating context.

## Product Boundary

1. One visible header band shows the current project, normalized provider mode, current surface, open
   gate count, refresh state, and the existing refresh command.
2. Project and provider values come from the active project already present in the snapshot. The
   header does not infer provider readiness or edit provider configuration.
3. Surface and gate values reuse the current browser surface and existing pending-gate projection.
4. The repeated presence row above each primary workstream title is removed. Lifecycle status and
   exact evidence remain in the workstream, sidebar, context inspector, and secondary details.
5. Mobile keeps the same metadata visible in the same header band and wraps by intent when space is
   limited. No required context is hidden at 390px.

This adds no record, route, request, persisted preference, automatic refresh, or authority-bearing
action.

## Compatibility

- The existing `shell-header-project`, `shell-window-label`, `shell-header-surface`,
  `shell-header-gates`, `refresh-status`, and `refresh-button` bindings remain authoritative.
- `getProjectProviderConfig()` remains the only provider normalization used by the browser.
- Existing surface routing, gate calculation, refresh handling, Mission selection, primary
  workstreams, Advanced Ops, and hidden legacy heading remain unchanged.
- No localStorage, sessionStorage, runtime record, API route, schema field, or dependency is added.

## Verification

Focused UI smoke proves one visible metadata band, exact existing bindings, normalized provider and
current-surface rendering, open-gate reuse, preserved refresh control, removed workstream metadata
duplication, mobile visibility, and the absence of runtime or authority expansion.

Real-browser QA covers 1440x1000 and 390x844. It verifies project, provider mode, current surface,
open gate count, refresh state, surface updates, one metadata band, mobile wrapping, zero horizontal
overflow, and zero console warnings or errors.

## Rollback

Restore the static window labels and workstream presence rows. No runtime state, route, provider
configuration, or persisted UI cleanup is required.

## Still Blocked

- provider configuration or readiness mutation from the header
- gate calculation or approval behavior changes
- persisted header state, automatic surface selection, or automatic refresh
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, scheduling, policy mutation, or connectors
