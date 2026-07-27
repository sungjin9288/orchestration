# AI Company Specialist Cell Retry Plan

## Implemented Status

`DEC-182` accepted the complete implementation decision and this bounded slice now runs on schema
v21. The planning-only language below remains as provenance for `DEC-180` and `DEC-181`; it no
longer describes the current runtime gate. Implementation preserves the exact authority boundary
defined here.

## Purpose

Stage 4C adds one explicit, bounded retry for one exact failed first-attempt specialist cell. It
does not reopen a completed cell, rewrite a schema-v20 `SpecialistBatch`, or recover an interrupted
active attempt. The original batch and both first attempts remain immutable evidence.

One operator-approved request may append one `SpecialistCellRetry` record and one
`SpecialistCellAttempt` with `attemptNumber=2`, execute only the same fixed Researcher or QA local
worker, settle that retry once, and stop after exact inspection. A second retry, a retry of a retry,
automatic selection, background execution, and result application remain blocked.

`parallelSpecialistsAllowed=false` remains authoritative. This retry path is not a
`parallel-specialists` StaffingPlan mode and does not create dynamic cells or concurrent work.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-specialist-cell-retry-planning-001` |
| `decisionStatus` | `approve-ai-company-specialist-cell-retry-planning-only` |
| `targetAuthority` | planning only for one schema-v21 durable SpecialistCellRetry and one exact local attempt-number-two execution from one terminal schema-v20 SpecialistBatch failed first attempt |
| `targetSurface` | docs, current schema-v20 SpecialistBatch and SpecialistCellAttempt evidence, file-store CAS constraints, fixed Researcher and QA runners, planning smoke, README, completion inventory, and task ledgers |
| `sourceEvidenceRefs` | `DEC-173` through `DEC-179`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md`, `docs/121_ai-company-durable-specialist-batch-plan.md`, `src/runtime/specialist-batches.js`, `src/runtime/specialist-cell-attempts.js`, `src/runtime/file-store.js`, `src/runtime/runtime-service.js`, and `src/execution/specialist-batch-coordinator.js` |
| `negativeEvidenceRefs` | schema v20 fixes every batch to two first-attempt ids, rejects unreferenced cell attempts, permits only attemptNumber=1, has no retry sequence map record approval route exact inspection or UI, and intentionally leaves active-attempt reconciliation to later Ops supervision |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove planning-only Stage 4C docs and smoke while preserving schema v20 and every DEC-179 runtime behavior |
| `focusedSmokeRefs` | `scripts/smoke-ai-company-specialist-cell-retry-planning.mjs` |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v21 migration, retry records, attemptNumber=2, worker execution, settlement, active-attempt recovery or reconciliation, cancellation, automatic retry, provider calls, background scheduling, result application, source mutation, Git/release, memory application, policy mutation, approval bypass, collection/list/search/update/delete, and connectors |
| `approvalStatement` | The operator authorizes Stage 4C planning, evidence synchronization, one cohesive planning commit, and push. Runtime implementation remains gated by the complete fielded decision in `docs/124_ai-company-specialist-cell-retry-implementation-decision-handoff.md`. |

`DEC-180` records this planning-only boundary. `DEC-181` records the complete fielded
implementation handoff. Neither decision authorizes schema v21, a retry record, attempt #2, worker
execution, settlement, API/UI mutation, or active-attempt recovery. Exact implementation is
reserved for `DEC-182`.

## Current Evidence And Constraint

Schema v20 stores one immutable `SpecialistBatch` and exactly two referenced first attempts. The
batch status and digest derive only from those two attempts, and the file-store rejects every
unreferenced `SpecialistCellAttempt`. Each current cell record requires `attemptNumber=1`.

Those invariants are correct for Stage 4B and must not be weakened. Appending a retry id to
`SpecialistBatch.cellAttemptIds`, rewriting a terminal batch status, or changing an original failed
attempt to completed would erase the distinction between first-attempt evidence and later
operator-authorized retry evidence.

The retry therefore uses a separate append lineage. The original terminal batch and first attempt
remain byte-for-byte unchanged. A new retry record binds one new attempt #2 to one exact failed
attempt #1 and permits only one `active -> terminal` transition. It is never deleted, superseded,
or reopened.

## Eligibility Boundary

A retry request is valid only when all of the following are true:

1. The source `SpecialistBatch` exists, is terminal, and has status `partial-failed` or `failed`.
2. The selected source cell is one of the batch's two original `cellAttemptIds`.
3. The source cell has `attemptNumber=1` and status `failed`.
4. No `SpecialistCellRetry` already references that source cell.
5. No other retry for the batch is active.
6. The current Council, StaffingPlan, StaffingEntry, CompanyBlueprint, role sources, cell spec, and
   bounded input files reproduce the original source, selected cell spec, path, and input digests.
7. The retry deadline is a positive integer no greater than the source cell's original
   `cellDeadlineMs`.
8. One exact operator retry approval binds the current batch and failed-cell record digests.

A completed first attempt is never eligible. A retry attempt is never a new retry source. A failed
batch with two failed first attempts may receive one separately approved retry for each source
cell, but never concurrently and never more than once per source cell.

