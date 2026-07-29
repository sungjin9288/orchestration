# AI Company Builder Rework Preflight Plan

## Purpose

Stage 5D defines the smallest execution boundary after `DEC-194`: one exact accepted
`ReworkPlan` may dispatch one local-stub Builder rework preflight against the existing Builder
WorkOrder. The preflight is read-only. It appends one durable dispatch record and one
`WorkOrderAttempt`, records one Run and one preflight Artifact, and then stops before mutation
approval.

This slice does not add a fourth WorkOrder. The reviewed-delivery graph remains Builder, Reviewer,
and QA. It also does not resolve the Reviewer decision, change the ExecutionPlan or WorkOrder,
create an Approval or WorkflowCheckpoint, mutate source, rerun Reviewer or QA, or retry a failed
preflight.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-builder-rework-preflight-planning-001` |
| `decisionStatus` | `approve-ai-company-builder-rework-preflight-planning-only` |
| `targetAuthority` | planning only for one exact accepted ReworkPlan to one bounded local Builder rework preflight dispatch using the existing Builder WorkOrder |
| `targetSurface` | docs, current schema-v23 ReworkPlanAcceptance evidence, future schema-v24 BuilderReworkDispatch and WorkOrderAttempt contracts, planning smoke, README, completion inventory, and task ledgers |
| `implementationPlanRefs` | this document |
| `runtimePath` | define one immutable BuilderReworkDispatch sidecar and one existing-Builder WorkOrderAttempt preflight boundary without implementation |
| `compatibilityPlanRefs` | preserve the exact three-WorkOrder graph and `DEC-091`, `DEC-094`, `DEC-097`, `DEC-169`, `DEC-172`, `DEC-185`, `DEC-188`, `DEC-191`, and `DEC-194` behavior |
| `migrationPlanRefs` | plan one schema-v24 `builderReworkDispatch` sequence and map plus one additive WorkOrderAttempt action without rewriting retained records |
| `sourceEvidenceRefs` | `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-169`, `DEC-172`, `DEC-185`, `DEC-188`, `DEC-191` through `DEC-194`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/127_ai-company-reviewer-rework-preview-plan.md`, `docs/129_ai-company-durable-reviewer-rework-plan.md`, `docs/131_ai-company-rework-plan-acceptance-plan.md`, `src/runtime/rework-plan-acceptances.js`, `src/runtime/rework-plans.js`, `src/runtime/work-order-attempts.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js`, and `src/execution/execution-coordinator.js` |
| `negativeEvidenceRefs` | schema v23 has accepted rework evidence but no BuilderReworkDispatch contract, exact dispatch approval, rework action, acceptance-to-attempt lineage, bounded coordinator entrypoint, exact GET, UI action, or focused smoke |
| `rollbackRefs` | remove planning-only Stage 5D docs and smoke while preserving schema-v23 runtime and every `DEC-194` record |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-builder-rework-preflight-planning.mjs`; schema/runtime/API/UI/worker smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v24 migration, BuilderReworkDispatch creation, WorkOrderAttempt append, Builder preflight execution, Approval or WorkflowCheckpoint creation, live mutation, source mutation, Reviewer or QA execution, second rework, retry recovery or resume, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors |
| `approvalStatement` | Planning only is approved for one exact accepted-ReworkPlan to bounded local Builder rework preflight path. This does not approve implementation, schema migration, attempt append, worker execution, Approval creation, source mutation, scheduling, Git, release, policy mutation, bypass, collections, or connectors. |

`DEC-195` records this planning-only boundary. `DEC-196` records the complete fielded implementation
handoff in
`docs/134_ai-company-builder-rework-preflight-implementation-decision-handoff.md`. Neither decision
authorizes schema migration, attempt append, or worker execution. A complete matching implementation
decision is reserved for `DEC-197`.

## Current Evidence And Gap

The schema-v23 runtime already proves:

- one source-current accepted StaffingPlan and immutable StaffingEntry;
- one approved local Council synthesis and current non-terminal Mission;
- one blocked ExecutionPlan with completed Builder, Reviewer `changes-requested`, and unexecuted QA;
- one exact Reviewer WorkOrderAttempt, Run, bounded review Artifact, and optional pending Decision
  Inbox evidence;
- one response-only `DEC-188` preview with inherited findings, target paths, verification commands,
  source progress digest, logical `nextAttemptNumber=2`, and one-additional-attempt cap;
- one immutable `DEC-191` ReworkPlan retaining that exact preview;
- one immutable `DEC-194` ReworkPlanAcceptance proving operator acceptance without execution
  authority.

The missing boundary is a durable, bounded dispatch from that acceptance to a no-write Builder
preflight. Reusing the original `start-builder` action would collide with replay handling. Adding a
fourth WorkOrder would widen the fixed reviewed-delivery graph and force unrelated checkpoint,
delivery, verification, and close-out changes. Adding required fields to historical WorkOrderAttempt
records would invalidate retained exact-shape and digest evidence.

## Architecture Decision

Add one immutable sidecar and one additive attempt action:

```text
source-current schema-v23 ReworkPlanAcceptance
  -> exact operator dispatch approval
  -> atomic schema-v23 to schema-v24 migration
  -> append one BuilderReworkDispatch(status=dispatched)
  -> append one active WorkOrderAttempt(action=start-builder-rework-preflight)
  -> run one local-stub no-write Builder rework preflight
  -> transition the attempt to waiting-gate or failed
  -> stop before mutation Approval creation
