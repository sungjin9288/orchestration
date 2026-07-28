# AI Company Durable Reviewer ReworkPlan

## Purpose

Stage 5B turns one exact source-current `DEC-188` response-only
`ReviewerReworkPlanPreview` into one immutable local `ReworkPlan` audit record. This slice records
the reviewed rework scope only. It does not append a Builder WorkOrder or WorkOrderAttempt, approve
rework execution, run preflight, mutate source, invoke Reviewer or QA, or schedule any work.

The durable record preserves the normalized findings, original target allowlist, verification
commands, source progress digest, review evidence digest, and one-additional-attempt cap already
proven by the preview. A separate operator-owned record approval authorizes only the append.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-durable-reviewer-rework-plan-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-reviewer-rework-plan-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v22 immutable ReworkPlan record from one exact source-current schema-v21 ReviewerReworkPlanPreview and separate operator record approval |
| `targetSurface` | docs, current schema-v21 ReviewerReworkPlanPreview and WorkOrder evidence, future schema-v22 record and exact inspection contracts, planning smoke, README, completion inventory, and task ledgers |
| `sourceEvidenceRefs` | `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-163`, `DEC-169`, `DEC-172`, `DEC-186` through `DEC-188`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md`, `docs/127_ai-company-reviewer-rework-preview-plan.md`, `src/runtime/reviewer-rework-preview.js`, `src/runtime/work-order-attempts.js`, `src/runtime/runtime-service.js`, and `src/runtime/file-store.js` |
| `negativeEvidenceRefs` | schema v21 has no ReworkPlan sequence map record validator persistence method exact durable GET current-chain locator durable UI or focused persistence smoke; the current preview is response-only with allowedActions empty; no rework decision, Builder append, retry, preflight, approval resolution, mutation, Reviewer/QA execution, or scheduler authority exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove planning-only Stage 5B docs and smoke while preserving DEC-188 runtime behavior and schema v21 |
| `focusedSmokeRefs` | `scripts/smoke-ai-company-durable-reviewer-rework-plan-planning.mjs` |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v22 migration, durable ReworkPlan creation, ReworkPlan decision or status mutation, Builder WorkOrder or WorkOrderAttempt append, retry, rework start, preflight, approval creation or resolution, source mutation, Reviewer or QA execution, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, deletion supersession replacement quarantine, and external connectors |
| `approvalStatement` | The operator approves planning, documentation, evidence synchronization, one cohesive planning commit, and push for one immutable durable ReworkPlan boundary only. Runtime, schema, API, UI, record creation, execution, mutation, scheduling, provider, memory, Git/release, policy, collection, and connector implementation require the separate complete fielded decision. |

`DEC-189` records this planning-only boundary. `DEC-190` records the complete fielded implementation
handoff in `docs/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff.md`.
Neither decision alone authorizes schema migration or record creation. The exact complete
implementation decision is consumed as `DEC-191`.

## Accepted Implementation Decision

`DEC-191` accepts the exact complete fielded decision in
`docs/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff.md`. Its authority
is limited to the schema-v22 immutable record, exact inspection, and record-only UI described here.

## Current Evidence And Gap

The schema-v21 runtime already proves:

- one source-current accepted StaffingPlan and immutable StaffingEntry;
- one approved local-stub CouncilSession and current Mission;
- one blocked ExecutionPlan with completed Builder, Reviewer `changes-requested`, and unexecuted QA;
- one latest `run-reviewer` WorkOrderAttempt with `attemptNumber=1`;
- one bounded regular non-symlink review Artifact with one through 32 redaction-safe
  source-ordered duplicate-preserving findings;
- runtime-derived `reviewEvidenceDigest`, canonical `sourceProgressDigest`, inherited
  `targetPathAllowlist`, inherited `verificationCommands`, `nextAttemptNumber=2`,
  `maxAdditionalBuilderAttempts=1`, and `allowedActions=[]`.

The gap is durable review evidence. Refresh discards the current response/browser-memory preview,
and no immutable record proves that an operator chose to retain that exact plan. The missing record
must not be confused with approval to execute it.

## Architecture Decision

Add one append-only record type and no execution path:

```text
source-current schema-v21 ReviewerReworkPlanPreview
  -> exact operator recordApproval
  -> atomic schema-v21 to schema-v22 migration plus one ReworkPlan append
  -> exact-id inspection
  -> bounded ExecutionPlan current-chain inspection
  -> stop
