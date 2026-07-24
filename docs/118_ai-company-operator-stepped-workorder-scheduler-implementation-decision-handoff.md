# AI Company Operator-Stepped WorkOrder Scheduler Implementation Decision Handoff

## Accepted Implementation Outcome

The operator supplied the complete approval below, and `DEC-172` accepts this bounded implementation.
Schema v19, durable `WorkOrderAttempt` evidence, exact bound source recomputation, one-role-per-command
start and step routes, exact inspection, UI controls, and focused runtime/API/UI verification are now
implemented. This outcome does not widen the original blocked-authority list: active-attempt
recovery, retry/rework, parallel or provider scheduling, background execution, source mutation,
runtime-agent Git/release, memory application, policy bypass, lifecycle search/delete, and
connectors remain blocked.

## Purpose

이 문서는 `docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md`를 one
architecture-sensitive implementation decision으로 전달한다. 대상은 one exact approved
schema-v18 StaffingEntry-bound local Council synthesis, existing Builder/Reviewer/QA graph, one
future schema-v19 WorkOrderAttempt lifecycle, and explicit operator `start`/`step` commands다.

이 문서 자체는 implementation authority가 아니다. Generic continuation, broad approval,
non-critical self-approval delegation, or planning-only `DEC-170` cannot authorize schema migration,
durable attempt creation, bound WorkOrder persistence, role dispatch, or API/UI mutation.

## Current Gate

- Durable StaffingPlan and Council-first StaffingEntry are implemented through `DEC-169`.
- Stage 3 planning-only authority is recorded as `DEC-170`.
- This complete fielded implementation handoff is recorded as `DEC-171`.
- The bounded implementation is accepted as `DEC-172`.
- Current runtime is schema v19 with exact bound preview, persistence, start/step, and attempt inspection.
- Retry/rework/recovery, parallel/provider/background scheduling, and every other listed downstream
  authority remain blocked.
