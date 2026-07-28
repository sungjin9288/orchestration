# AI Company Ops Supervision Preview Plan

## Purpose

이 문서는 `DEC-182` 이후 남은 active-attempt recovery를 바로 replay나 settlement로 넓히기
전에, one operator-selected active attempt를 동일한 evidence vocabulary로 분류하는 Stage 6A
planning-only vertical slice를 정의한다. 첫 구현 후보는 schema v21을 유지하는 response-only
`OpsSupervisionPreview`다. WorkOrderAttempt, SpecialistBatch first attempt, SpecialistCellRetry
attempt #2 중 exact target 하나만 검사하고 어떤 state도 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-ops-supervision-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-ops-supervision-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only schema-v21 OpsSupervisionPreview over one operator-selected exact active WorkOrderAttempt, SpecialistBatch first-attempt cell, or SpecialistCellRetry attempt #2 |
| `targetSurface` | docs plus the existing exact WorkOrderAttempt, SpecialistBatch, SpecialistCellAttempt, SpecialistCellRetry, WorkflowCheckpoint, Advanced Ops, and verification evidence surfaces |
| `sourceEvidenceRefs` | `DEC-095`, `DEC-097`, `DEC-163`, `DEC-170`, `DEC-172`, `DEC-177`, `DEC-179`, `DEC-180`, `DEC-182`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/64_ai-company-checkpoint-resume-recovery-plan.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md`, `docs/121_ai-company-durable-specialist-batch-plan.md`, `docs/123_ai-company-specialist-cell-retry-plan.md`, `src/runtime/work-order-attempts.js`, `src/runtime/specialist-batches.js`, `src/runtime/specialist-cell-attempts.js`, `src/runtime/specialist-cell-retries.js`, `src/runtime/runtime-service.js` |
| `negativeEvidenceRefs` | current schema v21 has exact attempt inspection but no shared Ops supervision classifier, no exact cross-attempt preview contract, no common active/deadline/lineage vocabulary, and no safe implementation authority for settlement, cancel, quarantine mutation, replay, recovery, or inferred success |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove the future response-only module, exact GET route, browser-memory preview, and UI inspection action; preserve schema-v21 state and every source record byte-for-byte |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-ops-supervision-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | `OpsSupervisionPreview` implementation until a complete fielded decision, schema-v22 migration, durable recovery or disposition records, active attempt settlement or rewrite, cancellation, quarantine mutation, resume, replay, retry, rework, automatic or background scheduling, provider-backed execution, result application, source mutation, memory, runtime-agent Git/release, policy mutation, approval bypass, collection/list/search, and external connectors |
| `approvalStatement` | The operator delegates planning only for one exact response-only Ops supervision preview. Runtime, API, UI, schema, recovery, settlement, cancellation, replay, and every downstream authority require a later complete fielded decision. |

This planning authority is recorded as `DEC-183`. The complete fielded implementation handoff is
recorded separately as `DEC-184`. At the planning boundary, implementation was reserved for an exact
`DEC-185` decision; the implemented status below records its later consumption.

## Implemented Status

`DEC-185` accepted the exact complete 15-field implementation decision. Current runtime now exposes
the schema-v21-preserving response-only classifier, exact six-key GET, and browser-memory inspection
action described here. Focused runtime/API/UI verification proves all three active target types,
canonical replay, deadline equality, bounded errors, and zero state or source writes.

## Current Baseline Evidence

- Schema v21 persists active-before-execution evidence for `WorkOrderAttempt`, fixed specialist first
  attempts, and one optional specialist retry attempt #2.
- `DEC-097` already classifies active Builder, Reviewer, or QA stages as quarantine-only at the
  WorkflowCheckpoint recovery boundary. It does not classify schema-v19 WorkOrderAttempt records or
  schema-v20/v21 specialist records through one shared contract.
- Existing exact GET routes expose individual records, while the generic snapshot intentionally
  omits specialist durable maps. There is no collection, search, or automatic active-attempt
  selection authority.
- A settlement conflict or process interruption can leave an active record after the worker outcome
  is unknown. Replaying, marking success, or rewriting that record would be a new authority.

## Architecture Choice

The first Ops slice is a deterministic projection, not a recovery command:

```text
operator-selected exact active target
-> load current schema-v21 state through the no-migration read path
-> validate target, parent, record digests, and durable lineage
-> compare evaluatedAt with a persisted deadline when one exists
-> return one deeply frozen persisted=false OpsSupervisionPreview
-> stop with allowedActions=[]
```

No GET, UI render, refresh, timer, deadline, approval, or preview result starts a worker or writes
state. The preview reports what durable evidence proves and names every blocked action explicitly.

## Exact Target Types

The closed target vocabulary is:

```text
work-order-attempt
specialist-first-attempt
specialist-retry-attempt
```

### WorkOrderAttempt

- `targetId` is one exact active `WorkOrderAttempt`.
- `parentId` is its exact `ExecutionPlan`.
- The parent digest uses the existing canonical `computeExecutionPlanRecordDigest()` projection
  because ExecutionPlan has no persisted `recordDigest` field.
- The attempt must reference a current WorkOrder in that plan and preserve exact source,
  dependency, work-order, authority, checkpoint, and record digests.
- WorkOrderAttempt has no persisted deadline, so its time classification is
  `active-without-deadline`.

### Specialist First Attempt

- `targetId` is one exact active `SpecialistCellAttempt` with `attemptNumber=1`.
- `parentId` is its exact active `SpecialistBatch`.
- The batch must list the attempt in `cellAttemptIds`, and role, position, source, cell, input,
  deadline, and record evidence must validate through the existing contracts.

### Specialist Retry Attempt

- `targetId` is one exact active `SpecialistCellAttempt` with `attemptNumber=2`.
- `parentId` is its exact active `SpecialistCellRetry`.
- The retry must point to that attempt and to one failed immutable attempt #1. Retry, attempt,
  source batch, source attempt, deadline, and record digests must remain coherent.

Terminal attempts are not preview targets. Unknown ids, unsupported target types, malformed records,
and path/parent mismatches fail closed.

## Exact GET Contract

The future implementation candidate opens only:

```text
GET /api/ops/supervision-preview
  ?targetType=:targetType
  &targetId=:targetId
  &parentId=:parentId
  &expectedTargetRecordDigest=:expectedTargetRecordDigest
  &expectedParentDigest=:expectedParentDigest
  &evaluatedAt=:evaluatedAt