Source drift does not silently create a new retry lineage. If the current source tuple cannot
reproduce the original digests, the request fails before any write. A new preview and batch decision
is required for intentionally changed evidence.

## Schema V21

Schema v21 adds only:

```text
sequences.specialistCellRetry
specialistCellRetries
```

The existing `sequences.specialistCellAttempt` and `specialistCellAttempts` map are reused for the
new attempt #2. Existing schema-v20 batch and cell records are not rewritten.

Migration preserves every valid schema-v20 value, initializes the new sequence and map, and creates
no retry during boot, read, preview, render, or exact inspection.

### SpecialistCellRetry

One retry record has exactly:

```text
id
persisted
specialistBatchId
sourceCellAttemptId
retryCellAttemptId
sourceBatchRecordDigest
sourceCellAttemptRecordDigest
retryPreviewId
retryPreviewDigest
retryRequestDigest
retryApproval
retryApprovalDigest
retryDeadlineMs
status
startedAt
completedAt
recordDigest
```

`persisted=true`. `status` is `active`, `completed`, or `failed` and must equal the referenced retry
attempt status. An active retry has `completedAt=null`; a terminal retry uses the retry attempt's
exact `completedAt`.

`sourceBatchRecordDigest` and `sourceCellAttemptRecordDigest` preserve the exact records reviewed by
the operator. `retryPreviewId` and `retryPreviewDigest` bind the fresh current-source recomputation
used for this retry. They are not required to equal the original batch preview id or digest because
DEC-176 includes `evaluatedAt` and its derived deadline in that digest. Original parity is instead
proved through the unchanged `sourceDigest`, selected `cellSpecDigest`, `inputPathDigests`, and
`inputDigest`. `retryRequestDigest` covers the complete normalized request so exact replay can return
the existing record without invoking a worker. `retryApprovalDigest` covers the complete normalized
approval.

The retry approval has exactly:

```text
decision
acknowledgement
rationale
reviewedAt
```

with:

```text
decision=retry-failed-cell-once
acknowledgement=retain-original-evidence-and-retry-exact-failed-cell-once
```

The rationale is trimmed, non-empty, credential-marker checked, and at most 500 characters.
`reviewedAt` must not precede `evaluatedAt` or be unreasonably future-dated.

### Retry SpecialistCellAttempt

The existing record shape is retained. The retry attempt differs only through validated values:

```text
attemptNumber=2
status=active
cellDeadlineMs=retryDeadlineMs
startedAt=<retry start>
deadlineAt=startedAt + retryDeadlineMs
```

It must preserve the source attempt's exact:

```text
specialistBatchId
cellId
agentProfileId
role
position
cellSpecDigest
sourceDigest
inputPathDigests
inputDigest
```

The active retry starts with null observed, result, failure, and completion fields. It transitions
once through the existing bounded result and allowlisted failure contracts. A valid QA syntax
failure remains a completed evidence result with verdict `failed`; it is not a runner failure.

The retry deadline is independent of the expired original batch deadline but cannot exceed the
source cell's original duration. Validators derive it exactly from the retry record's `startedAt`
and `retryDeadlineMs`.

## Exact Retry Request

The bounded JSON route is:

```text
POST /api/specialist-batches/:specialistBatchId/cell-retries
```

The body has exactly these twelve keys:

```text
compileSpec
evaluatedAt
expectedBatchRecordDigest
expectedSourceCellAttemptRecordDigest
previewDigest
previewId
retryApproval
retryDeadlineMs
sourceCellAttemptId
sourceDigest
sourceRefs
specialistSpec
```

The request resubmits the Stage 4A source contract because schema v20 intentionally does not persist
raw runner input or executable QA command bodies. Runtime recomputes the current DEC-176 preview,
requires the request's `previewId` and `previewDigest` to match that new preview, and then requires
its `sourceDigest` plus the selected cell's spec, path, and input digests to match the immutable
source batch and failed attempt. The new preview id and digest are not compared with the original
batch preview id and digest.

The transport keeps the existing bounded JSON, exact-key, content-type, malformed input, and
credential rules. Validation completes before migration or record creation.

The first successful creation returns `201`; an exact replay returns `200`. Both bodies have
exactly:

```text
generatedAt
idempotent
specialistCellRetry
specialistCellAttempt
```

Pre-write validation failures return only `{error}` with the applicable `400`, `404`, `409`, `413`,
or `415` status. A settlement conflict after active persistence returns `409` with exactly:

```text
error
specialistCellRetryId
retryCellAttemptId
```

## Atomic Start And Execution

One CAS transaction:

1. reloads and validates supported schema-v20 or schema-v21 state;
2. validates exact eligibility and source-current evidence;
3. applies the additive v20-to-v21 migration when needed;
4. allocates one retry id and one cell-attempt id;
5. appends one active retry and one active attempt #2;
6. saves both records atomically before worker invocation.

