# AI Company Mission Memory Context Preview Implementation Decision Handoff

## Purpose

이 문서는 `docs/86_ai-company-mission-memory-context-preview-plan.md`의 planning-only 결과를 다음
operator decision으로 전달한다. 대상은 exact recorded recall 하나와 exact draft Mission 하나를
같은 project 안에서 검토하는 response-only context preview다. Mission, prompt, WorkOrder, policy에
memory를 주입하거나 적용하는 권한은 포함하지 않는다.

## Current Gate

- Planning-only authority is accepted as `DEC-128`.
- This complete fielded implementation handoff is recorded as `DEC-129`.
- No complete fielded implementation outcome has been supplied.
- Current runtime remains schema v15 with exact MemoryRecall inspection only; no context preview,
  Mission injection, application, automatic selection, or provider path exists.

## Required Decision Fields

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
decisionId=operator-decision-ai-company-mission-memory-context-preview-implementation-001
decisionStatus=approve-ai-company-mission-memory-context-preview-implementation-slice
targetAuthority=one deterministic response-only project-local MissionMemoryContextPreview from one operator-selected exact source-current unexpired schema-v15 MemoryRecall and one exact source-current draft Mission
targetSurface=src/runtime/mission-memory-context-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-mission-memory-context-preview.mjs, scripts/smoke-ui-slice-667.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/86_ai-company-mission-memory-context-preview-plan.md
runtimePath=require one exact current unexpired schema-v15 MemoryRecall and its exact stored MemoryItem plus one exact current draft Mission in the same project, require exact recall and item record digests evaluatedAt current targetMissionDigest and bounded operator-owned contextSpec, preserve complete positive negative redaction and review evidence, reject stale non-draft cross-project widened credential raw-body provider automatic-selection recommendation injection or application input before output, return one deeply frozen deterministic persisted=false status=context-review-ready selectionMode=exact-id-operator-selected preview through one bounded POST response and browser memory, and stop before saveState schema migration durable context records Mission Council ExecutionPlan WorkOrder prompt or policy injection memory application source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=keep schemaVersion 15, do not edit createEmptyState file-store normalization MemoryRecall MemoryItem Mission or source records, preserve DEC-118 DEC-121 DEC-124 DEC-127 routes and Deliverables evidence, preserve standalone task Council WorkOrder checkpoint DeliveryPackage Growth proposal and browser-local preference behavior, create no GET list search snapshot approval inbox run artifact provider attempt durable record or Mission transition, and clear browser-memory preview on refresh Mission recall source or input change and failed recomputation
sourceEvidenceRefs=DEC-049, DEC-051, DEC-115, DEC-118, DEC-121, DEC-124, DEC-127, DEC-128, DEC-129, docs/25_memory-readiness-decision-spec.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/82_ai-company-memory-recall-preview-plan.md, docs/84_ai-company-durable-memory-recall-persistence-plan.md, docs/86_ai-company-mission-memory-context-preview-plan.md, src/runtime/contracts.js, src/runtime/memory-items.js, src/runtime/memory-recalls.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v15 with immutable MemoryItems and recorded MemoryRecalls plus exact Mission inspection but no MissionMemoryContextPreview module contract target Mission digest runtime method POST route UI form response-only browser-memory preview focused runtime smoke UI smoke Mission or WorkOrder injection memory application automatic selection recommendation durable context record or provider authority
rollbackRefs=disable the response-only context preview method POST route and UI form, discard response-local and browser-memory previews, preserve schema-v15 MemoryRecalls MemoryItems Missions and every source record without migration downgrade delete rewrite reopen transition or implicit application, keep DEC-124 preview DEC-127 persistence and exact inspection available, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-mission-memory-context-preview.mjs; scripts/smoke-ui-slice-667.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v16 migration, durable MissionMemoryContext creation persistence retrieval list history mutation deletion revision supersession or application, Mission Council ExecutionPlan WorkOrder prompt or policy context injection, automatic MemoryItem or MemoryRecall enumeration search ranking scoring recommendation or selection, recall lifecycle expansion, memory application import export expiry mutation refresh GC or cross-workspace use, skill creation or promotion, provider-assisted context generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one deterministic response-only exact-id MissionMemoryContextPreview described in docs/86_ai-company-mission-memory-context-preview-plan.md. This permits no Mission WorkOrder prompt or policy injection, memory application, automatic retrieval search ranking recommendation selection, durable context record, schema migration, source mutation, Git, release, scheduling, policy bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-mission-memory-context-preview-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded MissionMemoryContextPreview implementation slice
requestedEvidence=one or more exact missing contract compatibility rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before MissionMemoryContextPreview implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-mission-memory-context-preview-implementation-001
decisionStatus=reject-ai-company-mission-memory-context-preview-implementation
targetAuthority=the same bounded MissionMemoryContextPreview implementation slice
approvalStatement=I reject MissionMemoryContextPreview implementation. Schema-v15 exact MemoryRecall and Mission inspection remain authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-mission-memory-context-preview-implementation-001
decisionStatus=defer-ai-company-mission-memory-context-preview-implementation
targetAuthority=the same bounded MissionMemoryContextPreview implementation slice
approvalStatement=I defer MissionMemoryContextPreview implementation. No context preview, injection, application, schema, source, Git, release, scheduling, policy, or connector authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `전체 승인`, or `continue` without every required field
- planning-only authority copied as implementation authority
- delegated self-approval for retrieval-sensitive runtime or UI implementation
- approval that omits exact recall/item/Mission digests, draft status, project binding, complete negative
  evidence, rollback, or focused smoke
- approval that bundles Mission/WorkOrder/prompt/policy injection, application, automatic search/ranking/
  recommendation, provider, source mutation, Git/release, scheduler, or cross-workspace behavior

## Acceptance Criteria

- The decision identifies the exact response-only preview and touched surfaces.
- Exact operator selection is distinct from automatic retrieval, ranking, or recommendation.
- Runtime reads current schema-v15 state without migration or `saveState`.
- The output is deterministic, deeply frozen, and bound to exact recall, item, draft Mission, project,
  digests, expiry, source-contained applicability, and complete evidence closure.
- Any stale or invalid input returns no preview and changes no durable value.
- UI keeps the result in browser memory and exposes no apply or injection control.
- Focused runtime/API/UI smokes prove compatibility and all blocked downstream authority.

## Stop Condition

No implementation outcome is recorded. Stop after planning, handoff, and planning verification until the
operator supplies one complete valid outcome. Do not create runtime/API/UI behavior, schema, durable
context records, injection, application, automatic retrieval, providers, source/Git/release,
scheduling, policy mutation, bypass, or connectors.
