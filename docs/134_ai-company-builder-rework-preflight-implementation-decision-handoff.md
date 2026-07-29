# AI Company Builder Rework Preflight Implementation Decision Handoff

## Purpose

This document is the complete fielded implementation decision shape for
`docs/133_ai-company-builder-rework-preflight-plan.md`. `DEC-195` accepts planning and `DEC-196`
records this handoff. Schema-v24 dispatch and worker implementation remains blocked until one
complete valid operator outcome is accepted as `DEC-197`.

Generic approval, broad continuation, delegated self-approval, `DEC-194` acceptance evidence, and
this handoff are invalid implementation shortcuts. Attempt append, worker execution, Approval
creation, source mutation, retry, recovery, Reviewer/QA execution, scheduling, provider expansion,
memory, Git/release, policy, collection, bypass, and connector behavior remain closed.

## Current Gate

- Planning-only decision: accepted as `DEC-195`
- Implementation handoff: recorded as `DEC-196`
- Complete fielded implementation decision: not supplied
- Current runtime: schema v23 with immutable ReworkPlan and append-only ReworkPlanAcceptance evidence
- Implementation authority: blocked
- Reserved implementation decision: `DEC-197`

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
decisionId=operator-decision-ai-company-builder-rework-preflight-implementation-001
decisionStatus=approve-ai-company-builder-rework-preflight-implementation-slice
targetAuthority=one deterministic local schema-v24 BuilderReworkDispatch plus one existing-Builder WorkOrderAttempt preflight execution stopping before mutation approval
targetSurface=prompts/builder.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/builder-rework-dispatches.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-builder-rework-preflight.mjs, scripts/smoke-ui-slice-706.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/133_ai-company-builder-rework-preflight-plan.md
runtimePath=require one exact source-current schema-v23 ReworkPlan and its exact DEC-194 ReworkPlanAcceptance plus the original completed Builder WorkOrder two terminal Builder WorkOrderAttempts and complete Reviewer changes-requested lineage, recompute DEC-188 and compare all retained findings scope evidence progress and cap fields before first write, require the exact path-plus-twelve-key operator dispatch request reworkAttemptNumber=2 workOrderAttemptNumber=3 and bounded dispatchApproval, atomically migrate valid state and append one immutable BuilderReworkDispatch plus one active existing-Builder WorkOrderAttempt action=start-builder-rework-preflight, invoke one dedicated local-stub no-write rework-preflight request without rerunning planner architect or task-breaker, transition the attempt to waiting-gate or failed with exact Run and Artifact evidence and fixed empty decisionInboxItemRefs, preserve the blocked ExecutionPlan completed Builder changes-requested Reviewer blocked QA and activeWorkOrderId null while deriving only the sidecar worker state through exact dispatch inspection, exclude the map from generic snapshot, and stop before Approval or Decision Inbox creation or mutation WorkflowCheckpoint source mutation Reviewer QA retry recovery scheduling provider-backed execution memory Git release policy collection bypass or connectors
compatibilityPlanRefs=preserve the exact three-WorkOrder graph, every existing ExecutionPlan WorkOrder WorkOrderAttempt checkpoint Approval Decision Inbox Mission task Run Artifact and digest, preserve DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-185 DEC-188 DEC-191 and DEC-194 behavior, keep existing start-builder continue-builder run-reviewer run-qa preflight and live-mutation routes unchanged, and keep standalone task Council delivery learning memory Growth commit and release paths unchanged
migrationPlanRefs=add schemaVersion 24 plus only sequences.builderReworkDispatch builderReworkDispatches and WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT, preserve every valid schema-v23 value and historical WorkOrderAttempt shape and digest, create no dispatch attempt Run or Artifact during boot read migration validation GET hydration render or invalid input, validate the complete request source lineage prospective dispatch prospective active attempt and candidate state before one atomic migration-plus-two-record save, reject future partial or semantically invalid v24 state, and retain valid v24 evidence during rollback without downgrade deletion or rewrite
sourceEvidenceRefs=DEC-088, DEC-091, DEC-094, DEC-097, DEC-163, DEC-169, DEC-172, DEC-179, DEC-182, DEC-185, DEC-186, DEC-187, DEC-188, DEC-189, DEC-190, DEC-191, DEC-192, DEC-193, DEC-194, DEC-195, DEC-196, docs/113_ai-company-multi-agent-completion-plan.md, docs/127_ai-company-reviewer-rework-preview-plan.md, docs/129_ai-company-durable-reviewer-rework-plan.md, docs/131_ai-company-rework-plan-acceptance-plan.md, docs/133_ai-company-builder-rework-preflight-plan.md, src/runtime/contracts.js, src/runtime/reviewer-rework-preview.js, src/runtime/rework-plans.js, src/runtime/rework-plan-acceptances.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, src/runtime/file-store.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current state is schema v23 with immutable accepted rework evidence only and no builderReworkDispatch sequence map contract record digest exact dispatch approval additive rework action acceptance-to-attempt lineage bounded local-stub coordinator entrypoint exact dispatch GET snapshot exclusion durable UI action focused runtime smoke or UI smoke, and no rework preflight execution authority exists
rollbackRefs=disable dispatch POST UI command and bounded worker entrypoint, stop new dispatch creation and worker invocation, preserve every valid schema-v24 dispatch attempt Run Artifact and source record without downgrade deletion rewrite implicit retry or resume, leave active attempts for separately authorized quarantine or recovery, keep exact dispatch GET DEC-188 preview DEC-191 ReworkPlan and DEC-194 acceptance inspection available, and rerun migration focused UI compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-builder-rework-preflight.mjs proving valid-command-only atomic v23-to-v24 migration exact DEC-194 and recomputed DEC-188 lineage logical rework round two versus WorkOrderAttempt three one dispatch per acceptance sequential numbering active and overlapping rejection active-before-worker persistence interruption no-replay one local-stub preflight with no planner architect task-breaker rerun exact inherited findings paths and commands widening refusal waiting-gate success failed terminal failure no retry fixed empty decisionInboxItemRefs no Approval or Decision Inbox creation or mutation no WorkflowCheckpoint ExecutionPlan WorkOrder source Reviewer or QA mutation exact sidecar worker-state projection with unchanged blocked graph exact replay without save or worker divergent collision exact GET snapshot exclusion malformed missing extra oversized unknown stale future credential partial-v24 future-schema sequence-collision reload rollback source-byte and Git invariance plus DEC-091 DEC-094 DEC-097 DEC-169 DEC-172 DEC-185 DEC-188 DEC-191 and DEC-194 compatibility; scripts/smoke-ui-slice-706.mjs proving exact-gated command cap warning read-only dispatch attempt Run Artifact rendering stale-result clearing safe failure copy absent downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=new replacement or fourth WorkOrder append, live mutation Approval creation or resolution, Builder source mutation, Reviewer or QA execution, second rework, retry recovery resume replay execution checkpoint creation, automatic parallel dynamic autonomous or background scheduling, provider-backed WorkOrders, result or memory application, runtime-agent commit push or release, profile or policy mutation, approval bypass, collection list history search ranking recommendation automatic selection, and external connectors
approvalStatement=I approve implementation only for one exact local schema-v24 Builder rework preflight dispatch and existing-Builder WorkOrderAttempt append described in docs/133_ai-company-builder-rework-preflight-plan.md. This permits one local-stub no-write preflight and exact inspection only. It does not approve mutation Approval creation or resolution, source mutation, Reviewer or QA execution, a second rework, retry, recovery, scheduling, provider-backed execution, memory, Git, release, policy mutation, collections, approval bypass, or connectors.
```

## Valid Evidence-Request Outcome

```text
decisionId=operator-decision-ai-company-builder-rework-preflight-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the exact schema-v24 Builder rework preflight implementation gate
targetSurface=docs/133_ai-company-builder-rework-preflight-plan.md plus current schema-v23 ReworkPlanAcceptance and focused planning evidence
implementationPlanRefs=docs/133_ai-company-builder-rework-preflight-plan.md
runtimePath=none until the requested evidence is supplied
compatibilityPlanRefs=preserve schema v23 and DEC-188 DEC-191 DEC-194 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=list the accepted current evidence
negativeEvidenceRefs=list each missing proof
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=list the exact evidence commands requested
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I request the named evidence before Builder rework preflight implementation can open.
```

## Valid Rejection Outcome

```text
decisionId=operator-decision-ai-company-builder-rework-preflight-implementation-001
decisionStatus=reject-implementation
targetAuthority=the proposed schema-v24 Builder rework preflight implementation
targetSurface=docs/133_ai-company-builder-rework-preflight-plan.md and this handoff
implementationPlanRefs=docs/133_ai-company-builder-rework-preflight-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v23 and DEC-188 DEC-191 DEC-194 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-191, DEC-194, DEC-195, DEC-196
negativeEvidenceRefs=the operator rejects the proposed dispatch and preflight boundary
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-builder-rework-preflight-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I reject Builder rework preflight implementation. Schema v23 and DEC-194 acceptance evidence remain authoritative.
```

## Valid Deferral Outcome

```text
decisionId=operator-decision-ai-company-builder-rework-preflight-implementation-001
decisionStatus=defer-implementation
targetAuthority=the proposed schema-v24 Builder rework preflight implementation
targetSurface=docs/133_ai-company-builder-rework-preflight-plan.md and this handoff
implementationPlanRefs=docs/133_ai-company-builder-rework-preflight-plan.md
runtimePath=none
compatibilityPlanRefs=preserve schema v23 and DEC-188 DEC-191 DEC-194 behavior
migrationPlanRefs=no migration is authorized
sourceEvidenceRefs=DEC-188, DEC-191, DEC-194, DEC-195, DEC-196
negativeEvidenceRefs=implementation is intentionally deferred
rollbackRefs=not applicable because implementation remains blocked
focusedSmokeRefs=scripts/smoke-ai-company-builder-rework-preflight-planning.mjs
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=all implementation and downstream authorities remain blocked
approvalStatement=I defer Builder rework preflight implementation. No schema, dispatch, attempt, worker, API, UI, or downstream authority opens.
```

## Invalid Shortcuts

None of these authorize implementation:

- `approval`
- `approve all`
- `continue`
- `go ahead`
- delegated self-approval
- planning-only `DEC-195`
- handoff-only `DEC-196`
- acceptance-only implementation `DEC-194`
- a decision missing any required field
- a decision that opens mutation Approval, source mutation, Reviewer/QA execution, retry, recovery,
  scheduling, provider-backed execution, or another WorkOrder

## Acceptance Rule

Implementation may begin only when one outcome supplies every required field and matches the bounded
contract in `docs/133_ai-company-builder-rework-preflight-plan.md`. Any contradiction between fields
fails closed. The exact approval outcome, if supplied, is recorded as `DEC-197`.
