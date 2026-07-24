# AI Company Operator-Stepped WorkOrder Scheduler Plan

## Purpose

이 문서는 `docs/113_ai-company-multi-agent-completion-plan.md` Stage 3의 first vertical slice를
계획한다. 대상은 one exact source-current schema-v18 StaffingEntry-bound CouncilSession이
operator approval로 terminal `approved`에 도달한 뒤, existing Builder -> Reviewer -> QA
ExecutionPlan을 durable하게 만들고 매 command마다 dependency-ready WorkOrder 하나만
`start` 또는 `step`하는 local deterministic path다.

이 문서는 runtime implementation authority가 아니다. Planning과 complete fielded decision
handoff만 허용하며 schema-v19 migration, WorkOrderAttempt persistence, bound WorkOrder
compilation, dispatch, API/UI mutation, source mutation, Git, release authority를 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-operator-stepped-workorder-scheduler-planning-001` |
| `decisionStatus` | `approve-ai-company-operator-stepped-workorder-scheduler-planning-only` |
| `targetAuthority` | planning only for one deterministic local operator-stepped WorkOrder scheduler from one approved schema-v18 StaffingEntry-bound Council synthesis |
| `targetSurface` | docs plus existing schema-v18 StaffingEntry, CouncilSession, ExecutionPlan, WorkOrder, WorkflowCheckpoint, local execution coordinator, API, UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-163`, `DEC-166`, `DEC-169`, `docs/60_ai-company-workorder-persistence-execution-plan.md`, `docs/62_ai-company-reviewed-delivery-planning-plan.md`, `docs/64_ai-company-checkpoint-resume-recovery-plan.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/115_ai-company-staffing-entry-binding-plan.md`, `src/runtime/contracts.js`, `src/runtime/mission-workorder-compiler.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js`, `src/execution/execution-coordinator.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | bound Council sessions are rejected by WorkOrder preview and persistence, the existing start path selects one fixed Builder and the reviewed-delivery route can run Builder Reviewer and QA in one request, no WorkOrderAttempt sequence map contract digest or exact inspection exists, no generic dependency-ready selector exists, no bound operator step route or control exists, and restart-safe active-attempt reconciliation remains absent |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable only future bound WorkOrder plan and operator start/step entrypoints, preserve valid schema-v19 attempt and source evidence without downgrade, leave non-terminal attempts inspect-only and blocked, preserve schema-v18 Council and historical unbound WorkOrder behavior, and rerun focused plus aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-operator-stepped-workorder-scheduler-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v19 migration, durable WorkOrderAttempt creation or transition, bound ExecutionPlan or WorkOrder creation and dispatch, operator start or step, solo execution, parallel specialists, retry/rework, provider-backed WorkOrders, background scheduling, source mutation, runtime-agent commit/push/release, memory or policy mutation, approval bypass, lifecycle deletion, external connectors |
| `approvalStatement` | The delegated non-critical planning authority approves this Stage 3 plan and complete fielded handoff only. Architecture-sensitive schema, runtime, API, UI, durable attempt, or dispatch implementation requires the separate decision in `docs/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff.md`. |

## Current Baseline

- Runtime state is schema v18 with immutable accepted StaffingPlan and StaffingEntry records.
- A bound real-local-stub CouncilSession can reach terminal `approved`; its Mission becomes
  `aligned` and remains without a linked task.
- `getMissionWorkOrderCompilerInput` and `persistMissionWorkOrderPlan` reject every session carrying
  `staffingEntryRef`.
- The existing compiler deterministically creates exactly three sequential WorkOrders: Builder,
  Reviewer, and QA, with explicit dependencies and HandoffPackets.
- Existing plan persistence creates one linked control task and one digest-bound `execution-plan`
  approval before local sequential start.
- Existing `/start-sequential` selects one queued Builder, runs the planner/architect/task-breaker/
  Builder-preflight chain, and stops at the targeted Builder live-mutation approval.
- Existing reviewed-delivery continuation exposes separate runtime functions for Builder, Reviewer,
  and QA, but one API request can call all remaining roles without an operator step between them.
- WorkflowCheckpoint records already represent Builder waiting-gate, Reviewer-ready, QA-ready, and
  delivery-ready boundaries.
- No `WorkOrderAttempt` durable object records a role command before execution or binds its terminal
  evidence after execution.

## Architecture Decision

Reuse the current linear ExecutionPlan, WorkOrder, HandoffPacket, approval, execution coordinator,
and WorkflowCheckpoint contracts. Add only one durable attempt lifecycle and one deterministic
selector around them.

```text
accepted StaffingPlan
  -> bound StaffingEntry
  -> approved terminal CouncilSession
  -> exact response-only WorkOrder preview
  -> durable ExecutionPlan + Builder/Reviewer/QA + existing plan approval
  -> operator start
       -> deterministic dependency-ready Builder
       -> WorkOrderAttempt(active -> waiting-gate | failed)
  -> exact Builder live-mutation approval
  -> operator step
       -> Builder attempt(active -> completed | failed)
       -> reviewer-ready checkpoint
  -> operator step
       -> Reviewer attempt(active -> completed | changes-requested | failed)
       -> qa-ready checkpoint or blocked
  -> operator step
       -> QA attempt(active -> completed | failed)
       -> delivery-ready checkpoint or blocked
