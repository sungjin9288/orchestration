# AI Company Accepted StaffingPlan Council Entry Binding Plan

## Purpose

이 문서는 `docs/113_ai-company-multi-agent-completion-plan.md` Stage 2의 첫 vertical slice를
계획한다. 대상은 one exact source-current schema-v17 accepted `mode=council` StaffingPlan을
existing deterministic `real-local-stub` Council first entry에 bind하고, 그 사실을 one immutable
schema-v18 StaffingEntry로 보존하는 경로다.

이 문서는 runtime implementation authority가 아니다. Planning과 complete fielded decision
handoff만 허용하며 schema migration, StaffingEntry creation, Council start, API/UI mutation, solo
execution, WorkOrder, provider, source mutation, Git, release authority를 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-staffing-entry-binding-planning-001` |
| `decisionStatus` | `approve-ai-company-staffing-entry-binding-planning-only` |
| `targetAuthority` | one accepted StaffingPlan to local Council entry binding implementation planning |
| `targetSurface` | docs plus existing schema-v17 StaffingPlan, Mission, Real Council, API, UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-163`, `DEC-164`, `DEC-165`, `DEC-166`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/114_ai-company-durable-staffing-plan-implementation-decision-handoff.md`, `src/runtime/staffing-plans.js`, `src/runtime/council-sessions.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | accepted StaffingPlan records remain unbound, local Council start accepts only Mission and mode, Council staffingSnapshot is blueprint-derived execution context, local Council approve can enter the existing auto-chain, no solo runtime exists, and no durable entry audit record or focused binding smoke exists |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable only future bound-entry POST and UI action, block new bound sessions, preserve valid schema-v18 evidence without downgrade, keep historical sessions inspectable, and rerun focused plus aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-staffing-entry-binding-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v18 migration, durable StaffingEntry creation, Council binding, solo entry or execution, scheduling, WorkOrders, parallel execution, retry/rework, providers, memory application, source mutation, runtime-agent commit/push/release, policy mutation, approval bypass, connectors |
| `approvalStatement` | The delegated non-critical planning authority approves this Council-first binding plan and complete fielded handoff only. Architecture-sensitive schema, runtime, API, UI, and durable record implementation requires the separate decision in `docs/116_ai-company-staffing-entry-binding-implementation-decision-handoff.md`. |

## Current Baseline

- Runtime state is schema v17 with `sequences.staffingPlan` and immutable `staffingPlans`.
- A StaffingPlan is created only from one active-project draft Mission, a freshly loaded strict
  CompanyBlueprint plus nine role sources, exact operator staffingSpec, response-only preview, and
  separate acceptance.
- The durable record retains Mission, blueprint, staffingSpec, source, preview, acceptance, and
  record digests. Its `blockedActions` still includes `council-start`.
- `startRealCouncilForMission({ missionId, mode })` ignores durable StaffingPlan evidence and rebuilds
  a `staffingSnapshot` from the current blueprint.
- The local Council server route accepts only `mode`; the UI can start it without selecting an
  accepted plan.
- Local Council approval without an inert preview mode enters the existing Mission alignment
  auto-chain and can create downstream task/run/approval evidence.
- There is no solo adapter, solo session, solo attempt contract, or solo state transition.

## Architecture Decision

Introduce one immutable `StaffingEntry` audit record instead of mutating the accepted StaffingPlan or
overloading `CouncilSession.staffingSnapshot`.

```text
StaffingPlan(status=accepted, mode=council)
  -> separate exact entryApproval
  -> StaffingEntry(status=bound, entryKind=real-council)
  -> one bound real-local-stub CouncilSession
  -> awaiting operator alignment
  -> approve alignment only or stop
```

The StaffingPlan remains immutable source evidence. `staffingSnapshot` keeps its existing execution
context meaning. The new StaffingEntry answers one separate question: which exact accepted plan and
operator entry decision opened this one Council session?

## Why Council First

The first implementation slice accepts only `entryKind=real-council` and a plan with
`mode=council`.

`mode=solo` remains a valid accepted planning choice, but no executable solo runtime exists. Creating
an inert solo entry and moving its Mission to `aligned` would claim lifecycle progress without role
execution evidence. A later solo implementation decision must define its request/output contract,
attempt evidence, state transition, failure handling, and verification before `StaffingEntry` accepts
`entryKind=solo`.

`parallel-specialists` remains rejected while the current CompanyBlueprint disables it.

## Exact Implementation Surface

A later complete decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/staffing-entries.js
src/runtime/staffing-plans.js
src/runtime/council-sessions.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-staffing-entry-binding.mjs
scripts/smoke-ui-slice-697.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Implementation must also synchronize the existing planning and public evidence surface:

