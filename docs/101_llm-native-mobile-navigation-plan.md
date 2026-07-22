# LLM-Native Mobile Navigation Plan

## Status

- Decision: `DEC-150`
- Authority: delegated non-critical usability implementation
- Scope: responsive browser presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

At 390px, the collapsed navigation uses four rows: brand and new Mission, current Mission, four
workstream links, and Advanced Ops. It occupies 212px, followed by the 73px Workspace Header, so the
selected Mission heading begins at 309px. The controls are correct, but their vertical arrangement
delays the workstream that should remain the first-viewport focus.

## Product Boundary

1. Below 820px, the collapsed rail uses three rows: brand and new Mission, four primary workstream
   links, then current Mission and Advanced Ops.
2. The existing native Mission and Advanced Ops disclosures remain the only disclosure controls.
3. A collapsed disclosure may share the utility row. When either disclosure opens, it receives the
   full rail width and the other control moves below it.
4. The current Mission title, Mission count, disclosure indicator, Advanced Ops label, and pending
   gate count remain visible. The detailed current-Mission label may be omitted in the collapsed
   mobile row because the selected Mission title is immediately repeated as the workspace heading.
5. Desktop keeps the existing 232px navigation rail without layout or interaction changes.

This adds no route, request, record, persisted preference, automatic selection, or authority-bearing
action.

## Compatibility

- Existing `llm-sidebar-missions`, `llm-primary-nav-list`, and `llm-advanced-ops-nav` elements remain
  source and interaction owners.
- Existing `details` open state, Mission selection path, `aria-current`, surface router, and pending
  gate projection remain unchanged.
- The current mobile Workspace Header and its required metadata remain unchanged.
- No HTML structure, JavaScript handler, localStorage, sessionStorage, runtime record, API route,
  schema field, or dependency is added.

## Verification

Focused UI smoke pins the three-row responsive layout, full-width open states, unchanged desktop
layout, current Mission and pending-gate visibility, and the absence of runtime or authority changes.

Real-browser QA covers 1440x1000 and 390x844. It measures collapsed rail and workspace-heading
positions, opens both disclosures by pointer and keyboard, verifies every Mission and Advanced Ops
destination remains reachable, checks current and pending states, and requires zero horizontal
overflow or console errors.

## Rollback

Restore the prior stacked mobile rules. No runtime state, route, provider configuration, or persisted
UI cleanup is required.

## Still Blocked

- navigation removal, rename, route changes, or automatic selection
- hiding Mission context or pending Decision Inbox gates
- persisted disclosure state or new mobile-only behavior
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, scheduling, policy mutation, or connectors
