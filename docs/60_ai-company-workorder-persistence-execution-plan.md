# AI Company WorkOrder Persistence And Sequential Execution Plan

## Purpose

이 문서는 `DEC-088`의 response-only Mission compiler 결과를 first-class durable records로 승격하고,
digest-bound operator approval 뒤 첫 Builder WorkOrder만 기존 execution gate로 순차 dispatch하는
Phase 5 최소 vertical slice를 정의한다. 이 planning-only 문서는 runtime, schema, API, UI 또는
provider behavior를 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-workorder-persistence-execution-planning-001` |
| `decisionStatus` | `approve-ai-company-workorder-persistence-execution-planning-only` |
| `targetAuthority` | planning only for one durable ExecutionPlan and WorkOrder record set, one digest-bound operator approval, and one sequential Builder dispatch that stops at the existing live-mutation approval gate |
| `targetSurface` | docs plus the existing schema v6 store, Mission compiler preview, task-owned approval gate, local-stub execution coordinator, Council/Execution UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/mission-workorder-compiler.js`, `src/runtime/runtime-service.js`, `src/execution/execution-coordinator.js`, `scripts/serve-ui-slice-01.mjs` |
| `negativeEvidenceRefs` | persisted state is schema v6 with no ExecutionPlan, WorkOrder, or HandoffPacket maps or sequences; no plan approval scope or sequential WorkOrder coordinator exists; the current preview is response-only; Reviewer and QA WorkOrders have no independent Phase 5 execution path |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable persistence and start entrypoints, stop new dispatch, quarantine non-terminal plan records without deleting evidence, preserve linked task/run/artifact/approval records, and keep the Phase 4 response-only preview available |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema migration implementation, durable records, plan approval creation, WorkOrder dispatch or execution, Reviewer/QA execution, parallel or autonomous scheduling, provider expansion, memory/checkpoint expansion, source mutation, approval bypass, runtime-agent commit/push/release, external connectors |
| `approvalStatement` | The operator approves planning only for one schema-v7 durable plan path and one approval-gated local sequential Builder dispatch. Implementation and every downstream authority require a later complete fielded decision. |

## Current Baseline Evidence

- `DEC-088` compiles one source-current approved Real Council synthesis plus exact operator
  `compileSpec` into a deterministic deeply frozen response-only preview.
- `createEmptyState()` and file-store normalization remain at `schemaVersion: 6` and contain no
  ExecutionPlan, WorkOrder, or HandoffPacket collections or sequences.
- Existing approvals are task-owned, appear in Decision Inbox, and can bind an allowed next action
  plus metadata. Builder live-mutation approvals additionally bind an exact preflight artifact/run.
- `runMissionAlignmentAutoChain()` already provides a local-first sequential compatibility path:
  planner -> architect -> task-breaker -> builder-preflight -> live-mutation approval.
- Existing builder live-mutation and reviewer paths remain separate and already enforce their own
  provider, provenance, path, mutation, and review gates.
- There is no independent QA execution runtime. Treating the inert QA draft as executable would
  silently pull Phase 6 authority into Phase 5.

## Architecture Choice

The first durable slice reuses the existing task and approval substrate instead of adding a general
scheduler.

1. Recompute the Phase 4 preview from source-current repository records and exact `compileSpec`.
2. Require exact `previewId` and `sourceDigest` from the operator-visible preview.
3. Atomically persist one ExecutionPlan, three WorkOrders, three HandoffPackets, one linked control
   task, and one pending task-owned plan approval.
4. Bind the approval metadata to `executionPlanId`, `previewId`, and `sourceDigest` with
   `allowedNextAction=start-workorder-sequential-execution`.
5. After that approval is explicitly accepted, require a separate start command.
6. Dispatch only the dependency-ready Builder WorkOrder through the existing local-stub auto-chain.
7. Stop at the existing builder live-mutation approval. Do not mutate source or dispatch Reviewer/QA.

This is durable orchestration evidence, not a generalized WorkOrder scheduler.

## Planned State Schema v7

The implementation decision may authorize one additive migration from schema v6 to schema v7:

```text
sequences.executionPlan
sequences.workOrder
sequences.handoffPacket
executionPlans{}
workOrders{}
handoffPackets{}
```

Migration requirements:

- Loading a valid schema v6 state initializes the three sequences and maps and returns schema v7.
- Existing missions, Council sessions, projects, tasks, runs, artifacts, inbox items, approvals, and
  proposal records remain byte-equivalent at the JSON value level except for additive defaults.
- Unknown future major schema versions fail closed; partial v7 records do not normalize silently.
- One save writes the complete record set, linked task, and pending approval atomically.
- Reload preserves IDs, source digest, dependency order, approval refs, and blocked states.

