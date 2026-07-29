# AI Company Builder Rework Source Mutation Implementation Decision Handoff

## Purpose

This is the complete fielded decision shape for the Stage 5F plan in
`docs/137_ai-company-builder-rework-source-mutation-plan.md`. `DEC-201` accepts
planning, `DEC-202` records this handoff, and only a complete matching operator
decision may be recorded as `DEC-203`.

This handoff authorizes no implementation or source mutation. Broad approval,
continuation, delegated self-approval, the DEC-200 approved evidence, and this
document are invalid implementation shortcuts.

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

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-builder-rework-source-mutation-implementation-001
decisionStatus=approve-ai-company-builder-rework-source-mutation-implementation-slice
targetAuthority=one explicit local-stub Builder rework source mutation from one exact source-current schema-v24 DEC-200 approved mutation Approval, reusing WorkOrderAttempt #3 and stopping before Reviewer or QA re-execution
targetSurface=src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/builder-rework-source-mutations.js, src/runtime/runtime-service.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/execution-labels.js, ui/task-summaries.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-builder-rework-source-mutation.mjs, scripts/smoke-ui-slice-708.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/137_ai-company-builder-rework-source-mutation-plan.md
runtimePath=require one exact schema-v24 BuilderReworkDispatch waiting-gate WorkOrderAttempt #3 complete local-stub preflight Run and Artifact raw bytes immutable DEC-188 DEC-191 DEC-194 lineage and terminal approved DEC-200 Approval with exact binding digest, accept only the exact path plus fourteen-key request and nested four-key mutationRequest, validate the complete candidate start state and immutable ReworkPlan target allowlist before any write, atomically transition the same attempt #3 from waiting-gate to active while preserving preflight refs and appending only the exact approved Approval ref plus one running Builder Run with executionMode=rework-live-mutation and baseline target digests, invoke one dedicated local-stub Builder request built from immutable records rather than Artifact markdown, enforce existing regular non-symlink realpath-contained targets baseline digests unique allowlisted nonempty base64 updates and bounded bytes, stage backups write only the validated update set verify the actual changed set and restore all targets on failure, then atomically finalize the Run and change-summary patch diff Artifacts and settle attempt #3 completed while preserving the Approval Decision Inbox dispatch ExecutionPlan WorkOrders Reviewer and QA evidence byte-equivalent and returning separate-reviewer-reexecution-decision-required
compatibilityPlanRefs=keep schemaVersion 24 and every sequence and map shape, preserve DEC-197 preflight and DEC-200 Approval creation resolution and exact inspection, keep DEC-200 Approval status metadata and binding digest immutable during mutation, preserve generic Builder mutation standalone task Council specialist commit and release behavior outside the exact rework action, allow only one action-specific attempt #3 lifecycle with one preflight Run and one mutation Run, keep the fixed three-WorkOrder graph blocked at Reviewer changes-requested with QA blocked-dependency, return exact completed active or failed replay without another worker or write, and reject provider-backed execution second rework retry recovery resume checkpoint graph transition Reviewer QA Git release memory policy bypass and connectors
migrationPlanRefs=no schema migration sequence map or new durable domain record is authorized; reuse schema-v24 WorkOrderAttempt Run Artifact Approval and Decision Inbox contracts through narrow action-specific validation only
sourceEvidenceRefs=DEC-188, DEC-191, DEC-194, DEC-195, DEC-197, DEC-198, DEC-200, DEC-201, DEC-202, docs/113_ai-company-multi-agent-completion-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, docs/131_ai-company-rework-plan-acceptance-plan.md, docs/133_ai-company-builder-rework-preflight-plan.md, docs/135_ai-company-builder-rework-mutation-approval-plan.md, docs/137_ai-company-builder-rework-source-mutation-plan.md, src/runtime/contracts.js, src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/builder-rework-dispatches.js, src/runtime/builder-rework-mutation-approvals.js, src/runtime/runtime-service.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=no dedicated Builder rework source mutation module runtime method coordinator method local-stub rework-live-mutation request API route UI form action-specific waiting-gate-to-active transition completed or failed attempt validation mutation Run and Artifact relationship exact replay projection focused runtime smoke or UI smoke exists; the generic runBuilderLiveMutation path parses a different preflight vocabulary mutates generic Approval metadata permits broader provider behavior and does not own the DEC-197 rework attempt lifecycle
rollbackRefs=disable the exact Builder rework source mutation POST GET UI runtime and coordinator entrypoints and stop new starts, preserve every valid schema-v24 record and completed source change, do not silently revert completed mutation, and when an active mutation has source drift retain evidence and require separately approved manual recovery or quarantine before any retry or cleanup
focusedSmokeRefs=scripts/smoke-ai-company-builder-rework-source-mutation.mjs proving strict request and nested request normalization exact approved Approval and source lineage schema-v24 preservation action-specific waiting-gate-to-active transition active-before-worker save one local-stub call immutable source-derived targets baseline drift and realpath regular-file symlink guards bounded base64 output duplicate extra missing and widened update refusal backup complete rollback exact changed-set comparison completed Run change-summary patch diff Artifacts completed attempt Approval byte equivalence fixed graph Reviewer QA preservation exact GET no-write replay divergent 409 interruption retention terminal failure without retry API refusal and DEC-197 DEC-200 generic Builder compatibility; scripts/smoke-ui-slice-708.mjs proving exact source-current action visibility acknowledgement rationale and target evidence safe running completed failed and interrupted rendering stale clearing absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Reviewer or QA re-execution another WorkOrderAttempt or WorkOrder second rework automatic retry recovery resume quarantine or rollback mutation checkpoint or graph transition provider-backed WorkOrder execution result or memory application source widening runtime-agent commit push or release next-Mission scheduling profile or policy mutation approval bypass and external connectors
approvalStatement=I approve implementation only for one exact local-stub Builder rework source mutation described in docs/137_ai-company-builder-rework-source-mutation-plan.md. This does not approve Reviewer or QA re-execution, another attempt, retry, recovery, provider-backed execution, Git or release, memory, scheduling, policy mutation, bypass, or connectors.
```

## Valid Non-Approval Outcomes

`request-more-evidence`, `reject-implementation`, and `defer-implementation`
must supply all fifteen fields, name this exact Stage 5F boundary, preserve
schema v24, authorize no runtime or source writes, and keep the DEC-200 approved
evidence inert.

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, or `go ahead`
- a decision missing, renaming, or widening any required field
- reuse of generic `runBuilderLiveMutation` without the dedicated action,
  immutable Approval, and attempt-lifecycle constraints
- any decision that permits Reviewer/QA execution, another attempt, retry,
  recovery, provider-backed execution, checkpoint transition, Git/release,
  memory application, policy mutation, bypass, or connectors

## Acceptance Rule

Only one complete matching decision can consume this handoff as `DEC-203`.
The approved implementation must stop after exact source mutation evidence and
before Reviewer or QA re-execution.
