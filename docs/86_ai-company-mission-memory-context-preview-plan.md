# AI Company Mission Memory Context Preview Plan

## Purpose

이 문서는 schema-v15에 저장된 한 `MemoryRecall(status=recorded)`을 Mission에 바로 주입하지
않고, operator가 선택한 한 draft Mission에 어떤 범위로 참고할 수 있는지 검토하는 response-only
`MissionMemoryContextPreview` vertical slice를 계획한다.

Durable recall은 과거 evidence를 다시 검토했다는 audit fact다. 그것만으로 현재 Mission의 goal,
prompt, Council, ExecutionPlan, WorkOrder, policy를 바꿀 권한은 생기지 않는다. 이번 계획은 exact
recall과 exact draft Mission을 source-current state에서 함께 검증하고, 적용 권한이 없는 context
preview 하나를 반환하는 데서 멈춘다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-mission-memory-context-preview-planning-001` |
| `decisionStatus` | `approve-ai-company-mission-memory-context-preview-planning-only` |
| `targetAuthority` | planning only for one deterministic response-only project-local MissionMemoryContextPreview from one operator-selected exact source-current unexpired schema-v15 MemoryRecall and one exact source-current draft Mission |
| `targetSurface` | docs plus the existing schema-v15 MemoryRecall exact inspection, Mission exact inspection, Deliverables evidence, memory-readiness spec, and verification surfaces |
| `sourceEvidenceRefs` | `DEC-049`, `DEC-051`, `DEC-115`, `DEC-118`, `DEC-121`, `DEC-124`, `DEC-127`, `docs/25_memory-readiness-decision-spec.md`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/82_ai-company-memory-recall-preview-plan.md`, `docs/84_ai-company-durable-memory-recall-persistence-plan.md`, `src/runtime/contracts.js`, `src/runtime/memory-items.js`, `src/runtime/memory-recalls.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/app.js` |
| `negativeEvidenceRefs` | current state is schema v15 with exact source-bound recorded recall and Mission inspection but no MissionMemoryContextPreview contract, target Mission digest, contextSpec, runtime preview method, POST route, browser-memory preview, focused context smoke, Mission or WorkOrder injection, memory application, automatic selection, or provider authority |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the future response-only context preview entrypoint and UI form, discard response-local and browser-memory previews, preserve schema-v15 MemoryRecall, MemoryItem, Mission, and every source record without migration, mutation, reopen, or implicit application, and rerun focused compatibility README inventory UI QA and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-mission-memory-context-preview-planning.mjs`; runtime/API/UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | MissionMemoryContextPreview implementation, schema-v16 migration, Mission Council ExecutionPlan WorkOrder prompt or policy context injection, memory application, automatic MemoryItem or MemoryRecall enumeration search ranking scoring recommendation or selection, recall list history index or lifecycle mutation, provider-assisted context generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors |
| `approvalStatement` | The operator approves planning only for one response-only project-local MissionMemoryContextPreview from one exact operator-selected schema-v15 MemoryRecall and one exact draft Mission. This does not approve runtime/API/UI implementation, Mission or WorkOrder injection, memory application, automatic retrieval, search, ranking, recommendation, providers, schema migration, source mutation, Git, release, scheduling, policy mutation, approval bypass, or connectors. |

## Current Baseline

- Current state is schema v15 with immutable `MemoryItem(status=stored)` and
  `MemoryRecall(status=recorded)` records.
- A MemoryRecall preserves the exact item and preview digests, bounded project-local applicability,
  positive and negative evidence, redaction/review refs, expiry, and separate record approval.
- Exact GET inspection exposes audit evidence only. There is no recall list, ranking, recommendation,
  Mission injection, or application path.
- Missions are durable project-local records. A newly registered Mission begins as `status=draft` and
  includes `id`, `projectId`, `title`, `goal`, `constraints`, `deliverableType`, links, and timestamps.
- Missions do not carry a persisted digest. The future response-only path can compute a target digest
  from current stable fields without changing schema v15.

## Architecture Choice

The smallest next boundary is an exact, operator-selected review:

```text
one exact current unexpired MemoryRecall(status=recorded)
+ its exact current source MemoryItem
+ one exact current draft Mission in the same project
+ one bounded operator-owned contextSpec
-> recompute and validate source digests and complete evidence closure
-> compute targetMissionDigest from current stable Mission fields
-> return one deeply frozen persisted=false MissionMemoryContextPreview
-> keep the result in the POST response and browser memory only
-> stop before Mission, Council, ExecutionPlan, WorkOrder, prompt, or policy injection
```

The runtime must not enumerate recalls or Missions to choose a match. It must not score relevance,
recommend application, or update the Mission. A preview means only that the exact operator-selected
evidence is ready for human context review.

## Entry Gate

Future implementation must validate this complete tuple through one schema-v15 no-migration read:

1. exact `memoryRecallId` exists, is `recorded`, and its `recordDigest` matches;
2. its source MemoryItem exists, is `stored`, and the source id and digest still match;
3. `evaluatedAt` is an exact ISO timestamp within both recall and item validity windows;
4. exact `missionId` exists with `status=draft` and the same `projectId` as the recall;
5. the current Mission fields produce the expected deterministic `targetMissionDigest`;
6. `contextSpec.workspaceScope.projectId` matches both source and target exactly;
7. target paths and verification commands remain subsets of recall applicability;
8. evidence, negative-evidence, redaction, and review refs preserve the full source closure;
9. acknowledgement is exactly `operator-selected-recorded-recall-for-mission-context-review`;
10. non-injection statement is exactly `memory-context-preview-not-mission-or-prompt-injection`;
11. no raw body, secret, provider payload, application, automatic selection, or widened authority field
    is present.

Boot, GET, snapshot, hydration, rendering, exact inspection, refresh, or broad continuation must never
create this preview.

## Mission Digest

`targetMissionDigest` is SHA-256 over canonical key-sorted current Mission fields:

```text
id
projectId
title
goal
constraints
deliverableType
status
linkedTaskId
councilSessionId
createdAt
updatedAt
```

The digest is response evidence only. It is not persisted back to the Mission. Any Mission edit or
status/link transition changes the digest and invalidates an earlier request or browser preview.

## ContextSpec

The operator-owned request must contain only:

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
acknowledgement=operator-selected-recorded-recall-for-mission-context-review
nonInjectionStatement=memory-context-preview-not-mission-or-prompt-injection
```

