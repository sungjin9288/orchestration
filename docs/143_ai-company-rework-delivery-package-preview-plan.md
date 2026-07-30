# AI Company Rework DeliveryPackage Preview Plan

## Purpose

This document defines the planning-only Stage 5I boundary after one exact
source-current `DEC-209` rework QA execution has passed and stopped at
`DELIVERY_READY`. Planning-only authority is recorded as `DEC-210`, and
`DEC-211` records the complete fielded implementation handoff, and `DEC-212`
accepts and implements that exact no-write boundary.

The future implementation candidate returns one deterministic response-only
`ReworkDeliveryPackagePreview`. It keeps schema v24, creates no durable
DeliveryPackage, and does not reuse the existing generic package persistence
path. Package persistence, acceptance, Mission/task close-out, retry, recovery,
provider execution, source mutation, Git, release, memory, scheduling, policy,
bypass, and connectors remain separately blocked.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-rework-delivery-package-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-rework-delivery-package-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only schema-v24 ReworkDeliveryPackagePreview from one operator-selected exact source-current passed DEC-209 rework QA execution and terminal DELIVERY_READY checkpoint |
| `targetSurface` | docs plus the existing immutable ReworkPlan, ReworkPlanAcceptance, BuilderReworkDispatch, Approval, WorkOrderAttempt, Run, Artifact, WorkflowCheckpoint, ExecutionPlan, WorkOrder, Mission, StaffingPlan, StaffingEntry, CouncilSession, CompanyBlueprint, role-source, and verification evidence surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-088`, `DEC-091`, `DEC-094`, `DEC-163`, `DEC-169`, `DEC-172`, `DEC-188`, `DEC-191`, `DEC-194`, `DEC-197`, `DEC-200`, `DEC-203`, `DEC-206`, `DEC-209`, `docs/113_ai-company-multi-agent-completion-plan.md`, `docs/137_ai-company-builder-rework-source-mutation-plan.md`, `docs/139_ai-company-reviewer-reexecution-plan.md`, `docs/141_ai-company-rework-qa-execution-plan.md`, `src/runtime/delivery-packages.js`, `src/runtime/rework-qa-execution.js`, `src/runtime/runtime-service.js`, `src/runtime/file-store.js` |
| `negativeEvidenceRefs` | the generic DeliveryPackage preview validates the original terminal Builder approval and generic Reviewer and QA evidence, has no DEC-203 mutation DEC-206 Reviewer attempt #2 DEC-209 QA attempt #1 raw Artifact or rework checkpoint digest contract, and its existing persistence and acceptance surfaces would exceed a response-only rework preview authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | remove the future response-only module, exact GET route, browser-memory preview, and UI inspection action; preserve schema-v24 state, project source, and every durable record byte-for-byte |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-rework-delivery-package-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | implementation until exact DEC-212, schema migration, durable DeliveryPackage creation persistence acceptance rejection changes-requested supersession or deletion, Mission/task close-out or done, another QA attempt, retry, recovery, provider-backed execution, source mutation, runtime-agent commit push or release, memory or learning application, scheduling, profile or policy mutation, approval bypass, and external connectors |
| `approvalStatement` | The operator approves planning only for one exact response-only rework DeliveryPackage preview. Runtime, API, UI, durable package, acceptance, close-out, retry, recovery, source, Git, release, memory, scheduling, policy, bypass, and connector authority require a later complete fielded decision. |

Broad continuation and delegated non-critical self-approval are sufficient for
this no-write planning slice only. They do not authorize the implementation
described below.

## Current Source Audit

The existing generic `buildExecutionPlanDeliveryPreviewFromState()` cannot
safely represent the rework delivery:

- it validates the original plan approval and terminal Builder live-mutation
  approval rather than the accepted ReworkPlan and DEC-200 rework mutation
  approval;
- it expects generic Reviewer and QA completion evidence and does not bind
  Reviewer WorkOrderAttempt #2, QA WorkOrderAttempt #1, their canonical record
  digests, or the DEC-203 mutation evidence;
- its package digest payload does not contain `mutationEvidenceDigest`,
  `reviewerEvidenceDigest`, `qaInputDigest`, or exact rework attempt refs;
- its response declares durable persistence allowed, and the existing UI can
  expose package persistence and acceptance actions;
- widening that generic function would make the already-existing durable
  package route reachable from a rework state without a separate durable
  package decision.

Stage 5I therefore uses a dedicated response-only projection. The existing
generic preview, persistence, acceptance, and close-out paths remain unchanged
and ineligible for a rework delivery.

## Architecture Choice

```text
operator-selected exact accepted ReworkPlan
  -> load current schema-v24 state without migration or save
  -> validate DEC-203 mutation, DEC-206 Reviewer pass, and DEC-209 QA pass
  -> validate exact terminal DELIVERY_READY checkpoint and current source bytes
  -> read bounded Reviewer and QA Artifact bytes
  -> derive one canonical reworkDeliveryEvidenceDigest
  -> compose one deeply frozen persisted=false ReworkDeliveryPackagePreview
  -> retain the result in the HTTP response and browser memory only
  -> stop before generic or durable DeliveryPackage handling