```text
README.md
docs/01_decision-log.md
docs/22_completion-gate-inventory.md
docs/48_ai-company-master-plan.md
docs/49_agent-runtime-contract.md
docs/50_council-operating-protocol.md
docs/51_ai-company-delivery-roadmap.md
docs/113_ai-company-multi-agent-completion-plan.md
docs/115_ai-company-staffing-entry-binding-plan.md
docs/116_ai-company-staffing-entry-binding-implementation-decision-handoff.md
tasks/todo.md
tasks/lessons.md
scripts/smoke-ai-company-master-plan.mjs
scripts/smoke-ai-company-multi-agent-completion-planning.mjs
scripts/smoke-ai-company-staffing-entry-binding-planning.mjs
scripts/smoke-readme-scope-evidence.mjs
scripts/smoke-completion-gate-inventory-current-evidence.mjs
```

The planning smoke must preserve `DEC-167` and `DEC-168` provenance while changing its current-state
assertions from schema-v17/implementation-blocked to the exact accepted and verified schema-v18
outcome. It must not be deleted, deregistered, or weakened to make aggregate verification pass.

Schema-sensitive fixtures and direct local-Council setup helpers may change only where schema v17
becomes v18, future schema v18 becomes v19, or an operator-facing unbound local Council start must be
replaced with the exact bound entry path. Existing provider, compiler, coordinator, WorkOrder,
checkpoint, delivery, learning, memory, Growth, source mutation, Git, and release modules remain
outside the allowlist.

## Schema V18 Contract

Schema v18 adds only:

```text
sequences.staffingEntry
staffingEntries
Mission.staffingEntryId: string | null
```

One immutable record has this shape:

```text
StaffingEntry
- id
- persisted: true
- status: bound
- entryKind: real-council
- missionId
- projectId
- projectPack
- workspaceScope.projectId
- staffingPlanId
- staffingPlanRecordDigest
- councilSessionId
- selectedAgentIds[]
- selectedRoles[]
- providerMode: local-stub
- terminationPolicy
- sourceDigest
- missionDigest
- blueprintDigest
- staffingSpecDigest
- entryApproval
  - decision: enter
  - acknowledgement: bind-exact-accepted-staffing-plan-to-local-council
  - rationale
  - requestedAt
- entryApprovalDigest
- entrySourceDigest
- allowedAction: council-start
- blockedActions[]
- boundAt
- createdAt
- updatedAt
- recordDigest
```

The migration preserves every valid schema-v17 value, adds null `staffingEntryId` to existing
Missions, and creates no entry during migration, boot, read, render, preview, or exact inspection.
The new nullable Mission ref does not enter the existing pre-entry StaffingPlan Mission digest
payload, so migration alone cannot invalidate an accepted plan.
Schema v19+, partial v18 state, duplicate Mission binding, invalid references, key mismatches, and
digest-invalid records fail closed before bytes change.

## Source-Current Preconditions

Before any sequence or state mutation:

1. State must be supported schema v17 or v18.
2. `state.activeProjectId`, Mission project, StaffingPlan project, and workspace scope must match.
3. Mission must still be `draft` with `linkedTaskId=null`, `councilSessionId=null`, and
   `staffingEntryId=null`.
4. StaffingPlan must be `persisted=true`, `status=accepted`, `mode=council`, and have a valid current
   `recordDigest`.
5. Request `staffingPlanRecordDigest`, `sourceDigest`, `missionDigest`, `blueprintDigest`, and
   `staffingSpecDigest` must match the durable plan exactly.
6. Runtime must freshly reload and strictly validate CompanyBlueprint plus all nine role sources.
7. Reconstructing the current StaffingPlan preview from the durable plan fields must reproduce the
   same Mission, blueprint, staffingSpec, and combined source digests.
8. Selected agents must be exactly the four current required Council ids including Conductor;
   selected roles, pack support, local-stub policy, tool policy, and no-mutation authority must still
   match current profiles.
9. `providerMode` must be `local-stub`, `parallelGroups` empty, and
   `terminationPolicy.maxProviderCalls=0`.
10. `entryApproval` must use exact keys and a bounded exact ISO `requestedAt` no earlier than
    StaffingPlan acceptance and no more than five minutes in the future.

Stale Mission, blueprint, role source, plan, roster, budget, approval, or digest input returns a
conflict and writes nothing.

## Digest Contract

```text
entryApprovalDigest = sha256(canonical(entryApproval))

entrySourceDigest = sha256(canonical({
  staffingPlanId,
  staffingPlanRecordDigest,
  sourceDigest,
  missionDigest,
  blueprintDigest,
  staffingSpecDigest,
  entryKind,
  selectedAgentIds,
  selectedRoles,
  terminationPolicy,
  entryApprovalDigest
}))

recordDigest = sha256(canonical(StaffingEntry excluding recordDigest))
```

