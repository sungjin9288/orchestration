# AI Company Durable MemoryRecall Implementation Decision Handoff

## Purpose

이 문서는 `docs/84_ai-company-durable-memory-recall-persistence-plan.md`의 planning-only 결과를
schema- and persistence-sensitive operator decision으로 전달한다. 대상은 DEC-124 preview를 다시
계산하고 별도 record approval을 요구한 뒤 exact local audit fact 하나를 저장하는 경로다.

## Current Gate

- Planning-only authority is accepted as `DEC-125`.
- This complete fielded implementation handoff is recorded as `DEC-126`.
- The complete fielded operator decision is accepted as `DEC-127`.
- Current runtime is schema v15 with exact DEC-124 recomputation, one immutable recorded MemoryRecall,
  bounded persistence and exact inspection routes, Deliverables audit evidence, and focused runtime/UI
  smokes.
- List/history/index, automatic retrieval/search/ranking/recommendation, context injection, memory
  application, provider/source/Git/release/scheduling/policy/bypass/connectors remain closed.

## Implementation Outcome

- `src/runtime/memory-recalls.js` normalizes the separate record approval and computes the immutable
  record digest.
- File-store migration adds only `sequences.memoryRecall` and `memoryRecalls`; passive migration creates
  no record, while the authorized persistence command validates the full tuple before one atomic save.
- Runtime recomputes DEC-124 from the current MemoryItem and recallSpec, distrusts browser preview state,
  returns exact replay without saving, and rejects a divergent second record for the same MemoryItem.
- API and Deliverables expose only exact inspection and one explicit record action. No list, history,
  search, ranking, recommendation, Mission/WorkOrder injection, or application control exists.
- `scripts/smoke-ai-company-durable-memory-recall.mjs` and `scripts/smoke-ui-slice-666.mjs` prove migration,
  no-write failures, record integrity, reload, rollback retention, source immutability, responsive fit,
  and unchanged DEC-124 response-only behavior.

## Required Decision Fields

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
migrationPlanRefs
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
decisionId=operator-decision-ai-company-durable-memory-recall-implementation-001
decisionStatus=approve-ai-company-durable-memory-recall-implementation-slice
targetAuthority=one deterministic local schema-v15 durable recorded MemoryRecall from one exact source-current schema-v14 MemoryRecallPreview and separate operator record approval
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/memory-recalls.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-memory-recall.mjs, scripts/smoke-ui-slice-666.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/84_ai-company-durable-memory-recall-persistence-plan.md
runtimePath=require one exact current unexpired schema-v14 MemoryItem plus memoryItemId recordDigest evaluatedAt bounded recallSpec exact DEC-124 preview id and digest and separate recordApproval decision=record, recompute DEC-124 from current state before any write, atomically migrate valid state and append one immutable MemoryRecall status=recorded, expose exact source-bound inspection, and stop before list history search ranking recommendation Mission or WorkOrder injection memory application provider source Git release scheduling policy bypass or connectors
compatibilityPlanRefs=preserve DEC-118 DEC-121 and DEC-124 behavior, preserve response-only preview and exact MemoryItem inspection, create no generic approval inbox run artifact provider attempt source mutation or automatic selection, and keep standalone task Council WorkOrder checkpoint DeliveryPackage Growth proposal and browser-local preference behavior unchanged
migrationPlanRefs=add schemaVersion 15 memoryRecall sequence and memoryRecalls map only, preserve every valid schema-v14 value, create no record during migration boot read render or preview, reject future partial or semantically invalid v15 state, validate the complete request and approval before one atomic migration-plus-append save, and retain valid v15 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-049, DEC-051, DEC-115, DEC-118, DEC-121, DEC-122, DEC-124, DEC-125, DEC-126, docs/25_memory-readiness-decision-spec.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/78_ai-company-memory-candidate-preview-plan.md, docs/80_ai-company-durable-memory-item-persistence-plan.md, docs/82_ai-company-memory-recall-preview-plan.md, docs/84_ai-company-durable-memory-recall-persistence-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/memory-items.js, src/runtime/memory-recall-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v14 with immutable MemoryItems and response-only MemoryRecallPreview but no memoryRecall sequence map contract record digest persistence method exact inspection route durable UI record approval focused persistence smoke list history search ranking recommendation Mission injection or application authority
rollbackRefs=disable persist and exact inspection entrypoints and UI controls, stop new MemoryRecall creation, preserve valid schema-v15 records and every source record without downgrade delete rewrite reopen or implicit application, keep DEC-124 response-only preview available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-memory-recall.mjs; scripts/smoke-ui-slice-666.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v16 migration, MemoryRecall list index history mutation deletion revision supersession replacement quarantine or multi-record lifecycle, automatic MemoryItem enumeration search ranking scoring recommendation or selection, Mission Council ExecutionPlan WorkOrder prompt or policy context injection, memory application import export expiry mutation refresh GC or cross-workspace use, skill creation or promotion, provider-assisted recall, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v15 durable recorded MemoryRecall described in docs/84_ai-company-durable-memory-recall-persistence-plan.md. This permits one local audit record and exact inspection only. It does not approve list or history, automatic retrieval, search, ranking, recommendation, Mission injection, memory application, source mutation, Git, release, scheduling, policy bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-durable-memory-recall-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded durable MemoryRecall implementation slice
requestedEvidence=one or more exact missing migration contract compatibility rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before schema-v15 MemoryRecall implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-durable-memory-recall-implementation-001
decisionStatus=reject-ai-company-durable-memory-recall-implementation
targetAuthority=the same bounded durable MemoryRecall implementation slice
approvalStatement=I reject durable MemoryRecall implementation. Schema-v14 response-only preview remains authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-durable-memory-recall-implementation-001
decisionStatus=defer-ai-company-durable-memory-recall-implementation
targetAuthority=the same bounded durable MemoryRecall implementation slice
approvalStatement=I defer durable MemoryRecall implementation. No schema, record, list, history, retrieval, recommendation, injection, application, source, Git, release, scheduling, policy, or connector authority opens.
```

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, or `전체 승인` without every required field
- planning-only authority copied as implementation authority
- delegated self-approval for schema migration or durable record creation
- approval that omits exact preview recomputation, separate record approval, migration, rollback, or smoke
- approval that bundles list/history, automatic retrieval, recommendation, Mission injection, memory
  application, provider, source mutation, Git/release, scheduling, or cross-workspace behavior

## Acceptance Criteria

- The decision names the exact schema-v15 sequence/map-only migration and touched surfaces.
- Runtime recomputes DEC-124 and distrusts browser preview state.
- One separate bounded record approval is required before the single atomic save.
- Exact replay is read-only; divergent or invalid input performs no migration or record write.
- Source MemoryItem and every upstream record remain immutable.
- GET remains exact inspection, with no list, history, search, ranking, recommendation, or application.
- Focused runtime/API/UI smokes prove migration, reload, rollback retention, compatibility, and blocked
  downstream authority.

## Stop Condition

The complete approval was supplied and consumed as `DEC-127`. This handoff remains provenance for the
implemented slice and does not authorize any authority listed in `stillBlockedAuthorities`.
