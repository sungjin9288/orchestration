# AI Company Durable MemoryItem Implementation Decision Handoff

## Purpose

`docs/80_ai-company-durable-memory-item-persistence-plan.md`의 planning-only evidence를 additive
schema-v14 migration, one durable `MemoryItem(status=stored)`, exact storage approval, and bounded
API/UI persistence로 넓힐지 operator가 complete fielded shape로 결정할 수 있게 한다.

이 문서는 implementation authority를 열지 않으며 recommendation retrieval, search, ranking,
import/apply, export/delete, expiry mutation/refresh/GC, cross-workspace use, skill promotion,
provider, source, Git, release, scheduling, next Mission, policy, bypass, and connectors를 분리한다.

## Current Gate

- Planning-only authority is accepted as `DEC-119`.
- This complete fielded implementation handoff is recorded as `DEC-120`.
- The complete fielded operator decision is accepted as `DEC-121`.
- Current runtime is schema v14 with exact DEC-118 recomputation, one immutable stored MemoryItem,
  bounded persistence and exact inspection routes, Deliverables storage evidence, and focused
  runtime/UI smokes.
- Recommendation retrieval/application, export/delete/refresh, cross-workspace use, skill,
  provider, source/Git/release, scheduling, policy, bypass, and connectors remain closed.

## Implementation Outcome

- `src/runtime/memory-items.js` normalizes the separate storage approval and computes the immutable
  record digest.
- File-store migration adds only `sequences.memoryItem` and `memoryItems`; passive paths create no
  item and partial/corrupt schema-v14 records fail closed.
- Runtime and transport recompute the exact current DEC-118 preview before one atomic append.
- GET and Deliverables expose source-bound stored evidence without making it eligible to steer
  recommendations or execution.
- `scripts/smoke-ai-company-durable-memory-item.mjs` and `scripts/smoke-ui-slice-664.mjs` pin the
  migration, no-write, idempotency, reload, API, UI, responsive-fit, and blocked-authority boundary.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