```

There is no timer, polling worker, recursive continuation, background queue, implicit retry, or
multi-role API request in this slice.

## Exact Source Gate

Before preview, persistence, start, or step, runtime must load one state and prove:

1. the Mission, Project, StaffingPlan, StaffingEntry, and CouncilSession exist in the same project;
2. `Mission.staffingEntryId`, `Mission.councilSessionId`, `StaffingEntry.staffingPlanId`, and
   `StaffingEntry.councilSessionId` form the exact stored chain;
3. the StaffingPlan and StaffingEntry canonical record digests recompute;
4. the StaffingPlan remains accepted, council-mode, local-stub, source-current, and selected for the
   current CompanyBlueprint and nine role sources;
5. the CouncilSession is `mode=real-local-stub`, terminal `approved`, with
   `alignment.action=approve`, `alignment.status=approved`, and matching `staffingEntryRef`;
6. the current Council attempt reached human alignment and has one normalized synthesis;
7. the Mission is `aligned`, has no linked task before plan persistence, and has not been closed;
8. the compileSpec is exact, bounded, and valid under the existing compiler.

The bound session guard may open only after all eight checks pass. Historical unbound sessions retain
their current behavior.

## Schema v19

Schema v19 adds only:

```text
sequences.workOrderAttempt: number
workOrderAttempts: Record<string, WorkOrderAttempt>
```

No existing StaffingPlan, StaffingEntry, CouncilSession, ExecutionPlan, WorkOrder, HandoffPacket,
WorkflowCheckpoint, Run, Artifact, Approval, task, or Mission record is rewritten during migration.

### WorkOrderAttempt

```text
WorkOrderAttempt
  id
  persisted=true
  executionPlanId
  workOrderId
  missionId
  projectId
  staffingPlanId
  staffingEntryId
  councilSessionId
  role
  position
  attemptNumber
  command=start|step
  action=start-builder|continue-builder|run-reviewer|run-qa
  status=active|waiting-gate|completed|changes-requested|failed
  sourceDigest
  workOrderDigest
  dependencyDigest
  authorityDigest
  checkpointRef
  approvalRefs[]
  runRefs[]
  artifactRefs[]
  decisionInboxItemRefs[]
  stopReason
  startedAt
  completedAt
  recordDigest
