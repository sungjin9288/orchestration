# AI Company Durable Reviewer ReworkPlan Implementation Decision Handoff

## Purpose

This document is the complete fielded implementation decision shape for
`docs/129_ai-company-durable-reviewer-rework-plan.md`. `DEC-189` accepts planning only and
`DEC-190` records this handoff only. Neither decision authorizes schema v22, durable ReworkPlan
creation, API/UI mutation, Builder append, retry, preflight, approval, source mutation, role
execution, scheduling, provider, memory, Git/release, policy, collection, or connector behavior.

Generic approval, broad continuation, delegated self-approval, `DEC-188` preview authority, and this
handoff are invalid implementation shortcuts. One complete valid operator decision may be accepted
as `DEC-191`.

## Current Gate

- Planning-only decision: accepted as `DEC-189`
- Implementation handoff: recorded as `DEC-190`
- Complete fielded implementation decision: missing and reserved for `DEC-191`
- Current runtime: schema v21 with response-only ReviewerReworkPlanPreview
- Implementation authority: blocked

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
decisionId=operator-decision-ai-company-durable-reviewer-rework-plan-implementation-001
decisionStatus=approve-ai-company-durable-reviewer-rework-plan-implementation-slice
targetAuthority=one deterministic local schema-v22 immutable review-required ReworkPlan record from one exact source-current schema-v21 ReviewerReworkPlanPreview and separate operator record approval
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/rework-plans.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-durable-reviewer-rework-plan.mjs, scripts/smoke-ui-slice-704.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/129_ai-company-durable-reviewer-rework-plan.md
runtimePath=require one exact current schema-v21 Reviewer changes-requested source tuple plus exact DEC-188 preview id and digest and separate recordApproval decision=record-rework-plan, recompute DEC-188 from current state before first write, atomically migrate valid state and append one immutable ReworkPlan status=review-required with exact findings scope evidence progress attempt cap allowedActions empty blockedActions approval digests and createdAt equal to approval reviewedAt, expose exact-id and bounded ExecutionPlan current-chain inspection while excluding the record map from generic snapshot, and stop before every rework decision Builder append retry preflight approval mutation execution scheduling provider memory Git release policy collection or connector boundary
compatibilityPlanRefs=preserve DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-179 DEC-182 DEC-185 and DEC-188 behavior, preserve response-only preview and all source records, create no generic approval inbox run artifact checkpoint provider attempt or execution side effect, and keep standalone task Council delivery learning memory Growth commit and release paths unchanged
migrationPlanRefs=add schemaVersion 22 plus only sequences.reworkPlan and reworkPlans, preserve every valid schema-v21 value, create no record during boot read preview GET render or invalid input, validate the complete request preview approval prospective record and candidate state before one atomic migration-plus-append save, reject future partial or semantically invalid v22 state, and retain valid v22 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-088, DEC-091, DEC-094, DEC-097, DEC-163, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, DEC-186, DEC-187, DEC-188, DEC-189, DEC-190, docs/113_ai-company-multi-agent-completion-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, src/runtime/contracts.js, src/runtime/reviewer-rework-preview.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v21 with a response-only ReviewerReworkPlanPreview but no reworkPlan sequence map immutable record contract record approval digest persistence method exact-id GET bounded ExecutionPlan current-chain locator snapshot exclusion durable UI focused persistence smoke ReworkPlan decision Builder append retry preflight approval resolution mutation execution or scheduling authority
rollbackRefs=disable persist and exact inspection entrypoints and UI record controls, stop new ReworkPlan creation, preserve every valid schema-v22 ReworkPlan and source record without downgrade deletion rewrite status change or implicit execution, keep DEC-188 preview available, quarantine invalid records only through later separate authority, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-durable-reviewer-rework-plan.mjs proving atomic v21-to-v22 migration exact ten-key request preview recomputation separate approval immutable record digest source scope allowedActions empty blockedActions and deterministic createdAt inheritance one record idempotency divergent collision exact-id and bounded current-chain inspection snapshot exclusion malformed missing extra oversized unknown stale future credential raw-body widened-path widened-command missing-finding QA-already-run provider-backed legacy-unbound pass fail lineage partial-v22 future-schema reload source-drift retention rollback no passive creation and zero WorkOrder attempt approval run artifact checkpoint source provider memory Git release or policy mutation plus DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-179 DEC-182 DEC-185 and DEC-188 compatibility; scripts/smoke-ui-slice-704.mjs proving exact-gated record action required rationale safe failures refresh hydration immutable rendering unchanged preview absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema-v23 migration, ReworkPlan decision acceptance rejection changes-requested supersession deletion replacement quarantine or status mutation, Builder WorkOrder or WorkOrderAttempt append, retry, rework start, preflight, approval creation or resolution, source mutation, Reviewer or QA execution, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for one exact schema-v22 immutable review-required ReworkPlan record described in docs/129_ai-company-durable-reviewer-rework-plan.md. This permits record creation and exact inspection only. It does not approve a rework decision, Builder WorkOrder or WorkOrderAttempt append, retry, preflight, approval, source mutation, Reviewer or QA execution, scheduling, provider, memory, Git, release, policy mutation, collections, approval bypass, or connectors.
```

## Valid Evidence-Request Outcome

```text
decisionId=operator-decision-ai-company-durable-reviewer-rework-plan-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the exact schema-v22 durable ReworkPlan implementation gate
targetSurface=docs/129_ai-company-durable-reviewer-rework-plan.md plus the current schema-v21 DEC-188 preview and focused planning evidence
implementationPlanRefs=docs/129_ai-company-durable-reviewer-rework-plan.md
runtimePath=none until the requested evidence is supplied
compatibilityPlanRefs=preserve schema v21 and DEC-188 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=list the accepted current evidence
negativeEvidenceRefs=list each missing proof
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=list the exact evidence commands requested
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I request the named evidence before durable ReworkPlan implementation can open.
```

## Valid Rejection Outcome

```text
decisionId=operator-decision-ai-company-durable-reviewer-rework-plan-implementation-001
decisionStatus=reject-implementation
targetAuthority=the proposed schema-v22 durable ReworkPlan implementation
targetSurface=docs/129_ai-company-durable-reviewer-rework-plan.md and this handoff
implementationPlanRefs=docs/129_ai-company-durable-reviewer-rework-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v21 and DEC-188 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-189, DEC-190
negativeEvidenceRefs=the operator rejects the proposed record boundary
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-durable-reviewer-rework-plan-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I reject durable ReworkPlan implementation. Schema v21 and the DEC-188 response-only preview remain authoritative.
```

## Valid Deferral Outcome

```text
decisionId=operator-decision-ai-company-durable-reviewer-rework-plan-implementation-001
decisionStatus=defer-implementation
targetAuthority=the proposed schema-v22 durable ReworkPlan implementation
targetSurface=docs/129_ai-company-durable-reviewer-rework-plan.md and this handoff
implementationPlanRefs=docs/129_ai-company-durable-reviewer-rework-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v21 and DEC-188 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-189, DEC-190
negativeEvidenceRefs=implementation is intentionally deferred
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-durable-reviewer-rework-plan-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I defer durable ReworkPlan implementation. No schema, record, API, UI, execution, or downstream authority opens.
```

## Invalid Shortcuts

None of these authorize implementation:

- `approval`
- `approve all`
- `continue`
- `go ahead`
- delegated self-approval
- planning-only `DEC-189`
- handoff-only `DEC-190`
- response-only implementation `DEC-188`
- a decision missing any required field
- a decision that widens the target beyond one immutable ReworkPlan record

## Acceptance Rule

Implementation may begin only when one outcome supplies every required field and matches the bounded
contract in `docs/129_ai-company-durable-reviewer-rework-plan.md`. Any contradiction between fields
fails closed. The exact `Valid Approval Outcome` is the recommended implementation input.

Until one exact valid outcome is supplied, implementation remains blocked. Planning and this handoff
authorize no runtime, schema, API, UI, durable record, rework decision, Builder append, retry,
preflight, approval, mutation, execution, scheduling, provider, memory, Git/release, policy,
collection, bypass, or connector behavior.
