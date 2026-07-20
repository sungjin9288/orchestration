# AI Company Durable MemoryItem Persistence Plan

## Purpose

이 문서는 `DEC-118`의 response-only `MemoryCandidate` preview를 one local durable `MemoryItem`으로
승격하기 위한 Phase 8 다섯 번째 vertical slice를 계획한다. Planning-only authority는 exact
accepted LearningCandidate review evidence, operator-owned `memorySpec`, recomputed preview, and one
explicit storage approval에 결속된 additive schema-v14 persistence boundary까지만 정의한다.

Memory application, recommendation retrieval, import, export, deletion, expiry mutation, refresh,
garbage collection, cross-workspace use, skill promotion, provider generation, source/Git/release,
scheduling, next Mission, profile/policy mutation, approval bypass, and connectors는 열지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-durable-memory-item-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-memory-item-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v14 durable stored MemoryItem from one exact source-current schema-v13 MemoryCandidate preview and explicit operator storage approval |
| `targetSurface` | docs plus the existing schema-v13 LearningCandidate, LearningCandidateReview, response-only MemoryCandidate preview, read-only runtime loader, Deliverables evidence, memory-readiness spec, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-049`, `DEC-051`, `DEC-076`, `DEC-106`, `DEC-109`, `DEC-112`, `DEC-115`, `DEC-118`, `docs/25_memory-readiness-decision-spec.md`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/72_ai-company-learning-candidate-preview-plan.md`, `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`, `docs/76_ai-company-learning-candidate-review-outcome-plan.md`, `docs/78_ai-company-memory-candidate-preview-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/learning-candidates.js`, `src/runtime/learning-candidate-reviews.js`, `src/runtime/memory-candidate-preview.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v13 with response-only MemoryCandidate previews but no memoryItem sequence map status contract validator record digest persistence function exact inspection route durable UI storage approval payload focused persistence smoke export deletion expiry mutation refresh application retrieval skill promotion or cross-workspace authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future persist and exact inspection entrypoints and UI controls, stop new MemoryItem creation, preserve valid schema-v14 records and every immutable source record, never downgrade delete rewrite reopen or auto-apply durable evidence, keep the DEC-118 response-only preview available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-durable-memory-item-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v14 implementation, durable MemoryItem creation, recommendation retrieval search ranking import apply export deletion expiry mutation refresh garbage collection supersession quarantine or cross-workspace use, skill creation or promotion, LearningCandidate or review mutation, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact schema-v14 durable stored MemoryItem from the existing response-only preview and a separate explicit storage approval. This does not approve schema/runtime/API/UI implementation, memory retrieval or application, import, export, deletion, expiry mutation, refresh, cross-workspace use, skill promotion, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Current runtime state is schema v13 with immutable `LearningCandidate` records and separate
  append-only `LearningCandidateReview` events.
- `previewLearningCandidateMemory()` accepts only one source-current unexpired candidate plus its
  `decision=accepted` review and exact operator-owned project-scoped `memorySpec`.
- The DEC-118 result is deterministic, deeply frozen, `persisted=false`, `status=review-ready`,
  `storageStatus=not-approved`, and response/browser-memory-only.
- The preview contains source/evidence/negative-evidence/redaction/review refs, project-only scope,
  applicability, expiry, blocked actions, and
  `nonPersistenceStatement=readiness-only-not-durable-memory`.
- There is no memory sequence, map, durable id, stored status, storage approval payload, exact record
  inspection, export/deletion evidence, recommendation retrieval, application, or skill authority.

## Architecture Choice

The first durable memory slice is storage only:

```text
schema-v13 immutable LearningCandidate
+ append-only LearningCandidateReview(decision=accepted)
+ exact operator memorySpec
-> recompute the DEC-118 response-only MemoryCandidate
-> require exact preview id/digest and one explicit storageApproval
-> reject stale, expired, divergent, malformed, cross-workspace, redaction-unsafe, or widened input
-> atomically migrate valid state to schema v14 and append one immutable MemoryItem(status=stored)
-> expose source-bound read-only record inspection
-> stop before recommendation retrieval, apply, export, delete, refresh, skill, provider, source, or Git
```

`MemoryCandidate` remains the readiness preview type. `MemoryItem` is the durable type. An accepted
LearningCandidate review or a review-ready preview never implies storage approval.

The explicit persistence command is the storage approval boundary. Its bounded
`storageApproval` payload is embedded in the immutable MemoryItem as evidence; it does not create a
generic Approval or Decision Inbox item and grants no authority beyond this one local write.

## Entry Gate

Future persistence must require all of the following:

1. exact `learningCandidateId` and `learningCandidateReviewId` exist and remain source-current;
2. review decision is exactly `accepted` and the immutable candidate is unexpired at storage time;
3. exact `previewId`, `candidateDigest`, `candidateRecordDigest`, `reviewDigest`, and `evaluatedAt`
   match the DEC-118 source tuple;
4. request includes the same exact bounded operator-owned `memorySpec`;
5. runtime recomputes the DEC-118 preview instead of trusting a supplied browser object;
6. exact `memoryCandidatePreviewId` and `memoryCandidatePreviewDigest` match recomputation;
7. workspace scope equals the candidate project and applicability/evidence/redaction/review refs
   remain source-contained;
8. request includes exact `storageApproval.decision=store`,
   `storageApproval.acknowledgement=reviewed-memory-candidate-for-local-project-storage`, and one
   bounded operator rationale;
9. preview expiry remains after the persistence time;
10. no MemoryItem already exists for the source accepted review, except an exact idempotent replay.

Migration, boot, GET, snapshot hydration, UI rendering, preview generation, accepted review
creation, broad approval, or repeated evidence never creates a MemoryItem.

## Planned State Schema v14

The later complete fielded decision may authorize only this additive migration:

```text
schemaVersion = 14
sequences.memoryItem
memoryItems{}
```

No MemoryItem refs are added to immutable LearningCandidate, LearningCandidateReview, Mission,
MissionCloseOut, DeliveryPackage, acceptance, checkpoint, plan, WorkOrder, task, or approval
records. Read models resolve the unique item by source LearningCandidateReview id and validate its
complete source tuple.

Migration requirements:

- Preserve every valid schema-v13 domain value after normalization.
- Add an empty sequence and map only; migration creates no MemoryItem.
- Keep each older domain migration predicate tied to its introduction schema version.
- Reject unknown future schemas and partial or semantically invalid schema-v14 records.
- Validate request, source freshness, preview recomputation, and storage approval before the one
  atomic migration-plus-append save.
- Preserve valid schema-v14 records during rollback without downgrade, deletion, source rewrite, or
  implicit activation.

## Durable MemoryItem Contract

```text
id
persisted: true
status: stored
projectId
workspaceScope
sourceMissionId
sourceLearningCandidateId
sourceLearningCandidateReviewId
sourceMemoryCandidatePreviewId
sourceMemoryCandidatePreviewDigest
sourceLearningPreviewId
candidateDigest
candidateRecordDigest
reviewDigest
summary
applicability
sourceRefs[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
storageApproval
  - decision: store
  - acknowledgement: reviewed-memory-candidate-for-local-project-storage
  - rationale
  - reviewedAt
redactionStatus: review-required
applicationStatus: blocked
promotionStatus: blocked
expiresAt
exportRefs[]
deletionRefs[]
blockedActions[]
nonPersistenceStatement: source-readiness-was-not-storage-approval
recordDigest
createdAt
updatedAt
```

Contract rules:

- `stored` is the only schema-v14 MemoryItem lifecycle status. It means durable local presence, not
  active recommendation, retrieval, application, export, promotion, or policy.
- `createdAt`, `updatedAt`, and `storageApproval.reviewedAt` are equal for this immutable slice.
- `expiresAt` is copied from the current preview and is metadata only. No timer, scheduler, refresh,
  mutation, or garbage collector is created.
- `exportRefs` and `deletionRefs` are empty immutable arrays in this slice.
- `nonPersistenceStatement` records that the source readiness preview did not authorize storage;
  the separate exact storage approval did.
- The item contains normalized summaries, ids, paths, commands, and evidence refs only. It excludes
  raw transcript, artifact body, source content, provider payload, prompt, environment, credential,
  secret, unrelated personal data, and chain-of-thought.

## Storage Approval And Digest Binding

The exact request tuple is:

```text
learningCandidateId
learningCandidateReviewId
previewId
candidateDigest
candidateRecordDigest
reviewDigest
evaluatedAt
memorySpec
memoryCandidatePreviewId
memoryCandidatePreviewDigest
storageApproval
```

- Runtime recomputes the current MemoryCandidate from `evaluatedAt` and `memorySpec`.
- `recordDigest` binds every immutable MemoryItem field except itself.
- Exact replay returns the existing item without sequence increment or save.
- A different preview, approval, or source digest for a review that already owns an item is a
  conflict. This slice creates no revision, supersession, replacement, or multiple item history.
- Stale source, changed memorySpec, expired evidence, missing negative evidence, unsupported refs,
  raw content, credential markers, cross-workspace scope, or widened blocked authority fails before
  migration or append and leaves serialized state unchanged.

## Runtime And API Plan

The later implementation decision may open only:

```text
GET  /api/learning-candidates/:learningCandidateId/memory-item
POST /api/learning-candidates/:learningCandidateId/persist-memory-item
```

The GET route is exact source-bound record inspection only. It is not recommendation retrieval,
search, ranking, import, application, or cross-workspace lookup. The POST route accepts bounded exact
JSON, validates keys at transport and runtime boundaries, recomputes DEC-118, requires the exact
storage approval, and appends at most one record.

Neither route calls provider, scheduler, source mutation, Git, release, policy, skill, export,
deletion, refresh, or connector code.

## UI Boundary

- Keep the response-only MemoryCandidate preview form and result available.
- Add one explicit `MemoryItem 저장` action only for an exact current unexpired preview.
- Require visible confirmation of project-only scope, attached negative evidence,
  `redactionStatus=review-required`, source readiness not being storage approval, and the separate
  storage acknowledgement.
- Hydrate only exact durable id/digest/status/source/approval evidence from the GET route.
- Rendering, refresh, preview generation, or accepted review must never persist an item.
- Expose no search, suggest, retrieve-for-application, import, apply, export, delete, expire,
  refresh, garbage-collect, supersede, promote-skill, provider, source, Git, release, scheduling,
  next-Mission, policy, bypass, or connector control.
- Long ids, digests, refs, paths, commands, and summaries must fit desktop and mobile.

## Compatibility And Migration

- Preserve DEC-109/112/115/118 routes, records, exact tuples, and response-only preview behavior.
- Preserve `loadStateReadonly()` no-bootstrap/no-migration semantics.
- Preserve standalone task, Council, WorkOrder, checkpoint, DeliveryPackage, Growth Evidence Ledger,
  proposal, browser preference, and memory-readiness behavior.
- Create no Mission, task, plan, WorkOrder, checkpoint, package, acceptance, close-out, candidate,
  review, run, artifact, generic approval, inbox, provider attempt, skill, source change, Git action,
  release, schedule, next Mission, policy mutation, or connector evidence.
- Read-only exact item inspection does not make the item eligible to steer any runtime behavior.

## Focused Verification Plan

Future `scripts/smoke-ai-company-durable-memory-item.mjs` must prove:

- atomic v13-to-v14 migration with empty sequence/map, full value preservation, reload, and strict
  partial/future-schema refusal;
- no item on migration, boot, GET, snapshot, hydration, render, preview, review, invalid input, or
  expiry;
- exact transport/runtime keys, candidate/review tuple, memorySpec, preview id/digest, and
  storageApproval binding;
- runtime DEC-118 recomputation rather than trusting a supplied browser object;
- one immutable normalized `stored` item with deterministic record digest, attached negative
  evidence, explicit storage approval, blocked application/promotion, and empty export/deletion refs;
- exact replay idempotency and divergent same-review conflict;
- stale, malformed, extra-field, unsupported evidence/path/command, raw-body, credential-marker,
  expired, corrupt-source, cross-workspace, digest, or authority-widening refusal with byte-identical
  state;
- no mutation to source candidate/review/Mission/task/plan/WorkOrder/checkpoint/package/acceptance/
  close-out/run/artifact/approval/inbox/Council/source/provider/skill/Git/release/scheduling/
  next-Mission/policy/bypass/connector evidence;
- no recommendation retrieval, search, ranking, import, apply, export, deletion, refresh, GC, or
  cross-workspace behavior;
- DEC-109/112/115/118 and standalone/Council/Growth/proposal compatibility.

Future `scripts/smoke-ui-slice-664.mjs` must prove exact-gated persistence, explicit storage
acknowledgement, read-only exact-item rendering, response-only preview compatibility, safe stale/
expired/API failures, absent downstream controls, refresh hydration, and desktop/mobile fit.

## Rollback Plan

1. Disable future persist and exact inspection routes plus durable UI actions and rendering.
2. Stop new MemoryItem creation; do not auto-expire, delete, export, apply, refresh, or promote items.
3. Preserve valid schema-v14 items, embedded storage approvals, and every referenced source record.
4. Never downgrade schema, delete records, rewrite source evidence, or reopen Mission/task state.
5. Keep DEC-118 response-only preview and the existing memory-readiness surface available.
6. Rerun migration, focused runtime/UI, compatibility, README/inventory, UI QA, and aggregate gates.

## Implementation Target Surface

The later complete fielded decision may open only:

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/memory-items.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-durable-memory-item.mjs
scripts/smoke-ui-slice-664.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

## Implementation Sequence

1. Add strict schema-v14 sequence/map migration and durable MemoryItem validator.
2. Add pure record normalization and digest helpers using the recomputed DEC-118 preview.
3. Validate exact storage approval and append one item atomically with migration.
4. Add bounded POST persistence and exact source-bound read-only GET inspection.
5. Add explicit storage confirmation and read-only durable evidence rendering.
6. Add focused migration/runtime/API/UI/compatibility smokes.
7. Sync docs, README, inventory, task ledger, UI QA, aggregate verification, review, commit, and push.

## Acceptance Criteria

1. Valid schema-v13 state migrates additively without item creation or domain-value loss.
2. Only one exact current unexpired DEC-118 preview plus explicit storage approval creates one item.
3. Browser preview objects are never trusted as persistence authority.
4. Exact replay is idempotent; divergent same-review persistence fails without write.
5. Item remains `stored` with application/promotion blocked and no downstream authority.
6. Source evidence and accepted review remain immutable.
7. Existing response-only preview and prior AI Company/standalone/Growth/proposal behavior is
   unchanged.
8. Focused runtime/API/UI, compatibility, README/inventory, UI QA, and aggregate gates pass.

## Exclusions

- schema-v14 or runtime/API/UI implementation before a complete fielded decision
- memory recommendation retrieval, search, ranking, import, apply, export, deletion, expiry
  mutation, refresh, garbage collection, quarantine, supersession, or replacement
- cross-workspace/global memory or policy/profile learning
- skill creation/promotion
- LearningCandidate or LearningCandidateReview rewrite/revision/delete/rework
- provider generation or raw transcript/artifact/source/provider/env/secret ingestion
- source mutation, runtime-agent commit, push, release, scheduling, next Mission, approval bypass,
  or connectors

## Planning Status

- Planning-only authority: accepted as `DEC-119`.
- Complete fielded implementation handoff: documented as `DEC-120`.
- Schema/runtime/API/UI implementation: blocked pending the complete fielded decision.
- Current runtime remains schema v13 with DEC-118 response/browser-memory preview only.
- Durable MemoryItem creation and every retrieval/application/export/delete/skill/provider/
  downstream authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-durable-memory-item-planning.mjs
node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs
node scripts/smoke-ai-company-memory-candidate-preview.mjs
node scripts/smoke-ui-slice-663.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