All text is bounded, control-character-free, and conservatively screened for obvious credential
markers. The runtime does not invent purpose, scope, paths, commands, evidence, or authority.

## MissionMemoryContextPreview Contract

```text
id
persisted: false
status: context-review-ready
selectionMode: exact-id-operator-selected
projectId
workspaceScope.projectId
targetMissionId
targetMissionDigest
targetMissionStatus: draft
sourceMemoryRecallId
sourceMemoryRecallRecordDigest
sourceMemoryItemId
sourceMemoryItemRecordDigest
sourceMemoryRecallPreviewId
purpose
summary
applicability
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
expiresAt
recommendationStatus: blocked
applicationStatus: blocked
missionInjectionStatus: blocked
workOrderInjectionStatus: blocked
blockedActions[]
nonInjectionStatement: memory-context-preview-not-mission-or-prompt-injection
previewDigest
evaluatedAt
```

The output is deterministic, deeply frozen, response-only, and has no durable sequence or map. It
contains no score, confidence, rank, winner, automatic recommendation, prompt text, or provider
inference. Positive, negative, redaction, and review evidence remain attached together.

## Runtime, API, And UI Plan

Planned pure/runtime surface:

```text
src/runtime/mission-memory-context-preview.js
previewMissionMemoryContext(input)
```

Planned route:

```text
POST /api/missions/:missionId/memory-context-preview
```

The route accepts bounded exact JSON, uses `loadStateReadonly()`, and never calls `saveState`. There is
no new GET, list/search endpoint, snapshot field, approval, inbox item, run, artifact, provider attempt,
durable record, source write, Git action, schedule, Mission transition, or WorkOrder transition.

The UI may expose one explicit form only when an exact draft Mission and exact hydrated recorded recall
are selected. It keeps the result in browser memory and clears it on refresh, Mission/recall/source
change, input edit, or failed recomputation. It exposes no apply, inject, recommend, search, provider,
source, Git, release, schedule, next-Mission, policy, bypass, or connector control.

## Compatibility And Rollback

- Keep schema v15 and every durable source record unchanged.
- Preserve DEC-118, DEC-121, DEC-124, and DEC-127 behavior and exact inspection routes.
- Preserve standalone task, Council, WorkOrder, checkpoint, DeliveryPackage, Growth Evidence Ledger,
  proposal, and browser-local preference behavior.
- Rollback disables only the future pure method, POST route, and UI form, then discards response-local
  and browser-memory previews. It requires no migration downgrade or record cleanup.

## Focused Verification Plan

Future `scripts/smoke-ai-company-mission-memory-context-preview.mjs` must prove exact current recall,
item, Mission, project, digest, expiry, contextSpec, applicability, complete negative evidence,
redaction/review refs, acknowledgement, and non-injection binding; canonical digest, stable id, deep
freeze, exact replay, and zero `saveState`; stale, non-draft, cross-project, widened, malformed,
credential-marked, provider, injection, and application attempts producing no output or mutation; and
DEC-121/124/127 compatibility.

Future `scripts/smoke-ui-slice-667.mjs` must prove bounded exact POST, explicit-selection-only form,
browser-memory invalidation, read-only evidence, safe failures, absent downstream controls, and
desktop/mobile fit.

## Stop Conditions

Stop before implementation while the complete fielded implementation decision is absent. During a
future implementation, stop with no preview and no write on any stale source, digest, expiry, status,
project, applicability, evidence, negative-evidence, redaction, review, acknowledgement,
non-injection, credential, or request-shape failure.

Stop before schema migration, durable context records, Mission/Council/ExecutionPlan/WorkOrder/prompt/
policy injection, memory application, automatic retrieval/search/ranking/recommendation, providers,
raw evidence, source/Git/release, scheduling, next-Mission, policy mutation, bypass, or connectors.

## Current Gate

- Planning-only authority: accepted as `DEC-128`.
- Complete fielded implementation handoff: documented as `DEC-129`.
- Runtime/API/UI implementation: blocked pending a complete fielded operator decision.
