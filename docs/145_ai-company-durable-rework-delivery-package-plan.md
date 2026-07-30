# AI Company Durable Rework DeliveryPackage Persistence Plan

## Purpose

This document defines the planning-only Stage 5J boundary after the exact
schema-v24 `ReworkDeliveryPackagePreview` implemented by `DEC-212`. The future
candidate may promote one source-current preview into one immutable local
`ReworkDeliveryPackage(status=review-required)` record and expose exact
inspection. It does not accept, reject, supersede, close, commit, push, release,
learn from, or execute anything.

Planning-only authority is recorded as `DEC-213`. `DEC-214` records the
complete fielded implementation handoff. Runtime, schema, API, UI, persistence,
and every downstream transition remain blocked until one exact implementation
decision is accepted separately.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-durable-rework-delivery-package-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-rework-delivery-package-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v25 immutable review-required ReworkDeliveryPackage record from one exact source-current schema-v24 DEC-212 ReworkDeliveryPackagePreview and separate operator record approval |
| `targetSurface` | docs plus the existing response-only ReworkDeliveryPackagePreview, immutable ReworkPlan and ReworkPlanAcceptance, BuilderReworkDispatch, Approval, WorkOrderAttempt, Run, Artifact, WorkflowCheckpoint, ExecutionPlan, WorkOrder, Mission, StaffingPlan, StaffingEntry, CouncilSession, CompanyBlueprint, role-source, Deliverables, and verification evidence surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-163`, `DEC-169`, `DEC-172`, `DEC-188`, `DEC-191`, `DEC-194`, `DEC-197`, `DEC-200`, `DEC-203`, `DEC-206`, `DEC-209`, `DEC-212`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/143_ai-company-rework-delivery-package-preview-plan.md`, `src/runtime/rework-delivery-package-preview.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js` |
| `negativeEvidenceRefs` | current state is schema v24 with one response-only persisted=false ReworkDeliveryPackagePreview but no reworkDeliveryPackage sequence map immutable record contract record approval digest persistence method exact-id GET bounded ReworkPlan current-chain locator snapshot exclusion durable UI focused persistence smoke package decision or Mission/task close-out authority; the generic DeliveryPackage path is bound to the original non-rework delivery chain and remains ineligible |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future persist and exact inspection entrypoints and UI record controls, stop new record creation, preserve every valid schema-v25 ReworkDeliveryPackage and all source records without downgrade deletion rewrite acceptance or close-out, keep DEC-212 preview available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | `scripts/smoke-ai-company-durable-rework-delivery-package-planning.mjs`; implementation and UI smokes remain blocked until the exact fielded decision |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v25 implementation, durable ReworkDeliveryPackage creation, acceptance rejection changes-requested supersession deletion replacement quarantine or status mutation, Mission/task close-out or done, retry recovery resume cancellation or another QA attempt, provider-backed execution, source mutation expansion, runtime-agent commit push or release, memory or learning application, automatic parallel dynamic autonomous or background scheduling, profile or policy mutation, approval bypass, collections search ranking recommendation automatic selection, and external connectors |
| `approvalStatement` | The operator approves planning, documentation, evidence synchronization, one cohesive planning commit, and push for one immutable durable ReworkDeliveryPackage boundary only. Runtime, schema, API, UI, persistence, package decision, close-out, execution, source, Git/release, memory, scheduling, policy, collection, bypass, and connector implementation require the separate complete fielded decision. |

Broad continuation and delegated non-critical self-approval are sufficient for
this no-runtime planning slice only. They do not authorize the implementation
described below.

## Current Source Audit

The current repository proves a complete rework delivery lineage but retains
only a response/browser-memory package projection:

- `DEC-203` owns the exact Builder rework source mutation evidence.
- `DEC-206` owns the independent Reviewer pass through attempt #2.
- `DEC-209` owns the shell-free QA pass through attempt #1 and terminal
  `DELIVERY_READY` checkpoint.
- `DEC-212` recomputes those records, bounded raw Artifact bytes, current
  source bytes, and fixed WorkOrder graph into one deterministic
  `ReworkDeliveryPackagePreview`.
- The preview has `persisted=false`, `status=rework-delivery-preview-ready`,
  `allowedActions=[]`, and false authority flags.
- Schema v24 has no `reworkDeliveryPackages` map or sequence.

The generic schema-v9 DeliveryPackage and schema-v10 acceptance contracts
cannot be widened here. They validate the original non-rework delivery chain
and would make generic acceptance and close-out surfaces ambiguous. Stage 5J
therefore plans one dedicated record type and keeps every generic package route
unchanged and ineligible.

## Architecture Choice

