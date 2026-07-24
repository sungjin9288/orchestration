# AI Company Multi-Agent Completion Plan

## Purpose

이 문서는 현재의 고정형 Council과 Builder -> Reviewer -> QA pass path를 실제 multi-agent
orchestration으로 완성하는 순서를 정의한다.

현재 runtime은 schema v17에서 source-backed role identity, Real Council, durable ExecutionPlan과
WorkOrder, checkpoint recovery, reviewed delivery, Mission close-out, learning, memory audit,
AcceptanceCriterion, VerificationProof, and one immutable accepted `StaffingPlan`을 보존한다.
Accepted-plan Council/solo binding, general WorkOrder scheduler, bounded parallel specialist
execution, Reviewer rework, Mission memory context application은 아직 없다.

완성 방향은 기존 runtime을 교체하는 것이 아니다. 검증된 evidence와 authority model 위에
StaffingPlan부터 한 단계씩 추가하고, 각 단계에서 operator가 다음 권한을 명시적으로 열도록 한다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-ai-company-multi-agent-completion-planning-001` |
| `decisionStatus` | `approve-ai-company-multi-agent-completion-planning-only` |
| `targetAuthority` | source-of-truth reconciliation and planning only for the staged completion of durable StaffingPlan, operator-stepped scheduling, bounded read-only parallel specialists, Reviewer rework, Ops recovery, reviewed Mission context attachment, provider expansion, and dogfood evidence |
| `targetSurface` | docs plus the existing schema-v16 CompanyBlueprint, Council, ExecutionPlan, WorkOrder, Checkpoint, AcceptanceCriterion, VerificationProof, memory context preview, README, task ledger, completion inventory, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-097`, `DEC-130`, `DEC-131`, `DEC-132`, `DEC-133`, `DEC-134`, `DEC-135`, `DEC-136`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `company/blueprint.json`, `src/runtime/contracts.js`, `src/runtime/council-sessions.js`, `src/runtime/mission-workorder-compiler.js`, `src/runtime/runtime-service.js`, `src/execution/council-coordinator.js` |
| `negativeEvidenceRefs` | current schema v16 has no StaffingPlan sequence map record digest preview persistence inspection or Council-entry binding, Council staffingSnapshot is not a durable accepted plan, WorkOrder graph is fixed Builder Reviewer QA, provider Council positions are collected sequentially, parallel specialists are disabled, bounded continuation is response-only maxSteps=1, Reviewer changes-requested stops without rework, and Mission memory context remains preview-only |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | revert only the planning docs, decision entries, README, task and verification evidence; preserve schema v16 runtime, state, source records, Council, WorkOrder, checkpoint, delivery, learning, memory, provider, and UI behavior |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-multi-agent-completion-planning.mjs`; every runtime, API, UI, migration, provider, and browser smoke remains blocked until its named implementation decision |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v17 migration, StaffingPlan preview persistence acceptance inspection or Council binding, automatic or provider-assisted staffing, dynamic WorkOrder compilation, general scheduling, parallel execution, automatic retry or rework, Ops runtime commands, durable Mission context attachment or injection, provider-backed WorkOrders, source mutation beyond existing exact Builder authority, runtime-agent commit push or release, policy mutation, approval bypass, background autonomy, and external connectors |
| `approvalStatement` | The operator approves source-of-truth reconciliation and completion planning only. This does not approve runtime, schema, API, UI, provider, scheduler, parallel execution, rework, memory application, source mutation, Git, release, policy, bypass, or connector implementation. |

## Current Capability Boundary

### Implemented

- One repo-backed CompanyBlueprint and nine strict AgentProfiles.
- Real Council with independent Strategist, Architect, and Decomposer positions, deterministic
  conflict evidence, Conductor synthesis, and explicit operator alignment.
- One fixed Builder -> Reviewer -> QA WorkOrder graph with dependency and mutable-target collision
  validation.
- Durable ExecutionPlan, WorkOrder, HandoffPacket, WorkflowCheckpoint, DeliveryPackage,
  DeliveryPackageAcceptance, MissionCloseOut, LearningCandidate, MemoryItem, MemoryRecall,
  AcceptanceCriterion, and VerificationProof records.
- One exact response-only MissionMemoryContextPreview.
- One response-only `maxSteps=1` continuation preview with deadline, cancellation, and no-progress
  evidence.
- One exact source-current StaffingPlan preview, separate acceptance, immutable schema-v17 record,
  and exact-id inspection.

### Not Implemented

- Accepted StaffingPlan binding to Council or solo execution entry.
- `parallel-specialists` activation or runtime execution.
- A scheduler that dispatches any dependency-ready WorkOrder rather than one fixed active role.
- Safe parallel read-only specialist cells and failed-cell-only retry.
- Reviewer `changes-requested` to a new bounded Builder attempt.
- Ops supervision commands over durable attempts and checkpoints.
- Reviewed memory context attachment to Mission planning input.
- Provider-backed WorkOrder roles outside the current Council boundary.
- Complete Phase 9 dogfood evidence.

## Completion Principles

1. Deterministic code owns state transitions, authority, budgets, deadlines, collision checks, and
   terminal reasons.
2. Agent output is evidence. It never creates approval, mutation, commit, push, release, or policy
   authority.
3. Every role attempt receives an immutable HandoffPacket instead of another role's raw transcript.
4. Parallel execution is allowed only for source-read-only cells with no dependency or target
   collision.
5. Successful independent cells are reused after interruption. Only failed cells can be retried.
6. Every retry and rework is bounded, digest-bound, and operator initiated.
7. Current local-stub synthetic verification remains authoritative. Live-provider evidence stays
   optional.
8. Rollback disables entrypoints and preserves valid evidence. It never downgrades schema or deletes
   accepted records.

## Completion Sequence

### Stage 1: Durable StaffingPlan

The first implementation target is one source-current StaffingPlan preview and one separate exact
operator acceptance that atomically appends an immutable schema-v17 record.

This stage does not start Council, compile WorkOrders, or schedule agents.

### Stage 2: Accepted StaffingPlan Entry Binding

Council start and future solo execution must require one current accepted StaffingPlan whose Mission,
CompanyBlueprint, mode, selected agents, budget, and source digests still match.

Binding opens only the selected entrypoint. It does not create a general scheduler.

The first Stage 2 plan is Council-first because no solo runtime contract exists. `DEC-167` accepts
`docs/115_ai-company-staffing-entry-binding-plan.md` as planning-only authority, and `DEC-168`
records its complete fielded schema-v18 implementation handoff. Runtime implementation remains
blocked pending that exact operator decision.

### Stage 3: Operator-Stepped WorkOrder Scheduler

Replace the fixed active-role assumption with deterministic dependency-ready selection and durable
role-attempt evidence. Initial operation remains explicit `/start` and `/step`; no background loop is
introduced.

Mutable targets are serialized. Builder retains the current targeted live-mutation approval.

### Stage 4: Bounded Parallel Read-Only Specialists

Enable Researcher and independent verification cells only when their inputs are immutable, their
workspace is read-only, and their dependency and target sets do not overlap.

Use a small source-backed concurrency limit, per-cell cancellation and deadline, bounded provider
budget, and partial-result checkpoints. Successful cells are retained; failed cells require one
explicit retry command.

### Stage 5: Reviewer Rework

Compile `changes-requested` evidence into a response-only ReworkPlan. A separate operator decision may
append one new Builder WorkOrder attempt with the original accepted decision, exact findings,
target allowlist, verification plan, and a bounded attempt cap.

Every new mutation attempt repeats preflight and approval. An unchanged progress digest stops the
loop.

### Stage 6: Ops Supervision And Recovery

Expose one read-only supervision snapshot and explicit `step`, `retry-failed`, `cancel`, `quarantine`,
and `resume-safe-checkpoint` commands. Restart never infers success or replays an active mutation.

The UI shows role, dependency, attempt, checkpoint, budget, and terminal reason from durable evidence.

### Stage 7: Reviewed Mission Context Attachment

Promote one exact MissionMemoryContextPreview only after a separate operator review into a
project-local MissionContextAttachment. The attachment remains immutable evidence and does not change
Mission policy.

Strategist or planner input can include it only through an explicit request. Automatic retrieval,
search, ranking, recommendation, and cross-workspace memory remain outside this sequence.

### Stage 8: Provider Expansion And Dogfood

Open provider execution one read-only role at a time, beginning with Researcher or Reviewer.
Deterministic QA remains local. Builder provider preflight precedes any separately approved provider
mutation path.

Completion requires isolated scenarios for solo, Council, bounded parallel research and verification,
provider timeout, partial retry, revision, operator stop, Builder approval, Reviewer rework, accepted
delivery, close-out, and restart/resume. README claims must match those exact results.

## First Vertical Slice: Durable StaffingPlan

### Source Tuple

```text
one exact source-current draft Mission
+ active project and project pack
+ freshly reloaded strict CompanyBlueprint and nine AgentProfile role sources
+ one bounded operator-owned staffingSpec and evaluatedAt
-> deterministic response-only preview
+ the same staffingSpec and preview tuple
+ separate exact acceptance decision
-> atomic schema-v16 to schema-v17 migration
-> one immutable StaffingPlan(status=accepted)
-> exact-id inspection
-> stop before Council or execution
```

### Exact Staffing Spec

The first slice uses only vocabulary that already exists in CompanyBlueprint. It does not add a
capability field to AgentProfile.

```text
mode: solo | council | parallel-specialists
selectedAgentIds[]
selectionRationale
parallelGroups[][]
providerMode: local-stub
terminationPolicy
  maxProviderCalls: 0
  maxTurnsPerAgent
  deadlineMs
  stopOnRequiredRoleFailure: true
