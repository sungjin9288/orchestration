# AI Company Durable DeliveryPackage Implementation Decision Handoff

## Purpose

이 문서는 `docs/66_ai-company-durable-delivery-package-persistence-plan.md`의 planning-only evidence를
schema-v9 migration, durable DeliveryPackage record, API/UI persistence로 넓힐지 operator가 complete
fielded shape로 결정할 수 있게 작성된 handoff다. 이 문서는 runtime, schema, API, UI, Mission,
task, provider, source, commit, push, release, 또는 learning authority를 열지 않는다.

## Current Gate

- Planning-only decision: accepted as `DEC-098`
- Implementation handoff: documented as `DEC-099`
- Complete fielded implementation decision: not supplied
- Current runtime: schema v8 with deterministic response-only DeliveryPackage preview
- Current durable package records: none
- Current Mission status after delivery: `executing`
- Safe future target: one exact local `review-required` record only

General approval, continuation wording, delegated non-critical self-approval, or a prior plan/checkpoint
approval does not open this schema- and persistence-sensitive implementation.

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
decisionId=operator-decision-ai-company-durable-delivery-package-implementation-001
decisionStatus=approve-ai-company-durable-delivery-package-implementation-slice
targetAuthority=one deterministic local schema-v9 durable DeliveryPackage review-required record from one exact source-current schema-v8 delivery-ready ExecutionPlan and terminal WorkflowCheckpoint
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/delivery-packages.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-delivery-package.mjs, scripts/smoke-ui-slice-657.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/66_ai-company-durable-delivery-package-persistence-plan.md
runtimePath=require one source-current delivery-ready ExecutionPlan plus its exact terminal WorkflowCheckpoint, recompute the existing response-only DeliveryPackage, require exact preview source package and checkpoint digests plus one explicit operator persist request, atomically append one immutable review-required record, expose read-only durable evidence, and stop before package acceptance Mission done task close-out commit push release or learning
compatibilityPlanRefs=preserve DEC-091 plan persistence, DEC-094 reviewed delivery and response-only preview, DEC-097 checkpoint recovery, standalone task and Council paths, provider and QA contracts, and existing commit-package release-package close-out behavior outside the new routes
migrationPlanRefs=add schemaVersion 9 deliveryPackage sequence and map plus additive ExecutionPlan package refs, preserve every valid schema-v8 domain value, create no package during migration, reject unknown future schema and partial or semantically invalid v9 records, save migration and append atomically, and retain v9 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-095, DEC-097, DEC-098, DEC-099, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/62_ai-company-reviewed-delivery-planning-plan.md, docs/64_ai-company-checkpoint-resume-recovery-plan.md, docs/66_ai-company-durable-delivery-package-persistence-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v8 with no deliveryPackage sequence map plan refs package digest persistence function durable-package route read-only durable package UI focused persistence smoke acceptance gate or Mission close-out authority, and the existing preview declares persisted false and missionDone false
rollbackRefs=disable persist and get entrypoints and UI controls, stop new record creation, preserve valid schema-v9 package and source evidence, quarantine invalid records without deletion or downgrade, keep response-only preview available, leave Mission executing and plan delivery-ready, and rerun migration focused UI compatibility README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-delivery-package.mjs proving atomic v8-to-v9 migration exact digest and terminal checkpoint binding one review-required record idempotency stale refusal reload rollback no package on read boot preview migration or invalid input no Mission task run artifact approval inbox checkpoint source provider commit push release or learning mutation and DEC-091 DEC-094 DEC-097 compatibility; scripts/smoke-ui-slice-657.mjs proving exact-gated persistence read-only durable rendering safe stale failures blocked downstream controls unchanged preview and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=DeliveryPackage acceptance rejection changes-requested supersession or deletion, Mission close-out or done, task close-out, commit package, local commit, push, release, LearningCandidate generation, memory or skill persistence, automatic retry or rework, parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v9 durable review-required DeliveryPackage record described in docs/66_ai-company-durable-delivery-package-persistence-plan.md. This does not approve package acceptance, Mission close-out or done, task close-out, commit, push, release, learning, memory, scheduling, provider expansion, policy mutation, approval bypass, or external connectors.
```

## Other Valid Outcomes

### Request More Evidence

```text
decisionId=operator-decision-ai-company-durable-delivery-package-implementation-001
decisionStatus=request-ai-company-durable-delivery-package-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before durable DeliveryPackage implementation authority can open.
```

### Reject

```text
decisionId=operator-decision-ai-company-durable-delivery-package-implementation-001
decisionStatus=reject-ai-company-durable-delivery-package-implementation
decisionNotes=
approvalStatement=I reject durable DeliveryPackage implementation. The schema-v8 response-only preview remains authoritative.
```

### Defer

```text
decisionId=operator-decision-ai-company-durable-delivery-package-implementation-001
decisionStatus=defer-ai-company-durable-delivery-package-implementation
decisionNotes=
approvalStatement=I defer durable DeliveryPackage implementation. No schema, record, API, UI, or downstream authority opens.
```

## Invalid Shortcuts

These are not implementation approval:

```text
approval
approved
continue
do everything
approve all
self approve
use your judgment
```

They do not identify the schema migration, exact preview/checkpoint digest tuple, immutable record,
idempotency, rollback retention, focused smoke evidence, or still-blocked authority.

## Minimum Acceptance Criteria

An approval is complete only when it:

1. names `docs/66_ai-company-durable-delivery-package-persistence-plan.md` exactly;
2. limits creation to one current delivery-ready plan and terminal checkpoint;
3. requires exact preview, source, package, checkpoint id, and checkpoint digest binding;
4. authorizes only additive schema-v9 migration and one `review-required` record;
5. preserves every schema-v8 domain value and creates no package during migration;
6. requires explicit operator persistence and exact idempotency;
7. names strict invalid/stale no-write behavior, rollback retention, and focused runtime/API/UI smokes;
8. keeps package acceptance, Mission/task close-out, done, commit, push, release, learning, memory,
   scheduling, providers, policy mutation, approval bypass, and connectors blocked.

## Stop Conditions

Stop and do not implement when:

- the decision omits required fields or uses only an invalid shortcut;
- the target creates a package on migration, boot, read, preview, checkpoint, UI render, or prior
  approval without a separate exact operator request;
- source-current plan, terminal checkpoint, review, QA, artifact, approval, or digest evidence cannot
  be proven;
- invalid input can increment a sequence, write partial state, create an object, or trigger downstream
  work;
- the target permits raw source/provider/transcript/env/secret material in the record;
- package acceptance, Mission done, task close-out, commit, push, release, learning, provider calls,
  scheduling, or memory persistence is bundled into the slice;
- rollback requires schema downgrade, record deletion, or source evidence mutation;
- focused migration/runtime/API/UI or aggregate verification fails.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-durable-delivery-package-planning.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until a complete fielded approval is supplied, only planning/source/negative-evidence verification may
pass. Schema-v9 migration, package persistence, API/UI controls, acceptance, Mission done, commit,
push, release, learning, and every downstream authority remain blocked.