```text
exact operator-selected DEC-212 preview request
  -> normalize the complete persistence request without writing
  -> resolve an exact existing record first for idempotent replay
  -> reload schema v24 or v25 through the supported no-write path
  -> recompute the complete DEC-212 preview from current durable and source evidence
  -> require exact preview and rework delivery evidence digests
  -> validate one separate bounded recordApproval
  -> construct and validate the complete schema-v25 candidate in memory
  -> atomically migrate and append one immutable review-required record
  -> expose exact-id and one bounded ReworkPlan current-chain inspection path
  -> stop before every package decision and downstream transition
```

No generic DeliveryPackage, DeliveryPackageAcceptance, MissionCloseOut,
LearningCandidate, MemoryItem, Approval, Decision Inbox item, Run, Artifact,
WorkOrderAttempt, checkpoint, source write, provider call, Git action, release,
or schedule may be created or changed.

## Entry Gate

First creation requires all of the following:

1. One exact current schema-v24 or valid migrated schema-v25 state.
2. One exact immutable accepted ReworkPlan and ReworkPlanAcceptance.
3. One exact source-current DEC-203 mutation, DEC-206 Reviewer pass, DEC-209 QA
   pass, and terminal `DELIVERY_READY` checkpoint.
4. Current target bytes and bounded Artifact bytes that still satisfy the
   DEC-212 preview gate.
5. All nine exact DEC-212 preview request fields.
6. Exact `previewId`, `previewDigest`, and `reworkDeliveryEvidenceDigest`.
7. One explicit, bounded, credential-safe operator `recordApproval`.
8. No existing divergent ReworkDeliveryPackage for the same rework delivery
   lineage.
9. No package decision, close-out, retry, recovery, or downstream record.

Boot, read, GET, render, preview, broad continuation, prior mutation approval,
ReworkPlan acceptance, QA pass, or generic DeliveryPackage state never creates
the record.

## Planned State Schema v25

The later exact decision may add only:

```text
schemaVersion = 25
sequences.reworkDeliveryPackage
reworkDeliveryPackages{}
```

Migration requirements:

- Preserve every valid schema-v24 domain value byte-for-byte after normalized
  serialization.
- Add no reverse reference to immutable ReworkPlan, ReworkPlanAcceptance,
  ExecutionPlan, WorkOrder, Mission, checkpoint, Run, Artifact, or Approval
  records.
- Create no package during migration, boot, read, preview, GET, render, or
  invalid input.
- Reject unknown future schema and partial or semantically invalid schema-v25
  state.
- Validate the complete request, recomputed preview, approval, prospective
  record, and candidate state before one temporary-file-plus-rename save.
- Preserve valid schema-v25 evidence during rollback without downgrade,
  deletion, rewrite, status change, or implicit decision.

## Durable Record Contract

The immutable record contains normalized evidence only:

```text
id
persisted
status
projectId
missionId
executionPlanId
reworkPlanId
qaWorkOrderId
qaWorkOrderAttemptId
qaRunId
qaEvidenceArtifactId
terminalCheckpointId
terminalCheckpointDigest
sourceDigest
mutationEvidenceDigest
reviewerEvidenceDigest
qaInputDigest
reworkDeliveryEvidenceDigest
previewId
previewDigest
previewEvaluatedAt
generatedAt
deliveredArtifactRefs
workOrderResults
verificationSummary
acceptedRisks
unresolvedItems
authoritySummary
allowedActions
blockedActions
recordApproval
recordApprovalDigest
createdAt
recordDigest
```

Fixed values:

```text
persisted=true
status=review-required
allowedActions=[]
```

Every preview-derived field is an exact deep copy of the recomputed DEC-212
projection except `persisted` and `status`. Raw Artifact bodies, source bytes,
absolute paths, stdout, stderr, provider payloads, prompts, transcripts,
environment values, credentials, secrets, and newly generated prose are
excluded.

`recordApproval` has exactly:

```text
decision=record-rework-delivery-package
acknowledgement=record-exact-rework-delivery-package-without-acceptance-or-close-out
rationale
reviewedAt
```

`rationale` is trimmed, non-empty, credential-safe, and at most 500 UTF-8
bytes. `reviewedAt` is canonical UTC, at or after `previewEvaluatedAt`, and no
more than five minutes ahead of runtime time. `createdAt` equals
`recordApproval.reviewedAt`.

`recordApprovalDigest` covers the complete normalized approval.
`recordDigest` covers every record field except itself. The record and every
source record remain immutable after append.

## Exact Persist Request

The future route is:

```text
POST /api/rework-plans/:reworkPlanId/delivery-packages
```

The JSON body has exactly these thirteen keys:

```text
qaWorkOrderAttemptId
qaWorkOrderAttemptRecordDigest
qaRunId
qaEvidenceArtifactId
deliveryReadyCheckpointId
checkpointDigest
sourceDigest
qaInputDigest
evaluatedAt
previewId
previewDigest
reworkDeliveryEvidenceDigest
recordApproval
```