```

The existing Builder WorkOrder, Reviewer WorkOrder, QA WorkOrder, ExecutionPlan, Mission, task
lifecycle, Reviewer Decision Inbox item, and WorkflowCheckpoint records remain unchanged.

The two attempt numbers are different:

```text
reworkAttemptNumber=2
workOrderAttemptNumber=3
```

`reworkAttemptNumber=2` is the logical second Builder delivery round fixed by the ReworkPlan.
`workOrderAttemptNumber=3` is the next durable attempt on the existing Builder WorkOrder because
attempt #1 ran `start-builder` preflight and attempt #2 ran `continue-builder` live mutation.

## Entry Gate

The first dispatch must validate all of the following before any write:

1. state is valid schema v23 or migratable schema v23 input for v24;
2. the exact ReworkPlan and its one exact ReworkPlanAcceptance pass strict record, digest, and
   uniqueness validation;
3. recomputing the stored `DEC-188` source request reproduces every ReworkPlan and acceptance-bound
   preview, execution, attempt, review, progress, findings, target, verification, evidence, and cap
   value;
4. the ExecutionPlan is still blocked at Reviewer `changes-requested`, Builder is completed, the
   selected Reviewer attempt remains latest, QA is unexecuted, and any referenced review Decision
   Inbox item remains pending and blocking;
5. the existing Builder WorkOrder is the original position-one WorkOrder and its current canonical
   digest matches the request;
6. the Builder WorkOrder has exactly two prior attempts in order: `start-builder` #1 and
   `continue-builder` #2, both terminal, with no active plan attempt;
7. no BuilderReworkDispatch already exists for the acceptance, no overlapping active Builder attempt
   exists in the project, and the one-additional-attempt cap is unused;
8. the project provider is exactly `local-stub`; live or other provider modes fail closed;
9. the exact request and nested dispatch approval are valid and do not widen findings, paths,
   verification commands, or authority.

Exact replay is checked before source-current recomputation. That lets a completed or failed dispatch
return its existing evidence without treating the appended attempt as source drift.

## Planned State Schema V24

Schema v24 adds only:

```text
sequences.builderReworkDispatch
builderReworkDispatches
WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT
```

Migration is additive:

- preserve every valid schema-v23 value;
- initialize only the empty dispatch sequence and map;
- create no dispatch or attempt during boot, read, validation, GET, hydration, or render;
- keep every historical WorkOrderAttempt field and digest unchanged;
- validate the exact request, source lineage, prospective dispatch, prospective active attempt, and
  complete candidate state before one atomic migration-plus-two-record save;
- reject unknown future schemas and partial or semantically invalid v24 state;
- retain valid v24 evidence during rollback without downgrade or deletion.

## BuilderReworkDispatch Contract

One immutable record has exactly:

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
builderWorkOrderId
builderWorkOrderDigest
reworkPlanId
reworkPlanRecordDigest
reworkPlanAcceptanceId
reworkPlanAcceptanceDigest
sourceExecutionPlanDigest
sourceAttemptRecordDigest
reviewEvidenceDigest
sourceProgressDigest
reworkAttemptNumber
workOrderAttemptId
workOrderAttemptNumber
dispatchApproval
dispatchApprovalDigest
authoritySummary
createdAt
recordDigest
```

