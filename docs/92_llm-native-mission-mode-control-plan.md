# LLM-Native Mission Mode Control Plan

## Status

- Decision: `DEC-141`
- Authority: delegated non-critical UI implementation approval
- Scope: browser-only Mission Council mode selection and submit presentation
- Runtime schema: v16 unchanged
- API contract: existing Mission and Council routes unchanged

## Problem

The full Mission composer currently presents `안건 등록`, `독립 역할 회의 등록`, and
`OpenAI 역할 회의 등록` as three competing submit buttons. Council mode is supporting context, not
three separate primary commands. The layout conflicts with the LLM-native design rule that one
composer should have one clear submit action and a compact mode control.

## Product Boundary

This slice replaces the competing submit buttons with:

- one native radio-based segmented control for `기본`, `독립 역할`, and `OpenAI`
- one existing `안건 등록` submit command
- one optional `취소` command when a Mission is already selected
- one concise selected-mode description and the existing provider-readiness reason when OpenAI is
  unavailable

The control only chooses the value already consumed by the existing Mission creation flow. It does
not create a new mode, route, provider call, persistence path, or authority.

## View Model

`ui/mission-council-mode.js` derives the visible mode options and selected mode from:

```text
requestedMode
knowledgeWork
providerReady
providerBlockedReason
```

Rules:

- `legacy-deterministic` is always available and is the fallback.
- `real-local-stub` is available only for the development pack.
- `real-openai-responses` is available only for the development pack with current provider
  readiness.
- A stale, unavailable, or unknown browser selection falls back to `legacy-deterministic` before
  render and submit.
- Knowledge-work shows one fixed basic mode and preserves its existing deliverable-specific help.
- Provider unavailability remains visible but does not create a second submit action.

## Interaction And Accessibility

- The mode group uses `fieldset`, `legend`, and native radio inputs.
- Arrow-key and screen-reader behavior comes from the native radio group.
- Visible segments have stable dimensions, selected state, disabled state, and focus outline.
- Browser state preserves the selected mode across periodic snapshot refresh and composer collapse.
- Successful Mission creation resets the next draft to the default mode.
- The submit handler reads the checked radio value from the current form and passes it through the
  existing `submitCreateMission({ councilMode })` path.

## Compatibility

- `POST /api/missions` and `/api/missions/:id/council/start` are unchanged.
- The local UI server adds only the explicit static route needed to serve the new browser module.
- `legacy-deterministic`, `real-local-stub`, and `real-openai-responses` values are unchanged.
- Existing `autoDraftCouncil`, provider readiness, knowledge-work, human alignment, and approval
  semantics are unchanged.
- `DEC-140` active-Mission compact/full composer behavior remains unchanged.
- Runtime state, schema v16, file store, dependencies, source mutation, and Git authority are
  unchanged.

## Verification

Focused smoke must prove mode normalization, development and knowledge-work option sets, provider
readiness fallback, selected help, segmented semantics, one submit button, current form value
handoff, and absence of persistence or authority expansion.

Real-browser QA covers keyboard mode selection, one submit CTA, disabled OpenAI evidence, periodic
refresh preservation, desktop/mobile fit, zero horizontal overflow, and zero console warning or
error. Final closure includes prior Council compatibility smokes, active-Mission focus smoke, README
and completion inventory checks, UI QA, `git diff --check`, and aggregate verification.

## Rollback

Remove the pure mode view model, segmented control, browser mode draft field, focused smoke, and
evidence entries. Restore the three existing submit buttons and `event.submitter` mode handoff.
Runtime state and records require no rollback.

## Still Blocked

- new Council or provider modes, provider fallback, automatic mode recommendation or selection
- durable composer preferences, draft persistence, autosave, history, sync, import, or export
- automatic Mission creation, Council start, scheduling, or background work
- runtime/API/schema/package dependency changes
- approval bypass, source mutation, commit, push, release, policy mutation, or connectors