The first nine values reconstruct the exact DEC-212 request. First creation
recomputes the complete preview before any sequence increment or save. Missing,
extra, malformed, repeated transport, blank, oversized, stale, drifted,
provider-backed, future-timestamped, sensitive, raw-body, widened, or lineage
invalid input fails with byte-identical state.

## Idempotency And Collision Rules

- First valid creation returns `201` with exactly one sequence increment and
  one record.
- Exact normalized replay resolves and validates the existing record before
  mutable source recomputation, returns `200` with `idempotent=true`, and does
  not save.
- Replay validates `recordApprovalDigest` and `recordDigest`.
- A divergent request, preview, source, evidence, approval, or record for the
  same ReworkPlan lineage returns `409`.
- Later source drift preserves an existing valid record but cannot create,
  rewrite, replace, accept, or close it.
- Only one current ReworkDeliveryPackage may bind the exact DEC-212 lineage in
  this slice.

## Exact Inspection

```text
GET /api/rework-delivery-packages/:reworkDeliveryPackageId
GET /api/rework-plans/:reworkPlanId/delivery-package
```

The second route is one bounded exact current-chain locator, not a list,
history, search, ranking, recommendation, or automatic selection surface. The
generic `/api/snapshot` excludes `reworkDeliveryPackages`.

Inspection validates exact keys, fixed values, source references, canonical
digests, bounded redacted content, and uniqueness. It does not require current
source bytes and does not claim that the source chain remains executable,
acceptable, or closeable.

## UI Boundary

The future UI may show one explicit `재작업 DeliveryPackage 기록` command only
when the exact DEC-212 preview is current and the operator supplies the required
rationale and acknowledgement. After persistence it may render immutable id,
`review-required` status, source/evidence/preview/record digests, retained
artifact and role results, risks, unresolved items, and blocked authority.

Refresh may hydrate only through the bounded ReworkPlan current-chain locator.
Rendering, hydration, previewing, or selecting records must never persist,
accept, reject, request changes, supersede, close, retry, recover, execute,
mutate source, apply memory, commit, push, release, schedule, mutate policy, or
bypass approval.

## Compatibility And Rollback

- Preserve DEC-188 through DEC-212 behavior and every immutable source record.
- Preserve the exact response-only preview shape and route.
- Preserve generic DeliveryPackage, DeliveryPackageAcceptance, Mission/task
  close-out, standalone task, Council, provider, Growth, memory, commit, and
  release paths outside the new routes.
- Add no provider adapter, prompt, CompanyBlueprint role, WorkOrder dispatch,
  QA runner, source mutation, Git, release, memory, learning, scheduling,
  policy, collection, or connector behavior.
- Rollback disables the new POST/GET/UI entrypoints, stops new creation, and
  preserves every valid schema-v25 record without downgrade or deletion.

## Implementation Target Surface

The later complete fielded decision may touch only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/rework-delivery-packages.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-durable-rework-delivery-package.mjs
scripts/smoke-ui-slice-712.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, docs, and task ledgers may change only to keep evidence current.

## Focused Verification Plan

Future runtime smoke must prove:

- atomic v24-to-v25 migration with full value preservation;
- no passive creation on migration, boot, read, preview, GET, or render;
- exact thirteen-key request and fresh DEC-212 recomputation;
- deterministic immutable record, approval, and record digests;
- one record, idempotent replay, divergent collision, exact-id inspection, and
  bounded ReworkPlan current-chain inspection;
- generic snapshot exclusion and generic package path ineligibility;
- malformed, missing, extra, stale, drifted, failed, interrupted, oversized,
  symlinked, provider-backed, raw-body, credential, future-schema, partial-v25,
  and downstream-record refusal with byte-identical invalid state;
- reload and rollback retention without source or record rewrite;
- zero package decision, Mission/task, WorkOrder, attempt, Run, Artifact,
  checkpoint, Approval, Decision, source, provider, memory, Git, release,
  schedule, policy, bypass, or connector mutation;
- DEC-188, DEC-191, DEC-194, DEC-197, DEC-200, DEC-203, DEC-206, DEC-209, and
  DEC-212 compatibility.

Future `scripts/smoke-ui-slice-712.mjs` must prove exact-gated record creation,
required rationale and acknowledgement, safe failure clearing, refresh
hydration through the bounded locator, immutable read-only rendering, unchanged
preview behavior, absent downstream controls, and desktop/mobile fit.

## Acceptance Criteria

This planning slice is complete when:

1. `DEC-213` records planning-only authority.
2. `DEC-214` records the complete fifteen-field implementation handoff.
3. The focused planning smoke, coupled docs checks, UI QA, and aggregate
   verification pass.
4. No runtime, schema, API, UI, state, source, provider, memory, Git, release,
   scheduling, policy, bypass, or connector behavior changes.

Implementation remains reserved for exact `DEC-215`.

## Planning Status

Planning is complete. Implementation is not approved by this document.