```

An attempt is created as `active` and saved before the execution coordinator is called. It may make
one validated transition to a terminal or waiting-gate state after the command returns. A terminal or
waiting-gate attempt is never reused, deleted, or rewritten. If the process exits while an attempt is
`active`, every later start/step is rejected; Stage 6 recovery must separately decide how to
reconcile or quarantine it.

`recordDigest` covers the complete current record excluding only `recordDigest`. Transition updates
must recompute it atomically with WorkOrder, ExecutionPlan, checkpoint, run, artifact, approval, and
inbox refs produced by that one command.

## Deterministic Dependency-Ready Selection

The scheduler uses one pure selector:

1. load all WorkOrders named by the ExecutionPlan;
2. reject missing, duplicate, foreign-plan, cyclic, or terminal-plan graphs;
3. reject if any WorkOrderAttempt for the plan is `active`;
4. consider only WorkOrders whose status matches the current checkpoint boundary;
5. require every `dependencyId` to reference a `completed` WorkOrder;
6. sort ready candidates by numeric `position`, then stable WorkOrder id;
7. select exactly the first candidate;
8. require the operator's `expectedWorkOrderId` and action to match that candidate and boundary.

The selector does not infer an action from UI state. A stale expected id, digest, checkpoint, status,
or approval returns `409` before creating an attempt.

Only one active attempt is allowed per ExecutionPlan. Builder target paths are additionally
serialized per project: another active Builder attempt with an overlapping target allowlist blocks
start or step. Reviewer and QA remain sequential in this slice even though they are read-only.

## Command Boundaries

### Plan Preview And Persistence

The existing WorkOrder preview and persistence shapes are reused after the exact bound source gate.
The response-only preview remains no-write. Persistence retains the current exact previewId,
sourceDigest, compileSpec, linked control task, and separate Decision Inbox approval.

Bound plans add no implicit approval. The existing plan approval must be resolved to `approved`
before `start`.

### Start

`start` is allowed once for an approved bound ExecutionPlan. It:

1. recomputes the exact source and plan approval;
2. selects dependency-ready Builder through the generic selector;
3. creates and saves one active WorkOrderAttempt;
4. invokes the existing local-stub preflight chain;
5. records exact run, artifact, approval, and inbox refs;
6. transitions the attempt to `waiting-gate` only when the existing targeted live-mutation approval
   is pending;
7. otherwise transitions it to `failed` and blocks the plan.

Start does not execute live mutation, Reviewer, or QA.

### Step

`step` accepts one exact action and executes one role boundary only:

| Current boundary | Required action | Result |
| --- | --- | --- |
| Builder waiting-gate + exact approved live-mutation approval | `continue-builder` | complete Builder and stop at reviewer-ready |
| Reviewer-ready checkpoint | `run-reviewer` | complete Reviewer and stop at qa-ready, or block on changes-requested |
| QA-ready checkpoint | `run-qa` | complete QA and stop at delivery-ready, or block on failed QA |

Each successful step returns after one role. The client must issue another explicit step for the next
role. Existing AcceptanceCriterion and VerificationProof gates remain authoritative before Reviewer.

## API Contract

Existing bound-capable routes:

```text
POST /api/council-sessions/:councilSessionId/work-order-preview
POST /api/council-sessions/:councilSessionId/work-order-plans
GET  /api/execution-plans/:executionPlanId
POST /api/execution-plans/:executionPlanId/start-sequential
```

New exact routes:

```text
POST /api/execution-plans/:executionPlanId/step
GET  /api/work-order-attempts/:workOrderAttemptId
```

The step body contains only:

```text
action
expectedWorkOrderId
sourceDigest
checkpointId
checkpointDigest
inputDigest
authorityDigest
terminalGateApprovalId
evaluatedAt
```

`terminalGateApprovalId` is non-null only for `continue-builder`. Start keeps the existing exact plan
approval input. Request bodies are bounded at transport and runtime boundaries.

## UI Contract

The Council/Mission thread may expose:

- read-only bound StaffingEntry and approved Council source evidence;
- exact WorkOrder preview and persistence controls after Council approval;
- existing plan approval status;
- one `Start` command before the first attempt;
- one `Step` command naming the exact next role and checkpoint after each durable boundary;
- read-only attempt id, role, status, evidence refs, and stop reason;
- blocked explanations for stale source, pending approval, active unknown attempt,
  changes-requested, failed QA, provider mode, or downstream authority.

The UI must not show auto-run, run-all, background, parallel, retry, rework, provider, commit, push,
or release controls. Browser state cannot select or execute a different WorkOrder than the server
returns as dependency-ready.

## Failure And Idempotency

- Invalid source, graph, approval, checkpoint, action, expected WorkOrder, or digest creates no
  attempt and writes no state.
- Repeating an exact completed command returns its existing attempt and current bundle without a new
  save.
- A divergent replay returns `409`.
- Coordinator failure after active-attempt save transitions that attempt to `failed` when the same
  process can reconcile the failure; the plan and WorkOrder become blocked.
- Process loss while active remains an inspectable active attempt and blocks all further scheduling.
- `changes-requested` records the Reviewer attempt and blocks; it does not create a ReworkPlan.
- QA failure records the QA attempt and blocks; it does not retry.
- No error path silently advances a dependency, consumes the next checkpoint, or invokes another
  role.

## Compatibility

- Schema-v18 to v19 migration is additive and creates no attempt during boot, read, render, preview,
  or migration.
- Every valid schema-v18 value is preserved.
- Unknown future schema and partial or semantically invalid v19 state fail closed.
- Historical unbound Council, existing DEC-091 sequential start, DEC-094 reviewed delivery,
  DEC-097 checkpoint recovery, proof, package, close-out, learning, memory, Growth, source-mutation,
  commit, and release paths retain current behavior outside the bound branch.
- Provider-backed Council and WorkOrder execution remain unsupported by this scheduler.
- CompanyBlueprint and role source files are not mutated.

## Rollback

1. Disable bound WorkOrder preview/persistence plus operator start/step UI and POST entrypoints.
2. Stop creating or transitioning new WorkOrderAttempts.
3. Preserve valid schema-v19 records and every source record without downgrade or deletion.
4. Render active, failed, waiting-gate, and terminal attempts as read-only blocked evidence.
5. Preserve schema-v18 StaffingEntry inspection and alignment-only Council behavior.
6. Preserve historical unbound WorkOrder behavior.
7. Rerun migration, focused runtime/API/UI, README, inventory, UI QA, and aggregate verification.

## Focused Verification Contract

Future implementation smoke must prove:

- atomic schema-v18 to v19 migration with no boot/read/preview side effect;
- exact bound StaffingPlan, StaffingEntry, CouncilSession, Mission, blueprint, role-source, and
  compileSpec recomputation;
- unchanged response-only preview and separate plan approval;
- deterministic dependency-ready selection independent of hard-coded active role;
- one active attempt saved before each coordinator command;
- one command executes one role only;
- Builder targeted live-mutation approval remains mandatory;
- Reviewer and QA stop at separate checkpoints;
- exact replay, divergent replay, reload, stale input, active-attempt, overlap, failure, crash-marker,
  changes-requested, and QA-failed behavior;
- no implicit retry, rework, parallelism, provider call, background loop, source mutation, Git,
  release, memory/policy mutation, bypass, or connector action;
- historical DEC-091, DEC-094, DEC-097, unbound Council, provider Council, and schema-v18 evidence
  compatibility;
- desktop and mobile UI fit with truthful disabled controls.

## Still Blocked

- schema-v19 implementation until a complete fielded decision is accepted;
- solo StaffingEntry and solo role execution;
- parallel Researcher or specialist cells;
- automatic retry, Reviewer rework, or attempt cap policy;
- active-attempt restart reconciliation and Ops supervision commands;
- provider-backed WorkOrder execution or provider expansion;
- dynamic staffing or profile mutation;
- Mission memory context application;
- source mutation expansion, runtime-agent commit, push, or release;
- background, timer, recursive, autonomous, or cross-project scheduling;
- approval bypass, lifecycle update/delete, or external connectors.

## Decision Boundary

Planning-only authority is recorded as `DEC-170`. The complete fielded implementation decision
handoff is recorded as `DEC-171`.

Neither decision implements schema v19, creates a WorkOrderAttempt, enables bound WorkOrder
compilation, dispatches a role, changes API/UI behavior, mutates source, or performs Git/release
actions.