The existing `CouncilSession.sourceDigest` remains the Council agenda digest. A bound session adds:

```text
staffingEntryRef
- staffingEntryId
- entrySourceDigest
- staffingPlanId
- staffingPlanRecordDigest
```

This avoids a circular record digest while preserving exact bidirectional identity through
`StaffingEntry.councilSessionId`.

## Atomic Runtime Flow

1. Load supported state and check for an exact existing entry before draft-Mission validation.
2. Exact replay with the same plan, approval, and source digests returns the existing entry/session
   without saving. Divergent replay returns conflict.
3. Validate the complete source-current tuple and entryApproval.
4. Build the future StaffingEntry id, bound CouncilSession, Mission refs, and schema-v18 state in
   memory.
5. Run exactly one existing deterministic local-stub Council attempt.
6. Require the result to reach `awaiting-alignment`; failed, cancelled, malformed, or incomplete
   attempts abort the entire transaction and persist nothing.
7. Atomically save schema migration, StaffingEntry, CouncilSession, Mission
   `staffingEntryId/councilSessionId/status=aligning`, and sequence increments once.
8. Return the exact entry, session, Mission, and `idempotent=false`.

No provider, Task, Run, Artifact, Approval, ExecutionPlan, WorkOrder, HandoffPacket, checkpoint, or
source record is created.

## Bound Council State And Decisions

The new bound session reuses existing normalized positions, deterministic conflict check, Conductor
synthesis, and human alignment evidence. It changes only entry provenance and downstream gates.

- `approve` persists Council alignment and Mission `aligned` only.
- `stop` persists the existing terminal operator-stop evidence.
- `request-revision` is rejected for a bound session in this slice.
- `resume` is rejected for a bound session in this slice.
- Approve never calls `runMissionAlignmentAutoChain`, compiles a preview, creates a linked task, or
  dispatches a WorkOrder.
- Existing historical unbound local/provider/legacy sessions retain their current decision behavior.

Stage 3 must separately decide how one approved bound Council synthesis becomes a durable
operator-stepped WorkOrder schedule.

## API Contract

New exact routes:

```text
POST /api/staffing-plans/:staffingPlanId/council-entry
GET  /api/staffing-entries/:staffingEntryId
```

The POST body contains only:

```text
staffingPlanRecordDigest
sourceDigest
missionDigest
blueprintDigest
staffingSpecDigest
entryApproval
```

New creation returns `201`; exact replay returns `200` with `idempotent=true`; stale, divergent, wrong
mode, unsupported schema, or unavailable source evidence returns `409`. Missing ids return `404`.
Bodies remain bounded JSON and exact-key validated. No list, search, update, delete, retry, or apply
route is added.

The operator-facing local-stub branch of `POST /api/missions/:missionId/council/start` must reject
new unbound start with `409 STAFFING_PLAN_ENTRY_REQUIRED`. Historical sessions remain readable and
decidable. The explicit `real-openai-responses` compatibility path remains unchanged and does not
consume a local-only StaffingPlan; provider binding stays blocked.

The public runtime service entrypoint must enforce the same accepted-plan binding. Focused fixture
helpers may construct valid bound setup evidence, but production code must not retain an alternate
unbound local-stub start method.

## UI Contract

The accepted Council StaffingPlan panel gains one primary command only:

```text
Enter local Council
```

The command submits the exact durable plan and entryApproval tuple. After success, the UI shows
StaffingEntry id, bound plan id, selected roles, source digest status, and Council alignment evidence.
It does not show unbound local start, revision, resume, auto-chain, WorkOrder, provider, parallel,
retry, source, Git, or release controls for the bound session.

An accepted solo StaffingPlan shows read-only `solo runtime not implemented` evidence and no entry
button. Browser-memory form state clears on refresh, source change, successful entry, or failed
recomputation.

## Compatibility

- StaffingPlan records remain immutable and digest-stable.
- Existing schema-v17 domain values migrate additively.
- Existing legacy deterministic Council and historical Real Council/provider sessions are not
  rewritten or retroactively bound.
- Existing provider Council remains an explicit separate DEC-085 compatibility path.
- Existing Council normalized position/synthesis contracts and local-stub coordinator remain
  unchanged.
- Existing WorkOrder compiler, default unbound historical auto-chain, checkpoint, proof, delivery,
  learning, memory, Growth proposal, source mutation, commit, and release behavior outside the new
  bound session branch remains unchanged.
- Direct consumers without a bound entry keep historical records inspectable, but no operator-facing
  route or public runtime method may create a new unbound local-stub session.

## Failure And Recovery