```

All six query keys are required exactly once. Extra, missing, repeated, blank, malformed, or
oversized query values fail before runtime dispatch. `evaluatedAt` is an explicit canonical UTC
timestamp so the same source tuple yields the same result. It must not precede the target
`startedAt` or be more than five minutes ahead of the runtime clock. At exact
`evaluatedAt=deadlineAt`, the target is `active-deadline-exceeded`, matching the existing
late-settlement boundary.

The GET route is not a collection, list, history, search, ranking, recommendation, polling command,
or automatic selection surface. It cannot enumerate active attempts hidden from existing exact
source surfaces.

Normalization reuses current runtime primitives:

- target and parent ids are trimmed, non-empty repository identifiers;
- digests are lowercase 64-character SHA-256 values;
- `targetType` must equal one closed target value;
- `evaluatedAt` is normalized through the existing timestamp contract;
- each query key occurs once, and the complete request target stays inside the existing server
  request-target limit.

Transport returns `200` for one valid preview, `400` for malformed or unsupported query input,
`404` for an unknown exact target or parent, and `409` for terminal, stale digest, parent, lineage,
deadline-source, or target-type conflict. Every error body uses the existing bounded safe error
envelope and contains no source or durable record body.

## Preview Contract

The response contains exactly:

```text
id
schemaVersion
persisted
status
targetType
targetId
parentId
targetRecordDigest
parentDigest
sourceDigest
attemptNumber
role
startedAt
deadlineAt
evaluatedAt
timeClassification
lineageClassification
evidenceRefs
allowedActions
blockedActions
previewDigest
```

Fixed values:

```text
schemaVersion=21
persisted=false
status=supervision-required
allowedActions=[]
```

`timeClassification` is one of:

```text
active-without-deadline
active-within-deadline
active-deadline-exceeded
```

`lineageClassification` is `source-bound`. A lineage or digest mismatch does not produce a weaker
preview; it fails closed. `evidenceRefs` contains identifiers and digests only. Raw source, prompt,
provider payload, stdout, stderr, argv, environment, absolute path, credential, transcript,
chain-of-thought, run body, and artifact body are excluded.

`evidenceRefs` has exactly these keys, using `null` where a target type has no corresponding
reference:

```text
targetRef
parentRef
executionPlanRef
workOrderRef
sourceBatchRef
sourceAttemptRef
checkpointRef
```

- WorkOrderAttempt sets `executionPlanRef`, `workOrderRef`, and its nullable `checkpointRef`.
- Specialist first attempt sets `sourceBatchRef`.
- Specialist retry attempt sets `sourceBatchRef` and the immutable failed first attempt as
  `sourceAttemptRef`.

`blockedActions` is the exact ordered array:

```text
settle-attempt
infer-success
infer-failure
cancel-attempt
quarantine-attempt
resume-attempt
replay-attempt
retry-attempt
rework
execute-provider
apply-result
mutate-source
apply-memory
commit
push
release
mutate-policy
bypass-approval
enumerate-attempts
```

The preview digest is SHA-256 over canonical key-sorted JSON of every normalized response field
except `id` and `previewDigest`. `id` is
`ops-supervision-preview-${previewDigest.slice(0, 16)}`. Repeating the exact query against unchanged
state returns byte-equivalent content.

## UI Boundary

The future UI may expose one `Inspect active attempt` action only beside an exact active record
already loaded through an authoritative surface. The response lives in browser memory and is cleared
on refresh, target change, input change, failed recomputation, or source record change.

Advanced Ops may show target type, role, attempt, started time, deadline classification, source refs,
and blocked actions. It must not show `Retry`, `Resume`, `Cancel`, `Quarantine`, `Settle`, or
`Mark successful` controls.

## Compatibility And Rollback

- Keep `STATE_SCHEMA_VERSION=21`; do not edit `createEmptyState`, file-store normalization,
  sequences, maps, migrations, or record validators.
- Preserve DEC-097 checkpoint recovery, DEC-172 WorkOrder stepping, DEC-179 durable first attempts,
  and DEC-182 retry behavior.
- Preserve exact existing routes and generic snapshot exclusion.
- Create no approval, Decision Inbox item, Run, Artifact, WorkflowCheckpoint, attempt, recovery
  record, or browser-local durable preference.
- Rollback removes only the response-only module, route, UI action, and browser-memory result.

## Implementation Target Surface

The future exact implementation decision may touch only:

```text
src/runtime/ops-supervision-preview.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-ops-supervision-preview.mjs
scripts/smoke-ui-slice-702.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, docs, and task ledgers may change only to keep evidence current. Contracts, file-store,
attempt records, execution coordinators, providers, prompts, packs, source files, Git, release,
memory, and policy modules remain out of scope.

