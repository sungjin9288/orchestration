# AI Company LearningCandidate Review Outcome Implementation Decision Handoff

## Purpose

`docs/76_ai-company-learning-candidate-review-outcome-plan.md`의 planning-only evidence를
schema-v13 append-only `LearningCandidateReview` record와 exact API/UI review path로 넓힐지
operator가 complete fielded shape로 결정하게 한다. 이 문서는 implementation authority를 열지
않으며 candidate mutation, expiry/quarantine, memory/skill, provider, source, Git, release,
scheduling, next Mission, policy, bypass, and connectors를 계속 분리한다.

## Current Gate

- Planning-only authority is accepted as `DEC-113`.
- This complete fielded implementation handoff is recorded as `DEC-114`.
- Current runtime remains schema v12 with immutable DEC-112 candidates only.
- No review sequence/map, review record/digest, review route, review UI, or derived review outcome exists.
- General approval, continuation, broad `approve all`, or delegated non-critical self-approval does
  not open this schema- and persistence-sensitive implementation.

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
decisionId=operator-decision-ai-company-learning-candidate-review-outcome-implementation-001
decisionStatus=approve-ai-company-learning-candidate-review-outcome-implementation-slice
targetAuthority=one deterministic local schema-v13 append-only LearningCandidateReview record from one exact source-current schema-v12 review-required LearningCandidate
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/learning-candidate-reviews.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-learning-candidate-review-outcome.mjs, scripts/smoke-ui-slice-662.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/76_ai-company-learning-candidate-review-outcome-plan.md
runtimePath=require one exact current unexpired schema-v12 LearningCandidate and its valid completed Mission source closure, require exact learningCandidateId previewId candidateDigest candidateRecordDigest decision rationale evidenceRefs and reviewerAcknowledgement=human-reviewed, normalize only accept reject or changes-requested, atomically append one immutable LearningCandidateReview event, derive review evidence without rewriting the candidate, and stop before candidate revision expiry quarantine memory skill provider source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=preserve DEC-109 response-only preview and DEC-112 durable candidate persistence GET and Deliverables behavior, keep every source candidate Mission package acceptance close-out plan WorkOrder checkpoint review QA approval Council record immutable, preserve standalone task Growth proposal and memory-readiness paths, and create no approval inbox run artifact provider attempt source mutation Git release schedule or next Mission
migrationPlanRefs=add schemaVersion 13 learningCandidateReview sequence and learningCandidateReviews map only, preserve every valid schema-v12 domain value, create no review during migration boot read snapshot preview persistence hydration render or invalid input, keep older domain migration predicates tied to introduction versions, reject future partial or semantically invalid v13 records, save migration and append atomically, and retain valid v13 evidence during rollback without downgrade deletion or rewrite
sourceEvidenceRefs=DEC-076, DEC-106, DEC-107, DEC-109, DEC-110, DEC-112, DEC-113, DEC-114, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/72_ai-company-learning-candidate-preview-plan.md, docs/74_ai-company-durable-learning-candidate-persistence-plan.md, docs/76_ai-company-learning-candidate-review-outcome-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/learning-candidates.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v12 with immutable review-required proposed candidates and no learningCandidateReview sequence map validator digest runtime get or review function GET or POST route UI review form focused review smoke accepted rejected or changes-requested read model
rollbackRefs=disable review GET and POST entrypoints and UI controls, stop new review creation, preserve valid schema-v13 review records and every source candidate and Mission evidence record without downgrade deletion reopen or rewrite, keep DEC-109 preview and DEC-112 durable inspection available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-learning-candidate-review-outcome.mjs proving atomic v12-to-v13 migration empty sequence and map exact learningCandidateId previewId candidateDigest candidateRecordDigest decision rationale evidence refs acknowledgement binding one immutable normalized accepted rejected or changes-requested record review digest idempotency divergent conflict stale expired malformed credential raw-body corrupt-source and authority-widening no-write refusal reload rollback no review on migration boot read snapshot preview persistence hydration render or invalid input no candidate Mission task plan WorkOrder checkpoint package acceptance close-out run artifact approval inbox Council source provider memory skill Git release schedule next-Mission policy bypass or connector mutation and DEC-109 DEC-112 standalone Council Growth and proposal compatibility; scripts/smoke-ui-slice-662.mjs proving exact-gated review all three decisions read-only candidate and review rendering safe stale expired and API failures idempotent replay absent downstream controls refresh behavior and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=LearningCandidate rewrite deletion supersession duplicate review automatic revision or rework, expiry mutation automatic expiration quarantine unquarantine or replacement candidate, memory persistence or cross-Mission retrieval, skill creation or promotion, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, Mission or task reopen, package mutation, standalone close-out, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v13 append-only LearningCandidateReview record described in docs/76_ai-company-learning-candidate-review-outcome-plan.md. The source candidate must remain immutable, the request must bind one current unexpired candidate to exact digests and one operator-authored accept reject or changes-requested review, and every downstream authority must remain false. This does not approve candidate mutation, expiry or quarantine behavior, memory, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-ai-company-learning-candidate-review-outcome-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before LearningCandidate review implementation authority can open.
```

Rejection:

```text
decisionStatus=reject-ai-company-learning-candidate-review-outcome-implementation
decisionNotes=
approvalStatement=I reject LearningCandidate review implementation. Schema-v12 durable candidates remain immutable and review-required.
```

Deferral:

```text
decisionStatus=defer-ai-company-learning-candidate-review-outcome-implementation
decisionNotes=
approvalStatement=I defer LearningCandidate review implementation. No schema, review record, API, UI, memory, skill, provider, source, Git, release, scheduling, policy, or connector authority opens.
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

