# AI Company Builder Rework Source Mutation Plan

## Purpose

This document defines the narrow Stage 5F boundary after one exact
source-current `DEC-200` Builder rework mutation Approval is terminal
`approved`. It records planning-only `DEC-201`; `DEC-202` records the complete
fielded implementation handoff, and only a later exact `DEC-203` may authorize
implementation.

This planning slice changes no runtime, API, UI, schema, state, file, provider,
worker, Run, Artifact, WorkOrderAttempt, Approval, Decision Inbox item,
checkpoint, graph, Git, release, memory, policy, or connector behavior.

## Boundary

The future implementation may execute one explicit local-stub Builder rework
source mutation against the immutable target-path allowlist from one accepted
`ReworkPlan`. It must reuse the existing Builder `WorkOrderAttempt` #3 created
by `DEC-197`, preserve the exact `DEC-200` Approval as immutable authority
evidence, record mutation work through the existing Run and Artifact contracts,
and stop before Reviewer or QA re-execution.

```text
source-current DEC-200 Approval(approved)
  -> exact DEC-197 preflight and DEC-188/191/194 lineage revalidation
  -> WorkOrderAttempt #3 waiting-gate -> active
  -> one local-stub rework-live-mutation Run
  -> bounded allowlisted source update with baseline drift guard
  -> change-summary, patch, and diff Artifacts
  -> WorkOrderAttempt #3 completed
  -> stop with ExecutionPlan still blocked at Reviewer changes-requested
```

The implementation must not append WorkOrderAttempt #4 or another WorkOrder.
It must not rewrite Approval status or metadata to store execution outcome.
The Approval remains the immutable authorization fact; the attempt, Run, and
Artifacts own execution lifecycle and result evidence.

## Current Source Audit

The source-current schema is v24. The repository already provides:

- `BUILDER_ACTION.REWORK_LIVE_MUTATION=builder-rework-live-mutation`;
- one strict source-bound Builder rework mutation Approval module;
- one exact DEC-197 `BuilderReworkDispatch`, WorkOrderAttempt #3, preflight Run,
  and preflight Artifact relationship;
- a generic `runBuilderLiveMutation` path with baseline capture, bounded update
  validation, backup/restore, changed-set comparison, and change-summary,
  patch, and diff Artifact helpers;
- one local-stub `rework-preflight` execution mode.

The generic mutation path is not an authority-compatible implementation for
Stage 5F. It parses the original Builder preflight vocabulary, finalizes generic
Approval metadata, permits broader provider behavior, and does not settle the
DEC-197 rework attempt. Stage 5F therefore requires a dedicated request,
runtime wrapper, coordinator method, and local-stub execution mode while
reusing only the existing low-level file safety and Artifact helpers.

## Exact Mutation Request

The future API surface is exactly:

```text
POST /api/rework-plans/:reworkPlanId/builder-rework-source-mutation
GET /api/rework-plans/:reworkPlanId/builder-rework-source-mutation
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
mutationApprovalId
mutationApprovalBindingDigest
sourceProgressDigest
evaluatedAt
mutationRequest
```

`mutationRequest` has exactly:

```text
decision=run-builder-rework-live-mutation
acknowledgement=mutate-only-approved-rework-targets-and-stop-before-reviewer
rationale
reviewedAt
```

`evaluatedAt` must equal `mutationRequest.reviewedAt`. Rationale is
credential-safe and bounded to 500 UTF-8 bytes. The caller cannot supply file
content, target paths, verification commands, provider mode, role, attempt
number, Reviewer or QA state, Artifact paths, or downstream commands.

## Source-Current Preflight

Every initial start and exact replay must reject unless all of these remain
source-current before any state or source write:

1. schema v24 loads successfully and the exact `BuilderReworkDispatch`,
   WorkOrderAttempt #3, preflight Run, preflight Artifact, raw Artifact bytes,
   source progress digest, and DEC-200 Approval binding match the request;
