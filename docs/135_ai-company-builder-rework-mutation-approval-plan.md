# AI Company Builder Rework Mutation Approval Plan

## Purpose

This document defines the narrow Stage 5E boundary after the
source-current `DEC-197` Builder rework preflight reaches `waiting-gate`. It
records planning-only `DEC-198`; `DEC-199` records the complete fielded
implementation handoff, and `DEC-200` implements the exact evidence-only
Approval path.

The plan reuses the existing task-owned `Approval` and `DecisionInboxItem`
records. It keeps schema v24 and adds no sequence, map, domain record, graph,
dispatch, WorkOrderAttempt, Run, Artifact, WorkflowCheckpoint, provider, or
source behavior during this planning slice.

## Boundary

The implementation may create one existing-task-owned mutation Approval
and one Decision Inbox item from one exact `BuilderReworkDispatch` at
`waiting-gate`. It must use dedicated source-bound creation and resolution
wrappers, not direct composition of generic `createApprovalPlaceholder` and
the generic resolver. It must stop after Approval creation or resolution and
before Builder source mutation.

```text
source-current DEC-197 BuilderReworkDispatch(waiting-gate)
  -> exact preflight Run and Artifact lineage revalidation
  -> one task-owned Approval(scope=builder-rework)
  -> one Decision Inbox item
  -> operator approved or rejected evidence only
  -> stop before Builder source mutation
```

The fixed three-WorkOrder graph stays byte-equivalent. The dispatch and
WorkOrderAttempt #3 stay immutable; their `approvalRefs=[]` and
`decisionInboxItemRefs=[]` remain unchanged. The only planned existing-record
change is the documented task `waitingApproval` and `updatedAt` transition
owned by the established Approval/Inbox mechanism. Existing `blocked` and
`waitingDecision` values remain unchanged.

## Exact Source Gate

Before initial Approval creation, exact replay, and both `approved` and
`rejected` resolution, the dedicated wrapper must reject unless all of these
are source-current:

1. valid schema-v24 state and exact `BuilderReworkDispatch` record digest;
2. the dispatch's WorkOrderAttempt #3 is `waiting-gate` with stop reason
   `builder-rework-preflight-complete-mutation-approval-blocked`;
3. exactly one complete local-stub `rework-preflight` Run and its exact
   preflight Artifact exist and match dispatch/attempt lineage;
4. the inherited DEC-188/DEC-191/DEC-194 findings, target paths, verification
   commands, source progress digest, and source evidence remain current;
5. the ExecutionPlan remains `blocked` at Reviewer `changes-requested`, Builder
   remains completed, Reviewer remains changes-requested, and QA remains
   blocked-dependency;
6. every Reviewer Decision referenced by the retained source evidence remains
   pending and blocking; an empty source Decision ref list remains empty, and
   only the future Approval-owned `waitingApproval` flag may toggle while the
   task's existing `blocked` and `waitingDecision` values remain unchanged;
7. no active Builder attempt, provider drift, source drift, record digest drift,
   or stale state exists, and there is no divergent or second Builder rework
   mutation Approval for the dispatch. One existing exact action-specific
   Approval is permitted only for no-write creation replay.

Any existing generic `builder-live-mutation` Approval whose target Run,
target Artifact, metadata, or source binding points to the DEC-197 preflight,
dispatch, or WorkOrderAttempt #3 is an authority collision and returns `409`,
regardless of terminal status. Historical generic Approvals for an earlier
Builder attempt remain compatible. The generic creation path must reject the
DEC-197 rework preflight source so the same evidence cannot acquire two
different mutation actions.

The transition is one-way: `pending -> approved` or `pending -> rejected`.
Terminal decisions cannot be reopened, replaced, or resolved again. Both
outcomes revalidate the complete source tuple, preserve the Reviewer Decision
and task blocking state, and never resume a worker, settle a Run, create an
Artifact, or mutate source.

## Planned Approval Contract

The existing Approval and Decision Inbox contracts are reused through a
dedicated `src/runtime/builder-rework-mutation-approvals.js` strict normalizer
for this action. The generic `builder-live-mutation` action must not be reused.

```text
allowedNextAction=builder-rework-live-mutation
scope=builder-rework
targetArtifactId=<exact DEC-197 preflight Artifact id>
targetRunId=<exact DEC-197 preflight Run id>
```

The immutable source-binding metadata has exactly:

```text
builderReworkDispatchId
builderReworkDispatchDigest
executionPlanId
workOrderAttemptId
workOrderAttemptRecordDigest
preflightRunId
preflightRunRecordDigest
preflightArtifactId
preflightArtifactRecordDigest
preflightArtifactContentDigest
reworkPlanId
reworkPlanRecordDigest
reworkPlanAcceptanceId
reworkPlanAcceptanceDigest
sourceExecutionPlanDigest
sourceAttemptRecordDigest
reviewEvidenceDigest
sourceProgressDigest
reviewDecisionInboxItemRefs
bindingDigest
```

`bindingDigest` covers the complete normalized metadata only. File-store must
strictly validate the nested metadata and binding digest on every load and save
while schema v24 stays unchanged. The Approval record remains mutable only
through the dedicated one-way lifecycle; the binding metadata is immutable and
exact-replay identity includes every request field plus the derived binding.

The three preflight digests are derived bindings, not new fields on the existing
Run or Artifact records. The future module must use the same canonical algorithm
for each record projection: recursively sort object keys, preserve array order,
serialize with UTF-8 `JSON.stringify`, and compute lowercase SHA-256. Missing,
extra, `undefined`, or non-JSON values are rejected before hashing.