```

`selectedRoles[]` is a derived preview and record field resolved from the selected profiles. It is not
operator input. The first council plan selects exactly the four ids in
`defaultStaffingPolicy.requiredCouncilAgentIds`, including Conductor. A later Council binding slice
may route Conductor to synthesis and the other three roles to positions without changing the accepted
plan.

### Canonical Source And Digest Contract

Every preview and acceptance reloads CompanyBlueprint from repo sources. Runtime-startup cache is not
current evidence for this path.

```text
blueprintSourceRefs
  company/blueprint.json
  nine sorted company/roles/*.md refs from AgentProfile.instructionsRef

blueprintDigest =
  sha256(canonical JSON {
    normalizedBlueprint,
    roleSources: [{ ref, sha256(raw UTF-8 bytes) }]
  })

missionDigest =
  sha256(canonical stable draft Mission projection)

staffingSpecDigest =
  sha256(canonical normalized staffingSpec)

sourceDigest =
  sha256(canonical JSON {
    missionDigest,
    projectId,
    projectPack,
    blueprintDigest,
    staffingSpecDigest
  })
```

The Mission projection includes id, projectId, title, goal, constraints, deliverableType, status,
linkedTaskId, councilSessionId, createdAt, and updatedAt. `previewDigest` hashes the complete preview
except its own digest. `recordDigest` hashes the complete durable record except its own digest.

### Planned StaffingPlan Record

```text
id
persisted: true
status: accepted
missionId
projectId
projectPack
workspaceScope
  projectId
mode
selectedAgentIds[]
selectedRoles[]
selectionRationale
parallelGroups[][]
providerMode: local-stub
terminationPolicy
  maxProviderCalls: 0
  maxTurnsPerAgent
  deadlineMs
  stopOnRequiredRoleFailure: true
sourceRefs[]
blueprintSourceRefs[]
sourceDigest
missionDigest
blueprintDigest
staffingSpecDigest
sourcePreviewId
sourcePreviewDigest
acceptance
  decision: accept
  acknowledgement: reviewed-exact-staffing-plan-for-local-record
  rationale
  reviewedAt
blockedActions[]
evaluatedAt
acceptedAt
createdAt
updatedAt
recordDigest
```

The record stores execution evidence, not company policy. CompanyBlueprint remains the source of truth.
`previewDigest` belongs to the response-only preview; the durable record retains it as
`sourcePreviewDigest` rather than recomputing it as record state.

### Validation Rules

- Mission must be source-current, `draft`, unlinked, and belong to the active project:
  `state.activeProjectId === mission.projectId`.
- Every selected agent must exist in the freshly loaded blueprint, support the project pack, allow
  `local-stub`, retain `concurrencyLimit=1`, and carry no source-write, commit, or push authority.
- `solo` selects exactly one agent and has no parallel group.
- `council` selects exactly the four current required Council agents, including Conductor, and has no
  parallel group.
- `parallel-specialists` is rejected while
  `defaultStaffingPolicy.parallelSpecialistsAllowed=false`.
- The first slice requires the existing provider value `providerMode=local-stub` and
  `terminationPolicy.maxProviderCalls=0`. The other limits cannot exceed the current blueprint
  termination policy.
- Preview `evaluatedAt` must be an exact ISO timestamp, must not precede Mission `updatedAt`, and must
  not exceed the runtime clock by more than five minutes.
- Acceptance `reviewedAt` must be exact ISO, must not precede preview `evaluatedAt`, and must not
  exceed the runtime clock by more than five minutes. `acceptedAt`, `createdAt`, and `updatedAt` all
  equal `reviewedAt`.
- Duplicate agents, duplicate groups, empty rationale, widened workspace, write authority, commit,
  push, release, and provider fallback fail closed.
- Acceptance resubmits the exact staffingSpec and evaluatedAt so runtime can recompute the
  response-only preview from current source evidence before any write.
- The record carries source refs, digest lineage, acceptance evidence, and blockedActions. Inspection
  does not need the browser preview to explain why the record exists or what it cannot do.
- Preview generation, boot, GET, snapshot, and migration do not create a record.
- Exact replay returns the existing record; stale or divergent input writes nothing.

### Planned Runtime Surface

```text
src/runtime/staffing-plans.js
previewStaffingPlan(input)
acceptStaffingPlan(input)
getStaffingPlan(id)
```

Planned routes:

```text
POST /api/missions/:missionId/staffing-plan-preview
  body: { staffingSpec, evaluatedAt }

POST /api/missions/:missionId/staffing-plans
  body: {
    staffingSpec,
    evaluatedAt,
    previewId,
    previewDigest,
    sourceDigest,
    missionDigest,
    blueprintDigest,
    staffingSpecDigest,
    acceptance
  }

GET  /api/staffing-plans/:staffingPlanId
```

The UI may preview, accept, and inspect one exact plan. It exposes no start, dispatch, parallel,
provider, mutation, retry, rework, commit, push, release, or apply action.

## Migration And Rollback

- Add only `sequences.staffingPlan`, `staffingPlans`, and the minimum immutable record validation
  required by schema v17.
- Preserve every valid schema-v16 value exactly.
- Create no StaffingPlan during boot, read, preview, render, or migration alone.
- Reject schema v18+, partial v17, non-matching map keys, invalid records, and digest mismatch without
  changing source bytes.
- Validate the complete preview and acceptance tuple before one atomic migration-plus-append save.
- Rollback disables preview, accept, and exact inspection entrypoints. Valid v17 records remain inert
  audit evidence and are never deleted or downgraded.

## Focused Verification Plan

The focused runtime smoke proves:

- atomic v16-to-v17 migration, reload, and future/partial-state rejection;
- exact active project, Mission, project pack, blueprint and role source, staffingSpec, preview,
  acceptance, and timestamp binding;
- idempotent replay and stale or divergent no-write refusal;
- role, pack, existing `local-stub` provider, zero-provider-call termination policy, and authority
  allowlists;
- exact mode invariants and parallel mode fail-closed behavior;
- immutable source/acceptance/blocked-action evidence and canonical record digest;
- no Council start, WorkOrder creation, scheduler, provider call, source mutation, approval bypass,
  commit, push, or release;
- existing Council, fixed WorkOrder, checkpoint, proof, delivery, learning, and memory compatibility.

The UI/API smoke proves bounded JSON input, explicit preview and acceptance, exact durable
inspection, safe failures, browser-memory invalidation, absent downstream controls, and desktop/mobile
fit.

## Current Gate

- Source-of-truth reconciliation is recorded as `DEC-162`.
- This completion plan is accepted as planning-only `DEC-163`.
- The complete StaffingPlan implementation decision handoff is recorded as `DEC-164`.
- The implementation-readiness contract clarification is recorded as `DEC-165`.
- The exact implementation is recorded as `DEC-166` and covers preview, acceptance, schema-v17
  persistence, and inspection only.
- Council-first StaffingEntry binding planning is recorded as `DEC-167`; its complete fielded
  implementation handoff is recorded as `DEC-168`.
- StaffingEntry implementation, Council binding, solo entry/execution, and every later completion
  stage remain blocked pending their own complete fielded decisions.
