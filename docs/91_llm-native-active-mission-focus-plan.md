# LLM-Native Active Mission Focus Plan

## Status

- Decision: `DEC-140`
- Authority: delegated non-critical UI implementation approval
- Scope: browser-only Mission composer presentation and focus behavior
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The LLM-native shell currently renders the full new-Mission composer even when an existing Mission
is selected. That pushes the selected Mission's `Thread | Graph` workstream below the first viewport
and makes reading current work feel secondary to creating unrelated work. The sidebar `새 미션`
command also only reopens the Mission surface, so it does not communicate an explicit compose mode.

## Product Boundary

This slice separates two browser presentation states without changing Mission data or authority:

- With no selected Mission, the full composer remains open as the primary first-run action.
- With a selected Mission, the current Mission title, state, and workstream become the default focus.
- The sidebar `새 미션`, the compact in-workspace compose command, and `다음 안건 준비` explicitly
  open the full composer.
- Cancelling compose returns to the selected Mission without deleting the browser-memory draft.
- Selecting or creating a Mission closes compose mode and restores the current workstream.

The draft remains the existing browser-owned fields. No draft object, route, storage key, runtime
record, or automatic submit is introduced.

## Interaction Contract

- `missionComposerExpanded=false` is the browser default.
- The full composer is visible when there is no selected Mission or compose mode is explicit.
- The selected-Mission lead uses the Mission title as its heading and keeps the exact Mission id and
  status visible in the presence line.
- The compact compose command is a normal button with visible text and keyboard focus.
- Opening compose focuses the title input after render.
- Periodic snapshot refresh restores the focused composer field and its text selection.
- Cancelling compose focuses the sidebar `새 미션` command after render.
- Existing draft fields survive a collapse during the current page session.
- Successful Mission creation clears the draft through the existing path and closes compose mode.
- Mission selection closes compose mode and preserves the existing Thread/Graph selection contract.

## Compatibility

- Every existing Mission POST route, payload, submit button, Council mode, provider readiness gate,
  project requirement, and selected-Mission route remains unchanged.
- `Thread` remains the default view and the Phase 2 exact graph GET remains unchanged.
- Graph explorer state, runtime state, schema v16, file-store normalization, dependencies, provider
  contracts, approval semantics, and source mutation authority remain unchanged.
- The sidebar command changes from a generic surface navigation action to one browser-only compose
  action; Mission surface navigation remains available through the existing primary nav.

## Verification

Focused smoke must prove:

- active Mission defaults to compact compose mode
- no-Mission state keeps the full composer visible
- explicit new-Mission and next-Mission commands expand the composer
- cancel, Mission selection, and successful Mission creation collapse it
- full composer reuses the existing `data-form=create-mission` contract and API submit path
- focus restoration targets visible controls
- no runtime route, schema, dependency, persistence, or authority action is added

Real-browser QA covers desktop and 390px mobile active-Mission first viewport, explicit compose and
cancel behavior, title-input focus, Thread/Graph reachability, zero horizontal overflow, and zero
console warning or error. Final closure includes focused UI smoke, UI QA, completion inventory,
README evidence, `git diff --check`, and aggregate verification.

## Rollback

Remove the compose-mode browser state, explicit compose/cancel handlers, conditional renderer,
active-Mission lead styles, focused smoke, and evidence entries. Restore the sidebar command to
generic Mission surface navigation and always render the existing full composer. Runtime state,
Mission records, routes, graph projection, and source evidence require no rollback.

## Still Blocked

- durable or server-side Mission drafts, draft history, autosave, sync, import, or export
- automatic Mission creation, prompt dispatch, Council start, or provider call
- runtime/API/schema/dependency changes for composer presentation
- automatic scheduling, background work, approval bypass, source mutation, commit, push, or release
- profile or policy mutation, cross-workspace behavior, or external connectors
