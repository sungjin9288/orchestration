# AI Company Strategist Mission Context Consumption Plan

## Status And Authority

- Planning decision: `operator-decision-ai-company-strategist-mission-context-consumption-planning-001`
- Decision status: `approve-ai-company-strategist-mission-context-consumption-planning-only`
- Recorded decision: `DEC-228`
- Implementation handoff: `DEC-229`, documented in
  `docs/156_ai-company-strategist-mission-context-consumption-implementation-decision-handoff.md`
- Reserved implementation decision: `DEC-230`
- Current implementation status: planning-only; `implementationAllowed=false`
- Implementation-readiness correction: the 2026-08-11 live-code audit narrows migration,
  historical validation, projection, and coupled-smoke semantics without opening authority.

This plan defines the next narrow AI Company authority after Stage 7A. It is a real local-stub
consumption path, not a response-only preview. The operator may select one exact current
`MissionContextAttachment`, pass a normalized copy only to Strategist during the first attempt of
one new accepted StaffingPlan Council entry, and stop the session at human alignment. This document
does not authorize runtime, schema, API, UI, provider, prompt, policy, source, Git, scheduling, or
downstream WorkOrder changes.

## Current Evidence

The current runtime is schema v29. Stage 7A (`DEC-225` through `DEC-227`) stores one immutable,
source-current `MissionContextAttachment` per Mission and exposes exact Mission-bound inspection.
The attachment retains `roleConsumptionStatus=blocked`; the existing Council entry already requires
an accepted StaffingPlan and a separate entry approval, but it has no attachment selection or
role-owned context receipt. The public `/api/council/start` route remains a legacy route and must not
be reopened for this work.

The accepted source path is therefore:

```text
accepted StaffingPlan -> StaffingEntry -> CouncilSession -> first local-stub attempt -> human alignment
```

The schema-v30 choice is deliberate. The context selection on a new `StaffingEntry`, the receipt on
the new `CouncilSession`, and the Strategist-only reference on its Council position change the exact
immutable record shapes and replay identity. Existing v29 records stay byte-equivalent legacy
variants. No top-level sequence, map, reverse reference, or placeholder is added for consumption.

The live file store normalizes supported state to the current schema in memory and persists that
schema on the next successful write. Stage 7B keeps this established migration behavior instead of
introducing a second migration-intent mechanism: boot, supported read-only load, GET, invalid input,
and exact replay do not write the v29 file, while the first later successful authorized write may
persist v30 with no fabricated context fields. A valid context-bound entry still validates and saves
its complete v30 evidence atomically. Current-schema assertions coupled to
`STATE_SCHEMA_VERSION` must move from 29 to 30 as test maintenance; historical v29 fixtures stay
v29 and must remain accepted.

## Exact Entry Contract

The future opt-in route is:

```text
POST /api/staffing-plans/:staffingPlanId/council-entry-with-strategist-context
```

The JSON body has exactly these nine keys:

```text
staffingPlanRecordDigest
sourceDigest
missionDigest
blueprintDigest
staffingSpecDigest
entryApproval
missionContextAttachmentId
missionContextAttachmentRecordDigest
contextConsumption
```

`entryApproval` remains the existing exact entry approval with `decision=enter` and a bounded
operator rationale. `contextConsumption` is a separate operator-owned decision with exactly these
fields:

```text
decision=consume
targetRole=strategist
acknowledgement=use-exact-reviewed-mission-context-for-strategist-only
rationale
requestedAt
```

The two request timestamps must be identical. The selected attachment must be `status=attached`,
source-current, project-local, and unexpired, with `attachedAt <= requestedAt < expiresAt` and a
maximum five-minute clock-skew allowance. The complete source tuple is validated from supported
read-only state before any worker or provider call.

## First Attempt Runtime

The first valid request follows this order:

1. Load supported state through structural and immutable-lineage validation, then resolve the
   retained v30 replay receipt by the exact StaffingPlan, attachment, source, Mission, blueprint,
   staffing-spec, approval, and context-consumption identity. An exact replay returns the retained
   v30 projection before mutable source or expiry recomputation, performs zero adapter calls, and
   performs zero state saves. A changed selection, rationale, timestamp, or digest is a conflict.
2. For a new request, validate the accepted local-stub council-mode StaffingPlan against the active
   draft Mission, current CompanyBlueprint and role sources, exact staffing digests, exact v29
   attachment record digest, DEC-130 source evidence, validity window, and project boundary.
3. Build one deeply frozen normalized context object in memory. It may contain attachment ids and
   digests, context evidence references, purpose, summary, applicability, positive and negative
   evidence references, redaction references, review references, expiry, and context digest. It may
   not contain raw artifact bodies, provider payloads, credentials, or secret-bearing environment
   data.
4. Execute the four source-backed Council roles sequentially through the existing local-stub
   coordinator. Only the Strategist request receives the normalized context object, and its bounded
   deterministic output must observably acknowledge reviewed-context use without echoing context
   values. Architect and Decomposer requests have no context key. Conductor receives an explicit
   allowlisted position projection and conflict evidence only; it never receives the raw or
   normalized attachment context, attachment identifiers, context digests, or consumption receipt.
5. Require the local-stub result to reach the existing `awaiting-alignment` state. Build the v30
   StaffingEntry, CouncilSession, Strategist position reference, and normal Mission alignment
   transition in memory. Preserve Mission content identity fields while changing only the existing
   named `staffingEntryId`, `councilSessionId`, `status`, and `updatedAt` linkage/lifecycle fields.
   Persist the complete result in one atomic save using the existing additive v29-to-v30 migration
   semantics.

