# AI Company MemoryCandidate Preview Implementation Decision Handoff

## Purpose

`docs/78_ai-company-memory-candidate-preview-plan.md`의 planning-only evidence를 one exact
response-only runtime/API/UI preview path로 넓힐지 operator가 complete fielded shape로 결정하게
한다. 이 문서는 implementation authority를 열지 않으며 schema migration, durable memory,
retrieval/import/apply/export/delete, skill promotion, provider, source, Git, release, scheduling,
next Mission, policy, bypass, and connectors를 계속 분리한다.

## Current Gate

- Planning-only authority is accepted as `DEC-116`.
- This complete fielded implementation handoff is recorded as `DEC-117`.
- Current runtime remains schema v13 with DEC-112 candidates and DEC-115 review events.
- No MemoryCandidate preview module, runtime method, route, form, response, or browser-memory result
  exists.
- General continuation, broad approval, or delegated non-critical self-approval does not open
  runtime/API/UI implementation.

## Implementation Outcome

The operator supplied the complete recommended approval shape as
`operator-decision-ai-company-memory-candidate-preview-implementation-001`, and `DEC-118` accepts
only the bounded response-only runtime/API/UI slice.

- Schema v13 and every durable candidate, review, Mission, task, and source record remain unchanged.
- One accepted source-current review plus exact operator memorySpec may produce one deeply frozen
  `persisted=false`/`review-ready` response and browser-memory result.
- Rejected, changes-requested, stale, expired, malformed, cross-workspace, unsupported-ref, and
  credential-marked input fails without output or writes.
- There is no GET, snapshot field, durable memory record, storage/retrieval/apply/export/delete
  action, skill promotion, provider call, source/Git/release action, scheduling, next Mission,
  policy mutation, approval bypass, or connector action.
- `scripts/smoke-ai-company-memory-candidate-preview.mjs` and
  `scripts/smoke-ui-slice-663.mjs` are the focused implementation evidence.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
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
decisionId=operator-decision-ai-company-memory-candidate-preview-implementation-001
decisionStatus=approve-ai-company-memory-candidate-preview-implementation-slice
targetAuthority=one deterministic response-only AI Company MemoryCandidate preview from one exact source-current accepted schema-v13 LearningCandidateReview and immutable LearningCandidate
targetSurface=src/runtime/memory-candidate-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-memory-candidate-preview.mjs, scripts/smoke-ui-slice-663.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/78_ai-company-memory-candidate-preview-plan.md
runtimePath=require one exact current unexpired schema-v13 LearningCandidate plus its one source-current LearningCandidateReview with decision=accepted, require exact learningCandidateId learningCandidateReviewId previewId candidateDigest candidateRecordDigest reviewDigest evaluatedAt and bounded operator-owned memorySpec, validate project-only scope source-contained applicability evidence negative-evidence redaction and review refs, return one deeply frozen deterministic persisted=false review-ready MemoryCandidate preview through one bounded POST response and browser memory, and stop before schema migration durable memory retrieval import apply export delete skill provider source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=keep schemaVersion 13, do not edit createEmptyState file-store normalization LearningCandidate or LearningCandidateReview records, preserve DEC-109 DEC-112 DEC-115 routes and Deliverables evidence, preserve standalone task Council WorkOrder checkpoint DeliveryPackage Growth proposal and memory-readiness behavior, create no GET snapshot approval inbox run artifact or durable record, and clear browser-memory preview on refresh source change input edit or failed recomputation
sourceEvidenceRefs=DEC-049, DEC-051, DEC-076, DEC-106, DEC-109, DEC-112, DEC-115, DEC-116, DEC-117, docs/25_memory-readiness-decision-spec.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/72_ai-company-learning-candidate-preview-plan.md, docs/74_ai-company-durable-learning-candidate-persistence-plan.md, docs/76_ai-company-learning-candidate-review-outcome-plan.md, docs/78_ai-company-memory-candidate-preview-plan.md, src/runtime/contracts.js, src/runtime/learning-candidates.js, src/runtime/learning-candidate-reviews.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v13 with immutable candidate and append-only review records but no MemoryCandidate preview module contract digest runtime preview method POST route UI form response-only browser-memory result focused runtime smoke UI smoke storage location lifecycle approval export deletion skill promotion or memory application authority
rollbackRefs=disable the response-only preview method POST route and UI form, discard response-local and browser-memory previews, preserve schema-v13 candidate review Mission and source evidence without migration downgrade delete rewrite reopen or durable memory cleanup, keep the existing memory-readiness surface available, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-memory-candidate-preview.mjs proving strict schema-v13 read-only load exact accepted candidate review and source binding rejected and changes-requested refusal current expiry exact bounded memorySpec project-only scope source-contained applicability evidence negative-evidence redaction and review refs non-persistence statement canonical digest stable id deep freeze replay determinism zero saveState state and source byte stability no GET snapshot durable record schema-v14 memory retrieval import apply export delete skill provider source Git release schedule next-Mission policy bypass or connector effect and DEC-109 DEC-112 DEC-115 standalone Council Growth proposal memory-readiness compatibility; scripts/smoke-ui-slice-663.mjs proving bounded POST accepted-review-only form response-only browser-memory lifecycle edit and refresh invalidation read-only source evidence safe stale malformed cross-workspace credential and API failures absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v14 migration, durable MemoryCandidate or MemoryItem creation persistence retrieval import apply export deletion expiry mutation refresh GC or cross-workspace use, skill creation or promotion, LearningCandidate rewrite revision deletion supersession expiry mutation quarantine rework or replacement, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one deterministic response-only MemoryCandidate preview described in docs/78_ai-company-memory-candidate-preview-plan.md. It must require one exact source-current accepted schema-v13 LearningCandidateReview, preserve schema and all source records, keep the result non-persistent and browser-memory-only, and grant no storage, retrieval, import, apply, export, deletion, skill, provider, source, Git, release, scheduling, next-Mission, policy, bypass, or connector authority.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-ai-company-memory-candidate-preview-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before response-only MemoryCandidate preview implementation authority can open.
```

Rejection:

```text
decisionStatus=reject-ai-company-memory-candidate-preview-implementation
decisionNotes=
approvalStatement=I reject MemoryCandidate preview implementation. Accepted LearningCandidateReview evidence remains read-only and grants no memory authority.
```

Deferral:

```text
decisionStatus=defer-ai-company-memory-candidate-preview-implementation
decisionNotes=
approvalStatement=I defer MemoryCandidate preview implementation. No runtime, API, UI, memory, skill, provider, source, Git, release, scheduling, policy, or connector authority opens.
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