- Implementation remains blocked until one complete valid operator decision below is supplied.

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
decisionId=operator-decision-ai-company-operator-stepped-workorder-scheduler-implementation-001
decisionStatus=approve-ai-company-operator-stepped-workorder-scheduler-implementation-slice
targetAuthority=one deterministic local schema-v19 operator-stepped WorkOrder scheduler from one exact source-current approved schema-v18 StaffingEntry-bound Council synthesis through one existing Builder Reviewer QA graph with one durable WorkOrderAttempt per explicit start or step command
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs, scripts/smoke-ui-slice-698.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs, README.md, docs/01_decision-log.md, docs/22_completion-gate-inventory.md, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/115_ai-company-staffing-entry-binding-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, docs/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff.md, tasks/todo.md, tasks/lessons.md, scripts/smoke-ai-company-master-plan.mjs, scripts/smoke-ai-company-multi-agent-completion-planning.mjs, scripts/smoke-ai-company-staffing-entry-binding-planning.mjs, scripts/smoke-ai-company-operator-stepped-workorder-scheduler-planning.mjs, scripts/smoke-readme-scope-evidence.mjs, scripts/smoke-completion-gate-inventory-current-evidence.mjs, and schema-sensitive fixtures only where current schema 18 becomes 19 or future schema 19 becomes 20 without weakening historical compatibility evidence
implementationPlanRefs=docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md
runtimePath=require one exact current accepted council-mode StaffingPlan immutable bound StaffingEntry terminal approved real-local-stub CouncilSession aligned unlinked Mission fresh CompanyBlueprint plus nine role sources exact compileSpec and existing digest-bound execution-plan approval, allow the existing response-only preview and durable Builder Reviewer QA graph only after that complete bound source gate, atomically migrate schema v18 to v19 with workOrderAttempt sequence and map, select one dependency-ready WorkOrder deterministically by position then id, require exact expectedWorkOrderId action source and checkpoint tuple, save one active attempt before coordinator execution, execute exactly one local role boundary per explicit start or step, transition the same attempt once to waiting-gate completed changes-requested or failed with exact evidence refs, keep Builder live-mutation approval and verification proof gates, and stop after Builder preflight Builder completion Reviewer or QA without invoking the next role
compatibilityPlanRefs=preserve accepted StaffingPlan and StaffingEntry immutability, bound Council alignment-only evidence, historical unbound Council and DEC-091 sequential start, DEC-094 reviewed delivery, DEC-097 checkpoint recovery, standalone task proof package close-out learning memory Growth source-mutation commit and release behavior outside the bound branch, preserve provider Council inspection without enabling provider WorkOrders, create no attempt during migration boot read render preview or invalid input, keep one active attempt per plan and serialize overlapping Builder targets per project, and expose no run-all retry rework parallel background autonomous provider Git release memory policy bypass or connector control
migrationPlanRefs=add schemaVersion 19 sequences.workOrderAttempt and workOrderAttempts map only, preserve every valid schema-v18 domain value without rewriting existing records, create no attempt during migration boot read render preview or inspection, reject schema v20 plus partial key-mismatched digest-invalid foreign-source duplicate-active or semantically invalid v19 state without changing bytes, save migration plus first active attempt atomically before the first coordinator call, retain valid v19 evidence during rollback without downgrade deletion or terminal-record rewrite, and leave an interrupted active attempt inspectable and scheduling-blocking pending a separate Ops recovery decision
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-097, DEC-130, DEC-131, DEC-132, DEC-133, DEC-134, DEC-135, DEC-136, DEC-163, DEC-166, DEC-169, DEC-170, DEC-171, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/60_ai-company-workorder-persistence-execution-plan.md, docs/62_ai-company-reviewed-delivery-planning-plan.md, docs/64_ai-company-checkpoint-resume-recovery-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/115_ai-company-staffing-entry-binding-plan.md, docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md, company/blueprint.json, company/roles/builder.md, company/roles/reviewer.md, company/roles/qa.md, company/roles/ops.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current schema v18 has no sequences.workOrderAttempt workOrderAttempts contract lifecycle digest exact inspection or focused smoke, getMissionWorkOrderCompilerInput and persistMissionWorkOrderPlan reject every staffingEntryRef, beginSequentialWorkOrderExecution requires one queued Builder instead of a generic selector, the reviewed-delivery API can execute Builder Reviewer and QA in one request, no bound step route or UI command exists, no active attempt crash marker or overlapping mutable-target guard exists, and Stage 6 recovery retry rework parallel provider background and autonomous authorities remain absent
rollbackRefs=disable bound WorkOrder preview persistence start and step entrypoints and UI controls, stop creating or transitioning new attempts, preserve valid schema-v19 WorkOrderAttempt plans WorkOrders checkpoints StaffingEntries CouncilSessions Missions and every source record without downgrade delete rewrite or implicit retry, render non-terminal attempts as inspect-only blocked evidence, preserve schema-v18 exact inspection and historical unbound WorkOrder behavior, and rerun migration focused runtime API UI README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs proving atomic v18-to-v19 migration exact bound source recomputation response-only preview separate plan approval deterministic dependency-ready selection one active attempt saved before execution one role per command targeted Builder live-mutation gate proof gate checkpoint boundaries exact replay divergent stale malformed overlap active-interruption failure changes-requested and QA-failed behavior exact GET reload rollback no background retry rework parallel provider source Git release memory policy bypass or connector authority plus DEC-091 DEC-094 DEC-097 historical compatibility; scripts/smoke-ui-slice-698.mjs proving exact-gated preview persistence approval start and one-role step states read-only attempt evidence safe stale and active-interruption failures hidden run-all retry rework parallel provider and downstream controls historical behavior and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=solo StaffingEntry or solo role execution, dynamic staffing, parallel Researcher or specialist execution, retry failed attempt, automatic Reviewer rework, active-attempt reconciliation or Ops recovery commands, general background timer recursive autonomous or cross-project scheduling, provider-backed WorkOrders or provider expansion, durable scheduler history beyond exact WorkOrderAttempts, Mission memory context application, source mutation expansion, runtime-agent commit push or release, profile or policy mutation, approval bypass, list search update delete lifecycle, external connectors
approvalStatement=I approve implementation only for one exact schema-v19 local operator-stepped WorkOrder scheduler described in docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md. This permits one bound Builder Reviewer QA plan, existing separate plan and Builder mutation approvals, deterministic dependency-ready selection, one durable WorkOrderAttempt per explicit start or step, and one local role boundary per command. It does not approve solo execution, parallel specialists, retry, rework, recovery, provider WorkOrders, background or autonomous scheduling, memory application, source mutation, runtime-agent Git or release, policy mutation, approval bypass, lifecycle search or deletion, or connectors.
```

## Other Valid Outcomes

Evidence request:

```text
decisionId=operator-decision-ai-company-operator-stepped-workorder-scheduler-implementation-001
decisionStatus=request-more-evidence
targetAuthority=the same bounded schema-v19 operator-stepped WorkOrder scheduler slice
requestedEvidence=one or more exact missing schema source-current transaction attempt lifecycle selector compatibility rollback focused-smoke or authority-boundary refs
approvalStatement=I request the named evidence before operator-stepped WorkOrder scheduler implementation can open.
```

Rejection:

```text
decisionId=operator-decision-ai-company-operator-stepped-workorder-scheduler-implementation-001
decisionStatus=reject-ai-company-operator-stepped-workorder-scheduler-implementation
targetAuthority=the same bounded schema-v19 operator-stepped WorkOrder scheduler slice
approvalStatement=I reject operator-stepped WorkOrder scheduler implementation. Schema-v18 StaffingEntry inspection and alignment-only Council behavior remain authoritative.
```

Deferral:

```text
decisionId=operator-decision-ai-company-operator-stepped-workorder-scheduler-implementation-001
decisionStatus=defer-ai-company-operator-stepped-workorder-scheduler-implementation
targetAuthority=the same bounded schema-v19 operator-stepped WorkOrder scheduler slice
approvalStatement=I defer operator-stepped WorkOrder scheduler implementation. No schema attempt WorkOrder scheduler provider source Git release policy bypass or connector authority opens.
```

## Invalid Shortcuts

- `approval`, `approved`, `승인`, `전체 승인`, `계획대로 진행`, `continue`, or `do everything`
- delegated self-approval for schema migration, durable attempt creation, or role dispatch
- planning-only `DEC-170` or handoff-only `DEC-171` copied as implementation authority
- approval that omits exact bound source recomputation, active-before-execution persistence,
  deterministic selection, one-role stop, failure handling, rollback, focused smoke, or
  still-blocked authorities
- approval that replaces the targeted Builder mutation approval or VerificationProof gate
- approval that bundles solo, parallel, retry/rework, recovery, provider WorkOrders, background
  scheduling, memory application, source mutation, Git/release, policy bypass, lifecycle deletion,
  or connectors

## Acceptance Criteria

1. The decision uses every required field and exact bounded target surface.
2. StaffingPlan, StaffingEntry, CouncilSession, Mission, CompanyBlueprint, nine role sources, plan
   approval, compileSpec, source digest, and checkpoint tuple are recomputed before output.
3. Migration adds only the WorkOrderAttempt sequence and map.
4. One active attempt is saved before each coordinator command.
5. Dependency-ready selection is deterministic and the operator supplies the exact expected id.
6. One start or step command invokes at most one role boundary.
7. Builder mutation and verification gates remain mandatory.
8. Failure, changes-requested, QA failure, active interruption, stale input, and divergent replay do
   not schedule another role.
9. Rollback preserves valid schema-v19 evidence without downgrade or deletion.
10. Focused runtime/API/UI smokes and aggregate verification pass.
11. Every authority outside the named local sequential slice remains blocked.

## Completion Rule

The completion rule was satisfied by the exact fielded decision recorded as `DEC-172`:

- runtime is schema v19;
- WorkOrderAttempt exists only for the approved bound local step path;
- bound WorkOrder preview, persistence, start, step, and exact inspection are implemented;
- every authority outside the named local sequential slice remains blocked.
