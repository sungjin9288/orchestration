# AI Company Builder Rework Mutation Approval Implementation Decision Handoff

## Purpose

This is the complete fielded decision shape for the Stage 5E plan in
`docs/135_ai-company-builder-rework-mutation-approval-plan.md`. `DEC-198`
accepts planning, `DEC-199` records this handoff, and only a complete matching
operator decision may be recorded as `DEC-200`.

This handoff authorizes neither source mutation nor a new implementation. Broad
approval, continuation, delegated self-approval, `DEC-197` waiting-gate
evidence, and this document are invalid implementation shortcuts.

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
decisionId=operator-decision-ai-company-builder-rework-mutation-approval-implementation-001
decisionStatus=approve-ai-company-builder-rework-mutation-approval-implementation-slice
targetAuthority=one exact task-owned Builder rework mutation Approval and Decision Inbox record from one source-current schema-v24 DEC-197 waiting-gate dispatch, stopping before Builder source mutation
targetSurface=src/runtime/contracts.js, src/runtime/assertions.js, src/runtime/file-store.js, src/runtime/task-gates.js, src/runtime/builder-rework-mutation-approvals.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/execution-labels.js, ui/task-summaries.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-builder-rework-mutation-approval.mjs, scripts/smoke-ui-slice-707.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/135_ai-company-builder-rework-mutation-approval-plan.md
runtimePath=require dedicated exact source-bound creation and resolution wrappers rather than generic createApprovalPlaceholder plus generic resolver, revalidate one source-current schema-v24 BuilderReworkDispatch waiting-gate attempt #3 complete local-stub rework-preflight Run Artifact and content DEC-188 DEC-191 DEC-194 provider and conditional Reviewer Decision lineage for generation and both outcomes, compute preflightRunRecordDigest from the exact id taskId kind role status metadata summary startedAt finishedAt logPath projection and preflightArtifactRecordDigest from the exact id taskId runId type path createdAt projection through recursive key-sorted UTF-8 JSON lowercase SHA-256 plus preflightArtifactContentDigest from exact raw file bytes without adding fields to Run or Artifact, accept only the exact path plus twelve-key request and nested four-key approvalRequest, derive strict immutable binding metadata and bindingDigest, reject any generic builder-live-mutation Approval bound to the same dispatch attempt Run or Artifact while preserving earlier-attempt history, atomically append only one existing task-owned Approval and Decision Inbox item with preflight Approval and inbox sequence collision checks allowedNextAction=builder-rework-live-mutation and scope=builder-rework, permit no-write creation replay but enforce one-way pending-to-approved-or-rejected resolution with terminal replay and status reversal 409, then stop before coordinator worker provider Run Artifact checkpoint graph dispatch attempt or Builder source mutation
compatibilityPlanRefs=keep schemaVersion 24, preserve the immutable dispatch and WorkOrderAttempt #3 including empty approvalRefs and decisionInboxItemRefs, preserve every referenced Reviewer Decision and the task's existing blocked and waitingDecision values while Approval-owned waitingApproval toggles, preserve an empty source Decision ref list without creating one, reject the action from original Builder live-mutation scheduler Reviewer and QA paths, reject generic builder-live-mutation creation only when it targets the same DEC-197 dispatch attempt Run or Artifact, preserve historical generic Approvals for earlier Builder attempts, and preserve all other Builder live-mutation commit release Council task and Decision Inbox paths
migrationPlanRefs=no schema migration sequence map or durable domain record is authorized; strict file-store nested metadata and bindingDigest validation applies while reusing existing Approval and Decision Inbox persistence only
sourceEvidenceRefs=DEC-188, DEC-191, DEC-194, DEC-195, DEC-196, DEC-197, DEC-198, DEC-199, docs/113_ai-company-multi-agent-completion-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, docs/131_ai-company-rework-plan-acceptance-plan.md, docs/133_ai-company-builder-rework-preflight-plan.md, docs/135_ai-company-builder-rework-mutation-approval-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/task-gates.js, src/runtime/builder-rework-dispatches.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/execution-labels.js, ui/task-summaries.js, ui/app.js
negativeEvidenceRefs=no strict Builder rework Approval normalizer bindingDigest canonical preflight Run or Artifact record digest helper raw-byte Artifact content binding generic-versus-rework approval collision guard action label action-specific POST GET dedicated source-current creation and resolution wrappers one-way terminal transition sequence collision refusal focused runtime smoke UI smoke or mutation authority exists, and the current generic resolver can otherwise resolve without revalidating the full DEC-197 lineage
rollbackRefs=disable only the future Builder rework mutation Approval POST GET resolution and UI branch, preserve valid Approval and inbox evidence inert and inspectable, and do not downgrade delete resume retry or mutate source
focusedSmokeRefs=scripts/smoke-ai-company-builder-rework-mutation-approval.mjs proving exact waiting-gate source tuple strict request and nested approval normalization canonical exact Run and Artifact record projections raw-byte Artifact content digest immutable binding metadata and digest one Approval and inbox pair per dispatch preflight sequence collision refusal without overwrite same-source generic builder-live-mutation collision refusal with earlier-attempt compatibility no-write exact creation replay divergent 409 pending-to-approved-or-rejected only terminal replay and status reversal refusal source-current generation and resolution active failed stale provider and conditional Reviewer Decision refusal task blocked waitingDecision preservation waitingApproval transition empty Decision ref compatibility exact GET reload generic snapshot and original Builder scheduler Reviewer QA commit release compatibility no source graph dispatch attempt Run Artifact checkpoint worker or provider mutation; scripts/smoke-ui-slice-707.mjs proving exact-gated request action-specific approve reject evidence Reviewer blocking decision priority conditional empty decision compatibility Korean action label and raw action hiding stale clearing absent mutation retry resume downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Builder source mutation mutation coordinator execution WorkOrderAttempt append graph transition Reviewer QA execution second rework retry recovery resume checkpoint scheduling provider-backed execution result or memory application Git release policy mutation approval bypass and connectors
approvalStatement=I approve implementation only for one exact Builder rework mutation Approval and Decision Inbox evidence boundary described in docs/135_ai-company-builder-rework-mutation-approval-plan.md. This does not approve Builder source mutation or any downstream execution.
```

## Valid Non-Approval Outcomes

`request-more-evidence`, `reject-implementation`, and `defer-implementation`
must supply all fifteen fields, name this exact Stage 5E boundary, preserve
schema v24, authorize no migration or writes, retain the DEC-197 waiting-gate
as authoritative, and keep every implementation and downstream authority
blocked.

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, or `go ahead`
- a decision missing, renaming, or widening any required field
- generic `builder-live-mutation` reuse
- any decision that permits Builder source mutation, coordinator dispatch,
  Worker/Provider/Run/Artifact/WorkflowCheckpoint activity, graph transition,
  Reviewer/QA execution, scheduling, or release

## Acceptance Rule

Only one complete matching decision can consume this handoff as `DEC-200`.
The subsequent approved path must stop after approval evidence or its explicit
approval/rejection decision and before Builder source mutation.
