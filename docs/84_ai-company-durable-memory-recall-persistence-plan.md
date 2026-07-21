# AI Company Durable MemoryRecall Persistence Plan

## Purpose

`DEC-124`는 operator가 고른 MemoryItem 하나를 읽어 response-only `MemoryRecallPreview`를 만든다.
이 문서는 그 preview를 자동 retrieval이나 runtime application으로 바꾸지 않고, 한 번의 명시적
operator review가 있었다는 local audit fact로 남기는 다음 Phase 8 slice를 계획한다.

Planning authority는 schema-v15 후보와 exact persistence contract까지만 연다. Runtime, API, UI,
schema migration, record creation은 complete fielded implementation decision 전까지 닫혀 있다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-durable-memory-recall-planning-001` |
| `decisionStatus` | `approve-ai-company-durable-memory-recall-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v15 durable recorded MemoryRecall from one exact source-current schema-v14 MemoryRecallPreview and separate operator record approval |
| `targetSurface` | docs plus the existing schema-v14 MemoryItem, response-only MemoryRecallPreview, Deliverables evidence, memory-readiness spec, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-049`, `DEC-051`, `DEC-115`, `DEC-118`, `DEC-121`, `DEC-122`, `DEC-124`, `docs/25_memory-readiness-decision-spec.md`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/78_ai-company-memory-candidate-preview-plan.md`, `docs/80_ai-company-durable-memory-item-persistence-plan.md`, `docs/82_ai-company-memory-recall-preview-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/memory-items.js`, `src/runtime/memory-recall-preview.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v14 with immutable stored MemoryItems and response-only exact-id MemoryRecallPreview but no memoryRecall sequence map contract record digest persistence function exact inspection route durable UI record approval focused persistence smoke list history search ranking recommendation Mission injection or application authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable future persist and exact inspection entrypoints and UI controls, stop new MemoryRecall creation, preserve every valid schema-v15 record and immutable source record without downgrade delete rewrite or implicit application, keep DEC-124 response-only preview available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-durable-memory-recall-planning.mjs`; schema/runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v15 implementation, durable MemoryRecall creation persistence list index history mutation deletion supersession or replay scheduling, automatic MemoryItem enumeration search ranking scoring recommendation or selection, Mission Council ExecutionPlan WorkOrder prompt or policy context injection, memory application import export expiry mutation refresh GC quarantine replacement or cross-workspace use, skill creation or promotion, provider-assisted recall, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one exact schema-v15 durable recorded MemoryRecall from the existing response-only preview and a separate explicit record approval. This does not approve schema/runtime/API/UI implementation, automatic retrieval, search, ranking, recommendation, Mission injection, memory application, recall history, source mutation, Git, release, scheduling, policy mutation, approval bypass, or connectors. |

## Current Baseline

- Runtime state is schema v14 with immutable `MemoryItem(status=stored)` records.
- `previewMemoryItemRecall()` uses `loadStateReadonly()` and accepts one exact current unexpired item,
  its record digest, an evaluation time, and a bounded project-local `recallSpec`.
- The result is deeply frozen, deterministic, `persisted=false`, `status=recall-ready`, and
  `retrievalMode=exact-id-operator-selected`.
- Response and browser memory are the only preview locations. Refresh, source change, input edit, or
  failed recomputation clears it.
- There is no durable MemoryRecall, recall list, history, index, recommendation, Mission injection,
  WorkOrder injection, or memory application path.

## Architecture Choice

The first durable recall slice records one reviewed fact and nothing else:

```text
schema-v14 MemoryItem(status=stored)
+ exact operator recallSpec
-> recompute DEC-124 MemoryRecallPreview from current state
-> require exact preview id/digest and separate recordApproval
-> reject stale, expired, divergent, malformed, cross-workspace, or widened input
-> atomically migrate valid state to schema v15 and append one MemoryRecall(status=recorded)
-> expose exact source-bound inspection
-> stop before list, history, search, ranking, recommendation, injection, application, provider, or Git
```

`MemoryRecallPreview` remains the response-only eligibility view. `MemoryRecall` is an immutable local
audit record. The persistence rule is one record per source MemoryItem, with exact replay handled
idempotently. Preview generation never implies persistence, and persistence never implies application.

## Entry Gate

Future persistence must require all of the following:

1. exact `memoryItemId` exists as a source-current unexpired schema-v14 stored item;
2. exact `memoryItemRecordDigest` matches the current immutable record;
3. exact `evaluatedAt` and bounded operator-owned `recallSpec` pass the DEC-124 contract;
4. runtime recomputes DEC-124 instead of trusting a browser-supplied preview object;
5. supplied `memoryRecallPreviewId` and `memoryRecallPreviewDigest` match recomputation;
6. project scope, paths, commands, positive evidence, complete negative evidence, redaction refs, and
   review refs remain source-contained;
7. request includes exact `recordApproval.decision=record`, acknowledgement
   `reviewed-exact-memory-recall-for-local-audit`, bounded rationale, and exact ISO `reviewedAt`;
8. preview and item are unexpired at persistence time;
9. no MemoryRecall already exists for the source MemoryItem, except an exact idempotent replay;
10. every blocked downstream authority remains blocked in both source and new record.

