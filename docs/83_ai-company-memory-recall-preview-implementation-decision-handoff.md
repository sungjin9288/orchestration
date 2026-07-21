# AI Company MemoryRecall Preview Implementation Decision Handoff

## Purpose

이 문서는 `docs/82_ai-company-memory-recall-preview-plan.md`의 planning-only 결과를 다음
operator decision으로 전달한다. 대상은 exact operator-selected MemoryItem 하나를 검토하는
response-only recall preview이며, automatic retrieval/search/ranking/recommendation이나 runtime
application 권한은 포함하지 않는다.

## Current Gate

- Planning-only authority is accepted as `DEC-122`.
- This complete fielded implementation handoff is recorded as `DEC-123`.
- Current runtime remains schema v14 with immutable stored MemoryItems and exact inspection only.
- No MemoryRecallPreview module, runtime method, POST route, browser-memory recall preview, focused
  implementation smoke, search, ranking, recommendation, Mission injection, or application exists.
- General continuation, broad approval, or delegated non-critical self-approval does not open this
  retrieval-sensitive runtime implementation.

## Minimum Required Decision Fields

The operator decision must include every field below:

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
sourceEvidenceRefs
negativeEvidenceRefs
rollbackRefs
focusedSmokeRefs
aggregateVerificationRef
stillBlockedAuthorities
approvalStatement
```

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-memory-recall-preview-implementation-001
decisionStatus=approve-ai-company-memory-recall-preview-implementation-slice
targetAuthority=one deterministic response-only project-local MemoryRecallPreview from one operator-selected exact source-current unexpired schema-v14 MemoryItem
targetSurface=src/runtime/memory-recall-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-memory-recall-preview.mjs, scripts/smoke-ui-slice-665.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/82_ai-company-memory-recall-preview-plan.md
runtimePath=require one exact source-current schema-v14 MemoryItem with status=stored plus exact memoryItemId recordDigest evaluatedAt and bounded operator-owned recallSpec, reject expired stale malformed cross-workspace source-widening negative-evidence-dropping credential raw-body automatic-selection recommendation application or Mission-injection input before output, return one deeply frozen deterministic persisted=false status=recall-ready retrievalMode=exact-id-operator-selected preview through one bounded POST response and browser memory, and stop before saveState durable recall records list search ranking recommendation Mission or WorkOrder context injection memory application source mutation Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=keep schemaVersion 14, do not edit createEmptyState file-store normalization MemoryItem or source records, preserve DEC-118 DEC-121 routes and Deliverables evidence, preserve standalone task Council WorkOrder checkpoint DeliveryPackage Growth proposal and browser-local preference behavior, create no GET list search snapshot approval inbox run artifact provider attempt or durable record, and clear browser-memory preview on refresh source change input edit or failed recomputation
sourceEvidenceRefs=DEC-049, DEC-051, DEC-115, DEC-118, DEC-119, DEC-121, DEC-122, DEC-123, docs/25_memory-readiness-decision-spec.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/78_ai-company-memory-candidate-preview-plan.md, docs/80_ai-company-durable-memory-item-persistence-plan.md, docs/82_ai-company-memory-recall-preview-plan.md, src/runtime/contracts.js, src/runtime/memory-items.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v14 with exact source-bound stored MemoryItem inspection but no MemoryRecallPreview module contract digest runtime method POST route UI form response-only browser-memory preview focused runtime smoke UI smoke automatic retrieval search ranking recommendation Mission context injection memory application durable recall record or cross-workspace authority
rollbackRefs=disable the response-only recall preview method POST route and UI form, discard response-local and browser-memory previews, preserve schema-v14 MemoryItems and every source record without migration downgrade delete rewrite reopen or implicit activation, keep DEC-118 preview DEC-121 persistence and exact inspection available, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-memory-recall-preview.mjs; scripts/smoke-ui-slice-665.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v15 migration, durable MemoryRecall creation persistence retrieval index or history, automatic MemoryItem enumeration search ranking scoring recommendation or selection, Mission Council ExecutionPlan WorkOrder prompt or policy context injection, memory application import export deletion expiry mutation refresh GC supersession replacement quarantine or cross-workspace use, skill creation or promotion, provider-assisted recall, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one deterministic response-only exact-id MemoryRecallPreview described in docs/82_ai-company-memory-recall-preview-plan.md. This permits no automatic retrieval search ranking recommendation selection Mission injection memory application durable recall record schema migration source mutation Git release scheduling policy bypass or connectors.
```

## Valid Evidence Request Outcome

```text
decisionId=operator-decision-ai-company-memory-recall-preview-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded MemoryRecallPreview implementation slice
requestedEvidence=one or more exact missing contract migration compatibility rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before MemoryRecallPreview implementation authority can open.
```

## Valid Rejection Outcome

```text
decisionId=operator-decision-ai-company-memory-recall-preview-implementation-001
decisionStatus=reject-ai-company-memory-recall-preview-implementation
targetAuthority=the same bounded MemoryRecallPreview implementation slice
approvalStatement=I reject MemoryRecallPreview implementation. Schema-v14 exact MemoryItem inspection remains authoritative.
```

## Valid Deferral Outcome

```text
decisionId=operator-decision-ai-company-memory-recall-preview-implementation-001
decisionStatus=defer-ai-company-memory-recall-preview-implementation
targetAuthority=the same bounded MemoryRecallPreview implementation slice
approvalStatement=I defer MemoryRecallPreview implementation. No recall preview, search, ranking, recommendation, application, Mission injection, schema, source, Git, release, scheduling, policy, or connector authority opens.
```

## Invalid Shortcuts

The following do not open implementation authority:

- `approval`, `approved`, `전체 승인`, or `continue` without every required field
- planning-only approval copied as implementation approval
- approval that omits exact-id selection, project scope, expiry, negative evidence, rollback, or smoke
- approval that bundles automatic search/ranking/recommendation, Mission injection, application,
  provider, source mutation, Git/release, scheduler, or cross-workspace behavior
- delegated self-approval for retrieval-sensitive runtime or UI implementation

## Acceptance Criteria

- The decision exactly identifies the response-only preview and touched surfaces.
- Exact-id operator selection is distinct from automatic retrieval, search, ranking, or recommendation.
- Schema v14 and every MemoryItem/source record remain unchanged.
- The output is deterministic, deeply frozen, response/browser-memory only, and bound to the exact
  item digest, evaluatedAt, project scope, applicability, positive/negative/redaction/review refs,
  acknowledgement, and non-application statement.
- Failed input performs no write and returns no preview.
- Focused runtime/API/UI smokes prove compatibility and blocked downstream authority.

## Stop Condition

Until one valid complete outcome is supplied, stop after planning docs, read-only smoke, README,
inventory, roadmap, and task-ledger evidence. Do not create runtime, API, UI, schema, record, retrieval,
search, ranking, recommendation, Mission injection, memory application, provider, source, Git,
release, schedule, policy, bypass, or connector behavior.
