# AI Company Reviewer Re-execution Plan

## Purpose

This document defines the narrow Stage 5G boundary after one exact
source-current `DEC-203` Builder rework source mutation has completed.
Planning-only authority is recorded as `DEC-204`; `DEC-205` records the complete
fielded implementation handoff. `DEC-206` accepts only the exact Stage 5G
implementation described here.

The implementation keeps schema v24 and the fixed WorkOrder graph. It adds the
bounded runtime/API/UI path, one existing-Reviewer WorkOrderAttempt #2, its
Reviewer Run and review Artifact, and the exact checkpoint and Decision Inbox
transitions described below. It adds no WorkOrder, provider-backed execution,
QA execution, new source mutation, Git, release, memory, policy, or connector
authority.

## Recommendation

Stage 5G should run Reviewer once and stop before QA.

Combining Reviewer and QA would hide the most important new decision: whether
the reworked source actually satisfies the retained findings. The smaller path
keeps that judgment visible:

```text
completed DEC-203 mutation
  -> source-current mutation and review lineage check
  -> existing Reviewer WorkOrderAttempt #2 becomes active
  -> one local-stub Reviewer run
  -> pass: Reviewer completed, QA queued, QA_READY checkpoint, stop
  -> changes requested: ExecutionPlan blocked, QA blocked, stop
```

No new WorkOrder is needed. The existing Reviewer WorkOrder already owns the
target allowlist, verification commands, expected evidence, and dependency on
Builder. The future implementation should preserve schema v24 and append only
the second Reviewer attempt, one Reviewer Run, one review Artifact, and the
existing checkpoint and Decision Inbox evidence needed by the result.

## Current Source Audit

The current source cannot safely reuse the generic operator step as-is:

- `beginOperatorSteppedWorkOrderStep` treats one prior `run-reviewer` action as
  the only replayable attempt, so it cannot distinguish Reviewer attempt #1
  from a separately authorized attempt #2;
- `completeReviewedDeliveryReviewer` anchors Reviewer output to the Builder
  WorkOrder's current completion Run, while DEC-203 deliberately leaves the
  fixed WorkOrders unchanged;
- `runReviewer` resolves its input through the original Builder
  `live-mutation` bundle and does not recognize the dedicated
  `rework-live-mutation` bundle;
- `validateBuilderReworkDispatchRecords` currently requires the ExecutionPlan
  and Reviewer WorkOrder to remain forever at the first
  `reviewer-changes-requested` stop and recomputes the historical plan digest
  from the mutable current record.

The future path therefore needs a dedicated source projection, start
transaction, coordinator entrypoint, settlement branch, and exact validation
branch. Shared Reviewer parsing and local-stub adapter behavior may be reused,
but the old Builder bundle must not be silently substituted for DEC-203
evidence.

## Exact API Boundary

The planned surface is:

```text
POST /api/rework-plans/:reworkPlanId/reviewer-reexecution
GET /api/rework-plans/:reworkPlanId/reviewer-reexecution
```

POST accepts exactly:

```text
builderReworkDispatchId
builderReworkDispatchDigest
builderReworkAttemptId
builderReworkAttemptRecordDigest
mutationRunId
mutationEvidenceDigest
reviewerWorkOrderId
reviewerWorkOrderDigest
sourceReviewerAttemptId
sourceReviewerAttemptRecordDigest
sourceProgressDigest
evaluatedAt
reviewerRequest
```

`reviewerRequest` has exactly:

```text
decision=run-reviewer-reexecution
acknowledgement=review-exact-rework-result-once-and-stop-before-qa
rationale
reviewedAt
```

`evaluatedAt` must equal `reviewerRequest.reviewedAt`. Rationale is required,
credential-safe, and bounded to 500 UTF-8 bytes. The request cannot supply
source content, target paths, verification commands, provider mode, role,
attempt number, Reviewer output, QA input, checkpoint state, or downstream
commands.

`mutationEvidenceDigest` is one canonical digest over the exact DEC-203
Approval, dispatch, completed Builder attempt #3, mutation Run metadata and
summary, sanitized change-summary record and bytes, patch record and bytes,
diff record and bytes, changed files, baseline and post-mutation target
digests, and current target bytes. It replaces a loose collection of
client-selected Artifact fields without weakening raw-byte verification.

## Source-Current Gate

Before the first state write, the future implementation must prove:

1. schema v24 loads and the exact ReworkPlan, ReworkPlanAcceptance,
   BuilderReworkDispatch, immutable DEC-200 Approval, completed Builder attempt
   #3, mutation Run, and three mutation Artifacts are valid;
