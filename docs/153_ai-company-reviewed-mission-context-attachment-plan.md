# AI Company Reviewed Mission Context Attachment Plan

## Purpose

`DEC-130`은 one exact recorded `MemoryRecall`, its immutable source `MemoryItem`, and one exact
same-project draft Mission을 response/browser-memory-only `MissionMemoryContextPreview`로 결합한다.
그 preview는 human review를 위한 evidence일 뿐이며 refresh 시 사라지고 Mission, prompt, policy,
Council, ExecutionPlan, or WorkOrder에 적용되지 않는다.

Stage 7의 첫 vertical slice는 reviewed preview를 one immutable project-local
`MissionContextAttachment(status=attached)` sidecar로 승격하는 것이다. 이 record는 Mission에
context를 주입하거나 policy를 바꾸지 않는다. Strategist or planner consumption은 Stage 7B의
별도 exact decision으로 남긴다.

## Completion Position

현재 required baseline은 schema v28과 `DEC-224`까지 구현됐다. 남은 순서는 다음과 같다.

1. Stage 7A: reviewed Mission context attachment record and exact inspection
2. Stage 7B: one explicit role-owned context consumption request
3. Stage 8: read-only provider WorkOrder expansion
4. Phase 9: isolated local dogfood and honest evidence close-out

이번 계획은 Stage 7A만 연다. Automatic retrieval, search, ranking, recommendation, Mission or
prompt injection, context application, provider work, next-Mission creation, and policy mutation은
계속 닫혀 있다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-requested-ai-company-reviewed-mission-context-attachment-planning-001` |
| `decisionStatus` | `approve-ai-company-reviewed-mission-context-attachment-planning-only` |
| `targetAuthority` | planning only for one deterministic local schema-v29 immutable MissionContextAttachment from one exact source-current DEC-130 MissionMemoryContextPreview and separate operator attachment review |
| `targetSurface` | docs plus existing Mission, MemoryItem, MemoryRecall, MissionMemoryContextPreview, exact inspection, Deliverables, and verification surfaces |
| `implementationPlanRefs` | this document |
| `sourceEvidenceRefs` | `DEC-121`, `DEC-127`, `DEC-130`, `DEC-163`, `DEC-224`, `docs/86_ai-company-mission-memory-context-preview-plan.md`, `docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md`, `docs/113_ai-company-multi-agent-completion-plan.md`, `src/runtime/memory-items.js`, `src/runtime/memory-recalls.js`, `src/runtime/mission-memory-context-preview.js`, `src/runtime/runtime-service.js` |
| `negativeEvidenceRefs` | schema v28 has no durable MissionContextAttachment sequence map record digest exact attach route Mission-bound inspection or durable UI evidence; DEC-130 preview is response/browser-memory-only and explicitly blocks persistence injection application recommendation and automatic selection |
| `rollbackRefs` | disable the future attach entrypoint and UI action, stop new records, preserve valid schema-v29 attachments and every source record, keep exact inspection available, perform no downgrade deletion Mission rewrite or implicit context use, and rerun focused compatibility UI QA README inventory and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-reviewed-mission-context-attachment-planning.mjs`; runtime and UI implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | schema-v29 implementation, MissionContextAttachment persistence, Strategist planner Council ExecutionPlan WorkOrder prompt or policy context consumption or injection, memory application, automatic retrieval enumeration search ranking scoring recommendation or selection, attachment revision replacement supersession deletion expiry mutation list history or cross-workspace use, provider-assisted context, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, collections, and external connectors |
| `approvalStatement` | The operator approves planning only for one exact reviewed MissionContextAttachment record. Runtime, schema, API, UI, persistence, context consumption or injection, and every downstream authority require a separate complete fielded decision. |

This planning authority is recorded as `DEC-225`. The complete implementation handoff is recorded as
`DEC-226`. Implementation remains reserved for an exact `DEC-227`.

## Why Attachment And Consumption Are Separate

A durable attachment answers only: "Which reviewed memory evidence was attached to this exact
Mission version?" It must not answer: "Should this role use the evidence now?"

- attachment persistence is an append-only audit fact;
- role consumption changes an execution input and therefore requires its own exact authority;
- keeping the Mission byte-equivalent avoids hidden policy or lifecycle mutation;
- retaining full positive, negative, redaction, and review evidence prevents a positive-only memory
  summary from widening authority;
- one-per-Mission in this first lifecycle avoids hidden ranking between multiple attachments.

## Exact Source Tuple

```text
one exact source-current draft Mission
+ one exact current unexpired MemoryRecall(status=recorded)
+ its exact immutable MemoryItem(status=stored)
+ exact bounded contextSpec and evaluatedAt
-> recompute DEC-130 MissionMemoryContextPreview from current schema-v28 state
+ exact source preview id and digest supplied by the operator
+ separate attachmentReview(decision=attach)
-> atomically migrate valid schema v28 state to schema v29
-> append one immutable MissionContextAttachment(status=attached)
-> leave Mission, MemoryRecall, MemoryItem, and every execution record unchanged
-> stop before any role, prompt, policy, Council, plan, or WorkOrder consumes the attachment
```

The runtime must not enumerate or rank memories, recalls, previews, or Missions. The operator supplies
the complete exact source tuple.

## Planned Schema v29

The migration adds only:

```text
schemaVersion = 29
sequences.missionContextAttachment
missionContextAttachments{}
```

Migration rules:

