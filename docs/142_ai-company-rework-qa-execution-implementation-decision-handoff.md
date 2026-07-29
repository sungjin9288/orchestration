# AI Company Rework QA Execution Implementation Decision Handoff

## Purpose

This document is the complete fielded decision shape for Stage 5H in
`docs/141_ai-company-rework-qa-execution-plan.md`. `DEC-207` accepts planning
only, `DEC-208` records this handoff, and exact `DEC-209` consumes it for the
bounded runtime, API, UI, worker, Run, Artifact, WorkOrderAttempt, checkpoint,
and graph transition named below.

This handoff alone authorizes no QA execution. Broad approval, continuation,
delegated self-approval, or DEC-206 completion is not a valid implementation
decision; the accepted authority is the exact matching `DEC-209` record.

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
decisionId=operator-decision-ai-company-rework-qa-execution-implementation-001
decisionStatus=approve-ai-company-rework-qa-execution-implementation-slice
targetAuthority=one explicit local-stub shell-free QA execution from one exact passed schema-v24 DEC-206 Reviewer re-execution using the existing QA WorkOrder and appending exactly one QA WorkOrderAttempt #1 and stopping before DeliveryPackage Mission close-out Git or release
targetSurface=src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/rework-qa-execution.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-rework-qa-execution.mjs, scripts/smoke-ui-slice-710.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/141_ai-company-rework-qa-execution-plan.md
runtimePath=require one exact passed DEC-206 Reviewer WorkOrderAttempt #2 terminal Run review Artifact record and raw bytes canonical mutationEvidenceDigest fixed existing QA WorkOrder current post-mutation target bytes and actionless QA_READY checkpoint, accept only the exact path plus fifteen-key request and nested four-key qaRequest, recompute reviewerEvidenceDigest and qaInputDigest and validate current CompanyBlueprint role sources exact three-WorkOrder Builder Reviewer QA dependency graph no prior QA attempt local-stub mode and blocker absence before any write, atomically consume the QA_READY checkpoint and append QA WorkOrderAttempt #1 active plus one running verification Run with executionMode=rework-qa-node-check before worker invocation, require Run metadata workOrderAttemptId to equal the attempt id and attempt runRefs to equal the sole Run id and recompute the attempt recordDigest after attaching that ref, execute only source-bound shell-free process.execPath --check over exact captured bytes with timeout output and post-read drift guards, settle pass with one qa-evidence Artifact completed attempt QA completed ExecutionPlan delivery-ready and one terminal DELIVERY_READY checkpoint or settle failed checks and bounded worker errors at QA blocked, and stop before automatic or same-request DeliveryPackage composition Mission or task close-out source Git release memory scheduling policy bypass or connectors
compatibilityPlanRefs=keep schemaVersion 24 and the fixed three-WorkOrder graph, add no WorkOrder sequence map or durable domain record, preserve immutable DEC-188 through DEC-206 records and earlier Run Artifact Approval Decision attempt and checkpoint evidence, preserve generic reviewed-delivery QA standalone task Council specialist commit and release behavior outside the exact route, keep the strict pre-Stage-5H Stage 5G validation branch and generic QA-step and recovery suppression, add only one exact post-DEC-206 branch bound by reviewerEvidenceDigest qaInputDigest consumed QA-ready checkpoint QA attempt #1 and its Run, return exact active or terminal replay without another save or worker, and stop before DeliveryPackage provider retry recovery source Git release memory scheduling policy bypass or connectors
migrationPlanRefs=no schema migration sequence map WorkOrder or new durable domain record is authorized; reuse schema-v24 WorkOrderAttempt Run Artifact WorkflowCheckpoint ExecutionPlan WorkOrder Mission and task contracts through one action-specific rework QA branch
sourceEvidenceRefs=DEC-188, DEC-197, DEC-200, DEC-203, DEC-204, DEC-205, DEC-206, DEC-207, DEC-208, docs/113_ai-company-multi-agent-completion-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/137_ai-company-builder-rework-source-mutation-plan.md, docs/139_ai-company-reviewer-reexecution-plan.md, docs/140_ai-company-reviewer-reexecution-implementation-decision-handoff.md, docs/141_ai-company-rework-qa-execution-plan.md, src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=current generic run-qa saves the QA Run separately from the active attempt, accepts caller-selected Builder and Reviewer Run ids without binding DEC-206 attempt raw review bytes mutation evidence or checkpoint authority, replays by action instead of the exact request digest, conflicts with the strict Stage 5G file-store branch, and automatically composes a DeliveryPackage preview after QA pass
rollbackRefs=disable the dedicated QA POST GET UI runtime and coordinator entrypoints and stop new starts, preserve every valid active or terminal QA attempt Run Artifact and checkpoint plus all source evidence, perform no deletion renumbering downgrade rewrite inferred settlement or graph rollback, keep Stage 5G exact inspection and generic suppression available, and require a separately approved recovery decision for any interrupted active attempt
focusedSmokeRefs=scripts/smoke-ai-company-rework-qa-execution.mjs proving exact fifteen-key request and nested four-key qaRequest normalization including evaluatedAt equality canonical Reviewer and QA input evidence raw review Artifact bytes current post-mutation target bytes exact three-WorkOrder Builder Reviewer QA dependency graph no prior QA attempt local-stub-only mode blocker refusal schema-v24 preservation existing QA WorkOrder and exact attempt #1 numbering duplicate and mixed generic attempt refusal atomic attempt-plus-running-Run persistence before worker exact bidirectional attempt run ref binding and record-digest tamper refusal source-bound stdin node checks shell and inherited-environment exclusion timeout output cap post-read drift guard pass-to-DELIVERY_READY failed-check and worker-error terminal evidence interruption exact no-write replay divergent 409 file-store tamper refusal no automatic DeliveryPackage preview and DEC-203 DEC-206 generic QA compatibility with zero provider source Git release memory policy bypass or connector authority; scripts/smoke-ui-slice-710.mjs proving exact source-current visibility acknowledgement rationale Reviewer source command and digest evidence safe running passed failed and interrupted rendering stale clearing generic QA-step suppression absent DeliveryPackage and downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=second QA attempt automatic or manual retry recovery resume cancellation quarantine replacement inferred settlement automatic or same-request DeliveryPackage composition durable package mutation Mission or task close-out or done provider-backed execution source mutation result or memory application runtime-agent commit push release next-Mission scheduling or background autonomy profile or policy mutation approval bypass and external connectors
approvalStatement=I approve implementation only for one exact local-stub source-bound QA execution described in docs/141_ai-company-rework-qa-execution-plan.md. This permits appending exactly one QA WorkOrderAttempt #1 to the existing QA WorkOrder and a stop at DELIVERY_READY only. It does not approve another QA attempt, retry, recovery, DeliveryPackage composition, Mission or task close-out, provider or source mutation, Git or release, memory, scheduling, policy mutation, bypass, or connectors.
```

## Valid Non-Approval Outcomes

`request-more-evidence`, `reject-implementation`, and `defer-implementation`
must supply all fifteen fields, name this exact Stage 5H boundary, preserve
schema v24, authorize no QA worker or state transition, and keep DEC-206 evidence
inert.

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, or `go ahead`
- a decision missing, renaming, or widening any required field
- reopening generic `run-qa` without DEC-206 evidence and atomic attempt-plus-Run
  persistence
- accepting caller-selected paths, commands, source bytes, role, or attempt
  number
- composing a DeliveryPackage in the same request
- changing schema, adding a WorkOrder, or opening QA attempt #2
- permitting retry, recovery, provider execution, source mutation, Git/release,
  memory, scheduling, policy mutation, bypass, or connectors

## Acceptance Rule

Implementation began only after the operator supplied every required field in
one value-matching decision. `DEC-207`, `DEC-208`, broad approval, delegated
self-approval, continuation, or this handoff alone does not authorize
implementation. The complete matching decision was accepted as `DEC-209`.