```

No new domain record, sequence, map, Run, Artifact, attempt, checkpoint,
Approval, Decision Inbox item, Mission transition, task transition, or source
write is allowed.

## Exact Source Gate

Every preview requires all of the following:

1. Current state is valid schema v24 and loads through the no-migration,
   no-save path.
2. The selected ReworkPlan and ReworkPlanAcceptance are exact, immutable,
   accepted, source-current, and bound to one active Mission and ExecutionPlan.
3. The immutable BuilderReworkDispatch, DEC-200 approved rework mutation
   Approval, DEC-203 Builder mutation attempt #3, Run, and exact raw mutation
   Artifact bytes validate.
4. Reviewer WorkOrderAttempt #2 is completed, its terminal Run has
   `mappedReviewStatus=passed`, and its review Artifact record and bounded exact
   raw bytes validate against `reviewerEvidenceDigest`.
5. QA WorkOrderAttempt #1 is completed, owns exactly one
   `executionMode=rework-qa-node-check` terminal Run and one `qa-evidence`
   Artifact, and its record digest validates.
6. The bounded QA Artifact JSON has matching request, Reviewer, mutation, QA
   input, expected input, observed input, and creation-time evidence. Its nested
   `result` has `verdict=passed`, `mutationDetected=false`, and the exact
   source-bound checks. Run, attempt, Artifact, and WorkOrder refs are validated
   separately from the surrounding durable records rather than invented inside
   the JSON envelope.
7. Builder, Reviewer, and QA WorkOrders are completed; the ExecutionPlan is
   `delivery-ready`, has no active WorkOrder, and has
   `stopReason=separate-delivery-package-decision-required`.
8. The latest checkpoint is the exact terminal `DELIVERY_READY` checkpoint
   resumed from the DEC-206 `QA_READY` checkpoint with
   `stopReason=rework-qa-passed-delivery-ready`.
9. Current target files remain contained single-link regular files whose bytes
   match the DEC-203 post-mutation and DEC-209 QA input evidence.
10. StaffingPlan, StaffingEntry, CouncilSession, CompanyBlueprint, role sources,
    local-stub provider mode, Mission, control task, and fixed three-WorkOrder
    graph remain source-current.
11. No DeliveryPackage ref, DeliveryPackageAcceptance, MissionCloseOut,
    competing active attempt, unresolved blocking Decision Inbox item, or
    downstream record exists for this rework delivery.

Malformed, stale, drifted, provider-backed, interrupted, failed, retried,
partially retained, oversized, symlinked, or downstream-mutated evidence fails
before projection output.

## Exact GET Contract

The future implementation candidate opens only:

```text
GET /api/rework-plans/:reworkPlanId/delivery-package-preview
  ?qaWorkOrderAttemptId=:qaWorkOrderAttemptId
  &qaWorkOrderAttemptRecordDigest=:qaWorkOrderAttemptRecordDigest
  &qaRunId=:qaRunId
  &qaEvidenceArtifactId=:qaEvidenceArtifactId
  &deliveryReadyCheckpointId=:deliveryReadyCheckpointId
  &checkpointDigest=:checkpointDigest
  &sourceDigest=:sourceDigest
  &qaInputDigest=:qaInputDigest
  &evaluatedAt=:evaluatedAt
