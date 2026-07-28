# AI Company ReworkPlan Acceptance Plan

## Purpose

Stage 5C defines the next evidence-only boundary after `DEC-191`: one exact immutable
`ReworkPlan(status=review-required)` may receive one separate append-only operator acceptance fact.
The source ReworkPlan remains unchanged. Acceptance records that the operator reviewed and accepted
the exact rework scope, but it does not append a Builder WorkOrder or WorkOrderAttempt, run
preflight, create or resolve a mutation approval, change source, execute Builder/Reviewer/QA, or
schedule work.

This separation keeps retained review evidence, operator disposition, and later execution authority
independently auditable.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-rework-plan-acceptance-planning-001` |
| `decisionStatus` | `approve-ai-company-rework-plan-acceptance-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v23 append-only ReworkPlanAcceptance record from one exact source-current schema-v22 review-required ReworkPlan |
| `targetSurface` | docs, current schema-v22 ReworkPlan evidence, future schema-v23 acceptance and exact inspection contracts, planning smoke, README, completion inventory, and task ledgers |
| `sourceEvidenceRefs` | `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-163`, `DEC-169`, `DEC-172`, `DEC-186` through `DEC-191`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/127_ai-company-reviewer-rework-preview-plan.md`, `docs/129_ai-company-durable-reviewer-rework-plan.md`, `src/runtime/reviewer-rework-preview.js`, `src/runtime/rework-plans.js`, `src/runtime/work-order-attempts.js`, `src/runtime/runtime-service.js`, and `src/runtime/file-store.js` |
| `negativeEvidenceRefs` | schema v22 has one immutable review-required ReworkPlan but no acceptance sequence map contract digest runtime command exact acceptance GET durable UI or focused acceptance smoke; no Builder append retry preflight mutation approval execution or scheduling authority exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove planning-only Stage 5C docs and smoke while preserving schema-v22 DEC-188 and DEC-191 runtime behavior |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-rework-plan-acceptance-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v23 migration, durable ReworkPlanAcceptance creation, ReworkPlan rejection changes-requested supersession deletion replacement quarantine or status mutation, Builder WorkOrder or WorkOrderAttempt append, retry, rework start, preflight, approval creation or resolution, source mutation, Builder Reviewer or QA execution, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors |
| `approvalStatement` | The operator-delegated planning boundary permits documentation, evidence synchronization, one cohesive planning commit, and push only. Schema, runtime, API, UI, record creation, Builder append, execution, mutation, scheduling, provider, memory, Git/release, policy, collection, bypass, and connector implementation require the separate complete fielded decision. |

`DEC-192` records this planning-only boundary. `DEC-193` records the complete fielded implementation
handoff in
`docs/132_ai-company-rework-plan-acceptance-implementation-decision-handoff.md`. Neither decision
authorizes schema migration or acceptance creation. A complete matching implementation decision is
reserved for `DEC-194`.

## Current Evidence And Gap

The schema-v22 runtime already proves:

- one source-current accepted StaffingPlan and immutable StaffingEntry;
- one approved local Council synthesis and current non-terminal Mission;
- one blocked ExecutionPlan with completed Builder, Reviewer `changes-requested`, and unexecuted QA;
- one exact latest Reviewer WorkOrderAttempt, Run, and bounded redaction-safe review Artifact;
- one response-only DEC-188 preview with inherited target paths, verification commands, findings,
  review/progress digests, `nextAttemptNumber=2`, `maxAdditionalBuilderAttempts=1`, and
  `allowedActions=[]`;
- one immutable DEC-191 `ReworkPlan(status=review-required)` retaining that exact preview and record
  approval evidence;
- exact-id and one-ExecutionPlan current-chain inspection without generic snapshot exposure.

The gap is disposition evidence. The runtime cannot prove that an operator accepted the exact
retained rework scope. Mutating the ReworkPlan status would destroy the immutable evidence contract,
while immediately appending Builder work would combine disposition and execution authority.

## Architecture Decision

Add one append-only acceptance fact and no execution path:

```text
source-current schema-v22 ReworkPlan(status=review-required)
  -> recompute and compare its exact DEC-188 source projection
  -> exact operator acceptance request
  -> atomic schema-v22 to schema-v23 migration plus one ReworkPlanAcceptance append
  -> exact acceptance inspection
  -> stop before Builder append or execution