Migration, boot, GET, snapshot hydration, UI rendering, preview generation, broad approval, or repeated
evidence must never create a MemoryRecall.

## Planned State Schema v15

The later complete fielded decision may authorize only this additive migration:

```text
schemaVersion = 15
sequences.memoryRecall
memoryRecalls{}
```

No recall refs are added to immutable MemoryItem, LearningCandidate, LearningCandidateReview, Mission,
plan, WorkOrder, task, approval, package, acceptance, or checkpoint records. Read models resolve the
single record by `sourceMemoryItemId` and validate its full source tuple.

Migration requirements:

- preserve every valid schema-v14 domain value;
- add an empty sequence and map only, creating no record during migration;
- keep older migration predicates tied to their introduction versions;
- reject unknown future schemas and partial or invalid schema-v15 records;
- validate the whole request, source tuple, preview recomputation, expiry, and record approval before
  the one atomic migration-plus-append save;
- preserve valid schema-v15 records during rollback without downgrade, deletion, or source rewrite.

## Durable MemoryRecall Contract

```text
id
persisted: true
status: recorded
projectId
workspaceScope
sourceMemoryItemId
sourceMemoryItemRecordDigest
sourceMemoryCandidatePreviewId
sourceLearningCandidateId
sourceLearningCandidateReviewId
sourceMemoryRecallPreviewId
sourceMemoryRecallPreviewDigest
retrievalMode: exact-id-operator-selected
purpose
summary
applicability
sourceRefs[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
recordApproval
  - decision: record
  - acknowledgement: reviewed-exact-memory-recall-for-local-audit
  - rationale
  - reviewedAt
recommendationStatus: blocked
applicationStatus: blocked
missionInjectionStatus: blocked
expiresAt
blockedActions[]
nonApplicationStatement: recall-preview-not-runtime-application
recordDigest
createdAt
updatedAt
```

`recorded` means only that the operator reviewed and chose to retain this exact bounded recall fact.
It does not mean recommended, applied, injected, exported, refreshed, or promoted. `createdAt`,
`updatedAt`, and `recordApproval.reviewedAt` are equal in this immutable slice.

The record stores normalized ids, summaries, paths, commands, and evidence refs only. It excludes raw
transcript, artifact body, source content, provider payload, prompt, environment, credential, secret,
unrelated personal data, and chain-of-thought.

## Exact Request And Idempotency

```text
memoryItemId
memoryItemRecordDigest
evaluatedAt
recallSpec
memoryRecallPreviewId
memoryRecallPreviewDigest
recordApproval
```

- Runtime recomputes the exact current preview from the item and `recallSpec`.
- `recordDigest` binds every immutable MemoryRecall field except itself.
- Exact replay returns the existing record without sequence increment or save.
- A different preview, recallSpec, or approval for a MemoryItem that already owns a record conflicts.
- This slice creates no revision, replacement, supersession, deletion, or multi-record recall history.

## Runtime And API Plan

The later implementation decision may open only:

```text
GET  /api/memory-items/:memoryItemId/memory-recall
POST /api/memory-items/:memoryItemId/persist-memory-recall
```

GET is exact source-bound inspection, not a list or retrieval engine. POST accepts bounded exact JSON,
recomputes DEC-124, requires the exact separate record approval, and appends at most one record.
Neither route calls providers, schedulers, source mutation, Git, release, policy, skill, memory
application, or connectors.

## UI Boundary

- Preserve the DEC-124 response-only preview form and result.
- Add one explicit `MemoryRecall 기록` action only for an exact current preview after implementation
  authority is accepted.
- Show source item id/digest, preview id/digest, project scope, purpose, evidence and negative evidence,
  expiry, record approval, `status=recorded`, and every blocked downstream authority.
- Hydration may show the single exact durable record, but must not offer list, history, search, ranking,
  recommendation, Mission injection, application, edit, delete, export, or promotion controls.

## Failure And No-Write Rules

The future focused smoke must prove no migration or record write for missing/extra fields, stale ids or
digests, expired item or preview, cross-workspace scope, unsupported path/command/ref, dropped negative
evidence, raw-body or credential input, wrong approval, widened authority, corrupt state, read/boot/
render, and failed recomputation.

It must also prove one-save migration and append, exact replay, divergent conflict, reload hydration,
source record immutability, no provider call, no source change, no automatic selection, and compatibility
with DEC-118, DEC-121, and DEC-124.

## Rollback

Disable the persist and exact-inspection entrypoints and UI control. Stop new record creation, preserve
valid schema-v15 records and every source record, and never downgrade, delete, rewrite, reopen, or apply
the retained evidence. The response-only DEC-124 preview remains available. Rerun migration, focused,
UI, compatibility, README, inventory, UI QA, and aggregate verification.

## Current Gate

- Planning-only authority: accepted as `DEC-125`.
- Complete fielded implementation handoff: documented as `DEC-126`.
- Schema/runtime/API/UI implementation: blocked pending that exact complete decision.
- Current authoritative behavior remains schema v14 with response/browser-memory MemoryRecallPreview.

## Verification

```bash
node scripts/smoke-ai-company-durable-memory-recall-planning.mjs
node scripts/smoke-ai-company-memory-recall-preview.mjs
node scripts/smoke-ui-slice-665.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