```

The path and all nine query keys are required exactly once. Missing, extra,
repeated, blank, malformed, or oversized values fail before runtime dispatch.
`evaluatedAt` must be canonical UTC, cannot precede QA completion, and cannot be
more than five minutes ahead of runtime time.

The caller cannot provide file bytes, Artifact bodies, commands, paths, role,
attempt number, package fields, accepted risks, unresolved items, persistence
intent, acceptance intent, Mission transition, or downstream action.

## Evidence And Digest Contract

`reworkDeliveryEvidenceDigest` is canonical SHA-256 over identifiers, record
digests, exact bounded Artifact content digests, and current source digests for:

```text
reworkPlan
reworkPlanAcceptance
builderReworkDispatch
builderReworkApproval
builderMutationAttempt
builderMutationRun
builderMutationArtifacts
reviewerAttempt
reviewerRun
reviewArtifact
qaAttempt
qaRun
qaArtifact
qaReadyCheckpoint
deliveryReadyCheckpoint
currentTargetFileDigests
mutationEvidenceDigest
reviewerEvidenceDigest
qaInputDigest
```

Raw Artifact or source bytes never appear in the response. Reads must enforce
the existing contained-path, regular-file, no-follow, byte-cap, JSON envelope,
and redaction boundaries before hashing.

The preview digest is canonical SHA-256 over every normalized preview field
except `id`, `previewDigest`, and `evaluatedAt`. The stable id is:

```text
rework-delivery-package-preview-${previewDigest.slice(0, 16)}
```

`evaluatedAt` is request freshness evidence and does not change preview
identity. `generatedAt` is the exact immutable DEC-209 QA Artifact `createdAt`
timestamp, not runtime wall-clock time. Repeating the exact request against
unchanged durable and source evidence returns the same id, digest, and package
content.

## Preview Contract

The response contains exactly:

```text
id
schemaVersion
persisted
status
projectId
missionId
executionPlanId
reworkPlanId
qaWorkOrderId
qaWorkOrderAttemptId
qaRunId
qaEvidenceArtifactId
terminalCheckpointId
terminalCheckpointDigest
sourceDigest
mutationEvidenceDigest
reviewerEvidenceDigest
qaInputDigest
reworkDeliveryEvidenceDigest
deliveredArtifactRefs
workOrderResults
verificationSummary
acceptedRisks
unresolvedItems
authoritySummary
generatedAt
evaluatedAt
allowedActions
blockedActions
previewDigest
```

Fixed values:

```text
schemaVersion=24
persisted=false
status=rework-delivery-preview-ready
allowedActions=[]
```

`deliveredArtifactRefs` is a deterministic duplicate-free source-order list of
the original accepted plan artifacts plus the exact DEC-203 mutation,
DEC-206 review, and DEC-209 QA artifacts. `workOrderResults` contains the fixed
Builder, Reviewer, and QA WorkOrders and their complete retained Run, Artifact,
and attempt refs without raw content.

`verificationSummary` reports only normalized check counts, pass counts,
`kind=node-syntax-check`, `verdict=passed`, and
`mutationDetected=false`. `acceptedRisks` contains the source-backed limitation
that QA proves Node.js syntax only. `unresolvedItems` is empty only when no
source Reviewer, QA, checkpoint, or blocking Decision evidence reports an open
item.

Every `authoritySummary` flag is false, including durable persistence,
acceptance, close-out, commit, push, release, memory, learning, scheduling,
provider, source mutation, retry, recovery, and policy mutation.

`blockedActions` is the exact ordered array:

```text
persist-delivery-package
accept-delivery-package
reject-delivery-package
request-package-changes
close-mission
close-task
retry-qa
recover-qa
execute-provider
mutate-source
apply-memory
commit
push
release
schedule-background
mutate-policy
bypass-approval
```

## UI Boundary

The future UI may expose one `재작업 DeliveryPackage 미리보기` action only for
an exact source-current completed Stage 5H projection. The result lives only in
browser memory and clears on refresh, Mission or ReworkPlan selection change,
source digest change, input change, or failed recomputation.

The UI may show delivered artifact refs, fixed role results, verification
summary, risks, evidence digests, and blocked actions. It must not render the
existing `DeliveryPackage 기록`, acceptance, close-out, retry, recovery,
provider, source, Git, release, memory, scheduling, policy, bypass, or connector
controls for this preview.

## Compatibility And Rollback

- Keep `STATE_SCHEMA_VERSION=24`.
- Do not edit `createEmptyState`, file-store normalization, migrations,
  sequences, maps, durable DeliveryPackage contracts, or generic snapshot
  shape.
- Preserve DEC-094 generic reviewed-delivery preview, DEC-100 durable package,
  DEC-103 package acceptance, DEC-106 Mission close-out, DEC-188 through
  DEC-209 rework evidence, standalone task flow, Council, specialists, memory,
  Growth, commit, and release behavior.
- Keep generic `previewExecutionPlanDelivery`,
  `persistExecutionPlanDeliveryPackage`, `acceptDeliveryPackage`, and
  `closeOutMissionAndTask` ineligible for this rework preview.
- Rollback removes only the dedicated response-only module, exact GET route, UI
  action, and browser-memory result.

## Implementation Target Surface

The future exact implementation decision may touch only:

```text
src/runtime/rework-delivery-package-preview.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-rework-delivery-package-preview.mjs
scripts/smoke-ui-slice-711.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, docs, and task ledgers may change only to keep evidence current.
Contracts, file-store, durable delivery modules, execution coordinator,
provider adapters, prompts, packs, source files, Git, release, memory, policy,
and connector modules remain out of scope.