```text
preflightRunRecordDigest = digestCanonical({
  id, taskId, kind, role, status, metadata, summary,
  startedAt, finishedAt, logPath
})

preflightArtifactRecordDigest = digestCanonical({
  id, taskId, runId, type, path, createdAt
})

preflightArtifactContentDigest = sha256(exact raw Artifact file bytes)
```

The dedicated wrapper recomputes these values from the source-current v24 Run,
Artifact record, and opened Artifact file before comparing caller input. It
persists only the resulting digests in Approval metadata, never the Run,
Artifact record, Artifact content, or source path body.

The future sequence allocation must reject Approval or Decision Inbox sequence
collisions before candidate persistence. It must not overwrite an existing
Approval or inbox record.

## Planned API And UI

The future API surface is exactly:

```text
POST /api/rework-plans/:reworkPlanId/builder-rework-mutation-approval
GET /api/rework-plans/:reworkPlanId/builder-rework-mutation-approval
```

POST accepts exactly:

```text
builderReworkDispatchId
builderReworkDispatchDigest
workOrderAttemptId
workOrderAttemptRecordDigest
preflightRunId
preflightRunRecordDigest
preflightArtifactId
preflightArtifactRecordDigest
preflightArtifactContentDigest
sourceProgressDigest
evaluatedAt
approvalRequest
```

`approvalRequest` has exactly:

```text
decision=request-builder-rework-mutation-approval
acknowledgement=create-one-reviewable-rework-approval-without-source-mutation
rationale
reviewedAt
```

`evaluatedAt` must equal `approvalRequest.reviewedAt`. Rationale is normalized,
credential-safe, and bounded to 500 UTF-8 bytes. Findings, source scope,
Reviewer Decision refs, and mutation scope are derived in runtime, never
supplied by the caller. The dedicated creation wrapper revalidates the full
source tuple before initial persistence; exact replay returns the existing
immutable binding without a write, while divergent identity returns `409`.
GET is exact-id inspection only and does not enumerate Approvals or inbox
history.

The existing Decision Inbox transport resolves the action through a dedicated
source-current branch that repeats the complete lineage revalidation inside
runtime, permits only `approved` or `rejected`, and rejects every terminal
resolution replay or status reversal with `409`. The UI may show
`Mutation approval 요청` only when the DEC-197 dispatch reports
`preflight-ready-for-separate-mutation-approval`; it labels the evidence as
`Builder rework mutation approval` and prioritizes the still-blocking Reviewer
Decision when one exists. It may show exact read-only evidence and the
action-specific approve/reject controls, but must not render `Run mutation`,
retry, resume, or a downstream role command.

## Compatibility And Rollback

- Keep schemaVersion 24 and preserve every valid v24 record shape and digest.
- Preserve generic Builder live-mutation, commit, release, Council, task, and
  existing Decision Inbox behavior outside this exact action.
- Explicitly reject `builder-rework-live-mutation` from the original Builder
  live-mutation, scheduler, Reviewer, and QA paths until a later decision
  authorizes source mutation.
- Reject any generic `builder-live-mutation` Approval bound to the same DEC-197
  dispatch, WorkOrderAttempt #3, preflight Run, or preflight Artifact while
  preserving historical generic Approvals for earlier Builder attempts.
- Do not modify `BuilderReworkDispatch`, WorkOrderAttempt #3, ExecutionPlan,
  WorkOrder graph, Run, Artifact, WorkflowCheckpoint, provider evidence, or
  source before or after either decision outcome.
- Rollback disables only the future POST/GET and action-specific resolution/UI
  branch. Valid pending Approval and inbox evidence remain inert and
  inspectable; no downgrade, deletion, automatic rejection, resume, or source
  cleanup is allowed.

## Required Verification

The DEC-200 implementation smoke proves dedicated creation/resolution
wrappers, exact waiting-gate lineage and binding digest, strict file-store
nested metadata validation, exact canonical Run/Artifact record projections,
raw-byte Artifact content hashing, generic-versus-rework action collision
refusal, preflight sequence collision refusal without Approval/Inbox overwrite,
one Approval per dispatch, one-way
pending-to-approved/rejected transitions, exact replay with no write,
divergent `409`, stale dispatch/attempt/Run/Artifact/DEC-188/DEC-191/DEC-194/
provider/Reviewer Decision refusal, conditional Reviewer Decision ref and task
blocked/waitingDecision preservation while waitingApproval toggles, terminal
resolution replay and status-reversal refusal, rejection of the action by
original Builder live-mutation/scheduler/Reviewer/QA paths, no
worker/provider/source/graph/dispatch/attempt/Run/Artifact/checkpoint mutation,
API shape refusal, UI Reviewer-priority labeling, DEC-194/DEC-197 compatibility,
and aggregate verification.

## Authority Status

- Planning approval: accepted as `DEC-198`.
- Complete fielded implementation handoff: recorded as `DEC-199`.
- Exact implementation authority: accepted as `DEC-200`.
- Schema/runtime/API/UI Approval evidence path: implemented and verified.

Builder source mutation, a fourth WorkOrder, another attempt, Reviewer/QA
execution, retry/recovery/resume, checkpoint creation, scheduling,
provider-backed execution, result or memory application, Git/release, policy
mutation, approval bypass, and connectors remain separately blocked.
