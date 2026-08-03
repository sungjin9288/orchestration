# AI Company ReworkDeliveryPackage Acceptance Implementation Decision Handoff

## Purpose

This document fixes the complete fielded decision required to widen planning-only `DEC-216` into one
schema-v26 append-only ReworkDeliveryPackageAcceptance record-and-inspect implementation. It grants no
implementation authority by itself.

## Current Gate

- Planning-only authority is accepted as `DEC-216`.
- This handoff is recorded as `DEC-217`.
- Current runtime remains schema v25 with immutable review-required ReworkDeliveryPackage records.
- No acceptance sequence, map, record, route, read model, or UI action exists.
- Broad approval, continuation, prior DEC-215 authority, or delegated self-approval is non-authorizing.

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
decisionId=operator-decision-ai-company-rework-delivery-package-acceptance-implementation-001
decisionStatus=approve-ai-company-rework-delivery-package-acceptance-implementation-slice
targetAuthority=one deterministic local schema-v26 append-only ReworkDeliveryPackageAcceptance record from one exact source-current schema-v25 review-required ReworkDeliveryPackage
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/rework-delivery-package-acceptances.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-rework-delivery-package-acceptance.mjs, scripts/smoke-ui-slice-713.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/147_ai-company-rework-delivery-package-acceptance-plan.md
runtimePath=require one exact immutable schema-v25 review-required ReworkDeliveryPackage plus exact package record digest and fifteen-key accept request, resolve exact existing acceptance replay before mutable source recomputation, otherwise freshly recompute the complete DEC-212 source preview from current bytes and bounded Artifacts, require decision=accept, atomically migrate and append one immutable acceptance, expose exact package-bound accepted evidence, and stop before rejection changes-requested Mission or task close-out retry recovery execution provider source Git release learning scheduling policy collections bypass or connectors
compatibilityPlanRefs=keep the source ReworkDeliveryPackage immutable and digest-stable, preserve DEC-212 preview and DEC-215 persistence replay exact-id ReworkPlan locator snapshot exclusion and UI hydration, keep generic DeliveryPackage acceptance and Mission close-out paths ineligible for rework evidence, create no Approval Decision Inbox Run Artifact WorkOrderAttempt checkpoint or reverse source reference, and preserve standalone task Council Growth provider memory commit and release behavior
migrationPlanRefs=add schemaVersion 26 reworkDeliveryPackageAcceptance sequence and reworkDeliveryPackageAcceptances map only, preserve every valid schema-v25 domain value, create no acceptance during migration boot read GET hydration preview render or invalid input, reject unknown future partial duplicate or semantically invalid v26 state, validate the complete first-write candidate before one atomic migration-plus-append save, and retain valid v26 evidence during rollback without downgrade deletion rewrite or implicit close-out
sourceEvidenceRefs=DEC-076, DEC-188, DEC-191, DEC-194, DEC-197, DEC-200, DEC-203, DEC-206, DEC-209, DEC-212, DEC-213, DEC-215, DEC-216, DEC-217, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/145_ai-company-durable-rework-delivery-package-plan.md, docs/147_ai-company-rework-delivery-package-acceptance-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/rework-delivery-package-preview.js, src/runtime/rework-delivery-packages.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v25 with immutable review-required ReworkDeliveryPackage records and exact inspection only and has no reworkDeliveryPackageAcceptance sequence map contract digest persistence method exact accept or inspection route accepted read model UI action focused runtime smoke UI smoke package decision or Mission task close-out authority
rollbackRefs=disable accept and exact acceptance inspection entrypoints and UI action, stop new acceptance creation, preserve every valid schema-v26 acceptance package and source record without downgrade deletion rewrite reopening or implicit close-out, quarantine invalid records only through later separate authority, keep DEC-212 preview and DEC-215 package persistence and inspection available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-rework-delivery-package-acceptance.mjs proving exact additive v25-to-v26 migration no passive creation strict fifteen-key decision binding first-write fresh DEC-212 current-byte and bounded-Artifact recomputation immutable package and source records canonical acceptance digest uniqueness exact replay before source recomputation later source-drift retention exact inspection snapshot exclusion reload rollback malformed stale divergent provider raw-body future downstream and partial-v26 refusal no Mission task plan WorkOrder attempt checkpoint Run Artifact Approval Inbox source provider Git release memory learning scheduling policy or connector mutation and DEC-212 DEC-215 plus generic DeliveryPackage acceptance compatibility; scripts/smoke-ui-slice-713.mjs proving exact-gated accept command package-bound hydration durable accepted rendering safe stale failure replay reload source-drift visibility absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=ReworkDeliveryPackage rejection changes-requested supersession deletion replacement quarantine or source-package status mutation, Mission or task close-out or done, another QA attempt retry recovery resume cancellation or rework, provider-backed execution, source mutation expansion, runtime-agent commit push or release, memory or learning application, automatic parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for one exact schema-v26 append-only ReworkDeliveryPackageAcceptance record described in docs/147_ai-company-rework-delivery-package-acceptance-plan.md. This permits acceptance evidence and exact inspection only. It does not approve rejection changes-requested package mutation Mission or task close-out retry recovery execution provider or source action Git or release memory or learning scheduling policy collections approval bypass or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionStatus=request-evidence
approvalStatement=I request the named evidence before ReworkDeliveryPackage acceptance implementation authority can open.
```

Rejection:

```text
decisionStatus=reject
approvalStatement=I reject ReworkDeliveryPackage acceptance implementation. Schema-v25 review-required package evidence remains authoritative.
```

Deferral:

```text
decisionStatus=defer
approvalStatement=I defer ReworkDeliveryPackage acceptance implementation. No schema, record, API, UI, or downstream authority opens.
```

## Invalid Shortcuts

The following do not open implementation authority:

- `approval`, `approved`, `continue`, `do everything`, `approve all`, `self approve`, or
  `use your judgment`;
- this planning decision or handoff without every exact implementation field;
- DEC-212 preview, DEC-215 package persistence, QA pass, or package record approval;
- a UI button click without the exact package/preview/source/evidence/attempt/checkpoint tuple;
- acceptance interpreted as package status mutation, Mission/task close-out, retry, recovery,
  execution, Git/release, learning, scheduling, policy, collection, bypass, or connector authority.

## Minimum Acceptance Criteria

The implementation decision must explicitly:

1. select additive schema v26 and append-only acceptance evidence;
2. preserve immutable schema-v25 package and every source digest;
3. require one exact fifteen-key request with `decision=accept`;
4. require fresh DEC-212 recomputation for first write;
5. resolve exact replay before mutable source recomputation;
6. create no acceptance during migration, read, GET, hydration, preview, or render;
7. fail stale, invalid, divergent, provider, raw-body, future, and downstream requests before write;
8. expose only exact package-bound accepted evidence and exclude the map from generic snapshot;
9. preserve DEC-212, DEC-215, generic DeliveryPackage acceptance, standalone task, and Council
   compatibility;
10. name rollback retention and focused runtime/API/UI verification.

## Stop Conditions

Stop without implementation if:

- any required field is missing, renamed, broadened, or conflicts with `DEC-216`;
- first acceptance can proceed without fresh current-source recomputation;
- replay requires mutable source recomputation or writes state;
- migration synthesizes acceptance or rewrites package/source evidence;
- rejection, changes-requested, package mutation, close-out, retry, recovery, execution, provider,
  source, Git/release, memory, learning, scheduling, policy, collection, bypass, or connectors open;
- focused migration/runtime/API/UI, compatibility, README inventory, UI QA, or aggregate verification
  fails.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-rework-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-rework-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-713.mjs
node scripts/smoke-ai-company-durable-rework-delivery-package.mjs
node scripts/smoke-ui-slice-712.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The exact value-matching decision was accepted as `DEC-218` and this handoff is consumed. Its
downstream exclusions remain authoritative.