migrationPlanRefs=
sourceEvidenceRefs=
negativeEvidenceRefs=
rollbackRefs=
focusedSmokeRefs=
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=
approvalStatement=
```

## Recommended Approval Shape

```text
decisionId=operator-decision-ai-company-durable-memory-item-implementation-001
decisionStatus=approve-ai-company-durable-memory-item-implementation-slice
targetAuthority=one deterministic local schema-v14 durable stored MemoryItem from one exact source-current schema-v13 MemoryCandidate preview and explicit operator storage approval
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/memory-items.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-memory-item.mjs, scripts/smoke-ui-slice-664.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/80_ai-company-durable-memory-item-persistence-plan.md
runtimePath=require one exact current unexpired schema-v13 LearningCandidate and one source-current LearningCandidateReview with decision=accepted, require exact previewId candidateDigest candidateRecordDigest reviewDigest evaluatedAt memorySpec memoryCandidatePreviewId memoryCandidatePreviewDigest and bounded storageApproval with decision=store acknowledgement=reviewed-memory-candidate-for-local-project-storage rationale and reviewedAt, recompute the DEC-118 response-only preview instead of trusting a browser object, reject stale divergent expired malformed cross-workspace redaction-unsafe or authority-widening input before write, atomically append one immutable persisted=true status=stored MemoryItem with blocked application and promotion plus empty export and deletion refs, expose exact source-bound read-only record inspection, and stop before recommendation retrieval search ranking import apply export delete expiry mutation refresh GC cross-workspace use skill provider source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=preserve DEC-109 DEC-112 DEC-115 DEC-118 routes records exact tuples and response-only persisted=false preview, preserve loadStateReadonly no-bootstrap no-migration behavior and standalone task Council WorkOrder checkpoint DeliveryPackage Growth proposal browser preference and memory-readiness paths, create no Mission task plan WorkOrder checkpoint package acceptance close-out candidate review run artifact generic approval inbox provider attempt skill source mutation Git release schedule next-Mission policy or connector evidence, and never let exact read-only item inspection steer runtime behavior
migrationPlanRefs=add schemaVersion 14 memoryItem sequence and memoryItems map only, preserve every valid schema-v13 domain value and immutable source record, create no item during migration boot GET snapshot hydration render preview review or invalid input, keep older domain migration predicates tied to their introduction versions, reject future partial or semantically invalid v14 state, validate exact source preview and storage approval before one atomic migration-plus-append save, and retain valid v14 evidence during rollback without downgrade deletion rewrite or implicit activation
sourceEvidenceRefs=DEC-049, DEC-051, DEC-076, DEC-106, DEC-109, DEC-112, DEC-115, DEC-118, DEC-119, DEC-120, docs/25_memory-readiness-decision-spec.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/72_ai-company-learning-candidate-preview-plan.md, docs/74_ai-company-durable-learning-candidate-persistence-plan.md, docs/76_ai-company-learning-candidate-review-outcome-plan.md, docs/78_ai-company-memory-candidate-preview-plan.md, docs/80_ai-company-durable-memory-item-persistence-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/learning-candidates.js, src/runtime/learning-candidate-reviews.js, src/runtime/memory-candidate-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v13 with response-only MemoryCandidate previews but no memoryItem sequence map stored status validator record digest persistence function exact inspection route durable UI storage approval payload focused persistence smoke or retrieval application export deletion expiry refresh skill cross-workspace authority
rollbackRefs=disable persist and exact inspection entrypoints and durable UI controls, stop new MemoryItem creation, preserve valid schema-v14 items embedded storage approval and every source evidence record without downgrade deletion reopen rewrite or implicit activation, keep DEC-118 response-only preview available, leave application promotion export deletion expiry refresh and retrieval blocked, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-memory-item.mjs proving atomic v13-to-v14 migration empty sequence and map exact accepted candidate review memorySpec preview id and digest recomputation explicit storage approval binding one immutable stored record record digest source readiness separation attached negative evidence blocked application and promotion empty export and deletion refs idempotency divergent conflict stale expired malformed credential raw-body corrupt-source cross-workspace and authority-widening no-write refusal reload rollback no item on migration boot GET snapshot hydration render preview review or invalid input no source candidate review Mission task plan WorkOrder checkpoint package acceptance close-out run artifact approval inbox Council source provider skill Git release schedule next-Mission policy bypass connector mutation and DEC-109 DEC-112 DEC-115 DEC-118 standalone Council Growth proposal and memory-readiness compatibility; scripts/smoke-ui-slice-664.mjs proving exact-gated explicit storage approval read-only exact-item rendering response-only preview compatibility safe stale expired and API failures absent downstream controls refresh behavior and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=recommendation retrieval search ranking import apply export deletion expiry mutation refresh garbage collection quarantine supersession replacement or cross-workspace use, skill creation or promotion, LearningCandidate or review mutation, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v14 durable stored MemoryItem described in docs/80_ai-company-durable-memory-item-persistence-plan.md. The runtime must recompute the DEC-118 preview from one exact current accepted review and operator-owned memorySpec, require one separate explicit storage approval, append at most one immutable project-scoped stored record, preserve source records, and keep application promotion export deletion and every downstream authority blocked. This does not approve recommendation retrieval, search, ranking, import, apply, export, deletion, expiry mutation, refresh, cross-workspace use, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-durable-memory-item-implementation-001
decisionStatus=request-ai-company-durable-memory-item-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before durable MemoryItem implementation authority can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-durable-memory-item-implementation-001
decisionStatus=reject-ai-company-durable-memory-item-implementation
decisionNotes=
approvalStatement=I reject durable MemoryItem implementation. The schema-v13 response-only preview remains authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-durable-memory-item-implementation-001
decisionStatus=defer-ai-company-durable-memory-item-implementation
decisionNotes=
approvalStatement=I defer durable MemoryItem implementation. No schema, record, API, UI, retrieval, application, export, deletion, skill, provider, source, Git, release, scheduling, policy, or connector authority opens.
```

## Invalid Shortcuts

These do not approve implementation:

```text
approval
approved
continue
do everything
approve all
self approve
use your judgment
```

They do not decide schema migration, exact preview recomputation, storage approval fields, immutable
record fields, stale/no-write behavior, idempotency, rollback retention, focused evidence, or
still-blocked authority.

## Minimum Acceptance Criteria

A valid approval must:

1. name `docs/80_ai-company-durable-memory-item-persistence-plan.md`;
2. authorize only additive schema-v14 sequence/map migration and one durable item per accepted review;
3. require the exact candidate/review tuple, memorySpec, preview id/digest, and storage approval;
4. require runtime DEC-118 recomputation and reject a supplied browser preview object as authority;
5. create only immutable `persisted=true`, `status=stored`, project-scoped evidence with application
   and promotion blocked;
6. create no item during migration, boot, GET, snapshot, hydration, render, preview, review, or
   invalid input;
7. require exact replay idempotency, divergent same-review conflict, and byte-stable stale refusal;
8. preserve every source record, DEC-118 response-only behavior, and standalone/Council/Growth/
   proposal compatibility;
9. name rollback retention and focused migration/runtime/API/UI/browser verification;
10. keep recommendation retrieval/search/ranking/import/apply/export/delete/refresh, cross-workspace,
    skill, provider, raw evidence, source, Git, release, scheduling, next-Mission, policy, bypass,
    and connector authority blocked.

## Stop Conditions

Stop without implementation if:

- any required field is missing, broad, or conflicts with the plan;
- migration or passive read/render creates an item;
- browser preview data is trusted without current runtime recomputation;
- source tuple, memorySpec, preview, storage approval, redaction, negative evidence, expiry, or
  closed authority cannot be proven exact;
- invalid input can increment a sequence, migrate state, write partial state, or create downstream
  evidence;
- raw transcript/artifact/source/provider/env/secret content enters the record;
- record inspection can steer recommendations or runtime behavior;
- retrieval/application/export/delete/refresh, cross-workspace, skill, provider, source/Git/release,
  scheduling, next-Mission, policy, bypass, or connector authority is bundled into the slice;
- rollback requires schema downgrade, record deletion, source rewrite, or Mission/task reopen;
- focused migration/runtime/API/UI, compatibility, README/inventory, UI QA, or aggregate gates fail.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-durable-memory-item-planning.mjs
node scripts/smoke-ai-company-durable-memory-item.mjs
node scripts/smoke-ui-slice-664.mjs
node scripts/smoke-ai-company-memory-candidate-preview.mjs
node scripts/smoke-ui-slice-663.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until the complete fielded approval is supplied, only planning and current negative-evidence checks
may pass. Schema-v14 migration, durable item creation, API/UI persistence, recommendation retrieval,
application, export, deletion, refresh, cross-workspace use, skill promotion, provider, source/Git/
release, scheduling, next-Mission, policy, bypass, and connectors remain blocked.