```

The source ReworkPlan keeps `status=review-required` and its original `recordDigest`. A read model may
derive `reviewStatus=accepted` only from one valid matching acceptance record. It must never rewrite
the ReworkPlan to simulate an event.

## Entry Gate

Future acceptance must require all of the following in one loaded source state:

1. the exact `reworkPlanId` exists and passes strict record and digest validation;
2. no divergent acceptance already exists for the ReworkPlan;
3. the linked Project, Mission, StaffingPlan, StaffingEntry, CouncilSession, ExecutionPlan,
   Reviewer WorkOrderAttempt, Reviewer Run, review Artifact, and optional Decision Inbox evidence
   remain valid;
4. the ExecutionPlan is still blocked at the same Reviewer `changes-requested` boundary, Builder is
   completed, the selected Reviewer attempt remains latest, and QA remains unexecuted;
5. recomputing DEC-188 with the ReworkPlan's exact stored source request reproduces its `previewId`,
   `previewDigest`, source execution/attempt digests, review evidence digest, source progress digest,
   target allowlist, verification commands, findings, attempt number, attempt cap, evidence refs,
   and blocked actions;
6. the exact request matches the current ReworkPlan and recomputed preview;
7. `decision=accept`, the fixed acknowledgement, bounded rationale, and exact `reviewedAt` are valid;
8. no Builder append, preflight, approval, mutation, execution, scheduling, provider, memory, Git,
   release, policy, collection, bypass, or connector authority is inferred.

Any mismatch fails before a sequence increment or save. Boot, read, migration validation, preview,
GET, hydration, and rendering never create acceptance.

## Planned State Schema V23

Schema v23 adds only:

```text
sequences.reworkPlanAcceptance
reworkPlanAcceptances
```

Migration from valid schema v22 is additive:

- preserve every existing normalized domain value;
- initialize only an empty acceptance sequence and map;
- create no acceptance during migration;
- reject unknown future schemas and partial or semantically invalid v23 records;
- validate the request, recomputed source, prospective record, and complete candidate state before
  one atomic migration-plus-append save;
- retain valid v23 evidence during rollback without downgrade.

No existing ReworkPlan, ExecutionPlan, WorkOrder, WorkOrderAttempt, Mission, task, Run, Artifact,
Approval, Decision Inbox item, checkpoint, provider attempt, memory record, or policy record gains a
required reverse reference.

## ReworkPlanAcceptance Contract

One immutable record has exactly:

```text
id
persisted
decision
projectId
missionId
staffingPlanId
staffingEntryId
councilSessionId
executionPlanId
reworkPlanId
reworkPlanRecordDigest
previewId
previewDigest
sourceExecutionPlanDigest
sourceAttemptRecordDigest
reviewEvidenceDigest
sourceProgressDigest
nextAttemptNumber
maxAdditionalBuilderAttempts
acknowledgement
rationale
authoritySummary
reviewedAt
createdAt
acceptanceDigest
```

Fixed values are:

```text
persisted=true
decision=accepted
nextAttemptNumber=2
maxAdditionalBuilderAttempts=1
acknowledgement=accept-exact-rework-plan-without-execution
createdAt=reviewedAt
```

`authoritySummary` has exactly:

```text
reworkAcceptanceEvidenceAllowed=true
reworkPlanMutationAllowed=false
builderWorkOrderAppendAllowed=false
builderAttemptAppendAllowed=false
retryAllowed=false
preflightAllowed=false
approvalCreationAllowed=false
approvalResolutionAllowed=false
sourceMutationAllowed=false
builderExecutionAllowed=false
reviewerExecutionAllowed=false
qaExecutionAllowed=false
schedulingAllowed=false
providerCallAllowed=false
memoryApplicationAllowed=false
commitAllowed=false
pushAllowed=false
releaseAllowed=false
policyMutationAllowed=false
approvalBypassAllowed=false
connectorCallAllowed=false
```

`rationale` is trimmed, non-empty, credential-safe, and at most 500 UTF-8 bytes. `reviewedAt` is an
exact ISO timestamp at or after the ReworkPlan's `createdAt` and no more than five minutes ahead of
runtime now. `acceptanceDigest` is SHA-256 over the canonical complete record except
`acceptanceDigest` itself. The record is immutable after append.

The record stores no raw Artifact or source bodies, provider payloads, prompts, transcripts,
environment values, stdout, stderr, arbitrary absolute paths, credentials, or secrets.

## Exact Accept Request

The bounded command is:

```text
POST /api/rework-plans/:reworkPlanId/accept
```

The JSON body has exactly these ten keys:

```text
reworkPlanRecordDigest
previewId
previewDigest
sourceExecutionPlanDigest
sourceAttemptRecordDigest
sourceProgressDigest
decision
acknowledgement
rationale
reviewedAt
```
The transport and runtime must both enforce that exact ten-key shape. `decision` must equal
`accept`. The stored normalized decision becomes `accepted`.

`reviewEvidenceDigest`, `nextAttemptNumber`, `maxAdditionalBuilderAttempts`, target paths,
verification commands, findings, evidence refs, blocked actions, and the closed authority summary
are not caller-authored request fields. `reworkPlanRecordDigest` and `previewDigest` transitively
bind those values, and the runtime must freshly recompute and compare them before the first write.

The runtime normalizes the complete path-plus-body tuple without writing. Exact replay is checked
against a valid existing acceptance before source-current recomputation. For first creation, it
recomputes the complete source projection, constructs the deterministic prospective id and record
in memory, validates the complete schema-v23 candidate state, then saves once.

## Idempotency And Collision Rules

- The first valid request creates exactly one ReworkPlanAcceptance and returns `201`.
- An exact normalized replay returns the existing record with `200`, `idempotent=true`, and no save.
- Replay validates the stored record, source ReworkPlan, and acceptance digest before returning it.
- A different request for a ReworkPlan with an existing acceptance returns `409`.
- At most one valid acceptance may exist per ReworkPlan.
- Later source drift does not rewrite or delete valid acceptance evidence.
- Acceptance does not consume the one additional Builder attempt and opens no execution action.

## Exact Inspection

The only read route is:

```text
GET /api/rework-plans/:reworkPlanId/acceptance
```

It returns the one acceptance bound to that exact ReworkPlan or `404`. This is not a collection,
history, search, ranking, recommendation, automatic selection, or next-action endpoint. The generic
`/api/snapshot` excludes the `reworkPlanAcceptances` map.

Successful POST uses exactly:

```text
generatedAt
idempotent
reworkPlanAcceptance
```

Successful GET uses exactly:

```text
generatedAt
reworkPlanAcceptance
```

Malformed or missing input returns bounded `{error}` with `400`; unknown exact records return `404`;
stale, divergent, duplicate, unsupported-state, or lineage conflicts return `409`; oversized JSON
returns `413`; unsupported content type returns `415`. Error bodies contain no raw source or
Artifact content, stack traces, environment values, credentials, or absolute paths.

## UI Contract

The future UI may add one `Accept rework plan` command beside an exact loaded DEC-191 record. It
must:

- require the exact current digests, fixed decision and acknowledgement, rationale, and reviewedAt;
- clear stale browser-memory success before each request;
- disable itself while a request is active;
- render the immutable acceptance and derived accepted review state after success;
- hydrate only through the exact ReworkPlan acceptance GET after refresh;
- retain the existing preview and record inspection actions;
- expose no reject, changes-requested, Start rework, Retry, Preflight, Run Builder, Run Reviewer,
  Run QA, Commit, Push, Release, or automatic next-step control.

## Compatibility

- Preserve DEC-091, DEC-094, DEC-097, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, DEC-188, and
  DEC-191 behavior.
- Preserve schema-v22 state bytes until the first valid accept request.
- Keep the source ReworkPlan immutable and digest-stable.
- Keep preview generation and exact inspection no-write.
- Create no generic Approval, Decision Inbox item, WorkOrder, WorkOrderAttempt, Run, Artifact,
  checkpoint, provider attempt, or source mutation.
- Keep standalone task, Council, delivery, learning, memory, Growth, commit, and release routes
  unchanged.
- Exclude ReworkPlanAcceptance from the generic snapshot.

## Rollback

Disable accept and exact-inspection entrypoints and the UI accept command. Stop new acceptance
creation. Preserve every valid schema-v23 acceptance and source record without downgrade, deletion,
rewrite, status mutation, or implicit execution. Keep DEC-188 preview and DEC-191 ReworkPlan
inspection available. Quarantine invalid records only through later separately approved authority.

## Focused Verification Plan

Future implementation must add:

```text
scripts/smoke-ai-company-rework-plan-acceptance.mjs
scripts/smoke-ui-slice-705.mjs
```

The runtime/API smoke must prove:

- atomic schema-v22 to schema-v23 migration and one append;
- zero acceptance on boot, read, migration validation, preview, GET, hydration, render, or invalid
  input;
- exact path plus ten-key body validation at transport and runtime boundaries;
- current DEC-188 source recomputation and complete DEC-191 record/digest binding before first write;
- one immutable accepted record with exact identity, source, progress, attempt, acknowledgement,
  rationale, authority, timestamp, and acceptance digest;
- exact replay without save and divergent collision refusal;
- exact acceptance GET with generic snapshot exclusion;
- malformed, missing, extra, oversized, unknown, stale, future, credential, raw-body, widened scope,
  missing finding, changed review evidence, QA-already-run, provider-backed, legacy-unbound,
  lineage-conflict, partial-v23, and future-schema refusal;
- schema-v23 reload, source-drift retention, and rollback evidence;
- zero ReworkPlan rewrite, Builder WorkOrder or WorkOrderAttempt append, retry, preflight, approval,
  run, artifact, checkpoint, source, provider, memory, Git, release, or policy mutation;
- DEC-091, DEC-094, DEC-097, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, DEC-188, and DEC-191
  compatibility.

The UI smoke must prove exact-gated acceptance, required rationale, safe stale failures, refresh
hydration, immutable read-only rendering, unchanged preview and record actions, absent downstream
controls, and desktop/mobile fit.

## Implementation Target Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/rework-plan-acceptances.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-rework-plan-acceptance.mjs
scripts/smoke-ui-slice-705.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Acceptance Criteria

1. Migration creates no acceptance and preserves schema-v22 evidence.
2. Only one exact source-current review-required ReworkPlan may be accepted.
3. One explicit operator request appends one immutable accepted fact.
4. Exact replay is idempotent; stale or divergent requests never write.
5. The source ReworkPlan and all execution evidence remain unchanged.
6. Exact read-only evidence survives reload without entering the generic snapshot.
7. No Builder append, retry, preflight, approval, execution, scheduling, provider, source, memory,
   Git/release, policy, collection, bypass, or connector authority opens.
8. Focused runtime/API/UI, compatibility, README inventory, UI QA, and aggregate verification pass.

## Planning Status

- Planning-only authority: accepted as `DEC-192`.
- Complete fielded implementation handoff: documented as `DEC-193`.
- Schema/runtime/API/UI implementation: blocked pending the exact complete decision reserved for
  `DEC-194`.