After that save, runtime reopens the exact source paths with the same descriptor-bound containment,
identity, byte-cap, and digest checks used by DEC-179. It invokes only the selected fixed local
Researcher or QA runner. There is no `Promise.all`, second cell invocation, provider call, source
write, or downstream record creation.

One fresh-state CAS settlement updates the retry attempt and retry record together. Settlement does
not mutate the source batch or either original first attempt. It does not retry a CAS conflict. A
post-active conflict returns bounded ids and leaves the active retry inspectable for later,
separately authorized Ops recovery.

## Replay And Failure Semantics

An exact request replay first validates the bounded request shape, recomputes its
`retryRequestDigest`, and compares it with the persisted retry. A match returns the existing retry
and attempt without source-current recomputation or worker invocation, regardless of whether the
retry is active or terminal. This keeps durable replay available even when source bytes later move.
A divergent request for the same failed source cell returns conflict. A second retry for a source
cell, retry-of-retry, completed-cell retry, or concurrent retry in the same batch is rejected.

The existing allowlisted runner failure codes remain authoritative. No raw source, stdout, stderr,
absolute path, argv, environment, provider payload, stack, transcript, or credential is persisted.

Stage 4C does not infer success for an active retry after interruption. It does not convert active
evidence to failed during boot. Recovery, reconciliation, quarantine, cancel, and resume remain
Stage 6 Ops authorities.

## Exact Inspection

Exact-id inspection is:

```text
GET /api/specialist-cell-retries/:specialistCellRetryId
```

It returns exactly:

```text
generatedAt
specialistCellRetry
specialistCellAttempt
```

The bounded source lookup is:

```text
GET /api/specialist-batches/:specialistBatchId/cell-retry
  ?sourceCellAttemptId=:sourceCellAttemptId
```

It requires exactly one query key and returns at most the one immutable retry relationship for that
source attempt. It is not a collection, list, search, history, or automatic selection surface.

The existing generic `/api/snapshot` continues to omit `specialistBatches`,
`specialistCellAttempts`, and the new `specialistCellRetries` map. The Council UI uses only the exact
batch/current-chain evidence it already owns and the exact failed-cell retry locator.

## UI Boundary

The future implementation may expose one explicit `Retry failed cell` action only when exact durable
evidence proves eligibility. The operator must resubmit the current source contract, exact record
digests, retry deadline, and retry approval. UI shows original first-attempt evidence separately
from retry evidence.

There is no retry-all, automatic retry, cancel, resume, provider, result-application, Mission,
WorkOrder, source, Git, release, or memory action. Browser refresh may restore only the exact retry
selected by batch id plus source cell id.

## Compatibility And Rollback

The implementation must preserve:

- DEC-176 response-only preview;
- DEC-179 first-attempt start, replay, exact inspection, and current-chain behavior;
- immutable schema-v20 batches and original first attempts;
- council StaffingPlan mode, empty `parallelGroups`, and `parallelSpecialistsAllowed=false`;
- WorkOrderAttempt scheduling, provider, Mission, delivery, memory, Growth, commit, and release
  behavior;
- generic snapshot exclusion.

Rollback disables retry POST/GET routes and UI controls, stops new retry dispatch, and retains valid
schema-v21 retry and attempt records without downgrade, deletion, terminal rewrite, rerun, or
inferred completion. DEC-179 inspection remains available.

## Verification

Planning provenance verification proves:

- `DEC-180` planning and `DEC-181` handoff are docs-only;
- schema v20 still permits only first attempts in current runtime;
- immutable source records and the separate schema-v21 retry relationship are explicit;
- exact eligibility, request, approval, migration, replay, deadline, redaction, CAS, inspection,
  rollback, and blocked-authority contracts are complete;
- implementation was reserved for, and then opened only by, the exact `DEC-182` decision.

The focused implementation smoke covers:

- additive v20-to-v21 migration with no boot/read records;
- one failed first attempt and one active retry/attempt #2 atomic save;
- completed-cell, active-batch, retry-of-retry, duplicate, stale digest, source drift, invalid
  deadline, malformed approval, oversized transport, and unsupported content rejection;
- descriptor-bound source revalidation and output caps;
- exact Researcher and QA retry pass/fail paths;
- exact replay without worker invocation;
- settlement CAS conflict with durable active evidence and no rerun;
- exact-id and exact source lookup;
- generic snapshot exclusion;
- unchanged DEC-176, DEC-179, WorkOrderAttempt, provider, source, Git, memory, and policy behavior.

## Still Blocked

`DEC-182` authorizes only schema v21, the exact retry record and attempt #2, one selected local
worker invocation, settlement, exact routes, and the bounded UI action described above.
Active-attempt recovery, reconciliation, cancel, quarantine, automatic retry, retry-all, retries
beyond attempt #2, dynamic cells, parallel policy, providers, background scheduling, result
application, downstream records, source mutation, memory application, runtime-agent Git or release,
profile or policy mutation, approval bypass, collection/list/search/update/delete, and connectors
remain blocked.

## Completion Rule

The exact `DEC-182` decision was accepted and consumed. This slice stops after one explicitly
approved failed-first-attempt retry and exact inspection; it does not infer recovery or widen
downstream authority.