## Focused Verification Plan

`scripts/smoke-ai-company-ops-supervision-preview.mjs` must prove:

- all three exact active target types and deterministic preview digests;
- explicit deadline boundary equality and no-deadline classification;
- evaluatedAt-before-start and unreasonably future timestamp refusal;
- exact target-record/parent-digest/attempt/role/source lineage validation;
- terminal, unknown, mismatched, malformed, extra, repeated, blank, and oversized query refusal;
- deep freeze, bounded identifiers/digests only, and complete blocked actions;
- exact evidenceRefs nullability, blocked-action order, canonical digest, id, and byte-equivalent
  replay;
- zero `saveState`, schema migration, record creation, worker/provider invocation, source mutation,
  approval, inbox, run, artifact, checkpoint, Git, release, memory, or policy mutation;
- unchanged DEC-097, DEC-172, DEC-179, and DEC-182 behavior.

`scripts/smoke-ui-slice-702.mjs` must prove exact-source action eligibility, browser-memory
invalidation, safe failure rendering, no authority controls, and desktop/mobile fit.

## Rollback Plan

1. Disable the exact GET route and UI action.
2. Remove the response-only module and browser-memory result.
3. Preserve schema-v21 state and every source record byte-for-byte.
4. Keep existing exact attempt, batch, retry, checkpoint, and plan inspection available.
5. Rerun focused compatibility, UI QA, README inventory, and aggregate verification.

## Acceptance Criteria

1. The implementation preserves schema v21 and performs no state write.
2. Only one exact operator-selected active target is accepted.
3. No endpoint enumerates attempts or chooses a target automatically.
4. Exact target record and parent digests are mandatory. WorkOrder parents use the existing
   canonical ExecutionPlan digest; specialist parents use their persisted record digests.
5. Specialist deadline classification is deterministic at the equality boundary.
6. WorkOrderAttempt is reported as active without a persisted deadline.
7. Lineage mismatch fails closed instead of returning a partial preview.
8. The response contains bounded identifiers, digests, classifications, and blocked actions only.
9. `allowedActions=[]` for every valid response.
10. Evidence refs, nullable fields, blocked-action order, preview digest, and id are canonical.
11. UI offers inspection only and clears browser-memory output on every invalidation boundary.
12. Existing checkpoint, WorkOrder, specialist batch, and retry paths remain compatible.
13. Focused runtime/API/UI, UI QA, and aggregate verification pass.

## Still Blocked

The exact implementation decision in
`docs/126_ai-company-ops-supervision-preview-implementation-decision-handoff.md` is accepted and
consumed as `DEC-185`. Schema-v22 migration, durable Ops records, active-attempt settlement, cancel, quarantine mutation,
resume, replay, retry, rework, background scheduling, provider execution, result application,
source mutation, memory, runtime-agent Git/release, policy mutation, approval bypass, collections,
and connectors remain separately gated.