They do not decide schema migration, exact source/digest binding, allowed review decisions, expiry
gate, candidate immutability, stale/no-write behavior, idempotency, rollback retention, focused
evidence, or still-blocked authority.

## Minimum Acceptance Criteria

A valid approval must:

1. name `docs/76_ai-company-learning-candidate-review-outcome-plan.md`;
2. authorize only additive schema-v13 sequence/map migration and one append-only review per candidate;
3. preserve the source LearningCandidate and all Mission evidence as immutable;
4. require exact candidate id, preview/candidate/record digests, unexpired review window, rationale,
   source-contained evidence refs, acknowledgement, and one allowed decision;
5. normalize only accepted, rejected, or changes-requested evidence;
6. create no review during migration, boot, read, snapshot, preview, persistence, hydration, render,
   or invalid input;
7. require exact replay idempotency, divergent conflict, and byte-stable stale refusal;
8. grant no candidate revision, expiry/quarantine, memory/skill, provider, source/Git/release,
   scheduling, next-Mission, policy, bypass, or connector authority;
9. preserve DEC-109/112 and standalone/Council/Growth/proposal compatibility;
10. name rollback retention and focused migration/runtime/API/UI/browser verification.

## Stop Conditions

Stop without implementation if:

- any required field is missing, broad, or conflicts with the plan;
- the source candidate or any terminal evidence/digest is stale or invalid;
- candidate expiry is not current at the review boundary;
- migration, passive read, hydration, render, or invalid input can create a review;
- accepted/rejected/changes-requested cannot be represented without rewriting the candidate;
- raw transcript/artifact/source/provider/env/secret content enters the record;
- candidate revision, expiry/quarantine, memory/skill, provider, source/Git/release, scheduling,
  next-Mission, policy, bypass, or connector authority is bundled into the slice;
- rollback requires schema downgrade, record deletion, Mission/task reopen, or source rewrite;
- focused migration/runtime/API/UI, compatibility, README/inventory, UI QA, or aggregate gates fail.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/smoke-ai-company-durable-learning-candidate.mjs
node scripts/smoke-ui-slice-661.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until the complete fielded approval is supplied, only planning and current negative-evidence checks
may pass. Schema-v13 migration, review record creation, API/UI review, candidate mutation,
expiry/quarantine, memory/skill, providers, raw evidence, source/Git/release, scheduling,
next-Mission, policy, bypass, and connectors remain blocked.