## Record Contracts

### ExecutionPlan Record

```text
id
projectId
missionId
councilSessionId
previewId
sourceDigest
compileSpecDigest
status = pending-approval | approved | active | blocked | rejected | completed | cancelled
workOrderIds[]
handoffPacketIds[]
controlTaskId
approvalId
activeWorkOrderId
createdAt
updatedAt
```

### WorkOrder Record

```text
id
executionPlanId
missionId
role = builder | reviewer | qa
assignedAgentId
position
title
intent
status = pending-approval | queued | active | waiting-gate | blocked-dependency | completed | cancelled
dependencyIds[]
targetPathAllowlist[]
expectedArtifacts[]
acceptanceCriteria[]
verificationCommands[]
stopConditions[]
handoffPacketId
linkedTaskId
runRefs[]
artifactRefs[]
sourceDigest
authority
createdAt
updatedAt
```

### HandoffPacket Record

The persisted packet retains the normalized Phase 4 contract, exact sender/receiver agent refs,
evidence refs, expected output, authority boundary, stop conditions, and source digest. It does not
store prompts, chain-of-thought, credentials, provider payloads, or mutable source content.

## Approval Contract

- Persistence creates one pending task-owned approval with `scope=execution-plan`.
- `allowedNextAction=start-workorder-sequential-execution` is valid only with exact plan, preview,
  source-digest, and control-task metadata.
- Approval resolution uses the existing Decision Inbox action path.
- Approval updates only the matching plan and its first dependency-ready WorkOrder.
- Rejection moves the plan to `rejected` and all non-terminal WorkOrders to `cancelled` without
  deleting the plan, handoff, task, approval, or decision evidence.
- A stale digest, mismatched task, superseded approval, or already-active plan cannot start.
- Approval does not authorize builder live mutation, Reviewer/QA execution, commit, push, or release.

## Sequential Builder Dispatch

The first execution implementation is deliberately one-shot and local-stub-only.

- Require an approved plan and exact approved plan approval.
- Require a valid project path and the existing local-stub execution readiness.
- Require exactly one dependency-ready first WorkOrder with role `builder`.
- Mark that WorkOrder active, then reuse the existing planner, architect, task-breaker, and
  builder-preflight stages for the linked control task.
- Record returned run, artifact, inbox, and approval refs on the plan/WorkOrder after each durable
  transition.
- On a clean preflight, stop with WorkOrder status `waiting-gate` at the existing targeted
  builder-live-mutation approval.
- On a decision, provider, validation, or runtime failure, mark the plan/WorkOrder `blocked` and keep
  all partial evidence inspectable.
- Repeated start requests do not create duplicate runs, artifacts, approvals, or dispatch attempts.
- Reviewer and QA WorkOrders remain `blocked-dependency` in this slice.

## Runtime And API Plan

Planned explicit routes:

```text
POST /api/council-sessions/:id/work-order-plans
POST /api/execution-plans/:id/start-sequential
GET  /api/execution-plans/:id
```

The persistence request requires exact `compileSpec`, `previewId`, and `sourceDigest`. The start
request requires the approved `approvalId`. Neither route is called from the legacy Council approval
path. Existing `inert-workorder-preview` recompute and absent-mode linked-task auto-chain remain
compatible.

## UI Boundary

- Add one explicit `검토 대기 계획으로 저장` command beside a valid Phase 4 preview.
- Show plan digest, approval status, Builder/Reviewer/QA state, dependencies, and evidence refs.
- Keep execution start disabled until the exact plan approval is approved.
- Add one explicit `Builder 순차 시작` command after approval.
- Show the existing live-mutation approval as the terminal Phase 5 gate.
- Do not add Reviewer, QA, retry, parallel, live-mutation, commit, push, or release controls.
- Keep browser layout stable on desktop and mobile without nested cards or horizontal overflow.

## Compatibility And Migration

- Phase 4 response-only preview remains available and authoritative before persistence.
- The legacy Council approval path keeps its current linked-task auto-chain behavior.
- The new dispatch path rejects provider-backed project mode in this first slice; it does not change
  existing provider configuration or provider execution behavior elsewhere.
- No CompanyBlueprint, AgentProfile, Council contract, provider adapter, prompt, pack, or source file
  policy changes are planned.
- Existing tasks and approvals continue to use their current contract; the plan approval adds one
  explicit scope/action and metadata shape only.

## Focused Verification Plan

`scripts/smoke-ai-company-workorder-persistence-execution.mjs` must prove:

