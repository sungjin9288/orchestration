# LLM-Native Advanced Ops Overview Placement Plan

## Status

- Decision: `DEC-155`
- Authority: delegated non-critical browser presentation implementation
- Scope: secondary overview placement, disclosure, and responsive containment only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The existing `#control-overview` renders useful review and operations evidence, but it sits before
`main#workspace-main`. That makes a secondary inspection surface precede the selected authoritative
workspace and interrupts the primary LLM workstream reading order.

## Product Boundary

1. Keep the existing `#control-overview` element and move it after `main#workspace-main`.
2. Wrap it in default-closed native `details#control-overview-disclosure` with the summary
   `추가 운영 도구`.
3. Hide the disclosure for the workflow group and show it for the existing Advanced Ops inspection
   groups after the active authoritative surface.
4. Remove closed disclosure content from layout and use bounded margins, intrinsic-width containment,
   wrapped task actions, single-column staffing fields, and wrapped monospace evidence values; do not
   mask overflow or truncate source values.
5. Preserve `renderControlOverview`, review and ops renderers, event handlers, browser-local storage,
   routes, focus target, and all runtime contracts.

## Compatibility

- Review and operations overview content keeps the same source renderers and the same element id.
- Workflow rendering still runs through the existing source path, but its overview disclosure remains
  absent from the primary workstream.
- The disclosure is native and default closed. No browser preference, localStorage key, route, or
  focus behavior is added.
- This change adds no runtime write, API/schema/dependency behavior, provider call, source mutation,
  approval bypass, commit, push, release, scheduler, policy, or connector.

## Verification

`scripts/smoke-ui-slice-689.mjs` checks DOM order, default closure, the retained section id, workflow
hide and Advanced Ops display rules, bounded containment, no root overflow masking, existing renderer
and browser-local source bindings, and the authority boundary. Existing control-plane, Advanced Ops,
Workspace Header, mobile navigation, and workspace focus smokes protect compatibility.

Browser verification should confirm the selected authoritative surface appears before the closed
disclosure, that the disclosure opens accessibly on review and operations surfaces, that workflows do
not render it, and that desktop/mobile widths remain overflow-free. The completed 1440x1000,
821x900, 820x900, and 390x844 matrix passes all four Workflow and four Advanced Ops surfaces,
keyboard open/close, browser-local roster add/remove, zero API writes, and zero console, page, or
request errors. Current UI QA passes required `67/67`; aggregate verification passes required `1/1`,
informational `262/262`, total `263/263`.

## Rollback

Restore the section before `main`, remove the disclosure styles and DEC-155 evidence, and retain all
existing renderer output, browser storage, runtime state, routes, and source records.

## Still Blocked

- overview data, renderer, handler, browser preference, localStorage, route, or focus changes
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass, commit,
  push, release, scheduling, policy mutation, or connectors