Fixed values are:

```text
persisted=true
status=dispatched
reworkAttemptNumber=2
workOrderAttemptNumber=3
createdAt=dispatchApproval.reviewedAt
```

`dispatchApproval` has exactly:

```text
decision=dispatch-builder-rework-preflight
acknowledgement=dispatch-one-local-no-write-rework-preflight-without-mutation-approval
rationale
reviewedAt
```

`rationale` is trimmed, non-empty, credential-safe, and at most 500 UTF-8 bytes. `reviewedAt` is an
exact ISO timestamp at or after the acceptance `createdAt` and no more than five minutes ahead of
runtime now. `dispatchApprovalDigest` covers the complete normalized approval.

`authoritySummary` has exactly:

```text
dispatchEvidenceAllowed=true
existingBuilderAttemptAppendAllowed=true
localStubPreflightAllowed=true
newWorkOrderAppendAllowed=false
executionPlanMutationAllowed=false
workOrderMutationAllowed=false
reviewDecisionResolutionAllowed=false
approvalCreationAllowed=false
approvalResolutionAllowed=false
checkpointCreationAllowed=false
sourceMutationAllowed=false
reviewerExecutionAllowed=false
qaExecutionAllowed=false
retryAllowed=false
recoveryAllowed=false
schedulingAllowed=false
providerBackedExecutionAllowed=false
memoryApplicationAllowed=false
commitAllowed=false
pushAllowed=false
releaseAllowed=false
policyMutationAllowed=false
approvalBypassAllowed=false
connectorCallAllowed=false
```

`recordDigest` covers every record field except itself. The record never stores raw Artifact or
source bodies, prompts, provider payloads, transcripts, stdout, stderr, environment values, absolute
paths, credentials, or secrets.

## WorkOrderAttempt Boundary

The implementation may extend the action enum only with:

```text
start-builder-rework-preflight
```

The command is `step`, role is `builder`, position and WorkOrder identity come from the existing
Builder WorkOrder, `attemptNumber=3`, and `sourceDigest` remains the ExecutionPlan source digest for
compatibility with retained state validation. A dedicated rework authority digest binds the
BuilderReworkDispatch, ReworkPlanAcceptance, current Builder WorkOrder digest, and exact operator
dispatch approval without changing the historical WorkOrderAttempt record shape.

The active attempt is persisted atomically with the dispatch before the coordinator runs. On
success it transitions to:

```text
status=waiting-gate
checkpointRef=null
approvalRefs=[]
stopReason=builder-rework-preflight-complete-mutation-approval-blocked
```

Its `runRefs` and `artifactRefs` contain only the one rework preflight Run and preflight Artifact.
`decisionInboxItemRefs=[]` is fixed. Malformed, blocked, widened, or decision-requiring output fails
the preflight and settles the attempt as `failed`; it does not create a Decision Inbox item or
generic Approval.

On worker failure, the attempt transitions to `failed` with the bounded Run and Artifact references
that actually exist and a redacted stop reason. Failure consumes the one dispatch cap. It does not
auto-replay or retry.

## Exact Dispatch Request

The bounded route is:

```text
POST /api/rework-plans/:reworkPlanId/builder-rework-preflight
```

The JSON body has exactly these twelve keys:

```text
reworkPlanAcceptanceId
reworkPlanRecordDigest
acceptanceDigest
sourceExecutionPlanDigest
sourceAttemptRecordDigest
sourceProgressDigest
builderWorkOrderId
builderWorkOrderDigest
reworkAttemptNumber
workOrderAttemptNumber
evaluatedAt
dispatchApproval
```

`evaluatedAt` must equal `dispatchApproval.reviewedAt`. Findings, target paths, verification
commands, evidence refs, cap, and authority summary are runtime-derived and may not be supplied by
the caller.

The first valid request creates the dispatch and active attempt, invokes the bounded local-stub
worker once, settles the attempt, and returns `201`. An exact normalized replay returns `200`,
`idempotent=true`, performs no save, and does not invoke the worker. A divergent request for the same
ReworkPlan or acceptance returns `409`.

## Coordinator Contract

The rework coordinator entrypoint is separate from the original `runBuilderPreflight()` path. It:

- receives only a validated BuilderReworkDispatch id and active WorkOrderAttempt id;
- loads the existing planner, architecture, and task-breaker provenance without rerunning those
  roles;
- passes the accepted findings, exact target allowlist, exact verification commands, ReworkPlan and
  acceptance refs, and fixed no-write authority into a dedicated rework-preflight request;
- permits only the local-stub adapter;
- runs Builder preflight exactly once;
- records one Run and one preflight Artifact;
- rejects widened targets, changed verification commands, missing findings, unsafe output, provider
  mode drift, and source writes;
- creates no Approval, Decision Inbox item, WorkflowCheckpoint, source mutation, Reviewer call, or
  QA call.

The implementation may update the Builder prompt contract, execution request builder, and local-stub
renderer only to express this third explicit `rework-preflight` mode. Existing `preflight` and
`live-mutation` modes stay byte-compatible in behavior.

## Lifecycle And Read Model

The rework attempt is an execution sidecar, not a reset of the original reviewed-delivery graph.
Across active, waiting-gate, and failed settlement:

```text
ExecutionPlan.status=blocked
ExecutionPlan.stopReason=reviewer-changes-requested
ExecutionPlan.stoppedAt=reviewer
ExecutionPlan.activeWorkOrderId=null
Builder WorkOrder.status=completed
Reviewer WorkOrder.status=changes-requested
QA WorkOrder.status=blocked-dependency
```

The exact dispatch GET is authoritative for the rework worker lifecycle. It derives only:

```text
active -> workerState=running
waiting-gate -> workerState=preflight-ready-for-separate-mutation-approval
failed -> workerState=failed-terminal-no-retry
```

Generic scheduler selection must not treat the sidecar attempt as `activeWorkOrderId`, dependency
readiness, Reviewer resolution, or permission to continue the original WorkOrder graph. An active
sidecar remains inspectable after interruption, but no read model may infer worker success, resume
it, replay it, or make the completed Builder WorkOrder active. A later mutation slice must consume
the exact waiting-gate attempt through a separate decision and must define any graph-state transition
before source mutation.

## Exact Inspection

The only new read route is:

```text
GET /api/rework-plans/:reworkPlanId/builder-rework-dispatch
```

It returns exactly:

```text
generatedAt
builderReworkDispatch
workOrderAttempt
```

The GET validates both records and their cross-reference. It is not a collection, history, search,
ranking, recommendation, automatic selection, recovery, resume, retry, or next-action endpoint. The
generic `/api/snapshot` excludes `builderReworkDispatches`.

## UI Contract

The implementation may add one `Start bounded rework preflight` command beside one exact accepted
ReworkPlan. The control must:

- require all twelve exact fields and a separate rationale;
- state that the command consumes the one preflight dispatch cap;
- clear browser-memory result on refresh, source change, input edit, or failed recomputation;
- render the dispatch, WorkOrderAttempt, Run, Artifact, and
  `mutation approval blocked` state read-only;
- expose no mutation approval, approve, retry, recover, Reviewer, QA, scheduling, commit, push, or
  release control.

## Idempotency, Interruption, And Rollback

