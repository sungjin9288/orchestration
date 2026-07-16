# AI Company Durable DeliveryPackage Persistence Plan

## Purpose

이 문서는 `DEC-094`와 `DEC-097`이 만든 source-current `delivery-ready` ExecutionPlan,
terminal WorkflowCheckpoint, response-only DeliveryPackage preview를 하나의 durable
`review-required` record로 승격하는 post-Phase 7 최소 vertical slice를 정의한다. 이 planning-only
문서는 schema, runtime, API, UI, Mission status, task lifecycle, provider behavior 또는 project
source를 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-durable-delivery-package-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-delivery-package-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v9 durable DeliveryPackage `review-required` record from one exact source-current schema-v8 delivery-ready ExecutionPlan and terminal WorkflowCheckpoint |
| `targetSurface` | docs plus the existing response-only DeliveryPackage composer, schema-v8 ExecutionPlan/WorkOrder/WorkflowCheckpoint evidence, Deliverables UI, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-095`, `DEC-097`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/62_ai-company-reviewed-delivery-planning-plan.md`, `docs/64_ai-company-checkpoint-resume-recovery-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v8 with no deliveryPackage sequence map or plan refs; the composer returns `persisted=false` and `missionDone=false`; there is no package digest, persistence function, durable-package route, read-only durable package UI, focused persistence smoke, package acceptance gate, or Mission close-out authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future persist/get entrypoints and UI controls, stop new package creation, preserve schema-v9 records and all source plan WorkOrder checkpoint run artifact approval and QA evidence, quarantine invalid records without downgrade or deletion, keep response-only preview available, and rerun migration focused UI compatibility and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-durable-delivery-package-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v9 implementation, durable DeliveryPackage creation, package acceptance changes-requested or rejection, Mission close-out or done, task close-out, commit package, local commit, push, release, learning candidate generation, memory or skill persistence, automatic retry/rework, scheduling/provider expansion, profile/policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact durable `review-required` DeliveryPackage record. Implementation, package acceptance, Mission done, commit, push, release, learning, and every downstream authority require later complete fielded decisions. |

## Current Baseline Evidence

- Runtime state is schema v8 with durable ExecutionPlan, WorkOrder, HandoffPacket, and
  WorkflowCheckpoint records.
- A source-current local-stub plan can reach `delivery-ready` only after exact Builder approval,
  completed Builder evidence, passed independent Reviewer evidence, and constrained QA evidence.
- `delivery-ready` appends a terminal WorkflowCheckpoint whose input, authority, source, and immutable
  checkpoint digests can be recomputed after restart.
- `previewExecutionPlanDelivery()` fails closed on stale source, incomplete WorkOrders, failed review,
  failed QA, unresolved blocking decisions, or invalid approval provenance.
- The preview is deterministic, deeply frozen, reload-safe, `persisted=false`, and
  `missionDone=false`. It creates no runtime record, artifact, approval, inbox item, commit, or release.
- The current Mission remains `executing`; package acceptance and Mission completion do not exist in
  the AI Company runtime.

## Architecture Choice

The first delivery persistence slice is a record promotion boundary, not Mission close-out.

```text
schema-v8 delivery-ready plan
-> exact terminal WorkflowCheckpoint
-> recompute response-only DeliveryPackage preview
-> require explicit operator persist request with exact digests
-> atomically migrate valid v8 state to v9 when needed
-> append one immutable review-required DeliveryPackage record
-> expose read-only durable package evidence
-> stop before package acceptance, Mission done, task close-out, commit, push, or release
```

No API read, UI render, server boot, checkpoint completion, or prior approval automatically persists
or accepts a DeliveryPackage.

## Entry Gate

The future implementation must require all of the following before record creation:

1. one valid schema-v8 or schema-v9 ExecutionPlan bundle with status `delivery-ready`;
2. all required Builder, Reviewer, and QA WorkOrders in terminal success;
3. the latest WorkflowCheckpoint at `delivery-ready` with status `terminal`;
4. exact current `checkpointId` and `checkpointDigest`;
5. a freshly recomputed DeliveryPackage preview with exact `previewId`, `sourceDigest`, and
   `packageDigest`;
6. passed Reviewer and QA evidence with every referenced run, artifact, approval, and WorkOrder
   present;
7. no unresolved blocking decision or approval;
8. source-current Mission, Council, project provider, plan, compile spec, authority, and evidence refs;
9. one explicit operator persist request.

Plan approval, Builder approval, Reviewer verdict, QA pass, terminal checkpoint, server restart, UI
refresh, or broad continuation wording alone does not grant persistence authority.

## Planned State Schema v9

The later complete fielded implementation decision may authorize one additive migration:

```text
schemaVersion = 9
sequences.deliveryPackage
deliveryPackages{}
executionPlans[*].deliveryPackageRefs[]
executionPlans[*].latestDeliveryPackageId
```

Migration requirements:

- Valid schema-v8 state gains the sequence, map, and empty per-plan refs without rewriting existing
  Mission, Council, plan, WorkOrder, handoff, checkpoint, task, run, artifact, inbox, approval,
  proposal, project, or source values.
- Migration itself creates no DeliveryPackage. Only the exact explicit persist request may append one.
- Unknown future schemas and partial or semantically invalid schema-v9 records fail closed.
- Migration and record append use the existing temporary-file plus rename atomic save boundary.
- Rollback preserves schema-v9 evidence and never downgrades, deletes, or rewrites package history.

## Durable DeliveryPackage Contract

The first persisted record contains normalized evidence only:

```text
id
projectId
missionId
executionPlanId
terminalCheckpointId
terminalCheckpointDigest
previewId
sourceDigest
packageDigest
status = review-required
deliveredArtifactRefs[]
workOrderResults[]
  - workOrderId
  - role
  - status
  - runRefs[]
  - artifactRefs[]