2. the mutation Run is completed with
   `executionMode=rework-live-mutation`, the request digest and provider
   evidence are valid, and the Artifact ids and changed files match its
   terminal summary;
3. each current target is the same contained single-link regular file whose
   digest matches the durable post-mutation digest;
4. the original Reviewer WorkOrderAttempt #1, Reviewer Run, review Artifact,
   retained findings, source progress digest, and referenced pending Reviewer
   Decision items still match the accepted rework lineage;
5. Builder is completed, Reviewer is `changes-requested`, QA is
   `blocked-dependency`, and no Reviewer attempt #2, QA attempt, retry,
   recovery, or competing execution exists;
6. CompanyBlueprint and all role sources remain current, the project is
   exactly `local-stub`, and the fixed target allowlist and verification
   commands have not widened;
7. every pending blocking item belongs to the exact retained Reviewer decision
   lineage. Any unrelated pending blocker refuses the start.

Malformed, stale, drifted, colliding, provider-backed, or partially retained
input fails before a save, Run, worker invocation, or source read beyond the
bounded current-source check.

## Start Transaction

One atomic save before the worker must:

1. append the DEC-203 mutation Run, Artifacts, and changed files to the current
   Builder WorkOrder and ExecutionPlan provenance without removing earlier
   evidence;
2. make the mutation Run the Builder WorkOrder's current completion Run;
3. create and consume one source-bound existing `REVIEWER_READY` checkpoint
   whose input and authority digests include the reconciled Builder evidence;
4. append Reviewer WorkOrderAttempt #2 with `command=step`,
   `action=run-reviewer`, `status=active`, and the exact checkpoint authority;
5. start one Reviewer Run with `executionMode=rework-reviewer` and the canonical
   mutation evidence digest;
6. set the existing Reviewer WorkOrder active and the ExecutionPlan reviewing;
7. resolve only the retained pending Reviewer Decision refs with the
   deterministic action `rework-started`, preserving their history and
   refusing any unrelated pending blocker;
8. leave the ReworkPlan, acceptance, dispatch, DEC-200 Approval, Builder attempt
   #3, mutation Run, mutation Artifacts, QA WorkOrder, source files, and every
   unrelated record unchanged.

The complete candidate state must validate before save. If the process stops
after this transaction, the active attempt and running Run are truthful
interruption evidence. Startup and GET must not infer success or invoke the
worker again.

## Reviewer Execution

After the start state is durable, the coordinator invokes one local-stub
Reviewer request built from:

- the exact DEC-203 mutation Run and change-summary, patch, and diff Artifacts;
- the prior Reviewer findings and exact Decision refs;
- the immutable target allowlist and verification commands;
- bounded current contents for those exact targets;
- the current source-of-truth files and Reviewer role contract.

The request may not use the old Builder live-mutation bundle as the current
source, scan arbitrary paths, execute QA, run shell commands, mutate files, call
a provider, create an Approval, or enter commit or release follow-up.

The response must use the existing canonical Reviewer artifact contract and
preserve the raw verdict, evidence reviewed, findings, contract compliance,
verification evidence, accepted risks, next action, and follow-up gate.
Malformed output, a changed source anchor, an unsupported next stage, a
pass-with-decision combination, or widened evidence fails closed.

## Settlement

### Pass

When Reviewer returns `pass` with no decision:

- complete the Reviewer Run and append one review Artifact;
- settle Reviewer WorkOrderAttempt #2 as completed using only its own Run and
  Artifact refs;
- preserve earlier Reviewer refs as WorkOrder history without adding them to
  attempt #2;
- mark Reviewer completed and QA queued;
- set QA as the active next WorkOrder;
- append one current `QA_READY` checkpoint;
- stop with `nextGate=separate-qa-execution-decision-required`.

No QA worker is invoked.

### Changes requested

When Reviewer returns `changes_requested`:

- complete the Reviewer Run and append one review Artifact;
- create at most one exact review-sourced Decision item when the normalized
  result requires it;
- settle Reviewer WorkOrderAttempt #2 as `changes-requested`;
- leave the ExecutionPlan blocked at Reviewer and QA
  `blocked-dependency`;
- expose `nextGate=no-additional-rework-authority`.

Attempt #2 consumes the one Reviewer re-execution cap. It must not create a
third Reviewer attempt, a second Builder rework, or an automatic retry.

### Failure and replay

Worker, parsing, source-current, Artifact, or settlement failure completes the
Reviewer Run with bounded redacted error evidence, marks Reviewer attempt #2
failed, blocks the ExecutionPlan, and leaves QA blocked. There is no automatic
retry or graph rollback.

