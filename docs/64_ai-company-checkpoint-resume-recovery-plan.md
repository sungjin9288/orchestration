# AI Company Checkpoint Resume And Recovery Plan

## Purpose

이 문서는 `DEC-094`의 schema-v7 reviewed-delivery pass-path가 process restart 사이에도 증거를
잃거나 mutation을 중복 실행하지 않도록, one local-stub ExecutionPlan에 durable checkpoint와
operator-triggered safe resume을 추가하는 Phase 7 최소 vertical slice를 정의한다. `DEC-097`이
승인한 구현은 이 계약을 schema v8 runtime, API, UI, focused evidence에 적용하며 provider contract와
project source authority는 넓히지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-checkpoint-resume-recovery-planning-001` |
| `decisionStatus` | `approve-ai-company-checkpoint-resume-recovery-planning-only` |
| `targetAuthority` | planning only for one explicit local-stub schema-v8 checkpoint and operator-triggered resume path for one existing schema-v7 reviewed-delivery ExecutionPlan at a durable safe boundary |
| `targetSurface` | docs plus the existing schema-v7 ExecutionPlan/WorkOrder/HandoffPacket records, reviewed-delivery runtime, Decision Inbox evidence, local-stub execution coordinator, Execution UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `DEC-091`, `DEC-094`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/60_ai-company-workorder-persistence-execution-plan.md`, `docs/62_ai-company-reviewed-delivery-planning-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js`, `scripts/serve-ui-slice-01.mjs` |
| `negativeEvidenceRefs` | schema v7 has no WorkflowCheckpoint sequence or map, reviewed-delivery is one synchronous API chain, no durable stage-boundary digest or attempt history exists, interrupted active Builder/Reviewer/QA state cannot be classified safely, and no recovery status/resume/cancel API, UI, or focused restart smoke exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable recovery/resume/cancel entrypoints, quarantine non-terminal checkpoints without deleting them, preserve schema-v8 and existing schema-v7 evidence, keep DEC-091/DEC-094 inspection paths available, and never downgrade state or replay an uncertain mutation |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v8 implementation, checkpoint persistence, resume or cancel execution, automatic replay/retry/rework, active Builder mutation reconciliation, parallel/dynamic/autonomous scheduling, provider-backed WorkOrders, provider expansion, durable DeliveryPackage, Mission done, memory/profile/policy mutation, approval bypass, runtime-agent commit/push/release, external connectors |
| `approvalStatement` | The operator approves planning only for one durable safe-boundary checkpoint and explicit local-stub resume path. Implementation, schema migration, replay, scheduling, and every downstream authority require a later complete fielded decision. |

## Accepted Implementation Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-checkpoint-resume-recovery-implementation-001` |
| `decisionStatus` | `approve-ai-company-checkpoint-resume-recovery-implementation-slice` |
| `targetAuthority` | one local deterministic schema-v8 WorkflowCheckpoint path and one explicit operator resume or cancel path for a source-current reviewed-delivery ExecutionPlan at reviewer-ready or qa-ready only |
| `runtimePath` | migrate valid schema v7 evidence additively, append digest-bound durable boundaries, classify recovery read-only, and execute only one exact local-stub Reviewer or constrained QA resume before the next checkpoint |
| `focusedSmokeRefs` | `scripts/smoke-ai-company-checkpoint-resume-recovery.mjs`, `scripts/smoke-ui-slice-656.mjs` |
| `stillBlockedAuthorities` | Builder replay, automatic retry/rework, scheduling, provider-backed WorkOrders, durable DeliveryPackage, Mission done, memory/profile/policy mutation, approval bypass, runtime-agent commit/push/release, and external connectors |

## Current Baseline Evidence

- `DEC-091` persists one schema-v7 ExecutionPlan, three WorkOrders, handoffs, linked task, and exact
  plan approval. `DEC-094` can continue that plan through bounded Builder mutation, independent
  Reviewer, constrained QA, and a response-only DeliveryPackage.
