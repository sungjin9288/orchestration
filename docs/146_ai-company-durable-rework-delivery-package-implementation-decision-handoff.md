# AI Company Durable Rework DeliveryPackage Implementation Decision Handoff

## Purpose

This document is the complete fielded implementation decision shape for
`docs/145_ai-company-durable-rework-delivery-package-plan.md`. `DEC-213`
accepts planning and `DEC-214` records this handoff. One complete value-matching
operator decision may later be accepted as `DEC-215`.

Generic approval, broad continuation, delegated self-approval, DEC-212 preview
authority, this handoff, QA pass, or record-planning completion does not
authorize schema migration or persistence.

## Current Gate

- Planning-only decision: accepted as `DEC-213`
- Implementation handoff: recorded as `DEC-214`
- Complete fielded implementation decision: not yet accepted
- Current runtime: schema v24 with response/browser-memory-only
  `ReworkDeliveryPackagePreview`
- Current implementation authority: none for schema v25 or durable package
  creation

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

All fifteen fields are required in one operator decision. Missing, renamed,
empty, contradictory, shortcut, or broadened fields do not open
implementation.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-durable-rework-delivery-package-implementation-001
decisionStatus=approve-ai-company-durable-rework-delivery-package-implementation-slice
targetAuthority=one deterministic local schema-v25 immutable review-required ReworkDeliveryPackage record from one exact source-current schema-v24 DEC-212 ReworkDeliveryPackagePreview and separate operator record approval
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/rework-delivery-packages.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-rework-delivery-package.mjs, scripts/smoke-ui-slice-712.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/145_ai-company-durable-rework-delivery-package-plan.md
runtimePath=require one exact current schema-v24 DEC-212 preview request plus previewId previewDigest reworkDeliveryEvidenceDigest and separate recordApproval decision=record-rework-delivery-package, resolve and validate exact existing replay before mutable source recomputation, recompute the complete DEC-212 preview from current state before first write, atomically migrate valid state and append one immutable ReworkDeliveryPackage status=review-required with exact preview evidence allowedActions empty blockedActions approval digest createdAt equal to approval reviewedAt and canonical record digest, expose exact-id and bounded ReworkPlan current-chain inspection while excluding the record map from generic snapshot, and stop before every package decision Mission or task close-out retry recovery execution provider source Git release memory scheduling policy collection bypass or connector boundary
compatibilityPlanRefs=preserve DEC-188 DEC-191 DEC-194 DEC-197 DEC-200 DEC-203 DEC-206 DEC-209 and DEC-212 behavior, preserve every source record and the response-only preview, keep generic DeliveryPackage persistence acceptance and Mission close-out ineligible for the rework chain, create no generic Approval Decision Inbox Run Artifact WorkOrderAttempt checkpoint provider attempt or execution side effect, and keep standalone task Council specialist Growth memory commit and release paths unchanged
migrationPlanRefs=add schemaVersion 25 plus only sequences.reworkDeliveryPackage and reworkDeliveryPackages, preserve every valid schema-v24 value and add no reverse refs to immutable source records, create no record during migration boot read preview GET render or invalid input, validate the complete request recomputed preview approval prospective record and candidate state before one atomic migration-plus-append save, reject future partial or semantically invalid v25 state, and retain valid v25 evidence during rollback without downgrade deletion rewrite decision or close-out
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-097, DEC-163, DEC-169, DEC-172, DEC-188, DEC-191, DEC-194, DEC-197, DEC-200, DEC-203, DEC-206, DEC-209, DEC-210, DEC-211, DEC-212, DEC-213, DEC-214, docs/113_ai-company-multi-agent-completion-plan.md, docs/143_ai-company-rework-delivery-package-preview-plan.md, docs/145_ai-company-durable-rework-delivery-package-plan.md, src/runtime/contracts.js, src/runtime/rework-delivery-package-preview.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v24 with one deterministic response-only persisted=false ReworkDeliveryPackagePreview but no reworkDeliveryPackage sequence map immutable record contract approval digest persistence method exact-id GET bounded ReworkPlan current-chain locator snapshot exclusion durable UI focused persistence smoke package decision or close-out authority, and the generic durable package path remains bound to the original non-rework delivery lineage
rollbackRefs=disable persist and exact inspection entrypoints and UI record controls, stop new ReworkDeliveryPackage creation, preserve every valid schema-v25 record and source record without downgrade deletion rewrite status mutation implicit acceptance or close-out, keep DEC-212 preview available, quarantine invalid records only through later separate authority, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-rework-delivery-package.mjs proving atomic v24-to-v25 migration exact thirteen-key request fresh DEC-212 recomputation separate record approval immutable preview evidence approval and record digests one record idempotency divergent collision exact-id and bounded ReworkPlan current-chain inspection snapshot exclusion generic package ineligibility malformed missing extra repeated blank oversized stale drifted failed interrupted symlinked provider-backed raw-body credential future-schema partial-v25 downstream-record refusal reload retention rollback no passive creation and zero package decision Mission task WorkOrder attempt Run Artifact checkpoint Approval Decision source provider memory Git release schedule policy bypass or connector mutation plus DEC-188 DEC-191 DEC-194 DEC-197 DEC-200 DEC-203 DEC-206 DEC-209 and DEC-212 compatibility; scripts/smoke-ui-slice-712.mjs proving exact-gated record action required acknowledgement and rationale safe failures refresh hydration immutable rendering unchanged preview absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v26 migration, ReworkDeliveryPackage acceptance rejection changes-requested supersession deletion replacement quarantine or status mutation, Mission or task close-out or done, another QA attempt retry recovery resume cancellation or rework, provider-backed execution, source mutation expansion, runtime-agent commit push or release, memory or learning application, automatic parallel dynamic autonomous or background scheduling, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for one exact schema-v25 immutable review-required ReworkDeliveryPackage record described in docs/145_ai-company-durable-rework-delivery-package-plan.md. This permits record creation and exact inspection only. It does not approve package acceptance rejection changes-requested supersession or deletion, Mission or task close-out, retry recovery or execution, provider or source mutation, Git or release, memory or learning application, scheduling, policy mutation, collections, approval bypass, or connectors.
```

## Valid Evidence-Request Outcome

```text
decisionId=operator-decision-ai-company-durable-rework-delivery-package-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the exact schema-v25 durable ReworkDeliveryPackage implementation gate
targetSurface=docs/145_ai-company-durable-rework-delivery-package-plan.md plus the current schema-v24 DEC-212 evidence
implementationPlanRefs=docs/145_ai-company-durable-rework-delivery-package-plan.md
runtimePath=remain planning-only and request named evidence without schema runtime API UI or persistence changes
compatibilityPlanRefs=preserve schema v24 and every current route record source and browser behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-212, DEC-213, DEC-214
negativeEvidenceRefs=name the missing migration contract request binding digest fixture rollback proof or focused smoke evidence
rollbackRefs=no implementation started so preserve current state byte-for-byte
focusedSmokeRefs=scripts/smoke-ai-company-durable-rework-delivery-package-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities
approvalStatement=I request more evidence and do not approve implementation.
```

## Valid Rejection Outcome

```text
decisionId=operator-decision-ai-company-durable-rework-delivery-package-implementation-001
decisionStatus=reject-implementation
targetAuthority=the exact schema-v25 durable ReworkDeliveryPackage implementation gate
targetSurface=docs/145_ai-company-durable-rework-delivery-package-plan.md
implementationPlanRefs=docs/145_ai-company-durable-rework-delivery-package-plan.md
runtimePath=do not implement
compatibilityPlanRefs=preserve schema v24 and DEC-212 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-212, DEC-213, DEC-214
negativeEvidenceRefs=record the operator rejection rationale
rollbackRefs=no implementation started
focusedSmokeRefs=scripts/smoke-ai-company-durable-rework-delivery-package-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities
approvalStatement=I reject this implementation slice.
```

## Valid Deferral Outcome

```text
decisionId=operator-decision-ai-company-durable-rework-delivery-package-implementation-001
decisionStatus=defer-implementation
targetAuthority=the exact schema-v25 durable ReworkDeliveryPackage implementation gate
targetSurface=docs/145_ai-company-durable-rework-delivery-package-plan.md
implementationPlanRefs=docs/145_ai-company-durable-rework-delivery-package-plan.md
runtimePath=remain planning-only until a later complete decision
compatibilityPlanRefs=preserve schema v24 and DEC-212 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-212, DEC-213, DEC-214
negativeEvidenceRefs=record the operator deferral condition
rollbackRefs=no implementation started
focusedSmokeRefs=scripts/smoke-ai-company-durable-rework-delivery-package-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities
approvalStatement=I defer this implementation slice.
```

## Decision Recording Rule

Only one complete value-matching approval outcome may be recorded as
`DEC-215`. Evidence request, rejection, and deferral preserve the planning-only
boundary. No outcome in this handoff authorizes a package decision, Mission or
task close-out, execution, source mutation, Git/release, memory, scheduling,
policy mutation, approval bypass, collection behavior, or connectors.