- exact preview/digest/source-current gating before any write
- v6 -> v7 additive migration and v7 reload
- atomic plan, WorkOrder, handoff, control-task, inbox, and approval persistence
- deterministic IDs and idempotent duplicate persistence
- rejection retention and approved-plan start gating
- local-stub-only sequential Builder dispatch
- dependency-ready selection and no Reviewer/QA dispatch
- stop at exact builder live-mutation approval
- no source-file digest change, commit, push, release, or checkpoint
- stale source, wrong approval, duplicate start, non-local provider mode, and partial record rejection
- default Council auto-chain and Phase 4 response-only preview compatibility

`scripts/smoke-ui-slice-654.mjs` must prove explicit persistence/start controls, approval-disabled states,
blocked downstream controls, API error behavior, reload evidence, and desktop/mobile fit. Aggregate
verification remains `node scripts/verification_status.mjs`.

## Rollback Plan

1. Disable the new persistence and sequential-start routes and UI commands.
2. Stop dispatching new WorkOrders; do not auto-resume an active plan.
3. Mark non-terminal plans and WorkOrders `cancelled` or `blocked` with a rollback reason.
4. Preserve schema v7 records, linked task/run/artifact/inbox/approval evidence, and source Council
   evidence. Do not downgrade or delete state to simulate rollback.
5. Keep the Phase 4 response-only preview and legacy Council path available.
6. Rerun migration, focused compatibility, UI, and aggregate verification.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/runtime-service.js
src/execution/execution-coordinator.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-workorder-persistence-execution.mjs
scripts/smoke-ui-slice-654.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Documentation, README, task ledgers, and existing verifier pins may change only to keep evidence
current. Provider adapters, CompanyBlueprint, role sources, Council contracts, prompts, packs,
commit/release coordinators, and project source files are out of scope.

## Implementation Sequence

1. Add strict schema v7 contracts, assertions, additive migration, and reload smoke.
2. Add atomic preview promotion and digest-bound task-owned plan approval.
3. Add approval reconciliation and idempotent sequential Builder start.
4. Reuse the existing local-stub auto-chain and stop at live-mutation approval.
5. Add read-only plan snapshots and Council/Execution UI controls.
6. Add focused runtime/API/UI/compatibility smokes and update aggregate evidence.
7. Run browser QA, rollback review, security review, and aggregate verification.

## Acceptance Criteria

1. Invalid input changes no durable state and does not consume any approval.
2. One valid request atomically creates the exact v7 plan record set and one pending approval.
3. Reload preserves the full graph and approval provenance.
4. Repeating persistence is idempotent; conflicting digest input fails closed.
5. Only an exact approved plan approval enables the separate start command.
6. Start dispatches only Builder through existing local-stub gates and stops before source mutation.
7. Reviewer/QA, parallelism, retry automation, commit, push, and release remain unavailable.
8. Existing schema v6 state migrates without losing or rewriting existing domain records.
9. Phase 4 preview and legacy Council approval behavior remain compatible.
10. Focused runtime/API/UI gates and aggregate verification pass.

## Exclusions

- Reviewer or QA WorkOrder execution
- builder live mutation or source-file writes
- parallel, dynamic, autonomous, retry, or checkpoint scheduler behavior
- provider-backed WorkOrder dispatch or provider expansion
- memory persistence or profile/source policy mutation
- approval bypass, unattended continuation, runtime-agent commit/push/release
- external connectors, multi-user coordination, staffing marketplace, budget/HR semantics

## Planning Status

- Planning authority: accepted as `DEC-089`
- Implementation decision handoff: documented as `DEC-090`
- Runtime/API/UI/schema implementation: accepted and implemented as `DEC-091`
- Phase 4 response-only preview: remains implemented and authoritative
- Reviewer/QA execution and every downstream authority: still blocked

## Implementation Outcome

- `schemaVersion: 7` adds durable ExecutionPlan, WorkOrder, and HandoffPacket sequences/maps and
  migrates valid v6 state additively while rejecting partial v7 and future schemas.
- Exact source-current `previewId` and `sourceDigest` promotion persists one complete record bundle,
  linked control task, and digest-bound Decision Inbox approval through one atomic state save.
- Approval queues only Builder. A separate local-stub start reuses the existing execution chain and
  stops with Builder `waiting-gate` at the targeted live-mutation approval.
- Reviewer and QA remain `blocked-dependency`; source mutation, provider WorkOrder dispatch,
  scheduling expansion, commit, push, release, and connectors remain unavailable.
- Focused evidence: `scripts/smoke-ai-company-workorder-persistence-execution.mjs` and
  `scripts/smoke-ui-slice-654.mjs`.

## Verification

```bash
node scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs
node scripts/smoke-ai-company-workorder-persistence-execution.mjs
node scripts/smoke-ai-company-mission-workorder-compiler.mjs
node scripts/smoke-ui-slice-653.mjs
node scripts/smoke-ui-slice-654.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
