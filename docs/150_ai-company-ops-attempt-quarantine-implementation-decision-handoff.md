# AI Company Ops Attempt Quarantine Implementation Decision Handoff

## Purpose

This handoff converts the planning boundary in
`docs/149_ai-company-ops-attempt-quarantine-plan.md` into one complete operator decision. The
document records no runtime authority by itself.

## Current Gate

- Planning-only decision: accepted as `DEC-219`
- Implementation handoff: recorded as `DEC-220`
- Current runtime: schema v26 with read-only DEC-185 supervision preview
- Implementation decision: missing and reserved for `DEC-221`
- Runtime/schema/API/UI mutation: blocked

## Required Fields

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

Every field must appear exactly once. A generic `approve`, partial copy, renamed field, widened
target, or broad “all fields approved” statement does not open implementation.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-ops-attempt-quarantine-implementation-001
decisionStatus=approve-ai-company-ops-attempt-quarantine-implementation-slice
targetAuthority=one deterministic local schema-v27 append-only OpsAttemptDisposition with decision=quarantine from one exact source-current DEC-185 OpsSupervisionPreview across one active WorkOrderAttempt specialist first attempt or specialist retry attempt
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/ops-attempt-dispositions.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-ops-attempt-quarantine.mjs, scripts/smoke-ui-slice-714.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/149_ai-company-ops-attempt-quarantine-plan.md
runtimePath=require one exact active DEC-185 target and exact eleven-key quarantine request, recompute the source-current supervision preview before first write, require decision=quarantine reasonCode=operator-uncertain-outcome-after-interruption and acknowledgement=quarantine-without-settlement-or-recovery, atomically migrate and append one immutable disposition, deny every later settlement for the exact target record digest, expose exact-id inspection, and stop before source attempt or parent mutation inferred result cancel resume replay retry rework new attempt worker termination provider source Git release memory scheduling policy collection bypass or connectors
compatibilityPlanRefs=preserve DEC-097 checkpoint recovery and cancellation, DEC-172 operator-stepped scheduling for non-quarantined targets, DEC-179 specialist first-attempt settlement, DEC-182 failed-cell retry settlement, DEC-185 response-only supervision preview, DEC-218 schema-v26 package acceptance, generic snapshot exclusions, and standalone task Council Growth provider memory commit and release behavior
migrationPlanRefs=add schemaVersion 27 opsAttemptDisposition sequence and opsAttemptDispositions map only, preserve every valid schema-v26 value, create no disposition during migration boot read GET hydration preview render or invalid input, reject future partial duplicate and semantically invalid v27 state, validate the complete candidate before one atomic migration-plus-append save, preserve exact replay without save or sequence increment, and retain valid v27 evidence plus settlement denial during rollback without downgrade deletion source rewrite or implicit terminal transition
sourceEvidenceRefs=DEC-097, DEC-172, DEC-179, DEC-182, DEC-183, DEC-185, DEC-218, DEC-219, DEC-220, docs/64_ai-company-checkpoint-resume-recovery-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/125_ai-company-ops-supervision-preview-plan.md, docs/149_ai-company-ops-attempt-quarantine-plan.md, src/runtime/ops-supervision-preview.js, src/runtime/work-order-attempts.js, src/runtime/specialist-cell-attempts.js, src/runtime/specialist-cell-retries.js, src/runtime/runtime-service.js
negativeEvidenceRefs=current schema v26 has exact active-attempt classification but no durable Ops disposition sequence map contract record digest quarantine persistence method POST route exact inspection accepted UI command target-wide settlement guard or authority for cancel resume retry inferred settlement worker termination or recovery
rollbackRefs=disable new quarantine creation and the UI command, preserve valid schema-v27 dispositions and exact inspection, retain settlement denial for every quarantined exact target, preserve every source attempt and parent record, remove no evidence, perform no downgrade, and rerun migration focused compatibility UI QA README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-ops-attempt-quarantine.mjs proving atomic v26-to-v27 migration no passive creation exact eleven-key DEC-185 binding immutable disposition canonical digest uniqueness exact replay before source recomputation exact inspection snapshot exclusion reload rollback all three target types and terminal stale malformed divergent duplicate partial future refusal target-wide late-settlement denial unchanged source and parent bytes no inferred result attempt retry worker provider source Approval Inbox Run Artifact checkpoint memory Git release scheduling policy collection bypass or connector mutation plus DEC-097 DEC-172 DEC-179 DEC-182 DEC-185 DEC-218 compatibility; scripts/smoke-ui-slice-714.mjs proving exact preview gated acknowledgement safe stale failure exact hydration durable rendering refresh reload absent cancel resume retry settle controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=attempt source-record or parent mutation, inferred success or failure, cancellation, worker termination, resume, replay, retry, rework, new attempt creation, automatic target selection, parallel dynamic autonomous or background scheduling, provider-backed execution, result application, source mutation, Mission or task close-out, runtime-agent commit push or release, memory or learning application, next-Mission creation, profile or policy mutation, approval bypass, collection list history search ranking recommendation, and external connectors
approvalStatement=I approve implementation only for one exact schema-v27 append-only OpsAttemptDisposition quarantine and its deterministic late-settlement guard described in docs/149_ai-company-ops-attempt-quarantine-plan.md. This permits quarantine evidence and settlement denial only. It does not approve attempt or parent mutation inferred result cancel worker termination resume replay retry rework new attempts providers source action Git release memory scheduling policy collections bypass or connectors.
```

## Other Valid Outcomes

Use the same fields and source refs with one of these statuses:

- `request-ai-company-ops-attempt-quarantine-implementation-evidence`
- `reject-ai-company-ops-attempt-quarantine-implementation-slice`
- `defer-ai-company-ops-attempt-quarantine-implementation-slice`

An evidence request must name missing evidence. Rejection or deferral must keep every runtime and
schema authority closed.

## Minimum Acceptance Criteria

1. The approval matches the exact v27 append-only quarantine boundary.
2. First write recomputes DEC-185 and validates an active source-current target.
3. Exact replay resolves without save before mutable recomputation.
4. Quarantine never rewrites the attempt or parent and never infers a result.
5. Every later settlement for the exact target digest fails closed.
6. Non-quarantined scheduler and specialist settlement behavior remains unchanged.
7. Exact inspection exists without list, search, or automatic selection.
8. Focused runtime/API/UI, UI QA, README inventory, and aggregate verification pass.

## Stop Condition

Until one complete value-matching approval is accepted as `DEC-221`, no implementation file,
schema-v27 field, quarantine route, settlement guard, or UI command may be added.