An exact request replay returns the existing active or terminal projection
without another save or worker. A divergent replay returns `409`. Active
interruption, failed settlement, cancellation, recovery, quarantine, and
replacement require separate decisions.

## Historical And Current Validation

DEC-203 records are historical source evidence. After Stage 5G begins, current
WorkOrder and ExecutionPlan digests are expected to change.

The future file-store branch must therefore:

- keep validating the immutable dispatch, Approval, Builder attempt #3,
  mutation Run, mutation Artifacts, raw bytes, and stored historical source
  digest exactly;
- stop recomputing that historical digest from a later mutable ExecutionPlan;
- admit a later graph state only when the canonical mutation evidence,
  reconciled Builder refs, consumed Reviewer-ready checkpoint, Reviewer attempt
  #2, and current Reviewer Run form one exact relationship;
- retain the strict pre-Stage-5G branch for states without Reviewer attempt #2;
- reject partial promotion, mixed old/new refs, duplicate attempt #2,
  WorkOrder replacement, QA activity, or any broader relaxation.

This is a compatibility correction for one explicit lifecycle transition, not
a general weakening of digest or graph validation.

## Planned UI

The future UI may show one `재작업 결과 검토` command only when the exact
DEC-203 mutation is completed and source-current. It shows the retained
findings, changed files, target scope, verification commands, mutation evidence
digest, and the fact that QA remains a later gate.

The UI may render read-only `ready`, `running`, `passed`,
`changes-requested`, `failed`, or `interrupted` evidence. It clears local input
on refresh, source drift, selection change, or failed recomputation. It must
not render a QA run button, another rework, retry, recovery, provider, memory,
Git, release, scheduling, policy, bypass, or connector control.

## Compatibility And Rollback

- Keep schemaVersion 24 and every existing sequence and map shape.
- Preserve DEC-188 through DEC-203 records and exact inspection.
- Preserve generic Reviewer, original reviewed-delivery, standalone task,
  Council, specialist, commit, and release behavior outside this route.
- Reuse the existing Reviewer WorkOrder, checkpoint, Run, Artifact, Decision
  Inbox, and WorkOrderAttempt contracts through one action-specific branch.
- Disable POST, GET, UI, and coordinator entrypoints to stop new Stage 5G
  starts during rollback.
- Preserve valid active and terminal attempt #2 evidence. Do not delete,
  renumber, or rewrite historical Reviewer or Builder evidence.
- Require a later recovery decision for an interrupted active attempt.

## Required Verification

The focused runtime smoke is
`scripts/smoke-ai-company-reviewer-reexecution.mjs`. It must prove exact
request normalization, canonical mutation evidence and raw-byte binding,
current post-mutation target digests, original Reviewer lineage, unrelated
blocker refusal, schema-v24 preservation, no new WorkOrder, exact Reviewer
attempt #2 numbering, atomic graph reconciliation and active-before-worker Run,
one local-stub call, prior Decision resolution, old evidence retention,
attempt-specific refs, pass-to-QA-ready stop, changes-requested terminal stop,
pass-with-decision refusal, failure, interruption, exact replay, divergent
`409`, exact terminal replay after later source drift, raw Artifact-byte tamper
refusal during active settlement and terminal replay, mutation evidence
recomputation during file-store reload, direct generic QA step and recovery
refusal including an HTTP `409`, empty durable Stage 5G QA actions, checkpoint
and attempt authority digest tamper refusal, DEC-197/200/203 compatibility, and
zero QA/provider/source/Git/release/memory/policy/connector authority.

The focused UI smoke is `scripts/smoke-ui-slice-709.mjs`. It must prove exact
visibility, rationale and acknowledgement gating, retained finding and mutation
evidence, safe running and terminal states, stale clearing, no QA or downstream
controls, generic QA-step suppression at the Stage 5G checkpoint, and
desktop/mobile fit.

## Authority Status

- Planning authority: accepted as `DEC-204`.
- Complete fielded implementation handoff: recorded as `DEC-205`.
- Runtime/API/UI implementation: approved only for this exact Stage 5G slice by `DEC-206`.
- Implementation decision: `DEC-206`.

QA execution, a third Reviewer or Builder attempt, second rework, retry,
recovery, resume, provider-backed WorkOrders, source mutation expansion, result
or memory application, runtime-agent commit/push/release, scheduling or
background autonomy, profile or policy mutation, approval bypass, and external
connectors remain separately blocked.