- One acceptance may create at most one BuilderReworkDispatch.
- One dispatch binds exactly one WorkOrderAttempt #3.
- The dispatch and active attempt exist before worker invocation.
- Interruption leaves the active attempt visible; request replay does not resume it.
- Success and failure both consume the cap.
- No unchanged-progress loop is possible because no second dispatch is accepted.
- Rollback disables POST, UI command, and worker entrypoint.
- Valid v24 dispatch, attempt, Run, and Artifact evidence remains inspectable.
- Active attempts require a later separately authorized quarantine or recovery path.
- No rollback deletes evidence, rewrites source records, or downgrades schema.

## Verification Plan

Focused runtime smoke must prove:

1. valid-command-only atomic schema-v23 to v24 migration and no passive creation;
2. exact `DEC-194` acceptance lineage and fresh `DEC-188` recomputation;
3. logical rework round #2 versus WorkOrderAttempt #3;
4. one dispatch per acceptance, sequential numbering, and overlapping-active-attempt rejection;
5. active dispatch and attempt persistence before worker invocation;
6. interruption leaves inspectable active evidence and replay does not resume;
7. local-stub preflight runs once without planner, architect, or task-breaker reruns;
8. findings, target paths, and verification commands remain exact and cannot widen;
9. success becomes `waiting-gate`, failure becomes `failed`, and neither path retries;
10. fixed empty `decisionInboxItemRefs` and no Approval, Decision Inbox creation or mutation,
    WorkflowCheckpoint, ExecutionPlan mutation, WorkOrder mutation, source mutation, Reviewer call,
    or QA call;
11. exact replay saves nothing and divergent collisions fail;
12. malformed URI/body, extra/missing fields, stale digests, unsafe rationale, future time, partial
    schema, future schema, and sequence collision fail closed;
13. exact GET works and generic snapshot excludes the dispatch map;
14. repository source bytes and Git status remain unchanged;
15. `DEC-091`, `DEC-094`, `DEC-097`, `DEC-169`, `DEC-172`, `DEC-185`, `DEC-188`, `DEC-191`, and
    `DEC-194` compatibility stays green.
16. the exact dispatch read model reports `running`, `preflight-ready-for-separate-mutation-approval`,
    or `failed-terminal-no-retry` from the attempt while the blocked ExecutionPlan and original
    three WorkOrders remain unchanged.

Focused UI smoke must prove exact-gated command rendering, cap warning, stale-result clearing,
bounded failure copy, read-only result evidence, absent downstream controls, and desktop/mobile fit.

Planned implementation checks are:

```text
node scripts/smoke-ai-company-builder-rework-preflight.mjs
node scripts/smoke-ui-slice-706.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

## Still Blocked

- a fourth or replacement WorkOrder;
- live mutation Approval creation or resolution;
- Builder source mutation;
- Reviewer or QA re-execution;
- a second rework round;
- retry, recovery, resume, replay execution, or checkpoint creation;
- automatic, parallel, dynamic, autonomous, or background scheduling;
- provider-backed WorkOrder execution;
- result or memory application;
- runtime-agent commit, push, release, or external publishing;
- profile or policy mutation;
- approval bypass;
- collection, list, history, search, ranking, recommendation, or automatic selection;
- external connectors.

## Implementation Gate

Runtime, schema, API, UI, and worker changes require all fifteen fields in
`docs/134_ai-company-builder-rework-preflight-implementation-decision-handoff.md`. Planning approval,
broad approval, delegated self-approval, or continuation does not open implementation.

## Implementation Status

- Planning-only authority: accepted as `DEC-195`.
- Complete fielded implementation handoff: documented as `DEC-196`.
- Exact fielded implementation authority: accepted as `DEC-197`.
- Schema/runtime/API/UI/local-stub implementation: completed under `DEC-197`.
- Focused runtime/API/UI and compatibility verification: passed.
- Mutation Approval creation or resolution, source mutation, Reviewer or QA execution, another
  rework, retry, recovery, resume, checkpoint creation, scheduling, provider-backed execution,
  memory application, Git/release, policy mutation, collections, approval bypass, and connectors
  remain blocked.