```

The implementation must reuse `buildReviewerReworkPlanPreview` for source recomputation. It must not
reparse the Artifact independently or accept caller-authored findings, target paths, verification
commands, evidence refs, digests, attempt number, or attempt cap.

## Schema V22

Schema v22 adds only:

```text
sequences.reworkPlan
reworkPlans
```

No existing record gains a required reverse reference. Migration preserves every valid schema-v21
domain value and creates no ReworkPlan during boot, read, preview, render, or exact inspection.

### ReworkPlan

One record has exactly:

```text
id
persisted
status
projectId
missionId
staffingPlanId
staffingEntryId
councilSessionId
executionPlanId
reviewerWorkOrderId
reviewerAttemptId
reviewerRunId
reviewArtifactId
sourceExecutionPlanDigest
sourceAttemptRecordDigest
previewId
previewDigest
previewEvaluatedAt
reviewEvidenceDigest
sourceProgressDigest
nextAttemptNumber
maxAdditionalBuilderAttempts
targetPathAllowlist
verificationCommands
findings
evidenceRefs
allowedActions
blockedActions
recordApproval
recordApprovalDigest
createdAt
recordDigest
```

Fixed values are:

```text
persisted=true
status=review-required
nextAttemptNumber=2
maxAdditionalBuilderAttempts=1
allowedActions=[]
```

`targetPathAllowlist`, `verificationCommands`, `findings`, `evidenceRefs`, and `blockedActions` are
exact deep copies of the recomputed preview. Findings retain source order, duplicate occurrences,
one-based ids, and digests. The durable record never stores raw Artifact bodies, source bodies,
provider payloads, prompts, transcripts, environment values, absolute paths, stdout, stderr,
credentials, or secrets.

`recordApproval` has exactly:

```text
decision=record-rework-plan
acknowledgement=record-exact-reviewer-rework-plan-without-execution
rationale
reviewedAt
```

`rationale` is trimmed, non-empty, credential-safe, and at most 500 UTF-8 bytes. `reviewedAt` is an
exact ISO timestamp at or after `previewEvaluatedAt` and no more than five minutes ahead of runtime
now. `recordApprovalDigest` covers the complete normalized approval. `createdAt` equals the
normalized `recordApproval.reviewedAt`; the persist path does not introduce an unbound wall-clock
value into the immutable record.

`recordDigest` covers every record field except itself. The record is immutable after append. Its
`status=review-required` does not become accepted, rejected, executed, superseded, or completed in
this slice.

## Exact Persist Request

The bounded route is:

```text
POST /api/execution-plans/:executionPlanId/rework-plans
```

The JSON body has exactly these ten keys:

```text
reviewerWorkOrderId
reviewerAttemptId
reviewerRunId
reviewArtifactId
expectedExecutionPlanDigest
expectedAttemptRecordDigest
evaluatedAt
previewId
previewDigest
recordApproval
```

The runtime first normalizes the complete request without writing. Exact replay is checked against a
valid existing ReworkPlan before source-current recomputation. For first creation, the runtime:

1. loads schema v21 or v22 through the supported no-write path;
2. recomputes the complete `DEC-188` preview from current state and the exact seven source fields;
3. requires `previewId` and `previewDigest` to match that result;
4. validates the separate record approval;
5. constructs the prospective deterministic sequence id and complete record in memory;
6. validates the complete candidate schema-v22 state;
7. performs one atomic migration-plus-append save.

Any malformed, missing, extra, stale, divergent, unsafe, future-timestamp, or lineage-invalid input
fails before the sequence increments or state bytes change.

## Idempotency And Collision Rules

- The first valid request creates exactly one ReworkPlan and returns `201`.
- An exact normalized replay returns the existing record with `200`, `idempotent=true`, and no save.
- Replay validates the stored record and `recordDigest` before returning it.
- A different request for the same ExecutionPlan, Reviewer attempt, review Artifact, preview, or
  source progress digest returns `409`.
- Only one ReworkPlan may bind the selected Reviewer changes-requested stop.
- Later source drift does not rewrite or delete an existing valid record.
- Replay never creates a second record and never opens execution authority.

## Exact Inspection

Exact-id inspection is:

```text
GET /api/rework-plans/:reworkPlanId
```

The bounded current-chain locator is:

```text
GET /api/execution-plans/:executionPlanId/rework-plan
```

The locator returns the one exact ReworkPlan bound to that ExecutionPlan or `404`. It is not a
collection, list, history, search, ranking, recommendation, automatic selection, or next-action
surface. The generic `/api/snapshot` excludes the `reworkPlans` map.

Exact inspection validates record shape, source references, canonical digests, fixed values,
bounded redacted fields, and one-record uniqueness. It does not mutate the record or claim that the
source ExecutionPlan is still executable.

## Transport Envelopes

Successful POST uses exactly:

```text
generatedAt
idempotent
reworkPlan
```

Successful GET uses exactly:

```text
generatedAt
reworkPlan
```

Malformed or missing input returns bounded `{error}` with `400`; unknown exact records return `404`;
stale, divergent, duplicate, unsupported-state, or lineage conflicts return `409`; oversized JSON
returns `413`; unsupported content type returns `415`. Error bodies never contain raw Artifact
content, source bodies, stack traces, environment values, credentials, or absolute paths.

## UI Contract

The implementation may add one `Record rework plan` command beside a source-current DEC-188 preview.
It must:

- require all ten exact request fields and an explicit rationale;
- clear stale browser-memory success before each request;
- disable itself while a request is active;
- render the immutable record and `review-required` status after success;
- hydrate only through the bounded ExecutionPlan current-chain locator after refresh;
- retain the existing `Preview rework plan` inspection action;
- expose no `Approve rework`, `Start rework`, `Retry`, `Preflight`, `Run Builder`, `Run Reviewer`,
  `Run QA`, `Commit`, `Push`, or `Release` control.

The durable record is evidence, not a new workstream state.

## Compatibility

- Keep all DEC-091, DEC-094, DEC-097, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, and DEC-188
  behavior unchanged.
- Preserve schema-v21 state byte-for-byte until the first valid persist request.
- Keep response-only preview generation no-write.
- Keep WorkOrderAttempt, SpecialistBatch, SpecialistCellRetry, WorkflowCheckpoint, Run, Artifact,
  Approval, Decision Inbox, Mission, task, provider, source, Git, release, memory, and policy records
  unchanged during append.
- Keep standalone task, Council, delivery, learning, memory, Growth, commit, and release routes
  unchanged.
- Exclude ReworkPlan from the generic snapshot.

## Rollback

Disable the persist route, exact GETs, current-chain locator, and UI record action. Stop new record
creation. Preserve every valid schema-v22 ReworkPlan and source record without downgrade, deletion,
rewrite, status change, or implicit execution. Keep DEC-188 preview available. Quarantine only
semantically invalid records through a later separately approved recovery path.

## Focused Verification Plan

Future implementation must add:

```text
scripts/smoke-ai-company-durable-reviewer-rework-plan.mjs
scripts/smoke-ui-slice-704.mjs
```

The runtime/API smoke must prove:

- atomic schema-v21 to schema-v22 migration and one append;
- no record on boot, read, preview, GET, render, migration validation, or invalid input;
- exact ten-key request and approval validation;
- current DEC-188 preview recomputation before first write;
- exact preview, source, review, progress, attempt, target, verification, finding, evidence,
  `allowedActions=[]`, and blocked-action inheritance;
- one immutable `review-required` record with canonical approval and record digests;
- exact replay without save and divergent collision refusal;
- exact-id and one-current-chain inspection with generic snapshot exclusion;
- malformed, missing, extra, oversized, unknown, stale, future, credential, raw-body, widened-path,
  widened-command, missing-finding, QA-already-run, provider-backed, legacy-unbound, pass/fail,
  lineage-conflict, partial-v22, and future-schema refusal;
- schema-v22 reload, source-drift retention, and rollback evidence;
- zero Builder WorkOrder or WorkOrderAttempt append, retry, preflight, approval, run, artifact,
  checkpoint, source, provider, memory, Git, release, or policy mutation;
- DEC-091, DEC-094, DEC-097, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, and DEC-188 compatibility.

The UI smoke must prove exact-gated record action, required rationale, safe failures, refresh
hydration through the bounded locator, immutable read-only rendering, unchanged preview action,
absent downstream controls, and desktop/mobile fit.

## Implemented Status

`DEC-191` implements schema v22 with only `sequences.reworkPlan` and `reworkPlans`. Runtime
recomputes DEC-188 from one loaded source snapshot before the first append, requires the exact
preview and separate record approval, performs one atomic migration-plus-append save, and returns
exact replay without saving. Exact-id and bounded ExecutionPlan current-chain GETs expose the
immutable record; the generic snapshot excludes it. The UI retains `Preview rework plan`, adds one
required-rationale `Record rework plan` command, hydrates only through the current-chain locator,
and exposes no execution action.

## Still Blocked

ReworkPlan acceptance, rejection, changes-requested, supersession, deletion, Builder WorkOrder or
WorkOrderAttempt append, retry, rework start, preflight, approval creation or resolution, mutation,
Reviewer/QA execution, scheduling, providers, result or memory application, source/Git/release,
policy mutation, collections, bypass, and connectors remain separately gated.
