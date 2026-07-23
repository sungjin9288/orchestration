# LLM-Native Desktop Workspace Focus Offset Plan

## Status

- Decision: `DEC-154`
- Authority: delegated non-critical browser presentation implementation
- Scope: desktop workspace focus visibility only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

Surface navigation renders the selected workspace and deliberately focuses `main#workspace-main`.
The desktop Workspace Header is sticky, so the focused workspace start can sit under that header even
though the target, route, and keyboard handoff are correct.

## Product Boundary

1. At `min-width: 821px`, the existing `body .llm-app-shell .surface-stack` receives only
   `scroll-margin-top: 46px`.
2. The existing `workspaceMain.focus()` call and the `#workspace-main` skip-link target remain the
   focus contract.
3. At `max-width: 820px`, the existing static header and current surface-stack scroll margin remain
   unchanged.
4. This is CSS-only. It adds no JavaScript, HTML, runtime/API/schema/dependency, persistence, route,
   provider, or authority behavior.

## Compatibility

- Desktop navigation and skip-link focus retain the same target and timing.
- Mobile keeps its static header, so it does not inherit desktop sticky-header compensation.
- Workspace content, browser state, exact Mission Graph response, approval gates, and source evidence
  stay under their existing ownership.
- No write path, provider call, source mutation, commit, push, release, scheduler, policy, or
  connector is introduced.

## Verification

`scripts/smoke-ui-slice-688.mjs` checks the existing focus handoff, target tabindex, desktop-only
46px rule, mobile static header, unchanged mobile scroll margin, and authority boundary. Adjacent
focus, Workspace Header, mobile navigation, and unchanged-refresh smokes protect compatibility.

Browser verification should cover 1440x1000, 821x900, 820x900, and 390x844. It must verify focus,
heading visibility below the header, zero horizontal overflow, and no console, page, or request
errors. The completed matrix passes those four viewports across all primary and Advanced Ops
surfaces. Current UI QA passes required `67/67`; aggregate verification passes required `1/1`,
informational `262/262`, total `263/263`.

## Rollback

Remove the one desktop media rule and its documentation/smoke registration. The existing focus
handoff, mobile layout, runtime state, routes, and stored evidence require no cleanup.

## Still Blocked

- focus target or timing changes, skip-link behavior changes, or mobile header behavior changes
- persisted browser scroll state, route/runtime/API/schema/dependency changes, or provider fallback
- source mutation, approval bypass, commit, push, release, scheduling, policy mutation, or connectors