2. the Approval is terminal `approved`, has
   `scope=builder-rework` and
   `allowedNextAction=builder-rework-live-mutation`, and its immutable metadata
   and binding digest remain valid;
3. the dispatch is `waiting-gate`, the attempt is `waiting-gate` with stop
   reason `builder-rework-preflight-complete-mutation-approval-blocked`, and no
   mutation Run or mutation Artifact already exists except the exact active,
   failed, or completed lifecycle evidence for an identical replay;
4. the immutable DEC-188/DEC-191/DEC-194 findings, accepted ReworkPlan,
   ReworkPlanAcceptance, target-path allowlist, verification commands, provider
   mode, Reviewer Decision refs, and source evidence remain current;
5. the ExecutionPlan remains `blocked`, Builder and its original WorkOrder stay
   completed, Reviewer stays `changes-requested`, QA stays
   `blocked-dependency`, and no graph or checkpoint transition has occurred;
6. every target is a project-contained existing regular file, resolves through
   realpath inside the approved project root, is present in the immutable
   ReworkPlan allowlist, is not a symlink, and has a current baseline digest;
7. provider mode is exactly `local-stub`, no second rework round exists, and no
   active mutation, retry, recovery, resume, or competing authority exists.

The complete candidate start state must be validated before the first save.
Malformed, stale, expired, drifted, widened, colliding, or partially persisted
input fails closed without invoking a worker or touching source.

## Execution And Evidence Lifecycle

### Start transaction

One atomic state save must:

1. transition the existing WorkOrderAttempt #3 from `waiting-gate` to `active`
   through a dedicated action-specific transition;
2. preserve its preflight Run and Artifact refs and append only the exact
   approved mutation Approval ref;
3. append one running Builder Run with
   `executionMode=rework-live-mutation`, exact dispatch/attempt/Approval refs,
   normalized target paths, and baseline file digests;
4. leave the immutable dispatch, Approval, Decision Inbox item, ReworkPlan,
   ReworkPlanAcceptance, ExecutionPlan, WorkOrders, Reviewer evidence, QA
   evidence, and source files unchanged.

This requires a narrow v24 file-store validation branch for the approved
rework-mutation lifecycle. It does not authorize a schema migration or a
general relaxation of WorkOrderAttempt validation.

### Worker and source update

After the start state is durably saved, the coordinator invokes exactly one
local-stub Builder request with `executionMode=rework-live-mutation`. The
request is built from the immutable source records, not parsed from Artifact
markdown. The result must contain one through the bounded target count of
unique updates, only for allowlisted targets, with non-empty base64 content and
per-file and aggregate byte caps.

Immediately before each write, the coordinator rechecks project containment,
regular-file status, symlink refusal, and the saved baseline digest. It stages
backups, writes only the validated update set, verifies the actual changed set
equals the declared update set, and restores every touched target on any
failure. Shell execution, package installation, target creation, deletion,
rename, chmod, symlink traversal, environment expansion, and verification
command execution are prohibited in this slice.

### Success settlement

One atomic state save after source success must:

- finalize the mutation Run as completed;
- append existing `change-summary`, `patch`, and `diff` Artifacts bound to that
  Run and exact changed files;
- transition WorkOrderAttempt #3 from `active` to `completed`, preserving the
  preflight refs and appending the mutation Run and Artifact refs;
- preserve the DEC-200 Approval and Decision Inbox item byte-equivalent;
- preserve the fixed ExecutionPlan and all three WorkOrders byte-equivalent;
- leave Reviewer `changes-requested` and QA `blocked-dependency`;
- return `nextGate=separate-reviewer-reexecution-decision-required`.

GET returns one exact source-bound projection for this ReworkPlan and does not
list mutation history or expose source content.

### Failure, interruption, and replay