- preserve every valid schema-v28 value;
- create no attachment during migration, boot, read, GET, render, preview, or invalid input;
- reject future, partial, duplicate, or semantically invalid schema-v29 state;
- validate and recompute the complete source tuple before one atomic migration-plus-append save;
- allow at most one attachment per target Mission in the first lifecycle;
- resolve exact replay without sequence increment or save and reject divergent attachment attempts;
- retain valid v29 evidence during rollback without downgrade, deletion, source rewrite, or activation.

## Exact Attach Request

The proposed command is:

```text
POST /api/missions/:missionId/context-attachments
```

The exact ten-key JSON body is:

```text
memoryRecallId
memoryRecallRecordDigest
memoryItemId
memoryItemRecordDigest
targetMissionDigest
sourcePreviewId
sourcePreviewDigest
contextSpec
evaluatedAt
attachmentReview
```

`contextSpec` is byte-equivalent after canonical normalization to the DEC-130 request contract.
`attachmentReview` contains exactly:

```text
decision=attach
acknowledgement=reviewed-exact-memory-context-for-immutable-mission-attachment
rationale
reviewedAt
```

`rationale` is bounded, control-character-free, credential-screened operator text. `reviewedAt` is an
exact ISO timestamp at or after `evaluatedAt`; both timestamps must remain within the MemoryItem and
MemoryRecall validity windows. The runtime does not infer review from preview generation.

## MissionContextAttachment Contract

```text
id
persisted: true
status: attached
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
sourcePreviewId
sourcePreviewDigest
purpose
summary
applicability
evidenceRefs[]
negativeEvidenceRefs[]
redactionRefs[]
reviewRefs[]
expiresAt
attachmentReview
recommendationStatus: blocked
applicationStatus: blocked
missionInjectionStatus: blocked
workOrderInjectionStatus: blocked
policyInjectionStatus: blocked
roleConsumptionStatus: blocked
blockedActions[]
evaluatedAt
attachedAt
createdAt
recordDigest
```

`recordDigest` is canonical SHA-256 over every immutable field except `id`, `createdAt`, and
`recordDigest`. The record duplicates only the normalized DEC-130 evidence needed for durable review;
it stores no raw transcript, artifact body, source content, prompt, provider payload, environment
value, credential, or secret.

## Source-Current And Replay Rules

First write must recompute DEC-130 from current durable state and require exact equality for:

- Mission id, project, draft/unlinked status, and canonical target digest;
- MemoryRecall id, status, record digest, source preview id, project, and validity;
- MemoryItem id, status, record digest, project, and validity;
- contextSpec, applicability path and command subsets, complete evidence closure, and timestamps;
- source preview id, preview digest, blocked actions, and non-injection statement;
- fixed attach decision, acknowledgement, and bounded rationale.

An exact retained attachment resolves before mutable source recomputation and saves nothing. A
different preview, review, digest, or contextSpec for a Mission that already has an attachment is a
conflict. This slice creates no revision, replacement, or supersession lifecycle.

## Exact Inspection And UI

The Mission-bound exact locator is:

```text
GET /api/missions/:missionId/context-attachment
```

The first lifecycle permits zero or one result and adds no list, history, search, ranking, or broad
snapshot field. Deliverables may render the exact immutable attachment and its blocked authority.

The UI may expose `Attach reviewed context` only while the exact DEC-130 preview remains in browser
memory and all source digests still match. It requires the fixed acknowledgement, rationale, and
reviewedAt. After persistence it renders read-only source and review evidence and exposes no use,
inject, apply, recommend, replace, delete, provider, source, Git, release, schedule, or next-Mission
control.

## Compatibility And Rollback

- Preserve DEC-121 MemoryItem, DEC-127 MemoryRecall, and DEC-130 response-only preview behavior.
- Preserve Mission bytes, lifecycle, links, Council evidence, plans, WorkOrders, attempts, checkpoints,
  delivery, learning, Ops recovery, Growth, provider, commit, and release behavior.
- Exclude `missionContextAttachments` from the generic runtime snapshot.
- Rollback disables creation and UI action, preserves valid v29 records and exact inspection, and
  performs no downgrade, deletion, Mission rewrite, source cleanup, or implicit consumption.

## Planned Implementation Surface

```text
src/runtime/contracts.js
src/runtime/file-store.js
src/runtime/assertions.js
src/runtime/mission-context-attachments.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
ui/styles.css
scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs
scripts/smoke-ui-slice-716.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

README, decision docs, inventory, and task ledger may change only to keep evidence current.

## Focused Verification Plan

The runtime/API smoke must prove atomic v28-to-v29 migration, no passive creation, exact ten-key
binding, current DEC-130 recomputation, separate review, timestamp and expiry rules, one-per-Mission
uniqueness, canonical immutable digest, exact replay with zero save, stale/divergent no-write refusal,
exact Mission-bound inspection, reload and rollback retention, source-record byte equivalence, generic
snapshot exclusion, and DEC-121/127/130/224 compatibility.

The UI smoke must prove exact preview gating, acknowledgement/rationale/timestamp requirements,
read-only attachment rendering, refresh hydration through the exact Mission locator, safe stale and
malformed failures, absent consumption or downstream controls, and bounded desktop/mobile fit.

Both smokes must prove zero automatic selection, search, ranking, recommendation, Mission/WorkOrder/
prompt/policy injection, memory application, provider call, source mutation, Git/release, scheduling,
next-Mission, policy mutation, approval bypass, collection, or connector effect.

## Stop Condition

Planning is complete when `DEC-225`, `DEC-226`, this plan, the fielded handoff, focused planning smoke,
README, master docs, inventory, and task ledger agree. Schema/runtime/API/UI implementation remains
blocked until one exact value-matching `DEC-227` decision is supplied. Stage 7B role consumption
requires another decision after the attachment implementation is independently verified.
