# AI Company Rework QA Execution Plan

## Purpose

This document defines the narrow Stage 5H boundary after one exact
source-current `DEC-206` Reviewer re-execution has passed. Planning-only
authority is recorded as `DEC-207`; `DEC-208` records the complete fielded
implementation handoff. Runtime, API, UI, worker, Run, Artifact, WorkOrderAttempt,
checkpoint, or graph mutation remains reserved for a later exact `DEC-209`
operator decision.

The planned implementation keeps schema v24 and the fixed three-WorkOrder
graph. It reuses the existing QA WorkOrder, appends only QA WorkOrderAttempt #1,
runs one source-bound shell-free Node syntax check boundary, and stops at
`DELIVERY_READY` on pass. It creates or previews no DeliveryPackage and grants
no Mission/task close-out, retry, recovery, provider, source, Git, release,
memory, scheduling, policy, bypass, or connector authority.

## Recommendation

Stage 5H should use a dedicated rework-QA entrypoint instead of reopening the
generic `run-qa` step.

```text
passed DEC-206 Reviewer attempt #2
  -> exact Reviewer and mutation evidence check
  -> source-current QA input bytes and digests
  -> existing QA WorkOrderAttempt #1 plus running QA Run saved atomically
  -> one shell-free source-bound node --check worker
  -> pass: QA completed, DELIVERY_READY checkpoint, stop
  -> failed check: QA failed, ExecutionPlan blocked, stop
```

This path keeps the Stage 5G empty-action checkpoint meaningful and makes the
new operator decision visible. It does not add another WorkOrder or schema
record.

## Current Source Audit

The generic path cannot safely implement Stage 5H:

- `beginOperatorSteppedWorkOrderStep` persists an active WorkOrderAttempt before
  the coordinator creates the QA Run, so a crash can leave authority and
  execution evidence split across saves;
- `runQaWorkOrder` accepts caller-selected Builder and Reviewer Run ids and does
  not bind Reviewer attempt #2, its review Artifact raw bytes,
  `mutationEvidenceDigest`, or the Stage 5G checkpoint;
- the generic operator-step route composes a response-only DeliveryPackage
  preview immediately after QA passes, exceeding this slice's stop condition;
- the schema-v24 Stage 5G file-store branch intentionally accepts only queued QA
  plus an actionless `QA_READY` checkpoint. Relaxing that branch would admit
  unrelated graph states instead of proving one exact post-DEC-206 transition.

Shared WorkOrderAttempt, Run, Artifact, checkpoint, `node --check`, and QA
settlement concepts may be reused. The Stage 5H source projection, start
transaction, worker input, replay, and file-store validation must be dedicated.

## Exact API Boundary

The planned surface is:

```text
POST /api/rework-plans/:reworkPlanId/qa-execution
GET /api/rework-plans/:reworkPlanId/qa-execution
```

POST accepts exactly:

```text
reviewerReexecutionAttemptId
reviewerReexecutionAttemptRecordDigest
reviewerRunId
reviewerEvidenceDigest
mutationEvidenceDigest
qaWorkOrderId
qaWorkOrderDigest
qaReadyCheckpointId
checkpointDigest
inputDigest
authorityDigest
sourceDigest
qaInputDigest
evaluatedAt
qaRequest
```

`qaRequest` has exactly:

```text
decision=run-rework-qa-once
acknowledgement=run-only-source-bound-node-checks-and-stop-before-delivery-package
rationale
reviewedAt
```

`evaluatedAt` must equal `qaRequest.reviewedAt`. Rationale is required,
credential-safe, and bounded to 500 UTF-8 bytes. The request cannot supply file
contents, target paths, commands, provider mode, role, attempt number, QA
output, DeliveryPackage input, checkpoint mutation, or downstream actions.

`reviewerEvidenceDigest` is canonical over Reviewer WorkOrderAttempt #2, its
terminal Run metadata and summary, review Artifact record and exact raw bytes,
the canonical mutation evidence digest, and the current actionless `QA_READY`
checkpoint.

`qaInputDigest` is canonical over the current Builder and Reviewer completion
Run ids, immutable QA WorkOrder scope, changed files, target allowlist,
verification commands, and bounded exact current file-byte digests. The
checkpoint's `inputDigest` and `authorityDigest` remain separate explicit
source fields.

## Source-Current Gate

Before the first state write, the implementation must prove:

1. schema v24 loads and the exact DEC-203 mutation, DEC-206 passed Reviewer
   attempt #2, Reviewer Run, review Artifact record and raw bytes remain valid;
2. canonical `mutationEvidenceDigest` and `reviewerEvidenceDigest` recompute
   from current retained evidence;
3. the fixed graph has Builder completed, Reviewer completed, QA queued,
   ExecutionPlan reviewing, QA active next, and no QA attempt or competing
   execution;
4. the latest checkpoint is the exact current actionless `QA_READY` checkpoint
   with `stopReason=reviewer-reexecution-passed-qa-ready`, and the supplied
   checkpoint, input, and authority digests match;
5. each current target is the same contained single-link regular file whose
   digest matches DEC-203 post-mutation evidence, with all configured byte caps
   enforced before worker input is prepared;
6. QA commands match exactly `node --check <safe-relative-path>`, refer only to
   changed allowlisted files, and contain no shell, arguments, environment
   expansion, or executable substitution;
7. CompanyBlueprint and role sources are current, the project remains exactly
   `local-stub`, and no unrelated pending blocker or active attempt exists.

Malformed, stale, drifted, widened, provider-backed, symlinked, oversized, or
partially retained evidence fails before save, Run creation, worker invocation,
or source mutation.

## Start Transaction

One complete candidate state must validate and save atomically before worker
execution:

1. consume the exact Stage 5G `QA_READY` checkpoint with an action-specific
   Stage 5H stop reason;
2. append QA WorkOrderAttempt #1 with `command=step`, `action=run-qa`,
   `status=active`, exact WorkOrder and dependency digests, and checkpoint-bound
   authority;
3. append one running verification Run with
   `executionMode=rework-qa-node-check`, the request digest,
   `reviewerEvidenceDigest`, `mutationEvidenceDigest`, and `qaInputDigest`;
4. bind the two new records exactly: Run
   `metadata.workOrderAttemptId === attempt.id`, attempt
   `runRefs === [run.id]`, and the attempt `recordDigest` must be recomputed
   after `runRefs` is attached so the Run relationship is digest-owned;
5. set the existing QA WorkOrder active and keep the ExecutionPlan reviewing;
6. preserve every DEC-188 through DEC-206 source record and all earlier Run,
   Artifact, Approval, Decision, attempt, and checkpoint refs unchanged.

If the process stops after this save, the active attempt and running Run are
truthful interruption evidence. Startup and GET must not invoke the worker,
infer success, or settle the attempt.

## QA Worker

The coordinator reads only the durable Stage 5H worker input. For each exact
verification command it:

- opens the contained regular file with no-follow and byte-cap checks;
- verifies the observed bytes against the durable expected digest;
- invokes `process.execPath --check -` with `shell=false`, the captured source
  bytes on stdin, a bounded timeout and output cap, and no inherited project
  command or shell expansion;
- reopens and rehashes every input after the checks and refuses settlement if
  any source byte changed during execution.

The worker creates no source file, Approval, Decision item, DeliveryPackage,
provider attempt, Mission, task, commit, push, or release evidence.

## Settlement

### Pass

When every check passes and source bytes remain exact:

- complete the QA Run and append one `qa-evidence` Artifact;
- settle QA WorkOrderAttempt #1 as completed with only its own Run and Artifact
  refs;
- mark QA completed and ExecutionPlan `delivery-ready`;
- append one current terminal `DELIVERY_READY` checkpoint;
- leave Mission `executing`, the control task open, and
  `nextGate=separate-delivery-package-decision-required`.

The same request must not call `previewExecutionPlanDelivery`.

### Failed checks

When one or more exact checks fail:

- complete the QA Run and append the bounded `qa-evidence` Artifact;
- settle QA WorkOrderAttempt #1 as failed;
- mark QA failed and block the ExecutionPlan at QA;
- expose `nextGate=no-qa-retry-authority`.

The attempt cap is consumed. No second QA attempt or automatic rework starts.

### Worker failure, interruption, and replay

Worker, source-drift, output-cap, timeout, Artifact, or settlement failure keeps
bounded redacted evidence and blocks at QA when deterministic settlement is
possible. A crash after the start transaction leaves the active attempt and Run
unchanged for separately authorized recovery.

An exact request replay returns the current active or terminal projection
without another save or worker. A divergent replay returns `409`. Active
recovery, retry, cancellation, quarantine, replacement, or inferred settlement
requires a separate decision.

