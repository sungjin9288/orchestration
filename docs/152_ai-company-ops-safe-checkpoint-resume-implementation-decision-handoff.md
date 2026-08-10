# AI Company Ops Safe Checkpoint Resume Implementation Decision Handoff

## Purpose

This handoff turns the planning boundary in
`docs/151_ai-company-ops-safe-checkpoint-resume-plan.md` into one complete operator decision. The
exact value-matching packet was later accepted as `DEC-224`.

## Current Gate

- Planning-only decision: accepted as `DEC-222`
- Implementation handoff: recorded as `DEC-223`
- Current runtime: schema v28 with exact quarantine and QA-only resume evidence
- Implementation decision: accepted as `DEC-224`
- Schema/runtime/API/UI/replacement execution: implemented only for the exact approved boundary

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

Every field must appear exactly once. Generic approval, partial copy, renamed field, widened role,
or broad “all fields approved” wording is non-authorizing.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-ops-safe-checkpoint-resume-implementation-001
decisionStatus=approve-ai-company-ops-safe-checkpoint-resume-implementation-slice
targetAuthority=one deterministic local schema-v28 safe-checkpoint resume from one exact DEC-221 quarantined local-stub QA WorkOrderAttempt into one replacement QA WorkOrderAttempt attemptNumber=2
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/ops-attempt-resumes.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-ops-safe-checkpoint-resume.mjs, scripts/smoke-ui-slice-715.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/151_ai-company-ops-safe-checkpoint-resume-plan.md
runtimePath=require one exact schema-v27 quarantine disposition and its unchanged active QA WorkOrderAttempt consumed qa-ready WorkflowCheckpoint source-current StaffingEntry-bound ExecutionPlan QA WorkOrder local-stub provider tuple plus exact sixteen-key request and operator source-worker-stop confirmation, atomically migrate and append one immutable OpsAttemptResume and one replacement QA WorkOrderAttempt attemptNumber=2 before one shell-free QA run, settle only the exact replacement attempt id, preserve source settlement denial, stop at delivery-ready or terminal QA failure, and stop before second resume Builder Reviewer specialist cancel retry provider source package close-out Git memory scheduling policy collection bypass or connectors
compatibilityPlanRefs=preserve DEC-097 ready-checkpoint recovery for non-StaffingEntry plans, DEC-172 operator steps without active or quarantined attempts, DEC-185 inspection, DEC-221 immutable quarantine and settlement denial, non-quarantined WorkOrder and specialist settlement, generic snapshot exclusions, and standalone task Council Growth provider memory commit and release behavior
migrationPlanRefs=add schemaVersion 28 opsAttemptResume sequence and opsAttemptResumes map only, preserve every valid schema-v27 value, create no resume or replacement attempt during migration boot read GET render or invalid input, validate the full source and replacement candidate before one atomic migration-plus-append save, treat an exact quarantined raw-active source as non-runnable while retaining its bytes and settlement guard, reject future partial duplicate or semantically invalid v28 state, preserve exact replay without worker or save, and retain valid v28 evidence during rollback without downgrade deletion or source rewrite
sourceEvidenceRefs=DEC-097, DEC-172, DEC-185, DEC-219, DEC-221, DEC-222, DEC-223, docs/64_ai-company-checkpoint-resume-recovery-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/149_ai-company-ops-attempt-quarantine-plan.md, docs/151_ai-company-ops-safe-checkpoint-resume-plan.md, src/runtime/workflow-checkpoints.js, src/runtime/work-order-attempts.js, src/runtime/ops-attempt-dispositions.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, src/execution/qa-node-check-runner.js
negativeEvidenceRefs=current schema v27 retains quarantined attempts as raw active records, active uniqueness and completion selection do not distinguish quarantined source from runnable replacement, operator-step settlement is not attempt-id-bound, no immutable resume sidecar or replacement authority exists, Reviewer can create review and inbox side effects, Builder can mutate source, specialists have no WorkflowCheckpoint, and cancel worker-termination automatic recovery remain unsupported
rollbackRefs=disable resume creation execution and UI controls, stop new replacement starts, preserve valid schema-v28 resume records source dispositions source and replacement attempts checkpoints Runs and Artifacts, retain source settlement denial and exact inspection, mark no inferred result, perform no downgrade deletion retry or cleanup, and rerun migration focused compatibility UI QA README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-ops-safe-checkpoint-resume.mjs proving atomic v27-to-v28 migration no passive creation exact sixteen-key binding fixed operator confirmation QA-only local-stub eligibility immutable source and resume evidence same-save replacement attemptNumber=2 semantic active uniqueness attempt-id-bound source settlement denial replacement pass and fail shell-free one-call execution exact replay inspection reload rollback malformed stale duplicate partial future and widened-role refusal no second resume cancel retry worker termination provider source package close-out Git memory scheduling policy collection bypass or connector effect plus DEC-097 DEC-172 DEC-185 DEC-221 compatibility; scripts/smoke-ui-slice-715.mjs proving exact disposition and checkpoint gating mandatory acknowledgement timestamp safe stale failure source and replacement evidence refresh no wider controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Builder Reviewer or specialist resume, cancellation, worker termination, retry, rework, inferred success or failure, second or automatic resume, automatic target selection, parallel dynamic autonomous or background scheduling, provider-backed execution, source mutation, DeliveryPackage or Mission task close-out, runtime-agent commit push or release, memory or learning application, next-Mission creation, profile or policy mutation, approval bypass, collection list history search ranking recommendation, and external connectors
approvalStatement=I approve implementation only for one exact schema-v28 local-stub QA safe-checkpoint resume described in docs/151_ai-company-ops-safe-checkpoint-resume-plan.md. This permits one immutable resume sidecar one replacement QA WorkOrderAttempt and one shell-free QA execution only. It does not approve Builder Reviewer or specialist resume cancellation worker termination retry provider source package close-out Git release memory scheduling policy collections bypass or connectors.
```

## Other Valid Outcomes

Use the same fields and source refs with one of these statuses:

- `request-ai-company-ops-safe-checkpoint-resume-implementation-evidence`
- `reject-ai-company-ops-safe-checkpoint-resume-implementation-slice`
- `defer-ai-company-ops-safe-checkpoint-resume-implementation-slice`

An evidence request must name the missing proof. Rejection or deferral keeps every schema and
runtime authority closed.

## Minimum Acceptance Criteria

1. The decision matches the exact QA-only schema-v28 boundary.
2. The source is one unchanged DEC-221 quarantined QA WorkOrderAttempt at its exact consumed
   `qa-ready` checkpoint.
3. Operator worker-stop confirmation is explicit and time-bound; the runtime never infers process
   termination.
4. First write atomically appends one immutable resume record and replacement attempt #2.
5. Source disposition, attempt, checkpoint, plan, and WorkOrder bytes remain unchanged.
6. Operator-step completion and failure settle the exact named attempt id, never a plan-selected
   source or replacement.
7. Only one local shell-free QA run is allowed; pass and failure stop without retry or downstream
   package work.
8. Exact replay, inspection, reload, rollback, focused runtime/API/UI, UI QA, README, inventory, and
   aggregate verification pass.

## Stop Condition

The stop condition was satisfied by the exact value-matching `DEC-224` approval. Close-out requires
the bounded schema-v28 record, exact replacement attempt #2, one shell-free QA execution, focused
runtime/API/UI and compatibility evidence, UI QA, README, inventory, and aggregate verification to
agree. No authority outside the approval statement is implied.
