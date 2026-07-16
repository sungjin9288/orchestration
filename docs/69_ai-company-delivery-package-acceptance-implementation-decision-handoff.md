# AI Company DeliveryPackage Acceptance Implementation Decision Handoff

## Purpose

`docs/68_ai-company-delivery-package-acceptance-plan.md`의 planning-only 결과를 schema-v10
append-only acceptance record와 API/UI action으로 넓힐지 operator가 complete fielded decision으로
결정하도록 한다. 이 문서는 구현하지 않고 decision shape와 stop boundary만 고정한다.

## Current Gate

- Planning-only authority is accepted as `DEC-101`.
- The complete fielded decision is accepted as `DEC-103`.
- Current runtime is schema v10 with one exact append-only acceptance path.
- Durable DeliveryPackage records remain immutable and `review-required`.
- Acceptance sequence/map, canonical digest, exact get/accept routes, and read-only UI evidence exist.
- Mission/task close-out planning and its fielded handoff are recorded separately by `DEC-104` and
  `DEC-105`; implementation, done, commit/push/release, and learning remain blocked.

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
decisionId=operator-decision-ai-company-delivery-package-acceptance-implementation-001
decisionStatus=approve-ai-company-delivery-package-acceptance-implementation-slice
targetAuthority=one deterministic local schema-v10 append-only DeliveryPackageAcceptance record from one exact source-current schema-v9 review-required DeliveryPackage
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/delivery-package-acceptances.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-delivery-package-acceptance.mjs, scripts/smoke-ui-slice-658.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/68_ai-company-delivery-package-acceptance-plan.md
runtimePath=require one exact source-current schema-v9 review-required package plus current delivery-ready plan and terminal checkpoint, recompute and compare the preview source package and checkpoint tuple, require one exact decision=accept operator request, atomically append one immutable acceptance record, expose read-only accepted evidence, and stop before package rejection changes-requested Mission or task close-out done commit push release or learning
compatibilityPlanRefs=keep the source DeliveryPackage immutable and digest-stable, preserve DEC-091 DEC-094 DEC-097 DEC-100 routes and behavior, preserve standalone task commit and release paths outside the new routes, and create no approval or Decision Inbox item
migrationPlanRefs=add schemaVersion 10 deliveryPackageAcceptance sequence and map, preserve every valid schema-v9 domain value, create no acceptance during migration, reject future partial or semantically invalid v10 records, save migration and append atomically, and retain v10 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-098, DEC-100, DEC-101, DEC-102, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/51_ai-company-delivery-roadmap.md, docs/66_ai-company-durable-delivery-package-persistence-plan.md, docs/68_ai-company-delivery-package-acceptance-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/delivery-packages.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v9 with immutable review-required packages only and no deliveryPackageAcceptance sequence map record digest route UI action focused acceptance smoke accepted read model or Mission close-out authority
rollbackRefs=disable accept and get entrypoints and UI action, stop new acceptance creation, preserve valid schema-v10 acceptance and every source record, quarantine invalid records without deletion or downgrade, keep schema-v9 package inspection and preview available, leave Mission executing and plan delivery-ready, and rerun migration focused UI compatibility README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-delivery-package-acceptance.mjs proving atomic v9-to-v10 migration exact tuple and decision binding source-current recompute immutable package and acceptance digests one record idempotency stale refusal reload rollback no acceptance on read boot preview migration or invalid input no Mission task plan WorkOrder checkpoint run artifact approval inbox source provider commit push release or learning mutation and DEC-091 DEC-094 DEC-097 DEC-100 compatibility; scripts/smoke-ui-slice-658.mjs proving exact-gated accept action read-only durable rendering safe stale failures blocked downstream controls unchanged package persistence and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=DeliveryPackage rejection changes-requested supersession or deletion, Mission close-out or done, task close-out or Done, commit package, local commit, push, release, LearningCandidate generation, memory or skill persistence, automatic retry or rework, parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, provider expansion, profile or policy mutation, approval bypass, external connectors
approvalStatement=I approve implementation only for one exact schema-v10 append-only DeliveryPackage acceptance record described in docs/68_ai-company-delivery-package-acceptance-plan.md. This does not approve package rejection or changes-requested, Mission or task close-out, done, commit, push, release, learning, memory, scheduling, provider expansion, policy mutation, approval bypass, or external connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-evidence
approvalStatement=I request the named evidence before DeliveryPackage acceptance implementation authority can open.
```

Rejection:

```text
decisionStatus=reject
approvalStatement=I reject DeliveryPackage acceptance implementation. Schema-v9 review-required evidence remains authoritative.
```

Deferral:

```text
decisionStatus=defer
approvalStatement=I defer DeliveryPackage acceptance implementation. No schema, record, API, UI, or downstream authority opens.
```

## Invalid Shortcuts

The following do not open implementation authority:

- `approval`, `approved`, `continue`, `do everything`, `approve all`, `self approve`, or `use your judgment`;
- planning approval without the complete fielded implementation decision;
- prior DeliveryPackage persistence approval;
- a package button click without the exact source/package/checkpoint digest tuple;
- a valid acceptance plan interpreted as Mission/task close-out, commit, release, or learning authority.

## Minimum Acceptance Criteria

The implementation decision must explicitly:

1. select additive schema v10 and append-only acceptance evidence;
2. preserve the immutable schema-v9 DeliveryPackage and its digest;
3. require exact current preview/source/package/checkpoint tuple plus `decision=accept`;
4. create no acceptance during migration, read, boot, preview, hydration, or rendering;
5. fail stale/invalid/divergent requests before write and make exact replay idempotent;
6. bind one acceptance to one package and keep every source ref strict-loader valid;
7. expose only read-only accepted evidence after append;
8. keep Mission/task/plan lifecycle and commit/release/learning authority unchanged;
9. preserve DEC-091/094/097/100 and standalone task/Council compatibility;
10. name rollback retention and focused runtime/API/UI/browser verification.

## Stop Conditions

Stop without writing if:

- any required decision field is missing or conflicts with the plan;
- package, plan, checkpoint, preview, evidence, or digest is stale or invalid;
- unresolved package items are non-empty;
- migration would synthesize acceptance or rewrite existing package evidence;
- implementation opens rejection/changes-requested, Mission/task close-out, commit/push/release,
  learning/memory, scheduling/providers, policy mutation, approval bypass, or connectors;
- focused migration/runtime/API/UI, compatibility, README inventory, or aggregate verification fails.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The implementation decision is consumed by `DEC-103`; focused runtime/API/UI and aggregate evidence
must remain green. Mission/task close-out implementation, commit/push/release, learning, and every
authority outside the exact acceptance path remain blocked.
