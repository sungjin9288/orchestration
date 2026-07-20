# AI Company Durable LearningCandidate Implementation Decision Handoff

## Purpose

`docs/74_ai-company-durable-learning-candidate-persistence-plan.md`의 planning-only evidence를
schema-v12 migration, one durable LearningCandidate record, and exact API/UI persistence로 넓힐지
operator가 complete fielded shape로 결정할 수 있게 한다. 이 문서는 implementation authority를
열지 않으며 candidate review outcome, memory/skill promotion, provider, raw evidence, source, Git,
release, scheduling, next Mission, policy, bypass, and connectors를 계속 분리한다.

## Current Gate

- Planning-only decision is accepted as `DEC-110`.
- This complete fielded implementation handoff is recorded as `DEC-111`.
- Current runtime remains schema v11 with only the DEC-109 response-only preview.
- No durable LearningCandidate sequence, map, record, GET route, persistence route, or durable UI exists.
- General continuation, broad approval, or delegated non-critical self-approval does not open this
  schema- and persistence-sensitive implementation.

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
decisionId=operator-decision-ai-company-durable-learning-candidate-implementation-001
decisionStatus=approve-ai-company-durable-learning-candidate-implementation-slice
targetAuthority=one deterministic local schema-v12 durable LearningCandidate review-required record from one exact source-current schema-v11 response-only preview and completed Mission evidence tuple
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/learning-candidates.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-learning-candidate.mjs, scripts/smoke-ui-slice-661.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/74_ai-company-durable-learning-candidate-persistence-plan.md
runtimePath=require one exact source-current completed Mission and MissionCloseOut DeliveryPackage Acceptance ExecutionPlan terminal WorkflowCheckpoint Builder Reviewer QA review approval and Council evidence closure, require the exact operator-owned retrospectiveSpec plus terminal source tuple previewId candidateDigest and decision=persist, recompute the DEC-109 response-only preview instead of trusting a browser object, reject stale divergent expired malformed redaction-unsafe or authority-widening input before write, atomically append one immutable persisted=true redactionStatus=review-required reviewerStatus=review-required promotionStatus=proposed record, expose read-only durable evidence, and stop before candidate review outcome memory skill provider raw evidence source Git release scheduling next-Mission policy bypass or connectors
compatibilityPlanRefs=preserve DEC-088 DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 DEC-106 DEC-109 routes records exact tuples and response-only persisted=false preview, preserve loadStateReadonly no-bootstrap no-migration behavior and standalone task Council Growth proposal and memory-readiness paths, create no run artifact approval inbox checkpoint package acceptance close-out memory skill provider attempt source mutation Git release schedule or next Mission
migrationPlanRefs=add schemaVersion 12 learningCandidate sequence and learningCandidates map only, preserve every valid schema-v11 domain value and immutable source record, create no candidate during migration boot read preview hydration render or invalid input, keep older domain migration predicates tied to their introduction versions, reject future partial or semantically invalid v12 state, save migration and append atomically, and retain valid v12 evidence during rollback without downgrade deletion or rewrite
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-100, DEC-103, DEC-106, DEC-107, DEC-109, DEC-110, DEC-111, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/70_ai-company-mission-task-close-out-plan.md, docs/72_ai-company-learning-candidate-preview-plan.md, docs/74_ai-company-durable-learning-candidate-persistence-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/learning-candidate-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v11 with no learningCandidate sequence map durable record validator record digest persistence function GET or persist route durable UI focused persistence smoke or candidate review outcome, and the existing preview declares persisted=false and remains response/browser-memory-only
rollbackRefs=disable persist and GET entrypoints and durable UI controls, stop new candidate creation, preserve valid schema-v12 candidates and every source evidence record without downgrade deletion reopen or rewrite, keep DEC-109 response-only preview available, leave candidates review-required and proposed, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-learning-candidate.mjs proving atomic v11-to-v12 migration empty sequence and map exact terminal tuple retrospectiveSpec preview and candidate digest recomputation decision binding one immutable review-required proposed record record digest idempotency divergent conflict stale expired malformed credential raw-body corrupt-source and authority-widening no-write refusal reload rollback no candidate on migration boot GET snapshot hydration render preview or invalid input no Mission task plan WorkOrder checkpoint package acceptance close-out run artifact review approval inbox Council source provider memory skill Git release schedule next-Mission policy bypass or connector mutation and DEC-088 DEC-091 DEC-094 DEC-097 DEC-100 DEC-103 DEC-106 DEC-109 standalone Council Growth and proposal compatibility; scripts/smoke-ui-slice-661.mjs proving exact-gated explicit persistence read-only durable rendering response-only preview compatibility safe stale expired and API failures absent downstream controls refresh behavior and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=LearningCandidate acceptance rejection changes-requested expiry mutation quarantine supersession deletion or promotion, memory persistence, cross-Mission retrieval, skill creation or promotion, provider-assisted generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, Mission or task reopen, package mutation, standalone close-out, source mutation, commit, push, release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v12 durable review-required LearningCandidate record described in docs/74_ai-company-durable-learning-candidate-persistence-plan.md. The runtime must recompute the DEC-109 preview from one exact current terminal Mission tuple and operator-owned retrospectiveSpec, append at most one immutable proposed record, and preserve every downstream authority as false. This does not approve candidate review outcome, memory, skills, providers, raw evidence, source mutation, Git, release, scheduling, next-Mission creation, policy mutation, approval bypass, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-durable-learning-candidate-implementation-001
decisionStatus=request-ai-company-durable-learning-candidate-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before durable LearningCandidate implementation authority can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-durable-learning-candidate-implementation-001
decisionStatus=reject-ai-company-durable-learning-candidate-implementation
decisionNotes=
approvalStatement=I reject durable LearningCandidate implementation. The schema-v11 response-only preview remains authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-durable-learning-candidate-implementation-001
decisionStatus=defer-ai-company-durable-learning-candidate-implementation
decisionNotes=
approvalStatement=I defer durable LearningCandidate implementation. No schema, record, API, UI, review, memory, skill, provider, source, Git, release, scheduling, policy, or connector authority opens.
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