- The current `POST /api/execution-plans/:executionPlanId/continue-reviewed-delivery` handler runs the remaining
  stages as one synchronous request. Durable WorkOrder transitions exist, but no checkpoint record
  says which completed boundary is safe to resume after a process restart.
- A restart while Builder is `active` is ambiguous: source mutation may have started or completed
  before WorkOrder reconciliation. Re-running Builder could duplicate or overwrite an approved
  mutation, so this state cannot be treated as resumable.
- A restart while Reviewer or QA is `active` can also leave a completed run that was not reconciled.
  Starting a second run without inspection would break idempotency and provenance.
- Existing `runRefs`, `artifactRefs`, approval metadata, source digest, compile-spec digest, and
  WorkOrder dependency state are sufficient inputs for a deterministic recovery classifier, but no
  runtime function currently derives or persists that classifier.

## Architecture Choice

The Phase 7 implementation is a safe-boundary recovery path, not a scheduler or crash replay engine.

```text
schema-v7 reviewed-delivery evidence
-> migrate additively to schema v8
-> append one digest-bound WorkflowCheckpoint at a durable boundary
-> restart and recompute current input/authority digests
-> classify ready | stale | quarantined | terminal
-> require an explicit operator resume or cancel request
-> resume only reviewer-ready or qa-ready in local-stub mode
-> append attempt/checkpoint evidence
-> stop at the next durable boundary
```

No checkpoint automatically starts work on process boot, API read, UI render, approval resolution,
or timeout. The runtime must prefer a false-negative stop over duplicate mutation or provider work.

## Safe Checkpoint Boundaries

The implementation creates checkpoints only at these source-backed boundaries:

| Stage | Required durable evidence | Allowed action |
| --- | --- | --- |
| `builder-waiting-gate` | Builder `waiting-gate`, exact pending/approved terminal mutation approval, preflight run/artifact refs | inspect only; existing exact reviewed-delivery continue path remains authoritative |
| `reviewer-ready` | Builder `completed`, exact mutation run plus change-summary/patch/diff refs, Reviewer `queued` | `resume-reviewer` |
| `qa-ready` | Reviewer `completed` with passed review artifact, no blocking decision, QA `queued` | `resume-qa` |
| `delivery-ready` | all WorkOrders completed and QA evidence passed | terminal inspection only |

These states are never resumable in the first slice:

- Builder, Reviewer, or QA `active` after restart;
- Builder `waiting-gate` without the exact approval/preflight chain;
- Reviewer `changes-requested` or a pending blocking decision;
- QA `failed`, blocked, cancelled, stale, corrupt, or partial records;
- source, compile-spec, policy, role authority, WorkOrder graph, or evidence-ref digest mismatch.

An interrupted `active` stage is `quarantined`, not retried. The UI must direct the operator to
inspect runs, artifacts, source state, and approvals before a later reconciliation decision.

## State Schema v8

`DEC-097` authorizes one additive migration from schema v7 to schema v8:

```text
sequences.workflowCheckpoint
workflowCheckpoints{}
executionPlans[*].checkpointRefs[]
executionPlans[*].latestCheckpointId
```

Migration requirements:

- Valid schema-v7 state gains the sequence/map without rewriting existing domain values. Plans outside
  an exact durable boundary gain empty refs; an exact Builder waiting, Reviewer-ready, QA-ready, or
  delivery-ready boundary gains one deterministic bootstrap checkpoint.
- Existing Mission, Council, plan, WorkOrder, handoff, task, run, artifact, inbox, approval, proposal,
  and source evidence remains value-equivalent except for additive checkpoint defaults.
- Unknown future schemas and partial schema-v8 checkpoint records fail closed.
- Migration and checkpoint append use atomic file-store saves.
- Rollback preserves schema-v8 records and never downgrades or deletes checkpoint history.

## WorkflowCheckpoint Contract

```text
id
projectId
missionId
executionPlanId
workflowType = reviewed-delivery
stage = builder-waiting-gate | reviewer-ready | qa-ready | delivery-ready
attempt
status = ready | consumed | stale | cancelled | quarantined | terminal
sourceDigest
inputDigest
authorityDigest
checkpointDigest
completedUnitRefs[]
pendingUnitRefs[]
failedUnitRefs[]
runRefs[]
artifactRefs[]
approvalRefs[]
nextAllowedActions[]
resumedFromCheckpointId
stopReason
createdAt
updatedAt
```