| Failure | Result | Recovery |
| --- | --- | --- |
| Missing or stale accepted plan | Conflict, no write | Re-preview and accept a current plan |
| Mission or active-project drift | Conflict, no write | Select the exact project and current draft Mission |
| Blueprint or role-source drift | Conflict, no write | Review and accept a new StaffingPlan |
| Wrong mode, roster, provider, or budget | Conflict, no write | Supply a valid council plan |
| Invalid entry approval | Conflict, no write | Review and resubmit exact entry evidence |
| Local Council attempt does not reach alignment | Entire transaction aborted | Fix deterministic source/adapter and retry |
| Exact replay | Existing evidence returned, no write | Continue inspection |
| Divergent replay | Conflict, no write | Inspect the existing entry |
| Restart after save | Exact entry/session reload | Continue approve or stop only |
| Unsupported future/partial schema | Load rejected, bytes preserved | Repair or use a compatible runtime |

## Focused Verification Plan

`scripts/smoke-ai-company-staffing-entry-binding.mjs` must prove:

1. Atomic schema-v17 to v18 migration plus one entry/session/Mission binding in one save.
2. Migration, boot, read, render, preview, and failed input create zero entries.
3. Exact accepted plan, active project, Mission, current blueprint, nine role sources, four-role
   roster including Conductor, local-stub provider, and zero-call budget binding.
4. Canonical approval, source, and record digests plus exact GET and reload.
5. Exact replay is no-write and divergent replay is conflict.
6. Mission, plan, blueprint, role-source, roster, provider, budget, timestamp, and digest drift are
   no-write conflicts.
7. Failed Council pre-save attempt leaves schema, sequences, Mission, entry, and session unchanged.
8. Bound approve stops at alignment with no task/run/artifact/approval/ExecutionPlan/WorkOrder.
9. Bound stop works; revision, resume, auto-chain, preview compilation, retry, and rework fail closed.
10. New unbound local Council API and public runtime start are blocked while historical
    legacy/Real/provider evidence and explicit provider compatibility remain unchanged.
11. Schema v19 and partial or corrupt v18 state fail closed.
12. StaffingPlan remains immutable and its `blockedActions` unchanged.
13. Rollback disables creation while exact GET continues to return valid schema-v18 evidence.

`scripts/smoke-ui-slice-697.mjs` must prove exact-gated Council entry, read-only entry evidence,
solo-without-action evidence, safe stale failures, hidden unbound/downstream controls, historical
session compatibility, and desktop/mobile fit. Aggregate verification remains
`node scripts/verification_status.mjs`.

## Rollback

1. Disable the bound-entry POST and UI command.
2. Reject new `entryKind=real-council` creation and stop new bound session starts.
3. Preserve valid schema-v18 StaffingEntry, Mission refs, CouncilSession refs, and all source records.
4. Do not downgrade schema, delete entries, mutate accepted plans, or convert bound sessions to
   historical unbound sessions.
5. Keep bound sessions inspect-only and block new resume/revision/auto-chain actions.
6. Preserve historical Council and every downstream record outside the new path.
7. Rerun migration, focused runtime/API/UI, compatibility, README, inventory, UI QA, and aggregate
   verification.

## Implementation Sequence

1. Add pure StaffingEntry validation, digest, and creation helpers.
2. Add schema-v18 state keys, Mission ref, migration, semantic validation, and exact assertion.
3. Add source-current plan recomputation and atomic Council entry transaction.
4. Add bound Council provenance and alignment-only decision guards.
5. Add exact POST/GET routes and block new operator-facing unbound local Council start.
6. Add the single Council entry command and read-only evidence UI.
7. Add focused runtime/API/UI and compatibility smokes.
8. Synchronize docs, README, inventory, task evidence, UI QA, and aggregate verification.

## Still Blocked

- solo StaffingEntry or solo role execution
- dynamic staffing and parallel specialists
- general scheduler and WorkOrder creation/dispatch
- Council revision, resume, retry, rework, or auto-chain for bound sessions
- provider-backed StaffingEntry or WorkOrder
- Researcher or Ops execution
- durable continuation history and Ops supervision commands
- Mission memory context application
- source mutation expansion
- runtime-agent commit, push, or release
- background autonomy
- profile or policy mutation
- approval bypass
- list/search/update/delete lifecycle
- external connectors

## Planning Acceptance

Planning-only authority is recorded as `DEC-167`. The complete fielded implementation handoff is
recorded as `DEC-168`. No runtime, schema, API, UI, durable record, Council, provider, source, Git,
release, scheduler, policy, bypass, or connector authority opens until the operator supplies every
required field in `docs/116_ai-company-staffing-entry-binding-implementation-decision-handoff.md`.