They do not decide exact accepted-review binding, memorySpec, project scope, redaction/evidence rules,
expiry, response-only lifecycle, rollback, focused proof, or still-blocked authority.

## Minimum Acceptance Criteria

A valid approval must:

1. name `docs/78_ai-company-memory-candidate-preview-plan.md`;
2. preserve schema v13 and every source candidate/review/Mission record;
3. require one exact source-current accepted review and reject rejected/changes-requested evidence;
4. bind exact candidate/review identities and digests plus explicit evaluation time;
5. require bounded operator-owned summary, project scope, applicability, positive/negative/redaction/
   review refs, expiry, acknowledgement, and non-persistence statement;
6. return only one deterministic deeply frozen `persisted=false` preview;
7. create no preview during boot, GET, snapshot, hydration, rendering, review, or broad approval;
8. keep the preview response/browser-memory-only and clear it on refresh or input/source change;
9. grant no durable memory, retrieval/import/apply/export/delete, skill/provider/source/Git/release/
   scheduling/next-Mission/policy/bypass/connector authority;
10. name rollback discard and focused runtime/API/UI/browser verification.

## Stop Conditions

Stop without implementation if:

- any required decision field is missing, broad, or conflicts with the plan;
- source candidate/review/Mission evidence is stale, expired, corrupt, or not accepted;
- the runtime must invent operator-owned memory scope, applicability, evidence, redaction, or expiry;
- raw transcript/artifact/source/provider/env/secret content enters the preview;
- global/cross-workspace scope or unsupported path/command/ref is allowed;
- passive read, hydration, rendering, or refresh can persist or restore a preview;
- implementation requires schema migration or durable memory lifecycle decisions;
- storage, retrieval, import/apply, export/delete, skill, provider, source/Git/release, scheduling,
  next-Mission, policy, bypass, or connector authority is bundled into the slice;
- rollback requires source record deletion/rewrite, schema downgrade, or Mission/task reopen;
- focused runtime/API/UI, compatibility, README/inventory, UI QA, or aggregate gates fail.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs
node scripts/smoke-ai-company-memory-candidate-preview.mjs
node scripts/smoke-ui-slice-663.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until the complete fielded approval is supplied, only planning and current negative-evidence checks
may pass. Runtime/API/UI preview, schema migration, durable memory, retrieval/import/apply/export/
delete, skill promotion, provider, source/Git/release, scheduling, next-Mission, policy, bypass, and
connectors remain blocked.
