# AI Company MemoryRecall Preview Plan

## Purpose

이 문서는 schema-v14에 저장된 한 `MemoryItem(status=stored)`을 runtime behavior에 바로
적용하지 않고, operator가 exact id로 선택해 project-local 재사용 적합성을 검토할 수 있는
response-only `MemoryRecallPreview`로 변환하는 다음 vertical slice를 계획한다.

Planning-only target은 자동 search, ranking, recommendation이 아니다. 한 개의 source-current,
unexpired MemoryItem과 operator-owned `recallSpec`을 exact tuple로 검증하고, application 권한이
없는 read-only preview 하나를 반환하는 경계다. Runtime schema, durable record, Mission, task,
source, provider, Git, scheduler는 변경하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-memory-recall-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-memory-recall-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only project-local MemoryRecallPreview from one operator-selected exact source-current unexpired schema-v14 MemoryItem |
| `targetSurface` | docs plus the existing schema-v14 MemoryItem exact inspection, Deliverables evidence, memory-readiness spec, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-049`, `DEC-051`, `DEC-115`, `DEC-118`, `DEC-119`, `DEC-121`, `docs/25_memory-readiness-decision-spec.md`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/78_ai-company-memory-candidate-preview-plan.md`, `docs/80_ai-company-durable-memory-item-persistence-plan.md`, `src/runtime/contracts.js`, `src/runtime/memory-items.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v14 with exact source-bound MemoryItem inspection but no recall preview contract, recallSpec, runtime preview method, POST route, browser-memory preview, focused recall smoke, automatic search, ranking, recommendation, Mission context injection, memory application, or cross-workspace authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future response-only recall preview entrypoint and UI form, discard response-local and browser-memory previews, preserve schema-v14 MemoryItem and every source record without migration downgrade or mutation, keep exact MemoryItem inspection available, and rerun focused compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-memory-recall-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | MemoryRecallPreview implementation, automatic retrieval search ranking recommendation or selection, Mission or WorkOrder context injection, memory application import export deletion expiry mutation refresh GC supersession replacement or cross-workspace use, durable recall records, skill creation or promotion, provider-assisted recall, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one response-only project-local MemoryRecallPreview from one exact operator-selected schema-v14 MemoryItem. This does not approve runtime/API/UI implementation, automatic retrieval, search, ranking, recommendation, Mission injection, memory application, durable recall records, import, export, deletion, refresh, cross-workspace use, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors. |

## Current Baseline Evidence

- Current runtime state is schema v14 with immutable `MemoryItem(status=stored)` records.
- A MemoryItem binds one accepted LearningCandidate review, the DEC-118 preview digest, project-only
  scope, applicability, positive and negative evidence, redaction/review refs, expiry, and separate
  storage approval.
- Current GET is exact source-bound record inspection. It does not evaluate a new use case or make the
  item eligible to steer runtime behavior.
- `applicationStatus=blocked`, `promotionStatus=blocked`, empty export/deletion refs, and fixed
  `blockedActions` remain authoritative.
- There is no recall preview contract, automatic retrieval, search, ranking, recommendation,
  Mission context injection, source application, or cross-workspace memory path.

## Architecture Choice

The next slice should remain response-only and operator-selected:

```text
one exact schema-v14 MemoryItem(status=stored)
+ exact memoryItemId and recordDigest
+ one bounded operator-owned recallSpec
-> require current project-only scope and unexpired evidence
-> validate recall purpose, target paths, commands, and refs as source-contained subsets
-> return one deeply frozen persisted=false MemoryRecallPreview
-> keep preview only in the response and browser memory
-> stop before automatic retrieval, ranking, recommendation, Mission injection, or application
```

The runtime must not enumerate or score MemoryItems to choose one. Exact operator selection is the
only planned entry path. A preview states that an item is reviewable for one bounded use case; it does
not state that the item is correct, recommended, applied, or approved for execution.

## Entry Gate

Future implementation must require all of the following from one strict schema-v14 read:

1. exact `memoryItemId` exists and its `recordDigest` matches;
2. item status is exactly `stored` and every immutable source binding remains valid;
3. `applicationStatus` and `promotionStatus` remain `blocked`;
4. explicit `evaluatedAt` is not earlier than item creation and is earlier than item expiry;
5. `recallSpec.workspaceScope.projectId` equals the item project exactly;
6. target paths and verification commands are subsets of item applicability;
7. evidence, negative-evidence, redaction, and review refs are non-empty source-contained subsets;
8. request acknowledgement is exactly `operator-selected-exact-memory-item-for-read-only-recall`;
9. non-application statement is exactly `recall-preview-not-runtime-application`;
10. no raw body, secret, provider payload, global scope, Mission injection, application, or widened
    authority field is present.

Boot, GET, snapshot, hydration, rendering, storage, repeated inspection, or broad continuation never
creates a MemoryRecallPreview.

## MemoryRecallPreview Contract

```text
id
persisted: false
status: recall-ready
retrievalMode: exact-id-operator-selected
projectId
workspaceScope.projectId
sourceMemoryItemId
sourceMemoryItemRecordDigest
sourceMemoryCandidatePreviewId
sourceLearningCandidateId
sourceLearningCandidateReviewId
purpose
summary
applicability
sourceRefs[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
expiresAt
recommendationStatus: blocked
applicationStatus: blocked
missionInjectionStatus: blocked
blockedActions[]
nonApplicationStatement: recall-preview-not-runtime-application
previewDigest
evaluatedAt
```

Contract rules:

- The preview is deterministic, deeply frozen, response-only, and never assigned a durable recall id.
- `recall-ready` means only that the exact operator-selected item can be reviewed for the supplied
  use case.
- No score, confidence, rank, winner, recommendation, automatic selection, or provider inference is
  allowed.
- Positive, negative, redaction, and review evidence remain attached; negative evidence cannot be
  omitted to improve apparent fit.
- Project scope cannot widen to global or another workspace.
- Target paths and verification commands cannot exceed source applicability.
- Expired or invalid source evidence produces no preview.
- The preview cannot be consumed as Mission, Council, ExecutionPlan, WorkOrder, prompt, policy,
  source mutation, commit, push, or release authority.

## Operator RecallSpec

The exact request-owned `recallSpec` should contain:

```text
purpose
workspaceScope.projectId
applicability.summary
applicability.targetPathAllowlist[]
applicability.verificationCommands[]
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
acknowledgement=operator-selected-exact-memory-item-for-read-only-recall
nonApplicationStatement=recall-preview-not-runtime-application
```

All text is bounded and checked for control characters and obvious credential markers. The runtime
must not invent purpose, scope, applicability, evidence, acknowledgement, or authority fields.

## Digest And Replay Binding

`previewDigest` is SHA-256 over canonical key-sorted preview content before derived `id` and
`previewDigest` fields are added. The id is derived from that digest.

The exact request tuple is:

```text
memoryItemId
memoryItemRecordDigest
evaluatedAt
recallSpec
```

- Exact replay returns the same preview and digest without writes.
- Any stale item, digest mismatch, expired source, wrong project, widened path/command/ref, missing
  negative evidence, malformed input, credential marker, or authority field fails without output or
  mutation.

## Runtime And API Plan

Planned pure/runtime surface:

```text
src/runtime/memory-recall-preview.js
previewMemoryItemRecall(input)
```

Planned route:

```text
POST /api/memory-items/:memoryItemId/recall-preview
```

The route accepts bounded exact JSON only. It returns one response-local preview and calls no
`saveState`. There is no new GET route, list/search endpoint, runtime snapshot field, durable record,
approval, Decision Inbox item, run, artifact, provider attempt, source write, Git action, schedule,
Mission creation, or context injection.

## UI Boundary

- Add one explicit recall preview form only beside an exact hydrated stored MemoryItem.
- Require operator-owned purpose and exact source-contained scope fields.
- Keep the preview only in browser memory and clear it on refresh, item/source change, input edit, or
  failed recomputation.
- Label the result `recall-ready`, `persisted:false`, `retrieval:exact-id`,
  `recommendation:blocked`, `application:blocked`, and `mission-injection:blocked`.
- Expose no list/search/rank/recommend/apply/import/export/delete/refresh/promote/provider/source/Git/
  release/schedule/next-Mission/policy/bypass/connector action.

## Compatibility

- Keep schema v14 unchanged.
- Preserve DEC-118 preview, DEC-121 persistence and exact inspection, and every immutable source
  record and digest.
- Preserve standalone task, Council, WorkOrder, checkpoint, DeliveryPackage, Growth Evidence Ledger,
  proposal, and browser-local preference behavior.
- The preview cannot satisfy storage, application, Mission, policy, skill, provider, source, Git,
  release, scheduling, or next-Mission authority.

## Focused Verification Plan

Future `scripts/smoke-ai-company-memory-recall-preview.mjs` must prove:

- strict schema-v14 read-only load and exact MemoryItem/digest/source binding;
- exact-id operator selection with no enumeration, search, ranking, or automatic recommendation;
- bounded exact recallSpec, project-only scope, source-contained applicability and refs, required
  negative evidence, acknowledgement, non-application statement, and conservative credential refusal;
- canonical digest, stable id, deep freeze, exact replay, and zero `saveState`;
- expired, stale, malformed, cross-workspace, widened-authority, provider, raw-body, application, and
  Mission-injection attempts produce no output or mutation;
- DEC-118/121 plus standalone/Council/Growth/proposal/memory-readiness compatibility.

Future `scripts/smoke-ui-slice-665.mjs` must prove bounded POST, exact-item-only form visibility,
browser-memory invalidation, read-only source evidence, safe failures, absent downstream controls,
and desktop/mobile fit.

## Rollback Plan

1. Disable the future recall preview runtime method, POST route, and UI form.
2. Discard response-local and browser-memory previews.
3. Preserve schema-v14 MemoryItems and every immutable source record without downgrade, rewrite,
   deletion, reopen, or implicit activation.
4. Keep DEC-121 storage and exact inspection available.
5. Rerun focused DEC-118/121 compatibility, README, inventory, UI QA, and aggregate verification.

## Stop Conditions

Stop before implementation if the complete fielded decision is absent. During future implementation,
stop with no write or preview when source identity, digest, status, expiry, project scope,
applicability, evidence, negative evidence, redaction, review, acknowledgement, non-application, or
request shape is invalid.

Stop before automatic retrieval, search, ranking, recommendation, Mission or WorkOrder injection,
memory application, durable recall persistence, import/export/delete/refresh/expiry mutation,
cross-workspace use, skill, provider, raw evidence, source/Git/release, scheduling, next Mission,
policy mutation, bypass, or connectors.

## Exclusions

- runtime/API/UI implementation before the complete fielded decision
- schema-v15 or durable MemoryRecall record
- automatic item enumeration, search, ranking, scoring, recommendation, or selection
- Mission, Council, ExecutionPlan, WorkOrder, prompt, or policy context injection
- memory application, source mutation, import, export, delete, refresh, expiry mutation, or GC
- cross-workspace/global memory, skills, providers, raw evidence, Git/release, scheduling, connectors

## Current Gate

- Planning-only authority: accepted as `DEC-122`.
- Complete fielded implementation handoff: documented as `DEC-123` and consumed by `DEC-124`.
- Runtime/API/UI implementation: accepted and completed as the exact response-only slice in `DEC-124`.
- Current runtime remains schema v14 and now exposes one exact-id operator-selected response/browser-memory preview without durable recall, automatic retrieval, recommendation, injection, or application authority.

## Verification

```bash
node scripts/smoke-ai-company-memory-recall-preview-planning.mjs
node scripts/smoke-ai-company-memory-recall-preview.mjs
node scripts/smoke-ai-company-durable-memory-item-planning.mjs
node scripts/smoke-ai-company-durable-memory-item.mjs
node scripts/smoke-ui-slice-664.mjs
node scripts/smoke-ui-slice-665.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
