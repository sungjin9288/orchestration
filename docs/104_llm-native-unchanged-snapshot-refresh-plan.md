# LLM-Native Unchanged Snapshot Refresh Plan

## Status

- Decision: `DEC-153`
- Authority: delegated non-critical browser stability implementation
- Scope: periodic browser refresh behavior only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The local shell polls `/api/snapshot` every five seconds. The server changes `generatedAt` on every
read, so the browser previously replaced every workstream DOM subtree even when `snapshot`,
`derived`, and `runtimeRoot` were identical. On the Mission Graph this moved focus from the active
search field to the document body and recreated otherwise unchanged disclosure and control state.

## Product Boundary

1. Only the timer path may treat unchanged authoritative snapshot content as a no-op.
2. The comparison includes `snapshot`, `derived`, and `runtimeRoot`; the read timestamp
   `generatedAt` is excluded from the content decision and still updates the visible refresh status.
3. An unchanged timer read does not apply the snapshot again, reseed selection, run full detail
   hydration, or render the workspaces.
4. The visible Logs surface remains fresh for its selected run: its append-only log endpoint is
   polled, and only the Logs surface renders when log content changes. A response for a run that is
   no longer selected is discarded.
5. Bootstrap, explicit refresh, QA refresh, changed snapshots, and error recovery keep the existing
   full refresh path.

This slice adds no debounce queue, background scheduler, storage, route, or action authority.

## Compatibility

- The existing five-second interval and `/api/snapshot` request remain unchanged.
- Runtime records, exact Mission Graph projection, selected ids, response-only previews, drafts,
  disclosures, and operator actions retain their existing sources and ownership.
- Artifact content remains record-bound; run logs are the only selected detail that can append
  independently of a state save and therefore retain a dedicated polling guard.
- A previous connection error cannot be hidden by the no-op gate: the next successful read uses the
  full path and clears the error state.
- A timer-only selected-log failure leaves the current workspace intact, reports the failure in the
  refresh status, and retries on the next interval. Explicit refresh keeps the existing full error
  and recovery contract.
- The comparison is intentionally order-sensitive to the server JSON contract. Any key-order drift
  takes the safe full-refresh path instead of producing a stale no-op.
- Runtime-managed artifact files are immutable after their record is created. Out-of-band artifact
  file edits are outside the runtime contract and require explicit refresh for inspection.
- No runtime write, schema field, dependency, endpoint, provider call, persistence, or authority is
  added.

## Verification

Focused smoke executes stable-field comparison, generatedAt exclusion, first-read behavior,
selected-log success and failure identity guards, timer-only no-op use, Logs-only render targeting,
retryable failure preservation, and full bootstrap/manual/QA compatibility.

Current-state Playwright covers 1440x1000 and 390x844. It keeps the Mission Graph search value,
caret, focus, open disclosures, scroll position, and zero horizontal overflow through a timer cycle
with no workspace mutation; explicit refresh still executes the full render path. Both viewports
complete without console, page, or request errors. A separate Chromium API-interception pass proves
that an appended selected log changes only the Logs surface and that an expected 500 response leaves
the current Logs and surrounding workspace DOM intact while exposing the retryable status.

## Rollback

Restore the timer to call `refreshData()` without `skipUnchanged` and remove the comparison and
selected-log helpers. Runtime state, routes, stored records, and source evidence require no cleanup.

## Still Blocked

- server push, SSE, WebSocket, adaptive polling, background scheduling, or cross-tab coordination
- durable browser drafts, disclosure preferences, refresh history, or cache persistence
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass, commit,
  push, release, scheduling, policy mutation, or connectors