The raw normalized object is frozen and request-scoped. It is not copied into a top-level state map,
provider prompt store, plan, WorkOrder, Mission policy, or generic snapshot. The persisted evidence
stores source references, digests, operator receipt, target role, target agent, consumption digest,
and bounded lineage only. Generic snapshots remove the bounded receipt and Strategist consumption
reference as well; refresh hydration reads them only through exact StaffingEntry inspection.

## Schema-v30 Record Boundary

The implementation decision must add only:

- `STATE_SCHEMA_VERSION = 30`
- `STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION = 30`
- an optional immutable context-selection reference on the new v30 `StaffingEntry`
- an optional immutable context-consumption receipt on the new v30 `CouncilSession`
- an optional context reference on the Strategist Council position only

There is no `strategistContextConsumptions` sequence or map. Valid v29 StaffingEntry,
CouncilSession, CouncilPosition, MissionContextAttachment, Mission, MemoryItem, and MemoryRecall
records remain unchanged and validate as legacy variants. `MissionContextAttachment` has no
record-level schema field; “v29 attachment” means its immutable shape was created under a v29 state.
Read, boot, supported GET inspection, exact replay, preview, and invalid input must not save state or
add a context field. The next successful authorized write may persist the normalized v30 state under
the existing file-store migration contract, but it must not fabricate a context receipt.

The context-bound atomic save must reject partial mixed records, future schemas, stale or expired
source evidence, cross-project selection, malformed normalized evidence, and digest mismatches. A
valid v30 context-bound record must retain its source attachment digest, target Mission digest,
source preview and memory evidence references, operator request digest, consumption digest, and
blocked downstream actions. Before the Mission transition, source-current validation recomputes the
draft target. After the transition and on reload, historical validation uses
`attachment.targetMissionDigest === staffingPlan.missionDigest === staffingEntry.missionDigest`
plus Mission -> StaffingEntry -> CouncilSession and project lineage instead of trying to recompute a
draft-only digest from the now-aligning Mission.

## Replay, Failure, And Compatibility

The route is explicit and default-off. The existing contextless accepted-StaffingPlan Council entry
continues to work with its current compatibility behavior and no context fields. Legacy
Council sessions and positions remain inspectable. `/api/council/start` remains unchanged and does
not become a second entry point.

The focused runtime smoke must prove the following no-write or stop cases:

- missing, extra, malformed, stale, expired, cross-project, cross-Mission, and digest-invalid input
- changed attachment selection or divergent replay
- Mission, StaffingPlan, CompanyBlueprint, role-source, and DEC-130 evidence drift
- role isolation, raw-body/credential redaction, and no provider call
- exact replay with zero adapter calls and zero saves
- standard additive v29-to-v30 migration with no context placeholder or top-level consumption map
- v29 on-disk read-only inspection with zero saves and v30 persistence on the next valid write
- current-schema assertion updates while historical v29 fixtures remain unchanged
- post-transition reload through the historical attachment/StaffingPlan/StaffingEntry digest anchor
- normal alignment transition with no Reviewer, Planner, ExecutionPlan, or WorkOrder dispatch
- no context-derived key or value in Architect, Decomposer, or Conductor requests
- generic snapshot redaction and exact-inspection-only receipt hydration
- reload, contextless legacy compatibility, and retained v30 evidence after rollback

Context-bound sessions must fail closed in every downstream scheduler, WorkOrder, planner, prompt,
policy, or Mission-injection path until a later decision opens that authority. The rollback action
disables the new route and UI opt-in, rejects new context-bound starts and direct context calls,
retains valid v30 evidence as inspect-only, blocks downstream use of retained sessions, and performs
no downgrade, deletion, rewrite, or implicit retry.

## UI And Verification Boundary

The future UI is an explicit opt-in control attached to the accepted StaffingPlan entry flow. It must
show the exact selected attachment id/digest, current validity, target role, acknowledgement,
rationale, and the resulting read-only receipt. It must not offer automatic attachment selection,
search, ranking, recommendation, prompt editing, plan or WorkOrder injection, provider selection,
retry, resume, scheduling, source mutation, Git, release, or approval bypass. Desktop and mobile
smoke must prove safe errors, no context leakage to other roles, browser refresh behavior, and fit.

The future implementation gate must run the focused runtime/API smoke, UI/API smoke, existing Stage
7A attachment smoke, StaffingEntry binding smoke, Real Council smoke, state transaction guard, all
current-schema assertions coupled to `STATE_SCHEMA_VERSION`, and aggregate
`node scripts/verification_status.mjs`. Optional live provider checks remain non-blocking and are
not part of this planning authority.

## Acceptance And Next Gate

This planning slice is complete when the exact plan, handoff, decision log, source-of-truth docs,
task ledger, completion inventory, README, verification registry, and planning smoke agree. The
planning smoke must prove `implementationAllowed=false`, current schema v29, future schema-v30
planning, exact route/request semantics, StaffingEntry binding, role isolation, no top-level map,
rollback, blocked downstream authorities, and measured source counts.

Implementation is not part of this slice. The next implementation action requires the exact
schema-v30 packet in `docs/156_ai-company-strategist-mission-context-consumption-implementation-decision-handoff.md`
to be accepted as reserved `DEC-230`. A broad “continue” message, the accepted planning decision,
or this handoff alone does not open runtime or UI changes.
