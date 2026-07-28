# AI Company ReworkPlan Acceptance Implementation Decision Handoff

## Purpose

This document is the complete fielded implementation decision shape for
`docs/131_ai-company-rework-plan-acceptance-plan.md`. `DEC-192` accepts planning and `DEC-193`
records this handoff. Schema-v23 acceptance implementation remains blocked until one complete valid
operator outcome is accepted as `DEC-194`.

Generic approval, broad continuation, delegated self-approval, `DEC-191` record authority, and this
handoff are invalid implementation shortcuts. Builder append, retry, preflight, approval, source
mutation, role execution, scheduling, provider, memory, Git/release, policy, collection, bypass,
and connector behavior remain closed.

## Current Gate

- Planning-only decision: accepted as `DEC-192`
- Implementation handoff: recorded as `DEC-193`
- Complete fielded implementation decision: not accepted
- Current runtime: schema v22 with immutable review-required ReworkPlan evidence
- Implementation authority: blocked
- Reserved implementation decision: `DEC-194`

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

All fifteen fields are required in one operator decision. Missing, renamed, empty, contradictory, or
broadened fields do not open implementation.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-rework-plan-acceptance-implementation-001
decisionStatus=approve-ai-company-rework-plan-acceptance-implementation-slice
targetAuthority=one deterministic local schema-v23 append-only ReworkPlanAcceptance record from one exact source-current schema-v22 review-required ReworkPlan
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/rework-plan-acceptances.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-rework-plan-acceptance.mjs, scripts/smoke-ui-slice-705.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/131_ai-company-rework-plan-acceptance-plan.md
runtimePath=require one exact current schema-v22 immutable review-required ReworkPlan plus an exact ten-key operator request directly binding the record preview execution attempt and progress digests while transitively binding review findings scope evidence attempt cap and blocked actions through reworkPlanRecordDigest and previewDigest, require decision=accept acknowledgement=accept-exact-rework-plan-without-execution bounded rationale and reviewedAt, recompute the exact DEC-188 source projection from current state before first write, atomically migrate valid state and append one immutable ReworkPlanAcceptance decision=accepted with exact source identity attempt cap closed authority summary createdAt equal to reviewedAt and canonical acceptanceDigest, expose only exact ReworkPlan-bound acceptance inspection while excluding the map from generic snapshot, keep the source ReworkPlan unchanged, and stop before Builder WorkOrder or WorkOrderAttempt append retry preflight approval mutation execution scheduling provider memory Git release policy collection bypass or connector authority
compatibilityPlanRefs=preserve DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-179 DEC-182 DEC-185 DEC-188 and DEC-191 behavior, preserve the response-only preview immutable ReworkPlan and all source records, create no generic Approval Decision Inbox item WorkOrder WorkOrderAttempt Run Artifact checkpoint provider attempt or execution side effect, and keep standalone task Council delivery learning memory Growth commit and release paths unchanged
migrationPlanRefs=add schemaVersion 23 plus only sequences.reworkPlanAcceptance and reworkPlanAcceptances, preserve every valid schema-v22 value, create no acceptance during boot read migration validation preview GET hydration render or invalid input, validate the complete path-plus-ten-key request recomputed source source record prospective acceptance and candidate state before one atomic migration-plus-append save, reject future partial or semantically invalid v23 state, and retain valid v23 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-088, DEC-091, DEC-094, DEC-097, DEC-163, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, DEC-186, DEC-187, DEC-188, DEC-189, DEC-190, DEC-191, DEC-192, DEC-193, docs/113_ai-company-multi-agent-completion-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, docs/131_ai-company-rework-plan-acceptance-plan.md, src/runtime/contracts.js, src/runtime/reviewer-rework-preview.js, src/runtime/rework-plans.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v22 with immutable review-required ReworkPlan evidence but no reworkPlanAcceptance sequence map append-only record contract acceptance digest runtime accept command exact acceptance GET generic snapshot exclusion durable acceptance UI focused runtime smoke UI smoke ReworkPlan outcome evidence Builder append retry preflight approval mutation execution or scheduling authority
rollbackRefs=disable accept and exact inspection entrypoints and UI accept controls, stop new ReworkPlanAcceptance creation, preserve every valid schema-v23 acceptance ReworkPlan and source record without downgrade deletion rewrite status change or implicit execution, keep DEC-188 preview and DEC-191 record inspection available, quarantine invalid records only through later separate authority, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-rework-plan-acceptance.mjs proving atomic v22-to-v23 migration exact path-plus-ten-key request current DEC-188 source recomputation exact DEC-191 record and digest binding one immutable accepted record closed authority summary deterministic createdAt inheritance canonical acceptance digest exact replay without save divergent collision exact acceptance GET snapshot exclusion malformed missing extra oversized unknown stale future credential raw-body widened-scope missing-finding changed-review QA-already-run provider-backed legacy-unbound lineage partial-v23 future-schema reload source-drift retention rollback no passive creation unchanged source ReworkPlan and zero Builder WorkOrder attempt retry preflight approval run artifact checkpoint source provider memory Git release or policy mutation plus DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-179 DEC-182 DEC-185 DEC-188 and DEC-191 compatibility; scripts/smoke-ui-slice-705.mjs proving exact-gated accept action required rationale safe failures refresh hydration immutable rendering unchanged preview and record actions absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v24 migration, ReworkPlan rejection changes-requested supersession deletion replacement quarantine or source status mutation, Builder WorkOrder or WorkOrderAttempt append, retry, rework start, preflight, approval creation or resolution, source mutation, Builder Reviewer or QA execution, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for one exact schema-v23 append-only ReworkPlanAcceptance record described in docs/131_ai-company-rework-plan-acceptance-plan.md. This permits acceptance evidence creation and exact inspection only. It does not approve ReworkPlan mutation, Builder WorkOrder or WorkOrderAttempt append, retry, preflight, approval, source mutation, Builder Reviewer or QA execution, scheduling, provider, memory, Git, release, policy mutation, collections, approval bypass, or connectors.
```

## Valid Evidence-Request Outcome

```text
decisionId=operator-decision-ai-company-rework-plan-acceptance-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the exact schema-v23 ReworkPlanAcceptance implementation gate
targetSurface=docs/131_ai-company-rework-plan-acceptance-plan.md plus current schema-v22 ReworkPlan and focused planning evidence
implementationPlanRefs=docs/131_ai-company-rework-plan-acceptance-plan.md
runtimePath=none until the requested evidence is supplied
compatibilityPlanRefs=preserve schema v22 and DEC-188 plus DEC-191 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=list the accepted current evidence
negativeEvidenceRefs=list each missing proof
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=list the exact evidence commands requested
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I request the named evidence before ReworkPlanAcceptance implementation can open.
```

## Valid Rejection Outcome

```text
decisionId=operator-decision-ai-company-rework-plan-acceptance-implementation-001
decisionStatus=reject-implementation
targetAuthority=the proposed schema-v23 ReworkPlanAcceptance implementation
targetSurface=docs/131_ai-company-rework-plan-acceptance-plan.md and this handoff
implementationPlanRefs=docs/131_ai-company-rework-plan-acceptance-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v22 and DEC-188 plus DEC-191 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-191, DEC-192, DEC-193
negativeEvidenceRefs=the operator rejects the proposed acceptance boundary
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-rework-plan-acceptance-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I reject ReworkPlanAcceptance implementation. Schema v22 and the immutable DEC-191 ReworkPlan remain authoritative.
```

## Valid Deferral Outcome

```text
decisionId=operator-decision-ai-company-rework-plan-acceptance-implementation-001
decisionStatus=defer-implementation
targetAuthority=the proposed schema-v23 ReworkPlanAcceptance implementation
targetSurface=docs/131_ai-company-rework-plan-acceptance-plan.md and this handoff
implementationPlanRefs=docs/131_ai-company-rework-plan-acceptance-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v22 and DEC-188 plus DEC-191 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-191, DEC-192, DEC-193
negativeEvidenceRefs=implementation is intentionally deferred
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-rework-plan-acceptance-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I defer ReworkPlanAcceptance implementation. No schema, record, API, UI, Builder append, execution, or downstream authority opens.
```

## Invalid Shortcuts

None of these authorize implementation:

- `approval`
- `approve all`
- `continue`
- `go ahead`
- delegated self-approval
- planning-only `DEC-192`
- handoff-only `DEC-193`
- record-only implementation `DEC-191`
- a decision missing any required field
- a decision that widens the target beyond one append-only acceptance fact

## Acceptance Rule

Implementation may begin only when one outcome supplies every required field and matches the bounded
contract in `docs/131_ai-company-rework-plan-acceptance-plan.md`. Any contradiction between fields
fails closed. The exact `Valid Approval Outcome` is the recommended implementation input reserved
for `DEC-194`.