They do not decide schema migration, exact recomputation, immutable record fields, stale/no-write
behavior, idempotency, rollback retention, focused evidence, or still-blocked authority.

## Minimum Acceptance Criteria

A valid approval must:

1. name `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`;
2. authorize only additive schema-v12 sequence/map migration and one durable record per Mission;
3. require the complete current terminal source tuple, exact retrospectiveSpec, preview id, candidate
   digest, and `decision=persist`;
4. require runtime preview recomputation and reject a supplied browser preview object as authority;
5. create only immutable `persisted=true`, review-required, proposed evidence;
6. create no candidate during migration, boot, GET, snapshot, hydration, render, preview, or invalid input;
7. require exact replay idempotency, divergent same-Mission conflict, and byte-stable stale refusal;
8. preserve all source records, DEC-109 response-only behavior, and standalone/Council/Growth/proposal
   compatibility;
9. name rollback retention and focused migration/runtime/API/UI/browser verification;
10. keep review outcome, memory, skill, provider, raw evidence, source, Git, release, scheduling,
    next-Mission, policy, bypass, and connector authority blocked.

## Stop Conditions

Stop without implementation if:

- any required field is missing, broad, or conflicts with the plan;
- migration or passive read/render creates a candidate;
- browser preview data is trusted without current runtime recomputation;
- source tuple, retrospectiveSpec, preview, candidate digest, redaction, expiry, or closed authority
  cannot be proven exact;
- invalid input can increment a sequence, write partial state, or create downstream evidence;
- raw transcript/artifact/source/provider/env/secret content enters the record;
- candidate review, memory/skill, provider, source/Git/release, scheduling, next-Mission, policy,
  bypass, or connector authority is bundled into the slice;
- rollback requires schema downgrade, record deletion, Mission/task reopen, or source rewrite;
- focused migration/runtime/API/UI, compatibility, README/inventory, UI QA, or aggregate gates fail.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs
node scripts/smoke-ai-company-durable-learning-candidate.mjs
node scripts/smoke-ui-slice-661.mjs
node scripts/smoke-ai-company-learning-candidate-preview.mjs
node scripts/smoke-ui-slice-660.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until the complete fielded approval is supplied, only planning and current negative-evidence checks
may pass. Schema-v12 migration, durable record creation, API/UI persistence, candidate review outcome,
memory/skill promotion, providers, raw evidence, source/Git/release, scheduling, next-Mission, policy,
bypass, and connectors remain blocked.