## Historical And Current Validation

The future file-store path must add one exact post-DEC-206 branch rather than
weakening Stage 5G validation:

- preserve the current strict pre-Stage-5H branch for states with no QA attempt;
- require exactly one QA WorkOrderAttempt #1 and its Stage 5H Run;
- require the attempt's sole `runRefs` entry and the Run's
  `metadata.workOrderAttemptId` to reference each other, and recompute the
  attempt record digest with that Run ref present;
- recompute Reviewer evidence from attempt #2, Run, review Artifact raw bytes,
  mutation evidence, and the consumed QA-ready checkpoint;
- validate active, completed, failed, and interrupted relationships
  independently;
- on pass, require one current terminal `DELIVERY_READY` checkpoint and no
  DeliveryPackage, Mission/task close-out, commit, push, release, or learning
  mutation;
- reject duplicate QA attempts, mixed generic and dedicated evidence, missing
  raw bytes, stale digests, partial graph promotion, or downstream records.

## Planned UI

The UI may show one `재작업 QA 실행` command only for an exact ready Stage 5H
projection. It shows Reviewer pass evidence, changed files, allowlisted
commands, source digests, timeout/output limits, and the DeliveryPackage stop.

The UI may render read-only `ready`, `running`, `passed`, `failed`, or
`interrupted` evidence. It clears local input on refresh, source drift,
selection change, or failed recomputation. It must not render generic QA,
DeliveryPackage, Mission/task close-out, retry, recovery, provider, source,
Git, release, memory, scheduling, policy, bypass, or connector controls.

## Compatibility And Rollback

- Keep schemaVersion 24 and every existing sequence and map shape.
- Preserve DEC-188 through DEC-206 and generic reviewed-delivery behavior
  outside this route.
- Keep Stage 5G generic QA-step and recovery suppression unchanged.
- Add no WorkOrder or durable domain record.
- Disable dedicated POST, GET, UI, runtime, and coordinator entrypoints to stop
  new Stage 5H starts during rollback.
- Preserve valid active and terminal QA attempt, Run, Artifact, and checkpoint
  evidence; do not delete, renumber, downgrade, or infer settlement.

## Required Verification

The future focused runtime smoke is
`scripts/smoke-ai-company-rework-qa-execution.mjs`. It must prove exact request
normalization, canonical Reviewer and QA-input digests, raw review Artifact
byte binding, current source bytes, fixed graph, local-stub-only mode, unrelated
blocker refusal, schema-v24 preservation, existing QA WorkOrder and attempt #1,
exact `workOrderIds.length === 3` with Builder, Reviewer, and QA roles and
Builder-to-Reviewer-to-QA dependencies, absence of any prior QA attempt, exact
attempt number 1, duplicate or mixed generic QA-attempt refusal, atomic
attempt-plus-running-Run persistence before worker invocation, exact
`attempt.runRefs=[run.id]` and `run.metadata.workOrderAttemptId=attempt.id`
binding with record-digest tamper refusal,
source-bound stdin checks, shell/environment exclusion, timeout and output caps,
pass-to-`DELIVERY_READY`, failed-check terminal evidence, source-drift failure,
interruption, exact replay, divergent `409`, file-store tamper refusal,
DEC-203/206 and generic QA compatibility, no automatic DeliveryPackage preview,
and zero provider/source/Git/release/memory/policy/connector authority.

The future focused UI smoke is `scripts/smoke-ui-slice-710.mjs`. It must prove
exact visibility, acknowledgement and rationale gating, source and command
evidence, safe running and terminal states, stale clearing, generic-step
suppression, absent downstream controls, and desktop/mobile fit.

## Authority Status

- Planning authority: accepted as `DEC-207`.
- Complete fielded implementation handoff: recorded as `DEC-208`.
- Runtime/API/UI implementation: not authorized.
- Reserved implementation decision: `DEC-209`.

QA execution, QA WorkOrderAttempt #1, Run, Artifact, checkpoint, and graph
mutation remain blocked until the exact complete fielded `DEC-209` operator
decision is supplied. Second QA attempt, retry, recovery, DeliveryPackage,
Mission/task close-out, provider execution, source mutation, runtime-agent
commit/push/release, memory, scheduling, policy mutation, approval bypass, and
connectors remain separately blocked.