## Focused Verification Plan

`scripts/smoke-ai-company-rework-delivery-package-preview.mjs` must prove:

- exact nine-key GET transport and canonical timestamp bounds;
- schema-v24 no-migration and no-state-byte-change behavior;
- exact DEC-203, DEC-206, and DEC-209 attempt, Run, Artifact raw-byte, digest,
  source, checkpoint, and graph lineage;
- current source-byte and local-stub provider binding;
- deterministic id, preview digest, rework delivery evidence digest, artifact
  refs, role results, verification summary, risks, and blocked authority;
- malformed, missing, extra, repeated, stale, failed, interrupted, drifted,
  symlinked, oversized, provider-backed, and downstream-record input refusal;
- no Run, Artifact, attempt, checkpoint, Approval, Decision, DeliveryPackage,
  acceptance, close-out, source, provider, Git, release, memory, scheduling,
  policy, or connector mutation;
- one terminal rework fixture actually calls the generic preview, durable
  package, acceptance, and close-out entrypoints and proves that all four remain
  unavailable for the rework delivery;
- DEC-094, DEC-100, DEC-103, DEC-106, DEC-188, DEC-191, DEC-194, DEC-197,
  DEC-200, DEC-203, DEC-206, and DEC-209 compatibility.

`scripts/smoke-ui-slice-711.mjs` must prove exact readiness visibility,
browser-memory-only lifecycle, safe clearing and stale failure behavior,
responsive fit, and absence of durable package or downstream controls.

The focused planning smoke, UI QA, README/inventory coupling checks, and
aggregate verification remain required before planning close-out.

## Stop Condition

This slice is complete when:

- `DEC-210` records planning-only authority;
- `DEC-211` records the complete fielded implementation handoff;
- focused planning, documentation coupling, UI QA, and aggregate verification
  pass;
- the dedicated runtime/API/UI projection changes no schema, durable state,
  source, provider, Git, release, memory, scheduling, policy, bypass, or
  connector behavior.

`DEC-212` satisfies the implementation gate. Durable DeliveryPackage handling,
package decisions, Mission/task close-out, retry, recovery, and every other
downstream authority remain separately blocked.