If validation, provider output, writing, or settlement fails after start, the
coordinator restores every touched source file, finalizes the mutation Run with
bounded redacted failure evidence, and marks WorkOrderAttempt #3 `failed`.
There is no automatic retry, replacement attempt, or recovery.

If the process stops after the start save and before settlement, the durable
attempt stays `active` and the mutation Run stays running. A later recovery,
quarantine, or rollback action requires a separate complete fielded decision;
startup and GET inspection must not infer success or repeat the worker.

An exact request replay after completed settlement returns the existing
projection without a save, worker call, file read beyond bounded validation,
or source write. Replay while active or after failed settlement returns the
existing terminal or in-progress evidence without starting another mutation.
Divergent replay returns `409`.

## Planned UI

The future UI may render one `Builder rework 적용` form only when the exact
DEC-200 Approval is approved and the DEC-197 attempt is still at its mutation
gate. It requires rationale and the exact acknowledgement, shows the target
path list and immutable approval evidence before submission, disables itself
while in flight, and clears browser-local input after source drift, refresh,
selection change, or failed recomputation.

After start it may show read-only running, completed, failed, or interrupted
evidence. It must not render Reviewer/QA execution, retry, resume, recovery,
checkpoint, next-Mission, commit, push, release, memory, policy, or connector
controls.

## Compatibility And Rollback

- Keep schemaVersion 24 and every existing sequence/map contract.
- Preserve DEC-197 preflight, DEC-200 Approval creation/resolution, generic
  Builder mutation, standalone task, Council, specialist, commit, and release
  behavior outside the exact rework action.
- Keep the DEC-200 Approval strict metadata and digest immutable across every
  mutation lifecycle state.
- Extend validation only for one action-specific attempt #3 lifecycle with one
  preflight Run, one mutation Run, and the fixed Artifact classes.
- Disable the POST/GET/UI and coordinator entrypoint to stop new mutations
  during rollback. Preserve every valid v24 record and completed source change.
- Do not silently undo a completed source change. If an active mutation has
  source drift, stop new work, retain evidence, and require separately approved
  manual recovery or quarantine.
- Rerun focused DEC-197, DEC-200, Stage 5F, UI, and aggregate verification
  after implementation or rollback.

## Required Verification

The future implementation smoke must prove strict request and nested request
normalization, exact approved Approval and source tuple, schema-v24
preservation, action-specific waiting-gate-to-active transition, active state
saved before worker invocation, one local-stub call, immutable source-derived
targets, baseline drift refusal, realpath containment, regular-file and symlink
refusal, bounded base64 output, duplicate/extra/missing/path-widened update
refusal, backup and complete rollback, exact changed-set comparison, completed
Run plus change-summary/patch/diff Artifacts, completed attempt settlement,
Approval byte equivalence, fixed graph and Reviewer/QA state preservation,
exact GET, exact no-write replay, divergent `409`, active interruption
retention, terminal failure without retry, API input refusal, DEC-197/DEC-200
and generic Builder compatibility, and absence of Reviewer/QA/checkpoint/
provider/Git/release/memory/policy/connector authority.

The future UI smoke is reserved as `scripts/smoke-ui-slice-708.mjs`. It must
prove source-current visibility, exact acknowledgement and rationale gating,
target and Approval evidence, safe running/completed/failed/interrupted states,
stale clearing, no downstream controls, and desktop/mobile fit.

## Authority Status

- Planning approval: accepted as `DEC-201`.
- Complete fielded implementation handoff: recorded as `DEC-202`.
- Exact implementation authority: required as `DEC-203`.
- Runtime/API/UI/schema/source mutation: not authorized by this planning slice.

Builder source mutation implementation, Reviewer or QA re-execution, another
attempt or WorkOrder, second rework, retry, recovery, resume, checkpoint or
graph transition, provider-backed execution, result or memory application,
runtime-agent Git/release, policy mutation, approval bypass, and connectors
remain separately blocked.
