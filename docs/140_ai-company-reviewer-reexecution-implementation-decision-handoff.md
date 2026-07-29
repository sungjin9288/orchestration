# AI Company Reviewer Re-execution Implementation Decision Handoff

## Purpose

This document is the complete fielded decision shape for Stage 5G in
`docs/139_ai-company-reviewer-reexecution-plan.md`. `DEC-204` accepts planning
only and `DEC-205` records this handoff. A complete matching operator decision
is reserved for `DEC-206`.

This handoff authorizes no runtime, schema, API, UI, state, worker, Reviewer,
QA, or source behavior. Broad approval, continuation, delegated
self-approval, DEC-203 completion, and this document are invalid
implementation shortcuts.

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
decisionId=operator-decision-ai-company-reviewer-reexecution-implementation-001
decisionStatus=approve-ai-company-reviewer-reexecution-implementation-slice
targetAuthority=one explicit local-stub Reviewer re-execution from one exact source-current completed schema-v24 DEC-203 mutation, using the existing Reviewer WorkOrder and WorkOrderAttempt #2 and stopping before QA execution
targetSurface=src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/reviewer-reexecution.js, src/runtime/runtime-service.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/execution-labels.js, ui/task-summaries.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-reviewer-reexecution.mjs, scripts/smoke-ui-slice-709.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/139_ai-company-reviewer-reexecution-plan.md
runtimePath=require one exact schema-v24 ReworkPlan and acceptance BuilderReworkDispatch immutable DEC-200 Approval completed Builder WorkOrderAttempt #3 rework-live-mutation Run sanitized change-summary patch diff records and raw bytes mutation request digest post-mutation target digests current target bytes original Reviewer WorkOrderAttempt #1 Run review Artifact findings source progress and exact pending review Decision refs, accept only the exact path plus thirteen-key request and nested four-key reviewerRequest, recompute one canonical mutationEvidenceDigest and validate current CompanyBlueprint role sources fixed graph and local-stub mode before any write, atomically append the DEC-203 mutation Run Artifacts and changed files to current Builder and ExecutionPlan provenance without removing earlier refs, create and consume one source-bound REVIEWER_READY checkpoint, append Reviewer WorkOrderAttempt #2 active and one running Reviewer Run with executionMode=rework-reviewer before worker invocation, set the existing Reviewer WorkOrder active and resolve only the exact retained Reviewer Decision refs as rework-started while refusing unrelated blockers, invoke one dedicated local-stub Reviewer request over the exact mutation bundle prior findings immutable scope bounded target contents source-of-truth and Reviewer contract, and settle either pass with one review Artifact completed attempt #2 Reviewer completed QA queued one QA_READY checkpoint and separate-qa-execution-decision-required or changes-requested with terminal attempt #2 blocked plan QA blocked and no additional rework authority
compatibilityPlanRefs=keep schemaVersion 24 and every existing sequence and map shape, append no WorkOrder or durable sidecar record, preserve immutable DEC-188 through DEC-203 records and earlier Builder Reviewer Run Artifact Approval and Decision history, preserve generic Reviewer reviewed-delivery standalone task Council specialist commit and release behavior outside the exact route, keep the strict pre-Stage-5G BuilderReworkDispatch validation branch and add only one exact historical-source-to-current-graph branch bound by mutationEvidenceDigest reconciled Builder refs consumed Reviewer-ready checkpoint attempt #2 and Reviewer Run, keep attempt #2 terminal refs limited to its own Run Artifact and Decision evidence, return exact active or terminal replay without another save or worker, and stop before QA provider retry recovery source Git release memory scheduling policy bypass or connectors
migrationPlanRefs=no schema migration sequence map new WorkOrder or new durable domain record is authorized; reuse schema-v24 WorkOrderAttempt Run Artifact WorkflowCheckpoint Decision Inbox ExecutionPlan and WorkOrder contracts through one action-specific Reviewer re-execution branch
sourceEvidenceRefs=DEC-188, DEC-191, DEC-194, DEC-197, DEC-200, DEC-201, DEC-203, DEC-204, DEC-205, docs/113_ai-company-multi-agent-completion-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, docs/131_ai-company-rework-plan-acceptance-plan.md, docs/133_ai-company-builder-rework-preflight-plan.md, docs/135_ai-company-builder-rework-mutation-approval-plan.md, docs/137_ai-company-builder-rework-source-mutation-plan.md, docs/139_ai-company-reviewer-reexecution-plan.md, src/runtime/contracts.js, src/runtime/work-order-attempts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current beginOperatorSteppedWorkOrderStep treats the first run-reviewer action as the only replayable Reviewer attempt, current completeReviewedDeliveryReviewer anchors only to the original Builder completion Run, current runReviewer resolves only the original Builder live-mutation bundle, current BuilderReworkDispatch validation assumes the ExecutionPlan and Reviewer remain permanently at the first changes-requested stop, and no dedicated mutationEvidenceDigest Reviewer attempt #2 start settlement exact route UI focused runtime smoke or UI smoke exists
rollbackRefs=disable the exact Reviewer re-execution POST GET UI runtime and coordinator entrypoints and stop new starts, preserve every valid schema-v24 historical source and active or terminal Reviewer attempt #2 record, do not delete renumber or rewrite prior Builder Reviewer Approval Decision Run Artifact or checkpoint evidence, leave QA unexecuted, and require a separately approved recovery decision for any interrupted active attempt before retry cleanup or replacement
focusedSmokeRefs=scripts/smoke-ai-company-reviewer-reexecution.mjs proving exact request and nested request normalization canonical mutation evidence record and raw-byte binding current post-mutation target digests original Reviewer lineage unrelated blocker refusal schema-v24 preservation no new WorkOrder exact Reviewer attempt #2 numbering atomic graph reconciliation consumed source-bound Reviewer-ready checkpoint active attempt and Run before one local-stub call prior Decision resolution old evidence retention attempt-specific terminal refs pass-to-QA-ready stop changes-requested terminal stop pass-with-decision malformed and widened output refusal failure interruption exact no-write replay divergent 409 file-store reload and DEC-197 DEC-200 DEC-203 generic Reviewer compatibility with zero QA provider source Git release memory policy bypass or connector authority; scripts/smoke-ui-slice-709.mjs proving exact source-current visibility acknowledgement rationale retained findings changed files mutation evidence safe running passed changes-requested failed and interrupted rendering stale clearing absent QA and downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=QA execution third Reviewer or Builder attempt second rework automatic retry recovery resume cancellation quarantine or replacement provider-backed WorkOrder execution source mutation expansion result or memory application runtime-agent commit push or release next-Mission scheduling or background autonomy profile or policy mutation approval bypass and external connectors
approvalStatement=I approve implementation only for one exact local-stub Reviewer re-execution described in docs/139_ai-company-reviewer-reexecution-plan.md. This permits one existing-Reviewer WorkOrderAttempt #2 and a stop at QA_READY on pass. It does not approve QA execution, another attempt or rework, retry, recovery, provider-backed execution, source mutation expansion, Git or release, memory, scheduling, policy mutation, bypass, or connectors.
```

## Valid Non-Approval Outcomes

`request-more-evidence`, `reject-implementation`, and `defer-implementation`
must supply all fifteen fields, name this exact Stage 5G boundary, preserve
schema v24, authorize no Reviewer or QA execution, and keep DEC-203 evidence
inert.

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, or `go ahead`
- a decision missing, renaming, or widening any required field
- reusing generic `runReviewer` without the DEC-203 mutation evidence and
  attempt #2 contract
- treating the old Builder live-mutation bundle as the reworked source
- combining Reviewer and QA in one request
- changing schema, adding a WorkOrder, or opening a third attempt
- permitting provider execution, retry, recovery, source mutation expansion,
  Git/release, memory, scheduling, policy mutation, bypass, or connectors

## Acceptance Rule

Implementation may begin only after one complete matching decision is accepted
as `DEC-206`. Until then, Stage 5G remains planning and handoff evidence only.