- Identity, stage, digests, refs, attempt number, and creation time are immutable after append.
- Consuming or cancelling a checkpoint records a durable terminal disposition and creates no hidden
  replacement work. Stale and quarantined are read-only recovery classifications and do not rewrite
  checkpoint evidence.
- A resume appends a new attempt checkpoint; it does not erase or rewrite the parent evidence.
- Raw provider output, source content, environment values, credentials, or chain-of-thought are
  excluded.

## Digest And Authority Binding

- `inputDigest` hashes source digest, compile-spec digest, stage, ordered WorkOrder/dependency state,
  and the exact completed run/artifact/approval refs required by that stage.
- `authorityDigest` hashes the normalized local-stub mode, role/agent assignments, per-WorkOrder
  authority, target allowlists, verification commands, stop conditions, plan non-goals, and the
  single allowed next action.
- `checkpointDigest` hashes the immutable checkpoint payload and parent checkpoint ref.
- Resume requires exact `checkpointId`, `checkpointDigest`, `inputDigest`, and `authorityDigest`.
- Any current recomputation mismatch marks the checkpoint stale and performs no run, provider call,
  source mutation, or downstream transition.

## Resume Stale And Cancel Rules

- Resume is operator-triggered, one checkpoint at a time, and local-stub-only.
- `reviewer-ready` may start only the existing independent Reviewer path. It stops on
  changes-requested, decision creation, failure, or the next `qa-ready` boundary.
- `qa-ready` may start only the existing constrained Node.js syntax QA path. It stops on failure or
  the terminal `delivery-ready` boundary.
- A repeated request for a consumed checkpoint returns the linked result idempotently and creates no
  duplicate run, artifact, or checkpoint.
- Cancellation records a terminal checkpoint disposition and blocks later resume from that exact
  checkpoint. It deletes no plan, WorkOrder, run, artifact, approval, or source evidence.
- Stale and quarantined checkpoints are inspectable only. They require a new explicit operator
  decision before any reconciliation or new attempt.

## Runtime And API Plan

The accepted implementation opens only:

```text
GET  /api/execution-plans/:executionPlanId/recovery
POST /api/execution-plans/:executionPlanId/resume-from-checkpoint
POST /api/execution-plans/:executionPlanId/cancel-checkpoint
```

The GET route is read-only and may recompute freshness without mutating state. Resume and cancel
require the exact checkpoint and digest tuple. The current Phase 4 preview, Phase 5 persistence/start,
and Phase 6 continue/delivery-preview routes remain unchanged.

## UI Boundary

- Add one recovery register under Execution showing latest checkpoint, stage, attempt, freshness,
  stop reason, completed/pending units, and exact next allowed action.
- Enable `Reviewer 재개` or `QA 재개` only for a current `ready` checkpoint with matching digests.
- Add an explicit cancel command with checkpoint id/digest confirmation.
- Show active/ambiguous interruption as `격리됨`; do not label it retryable or ready.
- Do not add auto-resume, retry count controls, parallel scheduling, provider selection, Builder
  replay, rework, Mission done, commit, push, release, or checkpoint deletion.

## Compatibility And Migration

- Preserve every schema-v7 value and the DEC-091/DEC-094 route behavior.
- Preserve response-only DeliveryPackage recomputation and standalone task/Council routes.
- Reject provider-backed WorkOrder recovery in this first slice.
- Add no provider adapter, prompt, CompanyBlueprint, AgentProfile, Council, pack, memory, commit, or
  release contract changes.
- Existing states with no ExecutionPlan or no checkpoint remain valid after additive migration.

## Focused Verification Plan

`scripts/smoke-ai-company-checkpoint-resume-recovery.mjs` proves:

- atomic v7-to-v8 migration, valid reload, partial/future-schema rejection, and rollback retention;
- deterministic checkpoint and digest generation at every allowed boundary;
- restart from `reviewer-ready` and `qa-ready` without duplicate completed units;
- exact digest/authority binding, stale classification, idempotent replay, and attempt history;
- active Builder/Reviewer/QA quarantine with no replay or source mutation;
- cancellation retention and no checkpoint deletion;
- local-stub-only Reviewer/QA reuse and next-boundary stop;
- compatibility with DEC-091, DEC-094, response-only delivery, standalone task, and Council paths;
- no durable DeliveryPackage, Mission done, memory, autonomous scheduling, commit, push, release, or
  connectors.

`scripts/smoke-ui-slice-656.mjs` proves read-only recovery status, exact-gated resume/cancel,
stale/quarantine rendering, safe API errors, reload evidence, blocked downstream controls, and
desktop/mobile fit. Aggregate verification remains `node scripts/verification_status.mjs`.

## Rollback Plan

1. Disable resume/cancel entrypoints and UI commands; keep recovery inspection read-only where safe.
2. Stop new attempts. Never replay an `active`, stale, corrupt, or quarantined checkpoint.
3. Mark resumable non-terminal checkpoints quarantined with rollback evidence.
4. Preserve schema-v8 state, checkpoint attempts, plan/WorkOrder/task/run/artifact/inbox/approval
   evidence, source changes, and response-only package behavior.
5. Do not downgrade schema, delete checkpoints, or infer that an uncertain mutation did not happen.
6. Rerun migration, restart, focused compatibility, UI, and aggregate verification.

## Implementation Target Surface

The accepted implementation opens only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/workflow-checkpoints.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
scripts/smoke-ui-slice-656.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Documentation, README, task ledgers, and verifier pins may change only to keep evidence current.
Execution/provider adapters, QA runner, CompanyBlueprint, roles, prompts, packs, commit/release
coordinators, and project source files remain out of scope.

## Implementation Sequence

1. Add pure checkpoint normalization/digest/classification and additive schema-v8 migration.
2. Append exact boundary checkpoints from existing durable reviewed-delivery transitions.
3. Add read-only recovery status and exact stale/quarantine classification.
4. Add explicit Reviewer-ready and QA-ready resume plus cancel dispositions.
5. Add recovery UI with no auto-resume or Builder replay controls.
6. Add migration/restart/runtime/API/UI/compatibility smokes.
7. Run browser QA, adversarial replay review, rollback review, and aggregate verification.

## Acceptance Criteria

1. Invalid or stale input changes no execution state and starts no run.
2. Valid v7 state migrates additively without losing or rewriting existing evidence.
3. Only exact current `reviewer-ready` or `qa-ready` checkpoints can resume.
4. Completed units are never executed twice after restart or repeated requests.
5. Any interrupted active stage is quarantined and never automatically replayed.
6. Resume appends inspectable attempt history and stops at the next durable boundary.
7. Cancel/stale/quarantine evidence survives reload and rollback.
8. DEC-091/DEC-094, response-only delivery, standalone task, and Council paths remain compatible.
9. Durable package, Mission done, scheduling/provider/memory/commit/push/release remain unavailable.
10. Focused runtime/API/UI gates and aggregate verification pass.

## Exclusions

- Builder live-mutation replay or uncertain source reconciliation
- automatic retry/rework, process boot resume, background worker, or scheduler
- parallel, dynamic, autonomous, or provider-backed WorkOrder execution
- durable DeliveryPackage, Mission done, close-out, commit, push, or release
- memory/checkpoint promotion into organizational learning
- profile/policy mutation, approval bypass, external connectors, or multi-user coordination

## Implementation Status

- Planning authority: accepted as `DEC-095`
- Implementation decision handoff: documented as `DEC-096`
- Schema/runtime/API/UI implementation: accepted and implemented as `DEC-097`
- Current runtime: schema v8 with additive WorkflowCheckpoint records and explicit recovery entrypoints
- Only current `reviewer-ready` or `qa-ready` checkpoints can resume; active stages remain quarantined
- Every listed exclusion and downstream authority remains blocked

## Verification

```bash
node scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/smoke-ui-slice-656.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
