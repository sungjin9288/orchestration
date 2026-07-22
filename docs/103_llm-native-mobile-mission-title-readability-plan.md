# LLM-Native Mobile Mission Title Readability Plan

## Status

- Decision: `DEC-152`
- Authority: delegated non-critical usability implementation
- Scope: mobile navigation presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The three-row mobile rail keeps every required destination visible, but its collapsed current-Mission
summary forces the title onto one line and replaces the rest with an ellipsis. At 390px,
`LLM-native Execution control` appears as `LLM-native Executio...`. The Mission remains selectable,
but the navigation no longer exposes the complete current context required by `DESIGN.md`.

## Product Boundary

1. The collapsed mobile rail keeps its three-row structure: brand and new Mission, four primary
   workstreams, then current Mission and Advanced Ops.
2. The current Mission title wraps naturally and remains fully visible. It is not line-clamped,
   shortened, or replaced with a generated alias.
3. The Mission count, disclosure indicator, Advanced Ops label, and pending-gate count remain visible.
4. Opening either native disclosure keeps the existing full-width responsive layout, source order,
   keyboard behavior, selection route, and browser-memory-only state.
5. The desktop rail remains unchanged.

This slice changes no navigation destination, source data, route, or authority.

## Compatibility

- Mission history continues to render from the existing active-project newest-first source list.
- Current Mission selection continues to use the existing `select-mission` action and POST route.
- Advanced Ops continues to expose Decision Inbox, Artifacts, Logs, and Taskboard with the current
  pending-gate projection.
- No fetch, storage, schema field, dependency, runtime write, provider call, or action is added.

## Verification

Focused smoke proves the three-row mobile contract, natural title wrapping, absence of ellipsis and
line clamping in the current-Mission title rule, full-width disclosure expansion, unchanged desktop
navigation, and absent runtime or authority expansion. The DEC-150 navigation smoke remains the
adjacent compatibility gate.

Current-state Playwright covers 1440x1000 and 390x844, verifies the complete title text, three
collapsed rows, both disclosure paths, keyboard access, all eight destinations, pending-gate status,
zero horizontal overflow, and zero console or request errors.

## Rollback

Restore the one-line ellipsis rule and 34px mobile summary minimum. No runtime state, route, browser
storage, or source evidence cleanup is required.

## Still Blocked

- Mission rename, shortening, alias generation, search, ranking, pinning, grouping, deletion, or archive
- navigation destination removal or renaming and automatic Mission selection
- persisted disclosure or navigation preference
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass, commit,
  push, release, scheduling, policy mutation, or connectors