reviewerEvidenceRef
qaEvidenceRefs[]
verificationSummary
acceptedRisks[]
unresolvedItems[]
authoritySummary
createdAt
updatedAt
```

- Identity, source bindings, digest, evidence refs, results, risks, authority summary, and creation
  time are immutable after append.
- `status=review-required` is the only status this first slice may create. It does not mean accepted,
  done, released, or learned.
- Raw source content, raw QA stdout/stderr, provider output, transcripts, environment values,
  credentials, chain-of-thought, or new generated prose are excluded.
- `authoritySummary` keeps Mission done, package acceptance, commit, push, release, memory, learning,
  scheduling, provider expansion, and policy mutation false.

## Digest And Idempotency Binding

- `packageDigest` hashes the immutable normalized preview payload, source digest, ordered WorkOrder
  results, exact run/artifact refs, Reviewer and QA refs, verification summary, risks, unresolved
  items, authority summary, and terminal checkpoint identity/digest.
- Persistence requires exact `previewId`, `sourceDigest`, `packageDigest`, `checkpointId`, and
  `checkpointDigest` from the current recomputation.
- Any source, graph, evidence, policy, authority, checkpoint, or preview drift rejects the request
  before schema save or record creation.
- Repeating the exact request returns the existing record idempotently and creates no duplicate
  record, sequence increment, artifact, approval, inbox item, or Mission transition.
- A different digest for an ExecutionPlan that already has a current record is a conflict, not a
  silent overwrite or second accepted package.

## Runtime And API Plan

The later complete fielded decision may open only:

```text
GET  /api/execution-plans/:executionPlanId/delivery-package
POST /api/execution-plans/:executionPlanId/persist-delivery-package
```

The GET route is read-only. The POST route recomputes the existing response-only preview, validates
the exact tuple, appends one `review-required` record, and returns the durable bundle. Existing
delivery-preview, reviewed-delivery continuation, checkpoint recovery, task, Council, and provider
routes remain unchanged.

## UI Boundary

- Keep the response-only preview visible before persistence.
- Add one explicit `DeliveryPackage 기록` command only when the preview and terminal checkpoint are
  current and exact.
- After persistence, render package id, `review-required` status, source/package/checkpoint digests,
  WorkOrder result refs, Reviewer/QA refs, risks, unresolved items, and blocked downstream authority.
- Keep package acceptance, changes requested, Mission done, task close-out, commit, push, release,
  learning, retry, scheduling, and provider controls absent or disabled.
- Rendering or hydration must never persist, accept, or transition the package.

## Compatibility And Migration

- Preserve DEC-091 plan persistence, DEC-094 reviewed delivery, DEC-097 recovery, Phase 4 inert
  preview, standalone task execution, Council, provider, commit-package, release-package, and
  close-out behavior outside the new routes.
- Preserve the existing response-only preview API and object shape; additive digest fields may be
  exposed without changing `persisted=false` or `missionDone=false` on that preview.
- Add no provider adapter, role prompt, CompanyBlueprint, StaffingPlan, WorkOrder dispatch, QA runner,
  source mutation, commit, release, memory, or learning changes.
- States with no ExecutionPlan or no delivery-ready plan remain valid after additive migration and
  gain no package record.

## Focused Verification Plan

Future `scripts/smoke-ai-company-durable-delivery-package.mjs` must prove:

- atomic v8-to-v9 migration, complete value preservation, valid reload, and partial/future-schema
  rejection;
- no package bootstrap during migration and no record on GET, boot, preview, checkpoint, or render;
- deterministic package digest and exact preview/source/checkpoint tuple binding;
- one atomic `review-required` record with complete normalized evidence refs;
- stale source, authority, graph, checkpoint, review, QA, artifact, or digest refusal with byte-identical
  state after invalid input;
- exact repeated request idempotency with no duplicate sequence, record, run, artifact, approval, inbox
  item, or checkpoint;
- reload and rollback retention without schema downgrade or evidence deletion;
- Mission remains `executing`, ExecutionPlan remains `delivery-ready`, and task lifecycle is unchanged;
- package acceptance, Mission done, commit, push, release, learning, provider expansion, scheduling,
  and external connectors remain blocked;
- DEC-091, DEC-094, DEC-097, preview, recovery, task, Council, provider, and close-out compatibility.

Future `scripts/smoke-ui-slice-657.mjs` must prove exact-gated persistence, read-only reload rendering,
safe stale/API failures, disabled downstream controls, unchanged preview behavior, and desktop/mobile
fit. Aggregate verification remains `node scripts/verification_status.mjs`.

## Rollback Plan

1. Disable persist/get routes and UI commands; keep response-only preview available.
2. Stop new package creation. Do not auto-accept, close, retry, or create replacement records.
3. Preserve valid schema-v9 records and all referenced source evidence.
4. Quarantine invalid or incomplete records through explicit rollback evidence; never delete or
   downgrade them.
5. Keep Mission `executing`, plan `delivery-ready`, terminal checkpoint inspectable, and task lifecycle
   unchanged.
6. Rerun migration, focused runtime/UI, compatibility, README/inventory, UI QA, and aggregate gates.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/delivery-packages.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-durable-delivery-package.mjs
scripts/smoke-ui-slice-657.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

Documentation, README, task ledgers, and verifier pins may change only to keep evidence current.
Execution coordinators, provider adapters, QA runner, CompanyBlueprint, role sources, prompts, packs,
project source, commit/release runtime, and unrelated files remain out of scope.

## Implementation Sequence

1. Add pure package normalization and digest helpers plus strict schema-v9 migration.
2. Recompute and validate the exact response-only preview and terminal checkpoint tuple.
3. Append one idempotent `review-required` record with immutable refs.
4. Add explicit persist and read-only get runtime/API entrypoints.
5. Add Deliverables persistence control and read-only durable evidence rendering.
6. Add focused migration/runtime/API/UI/compatibility smokes and browser proof.
7. Sync docs, README, task ledger, inventory, UI QA, aggregate verification, review, commit, and push.

## Acceptance Criteria

1. Valid v8 state migrates atomically and additively without changing existing domain evidence.
2. Migration, read, boot, preview, checkpoint, or render creates no package.
3. Only exact current delivery-ready preview and terminal checkpoint evidence can persist one record.
4. Invalid or stale input changes no state and creates no object or downstream action.
5. The record is deterministic, normalized, `review-required`, reload-safe, and idempotent.
6. No run, artifact, approval, inbox item, checkpoint, source mutation, or provider call is created.
7. Mission, plan, WorkOrders, task lifecycle, and response-only preview semantics remain unchanged.
8. Package acceptance, Mission done, commit, push, release, learning, scheduling, provider expansion,
   memory, policy mutation, approval bypass, and connectors remain unavailable.
9. Focused runtime/API/UI, compatibility, README/inventory, UI QA, and aggregate gates pass.

## Exclusions

- schema-v9 or runtime/API/UI implementation before a complete fielded decision
- package acceptance, rejection, changes requested, supersession, or deletion
- Mission close-out, Mission done, task close-out, commit package, local commit, push, or release
- LearningCandidate generation, memory persistence, skill promotion, or organizational learning
- Builder replay, automatic retry/rework, parallel/dynamic/autonomous/background scheduling
- provider-backed WorkOrder execution, provider expansion, profile/policy mutation, approval bypass
- external connectors, multi-user coordination, staffing marketplace, budget/HR semantics

## Planning Status

- Planning authority: accepted as `DEC-098`
- Implementation decision handoff: documented as `DEC-099`
- Schema/runtime/API/UI implementation: accepted as `DEC-100`
- Current runtime: schema v9 with one exact durable `review-required` DeliveryPackage path
- Package acceptance, Mission close-out/done, commit/push/release, learning, and every downstream
  authority: still blocked

## Verification

```bash
node scripts/smoke-ai-company-durable-delivery-package-planning.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-656.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
